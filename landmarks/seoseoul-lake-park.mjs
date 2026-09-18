// 서서울호수공원 (Seoseoul Lake Park / West Seoul Lake Park, 2009) - 양천구
// Former 신월정수장 remade as a park: the surviving central lake with the 소리분수 (aircraft-triggered
// jets), Mondrian garden of leftover settling-tank walls (corten + concrete grid), the reused
// filtration hall as a low culture centre, and a pergola of stripped concrete columns. Park paths
// and trees wrap the water. The real 15 m jets are capped at 10 m so the model matches height: 10.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, prism, slab, tree, subgroup } from "./_helpers.mjs";

const CORTEN = material(0xa65b32, { roughness: 0.88, metalness: 0.18 });
const DECK = material(0x8d7349, { roughness: 0.85 });

export default {
  id: "seoseoul-lake-park",
  name: "서서울호수공원",
  nameEn: "Seoseoul Lake Park",
  district: "양천구",
  lat: 37.5279,
  lon: 126.8299,
  height: 10,
  colliderRadius: 50,
  detail: "low",
  description: "옛 정수장 호수와 소리분수, 재생 정수장 구조물",
  create() {
    const g = new THREE.Group();

    cyl(g, { rTop: 49.2, h: 0.22, y: -0.18, mat: M.grass, seg: 32 });

    // ── Central lake (kidney from the old plant pond), rim slightly below grade ──
    prism(g, {
      points: [
        [-22, 6], [-8, 16], [10, 18], [22, 10], [24, -2], [14, -16],
        [0, -20], [-16, -14], [-24, -2],
      ],
      h: 0.45,
      y: -0.35,
      mat: M.water,
    });
    // Stone rim segments
    [[-18, 8, 10, 1.2], [8, 16, 14, 1.2], [20, 4, 1.4, 12], [6, -16, 16, 1.4], [-18, -10, 10, 1.4]].forEach(([x, z, w, d]) => {
      box(g, { w, h: 0.4, d, x, z, mat: M.rockLight });
    });

    // ── 소리분수: a line of jets in the lake (41 real; 14 here, tallest 10 m) ──
    const jets = [6.2, 7.5, 8.8, 9.6, 10, 9.4, 8.2, 7.0, 8.6, 9.8, 9.2, 7.8, 6.5, 5.8];
    jets.forEach((h, i) => {
      const t = (i / (jets.length - 1) - 0.5) * 16;
      cyl(g, { rTop: 0.16, rBot: 0.22, h, x: t * 0.15, y: 0.1, z: t * 0.85 - 2, mat: M.glassWhite, seg: 6 });
    });

    // ── Mondrian garden (north): leftover settling-tank walls, corten + concrete ──
    const garden = subgroup(g, { x: -6, z: -28 });
    box(garden, { w: 36, h: 0.2, d: 22, mat: M.sand });
    // Horizontal walls
    [[-2, 8, 28, CORTEN], [4, 0, 22, M.concrete], [2, -7, 30, CORTEN]].forEach(([x, z, w, mat]) => {
      box(garden, { w, h: 2.6, d: 0.45, x, z, mat });
    });
    // Vertical walls
    [[-12, 1, 16, M.concrete], [-2, 0, 14, CORTEN], [8, 2, 15, M.concrete], [14, -1, 12, CORTEN]].forEach(([x, z, d, mat]) => {
      box(garden, { w: 0.45, h: 2.8, d, x, z, mat });
    });
    // Planting courts
    [[-8, 4, 6, 5], [3, 3.5, 7, 5], [10, -3, 5, 4], [-7, -3, 6, 4]].forEach(([x, z, w, d]) => {
      box(garden, { w, h: 0.35, d, x, y: 0.15, z, mat: M.grassDark });
    });
    // Upper walk ("하늘로") as a concrete slab over part of the grid
    box(garden, { w: 18, h: 0.35, d: 4, x: 2, y: 3.0, z: 1, mat: M.concrete });
    box(garden, { w: 1.2, h: 3.0, d: 1.2, x: -6, z: 1, mat: M.concrete });
    box(garden, { w: 1.2, h: 3.0, d: 1.2, x: 10, z: 1, mat: M.concrete });

    // ── Culture centre: reused filtration hall, east of the lake ──
    box(g, { w: 18, h: 7.2, d: 12, x: 30, z: -6, mat: M.concrete });
    box(g, { w: 16, h: 2.4, d: 0.35, x: 30, y: 2.2, z: 0.15, mat: M.glassDark });
    box(g, { w: 18.4, h: 0.5, d: 12.4, x: 30, y: 7.2, z: -6, mat: M.concreteDark });
    // Industrial leftovers: intake pipes
    [4, 0, -4].forEach((dz) => {
      cyl(g, { rTop: 0.55, h: 8.4, x: 38.2, y: 0, z: -6 + dz, mat: M.steelDark, seg: 8 });
    });
    box(g, { w: 6, h: 0.5, d: 9, x: 38.2, y: 8.4, z: -6, mat: M.steel });

    // ── Column pergola (stripped filter-house columns + vine beams) ──
    const perg = subgroup(g, { x: 22, z: 16 });
    for (let i = 0; i < 4; i += 1) {
      for (let j = 0; j < 3; j += 1) {
        cyl(perg, { rTop: 0.42, rBot: 0.5, h: 5.4, x: (i - 1.5) * 4.2, z: (j - 1) * 4.4, mat: M.concrete, seg: 8 });
      }
    }
    [-1, 1].forEach((s) => {
      box(perg, { w: 14.5, h: 0.35, d: 0.45, y: 5.4, z: s * 4.4, mat: M.concreteDark });
    });
    box(perg, { w: 14.5, h: 0.35, d: 0.45, y: 5.4, mat: M.concreteDark });
    box(perg, { w: 13, h: 0.8, d: 9.2, y: 5.75, mat: M.foliage });

    // ── Culture deck / boardwalk on the south-west lake edge ──
    slab(g, { w: 16, d: 5, x: -16, z: 14, h: 0.4, mat: DECK });
    box(g, { w: 16, h: 0.7, d: 0.2, x: -16, y: 0.4, z: 16.4, mat: DECK });
    // Path ring
    box(g, { w: 3.2, h: 0.16, d: 56, x: 0, z: 2, mat: M.concrete });
    box(g, { w: 52, h: 0.16, d: 3.2, x: 2, z: 24, mat: M.concrete });
    box(g, { w: 52, h: 0.16, d: 3.2, x: -2, z: -22, mat: M.concrete });

    // Open lawn (옛 관사) on the west
    box(g, { w: 16, h: 0.18, d: 14, x: -34, z: 6, mat: M.grassDark });

    // ── Trees (willows / pines around the water) ──
    const trees = [
      [-28, 18, 9], [-22, 22, 8], [4, 26, 8.5], [18, 22, 8], [32, 20, 7.5],
      [38, 8, 8], [36, -20, 8], [12, -28, 7.5], [-8, -32, 8], [-26, -22, 8.5],
      [-36, -8, 8], [-38, 10, 7], [-12, 20, 6.5], [8, -26, 6],
    ];
    trees.forEach(([x, z, h], i) => {
      tree(g, { x, z, h, r: Math.min(h * 0.28, 48.6 - Math.hypot(x, z)), mat: i % 3 === 0 ? M.grassDark : M.foliage });
    });

    return g;
  },
};
