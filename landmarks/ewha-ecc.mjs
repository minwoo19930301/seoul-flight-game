// 이화여대 ECC (Ewha Campus Complex, Dominique Perrault 2008) + 파이퍼홀 (Pfeiffer Hall 1935) - 서대문구
// The site is modelled at ≈0.45 × its real footprint so it fits the 50-unit collider (heights ≈0.6-0.7 × real
// to keep the proportions): a grass campus hill rising toward the north (upper campus at +12) with the
// long sunken "campus valley" cut straight through it from the main gate (south). Both sides of the cut
// are sheer glass curtain walls with a fine grid of polished stainless-steel fins (6 storeys below grade);
// the granite-paved floor ramps gently down toward the north, where the monumental amphitheatre staircase
// climbs back out. On the hill above stands Pfeiffer Hall: a Collegiate (Tudor) Gothic white-granite hall
// with a battlemented central tower, steep slate gables and stone-mullioned windows, flanked by two smaller
// Gothic halls and trees. A simple modern gate with low granite walls closes the south end.
import * as THREE from "../vendor/three.module.js";
import { M, box, cone, gableRoof, slab, strut, tree, seededRandom, trianglesToGeometry } from "./_helpers.mjs";

// ── Site layout (+x east, -z north, y up) ────────────────────────────────────
const W = 6; // half-width of the valley floor
const R_EDGE = 49.4; // perimeter of the campus mound
const R_FULL = 40; // inside this radius the mound has its full height
const TOP = 12; // upper-campus level (lawn at the north end of the valley)
const MOUTH = 2.6; // lawn height above the paving at the south mouth of the valley
const Z_S = 41; // south mouth of the valley (glass walls start)
const Z_N = -13; // foot of the grand staircase
const Z_TOP = -29; // top of the grand staircase
const Z_GATE = 46.5; // south end of the gate plaza
const FLOOR_S = 0.35; // paving level at the mouth (street level)
const FLOOR_N = 0.05; // paving level at the foot of the stairs (the ramp descends northward)

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (t) => Math.min(1, Math.max(0, t));

/** Lawn height along the valley rim before the perimeter fall-off: rises from the gate to the upper campus. */
function rimTop(z) {
  if (z <= Z_N) return TOP;
  if (z <= Z_S) return lerp(TOP, MOUTH, (z - Z_N) / (Z_S - Z_N));
  return lerp(MOUTH, 0, clamp01((z - Z_S) / (Z_GATE - Z_S)));
}

/** 1 on the plateau, easing to 0 at the mound perimeter. */
function falloff(r) {
  if (r <= R_FULL) return 1;
  if (r >= R_EDGE) return 0;
  return 0.5 + 0.5 * Math.cos((Math.PI * (r - R_FULL)) / (R_EDGE - R_FULL));
}

/** Lawn surface height (the mound sinks to -0.3 at its perimeter so the edge is buried). */
function ground(x, z) {
  const f = falloff(Math.hypot(x, z));
  return rimTop(z) * f - 0.3 * (1 - f);
}

/** Valley paving height: a gentle ramp from the gate down to the foot of the stairs. */
function floorY(z) {
  return lerp(FLOOR_N, FLOOR_S, clamp01((z - Z_N) / (Z_S - Z_N)));
}

function samples(a, b, step) {
  const n = Math.max(1, Math.round(Math.abs(b - a) / step));
  return Array.from({ length: n + 1 }, (_, i) => lerp(a, b, i / n));
}

function joinSamples(...runs) {
  const out = [];
  runs.forEach((run) => run.forEach((v) => {
    if (!out.length || Math.abs(out[out.length - 1] - v) > 1e-6) out.push(v);
  }));
  return out;
}

