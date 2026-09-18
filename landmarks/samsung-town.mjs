// 삼성타운 (Samsung Town, KPF + Samoo, 2008) - 서초구
// Three interlocking dark-glass office towers on a shared landscaped podium at 강남역 / 서초대로:
// C동 Samsung Electronics HQ (44F, 203 m) with its notched crown - the lower, horizontally banded
// slab stops four floors short while the tall slab's glass lantern cantilevers over the notch under
// a white rooftop frame; B동 Samsung C&T (32F, ~152 m) and A동 Samsung Life (34F, ~146 m) with flat
// roofs and small mechanical crowns. Every tower pairs KPF's two curtain-wall systems (vertical fins /
// horizontal spandrels) that mark its interlocking volumes. Site spacing is ~0.5 of real, heights are real.
import * as THREE from "../vendor/three.module.js";
import { M, box, cyl, prism, sphere, tree, treePatch, trianglesToGeometry } from "./_helpers.mjs";

const BASE = 1.2; // top of the plaza deck

// KPF's "two distinct mullion systems": strongly vertical fins vs. deep horizontal spandrels.
const VERTICAL = { bandT: 0.3, bandOut: 0.12, spacing: 1.8, finT: 0.28, finOut: 0.32 };
const HORIZONTAL = { bandT: 1.0, bandOut: 0.35, spacing: 6, finT: 0.25, finOut: 0.12 };

/** Push the 12 triangles of an axis-aligned box (outward winding) into `tris`. */
function pushBox(tris, x0, x1, y0, y1, z0, z1) {
  const quad = (a, b, c, d) => tris.push(a, b, c, a, c, d);
  quad([x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]); // +x
  quad([x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [x0, y0, z0]); // -x
  quad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]); // +y
  quad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]); // -y
  quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]); // +z
  quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]); // -z
}

/**
 * Curtain-wall grid for the volume x0..x1 × z0..z1 standing on y0 with height h: one spandrel ring per
 * floor plus vertical fins on all four faces, merged into a single mesh (one draw, few hundred triangles).
 */
function facadeGrid(parent, { x0, x1, z0, z1, y0, h, floorHeight, bandT, bandOut, spacing, finT, finOut, mat = M.steel }) {
  const tris = [];
  const floors = Math.floor(h / floorHeight + 1e-6);
  for (let i = 1; i <= floors; i += 1) {
    const top = y0 + i * floorHeight;
    pushBox(tris, x0 - bandOut, x1 + bandOut, top - bandT, top, z0 - bandOut, z1 + bandOut);
  }
  if (spacing > 0) {
    const nx = Math.max(1, Math.round((x1 - x0) / spacing));
    for (let i = 0; i <= nx; i += 1) {
      const px = x0 + ((x1 - x0) * i) / nx;
      pushBox(tris, px - finT / 2, px + finT / 2, y0, y0 + h, z1, z1 + finOut); // south face
      pushBox(tris, px - finT / 2, px + finT / 2, y0, y0 + h, z0 - finOut, z0); // north face
    }
    const nz = Math.max(1, Math.round((z1 - z0) / spacing));
    for (let i = 0; i <= nz; i += 1) {
      const pz = z0 + ((z1 - z0) * i) / nz;
      pushBox(tris, x1, x1 + finOut, y0, y0 + h, pz - finT / 2, pz + finT / 2); // east face
      pushBox(tris, x0 - finOut, x0, y0, y0 + h, pz - finT / 2, pz + finT / 2); // west face
    }
  }
  const mesh = new THREE.Mesh(trianglesToGeometry(tris), mat);
  parent.add(mesh);
  return mesh;
}

/** Glass office volume (x0..x1 × z0..z1, base y0, height h) dressed with one of the curtain-wall systems. */
function glassSlab(g, { x0, x1, z0, z1, y0 = BASE, h, floorHeight, system, mat = M.glassDark }) {
  box(g, { w: x1 - x0, h, d: z1 - z0, x: (x0 + x1) / 2, y: y0, z: (z0 + z1) / 2, mat });
  facadeGrid(g, { x0, x1, z0, z1, y0, h, floorHeight, ...system });
}

