// 선정릉 (Seonjeongneung, 선릉 1495 / 정릉 1562) - 강남구
// Joseon royal tomb park in Samseong-dong. 선릉 is a 동원이강릉: one 정자각 and two grass mounds
// (성종 west, 정현왕후 east) approached from the south through a 홍살문 and the dual 향로/어로.
// 정릉 (중종) is a single mound with its own gate and T-hall to the east. Stone civil/military
// figures are kept simple. The park is compressed to r = 50; hall/mound heights stay near 10 m.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, sphere, dome, prism, gableRoof, tree, subgroup } from "./_helpers.mjs";

const PINE = material(0x2f6b3a, { roughness: 1 });

function hongsalmun(parent, { x, z, ry = 0, scale = 1 }) {
  const s = subgroup(parent, { x, z, ry });
  const span = 2.4 * scale;
  [-span, span].forEach((dx) => {
    box(s, { w: 0.7 * scale, h: 0.35, d: 0.7 * scale, x: dx, mat: M.graniteDark });
    cyl(s, { rTop: 0.2 * scale, h: 4.5 * scale, x: dx, y: 0.35, mat: M.red, seg: 8 });
  });
  box(s, { w: 6.1 * scale, h: 0.32 * scale, d: 0.42 * scale, y: 4.85 * scale, mat: M.red });
  box(s, { w: 6.1 * scale, h: 0.22 * scale, d: 0.42 * scale, y: 5.35 * scale, mat: M.red });
  const n = scale > 0.85 ? 11 : 9;
  for (let i = 0; i < n; i += 1) {
    box(s, {
      w: 0.15 * scale, h: 1.45 * scale, d: 0.15 * scale,
      x: -2.5 * scale + i * (5 * scale) / (n - 1), y: 5.55 * scale, mat: M.red,
    });
  }
}

/** 정자각: T-plan memorial hall (정전 E–W + 배위청 toward the south / +z), gable roofs. */
function jeongjagak(parent, { x, z, ry = 0, scale = 1 }) {
  const s = subgroup(parent, { x, z, ry });
  const k = scale;
  const points = [
    [-7 * k, -4 * k], [7 * k, -4 * k], [7 * k, 3 * k], [2.3 * k, 3 * k],
    [2.3 * k, 10.5 * k], [-2.3 * k, 10.5 * k], [-2.3 * k, 3 * k], [-7 * k, 3 * k],
  ];
  const pad = points.map(([px, pz]) => [px * 1.12, pz + (pz > 0 ? 0.6 * k : -0.6 * k)]);
  prism(s, { points: pad, h: 1.05 * k, mat: M.granite });
  box(s, { w: 13.2 * k, h: 3.7 * k, d: 6.4 * k, y: 1.05 * k, z: -0.5 * k, mat: M.hanokWall });
  box(s, { w: 4.2 * k, h: 3.1 * k, d: 7.2 * k, y: 1.05 * k, z: 6.6 * k, mat: M.hanokWall });
  const nx = 5;
  for (let i = 0; i < nx; i += 1) {
    const px = -6 * k + i * (12 * k) / (nx - 1);
    cyl(s, { rTop: 0.26 * k, h: 3.7 * k, x: px, y: 1.05 * k, z: 2.6 * k, mat: M.hanokWood, seg: 6 });
    cyl(s, { rTop: 0.26 * k, h: 3.7 * k, x: px, y: 1.05 * k, z: -3.6 * k, mat: M.hanokWood, seg: 6 });
  }
  [-1.6, 1.6].forEach((dx) => {
    cyl(s, { rTop: 0.24 * k, h: 3.1 * k, x: dx * k, y: 1.05 * k, z: 10.2 * k, mat: M.hanokWood, seg: 6 });
  });
  box(s, { w: 14.4 * k, h: 0.85 * k, d: 7.6 * k, y: 4.75 * k, z: -0.5 * k, mat: M.dancheong });
  box(s, { w: 5 * k, h: 0.7 * k, d: 8 * k, y: 4.15 * k, z: 6.6 * k, mat: M.dancheong });
  gableRoof(s, { w: 14 * k, d: 7.4 * k, h: 4.3 * k, y: 5.6 * k, z: -0.5 * k, overhang: 1.1 * k });
  gableRoof(s, { w: 7.8 * k, d: 5 * k, h: 2.8 * k, y: 4.85 * k, z: 6.8 * k, overhang: 0.8 * k, ry: Math.PI / 2 });
}

function mound(parent, { x, z, r = 7, h = 6.1, screen = false }) {
  cyl(parent, { rTop: r + 1.4, h: 0.45, x, z, mat: M.grassDark, seg: 16 });
  dome(parent, { r, x, y: 0.45, z, mat: M.grass, seg: 16, scaleY: h / r });
  const n = 14;
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    box(parent, {
      w: 0.32, h: 0.85, d: 1.05,
      x: x + Math.cos(a) * r, y: 0.45, z: z + Math.sin(a) * r,
      ry: -a, mat: M.granite,
    });
  }
  if (screen) {
    cyl(parent, { rTop: r * 0.7, h: 1.45, x, y: 0.45, z, mat: M.graniteDark, seg: 12 });
    cyl(parent, { rTop: r * 0.55, h: 0.2, x, y: 1.85, z, mat: M.granite, seg: 12 });
  }
}

