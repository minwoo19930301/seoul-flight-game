// 목동 하이페리온 (Mok-dong Hyperion I, 2003) - 양천구
// Three slender residential towers of graded height - 101동 69F / 256 m (Korea's tallest residential
// tower at completion), 102동 59F (~229 m roof) and 103동 54F (~191 m roof) - rising from a shared
// 7-storey retail podium (현대백화점 목동점: beige stone with a curved glass corner). Each tower is a
// chamfered rectangle plus an offset secondary volume (stepped plan), clad in pale panels with
// continuous dark vertical glazing strips, belt-truss refuge floors at 32F / 50F, and a stepped
// 3-tier crown with a mechanical penthouse and spire. Footprints are ~1/2 real scale so the three
// towers and the podium fit inside the collider; heights are 1:1.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, prism, subgroup, tree, treePatch, deg } from "./_helpers.mjs";

const PANEL = M.offWhite;
const PANEL_LIGHT = M.white;
const GLAZING = material(0x5b9d98, { roughness: 0.2, metalness: 0.7, emissive: 0x123c38, emissiveIntensity: 0.26 });
const LINE = M.concrete;
const FLOOR = 3.6;
const PODIUM_H = 30;
const BASE_H = PODIUM_H + 1.2; // stone-clad lower floors of the towers end just above the roof deck
const STRIP_W = 2.4;
const STRIP_T = 0.4; // centred on the face -> proud 0.2, so the 0.3-proud floor lines cross the strips

/** Rectangle `w × d` centred at (cx, cz) with corners chamfered by `c`, as prism points. */
function chamferRect(w, d, c, cx = 0, cz = 0) {
  const hw = w / 2;
  const hd = d / 2;
  return [
    [cx - hw + c, cz - hd], [cx + hw - c, cz - hd], [cx + hw, cz - hd + c], [cx + hw, cz + hd - c],
    [cx + hw - c, cz + hd], [cx - hw + c, cz + hd], [cx - hw, cz + hd - c], [cx - hw, cz - hd + c],
  ];
}

/** Podium footprint: chamfered NW/NE/SE corners and a quarter-circle SW corner (the department store). */
function podiumOutline(hw, hd, c, r, inset = 0) {
  const W = hw + inset;
  const D = hd + inset;
  const pts = [
    [-W, -D + c], [-W + c, -D],
    [W - c, -D], [W, -D + c],
    [W, D - c], [W - c, D],
  ];
  const cx = -hw + r;
  const cz = hd - r;
  for (let i = 0; i <= 10; i += 1) {
    const a = Math.PI / 2 + (Math.PI / 2) * (i / 10);
    pts.push([cx + Math.cos(a) * (r + inset), cz + Math.sin(a) * (r + inset)]);
  }
  return pts;
}

/** Pie slice (centre + arc) used for the curved glass corner. */
function cornerPie(cx, cz, r, a0, a1, n = 12) {
  const pts = [[cx, cz]];
  for (let i = 0; i <= n; i += 1) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]);
  }
  return pts;
}

/**
 * Continuous vertical glazing strips set slightly proud of the four faces of a chamfered rectangle.
 * `skip(px, pz)` suppresses strips hidden by the wing; they resume above `resumeAt`.
 */
