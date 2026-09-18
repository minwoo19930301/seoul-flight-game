// 세계평화의문 (World Peace Gate, 김중업 1988) - 송파구
// Monumental gate at the entrance of 올림픽공원: two gull-wing concrete shells sweep out and up from a
// central gap (white on top, 사신도 단청 murals on the soffits), each cantilevered from a pair of leaning
// granite pylons over the open passage that holds the eternal flame. A granite plaza with 열주탈 mask
// columns, flagpoles and a few trees surrounds it. Real size: 62 m span × 37 m depth × 24 m high; the span
// and depth are trimmed to 58 × 32 m so that the whole model fits inside the 30 m collider.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, cone, frustum, slab, tree, trianglesToGeometry } from "./_helpers.mjs";

// 단청 paint for the soffits: the undersides only ever see the dim ground bounce, so the pigments carry a
// little emissive light to stay as vivid as the real murals (same hues as the shared palette).
const paint = (color, glow = 0.55) => material(color, { roughness: 0.7, emissive: color, emissiveIntensity: glow });
const P = {
  blue: paint(0x2c5fa8),
  red: paint(0xc0392b),
  green: paint(0x2e8b57),
  yellow: paint(0xf1c40f, 0.45),
  orange: paint(0xe07a2c),
  white: paint(0xf0f2f4, 0.4),
  black: M.black,
};

// ── Wing shell parameters (s = distance from the centre line along the span, side -1 north / +1 south) ──
const S0 = 2.6; // root: half of the gap between the two wings
const S1 = 29; // tip
const D0 = 16; // half depth (front/back) of the shell at the root
const D_TIP = 7; // half depth at the tip (swept bird-wing plan; also keeps the tips inside r = 30)
const HB_ROOT = 10.8; // soffit height at the root
const HB_TIP = 22.6; // soffit height at the tip (the top reaches 24 m)
const CAMBER_TOP = 0.7; // ridge along the middle of each wing
const CAMBER_BOTTOM = 0.4; // shallow vault of the soffit
const NS = 60; // spanwise segments
const NU = 16; // depthwise segments

const span = (s) => (s - S0) / (S1 - S0);
const halfDepth = (s) => D0 - (D0 - D_TIP) * Math.pow(span(s), 1.2);
// Underside height: gentle near the root, kicking up towards the tip (a Korean eave curve pushed to the extreme).
const soffit = (s) => {
  const t = span(s);
  return HB_ROOT + (HB_TIP - HB_ROOT) * (0.5 * t + 0.5 * t * t * t);
};
// Shell thickness at the fascia: a deeper shoulder at the root, thin at the tip.
const thickness = (s) => 0.7 + 1.7 * Math.pow(1 - span(s), 1.3);
// u = -1 front (west) eave … +1 back (east) eave.
const bottomPoint = (side, s, u, drop = 0) => [u * halfDepth(s), soffit(s) + CAMBER_BOTTOM * (1 - u * u) - drop, side * s];
const topPoint = (side, s, u) => [u * halfDepth(s), soffit(s) + thickness(s) + CAMBER_TOP * (1 - u * u), side * s];

/** Two triangles for the quad a-b-c-d, wound so that the face normal points along `facing`. */
function quad(tris, a, b, c, d, facing) {
  const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const n = [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0]];
  if (n[0] * facing[0] + n[1] * facing[1] + n[2] * facing[2] >= 0) {
    tris.push(a, b, c, a, c, d);
  } else {
    tris.push(a, c, b, a, d, c);
  }
}

function surface(parent, tris, mat) {
  const mesh = new THREE.Mesh(trianglesToGeometry(tris), mat);
  parent.add(mesh);
  return mesh;
}

