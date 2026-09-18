// 국립서울현충원 (Seoul National Cemetery) - 동작구
// Axial memorial court facing north toward 현충로 / the Han: a concrete 현충문 (1969) modelled on late
// Goryeo / early Joseon shrine halls — three open bays, painted columns, 청기 blue tiles — with a pair
// of crouching granite tigers on the approach. Behind it, the 31 m 십자형 현충탑 (1967) rises from the
// 위패봉안관 podium; a black-stone altar and bronze incense burner sit on the axis, and 병풍 부조 walls
// with bronze figure groups flank the tower. Lawns and pines fill the collider.
import * as THREE from "../vendor/three.module.js";
import { M, box, cyl, cone, sphere, frustum, hipRoof, slab, tree, subgroup } from "./_helpers.mjs";

const paving = M.granite;
const stone = M.granite;
const stoneDark = M.graniteDark;

/** Crouching granite tiger on a low plinth (호상이, 1959). */
function tiger(parent, { x, z, ry = 0 }) {
  const s = subgroup(parent, { x, z, ry });
  box(s, { w: 1.6, h: 1.4, d: 1.2, mat: stoneDark });
  box(s, { w: 2.2, h: 0.7, d: 0.9, x: 0.15, y: 1.4, mat: stone });
  sphere(s, { r: 0.38, x: 1.0, y: 1.85, mat: stone, seg: 8, sy: 0.85, sx: 1.1 });
  box(s, { w: 0.55, h: 0.35, d: 0.7, x: -1.15, y: 1.75, mat: stone });
  [-0.28, 0.28].forEach((side) => {
    box(s, { w: 0.35, h: 0.45, d: 0.32, x: 0.7, y: 1.4, z: side, mat: stone });
    box(s, { w: 0.35, h: 0.4, d: 0.32, x: -0.5, y: 1.4, z: side, mat: stone });
  });
}

/** Simplified standing bronze group (애국투사상 / 호국영웅상). */
function bronzeGroup(parent, { x, z }) {
  [-1.1, 0, 1.1].forEach((dx, i) => {
    const h = 2.4 + (i % 2) * 0.35;
    cyl(parent, { rTop: 0.22, rBot: 0.32, h, x: x + dx, y: 0.2, z, mat: M.bronze, seg: 6 });
    sphere(parent, { r: 0.22, x: x + dx, y: 0.2 + h, z, mat: M.bronze, seg: 7 });
  });
}

