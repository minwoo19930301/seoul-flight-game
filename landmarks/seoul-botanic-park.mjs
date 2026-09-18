// 서울식물원 온실 (Seoul Botanic Park Greenhouse, 마곡 · THE_SYSTEM LAB + 삼우, 2018-19) - 강서구
// Signature: a 100 m concave "dish" greenhouse - ten white steel arches (flower petals) standing on an
// outward-leaning, triangulated glass wall, and a translucent ETFE roof that dips from the ~28 m rim
// down to a central rainwater core. Built at ~0.78 scale so the compressed park fits the 50 m collider:
// the low white visitor centre (식물문화센터) wraps the north side, 호수원 lake with a boardwalk lies to
// the west/south-west, the themed gardens with a pavilion to the east/south, and the tiny red-brick
// 마곡문화관 pump house (구 양천수리조합 배수펌프장) sits at the north-east edge.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, prism, disc, ring, gableRoof, hipRoof, sphere, tree, deg, trianglesToGeometry } from "./_helpers.mjs";

const BAYS = 10;            // ten main ribs / ten arches
const RIM = 39;             // rim radius at the piers (real ≈ 50 m)
const BASE_R = 35.5;        // radius at the foot of the glass wall (the wall leans outward)
const BASE_Y = 1.5;         // concrete plinth height
const Y_LOW = 20.5;         // rim height at the piers
const ARCH_H = 5.5;         // extra rise of each arch crown above the piers
const Y_CENTRE = 8.5;       // roof height at the central core
const CORE_R = 4.6;
const PIER_PHASE = deg(252); // piers at 252°, 288°, ... -> an arch crown faces north (visitor centre side)
const SEG = 160;            // angular resolution (16 steps per bay)

const TAU = Math.PI * 2;
const pt = (r, y, theta) => [Math.cos(theta) * r, y, Math.sin(theta) * r];
/** Position inside the current bay, 0 at a pier, 0.5 at the arch crown. */
const bayU = (theta) => {
  const w = TAU / BAYS;
  return ((((theta - PIER_PHASE) % w) + w) % w) / w;
};
/** Semi-elliptical arch factor 0..1 along the bay. */
const archS = (theta) => {
  const v = bayU(theta) * 2 - 1;
  return Math.sqrt(Math.max(0, 1 - v * v));
};
const rimY = (theta) => Y_LOW + ARCH_H * archS(theta);
const rimR = (theta) => RIM + 0.8 * archS(theta);
/** Height of the dish roof at radius r: flat at the core, steep near the rim; each bay bulges up
 *  towards its arch crown so the roof reads as ten petals from the air. */
const roofY = (r, theta) => {
  const t = Math.max(0, (r - CORE_R) / (rimR(theta) - CORE_R));
  return Y_CENTRE + (Y_LOW - Y_CENTRE) * Math.pow(t, 1.7) + (rimY(theta) - Y_LOW) * Math.pow(t, 1.35);
};
/** Point on the glass wall, v = 0 at the plinth, 1 at the scalloped rim; `out` pushes it off the glass. */
const wallPt = (v, theta, out = 0) => pt(BASE_R + (rimR(theta) - BASE_R) * v + out, BASE_Y + (rimY(theta) - BASE_Y) * v, theta);

