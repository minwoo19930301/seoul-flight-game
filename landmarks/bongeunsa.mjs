// 봉은사 (Bongeunsa Temple, founded 794) - 강남구
// Seon temple on a wooded slope immediately north of COEX. The landmark from the air is the 23 m
// granite Maitreya (미륵대불, 1996) on the west plaza, facing south toward the city; east of it the
// 대웅전 courtyard with a three-tier pagoda, entered from the south through 일주문 and the two-storey
// 법왕루. Grounds are compressed to r = 36; the statue height is 1:1.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, cone, sphere, lathe, hipRoof, pyramidRoof, hanokHall, stonePagoda, tree, subgroup } from "./_helpers.mjs";

const STONE = material(0xc9c3b4, { roughness: 0.88 });
const STONE_D = M.graniteDark;
const EARTH = material(0xb8a98a, { roughness: 1 });
const PINE = material(0x2f6b3a, { roughness: 1 });
const LATTICE = material(0x835a3e, { roughness: 0.85 });

/** 23 m standing Maitreya: lotus, robe lathe, head, pointed 보계, right hand raised. */
function maitreya(parent, { x, z }) {
  const s = subgroup(parent, { x, z });
  cyl(s, { rTop: 2.7, rBot: 3.5, h: 0.7, mat: STONE_D, seg: 14 });
  cyl(s, { rTop: 2.2, rBot: 2.9, h: 0.95, y: 0.7, mat: STONE, seg: 14 });
  for (let i = 0; i < 10; i += 1) {
    const a = (i / 10) * Math.PI * 2;
    sphere(s, { r: 0.72, x: Math.cos(a) * 2.7, y: 0.12, z: Math.sin(a) * 2.7, mat: STONE, seg: 8, sy: 0.42, sx: 0.65, sz: 1.05 });
  }
  const base = 1.85;
  lathe(s, {
    profile: [
      [0.85, 0], [1.1, 1.7], [1.4, 4.0], [2.1, 6.1], [2.35, 8.3],
      [2.55, 10.5], [2.2, 12.6], [1.35, 13.9], [0.52, 14.45],
    ],
    y: base, mat: STONE, seg: 14,
  });
  const neck = base + 14.45;
  sphere(s, { r: 1.28, y: neck, mat: STONE, seg: 12 });
  cyl(s, { rTop: 0.48, rBot: 0.72, h: 1.15, y: neck + 2.15, mat: STONE, seg: 10 });
  cone(s, { r: 0.52, h: 3.4, y: neck + 3.3, mat: STONE, seg: 10 });
  // Right arm (−x) raised in abhaya; left arm down along the robe.
  cyl(s, { rTop: 0.38, h: 2.7, x: -2.25, y: base + 10.1, z: 0.35, mat: STONE, seg: 8 });
  cyl(s, { rTop: 0.32, h: 2.3, x: -2.45, y: base + 12.5, z: 0.85, mat: STONE, seg: 8 });
  sphere(s, { r: 0.36, x: -2.5, y: base + 14.7, z: 1.05, mat: STONE, seg: 8 });
  cyl(s, { rTop: 0.36, h: 3.3, x: 2.15, y: base + 7.3, z: 0.3, mat: STONE, seg: 8 });
  sphere(s, { r: 0.32, x: 2.15, y: base + 7.05, z: 0.45, mat: STONE, seg: 8 });
  // Eight small vajra-warrior posts around the lotus.
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    box(s, { w: 0.45, h: 1.1, d: 0.35, x: Math.cos(a) * 3.6, y: 0, z: Math.sin(a) * 3.6, ry: -a, mat: STONE_D });
  }
}

/** 법왕루: two-storey gate pavilion — open columns below, lattice hall above, hip roof. */
function beopwangnu(parent, { x, z, w = 14, d = 7 }) {
  const s = subgroup(parent, { x, z });
  box(s, { w: w + 1.8, h: 0.55, d: d + 1.8, mat: M.granite });
  const colH = 3.5;
  for (let i = 0; i <= 4; i += 1) {
    const px = -w / 2 + (w / 4) * i;
    cyl(s, { rTop: 0.3, h: colH, x: px, y: 0.55, z: d / 2, mat: M.hanokWood, seg: 8 });
    cyl(s, { rTop: 0.3, h: colH, x: px, y: 0.55, z: -d / 2, mat: M.hanokWood, seg: 8 });
  }
  const floorY = 0.55 + colH;
  box(s, { w: w + 0.8, h: 0.55, d: d + 0.8, y: floorY, mat: M.hanokWood });
  box(s, { w: w - 1, h: 3.1, d: d - 1, y: floorY + 0.55, mat: LATTICE });
  box(s, { w: w + 1, h: 1, d: d + 1, y: floorY + 3.65, mat: M.dancheong });
  hipRoof(s, { w, d, h: 3.5, y: floorY + 4.65, overhang: 2.3 });
}

