// 도봉산 자운봉 (Dobongsan Jaunbong Peak cluster) - 도봉구
// Granite 삼봉 of 도봉산: 자운봉 (highest, stacked blocks), 만장봉 (sharp comb ridge), 선인봉
// (broad climbing wall). Shared rock saddle, pines on the lower slopes, a tiny peak shrine on
// 자운봉. Real peaks are hundreds of metres apart and 708–740 m ASL; the cluster is compressed
// into r = 70 while 자운봉 keeps a 90 m rise above the model ground.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, cone, frustum, hipRoof, tree } from "./_helpers.mjs";

const pine = material(0x2f6b3a, { roughness: 1 });
const rockA = M.rock;
const rockB = M.rockLight;
const rockC = M.granite;
const rockD = M.graniteDark;

/** Cheap pine. */
function pineTree(g, { x, y = 0, z, h = 8 }) {
  cyl(g, { rTop: 0.2, rBot: 0.34, h: h * 0.4, x, y, z, mat: M.trunk, seg: 5 });
  cone(g, { r: h * 0.24, h: h * 0.42, x, y: y + h * 0.3, z, mat: pine, seg: 6 });
  cone(g, { r: h * 0.15, h: h * 0.36, x, y: y + h * 0.58, z, mat: pine, seg: 6 });
}

/** Faceted granite block sitting on `y`. */
function block(g, { x, y, z, w, h, d, ry = 0, rz = 0, mat = rockA }) {
  box(g, { w, h, d, x, y, z, mat, ry, rz });
}

