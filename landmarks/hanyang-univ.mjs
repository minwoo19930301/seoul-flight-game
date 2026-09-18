// 한양대학교 역사관 / 구본관 (Hanyang University, 1956 / 1965, 등록문화재 751호) - 성동구
// Hill campus heart: a ㄷ-plan four-storey light-granite hall with a projecting central 열주랑
// (neoclassical colonnade), regular punched windows and a cornice parapet. The bronze 사자상
// stands on a granite plinth on the south plaza; a stair climbs a short terrace. Footprint
// scaled to fit r = 46; storey heights are real (hall top ≈ 20 m — height updated after measure).
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, sphere, cone, tree, subgroup, trianglesToGeometry } from "./_helpers.mjs";

const STONE = M.granite;
const TRIM = M.graniteDark;
const WIN = M.glassDark;
const paving = material(0xc9c3b8, { roughness: 0.95 });

function wins(parent, { x = 0, y = 0, z = 0, ry = 0, length, floors, storey, spacing, w = 1.25, h = 2.15, sill = 1.0, skip = 0 }) {
  const count = Math.max(1, Math.floor((length - 1) / spacing));
  const span = (count - 1) * spacing;
  const tris = [];
  for (let f = 0; f < floors; f += 1) {
    const v0 = f * storey + sill;
    for (let i = 0; i < count; i += 1) {
      const u = -span / 2 + i * spacing;
      if (skip && Math.abs(u) < skip) continue;
      tris.push([u - w / 2, v0, 0], [u + w / 2, v0, 0], [u + w / 2, v0 + h, 0], [u - w / 2, v0, 0], [u + w / 2, v0 + h, 0], [u - w / 2, v0 + h, 0]);
    }
  }
  const mesh = new THREE.Mesh(trianglesToGeometry(tris), WIN);
  mesh.position.set(x, y, z);
  mesh.rotation.y = ry;
  parent.add(mesh);
}

/** Standing bronze lion on a plinth, facing +z (south, down the plaza). */
function lion(parent, { x = 0, y = 0, z = 0 }) {
  const s = subgroup(parent, { x, y, z });
  box(s, { w: 2.4, h: 0.45, d: 2.8, mat: TRIM });
  box(s, { w: 1.7, h: 1.5, d: 1.9, y: 0.45, mat: STONE });
  box(s, { w: 1.9, h: 0.22, d: 2.1, y: 1.95, mat: TRIM });
  box(s, { w: 0.85, h: 0.85, d: 1.7, y: 2.17, z: -0.05, mat: M.bronze }); // body
  box(s, { w: 0.7, h: 0.65, d: 0.7, y: 2.7, z: 0.85, mat: M.bronze }); // head
  cyl(s, { rTop: 0.42, h: 0.35, y: 3.2, z: 0.75, mat: M.bronze, seg: 8 }); // mane
  [[-0.28, 0.45], [0.28, 0.45], [-0.28, -0.55], [0.28, -0.55]].forEach(([dx, dz]) => {
    box(s, { w: 0.22, h: 0.7, d: 0.22, x: dx, y: 2.17, z: dz, mat: M.bronze });
  });
  box(s, { w: 0.12, h: 0.12, d: 0.9, y: 2.45, z: -1.15, mat: M.bronze });
}

