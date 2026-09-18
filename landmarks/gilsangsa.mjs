// 길상사 (Gilsangsa Temple, 1997, former 대원각) - 성북구
// Seongbuk-dong hillside temple under pines: 극락전 is a ㄷ-plan hanok (대원각 본채) with a
// 팔작 roof and NO dancheong — exposed wood beams, plaster walls. South courtyard with 범종각,
// 일주문 on the entrance path, 길상보탑 (4-lion 7-tier pagoda) to the east, 지장전 / 진영각
// stepped up the slope. Compressed to r = 30; hall ridge ≈ 14 m.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, cone, sphere, hipRoof, pyramidRoof, stonePagoda, tree, subgroup } from "./_helpers.mjs";

const earth = material(0xb8a98a, { roughness: 1 });
const pine = material(0x2f6b3a, { roughness: 1 });
const lattice = material(0x835a3e, { roughness: 0.85 });

/** Single-storey hall. Default beams are bare wood (길상사 극락전 has no 단청). */
function hall(g, {
  x, y = 0, z, w, d, ry = 0,
  platformH = 0.8, pad = 1, wallH = 3.5, roofH = 3.6, overhang = 2.0,
  wallMat = M.hanokWall, beamMat = M.hanokWood, columns = true,
}) {
  const s = subgroup(g, { x, y, z, ry });
  if (platformH > 0) box(s, { w: w + pad * 2, h: platformH, d: d + pad * 2, mat: M.granite });
  box(s, { w: w - 1, h: wallH, d: d - 1, y: platformH, mat: wallMat });
  if (columns) {
    const nx = Math.max(2, Math.round(w / 3.2));
    for (let i = 0; i <= nx; i += 1) {
      const px = -w / 2 + (w / nx) * i;
      cyl(s, { rTop: 0.26, h: wallH, x: px, y: platformH, z: d / 2, mat: M.hanokWood, seg: 6 });
      cyl(s, { rTop: 0.26, h: wallH, x: px, y: platformH, z: -d / 2, mat: M.hanokWood, seg: 6 });
    }
  }
  box(s, { w: w + 0.9, h: 0.85, d: d + 0.9, y: platformH + wallH, mat: beamMat });
  hipRoof(s, { w, d, h: roofH, y: platformH + wallH + 0.85, overhang });
  return platformH + wallH + 0.85 + roofH;
}

function lantern(g, { x, y = 0, z }) {
  box(g, { w: 0.95, h: 0.3, d: 0.95, x, y, z, mat: M.graniteDark });
  cyl(g, { rTop: 0.14, rBot: 0.18, h: 1.1, x, y: y + 0.3, z, mat: M.granite, seg: 6 });
  box(g, { w: 0.65, h: 0.55, d: 0.65, x, y: y + 1.4, z, mat: M.offWhite });
  pyramidRoof(g, { w: 0.8, d: 0.8, h: 0.4, x, y: y + 1.95, z, overhang: 0.2, mat: M.graniteDark });
}

/** Open 범종각: four posts, bronze bell, pyramid roof. */
function bellPavilion(g, { x, z }) {
  const s = subgroup(g, { x, z });
  box(s, { w: 4.2, h: 0.45, d: 4.2, mat: M.granite });
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    cyl(s, { rTop: 0.2, h: 2.8, x: sx * 1.4, y: 0.45, z: sz * 1.4, mat: M.hanokWood, seg: 6 });
  });
  cyl(s, { rTop: 0.62, rBot: 0.78, h: 1.35, y: 1.2, mat: M.bronze, seg: 10 });
  box(s, { w: 3.6, h: 0.5, d: 3.6, y: 3.25, mat: M.hanokWood });
  pyramidRoof(s, { w: 3.2, d: 3.2, h: 1.6, y: 3.75, overhang: 1.1 });
}