/** Painted figure: a strip following `path` = [[s, u, halfWidthU], ...], hung `drop` below the soffit. */
function ribbon(parent, side, path, mat, drop) {
  const tris = [];
  for (let i = 0; i + 1 < path.length; i += 1) {
    const [sa, ua, wa] = path[i];
    const [sb, ub, wb] = path[i + 1];
    quad(
      tris,
      bottomPoint(side, sa, ua - wa, drop),
      bottomPoint(side, sb, ub - wb, drop),
      bottomPoint(side, sb, ub + wb, drop),
      bottomPoint(side, sa, ua + wa, drop),
      [0, -1, 0],
    );
  }
  return surface(parent, tris, mat);
}

/** Sample `fn(t) -> [s, u, halfWidth]` at n + 1 points. */
const samplePath = (n, fn) => Array.from({ length: n + 1 }, (_, k) => fn(k / n));

/** One wing: white shell (top, fascias, tip and root faces) plus the coloured soffit bands. */
function wing(parent, side, fieldMat) {
  const sAt = (i) => S0 + ((S1 - S0) * i) / NS;
  const uAt = (j) => -1 + (2 * j) / NU;

  const white = [];
  for (let i = 0; i < NS; i += 1) {
    for (let j = 0; j < NU; j += 1) {
      quad(white, topPoint(side, sAt(i), uAt(j)), topPoint(side, sAt(i + 1), uAt(j)), topPoint(side, sAt(i + 1), uAt(j + 1)), topPoint(side, sAt(i), uAt(j + 1)), [0, 1, 0]);
    }
    [-1, 1].forEach((u) => {
      quad(white, bottomPoint(side, sAt(i), u), topPoint(side, sAt(i), u), topPoint(side, sAt(i + 1), u), bottomPoint(side, sAt(i + 1), u), [u, 0, 0]);
    });
  }
  for (let j = 0; j < NU; j += 1) {
    quad(white, bottomPoint(side, S1, uAt(j)), topPoint(side, S1, uAt(j)), topPoint(side, S1, uAt(j + 1)), bottomPoint(side, S1, uAt(j + 1)), [0, 0, side]);
    quad(white, bottomPoint(side, S0, uAt(j)), topPoint(side, S0, uAt(j)), topPoint(side, S0, uAt(j + 1)), bottomPoint(side, S0, uAt(j + 1)), [0, 0, -side]);
  }
  surface(parent, white, M.white);

  // Soffit: 단청 stripes along both eaves and one big taegeuk-coloured field carrying the 사신도.
  const bands = [
    [-1, -0.92, P.yellow], [-0.92, -0.86, P.green], [-0.86, -0.83, P.white],
    [-0.83, 0.83, fieldMat],
    [0.83, 0.86, P.white], [0.86, 0.92, P.green], [0.92, 1, P.yellow],
  ];
  bands.forEach(([ua, ub, mat]) => {
    const tris = [];
    const nu = Math.max(1, Math.round(((ub - ua) / 2) * NU));
    for (let i = 0; i < NS; i += 1) {
      for (let j = 0; j < nu; j += 1) {
        const u0 = ua + ((ub - ua) * j) / nu;
        const u1 = ua + ((ub - ua) * (j + 1)) / nu;
        quad(tris, bottomPoint(side, sAt(i), u0), bottomPoint(side, sAt(i + 1), u0), bottomPoint(side, sAt(i + 1), u1), bottomPoint(side, sAt(i), u1), [0, -1, 0]);
      }
    }
    surface(parent, tris, mat);
  });
}

