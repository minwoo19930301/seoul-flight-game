// 서울시청 (Seoul City Hall) - 중구
// Two buildings facing south (+z) plus 서울광장:
// - New City Hall (2012, iArc/유걸): a 13-storey bluish glass slab whose south face curls
//   out over the old hall like a breaking wave (crest bulging in the centre of the plan),
//   a smooth glass soffit under the overhang, a dense grid of horizontal louvers,
//   a rounded crest, a humped roof with solar panels and a straight vertical north wall.
// - Old City Hall (1926, now 서울도서관): a 4-storey light-granite Renaissance block with a
//   taller central clock tower, columned entrance porch, stone plinth and rows of windows.
// - 서울광장: oval lawn on a light-stone pavement in front (south).
// The plan is at ~0.4 of real scale so the whole site fits inside colliderRadius 26
// (덕수궁 is only ~60 units west); heights are real (1 unit ≈ 1 m).
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, frustum, prism, tree, trianglesToGeometry } from "./_helpers.mjs";

// ── New hall dimensions ─────────────────────────────────────────────────────
const HALF_W = 21; // half width E-W (42 units ≈ 106 m real)
const Z_N = -14.8; // straight north (back) wall
const Z_S = 0.2; // south wall of the lower floors
const PAVE = 0.3; // pavement top = building base
const Y_LEAN = 16; // height where the south face starts to lean out
const Y_SOFFIT_TOP = 43; // top of the curved soffit (start of the rounded crest)
const NOSE_R = 2.2; // radius of the rounded crest
const Y_TOP = Y_SOFFIT_TOP + NOSE_R * 2; // 47.4 crest
const Y_NORTH = 45.5; // roof height at the north edge (13 floors × 3.5)
const O_CENTER = 9; // overhang of the crest at the centre of the plan
const O_END = 6.2; // overhang at the east / west ends (curved roof line in plan)
const CURL = 2.2; // superellipse exponent of the soffit (higher = stays vertical longer, then curls)
const FLOOR = 3.5;

// ── Old hall dimensions ─────────────────────────────────────────────────────
const OLD = { halfW: 18, zN: 1.5, zS: 10.5, plinthH: 1.4, wallTop: 18.3, towerHalfW: 5, towerTop: 24.0 };
const OLD_ZC = (OLD.zN + OLD.zS) / 2;
const OLD_D = OLD.zS - OLD.zN;

// The south face is always in the shade of the scene sun (ENE), so the wave glass is a little
// less metallic / more emissive than M.glass to keep its pale blue reading.
const waveGlass = material(0x9fc8e6, { roughness: 0.28, metalness: 0.4, emissive: 0x1d3c56, emissiveIntensity: 0.38 });
const louverMat = material(0xeef2f5, { roughness: 0.4, metalness: 0.45, side: THREE.DoubleSide });
const mullionMat = material(0x5c6670, { roughness: 0.4, metalness: 0.7, side: THREE.DoubleSide });

/** Crest overhang at plan position x (parabolic bulge, largest in the centre). */
const overhangAt = (x) => O_END + (O_CENTER - O_END) * (1 - (x / HALF_W) ** 2);

/** z of the leaning south face for overhang O at soffit parameter t ∈ [0,1] (0 = vertical wall, 1 = crest). */
function soffitZ(O, t) {
  const c = Math.min(1, Math.max(0, t));
  return Z_S + O * (1 - (1 - c ** CURL) ** (1 / CURL));
}

/** Point + outward normal of the south skin at height y (below the crest) for overhang O. */
function southSkinAt(O, y) {
  if (y <= Y_LEAN) {
    return { z: Z_S, y, tz: 0, ty: 1, nz: 1, ny: 0 };
  }
  const span = Y_SOFFIT_TOP - Y_LEAN;
  const t = (y - Y_LEAN) / span;
  const e = 0.002;
  const dz = soffitZ(O, t + e) - soffitZ(O, t - e);
  const dy = span * 2 * e;
  const len = Math.hypot(dz, dy);
  const tz = dz / len;
  const ty = dy / len;
  return { z: soffitZ(O, t), y, tz, ty, nz: ty, ny: -tz };
}

/**
 * Outer skin section for overhang O as [z, y] pairs:
 * `front` = south wall → soffit → rounded crest (glass), `roof` = crest top → north edge.
 */