export default {
  id: "bongeunsa",
  name: "봉은사",
  nameEn: "Bongeunsa Temple",
  district: "강남구",
  lat: 37.515,
  lon: 127.0576,
  height: 23,
  colliderRadius: 36,
  detail: "medium",
  description: "23m 미륵대불과 대웅전",
  create() {
    const g = new THREE.Group();
    const TY = 1.5;

    cyl(g, { rTop: 35.2, h: 0.28, y: -0.12, mat: M.grass, seg: 16 });
    box(g, { w: 28, h: TY, d: 16, x: 8, z: -14, mat: M.graniteDark });
    box(g, { w: 27.2, h: 0.12, d: 15.2, x: 8, y: TY, z: -14, mat: EARTH });
    box(g, { w: 26, h: 0.14, d: 22, x: 6, z: 4, mat: EARTH });
    box(g, { w: 16, h: 0.14, d: 18, x: -16, z: 8, mat: EARTH });
    for (let i = 0; i < 4; i += 1) {
      box(g, { w: 4.2, h: TY - i * (TY / 4), d: 0.55, x: 8, z: -6.2 + i * 0.55, mat: M.granite });
    }

    // 대웅전 on the upper terrace, facing south over the courtyard.
    hanokHall(g, {
      w: 15, d: 9.5, x: 8, y: TY, z: -15.5,
      platformH: 1.15, wallH: 4.2, roofH: 4.4, overhang: 2.5,
    });
    stonePagoda(g, { tiers: 3, baseW: 2.5, x: 8, y: 0.14, z: -3.5 });
    hanokHall(g, {
      w: 8, d: 5.5, x: 20, y: 0, z: -2,
      platformH: 0.7, wallH: 3.2, roofH: 3.1, overhang: 1.7, ry: Math.PI / 2,
    });

    // 미륵대불 on the west plaza, facing south toward COEX; 미륵전 in front.
    maitreya(g, { x: -16, z: -4 });
    hanokHall(g, {
      w: 9, d: 6, x: -16, z: 12,
      platformH: 0.55, wallH: 3.1, roofH: 3.0, overhang: 1.8, columns: true,
    });

    beopwangnu(g, { x: 7, z: 14.5 });

    // 일주문 on the south path.
    box(g, { w: 3.2, h: 0.14, d: 10, x: 7, z: 26, mat: EARTH });
    [-2.3, 2.3].forEach((dx) => {
      box(g, { w: 0.85, h: 0.4, d: 0.85, x: 7 + dx, z: 28, mat: STONE_D });
      cyl(g, { rTop: 0.32, h: 3.7, x: 7 + dx, y: 0.4, z: 28, mat: M.hanokWood, seg: 8 });
    });
    box(g, { w: 6.4, h: 0.95, d: 1.35, x: 7, y: 4.1, z: 28, mat: M.dancheong });
    hipRoof(g, { w: 5.4, d: 1.5, h: 2.1, x: 7, y: 5.05, z: 28, overhang: 1.6, ridge: 0.6 });

    // Small open bell pavilion east of 법왕루.
    [[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4]].forEach(([sx, sz]) => {
      cyl(g, { rTop: 0.2, h: 2.8, x: 18 + sx, y: 0.4, z: 12 + sz, mat: M.hanokWood, seg: 6 });
    });
    box(g, { w: 4.2, h: 0.4, d: 4.2, x: 18, z: 12, mat: M.granite });
    cyl(g, { rTop: 0.65, rBot: 0.8, h: 1.4, x: 18, y: 1.3, z: 12, mat: M.bronze, seg: 10 });
    box(g, { w: 3.6, h: 0.55, d: 3.6, x: 18, y: 3.2, z: 12, mat: M.dancheong });
    pyramidRoof(g, { w: 3.2, d: 3.2, h: 1.6, x: 18, y: 3.75, z: 12, overhang: 1.1 });

    const trees = [
      [-28, -8, 9], [-26, 6, 8.5], [-24, 18, 8], [-12, 22, 7.5], [2, 30, 8],
      [16, 28, 8], [26, 16, 8.5], [28, 2, 9], [26, -16, 9], [14, -26, 10],
      [0, -28, 10], [-10, -24, 9.5], [-22, -20, 9], [22, -8, 7], [-6, 24, 7],
    ];
    trees.forEach(([x, z, h], i) => {
      const r = Math.min(h * 0.28, 35.4 - Math.hypot(x, z));
      tree(g, { x, z, h, r, mat: i % 3 === 0 ? PINE : M.foliage });
    });

    return g;
  },
};
