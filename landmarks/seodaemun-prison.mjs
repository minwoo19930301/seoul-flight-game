// 서대문형무소역사관 (Seodaemun Prison History Hall, 1908 / 1923) - 서대문구
// The Japanese colonial-era prison at the foot of 인왕산, preserved as a museum. A high red-brick
// perimeter wall with two 망루 watchtowers (south-east by the main gate, north-west by the execution
// yard); the two-storey 보안과청사 (today's exhibition hall) just inside the south gate; the two-storey
// 중앙사 hub with its small central gable and turret, from whose back the three long single-storey
// cell blocks 옥사 10·11·12 fan out towards the north-west (pitched roofs, ridge ventilators, rows of
// small barred windows); the fan-shaped 격벽장 exercise yard; the long 공작사 workshop along the west
// wall; 한센병사; the walled 사형장 execution house with its tall poplar in the north-west corner; the
// L-shaped 여옥사 women's block in the north-east; 옥사 9 and the kitchen with its chimney on the east.
// The 250 × 130 m site is compressed to ~56 × 44 units (r = 38, hard limit next to 독립문); heights real.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, gableRoof, pyramidRoof, tree, subgroup } from "./_helpers.mjs";

const BRICK = M.brick;
const DARK = M.brickDark;
const ROOF = M.roofTile;
const WIN = M.black;
const timber = material(0x4a3a2c, { roughness: 0.9 }); // dark wood (execution house, gate leaves)
const paving = material(0xcac4b9, { roughness: 0.95 });

/**
 * Brick shed / block with a pitched roof, long axis along local x, centred on (x, z), rotated by `ry`.
 * Rows of small dark windows on both long faces; optional ridge ventilator (cell blocks).
 */
function shed(parent, {
  x = 0, z = 0, y = 0, ry = 0, w, d, wallH = 3.2, roofH = 1.7, mat = BRICK,
  winRows = [1.6], winW = 0.7, winH = 0.9, winPitch = 1.7, vent = false, ends = true,
}) {
  const s = subgroup(parent, { x, y, z, ry });
  box(s, { w, h: wallH, d, mat });
  box(s, { w: w + 0.2, h: 0.45, d: d + 0.2, mat: DARK }); // plinth course
  gableRoof(s, { w, d, h: roofH, y: wallH, overhang: 0.45, mat: ROOF });
  if (vent) {
    box(s, { w: w * 0.72, h: 0.55, d: 0.9, y: wallH + roofH - 0.15, mat: DARK });
  }
  const n = Math.max(1, Math.floor((w - 1.4) / winPitch));
  for (let i = 0; i < n; i += 1) {
    const px = -((n - 1) / 2) * winPitch + i * winPitch;
    winRows.forEach((wy) => {
      box(s, { w: winW, h: winH, d: 0.3, x: px, y: wy, z: d / 2 + 0.02, mat: WIN });
      box(s, { w: winW, h: winH, d: 0.3, x: px, y: wy, z: -d / 2 - 0.02, mat: WIN });
    });
  }
  if (ends) {
    winRows.forEach((wy) => {
      box(s, { w: 0.3, h: winH, d: winW, x: w / 2 + 0.02, y: wy, mat: WIN });
      box(s, { w: 0.3, h: winH, d: winW, x: -w / 2 - 0.02, y: wy, mat: WIN });
    });
  }
  return s;
}

/** 망루 watchtower: square brick shaft, timber observation room with windows, hipped roof cap. */
function watchtower(parent, { x, z }) {
  const shaftH = 8.4;
  box(parent, { w: 3, h: shaftH, d: 3, x, z, mat: BRICK });
  box(parent, { w: 3.2, h: 0.4, d: 3.2, x, y: 3.2, z, mat: DARK });
  box(parent, { w: 3.5, h: 0.35, d: 3.5, x, y: shaftH, z, mat: DARK });
  box(parent, { w: 3.4, h: 2.2, d: 3.4, x, y: shaftH + 0.35, z, mat: timber });
  [[0, 1.72], [0, -1.72], [1.72, 0], [-1.72, 0]].forEach(([dx, dz]) => {
    box(parent, { w: dx === 0 ? 2.2 : 0.2, h: 1, d: dx === 0 ? 0.2 : 2.2, x: x + dx, y: shaftH + 1.1, z: z + dz, mat: WIN });
  });
  pyramidRoof(parent, { w: 3.6, d: 3.6, h: 1.7, x, y: shaftH + 2.55, z, overhang: 0.7, mat: ROOF });
  return shaftH + 2.55 + 1.7;
}

