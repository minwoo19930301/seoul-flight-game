// 창덕궁 (Changdeokgung Palace, 1405) - 종로구, UNESCO World Heritage
// The palace that follows its hilly site rather than a straight axis. Model origin = 인정전, the
// two-tier (중층) throne hall on a double 월대 with balustrades and stairs, inside a rectangular
// court of cloister corridors (행각) entered through 인정문 on the south. South-west of it stands
// 돈화문 (1412), the largest palace gate: a two-storey wooden pavilion 5 bays wide on a low stone base
// with three wooden door openings, set in the south palace wall. East of the throne court sits 선정전,
// the small council hall whose blue-tiled roof is the only one left in Seoul's palaces, reached through
// 선정문 by a covered walkway; 희정당 and 대조전 (the royal residences) lie further north-east and
// 낙선재 to the south-east. The north edge is old pines and zelkovas where the 후원 (Secret Garden)
// begins. The site plan is compressed to fit the collider radius; hall heights stay realistic.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, prism, frustum, hipRoof, gableRoof, hanokHall, hanokWall, tree, subgroup } from "./_helpers.mjs";

const earth = material(0xa89670, { roughness: 1 });
const paving = material(0xcac4b9, { roughness: 0.95 });
const doorWood = material(0x4a2c1e, { roughness: 0.85 });
const pine = material(0x2f6b3a, { roughness: 1 });
const zelkova = material(0x4f8a3c, { roughness: 1 });

/** Single-storey hall (전각): stone platform, plaster walls, red columns, 단청 band, hip roof. */
function hall(g, { x, z, w, d, platformH = 1, pad = 1.2, wallH = 3.4, roofH = 3.8, overhang = 2.2, ridgeBeam = true, roofMat = M.roofTile, ry = 0 }) {
  const s = subgroup(g, { x, z, ry });
  if (platformH > 0) {
    box(s, { w: w + pad * 2, h: platformH, d: d + pad * 2, mat: M.granite });
  }
  box(s, { w: w - 1.2, h: wallH, d: d - 1.2, y: platformH, mat: M.hanokWall });
  const nx = Math.max(2, Math.round(w / 3.6));
  const nz = Math.max(2, Math.round(d / 3.6));
  for (let i = 0; i <= nx; i += 1) {
    const px = -w / 2 + (w / nx) * i;
    cyl(s, { rTop: 0.34, h: wallH, x: px, y: platformH, z: d / 2, mat: M.hanokWood, seg: 8 });
    cyl(s, { rTop: 0.34, h: wallH, x: px, y: platformH, z: -d / 2, mat: M.hanokWood, seg: 8 });
  }
  for (let i = 1; i < nz && d >= 5; i += 1) {
    const pz = -d / 2 + (d / nz) * i;
    cyl(s, { rTop: 0.34, h: wallH, x: w / 2, y: platformH, z: pz, mat: M.hanokWood, seg: 8 });
    cyl(s, { rTop: 0.34, h: wallH, x: -w / 2, y: platformH, z: pz, mat: M.hanokWood, seg: 8 });
  }
  box(s, { w: w + 1.2, h: 1, d: d + 1.2, y: platformH + wallH, mat: M.dancheong });
  hipRoof(s, { w, d, h: roofH, y: platformH + wallH + 1, overhang, mat: roofMat, ridgeMat: ridgeBeam ? null : false });
  return platformH + wallH + 1 + roofH;
}

/** Cloister corridor (행각): long low building with a tiled roof, columns on both faces. */
function corridor(g, { x, z, length, ry = 0, depth = 3, wallH = 2.6 }) {
  const s = subgroup(g, { x, z, ry });
  box(s, { w: length, h: 0.5, d: depth + 0.4, mat: M.graniteDark });
  box(s, { w: length, h: wallH, d: depth - 1.2, y: 0.5, mat: M.hanokWall });
  const n = Math.max(2, Math.round(length / 6));
  for (let i = 0; i <= n; i += 1) {
    const px = -length / 2 + (length / n) * i;
    cyl(s, { rTop: 0.26, h: wallH, x: px, y: 0.5, z: depth / 2 - 0.3, mat: M.hanokWood, seg: 6 });
    cyl(s, { rTop: 0.26, h: wallH, x: px, y: 0.5, z: -depth / 2 + 0.3, mat: M.hanokWood, seg: 6 });
  }
  box(s, { w: length + 0.4, h: 0.6, d: depth + 0.2, y: 0.5 + wallH, mat: M.dancheong });
  hipRoof(s, { w: length, d: depth, h: 1.9, y: 0.5 + wallH + 0.6, overhang: 1.3, ridge: 0.93, curve: 0.08 });
  return s;
}

