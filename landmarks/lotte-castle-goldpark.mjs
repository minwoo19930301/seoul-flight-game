// 롯데캐슬 골드파크 (Lotte Castle Gold Park 3차, 롯데건설 2018) - 금천구
// Doksan-dong high-rise cluster: six beige-stone slabs (~40–47F / 124–145 m) with dark-glass window
// strips and Lotte Castle stepped crowns; 301동 carries a glazed sky lounge on the top two floors.
// Shared courtyard plaza and a low west retail podium (마트·카페거리). Footprints ~0.45 of real;
// tower heights 1:1.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, slab, subgroup, tree, treePatch, deg } from "./_helpers.mjs";

const STONE = material(0xd8c9ae, { roughness: 0.82 });
const STONE_LIGHT = material(0xe6dcc8, { roughness: 0.78 });
const GLAZING = M.glassDark;
const LINE = material(0xc8bda8, { roughness: 0.85 });
const FLOOR = 3.05;
const LOBBY = 7.2;

/**
 * One Gold Park tower: beige stone shaft, dark vertical windows, floor lines, refuge belt,
 * and a stepped "castle" crown. `skyLounge` adds the 301동 glass top.
 */
function castleTower(parent, { x, z, w, d, bodyTop, top, ry = 0, skyLounge = false }) {
  const g = subgroup(parent, { x, z, ry });
  box(g, { w: w + 0.6, h: LOBBY, d: d + 0.6, mat: M.granite });
  box(g, { w, h: bodyTop - LOBBY, d, y: LOBBY, mat: STONE });
  box(g, { w: w - 4, h: 4.4, d: 0.5, y: 0.8, z: d / 2 + 0.15, mat: GLAZING });

  const stripW = 1.7;
  const nx = 3;
  for (let i = 0; i < nx; i += 1) {
    const px = (i - (nx - 1) / 2) * ((w - 3.2) / nx);
    box(g, { w: stripW, h: bodyTop - LOBBY - 0.4, d: 0.4, x: px, y: LOBBY, z: d / 2, mat: GLAZING });
    box(g, { w: stripW, h: bodyTop - LOBBY - 0.4, d: 0.4, x: px, y: LOBBY, z: -d / 2, mat: GLAZING });
  }
  const nz = 2;
  for (let i = 0; i < nz; i += 1) {
    const pz = (i - (nz - 1) / 2) * ((d - 2.8) / nz);
    box(g, { w: 0.4, h: bodyTop - LOBBY - 0.4, d: stripW, x: w / 2, y: LOBBY, z: pz, mat: GLAZING });
    box(g, { w: 0.4, h: bodyTop - LOBBY - 0.4, d: stripW, x: -w / 2, y: LOBBY, z: pz, mat: GLAZING });
  }

  for (let y = LOBBY + FLOOR * 2; y < bodyTop - 1.5; y += FLOOR * 2) {
    box(g, { w: w + 0.45, h: 0.22, d: d + 0.45, y: y - 0.11, mat: LINE });
  }
  // Mid-height refuge / belt-truss floor.
  box(g, { w: w + 0.55, h: FLOOR, d: d + 0.55, y: 72, mat: M.graniteDark });

  // Lotte Castle crown: projecting cornice, inset penthouse, bronze cap.
  box(g, { w: w + 0.9, h: 2.2, d: d + 0.9, y: bodyTop - 0.4, mat: STONE_LIGHT });
  if (skyLounge) {
    box(g, { w: w - 2.2, h: 6.2, d: d - 2, y: bodyTop + 1.8, mat: M.glass });
    box(g, { w: w - 1.6, h: 0.7, d: d - 1.4, y: bodyTop + 1.8, mat: STONE });
    box(g, { w: w - 1.6, h: 0.7, d: d - 1.4, y: bodyTop + 7.3, mat: STONE });
    box(g, { w: w - 4, h: 1.4, d: d - 3.4, y: bodyTop + 8, mat: M.bronze });
  } else {
    box(g, { w: w * 0.78, h: 3.6, d: d * 0.78, y: bodyTop + 1.8, mat: STONE_LIGHT });
    box(g, { w: w * 0.52, h: 2.2, d: d * 0.52, y: bodyTop + 5.4, mat: M.concreteDark });
    box(g, { w: w * 0.7, h: 0.55, d: d * 0.7, y: bodyTop + 5.1, mat: M.bronze });
  }
  // Tiny mast so 301동 reads as the tallest.
  if (skyLounge) {
    cyl(g, { rTop: 0.16, rBot: 0.32, h: top - (bodyTop + 9.4), y: bodyTop + 9.4, mat: M.steel, seg: 6 });
  }
}

