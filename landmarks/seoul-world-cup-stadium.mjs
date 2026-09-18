// 서울월드컵경기장 (Seoul World Cup Stadium, Sangam 2001, arch. 류춘수) - 마포구
// 66,000-seat rectangular football stadium: a two-tier bowl (gray seats, dark skybox band
// with a red LED ribbon) around the north-south pitch, the white PTFE "shield kite" (방패연)
// membrane roof with a rectangular opening over the pitch - 44 radial trusses, sagging fabric
// valleys between them, a glazed inner skylight band and roof corners that sweep upwards -
// and 16 tapered steel masts (4 per side, ~50 m) carrying stay cables to the roof.
// Footprint ≈ 0.55 of the real 304 m × 279 m (collider budget); heights are close to real.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, prism, strut, disc, tree, trianglesToGeometry } from "./_helpers.mjs";

const TAU = Math.PI * 2;
const TRUSSES = 44; // radial roof trusses (real count)
const SUB = 6; // roof samples per fabric panel (ridge -> valley -> ridge)
const ROOF_IN = [44, 33, 3.8]; // [N-S half-length, E-W half-length, superellipse exponent]
const ROOF_OUT = [77, 68, 3.1];
const ROOF_Y_IN = 28.5; // roof height at the inner (pitch-side) edge
const ROOF_RISE = 7.5; // additional height at the outer edge
const CORNER_LIFT = 7; // extra sweep-up of the outer edge at the four corners
const FASCIA = 3; // depth of the perimeter truss
const MAST_TOP = 48;
const PODIUM_H = 8; // raised concourse level

const SEAT = material(0xa9adb3, { roughness: 0.92 });
const SEAT_RISER = material(0x8d9298, { roughness: 0.92 });
const SKYLIGHT = material(0x9ec9e8, { roughness: 0.18, metalness: 0.7, emissive: 0x11304a, emissiveIntensity: 0.22, side: THREE.DoubleSide });
const TRUSS = material(0xb3b9bf, { roughness: 0.4, metalness: 0.65 });

/** Point on the superellipse |x/b|^n + |z/a|^n = 1 along direction `phi` (a = N-S, b = E-W). */
function superPoint([a, b, n], phi) {
  const c = Math.cos(phi);
  const s = Math.sin(phi);
  const r = Math.pow(Math.pow(Math.abs(c) / b, n) + Math.pow(Math.abs(s) / a, n), -1 / n);
  return [r * c, r * s];
}

const lerpShape = (A, B, t) => A.map((v, i) => v + (B[i] - v) * t);

/** Closed ring of [x, y, z] points on a superellipse; `y` may be a function (i, x, z) => y. */
function ringPoints(shape, y, count) {
  const pts = [];
  for (let i = 0; i < count; i += 1) {
    const [x, z] = superPoint(shape, (i / count) * TAU);
    pts.push([x, typeof y === "function" ? y(i, x, z) : y, z]);
  }
  return pts;
}

/** Push a quad as two triangles, wound so its normal agrees with `facing` (up | down | in | out). */
function pushQuad(tris, A, B, C, D, facing) {
  const ux = B[0] - A[0]; const uy = B[1] - A[1]; const uz = B[2] - A[2];
  const vx = C[0] - A[0]; const vy = C[1] - A[1]; const vz = C[2] - A[2];
  const nx = uy * vz - uz * vy; const ny = uz * vx - ux * vz; const nz = ux * vy - uy * vx;
  let px = 0; let py = 0; let pz = 0;
  if (facing === "up") py = 1;
  else if (facing === "down") py = -1;
  else {
    const cx = (A[0] + B[0] + C[0] + D[0]) / 4;
    const cz = (A[2] + B[2] + C[2] + D[2]) / 4;
    const r = Math.hypot(cx, cz) || 1;
    const sign = facing === "in" ? -1 : 1;
    px = (sign * cx) / r;
    pz = (sign * cz) / r;
  }
  if (nx * px + ny * py + nz * pz >= 0) tris.push(A, B, C, A, C, D);
  else tris.push(A, C, B, A, D, C);
}

/** Closed strip between two rings of equal length. */
function band(parent, ringA, ringB, mat, facing = "out") {
  const tris = [];
  const count = ringA.length;
  for (let i = 0; i < count; i += 1) {
    const j = (i + 1) % count;
    pushQuad(tris, ringA[i], ringA[j], ringB[j], ringB[i], facing);
  }
  const mesh = new THREE.Mesh(trianglesToGeometry(tris), mat);
  parent.add(mesh);
  return mesh;
}

/** How close a direction is to one of the four roof corners (0 on the sides, 1 at the corners). */
function cornerness(phi) {
  const [x, z] = superPoint(ROOF_OUT, phi);
  return Math.min(1, (Math.abs(x / ROOF_OUT[1]) * Math.abs(z / ROOF_OUT[0])) / 0.62);
}