export default {
  id: "national-cemetery",
  name: "국립서울현충원",
  nameEn: "Seoul National Cemetery",
  district: "동작구",
  lat: 37.5007,
  lon: 126.9728,
  height: 31,
  colliderRadius: 60,
  detail: "medium",
  description: "현충문과 31m 현충탑",
  create() {
    const g = new THREE.Group();

    // ── Ground: lawn disc, darker perimeter planting, paved N–S axis ──
    cyl(g, { rTop: 58, h: 0.25, y: -0.05, mat: M.grass, seg: 32 });
    cyl(g, { rTop: 58, rBot: 52, h: 0.2, y: 0.2, mat: M.grassDark, seg: 32, open: true });
    slab(g, { w: 12, d: 96, h: 0.18, y: 0.2, mat: paving });
    slab(g, { w: 36, d: 28, h: 0.16, y: 0.2, z: -32, mat: M.sand }); // 금잔디 참배광장 (compressed)
    slab(g, { w: 28, d: 22, h: 0.16, y: 0.2, z: 6, mat: paving });

    const gateZ = -14;
    const towerZ = 18;

    // ── 현충문: stone terrace, three open bays, 청기 hip roof ──
    box(g, { w: 24, h: 1.5, d: 11, z: gateZ, mat: stone });
    box(g, { w: 24.6, h: 0.25, d: 11.6, y: 1.5, z: gateZ, mat: stoneDark });
    for (let i = 0; i < 4; i += 1) {
      box(g, { w: 10 - i * 0.6, h: 0.32, d: 2.2, y: i * 0.32, z: gateZ - 6.4 - i * 0.15, mat: stone });
    }
    // Four pier pairs (front/back) making three walk-through bays.
    const piers = [-8.2, -2.7, 2.7, 8.2];
    piers.forEach((px) => {
      [-3.4, 3.4].forEach((pz) => {
        cyl(g, { rTop: 0.55, h: 6.2, x: px, y: 1.7, z: gateZ + pz, mat: M.hanokWood, seg: 10 });
      });
    });
    // Side screens on the outer bays; centre bay stays open.
    [-5.45, 5.45].forEach((px) => {
      box(g, { w: 4.6, h: 5.4, d: 0.45, x: px, y: 1.7, z: gateZ - 3.5, mat: M.hanokWall });
      box(g, { w: 4.6, h: 5.4, d: 0.45, x: px, y: 1.7, z: gateZ + 3.5, mat: M.hanokWall });
    });
    // End walls (east / west).
    [-1, 1].forEach((side) => {
      box(g, { w: 0.5, h: 6.2, d: 8.2, x: side * 10.4, y: 1.7, z: gateZ, mat: M.offWhite });
    });
    box(g, { w: 22.4, h: 1.15, d: 9.2, y: 7.9, z: gateZ, mat: M.dancheong });
    hipRoof(g, { w: 21, d: 8.4, h: 4.6, y: 9.05, z: gateZ, overhang: 2.2, ridge: 0.5, curve: 0.14, mat: M.roofTileBlue });
    tiger(g, { x: -8.5, z: gateZ - 8.2 });
    tiger(g, { x: 8.5, z: gateZ - 8.2 });

    // ── 현충탑: 위패봉안관 podium + 십자형 31 m shaft ──
    box(g, { w: 16, h: 4.2, d: 16, z: towerZ, mat: stone });
    box(g, { w: 16.6, h: 0.35, d: 16.6, y: 4.2, z: towerZ, mat: stoneDark });
    // recessed dark openings on the north face of the hall
    box(g, { w: 3.2, h: 2.6, d: 0.3, y: 0.8, z: towerZ - 8.05, mat: M.black });
    [-5.2, 5.2].forEach((x) => box(g, { w: 2.2, h: 1.8, d: 0.25, x, y: 1.2, z: towerZ - 8.05, mat: M.glassDark }));
    frustum(g, { wBot: 5.6, dBot: 9.2, wTop: 3.1, dTop: 5.4, h: 23.2, y: 4.55, z: towerZ, mat: stone });
    frustum(g, { wBot: 9.2, dBot: 5.6, wTop: 5.4, dTop: 3.1, h: 23.2, y: 4.55, z: towerZ, mat: stone });
    box(g, { w: 5.8, h: 0.7, d: 5.8, y: 27.75, z: towerZ, mat: stoneDark });
    frustum(g, { wBot: 4.4, dBot: 4.4, wTop: 1.2, dTop: 1.2, h: 2.45, y: 28.45, z: towerZ, mat: stone });
    cyl(g, { rTop: 0.12, rBot: 0.28, h: 0.12, y: 30.88, z: towerZ, mat: M.steel, seg: 8 });

    // Altar (오석), incense burner, 헌시비
    box(g, { w: 7.2, h: 0.45, d: 3.4, y: 0.22, z: towerZ - 11.2, mat: M.black });
    cyl(g, { rTop: 0.55, rBot: 0.7, h: 0.85, y: 0.67, z: towerZ - 11.2, mat: M.bronze, seg: 12 });
    cyl(g, { rTop: 0.22, h: 0.35, y: 1.52, z: towerZ - 11.2, mat: M.bronze, seg: 8 });
    box(g, { w: 3.2, h: 2.1, d: 0.45, y: 0.22, z: towerZ - 8.9, mat: M.black });

    // 병풍형 화강석 부조 + end statues
    [-1, 1].forEach((side) => {
      box(g, { w: 18, h: 2.4, d: 0.7, x: side * 16, y: 0.22, z: towerZ + 1, mat: stoneDark });
      box(g, { w: 18.2, h: 0.22, d: 0.9, x: side * 16, y: 2.62, z: towerZ + 1, mat: stone });
      bronzeGroup(g, { x: side * 26, z: towerZ + 1 });
    });

    // Flagpoles on the northern plaza
    [-1, 1].forEach((side) => {
      cyl(g, { rTop: 0.08, h: 10, x: side * 14, y: 0.22, z: -34, mat: M.steel, seg: 6 });
      box(g, { w: 0.08, h: 1.5, d: 2.2, x: side * 14, y: 8.4, z: -34 + side * 1.1, mat: side < 0 ? M.red : M.blue });
    });

    // Pines along the lawns, kept inside r ≈ 56
    const pines = [
      [-22, -40, 9], [22, -40, 8.5], [-28, -24, 9], [28, -24, 8],
      [-32, -6, 8.5], [32, -6, 9], [-34, 14, 8], [34, 14, 8.5],
      [-26, 32, 8], [26, 32, 7.5], [-14, 42, 8], [14, 42, 8],
      [-40, 4, 7.5], [40, 4, 7.5], [-36, -36, 8], [36, -36, 8],
      [-20, 48, 7], [20, 48, 7], [0, 46, 7.5],
    ];
    pines.forEach(([x, z, h]) => {
      cyl(g, { rTop: 0.18, rBot: 0.32, h: h * 0.38, x, y: 0.2, z, mat: M.trunk, seg: 6 });
      cone(g, { r: 2.1, h: h * 0.72, x, y: 0.2 + h * 0.32, z, mat: M.foliage, seg: 8 });
    });
    [[-18, 8, 6], [18, 8, 6], [-12, -22, 5.5], [12, -22, 5.5]].forEach(([x, z, h]) => {
      tree(g, { x, y: 0.2, z, h, r: h * 0.34 });
    });

    return g;
  },
};
