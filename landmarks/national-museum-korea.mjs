// 국립중앙박물관 (National Museum of Korea, 2005, 정림건축) - 용산구
// One 404 m long, 43 m tall granite bar running east-west on a raised podium: the exhibition wing
// (동관, east) and the education wing (서관, west) are joined only by the continuous flat roof, which
// leaves the 열린마당 - a six-storey open passage through the building that frames 남산 to the north.
// A dark recessed glass band under the roof makes the deep roof slab appear to float; a glazed
// monitor runs along the ridge. The plan is compressed to ~0.36 of real along the length (~0.5
// across) so the whole site fits the collider, heights are real (roof 42 m, monitor 44 m).
// South of the building: the grand stair down from the podium, the rectangular 거울못 reflecting
// pond with the celadon-roofed 청자정 pavilion on its east shore, lawns, paths and tree rows, and
// the low white box of 국립한글박물관 to the south-east; 용산가족공원 trees to the east and north.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, hipRoof, tree, deg } from "./_helpers.mjs";

const paving = material(0xd8d3c8, { roughness: 0.95 });
const celadon = material(0x5f9a86, { roughness: 0.6, metalness: 0.1 }); // 청자정's celadon roof tiles

/** Broad granite stair from height `top` down to `base`, starting at `z0` and descending towards `dir` (±z). */
function stair(g, { x, z0, w, top, dir, base = 0.1, steps = 8, tread = 1.25 }) {
  const rise = (top - base) / steps;
  for (let i = 0; i < steps; i += 1) {
    const d = (steps - i) * tread;
    box(g, { w, h: rise, d, x, y: base + i * rise, z: z0 + (dir * d) / 2, mat: M.granite });
  }
  return steps * tread;
}