export default {
  id: "dobongsan-jaunbong",
  name: "도봉산 자운봉",
  nameEn: "Dobongsan Jaunbong Peak",
  district: "도봉구",
  lat: 37.6993,
  lon: 127.0145,
  height: 90,
  colliderRadius: 70,
  detail: "medium",
  description: "화강암 암봉 군(자운봉·만장봉·선인봉)",
  create() {
    const g = new THREE.Group();

    // ── Shared ridge / forested skirts ──
    frustum(g, { wBot: 82, dBot: 96, wTop: 58, dTop: 74, h: 14, z: 0, mat: M.grassDark });
    frustum(g, { wBot: 54, dBot: 78, wTop: 30, dTop: 58, h: 16, y: 12, z: -2, mat: rockA });
    frustum(g, { wBot: 24, dBot: 54, wTop: 14, dTop: 40, h: 10, y: 26, z: -4, mat: rockB });

    // ── 자운봉 (north, stacked granite blocks) — top ≈ 90 ──
    const jx = -2;
    const jz = -18;
    frustum(g, { wBot: 22, dBot: 20, wTop: 14, dTop: 13, h: 22, x: jx, y: 30, z: jz, mat: rockC });
    block(g, { x: jx - 1, y: 52, z: jz + 1, w: 12, h: 9, d: 11, ry: 0.12, mat: rockA });
    block(g, { x: jx + 2, y: 60, z: jz - 1, w: 10, h: 8, d: 9, ry: -0.08, mat: rockB });
    block(g, { x: jx - 0.5, y: 67, z: jz, w: 8.5, h: 7.5, d: 7.5, ry: 0.18, mat: rockC });
    block(g, { x: jx + 1, y: 73.5, z: jz + 0.6, w: 6.8, h: 6.2, d: 6.4, ry: -0.1, mat: rockD });
    block(g, { x: jx, y: 79, z: jz, w: 5.2, h: 5.4, d: 5.0, ry: 0.15, mat: rockB });
    block(g, { x: jx + 0.4, y: 83.8, z: jz - 0.3, w: 3.6, h: 3.8, d: 3.4, ry: 0.05, mat: rockC });
    // summit cairn / tiny shrine
    box(g, { w: 1.8, h: 0.35, d: 1.6, x: jx, y: 87.4, z: jz, mat: M.graniteDark });
    [[-0.45, -0.4], [0.45, -0.4], [-0.45, 0.4], [0.45, 0.4]].forEach(([dx, dz]) => {
      cyl(g, { rTop: 0.08, h: 1.15, x: jx + dx, y: 87.75, z: jz + dz, mat: M.hanokWood, seg: 5 });
    });
    hipRoof(g, { w: 1.5, d: 1.3, h: 0.7, x: jx, y: 88.9, z: jz, overhang: 0.35, ridge: 0.3, ridgeMat: false });
    // extra stacked flakes on the flanks
    block(g, { x: jx - 7, y: 44, z: jz + 3, w: 6, h: 5, d: 5, ry: 0.4, mat: rockD });
    block(g, { x: jx + 8, y: 48, z: jz - 4, w: 5.5, h: 6, d: 4.5, ry: -0.3, mat: rockA });

    // ── 만장봉 (centre-south-east, sharp comb) ──
    const mx = 14;
    const mz = 8;
    frustum(g, { wBot: 10, dBot: 22, wTop: 4.5, dTop: 14, h: 28, x: mx, y: 24, z: mz, mat: rockA });
    [[-2.2, 0.9, 18], [0, 1.1, 22], [2.0, 0.85, 16], [-0.8, 0.7, 12]].forEach(([dx, s, h], i) => {
      frustum(g, {
        wBot: 2.4 * s, dBot: 5.5 * s, wTop: 0.9 * s, dTop: 2.2 * s,
        h, x: mx + dx, y: 48 + i * 1.2, z: mz + dx * 0.4,
        mat: i % 2 ? rockB : rockC,
      });
    });
    // comb teeth
    [-3, -1, 1, 3].forEach((dx, i) => {
      box(g, {
        w: 1.3, h: 8 + i * 0.8, d: 3.2,
        x: mx + dx, y: 68, z: mz + 1,
        mat: i % 2 ? rockD : rockB, ry: dx * 0.08,
      });
    });

    // ── 선인봉 (south, broad vertical climbing wall) ──
    const sx = -8;
    const sz = 28;
    frustum(g, { wBot: 28, dBot: 16, wTop: 22, dTop: 9, h: 34, x: sx, y: 16, z: sz, shiftZ: -2.2, mat: rockC });
    frustum(g, { wBot: 20, dBot: 10, wTop: 14, dTop: 6, h: 18, x: sx + 1, y: 48, z: sz - 2, shiftZ: -1.4, mat: rockA });
    // face facets (east wall — 암벽등반)
    [[-10, 22, 14], [-4, 28, 18], [3, 24, 16], [9, 30, 12], [-7, 40, 10], [5, 42, 11], [-2, 52, 8]].forEach(([dx, y, h], i) => {
      box(g, {
        w: 7 + (i % 3), h, d: 3.2,
        x: sx + dx, y, z: sz + 5.2,
        mat: i % 3 === 0 ? rockB : i % 3 === 1 ? rockD : rockA,
        ry: (i - 3) * 0.04,
      });
    });
    // summit blocks
    block(g, { x: sx, y: 66, z: sz - 1, w: 10, h: 5, d: 6, ry: 0.1, mat: rockB });
    block(g, { x: sx + 2, y: 70.5, z: sz - 2, w: 6, h: 4.2, d: 4.5, ry: -0.15, mat: rockC });

    // ── Saddle boulders between the three peaks ──
    [[6, 36, -6, 5, 4, 4], [-10, 32, -4, 6, 3.5, 5], [8, 40, 18, 4, 3, 3.5],
      [-16, 28, 16, 5, 4, 4], [18, 30, -8, 4.5, 3.2, 4], [0, 34, 20, 5, 3, 4]]
      .forEach(([x, y, z, w, h, d], i) => {
        block(g, { x, y, z, w, h, d, ry: i * 0.4, mat: i % 2 ? rockD : rockB });
      });

    // ── Pines on the lower skirts (kept well below the 90 m summit) ──
    const pines = [
      [-24, 14, 26, 8], [20, 14, 22, 8], [-28, 14, 6, 9], [26, 14, 0, 8],
      [-22, 14, -22, 8], [18, 14, -26, 8], [0, 14, 42, 7], [-30, 14, -8, 8],
      [26, 14, 12, 7], [-16, 14, 36, 7], [14, 14, 38, 7], [-28, 14, 16, 7],
      [6, 24, -30, 6], [-14, 24, -28, 6], [22, 16, -14, 6],
    ];
    pines.forEach(([x, y, z, h]) => pineTree(g, { x, y, z, h }));
    [[-16, 14, 32], [16, 14, 34], [-24, 14, -16]].forEach(([x, y, z]) => {
      tree(g, { x, y, z, h: 6.5, r: 2.0, mat: M.foliage });
    });

    return g;
  },
};
