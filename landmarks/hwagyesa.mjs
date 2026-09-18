// 화계사 (Hwagyesa, 삼각산) - 강북구
// Mountain-side Jogye temple: 대적광전 — the 1991 four-storey modern 불전 (정면 7칸 × 측면 4칸)
// with a tiled hip roof — and the two-storey hexagonal 범종각 holding the bronze 범종. A small
// 대웅전 and 일주문 close the courtyard; pines climb the north slope of 삼각산. Heights realistic
// (hall roof ≈ 16 m); plan compressed to r = 30.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, cone, hipRoof, pyramidRoof, slab, subgroup, tree } from "./_helpers.mjs";

const pine = material(0x2f6b3a, { roughness: 1 });
const earth = material(0xc2b592, { roughness: 1 });
const lattice = material(0x7a4e34, { roughness: 0.85 });

/** Cheap pine: trunk + two cones. */
function pineTree(g, { x, y = 0, z, h = 8 }) {
  cyl(g, { rTop: 0.18, rBot: 0.3, h: h * 0.42, x, y, z, mat: M.trunk, seg: 5 });
  cone(g, { r: h * 0.22, h: h * 0.4, x, y: y + h * 0.32, z, mat: pine, seg: 6 });
  cone(g, { r: h * 0.14, h: h * 0.36, x, y: y + h * 0.6, z, mat: pine, seg: 6 });
}

/** 대적광전: four cream storeys, red columns on the ground floor, dancheong, tiled hip roof. */
function daejeok(g, { x, z }) {
  const s = subgroup(g, { x, z });
  const w = 18;
  const d = 10.5;
  box(s, { w: w + 2.4, h: 0.7, d: d + 2.4, mat: M.granite });
  const storeys = [2.55, 2.35, 2.2, 2.15];
  let y = 0.7;
  storeys.forEach((h, i) => {
    const inset = i * 0.15;
    box(s, { w: w - 0.8 - inset, h, d: d - 0.8 - inset, y, mat: M.hanokWall });
    // window grid
    const nx = 7;
    for (let k = 0; k < nx; k += 1) {
      const px = -w / 2 + 1.4 + (w - 2.8) * (k / (nx - 1));
      box(s, { w: 1.15, h: h * 0.55, d: 0.12, x: px, y: y + h * 0.22, z: (d - 0.8 - inset) / 2, mat: i === 0 ? lattice : M.glassDark });
    }
    if (i === 0) {
      const cols = 8;
      for (let k = 0; k < cols; k += 1) {
        const px = -w / 2 + (w / (cols - 1)) * k;
        cyl(s, { rTop: 0.28, h, x: px, y, z: d / 2, mat: M.hanokWood, seg: 6 });
        cyl(s, { rTop: 0.28, h, x: px, y, z: -d / 2, mat: M.hanokWood, seg: 6 });
      }
    }
    y += h;
  });
  box(s, { w: w + 0.8, h: 0.75, d: d + 0.8, y, mat: M.dancheong });
  hipRoof(s, { w, d, h: 4.4, y: y + 0.75, overhang: 2.2 });
}

/** 범종각: two-storey hexagon, bronze bell, tiled pyramidal roof. */
function beomjong(g, { x, z }) {
  const s = subgroup(g, { x, z });
  cyl(s, { rTop: 3.3, h: 0.45, mat: M.granite, seg: 6, ry: Math.PI / 6 });
  cyl(s, { rTop: 2.7, h: 3.1, y: 0.45, mat: M.hanokWall, seg: 6, ry: Math.PI / 6 });
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    cyl(s, { rTop: 0.2, h: 3.1, x: Math.cos(a) * 2.55, y: 0.45, z: Math.sin(a) * 2.55, mat: M.hanokWood, seg: 6 });
  }
  box(s, { w: 5.4, h: 0.4, d: 5.4, y: 3.55, mat: M.hanokWood });
  cyl(s, { rTop: 2.35, h: 2.3, y: 3.95, mat: lattice, seg: 6, ry: Math.PI / 6 });
  box(s, { w: 5.2, h: 0.55, d: 5.2, y: 6.25, mat: M.dancheong });
  cone(s, { r: 3.8, h: 2.3, y: 6.8, mat: M.roofTile, seg: 6, ry: Math.PI / 6 });
  // 범종
  cyl(s, { rTop: 0.55, rBot: 0.72, h: 1.35, y: 1.5, mat: M.bronze, seg: 10 });
  cyl(s, { rTop: 0.12, h: 0.8, y: 2.85, mat: M.bronze, seg: 6 });
}

