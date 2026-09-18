// 서울시립대학교 (University of Seoul) - 동대문구
// Campus under 배봉산: the 1990 / 2020-remodelled 대학본부 — a six-storey red-brick academic
// block with a stone plinth and a grid of blue windows — plus the 1937 경농관 (old main hall),
// a one-storey brick schoolhouse with a porch and pediment. Lawn and axial path to the south;
// a grass / rock rise and pines stand in for 배봉산 to the east. Height ≈ 28 m, r = 42.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, gableRoof, tree, subgroup, trianglesToGeometry } from "./_helpers.mjs";

const BRICK = M.brick;
const TRIM = M.granite;
const BLUE = M.glassBlue;
const paving = material(0xcac4b9, { roughness: 0.95 });
const ZINC = material(0x8a9088, { roughness: 0.45, metalness: 0.35 });

function wins(parent, { x = 0, y = 0, z = 0, ry = 0, length, floors, storey, spacing, w = 1.35, h = 2.15, sill = 0.95, skip = 0, mat = BLUE }) {
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
  const mesh = new THREE.Mesh(trianglesToGeometry(tris), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = ry;
  parent.add(mesh);
}

/** 1937 경농관: long one-storey brick hall, central porch + pediment, zinc roof. */
function gyeongnong(parent, { x, z, ry = 0 }) {
  const s = subgroup(parent, { x, z, ry });
  const w = 22;
  const d = 8;
  const h = 5.4;
  box(s, { w, h, d, mat: BRICK });
  box(s, { w: w + 0.3, h: 0.45, d: d + 0.3, mat: TRIM });
  gableRoof(s, { w, d, h: 3.2, y: h, overhang: 0.8, mat: ZINC });
  // porch + triangular pediment on +z
  box(s, { w: 5.6, h: 4.4, d: 2.6, z: d / 2 + 1.3, mat: BRICK });
  [-1, 1].forEach((side) => cyl(s, { rTop: 0.28, h: 4.2, x: side * 1.8, z: d / 2 + 2.4, mat: TRIM, seg: 8 }));
  box(s, { w: 6.0, h: 0.4, d: 2.9, y: 4.4, z: d / 2 + 1.3, mat: TRIM });
  box(s, { w: 6.2, h: 2.2, d: 0.4, y: 4.8, z: d / 2 + 2.6, mat: BRICK });
  gableRoof(s, { w: 6.4, d: 0.5, h: 1.8, y: 7.0, z: d / 2 + 2.6, overhang: 0.1, mat: ZINC });
  box(s, { w: 2.2, h: 3.2, d: 0.25, y: 0.5, z: d / 2 + 2.65, mat: M.black });
  wins(s, { z: d / 2 + 0.08, length: 20, floors: 1, storey: 5, spacing: 2.6, w: 1.2, h: 2.4, sill: 1.3, skip: 3.2, mat: M.glassDark });
  wins(s, { z: -d / 2 - 0.08, ry: Math.PI, length: 20, floors: 1, storey: 5, spacing: 2.6, w: 1.2, h: 2.4, sill: 1.3, mat: M.glassDark });
}

export default {
  id: "univ-of-seoul",
  name: "서울시립대학교",
  nameEn: "University of Seoul",
  district: "동대문구",
  lat: 37.5831,
  lon: 127.0595,
  height: 28,
  colliderRadius: 42,
  detail: "low",
  description: "배봉산 아래 캠퍼스 본관",
  create() {
    const g = new THREE.Group();

    cyl(g, { rTop: 1, h: 0.22, y: -0.06, mat: M.grass, seg: 18, sx: 41, sz: 36 });
    box(g, { w: 28, h: 0.24, d: 20, z: 14, mat: paving });
    box(g, { w: 16, h: 0.16, d: 12, x: -6, y: 0.24, z: 16, mat: M.grass });
    box(g, { w: 4, h: 0.26, d: 22, z: 6, mat: paving });

    // ── 대학본부: six-storey red brick, stone base, blue window grid ──────
    const W = 28;
    const D = 14;
    const storey = 4.15;
    const floors = 6;
    const H = 1.0 + storey * floors;
    const hall = subgroup(g, { x: -4, z: -8 });
    box(hall, { w: W + 0.4, h: 1.0, d: D + 0.4, mat: TRIM });
    box(hall, { w: W, h: H - 1.0, d: D, y: 1.0, mat: BRICK });
    box(hall, { w: W + 0.5, h: 0.55, d: D + 0.5, y: H, mat: TRIM });
    box(hall, { w: W - 1.2, h: 0.3, d: D - 1.2, y: H + 0.55, mat: M.concreteDark });
    for (let i = 1; i < floors; i += 1) {
      box(hall, { w: W + 0.25, h: 0.2, d: 0.16, y: 1.0 + i * storey, z: D / 2 + 0.08, mat: TRIM });
      box(hall, { w: W + 0.25, h: 0.2, d: 0.16, y: 1.0 + i * storey, z: -D / 2 - 0.08, mat: TRIM });
    }
    box(hall, { w: 8.5, h: 8.4, d: 3.2, z: D / 2 + 1.5, mat: BRICK });
    box(hall, { w: 8.8, h: 0.7, d: 3.5, y: 8.4, z: D / 2 + 1.5, mat: TRIM });
    box(hall, { w: 3.6, h: 4.6, d: 0.6, y: 1.0, z: D / 2 + 3.15, mat: M.black });
    [-1, 1].forEach((s) => box(hall, { w: 0.7, h: 7.6, d: 0.7, x: s * 3.4, y: 1.0, z: D / 2 + 3.0, mat: TRIM }));
    const off = 0.08;
    wins(hall, { y: 1.0, z: D / 2 + off, length: W, floors, storey, spacing: 2.8, skip: 4.6 });
    wins(hall, { y: 1.0, z: -D / 2 - off, ry: Math.PI, length: W, floors, storey, spacing: 2.8 });
    wins(hall, { x: W / 2 + off, y: 1.0, ry: Math.PI / 2, length: D, floors, storey, spacing: 2.6 });
    wins(hall, { x: -W / 2 - off, y: 1.0, ry: -Math.PI / 2, length: D, floors, storey, spacing: 2.6 });
    box(hall, { w: 6.2, h: 2.2, d: 5.2, y: H + 0.55, z: -2, mat: BRICK });
    box(hall, { w: 6.5, h: 0.35, d: 5.5, y: H + 2.75, z: -2, mat: TRIM });
    cyl(hall, { rTop: 0.08, h: 2.4, y: H + 3.1, z: -2, mat: M.steel, seg: 6 });

    // ── 경농관 (historic brick schoolhouse) west of the lawn ──────────────
    gyeongnong(g, { x: -24, z: 10 });

    // ── 배봉산: east rise, rock + grass + pines ───────────────────────────
    box(g, { w: 16, h: 4.5, d: 28, x: 28, z: -6, mat: M.rockLight });
    box(g, { w: 12, h: 3.2, d: 18, x: 30, y: 4.5, z: -8, mat: M.grassDark });
    box(g, { w: 8, h: 2.2, d: 12, x: 32, y: 7.7, z: -10, mat: M.grass });
    [[26, -18, 9], [32, -14, 10], [34, -6, 11], [33, 2, 9], [28, 8, 8],
      [18, -28, 8], [-14, -26, 8], [-32, -8, 7], [-18, 24, 7], [8, 26, 7],
      [16, 18, 7], [-30, 18, 6.5]].forEach(([x, z, h]) => {
      tree(g, { x, z, y: x > 22 ? 4.5 : 0.2, h, r: Math.min(h * 0.26, 41.3 - Math.hypot(x, z)) });
    });

    return g;
  },
};
