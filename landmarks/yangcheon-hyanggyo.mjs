// 양천향교 (Yangcheon Hyanggyo, 1411 / restored 1981) - 강서구
// Seoul's only surviving hyanggyo, on the slope of 궁산 in 가양동. 전학후묘: the lecture court
// (외삼문, 동재·서재, 명륜당 with a 팔작 roof) in front, then stairs to the shrine court
// (내삼문, 대성전 with a 맞배 roof, 전사청 to the west). 홍살문 marks the south gate.
// Terraces are compressed to r = 26; hall heights stay realistic (~12 m to the 명륜당 ridge).
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, hipRoof, gableRoof, hanokWall, tree, subgroup } from "./_helpers.mjs";

const earth = material(0xb8a98a, { roughness: 1 });
const lattice = material(0x835a3e, { roughness: 0.85 });

export default {
  id: "yangcheon-hyanggyo",
  name: "양천향교",
  nameEn: "Yangcheon Hyanggyo",
  district: "강서구",
  lat: 37.573,
  lon: 126.8399,
  height: 12,
  colliderRadius: 26,
  detail: "low",
  description: "서울 유일의 향교, 명륜당과 대성전",
  create() {
    const g = new THREE.Group();

    cyl(g, { rTop: 25.4, h: 0.25, y: -0.2, mat: M.grass, seg: 24 });

    // ── Terraces: lower lecture court, upper shrine court (전학후묘) ──
    const LY = 0.15;
    const MY = 1.35; // 명륜당 terrace
    const SY = 3.05; // 대성전 terrace
    box(g, { w: 28, h: 0.2, d: 18, y: LY, z: 6, mat: earth });
    box(g, { w: 22, h: MY, d: 12, z: -4, mat: M.graniteDark });
    box(g, { w: 21.4, h: 0.12, d: 11.4, y: MY, z: -4, mat: earth });
    box(g, { w: 18, h: SY, d: 12, z: -16.5, mat: M.graniteDark });
    box(g, { w: 17.4, h: 0.12, d: 11.4, y: SY, z: -16.5, mat: earth });
    // Stairs: plaza → 명륜당 court, then up to 대성전
    for (let i = 0; i < 5; i += 1) {
      box(g, { w: 4.2, h: MY - i * (MY / 5), d: 0.55, z: 2.4 + i * 0.5, mat: M.granite });
    }
    for (let i = 0; i < 6; i += 1) {
      const rise = SY - MY;
      box(g, { w: 3.6, h: MY + rise - i * (rise / 6), d: 0.5, y: 0, z: -9.6 + i * 0.45, mat: M.granite });
    }

    // ── 홍살문 (south) ──
    hongsalmun(g, { z: 20.5 });
    // Approach path
    box(g, { w: 3.2, h: 0.12, d: 8, z: 16.5, mat: earth });

    // ── 외삼문 ──
    sammun(g, { z: 12.4, w: 9.5, d: 3.4, y: 0 });

    // ── 동재 / 서재 facing each other across the courtyard ──
    hall(g, { x: 8.4, z: 5.2, w: 8.2, d: 4.4, ry: -Math.PI / 2, platformH: 0.45, wallH: 2.8, roofH: 2.6, overhang: 1.3 });
    hall(g, { x: -8.4, z: 5.2, w: 8.2, d: 4.4, ry: Math.PI / 2, platformH: 0.45, wallH: 2.8, roofH: 2.6, overhang: 1.3 });

    // ── 명륜당 (5-kan hip-roof lecture hall) on the middle terrace ──
    hall(g, {
      x: 0, y: MY, z: -4.2, w: 13.5, d: 7.2,
      platformH: 0.7, wallH: 3.5, roofH: 4.4, overhang: 2.1, porch: true,
    });

    // ── 내삼문 ──
    sammun(g, { z: -10.6, w: 8.2, d: 3.0, y: SY - 0.15 });

    // ── 대성전 (3-kan gable shrine) ──
    hall(g, {
      x: 0, y: SY, z: -17.4, w: 9.4, d: 6.2,
      platformH: 0.65, wallH: 3.3, roofH: 4.2, overhang: 1.6, gable: true,
    });
    // 전사청, west of 대성전, facing east
    hall(g, {
      x: -9.2, y: SY, z: -16.2, w: 6.4, d: 4.2, ry: Math.PI / 2,
      platformH: 0.45, wallH: 2.6, roofH: 2.4, overhang: 1.2,
    });

    // ── Courtyard walls ──
    hanokWall(g, { length: 14, x: 13.2, z: 4, h: 2.2, ry: Math.PI / 2 });
    hanokWall(g, { length: 14, x: -13.2, z: 4, h: 2.2, ry: Math.PI / 2 });
    hanokWall(g, { length: 10, x: 8, z: -10.4, y: MY, h: 2.1 });
    hanokWall(g, { length: 10, x: -8, z: -10.4, y: MY, h: 2.1 });

    // Stone memorial stelae west of the approach
    [-3.6, -1.8].forEach((x) => {
      box(g, { w: 0.7, h: 0.35, d: 0.7, x, z: 16.2, mat: M.graniteDark });
      box(g, { w: 0.45, h: 1.6, d: 0.22, x, y: 0.35, z: 16.2, mat: M.granite });
    });

    // ── Ginkgo and pines ──
    [[10, -17.5, 9], [-11, 8, 8], [12, 8, 8.5], [-10, -6, 7.5], [6, 18, 7], [-7, 18.5, 6.5], [0, -22.5, 8]].forEach(([x, z, h]) => {
      tree(g, { x, z, h, r: Math.min(h * 0.28, 25.2 - Math.hypot(x, z)) });
    });

    return g;
  },
};

