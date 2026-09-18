// 잠실종합운동장 (Jamsil Sports Complex, 1977-84) - 송파구
// The 1988 Olympic venue cluster between the 탄천 stream (west) and the 잠실 apartments (east):
// - 서울올림픽주경기장 (1984, 김수근) - the signature, north-centre: a pale beige oval (real ≈ 245 × 180 m,
//   long axis NNE-SSW) whose two raked tiers wrap a red 400 m track and green pitch. The outer wall
//   leans outward as it rises and ends in the thin, flared cantilevered roof rim modelled on the lip of a
//   Joseon white-porcelain jar (백자). Floodlight batteries sit along the inner edge of the canopy.
// - 잠실야구장 (1982, south-west): round two-tier bowl (blue infield / green outfield seats), brown
//   diamond, canopy over the home-plate side, centre-field scoreboard and six lattice light towers.
// - 잠실실내체육관 (1979, east): round beige drum under a shallow dome; 잠실학생체육관 (south-east, by
//   올림픽로): smaller round hall; 제1수영장 (1980, north-east): the oblong "turtle-ship" hall.
// - Asphalt lots with parked cars between the venues, tree rows, and the 탄천 edge along the west side.
// Footprints ≈ 0.4 of real; venue spacing is compressed to fit the 100-unit collider; heights ≈ 0.65 of real.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, prism, dome, strut, disc, tree, treePatch, subgroup, deg, seededRandom, trianglesToGeometry } from "./_helpers.mjs";

const TAU = Math.PI * 2;

// ── Palette ──────────────────────────────────────────────────────────────────
const WALL = M.limestone;
const FIN = material(0xd4cdbd, { roughness: 0.85 });
const CANOPY = material(0xdcdad3, { roughness: 0.7 });
const SOFFIT = M.concreteDark;
const RISER = material(0xa9abae, { roughness: 0.92 });
const SEAT_LOW = material(0x4b6d9c, { roughness: 0.9 });
const SEAT_UP = material(0x8391a3, { roughness: 0.9 });
const SEAT_GREEN = material(0x3f8a5c, { roughness: 0.9 });
const SEAT_BLUE = material(0x2f5fa6, { roughness: 0.9 });
const PITCH_B = material(0x527f42, { roughness: 1 });
const TRACK = material(0xb04a32, { roughness: 1 });
const DIRT = material(0x9d6a40, { roughness: 1 });
const LAMP = material(0x2b2f34, { roughness: 0.6 });
const LAMP_FACE = material(0xd8dde2, { roughness: 0.4, metalness: 0.3 });
const SHELL = material(0x5f7383, { roughness: 0.5, metalness: 0.3 });
const CARS = [M.white, M.black, M.aluminum, M.red, M.navy, M.steelDark];

// ── Outline / surface helpers ────────────────────────────────────────────────

/** Radial distance (along a ray at angle t from the origin) to an ellipse with semi-axis `b` along x and `a` along z. */
const sEllipse = (t, a, b) => (a * b) / Math.hypot(a * Math.cos(t), b * Math.sin(t));

/** Radial distance to a rounded rectangle: straights at x = ±r for |z| ≤ L, semicircles of radius r centred at (0, ±L). */
function sRect(t, L, r) {
  const c = Math.cos(t);
  const s = Math.sin(t);
  const side = r / Math.max(Math.abs(c), 1e-6);
  if (Math.abs(side * s) <= L) return side;
  return L * Math.abs(s) + Math.sqrt(Math.max(0, r * r - L * L * c * c));
}

/** Push a quad as two triangles wound so that its normal agrees with `facing` (up | down | in | out). */
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

/** Strip of quads between two rings of equal length; `i0`/`count` select a partial arc (wraps around). */
function band(parent, ringA, ringB, mat, facing = "out", i0 = 0, count = ringA.length) {
  const tris = [];
  const n = ringA.length;
  for (let k = 0; k < count; k += 1) {
    const i = (i0 + k) % n;
    const j = (i + 1) % n;
    pushQuad(tris, ringA[i], ringA[j], ringB[j], ringB[i], facing);
  }
  const mesh = new THREE.Mesh(trianglesToGeometry(tris), mat);
  parent.add(mesh);
  return mesh;
}