export default {
  id: "national-museum-korea",
  name: "국립중앙박물관",
  nameEn: "National Museum of Korea",
  district: "용산구",
  lat: 37.524,
  lon: 126.9803,
  height: 44,
  colliderRadius: 78,
  detail: "medium",
  description: "404m 길이의 수평 매스와 열린 중앙 마당(열린마당)",
  create() {
    const g = new THREE.Group();

    // ── Site: lawn disc filling the collider (top at y = 0.1) ──
    cyl(g, { rTop: 78, h: 0.4, y: -0.3, mat: M.grass, seg: 64 });

    // ── Dimensions (x east, z south) ──
    const X0 = -73; // west end of the building
    const X1 = 73; // east end
    const GAP0 = -32; // 열린마당 between the wings (real ≈ 30 m, kept wide so it reads from the air)
    const GAP1 = -10;
    const D = 30; // building depth
    const POD_H = 4; // podium / 열린마당 level
    const WALL_TOP = 33; // top of the granite walls (five storeys above the podium)
    const BAND_TOP = 36; // recessed dark glass storey under the roof
    const ROOF_TOP = 42; // top of the deep roof slab that spans the passage
    const FLOOR = (WALL_TOP - POD_H) / 5;

    // ── Podium (기단) with a dark plinth course, front terrace and stairs ──
    box(g, { w: 150.6, h: 0.5, d: 36.6, y: 0.1, mat: M.graniteDark });
    box(g, { w: 150, h: POD_H, d: 36, y: 0.1, mat: M.granite });
    box(g, { w: 62, h: POD_H, d: 9, x: -21, y: 0.1, z: 22.5, mat: M.granite }); // terrace in front of the passage
    stair(g, { x: -21, z0: 27, w: 46, top: POD_H + 0.1, dir: 1 }); // grand stair to the south plaza
    stair(g, { x: -21, z0: -18, w: 26, top: POD_H + 0.1, dir: -1, steps: 6 }); // north stair towards 남산
    // darker stone path on the passage axis
    box(g, { w: GAP1 - GAP0 - 3, h: 0.12, d: 44, x: (GAP0 + GAP1) / 2, y: POD_H + 0.1, z: 4, mat: M.graniteDark });

    // ── Wings: granite bodies with recessed window strips broken by granite piers ──
    const wing = (x0, x1) => {
      const w = x1 - x0;
      const cx = (x0 + x1) / 2;
      box(g, { w, h: WALL_TOP - POD_H, d: D, x: cx, y: POD_H, mat: M.granite });
      for (let f = 0; f < 5; f += 1) {
        const y = POD_H + f * FLOOR + FLOOR * 0.42;
        const strip = f === 0 ? 3.2 : 1.3; // taller openings on the entrance floor, narrow slits above
        [-1, 1].forEach((s) => box(g, { w: w - 4, h: strip, d: 0.35, x: cx, y, z: s * (D / 2 + 0.05), mat: M.glassDark }));
      }
      const n = Math.round(w / 6.9);
      for (let i = 1; i < n; i += 1) {
        const x = x0 + (w / n) * i;
        [-1, 1].forEach((s) => box(g, { w: 1.1, h: WALL_TOP - POD_H, d: 0.5, x, y: POD_H, z: s * (D / 2 + 0.05), mat: M.granite }));
      }
      // recessed glass storey under the roof (the roof reads as floating)
      box(g, { w: w - 1, h: BAND_TOP - WALL_TOP, d: D - 3, x: cx, y: WALL_TOP, mat: M.glassDark });
    };
    wing(X0, GAP0); // 서관 - education wing, theatre 용
    wing(GAP1, X1); // 동관 - exhibition wing

    // ── 열린마당: tilted glass entrance wall of the exhibition wing, glazed entrance of the education wing ──
    const glassH = WALL_TOP - POD_H - 0.5;
    box(g, { w: 0.6, h: glassH, d: D - 5, x: GAP1 - 0.2, y: POD_H, mat: M.glass, rz: deg(5) });
    box(g, { w: 5, h: 0.5, d: 18, x: GAP1 - 3, y: POD_H + 8, mat: M.steel }); // entrance canopy
    box(g, { w: 0.4, h: 12, d: 16, x: GAP0 + 0.1, y: POD_H, mat: M.glassDark });
    box(g, { w: 4, h: 0.5, d: 14, x: GAP0 + 2.2, y: POD_H + 8, mat: M.steel });

    // ── Roof: deep slab spanning the whole length including the passage, light fascia, glazed monitor ──
    box(g, { w: X1 - X0 + 4, h: ROOF_TOP - BAND_TOP, d: D + 3, y: BAND_TOP, mat: M.granite });
    box(g, { w: X1 - X0 + 4.4, h: 0.6, d: D + 3.4, y: ROOF_TOP - 0.6, mat: M.limestone });
    box(g, { w: X1 - X0 + 2, h: 0.3, d: D + 1, y: ROOF_TOP, mat: M.concrete });
    box(g, { w: X1 - X0 - 6, h: 1.4, d: 8, y: ROOF_TOP + 0.3, mat: M.glassWhite });
    box(g, { w: X1 - X0 - 5.4, h: 0.3, d: 8.6, y: ROOF_TOP + 1.7, mat: M.steel }); // top at 44

    // ── South plaza, 거울못 (Mirror Pond) with granite kerb, 청자정 pavilion ──
    box(g, { w: 74, h: 0.12, d: 8, x: -21, y: 0.1, z: 41, mat: paving });
    const P = { x0: -36, x1: 18, z0: 46, z1: 68 };
    const pw = P.x1 - P.x0;
    const pd = P.z1 - P.z0;
    const pcx = (P.x0 + P.x1) / 2;
    const pcz = (P.z0 + P.z1) / 2;
    box(g, { w: pw, h: 0.5, d: pd, x: pcx, y: -0.3, z: pcz, mat: M.water }); // water top at 0.2
    box(g, { w: pw + 1.6, h: 0.45, d: 0.8, x: pcx, y: 0.1, z: P.z0 - 0.4, mat: M.granite });
    box(g, { w: pw + 1.6, h: 0.45, d: 0.8, x: pcx, y: 0.1, z: P.z1 + 0.4, mat: M.granite });
    box(g, { w: 0.8, h: 0.45, d: pd, x: P.x0 - 0.4, y: 0.1, z: pcz, mat: M.granite });
    box(g, { w: 0.8, h: 0.45, d: pd, x: P.x1 + 0.4, y: 0.1, z: pcz, mat: M.granite });
    // paths: along the pond, down the west side and the east side towards 이촌역
    box(g, { w: 100, h: 0.12, d: 3, x: -14, y: 0.1, z: 46 - 2.3, mat: paving });
    box(g, { w: 3, h: 0.12, d: 16, x: -41, y: 0.1, z: 54, mat: paving });
    box(g, { w: 3, h: 0.12, d: 22, x: 22, y: 0.1, z: 56, mat: paving });
    box(g, { w: 32, h: 0.12, d: 3, x: 4, y: 0.1, z: 70, mat: paving });

    // 청자정: open pavilion with a celadon-tiled hip roof on a stone platform jutting into the pond
    const CX = 18;
    const CZ = 58;
    box(g, { w: 8, h: 1.0, d: 7, x: CX, y: 0.1, z: CZ, mat: M.granite });
    box(g, { w: 6.4, h: 0.4, d: 5.2, x: CX, y: 1.1, z: CZ, mat: M.graniteDark });
    [[-2.6, -1.9], [0, -1.9], [2.6, -1.9], [-2.6, 1.9], [0, 1.9], [2.6, 1.9]].forEach(([dx, dz]) => {
      cyl(g, { rTop: 0.22, h: 3, x: CX + dx, y: 1.5, z: CZ + dz, mat: M.hanokWood, seg: 6 });
    });
    box(g, { w: 6.4, h: 0.6, d: 4.8, x: CX, y: 4.5, z: CZ, mat: M.dancheong });
    hipRoof(g, { w: 6, d: 4.4, h: 2.4, x: CX, y: 5.1, z: CZ, overhang: 1.8, ridge: 0.4, mat: celadon, ridgeMat: M.graniteDark });

    // ── 국립한글박물관: low white box with glass bands, south-east of the pond ──
    box(g, { w: 22, h: 15, d: 14, x: 36, y: 0.1, z: 52, mat: M.offWhite });
    box(g, { w: 22.3, h: 2.6, d: 14.3, x: 36, y: 4, z: 52, mat: M.glass });
    box(g, { w: 22.3, h: 2.6, d: 14.3, x: 36, y: 9.5, z: 52, mat: M.glass });
    box(g, { w: 22.6, h: 0.6, d: 14.6, x: 36, y: 15.1, z: 52, mat: M.concreteDark });

    // ── North service road ──
    box(g, { w: 128, h: 0.12, d: 5, y: 0.1, z: -26, mat: M.asphalt });

    // ── Trees: south lawns, perimeter rows, 용산가족공원 (east) and the park to the north ──
    const trees = [
      // south-west lawn in front of the education wing
      [-60, 40, 9, 3.2], [-52, 47, 8, 3], [-56, 55, 9, 3.2], [-47, 58, 8, 2.8], [-42, 66, 8, 3], [-64, 30, 9, 3],
      // south perimeter row
      [-30, 72, 9, 3.2], [-18, 74, 8, 3], [-6, 74, 9, 3.2], [8, 73, 8, 3], [20, 72, 9, 3.2], [32, 68, 8, 3],
      [46, 60, 9, 3.2], [56, 50, 8, 3], [64, 38, 9, 3.2], [58, 30, 7, 2.6], [50, 40, 7, 2.6],
      // 용산가족공원 - east
      [68, 20, 10, 3.6], [72, 6, 9, 3.2], [70, -10, 10, 3.6], [66, -26, 9, 3.2], [58, -40, 10, 3.6], [48, -52, 9, 3.2],
      [62, -14, 8, 3], [56, -30, 8, 2.8], [64, 4, 8, 2.8],
      // north park
      [34, -52, 9, 3.2], [18, -56, 10, 3.6], [2, -54, 9, 3.2], [-14, -56, 10, 3.6], [-30, -52, 9, 3.2], [-46, -46, 10, 3.6],
      [-58, -36, 9, 3.2], [-66, -22, 10, 3.6], [-72, -6, 9, 3.2], [-72, 10, 10, 3.6], [-68, 24, 9, 3.2],
      [24, -46, 7, 2.6], [-6, -44, 7, 2.6], [-38, -42, 7, 2.6],
      // pond-side trees
      [-30, 42, 5, 1.8], [-12, 42, 5, 1.8], [6, 42, 5, 1.8], [26, 48, 6, 2], [-42, 50, 6, 2],
    ];
    // keep every canopy inside the collider (foliage spheres add their radius)
    trees.forEach(([x, z, h, r]) => {
      const d = Math.hypot(x, z);
      const k = d + r > 77 ? (77 - r) / d : 1;
      tree(g, { x: x * k, y: 0.1, z: z * k, h, r, mat: M.foliage });
    });

    return g;
  },
};
