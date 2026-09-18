// Shared building blocks for landmark models.
//
// Conventions
// - 1 unit ≈ 1 m for heights; footprints use roughly the same scale.
// - All primitives are *bottom-anchored*: `y` is the base of the shape, so stacking is easy.
// - Everything is added to the `parent` group you pass in; the function returns the mesh/group.
// - Materials are shared instances (see `M`). Never create canvases/textures (models run in Node too).

import * as THREE from "../vendor/three.module.js";

// ── Materials ────────────────────────────────────────────────────────────────

const materialCache = new Map();

/** Cached MeshStandardMaterial. `material(0xff0000, { roughness: 0.5 })` */
export function material(color, options = {}) {
  const key = `${color}|${JSON.stringify(options)}`;
  if (!materialCache.has(key)) {
    materialCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.05, ...options }));
  }
  return materialCache.get(key);
}

export const M = {
  // glass / metal
  glass: material(0x9ec9e8, { roughness: 0.18, metalness: 0.7, emissive: 0x11304a, emissiveIntensity: 0.22 }),
  glassBlue: material(0x6fb2e0, { roughness: 0.16, metalness: 0.74, emissive: 0x0f2c48, emissiveIntensity: 0.24 }),
  glassDark: material(0x3d5a73, { roughness: 0.2, metalness: 0.65, emissive: 0x0b1a28, emissiveIntensity: 0.2 }),
  glassGreen: material(0x8fc7b8, { roughness: 0.2, metalness: 0.7, emissive: 0x0f2e28, emissiveIntensity: 0.2 }),
  // Without an environment map very high metalness turns gold glass brown; keep it moderately metallic.
  glassGold: material(0xd4ac5e, { roughness: 0.24, metalness: 0.55, emissive: 0x3a2a0f, emissiveIntensity: 0.22 }),
  glassWhite: material(0xe6eef5, { roughness: 0.25, metalness: 0.6, emissive: 0x1b2833, emissiveIntensity: 0.12 }),
  steel: material(0xd7dde3, { roughness: 0.35, metalness: 0.7 }),
  steelDark: material(0x5c6670, { roughness: 0.4, metalness: 0.7 }),
  aluminum: material(0xc9cdd1, { roughness: 0.3, metalness: 0.85 }),
  gold: material(0xe0b448, { roughness: 0.3, metalness: 0.85 }),
  bronze: material(0x8a6a3a, { roughness: 0.45, metalness: 0.6 }),
  copperGreen: material(0x4f8a72, { roughness: 0.5, metalness: 0.4 }),
  // stone / concrete
  white: material(0xf0f2f4, { roughness: 0.6 }),
  offWhite: material(0xe4e1d8, { roughness: 0.75 }),
  concrete: material(0xb9bcbf, { roughness: 0.9 }),
  concreteDark: material(0x8a8f94, { roughness: 0.9 }),
  granite: material(0xcfc8bb, { roughness: 0.85 }),
  graniteDark: material(0x9b968c, { roughness: 0.88 }),
  limestone: material(0xe3dccb, { roughness: 0.82 }),
  marble: material(0xeee9df, { roughness: 0.5, metalness: 0.05 }),
  brick: material(0x9a4b36, { roughness: 0.92 }),
  brickDark: material(0x6e3327, { roughness: 0.92 }),
  terracotta: material(0xb5543a, { roughness: 0.88 }),
  asphalt: material(0x4b4f55, { roughness: 1 }),
  sand: material(0xd8c9a3, { roughness: 1 }),
  rock: material(0x8f8d86, { roughness: 0.95 }),
  rockLight: material(0xb9b5ab, { roughness: 0.95 }),
  black: material(0x1c1e22, { roughness: 0.7 }),
  // korean traditional
  hanokWood: material(0x8e3b2b, { roughness: 0.8 }),
  hanokWall: material(0xe8dcc4, { roughness: 0.9 }),
  dancheong: material(0x2f6b5c, { roughness: 0.75 }),
  roofTile: material(0x3f4650, { roughness: 0.75 }),
  roofTileBlue: material(0x2a5c9a, { roughness: 0.6, metalness: 0.1 }),
  roofRed: material(0x8b3a2f, { roughness: 0.8 }),
  // nature
  grass: material(0x5c8a4a, { roughness: 1 }),
  grassDark: material(0x4a7340, { roughness: 1 }),
  foliage: material(0x3e7a3a, { roughness: 1 }),
  trunk: material(0x5a4030, { roughness: 1 }),
  // Deep enough to stay blue under the bright hemisphere/sun lighting of the viewer.
  water: material(0x2a5b91, { roughness: 0.35, metalness: 0.08, transparent: true, opacity: 0.92 }),
  // accents
  red: material(0xc0392b, { roughness: 0.6 }),
  orange: material(0xe07a2c, { roughness: 0.6 }),
  yellow: material(0xf1c40f, { roughness: 0.6 }),
  blue: material(0x2c5fa8, { roughness: 0.6 }),
  navy: material(0x1e3a5f, { roughness: 0.6 }),
  green: material(0x2e8b57, { roughness: 0.6 }),
  purple: material(0x6c4ba3, { roughness: 0.6 }),
  membrane: material(0xf4f2ec, { roughness: 0.7, side: THREE.DoubleSide }),
  glow: material(0xfff0c8, { emissive: 0xffe4a0, emissiveIntensity: 0.8 }),
  warmLight: material(0xffe2b0, { emissive: 0xffc070, emissiveIntensity: 0.9 }),
};

