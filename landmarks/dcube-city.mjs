// 디큐브시티 (D-Cube City, Jerde / Samoo 2011) - 구로구
// Sindorim mixed-use: a 42-storey curved blue-glass office/hotel tower (~168 m) rising from a
// six-level warm-stone mall. Timber "lantern" pavilions along 경인로, a white ginkgo-curved
// 뮤지컬홀 on the podium roof, and stepped garden terraces toward 신도림역. The two residential
// towers sit outside this collider. Footprints scaled; tower height 1:1.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, prism, subgroup, tree, treePatch, deg } from "./_helpers.mjs";

const STONE = material(0xe8d9b8, { roughness: 0.8 });
const STONE_WARM = material(0xd9c49a, { roughness: 0.82 });
const WOOD = material(0x8a5a32, { roughness: 0.62, metalness: 0.08 });
const OFFICE = M.glassBlue;
const HOTEL = material(0x8ec4d4, { roughness: 0.18, metalness: 0.45, emissive: 0x143040, emissiveIntensity: 0.22 });
const BAND = M.aluminum;
const FLOOR = 3.85;
const PODIUM_H = 26.5;
const OFFICE_TOP = 100;
const HOTEL_TOP = 158;
const CROWN = 168;

/** Flowing rounded plan (water / ginkgo), `k` scales the outline. */
function flowPlan(rx, rz, k = 1, n = 18) {
  const pts = [];
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const pinch = 0.78 + 0.22 * Math.cos(a * 2 + 0.35);
    pts.push([Math.cos(a) * rx * k * pinch, Math.sin(a) * rz * k * (0.9 + 0.1 * Math.sin(a))]);
  }
  return pts;
}

