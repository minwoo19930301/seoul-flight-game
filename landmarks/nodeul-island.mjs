// 노들섬 (Nodeul Island, MMK+ / 2019) - 용산구
// Artificial Han River island under 한강대교: a flat E–W oval with a water collar, the N–S bridge
// deck crossing at mid-island, and a village of low timber / metal / concrete sheds (라이브하우스,
// 노들서가, 다목적홀) linked by roof decks. 노들마당 lawn to the west, 노들숲 trees to the east.
// Real buildings are ≤ 3 storeys / 14.8 m; the model stays flat and island-like inside r = 50.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, prism, tree, subgroup } from "./_helpers.mjs";

const TIMBER = material(0xb08968, { roughness: 0.88 });
const TIMBER_DARK = material(0x7a5a38, { roughness: 0.9 });
const PANEL = material(0xc8c4bb, { roughness: 0.82 });
const DECK = material(0x9a8b72, { roughness: 0.85 });
const METAL = M.steelDark;

/** Closed ellipse [[x, z], ...]. */
function ellipse(rx, rz, n = 28) {
  const pts = [];
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    pts.push([Math.cos(a) * rx, Math.sin(a) * rz]);
  }
  return pts;
}

export default {
  id: "nodeul-island",
  name: "노들섬",
  nameEn: "Nodeul Island",
  district: "용산구",
  lat: 37.5176,
  lon: 126.9586,
  height: 14,
  colliderRadius: 50,
  detail: "low",
  description: "한강 위 문화섬, 저층 복합문화공간과 잔디밭",
  create() {
    const g = new THREE.Group();

    // ── Water collar and flat island deck (E–W oval; +x east, −z north) ──
    prism(g, { points: ellipse(48.5, 22.5, 26), h: 0.45, y: -0.55, mat: M.water });
    prism(g, { points: ellipse(44.5, 18.8, 26), h: 0.4, y: -0.12, mat: M.sand });
    prism(g, { points: ellipse(42.5, 17.2, 24), h: 0.28, y: 0.22, mat: M.grass });

    // ── 한강대교: N–S roadway over the island (deck top ≈ 14 m) ────────────
    const deckY = 12.2;
    box(g, { w: 12, h: 0.7, d: 38, y: deckY, mat: M.asphalt });
    [-1, 1].forEach((s) => {
      box(g, { w: 0.35, h: 1.1, d: 38, x: s * 6.1, y: deckY + 0.7, mat: M.steel });
      box(g, { w: 1.1, h: 0.25, d: 38, x: s * 7.0, y: deckY, mat: M.concrete });
    });
    [-14, 0, 14].forEach((z) => {
      box(g, { w: 2.4, h: deckY, d: 3.2, z, mat: M.concreteDark }); // piers
    });
    [-16, -8, 0, 8, 16].forEach((z) => {
      cyl(g, { rTop: 0.1, h: 1.7, x: 6.1, y: deckY + 1.1, z, mat: METAL, seg: 5 });
      cyl(g, { rTop: 0.1, h: 1.7, x: -6.1, y: deckY + 1.1, z, mat: METAL, seg: 5 });
    });

    // ── Low shed village around the bridge (2–3 storeys, timber / metal / glass) ──
    // 라이브하우스 (west of the deck)
    const live = subgroup(g, { x: -14, z: -2 });
    box(live, { w: 16, h: 9.2, d: 11, mat: TIMBER });
    box(live, { w: 16.4, h: 0.45, d: 11.4, y: 9.2, mat: METAL });
    box(live, { w: 10, h: 4.6, d: 0.25, y: 1.2, z: 5.6, mat: M.glassDark });
    box(live, { w: 16.2, h: 0.2, d: 11.2, y: 4.5, mat: TIMBER_DARK });
    // 노들서가 (north-west, lower timber box)
    const book = subgroup(g, { x: -15, z: -14 });
    box(book, { w: 14, h: 6.4, d: 8, mat: TIMBER });
    box(book, { w: 14.3, h: 0.35, d: 8.3, y: 6.4, mat: METAL });
    box(book, { w: 8, h: 3.2, d: 0.22, y: 1.4, z: 4.1, mat: M.glass });
    // 다목적홀 (east of the deck)
    const hall = subgroup(g, { x: 16, z: 1 });
    box(hall, { w: 18, h: 10.4, d: 12, mat: PANEL });
    box(hall, { w: 18.4, h: 0.5, d: 12.4, y: 10.4, mat: METAL });
    box(hall, { w: 12, h: 5.2, d: 0.25, y: 1.6, z: 6.15, mat: M.glassBlue });
    box(hall, { w: 18.2, h: 0.22, d: 12.2, y: 5.1, mat: M.concreteDark });
    // small café / shop sheds
    box(g, { w: 7, h: 4.2, d: 6, x: -4, z: 10, mat: TIMBER });
    box(g, { w: 7.3, h: 0.3, d: 6.3, x: -4, y: 4.2, z: 10, mat: METAL });
    box(g, { w: 6, h: 3.8, d: 5, x: 8, z: 11, mat: PANEL });
    box(g, { w: 6.3, h: 0.28, d: 5.3, x: 8, y: 3.8, z: 11, mat: METAL });

    // roof decks linking the sheds (the 'village' upper park)
    box(g, { w: 10, h: 0.28, d: 6, x: -6, y: 9.2, z: -2, mat: DECK });
    box(g, { w: 8, h: 0.28, d: 5, x: 6, y: 10.4, z: 1, mat: DECK });
    box(g, { w: 0.35, h: 1.0, d: 6, x: -1, y: 9.48, z: -2, mat: M.steel });
    box(g, { w: 0.35, h: 1.0, d: 5, x: 10, y: 10.68, z: 1, mat: M.steel });

    // ── 노들마당 lawn and stepped stand (west, sunset side) ───────────────
    box(g, { w: 22, h: 0.18, d: 16, x: -28, y: 0.4, z: 1, mat: M.grassDark });
    for (let i = 0; i < 4; i += 1) {
      box(g, { w: 8 - i * 0.4, h: 0.45, d: 1.1, x: -36, y: 0.4 + i * 0.45, z: -8 + i * 0.15, mat: M.concrete });
    }
    box(g, { w: 3.2, h: 0.22, d: 28, x: -22, y: 0.45, z: 0, mat: M.granite }); // path
    box(g, { w: 36, h: 0.22, d: 3.0, x: 2, y: 0.45, z: 8, mat: M.granite });

    // ── 노들숲 on the east end ────────────────────────────────────────────
    const pines = [
      [28, -8, 9], [32, -4, 10], [36, 1, 9.5], [33, 7, 8.5], [28, 10, 8],
      [38, -10, 8], [40, 4, 7.5], [24, -14, 7], [30, 12, 7], [42, -2, 8],
    ];
    pines.forEach(([x, z, h]) => {
      tree(g, { x, z, y: 0.4, h, r: Math.min(h * 0.28, 49.2 - Math.hypot(x, z)) });
    });
    [[-38, -10, 6], [-40, 8, 6.5], [-32, 12, 6], [18, -16, 6]].forEach(([x, z, h]) => {
      tree(g, { x, z, y: 0.4, h, r: Math.min(2.0, 49.2 - Math.hypot(x, z)) });
    });

    return g;
  },
};