/** Push the 12 triangles of an axis-aligned, bottom-anchored box into `tris` (outward-facing). */
function pushBox(tris, { w, h, d, x = 0, y = 0, z = 0 }) {
  const x0 = x - w / 2;
  const x1 = x + w / 2;
  const y0 = y;
  const y1 = y + h;
  const z0 = z - d / 2;
  const z1 = z + d / 2;
  tris.push(
    [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y0, z0], [x0, y1, z1], [x0, y1, z0], // -x
    [x1, y0, z0], [x1, y1, z1], [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], // +x
    [x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x0, y1, z0], [x1, y1, z1], [x1, y1, z0], // top
    [x0, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], // bottom
    [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y0, z1], [x1, y1, z1], [x0, y1, z1], // +z
    [x0, y0, z0], [x1, y1, z0], [x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], // -z
  );
}

/** Smooth-shaded lawn heightfield over the xs × zs grid; `include(x0, x1, z0, z1)` filters cells. */
function lawnMesh(parent, { xs, zs, include, mat }) {
  const cols = xs.length;
  const positions = new Float32Array(cols * zs.length * 3);
  zs.forEach((z0, j) => xs.forEach((x0, i) => {
    let x = x0;
    let z = z0;
    const r = Math.hypot(x, z);
    if (r > R_EDGE) {
      x *= R_EDGE / r;
      z *= R_EDGE / r;
    }
    positions.set([x, ground(x, z), z], (j * cols + i) * 3);
  }));
  const indices = [];
  for (let j = 0; j < zs.length - 1; j += 1) {
    for (let i = 0; i < cols - 1; i += 1) {
      if (!include(xs[i], xs[i + 1], zs[j], zs[j + 1])) continue;
      const a = j * cols + i;
      const b = a + 1;
      const d = a + cols;
      const c = d + 1;
      indices.push(a, d, c, a, c, b);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, mat);
  parent.add(mesh);
  return mesh;
}

/** Vertical wall in the plane x = const between the z samples; `facing` = ±1 is the side the visible face points to. */
function wallStrip(parent, { x, zs, base, top, facing, mat }) {
  const tris = [];
  for (let i = 0; i < zs.length - 1; i += 1) {
    const z0 = zs[i];
    const z1 = zs[i + 1];
    const p0 = [x, base(z0), z0];
    const p1 = [x, base(z1), z1];
    const q0 = [x, top(z0), z0];
    const q1 = [x, top(z1), z1];
    if (facing < 0) tris.push(p0, p1, q1, p0, q1, q0);
    else tris.push(p0, q1, p1, p0, q0, q1);
  }
  const mesh = new THREE.Mesh(trianglesToGeometry(tris), mat);
  parent.add(mesh);
  return mesh;
}

/** Thin upward-facing patch draped over `height(x, z)` (paths, coping, paving) between two corners. */
function drape(parent, { x0, x1, z0, z1, height, lift = 0.08, step = 2, mat }) {
  const xs = samples(Math.min(x0, x1), Math.max(x0, x1), step);
  const zs = samples(Math.min(z0, z1), Math.max(z0, z1), step);
  const P = (x, z) => [x, height(x, z) + lift, z];
  const tris = [];
  for (let j = 0; j < zs.length - 1; j += 1) {
    for (let i = 0; i < xs.length - 1; i += 1) {
      const A = P(xs[i], zs[j]);
      const B = P(xs[i + 1], zs[j]);
      const C = P(xs[i + 1], zs[j + 1]);
      const D = P(xs[i], zs[j + 1]);
      tris.push(A, D, C, A, C, B);
    }
  }
  const mesh = new THREE.Mesh(trianglesToGeometry(tris), mat);
  parent.add(mesh);
  return mesh;
}

/** Tudor square-headed opening: dark glass with thin stone mullions. `n` = outward face normal ([0,1] = south). */
function tudorWindow(add, { x, y, z, w = 1, h = 1.5, n = [0, 1], mullions = 1 }) {
  const [nx, nz] = n;
  const thin = 0.14;
  add({ w: nz ? w : thin, h, d: nz ? thin : w, x: x + nx * 0.04, y, z: z + nz * 0.04, mat: M.glassDark });
  for (let i = 1; i <= mullions; i += 1) {
    const off = -w / 2 + (w / (mullions + 1)) * i;
    add({
      w: nz ? 0.1 : 0.2, h, d: nz ? 0.2 : 0.1,
      x: x + nx * 0.06 + (nz ? off : 0), y, z: z + nz * 0.06 + (nx ? off : 0), mat: M.limestone,
    });
  }
}

/** Smaller Collegiate-Gothic stone hall: buried plinth, buttressed body, slate gable, end tower with parapet. */
function gothicHall(parent, add, { x, z, w, d, wallH, roofH, base, towerX }) {
  add({ w: w + 1.6, h: base - 0.15, d: d + 1.6, x, y: 0, z, mat: M.graniteDark });
  add({ w: w + 1.6, h: 0.15, d: d + 1.6, x, y: base - 0.15, z, mat: M.granite });
  add({ w, h: wallH, d, x, y: base, z, mat: M.limestone });
  add({ w: w + 0.3, h: 0.16, d: d + 0.3, x, y: base + 2.8, z, mat: M.granite });
  gableRoof(parent, { w, d, h: roofH, x, y: base + wallH, z, overhang: 0.3, mat: M.roofTile });
  const bays = Math.max(3, Math.floor(w / 2.4));
  for (let i = 0; i <= bays; i += 1) {
    const bx = x - w / 2 + (w / bays) * i;
    [-1, 1].forEach((s) => add({ w: 0.5, h: wallH - 0.6, d: 0.5, x: bx, y: base, z: z + s * (d / 2 + 0.1), mat: M.granite }));
  }
  for (let i = 0; i < bays; i += 1) {
    const wx = x - w / 2 + (w / bays) * (i + 0.5);
    for (let s = 0; s < 2; s += 1) {
      [-1, 1].forEach((sgn) => tudorWindow(add, { x: wx, y: base + s * 2.8 + 0.7, z: z + sgn * (d / 2), w: 1.0, h: 1.5, n: [0, sgn] }));
    }
  }
  // Squat end tower with a crenellated parapet, at the end that faces the valley.
  const tw = 3.4;
  const td = d + 0.8;
  const th = wallH + 3.4;
  add({ w: tw, h: th, d: td, x: towerX, y: base, z, mat: M.limestone });
  add({ w: tw + 0.3, h: 0.5, d: td + 0.3, x: towerX, y: base + th, z, mat: M.granite });
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    add({ w: 0.6, h: th + 1.1, d: 0.6, x: towerX + sx * (tw / 2 - 0.3), y: base, z: z + sz * (td / 2 - 0.3), mat: M.granite });
  });
  tudorWindow(add, { x: towerX, y: base + wallH + 0.9, z: z + td / 2, w: 1.2, h: 1.6, n: [0, 1] });
  tudorWindow(add, { x: towerX, y: base + 0.6, z: z + td / 2, w: 1.4, h: 2.4, n: [0, 1], mullions: 0 });
}

