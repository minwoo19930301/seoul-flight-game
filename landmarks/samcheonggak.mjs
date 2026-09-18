// 삼청각 (Samcheonggak, 1972) - 성북구
// Traditional-style banquet compound (now a cultural venue) on the wooded southern slope of 북악산 by
// 삼청터널. 일화당, the big two-storey main hall, stands on a 3.5 m granite terrace reached by a broad
// stone stair; 청천당 and 취한당 sit on the lower side terraces, 천추당, the open pavilion 유하정 and
// 동백헌 on the upper terrace behind. Stone paths and stairs run between the granite retaining walls,
// a small pond and the entrance gate lie by the road to the south, and pines and maples close in on
// every side. The site plan is compressed to roughly 0.4 of the real grounds to fit the 34 m collider
// while the buildings keep realistic heights.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, cone, prism, disc, hipRoof, hanokHall, hanokWall, subgroup, tree } from "./_helpers.mjs";

const pineGreen = material(0x2f6b3a, { roughness: 1 });
const maple = material(0x6a9a3c, { roughness: 1 });
const paving = material(0xc4bdb0, { roughness: 0.95 });
const doorWood = material(0x4a2e1e, { roughness: 0.85 });

// Terrace levels (top surfaces)
const G = 0.3; // ground
const T1 = 2.0; // side terraces
const T2 = 3.5; // 일화당 terrace
const T3 = 6.0; // upper terrace behind the main hall

/** Regular polygon outline (for the ground disc and the pond hole). */
function ringPoints(cx, cz, r, n = 16) {
  const points = [];
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    points.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]);
  }
  return points;
}

/** Terrace: granite retaining-wall prism from the ground up to `top`, with a grass surface inset a little. */
function terrace(g, { points, top, base = 0, topMat = M.grass }) {
  prism(g, { points, h: top - base - 0.12, y: base, mat: M.granite });
  const cx = points.reduce((s, p) => s + p[0], 0) / points.length;
  const cz = points.reduce((s, p) => s + p[1], 0) / points.length;
  const inset = points.map(([x, z]) => [x + (cx - x) * 0.02, z + (cz - z) * 0.02]);
  prism(g, { points: inset, h: 0.12, y: top - 0.12, mat: topMat });
}

/** Single-storey hanok hall (or an open pavilion when `walls` is false): platform, columns, 단청 band, hip roof. */
function hall(g, { x, y = 0, z, w, d, ry = 0, platformH = 0.8, pad = 1.2, wallH = 3.1, roofH = 3.3, overhang = 2.1, walls = true }) {
  const s = subgroup(g, { x, y, z, ry });
  box(s, { w: w + pad * 2, h: platformH, d: d + pad * 2, mat: M.granite });
  if (walls) {
    box(s, { w: w - 1.2, h: wallH, d: d - 1.2, y: platformH, mat: M.hanokWall });
  } else {
    box(s, { w: w - 0.6, h: 0.4, d: d - 0.6, y: platformH, mat: M.hanokWood }); // raised wooden floor
    [-1, 1].forEach((k) => {
      box(s, { w: w - 0.6, h: 0.9, d: 0.12, y: platformH + 0.4, z: (k * (d - 0.7)) / 2, mat: M.hanokWood });
      box(s, { w: 0.12, h: 0.9, d: d - 0.6, x: (k * (w - 0.7)) / 2, y: platformH + 0.4, mat: M.hanokWood });
    });
  }
  const nx = Math.max(2, Math.round(w / 3.4));
  const nz = Math.max(2, Math.round(d / 3.4));
  for (let i = 0; i <= nx; i += 1) {
    const px = -w / 2 + (w / nx) * i;
    cyl(s, { rTop: 0.3, h: wallH, x: px, y: platformH, z: d / 2, mat: M.hanokWood, seg: 8 });
    cyl(s, { rTop: 0.3, h: wallH, x: px, y: platformH, z: -d / 2, mat: M.hanokWood, seg: 8 });
  }
  for (let i = 1; i < nz; i += 1) {
    const pz = -d / 2 + (d / nz) * i;
    cyl(s, { rTop: 0.3, h: wallH, x: w / 2, y: platformH, z: pz, mat: M.hanokWood, seg: 8 });
    cyl(s, { rTop: 0.3, h: wallH, x: -w / 2, y: platformH, z: pz, mat: M.hanokWood, seg: 8 });
  }
  box(s, { w: w + 1.2, h: 0.9, d: d + 1.2, y: platformH + wallH, mat: M.dancheong });
  hipRoof(s, { w, d, h: roofH, y: platformH + wallH + 0.9, overhang });
  return y + platformH + wallH + 0.9 + roofH;
}

/** Granite steps descending from `top` at (x, z) to `base`, running in direction (dx, dz). */
function stairs(g, { x, z, w, top, base, dx = 0, dz = 1, rise = 0.4, run = 0.75 }) {
  const n = Math.max(2, Math.round((top - base) / rise));
  const step = (top - base) / n;
  const s = subgroup(g, { x, z, ry: Math.atan2(dx, dz) });
  for (let i = 0; i < n - 1; i += 1) {
    box(s, { w, h: top - (i + 1) * step - base, d: run, y: base, z: run / 2 + i * run, mat: M.granite });
  }
}