/** Polylines rendered as one faceted tube mesh. Points are [x, y, z] or [x, y, z, radius]. */
function tubes(parent, polylines, { r = 0.3, mat = M.white, sides = 6 } = {}) {
  const tris = [];
  const up = new THREE.Vector3(0, 1, 0);
  const t = new THREE.Vector3();
  const n = new THREE.Vector3();
  const b = new THREE.Vector3();
  const prevN = new THREE.Vector3();
  polylines.forEach((pts) => {
    prevN.set(0, 0, 0);
    const rings = pts.map((p, i) => {
      const prev = pts[Math.max(0, i - 1)];
      const next = pts[Math.min(pts.length - 1, i + 1)];
      t.set(next[0] - prev[0], next[1] - prev[1], next[2] - prev[2]).normalize();
      n.crossVectors(t, up);
      if (n.lengthSq() < 1e-8) n.set(1, 0, 0);
      n.normalize();
      if (n.dot(prevN) < 0) n.negate(); // keep the frame from flipping along bends
      prevN.copy(n);
      b.crossVectors(t, n).normalize();
      const radius = p[3] ?? r;
      const ringPts = [];
      for (let k = 0; k < sides; k += 1) {
        const a = (k / sides) * TAU;
        const c = Math.cos(a) * radius;
        const s = Math.sin(a) * radius;
        ringPts.push([p[0] + n.x * c + b.x * s, p[1] + n.y * c + b.y * s, p[2] + n.z * c + b.z * s]);
      }
      return ringPts;
    });
    for (let i = 0; i < rings.length - 1; i += 1) {
      for (let k = 0; k < sides; k += 1) {
        const k2 = (k + 1) % sides;
        tris.push(rings[i][k], rings[i + 1][k2], rings[i + 1][k], rings[i][k], rings[i][k2], rings[i + 1][k2]);
      }
    }
  });
  const mesh = new THREE.Mesh(trianglesToGeometry(tris), mat);
  parent.add(mesh);
  return mesh;
}

/** Translucent ETFE dish roof with a scalloped (arched) edge. */
function roofSurface(parent) {
  const rows = 14;
  const tris = [];
  const P = (i, j) => {
    const theta = (j / SEG) * TAU;
    const r = CORE_R + (rimR(theta) - CORE_R) * Math.pow(i / rows, 0.85);
    return pt(r, roofY(r, theta), theta);
  };
  for (let i = 0; i < rows; i += 1) {
    for (let j = 0; j < SEG; j += 1) {
      const j2 = (j + 1) % SEG;
      const a = P(i, j);
      const bb = P(i + 1, j);
      const c = P(i + 1, j2);
      const d = P(i, j2);
      tris.push(a, d, bb, d, c, bb); // up-facing
    }
  }
  const mesh = new THREE.Mesh(trianglesToGeometry(tris), M.glassWhite);
  parent.add(mesh);
  return mesh;
}

/** Outward-leaning glass wall, rising to the scalloped rim under each arch. */
function wallSurface(parent) {
  const tris = [];
  for (const [v1, v2] of [[0, 1 / 3], [1 / 3, 2 / 3], [2 / 3, 1]]) {
    for (let j = 0; j < SEG; j += 1) {
      const ta = (j / SEG) * TAU;
      const tb = ((j + 1) / SEG) * TAU;
      const b1 = wallPt(v1, ta);
      const b2 = wallPt(v1, tb);
      const t1 = wallPt(v2, ta);
      const t2 = wallPt(v2, tb);
      tris.push(b1, t1, b2, t1, t2, b2); // outward-facing
    }
  }
  const mesh = new THREE.Mesh(trianglesToGeometry(tris), M.glass);
  parent.add(mesh);
  return mesh;
}

/** Annular-sector footprint for prism(): [x, z] points between radii r0..r1 and angles a0..a1. */
function sector(r0, r1, a0, a1, n = 18) {
  const pts = [];
  for (let i = 0; i <= n; i += 1) {
    const a = a0 + (a1 - a0) * (i / n);
    pts.push([Math.cos(a) * r1, Math.sin(a) * r1]);
  }
  for (let i = n; i >= 0; i -= 1) {
    const a = a0 + (a1 - a0) * (i / n);
    pts.push([Math.cos(a) * r0, Math.sin(a) * r0]);
  }
  return pts;
}

/** Box laid along the radial direction `phi` between radii r0..r1 (paths, decks). */
function radialBox(parent, { phi, r0, r1, d, h, y, mat }) {
  const rm = (r0 + r1) / 2;
  return box(parent, { w: r1 - r0, h, d, x: Math.cos(phi) * rm, z: Math.sin(phi) * rm, y, mat, ry: -phi });
}

