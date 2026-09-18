// 태릉국제스케이트장 (Taereung International Skating Rink, 2000) - 노원구
// Korea's only indoor 400 m speed-skating oval, inside 태릉선수촌 at the edge of the royal-tomb forest.
// Signature: a huge flattened-egg roof - a silver metal ellipsoidal dome with radial seams sitting on a
// low white wall band with a continuous dark window strip and a steel ledge. The real oval is ≈ 241 × 123 m
// (long axis E-W, east end turned ~10° south) and 32.7 m tall; here the plan is compressed to ≈ 129 × 71 m
// to fit the 70 m collider while the height stays realistic (28 m). A 2-storey glass entrance block with a
// deep canopy, a granite plaza, parking and a fence face south towards the training centre; pines behind.
import * as THREE from "../vendor/three.module.js";
import { M, box, cyl, dome, strut, tree, subgroup, deg, seededRandom } from "./_helpers.mjs";

const A = 63; // wall band half-axis along the oval (local x)
const B = 34; // wall band half-axis across the oval (local z)
const CZ = -8; // the oval sits slightly north of the origin (the entrance side needs room in the south)
const RIM_Y = 9.6; // top of the wall band / dome eave
const RISE = 18.4; // dome rise above the eave -> top at 28 m
const THETA = Math.PI * 0.42; // partial sphere cap: eave meets the wall with a slope, not vertically

