// 타워팰리스 (Tower Palace, 삼성물산 · SOM, 2002-2004) - 강남구
// Korea's first super-tall residential cluster, on the 도곡동 block between 언주로 (west) and
// 남부순환로 (north, running WSW-ENE). Seven towers of graded height on a shared landscaped site:
// - 3차 G동 (69F, roof 263 m, spire 265 m) - the signature: an elliptical blue-grey glass tower with
//   white spandrel lines and dark refuge floors (16F / 55F); the oval steps in twice near the top and
//   ends in a tall pointed silver crown with ribs and a slim mast. South-west corner of the site.
// - 1차 A·B·C동 (59 / 65 / 59F, 209 / 234 / 209 m) - chamfered-square beige panel towers with projecting
//   white bays, dark vertical window strips, thin floor lines and stepped crowns (mechanical box + mast),
//   set on a diagonal with B동 in the middle over a 3-storey retail podium (타워팰리스 플라자) with a roof garden.
// - 1차 D동 (42F, 153 m) - the same family, standing apart to the north-west by 언주로.
// - 2차 E·F동 (55F, 191 m) - twin grey panel towers with bowed glass bays, north-east by 도곡역.
// Site spacing is ~0.35 of real and footprints ~0.5 of real so the cluster fits the collider; heights 1:1.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, prism, lathe, strut, subgroup, tree, treePatch, deg } from "./_helpers.mjs";

const FLOOR = 3.4;
const PLAZA_H = 0.8;
const POD1_H = 10.2; // 3-storey retail podium under 1차 A·B·C
const POD2_H = 8; // 2-storey podium under 2차 E·F
const PODD_H = 6; // D동's own low podium
const PODG_H = 5; // G동's oval podium ring
const PANEL = material(0xd7c9ae, { roughness: 0.75 }); // 1차 beige aluminium panels
const PANEL_LIGHT = M.white;
const PANEL_GREY = material(0xcdd1d4, { roughness: 0.72 }); // 2차 cool grey panels
const STRIP = M.glassDark;
const LINE = M.concrete;
const G_GLASS = material(0x98bdd8, { roughness: 0.18, metalness: 0.72, emissive: 0x0f2a42, emissiveIntensity: 0.2 });

/** Rectangle `w × d` centred at (cx, cz) with corners chamfered by `c`, as prism points (clockwise seen from above). */
function chamferRect(w, d, c, cx = 0, cz = 0) {
  const hw = w / 2;
  const hd = d / 2;
  return [
    [cx - hw + c, cz - hd], [cx + hw - c, cz - hd], [cx + hw, cz - hd + c], [cx + hw, cz + hd - c],
    [cx + hw - c, cz + hd], [cx - hw + c, cz + hd], [cx - hw, cz + hd - c], [cx - hw, cz - hd + c],
  ];
}

/** Scale a polygon about its centroid (cornices / joint lines slightly proud of a podium face). */
function inflate(pts, k) {
  const cx = pts.reduce((sum, p) => sum + p[0], 0) / pts.length;
  const cz = pts.reduce((sum, p) => sum + p[1], 0) / pts.length;
  return pts.map(([x, z]) => [cx + (x - cx) * k, cz + (z - cz) * k]);
}

function ellipsePts(cx, cz, rx, rz, n = 32) {
  const pts = [];
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * rx, cz + Math.sin(a) * rz]);
  }
  return pts;
}

/**
 * `count` vertical boxes evenly spaced along the given edges of a clockwise polygon, aligned with the face.
 * `w` = width along the face, `t` = thickness, `out` = distance of the inner face from the wall.
 */
function edgeBoxes(g, pts, { edges, count, w, t, out = 0, y0, y1, mat }) {
  const h = y1 - y0;
  if (h <= 0) return;
  edges.forEach((i) => {
    const [ax, az] = pts[i];
    const [bx, bz] = pts[(i + 1) % pts.length];
    const dx = bx - ax;
    const dz = bz - az;
    const len = Math.hypot(dx, dz);
    const ux = dx / len;
    const uz = dz / len;
    const nx = uz; // outward normal
    const nz = -ux;
    const ry = -Math.atan2(dz, dx);
    for (let k = 0; k < count; k += 1) {
      const s = (k - (count - 1) / 2) * (len / count);
      box(g, {
        w, h, d: t, ry, mat, y: y0,
        x: ax + dx / 2 + ux * s + nx * (out + t / 2),
        z: az + dz / 2 + uz * s + nz * (out + t / 2),
      });
    }
  });
}