// ── Primitives (bottom-anchored) ─────────────────────────────────────────────

/** Box. `w` along x, `h` along y, `d` along z. `ry` = rotation around y (radians). */
export function box(parent, { w, h, d, x = 0, y = 0, z = 0, mat = M.concrete, ry = 0, rx = 0, rz = 0 }) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y + h / 2, z);
  mesh.rotation.set(rx, ry, rz);
  parent.add(mesh);
  return mesh;
}

/** Cylinder / cone-frustum. `rTop`/`rBot` radii, `h` height. `seg` radial segments (4 = square shaft rotated 45°). */
export function cyl(parent, { rTop, rBot = rTop, h, x = 0, y = 0, z = 0, mat = M.concrete, seg = 24, ry = 0, open = false, sx = 1, sz = 1 }) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, seg, 1, open), mat);
  mesh.position.set(x, y + h / 2, z);
  mesh.rotation.y = ry;
  mesh.scale.set(sx, 1, sz);
  parent.add(mesh);
  return mesh;
}

/** Cone (pointed top). */
export function cone(parent, { r, h, x = 0, y = 0, z = 0, mat = M.concrete, seg = 24, ry = 0, sx = 1, sz = 1 }) {
  const mesh = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat);
  mesh.position.set(x, y + h / 2, z);
  mesh.rotation.y = ry;
  mesh.scale.set(sx, 1, sz);
  parent.add(mesh);
  return mesh;
}

/** Full sphere whose *centre* is at `y + r` (so it rests on y). */
export function sphere(parent, { r, x = 0, y = 0, z = 0, mat = M.white, seg = 20, sx = 1, sy = 1, sz = 1 }) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(8, seg / 2)), mat);
  mesh.position.set(x, y + r * sy, z);
  mesh.scale.set(sx, sy, sz);
  parent.add(mesh);
  return mesh;
}

/** Dome (upper part of a sphere) with its rim on `y`. `scaleY` flattens it. `theta` = how much of the hemisphere (π/2 = full). */
export function dome(parent, { r, x = 0, y = 0, z = 0, mat = M.white, seg = 28, scaleY = 1, theta = Math.PI / 2, sx = 1, sz = 1 }) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(6, Math.round(seg / 2)), 0, Math.PI * 2, 0, theta), mat);
  mesh.position.set(x, y, z);
  mesh.scale.set(sx, scaleY, sz);
  parent.add(mesh);
  return mesh;
}