export default {
  id: "taereung-skating",
  name: "태릉국제스케이트장",
  nameEn: "Taereung International Skating Rink",
  district: "노원구",
  lat: 37.6385,
  lon: 127.103,
  height: 28,
  colliderRadius: 70,
  detail: "medium",
  description: "400m 트랙을 덮는 타원형 지붕",
  create() {
    const g = new THREE.Group();
    // Local +x runs along the oval: real long axis points ~10° south of east.
    const b = subgroup(g, { ry: -deg(10) });

    // ── Site base: lawn ellipse, granite apron around the hall ──────────────────────────────
    cyl(b, { rTop: 1, h: 0.2, y: 0, mat: M.grass, seg: 64, sx: 68, sz: 63 });
    cyl(b, { rTop: 1, h: 0.35, z: CZ, mat: M.granite, seg: 72, sx: A + 4, sz: B + 4 });

    // ── Wall band: white base, dark window strip, white upper band, steel ledge ─────────────
    cyl(b, { rTop: 1, h: 3.6, y: 0.35, z: CZ, mat: M.white, seg: 72, sx: A, sz: B });
    cyl(b, { rTop: 1, h: 2.9, y: 3.95, z: CZ, mat: M.glassDark, seg: 72, sx: A - 0.35, sz: B - 0.35 });
    cyl(b, { rTop: 1, h: 2.75, y: 6.85, z: CZ, mat: M.white, seg: 72, sx: A, sz: B });
    cyl(b, { rTop: 1, h: 0.6, y: RIM_Y - 0.6, z: CZ, mat: M.steel, seg: 72, sx: A + 1.5, sz: B + 1.5 });
    // slim white piers across the window strip (structural rhythm of the pipe-truss bays)
    for (let i = 0; i < 36; i += 1) {
      const t = (i / 36) * Math.PI * 2;
      box(b, { w: 0.5, h: 2.9, d: 0.5, x: Math.cos(t) * (A - 0.2), y: 3.95, z: CZ + Math.sin(t) * (B - 0.2), mat: M.white, ry: -t });
    }

    // ── The dome: flattened ellipsoidal cap in silver metal with radial seams ────────────────
    const sinT = Math.sin(THETA);
    const cosT = Math.cos(THETA);
    const sy = RISE / (1 - cosT);
    const sx = (A + 1.5) / sinT;
    const sz = (B + 1.5) / sinT;
    const y0 = RIM_Y - sy * cosT; // sphere centre height
    dome(b, { r: 1, y: y0, z: CZ, mat: M.aluminum, seg: 72, scaleY: sy, theta: THETA, sx, sz });
    const seamPoint = (t, phi) => [sx * 1.003 * Math.sin(t) * Math.cos(phi), y0 + sy * Math.cos(t) + 0.22, CZ + sz * 1.003 * Math.sin(t) * Math.sin(phi)];
    const SEAMS = 24;
    const STEPS = 6;
    for (let k = 0; k < SEAMS; k += 1) {
      const phi = (k / SEAMS) * Math.PI * 2 + Math.PI / SEAMS;
      for (let i = 0; i < STEPS; i += 1) {
        const t1 = 0.16 * Math.PI + ((THETA - 0.16 * Math.PI) * i) / STEPS;
        const t2 = 0.16 * Math.PI + ((THETA - 0.16 * Math.PI) * (i + 1)) / STEPS;
        strut(b, { from: seamPoint(t1, phi), to: seamPoint(t2, phi), r: 0.17, mat: M.steel, seg: 5 });
      }
    }
    // crown: low steel ridge cap with vent strip
    cyl(b, { rTop: 1, h: 0.5, y: RIM_Y + RISE - 0.35, z: CZ, mat: M.steel, seg: 32, sx: 13, sz: 5.5 });
    cyl(b, { rTop: 1, h: 0.35, y: RIM_Y + RISE + 0.1, z: CZ, mat: M.steelDark, seg: 24, sx: 9, sz: 2.4 });

    // ── Entrance block on the south long side: 2 storeys, glass front, deep white canopy ────
    const ez = CZ + B + 5; // block centre (overlaps the oval wall so there is no gap)
    box(b, { w: 38, h: 8.6, d: 14, z: ez, mat: M.white });
    box(b, { w: 38.4, h: 0.5, d: 14.4, y: 8.6, z: ez, mat: M.steelDark });
    box(b, { w: 34, h: 7.6, d: 0.7, y: 0.5, z: ez + 7, mat: M.glass });
    for (let i = 0; i <= 10; i += 1) {
      box(b, { w: 0.3, h: 7.6, d: 0.35, x: -17 + (34 / 10) * i, y: 0.5, z: ez + 7.4, mat: M.steel });
    }
    box(b, { w: 34, h: 0.35, d: 0.4, y: 4.3, z: ez + 7.4, mat: M.steel });
    box(b, { w: 42, h: 0.7, d: 6.5, y: 8.6, z: ez + 10.25, mat: M.white }); // canopy
    box(b, { w: 42.4, h: 0.3, d: 6.9, y: 9.3, z: ez + 10.25, mat: M.steelDark });
    [-16, -5.5, 5.5, 16].forEach((x) => cyl(b, { rTop: 0.35, h: 8.6, x, y: 0.35, z: ez + 12.6, mat: M.steel, seg: 8 }));
    box(b, { w: 10, h: 3.4, d: 2.2, y: 0.5, z: ez + 8.2, mat: M.glassDark }); // vestibule
    box(b, { w: 22, h: 0.25, d: 3, y: 0.35, z: ez + 8.6, mat: M.granite }); // step
    // end-wall emergency exits and the service/plant room at the north side
    [-1, 1].forEach((s) => {
      box(b, { w: 3, h: 3.2, d: 6, x: s * (A - 2), y: 0.35, z: CZ, mat: M.concreteDark });
    });
    box(b, { w: 18, h: 4.2, d: 9, z: CZ - B - 2, mat: M.concrete });
    box(b, { w: 18.4, h: 0.4, d: 9.4, y: 4.2, z: CZ - B - 2, mat: M.steelDark });
    [-5, 0, 5].forEach((x) => cyl(b, { rTop: 0.6, h: 1.6, x, y: 4.6, z: CZ - B - 3, mat: M.steel, seg: 10 }));

    // ── Plaza, driveway, parking and fence to the south ─────────────────────────────────────
    const pz = ez + 13; // plaza starts at the canopy edge
    box(b, { w: 56, h: 0.3, d: 12, z: pz + 6, mat: M.granite }); // plaza (z pz .. pz+12)
    [-22, 22].forEach((x) => box(b, { w: 7, h: 0.4, d: 7, x, y: 0.3, z: pz + 7, mat: M.grassDark })); // planters
    [-22, 22].forEach((x) => tree(b, { x, y: 0.7, z: pz + 7, h: 6, r: 2.2 }));
    box(b, { w: 64, h: 0.28, d: 4, z: pz + 14, mat: M.asphalt }); // driveway
    [-1, 1].forEach((s) => {
      box(b, { w: 26, h: 0.28, d: 12, x: s * 35, z: CZ + B + 9, mat: M.asphalt }); // parking
      for (let i = 0; i < 9; i += 1) {
        box(b, { w: 0.25, h: 0.05, d: 5, x: s * 35 - 11 + i * 2.75, y: 0.28, z: CZ + B + 6, mat: M.white });
      }
    });
    // flagpoles beside the plaza
    [-8, 0, 8].forEach((x) => cyl(b, { rTop: 0.12, h: 11, x, y: 0.3, z: pz + 11, mat: M.steel, seg: 6 }));
    // low fence along the road side
    box(b, { w: 56, h: 1.3, d: 0.12, y: 0.3, z: pz + 18, mat: M.steelDark });
    for (let i = 0; i <= 8; i += 1) {
      box(b, { w: 0.25, h: 1.5, d: 0.25, x: -28 + 7 * i, y: 0.3, z: pz + 18, mat: M.steelDark });
    }

    // ── Pine forest behind (north / north-east) and a few trees at the ends ─────────────────
    const rng = seededRandom(11);
    let planted = 0;
    let guard = 0;
    while (planted < 46 && guard < 600) {
      guard += 1;
      const x = (rng() - 0.5) * 132;
      const z = CZ - 30 - rng() * 34;
      const h = 9 + rng() * 5;
      const r = 2.4 + rng() * 1;
      const inOval = (x / (A + 6)) ** 2 + ((z - CZ) / (B + 6)) ** 2 < 1;
      if (inOval || Math.hypot(x, z) + r > 67.5) continue;
      tree(b, { x, y: 0.2, z, h, r, mat: M.foliage });
      planted += 1;
    }
    [[64, 16], [63, 22], [-64, 15], [-62, 21], [60, 27], [-60, 27]].forEach(([x, z], i) => {
      tree(b, { x, y: 0.2, z: CZ + z, h: 9 + (i % 3), r: 2.6 });
    });

    return g;
  },
};