/**
 * Raked seating tier: `steps` rows between lerp positions u0 → u1 and heights y0 → y1.
 * `ring(fn, y)` samples an outline, `at(u)` is the lerped outline; `seats` = [{ mat, i0, count }] arcs.
 */
function tier(parent, ring, at, { u0, u1, y0, y1, steps, riser, seats }) {
  for (let i = 0; i < steps; i += 1) {
    const ua = u0 + ((u1 - u0) * i) / steps;
    const ub = u0 + ((u1 - u0) * (i + 1)) / steps;
    const ya = y0 + ((y1 - y0) * i) / steps;
    const yb = y0 + ((y1 - y0) * (i + 1)) / steps;
    band(parent, ring(at(ua), ya), ring(at(ua), ya + riser), RISER, "in");
    const treadA = ring(at(ua), ya + riser);
    const treadB = ring(at(ub), yb);
    seats.forEach(({ mat, i0 = 0, count = treadA.length }) => band(parent, treadA, treadB, mat, "up", i0, count));
  }
}

const wrap = (t) => Math.atan2(Math.sin(t), Math.cos(t));

// ── 서울올림픽주경기장 ─────────────────────────────────────────────────────────
function olympicStadium(parent, { x, z, ry }) {
  const g = subgroup(parent, { x, z, ry });
  const N = 96;
  const A = 48; // outer-wall semi-axis along the long (local z) axis
  const B = 35.5; // along the short (local x) axis
  const TL = 17; // track straight half-length
  const TR = 14.8; // track inner radius (half-width)
  const TW = 4; // track width (8 lanes)
  const sRim = (t) => sEllipse(t, A, B);
  const sFront = (t) => sRect(t, TL, TR + TW + 1.2); // first row of seats, behind a narrow walkway
  const at = (u) => (t) => sFront(t) + (sRim(t) - sFront(t)) * u; // lerp between bowl front and outer wall
  const out = (d) => (t) => sRim(t) + d; // offset outside the outer wall
  const ring = (fn, y) => Array.from({ length: N }, (_, i) => {
    const t = (i / N) * TAU;
    const s = fn(t);
    return [s * Math.cos(t), y, s * Math.sin(t)];
  });
  const poly = (fn) => ring(fn, 0).map(([px, , pz]) => [px, pz]);
  const radial = (t) => Math.PI / 2 - t; // box `ry` so that its depth axis points along the ray

  // Plaza apron around the stadium
  prism(g, { points: poly(out(9)), h: 0.3, y: 0.25, mat: M.granite });

  // Field: grass D-zones inside the track, the 105 × 70 pitch with mowing stripes and lines, the red track
  const F = 0.55;
  prism(g, { points: poly((t) => sRect(t, TL, TR)), h: 0.3, y: F, mat: M.grassDark });
  prism(g, { points: poly((t) => sRect(t, TL, TR + TW)), holes: [poly((t) => sRect(t, TL, TR)).reverse()], h: 0.3, y: F, mat: TRACK });
  [1.3, 2.6].forEach((d) => {
    prism(g, { points: poly((t) => sRect(t, TL, TR + d + 0.06)), holes: [poly((t) => sRect(t, TL, TR + d - 0.06)).reverse()], h: 0.02, y: F + 0.3, mat: M.white });
  });
  for (let i = 0; i < 6; i += 1) {
    box(g, { w: 28, h: 0.06, d: 7, z: -21 + 3.5 + 7 * i, y: F + 0.3, mat: i % 2 ? PITCH_B : M.grass });
  }
  const line = (w, d, lx, lz) => box(g, { w, h: 0.04, d, x: lx, y: F + 0.36, z: lz, mat: M.white });
  line(0.3, 42, 14, 0);
  line(0.3, 42, -14, 0);
  line(28, 0.3, 0, 21);
  line(28, 0.3, 0, -21);
  line(28, 0.25, 0, 0);
  disc(g, { r: 3.7, rInner: 3.45, y: F + 0.38, mat: M.white, seg: 28 });
  [1, -1].forEach((end) => {
    line(16, 0.25, 0, end * (21 - 6.6));
    line(0.25, 6.6, 8, end * (21 - 3.3));
    line(0.25, 6.6, -8, end * (21 - 3.3));
    box(g, { w: 3, h: 0.12, d: 0.12, y: F + 1.1, z: end * 21.15, mat: M.white });
  });

  // Bowl: front wall, lower tier, VIP/press band, upper tier, back parapet
  band(g, ring(at(0), F + 0.3), ring(at(0), 1.6), M.concrete, "in");
  tier(g, ring, at, { u0: 0, u1: 0.42, y0: 1.6, y1: 6.9, steps: 5, riser: 0.55, seats: [{ mat: SEAT_LOW }] });
  band(g, ring(at(0.42), 6.9), ring(at(0.42), 8.7), M.glassDark, "in");
  band(g, ring(at(0.42), 8.7), ring(at(0.5), 8.7), M.concrete, "up");
  tier(g, ring, at, { u0: 0.5, u1: 0.94, y0: 8.7, y1: 20.4, steps: 8, riser: 0.7, seats: [{ mat: SEAT_UP }] });
  band(g, ring(at(0.94), 20.4), ring(at(0.94), 21.6), M.concrete, "in");
  band(g, ring(at(0.94), 21.6), ring(out(0), 21.6), M.concrete, "up");
  band(g, ring(out(0), 21.6), ring(out(0), 23.6), WALL, "in");

  // Exterior: vertical beige base, then the wall leans out and sweeps into the flared roof lip (the 백자 curve)
  const EXT = [[0, 0.3], [0, 8.5], [0.12, 13], [0.5, 17], [1.2, 20], [2.3, 22.4], [3.6, 24.4], [5.0, 26.0], [6.0, 27.0], [6.5, 27.3]];
  for (let i = 0; i < EXT.length - 1; i += 1) {
    band(g, ring(out(EXT[i][0]), EXT[i][1]), ring(out(EXT[i + 1][0]), EXT[i + 1][1]), i < 4 ? WALL : M.concrete, "out");
  }
  // Canopy top: from the thin lip back inward and gently down over the upper tier
  const TOP = [[out(6.5), 27.3], [out(4.6), 27.15], [out(2.2), 26.75], [out(0), 26.25], [at(0.86), 25.3], [at(0.72), 24.3], [at(0.6), 23.4]];
  for (let i = 0; i < TOP.length - 1; i += 1) {
    band(g, ring(TOP[i][0], TOP[i][1]), ring(TOP[i + 1][0], TOP[i + 1][1]), CANOPY, "up");
  }
  // Inner edge (dark floodlight strip) and the soffit under the canopy
  band(g, ring(at(0.6), 23.4), ring(at(0.6), 22.1), LAMP, "in");
  band(g, ring(at(0.6), 22.1), ring(at(0.8), 22.9), SOFFIT, "down");
  band(g, ring(at(0.8), 22.9), ring(out(0), 23.6), SOFFIT, "down");
  for (let i = 0; i < N; i += 2) {
    const t = (i / N) * TAU;
    const s = at(0.62)(t);
    box(g, { w: 1.4, h: 0.6, d: 0.6, x: s * Math.cos(t), y: 22.2, z: s * Math.sin(t), mat: LAMP, ry: radial(t) });
  }

  // Vertical concrete fins on the lower facade
  for (let i = 0; i < 64; i += 1) {
    const t = (i / 64) * TAU;
    const s = sRim(t) + 0.45;
    box(g, { w: 0.6, h: 13, d: 0.9, x: s * Math.cos(t), y: 0.5, z: s * Math.sin(t), mat: FIN, ry: radial(t) });
  }
  // Gate stairs (54 gates in reality - eight stepped entrance blocks here)
  for (let k = 0; k < 8; k += 1) {
    const t = (k / 8) * TAU + Math.PI / 8;
    for (let s = 0; s < 3; s += 1) {
      const d = sRim(t) + 1.3 + s * 1.7;
      box(g, { w: 7, h: 3.3 - s * 1.1, d: 1.7, x: d * Math.cos(t), y: 0.5, z: d * Math.sin(t), mat: M.concrete, ry: radial(t) });
    }
  }
  return g;
}