/** Tapered box (rectangular frustum). Bottom `wBot × dBot`, top `wTop × dTop`, height `h`. */
export function frustum(parent, { wBot, dBot, wTop, dTop, h, x = 0, y = 0, z = 0, mat = M.concrete, ry = 0, shiftX = 0, shiftZ = 0 }) {
  const hb = [wBot / 2, dBot / 2];
  const ht = [wTop / 2, dTop / 2];
  const b = [[-hb[0], 0, hb[1]], [hb[0], 0, hb[1]], [hb[0], 0, -hb[1]], [-hb[0], 0, -hb[1]]];
  const t = [
    [-ht[0] + shiftX, h, ht[1] + shiftZ],
    [ht[0] + shiftX, h, ht[1] + shiftZ],
    [ht[0] + shiftX, h, -ht[1] + shiftZ],
    [-ht[0] + shiftX, h, -ht[1] + shiftZ],
  ];
  const tris = [];
  for (let i = 0; i < 4; i += 1) {
    const j = (i + 1) % 4;
    tris.push(b[i], b[j], t[j], b[i], t[j], t[i]);
  }
  tris.push(t[0], t[1], t[2], t[0], t[2], t[3]); // top
  tris.push(b[2], b[1], b[0], b[3], b[2], b[0]); // bottom
  const mesh = new THREE.Mesh(trianglesToGeometry(tris), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = ry;
  parent.add(mesh);
  return mesh;
}

/** Extruded polygon footprint. `points` = [[x, z], ...] relative to (x, z). */
export function prism(parent, { points, h, x = 0, y = 0, z = 0, mat = M.concrete, ry = 0, holes = [] }) {
  const shape = new THREE.Shape();
  points.forEach(([px, pz], index) => (index === 0 ? shape.moveTo(px, -pz) : shape.lineTo(px, -pz)));
  shape.closePath();
  holes.forEach((hole) => {
    const path = new THREE.Path();
    hole.forEach(([px, pz], index) => (index === 0 ? path.moveTo(px, -pz) : path.lineTo(px, -pz)));
    path.closePath();
    shape.holes.push(path);
  });
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 4, steps: 1 });
  geometry.rotateX(-Math.PI / 2);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = ry;
  parent.add(mesh);
  return mesh;
}

/** Regular polygon prism (e.g. octagon = 8). Rotated so a flat side faces +z. */
export function polygonPrism(parent, { sides, r, h, x = 0, y = 0, z = 0, mat = M.concrete, ry = 0 }) {
  return cyl(parent, { rTop: r, rBot: r, h, x, y, z, mat, seg: sides, ry: ry + Math.PI / sides });
}

/** Horizontal ring (torus lying flat), centre at height `y`. */
export function ring(parent, { r, tube, x = 0, y = 0, z = 0, mat = M.steel, seg = 48, tubeSeg = 8, rx = Math.PI / 2, ry = 0 }) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(r, tube, tubeSeg, seg), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, 0);
  parent.add(mesh);
  return mesh;
}

/** Flat ring/disc (annulus) lying horizontally at height `y`. `rInner` 0 = solid disc. */
export function disc(parent, { r, rInner = 0, x = 0, y = 0, z = 0, mat = M.concrete, seg = 48 }) {
  const mesh = new THREE.Mesh(new THREE.RingGeometry(rInner, r, seg), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.x = -Math.PI / 2;
  mesh.material = mat.side === THREE.DoubleSide ? mat : material(mat.color.getHex(), { roughness: mat.roughness, metalness: mat.metalness, side: THREE.DoubleSide });
  parent.add(mesh);
  return mesh;
}

/** Lathe (revolved profile). `profile` = [[radius, height], ...] from bottom to top. */
export function lathe(parent, { profile, x = 0, y = 0, z = 0, mat = M.concrete, seg = 32 }) {
  const points = profile.map(([r, h]) => new THREE.Vector2(Math.max(r, 0.001), h));
  const geometry = new THREE.LatheGeometry(points, seg);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

/** Straight strut/tube between two 3D points. */
export function strut(parent, { from, to, r = 0.4, mat = M.steel, seg = 8 }) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const length = a.distanceTo(b);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, length, seg), mat);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  parent.add(mesh);
  return mesh;
}

/** Thin flat slab (plinth / plaza / pond). */
export function slab(parent, { w, d, x = 0, y = 0, z = 0, h = 0.6, mat = M.granite, ry = 0 }) {
  return box(parent, { w, h, d, x, y, z, mat, ry });
}

