// 암사동 선사유적지 (Amsa-dong Prehistoric Settlement Site) - 강동구
// Han-river terrace village north of 올림픽로: a cluster of reconstructed Neolithic pit-houses
// (움집) with thatched conical roofs, a low oval glass/polycarbonate exhibition hall at the
// south gate, a relic shelter over an open pit, dirt paths and pines. Heights 1:1; plan ~0.55 of real.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, cone, prism, tree, slab } from "./_helpers.mjs";

const thatch = material(0xc4a05a, { roughness: 0.98 });
const thatchDark = material(0x9a7a3e, { roughness: 0.98 });
const earth = material(0xb08958, { roughness: 1 });
const polycarb = material(0xd8e4dc, { roughness: 0.28, metalness: 0.18, emissive: 0x1a2820, emissiveIntensity: 0.08 });

/** Reconstructed 움집: shallow earth pit, plaster ring wall, thatched cone, smoke hole. */
function umjip(g, { x, z, r = 3.2, roofH = 4.0, pit = 0.65, experience = false }) {
  cyl(g, { rTop: r + 0.55, rBot: r + 0.75, h: pit + 0.25, x, y: -0.2, z, mat: earth, seg: 10 });
  cyl(g, { rTop: r * 0.82, rBot: r * 0.95, h: 1.05, x, y: pit - 0.15, z, mat: M.hanokWall, seg: 10 });
  const posts = experience ? 8 : 6;
  for (let i = 0; i < posts; i += 1) {
    const a = (i / posts) * Math.PI * 2;
    cyl(g, {
      rTop: 0.12, h: 1.15,
      x: x + Math.cos(a) * r * 0.78, y: pit - 0.1, z: z + Math.sin(a) * r * 0.78,
      mat: M.trunk, seg: 6,
    });
  }
  cone(g, { r: r + 0.55, h: roofH, x, y: pit + 0.75, z, mat: experience ? thatchDark : thatch, seg: 10 });
  cyl(g, { rTop: 0.28, rBot: 0.42, h: 0.35, x, y: pit + 0.75 + roofH - 0.15, z, mat: M.trunk, seg: 8 });
  if (experience) {
    box(g, { w: 1.4, h: 1.5, d: 0.35, x, y: pit - 0.05, z: z + r * 0.9, mat: M.hanokWood });
  }
}

