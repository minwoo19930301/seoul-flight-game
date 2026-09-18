// 청량리역 롯데캐슬 SKY-L65 (Cheongnyangni Station Lotte Castle SKY-L65, 해안건축 / 롯데건설, 2023) - 동대문구
// Mixed-use complex on the old 청량리 4구역 block south-west of 청량리역: four striped residential
// towers (B·D동 65F / 226 m, A동 64F / 223 m, C동 63F / 219 m) in a staggered 2 × 2 group, each a pair
// of offset slabs in pale panels with continuous dark-teal glazing strips, refuge-floor belts and the
// signature slanted "blade" crown screens; a 42F / 185 m dark-glass landmark tower (office / hotel /
// officetel) at the north-east corner next to the station with a slanted top and a white "pixel"
// panel pattern; a faceted glass retail podium (롯데백화점 청량리 / 롯데시네마) with a roof garden and
// a triangular entrance canopy, and an elevated walkway towards the station. Footprints are ~1/2 real
// scale so the five towers fit the collider; heights are 1:1.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, prism, subgroup, tree, treePatch, trianglesToGeometry, deg, seededRandom } from "./_helpers.mjs";

const PANEL_A = M.offWhite;
const PANEL_B = material(0xd8d3c8, { roughness: 0.75 });
const GLAZING = material(0x36575e, { roughness: 0.2, metalness: 0.65, emissive: 0x0a1c22, emissiveIntensity: 0.2 });
const LINE = material(0xc9c5bc, { roughness: 0.8 });
const FLOOR = 3.15;
const LOBBY = 8;
const DECK_H = 8; // landscaped residential deck (drop-off zone) around the tower bases
const PODIUM_H = 24; // department store / hotel base under the landmark tower

/** Rectangle `w × d` centred at (cx, cz) with corners chamfered by `c`, as [x, z] points. */
function chamferRect(w, d, c, cx = 0, cz = 0) {
  const hw = w / 2;
  const hd = d / 2;
  return [
    [cx - hw + c, cz - hd], [cx + hw - c, cz - hd], [cx + hw, cz - hd + c], [cx + hw, cz + hd - c],
    [cx + hw - c, cz + hd], [cx - hw + c, cz + hd], [cx - hw, cz + hd - c], [cx - hw, cz - hd + c],
  ];
}

/**
 * Solid over a convex [x, z] footprint whose planar top slopes along x from `hLow` (west edge) to
 * `hHigh` (east edge) - the slanted crown screens of the towers.
 */