// ── 잠실야구장 ────────────────────────────────────────────────────────────────
function baseballStadium(parent, { x, z, ry }) {
  const g = subgroup(parent, { x, z, ry });
  const N = 96;
  const R = 30; // bowl outer radius
  const HZ = 16; // home plate sits at local (0, HZ); centre field is toward local -z
  const base = 0.7;
  // Outlines are sampled along rays from home plate: th = 0 → centre field, ±π/2 → the foul poles' side, π → backstop.
  const rIn = (th) => {
    const a = Math.abs(wrap(th));
    if (a <= Math.PI / 4) return 36 + 6 * Math.cos(2 * th); // outfield fence: 100 m at the poles, 125 m at CF
    return 36 - 29 * Math.pow((a - Math.PI / 4) / (0.75 * Math.PI), 0.9); // foul territory, tightening behind home
  };
  const rOut = (th) => HZ * Math.cos(th) + Math.sqrt(R * R - HZ * HZ + HZ * HZ * Math.cos(th) * Math.cos(th));
  const at = (u) => (th) => rIn(th) + (rOut(th) - rIn(th)) * u;
  const out = (d) => (th) => rOut(th) + d;
  const pt = (th, s, y) => [s * Math.sin(th), y, HZ - s * Math.cos(th)];
  const ring = (fn, y) => Array.from({ length: N }, (_, i) => {
    const th = (i / N) * TAU;
    return pt(th, fn(th), y);
  });
  const poly = (fn) => ring(fn, 0).map(([px, , pz]) => [px, pz]);
  const OUTFIELD = { i0: 83, count: 26 }; // |th| ≤ 49°
  const INFIELD = { i0: 13, count: 70 };

  // Plinth and playing field
  cyl(g, { rTop: 31, h: 0.45, y: 0.25, mat: M.granite, seg: 64 });
  prism(g, { points: poly(rIn), h: 0.3, y: base, mat: M.grass });
  // Warning track along the outfield fence
  const track = [];
  for (let i = -16; i <= 16; i += 1) track.push(poly(rIn)[0] && pt((i / N) * TAU, rIn((i / N) * TAU), 0));
  const trackPoly = track.map(([px, , pz]) => [px, pz]).concat(track.slice().reverse().map(([px, , pz]) => {
    const th = Math.atan2(px, HZ - pz);
    const s = rIn(th) - 1.3;
    return [s * Math.sin(th), HZ - s * Math.cos(th)];
  }));
  prism(g, { points: trackPoly, h: 0.05, y: base + 0.3, mat: DIRT });
  // Dirt fan around the infield, grass diamond, mound, home-plate circle, foul lines, foul poles
  const fan = [[0, HZ]];
  for (let i = -12; i <= 12; i += 1) {
    const th = (i / 12) * (Math.PI / 4);
    fan.push([15.5 * Math.sin(th), HZ - 15.5 * Math.cos(th)]);
  }
  prism(g, { points: fan, h: 0.05, y: base + 0.3, mat: DIRT });
  prism(g, { points: [[0, HZ - 1.2], [6.4, HZ - 7.6], [0, HZ - 14], [-6.4, HZ - 7.6]], h: 0.05, y: base + 0.35, mat: M.grass });
  disc(g, { r: 1.1, y: base + 0.41, z: HZ - 6.6, mat: DIRT, seg: 16 });
  disc(g, { r: 3.4, y: base + 0.36, z: HZ, mat: DIRT, seg: 24 });
  [1, -1].forEach((side) => {
    box(g, { w: 0.16, h: 0.03, d: 36, x: side * 12.7, y: base + 0.4, z: HZ - 12.7, mat: M.white, ry: side * Math.PI / 4 });
    cyl(g, { rTop: 0.12, h: 7, x: side * 25.4, y: base + 0.3, z: HZ - 25.4, mat: M.yellow, seg: 6 });
  });

  // Bowl: padded fence / dugout wall, lower tier, suite band, upper tier, parapet
  band(g, ring(at(0), base + 0.3), ring(at(0), base + 1.5), M.green, "in", OUTFIELD.i0, OUTFIELD.count);
  band(g, ring(at(0), base + 0.3), ring(at(0), base + 1.5), M.concreteDark, "in", INFIELD.i0, INFIELD.count);
  tier(g, ring, at, {
    u0: 0, u1: 0.5, y0: base + 1.5, y1: 6.4, steps: 4, riser: 0.5,
    seats: [{ mat: SEAT_GREEN, ...OUTFIELD }, { mat: SEAT_BLUE, ...INFIELD }],
  });
  band(g, ring(at(0.5), 6.4), ring(at(0.5), 7.8), M.concreteDark, "in");
  band(g, ring(at(0.5), 7.8), ring(at(0.56), 7.8), M.concrete, "up");
  tier(g, ring, at, {
    u0: 0.56, u1: 1, y0: 7.8, y1: 15.6, steps: 6, riser: 0.6,
    seats: [{ mat: SEAT_GREEN, ...OUTFIELD }, { mat: SEAT_GREEN, ...INFIELD }],
  });
  band(g, ring(at(1), 15.6), ring(at(1), 16.8), M.concrete, "in");

  // Exterior drum: beige wall, concourse glazing band, vertical piers, coping
  cyl(g, { rTop: R, h: 16.3, y: base - 0.2, mat: M.granite, seg: 64, open: true });
  cyl(g, { rTop: R + 0.15, h: 1.6, y: 7.0, mat: M.glassDark, seg: 64, open: true });
  cyl(g, { rTop: R + 0.15, h: 1.2, y: 13.2, mat: M.glassDark, seg: 64, open: true });
  for (let i = 0; i < 36; i += 1) {
    const th = (i / 36) * TAU;
    box(g, { w: 0.7, h: 15.8, d: 0.8, x: (R + 0.3) * Math.sin(th), y: base, z: -(R + 0.3) * Math.cos(th), mat: M.concrete, ry: -th });
  }
  disc(g, { r: R + 0.7, rInner: R - 0.6, y: 16.85, mat: M.concrete, seg: 64 });

  // Canopy over the home-plate side (1루 ~ 3루), on slim columns rising through the upper deck
  const roofPts = [];
  for (let i = 30; i <= 66; i += 1) {
    const th = (i / N) * TAU;
    roofPts.push(pt(th, out(1.8)(th), 0));
  }
  for (let i = 66; i >= 30; i -= 1) {
    const th = (i / N) * TAU;
    roofPts.push(pt(th, at(0.5)(th), 0));
  }
  const roofPoly = roofPts.map(([px, , pz]) => [px, pz]);
  prism(g, { points: roofPoly, h: 0.7, y: 18.2, mat: M.concrete });
  prism(g, { points: roofPoly, h: 0.25, y: 17.95, mat: M.concreteDark });
  for (let k = -3; k <= 3; k += 1) {
    const th = Math.PI + k * (Math.PI / 9);
    const [cx, , cz] = pt(th, at(0.56)(th), 0);
    cyl(g, { rTop: 0.32, h: 18.2 - 7.8, x: cx, y: 7.8, z: cz, mat: M.concrete, seg: 8 });
  }

  // Centre-field scoreboard (33 × 13.6 m real)
  box(g, { w: 12.5, h: 5.2, d: 0.8, y: 16.8, z: -27.6, mat: M.black });
  box(g, { w: 11.8, h: 4.4, d: 0.2, y: 17.2, z: -27.1, mat: M.glow });
  [-5, 5].forEach((sx) => box(g, { w: 0.6, h: 2.2, d: 0.6, x: sx, y: 14.6, z: -27.6, mat: M.steelDark }));

  // Six lattice floodlight towers just outside the drum
  [-32, 32, -92, 92, -138, 138].forEach((degAngle) => {
    const th = deg(degAngle);
    const tg = subgroup(g, { x: (R + 1.8) * Math.sin(th), y: base, z: -(R + 1.8) * Math.cos(th), ry: -th });
    const top = [0, 27, 0];
    [[1.2, 0.8], [-1.2, 0.8], [0, -1.4]].forEach(([lx, lz]) => {
      strut(tg, { from: [lx, 0, lz], to: top, r: 0.22, mat: M.steel, seg: 6 });
    });
    [9, 18].forEach((ty) => {
      const k = 1 - ty / 27;
      const legs = [[1.2 * k, ty, 0.8 * k], [-1.2 * k, ty, 0.8 * k], [0, ty, -1.4 * k]];
      for (let i = 0; i < 3; i += 1) strut(tg, { from: legs[i], to: legs[(i + 1) % 3], r: 0.1, mat: M.steel, seg: 5 });
    });
    box(tg, { w: 7, h: 3.4, d: 0.5, y: 26.2, z: 0.7, mat: LAMP, rx: 0.35 });
    box(tg, { w: 6.6, h: 3, d: 0.14, y: 26.4, z: 1.02, mat: LAMP_FACE, rx: 0.35 });
  });

  // Entrance stairs at the four quadrants
  [45, 135, 225, 315].forEach((degAngle) => {
    const th = deg(degAngle);
    for (let s = 0; s < 3; s += 1) {
      const d = R + 1.2 + s * 1.5;
      box(g, { w: 6, h: 2.4 - s * 0.8, d: 1.5, x: d * Math.sin(th), y: base, z: -d * Math.cos(th), mat: M.concrete, ry: -th });
    }
  });
  return g;
}

