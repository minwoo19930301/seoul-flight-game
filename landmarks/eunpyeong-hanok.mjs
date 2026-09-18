// 은평한옥마을 (Eunpyeong Hanok Village, 2010s) - 은평구
// New-build hanok neighbourhood on the southern skirt of 북한산: dark tiled roofs in rows, ㄱ·ㄷ·ㅡ
// courtyards, stone-walled alleys climbing gently north. A small community hall sits on the south
// plaza; pines close the mountain edge. The real village is compressed to fit r = 60; house heights
// stay realistic (1-storey ≈ 8 m, a few 2-storey roofs at 12 m).
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, cone, hipRoof, slab, subgroup, tree } from "./_helpers.mjs";

const earth = material(0xc4b89a, { roughness: 1 });
const pine = material(0x2f6b3a, { roughness: 1 });
const plaster = material(0xf2ead8, { roughness: 0.92 });
const wood = M.hanokWood;

/** Compact new-build hanok: granite plinth, cream plaster, wood band, tiled hip roof. */
function house(g, { x, z, w, d, ry = 0, stories = 1, wallH = 3.0, roofH = 3.2, overhang = 1.2 }) {
  const s = subgroup(g, { x, z, ry });
  const plat = 0.32;
  box(s, { w: w + 1.0, h: plat, d: d + 1.0, mat: M.granite });
  let y = plat;
  for (let i = 0; i < stories; i += 1) {
    const h = i === 0 ? wallH : wallH * 0.82;
    box(s, { w: w - 0.35, h, d: d - 0.35, y, mat: plaster });
    box(s, { w: w + 0.15, h: 0.22, d: d + 0.15, y: y + h - 0.22, mat: wood });
    // lattice door on the long face
    box(s, { w: Math.min(2.2, w * 0.35), h: h * 0.7, d: 0.12, y: y + 0.15, z: d / 2 - 0.12, mat: wood });
    y += h;
  }
  box(s, { w: w + 0.5, h: 0.5, d: d + 0.5, y, mat: M.dancheong });
  hipRoof(s, { w, d, h: roofH, y: y + 0.5, overhang, ridge: 0.42, curve: 0.12 });
}

/** ㄱ-plan: two halls sharing a corner courtyard. */
function ell(g, { x, z, ry = 0, stories = 1 }) {
  const s = subgroup(g, { x, z, ry });
  house(s, { x: 0, z: 0, w: 8.2, d: 4.6, stories, roofH: stories > 1 ? 3.8 : 3.0 });
  house(s, { x: -2.6, z: 4.4, w: 4.4, d: 5.6, stories: 1, wallH: 2.8, roofH: 2.8, overhang: 1.0 });
}

/** Cheap pine: trunk + two cones. */
function pineTree(g, { x, y = 0, z, h = 8 }) {
  cyl(g, { rTop: 0.18, rBot: 0.3, h: h * 0.42, x, y, z, mat: M.trunk, seg: 5 });
  cone(g, { r: h * 0.22, h: h * 0.4, x, y: y + h * 0.32, z, mat: pine, seg: 6 });
  cone(g, { r: h * 0.14, h: h * 0.36, x, y: y + h * 0.6, z, mat: pine, seg: 6 });
}

/** Low stone-and-tile alley wall along x. */
function alleyWall(g, { x, z, length, ry = 0 }) {
  const s = subgroup(g, { x, z, ry });
  box(s, { w: length, h: 0.45, d: 0.55, mat: M.graniteDark });
  box(s, { w: length, h: 1.15, d: 0.4, y: 0.45, mat: plaster });
  box(s, { w: length + 0.2, h: 0.22, d: 0.7, y: 1.6, mat: M.roofTile });
}