export default {
  id: "amsa-prehistoric-site",
  name: "암사동 선사유적지",
  nameEn: "Amsa-dong Prehistoric Settlement Site",
  district: "강동구",
  lat: 37.5606,
  lon: 127.1305,
  height: 10,
  colliderRadius: 50,
  detail: "medium",
  description: "신석기 움집 복원 마을과 전시관",
  create() {
    const g = new THREE.Group();

    // Terrace: grass field, dirt village yard, Olympic-ro entrance paving to the south.
    cyl(g, { rTop: 48, h: 0.25, y: -0.15, mat: M.grass, seg: 28 });
    cyl(g, { rTop: 22, h: 0.18, x: -2, y: 0.05, z: -8, mat: M.sand, seg: 20 });
    slab(g, { w: 18, d: 16, x: 2, y: 0.05, z: 28, h: 0.2, mat: M.granite });
    box(g, { w: 4.2, h: 0.12, d: 22, x: 1, y: 0.15, z: 8, mat: earth });
    box(g, { w: 22, h: 0.12, d: 3.2, x: -4, y: 0.15, z: -6, mat: earth });

    // Oval glass/polycarbonate 유적전시관 just inside the south gate (타원형 유리 전시관).
    cyl(g, { rTop: 11.2, h: 7.4, x: 2, y: 0.25, z: 26, mat: polycarb, seg: 24, sx: 1.32, sz: 0.68 });
    cyl(g, { rTop: 10.4, h: 2.6, x: 2, y: 0.25, z: 26, mat: M.glass, seg: 24, sx: 1.32, sz: 0.68 });
    cyl(g, { rTop: 11.6, h: 0.45, x: 2, y: 7.55, z: 26, mat: M.aluminum, seg: 24, sx: 1.32, sz: 0.68 });
    cyl(g, { rTop: 6.4, h: 1.7, x: 2, y: 8.0, z: 26, mat: M.glassWhite, seg: 16, sx: 1.2, sz: 0.7 });
    cyl(g, { rTop: 6.8, h: 0.3, x: 2, y: 9.7, z: 26, mat: M.steel, seg: 16, sx: 1.2, sz: 0.7 });
    for (let i = 0; i < 10; i += 1) {
      const a = (i / 10) * Math.PI * 2;
      cyl(g, {
        rTop: 0.22, h: 7.5,
        x: 2 + Math.cos(a) * 13.2, y: 0.25, z: 26 + Math.sin(a) * 6.8,
        mat: M.aluminum, seg: 6,
      });
    }
    box(g, { w: 6.5, h: 3.4, d: 0.4, x: 2, y: 0.25, z: 33.6, mat: M.glass });
    box(g, { w: 8, h: 0.35, d: 3.2, x: 2, y: 3.7, z: 34.6, mat: M.steel });

    // 유구보호각: low steel-and-glass shed over an open house pit.
    box(g, { w: 14, h: 0.35, d: 10, x: 22, y: 4.4, z: 8, mat: M.steel });
    [[-6, -4], [6, -4], [-6, 4], [6, 4]].forEach(([dx, dz]) => {
      cyl(g, { rTop: 0.2, h: 4.4, x: 22 + dx, y: 0.15, z: 8 + dz, mat: M.steelDark, seg: 6 });
    });
    box(g, { w: 12, h: 2.4, d: 0.12, x: 22, y: 1.2, z: 12.9, mat: M.glassWhite });
    cyl(g, { rTop: 3.4, h: 0.45, x: 22, y: -0.15, z: 8, mat: earth, seg: 12 });

    // Restored village (복원움집) plus one walk-in 체험움집.
    [
      [-10, -8, 3.5, 4.2, false],
      [-2, -14, 3.9, 4.5, false],
      [7, -10, 3.2, 4.0, false],
      [14, -16, 2.8, 3.6, false],
      [-16, -16, 3.0, 3.8, false],
      [1, -4, 4.3, 4.8, false],
      [-12, 2, 3.1, 3.9, false],
      [9, 1, 2.9, 3.5, false],
      [-6, -22, 3.3, 4.1, false],
      [16, -5, 2.6, 3.4, false],
      [-4, 6, 3.6, 4.4, true],
    ].forEach(([x, z, r, roofH, experience]) => umjip(g, { x, z, r, roofH, experience }));

    // Timber rail along the village edge and a simple south ticket gate.
    for (let i = 0; i < 7; i += 1) {
      const x = -28 + i * 5.2;
      box(g, { w: 0.22, h: 1.5, d: 0.22, x, y: 0.15, z: 18, mat: M.hanokWood });
      if (i < 6) box(g, { w: 5.2, h: 0.12, d: 0.12, x: x + 2.6, y: 1.15, z: 18, mat: M.hanokWood });
    }
    box(g, { w: 7.5, h: 2.6, d: 0.45, x: 2, y: 0.2, z: 40, mat: M.hanokWood });
    box(g, { w: 2.2, h: 2.2, d: 0.2, x: 2, y: 0.35, z: 40.2, mat: M.glassDark });

    // Pines (kept below the hall clerestory so height stays ~10 m).
    [[-28, -20], [-24, 8], [-20, -28], [24, -22], [28, 2], [20, 18], [-30, 6], [30, 20]].forEach(([x, z], i) => {
      cyl(g, { rTop: 0.22, rBot: 0.38, h: 3.2, x, y: 0.15, z, mat: M.trunk, seg: 6 });
      cone(g, { r: 2.1, h: 4.6, x, y: 2.8, z, mat: i % 2 ? M.foliage : M.grassDark, seg: 8 });
    });
    tree(g, { x: -26, y: 0.15, z: 24, h: 7.2, r: 2.4 });
    tree(g, { x: 26, y: 0.15, z: 30, h: 6.8, r: 2.2 });

    // Low office / toilet pavilion west of the hall.
    box(g, { w: 8, h: 3.2, d: 6, x: -22, y: 0.2, z: 28, mat: M.offWhite });
    box(g, { w: 8.4, h: 0.3, d: 6.4, x: -22, y: 3.4, z: 28, mat: M.concreteDark });

    return g;
  },
};