// ── Round arenas ─────────────────────────────────────────────────────────────
function indoorGym(parent, { x, z }) {
  const g = subgroup(parent, { x, z });
  const base = 0.7;
  cyl(g, { rTop: 20.5, h: 0.45, y: 0.25, mat: M.granite, seg: 64 });
  cyl(g, { rTop: 18, h: 9, y: base, mat: WALL, seg: 48 });
  cyl(g, { rTop: 18.15, h: 1.8, y: base + 1.9, mat: M.glassDark, seg: 48, open: true });
  for (let i = 0; i < 32; i += 1) {
    const th = (i / 32) * TAU;
    box(g, { w: 0.55, h: 8.6, d: 0.8, x: 18.35 * Math.cos(th), y: base, z: 18.35 * Math.sin(th), mat: FIN, ry: Math.PI / 2 - th });
  }
  cyl(g, { rTop: 18.9, h: 0.9, y: base + 9, mat: M.concrete, seg: 48 });
  dome(g, { r: 18.7, y: base + 9.9, scaleY: 0.42, mat: M.offWhite, seg: 48 });
  cyl(g, { rTop: 3.2, h: 1.2, y: base + 17.3, mat: M.concreteDark, seg: 20 });
  cyl(g, { rTop: 2.4, h: 0.4, y: base + 18.5, mat: M.steel, seg: 20 });
  // Entrance canopies (main one facing the stadium plaza to the west)
  [[Math.PI, 10, 5], [Math.PI / 2, 7, 4], [-Math.PI / 2, 7, 4]].forEach(([th, w, d]) => {
    const r = 19.6;
    box(g, { w, h: 3.4, d, x: r * Math.cos(th), y: base, z: r * Math.sin(th), mat: M.concrete, ry: Math.PI / 2 - th });
    box(g, { w: w - 1, h: 2.4, d: d + 0.3, x: r * Math.cos(th), y: base + 0.5, z: r * Math.sin(th), mat: M.glassDark, ry: Math.PI / 2 - th });
  });
  return g;
}

