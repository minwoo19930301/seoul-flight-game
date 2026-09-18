// 롯데월드 매직아일랜드 (Lotte World Magic Island, 1990) - 송파구
// The outdoor half of Lotte World on an artificial island in the west lobe of 석촌호수 (Seokchon Lake).
// - 매직캐슬: white/cream fairy-tale castle at the island's north-centre - crenellated keep, gabled wings,
//   arched gatehouse and a cluster of round towers of graduated heights, each under a steep turquoise
//   conical spire with a gold finial (tallest ≈ 44 m).
// - Rides: 자이로드롭 70 m tower (west), 자이로스윙 pendulum, 스페인해적선, carousel pavilion, 아틀란티스
//   coaster (blue track, south-east), a red loop coaster with an orange hoop (north-west), 번지드롭 (east).
// - The quay-walled irregular island (footprint ≈ 0.5 of real, heights 1:1) sits in the lake, which reaches the
//   collider edge; a covered pedestrian bridge leads east to the shore with a hint of the 어드벤처 glass vault and
//   the Lotte Hotel World slab.
import * as THREE from "../vendor/three.module.js";
import {
  M, material, box, cyl, cone, sphere, dome, frustum, prism, polygonPrism, ring, disc, strut, archBlock, gableRoof,
  treePatch, subgroup, polar, deg, trianglesToGeometry,
} from "./_helpers.mjs";

const TURQ = material(0x3aa7b8, { roughness: 0.5 });
const CREAM = material(0xf3efe4, { roughness: 0.7 });
const DARK_OPENING = material(0x26384f, { roughness: 0.6 });
const TRACK_BLUE = material(0x2f6fc4, { roughness: 0.55, side: THREE.DoubleSide });
const TRACK_RED = material(0xd23b2f, { roughness: 0.55, side: THREE.DoubleSide });

const ISLAND_TOP = 2.3; // paved deck of the island
const LAKE_R = 41.5; // the lake reaches the collider edge
const SHORE_R = 34.5; // inner edge of the east shore strip
const IC = [-4, 2]; // island centre
const IA = 31; // island half-axis along x
const IB = 23; // island half-axis along z

// Irregular oval island outline ([x, z]; +z = south), roughly 62 × 45 units.
const OUTLINE = [
  [27.0, 2.0], [23.9, 10.4], [18.4, 18.6], [7.4, 22.9], [-4.0, 25.0], [-16.0, 24.0], [-25.3, 17.8], [-32.7, 10.6],
  [-35.0, 2.0], [-32.2, -6.4], [-26.4, -14.6], [-15.3, -18.7], [-4.0, -20.1], [7.4, -18.9], [17.9, -14.3], [24.4, -6.5],
];
const scaleOutline = (s) => OUTLINE.map(([x, z]) => [IC[0] + (x - IC[0]) * s, IC[1] + (z - IC[1]) * s]);
const onIsland = (x, z) => ((x - IC[0]) / IA) ** 2 + ((z - IC[1]) / IB) ** 2 <= 1;

// ── small helpers ────────────────────────────────────────────────────────────

/** Gold spike + ball on top of a spire. Returns the top y. */
function finial(g, { x, y, z, s = 1 }) {
  cyl(g, { rTop: 0.07 * s, rBot: 0.13 * s, h: 1.6 * s, x, y, z, mat: M.gold, seg: 6 });
  sphere(g, { r: 0.32 * s, x, y: y + 0.6 * s, z, mat: M.gold, seg: 10 });
  return y + 1.6 * s;
}

/** Round castle tower: shaft, corbel ring, gold band, turquoise conical spire, finial, recessed openings. */
function spireTower(g, { x, z, r, y, h, spireH, mat = M.white, seg = 20, openings = true }) {
  cyl(g, { rTop: r, rBot: r, h, x, y, z, mat, seg });
  cyl(g, { rTop: r * 1.18, rBot: r, h: 0.9, x, y: y + h - 0.9, z, mat: CREAM, seg });
  cyl(g, { rTop: r * 1.2, rBot: r * 1.2, h: 0.22, x, y: y + h - 0.22, z, mat: M.gold, seg });
  cone(g, { r: r * 1.24, h: spireH, x, y: y + h, z, mat: TURQ, seg });
  const top = finial(g, { x, y: y + h + spireH - 0.25, z, s: Math.max(0.7, r * 0.4) });
  if (openings) {
    const levels = Math.max(1, Math.floor((h - 3) / 5.5));
    for (let level = 0; level < levels; level += 1) {
      const wy = y + 2.6 + level * 5.5;
      [Math.PI / 2, 0, Math.PI, -Math.PI / 2].forEach((a) => {
        box(g, {
          w: Math.min(0.9, r * 0.4), h: 1.5, d: 0.3,
          x: x + Math.cos(a) * r, y: wy, z: z + Math.sin(a) * r, mat: DARK_OPENING, ry: Math.PI / 2 - a,
        });
      });
    }
  }
  return top;
}

