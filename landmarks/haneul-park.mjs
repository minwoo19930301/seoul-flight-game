// 하늘공원 (Haneul Park, 2002) - 마포구
// The former 난지도 landfill mound turned into a silver-grass plateau roughly 60 m above the surrounding
// ground. The whole mound is modelled: steep grass slopes with a mid-height service berm, khaki 억새 fields
// cut by mown grass paths and a gravel loop on the flat top, five white wind turbines along the north edge,
// the steel lattice bowl '하늘을 담는 그릇' at the west end, timber viewing decks, birdhouse sculptures, a
// shelter pavilion, and the zigzag 하늘계단 (291 steps) switch-backing up the south-west slope.
// The real plateau (~700 × 300 m) is compressed to fit the collider; heights are kept realistic.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, sphere, prism, ring, strut, slab, treePatch, pyramidRoof, trianglesToGeometry } from "./_helpers.mjs";

const REED = [material(0xc9b98a), material(0xd5c69c), material(0xbcaa78)];
const WOOD = material(0x9c7b52);
const TOP = 50; // plateau level

// Mound profile, bottom → top. Each stage tapers from outline `a` to outline `b` ([halfWidth, halfDepth, cornerRadius]).
const STAGES = [
  { y0: 0, y1: 25, a: [76, 58, 50], b: [66, 49, 43] },
  { y0: 25, y1: 25.5, a: [66, 49, 43], b: [62, 45, 39] }, // 4 m service berm
  { y0: 25.5, y1: TOP, a: [62, 45, 39], b: [50, 34, 28] },
];

/** Rounded-rectangle outline [[x, z], ...] with a constant point count (so outlines can be lofted). */
function roundedRect([hw, hd, rc], segs = 6) {
  const r = Math.min(rc, hw, hd);
  const corners = [[hw - r, hd - r, 90], [hw - r, r - hd, 0], [r - hw, r - hd, -90], [r - hw, hd - r, 180]];
  const pts = [];
  corners.forEach(([cx, cz, start]) => {
    for (let i = 0; i <= segs; i += 1) {
      const a = ((start - (90 / segs) * i) * Math.PI) / 180;
      pts.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]);
    }
  });
  return pts;
}

/** Loft between two outlines with the same point count (a frustum with an arbitrary convex footprint). */
function polyFrustum(parent, { bottom, top, h, y = 0, mat = M.grassDark, cap = true }) {
  const tris = [];
  const n = bottom.length;
  for (let i = 0; i < n; i += 1) {
    const j = (i + 1) % n;
    const b0 = [bottom[i][0], 0, bottom[i][1]];
    const b1 = [bottom[j][0], 0, bottom[j][1]];
    const t0 = [top[i][0], h, top[i][1]];
    const t1 = [top[j][0], h, top[j][1]];
    tris.push(b0, b1, t1, b0, t1, t0);
    if (cap) {
      tris.push([0, h, 0], t0, t1);
    }
  }
  const mesh = new THREE.Mesh(trianglesToGeometry(tris), mat);
  mesh.position.y = y;
  parent.add(mesh);
  return mesh;
}

/** z of the south slope face at height y (the stair sits on this surface). */
function southZ(y) {
  const s = STAGES.find((stage) => y <= stage.y1) ?? STAGES[STAGES.length - 1];
  const t = Math.min(1, Math.max(0, (y - s.y0) / (s.y1 - s.y0)));
  return s.a[1] + (s.b[1] - s.a[1]) * t;
}

/** Box member between two points; its width stays horizontal (stair flights, ramps). */
function beam(parent, { from, to, w = 3, t = 0.5, mat = M.concrete }) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, t, a.distanceTo(b)), mat);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.lookAt(b);
  parent.add(mesh);
  return mesh;
}

/** ~31 m wind turbine: tapered white pole, nacelle, hub and three blades in the x-y plane (facing north/south). */
function turbine(parent, x, y, z) {
  cyl(parent, { rTop: 0.55, rBot: 1.05, h: 21, x, y, z, mat: M.white, seg: 10 });
  box(parent, { w: 3.2, h: 1.8, d: 1.7, x, y: y + 20.8, z, mat: M.white });
  const hubY = y + 21.7;
  const hubZ = z - 1.3;
  sphere(parent, { r: 0.65, x, y: hubY - 0.65, z: hubZ, mat: M.white, seg: 8 });
  const L = 9;
  for (let i = 0; i < 3; i += 1) {
    const a = (i * 2 * Math.PI) / 3 + 0.3;
    box(parent, { w: 0.9, h: L, d: 0.22, x: x + (Math.sin(a) * L) / 2, y: hubY + (Math.cos(a) * L) / 2 - L / 2, z: hubZ, mat: M.white, rz: -a });
  }
}