/** Small 3-kan 대웅전. */
function daeung(g, { x, z }) {
  const s = subgroup(g, { x, z });
  box(s, { w: 9.2, h: 0.55, d: 6.8, mat: M.granite });
  box(s, { w: 7.4, h: 3.2, d: 5.2, y: 0.55, mat: M.hanokWall });
  for (let i = 0; i <= 3; i += 1) {
    cyl(s, { rTop: 0.22, h: 3.2, x: -3.6 + i * 2.4, y: 0.55, z: 2.6, mat: M.hanokWood, seg: 6 });
  }
  box(s, { w: 8.4, h: 0.65, d: 6.2, y: 3.75, mat: M.dancheong });
  hipRoof(s, { w: 7.6, d: 5.4, h: 3.0, y: 4.4, overhang: 1.6 });
}

export default {
  id: "hwagyesa",
  name: "화계사",
  nameEn: "Hwagyesa Temple",
  district: "강북구",
  lat: 37.6328,
  lon: 127.0073,
  height: 16,
  colliderRadius: 30,
  detail: "low",
  description: "삼각산 자락 사찰, 대적광전과 범종각",
  create() {
    const g = new THREE.Group();

    // ── Valley floor and north mountain berm ──
    cyl(g, { rTop: 28, h: 0.22, y: -0.22, mat: M.grass, seg: 16 });
    slab(g, { w: 20, d: 14, z: 3, h: 0.1, mat: earth });
    box(g, { w: 26, h: 3.2, d: 9, z: -19, mat: M.grassDark });
    box(g, { w: 24, h: 0.15, d: 8, y: 3.2, z: -19, mat: M.grass });

    // ── 대적광전 on a slight rise, facing south ──
    daejeok(g, { x: -1, z: -6 });
    // 범종각 to the south-east of the hall
    beomjong(g, { x: 10, z: 3 });
    // modest 대웅전 on the west of the courtyard
    daeung(g, { x: -12, z: 5 });

    // 석등 and a small 3-tier feel (lantern pair)
    [[-4, 2], [2, 2]].forEach(([x, z]) => {
      box(g, { w: 0.85, h: 0.25, d: 0.85, x, z, mat: M.graniteDark });
      cyl(g, { rTop: 0.12, rBot: 0.16, h: 1.05, x, y: 0.25, z, mat: M.granite, seg: 6 });
      box(g, { w: 0.55, h: 0.5, d: 0.55, x, y: 1.3, z, mat: M.offWhite });
      pyramidRoof(g, { w: 0.7, d: 0.7, h: 0.35, x, y: 1.8, z, overhang: 0.18, mat: M.graniteDark });
    });

    // ── 일주문 on the south path ──
    slab(g, { w: 4, d: 10, z: 15, h: 0.1, mat: earth });
    [-2.1, 2.1].forEach((dx) => {
      box(g, { w: 0.8, h: 0.35, d: 0.8, x: dx, z: 17, mat: M.graniteDark });
      cyl(g, { rTop: 0.3, h: 3.6, x: dx, y: 0.35, z: 17, mat: M.hanokWood, seg: 8 });
    });
    box(g, { w: 5.8, h: 0.85, d: 1.3, y: 3.95, z: 17, mat: M.dancheong });
    hipRoof(g, { w: 5.0, d: 1.5, h: 1.9, y: 4.8, z: 17, overhang: 1.4, ridge: 0.55 });

    // ── Pines on the 삼각산 slope ──
    [[-8, -21, 8], [0, -23, 9], [8, -22, 8], [14, -18, 7],
      [-16, -16, 7.5], [16, -14, 7], [-18, -8, 6.5], [18, -4, 6.5],
      [-20, 2, 6.5], [18, 10, 6], [-14, 14, 6], [8, 18, 5.5]]
      .forEach(([x, z, h], i) => {
        const y = z < -14 ? 3.2 : 0;
        pineTree(g, { x, y, z, h: h - (i % 4) * 0.2 });
      });
    tree(g, { x: 6, z: 12, h: 6.5, r: 2.1 });

    return g;
  },
};