/** Crenellated parapet around the top of a `w × d` block whose roof is at `y`. */
function crenels(g, { x, z, w, d, y, mat = M.white }) {
  const t = 0.5;
  const size = 0.9;
  const wallH = 0.45;
  const merlonH = 0.7;
  box(g, { w, h: wallH, d: t, x, y, z: z - d / 2 + t / 2, mat });
  box(g, { w, h: wallH, d: t, x, y, z: z + d / 2 - t / 2, mat });
  box(g, { w: t, h: wallH, d: d - 2 * t, x: x - w / 2 + t / 2, y, z, mat });
  box(g, { w: t, h: wallH, d: d - 2 * t, x: x + w / 2 - t / 2, y, z, mat });
  const nx = Math.max(1, Math.round((w - size) / 1.8));
  const nz = Math.max(1, Math.round((d - size) / 1.8));
  for (let i = 0; i <= nx; i += 1) {
    const px = x - w / 2 + size / 2 + ((w - size) / nx) * i;
    box(g, { w: size, h: merlonH, d: t, x: px, y: y + wallH, z: z - d / 2 + t / 2, mat });
    box(g, { w: size, h: merlonH, d: t, x: px, y: y + wallH, z: z + d / 2 - t / 2, mat });
  }
  for (let i = 1; i < nz; i += 1) {
    const pz = z - d / 2 + size / 2 + ((d - size) / nz) * i;
    box(g, { w: t, h: merlonH, d: size, x: x - w / 2 + t / 2, y: y + wallH, z: pz, mat });
    box(g, { w: t, h: merlonH, d: size, x: x + w / 2 - t / 2, y: y + wallH, z: pz, mat });
  }
}

/**
 * Rectangular-section tube along a 3D polyline (coaster track). `right` fixes the width direction
 * (needed for vertical loops); otherwise the width stays horizontal.
 */
function trackTube(g, pts, { w = 1.4, t = 0.45, mat, right = null }) {
  const up = new THREE.Vector3(0, 1, 0);
  const rings = pts.map((p, i) => {
    const P = new THREE.Vector3(...p);
    const prev = new THREE.Vector3(...pts[Math.max(0, i - 1)]);
    const next = new THREE.Vector3(...pts[Math.min(pts.length - 1, i + 1)]);
    const tan = next.clone().sub(prev).normalize();
    let side = right ? new THREE.Vector3(...right) : new THREE.Vector3().crossVectors(up, tan);
    if (side.lengthSq() < 1e-6) {
      side = new THREE.Vector3(0, 0, 1);
    }
    side.normalize();
    const nrm = new THREE.Vector3().crossVectors(tan, side).normalize();
    const R = side.multiplyScalar(w / 2);
    const U = nrm.multiplyScalar(t / 2);
    return [
      P.clone().sub(R).sub(U), P.clone().add(R).sub(U), P.clone().add(R).add(U), P.clone().sub(R).add(U),
    ].map((v) => [v.x, v.y, v.z]);
  });
  const tris = [];
  for (let i = 0; i < rings.length - 1; i += 1) {
    const a = rings[i];
    const b = rings[i + 1];
    for (let k = 0; k < 4; k += 1) {
      const k2 = (k + 1) % 4;
      tris.push(a[k], b[k], b[k2], a[k], b[k2], a[k2]);
    }
  }
  const first = rings[0];
  const last = rings[rings.length - 1];
  tris.push(first[0], first[2], first[1], first[0], first[3], first[2]);
  tris.push(last[0], last[1], last[2], last[0], last[2], last[3]);
  const mesh = new THREE.Mesh(trianglesToGeometry(tris), mat);
  g.add(mesh);
  return mesh;
}

/** Vertical support from the ground (island deck or water) up to a track point. */
function support(g, [x, y, z], r = 0.22, mat = M.white) {
  const base = onIsland(x, z) ? ISLAND_TOP : 0.5;
  strut(g, { from: [x, base, z], to: [x, y - 0.25, z], r, mat });
}

/** Position on the east shore arc and the rotation that aligns a box's long axis with the shore. */
function shorePoint(theta, r) {
  return { x: r * Math.cos(theta), z: r * Math.sin(theta), ry: -Math.atan2(Math.cos(theta), -Math.sin(theta)) };
}

// ── 매직캐슬 ─────────────────────────────────────────────────────────────────

