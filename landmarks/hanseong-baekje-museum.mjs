// 한성백제박물관 (Seoul Baekje Museum, 금성종합건축, 2012) - 송파구
// Olympic Park boat / 토성 mound: elongated iron-plate-stone hull, walkable roof that climbs
// north toward 몽촌토성, glass cut at the low south lobby, rooftop elevator as a sail.
// Heights 1:1; plan ~0.7 of real so the hull fits the collider.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, prism, frustum, tree, slab } from "./_helpers.mjs";

const ironStone = material(0x7a7264, { roughness: 0.88 });
const ironLight = material(0x9a9284, { roughness: 0.86 });
const roofWalk = material(0x8d8676, { roughness: 0.92 });

export default {
  id: "hanseong-baekje-museum",
  name: "한성백제박물관",
  nameEn: "Seoul Baekje Museum",
  district: "송파구",
  lat: 37.5155,
  lon: 127.1207,
  height: 20,
  colliderRadius: 40,
  detail: "low",
  description: "배 형상의 경사 지붕 박물관",
  create() {
    const g = new THREE.Group();

    slab(g, { w: 56, d: 58, y: -0.2, h: 0.3, mat: M.grass });
    slab(g, { w: 16, d: 12, x: 0, y: 0.08, z: 22, h: 0.2, mat: M.granite });

    // Boat hull pointing north (−z) toward 몽촌토성.
    const hull = [
      [0, -26],
      [3.8, -23],
      [8.2, -13],
      [10.2, -1],
      [9.4, 10],
      [6.5, 20],
      [2.6, 25],
      [-2.6, 25],
      [-6.5, 20],
      [-9.4, 10],
      [-10.2, -1],
      [-8.2, -13],
      [-3.8, -23],
    ];
    prism(g, { points: hull, h: 5.4, y: 0.1, mat: ironStone });

    // Stepped / sloped roof: slices rise toward the north bow (토성 산책로).
    const slices = [
      { z: 20, w: 15, d: 7, h: 6.2 },
      { z: 13, w: 18, d: 7, h: 8.0 },
      { z: 6, w: 19.5, d: 7, h: 10.0 },
      { z: -1, w: 20, d: 7, h: 12.2 },
      { z: -8, w: 18, d: 7, h: 14.2 },
      { z: -15, w: 14.5, d: 7, h: 16.0 },
      { z: -21, w: 10, d: 7, h: 17.6 },
    ];
    slices.forEach(({ z, w, d, h }) => {
      box(g, { w, h, d, y: 0.1, z, mat: ironStone });
      box(g, { w: w - 1.6, h: 0.28, d: d - 0.6, y: 0.1 + h, z, mat: roofWalk });
    });
    // Bow taper and prospect deck.
    frustum(g, { wBot: 8.5, dBot: 6.5, wTop: 2.8, dTop: 3.8, h: 2.2, y: 17.7, z: -25.5, mat: ironLight });
    box(g, { w: 5.5, h: 0.35, d: 4.2, y: 19.9, z: -25, mat: M.granite });

    // Glass lobby cut into the low south stern.
    box(g, { w: 9, h: 4.6, d: 2.8, y: 0.2, z: 25.2, mat: M.glass });
    box(g, { w: 10.5, h: 0.4, d: 4, y: 4.9, z: 25.8, mat: M.steel });
    box(g, { w: 6, h: 3.2, d: 0.3, x: -8.6, y: 1.2, z: 6, mat: M.glassDark });
    box(g, { w: 6, h: 3.2, d: 0.3, x: 8.6, y: 1.2, z: 6, mat: M.glassDark });

    // Rooftop elevator tower = the sail (돛).
    box(g, { w: 3.2, h: 19.4, d: 2.4, x: 2.8, y: 0.2, z: -15, mat: M.glassWhite });
    box(g, { w: 3.6, h: 0.4, d: 2.8, x: 2.8, y: 19.6, z: -15, mat: M.steel });
    box(g, { w: 0.25, h: 16, d: 2.0, x: 4.55, y: 2, z: -15, mat: M.aluminum });

    // Roof walk edge and a few pines of the old knoll.
    box(g, { w: 1.0, h: 0.7, d: 40, x: -7.4, y: 6.2, z: -1, mat: ironLight });
    box(g, { w: 1.0, h: 0.7, d: 40, x: 7.4, y: 6.2, z: -1, mat: ironLight });
    [[-18, 14], [-20, -6], [-16, -22], [18, 13], [20, -8], [15, -23], [-13, 23], [13, 24]].forEach(([x, z], i) => {
      tree(g, { x, y: 0.1, z, h: 7 + (i % 3) * 0.6, r: 2.2 });
    });

    return g;
  },
};
