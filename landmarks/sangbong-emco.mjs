// 상봉 프레미어스 엠코 (Sangbong Premiers Emco, 현대엠코 / 원양건축, 2013) - 중랑구
// Mixed-use complex at 상봉역 on 망우로: three residential towers - A·B동 43F / 159 m with tapered
// crowns and slender spires, and the taller C동 48F / 185 m with a stepped crown and slanted cap -
// standing on a 7-storey podium (엔터식스 fashion mall + 홈플러스 in dark glass below, beige stone
// parking levels with slot windows above, a big blue-glass atrium at the station corner) topped by the
// 7F "natural park" roof garden that links the towers. Towers are white/light-grey panel slabs with
// rounded (chamfered) corners and continuous blue-glass ribbon windows. Footprints are ~1/2 real scale;
// heights are 1:1.
import * as THREE from "../vendor/three.module.js";
import { M, box, cyl, frustum, prism, subgroup, tree, treePatch, trianglesToGeometry, deg } from "./_helpers.mjs";

const PODIUM_H = 28; // B2-7F commercial / parking / community levels
const FLOOR = 3.3;

/** Rectangle `w × d` centred at (cx, cz) with corners chamfered by `c`, as [x, z] points. */
function chamferRect(w, d, c, cx = 0, cz = 0) {
  const hw = w / 2;
  const hd = d / 2;
  return [
    [cx - hw + c, cz - hd], [cx + hw - c, cz - hd], [cx + hw, cz - hd + c], [cx + hw, cz + hd - c],
    [cx + hw - c, cz + hd], [cx - hw + c, cz + hd], [cx - hw, cz + hd - c], [cx - hw, cz - hd + c],
  ];
}