function magicCastle(g) {
  const CX = -2;
  const CZ = -7;
  const CB = ISLAND_TOP + 1.2; // castle floor on its granite plinth

  // Plinth, gate forecourt and steps down to the plaza (south).
  box(g, { w: 32, h: 1.2, d: 18, x: CX, y: ISLAND_TOP, z: CZ + 0.5, mat: M.granite });
  box(g, { w: 14, h: 1.2, d: 5, x: CX, y: ISLAND_TOP, z: 4, mat: M.granite });
  box(g, { w: 10, h: 0.8, d: 1.6, x: CX, y: ISLAND_TOP, z: 7.3, mat: M.granite });
  box(g, { w: 11, h: 0.4, d: 1.6, x: CX, y: ISLAND_TOP, z: 8.9, mat: M.granite });

  // Keep: crenellated block with recessed openings, a stone base course and a steep turquoise roof
  // set inside the parapet (the towers rise through it).
  box(g, { w: 14, h: 12, d: 10, x: CX, y: CB, z: CZ, mat: M.offWhite });
  box(g, { w: 14.4, h: 1.4, d: 10.4, x: CX, y: CB, z: CZ, mat: M.granite });
  crenels(g, { x: CX, z: CZ, w: 14, d: 10, y: CB + 12 });
  gableRoof(g, { w: 11.5, d: 8, h: 4.5, x: CX, y: CB + 12.4, z: CZ, overhang: 0, mat: TURQ });
  [4, 8].forEach((wy) => {
    [-4.5, 0, 4.5].forEach((dx) => {
      box(g, { w: 1.0, h: 1.8, d: 0.3, x: CX + dx, y: CB + wy, z: CZ + 5, mat: DARK_OPENING });
      box(g, { w: 1.0, h: 1.8, d: 0.3, x: CX + dx, y: CB + wy, z: CZ - 5, mat: DARK_OPENING });
    });
    [-2.5, 2.5].forEach((dz) => {
      box(g, { w: 0.3, h: 1.8, d: 1.0, x: CX + 7, y: CB + wy, z: CZ + dz, mat: DARK_OPENING });
      box(g, { w: 0.3, h: 1.8, d: 1.0, x: CX - 7, y: CB + wy, z: CZ + dz, mat: DARK_OPENING });
    });
  });

  // Gabled wings east and west with small corner turrets.
  [-12, 8].forEach((wx) => {
    box(g, { w: 6, h: 8, d: 9, x: wx, y: CB, z: CZ, mat: M.offWhite });
    box(g, { w: 6.4, h: 1.2, d: 9.4, x: wx, y: CB, z: CZ, mat: M.granite });
    gableRoof(g, { w: 6, d: 9, h: 4, x: wx, y: CB + 8, z: CZ, overhang: 0.4, mat: TURQ });
    [-1.5, 1.5].forEach((dz) => {
      box(g, { w: 0.8, h: 1.6, d: 0.3, x: wx, y: CB + 3.5, z: CZ + 4.5 + dz * 0.001, mat: DARK_OPENING });
    });
    const tx = wx < CX ? wx - 3.5 : wx + 3.5;
    spireTower(g, { x: tx, z: CZ - 4.5, r: 1.1, y: CB, h: 11, spireH: 4.5, openings: false });
    spireTower(g, { x: tx, z: CZ + 4.5, r: 1.1, y: CB, h: 11, spireH: 4.5, openings: false });
  });

  // Gatehouse (south) with an arched passage, balcony, gold crest and a steep turquoise gable.
  archBlock(g, { w: 8, h: 8.5, d: 6, archW: 3.4, archH: 5.2, x: CX, y: CB, z: 1, mat: M.offWhite });
  box(g, { w: 8.4, h: 1.0, d: 6.4, x: CX, y: CB, z: 1, mat: M.granite });
  gableRoof(g, { w: 8, d: 6, h: 3, x: CX, y: CB + 8.5, z: 1, overhang: 0.3, mat: TURQ });
  box(g, { w: 4.4, h: 0.5, d: 1.4, x: CX, y: CB + 6.0, z: 4.4, mat: M.white });
  box(g, { w: 4.4, h: 0.8, d: 0.2, x: CX, y: CB + 6.5, z: 5.0, mat: M.white });
  const crest = cyl(g, { rTop: 0.9, rBot: 0.9, h: 0.16, x: CX, y: 0, z: 0, mat: M.gold, seg: 16 });
  crest.rotation.x = Math.PI / 2;
  crest.position.set(CX, CB + 7.6, 4.08);
  spireTower(g, { x: CX - 4.5, z: 3.5, r: 1.0, y: CB, h: 12, spireH: 4.5, openings: false });
  spireTower(g, { x: CX + 4.5, z: 3.5, r: 1.0, y: CB, h: 12, spireH: 4.5, openings: false });

  // Corner towers of graduated heights.
  spireTower(g, { x: CX + 7.5, z: CZ - 5.5, r: 2.4, y: CB, h: 19, spireH: 9 });
  spireTower(g, { x: CX - 7.5, z: CZ - 5.5, r: 2.2, y: CB, h: 16.5, spireH: 8 });
  spireTower(g, { x: CX + 7.5, z: CZ + 4.5, r: 2.0, y: CB, h: 13, spireH: 6.5 });
  spireTower(g, { x: CX - 7.5, z: CZ + 4.5, r: 2.0, y: CB, h: 14.5, spireH: 7 });
  // Slender towers rising out of the keep roof.
  spireTower(g, { x: CX + 4.2, z: CZ + 2.8, r: 1.6, y: CB, h: 21, spireH: 7 });
  spireTower(g, { x: CX - 5.0, z: CZ - 2.5, r: 1.5, y: CB, h: 18, spireH: 6.5 });

  // Main tower (≈ 44 m) with a corbelled balcony ring two thirds of the way up.
  const MX = CX;
  const MZ = CZ - 1;
  const top = spireTower(g, { x: MX, z: MZ, r: 3.4, y: CB, h: 25.5, spireH: 13.5, seg: 24 });
  cyl(g, { rTop: 4.5, rBot: 3.4, h: 1.0, x: MX, y: CB + 20, z: MZ, mat: CREAM, seg: 24 });
  cyl(g, { rTop: 4.5, rBot: 4.5, h: 0.8, x: MX, y: CB + 21, z: MZ, mat: M.white, seg: 24, open: true });
  return top;
}