/** Single-storey hanok: platform, plaster, red columns, 단청 band, hip or gable roof. */
function hall(g, {
  x, y = 0, z, w, d, ry = 0,
  platformH = 0.7, wallH = 3.4, roofH = 3.6, overhang = 1.8,
  gable = false, porch = false,
}) {
  const s = subgroup(g, { x, y, z, ry });
  box(s, { w: w + 1.6, h: platformH, d: d + 1.6, mat: M.granite });
  box(s, { w: w - 1.0, h: wallH, d: d - 1.0, y: platformH, mat: M.hanokWall });
  const nx = Math.max(2, Math.round(w / 3.2));
  for (let i = 0; i <= nx; i += 1) {
    const px = -w / 2 + (w / nx) * i;
    cyl(s, { rTop: 0.24, h: wallH, x: px, y: platformH, z: d / 2, mat: M.hanokWood, seg: 6 });
    cyl(s, { rTop: 0.24, h: wallH, x: px, y: platformH, z: -d / 2, mat: M.hanokWood, seg: 6 });
  }
  if (porch) {
    box(s, { w: w - 1.6, h: wallH * 0.72, d: 0.2, y: platformH + 0.3, z: d / 2 + 0.15, mat: lattice });
  }
  box(s, { w: w + 0.8, h: 0.8, d: d + 0.8, y: platformH + wallH, mat: M.dancheong });
  const roofY = platformH + wallH + 0.8;
  if (gable) {
    gableRoof(s, { w, d, h: roofH, y: roofY, overhang });
  } else {
    hipRoof(s, { w, d, h: roofH, y: roofY, overhang });
  }
}

/** Three-bay gate pavilion (외삼문 / 내삼문). */
function sammun(g, { x = 0, y = 0, z, w, d }) {
  const s = subgroup(g, { x, y, z });
  box(s, { w: w + 1.2, h: 0.4, d: d + 1.0, mat: M.granite });
  box(s, { w: w - 0.6, h: 2.8, d: d - 0.8, y: 0.4, mat: M.hanokWall });
  [-w * 0.32, 0, w * 0.32].forEach((px) => {
    box(s, { w: 1.15, h: 2.2, d: 0.7, x: px, y: 0.4, z: d / 2 - 0.15, mat: M.hanokWood });
  });
  [-w / 2, w / 2].forEach((px) => {
    cyl(s, { rTop: 0.22, h: 2.8, x: px, y: 0.4, z: d / 2, mat: M.hanokWood, seg: 6 });
    cyl(s, { rTop: 0.22, h: 2.8, x: px, y: 0.4, z: -d / 2, mat: M.hanokWood, seg: 6 });
  });
  box(s, { w: w + 0.7, h: 0.7, d: d + 0.7, y: 3.2, mat: M.dancheong });
  hipRoof(s, { w, d, h: 2.2, y: 3.9, overhang: 1.3, ridge: 0.55 });
}

/** 홍살문: two red posts, lintel, vertical spikes. */
function hongsalmun(g, { z }) {
  [-2.15, 2.15].forEach((x) => {
    box(g, { w: 0.7, h: 0.3, d: 0.7, x, z, mat: M.graniteDark });
    cyl(g, { rTop: 0.22, h: 4.2, x, y: 0.3, z, mat: M.red, seg: 8 });
  });
  box(g, { w: 5.1, h: 0.28, d: 0.28, y: 4.35, z, mat: M.red });
  box(g, { w: 5.1, h: 0.22, d: 0.22, y: 3.55, z, mat: M.red });
  for (let i = 0; i < 11; i += 1) {
    box(g, { w: 0.1, h: 1.15, d: 0.1, x: -2.0 + i * 0.4, y: 4.55, z, mat: M.red });
  }
}
