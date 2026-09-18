// 파크원·IFC서울 (Parc1 & IFC Seoul) - 영등포구
// Yeouido financial cluster, compressed to ~0.35 of the real spacing with real heights:
//  - Parc1 (RSHP 2020): Tower 1 (69F, 318 m roof / 333 m red crown) and Tower 2 (53F, 246 / 256 m),
//    square blue-glass plans with notched corners, exposed red-orange corner columns, red belt bands
//    and a red frame crown; The Hyundai Seoul podium (8F, 47 m, glass roof) and the Fairmont hotel (30F, 126 m).
//  - IFC Seoul (Arquitectonica 2012): One (185 m), Two (176 m), Three (284 m) - dark-glass prisms whose
//    tops are sliced into sloping crystalline facets - plus the bowed Conrad Seoul slab (199 m) and the
//    angular glass IFC Mall pavilions on the green commons.
//  - LG Twin Towers (1987): two identical 34F (136 m) bronze-glass slabs on a light connecting base.
// Layout: IFC west (x < -10), Parc1 centre/east, LG Twin Towers north-east.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, frustum, slab, tree, trianglesToGeometry } from "./_helpers.mjs";

const RED = material(0xb7402a, { roughness: 0.55 });
const BRONZE_GLASS = material(0x5a4a3c, { metalness: 0.7, roughness: 0.3 });
const BRONZE_BAND = material(0x7a6248, { metalness: 0.5, roughness: 0.45 });
const BAND = M.steelDark;

// ── Local geometry helpers (single-mesh polygon blocks) ─────────────────────

/** Points ordered like `frustum` (SW -> SE -> NE -> NW, i.e. negative shoelace sum in x/z). */
function orient(points) {
  let sum = 0;
  for (let i = 0; i < points.length; i += 1) {
    const [x0, z0] = points[i];
    const [x1, z1] = points[(i + 1) % points.length];
    sum += x0 * z1 - x1 * z0;
  }
  return sum > 0 ? points.slice().reverse() : points.slice();
}

/** Uniform outward offset of a footprint (mitred corners), so bands sit parallel to every facade. */
function grow(points, amount) {
  const pts = orient(points);
  const n = pts.length;
  const normal = (a, b) => {
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    const len = Math.hypot(dx, dz) || 1;
    return [-dz / len, dx / len]; // outward for the SW->SE->NE->NW ordering
  };
  return pts.map((p, i) => {
    const n1 = normal(pts[(i + n - 1) % n], p);
    const n2 = normal(p, pts[(i + 1) % n]);
    const denom = 1 + n1[0] * n2[0] + n1[1] * n2[1];
    return [p[0] + (amount * (n1[0] + n2[0])) / denom, p[1] + (amount * (n1[1] + n2[1])) / denom];
  });
}

/** Cap triangles of a (possibly concave) footprint at the heights given by `topFn(x, z)`. */
function capTriangles(points, topFn, up) {
  const contour = points.map(([x, z]) => new THREE.Vector2(x, z));
  const faces = THREE.ShapeUtils.triangulateShape(contour, []);
  const tris = [];
  faces.forEach(([a, b, c]) => {
    const pa = [points[a][0], topFn(points[a][0], points[a][1]), points[a][1]];
    const pb = [points[b][0], topFn(points[b][0], points[b][1]), points[b][1]];
    const pc = [points[c][0], topFn(points[c][0], points[c][1]), points[c][1]];
    // Make the face point up (or down) regardless of the triangulator's winding.
    const ux = pb[0] - pa[0]; const uz = pb[2] - pa[2];
    const vx = pc[0] - pa[0]; const vz = pc[2] - pa[2];
    const ny = uz * vx - ux * vz; // y component of (b-a) x (c-a)
    if ((ny > 0) === up) tris.push(pa, pb, pc);
    else tris.push(pa, pc, pb);
  });
  return tris;
}