/** Entrance gate: four red posts, closed wooden doors, 단청 band and a small tiled hip roof. */
function gate(g, { x, z, w = 5, d = 2.4, h = 3.6 }) {
  const s = subgroup(g, { x, z });
  box(s, { w: w + 1.6, h: 0.3, d: d + 1.2, mat: M.granite });
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    cyl(s, { rTop: 0.28, h, x: (sx * w) / 2, y: 0.3, z: (sz * d) / 2, mat: M.hanokWood, seg: 8 });
  });
  box(s, { w: w * 0.9, h: h * 0.85, d: 0.16, y: 0.3, mat: doorWood });
  box(s, { w: w + 0.8, h: 0.7, d: d + 0.8, y: 0.3 + h, mat: M.dancheong });
  hipRoof(s, { w, d, h: 1.8, y: 1 + h, overhang: 1.4, ridge: 0.6 });
}

/** Cheap conifer: trunk + two stacked cones (≈ 45 triangles). */
function pine(g, { x, y = 0, z, h = 8 }) {
  cyl(g, { rTop: 0.2, rBot: 0.32, h: h * 0.45, x, y, z, mat: M.trunk, seg: 5 });
  cone(g, { r: h * 0.23, h: h * 0.42, x, y: y + h * 0.33, z, mat: pineGreen, seg: 6 });
  cone(g, { r: h * 0.15, h: h * 0.38, x, y: y + h * 0.62, z, mat: pineGreen, seg: 6 });
}

/** Stone lantern (석등). */
function lantern(g, { x, y, z }) {
  box(g, { w: 0.9, h: 0.25, d: 0.9, x, y, z, mat: M.graniteDark });
  cyl(g, { rTop: 0.14, rBot: 0.18, h: 1.1, x, y: y + 0.25, z, mat: M.graniteDark, seg: 6 });
  box(g, { w: 0.6, h: 0.55, d: 0.6, x, y: y + 1.35, z, mat: M.granite });
  cone(g, { r: 0.7, h: 0.4, x, y: y + 1.9, z, mat: M.graniteDark, seg: 4, ry: Math.PI / 4 });
}