// ── rides ────────────────────────────────────────────────────────────────────

/** 자이로드롭: 70 m white/red drop tower on an octagonal loading pavilion, ring gondola near the base. */
function gyroDrop(g, { x, z }) {
  const y0 = ISLAND_TOP;
  polygonPrism(g, { sides: 8, r: 4.8, h: 3.4, x, y: y0, z, mat: M.offWhite });
  cyl(g, { rTop: 1.2, rBot: 5.6, h: 2.0, x, y: y0 + 3.4, z, mat: TURQ, seg: 8, ry: Math.PI / 8 });
  const shaftTop = 67.2;
  cyl(g, { rTop: 0.9, rBot: 1.1, h: shaftTop - 6 - y0, x, y: y0, z, mat: M.white, seg: 12 });
  cyl(g, { rTop: 0.9, rBot: 0.9, h: 6, x, y: shaftTop - 6, z, mat: M.red, seg: 12 });
  for (let i = 0; i < 4; i += 1) {
    const p = polar(i, 4, 1.35, Math.PI / 4);
    cyl(g, { rTop: 0.13, rBot: 0.13, h: shaftTop - 2 - y0 - 3.4, x: x + p.x, y: y0 + 3.4, z: z + p.z, mat: M.steel, seg: 6 });
  }
  for (let yy = 18; yy < shaftTop - 8; yy += 12) {
    cyl(g, { rTop: 1.5, rBot: 1.5, h: 0.6, x, y: yy, z, mat: M.red, seg: 12 });
  }
  cyl(g, { rTop: 2.0, rBot: 2.3, h: 1.6, x, y: shaftTop, z, mat: M.red, seg: 12 });
  cone(g, { r: 0.6, h: 1.2, x, y: shaftTop + 1.6, z, mat: M.steel, seg: 8 }); // top = 70.0
  const gy = y0 + 7.6;
  ring(g, { r: 3.2, tube: 0.5, x, y: gy, z, mat: M.red, seg: 32, tubeSeg: 8 });
  disc(g, { r: 3.9, rInner: 1.4, x, y: gy - 0.7, z, mat: M.steelDark, seg: 32 });
  for (let i = 0; i < 12; i += 1) {
    const p = polar(i, 12, 3.6);
    box(g, { w: 0.7, h: 1.2, d: 1.0, x: x + p.x, y: gy - 0.6, z: z + p.z, mat: M.blue, ry: -p.angle });
  }
}

/** 자이로스윙: steel A-frames, red axle, pendulum arm and a round blue gondola. */
function gyroSwing(g, { x, z }) {
  const y0 = ISLAND_TOP;
  const top = y0 + 20;
  [-4, 4].forEach((dx) => {
    strut(g, { from: [x + dx, y0, z - 5.5], to: [x + dx, top, z], r: 0.45, mat: M.steel });
    strut(g, { from: [x + dx, y0, z + 5.5], to: [x + dx, top, z], r: 0.45, mat: M.steel });
    box(g, { w: 2.2, h: 0.6, d: 2.2, x: x + dx, y: y0, z: z - 5.5, mat: M.concreteDark });
    box(g, { w: 2.2, h: 0.6, d: 2.2, x: x + dx, y: y0, z: z + 5.5, mat: M.concreteDark });
  });
  strut(g, { from: [x - 4.4, top, z], to: [x + 4.4, top, z], r: 0.55, mat: M.red });
  strut(g, { from: [x, top, z], to: [x, y0 + 6.2, z], r: 0.5, mat: M.steel });
  cyl(g, { rTop: 3.0, rBot: 2.4, h: 0.9, x, y: y0 + 5.3, z, mat: M.blue, seg: 20 });
  ring(g, { r: 3.2, tube: 0.28, x, y: y0 + 6.4, z, mat: M.steel, seg: 32, tubeSeg: 6 });
  for (let i = 0; i < 10; i += 1) {
    const p = polar(i, 10, 2.9);
    box(g, { w: 0.7, h: 1.1, d: 0.9, x: x + p.x, y: y0 + 6.2, z: z + p.z, mat: M.yellow, ry: -p.angle });
  }
}