/** Thin rectangular parapet / edge frame just outside x0..x1 × z0..z1 at height y. */
function parapet(g, { x0, x1, z0, z1, y, h = 0.9, t = 0.35, mat = M.steel }) {
  box(g, { w: x1 - x0 + 2 * t, h, d: t, x: (x0 + x1) / 2, y, z: z1 + t / 2, mat });
  box(g, { w: x1 - x0 + 2 * t, h, d: t, x: (x0 + x1) / 2, y, z: z0 - t / 2, mat });
  box(g, { w: t, h, d: z1 - z0, x: x0 - t / 2, y, z: (z0 + z1) / 2, mat });
  box(g, { w: t, h, d: z1 - z0, x: x1 + t / 2, y, z: (z0 + z1) / 2, mat });
}

/** Open white rooftop frame: corner posts on the rectangle x0..x1 × z0..z1, a top ring beam, louver fins. */
function roofFrame(g, { x0, x1, z0, z1, y0, top, post = 0.7, louvers = 0, mat = M.white }) {
  [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].forEach(([px, pz]) => {
    box(g, { w: post, h: top - y0, d: post, x: px, y: y0, z: pz, mat });
  });
  box(g, { w: x1 - x0 + post, h: post, d: post, x: (x0 + x1) / 2, y: top - post, z: z0, mat });
  box(g, { w: x1 - x0 + post, h: post, d: post, x: (x0 + x1) / 2, y: top - post, z: z1, mat });
  box(g, { w: post, h: post, d: z1 - z0, x: x0, y: top - post, z: (z0 + z1) / 2, mat });
  box(g, { w: post, h: post, d: z1 - z0, x: x1, y: top - post, z: (z0 + z1) / 2, mat });
  for (let i = 1; i <= louvers; i += 1) {
    const px = x0 + ((x1 - x0) * i) / (louvers + 1);
    box(g, { w: 0.3, h: 0.5, d: z1 - z0, x: px, y: top - post - 1.0, z: (z0 + z1) / 2, mat });
  }
}

/** Evenly spaced street trees from `from` to `to` ([x, z]). */
function treeRow(g, { from, to, count, h = 8, r = 2.8 }) {
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0 : i / (count - 1);
    tree(g, { x: from[0] + (to[0] - from[0]) * t, y: BASE, z: from[1] + (to[1] - from[1]) * t, h, r });
  }
}