function studentsGym(parent, { x, z }) {
  const g = subgroup(parent, { x, z });
  const base = 0.7;
  cyl(g, { rTop: 14, h: 0.45, y: 0.25, mat: M.granite, seg: 48 });
  cyl(g, { rTop: 12, h: 6.5, y: base, mat: M.concrete, seg: 40 });
  cyl(g, { rTop: 12.1, h: 1.5, y: base + 1.5, mat: M.glassDark, seg: 40, open: true });
  for (let i = 0; i < 20; i += 1) {
    const th = (i / 20) * TAU;
    box(g, { w: 0.5, h: 6.2, d: 0.7, x: 12.25 * Math.cos(th), y: base, z: 12.25 * Math.sin(th), mat: FIN, ry: Math.PI / 2 - th });
  }
  cyl(g, { rTop: 12.6, h: 0.7, y: base + 6.5, mat: M.concreteDark, seg: 40 });
  dome(g, { r: 12.3, y: base + 7.2, scaleY: 0.5, mat: M.offWhite, seg: 36 });
  cyl(g, { rTop: 1.6, h: 0.6, y: base + 13.1, mat: M.steelDark, seg: 12 });
  box(g, { w: 6, h: 4, d: 8, x: -13, y: base, z: -2, mat: M.concrete });
  return g;
}