/** 스페인해적선: swinging ship hanging from a steel A-frame (hull along x, axle along z). */
function pirateShip(g, { x, z }) {
  const y0 = ISLAND_TOP;
  const top = y0 + 12;
  [-4, 4].forEach((dz) => {
    strut(g, { from: [x - 5.5, y0, z + dz], to: [x, top, z + dz], r: 0.4, mat: M.steel });
    strut(g, { from: [x + 5.5, y0, z + dz], to: [x, top, z + dz], r: 0.4, mat: M.steel });
  });
  strut(g, { from: [x, top, z - 4.4], to: [x, top, z + 4.4], r: 0.45, mat: M.red });
  [-1.2, 1.2].forEach((dz) => {
    strut(g, { from: [x, top, z + dz], to: [x - 4.0, y0 + 3.8, z + dz], r: 0.22, mat: M.steel });
    strut(g, { from: [x, top, z + dz], to: [x + 4.0, y0 + 3.8, z + dz], r: 0.22, mat: M.steel });
  });
  box(g, { w: 9.4, h: 2.0, d: 3.2, x, y: y0 + 2.2, z, mat: M.hanokWood });
  box(g, { w: 9.6, h: 0.35, d: 3.4, x, y: y0 + 3.6, z, mat: M.gold });
  frustum(g, { wBot: 1.4, dBot: 3.0, wTop: 2.4, dTop: 3.3, h: 1.5, x: x - 4.6, y: y0 + 2.6, z, mat: M.hanokWood });
  frustum(g, { wBot: 1.4, dBot: 3.0, wTop: 2.4, dTop: 3.3, h: 1.5, x: x + 4.6, y: y0 + 2.6, z, mat: M.hanokWood });
  cyl(g, { rTop: 0.14, rBot: 0.14, h: 4.5, x, y: y0 + 4.0, z, mat: M.hanokWood, seg: 6 });
  box(g, { w: 1.4, h: 0.8, d: 0.08, x: x + 0.8, y: y0 + 7.6, z, mat: M.red });
  box(g, { w: 12, h: 1.0, d: 2.2, x, y: y0, z: z + 3.2, mat: M.concreteDark });
}

/** Carousel pavilion: round platform, columns, red conical roof with a scalloped yellow edge. */
function carousel(g, { x, z }) {
  const y0 = ISLAND_TOP;
  cyl(g, { rTop: 4.6, rBot: 4.8, h: 0.6, x, y: y0, z, mat: CREAM, seg: 24 });
  for (let i = 0; i < 10; i += 1) {
    const p = polar(i, 10, 4.1);
    cyl(g, { rTop: 0.14, rBot: 0.14, h: 3.6, x: x + p.x, y: y0 + 0.6, z: z + p.z, mat: M.white, seg: 6 });
  }
  cyl(g, { rTop: 1.2, rBot: 1.2, h: 3.6, x, y: y0 + 0.6, z, mat: M.gold, seg: 12 });
  for (let i = 0; i < 8; i += 1) {
    const p = polar(i, 8, 2.8, 0.2);
    box(g, { w: 0.5, h: 0.9, d: 1.1, x: x + p.x, y: y0 + 1.3, z: z + p.z, mat: M.white, ry: -p.angle });
  }
  cyl(g, { rTop: 5.2, rBot: 5.2, h: 0.5, x, y: y0 + 4.2, z, mat: M.red, seg: 24 });
  ring(g, { r: 5.0, tube: 0.16, x, y: y0 + 4.2, z, mat: M.yellow, seg: 32, tubeSeg: 6 });
  cone(g, { r: 5.3, h: 3.4, x, y: y0 + 4.7, z, mat: M.red, seg: 24 });
  finial(g, { x, y: y0 + 7.9, z, s: 1 });
}