/** Stone-clad podium: body, dark base course, stone joint lines and a cornice. */
function podium(g, { points, h, mat = M.limestone }) {
  prism(g, { points, h, y: PLAZA_H, mat });
  prism(g, { points: inflate(points, 1.012), h: 1.4, y: PLAZA_H, mat: M.graniteDark });
  for (let y = PLAZA_H + 3.6; y < PLAZA_H + h - 2; y += FLOOR) {
    prism(g, { points: inflate(points, 1.006), h: 0.25, y, mat: M.granite });
  }
  prism(g, { points: inflate(points, 1.015), h: 0.9, y: PLAZA_H + h - 0.9, mat: M.granite });
}

/** Stepped crown shared by the panel towers: setback tiers, mechanical box and a mast up to `top`. */
function stepCrown(g, { w, d, c, y, tiers, top, mat }) {
  let t = y;
  tiers.forEach(([f, th], i) => {
    const tw = w * f;
    const td = d * f;
    const tc = Math.min(c, tw * 0.22);
    prism(g, { points: chamferRect(tw, td, tc), h: th, y: t, mat: i % 2 ? mat : PANEL_LIGHT });
    prism(g, { points: chamferRect(tw + 0.4, td + 0.4, tc), h: 0.35, y: t + th - 0.35, mat: M.steelDark });
    t += th;
  });
  box(g, { w: Math.min(6, w * 0.3), h: 2.4, d: Math.min(4.5, d * 0.25), y: t, mat: M.steelDark });
  cyl(g, { rTop: 0.15, rBot: 0.4, h: top - t - 2.4, y: t + 2.4, mat: M.steel, seg: 6 });
}

/**
 * 1차 tower (A·B·C·D): chamfered square shaft in beige panels, a projecting white bay on each flat face
 * (stopping below the roof as the first setback), dark window strips, one floor line per storey, stepped crown.
 */
function panelTower(parent, { x, z, ry = 0, w, c, baseH, bodyTop, top, tiers }) {
  const g = subgroup(parent, { x, z, ry });
  const plan = chamferRect(w, w, c);
  prism(g, { points: chamferRect(w + 0.6, w + 0.6, c), h: baseH, mat: M.granite });
  prism(g, { points: plan, h: bodyTop, mat: PANEL });
  const bayTop = bodyTop - 7;
  const flat = w - 2 * c;
  edgeBoxes(g, plan, { edges: [0, 2, 4, 6], count: 1, w: flat - 2, t: 1.5, out: -0.2, y0: baseH, y1: bayTop, mat: PANEL_LIGHT });
  edgeBoxes(g, plan, { edges: [0, 2, 4, 6], count: 2, w: 2, t: 0.5, out: 1.3, y0: baseH, y1: bayTop, mat: STRIP });
  edgeBoxes(g, plan, { edges: [1, 3, 5, 7], count: 1, w: 2.4, t: 0.5, out: -0.15, y0: baseH, y1: bodyTop - 0.5, mat: STRIP });
  for (let y = baseH + FLOOR; y < bodyTop - 1; y += FLOOR) {
    prism(g, { points: chamferRect(w + 0.5, w + 0.5, c), h: 0.22, y: y - 0.11, mat: LINE });
  }
  stepCrown(g, { w, d: w, c, y: bodyTop, tiers, top, mat: PANEL });
  return g;
}

/** 2차 tower (E·F): chamfered rectangle in grey panels with bowed glass bays on the long faces. */
function bowTower(parent, { x, z, ry = 0, w, d, c, baseH, bodyTop, top, tiers }) {
  const g = subgroup(parent, { x, z, ry });
  const plan = chamferRect(w, d, c);
  prism(g, { points: chamferRect(w + 0.6, d + 0.6, c), h: baseH, mat: M.granite });
  prism(g, { points: plan, h: bodyTop, mat: PANEL_GREY });
  const bayTop = bodyTop - 6;
  const bayR = (d - 2 * c - 1) / 2; // half-length of the bay along the face
  [-1, 1].forEach((s) => {
    const bx = s * (w / 2 - 0.6);
    cyl(g, { rTop: bayR, h: bayTop - baseH, x: bx, y: baseH, mat: M.glass, seg: 16, sx: 3 / bayR });
    // white mullions following the curve of the bay
    [-0.7, 0, 0.7].forEach((a) => {
      box(g, { w: 0.45, h: bayTop - baseH, d: 0.45, x: bx + s * Math.cos(a) * 3.05, y: baseH, z: Math.sin(a) * (bayR + 0.05), mat: M.white });
    });
    box(g, { w: 6.2, h: 0.6, d: bayR * 2 + 0.4, x: bx, y: bayTop, mat: M.steelDark });
  });
  edgeBoxes(g, plan, { edges: [0, 4], count: 2, w: 2.2, t: 0.5, out: -0.15, y0: baseH, y1: bodyTop - 0.5, mat: STRIP });
  edgeBoxes(g, plan, { edges: [1, 3, 5, 7], count: 1, w: 2.2, t: 0.5, out: -0.15, y0: baseH, y1: bodyTop - 0.5, mat: STRIP });
  for (let y = baseH + FLOOR; y < bodyTop - 1; y += FLOOR) {
    prism(g, { points: chamferRect(w + 0.5, d + 0.5, c), h: 0.22, y: y - 0.11, mat: LINE });
  }
  stepCrown(g, { w, d, c, y: bodyTop, tiers, top, mat: PANEL_GREY });
  return g;
}