/** Block with an arched opening through it along z (city gates, Dongnimmun). `archW`/`archH` = opening size. */
export function archBlock(parent, { w, h, d, archW, archH, x = 0, y = 0, z = 0, mat = M.granite, ry = 0 }) {
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0);
  shape.lineTo(w / 2, 0);
  shape.lineTo(w / 2, h);
  shape.lineTo(-w / 2, h);
  shape.closePath();
  const hole = new THREE.Path();
  const radius = archW / 2;
  const straight = Math.max(0.1, archH - radius);
  hole.moveTo(-radius, 0);
  hole.lineTo(-radius, straight);
  hole.absarc(0, straight, radius, Math.PI, 0, true);
  hole.lineTo(radius, 0);
  hole.closePath();
  shape.holes.push(hole);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false, curveSegments: 10 });
  geometry.translate(0, 0, -d / 2);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = ry;
  parent.add(mesh);
  return mesh;
}

// ── Roofs ────────────────────────────────────────────────────────────────────

/**
 * Korean hip roof (우진각/팔작 approximation) with gently lifted eave corners.
 * Footprint `w × d` (before overhang), ridge height `h`. `ridge` = ridge length as a fraction of w.
 */
export function hipRoof(parent, { w, d, h, x = 0, y = 0, z = 0, overhang = 2.4, ridge = 0.45, curve = 0.16, mat = M.roofTile, ry = 0, ridgeMat = null }) {
  const W = w + overhang * 2;
  const D = d + overhang * 2;
  const rl = Math.max(0.5, W * ridge);
  const lift = h * curve;
  const A = [-W / 2, lift, D / 2];
  const B = [W / 2, lift, D / 2];
  const C = [W / 2, lift, -D / 2];
  const E = [-W / 2, lift, -D / 2];
  const Fm = [0, 0, D / 2];
  const Bm = [0, 0, -D / 2];
  const Lm = [-W / 2, 0, 0];
  const Rm = [W / 2, 0, 0];
  const R1 = [-rl / 2, h, 0];
  const R2 = [rl / 2, h, 0];
  const tris = [
    // front (+z)
    A, Fm, R1, Fm, R2, R1, Fm, B, R2,
    // back (-z)
    C, Bm, R2, Bm, R1, R2, Bm, E, R1,
    // left (-x)
    E, Lm, R1, Lm, A, R1,
    // right (+x)
    B, Rm, R2, Rm, C, R2,
  ];
  const mesh = new THREE.Mesh(trianglesToGeometry(tris), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = ry;
  parent.add(mesh);
  if (ridgeMat !== false) {
    const beam = box(parent, { w: rl + 1, h: 0.9, d: 1.4, x: 0, y: h - 0.4, z: 0, mat: ridgeMat ?? M.black });
    beam.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), ry);
    beam.position.add(new THREE.Vector3(x, y, z));
    beam.rotation.y = ry;
  }
  return mesh;
}