export default {
  id: "samsung-town",
  name: "삼성타운",
  nameEn: "Samsung Town (Seocho)",
  district: "서초구",
  lat: 37.4966,
  lon: 127.0269,
  height: 203,
  colliderRadius: 48,
  detail: "high",
  description: "서초 삼성전자 사옥 A·B·C 3개 타워",
  create() {
    const g = new THREE.Group();

    // ── Site: granite plaza deck (cross-shaped so the corners stay inside the collider) with a sunken garden.
    prism(g, {
      points: [[-40, -24], [-28, -24], [-28, -34], [32, -34], [32, -24], [36, -24], [36, 26], [32, 26], [32, 32], [-28, 32], [-28, 26], [-40, 26]],
      holes: [[[-14, 5], [-7, 5], [-7, -4], [-14, -4]]],
      h: BASE,
      mat: M.granite,
    });
    // Paving joints across the community plaza
    [-11, -5, 1].forEach((pz) => {
      box(g, { w: 21, h: 0.05, d: 0.4, x: -7.5, y: BASE, z: pz, mat: M.graniteDark });
    });

    // ── C동: Samsung Electronics HQ (44F, 203 m). Tall slab with vertical fins + lower slab with horizontal
    //    spandrels; the lower slab stops four floors short, and the tall slab's lantern overhangs the notch.
    const C = { x: 14, z: 16 };
    const cFh = 4.5;
    const cRoof = BASE + 44 * cFh; // 199.2
    const c2Roof = BASE + 40 * cFh; // 181.2
    const c1 = { x0: C.x - 16, x1: C.x + 16, z0: C.z - 2, z1: C.z + 11 }; // 32 × 13 (south)
    const c2 = { x0: C.x - 12, x1: C.x + 16, z0: C.z - 11, z1: C.z - 1 }; // 28 × 10 (north)
    glassSlab(g, { ...c1, h: cRoof - BASE, floorHeight: cFh, system: VERTICAL });
    glassSlab(g, { ...c2, h: c2Roof - BASE, floorHeight: cFh, system: HORIZONTAL });
    // Louvered reveal where the two curtain-wall systems meet on the east face
    box(g, { w: 0.5, h: c2Roof - BASE, d: 1.2, x: c1.x1 + 0.25, y: BASE, z: c1.z0 + 0.5, mat: M.black });
    // Double-height lobby + entrance canopy on the plaza (west) side
    box(g, { w: 2.5, h: 9, d: c1.z1 - c1.z0, x: c1.x0 - 1.25, y: BASE, z: (c1.z0 + c1.z1) / 2, mat: M.glass });
    box(g, { w: 4.5, h: 0.4, d: c1.z1 - c1.z0 + 2, x: c1.x0 - 2.25, y: BASE + 9, z: (c1.z0 + c1.z1) / 2, mat: M.steel });
    // Crown lantern: top three floors of the west third project 4 m west and 4 m north over the lower slab.
    const lan = { x0: c1.x0 - 4, x1: c1.x0 + 12, z0: c1.z0 - 4, z1: c1.z1 + 1 };
    const lanY0 = cRoof - 3 * cFh;
    const lanY1 = cRoof + 0.3;
    box(g, { w: lan.x1 - lan.x0, h: lanY1 - lanY0, d: lan.z1 - lan.z0, x: (lan.x0 + lan.x1) / 2, y: lanY0, z: (lan.z0 + lan.z1) / 2, mat: M.glass });
    parapet(g, { ...lan, y: lanY0, h: 0.7, t: 0.25, mat: M.white }); // white soffit edge
    parapet(g, { ...lan, y: lanY0 + cFh - 0.15, h: 0.3, t: 0.2, mat: M.white });
    parapet(g, { ...lan, y: lanY0 + 2 * cFh - 0.15, h: 0.3, t: 0.2, mat: M.white });
    [[lan.x0, lan.z0], [lan.x1, lan.z0], [lan.x0, lan.z1], [lan.x1, lan.z1]].forEach(([px, pz]) => {
      box(g, { w: 0.6, h: lanY1 - lanY0, d: 0.6, x: px, y: lanY0, z: pz, mat: M.white });
    });
    // Tall white rooftop frame with louvers - the architectural top at 203 m
    roofFrame(g, { x0: lan.x0 + 0.35, x1: lan.x1 - 0.35, z0: lan.z0 + 0.35, z1: lan.z1 - 0.35, y0: lanY1, top: 203, post: 0.7, louvers: 7 });
    // Roof of the tall slab (east of the lantern): parapet + mechanical penthouse
    box(g, { w: c1.x1 - lan.x1 + 0.35, h: 0.9, d: 0.35, x: (lan.x1 + c1.x1 + 0.35) / 2, y: cRoof, z: c1.z1 + 0.175, mat: M.steel });
    box(g, { w: c1.x1 - lan.x1 + 0.35, h: 0.9, d: 0.35, x: (lan.x1 + c1.x1 + 0.35) / 2, y: cRoof, z: c1.z0 - 0.175, mat: M.steel });
    box(g, { w: 0.35, h: 0.9, d: c1.z1 - c1.z0, x: c1.x1 + 0.175, y: cRoof, z: (c1.z0 + c1.z1) / 2, mat: M.steel });
    box(g, { w: 12, h: 2.8, d: 8, x: 22, y: cRoof, z: C.z + 4.5, mat: M.steelDark });
    // Roof of the lower slab (the notch)
    parapet(g, { ...c2, y: c2Roof, h: 0.9, t: 0.35 });
    box(g, { w: 10, h: 2.4, d: 5, x: 22, y: c2Roof, z: C.z - 6, mat: M.steelDark });

    // ── A동: Samsung Life (34F, ~146 m), north of C across the showroom podium.
    const A = { x: 14, z: -20 };
    const aFh = 4.15;
    const aRoof = BASE + 34 * aFh; // 142.3
    const a1 = { x0: A.x - 13, x1: A.x + 13, z0: A.z - 3, z1: A.z + 8 }; // 26 × 11 (south)
    const a2 = { x0: A.x - 13, x1: A.x + 9, z0: A.z - 9, z1: A.z - 2 }; // 22 × 7 (north)
    glassSlab(g, { ...a1, h: aRoof - BASE, floorHeight: aFh, system: VERTICAL });
    glassSlab(g, { ...a2, h: aRoof - aFh - BASE, floorHeight: aFh, system: HORIZONTAL });
    box(g, { w: 0.5, h: aRoof - aFh - BASE, d: 1.2, x: a1.x0 - 0.25, y: BASE, z: a1.z0 + 0.5, mat: M.black });
    parapet(g, { ...a1, y: aRoof });
    parapet(g, { ...a2, y: aRoof - aFh });
    box(g, { w: 14, h: 2.8, d: 8, x: 17, y: aRoof, z: A.z + 2.5, mat: M.steelDark });
    roofFrame(g, { x0: 9.5, x1: 24.5, z0: A.z - 2, z1: A.z + 7, y0: aRoof, top: aRoof + 3.6, post: 0.5, louvers: 5 });

    // ── B동: Samsung C&T (32F, ~152 m), west of the plaza with its long side along 서초대로74길.
    const B = { x: -26, z: -4 };
    const bFh = 4.6;
    const bRoof = BASE + 32 * bFh; // 148.4
    const b1 = { x0: B.x - 9, x1: B.x + 2, z0: B.z - 13, z1: B.z + 13 }; // 11 × 26 (west)
    const b2 = { x0: B.x + 1, x1: B.x + 9, z0: B.z - 8, z1: B.z + 13 }; // 8 × 21 (east, faces the plaza)
    glassSlab(g, { ...b1, h: bRoof - BASE, floorHeight: bFh, system: VERTICAL });
    glassSlab(g, { ...b2, h: bRoof - bFh - BASE, floorHeight: bFh, system: HORIZONTAL });
    box(g, { w: 1.2, h: bRoof - bFh - BASE, d: 0.5, x: b1.x1 - 0.5, y: BASE, z: b1.z1 + 0.25, mat: M.black });
    parapet(g, { ...b1, y: bRoof });
    parapet(g, { ...b2, y: bRoof - bFh });
    box(g, { w: 8, h: 2.8, d: 16, x: -29.5, y: bRoof, z: B.z - 4, mat: M.steelDark });
    roofFrame(g, { x0: -34, x1: -25, z0: B.z - 8.5, z1: B.z + 0.5, y0: bRoof, top: bRoof + 3.6, post: 0.5, louvers: 4 });
    // Plaza-side entrance canopy of B
    box(g, { w: 5, h: 0.4, d: 10, x: b2.x1 + 2.5, y: BASE + 5.5, z: -2, mat: M.steel });

    // ── Podium 1: Samsung d'light showroom / dining block linking A and C (3 storeys) with a roof garden.
    const p1 = { x0: 2, x1: 30, z0: -13, z1: 6 };
    box(g, { w: p1.x1 - p1.x0, h: 12, d: p1.z1 - p1.z0, x: (p1.x0 + p1.x1) / 2, y: BASE, z: (p1.z0 + p1.z1) / 2, mat: M.glass });
    facadeGrid(g, { ...p1, y0: BASE, h: 12, floorHeight: 4, bandT: 0.5, bandOut: 0.25, spacing: 3, finT: 0.25, finOut: 0.2 });
    box(g, { w: p1.x1 - p1.x0 + 0.4, h: 0.5, d: p1.z1 - p1.z0 + 0.4, x: (p1.x0 + p1.x1) / 2, y: BASE + 12, z: (p1.z0 + p1.z1) / 2, mat: M.white });
    // Samsung Plaza roof garden: rusticated stone planters, lawn and small trees
    box(g, { w: 20, h: 0.9, d: 0.6, x: 16, y: BASE + 12.5, z: -5.2, mat: M.graniteDark });
    box(g, { w: 20, h: 0.3, d: 5, x: 16, y: BASE + 12.5, z: -8, mat: M.grass });
    box(g, { w: 10, h: 0.3, d: 4, x: 23, y: BASE + 12.5, z: 1.5, mat: M.grass });
    [[7, -8], [12, -8.5], [17, -7.5], [22, -8], [22, 1.5], [26, 1.5]].forEach(([px, pz]) => {
      tree(g, { x: px, y: BASE + 12.8, z: pz, h: 5, r: 1.8 });
    });
    // Large glass canopy over the plaza entrance
    box(g, { w: 9, h: 0.35, d: 9, x: -2.5, y: BASE + 8, z: 0.5, mat: M.glassWhite });
    parapet(g, { x0: -7, x1: 2, z0: -4, z1: 5, y: BASE + 7.9, h: 0.55, t: 0.3 });
    [[-5.5, -2.5], [-5.5, 3.5]].forEach(([px, pz]) => {
      cyl(g, { rTop: 0.3, h: 8, x: px, y: BASE, z: pz, mat: M.steel, seg: 8 });
    });

    // ── Podium 2: low glass block north of B (Samsung C&T annex) facing the corporate park.
    const p2 = { x0: -35, x1: -17, z0: -28, z1: -16 };
    box(g, { w: p2.x1 - p2.x0, h: 8, d: p2.z1 - p2.z0, x: (p2.x0 + p2.x1) / 2, y: BASE, z: (p2.z0 + p2.z1) / 2, mat: M.glass });
    facadeGrid(g, { ...p2, y0: BASE, h: 8, floorHeight: 4, bandT: 0.5, bandOut: 0.25, spacing: 3, finT: 0.25, finOut: 0.2 });
    box(g, { w: p2.x1 - p2.x0 + 0.4, h: 0.5, d: p2.z1 - p2.z0 + 0.4, x: (p2.x0 + p2.x1) / 2, y: BASE + 8, z: (p2.z0 + p2.z1) / 2, mat: M.white });
    box(g, { w: 12, h: 0.3, d: 8, x: -26, y: BASE + 8.5, z: -21.5, mat: M.grass });

    // ── Community plaza: sunken water garden, two water strips, rows of trees.
    box(g, { w: 7, h: 0.15, d: 9, x: -10.5, y: 0, z: 0.5, mat: M.grass });
    tree(g, { x: -10.5, y: 0.15, z: 0.5, h: 9, r: 3 });
    sphere(g, { r: 0.7, x: -12.5, y: 0.15, z: -2.5, mat: M.rock, seg: 6 });
    sphere(g, { r: 0.55, x: -8.6, y: 0.15, z: 3.4, mat: M.rock, seg: 6 });
    box(g, { w: 14, h: 0.25, d: 1.4, x: -9, y: BASE - 0.1, z: -9.9, mat: M.water });
    box(g, { w: 14, h: 0.25, d: 1.4, x: -9, y: BASE - 0.1, z: -7.1, mat: M.water });
    treeRow(g, { from: [-13.5, 9.5], to: [-4.5, 9.5], count: 4, h: 6.5, r: 2.2 });

    // ── Corporate park between A and B, and the garden south-west of C.
    box(g, { w: 18, h: 0.2, d: 15, x: -8, y: BASE, z: -21.5, mat: M.grass });
    treePatch(g, { w: 10, d: 10, x: -8.5, y: BASE + 0.2, z: -21.5, count: 8, seed: 3, h: 9, r: 3 });
    box(g, { w: 14, h: 0.2, d: 20, x: -10.5, y: BASE, z: 19.5, mat: M.grass });
    treePatch(g, { w: 8, d: 15, x: -11.5, y: BASE + 0.2, z: 20, count: 7, seed: 11, h: 9, r: 3 });

    // ── Street trees around the block.
    treeRow(g, { from: [-38, -19], to: [-38, 21], count: 8 });
    treeRow(g, { from: [-24, -32.3], to: [28, -32.3], count: 9 });
    treeRow(g, { from: [-24, 30.5], to: [28, 30.5], count: 10 });
    treeRow(g, { from: [34.5, -20], to: [34.5, 23], count: 8 });

    return g;
  },
};