/** 사신도 figures painted on the soffits (백금남): 청룡·백호 on the north wing, 주작·현무 on the south wing. */
function murals(parent) {
  const N = -1;
  const S = 1;

  // 청룡 - sinuous green dragon with a yellow belly stripe, front half of the north wing.
  const dragon = samplePath(28, (t) => [5 + 21 * t, -0.46 + 0.24 * Math.sin(t * Math.PI * 2.6), 0.03 + 0.07 * Math.sin(Math.PI * Math.min(1, t * 1.12))]);
  ribbon(parent, N, dragon, P.green, 0.08);
  ribbon(parent, N, dragon.map(([s, u, w]) => [s, u, w * 0.4]), P.yellow, 0.16);
  ribbon(parent, N, [[3.4, -0.46, 0.05], [4.3, -0.46, 0.12], [5.4, -0.46, 0.11], [6.2, -0.46, 0.06]], P.green, 0.08);
  ribbon(parent, N, [[3.9, -0.46, 0.04], [4.6, -0.46, 0.05], [5.2, -0.46, 0.04]], P.white, 0.16);

  // 백호 - white tiger with black stripes, back half of the north wing.
  const tiger = samplePath(20, (t) => [6 + 17 * t, 0.46 + 0.16 * Math.sin(t * Math.PI * 1.6 + 0.4), 0.04 + 0.09 * Math.sin(Math.PI * t)]);
  ribbon(parent, N, tiger, P.white, 0.08);
  for (let k = 3; k <= 17; k += 2) {
    const [s, u, w] = tiger[k];
    ribbon(parent, N, [[s - 0.28, u, w * 0.85], [s + 0.28, u, w * 0.85]], P.black, 0.16);
  }
  ribbon(parent, N, [[4.2, 0.47, 0.05], [5.2, 0.47, 0.1], [6.4, 0.47, 0.08]], P.white, 0.08);

  // 주작 - yellow phoenix with orange wings and fanned tail feathers, front half of the south wing.
  ribbon(parent, S, samplePath(12, (t) => [6.5 + 9 * t, -0.46, 0.03 + 0.13 * Math.sin(Math.PI * t)]), P.yellow, 0.08);
  ribbon(parent, S, [[4.4, -0.46, 0.03], [5.3, -0.46, 0.07], [6.6, -0.46, 0.05]], P.white, 0.08);
  ribbon(parent, S, [[10.5, -0.46, 0.09], [9.6, -0.7, 0.045], [9, -0.78, 0.02]], P.orange, 0.16);
  ribbon(parent, S, [[10.5, -0.46, 0.09], [9.6, -0.22, 0.045], [9, -0.14, 0.02]], P.orange, 0.16);
  for (let k = -2; k <= 2; k += 1) {
    ribbon(parent, S, [[15, -0.46, 0.05], [20, -0.46 + k * 0.08, 0.035], [25.5, -0.46 + k * 0.14, 0.02]], k % 2 ? P.orange : P.yellow, 0.16);
  }

  // 현무 - green tortoise shell with a yellow centre and a black snake coiling around it, back half of the south wing.
  const shell = samplePath(14, (t) => [8 + 10 * t, 0.46, 0.03 + 0.19 * Math.sin(Math.PI * t)]);
  ribbon(parent, S, shell, P.green, 0.08);
  ribbon(parent, S, shell.map(([s, u, w]) => [s, u, Math.max(0.01, w - 0.07)]), P.yellow, 0.16);
  ribbon(parent, S, samplePath(30, (t) => [4.5 + 19 * t, 0.46 + 0.3 * Math.sin(t * Math.PI * 2.2 + 0.3), 0.025]), P.black, 0.24);
}