/** Simple gable roof (two slopes, ridge along x). */
export function gableRoof(parent, { w, d, h, x = 0, y = 0, z = 0, overhang = 1, mat = M.roofTile, ry = 0 }) {
  const W = w + overhang * 2;
  const D = d + overhang * 2;
  const A = [-W / 2, 0, D / 2];
  const B = [W / 2, 0, D / 2];
  const C = [W / 2, 0, -D / 2];
  const E = [-W / 2, 0, -D / 2];
  const R1 = [-W / 2, h, 0];
  const R2 = [W / 2, h, 0];
  const tris = [A, B, R2, A, R2, R1, C, E, R1, C, R1, R2, E, A, R1, B, C, R2];
  const mesh = new THREE.Mesh(trianglesToGeometry(tris), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = ry;
  parent.add(mesh);
  return mesh;
}

/** Pyramid roof (square/rect hip roof meeting at a point). */
export function pyramidRoof(parent, { w, d, h, x = 0, y = 0, z = 0, overhang = 1.5, mat = M.roofTile, ry = 0 }) {
  return hipRoof(parent, { w, d, h, x, y, z, overhang, ridge: 0.01, curve: 0.1, mat, ry, ridgeMat: false });
}

// ── Composite Korean traditional structures ──────────────────────────────────

/**
 * Hanok hall (전각): stone platform, red columns, plaster walls, dancheong beam band, tiled hip roof.
 * `stories` 2 = 중층 hall (e.g. 근정전, 흥인지문 문루). Returns the total height.
 */
export function hanokHall(parent, {
  w, d, x = 0, y = 0, z = 0, ry = 0,
  platformH = 1.2, wallH = 5, roofH = 4.5, overhang = 2.6, stories = 1,
  roofMat = M.roofTile, wallMat = M.hanokWall, columnMat = M.hanokWood, beamMat = M.dancheong, platformMat = M.granite,
  columns = true, platform = true, upperScale = 0.82,
}) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  parent.add(g);

  let base = 0;
  if (platform && platformH > 0) {
    box(g, { w: w + 5, h: platformH, d: d + 5, y: 0, mat: platformMat });
    base = platformH;
  }

  let cw = w;
  let cd = d;
  for (let story = 0; story < stories; story += 1) {
    const wh = story === 0 ? wallH : wallH * 0.8;
    // walls (inset so columns read as separate)
    box(g, { w: cw - 1.4, h: wh, d: cd - 1.4, y: base, mat: wallMat });
    if (columns) {
      const nx = Math.max(2, Math.round(cw / 5));
      const nz = Math.max(2, Math.round(cd / 5));
      for (let i = 0; i < nx; i += 1) {
        const px = -cw / 2 + (cw / (nx - 1)) * i;
        cyl(g, { rTop: 0.45, h: wh, x: px, y: base, z: cd / 2, mat: columnMat, seg: 8 });
        cyl(g, { rTop: 0.45, h: wh, x: px, y: base, z: -cd / 2, mat: columnMat, seg: 8 });
      }
      for (let i = 1; i < nz - 1; i += 1) {
        const pz = -cd / 2 + (cd / (nz - 1)) * i;
        cyl(g, { rTop: 0.45, h: wh, x: cw / 2, y: base, z: pz, mat: columnMat, seg: 8 });
        cyl(g, { rTop: 0.45, h: wh, x: -cw / 2, y: base, z: pz, mat: columnMat, seg: 8 });
      }
    }
    // dancheong beam band under the eaves
    box(g, { w: cw + 1.2, h: 1.1, d: cd + 1.2, y: base + wh, mat: beamMat });
    const rh = story === stories - 1 ? roofH : roofH * 0.55;
    if (story === stories - 1) {
      hipRoof(g, { w: cw, d: cd, h: rh, y: base + wh + 1.1, overhang, mat: roofMat });
    } else {
      // lower skirt roof (a shallow hip roof with a flat top is approximated by a frustum ring)
      frustum(g, { wBot: cw + overhang * 2, dBot: cd + overhang * 2, wTop: cw * upperScale - 1, dTop: cd * upperScale - 1, h: rh, y: base + wh + 1.1, mat: roofMat });
    }
    base += wh + 1.1 + rh;
    cw *= upperScale;
    cd *= upperScale;
  }
  return base;
}

/** Traditional wall/fence segment along x (담장): stone base + tiled cap. */
export function hanokWall(parent, { length, x = 0, y = 0, z = 0, h = 2.4, ry = 0, mat = M.hanokWall, capMat = M.roofTile }) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  parent.add(g);
  box(g, { w: length, h: h * 0.3, d: 1.2, y: 0, mat: M.graniteDark });
  box(g, { w: length, h: h * 0.6, d: 1, y: h * 0.3, mat });
  gableRoof(g, { w: length, d: 1.2, h: 0.7, y: h * 0.9, overhang: 0.3, mat: capMat });
  return g;
}

/** Stone pagoda (석탑) with `tiers` stacked roof stones. */
export function stonePagoda(parent, { tiers = 3, baseW = 3, x = 0, y = 0, z = 0, mat = M.graniteDark }) {
  let h = 0;
  box(parent, { w: baseW, h: 0.8, d: baseW, x, y, z, mat });
  h += 0.8;
  for (let i = 0; i < tiers; i += 1) {
    const s = baseW * (1 - i * 0.18);
    box(parent, { w: s * 0.55, h: 1.1, d: s * 0.55, x, y: y + h, z, mat });
    h += 1.1;
    frustum(parent, { wBot: s * 0.5, dBot: s * 0.5, wTop: s, dTop: s, h: 0.5, x, y: y + h, z, mat });
    h += 0.5;
  }
  cyl(parent, { rTop: 0.12, rBot: 0.18, h: 1.2, x, y: y + h, z, mat, seg: 8 });
  return h + 1.2;
}