export default {
  id: "hanyang-univ",
  name: "한양대학교",
  nameEn: "Hanyang University",
  district: "성동구",
  lat: 37.5578,
  lon: 127.0453,
  height: 32,
  colliderRadius: 46,
  detail: "low",
  description: "언덕 위 캠퍼스, 석조 본관과 사자상",
  create() {
    const g = new THREE.Group();

    // ── Hill terrace, plaza, lawns ─────────────────────────────────────────
    cyl(g, { rTop: 1, h: 0.24, y: -0.08, mat: M.grass, seg: 20, sx: 45, sz: 38 });
    const T = 1.7;
    box(g, { w: 50, h: T, d: 22, z: -12, mat: paving }); // terrace under the hall
    box(g, { w: 50.4, h: 0.28, d: 0.5, y: T, z: -1.15, mat: STONE });
    for (let i = 0; i < 6; i += 1) {
      box(g, { w: 11 - i * 0.3, h: T - i * (T / 6), d: 0.55, z: -0.4 + i * 0.55, mat: STONE });
    }
    box(g, { w: 36, h: 0.22, d: 22, z: 16, mat: paving });
    [-1, 1].forEach((s) => box(g, { w: 11, h: 0.16, d: 14, x: s * 12, y: 0.22, z: 16, mat: M.grass }));
    lion(g, { z: 10.5 });

    const B = subgroup(g, { y: T });
    const WALL = 17.6; // four tall storeys
    const ZF = 0.5; // south face of the front bar
    const ZB = -13;
    const WW = 46;

    // ── ㄷ massing: front bar + two rear wings ─────────────────────────────
    box(B, { w: WW, h: WALL, d: ZF - ZB, z: (ZF + ZB) / 2, mat: STONE });
    box(B, { w: WW + 0.35, h: 0.7, d: ZF - ZB + 0.35, z: (ZF + ZB) / 2, mat: TRIM }); // plinth
    [-1, 1].forEach((s) => {
      box(B, { w: 12, h: WALL, d: 18, x: s * 17, z: -20, mat: STONE });
      box(B, { w: 12.3, h: 0.7, d: 18.3, x: s * 17, z: -20, mat: TRIM });
    });
    // cornice + parapet
    box(B, { w: WW + 0.6, h: 0.7, d: ZF - ZB + 0.6, y: WALL, z: (ZF + ZB) / 2, mat: TRIM });
    box(B, { w: WW - 0.8, h: 1.15, d: 0.45, y: WALL + 0.7, z: ZF + 0.1, mat: STONE });
    box(B, { w: WW - 0.8, h: 1.15, d: 0.45, y: WALL + 0.7, z: ZB - 0.1, mat: STONE });
    [-1, 1].forEach((s) => {
      box(B, { w: 12.4, h: 0.7, d: 18.4, x: s * 17, y: WALL, z: -20, mat: TRIM });
      box(B, { w: 0.45, h: 1.15, d: 17.2, x: s * 22.9, y: WALL + 0.7, z: -20, mat: STONE });
    });
    // string courses
    [4.4, 8.8, 13.2].forEach((y) => {
      box(B, { w: WW + 0.4, h: 0.28, d: 0.2, y, z: ZF + 0.12, mat: TRIM });
      box(B, { w: WW + 0.4, h: 0.28, d: 0.2, y, z: ZB - 0.12, mat: TRIM });
    });

    // ── Central 열주랑 (six stone columns, two-storey porch) ───────────────
    const COL_H = 9.4;
    box(B, { w: 14, h: COL_H + 1.2, d: 4.2, z: ZF + 2.4, mat: STONE });
    box(B, { w: 14.4, h: 0.7, d: 4.6, z: ZF + 2.4, mat: TRIM });
    box(B, { w: 14.5, h: 0.85, d: 4.8, y: COL_H, z: ZF + 2.4, mat: TRIM });
    box(B, { w: 13.6, h: 1.1, d: 0.5, y: COL_H + 0.85, z: ZF + 4.4, mat: STONE });
    for (let i = 0; i < 6; i += 1) {
      const cx = -5.5 + i * 2.2;
      cyl(B, { rTop: 0.38, rBot: 0.46, h: COL_H, x: cx, z: ZF + 4.15, mat: STONE, seg: 10 });
    }
    box(B, { w: 3.4, h: 5.2, d: 0.7, y: 0.2, z: ZF + 4.45, mat: M.black }); // doorway
    box(B, { w: 4.2, h: 0.45, d: 1.1, y: 5.4, z: ZF + 4.5, mat: TRIM });

    // windows: front (skip colonnade), back, wing sides
    const storey = 4.35;
    wins(B, { z: ZF + 0.08, length: WW, floors: 4, storey, spacing: 2.7, skip: 7.2 });
    wins(B, { z: ZB - 0.08, ry: Math.PI, length: 20, floors: 4, storey, spacing: 2.7 });
    [-1, 1].forEach((s) => {
      wins(B, { x: s * 23 + s * 0.08, z: -20, ry: s * Math.PI / 2, length: 16, floors: 4, storey, spacing: 2.6 });
      wins(B, { x: s * 17, z: -29 + 0.08, ry: Math.PI, length: 10, floors: 4, storey, spacing: 2.5 });
    });
    // colonnade upper windows
    wins(B, { z: ZF + 4.55, y: COL_H + 1.2, length: 12, floors: 1, storey: 4, spacing: 2.4, w: 1.3, h: 2.4, sill: 0.6 });

    // flag mast on the parapet (campus marker)
    cyl(B, { rTop: 0.08, h: 4.2, y: WALL + 1.8, z: -6, mat: M.steel, seg: 6 });
    box(B, { w: 1.3, h: 0.7, d: 0.12, x: 0.7, y: WALL + 5.3, z: -6, mat: M.blue });

    // ── Rear hillside trees and plaza zelkovas ────────────────────────────
    [[-20, -32, 10], [-8, -33, 11], [8, -33, 11], [20, -32, 10], [-28, -22, 8], [28, -22, 8],
      [-30, 8, 8], [30, 8, 8], [-26, 20, 7], [26, 20, 7], [-14, 28, 7], [14, 28, 7]].forEach(([x, z, h]) => {
      tree(g, { x, z, h, r: Math.min(h * 0.28, 45.2 - Math.hypot(x, z)) });
    });

    return g;
  },
};