/** Triangles of a vertical block over `points` from y0 to topFn(x, z) (sheared / sloping top). */
function blockTriangles(points, y0, topFn) {
  const pts = orient(points);
  const n = pts.length;
  const tris = [];
  for (let i = 0; i < n; i += 1) {
    const [xa, za] = pts[i];
    const [xb, zb] = pts[(i + 1) % n];
    const b0 = [xa, y0, za];
    const b1 = [xb, y0, zb];
    const t0 = [xa, topFn(xa, za), za];
    const t1 = [xb, topFn(xb, zb), zb];
    tris.push(b0, b1, t1, b0, t1, t0);
  }
  tris.push(...capTriangles(pts, topFn, true));
  tris.push(...capTriangles(pts, () => y0, false));
  return tris;
}

/**
 * One mesh: prism over a footprint with a flat (`h`) or sloping (`top(x, z)`) top.
 * Footprint coordinates are relative to (x, z); heights relative to `y`.
 */
function polyBlock(parent, { points, x = 0, y = 0, z = 0, h = 10, top = null, mat = M.concrete }) {
  const topFn = top ?? (() => h);
  const mesh = new THREE.Mesh(trianglesToGeometry(blockTriangles(points, 0, topFn)), mat);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

/** Thin floor bands (one merged mesh) around a footprint from y0 up to yMax. */
function bandStack(parent, { points, x = 0, z = 0, y0 = 0, yMax, floorHeight = 4.6, thickness = 0.32, offset = 0.14, mat = BAND }) {
  const pts = grow(points, offset);
  const tris = [];
  for (let y = y0 + floorHeight; y + thickness < yMax; y += floorHeight) {
    tris.push(...blockTriangles(pts, y - thickness, () => y));
  }
  if (!tris.length) return null;
  const mesh = new THREE.Mesh(trianglesToGeometry(tris), mat);
  mesh.position.set(x, 0, z);
  parent.add(mesh);
  return mesh;
}

const rect = (w, d) => [[-w / 2, d / 2], [w / 2, d / 2], [w / 2, -d / 2], [-w / 2, -d / 2]];

/** Square plan with the four corners notched back by `n` (the Parc1 plan; the red columns sit in the notches). */
function notchedSquare(w, n) {
  const h = w / 2;
  const i = h - n;
  return [
    [-i, h], [i, h], [i, i], [h, i], [h, -i], [i, -i],
    [i, -h], [-i, -h], [-i, -i], [-h, -i], [-h, i], [-i, i],
  ];
}

/** Rectangle with one vertical corner chiselled off (`corner`: "ne" | "nw" | "se" | "sw"). */
function chamferedRect(w, d, cut, corner) {
  const hw = w / 2;
  const hd = d / 2;
  const pts = [];
  const push = (x, z) => pts.push([x, z]);
  // SW -> SE -> NE -> NW, replacing the chosen corner by two points.
  if (corner === "sw") { push(-hw, hd - cut); push(-hw + cut, hd); } else push(-hw, hd);
  if (corner === "se") { push(hw - cut, hd); push(hw, hd - cut); } else push(hw, hd);
  if (corner === "ne") { push(hw, -hd + cut); push(hw - cut, -hd); } else push(hw, -hd);
  if (corner === "nw") { push(-hw + cut, -hd); push(-hw, -hd + cut); } else push(-hw, -hd);
  return pts;
}

/** Rectangle whose +z (south) side bows outward by `bulge` (the Conrad's curved facade). */
function bowedRect(w, d, bulge, segments = 8) {
  const hw = w / 2;
  const hd = d / 2;
  const pts = [[-hw, -hd], [hw, -hd]];
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const x = hw - t * w;
    const s = Math.sin(t * Math.PI);
    pts.push([x, hd + bulge * s]);
  }
  return pts;
}

// ── Building blocks ──────────────────────────────────────────────────────────