/** '하늘을 담는 그릇': open steel lattice bowl (~20 m across, 12 m tall) with a spiral timber ramp inside. */
function skyBowl(parent, x, y, z) {
  cyl(parent, { rTop: 4.2, rBot: 4.8, h: 0.5, x, y, z, mat: M.granite, seg: 24 });
  const rings = [[4.2, 0.5], [6.2, 4], [8.2, 8], [10, 12]];
  rings.forEach(([r, h]) => ring(parent, { r, tube: 0.16, x, y: y + h, z, seg: 40, tubeSeg: 6, mat: M.steel }));
  const n = 24;
  const lean = (2 * Math.PI * 1.5) / n;
  for (let i = 0; i < n; i += 1) {
    const a0 = (i / n) * Math.PI * 2;
    const from = [x + Math.cos(a0) * 4.2, y + 0.5, z + Math.sin(a0) * 4.2];
    [a0 + lean, a0 - lean].forEach((a1) => {
      strut(parent, { from, to: [x + Math.cos(a1) * 10, y + 12, z + Math.sin(a1) * 10], r: 0.14, mat: M.steel, seg: 5 });
    });
  }
  let prev = null;
  const steps = 14;
  for (let i = 0; i <= steps; i += 1) {
    const a = (i / steps) * Math.PI * 2 * 1.25;
    const r = 3.4 + (i / steps) * 5.2;
    const p = [x + Math.cos(a) * r, y + 0.6 + (i / steps) * 9.6, z + Math.sin(a) * r];
    if (prev) {
      beam(parent, { from: prev, to: p, w: 1.6, t: 0.25, mat: WOOD });
    }
    prev = p;
  }
  ring(parent, { r: 9.3, tube: 0.1, x, y: y + 11.3, z, seg: 40, tubeSeg: 5, mat: M.steel });
}

/** Timber viewing deck with a railing on the outward side (`side` = [sx, sz] unit direction). */
function deck(parent, { x, y, z, w, d, side }) {
  box(parent, { w, h: 0.5, d, x, y, z, mat: M.trunk });
  const [sx, sz] = side;
  const ex = x + sx * (w / 2 - 0.2);
  const ez = z + sz * (d / 2 - 0.2);
  const len = sx ? d : w;
  for (let i = 0; i <= 4; i += 1) {
    const t = -0.5 + i / 4;
    const px = sx ? ex : x + t * (w - 0.4);
    const pz = sz ? ez : z + t * (d - 0.4);
    box(parent, { w: 0.15, h: 1.1, d: 0.15, x: px, y: y + 0.5, z: pz, mat: M.steelDark });
  }
  const a = sx ? [ex, y + 1.6, z - len / 2 + 0.2] : [x - len / 2 + 0.2, y + 1.6, ez];
  const b = sx ? [ex, y + 1.6, z + len / 2 - 0.2] : [x + len / 2 - 0.2, y + 1.6, ez];
  strut(parent, { from: a, to: b, r: 0.08, mat: M.steel, seg: 5 });
}

/** 하늘계단: six zigzag flights switch-backing up the south-west slope, with a handrail and landings. */
function skyStair(parent) {
  const flights = 6;
  const xA = -20;
  const xB = -7;
  const dy = TOP / flights;
  for (let f = 0; f < flights; f += 1) {
    const y0 = f * dy;
    const y1 = (f + 1) * dy;
    const x0 = f % 2 === 0 ? xA : xB;
    const x1 = f % 2 === 0 ? xB : xA;
    const sub = 3;
    for (let s = 0; s < sub; s += 1) {
      const ya = y0 + (dy * s) / sub;
      const yb = y0 + (dy * (s + 1)) / sub;
      const xa = x0 + ((x1 - x0) * s) / sub;
      const xb = x0 + ((x1 - x0) * (s + 1)) / sub;
      beam(parent, { from: [xa, ya + 0.35, southZ(ya) + 0.9], to: [xb, yb + 0.35, southZ(yb) + 0.9], w: 3.4, t: 0.7, mat: WOOD });
      strut(parent, { from: [xa, ya + 1.5, southZ(ya) + 2.5], to: [xb, yb + 1.5, southZ(yb) + 2.5], r: 0.13, mat: M.steel, seg: 5 });
    }
    const dir = Math.sign(x1 - x0);
    box(parent, { w: 3.6, h: 0.7, d: 3.6, x: x1 + dir * 1.8, y: y1 - 0.1, z: southZ(y1) + 1.0, mat: WOOD });
  }
}

