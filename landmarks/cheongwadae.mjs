// 청와대 (Cheong Wa Dae, the Blue House) - 종로구
// The former presidential office at the foot of 북악산 (the mountain itself is not modelled), facing
// south. 본관 (1991) is a two-storey palace-style office under a huge hip roof of about 150,000 blue
// glazed tiles - the signature - with cream walls, red-brown columns and green 단청 bands, standing on
// a granite terrace with a wide central stair and a projecting entrance porch. The taller central
// block is joined by low links to two lower wings (세종실 east, 충무실 west), each under its own blue
// hip roof. South of the terrace lies the 대정원 lawn ringed by the paved drive, with pines and low
// granite walls; a compact 영빈관 (colonnaded stone hall under a blue roof) hints at the state guest
// house to the south-west. The grounds are compressed to fit the collider radius; heights are real.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, prism, hipRoof, tree } from "./_helpers.mjs";

const paving = material(0xcac4b9, { roughness: 0.95 });
const drive = material(0x6f7378, { roughness: 1 });
const pine = material(0x2f6b3a, { roughness: 1 });
const windowGlass = material(0x2f3d4c, { roughness: 0.3, metalness: 0.4 });
const lawnGreen = material(0x5f9448, { roughness: 1 });

/**
 * Red columns along a straight face with dark window strips between them.
 * The face runs from (x0, z0) to (x1, z1); `out` is the outward normal direction ([dx, dz]).
 */
function facade(g, { from, to, out, y, h, count, r = 0.42, windowH = 0, windowY = 0.9 }) {
  const [x0, z0] = from;
  const [x1, z1] = to;
  for (let i = 0; i < count; i += 1) {
    const t = i / (count - 1);
    const px = x0 + (x1 - x0) * t;
    const pz = z0 + (z1 - z0) * t;
    cyl(g, { rTop: r, h, x: px + out[0] * 0.15, y, z: pz + out[1] * 0.15, mat: M.hanokWood, seg: 8 });
    if (windowH > 0 && i < count - 1) {
      const bay = Math.hypot(x1 - x0, z1 - z0) / (count - 1);
      const mx = px + (x1 - x0) / (count - 1) / 2;
      const mz = pz + (z1 - z0) / (count - 1) / 2;
      const along = Math.abs(out[0]) > 0.5; // face runs along z
      box(g, {
        w: along ? 0.24 : bay - 1.3, h: windowH, d: along ? bay - 1.3 : 0.24,
        x: mx + out[0] * 0.05, y: y + windowY, z: mz + out[1] * 0.05, mat: windowGlass,
      });
    }
  }
}

/** Stairs descending southwards (+z) from a terrace edge at `z`, from height `top` down to `base`. */
function steps(g, { x, z, w, top, base = 0, count = 6, run = 0.7 }) {
  for (let i = 0; i < count; i += 1) {
    box(g, { w, h: base + (top - base) * ((count - i) / (count + 1)), d: run, x, y: 0, z: z + run / 2 + i * run, mat: M.granite });
  }
}