function glazingStrips(g, { w, d, c, cx = 0, cz = 0, y0, y1, faces = "nsew", skip = null, resumeAt = null }) {
  const place = (px, pz, sw, sd) => {
    if (!skip || !skip(px, pz)) {
      box(g, { w: sw, h: y1 - y0, d: sd, x: px, y: y0, z: pz, mat: GLAZING });
    } else if (resumeAt !== null && resumeAt < y1 - 2) {
      box(g, { w: sw, h: y1 - resumeAt, d: sd, x: px, y: resumeAt, z: pz, mat: GLAZING });
    }
  };
  const flatX = w - 2 * c;
  const flatZ = d - 2 * c;
  const nx = Math.max(1, Math.round(flatX / 5.4));
  const nz = Math.max(1, Math.round(flatZ / 5.4));
  for (let i = 0; i < nx; i += 1) {
    const px = cx + (i - (nx - 1) / 2) * (flatX / nx);
    if (faces.includes("n")) place(px, cz - d / 2, STRIP_W, STRIP_T);
    if (faces.includes("s")) place(px, cz + d / 2, STRIP_W, STRIP_T);
  }
  for (let i = 0; i < nz; i += 1) {
    const pz = cz + (i - (nz - 1) / 2) * (flatZ / nz);
    if (faces.includes("w")) place(cx - w / 2, pz, STRIP_T, STRIP_W);
    if (faces.includes("e")) place(cx + w / 2, pz, STRIP_T, STRIP_W);
  }
}

/**
 * One Hyperion tower: chamfered main shaft `w × d`, an offset secondary volume `wing` (stepped plan,
 * stopping short of the roof as the first setback), glazing strips, floor lines, belt-truss bands,
 * then crown `tiers` ([w, d, h] stacked setbacks), a penthouse and a spire up to `spireTop`.
 */
function hyperionTower(parent, { x, z, ry = 0, w, d, c = 2.6, bodyTop, wing, tiers, spireTop, belts = [] }) {
  const g = subgroup(parent, { x, z, ry });
  const cw = c * 0.7;
  const wx0 = wing.dx - wing.w / 2;
  const wx1 = wing.dx + wing.w / 2;
  const wz0 = wing.dz - wing.d / 2;
  const wz1 = wing.dz + wing.d / 2;
  const nearWing = (px, pz) => px > wx0 - 1.3 && px < wx1 + 1.3 && pz > wz0 - 1.3 && pz < wz1 + 1.3;
  const wingFaces = (wz0 < -d / 2 - 0.5 ? "n" : "") + (wz1 > d / 2 + 0.5 ? "s" : "")
    + (wx1 > w / 2 + 0.5 ? "e" : "") + (wx0 < -w / 2 - 0.5 ? "w" : "");

  // Lobby + resident parking floors (1F-9F) share the podium's stone cladding.
  prism(g, { points: chamferRect(w + 0.5, d + 0.5, c), h: BASE_H, mat: M.granite });
  prism(g, { points: chamferRect(wing.w + 0.5, wing.d + 0.5, cw, wing.dx, wing.dz), h: BASE_H, mat: M.granite });

  // Main shaft and the offset secondary volume.
  prism(g, { points: chamferRect(w, d, c), h: bodyTop, mat: PANEL });
  prism(g, { points: chamferRect(wing.w, wing.d, cw, wing.dx, wing.dz), h: wing.top, mat: PANEL_LIGHT });
  box(g, { w: wing.w - 4, h: 2.5, d: wing.d - 4, x: wing.dx, y: wing.top, z: wing.dz, mat: PANEL });

  // Vertical glazing strips.
  glazingStrips(g, { w, d, c, y0: BASE_H, y1: bodyTop, skip: nearWing, resumeAt: wing.top });
  glazingStrips(g, { w: wing.w, d: wing.d, c: cw, cx: wing.dx, cz: wing.dz, y0: BASE_H, y1: wing.top, faces: wingFaces });

  // Thin floor lines (one per storey) crossing the glazing strips.
  for (let y = BASE_H + FLOOR; y < bodyTop - 1.5; y += FLOOR) {
    prism(g, { points: chamferRect(w + 0.6, d + 0.6, c), h: 0.22, y: y - 0.11, mat: LINE });
    if (y < wing.top - 1.5) {
      prism(g, { points: chamferRect(wing.w + 0.6, wing.d + 0.6, cw, wing.dx, wing.dz), h: 0.22, y: y - 0.11, mat: LINE });
    }
  }

  // Belt-truss / refuge floors read as darker full-storey bands wrapping the tower.
  belts.forEach((y) => {
    prism(g, { points: chamferRect(w + 0.7, d + 0.7, c), h: FLOOR, y, mat: M.steelDark });
    if (y < wing.top - FLOOR) {
      prism(g, { points: chamferRect(wing.w + 0.7, wing.d + 0.7, cw, wing.dx, wing.dz), h: FLOOR, y, mat: M.steelDark });
    }
  });

  // Stepped crown: setback tiers with glazing, mechanical penthouse, spire.
  let top = bodyTop;
  tiers.forEach(([tw, td, th], i) => {
    const tc = Math.min(c, tw * 0.15);
    prism(g, { points: chamferRect(tw, td, tc), h: th, y: top, mat: i % 2 ? PANEL : PANEL_LIGHT });
    glazingStrips(g, { w: tw, d: td, c: tc, y0: top + 0.6, y1: top + th - 0.6 });
    prism(g, { points: chamferRect(tw + 0.3, td + 0.3, tc), h: 0.4, y: top + th - 0.4, mat: M.steelDark });
    top += th;
  });
  box(g, { w: 6, h: 3, d: 4.5, y: top, mat: M.steelDark });
  cyl(g, { rTop: 0.18, rBot: 0.55, h: spireTop - top - 3, y: top + 3, mat: M.steel, seg: 8 });
  return g;
}