export default {
  id: "ewha-ecc",
  name: "이화여대 ECC",
  nameEn: "Ewha Campus Complex",
  district: "서대문구",
  lat: 37.5621,
  lon: 126.9463,
  height: 30,
  colliderRadius: 50,
  detail: "high",
  description: "도미니크 페로의 지하 유리 계곡과 언덕 위 파이퍼홀",
  create() {
    const g = new THREE.Group();
    // Small axis-aligned boxes are collected per material and emitted as one mesh each (keeps build time low).
    const buckets = new Map();
    const add = ({ mat = M.concrete, ...dims }) => {
      if (!buckets.has(mat)) buckets.set(mat, []);
      pushBox(buckets.get(mat), dims);
    };

    // ── Campus mound: a grass heightfield with the valley, stairs and gate plaza cut out ──
    const zs = joinSamples(
      samples(-R_EDGE, Z_TOP, 2), samples(Z_TOP, Z_N, 2), samples(Z_N, Z_S, 2),
      samples(Z_S, Z_GATE, 1.9), samples(Z_GATE, R_EDGE, 1.5),
    );
    const xs = joinSamples(samples(-R_EDGE, -W, 2), samples(W, R_EDGE, 2));
    const include = (x0, x1, z0, z1) => {
      if (x0 < 0 && x1 > 0 && z1 > Z_TOP + 1e-6 && z0 < Z_GATE - 1e-6) return false; // the cut
      return [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].some(([x, z]) => Math.hypot(x, z) < R_EDGE - 1e-6);
    };
    lawnMesh(g, { xs, zs, include, mat: M.grass });

    // ── Valley floor (granite ramp) and the gate plaza ──
    drape(g, { x0: -W - 0.3, x1: W + 0.3, z0: Z_N, z1: Z_S, height: (x, z) => floorY(z), lift: 0, mat: M.granite });
    slab(g, { w: 24, d: 6.6, x: 0, y: FLOOR_S - 0.4, z: 44, h: 0.4, mat: M.granite });

    // ── The two glass cliffs ──
    const wallZs = zs.filter((z) => z >= Z_TOP - 1e-6 && z <= Z_S + 1e-6);
    const skirtZs = zs.filter((z) => z >= Z_S - 1e-6 && z <= Z_GATE + 1e-6);
    [-1, 1].forEach((side) => {
      const x = side * W;
      const rim = (z) => ground(x, z);
      wallStrip(g, { x, zs: wallZs, base: (z) => floorY(z) - 0.4, top: rim, facing: -side, mat: M.glass });
      // Low granite retaining walls carry the valley sides on past the mouth to the gate.
      wallStrip(g, { x, zs: skirtZs, base: () => -0.3, top: rim, facing: -side, mat: M.graniteDark });
      // Polished stainless-steel fins standing proud of the glass (real spacing ≈ 1.33 m).
      for (let z = Z_TOP + 0.33; z < Z_S; z += 0.66) {
        const y0 = floorY(z) - 0.3;
        add({ w: 0.16, h: rim(z) - y0, d: 0.16, x: x - side * 0.2, y: y0, z, mat: M.steel });
      }
      // Floor slabs reading through the glass: one line per below-grade storey.
      for (let k = 1; k <= 5; k += 1) {
        const level = FLOOR_N + 2.0 * k;
        const zEnd = Math.min(Z_S, Z_N + (Z_S - Z_N) * ((TOP - level - 0.6) / (TOP - MOUTH)));
        if (zEnd - Z_TOP < 1) continue;
        add({ w: 0.08, h: 0.16, d: zEnd - Z_TOP, x: x - side * 0.06, y: level, z: (zEnd + Z_TOP) / 2, mat: M.steelDark });
      }
      // Entrances at paving level along the wall.
      [32, 22, 12, 2, -8].forEach((z) => {
        add({ w: 0.1, h: 2.2, d: 1.8, x: x - side * 0.05, y: floorY(z) + 0.02, z, mat: M.glassDark });
      });
      // Steel coping on the rim, the granite promenade behind it and a thin handrail.
      drape(g, { x0: side * (W - 0.15), x1: side * (W + 0.15), z0: Z_TOP, z1: Z_S, height: ground, lift: 0.04, mat: M.steel });
      drape(g, { x0: side * (W + 0.15), x1: side * (W + 2), z0: Z_TOP, z1: Z_S, height: ground, lift: 0.08, mat: M.granite });
      const px = side * (W + 0.35);
      const postZs = samples(Z_TOP + 0.2, Z_S - 0.2, 2.75);
      postZs.forEach((z) => add({ w: 0.09, h: 1.0, d: 0.09, x: px, y: ground(px, z), z, mat: M.steel }));
      for (let i = 0; i < postZs.length - 1; i += 1) {
        strut(g, {
          from: [px, ground(px, postZs[i]) + 1.0, postZs[i]],
          to: [px, ground(px, postZs[i + 1]) + 1.0, postZs[i + 1]],
          r: 0.06, seg: 6, mat: M.steel,
        });
      }
      // Roof-garden paths leading away from the rim, and a linear skylight slit in the lawn.
      [14, -4].forEach((z) => drape(g, { x0: side * (W + 2), x1: side * 26, z0: z - 0.6, z1: z + 0.6, height: ground, lift: 0.08, mat: M.granite }));
      drape(g, { x0: side * 12.5, x1: side * 13.3, z0: -8, z1: 30, height: ground, lift: 0.06, mat: M.glassDark });
    });

    // ── Grand amphitheatre staircase climbing out of the valley (two flights and a landing) ──
    const stepsPerFlight = 12;
    const landing = 1.6;
    const stepRise = (TOP - FLOOR_N) / (2 * stepsPerFlight);
    const stepRun = (Z_N - Z_TOP - landing) / (2 * stepsPerFlight);
    const stairBase = FLOOR_N - 0.4;
    let zc = Z_N;
    let yc = FLOOR_N;
    for (let flight = 0; flight < 2; flight += 1) {
      for (let i = 0; i < stepsPerFlight; i += 1) {
        yc += stepRise;
        add({ w: 2 * W + 0.2, h: yc - stairBase, d: stepRun + 0.02, x: 0, y: stairBase, z: zc - stepRun / 2, mat: M.granite });
        zc -= stepRun;
      }
      if (flight === 0) {
        add({ w: 2 * W + 0.2, h: yc - stairBase, d: landing, x: 0, y: stairBase, z: zc - landing / 2, mat: M.granite });
        zc -= landing;
      }
    }
    // Paved terrace at the top of the stairs, leading to Pfeiffer Hall.
    slab(g, { w: 2 * (W + 2), d: 3.8, x: 0, y: TOP, z: Z_TOP - 1.9, h: 0.12, mat: M.granite });

    // ── 파이퍼홀 (Pfeiffer Hall, 1935): Tudor Collegiate Gothic, white granite ──
    const T = TOP + 0.45; // terrace level
    const PZ = -38; // centre line of the main body (front face at z = -34)
    const wallH = 8.4; // three storeys
    // Terrace plinth: buried in the hill, emerging as a granite retaining wall where the ground falls away behind.
    add({ w: 32, h: T - 0.15, d: 10, x: 0, y: 0, z: PZ + 0.5, mat: M.graniteDark });
    add({ w: 32, h: 0.15, d: 10, x: 0, y: T - 0.15, z: PZ + 0.5, mat: M.granite });
    // Main body with string courses and a steep slate gable roof.
    add({ w: 30, h: wallH, d: 8, x: 0, y: T, z: PZ, mat: M.limestone });
    [2.8, 5.6].forEach((h) => add({ w: 30.3, h: 0.18, d: 8.3, x: 0, y: T + h, z: PZ, mat: M.granite }));
    gableRoof(g, { w: 30, d: 8, h: 4, x: 0, y: T + wallH, z: PZ, overhang: 0.35, mat: M.roofTile });
    // Gabled end pavilions and cross-gabled bays on the wings.
    [-13.6, -8.4, 8.4, 13.6].forEach((bx) => {
      const end = Math.abs(bx) > 12;
      const bw = end ? 3.6 : 3.2;
      const bd = end ? 9.2 : 8.8;
      const bh = end ? wallH + 0.5 : wallH;
      add({ w: bw, h: bh, d: bd, x: bx, y: T, z: PZ, mat: M.limestone });
      gableRoof(g, { w: bd, d: bw, h: end ? 3.8 : 3.6, x: bx, y: T + bh, z: PZ, overhang: 0.3, ry: Math.PI / 2, mat: M.roofTile });
    });
    // Square-headed Tudor openings with stone mullions, three storeys, both long faces.
    const columns = [[4.4, 0, 1], [5.85, 0, 1], [8.4, 0.4, 2], [10.9, 0, 1], [13.6, 0.6, 1]]; // [x, face offset, mullions]
    for (let s = 0; s < 3; s += 1) {
      const wy = T + s * 2.8 + 0.7;
      columns.forEach(([cx, off, mull]) => [-1, 1].forEach((sx) => [-1, 1].forEach((face) => {
        tudorWindow(add, { x: sx * cx, y: wy, z: PZ + face * (4 + off), w: mull > 1 ? 1.6 : 1.0, h: 1.5, n: [0, face], mullions: mull });
      })));
    }
    // Rear bay projection at the centre of the north face.
    add({ w: 3.2, h: 5.6, d: 1.2, x: 0, y: T, z: PZ - 4.6, mat: M.limestone });
    [0.7, 3.5].forEach((wy) => tudorWindow(add, { x: 0, y: T + wy, z: PZ - 5.2, w: 2.2, h: 1.5, n: [0, -1], mullions: 2 }));
    // Chimneys on the ridge.
    [-6, 6].forEach((cx) => add({ w: 0.8, h: 1.6, d: 0.8, x: cx, y: T + wallH + 2.6, z: PZ - 1.2, mat: M.granite }));

    // Central entrance tower: buttressed corners, pinnacles, crenellated parapet, low slate cap and the cross.
    const TW = 6.4;
    const TD = 6.2;
    const TZ = PZ + 4 + 1.6 - TD / 2; // front face 1.6 ahead of the wings
    const towerH = 14.4;
    const fz = TZ + TD / 2; // south face
    add({ w: TW, h: towerH, d: TD, x: 0, y: T, z: TZ, mat: M.limestone });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      const bx = sx * (TW / 2 - 0.4);
      const bz = TZ + sz * (TD / 2 - 0.4);
      add({ w: 0.9, h: towerH + 1.1, d: 0.9, x: bx, y: T, z: bz, mat: M.granite });
      cone(g, { r: 0.64, h: 0.9, x: bx, y: T + towerH + 1.1, z: bz, seg: 4, ry: Math.PI / 4, mat: M.granite });
    });
    const pTop = T + towerH;
    add({ w: TW, h: 0.7, d: 0.35, x: 0, y: pTop, z: TZ + TD / 2 - 0.175, mat: M.granite });
    add({ w: TW, h: 0.7, d: 0.35, x: 0, y: pTop, z: TZ - TD / 2 + 0.175, mat: M.granite });
    add({ w: 0.35, h: 0.7, d: TD, x: TW / 2 - 0.175, y: pTop, z: TZ, mat: M.granite });
    add({ w: 0.35, h: 0.7, d: TD, x: -TW / 2 + 0.175, y: pTop, z: TZ, mat: M.granite });
    [-1.8, -0.6, 0.6, 1.8].forEach((o) => {
      add({ w: 0.55, h: 0.5, d: 0.4, x: o, y: pTop + 0.7, z: TZ + TD / 2 - 0.2, mat: M.granite });
      add({ w: 0.55, h: 0.5, d: 0.4, x: o, y: pTop + 0.7, z: TZ - TD / 2 + 0.2, mat: M.granite });
      add({ w: 0.4, h: 0.5, d: 0.55, x: TW / 2 - 0.2, y: pTop + 0.7, z: TZ + o, mat: M.granite });
      add({ w: 0.4, h: 0.5, d: 0.55, x: -TW / 2 + 0.2, y: pTop + 0.7, z: TZ + o, mat: M.granite });
    });
    cone(g, { r: 3.4, h: 1.6, x: 0, y: pTop, z: TZ, seg: 4, ry: Math.PI / 4, mat: M.roofTile });
    add({ w: 0.18, h: 2.2, d: 0.18, x: 0, y: pTop + 1.4, z: TZ, mat: M.white });
    add({ w: 1.1, h: 0.18, d: 0.18, x: 0, y: pTop + 2.7, z: TZ, mat: M.white });
    // Pointed-arch entrance (granite surround, dark doorway) - the one true Gothic arch of the building.
    add({ w: 3.2, h: 4.2, d: 0.16, x: 0, y: T, z: fz + 0.08, mat: M.granite });
    box(g, { w: 2.26, h: 2.26, d: 0.16, x: 0, y: T + 4.2 - 1.13, z: fz + 0.08, rz: Math.PI / 4, mat: M.granite });
    add({ w: 2.4, h: 3.4, d: 0.2, x: 0, y: T, z: fz + 0.12, mat: M.black });
    box(g, { w: 1.7, h: 1.7, d: 0.2, x: 0, y: T + 3.4 - 0.85, z: fz + 0.12, rz: Math.PI / 4, mat: M.black });
    // Traceried 3rd-floor opening of the Ada prayer chamber, and paired openings near the top on all faces.
    tudorWindow(add, { x: 0, y: T + 6.3, z: fz, w: 3.0, h: 3.0, n: [0, 1], mullions: 3 });
    add({ w: 3.0, h: 0.1, d: 0.2, x: 0, y: T + 7.8, z: fz + 0.06, mat: M.limestone });
    [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([nx, nz]) => {
      [-0.8, 0.8].forEach((o) => tudorWindow(add, {
        x: nx ? nx * (TW / 2) : o, y: T + 10.9, z: nz ? TZ + nz * (TD / 2) : TZ + o, w: 0.6, h: 1.4, n: [nx, nz], mullions: 0,
      }));
    });

    // ── Two smaller Gothic stone halls flanking the upper valley (음악관 / 중강당 style) ──
    gothicHall(g, add, { x: -25, z: -19, w: 12, d: 8, wallH: 6.6, roofH: 3.4, base: TOP + 0.3, towerX: -19.4 });
    gothicHall(g, add, { x: 25, z: -19, w: 13, d: 8.5, wallH: 7.2, roofH: 3.8, base: TOP + 0.3, towerX: 19 });

    // ── Main gate (south): granite pylons and low granite walls framing the valley mouth ──
    [-1, 1].forEach((s) => {
      add({ w: 1.1, h: 3.6, d: 1.1, x: s * 7.2, y: FLOOR_S, z: 45.2, mat: M.granite });
      add({ w: 1.3, h: 0.25, d: 1.3, x: s * 7.2, y: FLOOR_S + 3.6, z: 45.2, mat: M.graniteDark });
      add({ w: 10, h: 1.2, d: 0.8, x: s * 12.8, y: FLOOR_S, z: 45.2, mat: M.granite });
      add({ w: 10.2, h: 0.15, d: 1.0, x: s * 12.8, y: FLOOR_S + 1.2, z: 45.2, mat: M.graniteDark });
    });

    // ── Trees: rows along the roof garden, groves around the halls, a few by the gate ──
    const rng = seededRandom(11);
    const plant = (x, z, h, r) => tree(g, { x, y: ground(x, z) - 0.5, z, h, r });
    for (let i = 0; i < 8; i += 1) {
      const z = 34 - i * 5.6;
      [-1, 1].forEach((s) => plant(s * (17.5 + (rng() - 0.5) * 2), z + (rng() - 0.5) * 2, 5.5 + rng() * 1.5, 1.8 + rng() * 0.5));
    }
    [
      [-21, -36], [21, -36], [-24.5, -31], [24.5, -31], [-19, -41], [19, -41],
      [-36, -14], [36, -14], [-36, -22], [36, -22], [-31, -6], [31, -6],
      [-14, 42], [14, 42], [-20, 39], [20, 39], [-30, 32], [30, 32],
      [-38, 8], [38, 8], [-38, -2], [38, -2], [-8, -45], [8, -45], [0, -46.5],
    ].forEach(([x, z]) => plant(x + (rng() - 0.5) * 1.5, z + (rng() - 0.5) * 1.5, 5.5 + rng() * 2, 1.8 + rng() * 0.7));

    buckets.forEach((tris, mat) => g.add(new THREE.Mesh(trianglesToGeometry(tris), mat)));
    return g;
  },
};
