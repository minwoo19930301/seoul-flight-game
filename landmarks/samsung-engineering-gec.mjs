// 삼성엔지니어링 GEC (Samsung Engineering Global Engineering Center, Samoo + HOK, 2012) - 강동구
// Sangil-dong R&D campus: three glass office bars (A/B/C) around a landscaped courtyard, 15 floors
// (~60 m), podium, skybridges and a west double-skin. Footprint ~0.45 of real; heights 1:1.
import * as THREE from "../vendor/three.module.js";
import { M, box, cyl, tower, slab, tree, subgroup, deg } from "./_helpers.mjs";

const FLOOR = 3.9;
const A_H = 58.5; // 15 floors; roof slab in tower() adds ~1.2 → ~60 m
const B_H = 54.6;
const C_H = 50.7;

function officeBar(g, { w, d, h, x, z, ry = 0, mat = M.glassBlue }) {
  tower(g, { w, d, h, x, z, ry, mat, bandMat: M.aluminum, floorHeight: FLOOR, roofMat: M.steelDark });
  // Roof garden
  box(g, { w: w * 0.72, h: 0.35, d: d * 0.72, x, y: h + 1.2, z, mat: M.grass, ry });
}

export default {
  id: "samsung-engineering-gec",
  name: "삼성엔지니어링 GEC",
  nameEn: "Samsung Engineering Global Engineering Center",
  district: "강동구",
  lat: 37.55,
  lon: 127.174,
  height: 60,
  colliderRadius: 60,
  detail: "low",
  description: "상일동 대형 연구·사무 캠퍼스",
  create() {
    const g = new THREE.Group();
    // Local grid follows 상일로 / the expressway edge (slightly east of north).
    const site = subgroup(g, { ry: deg(16) });

    slab(site, { w: 86, d: 78, y: -0.15, h: 0.35, mat: M.asphalt });
    slab(site, { w: 62, d: 44, y: 0.15, h: 0.25, mat: M.granite });

    // 3-storey podium / social base linking the bars (회의·식당·엔지움).
    box(site, { w: 74, h: 11.5, d: 46, y: 0.2, mat: M.glassWhite });
    box(site, { w: 28, h: 8.5, d: 22, x: 0, y: 0.2, z: 4, mat: M.granite }); // courtyard well
    box(site, { w: 22, h: 6.5, d: 18, x: 0, y: 0.25, z: 4, mat: M.glass });
    // Courtyard water (수련 / lotus concept) and a few trees.
    cyl(site, { rTop: 7.5, h: 0.45, x: 0, y: 0.3, z: 5, mat: M.water, seg: 16 });
    [[-3, 3], [2.5, 6], [0, 1.5]].forEach(([dx, dz]) => {
      cyl(site, { rTop: 1.3, h: 0.12, x: dx, y: 0.72, z: 5 + dz, mat: M.foliage, seg: 8 });
    });

    // A동: central main bar, longest E–W slab, full 15 floors.
    officeBar(site, { w: 58, d: 16, h: A_H, x: 0, z: -16, mat: M.glassBlue });
    // B동: west bar facing the residential street, slightly shorter.
    officeBar(site, { w: 15, d: 42, h: B_H, x: -26, z: 7, mat: M.glass });
    // C동: east bar toward the expressway.
    officeBar(site, { w: 15, d: 38, h: C_H, x: 26, z: 9, mat: M.glassGreen });

    // West double-skin on B (서측 더블스킨).
    box(site, { w: 0.35, h: B_H - 4, d: 36, x: -33.9, y: 3, z: 7, mat: M.glassWhite });

    // Skybridges A–B and A–C (고가통로) plus a lower arcade link.
    box(site, { w: 14, h: 4.2, d: 7, x: -14, y: 28, z: -5, mat: M.glassWhite });
    box(site, { w: 14, h: 4.2, d: 7, x: 14, y: 28, z: -4, mat: M.glassWhite });
    box(site, { w: 12, h: 3.6, d: 6, x: -14, y: 11.5, z: -3, mat: M.glass });
    box(site, { w: 12, h: 3.6, d: 6, x: 14, y: 11.5, z: -2, mat: M.glass });

    // Glazed lobby / 엔지움 on the south face of A.
    box(site, { w: 22, h: 9, d: 4, x: 0, y: 0.2, z: -8.2, mat: M.glass });
    box(site, { w: 24, h: 0.5, d: 6, x: 0, y: 9.2, z: -7.2, mat: M.aluminum });

    // Roof plant on A and a thin crown so the measured top sits at 60 m.
    box(site, { w: 10, h: 1.4, d: 6, x: -16, y: A_H + 1.2, z: -18, mat: M.concreteDark });
    box(site, { w: 8, h: 0.3, d: 5, x: 14, y: A_H + 1.2, z: -18, mat: M.steelDark });

    // Drop-off and a few street trees on the west (B) side.
    slab(site, { w: 8, d: 24, x: -38, y: 0.15, h: 0.2, mat: M.concrete });
    [[-38, -16], [-38, 2], [-38, 16], [38, -6], [38, 14], [0, 32]].forEach(([x, z], i) => {
      tree(site, { x, y: 0.2, z, h: 7 + (i % 3) * 0.5, r: 2.2 });
    });

    return g;
  },
};
