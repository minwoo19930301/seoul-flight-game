// 서울과학기술대학교 (Seoul National University of Science and Technology) - 노원구
// Campus heart: 다산관 and 창학관 (1942, former 경성제국대학 이공학부 main hall and classroom hall, registered
// heritage no. 12). Both are 3-storey reinforced-concrete courtyard (ㅁ-shaped) blocks ≈ 91 × 55 m clad in
// red-brown tile with light stone trim, flat parapet roofs and regular rows of tall windows; 다산관 (west)
// carries the campus symbol - an 8-storey central tower over a vehicle-passage entrance. The two blocks lie
// end to end along a WNW-ESE axis (~17°), entrances facing SSW. Compressed to ≈ 0.42 of the real plan so the
// pair fits the 46 m collider; storey heights stay real. Lawn, forecourt road, fountain garden and tree rows.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, prism, tree, subgroup, deg, trianglesToGeometry } from "./_helpers.mjs";

const TILE = material(0x96543f, { roughness: 0.92 }); // scratch-tile facade, red-brown
const TRIM = M.granite;
const BASE = M.graniteDark;
const WIN = M.glassDark;

const rect = (w, d) => [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]];
const ringPrism = (parent, { w, d, wi, di, h, y = 0, mat }) => prism(parent, { points: rect(w, d), holes: [rect(wi, di).slice().reverse()], h, y, mat });

/**
 * One mesh of flat dark window quads on a vertical plane centred at (x, z), facing local +z (rotate with ry).
 * `length` = facade length, `floors` × `storey` = vertical rhythm, windows `w × h` above a `sill`.
 */