export default {
  id: "cheongwadae",
  name: "청와대",
  nameEn: "Cheong Wa Dae (Blue House)",
  district: "종로구",
  lat: 37.5866,
  lon: 126.9756,
  height: 23,
  colliderRadius: 42,
  detail: "medium",
  description: "청기와 팔작지붕의 본관과 좌우 별관",
  create() {
    const g = new THREE.Group();

    // ── Grounds: lawn base with clipped corners so everything stays inside the radius ──────
    const G = 0.2;
    prism(g, {
      points: [[-34, -20], [34, -20], [38, -8], [38, 14], [28, 30], [14, 36], [-14, 36], [-28, 30], [-38, 14], [-38, -8]],
      h: 0.6, y: G - 0.6, mat: M.grassDark,
    });

    // ── Granite terrace of 본관 with the wide central stair ───────────────────────────────
    const TY = 2; // terrace top
    box(g, { w: 70, h: TY, d: 29, z: -4.5, mat: M.granite });
    box(g, { w: 70.4, h: 0.35, d: 29.4, y: TY - 0.35, z: -4.5, mat: M.graniteDark });
    box(g, { w: 68, h: 0.08, d: 27, y: TY, z: -4.5, mat: paving });
    steps(g, { x: 0, z: 10, w: 20, top: TY, base: G, count: 6, run: 0.7 });
    [-1, 1].forEach((s) => box(g, { w: 1, h: 1, d: 4.2, x: s * 10.5, y: G, z: 12.1, mat: M.granite })); // stair cheeks

    // ── Central block (2 storeys) ────────────────────────────────────────────────────────
    const CW = 28;
    const CD = 22;
    const CZ = -6; // centre; front face at z = 5
    const h1 = 5.6;
    const h2 = 4.4;
    // ground storey: cream walls, red columns, tall windows
    box(g, { w: CW, h: h1, d: CD, y: TY, z: CZ, mat: M.hanokWall });
    box(g, { w: CW + 0.4, h: 0.8, d: CD + 0.4, y: TY, z: CZ, mat: M.granite }); // granite plinth
    facade(g, { from: [-CW / 2, CZ + CD / 2], to: [CW / 2, CZ + CD / 2], out: [0, 1], y: TY, h: h1, count: 9, windowH: 3.2 });
    facade(g, { from: [-CW / 2, CZ - CD / 2], to: [CW / 2, CZ - CD / 2], out: [0, -1], y: TY, h: h1, count: 9, windowH: 3.2 });
    facade(g, { from: [CW / 2, CZ - CD / 2 + 3], to: [CW / 2, CZ + CD / 2 - 3], out: [1, 0], y: TY, h: h1, count: 6, windowH: 3.2 });
    facade(g, { from: [-CW / 2, CZ - CD / 2 + 3], to: [-CW / 2, CZ + CD / 2 - 3], out: [-1, 0], y: TY, h: h1, count: 6, windowH: 3.2 });
    // balcony band between the storeys
    const y2 = TY + h1;
    box(g, { w: CW + 1, h: 0.6, d: CD + 1, y: y2, z: CZ, mat: M.granite });
    box(g, { w: CW + 0.6, h: 0.5, d: CD + 0.6, y: y2 + 0.6, z: CZ, mat: M.hanokWood });
    // upper storey (slightly inset)
    const UW = CW - 1.6;
    const UD = CD - 1.6;
    const yu = y2 + 1.1;
    box(g, { w: UW, h: h2, d: UD, y: yu, z: CZ, mat: M.hanokWall });
    facade(g, { from: [-UW / 2, CZ + UD / 2], to: [UW / 2, CZ + UD / 2], out: [0, 1], y: yu, h: h2, count: 9, windowH: 2.4, windowY: 0.9 });
    facade(g, { from: [-UW / 2, CZ - UD / 2], to: [UW / 2, CZ - UD / 2], out: [0, -1], y: yu, h: h2, count: 9, windowH: 2.4, windowY: 0.9 });
    facade(g, { from: [UW / 2, CZ - UD / 2 + 3], to: [UW / 2, CZ + UD / 2 - 3], out: [1, 0], y: yu, h: h2, count: 6, windowH: 2.4, windowY: 0.9 });
    facade(g, { from: [-UW / 2, CZ - UD / 2 + 3], to: [-UW / 2, CZ + UD / 2 - 3], out: [-1, 0], y: yu, h: h2, count: 6, windowH: 2.4, windowY: 0.9 });
    // 단청 bracket band and the great blue roof
    const yb = yu + h2;
    box(g, { w: UW + 1.6, h: 1.2, d: UD + 1.6, y: yb, z: CZ, mat: M.dancheong });
    hipRoof(g, { w: UW, d: UD, h: 9, y: yb + 1.2, z: CZ, overhang: 3.6, ridge: 0.5, curve: 0.14, mat: M.roofTileBlue });

    // ── Entrance porch (현관) projecting south from the central block ─────────────────────
    const PZ = 7.6;
    const ph = 5.6;
    [-4.6, -1.55, 1.55, 4.6].forEach((x) => cyl(g, { rTop: 0.42, h: ph, x, y: TY, z: PZ + 2.2, mat: M.hanokWood, seg: 8 }));
    [-1, 1].forEach((s) => cyl(g, { rTop: 0.42, h: ph, x: s * 5.8, y: TY, z: PZ - 0.2, mat: M.hanokWood, seg: 8 }));
    box(g, { w: 12.6, h: 0.9, d: 5.4, y: TY + ph, z: PZ, mat: M.dancheong });
    hipRoof(g, { w: 12, d: 5, h: 2.6, y: TY + ph + 0.9, z: PZ, overhang: 1.8, ridge: 0.5, curve: 0.14, mat: M.roofTileBlue });

    // ── Wings (세종실 east / 충무실 west) and the low links joining them to the centre ───────
    const WW = 14;
    const WD = 12;
    const WZ = -5;
    const wh = 6.4;
    [-1, 1].forEach((s) => {
      const wx = s * 25;
      box(g, { w: WW, h: wh, d: WD, x: wx, y: TY, z: WZ, mat: M.hanokWall });
      box(g, { w: WW + 0.4, h: 0.8, d: WD + 0.4, x: wx, y: TY, z: WZ, mat: M.granite });
      facade(g, { from: [wx - WW / 2, WZ + WD / 2], to: [wx + WW / 2, WZ + WD / 2], out: [0, 1], y: TY, h: wh, count: 5, windowH: 3.8, windowY: 1 });
      facade(g, { from: [wx - WW / 2, WZ - WD / 2], to: [wx + WW / 2, WZ - WD / 2], out: [0, -1], y: TY, h: wh, count: 5, windowH: 3.8, windowY: 1 });
      const ox = wx + s * WW / 2;
      facade(g, { from: [ox, WZ - WD / 2], to: [ox, WZ + WD / 2], out: [s, 0], y: TY, h: wh, count: 4, windowH: 3.8, windowY: 1 });
      box(g, { w: WW + 1.4, h: 1, d: WD + 1.4, x: wx, y: TY + wh, z: WZ, mat: M.dancheong });
      hipRoof(g, { w: WW, d: WD, h: 5.4, x: wx, y: TY + wh + 1, z: WZ, overhang: 2.8, ridge: 0.5, curve: 0.14, mat: M.roofTileBlue });
      // link
      const lx = s * 16;
      box(g, { w: 4.6, h: 4.4, d: 8, x: lx, y: TY, z: WZ, mat: M.hanokWall });
      box(g, { w: 4.6, h: 2.2, d: 0.3, x: lx, y: TY + 1, z: WZ + 4.05, mat: windowGlass });
      box(g, { w: 5, h: 0.8, d: 8.4, x: lx, y: TY + 4.4, z: WZ, mat: M.dancheong });
      hipRoof(g, { w: 4.6, d: 8, h: 2, x: lx, y: TY + 5.2, z: WZ, overhang: 1.4, ridge: 0.3, curve: 0.12, mat: M.roofTileBlue, ridgeMat: false });
    });

    // ── 대정원: the formal lawn ringed by the paved drive, low granite walls ───────────────
    box(g, { w: 44, h: 0.1, d: 24, y: G, z: 22.2, mat: drive });
    box(g, { w: 34, h: 0.2, d: 15, y: G, z: 22.4, mat: lawnGreen });
    [-1, 1].forEach((s) => {
      box(g, { w: 0.8, h: 1, d: 22, x: s * 22.6, y: G, z: 22.5, mat: M.granite });
      box(g, { w: 16, h: 1, d: 0.8, x: s * 14, y: G, z: 34.2, mat: M.granite });
    });

    // ── 영빈관 (state guest house), compact hint to the south-west ─────────────────────────
    const EX = -29;
    const EZ = 16;
    box(g, { w: 10, h: 0.8, d: 8, x: EX, y: G, z: EZ, mat: M.granite });
    box(g, { w: 6.4, h: 8, d: 4.6, x: EX, y: G + 0.8, z: EZ, mat: M.limestone });
    for (let i = 0; i < 5; i += 1) {
      const px = EX - 3.6 + i * 1.8;
      cyl(g, { rTop: 0.34, h: 8, x: px, y: G + 0.8, z: EZ + 2.7, mat: M.granite, seg: 8 });
      cyl(g, { rTop: 0.34, h: 8, x: px, y: G + 0.8, z: EZ - 2.7, mat: M.granite, seg: 8 });
    }
    [-0.9, 0.9].forEach((dz) => {
      cyl(g, { rTop: 0.34, h: 8, x: EX - 3.6, y: G + 0.8, z: EZ + dz, mat: M.granite, seg: 8 });
      cyl(g, { rTop: 0.34, h: 8, x: EX + 3.6, y: G + 0.8, z: EZ + dz, mat: M.granite, seg: 8 });
    });
    box(g, { w: 8.4, h: 0.9, d: 6.4, x: EX, y: G + 8.8, z: EZ, mat: M.granite });
    hipRoof(g, { w: 8, d: 6, h: 2.8, x: EX, y: G + 9.7, z: EZ, overhang: 1.4, ridge: 0.5, curve: 0.14, mat: M.roofTileBlue });

    // ── Pines: wooded slope behind the office, rows beside the lawn ───────────────────────
    [
      [-30, -21, 7.5], [-20, -22.5, 6.5], [-8, -23.5, 7], [8, -23.5, 6.5], [20, -22.5, 7.5], [30, -21, 6.5],
      [-38, -4, 7], [-37.5, 5, 6], [38, -4, 7], [37.5, 5, 6],
      [-27, 13, 6], [-26.5, 21, 6.5], [-25, 29, 6], [27, 13, 6], [26.5, 21, 6.5], [25, 29, 6],
      [-10, 36, 5.5], [10, 36, 5.5], [-19, 33, 5.5], [19, 33, 5.5],
    ].forEach(([x, z, h]) => tree(g, { x, y: G, z, h, r: h * 0.34, mat: pine }));

    return g;
  },
};