/** Stone balustrade around a platform edge; `gap` opens the south side for stairs. */
function railing(g, { x, z, w, d, y, gap = 0, mat = M.granite }) {
  const t = 0.35;
  const h = 0.8;
  box(g, { w, h, d: t, x, y, z: z - d / 2 + t / 2, mat });
  if (gap > 0) {
    const side = (w - gap) / 2;
    box(g, { w: side, h, d: t, x: x - gap / 2 - side / 2, y, z: z + d / 2 - t / 2, mat });
    box(g, { w: side, h, d: t, x: x + gap / 2 + side / 2, y, z: z + d / 2 - t / 2, mat });
  } else {
    box(g, { w, h, d: t, x, y, z: z + d / 2 - t / 2, mat });
  }
  box(g, { w: t, h, d, x: x - w / 2 + t / 2, y, z, mat });
  box(g, { w: t, h, d, x: x + w / 2 - t / 2, y, z, mat });
}

/** Stairs descending southwards (+z) from a platform edge at `z`, from height `top` down to `base`. */
function steps(g, { x, z, w, top, base = 0, count = 3, run = 0.55 }) {
  for (let i = 0; i < count; i += 1) {
    box(g, { w, h: (top - base) * ((count - i) / (count + 1)), d: run, x, y: base, z: z + run / 2 + i * run, mat: M.granite });
  }
}

/**
 * 돈화문: two-storey gate pavilion, 5 bays wide, on a low stone base. The ground storey has walled
 * end bays and three wooden door openings in the centre; the upper storey is a smaller pavilion.
 */
function donhwamun(g, { x, z }) {
  const s = subgroup(g, { x, z });
  const W = 12;
  const D = 5.2;
  const baseH = 0.9;
  box(s, { w: W + 3.5, h: baseH, d: D + 3.5, mat: M.granite });
  const wh = 3;
  const bay = W / 5;
  for (let i = 0; i <= 5; i += 1) {
    const px = -W / 2 + bay * i;
    cyl(s, { rTop: 0.4, h: wh, x: px, y: baseH, z: D / 2, mat: M.hanokWood, seg: 8 });
    cyl(s, { rTop: 0.4, h: wh, x: px, y: baseH, z: -D / 2, mat: M.hanokWood, seg: 8 });
  }
  [-1, 1].forEach((sx) => {
    cyl(s, { rTop: 0.4, h: wh, x: sx * W / 2, y: baseH, z: 0, mat: M.hanokWood, seg: 8 });
    box(s, { w: bay, h: wh, d: D - 0.5, x: sx * (W / 2 - bay / 2), y: baseH, mat: M.hanokWall }); // walled end bays
  });
  // three door openings: dark door leaves set into the front and back faces, open passage between
  [-1, 1].forEach((sz) => box(s, { w: bay * 3 - 0.5, h: wh - 0.25, d: 0.3, y: baseH, z: sz * (D / 2 - 0.35), mat: doorWood }));
  box(s, { w: bay * 3 - 0.5, h: 0.35, d: D - 0.6, y: baseH + wh - 0.35, mat: M.hanokWood }); // lintel
  box(s, { w: W + 1.2, h: 1.1, d: D + 1.2, y: baseH + wh, mat: M.dancheong });
  const skirt = 1.7;
  frustum(s, { wBot: W + 4.4, dBot: D + 4.4, wTop: W * 0.88 - 1, dTop: D * 0.88 - 1, h: skirt, y: baseH + wh + 1.1, mat: M.roofTile });
  // upper storey
  const y2 = baseH + wh + 1.1 + skirt;
  const W2 = W * 0.88;
  const D2 = D * 0.88;
  const wh2 = 2.3;
  box(s, { w: W2 - 1.2, h: wh2, d: D2 - 1.2, y: y2, mat: M.hanokWall });
  for (let i = 0; i <= 5; i += 1) {
    const px = -W2 / 2 + (W2 / 5) * i;
    cyl(s, { rTop: 0.34, h: wh2, x: px, y: y2, z: D2 / 2, mat: M.hanokWood, seg: 8 });
    cyl(s, { rTop: 0.34, h: wh2, x: px, y: y2, z: -D2 / 2, mat: M.hanokWood, seg: 8 });
  }
  box(s, { w: W2 + 1.2, h: 1.1, d: D2 + 1.2, y: y2 + wh2, mat: M.dancheong });
  hipRoof(s, { w: W2, d: D2, h: 3.3, y: y2 + wh2 + 1.1, overhang: 2.4 });
  return y2 + wh2 + 1.1 + 3.3;
}

