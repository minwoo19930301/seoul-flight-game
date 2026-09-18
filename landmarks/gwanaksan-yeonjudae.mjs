// 관악산 연주대 (Gwanaksan Yeonjudae) - 관악구
// Granite peak of 연주봉: a 30 m south-facing cliff of vertical joints, a tiny 1-칸 응진전 on a
// masonry 석축 at the brink (red lanterns under the eaves), 말바위 beside it, and the white
// soccer-ball 기상레이더 dome on the north-west shoulder. The rock mass is the mountain — a
// widening base, mid-slope shoulders, and a 60 m pinnacle — not a plaza with a pavilion on top.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, cone, sphere, dome, frustum, hipRoof, tree, subgroup, seededRandom } from "./_helpers.mjs";

const pine = material(0x2d5a32, { roughness: 1 });
const lantern = material(0xc0392b, { roughness: 0.55, emissive: 0x7a1810, emissiveIntensity: 0.35 });
const radome = material(0xf4f6f8, { roughness: 0.35, metalness: 0.12 });

export default {
  id: "gwanaksan-yeonjudae",
  name: "관악산 연주대",
  nameEn: "Gwanaksan Yeonjudae",
  district: "관악구",
  lat: 37.4448,
  lon: 126.9646,
  height: 60,
  colliderRadius: 50,
  detail: "medium",
  description: "암봉 절벽 위 응진전과 기상관측소",
  create() {
    const g = new THREE.Group();
    const rng = seededRandom(632);

    // Lower apron: dark grass and scree around the granite.
    cyl(g, { rTop: 47, h: 0.5, y: -0.4, mat: M.grassDark, seg: 14 });
    frustum(g, { wBot: 54, dBot: 46, wTop: 40, dTop: 34, h: 8, y: -0.6, z: -2, mat: M.rock, shiftZ: -2 });

    // Main peak: three stacked tapers, leaning slightly north so the south face is the cliff.
    frustum(g, { wBot: 40, dBot: 34, wTop: 24, dTop: 20, h: 22, y: 6.5, z: -3, mat: M.rock, shiftZ: -2.4 });
    frustum(g, { wBot: 26, dBot: 22, wTop: 14, dTop: 13, h: 16, y: 27.5, z: -5, mat: M.granite, shiftZ: -1.6 });
    frustum(g, { wBot: 15, dBot: 13, wTop: 5.5, dTop: 6, h: 9, y: 43, z: -7, mat: M.graniteDark, shiftZ: -1 });
    // 횃불바위-like pinnacle (model top = 60).
    cone(g, { r: 3.4, h: 8.2, y: 51.8, z: -8.2, mat: M.rockLight, seg: 7 });

    // South cliff: vertical granite joints (시루떡 켜를 세운 듯한 암벽), ~30 m face.
    const tones = [M.granite, M.graniteDark, M.rock, M.rockLight];
    for (let i = 0; i < 10; i += 1) {
      const x = -18 + i * 4.0;
      const h = 26 + rng() * 7;
      const d = 3.4 + rng() * 1.6;
      frustum(g, {
        wBot: 3.6, dBot: d, wTop: 2.8, dTop: d * 0.75,
        h, x: x + (rng() - 0.5) * 0.4, y: 20, z: 8.5 + rng() * 1.2,
        shiftZ: 0.8 + rng() * 0.6, ry: (rng() - 0.5) * 0.18,
        mat: tones[i % tones.length],
      });
    }
    // Overhanging lip under the 응진전 ledge.
    box(g, { w: 12, h: 2.2, d: 5.5, x: 1, y: 45.6, z: 9.4, mat: M.graniteDark, rz: -0.08 });

    // Side shoulders and talus so the mass reads as a peak, not a wall.
    frustum(g, { wBot: 16, dBot: 14, wTop: 7, dTop: 6, h: 18, x: -22, y: 8, z: -6, mat: M.rock, ry: 0.35, shiftX: 2 });
    frustum(g, { wBot: 14, dBot: 13, wTop: 6, dTop: 5, h: 16, x: 22, y: 9, z: -4, mat: M.granite, ry: -0.3, shiftX: -2 });
    frustum(g, { wBot: 18, dBot: 12, wTop: 8, dTop: 6, h: 14, x: -8, y: 7, z: -20, mat: M.rockLight, shiftZ: -2 });
    for (let i = 0; i < 16; i += 1) {
      const a = rng() * Math.PI * 2;
      const r = 14 + rng() * 22;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r * 0.85 - 2;
      if (Math.hypot(x, z) > 46) continue;
      box(g, {
        w: 2.2 + rng() * 3.5, h: 1.6 + rng() * 3.2, d: 2 + rng() * 3,
        x, y: 6 + rng() * 18, z,
        mat: rng() > 0.5 ? M.rock : M.granite,
        ry: rng() * 1.2, rz: (rng() - 0.5) * 0.35,
      });
    }

    // ── 응진전: 1-칸 hall on 석축 at the south brink ──
    const hall = subgroup(g, { x: 1.2, y: 47.4, z: 8.8 });
    // Twenty-odd courses compressed to a few granite terraces.
    box(hall, { w: 8.4, h: 1.1, d: 7.2, z: 0.4, mat: M.graniteDark });
    box(hall, { w: 7.2, h: 0.55, d: 6.2, y: 1.1, mat: M.granite });
    for (let i = 0; i < 4; i += 1) {
      box(hall, { w: 2.4, h: 1.1 - i * 0.22, d: 0.45, y: 0, z: 4.0 + i * 0.45, mat: M.granite });
    }
    const y0 = 1.65;
    const w = 4.4;
    const d = 3.8;
    const wallH = 2.35;
    box(hall, { w: w - 0.7, h: wallH, d: d - 0.7, y: y0, mat: M.hanokWall });
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) => {
      cyl(hall, { rTop: 0.18, h: wallH, x: sx * (w / 2 - 0.15), y: y0, z: sz * (d / 2 - 0.15), mat: M.hanokWood, seg: 6 });
    });
    box(hall, { w: 1.5, h: 1.8, d: 0.1, y: y0 + 0.2, z: d / 2 - 0.3, mat: M.hanokWood }); // door
    box(hall, { w: w + 0.7, h: 0.55, d: d + 0.7, y: y0 + wallH, mat: M.dancheong });
    hipRoof(hall, { w, d, h: 1.85, y: y0 + wallH + 0.55, overhang: 1.15, ridge: 0.4, mat: M.roofTile });
    // Red 연등 under the eaves — the photo everyone takes.
    for (let i = 0; i < 8; i += 1) {
      const t = (i / 8) * Math.PI * 2;
      sphere(hall, {
        r: 0.22,
        x: Math.cos(t) * 2.5,
        y: y0 + wallH + 0.15,
        z: Math.sin(t) * 2.15,
        mat: lantern,
        seg: 6,
      });
    }

    // 말바위 (horse-back granite) just west of the hall.
    cyl(g, { rTop: 2.4, rBot: 2.8, h: 3.2, x: -6.5, y: 47.2, z: 6.2, mat: M.granite, seg: 8, sx: 1.6, sz: 0.7 });
    // 약사여래 niche in the cliff beside the hall.
    box(g, { w: 1.1, h: 1.6, d: 0.6, x: 5.4, y: 48.2, z: 10.2, mat: M.graniteDark });
    box(g, { w: 0.35, h: 0.7, d: 0.25, x: 5.4, y: 48.45, z: 10.45, mat: M.gold });

    // Summit 표지석 on the neruk-bawi north of the hall.
    box(g, { w: 1.3, h: 1.5, d: 0.4, x: -2, y: 51.6, z: -3.5, mat: M.graniteDark });

    // ── 기상레이더: white 축구공 dome on a squat station, NW shoulder ──
    const wx = -16;
    const wz = -18;
    const wy = 34;
    frustum(g, { wBot: 14, dBot: 12, wTop: 11, dTop: 10, h: 6, x: wx, y: wy - 6, z: wz, mat: M.rock });
    box(g, { w: 9.5, h: 4.2, d: 8.5, x: wx, y: wy, z: wz, mat: M.white });
    box(g, { w: 10, h: 0.35, d: 9, x: wx, y: wy + 4.2, z: wz, mat: M.concreteDark });
    cyl(g, { rTop: 3.4, h: 1.6, x: wx, y: wy + 4.5, z: wz, mat: M.steelDark, seg: 12 });
    dome(g, { r: 5.1, x: wx, y: wy + 6.1, z: wz, mat: radome, seg: 14, scaleY: 1.02 });
    // Railing and a small instrument mast.
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      cyl(g, { rTop: 0.07, h: 1.1, x: wx + Math.cos(a) * 5.2, y: wy + 4.5, z: wz + Math.sin(a) * 4.6, mat: M.steel, seg: 5 });
    }
    cyl(g, { rTop: 0.12, h: 4.5, x: wx + 5.6, y: wy + 4.5, z: wz + 3.4, mat: M.steelDark, seg: 6 });
    box(g, { w: 0.8, h: 0.35, d: 0.5, x: wx + 5.6, y: wy + 9.0, z: wz + 3.4, mat: M.white });

    // Stone stair / path up the east rib toward the hall.
    for (let i = 0; i < 12; i += 1) {
      box(g, {
        w: 1.8, h: 0.35, d: 1.3,
        x: 8 + i * 0.15, y: 28 + i * 1.55, z: 4 - i * 0.15,
        mat: i % 2 ? M.granite : M.graniteDark,
      });
    }

    // Pines clinging to mid-slopes (bare granite at the top).
    [
      [-28, 10, -8, 8], [30, 11, -6, 7.5], [-24, 14, 10, 7], [26, 13, 8, 6.5],
      [-20, 18, -22, 8.5], [18, 16, -24, 8], [-32, 8, 6, 7], [32, 8, 4, 7],
      [-12, 12, 22, 6.5], [14, 11, 24, 6], [-34, 7, -14, 8], [8, 20, -28, 7.5],
    ].forEach(([x, y, z, h]) => {
      if (Math.hypot(x, z) + 2.4 < 49) tree(g, { x, y, z, h, r: 2.2, mat: pine });
    });

    return g;
  },
};
