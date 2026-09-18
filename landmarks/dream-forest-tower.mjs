// 북서울꿈의숲 전망대 (Dream Forest Observatory, 2009) - 강북구
// A 49.7 m observation tower on a hill in the park: a slender shaft with a cantilevered glass deck.
import * as THREE from "../vendor/three.module.js";
import { M, box, cyl, frustum, slab, treePatch, strut } from "./_helpers.mjs";

export default {
  id: "dream-forest-tower",
  name: "북서울꿈의숲 전망대",
  nameEn: "Dream Forest Observatory",
  district: "강북구",
  lat: 37.6201,
  lon: 127.0387,
  height: 50,
  colliderRadius: 24,
  detail: "medium",
  description: "공원 언덕 위 유리 전망타워",
  create() {
    const g = new THREE.Group();

    // Hilltop: a grassy mound with a paved landing.
    frustum(g, { wBot: 46, dBot: 44, wTop: 26, dTop: 24, h: 6, mat: M.grass });
    slab(g, { w: 20, d: 18, h: 0.5, y: 6, mat: M.granite });
    // Base pavilion (ticketing / lift lobby).
    box(g, { w: 12, h: 4.5, d: 9, y: 6.5, z: 2, mat: M.glassWhite });
    box(g, { w: 12.6, h: 0.6, d: 9.6, y: 11, z: 2, mat: M.steelDark });

    // Shaft: twin concrete cores with an exposed lift/stair frame between them.
    box(g, { w: 3.2, h: 34, d: 4.2, x: -2.4, y: 6.5, mat: M.concrete });
    box(g, { w: 3.2, h: 34, d: 4.2, x: 2.4, y: 6.5, mat: M.concrete });
    box(g, { w: 1.6, h: 34, d: 3, y: 6.5, mat: M.glassDark });
    for (let i = 1; i < 9; i += 1) {
      box(g, { w: 8.4, h: 0.3, d: 4.6, y: 6.5 + i * 3.8, mat: M.steel });
    }

    // Observation deck: a glass box cantilevered out toward the south, with a sloping roof plane.
    box(g, { w: 14, h: 5.2, d: 20, y: 40.5, z: 4, mat: M.glass });
    box(g, { w: 14.6, h: 0.5, d: 20.6, y: 40, z: 4, mat: M.steelDark });
    frustum(g, { wBot: 14.6, dBot: 20.6, wTop: 13.6, dTop: 15, h: 2.6, y: 45.7, z: 4, shiftZ: -2.5, mat: M.steel });
    box(g, { w: 6, h: 1.2, d: 6, y: 48.3, z: 0, mat: M.steelDark });
    cyl(g, { rTop: 0.15, rBot: 0.25, h: 1.2, y: 49.5, mat: M.steel, seg: 8 });
    // Diagonal props under the cantilever.
    strut(g, { from: [-3.8, 36, 0], to: [-5.5, 40.2, 11], r: 0.35, mat: M.steel });
    strut(g, { from: [3.8, 36, 0], to: [5.5, 40.2, 11], r: 0.35, mat: M.steel });

    treePatch(g, { w: 40, d: 12, z: -18, count: 9, seed: 12, h: 8, r: 3 });
    treePatch(g, { w: 12, d: 30, x: -19, count: 7, seed: 15, h: 8, r: 3 });
    return g;
  },
};
