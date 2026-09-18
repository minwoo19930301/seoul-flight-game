// 장충체육관 (Jangchung Arena, 1963 / renovated 2015) - 중구
// Korea's first domed indoor arena: a round hall (~60 m across) under a shallow ribbed dome.
import * as THREE from "../vendor/three.module.js";
import { M, material, cyl, dome, ring, box, slab, strut, polar, treePatch } from "./_helpers.mjs";

const domeMat = material(0xd9dde2, { roughness: 0.45, metalness: 0.35 });

export default {
  id: "jangchung-arena",
  name: "장충체육관",
  nameEn: "Jangchung Arena",
  district: "중구",
  lat: 37.5582,
  lon: 127.0068,
  height: 27,
  colliderRadius: 30,
  detail: "low",
  description: "국내 최초 돔 실내체육관",
  create() {
    const g = new THREE.Group();

    slab(g, { w: 58, d: 54, h: 0.4, mat: M.granite });
    // Lower ring: glass entrance level with a dark-gray band above it.
    cyl(g, { rTop: 22, h: 5, y: 0.4, mat: M.glassDark, seg: 40 });
    cyl(g, { rTop: 22.6, h: 1.2, y: 5.4, mat: M.steelDark, seg: 40 });
    // Main drum: white precast with vertical ribs.
    cyl(g, { rTop: 21.5, h: 9, y: 6.6, mat: M.offWhite, seg: 40 });
    for (let i = 0; i < 36; i += 1) {
      const { x, z } = polar(i, 36, 21.7);
      box(g, { w: 0.5, h: 9, d: 0.5, x, y: 6.6, z, mat: M.concreteDark, ry: (i / 36) * Math.PI * 2 });
    }
    // Eave ring and the shallow ribbed dome.
    ring(g, { r: 22.2, tube: 0.7, y: 15.8, mat: M.steel, seg: 48 });
    dome(g, { r: 22, y: 15.6, mat: domeMat, seg: 40, scaleY: 0.48 });
    for (let i = 0; i < 16; i += 1) {
      const { x, z } = polar(i, 16, 21.4);
      strut(g, { from: [x, 16.2, z], to: [0, 26.2, 0], r: 0.28, mat: M.steel });
    }
    cyl(g, { rTop: 1.6, h: 1.2, y: 26.1, mat: M.steel, seg: 16 });

    // Entrance canopy on the north side and steps.
    box(g, { w: 20, h: 0.6, d: 8, y: 5.2, z: -24, mat: M.steelDark });
    [-8, 0, 8].forEach((x) => cyl(g, { rTop: 0.3, h: 4.8, x, y: 0.4, z: -27.5, mat: M.steel, seg: 8 }));
    box(g, { w: 22, h: 0.4, d: 4, y: 0, z: -29, mat: M.granite });

    treePatch(g, { w: 10, d: 30, x: 26, count: 6, seed: 3, h: 7, r: 2.6 });
    treePatch(g, { w: 10, d: 30, x: -26, count: 6, seed: 5, h: 7, r: 2.6 });
    return g;
  },
};
