// 마리오아울렛 (Mario Outlet Fashion Town, 2001 / 2004 / 2012) - 금천구
// Three adjacent beige/white retail halls at 가산디지털단지: 8-storey 1관 (본관+신관) on Digital-ro,
// low 2관 (outdoor), and the taller 13-storey 3관 on 벚꽃로, linked by skybridges over 마리오광장 and
// 마르페광장. A row of large outlet boxes with red MARIO sign bands, glass storefronts and a shared
// granite podium. Footprints scaled to the collider; 3관 height 1:1 (~60 m).
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, slab, subgroup, tree, deg } from "./_helpers.mjs";

const BEIGE = material(0xe4d6b8, { roughness: 0.82 });
const CREAM = material(0xefe8d8, { roughness: 0.78 });
const WHITE_HALL = material(0xf2f0ea, { roughness: 0.7 });
const PIER = M.aluminum;
const FLOOR1 = 4.5;
const FLOOR2 = 4.2;
const FLOOR3 = 4.5;

/** Red MARIO fascia on the ±z faces of a hall. */
function marioBand(g, { w, d, x, y, z, width = 14 }) {
  box(g, { w: width, h: 3.4, d: 0.45, x, y, z: z + d / 2 + 0.22, mat: M.red });
  box(g, { w: width, h: 3.4, d: 0.45, x, y, z: z - d / 2 - 0.22, mat: M.red });
}

/** One outlet hall: beige/white box, granite base, glass shopfronts, window bands, cornice, roof plant. */
function hall(g, { x, z, w, d, floors, floorH, mat, signW }) {
  const h = floors * floorH;
  box(g, { w, h, d, x, y: 0.5, z, mat });
  box(g, { w: w + 0.35, h: Math.min(h, floorH * 1.6), d: d + 0.35, x, y: 0.5, z, mat: M.graniteDark });
  box(g, { w: w - 5, h: 3.6, d: d + 0.55, x, y: 0.5, z, mat: M.glass });
  box(g, { w: w + 0.55, h: 3.6, d: d - 6, x, y: 0.5, z, mat: M.glass });
  for (let f = 2; f < floors; f += 1) {
    box(g, { w: w + 0.28, h: 1.55, d: d + 0.28, x, y: 0.5 + f * floorH + 1.1, z, mat: M.glassDark });
  }
  const nx = Math.max(3, Math.round(w / 7));
  for (let i = 0; i <= nx; i += 1) {
    const px = x - w / 2 + (w / nx) * i;
    box(g, { w: 0.7, h: h + 0.3, d: 0.4, x: px, y: 0.5, z: z + d / 2 + 0.12, mat: PIER });
    box(g, { w: 0.7, h: h + 0.3, d: 0.4, x: px, y: 0.5, z: z - d / 2 - 0.12, mat: PIER });
  }
  box(g, { w: w + 0.8, h: 1.1, d: d + 0.8, x, y: 0.5 + h - 0.7, z, mat: PIER });
  marioBand(g, { w, d, x, y: 0.5 + h - 5.2, z, width: signW });
  box(g, { w: 8, h: 2.6, d: 5, x: x - w * 0.22, y: 0.5 + h, z: z - 2, mat: M.concreteDark });
  cyl(g, { rTop: 1.3, h: 2.2, x: x + w * 0.28, y: 0.5 + h, z: z + 3, mat: M.steelDark, seg: 10 });
  return h;
}