export default {
  id: "eunpyeong-hanok",
  name: "은평한옥마을",
  nameEn: "Eunpyeong Hanok Village",
  district: "은평구",
  lat: 37.6403,
  lon: 126.9391,
  height: 12,
  colliderRadius: 60,
  detail: "medium",
  description: "북한산 아래 신축 한옥 마을",
  create() {
    const g = new THREE.Group();

    // ── Ground: grass bowl, packed-earth alleys climbing north toward 북한산 ──
    cyl(g, { rTop: 58.5, h: 0.25, y: -0.25, mat: M.grass, seg: 20 });
    slab(g, { w: 10, d: 96, x: 0, z: 2, h: 0.12, mat: earth }); // main N–S alley
    [-36, -18, 0, 18, 36].forEach((z) => {
      slab(g, { w: 88, d: 4.2, z, h: 0.1, mat: earth });
    });
    slab(g, { w: 22, d: 16, z: 46, h: 0.12, mat: M.granite }); // south community plaza

    // ── South plaza: community hall (2-storey, the 12 m roof) and a small open pavilion ──
    house(g, { x: 0, z: 46, w: 11, d: 7.2, stories: 2, wallH: 3.15, roofH: 4.15, overhang: 1.6 });
    const pav = subgroup(g, { x: 12, z: 47 });
    box(pav, { w: 5.6, h: 0.35, d: 5.6, mat: M.granite });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      cyl(pav, { rTop: 0.2, h: 2.8, x: sx * 1.8, y: 0.35, z: sz * 1.8, mat: wood, seg: 6 });
    });
    box(pav, { w: 5.2, h: 0.45, d: 5.2, y: 3.15, mat: M.dancheong });
    hipRoof(pav, { w: 4.4, d: 4.4, h: 2.0, y: 3.6, overhang: 1.1, ridge: 0.2 });

    // ── House rows (ㅡ, ㄱ, ㄷ) along the E–W alleys; a few 2-storey roofs ──
    // Row z ≈ 36 (south residential)
    house(g, { x: -32, z: 34, w: 8.5, d: 5.2 });
    ell(g, { x: -16, z: 33 });
    house(g, { x: 16, z: 34, w: 7.8, d: 5.0 });
    house(g, { x: 32, z: 34.5, w: 8.0, d: 5.4, ry: 0.08 });
    // ㄷ courtyard at x=0
    house(g, { x: 0, z: 32.2, w: 9.0, d: 4.4 });
    house(g, { x: -4.2, z: 36.6, w: 4.2, d: 5.0 });
    house(g, { x: 4.2, z: 36.6, w: 4.2, d: 5.0 });

    // Row z ≈ 18
    house(g, { x: -34, z: 16, w: 7.6, d: 4.8, ry: -0.05 });
    house(g, { x: -20, z: 17, w: 8.4, d: 5.2, stories: 2, wallH: 2.9, roofH: 3.6 });
    ell(g, { x: -4, z: 15, ry: 0.1 });
    house(g, { x: 14, z: 16.5, w: 7.4, d: 4.6 });
    ell(g, { x: 30, z: 15.5, ry: -0.12 });

    // Row z ≈ 0 (village centre)
    house(g, { x: -38, z: -1, w: 7.2, d: 4.6 });
    house(g, { x: -24, z: 0.5, w: 8.0, d: 5.0 });
    house(g, { x: -10, z: -0.4, w: 7.6, d: 4.8, stories: 2, wallH: 2.85, roofH: 3.5 });
    house(g, { x: 8, z: 0, w: 8.6, d: 5.2 });
    house(g, { x: 22, z: -0.6, w: 7.4, d: 4.6 });
    house(g, { x: 36, z: 0.8, w: 7.8, d: 5.0, ry: 0.06 });

    // Row z ≈ -18
    ell(g, { x: -30, z: -19, ry: 0.15 });
    house(g, { x: -14, z: -18, w: 8.2, d: 5.0 });
    house(g, { x: 2, z: -17.5, w: 7.6, d: 4.8 });
    house(g, { x: 16, z: -18.4, w: 8.0, d: 5.2, stories: 2, wallH: 2.8, roofH: 3.55 });
    house(g, { x: 32, z: -17.8, w: 7.4, d: 4.6 });

    // Row z ≈ -34 (closest to 북한산)
    house(g, { x: -28, z: -34, w: 7.8, d: 4.8, ry: -0.08 });
    house(g, { x: -12, z: -35, w: 8.4, d: 5.0 });
    house(g, { x: 4, z: -34.2, w: 7.2, d: 4.6 });
    ell(g, { x: 20, z: -35.5, ry: 0.2 });
    house(g, { x: 36, z: -33.5, w: 7.0, d: 4.4 });

    // ── Alley walls and a few courtyard fences ──
    alleyWall(g, { x: -8, z: 27, length: 22 });
    alleyWall(g, { x: 20, z: 27, length: 18 });
    alleyWall(g, { x: -22, z: 9, length: 20 });
    alleyWall(g, { x: 18, z: 9, length: 24 });
    alleyWall(g, { x: -16, z: -9, length: 26 });
    alleyWall(g, { x: 14, z: -9, length: 20 });
    alleyWall(g, { x: -10, z: -27, length: 24 });
    alleyWall(g, { x: 22, z: 8, length: 14, ry: Math.PI / 2 });
    alleyWall(g, { x: -22, z: -8, length: 16, ry: Math.PI / 2 });

    // ── Pines on the Bukhansan (north) edge and a few street trees ──
    [[-22, -48, 9], [-8, -50, 10], [6, -49, 9.5], [20, -48, 8.5], [34, -46, 8],
      [-36, -44, 8], [0, -52, 11], [-14, -46, 7.5], [14, -51, 9],
      [-46, -20, 7], [-48, 4, 7.5], [-46, 28, 7], [48, -16, 7], [47, 12, 7.5], [46, 32, 7]]
      .forEach(([x, z, h]) => pineTree(g, { x, z, h }));
    [[-6, 46, 6], [20, 40, 6.5], [-40, 20, 6], [40, -8, 6]].forEach(([x, z, h]) => {
      tree(g, { x, z, h, r: 2.2, mat: M.foliage });
    });

    return g;
  },
};
