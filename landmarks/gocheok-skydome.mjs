// 고척스카이돔 (Gocheok Sky Dome, 2015) - 구로구
// Korea's first domed ballpark, beside the Anyangcheon stream. Egg-shaped plan (real ≈ 215 × 157 m,
// modelled at ≈ 0.65 so it fits the 80-unit collider) under a white steel space-frame dome whose crown
// sits behind home plate (south-west) and slopes down toward the outfield (north-east).
// Signature parts: 32 radial rib trusses, the clerestory "inner ring" carrying the translucent membrane
// cap, a steel edge beam, and the charcoal-clad stadium drum with long horizontal glass bands on a
// concrete podium with wide stairs, side ramps and ticket-gate canopies at the main (SW) entrance.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, prism, tree, subgroup, seededRandom } from "./_helpers.mjs";

// ── Plan geometry (local frame: +x = outfield / NE, -x = home plate / SW; rotated 45° on site) ──
const A_HOME = 68;    // semi-axis toward home plate
const A_OUT = 64;     // semi-axis toward the outfield
const B = 50;         // half width
const EGG = 0.08;     // taper: broader behind home plate, narrower at the outfield
const APEX_X = -14;   // crown offset toward home plate
const N = 96;         // angular segments (the 32 ribs sit on every third column)
const DRUM_RIBS = 64; // vertical ribs on the stadium drum
const Y_RIM = 19.5;   // roof edge height
const RISE = 33;      // shell rise above the rim
const BAND = 1.8;     // clerestory step at the inner ring
const S_RING = 0.56;  // inner ring position (0 = crown, 1 = rim)
const S_LANTERN = 0.07;
const CUT = 0.92;     // fraction of the ellipsoid used (closer to 1 = rounder shoulder)
const K0 = Math.sqrt(1 - CUT * CUT);

/** Point on the roof edge (egg outline) at parameter t, optionally scaled about the origin. */
function rimPoint(t, scale = 1) {
  const c = Math.cos(t);
  const s = Math.sin(t);
  const a = c < 0 ? A_HOME : A_OUT;
  return [a * c * scale, B * s * (1 - EGG * c) * scale];
}
const rimOutline = (scale = 1) => Array.from({ length: N }, (_, i) => rimPoint((i / N) * Math.PI * 2, scale));

/** Outward horizontal normal of the egg outline at t. */
function rimNormal(t) {
  const [x0, z0] = rimPoint(t - 0.01);
  const [x1, z1] = rimPoint(t + 0.01);
  const tx = x1 - x0;
  const tz = z1 - z0;
  const len = Math.hypot(tx, tz) || 1;
  return [tz / len, -tx / len];
}

/** Horizontal roof outline at level s: a scaled copy of the rim about the (offset) crown. */
function levelPoint(t, s) {
  const [x, z] = rimPoint(t);
  return [APEX_X + (x - APEX_X) * s, z * s];
}
const levelOutline = (s) => Array.from({ length: N }, (_, i) => levelPoint((i / N) * Math.PI * 2, s));

// Section profile: ellipsoid cap, 1 at the crown, 0 at the rim.
const profile = (s) => (Math.sqrt(1 - (s * CUT) ** 2) - K0) / (1 - K0);
const yShell = (s) => Y_RIM + RISE * profile(s);
const yCap = (s) => yShell(s) + BAND;

/** s values between s0 and s1 spaced evenly in ellipse angle (denser where the shell is steep). */
function sByAngle(s0, s1, count) {
  const p0 = Math.asin(s0 * CUT);
  const p1 = Math.asin(s1 * CUT);
  return Array.from({ length: count + 1 }, (_, j) => Math.sin(p0 + (p1 - p0) * (j / count)) / CUT);
}
const sLinear = (s0, s1, count) => Array.from({ length: count + 1 }, (_, j) => s0 + (s1 - s0) * (j / count));
const rings = (sList, yFn) => sList.map((s) => ({ s, y: yFn(s) }));