export default {
  id: "samcheonggak",
  name: "삼청각",
  nameEn: "Samcheonggak",
  district: "성북구",
  lat: 37.5973,
  lon: 126.9842,
  height: 20,
  colliderRadius: 34,
  detail: "low",
  description: "북악 산자락 전통 한옥 문화공간 일화당",
  create() {
    const g = new THREE.Group();

    // ── Ground (grass disc with the pond cut out) and the stepped terraces ───────────────
    const POND = { x: -14, z: 19, r: 4.5 };
    prism(g, { points: ringPoints(0, 0, 33), holes: [ringPoints(POND.x, POND.z, POND.r + 0.1)], h: G, mat: M.grass });
    terrace(g, { points: [[-30, 12], [-17, 12], [-17, -14], [-28, -14]], top: T1 }); // west terrace
    terrace(g, { points: [[17, 10], [29, 8], [27, -14], [17, -14]], top: T1 }); // east terrace
    terrace(g, { points: [[-17, 3], [17, 3], [19, -6], [17, -20], [-17, -20], [-19, -6]], top: T2, topMat: M.sand }); // 일화당 courtyard (gravel)
    terrace(g, { points: [[-25, -18], [25, -18], [16, -28], [-16, -28]], top: T3 }); // upper terrace

    // ── Pond with a stone rim and a pine islet ──────────────────────────────────────────
    cyl(g, { rTop: POND.r, h: 0.5, x: POND.x, y: -0.28, z: POND.z, mat: M.water, seg: 16 });
    disc(g, { r: POND.r + 0.9, rInner: POND.r - 0.2, x: POND.x, y: G + 0.03, z: POND.z, mat: M.graniteDark, seg: 16 });
    cyl(g, { rTop: 1.1, rBot: 1.4, h: 0.7, x: POND.x - 1.4, y: -0.1, z: POND.z + 1.2, mat: M.grassDark, seg: 8 });
    pine(g, { x: POND.x - 1.4, y: 0.6, z: POND.z + 1.2, h: 4.5 });

    // ── Entrance: gate, flanking walls and the paved way up to the grand stair ─────────
    gate(g, { x: 4, z: 27 });
    hanokWall(g, { length: 9, x: -5.5, y: G, z: 27, h: 2.2 });
    hanokWall(g, { length: 10, x: 13.5, y: G, z: 27, h: 2.2 });
    box(g, { w: 4.2, h: 0.08, d: 17, x: 2, y: G, z: 17.8, mat: paving });
    stairs(g, { x: 0, z: 3, w: 8, top: T2, base: G, dz: 1, rise: 0.4, run: 0.8 }); // grand stair to 일화당
    [-1, 1].forEach((s) => box(g, { w: 0.6, h: 0.9, d: 6.6, x: s * 4.3, y: G, z: 6.5, mat: M.granite })); // stair cheek walls
    stairs(g, { x: -23, z: 12, w: 3, top: T1, base: G, dz: 1 });
    stairs(g, { x: 23, z: 8.9, w: 3, top: T1, base: G, dz: 1 });
    stairs(g, { x: -18.9, z: -10, w: 3, top: T2, base: T1, dx: -1, dz: 0.3 });
    stairs(g, { x: 18.9, z: -10, w: 3, top: T2, base: T1, dx: 1, dz: 0.3 });
    stairs(g, { x: -18, z: -18, w: 3, top: T3, base: T2, dz: 1 });
    stairs(g, { x: 18, z: -18, w: 3, top: T3, base: T2, dz: 1 });
    // Stone paths on the terraces
    box(g, { w: 3, h: 0.06, d: 10, x: -23, y: T1, z: 6, mat: paving });
    box(g, { w: 3, h: 0.06, d: 10, x: 23, y: T1, z: 3, mat: paving });
    box(g, { w: 6, h: 0.06, d: 4, x: 0, y: T2, z: 1.5, mat: paving });
    box(g, { w: 34, h: 0.06, d: 2.4, x: 0, y: T2, z: -18.4, mat: paving });
    box(g, { w: 26, h: 0.06, d: 2.4, x: 0, y: T3, z: -19.5, mat: paving });
    // Low traditional walls along the front edge of the 일화당 terrace
    hanokWall(g, { length: 12.5, x: -10.5, y: T2, z: 2.6, h: 1.6 });
    hanokWall(g, { length: 12.5, x: 10.5, y: T2, z: 2.6, h: 1.6 });

    // ── 일화당: the two-storey main hall, facing south over the stair ─────────────────
    hanokHall(g, {
      w: 24, d: 14, y: T2, z: -7,
      stories: 2, platformH: 1.2, wallH: 3.6, roofH: 4.2, overhang: 2.8, upperScale: 0.82,
    });
    [-1, 1].forEach((s) => lantern(g, { x: s * 6, y: T2, z: 3.8 }));

    // ── The smaller halls and the open pavilion on their own terraces ──────────────────
    hall(g, { x: -23.5, y: T1, z: -2, w: 10, d: 7 }); // 청천당 (west)
    hall(g, { x: 22.5, y: T1, z: -3, w: 9, d: 6.5 }); // 취한당 (east)
    hall(g, { x: 22.8, y: T1, z: -11.5, w: 6.5, d: 4.8, wallH: 2.9, roofH: 2.9, overhang: 1.8 }); // 동백헌
    hall(g, { x: -11.5, y: T3, z: -22.5, w: 8, d: 5.5 }); // 천추당 (upper west)
    hall(g, { x: 11, y: T3, z: -23.5, w: 6, d: 6, wallH: 2.9, roofH: 3.2, overhang: 2, walls: false }); // 유하정 (open pavilion)

    // ── Pines round the perimeter and on the upper slope, maples between the halls ─────
    for (let i = 0; i < 26; i += 1) {
      const a = ((140 + i * 10.4) * Math.PI) / 180; // west → north → east, leaving the entrance side open
      const r = 28.6 + (i % 3) * 0.8;
      pine(g, { x: Math.cos(a) * r, y: G, z: Math.sin(a) * r, h: 9 + (i % 4) * 1.1 });
    }
    [[-8, -26.5, 9], [0, -26, 10], [4, -27, 8.5], [-20, -21, 9], [21, -21.5, 9], [-4, -22.5, 8], [18, -25, 8.5], [-24, -20, 8]]
      .forEach(([x, z, h]) => pine(g, { x, y: T3, z, h }));
    [[-27, 7, 8.5], [-24, -9, 7.5], [26, 3, 8], [-14, 9, 7]].forEach(([x, z, h]) => pine(g, { x, y: T1, z, h }));
    [[-24, 17, 7], [-20, 22, 6.5], [-28, 12, 6], [20, 22, 7], [26, 15, 6.5], [13, 25, 6], [-7, 22, 6], [-3, 12, 5.5], [10, 12, 5.5], [9, 21, 6]]
      .forEach(([x, z, h]) => tree(g, { x, y: G, z, h, r: h * 0.36, mat: maple }));
    [[-15, -1, 6], [15, -0.5, 6], [-16.5, -15, 5.5], [16, -15.5, 5.5]].forEach(([x, z, h]) => tree(g, { x, y: T2, z, h, r: h * 0.34, mat: maple }));
    [[-25, -14.5, 5.5], [24, -16, 5.5], [-1.5, -26, 6]].forEach(([x, z, h]) => tree(g, { x, y: T3 - 0.6, z, h, r: h * 0.34, mat: M.foliage }));

    return g;
  },
};