function swimmingPool(parent, { x, z }) {
  const g = subgroup(parent, { x, z });
  box(g, { w: 26, h: 5, d: 14, y: 0.25, mat: M.concrete });
  box(g, { w: 26.2, h: 1.6, d: 14.2, y: 1.6, mat: M.glassDark });
  dome(g, { r: 7, y: 5.25, sx: 1.85, scaleY: 1.05, mat: SHELL, seg: 32 });
  box(g, { w: 22, h: 0.3, d: 0.6, y: 12.35, mat: M.steel });
  box(g, { w: 6, h: 3, d: 4, y: 0.25, z: 8.5, mat: M.concrete });
  return g;
}

// ── Grounds ──────────────────────────────────────────────────────────────────
function parkingRow(parent, { x0, x1, z, rng, cars = 0.4 }) {
  const n = Math.floor((x1 - x0) / 2.6);
  for (let i = 0; i <= n; i += 1) {
    const x = x0 + i * 2.6;
    box(parent, { w: 0.14, h: 0.03, d: 5, x, y: 0.25, z, mat: M.white });
    if (i < n && rng() < cars) {
      box(parent, { w: 1.7, h: 1.4, d: 4.2, x: x + 1.3, y: 0.25, z: z + (rng() - 0.5) * 0.4, mat: CARS[Math.floor(rng() * CARS.length)] });
    }
  }
}

