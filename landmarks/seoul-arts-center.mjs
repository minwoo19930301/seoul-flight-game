// 예술의전당 (Seoul Arts Center, 1988-93, arch. 김석철) - 서초구
// Arts campus on the lower north slope of 우면산, facing north onto 남부순환로.
// - 오페라하우스 (centre-south, the signature): warm-beige stone drum with vertical glazing slots under a
//   very wide, shallow dark conical roof - a Joseon gentleman's hat (갓) - with a small lantern crown.
// - 음악당 (west): fan-shaped (부채) plan, a stepped stone wedge that rises towards its wide arc, with
//   radial ribs and dark metal roof edges; entrance canopy facing the 음악광장.
// - 한가람미술관 (east, long N-S), 서예박물관 (NW) and 한가람디자인미술관 (NE): low stone boxes with long
//   horizontal glass bands and flat trimmed roofs around the plazas.
// - Plazas: the raised 음악광장 with the round 세계음악분수 and 계단광장 steps down to the 미술광장,
//   the glass 비타민스테이션 entrance pavilion on the north axis, lawns and rows of trees.
// Footprint ≈ 0.55 of real (collider budget); heights are close to real.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, cone, prism, tree, treePatch, deg } from "./_helpers.mjs";

const TAU = Math.PI * 2;
const STONE = material(0xcfbfa4, { roughness: 0.85 }); // warm beige granite (opera house, music hall)
const STONE_LIGHT = material(0xdad0b8, { roughness: 0.85 }); // lighter panels on the museums
const TRIM = M.steelDark;
const ROOF = M.roofTile;

/** Superellipse outline (|x/a|^n + |z/b|^n = 1) as [x, z] points. */
function superellipse(a, b, n, count) {
  const pts = [];
  for (let i = 0; i < count; i += 1) {
    const t = (i / count) * TAU;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const r = Math.pow(Math.pow(Math.abs(c) / a, n) + Math.pow(Math.abs(s) / b, n), -1 / n);
    pts.push([r * c, r * s]);
  }
  return pts;
}

/** Annular circle sector (fan) footprint centred on (cx, cz). Angles in radians: 0 = east, π/2 = south. */
function sectorPoints(cx, cz, rIn, rOut, a0, a1, steps = 18) {
  const pts = [];
  for (let i = 0; i <= steps; i += 1) {
    const a = a0 + ((a1 - a0) * i) / steps;
    pts.push([cx + Math.cos(a) * rOut, cz + Math.sin(a) * rOut]);
  }
  for (let i = steps; i >= 0; i -= 1) {
    const a = a0 + ((a1 - a0) * i) / steps;
    pts.push([cx + Math.cos(a) * rIn, cz + Math.sin(a) * rIn]);
  }
  return pts;
}

function sector(g, { cx, cz, rIn, rOut, a0, a1, h, y = 0, mat, steps = 18 }) {
  return prism(g, { points: sectorPoints(cx, cz, rIn, rOut, a0, a1, steps), h, y, mat });
}

/** Box whose local x axis points along the planar direction `a` (radians, 0 = east, π/2 = south). */
function boxAlong(g, { a, cx, cz, along = 0, across = 0, w, d, h, y, mat }) {
  const x = cx + Math.cos(a) * along - Math.sin(a) * across;
  const z = cz + Math.sin(a) * along + Math.cos(a) * across;
  return box(g, { w, h, d, x, y, z, mat, ry: -a });
}

/** Low stone-clad museum block: body, dark roof edge and two long horizontal glass bands on every face. */
function stoneBlock(g, { x, y = 0, z, w, d, h, mat = STONE_LIGHT, bands = [4.2, 8.8] }) {
  box(g, { w, h, d, x, y, z, mat });
  box(g, { w: w + 0.5, h: 0.9, d: d + 0.5, x, y: y + h - 0.3, z, mat: TRIM });
  bands.forEach((by) => {
    box(g, { w: w + 0.3, h: 1.5, d: d - 3, x, y: y + by, z, mat: M.glassDark });
    box(g, { w: w - 3, h: 1.5, d: d + 0.3, x, y: y + by, z, mat: M.glassDark });
  });
}

