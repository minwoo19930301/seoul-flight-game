// 국립4·19민주묘지 (April 19th National Cemetery, 1963 / 1995) - 강북구
// Axis from the south plaza through the pond and 상징문 (five steel pylons each side) to the
// 4월학생혁명기념탑: seven 21 m granite pillars clustered over the 참배단. 만장 stelae, grave
// lawns and the timber 유영봉안소 climb north; the 4·19혁명기념관 sits east of the plaza.
// Grounds compressed to r = 44; the pillars keep the real 21 m height.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, cone, sphere, hipRoof, slab, disc, subgroup, tree } from "./_helpers.mjs";

const stone = M.granite;
const stoneLt = M.limestone;
const paving = material(0xcbc6bb, { roughness: 0.95 });
const steel = M.steelDark;

/** One of the seven memorial pillars (화강석 탑주). */
function pillar(g, { x, z, w, d, h, ry = 0 }) {
  box(g, { w, h, d, x, z, mat: stoneLt, ry });
  box(g, { w: w + 0.15, h: 0.25, d: d + 0.15, x, y: h, z, mat: stone, ry });
}

export default {
  id: "april-19-cemetery",
  name: "국립4·19민주묘지",
  nameEn: "April 19th National Cemetery",
  district: "강북구",
  lat: 37.6486,
  lon: 127.0115,
  height: 21,
  colliderRadius: 44,
  detail: "medium",
  description: "7개 화강석 기둥의 상징탑과 묘역",
  create() {
    const g = new THREE.Group();

    // ── Lawn bowl, south plaza, granite 참배로 ──
    cyl(g, { rTop: 40, h: 0.22, y: -0.22, mat: M.grass, seg: 20 });
    slab(g, { w: 28, d: 14, z: 26, h: 0.14, mat: paving });
    slab(g, { w: 8, d: 44, z: 2, h: 0.12, mat: paving });
    slab(g, { w: 22, d: 18, z: 2, h: 0.12, mat: paving }); // monument plaza

    // ── Pond in front of the 상징문 ──
    disc(g, { r: 5.8, x: 0, y: 0.14, z: 24, mat: M.water, seg: 24 });
    disc(g, { r: 6.5, rInner: 5.7, y: 0.18, z: 24, mat: M.graniteDark, seg: 24 });

    // ── 상징문: five steel pylons each side ──
    for (let i = 0; i < 5; i += 1) {
      const x = 5.5 + i * 2.4;
      const h = 8.5 + (i % 3) * 0.6;
      [-1, 1].forEach((s) => {
        box(g, { w: 0.55, h, d: 0.55, x: s * x, z: 16, mat: steel });
        box(g, { w: 0.85, h: 0.3, d: 0.85, x: s * x, z: 16, mat: stone });
      });
    }
    box(g, { w: 22, h: 0.2, d: 1.2, z: 16, mat: stone });

    // ── 4월학생혁명기념탑: seven granite pillars + 참배단 ──
    const piers = [
      { x: -2.6, z: -1.1, w: 1.55, d: 1.7, h: 21.0, ry: 0.08 },
      { x: -0.9, z: 0.9, w: 1.35, d: 1.5, h: 20.2, ry: -0.05 },
      { x: 0.4, z: -0.5, w: 1.75, d: 1.9, h: 21.0, ry: 0.03 },
      { x: 2.0, z: 1.1, w: 1.25, d: 1.45, h: 19.8, ry: 0.1 },
      { x: 3.2, z: -0.6, w: 1.45, d: 1.6, h: 20.5, ry: -0.07 },
      { x: -1.6, z: -2.4, w: 1.2, d: 1.35, h: 18.9, ry: 0.04 },
      { x: 1.5, z: -2.2, w: 1.3, d: 1.4, h: 19.4, ry: -0.04 },
    ];
    box(g, { w: 10, h: 0.7, d: 8.5, z: -0.4, mat: stone });
    piers.forEach((p) => pillar(g, p));
    // 참배단 (incense altar) on the south face
    box(g, { w: 5.2, h: 1.1, d: 2.0, z: 5.2, mat: stone });
    box(g, { w: 4.4, h: 0.25, d: 1.4, y: 1.1, z: 5.2, mat: stoneLt });
    // 비문 slab
    box(g, { w: 3.6, h: 2.4, d: 0.35, z: 7.2, mat: stone });

    // ── 수호자상 (pair of bronze figures) ──
    [-1, 1].forEach((s) => {
      box(g, { w: 1.1, h: 0.4, d: 1.1, x: s * 7.5, z: 3.5, mat: stone });
      cyl(g, { rTop: 0.28, h: 1.5, x: s * 7.5, y: 0.4, z: 3.5, mat: M.bronze, seg: 8 });
      box(g, { w: 0.7, h: 1.1, d: 0.45, x: s * 7.5, y: 1.9, z: 3.5, mat: M.bronze });
      sphere(g, { r: 0.28, x: s * 7.5, y: 3.0, z: 3.5, mat: M.bronze, seg: 8 });
    });

    // ── 만장: twenty 7 m granite stelae, ten each side of the monument ──
    for (let i = 0; i < 10; i += 1) {
      const z = -8 + i * 1.7;
      [-1, 1].forEach((s) => {
        box(g, { w: 0.7, h: 6.8 + (i % 4) * 0.15, d: 0.45, x: s * (11 + (i % 3) * 0.3), z, mat: stoneLt });
      });
    }

    // ── Grave lawns (묘역) north of the tower ──
    box(g, { w: 28, h: 0.12, d: 14, z: -16, mat: M.grassDark });
    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 7; col += 1) {
        const x = -12 + col * 4.0;
        const z = -11 - row * 3.2;
        box(g, { w: 1.5, h: 0.35, d: 0.9, x, z, mat: stone });
        box(g, { w: 0.18, h: 0.7, d: 0.4, x, y: 0.35, z, mat: stoneLt });
      }
    }

    // ── 유영봉안소: timber memorial hall at the north end ──
    const hall = subgroup(g, { z: -28 });
    box(hall, { w: 14, h: 0.7, d: 8, mat: M.granite });
    box(hall, { w: 12, h: 3.4, d: 6.2, y: 0.7, mat: M.hanokWall });
    for (let i = 0; i <= 4; i += 1) {
      cyl(hall, { rTop: 0.24, h: 3.4, x: -6 + i * 3, y: 0.7, z: 3.1, mat: M.hanokWood, seg: 6 });
      cyl(hall, { rTop: 0.24, h: 3.4, x: -6 + i * 3, y: 0.7, z: -3.1, mat: M.hanokWood, seg: 6 });
    }
    box(hall, { w: 13, h: 0.7, d: 7.2, y: 4.1, mat: M.dancheong });
    hipRoof(hall, { w: 12, d: 6.2, h: 3.4, y: 4.8, overhang: 1.8 });

    // ── 4·19혁명기념관, east of the plaza ──
    box(g, { w: 12, h: 6.5, d: 8, x: 16, z: 22, mat: M.offWhite });
    box(g, { w: 12.6, h: 0.5, d: 8.6, x: 16, y: 6.5, z: 22, mat: M.concreteDark });
    box(g, { w: 7, h: 3.2, d: 0.25, x: 16, y: 1.4, z: 26.1, mat: M.glass });
    slab(g, { w: 8, d: 5, x: 16, z: 28, h: 0.12, mat: paving });

    // ── 정의의 불꽃 (south-west, abstracted) ──
    box(g, { w: 2.4, h: 5.5, d: 1.2, x: -16, z: 26, mat: stoneLt });
    cone(g, { r: 1.3, h: 2.4, x: -16, y: 5.5, z: 26, mat: M.granite, seg: 5 });

    // Trees along the edges
    [[-24, 14], [-24, 2], [-22, -12], [-14, -26], [12, -26], [24, -6], [20, 8], [-18, 22], [4, -28]]
      .forEach(([x, z], i) => tree(g, { x, z, h: 7.5 + (i % 3) * 0.5, r: 2.2 }));

    return g;
  },
};
