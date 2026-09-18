// LG사이언스파크 (LG Science Park, HOK + 간삼 + 창조, 2018) - 강서구
// Magok research campus: a pixelated cluster of mid-rise glass and pale-granite cubes / bars
// (real 8–9 storeys, ~50 m) along a cruciform linear park. The dark-clad Integrated Support
// Centre sits at the crossing; third-floor glass bridges stitch the blocks. The real 750 × 270 m
// site is compressed to r = 70; the tallest lab bars keep the declared 50 m height.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, slab, tower, tree, subgroup } from "./_helpers.mjs";

const STONE = material(0xd5d0c6, { roughness: 0.82 });
const STONE_BAND = material(0xb7b2a8, { roughness: 0.78 });

export default {
  id: "lg-science-park",
  name: "LG사이언스파크",
  nameEn: "LG Science Park",
  district: "강서구",
  lat: 37.5628,
  lon: 126.8306,
  height: 50,
  colliderRadius: 70,
  detail: "medium",
  description: "마곡 연구단지, 유리 큐브 연구동 군",
  create() {
    const g = new THREE.Group();

    cyl(g, { rTop: 69.2, h: 0.22, y: -0.18, mat: M.grass, seg: 40 });
    // Cruciform linear park (E–W promenade + N–S public walk)
    slab(g, { w: 118, d: 16, h: 0.2, mat: M.grassDark });
    slab(g, { w: 16, d: 96, h: 0.2, mat: M.grassDark });
    slab(g, { w: 100, d: 4.5, h: 0.28, mat: M.granite });
    slab(g, { w: 4.5, d: 80, h: 0.28, mat: M.granite });
    // Water rill along the east–west park
    box(g, { w: 70, h: 0.22, d: 3.2, y: 0.2, z: -4, mat: M.water });

    // ── Research bars / cubes (glass + pale granite). Tallest = 49.2 m + crown. ──
    // [w, d, h, x, z, kind]  kind: glass | stone | dark
    const blocks = [
      [22, 30, 46, -40, -28, "stone"],
      [24, 26, 49.2, -14, -30, "glass"],
      [20, 28, 42, 16, -28, "stone"],
      [24, 24, 49.2, 40, -26, "glass"],
      [22, 28, 44, -40, 28, "glass"],
      [26, 24, 49.2, -14, 30, "stone"],
      [22, 30, 46, 18, 28, "glass"],
      [20, 26, 40, 42, 26, "stone"],
      [26, 20, 48, 0, -50, "glass"],
      [24, 18, 42, 0, 50, "stone"],
    ];
    blocks.forEach(([w, d, h, x, z, kind]) => {
      lab(g, { w, d, h, x, z, kind });
    });

    // Dark-clad Integrated Support Centre at the heart (wider, a storey lower)
    const isc = subgroup(g, { x: 8, z: 2 });
    box(isc, { w: 28, h: 36, d: 22, mat: M.glassDark });
    box(isc, { w: 28.3, h: 3.4, d: 0.4, y: 0.8, z: 11.15, mat: M.glass });
    for (let i = 1; i <= 8; i += 1) {
      box(isc, { w: 28.3, h: 0.4, d: 22.3, y: i * 4.0, mat: M.steelDark });
    }
    box(isc, { w: 24, h: 1.1, d: 18, y: 36, mat: M.black });
    // Sunken garden cuts beside the ISC
    box(g, { w: 10, h: 0.3, d: 8, x: -12, z: 6, mat: M.grass });
    box(g, { w: 6, h: 0.18, d: 4, x: -12, y: 0.25, z: 6, mat: M.water });

    // ── Third-floor skybridges ──
    const bridges = [
      [-27, -29, 12, 8],
      [1, -29, 10, 8],
      [28, -27, 12, 8],
      [-27, 29, 12, 8],
      [2, 29, 10, 8],
      [30, 27, 12, 8],
      [0, -40, 8, 10],
      [0, 40, 8, 10],
      [8, -12, 8, 8],
    ];
    bridges.forEach(([x, z, w, d]) => {
      box(g, { w, h: 3.2, d, x, y: 11.2, z, mat: M.glass });
      box(g, { w: w + 0.3, h: 0.28, d: d + 0.3, x, y: 14.4, z, mat: M.aluminum });
    });

    // Entry plaza (NW) and a few trees along the park
    slab(g, { w: 20, d: 16, x: -48, z: -8, h: 0.28, mat: M.granite });
    box(g, { w: 8, h: 0.3, d: 8, x: -48, z: -8, mat: M.water });
    const trees = [
      [-28, -8, 8], [-8, -8, 7.5], [20, -8, 8], [48, -6, 7],
      [-28, 8, 7.5], [24, 8, 8], [0, -36, 7], [0, 36, 7.5],
      [-52, -8, 8], [54, 6, 7], [-20, -48, 7], [22, 48, 7],
    ];
    trees.forEach(([x, z, h]) => {
      tree(g, { x, z, h, r: Math.min(2.5, 68.5 - Math.hypot(x, z)) });
    });

    return g;
  },
};

function lab(parent, { w, d, h, x, z, kind }) {
  if (kind === "glass") {
    tower(parent, { w, d, h, x, z, mat: M.glass, bandMat: M.aluminum, floorHeight: 4.2, roofMat: M.steelDark });
  } else {
    box(parent, { w, h, d, x, z, mat: STONE });
    box(parent, { w: w + 0.2, h: 3.6, d: 0.35, x, y: 0.6, z: d / 2, mat: M.glass });
    box(parent, { w: w + 0.2, h: 3.6, d: 0.35, x, y: 0.6, z: -d / 2, mat: M.glass });
    const floors = Math.floor(h / 4.2);
    for (let i = 1; i <= floors; i += 1) {
      box(parent, { w: w + 0.2, h: 0.4, d: d + 0.2, x, y: i * 4.2, z, mat: STONE_BAND });
    }
    box(parent, { w: w * 0.9, h: 1.0, d: d * 0.9, x, y: h, z, mat: M.steelDark });
  }
}