/**
 * 3차 G동: elliptical glass shaft with a white spandrel line per floor and dark refuge floors,
 * two oval setbacks, then a tall pointed ribbed crown and a mast reaching `top`.
 */
function ovalTower(parent, { x, z, ry = 0, rx, rz, baseH, bodyTop, top }) {
  const g = subgroup(parent, { x, z, ry });
  const k = rz / rx;
  cyl(g, { rTop: rx + 0.8, h: baseH, mat: M.granite, seg: 24, sz: (rz + 0.8) / (rx + 0.8) });
  cyl(g, { rTop: rx, h: bodyTop - baseH, y: baseH, mat: G_GLASS, seg: 24, sz: k });
  for (let y = baseH + FLOOR; y < bodyTop - 1; y += FLOOR) {
    cyl(g, { rTop: rx + 0.18, h: 0.4, y: y - 0.2, mat: M.white, seg: 24, sz: (rz + 0.18) / (rx + 0.18) });
  }
  [15, 54].forEach((f) => {
    cyl(g, { rTop: rx + 0.25, h: FLOOR - 0.5, y: baseH + f * FLOOR + 0.25, mat: M.steelDark, seg: 24, sz: (rz + 0.25) / (rx + 0.25) });
  });
  let t = bodyTop;
  [[0.88, 5], [0.76, 4]].forEach(([f, th]) => {
    cyl(g, { rTop: rx * f, h: th, y: t, mat: M.glassWhite, seg: 24, sz: k });
    cyl(g, { rTop: rx * f + 0.2, h: 0.4, y: t + th - 0.4, mat: M.white, seg: 24, sz: k });
    t += th;
  });
  // Pointed crown: a tall concave spire (elliptical in plan) with ribs, then the mast.
  const mastH = 5;
  const crownH = top - mastH - t;
  const crx = rx * 0.78;
  const crz = rz * 0.78;
  const profile = [[1, 0], [0.8, 0.22], [0.58, 0.46], [0.36, 0.68], [0.17, 0.86], [0.04, 1]];
  const spire = lathe(g, { profile: profile.map(([r, f]) => [r, f * crownH]), y: t, mat: M.steel, seg: 24 });
  spire.scale.set(crx, 1, crz);
  cyl(g, { rTop: 1.02, h: 0.7, y: t, mat: M.white, seg: 24, sx: crx, sz: crz });
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    const at = (r, f) => [Math.cos(a) * (r * crx + 0.2), t + f * crownH, Math.sin(a) * (r * crz + 0.2)];
    strut(g, { from: at(1, 0), to: at(0.58, 0.46), r: 0.18, mat: M.white, seg: 6 });
    strut(g, { from: at(0.58, 0.46), to: at(0.17, 0.86), r: 0.15, mat: M.white, seg: 6 });
  }
  cyl(g, { rTop: 0.12, rBot: 0.35, h: mastH, y: top - mastH, mat: M.steel, seg: 6 });
  return g;
}