function slopedBlock(parent, { points, hLow, hHigh, x = 0, y = 0, z = 0, mat, ry = 0 }) {
  let pts = points;
  const area = pts.reduce((sum, [px, pz], i) => {
    const [nx, nz] = pts[(i + 1) % pts.length];
    return sum + px * nz - nx * pz;
  }, 0);
  if (area > 0) {
    pts = pts.slice().reverse();
  }
  const xs = pts.map(([px]) => px);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const top = (px) => hLow + (hHigh - hLow) * ((px - x0) / (x1 - x0));
  const tris = [];
  const n = pts.length;
  for (let i = 0; i < n; i += 1) {
    const [ax, az] = pts[i];
    const [bx, bz] = pts[(i + 1) % n];
    const a0 = [ax, 0, az];
    const b0 = [bx, 0, bz];
    const a1 = [ax, top(ax), az];
    const b1 = [bx, top(bx), bz];
    tris.push(a0, b0, b1, a0, b1, a1);
  }
  const t = pts.map(([px, pz]) => [px, top(px), pz]);
  for (let i = 1; i < n - 1; i += 1) {
    tris.push(t[0], t[i], t[i + 1]);
    tris.push([pts[0][0], 0, pts[0][1]], [pts[i + 1][0], 0, pts[i + 1][1]], [pts[i][0], 0, pts[i][1]]);
  }
  const mesh = new THREE.Mesh(trianglesToGeometry(tris), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = ry;
  parent.add(mesh);
  return mesh;
}

/** Continuous vertical glazing strips, slightly proud of the flat faces of a chamfered rectangle. */
function stripes(g, { w, d, c, cx = 0, cz = 0, y0, y1, faces = "nsew", spacing = 2.3, sw = 1.0, st = 0.5, mat = GLAZING }) {
  const flatX = w - 2 * c;
  const flatZ = d - 2 * c;
  const nx = Math.max(1, Math.round(flatX / spacing));
  const nz = Math.max(1, Math.round(flatZ / spacing));
  for (let i = 0; i < nx; i += 1) {
    const px = cx + (i - (nx - 1) / 2) * (flatX / nx);
    if (faces.includes("n")) box(g, { w: sw, h: y1 - y0, d: st, x: px, y: y0, z: cz - d / 2, mat });
    if (faces.includes("s")) box(g, { w: sw, h: y1 - y0, d: st, x: px, y: y0, z: cz + d / 2, mat });
  }
  for (let i = 0; i < nz; i += 1) {
    const pz = cz + (i - (nz - 1) / 2) * (flatZ / nz);
    if (faces.includes("w")) box(g, { w: st, h: y1 - y0, d: sw, x: cx - w / 2, y: y0, z: pz, mat });
    if (faces.includes("e")) box(g, { w: st, h: y1 - y0, d: sw, x: cx + w / 2, y: y0, z: pz, mat });
  }
}

/**
 * One residential tower: two offset slabs (west slab A, east slab B staggered to the south), glazing
 * strips, floor lines every 4 storeys, refuge-floor belts at 24F / 45F and two slanted crown blades
 * rising eastwards - the east blade peaks at `top`.
 */
function residentialTower(parent, { x, z, ry = 0, floors, top }) {
  const g = subgroup(parent, { x, z, ry });
  const roof = LOBBY + (floors - 1) * FLOOR;
  const c = 1.4;
  const A = { w: 11, d: 11.5, cx: -4.6, cz: 0 };
  const B = { w: 9.8, d: 11.5, cx: 4.7, cz: 1.6 };

  // Shafts (stone-clad lobby floors share the deck cladding).
  prism(g, { points: chamferRect(A.w + 0.4, A.d + 0.4, c, A.cx, A.cz), h: DECK_H + 0.8, mat: M.granite });
  prism(g, { points: chamferRect(B.w + 0.4, B.d + 0.4, c, B.cx, B.cz), h: DECK_H + 0.8, mat: M.granite });
  prism(g, { points: chamferRect(A.w, A.d, c, A.cx, A.cz), h: roof, mat: PANEL_A });
  prism(g, { points: chamferRect(B.w, B.d, c, B.cx, B.cz), h: roof - 3, mat: PANEL_B });

  // Dark-teal glazing strips (the inner faces where the slabs meet are hidden).
  const y0 = DECK_H + 0.8;
  stripes(g, { ...A, c, y0, y1: roof - 0.6, faces: "nsw" });
  stripes(g, { ...B, c, y0, y1: roof - 3.6, faces: "nse" });

  // Thin floor lines every four storeys and full-storey refuge belts (24F, 45F).
  for (let y = y0 + FLOOR * 4; y < roof - 6; y += FLOOR * 4) {
    prism(g, { points: chamferRect(A.w + 0.5, A.d + 0.5, c, A.cx, A.cz), h: 0.25, y, mat: LINE });
    prism(g, { points: chamferRect(B.w + 0.5, B.d + 0.5, c, B.cx, B.cz), h: 0.25, y, mat: LINE });
  }
  [23, 44].forEach((floor) => {
    const y = LOBBY + floor * FLOOR;
    prism(g, { points: chamferRect(A.w + 0.6, A.d + 0.6, c, A.cx, A.cz), h: FLOOR, y, mat: M.steelDark });
    prism(g, { points: chamferRect(B.w + 0.6, B.d + 0.6, c, B.cx, B.cz), h: FLOOR, y, mat: M.steelDark });
  });

  // Crown: two slanted screen blades (rising towards the east) with a thin bright frame along the
  // top edge, plus a mechanical penthouse tucked behind the lower ends.
  const peakA = top - 9;
  slopedBlock(g, { points: chamferRect(A.w, A.d, c, A.cx, A.cz), y: roof, hLow: 3, hHigh: peakA - roof, mat: M.white });
  slopedBlock(g, { points: chamferRect(B.w, B.d, c, B.cx, B.cz), y: roof - 3, hLow: 9, hHigh: top - roof + 3, mat: M.white });
  crownEdge(g, { x0: A.cx - A.w / 2, x1: A.cx + A.w / 2, y0: roof + 3, y1: peakA, z: A.cz, d: A.d });
  crownEdge(g, { x0: B.cx - B.w / 2, x1: B.cx + B.w / 2, y0: roof + 6, y1: top, z: B.cz, d: B.d });
  box(g, { w: 5, h: 3.5, d: 6, x: A.cx - 1.5, y: roof, z: A.cz, mat: M.steelDark });
  return g;
}

/** Slim aluminium frame along a slanted top edge, on both long faces. */
function crownEdge(g, { x0, x1, y0, y1, z, d }) {
  const length = Math.hypot(x1 - x0, y1 - y0);
  const angle = Math.atan2(y1 - y0, x1 - x0);
  [-d / 2, d / 2].forEach((dz) => {
    const bar = box(g, { w: length, h: 0.45, d: 0.6, x: (x0 + x1) / 2, y: (y0 + y1) / 2 - 0.22, z: z + dz, mat: M.aluminum });
    bar.rotation.z = angle;
  });
}

/**
 * Landmark tower (42F): dark-glass main body with aluminium fins, a taller slender white-glass blade
 * along its west side, both cut by a slanted top rising westwards, and a "pixel" field of white
 * panels high on the north and west faces.
 */
function landmarkTower(parent, { x, z, ry = 0 }) {
  const g = subgroup(parent, { x, z, ry });
  const body = { w: 20, d: 13, c: 2 };
  const blade = { w: 6, d: 14.5, cx: -8.5, c: 0.8 };
  const bodyLow = 168;
  const bodyHigh = 178;
  prism(g, { points: chamferRect(body.w, body.d, body.c), h: bodyLow, mat: M.glassDark });
  slopedBlock(g, { points: chamferRect(body.w, body.d, body.c), y: bodyLow, hLow: bodyHigh - bodyLow, hHigh: 0.01, mat: M.glassDark });
  prism(g, { points: chamferRect(blade.w, blade.d, blade.c, blade.cx), h: 176, mat: M.glassWhite });
  slopedBlock(g, { points: chamferRect(blade.w, blade.d, blade.c, blade.cx), y: 176, hLow: 185 - 176, hHigh: 3, mat: M.glassWhite });
  // Aluminium fins on the long faces and floor bands every four storeys.
  stripes(g, { w: body.w, d: body.d, c: body.c, y0: PODIUM_H, y1: bodyLow - 1, faces: "ns", spacing: 2.7, sw: 0.4, st: 0.5, mat: M.aluminum });
  for (let y = PODIUM_H + 16; y < bodyLow - 4; y += 16) {
    prism(g, { points: chamferRect(body.w + 0.4, body.d + 0.4, body.c), h: 0.5, y, mat: M.steelDark });
  }
  // Pixel panels (white) scattered over the upper north face and the blade's west face.
  const rng = seededRandom(65);
  for (let row = 0; row < 10; row += 1) {
    for (let col = 0; col < 6; col += 1) {
      if (rng() < 0.45) {
        box(g, { w: 2.2, h: 3.6, d: 0.45, x: -6 + col * 2.4, y: 112 + row * 5.4, z: -body.d / 2, mat: M.white });
      }
      if (col < 3 && rng() < 0.4) {
        box(g, { w: 0.45, h: 3.6, d: 3.2, x: blade.cx - blade.w / 2, y: 118 + row * 5.4, z: -4 + col * 4, mat: M.aluminum });
      }
    }
  }
  // Hotel sky-lobby band and rooftop plant.
  prism(g, { points: chamferRect(body.w + 0.6, body.d + 0.6, body.c), h: 4, y: 100, mat: M.steelDark });
  box(g, { w: 6, h: 3, d: 5, x: 4, y: bodyLow, z: 0, mat: M.steelDark });
  return g;
}

export default {
  id: "cheongnyangni-skyl65",
  name: "청량리역 롯데캐슬 SKY-L65",
  nameEn: "Cheongnyangni Lotte Castle SKY-L65",
  district: "동대문구",
  lat: 37.579,
  lon: 127.0453,
  height: 226,
  colliderRadius: 44,
  detail: "medium",
  description: "청량리역 위 65층 4개동 주상복합",
  create() {
    const g = new THREE.Group();
    // 왕산로 (north edge of the block) runs east-north-east; the station lies to the east.
    const site = subgroup(g, { ry: deg(15) });

    // Plaza / sidewalks
    prism(site, { points: chamferRect(76, 60, 14, 2, 2), h: 0.8, mat: M.granite });

    // ── Residential deck (2 storeys: lobbies, drop-off, community facilities) ──
    const deck = chamferRect(66, 40, 6, -4, 8);
    prism(site, { points: deck, h: DECK_H, mat: M.limestone });
    prism(site, { points: chamferRect(66.3, 40.3, 6, -4, 8), h: 1.4, y: 0.8, mat: M.graniteDark });
    prism(site, { points: chamferRect(66.4, 40.4, 6, -4, 8), h: 0.8, y: DECK_H - 0.8, mat: M.granite });
    // Shopfront glazing on the south and west faces
    box(site, { w: 44, h: 4.4, d: 0.5, x: -6, y: 2.2, z: 28.2, mat: M.glassBlue });
    box(site, { w: 0.5, h: 4.4, d: 22, x: -37.2, y: 2.2, z: 8, mat: M.glassBlue });
    // Deck landscaping between the towers
    box(site, { w: 14, h: 0.3, d: 8, x: -14, y: DECK_H, z: 16, mat: M.grass });
    box(site, { w: 10, h: 0.3, d: 9, x: 2, y: DECK_H, z: 8, mat: M.grass });
    box(site, { w: 8, h: 0.3, d: 8, x: -24, y: DECK_H, z: -4, mat: M.grass });
    treePatch(site, { w: 11, d: 6, x: -14, y: DECK_H + 0.3, z: 16, count: 5, seed: 3, h: 5.5, r: 1.8 });
    [[2, 6], [4, 11], [-24, -4], [-22, -1]].forEach(([x, z]) => tree(site, { x, y: DECK_H + 0.3, z, h: 5.5, r: 1.7 }));

    // ── Retail podium (롯데백화점 청량리 / 롯데시네마, 6 storeys of faceted glass) ──
    const pod = (inset = 0) => chamferRect(48 + inset, 24 + inset, 4, 14, -3);
    prism(site, { points: pod(), h: PODIUM_H, mat: M.glassWhite });
    for (let y = 4.5; y < PODIUM_H - 2; y += 4.5) {
      prism(site, { points: pod(0.5), h: 0.6, y, mat: M.white });
    }
    prism(site, { points: pod(0.6), h: 1.4, y: PODIUM_H - 1.4, mat: M.white }); // parapet
    // Folded glass "prow" volumes leaning out of the north face and the west corner.
    slopedBlock(site, { points: [[-6, 0], [6, 0], [3, -5.5], [-4, -5.5]], y: 4, hLow: 15, hHigh: 18, x: 2, z: -15, mat: M.glass });
    slopedBlock(site, { points: [[0, 0], [5.5, -3.5], [7, 2], [1, 4]], y: 2, hLow: 14, hHigh: 17, x: -12, z: -9, mat: M.glass });
    // Entrance canopy: a big white triangular prow pointing north-east towards the station plaza.
    prism(site, { points: [[-9, 0], [9, 0], [3, -11]], h: 0.8, y: 9, x: 30, z: -15, mat: M.white });
    cyl(site, { rTop: 0.5, h: 9, x: 33, y: 0.8, z: -24, mat: M.steel, seg: 10 });
    cyl(site, { rTop: 0.5, h: 9, x: 24, y: 0.8, z: -18, mat: M.steel, seg: 10 });
    box(site, { w: 16, h: 6, d: 0.6, x: 30, y: 0.8, z: -15.2, mat: M.glassBlue });
    // Roof garden with a glass pavilion and lawns
    box(site, { w: 30, h: 0.3, d: 12, x: 6, y: PODIUM_H, z: -3, mat: M.grass });
    box(site, { w: 10, h: 0.3, d: 14, x: 30, y: PODIUM_H, z: 2, mat: M.grass });
    box(site, { w: 2.5, h: 0.32, d: 20, x: 16, y: PODIUM_H, z: -3, mat: M.granite });
    treePatch(site, { w: 26, d: 9, x: 6, y: PODIUM_H + 0.3, z: -3, count: 8, seed: 21, h: 5, r: 1.7 });
    [[30, 4], [32, 8], [28, 0]].forEach(([x, z]) => tree(site, { x, y: PODIUM_H + 0.3, z, h: 5, r: 1.6 }));
    box(site, { w: 9, h: 3.8, d: 5, x: 26, y: PODIUM_H, z: -8, mat: M.glassWhite });
    box(site, { w: 9.6, h: 0.3, d: 5.6, x: 26, y: PODIUM_H + 3.8, z: -8, mat: M.steelDark });

    // ── Elevated walkway towards 청량리역 (east) ──
    box(site, { w: 8, h: 0.5, d: 5, x: 39, y: 8, z: -4, mat: M.concrete });
    box(site, { w: 8, h: 1.3, d: 0.2, x: 39, y: 8.5, z: -6.4, mat: M.glass });
    box(site, { w: 8, h: 1.3, d: 0.2, x: 39, y: 8.5, z: -1.6, mat: M.glass });
    cyl(site, { rTop: 0.45, h: 8, x: 42, y: 0.8, z: -4, mat: M.concrete, seg: 10 });

    // ── Towers ──
    // Landmark tower (42F / 185 m) at the north-east corner next to the station.
    landmarkTower(site, { x: 28, z: -4 });
    // Residential towers: B·D동 65F / 226 m, A동 64F / 223 m, C동 63F / 219 m in a staggered 2 × 2.
    residentialTower(site, { x: 4, z: -6, floors: 65, top: 226 });
    residentialTower(site, { x: -18, z: -2, floors: 65, top: 226 });
    residentialTower(site, { x: 12, z: 18, floors: 64, top: 223 });
    residentialTower(site, { x: -10, z: 23, floors: 63, top: 219 });

    // Street trees around the block
    [[-34, 22], [-30, 28], [-20, 31], [-4, 31], [10, 30], [22, 27], [30, 19], [36, 10],
      [-36, -6], [-32, -14], [-20, -20], [-10, -24], [6, -26], [16, -26], [40, -14]]
      .forEach(([x, z], i) => tree(site, { x, y: 0.8, z, h: 6.5 + (i % 3) * 0.6, r: 2 }));

    return g;
  },
};