function skinProfile(O) {
  const front = [[Z_S, PAVE], [Z_S, Y_LEAN]];
  const NB = 18;
  for (let i = 1; i <= NB; i += 1) {
    const t = i / NB;
    front.push([soffitZ(O, t), Y_LEAN + (Y_SOFFIT_TOP - Y_LEAN) * t]);
  }
  const zc = Z_S + O;
  const yc = Y_SOFFIT_TOP + NOSE_R;
  const NC = 10;
  for (let j = 1; j <= NC; j += 1) {
    const a = -Math.PI / 2 + (Math.PI * j) / NC;
    front.push([zc + NOSE_R * Math.cos(a), yc + NOSE_R * Math.sin(a)]);
  }
  const roof = [[zc, Y_TOP]];
  const ND = 8;
  for (let k = 1; k <= ND; k += 1) {
    const s = k / ND;
    roof.push([zc + (Z_N - zc) * s, Y_NORTH + (Y_TOP - Y_NORTH) * (1 - s) ** 2]);
  }
  return { front, roof };
}

/** Roof height at (x, z) on the humped roof. */
function roofY(x, z) {
  const zc = Z_S + overhangAt(x);
  const s = Math.min(1, Math.max(0, (zc - z) / (zc - Z_N)));
  return Y_NORTH + (Y_TOP - Y_NORTH) * (1 - s) ** 2;
}