export default {
  id: "lotte-castle-goldpark",
  name: "롯데캐슬 골드파크",
  nameEn: "Lotte Castle Gold Park",
  district: "금천구",
  lat: 37.4601,
  lon: 126.8946,
  height: 145,
  colliderRadius: 60,
  detail: "low",
  description: "독산동 초고층 주거 단지",
  create() {
    const g = new THREE.Group();
    // 시흥대로 on the east runs N–S; the slabs face south onto the courtyard.
    const site = subgroup(g, { ry: deg(-6) });

    slab(site, { w: 78, d: 72, h: 0.7, mat: M.granite });
    box(site, { w: 22, h: 0.2, d: 28, y: 0.7, mat: M.grass });
    box(site, { w: 8, h: 0.08, d: 36, y: 0.7, mat: M.marble });
    cyl(site, { rTop: 4.2, h: 0.45, x: 0, y: 0.7, z: 1, mat: M.granite, seg: 16 });
    cyl(site, { rTop: 3.4, h: 0.25, x: 0, y: 1.15, z: 1, mat: M.water, seg: 16 });

    // West retail / 카페거리 podium (3 storeys).
    box(site, { w: 14, h: 12.5, d: 48, x: -32, y: 0.7, z: 2, mat: M.limestone });
    box(site, { w: 14.3, h: 4, d: 48.3, x: -32, y: 0.7, z: 2, mat: M.graniteDark });
    box(site, { w: 0.5, h: 3.6, d: 40, x: -25, y: 0.9, z: 2, mat: M.glass });
    box(site, { w: 14.6, h: 1, d: 48.6, x: -32, y: 12.2, z: 2, mat: M.granite });
    box(site, { w: 8, h: 0.25, d: 16, x: -32, y: 13.2, z: -4, mat: M.grass });

    // Six towers around the courtyard (301–306). Long axis east–west, south-facing.
    castleTower(site, { x: -18, z: -20, w: 18, d: 12, bodyTop: 134, top: 145, skyLounge: true });
    castleTower(site, { x: 4, z: -22, w: 16, d: 11.5, bodyTop: 130, top: 140 });
    castleTower(site, { x: 24, z: -18, w: 16, d: 11.5, bodyTop: 126, top: 136 });
    castleTower(site, { x: -16, z: 20, w: 16, d: 11.5, bodyTop: 122, top: 132 });
    castleTower(site, { x: 6, z: 22, w: 16, d: 11.5, bodyTop: 118, top: 128 });
    castleTower(site, { x: 24, z: 18, w: 15.5, d: 11, bodyTop: 114, top: 124 });

    // Lobby canopies on the courtyard (south) faces of the north row.
    [[-18, -13], [4, -15], [24, -11]].forEach(([x, z]) => {
      box(site, { w: 8, h: 0.4, d: 4, x, y: 5.8, z, mat: M.steelDark });
    });

    treePatch(site, { w: 16, d: 14, x: 0, y: 0.9, z: 0, count: 8, seed: 14, h: 6.5, r: 2.1 });
    [[-10, 0], [12, 4], [-8, 10], [14, -6], [-28, -28], [30, -28], [-28, 30], [32, 28]]
      .forEach(([x, z], i) => tree(site, { x, y: 0.7, z, h: 7 + (i % 3) * 0.6, r: 2.2 }));

    return g;
  },
};