/** Parc1 office tower: notched blue-glass plan, red corner columns, red belts, red crown frame. */
function parc1Tower(g, { x, z, w, roof, crown, floorHeight, belts }) {
  const n = w * 0.125; // notch depth
  const c = 1.5; // column thickness
  const half = w / 2;
  const plan = notchedSquare(w, n);

  polyBlock(g, { points: plan, x, z, h: roof, mat: M.glassBlue });
  bandStack(g, { points: plan, x, z, yMax: roof - 0.5, floorHeight, thickness: 0.3, offset: 0.12 });

  // Rooftop plant enclosure hides the top of the glass and reads as the flat roof.
  box(g, { w: w - 2 * n - 0.4, h: 2.4, d: w - 2 * n - 0.4, x, y: roof, z, mat: M.steelDark });
  box(g, { w: w * 0.42, h: 3.2, d: w * 0.3, x, y: roof + 2.4, z, mat: M.concreteDark });

  // Exposed red structure: two round columns per corner standing in the notch, full height + crown.
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => {
    const a = [sx * (half - c / 2), sz * (half - n + c / 2)];
    const b = [sx * (half - n + c / 2), sz * (half - c / 2)];
    cyl(g, { rTop: c / 2, h: crown, x: x + a[0], z: z + a[1], mat: RED, seg: 8 });
    cyl(g, { rTop: c / 2, h: crown, x: x + b[0], z: z + b[1], mat: RED, seg: 8 });
    // Horizontal red ties between the pair (belt levels + crown).
    [...belts, roof + 1.5, crown - 1.6].forEach((y) => {
      box(g, { w: n, h: 1.3, d: n, x: x + sx * (half - n / 2), y, z: z + sz * (half - n / 2), mat: RED });
    });
  });

  // Red belt bands (outrigger floors) wrapping the whole plan.
  belts.forEach((y) => {
    const mesh = new THREE.Mesh(trianglesToGeometry(blockTriangles(grow(plan, 0.4), y, () => y + 1.5)), RED);
    mesh.position.set(x, 0, z);
    g.add(mesh);
  });

  // Crown frame: beams along the four faces linking the column tops, and a lower ring at roof level.
  [crown - 1.6, roof + 1.5].forEach((y) => {
    const len = w - 2 * n + c;
    box(g, { w: 1.3, h: 1.4, d: len, x: x + (half - c / 2), y, z, mat: RED });
    box(g, { w: 1.3, h: 1.4, d: len, x: x - (half - c / 2), y, z, mat: RED });
    box(g, { w: len, h: 1.4, d: 1.3, x, y, z: z + (half - c / 2), mat: RED });
    box(g, { w: len, h: 1.4, d: 1.3, x, y, z: z - (half - c / 2), mat: RED });
  });
}

const IFC_BAND = material(0x6b7f8e, { roughness: 0.45, metalness: 0.6 });

/** IFC office tower: dark-glass prism with a sloping, faceted crown. `top(x, z)` in local coordinates. */
function ifcTower(g, { x, z, points, top, floorHeight = 4.7, minTop }) {
  polyBlock(g, { points, x, z, top, mat: M.glassDark });
  bandStack(g, { points, x, z, yMax: minTop - 1, floorHeight, thickness: 0.3, offset: 0.12, mat: IFC_BAND });
}

// ── Landmark ─────────────────────────────────────────────────────────────────