export default {
  id: "jamsil-sports-complex",
  name: "잠실종합운동장",
  nameEn: "Jamsil Sports Complex",
  district: "송파구",
  lat: 37.514,
  lon: 127.0724,
  height: 31,
  colliderRadius: 95,
  detail: "high",
  description: "88올림픽 주경기장과 잠실야구장",
  create() {
    const g = new THREE.Group();
    const rng = seededRandom(1988);

    // Site: asphalt lots (octagon inside the collider circle), the 탄천 edge along the west side
    prism(g, { points: [[-78, -45], [-55, -75], [55, -75], [80, -45], [80, 45], [55, 75], [-55, 75], [-78, 45]], h: 0.25, mat: M.asphalt });
    box(g, { w: 8, h: 0.3, d: 80, x: -82, y: -0.2, mat: M.water });
    box(g, { w: 2.8, h: 0.35, d: 80, x: -77.4, y: 0, mat: M.grass });
    // Riverside lawn (보조경기장 side) north-east of the main stadium, park strip along 올림픽로 (south)
    box(g, { w: 24, h: 0.3, d: 12, x: 34, y: 0.1, z: -76, mat: M.grass });
    box(g, { w: 40, h: 0.3, d: 12, x: 10, y: 0.25, z: 66, mat: M.grass });

    // Venues
    olympicStadium(g, { x: -2, z: -36, ry: -deg(27) }); // long axis NNE-SSW
    baseballStadium(g, { x: -47, z: 40, ry: -deg(25) }); // home plate SSW, centre field toward the main stadium
    indoorGym(g, { x: 60, z: 8 });
    studentsGym(g, { x: 46, z: 62 });
    swimmingPool(g, { x: 58, z: -50 });

    // Parking rows: the big south lot and the lot by the 탄천 north-west of the main stadium
    [34, 42, 50, 58].forEach((z) => parkingRow(g, { x0: -14, x1: 28, z, rng }));
    [-20, -12, -4].forEach((z) => parkingRow(g, { x0: -72, x1: -52, z, rng, cars: 0.3 }));

    // Trees: 올림픽로 edge (south), riverbank (west), east edge, lawns
    for (let x = -38; x <= 26; x += 8) tree(g, { x, y: 0.25, z: 71, h: 8 + (x % 3 === 0 ? 1.5 : 0), r: 2.8 });
    for (let z = -44; z <= 12; z += 8) tree(g, { x: -76.5, y: 0.3, z, h: 8.5, r: 3 });
    [-42, -34, 32, 40].forEach((z, i) => tree(g, { x: 77, y: 0.25, z, h: 8 + (i % 2), r: 2.8 }));
    treePatch(g, { w: 20, d: 8, x: 34, y: 0.4, z: -76, count: 6, seed: 3, h: 8, r: 2.8 });
    treePatch(g, { w: 34, d: 8, x: 8, y: 0.55, z: 66, count: 5, seed: 5, h: 7.5, r: 2.6 });

    return g;
  },
};