// ── Modern building helpers ──────────────────────────────────────────────────

/**
 * Horizontal spandrel bands around a rectangular tower to suggest floors.
 * Adds one thin box every `floorHeight`. Keep `h / floorHeight` under ~90.
 */
export function floorBands(parent, { w, d, h, x = 0, y = 0, z = 0, floorHeight = 3.6, mat = M.steelDark, inset = -0.12, thickness = 0.5, ry = 0 }) {
  const count = Math.min(120, Math.floor(h / floorHeight));
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  parent.add(g);
  for (let i = 1; i <= count; i += 1) {
    box(g, { w: w - inset * 2, h: thickness, d: d - inset * 2, y: i * floorHeight - thickness / 2, mat });
  }
  return g;
}

/** Vertical mullion strips on the ±z faces of a box tower. */
export function mullions(parent, { w, d, h, x = 0, y = 0, z = 0, spacing = 4, mat = M.steel, thickness = 0.35, ry = 0 }) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  parent.add(g);
  const count = Math.min(60, Math.floor(w / spacing));
  for (let i = 0; i <= count; i += 1) {
    const px = -w / 2 + (w / count) * i;
    box(g, { w: thickness, h, d: thickness, x: px, y: 0, z: d / 2, mat });
    box(g, { w: thickness, h, d: thickness, x: px, y: 0, z: -d / 2, mat });
  }
  return g;
}

/** Rectangular tower shorthand: body + floor bands + a slightly inset roof slab. */
export function tower(parent, { w, d, h, x = 0, y = 0, z = 0, mat = M.glass, bandMat = M.steelDark, floorHeight = 3.8, ry = 0, roofMat = M.steelDark, bands = true }) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  parent.add(g);
  box(g, { w, h, d, y: 0, mat });
  if (bands) {
    floorBands(g, { w, d, h, floorHeight, mat: bandMat });
  }
  box(g, { w: w * 0.92, h: 1.2, d: d * 0.92, y: h, mat: roofMat });
  return g;
}

/** Cylindrical tower with floor bands. */
export function roundTower(parent, { r, h, x = 0, y = 0, z = 0, mat = M.glass, bandMat = M.steelDark, floorHeight = 3.8, seg = 32 }) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  cyl(g, { rTop: r, h, y: 0, mat, seg });
  const count = Math.min(120, Math.floor(h / floorHeight));
  for (let i = 1; i <= count; i += 1) {
    cyl(g, { rTop: r + 0.12, h: 0.45, y: i * floorHeight - 0.22, mat: bandMat, seg });
  }
  return g;
}

/** Simple tree: trunk + foliage blob. */
export function tree(parent, { x = 0, y = 0, z = 0, h = 8, r = 3, mat = M.foliage, trunkMat = M.trunk }) {
  cyl(parent, { rTop: 0.25, rBot: 0.4, h: h * 0.4, x, y, z, mat: trunkMat, seg: 6 });
  return sphere(parent, { r, x, y: y + h * 0.4 - r * 0.3, z, mat, seg: 8, sy: (h * 0.6) / (r * 2) + 0.2 });
}

/** Scatter trees along a rectangle edge or inside an area using a deterministic RNG. */
export function treePatch(parent, { w, d, x = 0, y = 0, z = 0, count = 12, seed = 7, h = 8, r = 3, mat = M.foliage }) {
  const rng = seededRandom(seed);
  for (let i = 0; i < count; i += 1) {
    tree(parent, { x: x + (rng() - 0.5) * w, y, z: z + (rng() - 0.5) * d, h: h * (0.8 + rng() * 0.4), r: r * (0.8 + rng() * 0.4), mat });
  }
}

// ── Utilities ────────────────────────────────────────────────────────────────

