// 둘리뮤지엄 (Dooly Museum, 2015) - 도봉구
// Ssangmun-dong Dooly theme museum in 둘리근린공원: two low wings (museum + children's library),
// B1–3F, white walls with bright blue / yellow / orange window bands, a yellow entrance canopy,
// rooftop maze lawn and the '둘리와 하늘의 해적선' play ship, and a stylised green baby-dinosaur
// statue on the south plaza. Plan compressed to fit r = 26; eaves / mast top ≈ 16 m.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, sphere, cone, tree, subgroup, trianglesToGeometry } from "./_helpers.mjs";

const CREAM = M.offWhite;
const DINO = material(0x3d9a4a, { roughness: 0.7 });
const DINO_BELLY = material(0x9fd48a, { roughness: 0.75 });
const DINO_DARK = material(0x2a6e34, { roughness: 0.7 });
const WOOD = material(0x8b5a2b, { roughness: 0.85 });
const SAIL = material(0xf4e6a0, { roughness: 0.65 });

/** Flat window quads on a +z face (rotate with ry). */
function wins(parent, { x = 0, y = 0, z = 0, ry = 0, length, floors, storey, spacing, w = 1.4, h = 2.0, sill = 0.8, mat = M.glassBlue }) {
  const count = Math.max(1, Math.floor((length - 0.8) / spacing));
  const span = (count - 1) * spacing;
  const tris = [];
  for (let f = 0; f < floors; f += 1) {
    const v0 = f * storey + sill;
    for (let i = 0; i < count; i += 1) {
      const u = -span / 2 + i * spacing;
      tris.push([u - w / 2, v0, 0], [u + w / 2, v0, 0], [u + w / 2, v0 + h, 0], [u - w / 2, v0, 0], [u + w / 2, v0 + h, 0], [u - w / 2, v0 + h, 0]);
    }
  }
  const mesh = new THREE.Mesh(trianglesToGeometry(tris), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = ry;
  parent.add(mesh);
}

/** Standing cartoon baby dinosaur (둘리): big head, spots, short arms, thick tail. */
function dooly(parent, { x = 0, y = 0, z = 0, s = 1 }) {
  const g = subgroup(parent, { x, y, z });
  box(g, { w: 1.6 * s, h: 0.35 * s, d: 1.6 * s, mat: M.granite });
  cyl(g, { rTop: 0.55 * s, rBot: 0.7 * s, h: 1.5 * s, y: 0.35 * s, z: 0.05 * s, mat: DINO, seg: 8 });
  sphere(g, { r: 0.48 * s, y: 0.55 * s, z: 0.15 * s, mat: DINO_BELLY, seg: 8, sy: 1.15 });
  sphere(g, { r: 0.85 * s, y: 1.7 * s, z: 0.15 * s, mat: DINO, seg: 10 });
  sphere(g, { r: 0.22 * s, x: -0.32 * s, y: 2.15 * s, z: 0.72 * s, mat: M.white, seg: 6 });
  sphere(g, { r: 0.22 * s, x: 0.32 * s, y: 2.15 * s, z: 0.72 * s, mat: M.white, seg: 6 });
  sphere(g, { r: 0.1 * s, x: -0.32 * s, y: 2.18 * s, z: 0.88 * s, mat: M.black, seg: 5 });
  sphere(g, { r: 0.1 * s, x: 0.32 * s, y: 2.18 * s, z: 0.88 * s, mat: M.black, seg: 5 });
  sphere(g, { r: 0.16 * s, y: 1.95 * s, z: 0.92 * s, mat: DINO_DARK, seg: 6 });
  [[-0.45, 1.15, -0.15], [0.5, 1.55, 0.05], [-0.15, 1.85, -0.45]].forEach(([dx, dy, dz]) => {
    sphere(g, { r: 0.18 * s, x: dx * s, y: dy * s, z: dz * s, mat: DINO_DARK, seg: 6 });
  });
  [-1, 1].forEach((side) => {
    cyl(g, { rTop: 0.12 * s, h: 0.7 * s, x: side * 0.7 * s, y: 1.35 * s, z: 0.35 * s, mat: DINO, seg: 5, sx: 1, sz: 1 });
    box(g, { w: 0.22 * s, h: 0.55 * s, d: 0.28 * s, x: side * 0.38 * s, y: 0.35 * s, z: 0.35 * s, mat: DINO });
    box(g, { w: 0.22 * s, h: 0.55 * s, d: 0.28 * s, x: side * 0.38 * s, y: 0.35 * s, z: -0.35 * s, mat: DINO });
  });
  cone(g, { r: 0.32 * s, h: 1.4 * s, y: 0.9 * s, z: -0.95 * s, mat: DINO, seg: 6, sx: 0.7, sz: 1.4 });
}

export default {
  id: "dooly-museum",
  name: "둘리뮤지엄",
  nameEn: "Dooly Museum",
  district: "도봉구",
  lat: 37.6523,
  lon: 127.0276,
  height: 16,
  colliderRadius: 26,
  detail: "low",
  description: "쌍문동 아기공룡 둘리 테마 박물관",
  create() {
    const g = new THREE.Group();

    // ── Park ground and south plaza ─────────────────────────────────────────
    cyl(g, { rTop: 1, h: 0.22, y: -0.05, mat: M.grass, seg: 20, sx: 25.4, sz: 25.4 });
    box(g, { w: 22, h: 0.28, d: 14, z: 8, mat: M.granite });
    box(g, { w: 6, h: 0.3, d: 8, z: 1, mat: M.granite });

    // ── Museum wing (east, 3 storeys) and library wing (west, 2 storeys) ──
    const MH = 11.4;
    box(g, { w: 20, h: MH, d: 13, x: 4, z: -5, mat: CREAM });
    box(g, { w: 20.4, h: 0.45, d: 13.4, x: 4, y: MH, z: -5, mat: M.blue });
    box(g, { w: 18, h: 0.25, d: 11, x: 4, y: MH + 0.45, z: -5, mat: M.grass }); // 옥상 미로정원
    box(g, { w: 13, h: 8.2, d: 12, x: -10.5, z: 2, mat: M.white });
    box(g, { w: 13.4, h: 0.4, d: 12.4, x: -10.5, y: 8.2, z: 2, mat: M.yellow });
    box(g, { w: 11, h: 0.2, d: 10, x: -10.5, y: 8.6, z: 2, mat: M.grassDark });
    // colourful storey bands
    [3.7, 7.5].forEach((y) => box(g, { w: 20.3, h: 0.28, d: 13.3, x: 4, y, z: -5, mat: M.orange }));
    box(g, { w: 13.3, h: 0.28, d: 12.3, x: -10.5, y: 4.0, z: 2, mat: M.blue });
    // entrance cube and yellow canopy on the south face
    box(g, { w: 7, h: 5.2, d: 3.2, x: -2, z: 3.1, mat: M.yellow });
    box(g, { w: 5.4, h: 3.4, d: 0.4, x: -2, y: 0.4, z: 4.75, mat: M.glass });
    box(g, { w: 8.4, h: 0.35, d: 4.2, x: -2, y: 5.2, z: 3.6, mat: M.orange });
    [-1, 1].forEach((s) => box(g, { w: 0.35, h: 5.2, d: 0.35, x: -2 + s * 4.1, z: 5.1, mat: M.yellow }));

    const off = 0.08;
    wins(g, { x: 4, y: 0, z: 1.5 + off, length: 18, floors: 3, storey: 3.7, spacing: 2.6, w: 1.5, h: 2.1 });
    wins(g, { x: 4, y: 0, z: -11.5 - off, ry: Math.PI, length: 18, floors: 3, storey: 3.7, spacing: 2.6 });
    wins(g, { x: 14 + off, y: 0, z: -5, ry: Math.PI / 2, length: 11, floors: 3, storey: 3.7, spacing: 2.5, w: 1.3 });
    wins(g, { x: -10.5, y: 0, z: 8 + off, length: 11, floors: 2, storey: 3.8, spacing: 2.4, w: 1.6, h: 2.2, mat: M.glass });
    wins(g, { x: -17 + off, y: 0, z: 2, ry: -Math.PI / 2, length: 10, floors: 2, storey: 3.8, spacing: 2.4, mat: M.glass });

    // ── 하늘의 해적선 on the museum roof (mast sets the 16 m top) ─────────
    const ship = subgroup(g, { x: 5, y: MH + 0.7, z: -5.5 });
    box(ship, { w: 6.4, h: 1.1, d: 2.2, mat: M.red });
    box(ship, { w: 5.6, h: 0.25, d: 1.8, y: 1.1, mat: WOOD });
    cyl(ship, { rTop: 0.12, h: 3.5, y: 1.2, mat: WOOD, seg: 6 });
    box(ship, { w: 0.12, h: 2.2, d: 1.8, y: 1.8, x: 0.15, mat: SAIL });
    box(ship, { w: 1.1, h: 0.7, d: 1.1, x: -2.4, y: 1.1, mat: M.red });
    cone(ship, { r: 0.55, h: 0.7, x: 3.0, y: 0.15, mat: M.red, seg: 6, sx: 0.7, sz: 1.2 });

    // ── Green 둘리 statue on the plaza ────────────────────────────────────
    dooly(g, { x: 2.5, y: 0.28, z: 10.5, s: 1.35 });
    // smaller friend (도우너-ish oval head) for a colourful group
    box(g, { w: 0.9, h: 0.25, d: 0.9, x: -3.2, y: 0.28, z: 11.2, mat: M.graniteDark });
    cyl(g, { rTop: 0.28, h: 0.9, x: -3.2, y: 0.53, z: 11.2, mat: M.orange, seg: 6 });
    sphere(g, { r: 0.42, x: -3.2, y: 1.35, z: 11.2, mat: M.yellow, seg: 8, sy: 1.15 });

    // ── Play posts and park trees ──────────────────────────────────────────
    [-8, 8, 14].forEach((x, i) => cyl(g, { rTop: 0.08, h: 3.2, x, y: 0.22, z: 14.5, mat: M.steel, seg: 5 }));
    [[-18, -8, 8], [-16, 10, 7], [16, 10, 8], [18, -10, 7.5], [-20, 2, 6.5], [19, 4, 7], [12, -16, 8], [-6, -18, 7]].forEach(([x, z, h]) => {
      tree(g, { x, z, h, r: Math.min(h * 0.28, 25.4 - Math.hypot(x, z)) });
    });

    return g;
  },
};