export default {
  id: "parc1-ifc",
  name: "파크원·IFC서울",
  nameEn: "Parc1 & IFC Seoul",
  district: "영등포구",
  lat: 37.5265,
  lon: 126.9275,
  height: 333,
  colliderRadius: 58,
  detail: "high",
  description: "빨간 기둥의 파크원 트윈타워와 IFC 3개 타워",
  create() {
    const g = new THREE.Group();

    // ── Ground: granite plaza over the whole (cleared) site, lawn commons, trees ──
    const plaza = [];
    for (let i = 0; i < 20; i += 1) {
      const a = (i / 20) * Math.PI * 2;
      plaza.push([Math.cos(a) * 55, Math.sin(a) * 55]);
    }
    polyBlock(g, { points: plaza, h: 0.5, mat: M.granite });
    // Streets between the three blocks (Gukjegeumyung-ro / Yeoui-daero).
    box(g, { w: 3.5, h: 0.55, d: 100, x: -10.5, z: 0, mat: M.asphalt });
    box(g, { w: 56, h: 0.55, d: 3.5, x: 20, z: -25, mat: M.asphalt });
    // IFC green commons.
    slab(g, { w: 24, d: 17, x: -24, y: 0.5, z: 1.5, h: 0.35, mat: M.grass });

    // ── IFC Seoul (west) ────────────────────────────────────────────────────
    // Three IFC - 55F, 284 m. Two crystalline facets meeting at a sloping ridge (peak at the NE).
    {
      const w = 22;
      const west = [[-11, 11], [2, 11], [2, -11], [-11, -11]];
      const east = [[2, 11], [11, 11], [11, -11], [2, -11]];
      const ridge = (xz) => 284 - 6 * ((xz + 11) / 22);
      const topW = (px, pz) => ridge(pz) - 16 * ((2 - px) / 13);
      const topE = (px, pz) => ridge(pz) - 10 * ((px - 2) / 9);
      polyBlock(g, { points: west, x: -24, z: -21, top: topW, mat: M.glassDark });
      polyBlock(g, { points: east, x: -24, z: -21, top: topE, mat: M.glassDark });
      bandStack(g, { points: rect(w, w), x: -24, z: -21, yMax: 261, floorHeight: 4.7, thickness: 0.3, offset: 0.12, mat: IFC_BAND });
      // Two-storey glass lobby skirt.
      box(g, { w: w + 3, h: 9, d: w + 3, x: -24, y: 0.5, z: -21, mat: M.glass });
    }
    // One IFC - 32F, 185 m. Chiselled NE corner, roof sloping down towards the east.
    ifcTower(g, {
      x: -46, z: 2,
      points: chamferedRect(18, 19, 5, "ne"),
      top: (px) => 185 - 13 * ((px + 9) / 18),
      minTop: 172,
    });
    // Two IFC - 29F, 176 m. Chiselled SW corner, roof sloping down towards the north.
    ifcTower(g, {
      x: -22, z: 23,
      points: chamferedRect(19, 20, 5, "sw"),
      top: (px, pz) => 176 - 12 * ((10 - pz) / 20) - 3 * ((px + 9.5) / 19),
      minTop: 161,
    });
    // Conrad Seoul - 38F, 199 m. Bowed south face, roof sloping down towards the east.
    {
      const pts = bowedRect(16, 11, 1.5, 8);
      polyBlock(g, { points: pts, x: -42.5, z: 21.5, top: (px) => 199 - 11 * ((px + 8) / 16), mat: M.glass });
      bandStack(g, { points: pts, x: -42.5, z: 21.5, yMax: 187, floorHeight: 4.7, thickness: 0.3, offset: 0.12, mat: IFC_BAND });
      // Hotel porte-cochere / ballroom block at the base.
      box(g, { w: 12, h: 8, d: 6, x: -40, y: 0.5, z: 30, mat: M.glassWhite });
    }
    // IFC Mall pavilions: angular glass wedges on the commons (the "dragon" skylight and the west entry).
    polyBlock(g, { points: rect(14, 7), x: -20, y: 0.85, z: -3, top: (px) => 3 + 7 * ((px + 7) / 14), mat: M.glass });
    polyBlock(g, { points: rect(8, 6), x: -32, y: 0.85, z: 8, top: (px) => 2.5 + 4.5 * ((px + 4) / 8), mat: M.glass });

    // ── Parc1 (centre / east) ───────────────────────────────────────────────
    // Tower 1 - 69F, 318 m roof, red crown to 333 m.
    parc1Tower(g, { x: 4, z: -10, w: 26, roof: 318, crown: 333, floorHeight: 4.6, belts: [56, 112, 168, 224, 280] });
    // Tower 2 - 53F, 246 m roof, red crown to 256 m.
    parc1Tower(g, { x: 33, z: -2, w: 22, roof: 246, crown: 256, floorHeight: 4.6, belts: [56, 112, 168, 224] });

    // The Hyundai Seoul - 8-storey department store podium (47 m) with a glass roof.
    {
      const w = 46;
      const d = 27;
      const x = 16;
      const z = 23.5;
      box(g, { w, h: 40, d, x, y: 0.5, z, mat: M.offWhite });
      // Horizontal glass strips (the "kite" facade) and a glazed ground floor.
      box(g, { w: w + 0.3, h: 5.5, d: d + 0.3, x, y: 0.5, z, mat: M.glassWhite });
      [14, 24, 34].forEach((y) => box(g, { w: w + 0.2, h: 2.2, d: d + 0.2, x, y, z, mat: M.glassWhite }));
      // Rooftop glass hill (atrium skylight) with white ribs.
      frustum(g, { wBot: 38, dBot: 20, wTop: 26, dTop: 9, h: 6.5, x, y: 40.5, z, mat: M.glass });
      for (let i = -3; i <= 3; i += 1) {
        box(g, { w: 0.5, h: 0.5, d: 21, x: x + i * 5.5, y: 44.7 - Math.abs(i) * 0.9, z, mat: M.white });
      }
      // Red columns along the mall's west and south edges echo the towers.
      for (let i = 0; i < 5; i += 1) {
        box(g, { w: 1, h: 42, d: 1, x: x - w / 2 - 0.9, y: 0.5, z: z - d / 2 + 2 + i * ((d - 4) / 4), mat: RED });
      }
    }

    // Fairmont Ambassador Seoul - 30F hotel, 122 m roof, slim red corner columns to 126 m.
    {
      const x = 44.5;
      const z = 18.5;
      const w = 11;
      const d = 16;
      box(g, { w, h: 122, d, x, y: 0.5, z, mat: M.glass });
      bandStack(g, { points: rect(w, d), x, z, y0: 0.5, yMax: 121, floorHeight: 4.2, thickness: 0.3, offset: 0.12 });
      box(g, { w: w - 2, h: 2, d: d - 2, x, y: 122.5, z, mat: M.steelDark });
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => {
        box(g, { w: 0.9, h: 126, d: 0.9, x: x + sx * (w / 2 + 0.2), z: z + sz * (d / 2 + 0.2), mat: RED });
      });
      box(g, { w: w + 1.4, h: 1, d: 1, x, y: 125, z: z + d / 2 + 0.2, mat: RED });
      box(g, { w: w + 1.4, h: 1, d: 1, x, y: 125, z: z - d / 2 - 0.2, mat: RED });
    }

    // ── LG Twin Towers (north-east) - two 34F bronze-glass slabs on a light base ──
    {
      const z = -33;
      box(g, { w: 25, h: 10, d: 13, x: 29, y: 0.5, z, mat: M.limestone });
      box(g, { w: 9, h: 12, d: 9.4, x: 29, y: 0.5, z, mat: M.glassDark });
      [22, 36].forEach((x) => {
        box(g, { w: 10, h: 136, d: 12, x, y: 0.5, z, mat: BRONZE_GLASS });
        bandStack(g, { points: rect(10, 12), x, z, y0: 0.5, yMax: 134, floorHeight: 4, thickness: 0.35, offset: 0.1, mat: BRONZE_BAND });
        box(g, { w: 10.3, h: 3.2, d: 12.3, x, y: 132, z, mat: BRONZE_BAND });
        box(g, { w: 6, h: 1.6, d: 7, x, y: 136.5, z, mat: M.steelDark });
      });
    }

    // ── Trees ────────────────────────────────────────────────────────────────
    const trees = [
      [-30, -2], [-17, 6], [-34, -4], [-13, 8], [-26, 10],
      [-6, 40], [4, 41], [14, 42], [24, 41], [34, 38],
      [-8, -38], [-4, -36], [8, -37], [-40, -34], [-40, 38],
      [46, -14], [48, -4], [50, 8], [-52, -12], [-28, 42], [-14, 40],
    ];
    trees.forEach(([tx, tz], i) => tree(g, { x: tx, y: 0.5, z: tz, h: 7 + (i % 3), r: 2.4 + (i % 2) * 0.5 }));

    return g;
  },
};
