// 타임스퀘어 (Times Square Yeongdeungpo, 정림건축 2009) - 영등포구
// Kyungbang's mixed-use block: a low cream-and-glass mall (B5–5F) around a tall glass atrium box
// that opens to the south plaza, with the Courtyard by Marriott hotel slab (floors 4–16, ~60 m)
// rising from the north-centre of the podium. Shinsegae reads as the east bar; the west bar is the
// lower CGV / Emart wing. Rooftop garden on the mall deck. Plan compressed to r = 60.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, slab, tower, floorBands, tree, subgroup } from "./_helpers.mjs";

const CREAM = material(0xe6e0d2, { roughness: 0.78 });
const CREAM_DARK = material(0xc9c2b2, { roughness: 0.8 });
const ATRIUM = material(0xb7d4ea, { roughness: 0.16, metalness: 0.42, emissive: 0x14344c, emissiveIntensity: 0.28 });

export default {
  id: "times-square",
  name: "타임스퀘어",
  nameEn: "Times Square Yeongdeungpo",
  district: "영등포구",
  lat: 37.5172,
  lon: 126.904,
  height: 60,
  colliderRadius: 60,
  detail: "low",
  description: "영등포 대형 복합쇼핑몰과 호텔 타워",
  create() {
    const g = new THREE.Group();

    // ── Site: lawn disc, south plaza, drop-off ──
    cyl(g, { rTop: 59.2, h: 0.25, y: -0.2, mat: M.grass, seg: 36 });
    slab(g, { w: 54, d: 22, x: 2, z: 32, h: 0.28, mat: M.granite });
    slab(g, { w: 16, d: 10, x: 0, z: 40, h: 0.22, mat: M.asphalt });
    // Shallow plaza pool
    box(g, { w: 10, h: 0.35, d: 6, x: 14, z: 36, mat: M.granite });
    box(g, { w: 8.6, h: 0.12, d: 4.8, x: 14, y: 0.35, z: 36, mat: M.water });

    // ── Mall podium (cream stone + glass shopfront) ──
    const MALL_H = 24;
    box(g, { w: 86, h: MALL_H, d: 46, x: 0, z: -2, mat: CREAM });
    box(g, { w: 86.4, h: 4.2, d: 0.5, z: 21.1, y: 1.2, mat: M.glass });
    box(g, { w: 86.4, h: 4.2, d: 0.5, z: -25.1, y: 1.2, mat: M.glass });
    floorBands(g, { w: 86, d: 46, h: MALL_H, x: 0, z: -2, floorHeight: 4.8, mat: CREAM_DARK, inset: -0.18, thickness: 0.45 });
    // East Shinsegae bar (slightly taller cream department-store block)
    box(g, { w: 22, h: 28, d: 40, x: 36, z: -4, mat: CREAM });
    box(g, { w: 22.3, h: 5, d: 0.45, x: 36, y: 2, z: 16.2, mat: M.glass });
    floorBands(g, { w: 22, d: 40, h: 28, x: 36, z: -4, floorHeight: 4.6, mat: CREAM_DARK, inset: -0.15, thickness: 0.4 });
    box(g, { w: 20, h: 1.1, d: 38, x: 36, y: 28, z: -4, mat: M.steelDark });
    // West CGV / Emart wing (lower)
    box(g, { w: 24, h: 18, d: 38, x: -34, z: -4, mat: CREAM });
    box(g, { w: 24.2, h: 3.6, d: 0.4, x: -34, y: 1.4, z: 15.2, mat: M.glassDark });
    box(g, { w: 10, h: 2.2, d: 0.5, x: -34, y: 14.6, z: 15.2, mat: M.red }); // cinema fascia
    floorBands(g, { w: 24, d: 38, h: 18, x: -34, z: -4, floorHeight: 4.5, mat: CREAM_DARK, inset: -0.12, thickness: 0.35 });

    // ── Glass atrium box (south entrance, claimed as Asia's largest mall atrium) ──
    const atrium = subgroup(g, { x: -4, z: 18 });
    box(atrium, { w: 30, h: 32, d: 18, mat: ATRIUM });
    // Steel frame so the box reads as a glazed hall, not a solid tower
    [-14.6, 0, 14.6].forEach((x) => {
      box(atrium, { w: 0.45, h: 32, d: 0.4, x, z: 9.1, mat: M.steel });
      box(atrium, { w: 0.45, h: 32, d: 0.4, x, z: -9.1, mat: M.steel });
    });
    [8, 16, 24].forEach((y) => {
      box(atrium, { w: 30.4, h: 0.4, d: 18.4, y, mat: M.steel });
    });
    box(atrium, { w: 28, h: 0.35, d: 16, y: 32, mat: M.glassWhite });
    box(atrium, { w: 12, h: 6.5, d: 1.2, y: 1, z: 9.4, mat: M.glass });

    // ── Courtyard by Marriott hotel slab (~16 storeys, glass) ──
    tower(g, {
      w: 20, d: 34, h: 58.6, x: 6, z: -8,
      mat: M.glass, bandMat: M.aluminum, floorHeight: 3.7, roofMat: M.steelDark,
    });
    box(g, { w: 16, h: 1.15, d: 8, x: 6, y: 59.8, z: -8, mat: M.concreteDark }); // mech crown → ~61 m

    // ── Mall roof garden (5F/6F deck) ──
    box(g, { w: 40, h: 0.35, d: 16, x: -8, y: MALL_H, z: 4, mat: M.grass });
    box(g, { w: 8, h: 0.5, d: 8, x: -22, y: MALL_H, z: 4, mat: M.water });
    [[-18, 0], [-4, 8], [6, 2], [-12, 8]].forEach(([x, z]) => {
      tree(g, { x, y: MALL_H + 0.3, z: z + 4, h: 5.5, r: 1.8 });
    });

    // ── South plaza trees and a pair of canopy posts ──
    [[-18, 38, 8], [-10, 42, 7.5], [22, 38, 8], [30, 34, 7], [38, 28, 7.5]].forEach(([x, z, h]) => {
      tree(g, { x, z, h, r: 2.5 });
    });
    [-8, 8].forEach((x) => {
      cyl(g, { rTop: 0.28, h: 4.2, x, z: 28, mat: M.steel, seg: 6 });
    });
    box(g, { w: 18, h: 0.2, d: 6, y: 4.2, z: 28, mat: M.membrane });

    return g;
  },
};
