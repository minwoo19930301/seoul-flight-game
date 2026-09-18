// 국회의사당 (National Assembly Building, 1975) - 영등포구
// The main hall (본관) on Yeouido: a monumental rectangular block (real 122 × 81 m; the plan is at
// ~0.78 so the whole site fits its collider, heights are real) on a 5.4 m granite podium with the
// 50 m wide grand stair and vehicle ramps on the front (south-east) side. 24 free-standing octagonal
// granite columns (32.5 m, modelled after 경회루's stone pillars: 8 on each long side plus 4 more on
// each short side) carry a deep flat entablature that projects beyond the recessed dark-glass and
// stone walls. The shallow oxidised-copper dome (base Ø 64 m real, ≈ 20 m rise) sits on a low drum
// in the middle of the roof and tops out at ≈ 69 m. Forecourt with the fountain pool, lawns and tree
// rows; a straight promenade behind the hall towards the Han River.
import * as THREE from "../vendor/three.module.js";
import { M, box, cyl, dome, polygonPrism, tree, subgroup, trianglesToGeometry } from "./_helpers.mjs";

export default {
  id: "national-assembly",
  name: "국회의사당",
  nameEn: "National Assembly Building",
  district: "영등포구",
  lat: 37.5319,
  lon: 126.9142,
  height: 69,
  colliderRadius: 66,
  detail: "high",
  description: "24개 열주와 청록색 돔",
  create() {
    const g = new THREE.Group();
    // Rotated frame: local +z (front / grand stair) faces south-east towards 의사당대로,
    // local -z faces north-west towards the Han River.
    const r = subgroup(g, { ry: Math.PI / 4 });

    // ── Dimensions (plan × 0.78, heights real) ──
    const P = 0.78;
    const SLAB_W = 122 * P; // 95.2 - entablature / roof slab
    const SLAB_D = 81 * P; // 63.2
    const COL_W = SLAB_W - 5.6; // rectangle through the column centres
    const COL_D = SLAB_D - 5.6;
    const WALL_W = COL_W - 10.8; // recessed walls behind the colonnade
    const WALL_D = COL_D - 10.8;
    const POD_W = SLAB_W + 6; // podium (기단)
    const POD_D = SLAB_D + 6;
    const POD_H = 5.4; // 지반 → 기단면 5.44 m
    const COL_H = 32.5;
    const COL_TOP = POD_H + COL_H; // 37.9
    const ENT_H = 6.5;
    const ROOF = COL_TOP + ENT_H; // 44.4
    const FLOOR = COL_H / 6; // 6 storeys behind the columns, 5.42 m each
    const COL_R = 2.15; // octagon circumradius (≈ 4 m across the flats - the real pillars are stout)

    // ── Site: lawn disc (the collider clears real buildings in this circle) ──
    cyl(r, { rTop: 65, h: 0.35, y: -0.3, mat: M.grass, seg: 64 });

    // ── Podium with a dark plinth course and a light stone deck ──
    box(r, { w: POD_W + 0.4, h: 0.6, d: POD_D + 0.4, mat: M.graniteDark });
    box(r, { w: POD_W, h: POD_H - 0.4, d: POD_D, mat: M.granite });
    box(r, { w: POD_W, h: 0.4, d: POD_D, y: POD_H - 0.4, mat: M.limestone });

    // Grand stair on the front (real 50 m wide) and a narrower rear stair
    const stair = (w, dir) => {
      const steps = 9;
      const rise = POD_H / steps;
      const tread = 1.4;
      for (let i = 0; i < steps; i += 1) {
        const d = (steps - i) * tread;
        box(r, { w, h: rise, d, y: i * rise, z: dir * (POD_D / 2 + d / 2), mat: M.granite });
      }
      return steps * tread;
    };
    const stairDepth = stair(40, 1);
    stair(24, -1);
    const footZ = POD_D / 2 + stairDepth; // foot of the grand stair

    // Vehicle ramps flanking the stair: solid granite wedges with an asphalt drive and an outer kerb wall
    const wedge = ({ w, h, len, x, z0, mat }) => {
      const a = [x - w / 2, 0, z0];
      const b = [x + w / 2, 0, z0];
      const c = [x + w / 2, 0, z0 + len];
      const d = [x - w / 2, 0, z0 + len];
      const e = [x - w / 2, h, z0];
      const f = [x + w / 2, h, z0];
      const mesh = new THREE.Mesh(
        trianglesToGeometry([a, f, b, a, e, f, e, d, c, e, c, f, a, b, c, a, c, d, a, d, e, b, f, c]),
        mat,
      );
      r.add(mesh);
      return mesh;
    };
    const RAMP_L = 20;
    const RAMP_X = 25.5;
    const rampAngle = Math.atan(POD_H / RAMP_L);
    const rampSlope = Math.hypot(RAMP_L, POD_H);
    [-1, 1].forEach((s) => {
      wedge({ w: 7.5, h: POD_H, len: RAMP_L, x: s * RAMP_X, z0: POD_D / 2, mat: M.granite });
      box(r, { w: 6, h: 0.3, d: rampSlope, x: s * RAMP_X, y: POD_H / 2 - 0.05, z: POD_D / 2 + RAMP_L / 2, rx: rampAngle, mat: M.asphalt });
      box(r, { w: 0.5, h: 1.3, d: rampSlope, x: s * (RAMP_X + 3.5), y: POD_H / 2 - 0.25, z: POD_D / 2 + RAMP_L / 2, rx: rampAngle, mat: M.granite });
      box(r, { w: 7.5, h: 0.25, d: 3.5, x: s * RAMP_X, z: POD_D / 2 + RAMP_L + 1.75, mat: M.asphalt });
    });

    // ── Forecourt: cross walk at the stair foot, axis walk, fountain pool ──
    box(r, { w: 44, h: 0.3, d: 5, z: footZ + 2.5, mat: M.concrete });
    box(r, { w: 18, h: 0.3, d: 63.5 - footZ, z: (footZ + 63.5) / 2, mat: M.concrete });
    const FZ = 56;
    cyl(r, { rTop: 8.2, h: 1.0, z: FZ, mat: M.granite, seg: 40 });
    cyl(r, { rTop: 7.4, h: 0.12, y: 1.0, z: FZ, mat: M.water, seg: 40 });
    cyl(r, { rTop: 0.5, rBot: 0.7, h: 6.5, y: 1.1, z: FZ, mat: M.white, seg: 8 });
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * Math.PI * 2;
      cyl(r, { rTop: 0.22, rBot: 0.3, h: 2.6, x: Math.cos(a) * 4.2, y: 1.1, z: FZ + Math.sin(a) * 4.2, mat: M.white, seg: 6 });
    }

    // ── Rear promenade towards the river ──
    box(r, { w: 16, h: 0.3, d: 63.5 - footZ, z: -(footZ + 63.5) / 2, mat: M.concrete });

    // ── Trees: rows along the long sides, groups flanking the forecourt and the promenade ──
    const trees = [];
    [-24, -16, -8, 0, 8, 16, 24].forEach((z, i) => {
      trees.push([-54, z, 9 + (i % 3), 3], [54, z, 10 - (i % 3), 3]);
    });
    [[36, 44, 10, 3.2], [34, 50, 9, 2.8], [16, 59, 9, 2.8], [36, -44, 10, 3.2], [28, -54, 9, 2.8], [14, -50, 8, 2.6], [14, -58, 9, 2.8]]
      .forEach(([x, z, h, rad]) => trees.push([x, z, h, rad], [-x, z, h, rad]));
    trees.forEach(([x, z, h, rad]) => tree(r, { x, z, h, r: rad, mat: M.foliage }));

    // ── Recessed walls: granite ground floor, dark glass with granite spandrel bands and piers ──
    const wallBase = POD_H + FLOOR;
    const upperH = COL_TOP - wallBase;
    box(r, { w: WALL_W + 0.7, h: FLOOR, d: WALL_D + 0.7, y: POD_H, mat: M.granite });
    box(r, { w: WALL_W, h: upperH, d: WALL_D, y: wallBase, mat: M.glassDark });
    for (let k = 1; k <= 5; k += 1) {
      box(r, { w: WALL_W + 0.7, h: 1.8, d: WALL_D + 0.7, y: wallBase + k * FLOOR - 1.8, mat: M.granite });
    }
    for (let i = 0; i <= 16; i += 1) {
      const x = -WALL_W / 2 + (WALL_W / 16) * i;
      box(r, { w: 0.6, h: upperH, d: 0.7, x, y: wallBase, z: WALL_D / 2, mat: M.granite });
      box(r, { w: 0.6, h: upperH, d: 0.7, x, y: wallBase, z: -WALL_D / 2, mat: M.granite });
    }
    for (let j = 0; j <= 9; j += 1) {
      const z = -WALL_D / 2 + (WALL_D / 9) * j;
      box(r, { w: 0.7, h: upperH, d: 0.6, x: WALL_W / 2, y: wallBase, z, mat: M.granite });
      box(r, { w: 0.7, h: upperH, d: 0.6, x: -WALL_W / 2, y: wallBase, z, mat: M.granite });
    }
    // Glazed main entrance (two storeys) in the central bay of the front, with a stone portal
    box(r, { w: 12.4, h: FLOOR * 2 + 0.6, d: 1.2, y: POD_H, z: WALL_D / 2 + 0.25, mat: M.limestone });
    box(r, { w: 11, h: FLOOR * 2, d: 1.6, y: POD_H, z: WALL_D / 2 + 0.8, mat: M.glass });

    // ── 24 octagonal granite columns (plinth, shaft, cap) ──
    const column = (x, z) => {
      polygonPrism(r, { sides: 8, r: COL_R + 0.35, h: 0.9, x, y: POD_H, z, mat: M.granite });
      polygonPrism(r, { sides: 8, r: COL_R, h: COL_H - 1.9, x, y: POD_H + 0.9, z, mat: M.limestone });
      polygonPrism(r, { sides: 8, r: COL_R + 0.3, h: 1.0, x, y: COL_TOP - 1.0, z, mat: M.limestone });
    };
    for (let i = 0; i < 8; i += 1) {
      const x = -COL_W / 2 + (COL_W / 7) * i;
      column(x, COL_D / 2);
      column(x, -COL_D / 2);
    }
    for (let j = 1; j <= 4; j += 1) {
      const z = -COL_D / 2 + (COL_D / 5) * j;
      column(COL_W / 2, z);
      column(-COL_W / 2, z);
    }

    // ── Entablature (deep flat slab) with a cornice, roof deck and parapet ──
    box(r, { w: SLAB_W, h: ENT_H - 0.9, d: SLAB_D, y: COL_TOP, mat: M.limestone });
    box(r, { w: SLAB_W + 0.6, h: 0.9, d: SLAB_D + 0.6, y: ROOF - 0.9, mat: M.granite });
    box(r, { w: SLAB_W - 1, h: 0.4, d: SLAB_D - 1, y: ROOF, mat: M.concrete });
    [
      [SLAB_W, 0.5, 0, SLAB_D / 2 - 0.25],
      [SLAB_W, 0.5, 0, -(SLAB_D / 2 - 0.25)],
      [0.5, SLAB_D - 1, SLAB_W / 2 - 0.25, 0],
      [0.5, SLAB_D - 1, -(SLAB_W / 2 - 0.25), 0],
    ].forEach(([w, d, x, z]) => box(r, { w, h: 1.1, d, x, y: ROOF, z, mat: M.limestone }));

    // ── Drum and the shallow oxidised-copper dome (spherical cap, base Ø 64 m real) ──
    const DRUM_R = 26.4;
    const DRUM_H = 3.6;
    const drumY = ROOF + 0.4;
    cyl(r, { rTop: DRUM_R, h: DRUM_H, y: drumY, mat: M.limestone, seg: 56 });
    cyl(r, { rTop: DRUM_R + 0.25, h: 0.5, y: drumY + DRUM_H - 0.5, mat: M.graniteDark, seg: 56 });
    const DOME_R = 25.2;
    const RISE = 17;
    const domeY = drumY + DRUM_H;
    cyl(r, { rTop: DOME_R + 0.4, h: 0.7, y: domeY, mat: M.copperGreen, seg: 56 }); // copper skirt
    // Spherical cap of radius R whose rim (radius DOME_R) sits on the skirt; the sphere centre is R - RISE below it.
    const R = (DOME_R * DOME_R + RISE * RISE) / (2 * RISE);
    dome(r, { r: R, theta: Math.asin(DOME_R / R), y: domeY + 0.7 - (R - RISE), mat: M.copperGreen, seg: 64 });
    // Finial
    const domeTop = domeY + 0.7 + RISE; // 66.1
    cyl(r, { rTop: 0.5, rBot: 0.9, h: 0.6, y: domeTop - 0.1, mat: M.copperGreen, seg: 12 });
    cyl(r, { rTop: 0.1, rBot: 0.4, h: 2.2, y: domeTop + 0.5, mat: M.steel, seg: 8 });

    return g;
  },
};