/** Loop coaster (후렌치레볼루션 nod): red track through a vertical loop braced by an orange hoop. */
function loopCoaster(g, { cx, cz }) {
  const y0 = ISLAND_TOP;
  const ty = y0 + 2.4;
  const R = 5.2;
  const pts = [[cx - 6.5, ty, cz - 0.8], [cx - 4, ty, cz - 0.8], [cx - 1.5, ty, cz - 0.8]];
  const steps = 24;
  for (let i = 0; i <= steps; i += 1) {
    const phi = -Math.PI / 2 + (i / steps) * Math.PI * 2;
    pts.push([cx + R * Math.cos(phi), ty + R + R * Math.sin(phi), cz - 0.8 + 1.6 * (i / steps)]);
  }
  pts.push([cx + 1.5, ty, cz + 0.8], [cx + 4, ty, cz + 0.8], [cx + 6.5, ty, cz + 0.8]);
  trackTube(g, pts, { w: 1.3, t: 0.45, mat: TRACK_RED, right: [0, 0, 1] });
  ring(g, { r: R + 1.0, tube: 0.32, x: cx, y: ty + R, z: cz, mat: M.orange, rx: 0, seg: 40, tubeSeg: 8 });
  [-1, 1].forEach((s) => {
    strut(g, { from: [cx + s * (R + 1.0), y0, cz - 1.4], to: [cx + s * (R + 1.0), ty + R, cz], r: 0.28, mat: M.white });
    strut(g, { from: [cx + s * (R + 1.0), y0, cz + 1.4], to: [cx + s * (R + 1.0), ty + R, cz], r: 0.28, mat: M.white });
  });
  [-5.5, -3, 3, 5.5].forEach((dx) => {
    const pz = dx < 0 ? cz - 0.8 : cz + 0.8;
    strut(g, { from: [cx + dx, y0, pz], to: [cx + dx, ty - 0.2, pz], r: 0.2, mat: M.white });
  });
  // Station platform with a turquoise canopy at the west end.
  box(g, { w: 5, h: 0.5, d: 2.4, x: cx - 4.5, y: y0, z: cz - 3.0, mat: M.concreteDark });
  [[-6.5, -4.0], [-2.5, -4.0], [-6.5, -1.9], [-2.5, -1.9]].forEach(([dx, dz]) => {
    cyl(g, { rTop: 0.12, rBot: 0.12, h: 3.6, x: cx + dx, y: y0 + 0.5, z: cz + dz, mat: M.white, seg: 6 });
  });
  box(g, { w: 5.4, h: 0.3, d: 3.2, x: cx - 4.5, y: y0 + 4.1, z: cz - 2.6, mat: TURQ });
}

/** 아틀란티스: compact blue-track coaster winding around a rocky "sunken temple" mound. */
function atlantis(g) {
  const y0 = ISLAND_TOP;
  const path = [
    [12, 1.3, 3], [12, 2.1, 7], [12.5, 5.2, 11], [14, 8.7, 15], [17, 10.9, 18], [20.5, 10.2, 17.5], [23, 7.7, 14],
    [24.5, 5.2, 9.5], [24, 3.2, 5], [22, 2.1, 1.5], [19, 1.9, 0], [16, 2.7, 1], [14, 4.2, 3.5], [14.5, 6.2, 7],
    [17, 7.2, 9.5], [19.5, 5.7, 10.5], [20.5, 3.7, 8], [19, 2.0, 5.5], [16.5, 1.5, 5], [13.5, 1.3, 4],
  ].map(([x, h, z]) => [x, y0 + h, z]);
  trackTube(g, path, { w: 1.6, t: 0.5, mat: TRACK_BLUE });
  path.forEach((p, i) => {
    if (i % 2 === 1) {
      support(g, p);
    }
  });
  // Station canopy.
  [[-2.5, -1.8], [2.5, -1.8], [-2.5, 1.8], [2.5, 1.8]].forEach(([dx, dz]) => {
    cyl(g, { rTop: 0.15, rBot: 0.15, h: 4.5, x: 12.5 + dx, y: y0, z: 3.5 + dz, mat: M.white, seg: 6 });
  });
  box(g, { w: 6.2, h: 0.4, d: 4.8, x: 12.5, y: y0 + 4.5, z: 3.5, mat: M.blue });
  // Rock mound with a small marble temple, and the splash pool under the final dip.
  cyl(g, { rTop: 2.0, rBot: 3.6, h: 5.0, x: 18, y: y0, z: 13.5, mat: M.rock, seg: 10 });
  polygonPrism(g, { sides: 6, r: 1.5, h: 2.2, x: 18, y: y0 + 5.0, z: 13.5, mat: M.marble });
  cone(g, { r: 1.8, h: 1.2, x: 18, y: y0 + 7.2, z: 13.5, mat: M.copperGreen, seg: 6 });
  disc(g, { r: 3.0, rInner: 2.5, x: 18.5, y: y0 + 0.1, z: 5.0, mat: M.granite, seg: 24 });
  disc(g, { r: 2.5, x: 18.5, y: y0 + 0.08, z: 5.0, mat: M.water, seg: 24 });
}

