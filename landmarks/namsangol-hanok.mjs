// 남산골한옥마을 (Namsangol Hanok Village, 1998) - 중구
// Five relocated Seoul houses on the north slope of Namsan, plus a garden stream and pavilions.
// 이승업 가옥 (ㄱ, carpenter), 김춘영 가옥, 민씨 가옥, 윤택영 재실, 옥인동 윤씨 ㅁ자 집.
// 청학지 / 천우각 at the north entrance, 청류정 over the west stream. Heights stay under 12 m.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, hipRoof, pyramidRoof, polygonPrism, hanokHall, tree, subgroup } from "./_helpers.mjs";

const earth = material(0xa89670, { roughness: 1 });
const pine = material(0x2f6b3a, { roughness: 1 });

/** Compact one-storey hanok (few columns) so five houses stay in the low budget. */
function house(g, { x, z, w, d, ry = 0, wallH = 3.1, roofH = 3.3, platformH = 0.55, columns = true }) {
  const s = subgroup(g, { x, z, ry });
  box(s, { w: w + 1.2, h: platformH, d: d + 1.2, mat: M.granite });
  box(s, { w: w - 1, h: wallH, d: d - 1, y: platformH, mat: M.hanokWall });
  if (columns) {
    const nx = Math.max(2, Math.round(w / 4.2));
    for (let i = 0; i <= nx; i += 1) {
      const px = -w / 2 + (w / nx) * i;
      cyl(s, { rTop: 0.22, h: wallH, x: px, y: platformH, z: d / 2, mat: M.hanokWood, seg: 6 });
      cyl(s, { rTop: 0.22, h: wallH, x: px, y: platformH, z: -d / 2, mat: M.hanokWood, seg: 6 });
    }
  }
  box(s, { w: w + 0.8, h: 0.7, d: d + 0.8, y: platformH + wallH, mat: M.dancheong });
  hipRoof(s, { w, d, h: roofH, y: platformH + wallH + 0.7, overhang: 1.5, ridge: 0.5, curve: 0.12 });
}

function pavilion(g, { x, z, sides = 4, r = 2.2 }) {
  polygonPrism(g, { sides, r, h: 0.4, x, z, mat: M.granite });
  for (let i = 0; i < sides; i += 1) {
    const a = (i / sides) * Math.PI * 2 + Math.PI / sides;
    cyl(g, { rTop: 0.14, h: 2.4, x: x + Math.cos(a) * r * 0.72, y: 0.4, z: z + Math.sin(a) * r * 0.72, mat: M.hanokWood, seg: 6 });
  }
  polygonPrism(g, { sides, r: r * 0.7, h: 0.55, x, y: 2.8, z, mat: M.dancheong });
  pyramidRoof(g, { w: r * 1.5, d: r * 1.5, h: 1.7, x, y: 3.35, z, overhang: 0.7 });
}

export default {
  id: "namsangol-hanok",
  name: "남산골한옥마을",
  nameEn: "Namsangol Hanok Village",
  district: "중구",
  lat: 37.5593,
  lon: 126.9945,
  height: 12,
  colliderRadius: 40,
  detail: "low",
  description: "이축 복원된 전통 한옥 5채와 정원",
  create() {
    const g = new THREE.Group();
    const G = 0.12;

    cyl(g, { rTop: 38.6, h: 0.35, y: -0.22, mat: M.grass, seg: 20 });
    box(g, { w: 44, h: 0.12, d: 46, y: G, mat: earth });

    // West stream and 청학지 pond by the north entrance
    box(g, { w: 3.2, h: 0.45, d: 40, x: -22, y: -0.2, z: 0, mat: M.water });
    box(g, { w: 0.55, h: 0.4, d: 40, x: -23.8, y: 0, z: 0, mat: M.rock });
    box(g, { w: 0.55, h: 0.4, d: 40, x: -20.2, y: 0, z: 0, mat: M.rock });
    cyl(g, { rTop: 5.2, h: 0.4, x: -10, y: -0.15, z: 20, mat: M.water, seg: 16 });
    box(g, { w: 4.6, h: 0.45, d: 2.2, x: -16, y: 0.15, z: 14, mat: M.granite });

    // 천우각 (open hall by the pond) and 청류정 (hex pavilion over the stream)
    hanokHall(g, {
      w: 8, d: 5.2, x: -8, z: 18.5, platformH: 0.5, wallH: 2.8, roofH: 2.8, overhang: 1.6, columns: true,
    });
    pavilion(g, { x: -22, z: -6, sides: 6, r: 2.1 });

    // 1. 이승업 가옥 — ㄱ carpenter's house, more ornate
    house(g, { x: -8, z: 6, w: 9, d: 5.4, wallH: 3.2, roofH: 3.5 });
    house(g, { x: -3.2, z: 2.2, w: 5.2, d: 4.4, ry: Math.PI / 2, wallH: 3, roofH: 3.1 });

    // 2. 김춘영 가옥
    house(g, { x: 8, z: 10, w: 7.2, d: 5, wallH: 3, roofH: 3.1 });

    // 3. 민씨 가옥
    house(g, { x: 18, z: 2, w: 8, d: 5.2, wallH: 3.1, roofH: 3.2 });

    // 4. 윤택영 재실 — formal memorial hall
    house(g, { x: -7, z: -8, w: 9.4, d: 6, wallH: 3.8, roofH: 6.4, platformH: 0.8 });

    // 5. 옥인동 윤씨 — ㅁ courtyard house
    house(g, { x: 12, z: -16, w: 11, d: 4.4, columns: false });
    house(g, { x: 12, z: -24.4, w: 11, d: 4.2, columns: false });
    house(g, { x: 6.6, z: -20.2, w: 8.4, d: 4, ry: Math.PI / 2, columns: false });
    house(g, { x: 17.4, z: -20.2, w: 8.4, d: 4, ry: Math.PI / 2, columns: false });
    box(g, { w: 6.4, h: 0.12, d: 5.2, x: 12, y: G, z: -20.2, mat: earth });

    // Stone stairs up the south slope and a few pines
    for (let i = 0; i < 5; i += 1) {
      box(g, { w: 3.6, h: 0.28, d: 0.7, x: 2, y: i * 0.22, z: -2 + i * 0.7, mat: M.granite });
    }

    [
      [-24, 14, 6.5], [-22, 4, 6], [-24, -10, 6.5], [-14, -20, 5.5],
      [22, 12, 6], [24, 0, 5.5], [22, -16, 6], [4, -26, 5.5],
      [-2, 22, 5], [14, 18, 5], [18, -24, 5],
    ].forEach(([x, z, h]) => tree(g, { x, z, h, r: h * 0.28, mat: pine }));

    return g;
  },
};