export default {
  id: "haneul-park",
  name: "하늘공원",
  nameEn: "Haneul Park",
  district: "마포구",
  lat: 37.568,
  lon: 126.885,
  height: 81,
  colliderRadius: 78,
  detail: "medium",
  description: "난지도 매립지 위 억새 평원과 풍력발전기, '하늘을 담는 그릇'",
  create() {
    const g = new THREE.Group();

    // ── The landfill mound: lower slope, 4 m service berm, upper slope, flat top ──
    STAGES.forEach((s, i) => {
      polyFrustum(g, { bottom: roundedRect(s.a), top: roundedRect(s.b), h: s.y1 - s.y0, y: s.y0, mat: M.grassDark, cap: i === STAGES.length - 1 });
    });
    // Gravel service road running around the berm.
    prism(g, { points: roundedRect([65.5, 48.5, 42.5]), holes: [roundedRect([62.5, 45.5, 39.5]).reverse()], h: 0.3, y: 25.5, mat: M.sand });

    // ── Plateau: mown grass with a gravel loop path and a grid of silver-grass (억새) fields ──
    prism(g, { points: roundedRect([50, 34, 28]), h: 0.4, y: TOP, mat: M.grass });
    const deckY = TOP + 0.4;
    prism(g, { points: roundedRect([48, 32, 26.5]), holes: [roundedRect([44.5, 28.5, 23.5]).reverse()], h: 0.3, y: deckY, mat: M.sand });
    const cols = [[-16, 15], [1, 13], [17, 13], [32, 11]];
    const rows = [-17, -1, 15];
    cols.forEach(([cx, cw], ci) => {
      rows.forEach((cz, ri) => {
        box(g, { w: cw, h: 0.9, d: 12, x: cx, y: deckY, z: cz, mat: REED[(ci + ri) % 3] });
      });
    });

    // ── Five wind turbines along the north edge ──
    [-36, -18, 0, 18, 36].forEach((x) => turbine(g, x, deckY, -26));

    // ── '하늘을 담는 그릇' viewing bowl at the west end ──
    skyBowl(g, -37, deckY, 2);

    // ── Timber viewing decks on the edges ──
    deck(g, { x: 14, y: deckY, z: 30.5, w: 8, d: 5, side: [0, 1] });
    deck(g, { x: 45, y: deckY, z: 0, w: 5, d: 8, side: [1, 0] });
    deck(g, { x: -22, y: deckY, z: -30, w: 8, d: 5, side: [0, -1] });

    // ── Birdhouse sculptures standing in the reed fields ──
    [[-10, -1], [24, 15], [28, -18], [8, -3], [-24, 15]].forEach(([x, z], i) => {
      const h = 5.5 + (i % 3) * 0.8;
      cyl(g, { rTop: 0.14, rBot: 0.18, h, x, y: deckY, z, mat: M.trunk, seg: 6 });
      box(g, { w: 1.5, h: 1.3, d: 1.3, x, y: deckY + h, z, mat: i % 2 ? M.white : M.red });
      pyramidRoof(g, { w: 1.5, d: 1.3, h: 0.7, x, y: deckY + h + 1.3, z, overhang: 0.25, mat: M.roofTile });
    });

    // ── Arrival plaza where the sky stair reaches the top: shelter pavilion and visitor kiosk ──
    slab(g, { w: 24, d: 10, x: -12, y: deckY, z: 28.5, h: 0.25, mat: M.granite });
    [[-2.4, -2.4], [2.4, -2.4], [-2.4, 2.4], [2.4, 2.4]].forEach(([dx, dz]) => {
      cyl(g, { rTop: 0.22, h: 3.4, x: -4 + dx, y: deckY + 0.25, z: 27 + dz, mat: M.trunk, seg: 6 });
    });
    pyramidRoof(g, { w: 6, d: 6, h: 1.8, x: -4, y: deckY + 3.65, z: 27, overhang: 0.8, mat: M.roofTile });
    box(g, { w: 8, h: 3.4, d: 5, x: -15, y: deckY + 0.25, z: 27, mat: M.offWhite });
    box(g, { w: 8.6, h: 0.4, d: 5.6, x: -15, y: deckY + 3.65, z: 27, mat: M.roofTile });

    // ── 하늘계단 up the south-west slope ──
    skyStair(g);

    // ── Foot of the mound: stair forecourt, shuttle (맹꽁이 전기차) stop and trees ──
    slab(g, { w: 18, d: 6, x: -14, z: 61.5, h: 0.4, mat: M.granite });
    box(g, { w: 7, h: 3.2, d: 4, x: -27, z: 62, mat: M.offWhite });
    box(g, { w: 8, h: 0.4, d: 5, x: -27, y: 3.2, z: 62, mat: M.roofTile });
    treePatch(g, { w: 34, d: 4, x: 10, z: 62.5, count: 8, seed: 21, h: 8, r: 2.8 });
    treePatch(g, { w: 50, d: 4, x: 0, z: -62, count: 8, seed: 33, h: 8, r: 2.8 });

    return g;
  },
};