/** 번지드롭: slim white lattice tower with a red head and an orange seat ring at the base. */
function bungeeDrop(g, { x, z }) {
  const y0 = ISLAND_TOP;
  const h = 33;
  cyl(g, { rTop: 2.6, rBot: 2.8, h: 1.0, x, y: y0, z, mat: M.steelDark, seg: 12 });
  cyl(g, { rTop: 0.75, rBot: 0.9, h, x, y: y0 + 1, z, mat: M.white, seg: 10 });
  for (let i = 0; i < 3; i += 1) {
    const p = polar(i, 3, 1.1);
    cyl(g, { rTop: 0.1, rBot: 0.1, h: h - 1, x: x + p.x, y: y0 + 1, z: z + p.z, mat: M.red, seg: 5 });
  }
  box(g, { w: 2.6, h: 2.0, d: 2.6, x, y: y0 + 1 + h, z, mat: M.red });
  ring(g, { r: 1.9, tube: 0.32, x, y: y0 + 3.4, z, mat: M.orange, seg: 24, tubeSeg: 6 });
  disc(g, { r: 2.2, rInner: 0.9, x, y: y0 + 2.9, z, mat: M.steelDark, seg: 24 });
}

// ── island, lake, bridge and shore ───────────────────────────────────────────

function island(g) {
  prism(g, { points: OUTLINE, h: 2.0, mat: M.graniteDark }); // quay wall
  prism(g, { points: scaleOutline(0.985), h: 0.3, y: 2.0, mat: M.granite }); // paved deck
  prism(g, { points: scaleOutline(0.975), holes: [scaleOutline(0.965)], h: 0.9, y: ISLAND_TOP, mat: M.white }); // railing
  // Ring path (kept 0.3 thick: thinner overlays z-fight with the deck at flight distances).
  prism(g, { points: scaleOutline(0.93), holes: [scaleOutline(0.84)], h: 0.3, y: ISLAND_TOP, mat: M.asphalt });

  // Raised planting beds.
  const lawns = [
    [[-16, -19], [-6, -20], [-6, -14], [-17, -13]],
    [[-4, -19.5], [8, -18], [12.5, -14], [13, -12], [-4, -13.5]],
    [[-32, 4], [-28, 2], [-20, 4], [-17, 12], [-22, 18], [-28, 15]],
    [[-16, 22.5], [-8, 24.5], [0, 24.6], [4, 22.5], [-2, 21.8], [-12, 21.6]],
    [[13, -12], [20, -12], [23, -7], [20, -4], [14, -6]],
    [[-34.6, 2], [-33.5, -4], [-32, -4.5], [-32, 4], [-33.5, 6]],
  ];
  lawns.forEach((points) => prism(g, { points, h: 0.35, y: ISLAND_TOP, mat: M.grass }));
  treePatch(g, { w: 8, d: 3, x: -11, z: -16.5, y: ISLAND_TOP, count: 3, seed: 3, h: 6.5, r: 2.2 });
  treePatch(g, { w: 10, d: 3, x: 3, z: -16.5, y: ISLAND_TOP, count: 4, seed: 5, h: 6.5, r: 2.2 });
  treePatch(g, { w: 2.5, d: 8, x: -30, z: 8, y: ISLAND_TOP, count: 3, seed: 11, h: 6, r: 2 });
  treePatch(g, { w: 8, d: 1.5, x: -6, z: 23, y: ISLAND_TOP, count: 4, seed: 17, h: 6, r: 2 });
  treePatch(g, { w: 1, d: 4, x: -33, z: 1, y: ISLAND_TOP, count: 2, seed: 29, h: 6, r: 2 });
  treePatch(g, { w: 1, d: 1, x: 21.5, z: -9.5, y: ISLAND_TOP, count: 1, seed: 31, h: 6, r: 2 });

  // Central plaza in front of the castle with a fountain.
  disc(g, { r: 6.5, x: 0, y: ISLAND_TOP + 0.32, z: 9, mat: M.limestone, seg: 32 });
  cyl(g, { rTop: 2.0, rBot: 2.1, h: 0.6, x: 0, y: ISLAND_TOP + 0.3, z: 9, mat: M.granite, seg: 20 });
  disc(g, { r: 1.8, x: 0, y: ISLAND_TOP + 0.92, z: 9, mat: M.water, seg: 20 });
  cyl(g, { rTop: 0.35, rBot: 0.55, h: 1.8, x: 0, y: ISLAND_TOP + 0.9, z: 9, mat: M.granite, seg: 10 });
  sphere(g, { r: 0.45, x: 0, y: ISLAND_TOP + 2.7, z: 9, mat: M.gold, seg: 10 });
}

function lake(g) {
  disc(g, { r: LAKE_R, y: 0.5, mat: M.water, seg: 96 });
}