function facadeWindows(parent, { x, y, z, ry = 0, length, floors, storey, spacing, w = 1.3, h = 2.3, sill = 0.9, skip = 0, mat = WIN }) {
  const count = Math.max(1, Math.floor((length - 1.2) / spacing));
  const span = (count - 1) * spacing;
  const tris = [];
  for (let f = 0; f < floors; f += 1) {
    const v0 = f * storey + sill;
    for (let i = 0; i < count; i += 1) {
      const u = -span / 2 + i * spacing;
      if (skip && Math.abs(u) < skip) continue;
      const a = [u - w / 2, v0, 0];
      const b = [u + w / 2, v0, 0];
      const c = [u + w / 2, v0 + h, 0];
      const d = [u - w / 2, v0 + h, 0];
      tris.push(a, b, c, a, c, d);
    }
  }
  const mesh = new THREE.Mesh(trianglesToGeometry(tris), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = ry;
  parent.add(mesh);
  return mesh;
}

/** ㅁ-shaped 3-storey block with a projecting central entrance bay on the +z (front) side. */
function courtyardBlock(parent, { x, z, w, d, wing, storey, floors, bay, tower }) {
  const b = subgroup(parent, { x, z });
  const baseH = 0.8;
  const wallH = baseH + storey * floors + 1.1; // parapet above the top floor
  const wi = w - wing * 2;
  const di = d - wing * 2;
  const off = 0.08; // window quads float just off the wall

  const roofY = wallH - 0.9;
  ringPrism(b, { w: w + 0.3, d: d + 0.3, wi: wi - 0.3, di: di - 0.3, h: baseH, mat: BASE });
  ringPrism(b, { w, d, wi, di, h: roofY - baseH, y: baseH, mat: TILE }); // walls up to the roof deck
  ringPrism(b, { w: w - 0.2, d: d - 0.2, wi: wi + 0.2, di: di + 0.2, h: 0.3, y: roofY, mat: M.concreteDark }); // flat roof
  ringPrism(b, { w, d, wi: w - 1, di: d - 1, h: wallH - roofY, y: roofY, mat: TILE }); // outer parapet
  ringPrism(b, { w: wi + 1, d: di + 1, wi, di, h: wallH - roofY, y: roofY, mat: TILE }); // courtyard parapet
  ringPrism(b, { w: w + 0.2, d: d + 0.2, wi: w - 1.1, di: d - 1.1, h: 0.3, y: wallH, mat: TRIM }); // outer coping
  ringPrism(b, { w: wi + 1.1, d: di + 1.1, wi: wi - 0.1, di: di - 0.1, h: 0.3, y: wallH, mat: TRIM }); // courtyard coping
  // stone string courses at the first-floor sill and under the parapet
  [baseH + storey - 0.1, wallH - 1.3].forEach((y) => {
    box(b, { w: w + 0.3, h: 0.3, d: 0.16, y, z: d / 2 + 0.08, mat: TRIM });
    box(b, { w: w + 0.3, h: 0.3, d: 0.16, y, z: -d / 2 - 0.08, mat: TRIM });
    box(b, { w: 0.16, h: 0.3, d, y, x: w / 2 + 0.08, mat: TRIM });
    box(b, { w: 0.16, h: 0.3, d, y, x: -w / 2 - 0.08, mat: TRIM });
  });
  // window rows: outer faces (front skips the entrance bay) and courtyard faces
  const win = { floors, storey, spacing: 3, y: baseH };
  facadeWindows(b, { ...win, x: 0, z: d / 2 + off, length: w, skip: bay / 2 + 0.6 });
  facadeWindows(b, { ...win, x: 0, z: -d / 2 - off, ry: Math.PI, length: w });
  facadeWindows(b, { ...win, x: w / 2 + off, z: 0, ry: Math.PI / 2, length: d });
  facadeWindows(b, { ...win, x: -w / 2 - off, z: 0, ry: -Math.PI / 2, length: d });
  facadeWindows(b, { ...win, x: 0, z: di / 2 - off, ry: Math.PI, length: wi, spacing: 2.8 });
  facadeWindows(b, { ...win, x: 0, z: -di / 2 + off, length: wi, spacing: 2.8 });
  facadeWindows(b, { ...win, x: wi / 2 - off, z: 0, ry: -Math.PI / 2, length: di, spacing: 2.8 });
  facadeWindows(b, { ...win, x: -wi / 2 + off, z: 0, ry: Math.PI / 2, length: di, spacing: 2.8 });

  // central entrance bay, projecting from the front wing
  const proj = 2.6;
  const bayD = wing + proj;
  const bayZ = d / 2 - wing + bayD / 2; // bay spans from the courtyard face to d/2 + proj
  const bayH = tower ? wallH + 3.2 : wallH + 2;
  box(b, { w: bay + 0.3, h: baseH, d: bayD + 0.3, z: bayZ, mat: BASE });
  box(b, { w: bay, h: bayH - baseH, d: bayD, y: baseH, z: bayZ, mat: TILE });
  box(b, { w: bay + 0.2, h: 0.3, d: bayD + 0.2, y: bayH, z: bayZ, mat: TRIM });
  box(b, { w: bay + 0.3, h: 0.35, d: 0.16, y: bayH - 1.4, z: d / 2 + proj + 0.08, mat: TRIM });
  const front = d / 2 + proj;
  // stone portal with pilasters and a dark vehicle passage through to the courtyard
  box(b, { w: 6.4, h: 9.2, d: 0.5, y: baseH, z: front + 0.2, mat: TRIM });
  box(b, { w: 4.2, h: 4.8, d: 0.8, y: baseH, z: front + 0.3, mat: M.black });
  [-2.6, 2.6].forEach((px) => box(b, { w: 0.9, h: 9.6, d: 0.9, x: px, y: baseH, z: front + 0.55, mat: TRIM }));
  box(b, { w: 7.4, h: 0.6, d: 1.2, y: baseH + 9.2, z: front + 0.55, mat: TRIM });
  facadeWindows(b, { x: 0, y: baseH + storey * 2, z: front + off, length: bay, floors: tower ? 2 : 1, storey, spacing: 2.2, w: 1.1, h: 2.6, sill: 1 });
  // entrance steps and forecourt apron
  [0, 1, 2].forEach((i) => box(b, { w: 9 - i * 1.2, h: 0.28, d: 1, y: 0, z: front + 1.3 + i * 0.9, mat: TRIM }));

  if (tower) {
    // 8-storey central tower (former clock tower) rising from the entrance bay
    const tw = 6.6;
    const tH = baseH + storey * 8 + 1.2;
    const tz = front - tw / 2;
    box(b, { w: tw, h: tH - bayH, d: tw, y: bayH, z: tz, mat: TILE });
    box(b, { w: tw + 0.4, h: 0.5, d: tw + 0.4, y: tH - 1.6, z: tz, mat: TRIM });
    box(b, { w: tw + 0.2, h: 0.35, d: tw + 0.2, y: tH, z: tz, mat: TRIM });
    box(b, { w: tw - 0.8, h: 0.25, d: tw - 0.8, y: tH, z: tz, mat: M.concreteDark });
    const slit = { y: bayH + 0.4, floors: 4, storey, spacing: 1.7, w: 0.62, h: 2.5, sill: 0.7, length: tw };
    facadeWindows(b, { ...slit, x: 0, z: front + off });
    facadeWindows(b, { ...slit, x: tw / 2 + off, z: tz, ry: Math.PI / 2 });
    facadeWindows(b, { ...slit, x: -tw / 2 - off, z: tz, ry: -Math.PI / 2 });
    facadeWindows(b, { ...slit, x: 0, z: tz - tw / 2 - off, ry: Math.PI });
    cyl(b, { rTop: 0.1, h: 4, z: tz, y: tH, mat: M.steel, seg: 6 }); // flag mast
    return tH + 4;
  }
  return bayH + 0.3;
}

export default {
  id: "seoultech",
  name: "서울과학기술대학교",
  nameEn: "Seoul National University of Science and Technology",
  district: "노원구",
  lat: 37.6324,
  lon: 127.0792,
  height: 37,
  colliderRadius: 46,
  detail: "low",
  description: "1940년대 붉은 벽돌 다산관·창학관",
  create() {
    const g = new THREE.Group();
    // Local +x follows the buildings' long axis (real axis runs ~17° south of east); +z = the SSW front.
    const s = subgroup(g, { ry: -deg(17) });

    // ── Campus ground: lawn, forecourt paving, front and rear service roads, path in the gap ──
    cyl(s, { rTop: 1, h: 0.2, mat: M.grass, seg: 56, sx: 45.4, sz: 28.5 });
    box(s, { w: 80, h: 0.26, d: 4.5, z: 13.75, mat: M.granite }); // forecourt (z 11.5..16)
    box(s, { w: 80, h: 0.24, d: 4, z: 18, mat: M.asphalt }); // front road (z 16..20)
    box(s, { w: 76, h: 0.24, d: 3.5, z: -15.75, mat: M.asphalt }); // rear road (z -17.5..-14)
    box(s, { w: 4.6, h: 0.26, d: 30, z: -1, mat: M.granite }); // path between the two halls

    // ── 다산관 (west, with the tower) and 창학관 (east) - twin courtyard blocks, end to end ──
    const block = { z: -1, w: 40, d: 25, wing: 7, storey: 3.9, floors: 3, bay: 10 };
    courtyardBlock(s, { ...block, x: -23, tower: true }); // tower top ≈ 37 m
    courtyardBlock(s, { ...block, x: 23, tower: false });

    // ── Fountain garden in front of 다산관, benches in front of 창학관 ─────────────────────
    cyl(s, { rTop: 4.8, h: 0.55, x: -23, z: 25, mat: TRIM, seg: 28 });
    cyl(s, { rTop: 4.2, h: 0.25, x: -23, y: 0.5, z: 25, mat: M.water, seg: 28 });
    cyl(s, { rTop: 0.55, h: 0.8, x: -23, y: 0.55, z: 25, mat: TRIM, seg: 10 });
    cyl(s, { rTop: 0.18, h: 2.6, x: -23, y: 1.3, z: 25, mat: M.white, seg: 6 });
    box(s, { w: 3, h: 0.22, d: 18, x: -23, y: 0.2, z: 30, mat: TRIM }); // walk to the fountain
    box(s, { w: 12, h: 0.22, d: 3, x: 23, y: 0.2, z: 22.5, mat: TRIM });
    [17, 23, 29].forEach((x) => box(s, { w: 1.8, h: 0.45, d: 0.5, x, y: 0.42, z: 22.5, mat: M.hanokWood }));
    // lamp posts along the front road
    [-36, -12, 12, 36].forEach((x) => cyl(s, { rTop: 0.1, h: 5, x, y: 0.26, z: 20.6, mat: M.steelDark, seg: 6 }));

    // ── Tree rows: campus avenue in front, shade trees behind and in the gap ────────────────
    [-34, -9, 0, 9, 34].forEach((x, i) => tree(s, { x, y: 0.2, z: 23, h: 9 + (i % 2) * 1.5, r: 2.8 }));
    [-30, -16, 30, 16].forEach((x, i) => tree(s, { x, y: 0.2, z: 23.5, h: 8.5 + (i % 2), r: 2.5 }));
    [-16, -8, 0, 8, 16].forEach((x, i) => tree(s, { x, y: 0.2, z: -21, h: 8 + (i % 3), r: 2.6 }));
    [[-43, 6], [43, 6], [-43, -8], [43, -8]].forEach(([x, z]) => tree(s, { x, y: 0.2, z, h: 6, r: 1.7 }));

    // ── Newer campus buildings at the rear corners: a glass box and a beige concrete block ────
    box(s, { w: 12, h: 14, d: 8, x: -28, z: -25, mat: M.glass });
    for (let i = 1; i < 4; i += 1) box(s, { w: 12.2, h: 0.4, d: 8.2, x: -28, y: i * 3.5, z: -25, mat: M.steelDark });
    box(s, { w: 11.4, h: 0.5, d: 7.6, x: -28, y: 14, z: -25, mat: M.steelDark });
    box(s, { w: 12, h: 11, d: 8, x: 28, z: -25, mat: M.offWhite });
    box(s, { w: 12.4, h: 0.5, d: 8.4, x: 28, y: 11, z: -25, mat: M.concreteDark });
    facadeWindows(s, { x: 28, y: 0, z: -21 + 0.08, length: 12, floors: 3, storey: 3.6, spacing: 2.4, w: 1.4, h: 1.8, sill: 1.1 });

    return g;
  },
};
