// 용마폭포공원 (Yongma Falls Park, 1997) - 중랑구
// A former granite quarry on the west flank of 용마산 turned into a park: a sheer, heavily vegetated
// ~100 m wide × 51 m tall rock face facing south-west, with three artificial falls - the two-stage
// 51.4 m 용마폭포 in the centre and the 21 m 청룡폭포 (left) and 백마폭포 (right) spilling from lower
// ledges - into plunge pools and a shallow stream. In front: the oval multipurpose plaza with its
// running track, the 17 m × 30 m climbing wall (중랑스포츠클라이밍) with its wavy brown cap on the
// left, a round basin, the outdoor stage with tiered seating on the right, lawns, paths, a pergola and
// trees; a wooded hilltop with pines rises behind the cliff. The cliff width is compressed to ~60 m so
// the quarry bowl fits the collider; heights are 1:1.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, sphere, dome, frustum, prism, disc, subgroup, tree, treePatch, seededRandom, deg } from "./_helpers.mjs";

const WATER_SHEET = material(0xdbeeff, { emissive: 0x7fb3e0, emissiveIntensity: 0.35, transparent: true, opacity: 0.85 });
const FOAM = material(0xf4f8fb, { emissive: 0x9cc4e4, emissiveIntensity: 0.3, transparent: true, opacity: 0.8 });
const TRACK = material(0xb3634c, { roughness: 1 });
const PINE = material(0x2f5a33, { roughness: 1 });
const CAP_WOOD = material(0x6e4a38, { roughness: 0.85 });
const FACE_Z = -4; // z of the cliff base (local frame: the face looks towards +z)

/** Vertical rock column of the quarry face: a slightly battered frustum protruding `out` beyond FACE_Z. */
function column(g, { x, w, depth, h, out, y = 0, lean = 0.9, ry = 0, mat }) {
  frustum(g, { wBot: w, dBot: depth, wTop: w * 0.94, dTop: depth * 0.8, h, x, y, z: FACE_Z - depth / 2 + out, shiftZ: -lean, ry, mat });
}

/** Falling water sheet with foam at its foot. */
function fall(g, { x, top, bottom, w, z, foamR }) {
  box(g, { w, h: top - bottom, d: 0.5, x, y: bottom, z, mat: WATER_SHEET });
  sphere(g, { r: foamR, x, y: bottom - foamR * 0.2, z: z + 0.6, mat: FOAM, seg: 10, sy: 0.35 });
}

/** Pool: water disc with a dark stone rim. */
function pool(g, { x, z, r, y = 0.3 }) {
  disc(g, { r: r + 0.9, rInner: r - 0.2, x, y: y + 0.12, z, mat: M.graniteDark, seg: 28 });
  disc(g, { r, x, y, z, mat: M.water, seg: 28 });
}