/** Covered pedestrian bridge between two [x, z] points. */
function bridge(g, { from, to, y }) {
  const [ax, az] = from;
  const [bx, bz] = to;
  const len = Math.hypot(bx - ax, bz - az);
  const s = subgroup(g, { x: (ax + bx) / 2, y, z: (az + bz) / 2, ry: -Math.atan2(bz - az, bx - ax) });
  box(s, { w: len, h: 0.5, d: 3.4, mat: M.white });
  box(s, { w: len, h: 1.0, d: 0.15, y: 0.5, z: 1.6, mat: M.white });
  box(s, { w: len, h: 1.0, d: 0.15, y: 0.5, z: -1.6, mat: M.white });
  const posts = Math.max(2, Math.round(len / 2.6));
  for (let i = 0; i <= posts; i += 1) {
    const px = -len / 2 + (len / posts) * i;
    cyl(s, { rTop: 0.12, rBot: 0.12, h: 3.8, x: px, y: 0.5, z: 1.6, mat: M.white, seg: 6 });
    cyl(s, { rTop: 0.12, rBot: 0.12, h: 3.8, x: px, y: 0.5, z: -1.6, mat: M.white, seg: 6 });
  }
  box(s, { w: len + 0.4, h: 0.25, d: 3.9, y: 4.3, mat: M.glassWhite });
  // Piers in the water.
  for (let i = 1; i < posts; i += 1) {
    const px = -len / 2 + (len / posts) * i;
    cyl(s, { rTop: 0.5, rBot: 0.6, h: y, x: px, y: -y, z: 0, mat: M.concreteDark, seg: 8 });
  }
}

/** East shore: quay arc with a hint of the 어드벤처 glass vault and the Lotte Hotel World slab. */
function shore(g) {
  const th1 = deg(-60);
  const th2 = deg(30);
  const n = 14;
  const pts = [];
  for (let i = 0; i <= n; i += 1) {
    const th = th1 + (th2 - th1) * (i / n);
    pts.push([LAKE_R * Math.cos(th), LAKE_R * Math.sin(th)]);
  }
  for (let i = n; i >= 0; i -= 1) {
    const th = th1 + (th2 - th1) * (i / n);
    pts.push([SHORE_R * Math.cos(th), SHORE_R * Math.sin(th)]);
  }
  prism(g, { points: pts, h: 2.6, mat: M.granite });

  // Adventure: long low glass vault on a white base.
  const v = shorePoint(deg(-28), 37.5);
  box(g, { w: 18, h: 4.5, d: 6, x: v.x, y: 2.6, z: v.z, mat: M.white, ry: v.ry });
  box(g, { w: 18.2, h: 0.5, d: 6.2, x: v.x, y: 6.4, z: v.z, mat: M.steelDark, ry: v.ry });
  const vault = dome(g, { r: 9.4, x: v.x, y: 7.1, z: v.z, mat: M.glassWhite, seg: 28, scaleY: 0.8, sx: 1, sz: 0.34 });
  vault.rotation.y = v.ry;

  // Lotte Hotel World: cream slab with glass bands.
  const hw = shorePoint(deg(12), 38);
  box(g, { w: 12, h: 14, d: 4, x: hw.x, y: 2.6, z: hw.z, mat: M.offWhite, ry: hw.ry });
  for (let i = 1; i <= 4; i += 1) {
    box(g, { w: 12.2, h: 0.5, d: 4.2, x: hw.x, y: 2.6 + i * 2.8, z: hw.z, mat: M.glassBlue, ry: hw.ry });
  }
  box(g, { w: 11, h: 0.8, d: 3.4, x: hw.x, y: 16.6, z: hw.z, mat: M.steelDark, ry: hw.ry });

  // Lakeside promenade trees (석촌호수 cherry trees).
  treePatch(g, { w: 1.5, d: 7, x: 36.5, z: -2, y: 2.6, count: 3, seed: 23, h: 6, r: 2 });
}

export default {
  id: "lotte-world-magic-island",
  name: "롯데월드 매직아일랜드",
  nameEn: "Lotte World Magic Island",
  district: "송파구",
  lat: 37.5088,
  lon: 127.0996,
  height: 70,
  colliderRadius: 42,
  detail: "high",
  description: "석촌호수 위 매직캐슬과 어드벤처 유리 돔",
  create() {
    const g = new THREE.Group();

    lake(g);
    island(g);
    shore(g);
    bridge(g, { from: [23.8, -6.2], to: [35.2, -9.3], y: 2.35 });

    magicCastle(g);

    gyroDrop(g, { x: -27, z: -2 });
    loopCoaster(g, { cx: -23, cz: -10 });
    gyroSwing(g, { x: -22, z: 10 });
    pirateShip(g, { x: -9, z: 17 });
    carousel(g, { x: 7, z: 16 });
    atlantis(g);
    bungeeDrop(g, { x: 17, z: -9 });

    return g;
  },
};
