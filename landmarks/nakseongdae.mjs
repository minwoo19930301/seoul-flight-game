// 낙성대 안국사 (Nakseongdae / Anguksa, 1974) - 관악구
// Shrine to General 강감찬 on the site named for the star that fell at his birth. South-facing
// compound compressed to the collider: 홍살문 → 안국문(외삼문, 맞배) → lawn with the 4.5 m
// 삼층석탑 (no 상륜) on the west and the 사적비 on the east → 내삼문 → double 월대 and the
// 5×2-bay 안국사 hall under a 청기와 팔작 roof (after 부석사 무량수전). 사괴석 walls, pines, lawn.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, frustum, hipRoof, gableRoof, hanokWall, tree, subgroup } from "./_helpers.mjs";

const pine = material(0x2f6b3a, { roughness: 1 });
const earth = material(0xb8a98a, { roughness: 1 });
const lattice = material(0x6b3a28, { roughness: 0.85 });

/** 5칸×2칸 shrine hall on a double 월대, 청기와 hip roof. */
function anguksa(g, { x, z }) {
  const s = subgroup(g, { x, z });
  box(s, { w: 20, h: 1.05, d: 12.2, mat: M.graniteDark }); // 하월대
  box(s, { w: 17.2, h: 0.95, d: 9.6, y: 1.05, mat: M.granite }); // 상월대
  // South stairs on both terraces.
  for (let i = 0; i < 3; i += 1) {
    box(s, { w: 4.2, h: 1.05 - i * 0.32, d: 0.55, y: 0, z: 6.4 + i * 0.55, mat: M.granite });
  }
  for (let i = 0; i < 2; i += 1) {
    box(s, { w: 3.4, h: 0.95 - i * 0.4, d: 0.5, y: 1.05, z: 5.05 + i * 0.5, mat: M.granite });
  }
  const y0 = 2.0;
  const w = 14.2;
  const d = 6.4;
  const wallH = 3.35;
  box(s, { w: w - 1.1, h: wallH, d: d - 1.1, y: y0, mat: M.hanokWall });
  // 정면 5칸 · 측면 2칸 columns (배흘림 suggested by a slightly thicker base).
  for (let i = 0; i <= 5; i += 1) {
    const px = -w / 2 + (w / 5) * i;
    cyl(s, { rTop: 0.3, rBot: 0.36, h: wallH, x: px, y: y0, z: d / 2, mat: M.hanokWood, seg: 8 });
    cyl(s, { rTop: 0.3, rBot: 0.36, h: wallH, x: px, y: y0, z: -d / 2, mat: M.hanokWood, seg: 8 });
  }
  [-1, 1].forEach((side) => {
    cyl(s, { rTop: 0.3, rBot: 0.36, h: wallH, x: side * (w / 2), y: y0, z: 0, mat: M.hanokWood, seg: 8 });
  });
  // Lattice doors on the south bays.
  for (let i = 0; i < 5; i += 1) {
    box(s, { w: 2.0, h: 2.5, d: 0.12, x: -w / 2 + w / 10 + (w / 5) * i, y: y0 + 0.15, z: d / 2 - 0.45, mat: lattice });
  }
  box(s, { w: w + 1.15, h: 0.95, d: d + 1.15, y: y0 + wallH, mat: M.dancheong });
  hipRoof(s, { w, d, h: 5.15, y: y0 + wallH + 0.95, overhang: 2.3, ridge: 0.5, mat: M.roofTileBlue });
}

/** Three-bay gate: open columns, 단청 band, roof. `gable` = 맞배 (안국문). */
function sammun(g, { x, z, w, d, gable = false, wallH = 3.1, roofH = 2.6 }) {
  const s = subgroup(g, { x, z });
  box(s, { w: w + 1.4, h: 0.45, d: d + 1.2, mat: M.granite });
  for (let i = 0; i <= 3; i += 1) {
    const px = -w / 2 + (w / 3) * i;
    cyl(s, { rTop: 0.26, h: wallH, x: px, y: 0.45, z: d / 2, mat: M.hanokWood, seg: 6 });
    cyl(s, { rTop: 0.26, h: wallH, x: px, y: 0.45, z: -d / 2, mat: M.hanokWood, seg: 6 });
  }
  // Side plaster panels; centre bays stay open.
  [-1, 1].forEach((side) => {
    box(s, { w: w / 3 - 0.3, h: wallH - 0.2, d: 0.18, x: side * (w / 3), y: 0.45, z: 0, mat: M.hanokWall });
  });
  box(s, { w: w + 0.9, h: 0.75, d: d + 0.9, y: 0.45 + wallH, mat: M.dancheong });
  if (gable) {
    gableRoof(s, { w, d, h: roofH, y: 0.45 + wallH + 0.75, overhang: 1.3, mat: M.roofTile });
  } else {
    hipRoof(s, { w, d, h: roofH, y: 0.45 + wallH + 0.75, overhang: 1.5, ridge: 0.7, mat: M.roofTile });
  }
}

