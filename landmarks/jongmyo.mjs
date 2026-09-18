// 종묘 (Jongmyo Shrine, 1394 / rebuilt 1608) - 종로구, UNESCO
// Confucian royal ancestral shrine. The signature is 정전: one extremely long single-roof hall
// (real 19 bays × 3, ~101–109 m) on a two-tier stone 월대, dark 맞배-like tiled roof, open front
// 퇴칸 and a brick-closed back wall. 동·서월랑 fold south into a ㄷ court. Compressed to fit
// colliderRadius 48; the hall stays as long as the radius allows. Heights are real.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, hipRoof, hanokWall, tree, subgroup } from "./_helpers.mjs";

const earth = material(0xa89670, { roughness: 1 });
const paving = material(0xcac4b9, { roughness: 0.95 });
const brickBack = material(0x6a3a2e, { roughness: 0.92 });
const doorWood = material(0x3d2418, { roughness: 0.85 });
const pine = material(0x2f6b3a, { roughness: 1 });

/** Long shrine hall: stone 기단, open front colonnade, chamber doors, brick back, single hip roof. */
function shrineHall(g, { x, z, w, d, wallH = 5.2, roofH = 9.2, bays = 19, ry = 0 }) {
  const s = subgroup(g, { x, z, ry });
  const base = 0.55;
  box(s, { w: w + 1.6, h: base, d: d + 1.4, mat: M.granite });
  box(s, { w: w - 1.2, h: wallH, d: d - 1.6, y: base, mat: M.hanokWall });
  box(s, { w: w - 0.4, h: wallH, d: 0.7, y: base, z: -d / 2 + 0.15, mat: brickBack });
  const nx = bays;
  for (let i = 0; i <= nx; i += 1) {
    const px = -w / 2 + (w / nx) * i;
    cyl(s, { rTop: 0.32, h: wallH, x: px, y: base, z: d / 2, mat: M.hanokWood, seg: 6 });
    cyl(s, { rTop: 0.28, h: wallH, x: px, y: base, z: -d / 2, mat: M.hanokWood, seg: 6 });
    if (i < nx) {
      const dx = -w / 2 + (w / nx) * (i + 0.5);
      box(s, { w: (w / nx) * 0.72, h: wallH * 0.82, d: 0.18, x: dx, y: base, z: 0.15, mat: doorWood });
    }
  }
  box(s, { w: w + 1.1, h: 1, d: d + 1.1, y: base + wallH, mat: M.dancheong });
  hipRoof(s, { w, d, h: roofH, y: base + wallH + 1, overhang: 2.2, ridge: 0.9, curve: 0.08, mat: M.roofTile });
  return base + wallH + 1 + roofH;
}

export default {
  id: "jongmyo",
  name: "종묘",
  nameEn: "Jongmyo Shrine",
  district: "종로구",
  lat: 37.5748,
  lon: 126.9941,
  height: 18,
  colliderRadius: 48,
  detail: "low",
  description: "101m 길이 단일 지붕의 정전과 월대",
  create() {
    const g = new THREE.Group();
    const G = 0.1;

    cyl(g, { rTop: 46.5, h: 0.35, y: -0.25, mat: earth, seg: 20 });
    box(g, { w: 72, h: 0.12, d: 32, x: 0, y: G, z: 4, mat: paving });

    // 하월대 (lower court) and 상월대 under 정전, with the central 신도
    box(g, { w: 68, h: 0.65, d: 20, z: 8, mat: M.granite });
    box(g, { w: 74, h: 1.35, d: 11, z: -6.2, mat: M.granite });
    box(g, { w: 74.4, h: 0.22, d: 11.4, y: 1.2, z: -6.2, mat: M.graniteDark });
    box(g, { w: 3.2, h: 0.2, d: 28, y: 0.65, z: 6, mat: M.graniteDark });
    for (let i = 0; i < 4; i += 1) {
      box(g, { w: 5.2, h: 1.35 - i * 0.28, d: 0.7, z: -0.4 + i * 0.7, mat: M.granite });
    }

    // 정전 — the long single roof is the whole point
    shrineHall(g, { x: 0, z: -15.6, w: 70, d: 10.2, wallH: 5.3, roofH: 9.4, bays: 19 });

    // 동·서월랑 folding south into a ㄷ
    [-1, 1].forEach((s) => {
      shrineHall(g, { x: s * 33.4, z: 0.4, w: 18, d: 5.2, wallH: 3.6, roofH: 4.2, bays: 5, ry: Math.PI / 2 });
    });

    // South wall with the unused central 신문 and the side gates
    hanokWall(g, { length: 22, x: -24, z: 22.4, h: 3.2, mat: M.granite });
    hanokWall(g, { length: 22, x: 24, z: 22.4, h: 3.2, mat: M.granite });
    [-1, 0, 1].forEach((s) => {
      box(g, { w: 4.6, h: 3.1, d: 2.4, x: s * 8.5, z: 22.4, mat: M.granite });
      box(g, { w: 2.2, h: 2.4, d: 0.8, x: s * 8.5, y: 0.2, z: 22.4, mat: M.black });
      box(g, { w: 5, h: 0.7, d: 2.8, x: s * 8.5, y: 3.1, z: 22.4, mat: M.dancheong });
      hipRoof(g, { w: 4.6, d: 2.4, h: 1.8, x: s * 8.5, y: 3.8, z: 22.4, overhang: 0.8, ridge: 0.7, curve: 0.1 });
    });
    hanokWall(g, { length: 36, x: -38.2, z: 4, ry: Math.PI / 2, h: 3.2, mat: M.granite });
    hanokWall(g, { length: 36, x: 38.2, z: 4, ry: Math.PI / 2, h: 3.2, mat: M.granite });
    hanokWall(g, { length: 28, x: -22, z: -24.6, h: 3, mat: M.granite });
    hanokWall(g, { length: 28, x: 22, z: -24.6, h: 3, mat: M.granite });

    [
      [-32, -22, 7], [-20, -23.5, 6.5], [20, -23.5, 6.5], [32, -22, 7],
      [-36, 14, 6], [36, 14, 6], [-30, 20, 5.5], [30, 20, 5.5],
    ].forEach(([x, z, h]) => tree(g, { x, z, h, r: h * 0.32, mat: pine }));

    return g;
  },
};