/** Glazed entrance with a thin flat canopy on a wall facing +z (south) or -z (north). */
function entrance(g, { x, y, z, w, facing = 1, glassH = 6, canopyY = 7 }) {
  box(g, { w, h: glassH, d: 0.5, x, y, z: z + facing * 0.15, mat: M.glass });
  box(g, { w: w + 4, h: 0.6, d: 3.2, x, y: y + canopyY, z: z + facing * 1.6, mat: TRIM });
  for (let i = 0; i < 4; i += 1) {
    const px = x - w / 2 + (w / 3) * i;
    cyl(g, { rTop: 0.35, h: canopyY, x: px, y, z: z + facing * 2.9, mat: TRIM, seg: 8 });
  }
}

export default {
  id: "seoul-arts-center",
  name: "예술의전당",
  nameEn: "Seoul Arts Center",
  district: "서초구",
  lat: 37.4788,
  lon: 127.0122,
  height: 44,
  colliderRadius: 69,
  detail: "high",
  description: "갓 모양 오페라하우스와 부채꼴 음악당",
  create() {
    const g = new THREE.Group();
    const PLAZA = 0.6; // 미술광장 paving top
    const TERRACE = 3; // raised 음악광장 / opera terrace level
    const OX = 0; // opera house centre
    const OZ = 12;

    // ── Ground: paving, raised terrace, lawns ─────────────────────────────────
    prism(g, { points: superellipse(60, 56, 2.6, 40), h: PLAZA, mat: M.granite });
    // 음악광장 terrace (also the base of 음악당 and 서예박물관) with the 계단광장 steps on its east edge.
    prism(g, {
      points: [[-14, -52], [-14, -16], [-26, 2], [-26, 30], [-60, 30], [-64, 0], [-58, -34], [-44, -52]],
      h: TERRACE, mat: M.granite,
    });
    for (let k = 1; k <= 3; k += 1) {
      box(g, { w: 1.4, h: TERRACE - 0.6 * k, d: 36, x: -14 + 1.4 * (k - 0.5), z: -34, mat: M.granite });
    }
    // Lawns: astroturf on the 미술광장, the hillside behind the opera house, the entrance strip, east edge.
    box(g, { w: 10, h: 0.25, d: 10, x: 25, y: PLAZA, z: -28, mat: M.grass });
    box(g, { w: 60, h: 0.4, d: 12, x: 0, y: PLAZA, z: 52, mat: M.grassDark });
    box(g, { w: 60, h: 0.3, d: 5, x: 0, y: PLAZA, z: -57.5, mat: M.grass });
    box(g, { w: 6, h: 0.3, d: 48, x: 59, y: PLAZA, z: 2, mat: M.grass });

    // ── 오페라하우스: stepped circular podium with a straight north front and stairs ──
    cyl(g, { rTop: 30, h: TERRACE, x: OX, z: OZ, mat: M.granite, seg: 48 });
    [31.2, 32.4, 33.6].forEach((r, i) => {
      cyl(g, { rTop: r, h: TERRACE - 0.6 * (i + 1), x: OX, z: OZ, mat: M.granite, seg: 48 });
    });
    box(g, { w: 36, h: TERRACE, d: 10, x: OX, z: -15, mat: M.granite });
    for (let k = 1; k <= 3; k += 1) {
      box(g, { w: 36, h: TERRACE - 0.6 * k, d: 1.5, x: OX, z: -20 - 1.5 * (k - 0.5), mat: M.granite });
    }

    // The drum (6 storeys) with vertical glazing slots and a dark cornice under the eave.
    const drumR = 26;
    const drumH = 26;
    cyl(g, { rTop: drumR, h: drumH, x: OX, y: TERRACE, z: OZ, mat: STONE, seg: 64 });
    for (let i = 0; i < 36; i += 1) {
      const a = (i / 36) * TAU;
      const degrees = (i / 36) * 360;
      if (degrees > 238 && degrees < 302) continue; // north front is the glass lobby
      boxAlong(g, { a, cx: OX, cz: OZ, along: drumR + 0.1, w: 0.5, d: 1.3, h: 18, y: TERRACE + 5, mat: M.glassDark });
    }
    cyl(g, { rTop: drumR + 0.4, h: 1.2, x: OX, y: TERRACE + drumH - 2, z: OZ, mat: TRIM, seg: 64 });
    // North glass lobby bulging out of the drum, with a flat canopy on two columns.
    cyl(g, { rTop: 9, h: 9, x: OX, y: TERRACE, z: OZ - drumR, mat: M.glass, seg: 32, sx: 2, sz: 0.5 });
    box(g, { w: 36, h: 0.8, d: 8, x: OX, y: TERRACE + 9, z: OZ - drumR - 4, mat: TRIM });
    [-15, 15].forEach((x) => cyl(g, { rTop: 0.5, h: 9, x, y: TERRACE, z: OZ - drumR - 5.5, mat: TRIM, seg: 8 }));
    // Rear stage / loading block tucked under the brim on the hill side.
    box(g, { w: 30, h: 16, d: 12, x: OX, y: TERRACE, z: OZ + 24, mat: STONE });

    // The 갓: eave fascia ring, wide shallow cone, lantern crown with its own cap and finial.
    const brimR = 34.5;
    const brimY = TERRACE + drumH - 0.5;
    cyl(g, { rTop: brimR + 0.4, h: 1.4, x: OX, y: brimY - 0.9, z: OZ, mat: TRIM, seg: 64 });
    cone(g, { r: brimR, h: 8, x: OX, y: brimY, z: OZ, mat: ROOF, seg: 64 });
    cyl(g, { rTop: 6.5, h: 6, x: OX, y: brimY + 3.5, z: OZ, mat: STONE, seg: 32 });
    cyl(g, { rTop: 6.7, h: 1.6, x: OX, y: brimY + 7.2, z: OZ, mat: M.glassDark, seg: 32 });
    cone(g, { r: 7.6, h: 3, x: OX, y: brimY + 9.5, z: OZ, mat: ROOF, seg: 32 });
    cyl(g, { rTop: 0.2, rBot: 0.5, h: 2.5, x: OX, y: brimY + 12.5, z: OZ, mat: M.steel, seg: 8 });

    // ── 음악당: fan-shaped stepped wedge west of the opera house ────────────────
    const MX = -22; // fan pivot (next to the drum); the arc opens west-north-west
    const MZ = 20;
    const A0 = deg(172);
    const A1 = deg(238);
    const fanR = 36;
    const tiers = [[7, 10], [14, 5], [21, 5], [28, 5]]; // [inner radius, storey height] rising to the arc
    let level = TERRACE;
    tiers.forEach(([rIn, h], index) => {
      sector(g, { cx: MX, cz: MZ, rIn, rOut: fanR, a0: A0, a1: A1, h, y: level, mat: STONE });
      level += h;
      const rNext = index < tiers.length - 1 ? tiers[index + 1][0] : fanR;
      // dark metal edge along the step and radial fan ribs on the exposed roof band
      sector(g, { cx: MX, cz: MZ, rIn: rIn - 0.2, rOut: rIn + 0.9, a0: A0, a1: A1, h: 0.5, y: level, mat: TRIM });
      for (let j = 1; j <= 5; j += 1) {
        const a = A0 + ((A1 - A0) * j) / 6;
        boxAlong(g, { a, cx: MX, cz: MZ, along: (rIn + rNext) / 2, w: rNext - rIn, d: 0.5, h: 0.5, y: level, mat: TRIM });
      }
      [A0, A1].forEach((a, side) => {
        boxAlong(g, { a, cx: MX, cz: MZ, along: (rIn + rNext) / 2, across: side ? -0.35 : 0.35, w: rNext - rIn, d: 0.6, h: 0.6, y: level, mat: TRIM });
      });
    });
    // Concert-hall wall at the wide end: top fascia and two glass foyer bands.
    sector(g, { cx: MX, cz: MZ, rIn: fanR - 0.6, rOut: fanR + 0.4, a0: A0, a1: A1, h: 1.4, y: level - 1.2, mat: TRIM });
    sector(g, { cx: MX, cz: MZ, rIn: fanR, rOut: fanR + 0.35, a0: A0, a1: A1, h: 5, y: TERRACE + 4, mat: M.glassDark });
    sector(g, { cx: MX, cz: MZ, rIn: fanR, rOut: fanR + 0.3, a0: A0, a1: A1, h: 2.5, y: TERRACE + 14, mat: M.glassDark });
    // Entrance facade on the north-east radial edge facing the 음악광장: glass wall, canopy, columns.
    boxAlong(g, { a: A1, cx: MX, cz: MZ, along: 21.5, across: 0.25, w: 27, d: 0.5, h: 7, y: TERRACE, mat: M.glass });
    boxAlong(g, { a: A1, cx: MX, cz: MZ, along: 21.5, across: 2.6, w: 27, d: 5.2, h: 0.7, y: TERRACE + 7, mat: TRIM });
    [11, 18, 25, 32].forEach((along) => {
      boxAlong(g, { a: A1, cx: MX, cz: MZ, along, across: 4.6, w: 0.7, d: 0.7, h: 7, y: TERRACE, mat: TRIM });
    });

    // ── 한가람미술관 (east): long 3-storey stone box, west lobby glazing, rooftop glass lanterns ──
    const HX = 44;
    const HZ = 2;
    stoneBlock(g, { x: HX, z: HZ, w: 20, d: 56, h: 15, bands: [4.5, 9.8] });
    box(g, { w: 0.6, h: 11, d: 30, x: HX - 10.1, y: 0, z: HZ, mat: M.glass });
    box(g, { w: 4, h: 0.6, d: 32, x: HX - 11.8, y: 5.5, z: HZ, mat: TRIM });
    for (let i = -2; i <= 2; i += 1) {
      box(g, { w: 5, h: 1.6, d: 5, x: HX, y: 15, z: HZ + i * 10.5, mat: M.glassDark });
    }
    // 신세계스퀘어 야외무대 between the two Hangaram museums.
    box(g, { w: 14, h: 1, d: 6, x: HX, y: PLAZA, z: -31, mat: M.graniteDark });
    box(g, { w: 14, h: 5, d: 1, x: HX, y: PLAZA, z: -34, mat: STONE });

    // ── 한가람디자인미술관 (north-east) and 서예박물관 (north-west, on the terrace) ──
    stoneBlock(g, { x: 30, z: -43, w: 26, d: 14, h: 12 });
    entrance(g, { x: 30, y: 0, z: -36, w: 12 });
    stoneBlock(g, { x: -29, y: TERRACE, z: -43, w: 26, d: 14, h: 12 });
    entrance(g, { x: -29, y: TERRACE, z: -36, w: 14 });

    // ── 비타민스테이션: glass entrance pavilion on the north axis ──
    box(g, { w: 20, h: 4.5, d: 8, x: 0, y: PLAZA, z: -48, mat: M.glass });
    box(g, { w: 22, h: 0.6, d: 10, x: 0, y: PLAZA + 4.5, z: -48, mat: TRIM });

    // ── 세계음악분수 on the 음악광장 ──
    const FX = -30;
    const FZ = -22;
    cyl(g, { rTop: 11, h: 0.9, x: FX, y: TERRACE, z: FZ, mat: M.graniteDark, seg: 40 });
    cyl(g, { rTop: 10.2, h: 0.15, x: FX, y: TERRACE + 0.9, z: FZ, mat: M.water, seg: 40 });
    for (let i = 0; i < 20; i += 1) {
      const a = (i / 20) * TAU;
      cyl(g, { rTop: 0.14, rBot: 0.24, h: 2.4, x: FX + Math.cos(a) * 7.5, y: TERRACE + 1, z: FZ + Math.sin(a) * 7.5, mat: M.glassWhite, seg: 6 });
    }
    cyl(g, { rTop: 0.35, rBot: 0.7, h: 7, x: FX, y: TERRACE + 1, z: FZ, mat: M.glassWhite, seg: 8 });

    // ── Trees ──
    for (let x = -28; x <= 28; x += 8) tree(g, { x, y: PLAZA + 0.3, z: -58, h: 8, r: 2.8 });
    for (let z = -18; z <= 22; z += 8) tree(g, { x: 59, y: PLAZA + 0.3, z, h: 8, r: 2.6 });
    treePatch(g, { w: 54, d: 7, x: 0, y: PLAZA + 0.4, z: 52, count: 14, seed: 3, h: 9, r: 3 });
    [[22, -30], [28, -25]].forEach(([x, z]) => tree(g, { x, y: PLAZA, z, h: 7, r: 2.4 }));
    [[-24, -10], [-47, -38], [-50, -24], [-54, -32]].forEach(([x, z]) => tree(g, { x, y: TERRACE, z, h: 7, r: 2.4 }));

    return g;
  },
};