export default {
  id: "dcube-city",
  name: "디큐브시티",
  nameEn: "D-Cube City",
  district: "구로구",
  lat: 37.5087,
  lon: 126.8893,
  height: 168,
  colliderRadius: 50,
  detail: "medium",
  description: "신도림 42층 곡면 타워와 저층 몰",
  create() {
    const g = new THREE.Group();
    // 경인로 along the south; 신도림역 and the park sit to the north.
    const site = subgroup(g, { ry: deg(8) });

    prism(site, {
      points: [[-36, -28], [20, -30], [38, -12], [36, 22], [18, 30], [-22, 28], [-38, 10], [-38, -12]],
      h: 0.55,
      mat: M.granite,
    });

    // ── Six-level mall podium (warm stone, glass shopfronts, organic outline) ──
    const pod = [
      [-28, -16], [-8, -20], [16, -18], [26, -8], [24, 16], [8, 22], [-18, 20], [-30, 6],
    ];
    const grow = (pts, e) => pts.map(([px, pz]) => [px + Math.sign(px || 1) * e, pz + Math.sign(pz || 1) * e]);
    prism(site, { points: pod, h: PODIUM_H, y: 0.55, mat: STONE });
    prism(site, { points: grow(pod, 0.25), h: 4.4, y: 0.7, mat: M.glass });
    for (let f = 2; f <= 5; f += 1) {
      prism(site, { points: grow(pod, 0.18), h: 1.5, y: 0.55 + f * 4.3, mat: M.glassWhite });
    }
    prism(site, { points: grow(pod, 0.4), h: 1.1, y: 0.55 + PODIUM_H - 1.1, mat: STONE_WARM });

    // ── Curved office / hotel tower (Daesung + Sheraton), south of the mall centre ──
    const tx = 6;
    const tz = 8;
    prism(site, { points: flowPlan(13.5, 9.2, 1).map(([px, pz]) => [px + tx, pz + tz]), h: OFFICE_TOP, mat: OFFICE });
    prism(site, { points: flowPlan(12.4, 8.5, 1).map(([px, pz]) => [px + tx, pz + tz]), h: HOTEL_TOP - OFFICE_TOP, y: OFFICE_TOP, mat: HOTEL });
    // Horizontal spandrels (every other floor to keep the medium budget tidy).
    for (let y = FLOOR * 2; y < OFFICE_TOP - 2; y += FLOOR * 2) {
      prism(site, { points: flowPlan(13.7, 9.4, 1).map(([px, pz]) => [px + tx, pz + tz]), h: 0.45, y: y - 0.2, mat: BAND });
    }
    for (let y = OFFICE_TOP + FLOOR; y < HOTEL_TOP - 2; y += FLOOR * 2) {
      prism(site, { points: flowPlan(12.6, 8.7, 1).map(([px, pz]) => [px + tx, pz + tz]), h: 0.4, y: y - 0.2, mat: BAND });
    }
    // Office / hotel belt and the lantern-like glass crown (hotel lobby at the top).
    prism(site, { points: flowPlan(13.2, 9, 1).map(([px, pz]) => [px + tx, pz + tz]), h: 3.2, y: OFFICE_TOP - 1.2, mat: M.steel });
    prism(site, { points: flowPlan(10.2, 7, 1).map(([px, pz]) => [px + tx, pz + tz]), h: CROWN - HOTEL_TOP, y: HOTEL_TOP, mat: M.glassWhite });
    prism(site, { points: flowPlan(10.6, 7.3, 1).map(([px, pz]) => [px + tx, pz + tz]), h: 0.7, y: HOTEL_TOP, mat: M.steel });
    prism(site, { points: flowPlan(8.4, 5.6, 1).map(([px, pz]) => [px + tx, pz + tz]), h: 0.6, y: CROWN - 0.6, mat: M.steel });

    // ── Timber lantern pavilions along 경인로 (south) ─────────────────────────
    [[-14, 24, 9, 11], [2, 26, 8, 13], [16, 23, 7.5, 10]].forEach(([x, z, r, h]) => {
      cyl(site, { rTop: r * 0.72, rBot: r, h, x, y: 0.55, z, mat: WOOD, seg: 14, sz: 0.78 });
      cyl(site, { rTop: r * 0.55, h: 3.2, x, y: 1.4, z, mat: M.warmLight, seg: 12, sz: 0.78 });
      cyl(site, { rTop: r * 0.78, h: 0.5, x, y: 0.55 + h, z, mat: STONE_WARM, seg: 14, sz: 0.78 });
    });

    // ── White 뮤지컬홀 (ginkgo-curve) on the podium roof ─────────────────────
    const hallY = 0.55 + PODIUM_H;
    prism(site, {
      points: [
        [-22, -4], [-6, -10], [4, -6], [2, 6], [-8, 10], [-24, 4],
      ],
      h: 14,
      y: hallY,
      mat: M.white,
    });
    prism(site, {
      points: [
        [-20, -2], [-8, -7], [1, -4], [0, 4], [-8, 7], [-22, 2],
      ],
      h: 8,
      y: hallY + 2,
      mat: M.glassWhite,
    });
    box(site, { w: 10, h: 0.5, d: 5, x: -10, y: hallY + 6, z: 12, mat: M.steel });

    // Stepped roof gardens toward the station (north).
    box(site, { w: 16, h: 0.3, d: 10, x: -6, y: hallY, z: -12, mat: M.grass });
    box(site, { w: 10, h: 0.3, d: 8, x: 10, y: hallY, z: -8, mat: M.grass });
    treePatch(site, { w: 12, d: 7, x: -6, y: hallY + 0.3, z: -12, count: 5, seed: 6, h: 5, r: 1.7 });
    tree(site, { x: 10, y: hallY + 0.3, z: -8, h: 5.2, r: 1.6 });
    tree(site, { x: 13, y: hallY + 0.3, z: -6, h: 4.6, r: 1.4 });

    // Station-side park: lawn, pool, amphitheatre disc, trees.
    box(site, { w: 28, h: 0.28, d: 12, x: -4, y: 0.55, z: -24, mat: M.grass });
    cyl(site, { rTop: 5.5, h: 0.35, x: -16, y: 0.55, z: -22, mat: M.granite, seg: 16 });
    cyl(site, { rTop: 4.4, h: 0.22, x: -16, y: 0.9, z: -22, mat: M.water, seg: 16 });
    cyl(site, { rTop: 6.5, rBot: 8, h: 1.4, x: 8, y: 0.55, z: -24, mat: M.limestone, seg: 16 });
    treePatch(site, { w: 22, d: 6, x: -2, y: 0.7, z: -26, count: 7, seed: 19, h: 7, r: 2.2 });

    // Mall entrance canopy facing the park / station.
    box(site, { w: 16, h: 0.5, d: 6, x: -4, y: 6.2, z: -20, mat: M.steel });
    [-6, 6].forEach((dx) => cyl(site, { rTop: 0.28, h: 5.7, x: -4 + dx, y: 0.55, z: -22, mat: M.steel, seg: 8 }));

    return g;
  },
};