export default {
  id: "yongma-falls",
  name: "용마폭포공원",
  nameEn: "Yongma Falls Park",
  district: "중랑구",
  lat: 37.5725,
  lon: 127.0917,
  height: 67,
  colliderRadius: 40,
  detail: "medium",
  description: "옛 채석장 절벽의 51m 인공폭포",
  create() {
    const g = new THREE.Group();
    // Built with the cliff along x facing +z, then turned so the falls pour towards the south-west.
    const site = subgroup(g, { ry: -Math.PI / 4 });
    const rng = seededRandom(51);

    // ── Ground: park lawn bowl with a soil/rock apron under the cliff ──
    cyl(site, { rTop: 1, h: 0.3, x: 0, z: 2, mat: M.grass, seg: 40, sx: 36, sz: 30 });
    box(site, { w: 66, h: 0.35, d: 8, x: 0, z: FACE_Z + 2, mat: M.graniteDark });

    // ── The quarry cliff ──
    // Main rock mass (battered face) and its two vegetated flanks closing the bowl.
    frustum(site, { wBot: 62, dBot: 14, wTop: 56, dTop: 9, h: 50, x: 0, z: -11, shiftZ: -1.5, mat: M.rock });
    frustum(site, { wBot: 10, dBot: 17, wTop: 5, dTop: 10, h: 26, x: -30, z: 2, ry: deg(-18), shiftX: 1.5, mat: M.grassDark });
    frustum(site, { wBot: 10, dBot: 17, wTop: 5, dTop: 10, h: 26, x: 30, z: 2, ry: deg(18), shiftX: -1.5, mat: M.grassDark });
    frustum(site, { wBot: 7, dBot: 9, wTop: 4, dTop: 5, h: 12, x: -29, y: 24, z: -3, mat: M.rockLight });
    frustum(site, { wBot: 7, dBot: 9, wTop: 4, dTop: 5, h: 12, x: 29, y: 24, z: -3, mat: M.rockLight });
    // Faceted granite blocks of varied width, depth, yaw and height (the ragged top edge); the chutes
    // protrude the most.
    const columns = [
      [-27.5, 4.6, 46, 0.6], [-23, 5.4, 52, 1.2], [-17.5, 6.6, 49, 0.4], [-11, 7.2, 54, 1.0], [-5.8, 4.4, 50, 0.3],
      [5.6, 4.8, 53, 0.4], [10.4, 5.2, 48, 1.1], [16, 7.4, 51, 0.3], [22.4, 6, 55, 1.3], [27.4, 4.8, 47, 0.7],
    ];
    const tones = [M.rock, M.rockLight, M.graniteDark, M.rockLight];
    columns.forEach(([x, w, h, out], i) => {
      column(site, { x, w, depth: 2.6 + rng() * 1.6, h, out, ry: (rng() - 0.5) * 0.24, lean: 0.6 + rng() * 0.8, mat: tones[i % tones.length] });
    });
    // Central chute (용마폭포): a lower step to the mid ledge and an upper, set-back step.
    column(site, { x: 0, w: 5.8, depth: 3.4, h: 30, out: 2.4, lean: 0.4, mat: M.rockLight });
    column(site, { x: 0.6, w: 5.4, depth: 3.0, h: 21.4, y: 30, out: 0.9, lean: 0.5, mat: M.rock });
    // Lower terraces under the side falls (청룡 left, 백마 right)
    column(site, { x: -15, w: 8, depth: 3.6, h: 21, out: 2.2, lean: 0.3, mat: M.rockLight });
    column(site, { x: 15, w: 8, depth: 3.6, h: 21.4, out: 2.2, lean: 0.3, mat: M.rock });
    // Ledges, protruding blocks and boulders along the rim
    [[-24, 18, 7], [-8, 33, 6], [9, 37, 7], [24, 28, 8], [-19, 40, 5], [20, 12, 6]].forEach(([x, y, w]) => {
      box(site, { w, h: 1.6, d: 3.2, x, y, z: FACE_Z - 0.4, mat: M.rockLight, ry: (rng() - 0.5) * 0.3 });
    });
    for (let i = 0; i < 12; i += 1) {
      const x = -28 + i * 5.1 + (rng() - 0.5) * 2;
      const y = 44 + rng() * 7;
      box(site, { w: 2.5 + rng() * 2.5, h: 2.5 + rng() * 2.5, d: 2.5 + rng() * 2, x, y, z: -8 - rng() * 4, mat: rng() > 0.5 ? M.rockLight : M.rock, ry: rng() * 0.8, rz: (rng() - 0.5) * 0.25 });
    }
    // Tree line along the rim (the quarry top is wooded right to the edge).
    treePatch(site, { w: 52, d: 3, x: 0, y: 51.5, z: -11, count: 11, seed: 17, h: 7, r: 2.1, mat: PINE });
    // Vegetation clinging to ledges and the flanks
    [[-24, 19.6, 1.8], [-8, 34.6, 1.6], [9, 38.6, 1.8], [24, 29.6, 2], [-19, 41.6, 1.4], [20, 13.6, 1.6],
      [-27, 47, 2.4], [26, 48, 2.2], [-21, 21.4, 1.3], [21, 21.8, 1.3], [-12, 21, 1.2], [12, 21.4, 1.2]]
      .forEach(([x, y, r]) => sphere(site, { r, x, y, z: FACE_Z - 0.2, mat: M.foliage, seg: 8, sy: 0.7 }));

    // ── Wooded hilltop behind the rim ──
    frustum(site, { wBot: 58, dBot: 15, wTop: 40, dTop: 7, h: 10, x: 0, y: 46, z: -16.5, mat: M.grassDark });
    treePatch(site, { w: 36, d: 6, x: 0, y: 56, z: -16.5, count: 12, seed: 9, h: 9, r: 2.4, mat: PINE });
    [[-26, 44, -10], [26, 43, -10], [-30, 30, 4], [30, 30, 4], [-32, 26, 10], [32, 26, 10]]
      .forEach(([x, y, z]) => tree(site, { x, y, z, h: 7, r: 2.2, mat: PINE }));

    // ── Waterfalls ──
    // 용마폭포: 51.4 m in two stages with a mid-height ledge pool.
    fall(site, { x: 0.6, top: 51.4, bottom: 30.2, w: 3.6, z: FACE_Z + 0.9 + 0.5, foamR: 2.2 });
    box(site, { w: 6, h: 0.5, d: 2.6, x: 0.3, y: 30, z: FACE_Z + 1.2, mat: M.water });
    fall(site, { x: -0.2, top: 30.3, bottom: 0.4, w: 4.2, z: FACE_Z + 2.4 + 0.5, foamR: 3.2 });
    // 청룡폭포 (left) and 백마폭포 (right): 21 m sheets from the lower terraces.
    fall(site, { x: -15, top: 21, bottom: 0.4, w: 5.5, z: FACE_Z + 2.2 + 0.5, foamR: 2.6 });
    fall(site, { x: 15, top: 21.4, bottom: 0.4, w: 5.5, z: FACE_Z + 2.2 + 0.5, foamR: 2.6 });
    box(site, { w: 7.6, h: 0.3, d: 3, x: -15, y: 21, z: FACE_Z + 0.5, mat: M.water });
    box(site, { w: 7.6, h: 0.3, d: 3, x: 15, y: 21.4, z: FACE_Z + 0.5, mat: M.water });
    // Plunge pools joined by a shallow stream that feeds the round basin.
    pool(site, { x: 0, z: 1.5, r: 6 });
    pool(site, { x: -15, z: 1, r: 4 });
    pool(site, { x: 15, z: 1, r: 4 });
    box(site, { w: 30, h: 0.3, d: 2.4, x: 0, y: 0.25, z: 2, mat: M.water });
    box(site, { w: 2.4, h: 0.3, d: 7, x: -9, y: 0.25, z: 5.5, mat: M.water });
    pool(site, { x: -10, z: 9, r: 5 });

    // ── Park ──
    // Oval multipurpose plaza with a running track around a green infield.
    cyl(site, { rTop: 1, h: 0.4, x: 6, z: 17, mat: TRACK, seg: 40, sx: 15, sz: 9.5 });
    cyl(site, { rTop: 1, h: 0.44, x: 6, z: 17, mat: M.grass, seg: 40, sx: 11, sz: 6 });
    // Granite paths
    box(site, { w: 3, h: 0.35, d: 12, x: -3, z: 6, mat: M.granite });
    box(site, { w: 26, h: 0.35, d: 3, x: -6, z: 12, mat: M.granite });
    box(site, { w: 3, h: 0.35, d: 22, x: 22, z: 16, mat: M.granite });
    box(site, { w: 18, h: 0.35, d: 3, x: 12, z: 29, mat: M.granite });
    // Climbing wall (중랑스포츠클라이밍): overhanging pale wall with a wavy brown cap and coloured holds.
    frustum(site, { wBot: 12, dBot: 3, wTop: 13, dTop: 2.4, h: 15, x: -24, z: 6, shiftZ: 1.6, mat: M.concrete });
    box(site, { w: 14.5, h: 1.3, d: 5.5, x: -24, y: 15, z: 6.8, mat: CAP_WOOD });
    box(site, { w: 12, h: 0.6, d: 4.2, x: -24, y: 16.3, z: 6.9, mat: CAP_WOOD });
    [[-27, 3, M.red], [-25, 9, M.yellow], [-21, 6, M.blue], [-23, 12, M.green], [-26.5, 11, M.orange], [-20.5, 2.5, M.purple]]
      .forEach(([x, y, mat]) => box(site, { w: 1, h: 1, d: 0.4, x, y, z: 7.6 + y * 0.107, mat }));
    box(site, { w: 6, h: 3, d: 3, x: -30, z: 8, mat: M.concreteDark }); // equipment room
    // Outdoor stage (야외음악당) with tiered semicircular seating facing the cliff.
    const arc = (r) => {
      const pts = [];
      for (let i = 0; i <= 12; i += 1) {
        const a = (Math.PI * i) / 12;
        pts.push([Math.cos(a) * r, Math.sin(a) * r]);
      }
      return pts;
    };
    [8.5, 7, 5.5].forEach((r, i) => prism(site, { points: arc(r), h: 0.5, x: 22, y: i * 0.5, z: 6, mat: i % 2 ? M.granite : M.concrete }));
    box(site, { w: 10, h: 1.2, d: 4, x: 22, z: 3.5, mat: M.graniteDark });
    dome(site, { r: 4, x: 22, y: 1.2, z: 2.5, mat: M.membrane, seg: 16, scaleY: 0.9, sz: 0.55 });
    // Lawns and pergola
    box(site, { w: 16, h: 0.35, d: 9, x: -18, z: 24, mat: M.grassDark });
    box(site, { w: 10, h: 0.35, d: 7, x: 23, z: 22, mat: M.grassDark });
    const pergola = subgroup(site, { x: 16, z: 26 });
    [[-2.6, -1.2], [2.6, -1.2], [-2.6, 1.2], [2.6, 1.2]].forEach(([x, z]) => cyl(pergola, { rTop: 0.18, h: 3, x, z, mat: CAP_WOOD, seg: 6 }));
    box(pergola, { w: 6.4, h: 0.25, d: 3.2, y: 3, mat: CAP_WOOD });
    for (let i = 0; i < 6; i += 1) {
      box(pergola, { w: 0.3, h: 0.3, d: 3.6, x: -2.8 + i * 1.12, y: 3.25, mat: CAP_WOOD });
    }
    // Park trees
    [[-28, 17], [-22, 25], [-16, 29], [-8, 31], [4, 30], [22, 28], [29, 18], [28, 11], [-14, 18], [-6, 22], [15, 31], [-29, 11]]
      .forEach(([x, z], i) => tree(site, { x, y: 0.3, z, h: 7 + (i % 3) * 0.8, r: 2.4 }));
    treePatch(site, { w: 10, d: 5, x: -18, y: 0.35, z: 24, count: 4, seed: 4, h: 6, r: 2 });
    treePatch(site, { w: 7, d: 4, x: 23, y: 0.35, z: 22, count: 3, seed: 5, h: 6, r: 2 });

    return g;
  },
};