export default {
  id: "tower-palace",
  name: "타워팰리스",
  nameEn: "Tower Palace",
  district: "강남구",
  lat: 37.488,
  lon: 127.0548,
  height: 264,
  colliderRadius: 58,
  detail: "high",
  description: "73층 264m G동을 포함한 초고층 주거 타워 군",
  create() {
    const g = new THREE.Group();
    // The block's north edge follows 남부순환로, which runs WSW-ENE here.
    const site = subgroup(g, { ry: deg(20) });

    // ── Ground: paved site between 언주로 (west) and 남부순환로 (north) ───────────────────────
    const PLAZA = [[-48, -30], [-30, -49], [0, -56], [28, -50], [46, -34], [52, -8], [46, 22], [24, 44], [-6, 54], [-30, 48], [-50, 26], [-56, 0], [-54, -20]];
    prism(site, { points: PLAZA, h: PLAZA_H, mat: M.granite });

    // ── Podiums ────────────────────────────────────────────────────────────────────────────
    // 1차: 3-storey retail podium (타워팰리스 플라자) carrying A·B·C, with shopfront glazing.
    const POD1 = [[-50, -14.5], [33, -14.5], [37, -4], [33, 10], [6, 22], [-16, 22], [-32, 10], [-50, 6]];
    podium(site, { points: POD1, h: POD1_H });
    box(site, { w: 80, h: 3.4, d: 0.6, x: -8.5, y: PLAZA_H + 1.4, z: -14.8, mat: M.glass });
    box(site, { w: 21, h: 3.4, d: 0.6, x: -5, y: PLAZA_H + 1.4, z: 22.3, mat: M.glass });
    box(site, { w: 0.6, h: 3.4, d: 20, x: -50.3, y: PLAZA_H + 1.4, z: -4.2, mat: M.glass });
    // Drop-off canopy at the B동 lobby (north side)
    box(site, { w: 14, h: 0.5, d: 5, x: -8, y: PLAZA_H + 5.2, z: -17.2, mat: M.steelDark });
    [-5, 5].forEach((dx) => cyl(site, { rTop: 0.25, h: 4.4, x: -8 + dx, y: PLAZA_H, z: -19.2, mat: M.steel, seg: 6 }));
    // 2차: 2-storey podium under E·F
    const POD2 = [[-11, -52], [14, -52], [30, -47], [45, -34], [45, -21], [41, -18.5], [17, -18.5], [10, -28], [-11, -28]];
    podium(site, { points: POD2, h: POD2_H });
    box(site, { w: 24, h: 3, d: 0.6, x: 1.5, y: PLAZA_H + 1.4, z: -52.3, mat: M.glass });
    // D동: its own low podium
    podium(site, { points: chamferRect(19, 19, 4.5, -28, -33), h: PODD_H });
    // G동: oval podium ring
    cyl(site, { rTop: 15, h: PODG_H, x: -25, y: PLAZA_H, z: 36, mat: M.limestone, seg: 32, sz: 10.5 / 15 });
    cyl(site, { rTop: 15.2, h: 0.8, x: -25, y: PLAZA_H + PODG_H - 0.8, z: 36, mat: M.granite, seg: 32, sz: 10.7 / 15.2 });
    cyl(site, { rTop: 15.2, h: 1.2, x: -25, y: PLAZA_H, z: 36, mat: M.graniteDark, seg: 32, sz: 10.7 / 15.2 });

    // ── Driveways, fountain, pavilion, gardens ─────────────────────────────────────────────
    const road = (w, d, x, z) => box(site, { w, h: 0.12, d, x, y: PLAZA_H, z, mat: M.asphalt });
    road(5, 36, -14.75, -33); // entry from 남부순환로 between D동 and 2차
    road(60, 3.2, 16, -16.5); // service lane in the slot between the two podiums
    road(5, 34, 43.5, 3); // east drive
    road(10, 4.2, 36, 20); // spur to the fountain loop
    prism(site, { points: ellipsePts(24, 30, 12.5, 12.5), holes: [ellipsePts(24, 30, 8.2, 8.2).reverse()], h: 0.12, y: PLAZA_H, mat: M.asphalt });
    // Fountain inside the loop: lawn ring, granite basin, water, central jet
    cyl(site, { rTop: 8.2, h: 0.25, x: 24, y: PLAZA_H, z: 30, mat: M.grass, seg: 24 });
    cyl(site, { rTop: 5.6, h: 0.8, x: 24, y: PLAZA_H + 0.25, z: 30, mat: M.granite, seg: 24 });
    cyl(site, { rTop: 5.1, h: 0.3, x: 24, y: PLAZA_H + 0.85, z: 30, mat: M.water, seg: 24 });
    cyl(site, { rTop: 0.9, h: 1.2, x: 24, y: PLAZA_H + 1.05, z: 30, mat: M.granite, seg: 12 });
    cyl(site, { rTop: 0.25, rBot: 0.4, h: 4.5, x: 24, y: PLAZA_H + 2.25, z: 30, mat: M.glassWhite, seg: 8 });
    // Low glass retail pavilion on the south lawn
    box(site, { w: 14, h: 4.5, d: 8, x: 0, y: PLAZA_H, z: 42, mat: M.glassWhite });
    box(site, { w: 15.2, h: 0.5, d: 9.2, x: 0, y: PLAZA_H + 4.5, z: 42, mat: M.steelDark });
    // Lawns and trees on the ground
    const lawn = (w, d, x, z, y = PLAZA_H) => box(site, { w, h: 0.25, d, x, y, z, mat: M.grass });
    lawn(10, 10, 2, 30);
    treePatch(site, { w: 8, d: 8, x: 2, y: PLAZA_H + 0.25, z: 30, count: 6, seed: 3, h: 7, r: 2.2 });
    lawn(6, 16, -47, 16);
    [10, 17, 24].forEach((z) => tree(site, { x: -47, y: PLAZA_H + 0.25, z, h: 7, r: 2.2 }));
    lawn(8, 6, -40, -20);
    treePatch(site, { w: 6, d: 4, x: -40, y: PLAZA_H + 0.25, z: -20, count: 4, seed: 5, h: 6.5, r: 2 });
    [[16, 43], [10, 40], [-24, -48]].forEach(([x, z]) => tree(site, { x, y: PLAZA_H, z, h: 7, r: 2.2 }));
    [-10, -4, 2, 8, 14].forEach((z, i) => tree(site, { x: 39.5, y: PLAZA_H, z, h: 6 + (i % 2) * 0.8, r: 1.7 }));
    // Roof gardens on the podiums
    const roof1 = PLAZA_H + POD1_H;
    lawn(4, 7, -23, 10.5, roof1);
    [8.5, 12.5].forEach((z) => tree(site, { x: -23, y: roof1 + 0.25, z, h: 5, r: 1.5 }));
    lawn(5, 12, 6.5, 12, roof1);
    [9, 15].forEach((z) => tree(site, { x: 6.5, y: roof1 + 0.25, z, h: 5, r: 1.5 }));
    lawn(6, 4, -22, -10, roof1);
    lawn(5, 8, 6, -8, roof1);
    tree(site, { x: 6, y: roof1 + 0.25, z: -8, h: 5, r: 1.5 });
    const roof2 = PLAZA_H + POD2_H;
    lawn(5, 9, 40, -28, roof2);
    [-31, -25].forEach((z) => tree(site, { x: 40, y: roof2 + 0.25, z, h: 5, r: 1.5 }));
    lawn(5, 8, 15, -40, roof2);
    [-43, -37].forEach((z) => tree(site, { x: 15, y: roof2 + 0.25, z, h: 5, r: 1.5 }));

    // ── The seven towers ───────────────────────────────────────────────────────────────────
    const base1 = PLAZA_H + POD1_H + 1;
    // 1차 A·B·C동 on a diagonal over the retail podium, B동 (65F, 234 m) in the middle.
    panelTower(site, { x: -37, z: -3, w: 19, c: 5, baseH: base1, bodyTop: 194, top: 209, tiers: [[0.8, 5], [0.58, 4]] });
    panelTower(site, { x: -8, z: 8, w: 21, c: 5.5, baseH: base1, bodyTop: 214, top: 234, tiers: [[0.82, 6], [0.62, 5], [0.42, 4]] });
    panelTower(site, { x: 20, z: -1, w: 19, c: 5, baseH: base1, bodyTop: 194, top: 209, tiers: [[0.8, 5], [0.58, 4]] });
    // 1차 D동 (42F, 153 m) apart to the north-west
    panelTower(site, { x: -28, z: -33, w: 16, c: 4, baseH: PLAZA_H + PODD_H + 1, bodyTop: 141, top: 153, tiers: [[0.8, 5], [0.58, 4]] });
    // 2차 E·F동 (55F, 191 m) twins to the north-east
    const base2 = PLAZA_H + POD2_H + 1;
    bowTower(site, { x: 2, z: -40, w: 12, d: 19, c: 2.5, baseH: base2, bodyTop: 178, top: 191, tiers: [[0.82, 5], [0.6, 4]] });
    bowTower(site, { x: 28, z: -30, w: 12, d: 19, c: 2.5, baseH: base2, bodyTop: 178, top: 191, tiers: [[0.82, 5], [0.6, 4]] });
    // 3차 G동 (69F, 264 m) - the oval tower with the pointed crown, south-west corner
    ovalTower(site, { x: -25, z: 36, rx: 12.5, rz: 7.2, baseH: PLAZA_H + PODG_H + 4, bodyTop: 229, top: 264 });

    return g;
  },
};