export default {
  id: "seoul-botanic-park",
  name: "서울식물원",
  nameEn: "Seoul Botanic Park Greenhouse",
  district: "강서구",
  lat: 37.5697,
  lon: 126.834,
  height: 27,
  colliderRadius: 50,
  detail: "high",
  description: "오목한 접시형 유리 온실",
  create() {
    const g = new THREE.Group();

    // ── Park ground: lawn, granite plaza ring around the greenhouse, concrete plinth ─────────
    cyl(g, { rTop: 49.5, h: 0.5, mat: M.grass, seg: 72 });
    disc(g, { r: RIM + 2.6, rInner: BASE_R + 0.3, y: 0.56, mat: M.granite, seg: 96 });
    cyl(g, { rTop: BASE_R + 0.3, rBot: BASE_R + 0.7, h: BASE_Y, mat: M.concrete, seg: 96 });

    // ── Greenhouse envelope ────────────────────────────────────────────────────────────────
    roofSurface(g);
    wallSurface(g);

    // Central core where the ten ribs converge and the dish drains its rainwater.
    cyl(g, { rTop: CORE_R, h: Y_CENTRE + 0.7, mat: M.white, seg: 24 });
    ring(g, { r: CORE_R, tube: 0.4, y: Y_CENTRE + 0.7, mat: M.white, seg: 32, tubeSeg: 6 });
    disc(g, { r: CORE_R - 1.6, y: Y_CENTRE + 0.8, mat: M.steelDark, seg: 24 });

    // Ten main ribs: a bowed white pier outside the glass, then the curved roof member to the core.
    const ribs = [];
    for (let k = 0; k < BAYS; k += 1) {
      const theta = PIER_PHASE + (k / BAYS) * TAU;
      const line = [
        [...pt(BASE_R + 3.2, 0, theta), 0.95],
        [...pt(RIM + 1.5, 9.5, theta), 0.85],
        [...pt(RIM + 0.45, Y_LOW, theta), 0.7],
      ];
      for (let i = 1; i <= 11; i += 1) {
        const r = RIM - (RIM - CORE_R - 0.4) * (i / 11);
        line.push([...pt(r, roofY(r, theta) + 0.42, theta), 0.5]);
      }
      ribs.push(line);
    }
    tubes(g, ribs, { mat: M.white, sides: 8 });

    // Scalloped ring beam = the ten arches (the roof edge rises to a crown in every bay).
    const beam = [];
    for (let j = 0; j <= SEG; j += 1) {
      const theta = (j / SEG) * TAU;
      beam.push(pt(rimR(theta) + 0.2, rimY(theta) + 0.15, theta));
    }
    tubes(g, [beam], { r: 0.65, mat: M.white, sides: 8 });

    // Secondary radial members and three concentric hoops suggest the cell-like roof frame.
    const radials = [];
    for (let k = 0; k < BAYS; k += 1) {
      for (const u of [0.25, 0.5, 0.75]) {
        const theta = PIER_PHASE + ((k + u) / BAYS) * TAU;
        const line = [];
        for (let i = 0; i <= 9; i += 1) {
          const r = rimR(theta) - (rimR(theta) - CORE_R - 0.2) * (i / 9);
          line.push(pt(r, roofY(r, theta) + 0.22, theta));
        }
        radials.push(line);
      }
    }
    const hoops = [0.3, 0.55, 0.78].map((t) => {
      const line = [];
      for (let j = 0; j <= SEG; j += 1) {
        const theta = (j / SEG) * TAU;
        const r = CORE_R + (rimR(theta) - CORE_R) * t;
        line.push(pt(r, roofY(r, theta) + 0.22, theta));
      }
      return line;
    });
    tubes(g, [...radials, ...hoops], { r: 0.2, mat: M.white, sides: 4 });

    // Light steel triangulated curtain-wall frame (≈3,180 triangular panes in reality).
    const cols = 80;
    const rows = 3;
    const frame = [];
    for (let j = 0; j < cols; j += 1) {
      const ta = (j / cols) * TAU;
      const tb = ((j + 1) / cols) * TAU;
      for (let i = 0; i < rows; i += 1) {
        const v0 = i / rows;
        const v1 = (i + 1) / rows;
        frame.push([wallPt(v0, ta, 0.14), wallPt(v1, tb, 0.14)], [wallPt(v0, tb, 0.14), wallPt(v1, ta, 0.14)]);
      }
    }
    for (let i = 1; i < rows; i += 1) {
      const rail = [];
      for (let j = 0; j <= SEG; j += 1) {
        rail.push(wallPt(i / rows, (j / SEG) * TAU, 0.14));
      }
      frame.push(rail);
    }
    tubes(g, frame, { r: 0.13, mat: M.steel, sides: 4 });

    // ── Visitor centre (식물문화센터): low white 2-storey building wrapping the north side ────
    const vc0 = deg(240);
    const vc1 = deg(300);
    prism(g, { points: sector(36.6, 48, vc0, vc1), h: 9.3, y: 0.5, mat: M.white });
    [2.2, 6.0].forEach((y) => {
      prism(g, { points: sector(36.5, 48.15, vc0 - deg(0.4), vc1 + deg(0.4)), h: 1.7, y, mat: M.glassDark });
    });
    // green roof sits on a 0.7 m white ledge
    prism(g, { points: sector(37.3, 47.3, vc0 + deg(1), vc1 - deg(1)), h: 0.35, y: 9.6, mat: M.grassDark });
    box(g, { w: 12, h: 0.4, d: 1.5, y: 4.6, z: -48.6, mat: M.white }); // entrance canopy
    box(g, { w: 7, h: 4, d: 0.5, y: 0.5, z: -48.1, mat: M.glassDark }); // entrance glazing
    [-8, 0, 8].forEach((x) => box(g, { w: 3, h: 0.9, d: 1.6, x, y: 9.95, z: -42.5, mat: M.foliage })); // roof planters

    // ── 호수원 lake (compressed) with boardwalk and viewing deck, west / south-west ──────────
    const lake = [];
    const la0 = deg(128);
    const la1 = deg(214);
    const ln = 14;
    for (let i = 0; i <= ln; i += 1) {
      const a = la0 + (la1 - la0) * (i / ln);
      const r = 49.2 - 1.2 * Math.abs(Math.sin(i * 1.7));
      lake.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    for (let i = ln; i >= 0; i -= 1) {
      const a = la0 + (la1 - la0) * (i / ln);
      const c = (i / ln) * 2 - 1;
      const r = 38 + 4.5 * c * c + 0.8 * Math.abs(Math.sin(i * 2.3));
      lake.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    prism(g, { points: lake, h: 0.35, y: 0.3, mat: M.water });
    const wood = material(0xa8825a, { roughness: 0.9 });
    const walk = deg(176);
    radialBox(g, { phi: walk, r0: BASE_R + 1.2, r1: 47.6, d: 2.4, h: 0.3, y: 0.62, mat: wood });
    box(g, { w: 4.6, h: 0.3, d: 4.6, x: Math.cos(walk) * 45.6, z: Math.sin(walk) * 45.6, y: 0.62, mat: wood, ry: -walk });
    radialBox(g, { phi: deg(148), r0: 39.6, r1: 44.4, d: 1.8, h: 0.3, y: 0.62, mat: wood }); // short pier
    // shore rocks along the inner bank
    [[138, 41.8], [152, 39.8], [166, 38.9], [186, 39.0], [199, 40.2], [209, 42.6]].forEach(([a, r], i) => {
      const p = pt(r, 0, deg(a));
      sphere(g, { r: 0.7 + (i % 3) * 0.2, x: p[0], z: p[2], y: 0.4, mat: M.rockLight, seg: 6, sy: 0.55 });
    });

    // ── Paths (light stone) radiating from the plaza ring ────────────────────────────────────
    [2, 50, 92, 227, 342].forEach((a) => radialBox(g, { phi: deg(a), r0: RIM + 2.4, r1: 49.3, d: 3, h: 0.12, y: 0.5, mat: M.granite }));

    // ── Themed gardens (주제정원) east / south: coloured beds, hedges, a Korean pavilion, rocks ──
    [[36, 44, 2.6, M.purple], [42, 42, 1.7, M.yellow], [60, 44.8, 2.2, M.orange], [72, 41.8, 1.6, M.red],
      [84, 45.4, 2.5, M.grassDark], [99, 42.6, 1.9, M.foliage], [108, 46, 1.8, M.sand]].forEach(([a, r, br, mat]) => {
      const p = pt(r, 0, deg(a));
      cyl(g, { rTop: br, rBot: br + 0.2, h: 0.45, x: p[0], z: p[2], y: 0.5, mat, seg: 14 });
    });
    [30, 68, 100].forEach((a) => {
      const p = pt(46, 0, deg(a));
      box(g, { w: 6, h: 0.9, d: 0.9, x: p[0], z: p[2], y: 0.5, mat: M.grassDark, ry: -(deg(a) + Math.PI / 2) });
    });
    // Pavilion (정자) on a granite platform
    const pav = pt(44, 0, deg(12));
    box(g, { w: 5, h: 0.5, d: 5, x: pav[0], z: pav[2], y: 0.5, mat: M.granite });
    [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]].forEach(([dx, dz]) => {
      cyl(g, { rTop: 0.2, h: 2.6, x: pav[0] + dx, z: pav[2] + dz, y: 1, mat: M.hanokWood, seg: 8 });
    });
    hipRoof(g, { w: 4.2, d: 4.2, h: 1.6, x: pav[0], z: pav[2], y: 3.6, overhang: 1.1, mat: M.roofTile });
    [[6, 41.2], [18, 40.6], [22, 43.5], [4, 47.2]].forEach(([a, r], i) => {
      const p = pt(r, 0, deg(a));
      sphere(g, { r: 0.8 + (i % 2) * 0.3, x: p[0], z: p[2], y: 0.45, mat: M.rock, seg: 6, sy: 0.5 });
    });

    // ── 마곡문화관: 1928 red-brick pump house with a dark pitched roof, north-east edge ───────
    const ph = deg(322);
    const pump = pt(43, 0, ph);
    const phRy = -(ph + Math.PI / 2);
    box(g, { w: 8.5, h: 5.2, d: 5.5, x: pump[0], z: pump[2], y: 0.5, mat: M.brick, ry: phRy });
    box(g, { w: 8.7, h: 0.3, d: 5.7, x: pump[0], z: pump[2], y: 5.3, mat: M.limestone, ry: phRy });
    gableRoof(g, { w: 8.5, d: 5.5, h: 2, x: pump[0], z: pump[2], y: 5.7, overhang: 0.4, mat: M.roofTile, ry: phRy });

    // ── Trees: young park trees around the lawns (kept inside the 50 m collider) ─────────────
    [
      [219, 45.5, 8, 2.6], [222, 42.5, 7, 2.3], [233, 46, 9, 2.8], [237, 41.5, 6.5, 2.1],
      [304, 44.5, 8, 2.6], [310, 41.8, 7, 2.3], [313, 46.8, 6.5, 2.1], [332, 46.5, 7.5, 2.4], [336, 42, 8.5, 2.7],
      [349, 45.5, 7, 2.3], [354, 42.2, 9, 2.8], [358, 46.8, 6.5, 2.1],
      [22, 46.8, 9.5, 2.4], [28, 42.5, 7, 2.3], [42, 46.6, 8, 2.4], [56, 43, 6.5, 2.1], [66, 46.8, 7.5, 2.3],
      [78, 43.5, 8.5, 2.6], [102, 46.6, 7, 2.2], [112, 43, 9, 2.7], [120, 46.5, 7.5, 2.4], [126, 42.4, 6.5, 2.1],
    ].forEach(([a, r, h, fr]) => {
      const p = pt(r, 0, deg(a));
      tree(g, { x: p[0], z: p[2], y: 0.5, h, r: fr });
    });

    return g;
  },
};