/** Roof surface height. `u` 0 = inner edge, 1 = outer edge; `f` = position within a fabric panel (0 = truss). */
function roofY(phi, u, f) {
  const lift = CORNER_LIFT * Math.pow(cornerness(phi), 2.2) * (0.25 + 0.75 * u * u);
  const sag = 1.3 * Math.sin(Math.PI * f) * (0.45 + 0.55 * Math.sin(Math.PI * u));
  return ROOF_Y_IN + ROOF_RISE * Math.pow(u, 1.15) + lift - sag;
}

/** Point on the roof surface at direction `phi`. */
function roofPoint(phi, u, f) {
  const [xi, zi] = superPoint(ROOF_IN, phi);
  const [xo, zo] = superPoint(ROOF_OUT, phi);
  return [xi + (xo - xi) * u, roofY(phi, u, f), zi + (zo - zi) * u];
}

/** Raked tier of `steps` seating steps between two superellipse outlines/heights. */
function tier(g, { from, to, yFrom, yTo, steps, riser, count }) {
  for (let i = 0; i < steps; i += 1) {
    const t0 = i / steps;
    const t1 = (i + 1) / steps;
    const s0 = lerpShape(from, to, t0);
    const s1 = lerpShape(from, to, t1);
    const y0 = yFrom + (yTo - yFrom) * t0;
    const y1 = yFrom + (yTo - yFrom) * t1;
    band(g, ringPoints(s0, y0, count), ringPoints(s0, y0 + riser, count), SEAT_RISER, "in");
    band(g, ringPoints(s0, y0 + riser, count), ringPoints(s1, y1, count), SEAT, "up");
  }
}