export default {
  id: "changdeokgung",
  name: "창덕궁",
  nameEn: "Changdeokgung Palace",
  district: "종로구",
  lat: 37.5794,
  lon: 126.9911,
  height: 20,
  colliderRadius: 46,
  detail: "medium",
  description: "돈화문과 인정전, 유네스코 세계유산 궁궐",
  create() {
    const g = new THREE.Group();

    // ── Ground: packed earth inside the palace walls (corners clipped to stay in the radius) ──
    const G = 0.1;
    prism(g, {
      points: [[-34.6, 26.6], [36.6, 26.6], [36.6, -20], [30, -30.6], [-24, -30.6], [-34.6, -20]],
      h: 0.6, y: G - 0.6, mat: earth,
    });

    // ── Perimeter walls (궁성) ─────────────────────────────────────────────────────────────
    const OW = { h: 3.4, mat: M.granite };
    const SZ = 26; // south wall
    hanokWall(g, { length: 2.4, x: -33.5, z: SZ, ...OW }); // west of 돈화문
    hanokWall(g, { length: 54, x: 9, z: SZ, ...OW }); // east of 돈화문 (x -18 .. 36)
    hanokWall(g, { length: 46, x: 36, z: 3, ry: Math.PI / 2, ...OW }); // east wall z 26 .. -20
    hanokWall(g, { length: 46, x: -34, z: 3, ry: Math.PI / 2, ...OW }); // west wall z 26 .. -20
    hanokWall(g, { length: 12.2, x: 33, z: -25, ry: -Math.atan2(10, 6), ...OW }); // NE diagonal (36,-20) -> (30,-30)
    hanokWall(g, { length: 14.3, x: -29, z: -25, ry: Math.PI / 4, ...OW }); // NW diagonal (-34,-20) -> (-24,-30)
    hanokWall(g, { length: 54, x: 3, z: -30, ...OW }); // north wall x -24 .. 30

    // ── 돈화문 (main gate, south-west) with its paved forecourt ───────────────────────────
    donhwamun(g, { x: -25, z: SZ });
    box(g, { w: 16, h: G + 0.05, d: 3, x: -25, z: SZ + 3.5, mat: paving });
    box(g, { w: 4, h: 0.12, d: 8, x: -25, y: G, z: 20.5, mat: paving }); // path north from the gate
    box(g, { w: 13, h: 0.12, d: 4, x: -18, y: G, z: 21, mat: paving }); // ... turning east to 진선문

    // ── Outer court between 진선문 (west) and 숙장문 (east), south of the throne court ──────
    box(g, { w: 30, h: 0.12, d: 8.6, x: 2.5, y: G, z: 21.3, mat: paving });
    hall(g, { x: -13.5, z: 21, w: 5.4, d: 3, platformH: 0.6, pad: 0.8, wallH: 2.8, roofH: 2.6, overhang: 1.6, ry: Math.PI / 2 }); // 진선문
    hall(g, { x: 18.5, z: 21, w: 5.4, d: 3, platformH: 0.6, pad: 0.8, wallH: 2.8, roofH: 2.6, overhang: 1.6, ry: Math.PI / 2 }); // 숙장문
    hanokWall(g, { length: 7, x: 18.5, z: 25.6 - 1.5, ry: Math.PI / 2, h: 2.6 }); // wall south of 숙장문
    hanokWall(g, { length: 7, x: -13.5, z: 25.6 - 1.5, ry: Math.PI / 2, h: 2.6 }); // wall south of 진선문

    // ── 인정전 court: 인정문 on the south, cloister corridors on all four sides ─────────────
    const CS = 14; // south corridor / 인정문 line
    const CN = -13; // north corridor
    const CX = 16; // side corridors
    box(g, { w: 29.4, h: 0.12, d: 24.4, y: G, z: 0.6, mat: paving }); // paved court (박석)
    box(g, { w: 3.2, h: 0.22, d: 4, y: G, z: 10.4, mat: M.graniteDark }); // 어도
    hall(g, { x: 0, z: CS, w: 9, d: 4.6, platformH: 0.9, pad: 1.1, wallH: 3.3, roofH: 3.6, overhang: 2.2 }); // 인정문 (3 bays)
    corridor(g, { x: -11, z: CS, length: 11.4 });
    corridor(g, { x: 11, z: CS, length: 11.4 });
    corridor(g, { x: -CX, z: (CS + CN) / 2, length: CS - CN + 3, ry: Math.PI / 2 });
    corridor(g, { x: CX, z: (CS + CN) / 2, length: CS - CN + 3, ry: Math.PI / 2 });
    corridor(g, { x: 0, z: CN, length: 30.4 });

    // ── 인정전: double 월대 with balustrades and stairs, 중층 throne hall ──────────────────
    box(g, { w: 22, h: 1.2, d: 16, mat: M.granite });
    railing(g, { x: 0, z: 0, w: 22, d: 16, y: 1.2, gap: 5 });
    steps(g, { x: 0, z: 8, w: 4.6, top: 1.2 });
    [-1, 1].forEach((s) => steps(g, { x: s * 7.5, z: 8, w: 3, top: 1.2 }));
    box(g, { w: 18, h: 1.2, d: 12.5, y: 1.2, mat: M.granite });
    railing(g, { x: 0, z: 0, w: 18, d: 12.5, y: 2.4, gap: 5 });
    steps(g, { x: 0, z: 6.25, w: 4.6, top: 2.4, base: 1.2 });
    hanokHall(g, {
      w: 13.5, d: 9.5, y: 2.4, platform: false, platformH: 0,
      stories: 2, wallH: 4.2, roofH: 5, overhang: 2.8, upperScale: 0.84,
    });
    for (let i = 0; i <= 5; i += 1) {
      const px = -6.75 + 2.7 * i;
      cyl(g, { rTop: 0.45, h: 4.2, x: px, y: 2.4, z: 4.75, mat: M.hanokWood, seg: 8 });
      cyl(g, { rTop: 0.45, h: 4.2, x: px, y: 2.4, z: -4.75, mat: M.hanokWood, seg: 8 });
    }

    // ── 선정전: blue-tiled council hall east of the court, 선정문 and the covered walkway ────
    const PX = 25;
    hall(g, { x: PX, z: -2, w: 8, d: 6, platformH: 0.9, pad: 1.2, wallH: 3.4, roofH: 3.6, overhang: 2.2, roofMat: M.roofTileBlue });
    hall(g, { x: PX, z: 8, w: 5, d: 2.8, platformH: 0.5, pad: 0.7, wallH: 2.7, roofH: 2.4, overhang: 1.5 }); // 선정문
    [-1, 1].forEach((s) => {
      [3.2, 5.2].forEach((z) => cyl(g, { rTop: 0.24, h: 2.6, x: PX + s * 1.3, y: G, z, mat: M.hanokWood, seg: 6 }));
    });
    box(g, { w: 3.2, h: 0.4, d: 4.4, x: PX, y: G + 2.6, z: 4.4, mat: M.dancheong });
    gableRoof(g, { w: 4.4, d: 3, h: 1.1, x: PX, y: G + 3, z: 4.4, overhang: 0.5, ry: Math.PI / 2 }); // 복도각
    hanokWall(g, { length: 4.2, x: PX - 4.6, z: 8, h: 2.6 });
    hanokWall(g, { length: 4.2, x: PX + 4.6, z: 8, h: 2.6 });
    hanokWall(g, { length: 15.4, x: PX - 6.6, z: 0.3, ry: Math.PI / 2, h: 2.6 });
    hanokWall(g, { length: 15.4, x: PX + 6.6, z: 0.3, ry: Math.PI / 2, h: 2.6 });
    hanokWall(g, { length: 17, x: 27, z: -7.4, h: 2.6 }); // shared with the 희정당 court to the north

    // ── 희정당 and 대조전 (royal residences) in the north-east, each in a walled court ───────
    hall(g, { x: 26.5, z: -13, w: 11.5, d: 5.6, platformH: 1, pad: 1.2, wallH: 3.5, roofH: 3.9, overhang: 2.2 }); // 희정당
    hall(g, { x: 23, z: -23, w: 11, d: 5.6, platformH: 1, pad: 1.2, wallH: 3.5, roofH: 3.9, overhang: 2.2, ridgeBeam: false }); // 대조전 (무량각)
    hanokWall(g, { length: 13, x: 22.5, z: -18.3, h: 2.6 }); // between the two courts
    hanokWall(g, { length: 11, x: 15.5, z: -23.8, ry: Math.PI / 2, h: 2.6 });
    box(g, { w: 3.4, h: 3, d: 0.7, x: 23, z: -27.2, mat: M.brick }); // 대조전 chimney (굴뚝)
    gableRoof(g, { w: 3.8, d: 1.1, h: 0.4, x: 23, y: 3, z: -27.2, overhang: 0 });

    // ── 궐내각사: cluster of small government office halls west of the throne court ────────
    hall(g, { x: -27, z: -15, w: 7, d: 4, platformH: 0.5, pad: 0.8, wallH: 2.8, roofH: 2.7, overhang: 1.6 });
    hall(g, { x: -21.5, z: -13, w: 7, d: 3.6, platformH: 0.5, pad: 0.8, wallH: 2.7, roofH: 2.5, overhang: 1.5, ry: Math.PI / 2 });
    hall(g, { x: -27, z: -6, w: 6, d: 3.6, platformH: 0.5, pad: 0.8, wallH: 2.7, roofH: 2.5, overhang: 1.5 });
    hall(g, { x: -26, z: 3, w: 8, d: 4, platformH: 0.5, pad: 0.8, wallH: 2.8, roofH: 2.7, overhang: 1.6 });
    hall(g, { x: -22.5, z: 12, w: 7, d: 3.6, platformH: 0.5, pad: 0.8, wallH: 2.7, roofH: 2.5, overhang: 1.5, ry: Math.PI / 2 });
    hanokWall(g, { length: 13, x: -26.5, z: -19.5, h: 2.2 });
    hanokWall(g, { length: 10, x: -29, z: 8, h: 2.2 });

    // ── 낙선재 (1847) in the south-east: plain hall in its own court ───────────────────────
    hall(g, { x: 29, z: 17, w: 8, d: 4.8, platformH: 0.7, pad: 1, wallH: 3, roofH: 3.2, overhang: 2 });
    hanokWall(g, { length: 17, x: 22.5, z: 17.3, ry: Math.PI / 2, h: 2.4 }); // z 8.8 .. 25.8

    // ── Old trees: the 후원 begins along the north edge; pines by the walls and gates ───────
    const pines = [
      [-20, -26, 7], [-13, -28, 6.5], [-6, -27, 7.5], [3, -27.5, 6.5], [10, -28, 7], [-27, -25, 6],
      [-31, 10, 6.5], [-31, 17, 6], [-16, -22, 5.5], [-8, -21, 6], [2, -21, 5.5], [9, -22, 6],
      [33, 20, 5.5], [33, 3, 5], [-4, 22.5, 4.5], [7, 23, 4.5],
    ];
    pines.forEach(([x, z, h]) => tree(g, { x, y: G, z, h, r: h * 0.33, mat: pine }));
    [[-24, -23, 8, 3.4], [-1, -25, 8.5, 3.6], [14, -26, 8, 3.4], [-18, -27, 7.5, 3.2]].forEach(([x, z, h, r]) => {
      tree(g, { x, y: G, z, h, r, mat: zelkova });
    });

    return g;
  },
};