/** Box-like solid with a planar top sloping along x from `hLow` (west) to `hHigh` (east). */
function slantedCap(parent, { w, d, hLow, hHigh, x = 0, y = 0, z = 0, mat }) {
  const hw = w / 2;
  const hd = d / 2;
  const b = [[-hw, 0, hd], [hw, 0, hd], [hw, 0, -hd], [-hw, 0, -hd]];
  const t = [[-hw, hLow, hd], [hw, hHigh, hd], [hw, hHigh, -hd], [-hw, hLow, -hd]];
  const tris = [];
  for (let i = 0; i < 4; i += 1) {
    const j = (i + 1) % 4;
    tris.push(b[i], b[j], t[j], b[i], t[j], t[i]);
  }
  tris.push(t[0], t[1], t[2], t[0], t[2], t[3], b[2], b[1], b[0], b[3], b[2], b[0]);
  const mesh = new THREE.Mesh(trianglesToGeometry(tris), mat);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

/**
 * Residential tower: white panel slab with chamfered corners, blue-glass ribbon windows on every
 * floor, a dark core slot on the north face and a crown - tapered (A·B동) or stepped with a slanted
 * cap (C동) - ending in a spire at `top`.
 */
function emcoTower(parent, { x, z, w = 18, d = 11, floors, tallFloors = 0, top, stepped = false, mat = M.white }) {
  const g = subgroup(parent, { x, z });
  const c = 1.3;
  const roof = PODIUM_H + tallFloors * 4.2 + floors * FLOOR;
  prism(g, { points: chamferRect(w, d, c), h: roof, mat });
  // Ribbon windows (one per storey) and the office floors of C동 as taller glass bands.
  let y = PODIUM_H + 1.0;
  for (let i = 0; i < tallFloors; i += 1) {
    prism(g, { points: chamferRect(w + 0.2, d + 0.2, c), h: 2.6, y, mat: M.glassBlue });
    y += 4.2;
  }
  for (let i = 0; i < floors; i += 1) {
    prism(g, { points: chamferRect(w + 0.2, d + 0.2, c), h: 1.7, y: y + 0.4, mat: M.glassBlue });
    y += FLOOR;
  }
  // Dark core / stair slot on the north face and a light vertical pier on the south face.
  box(g, { w: 2.6, h: roof - PODIUM_H, d: 0.5, x: 0, y: PODIUM_H, z: -d / 2, mat: M.glassDark });
  box(g, { w: 1.4, h: roof - PODIUM_H + 2, d: 0.5, x: 0, y: PODIUM_H, z: d / 2, mat: M.offWhite });
  // Crown
  if (stepped) {
    prism(g, { points: chamferRect(w - 3, d - 2, c), h: 5, y: roof, mat: M.offWhite });
    prism(g, { points: chamferRect(w - 3.2, d - 2.2, c), h: 0.5, y: roof + 4.6, mat: M.steelDark });
    slantedCap(g, { w: w - 7, d: d - 4, hLow: 2.5, hHigh: 7, y: roof + 5, mat: M.steelDark });
    cyl(g, { rTop: 0.15, rBot: 0.45, h: top - (roof + 12), x: (w - 7) / 2 - 1.5, y: roof + 12, mat: M.steel, seg: 8 });
  } else {
    frustum(g, { wBot: w, dBot: d, wTop: w * 0.55, dTop: d * 0.55, h: 8, y: roof, mat: M.offWhite });
    frustum(g, { wBot: w * 0.55, dBot: d * 0.55, wTop: w * 0.3, dTop: d * 0.3, h: 3, y: roof + 8, mat: M.steelDark });
    cyl(g, { rTop: 0.15, rBot: 0.4, h: top - (roof + 11), y: roof + 11, mat: M.steel, seg: 8 });
  }
  return g;
}

export default {
  id: "sangbong-emco",
  name: "상봉 프레미어스 엠코",
  nameEn: "Sangbong Premiers Emco",
  district: "중랑구",
  lat: 37.5972,
  lon: 127.0856,
  height: 185,
  colliderRadius: 40,
  detail: "low",
  description: "상봉역 위 45층 트윈 주상복합",
  create() {
    const g = new THREE.Group();
    // 망우로 runs east-north-east past the south side of the block.
    const site = subgroup(g, { ry: deg(20) });

    // Plaza / sidewalks
    prism(site, { points: chamferRect(74, 42, 10, 0, 2), h: 0.8, mat: M.granite });

    // ── Podium ──
    const pod = (inset = 0) => chamferRect(66 + inset, 32 + inset, 4);
    // 1-3F: 엔터식스 / 홈플러스 - dark glass with white spandrel bands
    prism(site, { points: pod(), h: 12.8, mat: M.glassDark });
    [4.4, 8.6].forEach((y) => prism(site, { points: pod(0.4), h: 0.6, y, mat: M.white }));
    // 4-6F: parking levels in beige stone with dark ventilation slots
    prism(site, { points: pod(0.3), h: 11.2, y: 12.8, mat: M.limestone });
    [14.8, 18.4, 22].forEach((y) => prism(site, { points: pod(0.5), h: 1.0, y, mat: M.glassDark }));
    // 7F: community level (glass) and the roof-garden parapet
    prism(site, { points: pod(-0.6), h: 4, y: 24, mat: M.glassWhite });
    prism(site, { points: pod(0.2), h: 1.2, y: PODIUM_H - 0.4, mat: M.concrete });
    // Corner atrium (station corner, south-west): tall blue-glass box with aluminium frame lines
    box(site, { w: 14, h: 30, d: 12, x: -27, y: 0.8, z: 12, mat: M.glassBlue });
    for (let y = 5; y < 30; y += 5) {
      box(site, { w: 14.3, h: 0.35, d: 12.3, x: -27, y: 0.8 + y, z: 12, mat: M.aluminum });
    }
    box(site, { w: 14.6, h: 0.8, d: 12.6, x: -27, y: 30.8, z: 12, mat: M.steelDark });
    // Street-level shopfronts and the mall entrance canopy along 망우로 (south face)
    box(site, { w: 40, h: 4.2, d: 0.5, x: 6, y: 0.8, z: 16.2, mat: M.glassBlue });
    box(site, { w: 26, h: 0.5, d: 5, x: 6, y: 6.5, z: 18, mat: M.steelDark });
    [-4, 6, 16].forEach((x) => cyl(site, { rTop: 0.35, h: 5.7, x, y: 0.8, z: 19.8, mat: M.steel, seg: 8 }));
    // Residents' lobby entrance on the north side
    box(site, { w: 18, h: 0.5, d: 4, x: 0, y: 6.5, z: -17.5, mat: M.steelDark });

    // ── 7F roof garden (자연공원) linking the towers ──
    box(site, { w: 56, h: 0.3, d: 20, x: 0, y: PODIUM_H, z: 0, mat: M.grass });
    box(site, { w: 58, h: 0.32, d: 2.4, x: 0, y: PODIUM_H, z: 0, mat: M.granite });
    box(site, { w: 2.4, h: 0.32, d: 20, x: -11, y: PODIUM_H, z: 0, mat: M.granite });
    box(site, { w: 2.4, h: 0.32, d: 20, x: 11, y: PODIUM_H, z: 0, mat: M.granite });
    treePatch(site, { w: 16, d: 6, x: -11, y: PODIUM_H + 0.3, z: 5, count: 5, seed: 8, h: 5, r: 1.7 });
    treePatch(site, { w: 16, d: 6, x: 11, y: PODIUM_H + 0.3, z: -5, count: 5, seed: 13, h: 5, r: 1.7 });
    box(site, { w: 8, h: 3.6, d: 5, x: -11, y: PODIUM_H, z: -6, mat: M.glassWhite }); // pool hall
    box(site, { w: 8.5, h: 0.3, d: 5.5, x: -11, y: PODIUM_H + 3.6, z: -6, mat: M.steelDark });
    box(site, { w: 5, h: 2.4, d: 4, x: 11, y: PODIUM_H, z: 6, mat: M.concrete }); // plant

    // ── Towers ──
    emcoTower(site, { x: -22, z: -3, floors: 36, top: 159 }); // A동 43F
    emcoTower(site, { x: 0, z: 3, floors: 36, top: 159, mat: M.offWhite }); // B동 43F
    emcoTower(site, { x: 22, z: -3, floors: 35, tallFloors: 6, top: 185, stepped: true }); // C동 48F

    // Plaza trees along 망우로 and the side streets
    [[-30, 22], [-20, 22], [-8, 23], [4, 23.5], [16, 23], [26, 22], [34, 14], [35, 2], [34, -10],
      [-35, -8], [-36, 4], [-24, -20], [-10, -21], [10, -21], [24, -20]]
      .forEach(([x, z], i) => tree(site, { x, y: 0.8, z, h: 6.5 + (i % 3) * 0.6, r: 2 }));

    return g;
  },
};