export default {
  id: "world-peace-gate",
  name: "세계평화의문",
  nameEn: "World Peace Gate",
  district: "송파구",
  lat: 37.5184,
  lon: 127.1152,
  height: 24,
  colliderRadius: 30,
  detail: "high",
  description: "올림픽공원 입구의 날개 형상 문, 단청",
  create() {
    const g = new THREE.Group();

    // ── Plaza (granite) with a lighter paved field, the approach axis running west, and the gate platform.
    cyl(g, { rTop: 29.6, h: 0.3, mat: M.graniteDark, seg: 64 });
    slab(g, { w: 36, d: 44, y: 0.3, h: 0.15, mat: M.granite });
    slab(g, { w: 29, d: 9, x: -14.5, y: 0.3, h: 0.16, mat: M.limestone });
    slab(g, { w: 37, d: 23, y: 0.45, h: 0.25, mat: M.granite });
    slab(g, { w: 34, d: 20, y: 0.7, h: 0.3, mat: M.limestone });
    const deck = 1.0;

    // ── Four leaning granite-clad pylons (two per wing) carrying the cantilevered shells.
    [-1, 1].forEach((side) => {
      [-7, 7].forEach((x) => {
        frustum(g, { wBot: 3.2, dBot: 2.6, wTop: 2.4, dTop: 3.2, h: 12.4, x, y: deck, z: side * 5.4, shiftZ: side * 1.8, mat: M.offWhite });
      });
    });

    // ── The two wings: white shells, blue (north) and red (south) taegeuk soffits with the 사신도.
    wing(g, -1, P.blue);
    wing(g, 1, P.red);
    murals(g);

    // Two steel members tie the wing roots to each other across the central gap.
    [-6, 6].forEach((x) => box(g, { w: 1.1, h: 1.1, d: S0 * 2 + 0.6, x, y: HB_ROOT + 1.1, mat: M.steel }));

    // ── Eternal flame (평화의 성화) at the centre of the passage: stepped plinth, bronze bowl, flame.
    const fx = -2.5;
    box(g, { w: 4.2, h: 0.4, d: 4.2, x: fx, y: deck, mat: M.graniteDark });
    box(g, { w: 3.2, h: 0.9, d: 3.2, x: fx, y: deck + 0.4, mat: M.graniteDark });
    cyl(g, { rTop: 0.55, rBot: 0.75, h: 0.7, x: fx, y: deck + 1.3, mat: M.bronze, seg: 16 });
    cyl(g, { rTop: 1.8, rBot: 0.7, h: 1.2, x: fx, y: deck + 2.0, mat: M.bronze, seg: 20 });
    cyl(g, { rTop: 1.55, rBot: 1.55, h: 0.15, x: fx, y: deck + 3.1, mat: M.black, seg: 20 });
    cone(g, { r: 0.8, h: 2.3, x: fx, y: deck + 3.2, mat: M.orange, seg: 12 });
    cone(g, { r: 0.42, h: 1.5, x: fx, y: deck + 3.3, mat: M.yellow, seg: 10 });

    // ── 열주탈 (이승택): rows of short white columns topped with carved mask heads along the approach.
    for (let i = 0; i < 9; i += 1) {
      const x = -13 - i * 1.8;
      [-1, 1].forEach((side) => {
        const z = side * 9;
        box(g, { w: 0.8, h: 0.3, d: 0.8, x, y: 0.46, z, mat: M.graniteDark });
        cyl(g, { rTop: 0.27, rBot: 0.33, h: 2.4, x, y: 0.76, z, mat: M.white, seg: 8 });
        box(g, { w: 0.62, h: 0.85, d: 0.55, x, y: 3.16, z, mat: M.rock });
      });
    }

    // ── Flagpoles (만국기) framing the plaza entrance.
    [[-27, -5, M.red], [-27, 5, M.blue], [-22.5, -16, M.yellow], [-22.5, 16, M.green]].forEach(([x, z, mat]) => {
      cyl(g, { rTop: 0.08, rBot: 0.1, h: 10, x, y: 0.3, z, mat: M.steel, seg: 6 });
      box(g, { w: 1.6, h: 1.0, d: 0.06, x: x - 0.8, y: 9.1, z, mat });
    });

    // ── A few park trees at the plaza edges (outside the wings).
    [[20, -17, 9, 3], [20, 17, 9, 3], [25, -6, 8, 2.8], [25, 6, 8, 2.8], [-17, -20, 8, 2.8], [-17, 20, 8, 2.8]].forEach(([x, z, h, r]) => {
      tree(g, { x, z, y: 0.3, h, r });
    });

    return g;
  },
};