function seokin(parent, { x, z, h = 2.5 }) {
  box(parent, { w: 0.72, h: h * 0.68, d: 0.48, x, y: 0, z, mat: M.graniteDark });
  sphere(parent, { r: 0.26, x, y: h * 0.68, z, mat: M.granite, seg: 8 });
  box(parent, { w: 1.05, h: 0.14, d: 0.16, x, y: h * 0.5, z, mat: M.granite });
}

function lantern(parent, { x, z }) {
  box(parent, { w: 1.0, h: 0.3, d: 1.0, x, z, mat: M.graniteDark });
  cyl(parent, { rTop: 0.14, rBot: 0.18, h: 1.15, x, y: 0.3, z, mat: M.granite, seg: 6 });
  box(parent, { w: 0.65, h: 0.55, d: 0.65, x, y: 1.45, z, mat: M.offWhite });
  box(parent, { w: 0.95, h: 0.18, d: 0.95, x, y: 2.0, z, mat: M.graniteDark });
}

export default {
  id: "seonjeongneung",
  name: "선정릉",
  nameEn: "Seonjeongneung Royal Tombs",
  district: "강남구",
  lat: 37.509,
  lon: 127.0475,
  height: 10,
  colliderRadius: 50,
  detail: "low",
  description: "조선 왕릉, 홍살문과 정자각, 봉분",
  create() {
    const g = new THREE.Group();

    cyl(g, { rTop: 47.5, h: 0.25, y: -0.1, mat: M.grass, seg: 16 });

    // ── 선릉: 홍살문 → 향로/어로 → 정자각 → two mounds ──────────────────────
    hongsalmun(g, { x: -8, z: 36 });
    box(g, { w: 3.2, h: 0.18, d: 2.4, x: -12.5, z: 36, mat: M.granite }); // 판위
    box(g, { w: 1.55, h: 0.22, d: 24, x: -9.4, z: 22, mat: M.granite }); // 향로 (west, higher)
    box(g, { w: 1.55, h: 0.12, d: 24, x: -6.6, z: 22, mat: M.limestone }); // 어로
    jeongjagak(g, { x: -8, z: 6 });
    // 수복방 / 수라간 — small service halls beside the path.
    box(g, { w: 4.5, h: 2.6, d: 3.4, x: -16, z: 20, mat: M.hanokWall });
    gableRoof(g, { w: 4.5, d: 3.4, h: 1.6, x: -16, y: 2.6, z: 20, overhang: 0.6 });
    box(g, { w: 4.5, h: 2.6, d: 3.4, x: 0, z: 20, mat: M.hanokWall });
    gableRoof(g, { w: 4.5, d: 3.4, h: 1.6, x: 0, y: 2.6, z: 20, overhang: 0.6 });

    mound(g, { x: -20, z: -18, r: 7.2, h: 6.3, screen: true }); // 성종
    mound(g, { x: 4, z: -20, r: 6.6, h: 5.8, screen: false }); // 정현왕후
    seokin(g, { x: -22.2, z: -8.5, h: 2.6 });
    seokin(g, { x: -17.8, z: -8.5, h: 2.4 });
    seokin(g, { x: 1.8, z: -11, h: 2.4 });
    seokin(g, { x: 6.2, z: -11, h: 2.3 });
    lantern(g, { x: -20, z: -9.2 });

    // ── 정릉 (중종): smaller separate axis to the east ────────────────────────
    hongsalmun(g, { x: 28, z: 24, scale: 0.82 });
    box(g, { w: 1.3, h: 0.18, d: 14, x: 27, z: 16, mat: M.granite });
    box(g, { w: 1.3, h: 0.1, d: 14, x: 29, z: 16, mat: M.limestone });
    jeongjagak(g, { x: 28, z: 4, scale: 0.78 });
    mound(g, { x: 28, z: -16, r: 6.4, h: 5.7, screen: true });
    seokin(g, { x: 25.8, z: -7.5, h: 2.3 });
    seokin(g, { x: 30.2, z: -7.5, h: 2.2 });

    const pines = [
      [-36, 8, 9], [-34, -12, 8.5], [-28, -30, 9], [-12, -34, 10], [8, -36, 9.5],
      [26, -32, 9], [38, -6, 8.5], [38, 12, 8], [28, 30, 8.5], [8, 38, 9],
      [-14, 38, 8.5], [-30, 28, 9], [16, -6, 7], [-26, 4, 7.5],
    ];
    pines.forEach(([x, z, h], i) => {
      const r = Math.min(h * 0.26, 49.2 - Math.hypot(x, z));
      tree(g, { x, z, h, r, mat: i % 2 === 0 ? PINE : M.foliage });
    });

    return g;
  },
};