export default {
  id: "seoul-world-cup-stadium",
  name: "서울월드컵경기장",
  nameEn: "Seoul World Cup Stadium",
  district: "마포구",
  lat: 37.5683,
  lon: 126.8973,
  height: 48,
  colliderRadius: 89,
  detail: "high",
  description: "방패연 형상의 막 구조 지붕, 16개 마스트",
  create() {
    const g = new THREE.Group();
    const N = 96; // angular samples for the bowl bands

    // ── Plaza, lawns, podium ────────────────────────────────────────────────
    const plaza = ringPoints([86, 78, 2.5], 0, 72).map(([x, , z]) => [x, z]);
    prism(g, { points: plaza, h: 0.6, mat: M.granite });

    // Lawn strips with trees on three plaza corners (the SW corner holds the shopping wing).
    [[45, 0], [135, 0], [-45, 0], [-135, 0]].forEach(([degAngle], idx) => {
      if (idx === 1) return; // SW: 월드컵몰 wing
      const phi = (degAngle * Math.PI) / 180;
      const r = 79;
      const cx = Math.cos(phi) * r;
      const cz = Math.sin(phi) * r;
      box(g, { w: 24, h: 0.7, d: 8, x: cx, y: 0.3, z: cz, mat: M.grass, ry: -phi + Math.PI / 2 });
      for (let k = -2; k <= 2; k += 1) {
        const tx = -Math.sin(phi) * k * 4.6;
        const tz = Math.cos(phi) * k * 4.6;
        tree(g, { x: cx + tx, y: 1, z: cz + tz, h: 8.5 + (k % 2 ? 1.5 : 0), r: 2.6 });
      }
    });

    // Podium (shops + services below the raised concourse): glass shopfront, granite, dark fascia.
    const podium = [80, 71, 2.8];
    const bowlOuter = [76, 67, 3.1];
    band(g, ringPoints(podium, 0, N), ringPoints(podium, 2.6, N), M.glassDark, "out");
    band(g, ringPoints(podium, 2.6, N), ringPoints(podium, PODIUM_H - 0.6, N), M.granite, "out");
    band(g, ringPoints(podium, PODIUM_H - 0.6, N), ringPoints(podium, PODIUM_H, N), M.concreteDark, "out");
    band(g, ringPoints(podium, PODIUM_H, N), ringPoints(bowlOuter, PODIUM_H, N), M.concrete, "up");

    // 월드컵몰 / 홈플러스 wing on the south-west side (low wide gray box with shopfront glazing).
    box(g, { w: 14, h: PODIUM_H, d: 28, x: -69, y: 0, z: 30, mat: M.concrete });
    box(g, { w: 14.4, h: 3.4, d: 28.4, x: -69, y: 0.4, z: 30, mat: M.glassDark });
    box(g, { w: 14.2, h: 0.9, d: 28.2, x: -69, y: PODIUM_H - 1.4, z: 30, mat: M.red });

    // Grand stairs from the plaza up to the concourse at the four mid-sides.
    const stairSteps = 5;
    for (let i = 0; i < stairSteps; i += 1) {
      const h = (PODIUM_H * (stairSteps - i)) / stairSteps;
      const depth = 1.2;
      const ex = podium[1] + depth / 2 + i * depth;
      const nz = podium[0] + depth / 2 + i * depth;
      box(g, { w: depth, h, d: 18, x: ex, mat: M.granite });
      box(g, { w: depth, h, d: 18, x: -ex, mat: M.granite });
      box(g, { w: 18, h, d: depth, z: nz, mat: M.granite });
      box(g, { w: 18, h, d: depth, z: -nz, mat: M.granite });
    }

    // ── Pitch (long axis north-south), sitting on the plaza slab ────────────
    const pitchY = 0.6;
    box(g, { w: 52, h: 0.3, d: 74, y: pitchY, mat: M.grass });
    const pitchW = 37.4; // 68 m × 0.55
    const pitchL = 58; // 105 m × 0.55
    for (let i = 0; i < 8; i += 1) {
      box(g, { w: pitchW, h: 0.06, d: pitchL / 8, z: -pitchL / 2 + (pitchL / 8) * (i + 0.5), y: pitchY + 0.3, mat: i % 2 ? M.grassDark : M.grass });
    }
    const line = (w, d, x, z) => box(g, { w, h: 0.05, d, x, y: pitchY + 0.36, z, mat: M.white });
    line(0.35, pitchL, pitchW / 2, 0);
    line(0.35, pitchL, -pitchW / 2, 0);
    line(pitchW, 0.35, 0, pitchL / 2);
    line(pitchW, 0.35, 0, -pitchL / 2);
    line(pitchW, 0.3, 0, 0);
    disc(g, { r: 5.1, rInner: 4.75, y: pitchY + 0.39, mat: M.white, seg: 32 });
    [1, -1].forEach((end) => {
      const goalLine = end * (pitchL / 2);
      line(22.2, 0.3, 0, goalLine - end * 9.1);
      line(0.3, 9.1, 11.1, goalLine - end * 4.55);
      line(0.3, 9.1, -11.1, goalLine - end * 4.55);
      line(10, 0.3, 0, goalLine - end * 3);
      line(0.3, 3, 5, goalLine - end * 1.5);
      line(0.3, 3, -5, goalLine - end * 1.5);
      // goal frame
      box(g, { w: 4, h: 0.15, d: 0.15, y: pitchY + 1.3, z: goalLine + end * 0.2, mat: M.white });
    });

    // ── Bowl: two raked tiers around the pitch ──────────────────────────────
    const lowerFront = [38, 27, 4.0];
    const lowerBack = [56, 45, 3.4];
    tier(g, { from: lowerFront, to: lowerBack, yFrom: pitchY, yTo: 11, steps: 5, riser: 0.9, count: N });
    // Red LED ribbon board along the top of the lower tier, then the dark skybox band up to the upper tier.
    band(g, ringPoints(lowerBack, 11, N), ringPoints(lowerBack, 11.8, N), M.red, "in");
    const upperFront = [56.8, 45.8, 3.3];
    band(g, ringPoints(lowerBack, 11.8, N), ringPoints(upperFront, 15, N), M.glassDark, "in");
    const upperBack = [75, 66, 3.1];
    tier(g, { from: upperFront, to: upperBack, yFrom: 15, yTo: 31, steps: 7, riser: 1.0, count: N });
    // Back parapet and its cap.
    band(g, ringPoints(upperBack, 31, N), ringPoints(upperBack, 33, N), M.concrete, "in");
    band(g, ringPoints(upperBack, 33, N), ringPoints(bowlOuter, 33, N), M.concrete, "up");

    // Exterior: glazed concourse, red accent band, concrete upper wall with floor lines, and a dark
    // open zone under the roof so the white canopy reads as floating on its ring of columns.
    band(g, ringPoints(bowlOuter, PODIUM_H, N), ringPoints(bowlOuter, 12, N), M.glassDark, "out");
    band(g, ringPoints(bowlOuter, 12, N), ringPoints(bowlOuter, 12.8, N), M.red, "out");
    band(g, ringPoints(bowlOuter, 12.8, N), ringPoints(bowlOuter, 27, N), M.concrete, "out");
    band(g, ringPoints(bowlOuter, 27, N), ringPoints(bowlOuter, 33, N), M.glassDark, "out");
    const lip = [76.3, 67.3, 3.1];
    [17.5, 22.5].forEach((y) => {
      band(g, ringPoints(lip, y, N), ringPoints(lip, y + 0.5, N), M.concreteDark, "out");
    });
    for (let k = 0; k < TRUSSES; k += 1) {
      const [x, z] = superPoint([76.8, 67.8, 3.1], (k / TRUSSES) * TAU);
      cyl(g, { rTop: 0.8, rBot: 0.8, h: 33.4 - PODIUM_H, x, y: PODIUM_H, z, mat: M.concrete, seg: 8 });
    }

    // Scoreboards under the roof at the north and south ends.
    [1, -1].forEach((end) => {
      box(g, { w: 16, h: 6, d: 1.2, y: 24, z: end * 60, mat: M.black });
      box(g, { w: 15, h: 5, d: 0.3, y: 24.5, z: end * (60 - 0.7), mat: M.glow });
    });

    // ── Roof: the shield-kite membrane ──────────────────────────────────────
    const NR = TRUSSES * SUB;
    const U = 8;
    const glassTris = [];
    const fabricTris = [];
    for (let i = 0; i < NR; i += 1) {
      const j = (i + 1) % NR;
      const phiI = (i / NR) * TAU;
      const phiJ = (j / NR) * TAU;
      const fI = (i % SUB) / SUB;
      const fJ = (j % SUB) / SUB;
      for (let k = 0; k < U; k += 1) {
        const u0 = k / U;
        const u1 = (k + 1) / U;
        const target = k === 0 ? glassTris : fabricTris;
        pushQuad(target, roofPoint(phiI, u0, fI), roofPoint(phiJ, u0, fJ), roofPoint(phiJ, u1, fJ), roofPoint(phiI, u1, fI), "up");
      }
    }
    g.add(new THREE.Mesh(trianglesToGeometry(glassTris), SKYLIGHT));
    g.add(new THREE.Mesh(trianglesToGeometry(fabricTris), M.membrane));

    // Inner ring truss (bright edge over the pitch) and outer perimeter truss / fascia.
    const innerTop = [];
    const innerBottom = [];
    const outerTop = [];
    const outerBottom = [];
    for (let i = 0; i < NR; i += 1) {
      const phi = (i / NR) * TAU;
      const f = (i % SUB) / SUB;
      const pIn = roofPoint(phi, 0, f);
      const pOut = roofPoint(phi, 1, f);
      innerTop.push(pIn);
      innerBottom.push([pIn[0], pIn[1] - 1.4, pIn[2]]);
      outerTop.push(pOut);
      outerBottom.push([pOut[0], pOut[1] - FASCIA, pOut[2]]);
    }
    band(g, innerBottom, innerTop, M.steel, "in");
    band(g, outerBottom, outerTop, M.white, "out");
    // Underside lip of the perimeter truss (dark steel)
    band(g, outerBottom, outerBottom.map(([x, y, z]) => [x * 0.985, y, z * 0.985]), M.steelDark, "down");

    // Radial trusses along the fabric ridges.
    for (let k = 0; k < TRUSSES; k += 1) {
      const phi = (k / TRUSSES) * TAU;
      const stops = [0, 0.35, 0.7, 1].map((u) => {
        const p = roofPoint(phi, u, 0);
        return [p[0], p[1] + 0.15, p[2]];
      });
      for (let s = 0; s < stops.length - 1; s += 1) {
        strut(g, { from: stops[s], to: stops[s + 1], r: 0.38, mat: TRUSS, seg: 6 });
      }
    }

    // ── Masts and stay cables (4 per side, standing on the plaza outside the roof) ──
    const masts = [];
    [-48, -16, 16, 48].forEach((z) => { masts.push([72.5, z], [-72.5, z]); });
    [-33, -12, 12, 33].forEach((x) => { masts.push([x, 81.5], [x, -81.5]); });
    const ridgeStep = TAU / TRUSSES;
    masts.forEach(([mx, mz]) => {
      const mid = 26;
      cyl(g, { rTop: 0.9, rBot: 0.7, h: mid - 0.6, x: mx, y: 0.6, z: mz, mat: M.white, seg: 10 });
      cyl(g, { rTop: 0.45, rBot: 0.9, h: MAST_TOP - mid, x: mx, y: mid, z: mz, mat: M.white, seg: 10 });
      const top = [mx, MAST_TOP - 0.5, mz];
      const phiM = Math.atan2(mz, mx);
      const k = Math.round(phiM / ridgeStep);
      const anchor = (ridgeIndex, u) => {
        const p = roofPoint(ridgeIndex * ridgeStep, u, 0);
        return [p[0], p[1] + 0.3, p[2]];
      };
      strut(g, { from: top, to: anchor(k - 1, 0.98), r: 0.22, mat: M.steel, seg: 6 });
      strut(g, { from: top, to: anchor(k + 1, 0.98), r: 0.22, mat: M.steel, seg: 6 });
      strut(g, { from: top, to: anchor(k, 0.55), r: 0.22, mat: M.steel, seg: 6 });
      strut(g, { from: top, to: anchor(k, 0.2), r: 0.22, mat: M.steel, seg: 6 });
    });

    return g;
  },
};