/** Closed surface strip through horizontal rings (ordered crown → rim, i.e. top → bottom); smooth normals. */
function surface(parent, ringList, mat) {
  const positions = [];
  const indices = [];
  ringList.forEach(({ s, y }) => {
    for (let i = 0; i < N; i += 1) {
      const [x, z] = levelPoint((i / N) * Math.PI * 2, s);
      positions.push(x, y, z);
    }
  });
  for (let j = 0; j < ringList.length - 1; j += 1) {
    for (let i = 0; i < N; i += 1) {
      const a = j * N + i;
      const b = j * N + ((i + 1) % N);
      indices.push(a, b, a + N, b, b + N, a + N);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, mat);
  parent.add(mesh);
  return mesh;
}

/** Vertical wall strip following the drum outline between t0 and t1 (glazed curtain-wall sections). */
function wallStrip(parent, { t0, t1, scale, y0, y1, mat, count = 12 }) {
  const positions = [];
  const indices = [];
  for (let i = 0; i <= count; i += 1) {
    const [x, z] = rimPoint(t0 + (t1 - t0) * (i / count), scale);
    positions.push(x, y1, z, x, y0, z);
  }
  for (let i = 0; i < count; i += 1) {
    const a = i * 2; // top, a + 1 bottom, a + 2 next top, a + 3 next bottom
    indices.push(a, a + 2, a + 1, a + 2, a + 3, a + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, mat);
  parent.add(mesh);
  return mesh;
}

/** Path of a roof rib along parameter t: points on the surface plus the surface normal (outward + up). */
function ribPath(t, sList, yFn) {
  const pts = sList.map((s) => {
    const [x, z] = levelPoint(t, s);
    return new THREE.Vector3(x, yFn(s), z);
  });
  return pts.map((p, j) => {
    const prev = pts[Math.max(0, j - 1)];
    const next = pts[Math.min(pts.length - 1, j + 1)];
    const d = next.clone().sub(prev);
    const len = Math.hypot(d.x, d.z) || 1e-6;
    const n = new THREE.Vector3((-d.y * d.x) / len, len, (-d.y * d.z) / len).normalize();
    return { p, n, d: d.normalize() };
  });
}

/** All ribs as ONE mesh: each path becomes a low trapezoid ridge (width w, height h) lying on the roof. */
function ridges(parent, paths, { w, h, mat }) {
  const positions = [];
  const indices = [];
  paths.forEach((path) => {
    const base = positions.length / 3;
    path.forEach(({ p, n, d }) => {
      const b = d.clone().cross(n).normalize(); // across the rib
      const section = [
        p.clone().addScaledVector(b, w).addScaledVector(n, -0.2),
        p.clone().addScaledVector(b, w * 0.45).addScaledVector(n, h),
        p.clone().addScaledVector(b, -w * 0.45).addScaledVector(n, h),
        p.clone().addScaledVector(b, -w).addScaledVector(n, -0.2),
      ];
      section.forEach((q) => positions.push(q.x, q.y, q.z));
    });
    for (let j = 0; j < path.length - 1; j += 1) {
      for (let k = 0; k < 3; k += 1) {
        const a = base + j * 4 + k;
        const c = a + 4; // same corner, next section
        indices.push(a, c, c + 1, a, c + 1, a + 1);
      }
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, mat);
  parent.add(mesh);
  return mesh;
}

export default {
  id: "gocheok-skydome",
  name: "고척스카이돔",
  nameEn: "Gocheok Sky Dome",
  district: "구로구",
  lat: 37.4982,
  lon: 126.8671,
  height: 55,
  colliderRadius: 79,
  detail: "high",
  description: "국내 첫 돔 야구장, 흰색 돔 지붕",
  create() {
    const g = new THREE.Group();
    // Long axis runs SW (home plate, local -x) → NE (outfield, local +x).
    const site = subgroup(g, { ry: Math.PI / 4 });

    const shellMat = material(0xf2f3f5, { roughness: 0.55 });
    const capMat = material(0xe3e7eb, { roughness: 0.45, metalness: 0.05 });
    const shoulderMat = material(0xc9ced4, { roughness: 0.4, metalness: 0.4 });
    const ribMat = material(0xbcc2c8, { roughness: 0.45, metalness: 0.3 });
    const cladding = material(0x454b52, { roughness: 0.7, metalness: 0.15 });
    const signMat = material(0x14202c, { roughness: 0.5 });

    // ── Plaza and concrete podium ──
    cyl(site, { rTop: 1, h: 0.5, y: 0, mat: M.granite, seg: N, sx: 79, sz: 60 });
    prism(site, { points: rimOutline(1.06), h: 2, y: 0.5, mat: M.concrete });

    // ── Stadium drum: concrete ground storey, charcoal cladding with two long glass bands,
    //    vertical ribs, big glazed daylight walls on both long sides, concourse lip ──
    prism(site, { points: rimOutline(0.975), h: 3.2, y: 2.5, mat: M.concreteDark });
    prism(site, { points: rimOutline(0.97), h: 12.8, y: 5.7, mat: cladding });
    [7.4, 12.6].forEach((y) => prism(site, { points: rimOutline(0.978), h: 2.4, y, mat: M.glassDark }));
    [Math.PI / 2, (3 * Math.PI) / 2].forEach((tc) => {
      wallStrip(site, { t0: tc - 0.5, t1: tc + 0.5, scale: 0.981, y0: 5.7, y1: 17.3, mat: M.glass, count: 14 });
    });
    prism(site, { points: rimOutline(0.985), h: 1.2, y: 17.3, mat: M.concreteDark });
    for (let i = 0; i < DRUM_RIBS; i += 1) {
      const t = (i / DRUM_RIBS) * Math.PI * 2;
      const [x, z] = rimPoint(t, 0.976);
      if (x < -60 && Math.abs(z) < 11) continue; // keep the sign wall clear
      const [nx, nz] = rimNormal(t);
      box(site, { w: 0.5, h: 11.6, d: 0.9, x: x + nx * 0.25, y: 5.7, z: z + nz * 0.25, mat: M.steelDark, ry: Math.atan2(nx, nz) });
    }
    // Glazed entrance strip and the big blank sign panel (with a light frame) at the home plate end.
    box(site, { w: 0.6, h: 3.2, d: 26, x: -66.4, y: 2.5, mat: M.glass });
    box(site, { w: 0.3, h: 7.8, d: 20.8, x: -66.3, y: 8.1, mat: M.white });
    box(site, { w: 0.5, h: 7, d: 20, x: -66.7, y: 8.5, mat: signMat });

    // ── Roof ──
    // steel edge beam (outer ring) overhanging the drum
    prism(site, { points: rimOutline(1.03), holes: [rimOutline(0.95)], h: 1.8, y: 18.5, mat: M.steel });
    // metallic shoulder at the edge, then the white panel shell up to the inner ring
    surface(site, rings(sByAngle(0.94, 1, 3), yShell), shoulderMat);
    surface(site, rings(sByAngle(S_RING, 0.94, 10), yShell), shellMat);
    // clerestory band on the inner ring truss + ring beam
    surface(site, [{ s: S_RING, y: yCap(S_RING) }, { s: S_RING, y: yShell(S_RING) }], M.glassDark);
    prism(site, { points: levelOutline(S_RING + 0.008), holes: [levelOutline(S_RING - 0.008)], h: 0.7, y: yCap(S_RING) - 0.25, mat: M.steel });
    // translucent membrane cap and the small lantern ring at the crown
    surface(site, rings(sLinear(S_LANTERN, S_RING, 6), yCap), capMat);
    prism(site, { points: levelOutline(S_LANTERN + 0.012), h: 1.2, y: yCap(S_LANTERN) - 0.4, mat: M.steel });
    // 32 rib trusses (outer ring → inner ring) and 16 membrane seams (inner ring → lantern)
    const ribS = sByAngle(S_RING, 1, 9);
    ridges(site, Array.from({ length: 32 }, (_, k) => ribPath((k / 32) * Math.PI * 2, ribS, yShell)), { w: 0.9, h: 0.55, mat: ribMat });
    const seamS = sLinear(S_LANTERN, S_RING, 5);
    ridges(site, Array.from({ length: 16 }, (_, k) => ribPath((k / 16) * Math.PI * 2 + Math.PI / 32, seamS, yCap)), { w: 0.6, h: 0.35, mat: ribMat });

    // ── Main entrance (home plate end, SW): wide stairs, ticket-gate canopies ──
    for (let k = 0; k < 5; k += 1) {
      box(site, { w: 1.6, h: 2 - 0.4 * k, d: 30, x: -69.8 - 1.6 * k, y: 0.5, mat: M.concrete });
    }
    [-23, 23].forEach((z) => {
      box(site, { w: 8.4, h: 0.3, d: 11.4, x: -69, y: 5.9, z, mat: M.steelDark });
      box(site, { w: 8, h: 0.5, d: 11, x: -69, y: 6.2, z, mat: M.white });
      [[-72.2, z - 4.5], [-72.2, z + 4.5], [-65.8, z - 4.5], [-65.8, z + 4.5]].forEach(([cx, cz]) => {
        cyl(site, { rTop: 0.28, h: 5.5, x: cx, y: 0.5, z: cz, mat: M.steelDark, seg: 8 });
      });
      box(site, { w: 5.5, h: 2.2, d: 1.1, x: -69.5, y: 0.5, z: z - 2.6, mat: M.aluminum });
      box(site, { w: 5.5, h: 2.2, d: 1.1, x: -69.5, y: 0.5, z: z + 2.6, mat: M.aluminum });
    });

    // ── Side ramps up to the podium ──
    [-1, 1].forEach((side) => {
      const z = side * 55.5;
      box(site, { w: 22, h: 0.5, d: 5, x: 8, y: 1.25, z, mat: M.concrete, rz: Math.atan2(2, 22) });
      box(site, { w: 5, h: 2, d: 5, x: 21.5, y: 0.5, z, mat: M.concrete });
      box(site, { w: 5, h: 2, d: 6, x: 21.5, y: 0.5, z: side * 51, mat: M.concrete });
      box(site, { w: 22.4, h: 1, d: 0.25, x: 8, y: 1.25, z: side * 58.1, mat: M.steelDark, rz: Math.atan2(2, 22) });
    });

    // ── Parking strip on the NW side with a few parked cars ──
    box(site, { w: 66, h: 0.3, d: 11, x: -4, y: 0.5, z: -63, mat: M.asphalt });
    for (let i = 0; i <= 11; i += 1) {
      const x = -36 + i * 6;
      box(site, { w: 0.25, h: 0.06, d: 4.8, x, y: 0.8, z: -60.6, mat: M.white });
      box(site, { w: 0.25, h: 0.06, d: 4.8, x, y: 0.8, z: -65.4, mat: M.white });
    }
    const rng = seededRandom(11);
    const carMats = [M.white, M.black, M.aluminum, M.red, M.navy];
    for (let i = 0; i < 9; i += 1) {
      const x = -33.5 + i * 6.5 + Math.floor(rng() * 2) * 3;
      const z = rng() < 0.5 ? -60.6 : -65.4;
      box(site, { w: 1.8, h: 1.45, d: 4.3, x, y: 0.8, z, mat: carMats[Math.floor(rng() * carMats.length)] });
    }

    // ── Trees: along the SE plaza edge, beyond the parking, and at the outfield end ──
    for (let i = 0; i < 9; i += 1) {
      tree(site, { x: -40 + i * 10, y: 0.5, z: 57, h: 8 + (i % 3), r: 3 });
    }
    for (let i = 0; i < 5; i += 1) {
      tree(site, { x: -22 + i * 11, y: 0, z: -72, h: 7 + (i % 2) * 2, r: 2.8 });
    }
    [[72, -10], [74, 0], [72, 10]].forEach(([x, z], i) => tree(site, { x, y: 0.5, z, h: 8 + i, r: 3 }));

    return g;
  },
};