/** Smooth indexed quad-grid mesh from rows[u][v] = [x, y, z] (vertices shared inside the grid). */
function gridMesh(parent, rows, mat) {
  const nu = rows.length;
  const nv = rows[0].length;
  const positions = new Float32Array(nu * nv * 3);
  rows.forEach((row, u) => row.forEach(([x, y, z], v) => positions.set([x, y, z], (u * nv + v) * 3)));
  const indices = [];
  for (let u = 0; u < nu - 1; u += 1) {
    for (let v = 0; v < nv - 1; v += 1) {
      const a = u * nv + v;
      const b = (u + 1) * nv + v;
      const c = (u + 1) * nv + v + 1;
      const d = u * nv + v + 1;
      indices.push(a, b, c, a, c, d);
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

/** Flat end wall (east / west cap) of the new hall filling the wave section at plane x. */
function capMesh(parent, x, sign) {
  const { front, roof } = skinProfile(O_END);
  const poly = [...front, ...roof.slice(1), [Z_N, PAVE]];
  const contour = poly.map(([z, y]) => new THREE.Vector2(z, y));
  const tris = THREE.ShapeUtils.triangulateShape(contour, []);
  const flat = [];
  tris.forEach(([a, b, c]) => {
    const pa = [x, poly[a][1], poly[a][0]];
    const pb = [x, poly[b][1], poly[b][0]];
    const pc = [x, poly[c][1], poly[c][0]];
    // orient so the face normal points outwards (along sign * x)
    const ux = pb[1] - pa[1];
    const uz = pb[2] - pa[2];
    const vx = pc[1] - pa[1];
    const vz = pc[2] - pa[2];
    const nx = ux * vz - uz * vx;
    if (nx * sign < 0) {
      flat.push(pa, pc, pb);
    } else {
      flat.push(pa, pb, pc);
    }
  });
  const mesh = new THREE.Mesh(trianglesToGeometry(flat), M.glass);
  parent.add(mesh);
  return mesh;
}

/** Keep every [x, z] point of a footprint inside radius r (bevels corners that poke out). */
function clampRadius(points, r) {
  return points.map(([x, z]) => {
    const d = Math.hypot(x, z);
    return d > r ? [(x * r) / d, (z * r) / d] : [x, z];
  });
}

export default {
  id: "seoul-city-hall",
  name: "서울시청",
  nameEn: "Seoul City Hall",
  district: "중구",
  lat: 37.5667,
  lon: 126.9782,
  height: 47,
  colliderRadius: 26,
  detail: "high",
  description: "파도 형상 유리 신청사와 르네상스식 구청사(서울도서관)",
  create() {
    const g = new THREE.Group();

    buildSite(g);
    buildNewHall(g);
    buildOldHall(g);

    return g;
  },
};

// ── 서울광장 + pavement ───────────────────────────────────────────────────────
function buildSite(g) {
  // Light-stone pavement: rectangle under the buildings + D-shaped plaza in front (south).
  const R = 25.7;
  const zPlaza = 11.2;
  const pave = [[-21.4, Z_N], [21.4, Z_N], [21.4, zPlaza]];
  const a0 = Math.atan2(zPlaza, Math.sqrt(R * R - zPlaza * zPlaza));
  const steps = 28;
  for (let i = 0; i <= steps; i += 1) {
    const a = a0 + (Math.PI - 2 * a0) * (i / steps);
    pave.push([R * Math.cos(a), R * Math.sin(a)]);
  }
  pave.push([-21.4, zPlaza]);
  prism(g, { points: clampRadius(pave, 25.8), h: PAVE, mat: M.rockLight });

  // Oval lawn of 서울광장 (flattened north-south to fit the collider).
  const lawn = [];
  const lawnA = 14;
  const lawnB = 6.2;
  const lawnZ = 18.8;
  for (let i = 0; i < 56; i += 1) {
    const a = (i / 56) * Math.PI * 2;
    lawn.push([Math.cos(a) * lawnA, lawnZ + Math.sin(a) * lawnB]);
  }
  prism(g, { points: lawn, h: 0.22, y: PAVE, mat: M.grass });
  // Thin pale kerb around the lawn
  const kerb = lawn.map(([x, z]) => [x * 1.045, lawnZ + (z - lawnZ) * 1.1]);
  prism(g, { points: kerb, h: 0.1, y: PAVE, mat: M.white });

  // Street trees flanking the plaza
  [[-18.5, 12.8], [18.5, 12.8], [-16.3, 15.6], [16.3, 15.6]].forEach(([x, z]) => {
    tree(g, { x, y: PAVE, z, h: 7, r: 2.1 });
  });
  // A few lamp posts along the plaza edge
  [[-13, 13.2], [13, 13.2], [-6, 12.6], [6, 12.6]].forEach(([x, z]) => {
    cyl(g, { rTop: 0.08, rBot: 0.12, h: 5, x, y: PAVE, z, mat: M.steelDark, seg: 6 });
    box(g, { w: 0.5, h: 0.3, d: 0.5, x, y: PAVE + 5, z, mat: M.warmLight });
  });
}

// ── New City Hall (glass wave) ───────────────────────────────────────────────
function buildNewHall(g) {
  const NX = 42;
  const xs = [];
  for (let u = 0; u <= NX; u += 1) {
    xs.push(-HALF_W + (2 * HALF_W * u) / NX);
  }

  // Wave skin (glass): south wall → soffit → crest, smooth in both directions; humped roof behind it.
  const sections = xs.map((x) => skinProfile(overhangAt(x)));
  gridMesh(g, sections.map((s, u) => s.front.map(([z, y]) => [xs[u], y, z])), waveGlass);
  gridMesh(g, sections.map((s, u) => s.roof.map(([z, y]) => [xs[u], y, z])), M.steelDark);

  // Straight north wall (13 floors) and the two flat end walls.
  box(g, { w: HALF_W * 2, h: Y_NORTH - PAVE, d: 0.4, y: PAVE, z: Z_N + 0.2, mat: M.glassBlue });
  capMesh(g, -HALF_W, -1);
  capMesh(g, HALF_W, 1);

  // Horizontal louvers on the south face, one per floor, following the double curvature.
  const HW = 0.22; // half width along the surface
  const DN = 0.3; // protrusion
  for (let k = 1; k <= 12; k += 1) {
    const y = PAVE + k * FLOOR;
    const strip = xs.map((x) => {
      const p = southSkinAt(overhangAt(x), y);
      const A = [x, p.y - p.ty * HW, p.z - p.tz * HW];
      const B = [x, p.y + p.ty * HW, p.z + p.tz * HW];
      return [A, [x, A[1] + p.ny * DN, A[2] + p.nz * DN], [x, B[1] + p.ny * DN, B[2] + p.nz * DN], B];
    });
    gridMesh(g, strip, louverMat);
  }
  // Vertical mullions of the glass grid (thinner, aluminium).
  const ys = [];
  for (let y = PAVE; y <= Y_SOFFIT_TOP - 0.01; y += 1) {
    ys.push(y);
  }
  ys.push(Y_SOFFIT_TOP);
  for (let x = -HALF_W; x <= HALF_W + 0.01; x += 3) {
    const O = overhangAt(x);
    const strip = ys.map((y) => {
      const p = southSkinAt(O, y);
      const L = [x - 0.12, p.y, p.z];
      const Rr = [x + 0.12, p.y, p.z];
      return [L, [L[0], p.y + p.ny * 0.2, p.z + p.nz * 0.2], [Rr[0], p.y + p.ny * 0.2, p.z + p.nz * 0.2], Rr];
    });
    gridMesh(g, strip, mullionMat);
  }

  // Floor bands on the north wall and on the end walls.
  for (let k = 1; k <= 12; k += 1) {
    const y = PAVE + k * FLOOR;
    box(g, { w: HALF_W * 2 + 0.3, h: 0.35, d: 0.3, y: y - 0.17, z: Z_N - 0.05, mat: M.steelDark });
    const zFront = southSkinAt(O_END, y).z;
    [-1, 1].forEach((side) => {
      box(g, { w: 0.25, h: 0.35, d: zFront - Z_N, x: side * (HALF_W + 0.08), y: y - 0.17, z: (Z_N + zFront) / 2, mat: M.steelDark });
    });
  }

  // Ground floor: darker storefront glass and an entrance canopy behind the old hall.
  box(g, { w: HALF_W * 2 - 1, h: 4.1, d: 0.35, y: PAVE, z: Z_S + 0.12, mat: M.glassDark });
  box(g, { w: 26, h: 0.25, d: 1.5, y: PAVE + 4.2, z: Z_S + 0.7, mat: M.steel });
  [-9, 0, 9].forEach((x) => {
    box(g, { w: 3.2, h: 3.2, d: 0.2, x, y: PAVE, z: Z_S + 0.32, mat: M.steelDark });
  });

  // Roof: rows of tilted solar panels on the flatter back part, and a low plant room.
  for (let z = Z_N + 2.2; z < Z_S - 1.4; z += 2.5) {
    const y = roofY(0, z);
    box(g, { w: 36, h: 0.12, d: 1.7, y: y + 0.28, z, mat: M.glassBlue, rx: 0.26 });
    box(g, { w: 36, h: 0.35, d: 0.18, y, z: z - 0.75, mat: M.steel });
  }
  box(g, { w: 12, h: 1.4, d: 3.6, y: roofY(0, Z_N + 3.6), z: Z_N + 3.6, mat: M.steelDark });
  // Roof edge trim along the north parapet
  box(g, { w: HALF_W * 2 + 0.4, h: 0.4, d: 0.5, y: Y_NORTH - 0.1, z: Z_N + 0.15, mat: M.steel });
}

// ── Old City Hall / 서울도서관 (1926) ─────────────────────────────────────────
function buildOldHall(g) {
  const { halfW, zN, zS, plinthH, wallTop, towerHalfW, towerTop } = OLD;
  const wallBase = PAVE + plinthH;

  // Stone plinth and main granite body
  box(g, { w: halfW * 2 + 0.8, h: plinthH, d: OLD_D + 0.8, y: PAVE, z: OLD_ZC, mat: M.graniteDark });
  box(g, { w: halfW * 2, h: wallTop - wallBase, d: OLD_D, y: wallBase, z: OLD_ZC, mat: M.granite });
  // Rusticated ground floor: horizontal course lines
  for (let i = 1; i <= 3; i += 1) {
    box(g, { w: halfW * 2 + 0.1, h: 0.14, d: OLD_D + 0.1, y: wallBase + i * 1.1, z: OLD_ZC, mat: M.graniteDark });
  }
  // String courses and the main cornice
  [6.3, 10.6].forEach((y) => {
    box(g, { w: halfW * 2 + 0.3, h: 0.3, d: OLD_D + 0.3, y, z: OLD_ZC, mat: M.limestone });
  });
  box(g, { w: halfW * 2 + 0.9, h: 0.7, d: OLD_D + 0.9, y: wallTop, z: OLD_ZC, mat: M.limestone });
  const roofTop = wallTop + 0.7;
  // Parapet walls and the rooftop garden (2008 remodel)
  box(g, { w: halfW * 2, h: 0.8, d: 0.45, y: roofTop, z: zS - 0.22, mat: M.granite });
  box(g, { w: halfW * 2, h: 0.8, d: 0.45, y: roofTop, z: zN + 0.22, mat: M.granite });
  [-1, 1].forEach((side) => {
    box(g, { w: 0.45, h: 0.8, d: OLD_D, x: side * (halfW - 0.22), y: roofTop, z: OLD_ZC, mat: M.granite });
    box(g, { w: halfW - towerHalfW - 2.4, h: 0.25, d: OLD_D - 3.2, x: side * ((halfW + towerHalfW) / 2 + 0.2), y: roofTop, z: OLD_ZC, mat: M.foliage });
    // rooftop planters / skylight strip beside the garden
    box(g, { w: halfW - towerHalfW - 2.4, h: 0.4, d: 0.6, x: side * ((halfW + towerHalfW) / 2 + 0.2), y: roofTop, z: zN + 1.1, mat: M.glassDark });
  });

  // Central clock tower (slightly proud of both long faces)
  const towerD = OLD_D + 1.2;
  box(g, { w: towerHalfW * 2, h: towerTop - wallBase, d: towerD, y: wallBase, z: OLD_ZC, mat: M.granite });
  [-1, 1].forEach((side) => {
    box(g, { w: 0.6, h: towerTop - wallBase, d: 0.3, x: side * (towerHalfW - 0.4), y: wallBase, z: OLD_ZC + towerD / 2 + 0.1, mat: M.limestone });
  });
  box(g, { w: towerHalfW * 2 + 0.8, h: 0.6, d: towerD + 0.8, y: towerTop, z: OLD_ZC, mat: M.limestone });
  box(g, { w: towerHalfW * 2, h: 0.7, d: towerD, y: towerTop + 0.6, z: OLD_ZC, mat: M.granite });
  // Low hipped cap roof (copper) and flagpole
  const capBase = towerTop + 1.3;
  frustum(g, { wBot: towerHalfW * 2 + 0.3, dBot: towerD + 0.3, wTop: 5.2, dTop: 5.6, h: 2.3, y: capBase, z: OLD_ZC, mat: M.copperGreen });
  box(g, { w: 5.2, h: 0.35, d: 5.6, y: capBase + 2.3, z: OLD_ZC, mat: M.copperGreen });
  cyl(g, { rTop: 0.07, rBot: 0.09, h: 3.5, y: capBase + 2.65, z: OLD_ZC, mat: M.steel, seg: 6 });

  // Clock on the south face of the tower
  const zFace = OLD_ZC + towerD / 2;
  const clockY = 22.3;
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 0.16, 28), M.black);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, clockY, zFace + 0.08);
  g.add(ring);
  const face = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.16, 28), M.white);
  face.rotation.x = Math.PI / 2;
  face.position.set(0, clockY, zFace + 0.16);
  g.add(face);
  box(g, { w: 0.14, h: 1.05, d: 0.06, x: 0, y: clockY, z: zFace + 0.26, mat: M.black }); // hour hand (12)
  box(g, { w: 0.85, h: 0.12, d: 0.06, x: 0.42, y: clockY - 0.06, z: zFace + 0.26, mat: M.black }); // minute hand (3)

  // Entrance porch: four columns carrying a balcony, steps in front
  const porchZ = zFace + 1.1;
  [-3.6, -1.2, 1.2, 3.6].forEach((x) => {
    cyl(g, { rTop: 0.34, rBot: 0.38, h: 4.7, x, y: wallBase, z: porchZ + 0.6, mat: M.limestone, seg: 12 });
  });
  box(g, { w: 9.4, h: 0.5, d: 2.4, y: wallBase + 4.7, z: porchZ + 0.1, mat: M.limestone });
  box(g, { w: 9.4, h: 0.7, d: 0.2, y: wallBase + 5.2, z: porchZ + 1.2, mat: M.limestone });
  box(g, { w: 10.5, h: plinthH, d: 2.6, y: PAVE, z: porchZ + 0.3, mat: M.graniteDark });
  box(g, { w: 11.5, h: 0.5, d: 1.4, y: PAVE, z: porchZ + 2.2, mat: M.granite });
  box(g, { w: 2.6, h: 3.4, d: 0.2, y: wallBase, z: zFace + 0.05, mat: M.glassDark }); // entrance doors

  // Windows: rows of dark rectangles on all faces
  const floors = [
    { y: wallBase + 1.0, h: 2.7 },
    { y: 7.0, h: 2.5 },
    { y: 11.3, h: 2.3 },
    { y: 15.1, h: 1.9 },
  ];
  const win = (w, h, x, y, z, ry = 0) => box(g, { w, h, d: 0.16, x, y, z, mat: M.glassDark, ry });
  floors.forEach(({ y, h }) => {
    for (let x = -halfW + 1.8; x <= halfW - 1.7; x += 2.2) {
      if (Math.abs(x) < towerHalfW + 0.7) {
        continue;
      }
      win(1.1, h, x, y, zS + 0.04);
      win(1.1, h, x, y, zN - 0.04);
    }
    [zN + 1.6, OLD_ZC, zS - 1.6].forEach((z) => {
      win(1.1, h, halfW + 0.04, y, z, Math.PI / 2);
      win(1.1, h, -halfW - 0.04, y, z, Math.PI / 2);
    });
  });
  // Tower windows (taller, paired), clock occupies the top of the south face
  [...floors, { y: 19.3, h: 1.5 }].forEach(({ y, h }, index) => {
    [-2.3, 2.3].forEach((x) => {
      if (index > 0) {
        win(1.2, h + 0.2, x, y, zFace + 0.04);
      }
      win(1.2, h + 0.2, x, y, OLD_ZC - towerD / 2 - 0.04);
    });
  });
}