/** 낙성대 삼층석탑: granite, three roof-stones, 상륜 gone (a stub only). */
function pagoda(g, { x, y = 0, z }) {
  const mat = M.graniteDark;
  box(g, { w: 3.1, h: 0.4, d: 3.1, x, y, z, mat: M.granite });
  box(g, { w: 2.55, h: 0.5, d: 2.55, x, y: y + 0.4, z, mat });
  let h = 0.9;
  for (let i = 0; i < 3; i += 1) {
    const s = 2.05 * (1 - i * 0.17);
    box(g, { w: s * 0.56, h: 0.92, d: s * 0.56, x, y: y + h, z, mat });
    h += 0.92;
    frustum(g, { wBot: s * 0.5, dBot: s * 0.5, wTop: s * 1.08, dTop: s * 1.08, h: 0.36, x, y: y + h, z, mat });
    h += 0.36;
  }
  box(g, { w: 0.5, h: 0.22, d: 0.5, x, y: y + h, z, mat }); // damaged 상륜 stub
}

export default {
  id: "nakseongdae",
  name: "낙성대",
  nameEn: "Nakseongdae",
  district: "관악구",
  lat: 37.4714,
  lon: 126.9596,
  height: 12,
  colliderRadius: 30,
  detail: "low",
  description: "강감찬 장군 사당 안국사와 삼층석탑",
  create() {
    const g = new THREE.Group();

    // Ground: lawn courtyard, packed-earth path on the axis, a hint of park around the walls.
    cyl(g, { rTop: 29, h: 0.22, y: -0.22, mat: M.grass, seg: 16 });
    box(g, { w: 28, h: 0.1, d: 32, z: 2, mat: M.grassDark });
    box(g, { w: 5.5, h: 0.12, d: 36, z: 4, mat: earth });

    // 사괴석 담장 — four sides, gaps at the south gate.
    hanokWall(g, { length: 30, x: 0, z: -18.5, h: 2.2 });
    hanokWall(g, { length: 32, x: -15.6, z: 0, h: 2.2, ry: Math.PI / 2 });
    hanokWall(g, { length: 32, x: 15.6, z: 0, h: 2.2, ry: Math.PI / 2 });
    hanokWall(g, { length: 11, x: -9.5, z: 17.2, h: 2.2 });
    hanokWall(g, { length: 11, x: 9.5, z: 17.2, h: 2.2 });

    // Axis, south → north: 홍살문, 안국문, lawn relics, 내삼문, 안국사.
    const hongsal = subgroup(g, { z: 22.5 });
    [-2.4, 2.4].forEach((x) => {
      cyl(hongsal, { rTop: 0.16, h: 4.2, x, mat: M.red, seg: 6 });
    });
    box(hongsal, { w: 5.6, h: 0.22, d: 0.22, y: 3.5, mat: M.red });
    box(hongsal, { w: 5.6, h: 0.16, d: 0.16, y: 4.15, mat: M.red });
    for (let i = 0; i < 9; i += 1) {
      box(hongsal, { w: 0.1, h: 0.85, d: 0.1, x: -2.4 + i * 0.6, y: 4.25, mat: M.red });
    }

    sammun(g, { x: 0, z: 14.2, w: 9.5, d: 3.4, gable: true, wallH: 3.0, roofH: 2.4 }); // 안국문
    pagoda(g, { x: -7.2, y: 0.1, z: 4.2 });
    // 고려강감찬장군사적비
    box(g, { w: 2.0, h: 0.45, d: 1.3, x: 7.2, y: 0.1, z: 4.2, mat: M.graniteDark });
    box(g, { w: 1.15, h: 2.5, d: 0.4, x: 7.2, y: 0.55, z: 4.2, mat: M.granite });
    box(g, { w: 1.35, h: 0.2, d: 0.5, x: 7.2, y: 3.05, z: 4.2, mat: M.graniteDark });

    sammun(g, { x: 0, z: -2.6, w: 8.2, d: 3.2, gable: false, wallH: 2.9, roofH: 2.3 }); // 내삼문
    anguksa(g, { x: 0, z: -11.2 });

    // 향나무 on the 상월대 and pines inside / just outside the walls.
    cyl(g, { rTop: 0.12, rBot: 0.2, h: 1.6, x: -6.4, y: 2.0, z: -8.4, mat: M.trunk, seg: 6 });
    cyl(g, { rTop: 0.9, rBot: 1.1, h: 1.8, x: -6.4, y: 3.3, z: -8.4, mat: pine, seg: 7 });
    [
      [-12.5, 8, 8], [12.5, 8.2, 8.5], [-13, -8, 9], [13, -8.5, 8.5],
      [-11, 20, 7.5], [11, 20, 7.5], [-10, -16, 8], [10, -16.2, 8],
    ].forEach(([x, z, h]) => tree(g, { x, z, h, r: 2.3, mat: pine }));

    return g;
  },
};