/** Perimeter wall segment along x (rotate with ry): brick wall, dark cap, pilasters every ~8 m. */
function wall(parent, { x, z, length, ry = 0, h = 4.5 }) {
  const s = subgroup(parent, { x, z, ry });
  box(s, { w: length, h, d: 0.7, mat: BRICK });
  box(s, { w: length + 0.1, h: 0.25, d: 0.95, y: h, mat: DARK });
  const n = Math.round(length / 8);
  for (let i = 0; i <= n; i += 1) {
    const px = -length / 2 + (length / n) * i;
    box(s, { w: 0.9, h: h - 0.1, d: 1.1, x: px, mat: BRICK });
  }
}

export default {
  id: "seodaemun-prison",
  name: "서대문형무소역사관",
  nameEn: "Seodaemun Prison History Hall",
  district: "서대문구",
  lat: 37.5745,
  lon: 126.9563,
  height: 15,
  colliderRadius: 38,
  detail: "medium",
  description: "붉은 벽돌 옥사와 중앙사, 감시탑",
  create() {
    const g = new THREE.Group();
    const X0 = -28;
    const X1 = 28;
    const Z0 = -22;
    const Z1 = 22;

    // ── Ground: gravel yards inside the wall, paved paths, small forecourt outside the gate ──
    box(g, { w: X1 - X0, h: 0.15, d: Z1 - Z0, mat: M.sand });
    box(g, { w: 3.2, h: 0.2, d: 16, x: 8, z: 13.5, mat: paving }); // gate → 보안과청사 → 중앙사
    box(g, { w: 30, h: 0.2, d: 2.6, x: 11, z: 9.5, mat: paving }); // east-west path between 중앙사 and 보안과청사
    box(g, { w: 12, h: 0.2, d: 3, x: 8, z: Z1 + 1.8, mat: paving }); // forecourt

    // ── Perimeter wall (4.5 m red brick) with the main gate in the south wall ──
    wall(g, { x: (X0 + X1) / 2, z: Z0, length: X1 - X0 }); // north
    wall(g, { x: X0, z: (Z0 + Z1) / 2, length: Z1 - Z0, ry: Math.PI / 2 }); // west
    wall(g, { x: X1, z: (Z0 + Z1) / 2, length: Z1 - Z0, ry: Math.PI / 2 }); // east
    const gateX = 8;
    const gateW = 5;
    wall(g, { x: (X0 + gateX - gateW / 2) / 2, z: Z1, length: gateX - gateW / 2 - X0 }); // south, west of the gate
    wall(g, { x: (gateX + gateW / 2 + X1) / 2, z: Z1, length: X1 - gateX - gateW / 2 }); // south, east of the gate
    // gate: two tall brick piers with stone caps, dark timber leaves, lintel
    [-1, 1].forEach((s) => {
      box(g, { w: 1.4, h: 6, d: 1.6, x: gateX + s * (gateW / 2 + 0.7), z: Z1, mat: BRICK });
      box(g, { w: 1.7, h: 0.35, d: 1.9, x: gateX + s * (gateW / 2 + 0.7), y: 6, z: Z1, mat: M.granite });
    });
    box(g, { w: gateW, h: 3.8, d: 0.3, x: gateX, z: Z1, mat: timber });
    box(g, { w: gateW + 0.4, h: 0.6, d: 1.2, x: gateX, y: 4.6, z: Z1, mat: DARK });

    // ── Watchtowers (망루): south-east corner by the gate, north-west corner by the execution yard ──
    watchtower(g, { x: X1 - 2.2, z: Z1 - 2.2 });
    watchtower(g, { x: X0 + 2.2, z: Z0 + 2.2 });

    // ── 보안과청사: two-storey red-brick administration block just inside the gate (today's exhibition hall) ──
    shed(g, { x: 9, z: 14.5, w: 15, d: 6, wallH: 7.2, roofH: 2.6, winRows: [1.4, 4.6], winW: 1, winH: 1.9, winPitch: 2.4 });
    box(g, { w: 3.2, h: 7.6, d: 1.2, x: 9, z: 17.6, mat: BRICK }); // central entrance bay
    gableRoof(g, { w: 3.6, d: 1.6, h: 1.5, x: 9, y: 7.6, z: 17.6, overhang: 0.2, mat: ROOF });
    box(g, { w: 1.6, h: 2.6, d: 0.3, x: 9, z: 18.25, mat: timber }); // door
    box(g, { w: 1.6, h: 1.9, d: 0.3, x: 9, y: 4.6, z: 18.25, mat: WIN });

    // ── 중앙사: two-storey hub with a central gable and turret; the three cell blocks fan out from its back ──
    const HX = 8;
    const HZ = 2;
    shed(g, { x: HX, z: HZ, w: 14, d: 7, wallH: 7.4, roofH: 2.8, winRows: [1.5, 4.7], winW: 1, winH: 1.9, winPitch: 2.5, ends: false });
    box(g, { w: 4.2, h: 8.2, d: 1.4, x: HX, z: HZ + 3.9, mat: BRICK }); // projecting central bay
    box(g, { w: 1.8, h: 2.8, d: 0.3, x: HX, z: HZ + 4.65, mat: timber });
    box(g, { w: 1.8, h: 1.9, d: 0.3, x: HX, y: 4.7, z: HZ + 4.65, mat: WIN });
    gableRoof(g, { w: 4.6, d: 1.8, h: 1.9, x: HX, y: 8.2, z: HZ + 3.9, overhang: 0.2, mat: ROOF });
    box(g, { w: 1.8, h: 2.4, d: 1.8, x: HX, y: 9.6, z: HZ, mat: BRICK }); // turret on the ridge
    box(g, { w: 2.1, h: 0.25, d: 2.1, x: HX, y: 12, z: HZ, mat: DARK });
    pyramidRoof(g, { w: 1.9, d: 1.9, h: 1.3, x: HX, y: 12.25, z: HZ, overhang: 0.4, mat: ROOF });

    // cell blocks 12 · 11 · 10 (east to west) radiating from the back wall of 중앙사.
    // `a` is the angle west of north; a block that runs north is a shed rotated by +90°.
    const back = HZ - 3.5;
    [[12.3, 5, 18], [7.3, 35, 18], [2.3, 65, 16]].forEach(([px, a, len]) => {
      const rad = (a * Math.PI) / 180;
      const dir = [-Math.sin(rad), -Math.cos(rad)];
      shed(g, {
        x: px + dir[0] * (len / 2 + 0.2), z: back + dir[1] * (len / 2 + 0.2), ry: rad + Math.PI / 2,
        w: len, d: 5.5, wallH: 3.4, roofH: 1.8, vent: true, winRows: [1.9], winW: 0.6, winH: 0.9, winPitch: 1.6, ends: false,
      });
    });

    // ── 격벽장: fan-shaped exercise yard (radial brick walls with a guard post at the pivot) ──
    const FX = -11;
    const FZ = 9;
    const FR = 6;
    box(g, { w: 1.3, h: 3.2, d: 1.3, x: FX, z: FZ, mat: BRICK });
    for (let i = 0; i <= 6; i += 1) {
      const t = (i / 6) * Math.PI;
      box(g, { w: FR, h: 2.6, d: 0.3, x: FX + Math.cos(t) * FR / 2, z: FZ - Math.sin(t) * FR / 2, ry: t, mat: BRICK });
      if (i < 6) {
        const tm = ((i + 0.5) / 6) * Math.PI;
        box(g, { w: 2 * FR * Math.sin(Math.PI / 12) + 0.3, h: 2.6, d: 0.3, x: FX + Math.cos(tm) * FR, z: FZ - Math.sin(tm) * FR, ry: tm + Math.PI / 2, mat: BRICK });
      }
    }

    // ── West: 공작사 workshop (long shed with tall windows) along the wall; 한센병사 to the north ──
    shed(g, { x: -22, z: -1, w: 20, d: 6.5, ry: Math.PI / 2, wallH: 4, roofH: 2.2, winRows: [1.6], winW: 0.9, winH: 1.7, winPitch: 2.2 });
    shed(g, { x: -10.5, z: -18.5, w: 6.5, d: 4, wallH: 3, roofH: 1.5, winRows: [1.5], winPitch: 1.8 });

    // ── 사형장: walled execution yard in the north-west corner - timber house, the 통곡의 미루나무 poplar ──
    box(g, { w: 11, h: 3, d: 0.5, x: -22.2, z: -13, mat: BRICK }); // south side x -27.7..-16.7
    box(g, { w: 0.5, h: 3, d: 9, x: -17, z: -17.5, mat: BRICK }); // east side z -22..-13
    box(g, { w: 11.4, h: 0.2, d: 0.7, x: -22.2, y: 3, z: -13, mat: DARK });
    box(g, { w: 0.7, h: 0.2, d: 9.2, x: -17, y: 3, z: -17.5, mat: DARK });
    box(g, { w: 5, h: 3.2, d: 4, x: -21.5, z: -16.5, mat: timber });
    gableRoof(g, { w: 5, d: 4, h: 1.5, x: -21.5, y: 3.2, z: -16.5, overhang: 0.4, mat: M.black });
    box(g, { w: 1, h: 1.8, d: 0.3, x: -21.5, z: -14.4, mat: M.black });
    cyl(g, { rTop: 0.3, rBot: 0.5, h: 6.5, x: -19.3, z: -19.6, mat: M.trunk, seg: 6 }); // poplar trunk
    cyl(g, { rTop: 0.6, rBot: 1.9, h: 9, x: -19.3, y: 6.5, z: -19.6, mat: M.foliage, seg: 7 }); // tall narrow crown

    // ── East: 옥사 9 (parallel block), kitchen with chimney, L-shaped 여옥사 women's block in the north-east ──
    shed(g, { x: 18, z: 0, w: 15, d: 5.5, ry: Math.PI / 2, wallH: 3.4, roofH: 1.8, vent: true, winRows: [1.9], winW: 0.6, winH: 0.9, winPitch: 1.6, ends: false });
    shed(g, { x: 24, z: 4, w: 6, d: 6, wallH: 3.4, roofH: 1.7, winRows: [1.6], winW: 0.9, winH: 1.2, winPitch: 2 });
    box(g, { w: 1.2, h: 9, d: 1.2, x: 25.6, z: 6.4, mat: BRICK }); // kitchen chimney
    box(g, { w: 1.4, h: 0.3, d: 1.4, x: 25.6, y: 9, z: 6.4, mat: DARK });
    shed(g, { x: 20.5, z: -18.5, w: 11, d: 5, wallH: 3.2, roofH: 1.6, winRows: [1.6], winPitch: 1.8, ends: false });
    shed(g, { x: 23.5, z: -12, w: 8, d: 5, ry: Math.PI / 2, wallH: 3.2, roofH: 1.6, winRows: [1.6], winPitch: 1.8 });

    // ── A few trees in the yards ──
    [[-3, 15.5, 6.5], [-20, 16.5, 7], [20, 17.5, 6], [24.5, 11.5, 5.5], [-16, -8, 5], [-3, -11, 4.5]].forEach(([x, z, h]) => {
      tree(g, { x, z, h, r: h * 0.36 });
    });

    return g;
  },
};