export default {
  id: "hyperion",
  name: "목동 하이페리온",
  nameEn: "Mok-dong Hyperion",
  district: "양천구",
  lat: 37.5271,
  lon: 126.8755,
  height: 256,
  colliderRadius: 38,
  detail: "high",
  description: "69층 256m 3개동 주거 타워",
  create() {
    const g = new THREE.Group();
    // The Mok-dong street grid (목동동로 along the west side) runs SSW-NNE, ~20° clockwise from north.
    const site = subgroup(g, { ry: deg(-20) });

    // Ground plaza / sidewalks
    prism(site, { points: chamferRect(62, 56, 9), h: 0.8, mat: M.granite });

    // ── Podium (B3-7F 현대백화점 + resident parking) ───────────────────────────
    const outline = (inset = 0) => podiumOutline(28, 25, 4, 12, inset);
    prism(site, { points: outline(), h: PODIUM_H, mat: M.limestone });
    prism(site, { points: outline(0.32), h: 1.8, y: 0.8, mat: M.graniteDark }); // base course
    for (let y = 6.6; y < PODIUM_H - 3; y += 4.4) {
      prism(site, { points: outline(0.1), h: 0.3, y, mat: M.granite }); // stone joints
    }
    prism(site, { points: outline(0.45), h: 1.3, y: PODIUM_H - 1.3, mat: M.granite }); // cornice

    // Curved glass corner of the department store (SW), with floor mullion lines.
    const pieH = PODIUM_H - 1.3 - 2.6;
    prism(site, { points: cornerPie(-16, 13, 12.45, Math.PI / 2, Math.PI), h: pieH, y: 2.6, mat: M.glassBlue });
    for (let y = 6.6; y < PODIUM_H - 3; y += 4.4) {
      prism(site, { points: cornerPie(-16, 13, 12.55, Math.PI / 2, Math.PI), h: 0.3, y, mat: M.steelDark });
    }

    // Street-level shopfront glazing (south + west) and the department store entrance canopy.
    box(site, { w: 38, h: 4.6, d: 0.6, x: 4, y: 0.8, z: 25.15, mat: M.glassBlue });
    box(site, { w: 0.6, h: 4.6, d: 32, x: -28.15, y: 0.8, z: -4, mat: M.glassBlue });
    box(site, { w: 16, h: 6.6, d: 0.7, x: -2, y: 0.8, z: 25.2, mat: M.glassBlue });
    box(site, { w: 18, h: 0.5, d: 4.5, x: -2, y: 7.3, z: 27.2, mat: M.steelDark });
    // Residents' lobby canopies: west (101동) and east (102동).
    box(site, { w: 3, h: 0.4, d: 13, x: -29.5, y: 6.4, z: -14, mat: M.steelDark });
    box(site, { w: 0.6, h: 5.6, d: 12, x: 28.15, y: 0.8, z: 13, mat: M.glass });
    box(site, { w: 3, h: 0.4, d: 13, x: 29.5, y: 6.4, z: 13, mat: M.steelDark });

    // ── Roof deck: department store roof garden, lawns, glasshouse (보타닉하우스), plant ───
    box(site, { w: 17, h: 0.3, d: 13, x: -16.5, y: PODIUM_H, z: 13.5, mat: M.grass });
    treePatch(site, { w: 13, d: 9, x: -16.5, y: PODIUM_H + 0.3, z: 14, count: 6, seed: 11, h: 5.5, r: 1.8 });
    box(site, { w: 9, h: 4.2, d: 4.5, x: -16, y: PODIUM_H, z: 3, mat: M.glassWhite });
    box(site, { w: 9.4, h: 0.3, d: 0.6, x: -16, y: PODIUM_H + 4.2, z: 3, mat: M.steelDark });
    box(site, { w: 7, h: 0.3, d: 15, x: -1.5, y: PODIUM_H, z: 14, mat: M.grass });
    [8, 14, 20].forEach((z) => tree(site, { x: -1.5, y: PODIUM_H + 0.3, z, h: 5, r: 1.6 }));
    box(site, { w: 5.5, h: 0.3, d: 6, x: 0.2, y: PODIUM_H, z: -0.8, mat: M.grass });
    [-10, -18].forEach((z) => tree(site, { x: 0.2, y: PODIUM_H + 0.3, z, h: 5, r: 1.6 }));
    box(site, { w: 5, h: 2.6, d: 2.6, x: -23, y: PODIUM_H, z: -2, mat: M.concrete });
    box(site, { w: 3, h: 2.2, d: 2.4, x: -8, y: PODIUM_H, z: 22.5, mat: M.concrete });

    // ── The three towers ───────────────────────────────────────────────────────
    // 101동 (A): 69F, roof ≈ 247 m, spire 256 m - north-west corner, wing towards the courtyard.
    // Its crown is the most pronounced: three setbacks.
    hyperionTower(site, {
      x: -16, z: -16, w: 24, d: 16, bodyTop: 232,
      wing: { w: 13, d: 13, dx: 6.5, dz: 5, top: 218 },
      tiers: [[20, 13, 6], [15, 10, 5], [10.5, 7, 4]], spireTop: 256, belts: [110, 176],
    });
    // 102동 (B): 59F officetel, roof ≈ 225 m - south-east corner.
    hyperionTower(site, {
      x: 16, z: 15, w: 24, d: 16, bodyTop: 214,
      wing: { w: 13, d: 13, dx: -6.5, dz: -5, top: 200 },
      tiers: [[20, 13, 6], [15, 10, 5]], spireTop: 234, belts: [110, 176],
    });
    // 103동 (C): 54F, roof ≈ 190 m - north-east corner, long axis north-south.
    hyperionTower(site, {
      x: 16, z: -14, w: 16, d: 22, bodyTop: 180,
      wing: { w: 12, d: 12, dx: -6.5, dz: 6.5, top: 167 },
      tiers: [[13, 18, 5], [10, 14, 5]], spireTop: 200, belts: [110],
    });

    // Street trees on the sidewalks
    [[-30, -6], [-30, 4], [-8, 27.2], [4, 27.2], [14, 27.2], [30, -4], [30, 4], [-8, -27.2], [2, -27.2], [12, -27.2]]
      .forEach(([x, z], i) => tree(site, { x, y: 0.8, z, h: 6.5 + (i % 3) * 0.6, r: 2 }));

    return g;
  },
};