export default {
  id: "mario-outlet",
  name: "마리오아울렛",
  nameEn: "Mario Outlet",
  district: "금천구",
  lat: 37.4782,
  lon: 126.8873,
  height: 60,
  colliderRadius: 56,
  detail: "low",
  description: "가산디지털단지의 3개관 아울렛",
  create() {
    const g = new THREE.Group();
    // Digital-ro / 벚꽃로 run NNE–SSW; the three halls sit in an east–west row.
    const site = subgroup(g, { ry: deg(-12) });

    slab(site, { w: 96, d: 52, h: 0.5, mat: M.asphalt });
    slab(site, { w: 88, d: 44, h: 0.55, y: 0.15, mat: M.granite });

    // ── 1관 (west, Digital-ro): 8F 본관 + lower 신관 with 5F 하늘공원 ─────────
    hall(site, { x: -32, z: 7, w: 22, d: 26, floors: 8, floorH: FLOOR1, mat: BEIGE, signW: 13 });
    box(site, { w: 16, h: 5 * FLOOR1, d: 16, x: -30, y: 0.5, z: -16, mat: CREAM });
    box(site, { w: 16.3, h: FLOOR1 * 1.5, d: 16.3, x: -30, y: 0.5, z: -16, mat: M.graniteDark });
    box(site, { w: 12, h: 3.4, d: 16.4, x: -30, y: 0.5, z: -16, mat: M.glass });
    for (let f = 2; f < 5; f += 1) {
      box(site, { w: 16.25, h: 1.4, d: 16.25, x: -30, y: 0.5 + f * FLOOR1 + 1, z: -16, mat: M.glassDark });
    }
    box(site, { w: 16.6, h: 0.8, d: 16.6, x: -30, y: 0.5 + 5 * FLOOR1 - 0.4, z: -16, mat: PIER });
    // 하늘공원 terrace between 본관 and 신관.
    box(site, { w: 18, h: 0.35, d: 10, x: -31, y: 0.5 + 5 * FLOOR1, z: -4, mat: M.concrete });
    box(site, { w: 12, h: 0.25, d: 7, x: -31, y: 0.5 + 5 * FLOOR1 + 0.35, z: -4, mat: M.grass });
    tree(site, { x: -34, y: 0.5 + 5 * FLOOR1 + 0.5, z: -4, h: 4.2, r: 1.5 });
    tree(site, { x: -28, y: 0.5 + 5 * FLOOR1 + 0.5, z: -3, h: 3.8, r: 1.3 });

    // ── 마리오광장 (1–2) and 2관 (outdoor, 4F) ────────────────────────────────
    box(site, { w: 10, h: 0.12, d: 22, x: -16, y: 0.55, z: 2, mat: M.marble });
    hall(site, { x: -4, z: 3, w: 18, d: 24, floors: 4, floorH: FLOOR2, mat: BEIGE, signW: 11 });

    // ── 마르페광장 (2–3) and 3관 (13F white/grey hall, tallest) ───────────────
    box(site, { w: 10, h: 0.12, d: 24, x: 11, y: 0.55, z: 2, mat: M.marble });
    [-2, 4].forEach((z) => tree(site, { x: 11, y: 0.7, z, h: 5.5, r: 1.8 }));
    const h3 = hall(site, { x: 28, z: 2, w: 26, d: 34, floors: 13, floorH: FLOOR3, mat: WHITE_HALL, signW: 16 });
    // 14F sky-park parapet and a couple of roof planters.
    box(site, { w: 22, h: 0.9, d: 28, x: 28, y: 0.5 + h3, z: 2, mat: M.concrete });
    box(site, { w: 8, h: 0.25, d: 6, x: 22, y: 0.5 + h3 + 0.9, z: -4, mat: M.grass });
    box(site, { w: 6, h: 0.25, d: 5, x: 33, y: 0.5 + h3 + 0.9, z: 6, mat: M.grass });

    // Skybridges at 3F: 1↔2 and 2↔3.
    box(site, { w: 14, h: 3.2, d: 5.5, x: -17, y: 12.2, z: 4, mat: M.glassWhite });
    box(site, { w: 14.4, h: 0.45, d: 6, x: -17, y: 15.4, z: 4, mat: PIER });
    box(site, { w: 13, h: 3.2, d: 5.5, x: 11, y: 12.2, z: 4, mat: M.glassWhite });
    box(site, { w: 13.4, h: 0.45, d: 6, x: 11, y: 15.4, z: 4, mat: PIER });

    // Entrance canopies on the south (street) faces.
    box(site, { w: 12, h: 0.45, d: 5, x: -32, y: 5.4, z: 23, mat: PIER });
    [-4, 4].forEach((dx) => cyl(site, { rTop: 0.28, h: 4.9, x: -32 + dx, y: 0.5, z: 24.5, mat: PIER, seg: 8 }));
    box(site, { w: 14, h: 0.45, d: 5.5, x: 28, y: 5.6, z: 22, mat: PIER });
    [-5, 5].forEach((dx) => cyl(site, { rTop: 0.28, h: 5.1, x: 28 + dx, y: 0.5, z: 23.6, mat: PIER, seg: 8 }));

    // Street trees along Digital-ro (west) and 벚꽃로 (east).
    [[-46, -14], [-46, 0], [-46, 16], [46, -12], [46, 4], [46, 16], [-20, -22], [4, -22], [24, -22]]
      .forEach(([x, z], i) => tree(site, { x, y: 0.5, z, h: 6 + (i % 3) * 0.5, r: 2 }));

    return g;
  },
};