/** Child group at an offset/rotation. */
export function subgroup(parent, { x = 0, y = 0, z = 0, ry = 0 } = {}) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  parent.add(g);
  return g;
}

/** Position on a circle. */
export function polar(index, count, radius, phase = 0) {
  const angle = phase + (index / count) * Math.PI * 2;
  return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius, angle };
}

export const deg = (value) => (value * Math.PI) / 180;

/** Deterministic PRNG in [0, 1). */
export function seededRandom(seed) {
  let t = seed >>> 0;
  return function next() {
    t += 0x6d2b79f5;
    let value = Math.imul(t ^ (t >>> 15), t | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Build a non-indexed BufferGeometry from a flat list of triangle vertices ([x,y,z] triples). */
export function trianglesToGeometry(tris) {
  const positions = new Float32Array(tris.length * 3);
  tris.forEach((v, i) => {
    positions[i * 3] = v[0];
    positions[i * 3 + 1] = v[1];
    positions[i * 3 + 2] = v[2];
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Merge all meshes in a group by material to cut draw calls. Used by the viewer after `create()`.
 * Meshes flagged with `userData.keepSeparate = true` are left as-is.
 */
export function mergeGroupByMaterial(group) {
  group.updateMatrixWorld(true);
  const buckets = new Map();
  const keep = [];
  const inverse = new THREE.Matrix4().copy(group.matrixWorld).invert();

  group.traverse((object) => {
    if (!object.isMesh) {
      return;
    }
    if (object.userData.keepSeparate || Array.isArray(object.material)) {
      keep.push(object);
      return;
    }
    const geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
    if (!geometry.attributes.normal) {
      geometry.computeVertexNormals();
    }
    geometry.deleteAttribute("uv");
    geometry.deleteAttribute("uv1");
    geometry.deleteAttribute("color");
    const local = new THREE.Matrix4().multiplyMatrices(inverse, object.matrixWorld);
    geometry.applyMatrix4(local);
    if (!buckets.has(object.material)) {
      buckets.set(object.material, []);
    }
    buckets.get(object.material).push(geometry);
  });

  const merged = new THREE.Group();
  merged.position.copy(group.position);
  merged.rotation.copy(group.rotation);
  merged.scale.copy(group.scale);
  merged.userData = group.userData;

  buckets.forEach((geometries, mat) => {
    const total = geometries.reduce((sum, g) => sum + g.attributes.position.count, 0);
    const positions = new Float32Array(total * 3);
    const normals = new Float32Array(total * 3);
    let offset = 0;
    geometries.forEach((g) => {
      positions.set(g.attributes.position.array, offset * 3);
      normals.set(g.attributes.normal.array, offset * 3);
      offset += g.attributes.position.count;
      g.dispose();
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
    merged.add(new THREE.Mesh(geometry, mat));
  });

  keep.forEach((mesh) => {
    const world = mesh.matrixWorld.clone();
    mesh.removeFromParent();
    mesh.matrix.copy(new THREE.Matrix4().multiplyMatrices(inverse, world));
    mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
    merged.add(mesh);
  });

  return merged;
}

/** Bounding info of a group in its local frame: { height, radius, minY, triangles, meshes }. */
export function measureGroup(group) {
  group.updateMatrixWorld(true);
  const inverse = new THREE.Matrix4().copy(group.matrixWorld).invert();
  let maxY = -Infinity;
  let minY = Infinity;
  let radius = 0;
  let triangles = 0;
  let meshes = 0;
  const v = new THREE.Vector3();
  group.traverse((object) => {
    if (!object.isMesh) {
      return;
    }
    meshes += 1;
    const position = object.geometry.attributes.position;
    const index = object.geometry.index;
    triangles += (index ? index.count : position.count) / 3;
    const local = new THREE.Matrix4().multiplyMatrices(inverse, object.matrixWorld);
    for (let i = 0; i < position.count; i += 1) {
      v.fromBufferAttribute(position, i).applyMatrix4(local);
      maxY = Math.max(maxY, v.y);
      minY = Math.min(minY, v.y);
      radius = Math.max(radius, Math.hypot(v.x, v.z));
    }
  });
  return { height: maxY, minY, radius, triangles, meshes };
}

export { THREE };