export default {
  id: "gilsangsa",
  name: "길상사",
  nameEn: "Gilsangsa Temple",
  district: "성북구",
  lat: 37.5989,
  lon: 126.994,
  height: 14,
  colliderRadius: 30,
  detail: "low",
  description: "성북동 산자락 사찰, 극락전",
  create() {
    const g = new THREE.Group();

    // ── Hillside: grass slopes, two terraces rising to the north, packed-earth 마당 ──
    cyl(g, { rTop: 29.4, h: 0.28, y: -0.15, mat: M.grass, seg: 16 });
    const TY = 1.6;
    box(g, { w: 32, h: TY, d: 14, z: -14, mat: M.rockLight }); // upper terrace
    box(g, { w: 31.2, h: 0.12, d: 13.4, y: TY, z: -14, mat: earth });
    box(g, { w: 22, h: 0.16, d: 16, z: 2, mat: earth }); // courtyard
    for (let i = 0; i < 5; i += 1) {
      box(g, { w: 4.6, h: TY - i * (TY / 5), d: 0.55, z: -6.6 + i * 0.55, mat: M.granite });
    }

    // ── 극락전: ㄷ-plan hanok, plain wood (no 단청), facing the south courtyard ──
    hall(g, { x: 0, y: TY, z: -13.5, w: 16, d: 8, platformH: 1.0, pad: 1.2, wallH: 3.8, roofH: 4.2, overhang: 2.3 });
    hall(g, { x: -9.2, y: TY, z: -19.2, w: 6.4, d: 10, platformH: 0.7, pad: 0.8, wallH: 3.3, roofH: 3.2, overhang: 1.6 });
    hall(g, { x: 9.2, y: TY, z: -19.2, w: 6.4, d: 10, platformH: 0.7, pad: 0.8, wallH: 3.3, roofH: 3.2, overhang: 1.6 });
    lantern(g, { x: -3.4, y: TY + 0.12, z: -7.4 });
    lantern(g, { x: 3.4, y: TY + 0.12, z: -7.4 });

    // ── 범종각 on the courtyard, 지장전 to the west ────────────────────────
    bellPavilion(g, { x: 8.5, z: 1.2 });
    hall(g, { x: -12, z: 1.5, w: 8, d: 5.5, platformH: 0.55, pad: 0.7, wallH: 3.1, roofH: 2.9, overhang: 1.6, columns: false, wallMat: lattice });

    // ── 진영각 (highest, small hall) on a rear step ────────────────────────
    box(g, { w: 10, h: 1.1, d: 7, z: -25.2, mat: M.rock });
    hall(g, { x: 0, y: 1.1, z: -25.2, w: 7.2, d: 5, platformH: 0.45, pad: 0.6, wallH: 2.8, roofH: 2.6, overhang: 1.4, columns: false });

    // ── 길상보탑: four lions under a 7-tier stone pagoda, east of the 마당 ──
    const px = 14.5;
    const pz = -4;
    box(g, { w: 3.6, h: 0.45, d: 3.6, x: px, z: pz, mat: M.granite });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      box(g, { w: 0.7, h: 0.55, d: 1.05, x: px + sx * 1.05, y: 0.45, z: pz + sz * 0.85, mat: M.graniteDark });
      sphere(g, { r: 0.28, x: px + sx * 1.05, y: 0.95, z: pz + sz * 1.25, mat: M.graniteDark, seg: 6 });
    });
    stonePagoda(g, { tiers: 7, baseW: 2.0, x: px, y: 1.0, z: pz });

    // ── 일주문 on the south path ───────────────────────────────────────────
    box(g, { w: 3.2, h: 0.14, d: 12, z: 16, mat: earth });
    [-2.15, 2.15].forEach((dx) => {
      box(g, { w: 0.85, h: 0.35, d: 0.85, x: dx, z: 20.5, mat: M.graniteDark });
      cyl(g, { rTop: 0.3, h: 3.5, x: dx, y: 0.35, z: 20.5, mat: M.hanokWood, seg: 8 });
    });
    box(g, { w: 5.8, h: 0.85, d: 1.2, y: 3.85, z: 20.5, mat: M.hanokWood });
    hipRoof(g, { w: 5.0, d: 1.4, h: 2.0, y: 4.7, z: 20.5, overhang: 1.5, ridge: 0.62 });

    // ── Stone 관음 figure (최종태) east of the path, and a low 담장 ────────
    cyl(g, { rTop: 0.22, rBot: 0.32, h: 1.5, x: 10.5, y: 0.16, z: 10, mat: M.marble, seg: 8 });
    sphere(g, { r: 0.26, x: 10.5, y: 1.66, z: 10, mat: M.marble, seg: 8 });
    hanokFence(g);

    // ── Pines on the hillside (north / east / west slopes) ─────────────────
    const trees = [
      [-10, -27.5, 11], [-3, -28.2, 12], [5, -28, 11.5], [11, -26.5, 10],
      [-18, -20, 10], [18, -20, 10], [-20, -12, 9], [21, -10, 9.5],
      [22, 2, 9], [20, 12, 8], [12, 22, 8], [4, 24, 7.5], [-6, 24.5, 8],
      [-18, 14, 9], [-22, 4, 9], [-21, -4, 8.5], [-16, 20, 7.5],
    ];
    trees.forEach(([x, z, h], i) => {
      tree(g, { x, z, h, r: Math.min(h * 0.26, 29.3 - Math.hypot(x, z)), mat: i % 4 === 1 ? M.foliage : pine });
    });

    return g;
  },
};

/** Short tiled 담장 segments flanking the 일주문. */
function hanokFence(g) {
  [-8.5, 8.5].forEach((x) => {
    box(g, { w: 7, h: 0.55, d: 0.9, x, z: 20.5, mat: M.graniteDark });
    box(g, { w: 7, h: 1.3, d: 0.7, x, y: 0.55, z: 20.5, mat: M.hanokWall });
    box(g, { w: 7.2, h: 0.35, d: 1.1, x, y: 1.85, z: 20.5, mat: M.roofTile });
  });
}
