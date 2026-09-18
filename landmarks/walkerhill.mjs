// 그랜드 워커힐 서울 (Grand Walkerhill Seoul, 1963 / 본관 1978 / W 2004) - 광진구
// Resort hotel complex on the wooded southern slope of 아차산 above the 한강, modelled on two grass terraces:
//  - 본관 Grand Walkerhill (1978): a long, gently curved 17-storey slab (557 rooms) in beige/white with a white
//    balcony ledge on every floor of the river face, a porte-cochère on the up-slope side and rooftop plant.
//  - 비스타 워커힐 (former W Seoul Walkerhill, 2004): a 15-storey dark-glass slab with a bowed convex front and
//    aluminium bands, standing up-slope north-east of the main hotel and linked to it by a low glass bridge.
//  - 더글라스 하우스 (Kim Swoo-geun, 1963): a 3-storey dark-timber annex among the pines; a row of villas;
//    피자힐 (the W-roofed hilltop bar); 리버파크 outdoor pool; 애스톤 하우스, the stone-and-glass mansion nearest
//    the river; a curving access road (워커힐로) and dense pine forest all around.
// Site ~0.45 of real spacing, building heights 1:1. The viewer supplies the hill itself.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, cone, prism, gableRoof, subgroup, tree, seededRandom, trianglesToGeometry, deg } from "./_helpers.mjs";

const HOTEL = M.offWhite;
const LEDGE = M.white;
const GLASS = M.glassDark;
const TIMBER = material(0x4a3626, { roughness: 0.85 });
const TIMBER_LIGHT = material(0x8a6a48, { roughness: 0.8 });
const PINE = material(0x2f6b3a, { roughness: 1 });
const DECK = material(0xd9d4c8, { roughness: 0.9 });

const T_LOW = 0.3; // river-side ground
const T_MAIN = 4; // main terrace (본관)
const T_UP = 8; // upper terrace (비스타, 더글라스, villas)

// ── Local geometry helpers ───────────────────────────────────────────────────

/** Polygon = rectangle x0..x1 × z0..z1 clipped by the circle of radius R about the origin (n rays). */
function clipRect({ x0, x1, z0, z1, R, n = 40 }) {
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const pts = [];
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    const ux = Math.cos(a);
    const uz = Math.sin(a);
    let t = Infinity;
    if (ux > 1e-9) t = Math.min(t, (x1 - cx) / ux);
    if (ux < -1e-9) t = Math.min(t, (x0 - cx) / ux);
    if (uz > 1e-9) t = Math.min(t, (z1 - cz) / uz);
    if (uz < -1e-9) t = Math.min(t, (z0 - cz) / uz);
    const b = cx * ux + cz * uz;
    const disc = b * b - (cx * cx + cz * cz - R * R);
    if (disc >= 0) t = Math.min(t, -b + Math.sqrt(disc));
    pts.push([cx + ux * t, cz + uz * t]);
  }
  return pts;
}

/** Upward-facing cap triangles over a polygon at height h. */
function capTriangles(points, h) {
  const contour = points.map(([px, pz]) => new THREE.Vector2(px, pz));
  const tris = [];
  THREE.ShapeUtils.triangulateShape(contour, []).forEach(([a, b, c]) => {
    const pa = [points[a][0], h, points[a][1]];
    const pb = [points[b][0], h, points[b][1]];
    const pc = [points[c][0], h, points[c][1]];
    const ny = (pb[2] - pa[2]) * (pc[0] - pa[0]) - (pb[0] - pa[0]) * (pc[2] - pa[2]);
    if (ny > 0) tris.push(pa, pb, pc);
    else tris.push(pa, pc, pb);
  });
  return tris;
}

/** Grass terrace: sloping banks between `bottom` and `top` polygons (same point count, angle-ordered) + flat top. */
function terrace(parent, { bottom, top, h, y = 0, mat = M.grass }) {
  const tris = [];
  const n = bottom.length;
  for (let i = 0; i < n; i += 1) {
    const j = (i + 1) % n;
    const b0 = [bottom[i][0], 0, bottom[i][1]];
    const b1 = [bottom[j][0], 0, bottom[j][1]];
    const t0 = [top[i][0], h, top[i][1]];
    const t1 = [top[j][0], h, top[j][1]];
    tris.push(b0, t1, b1, b0, t0, t1);
  }
  tris.push(...capTriangles(top, h));
  const mesh = new THREE.Mesh(trianglesToGeometry(tris), mat);
  mesh.position.y = y;
  parent.add(mesh);
  return mesh;
}

/** Road ribbon following a 3D centre line ([x, y, z] points), top surface only. */
function ribbon(parent, { path, width = 6, mat = M.asphalt }) {
  const left = [];
  const right = [];
  for (let i = 0; i < path.length; i += 1) {
    const [x, y, z] = path[i];
    const p = path[Math.max(0, i - 1)];
    const q = path[Math.min(path.length - 1, i + 1)];
    let dx = q[0] - p[0];
    let dz = q[2] - p[2];
    const len = Math.hypot(dx, dz) || 1;
    dx /= len;
    dz /= len;
    left.push([x - dz * (width / 2), y, z + dx * (width / 2)]);
    right.push([x + dz * (width / 2), y, z - dx * (width / 2)]);
  }
  const tris = [];
  const quad = (a, b, c, d) => {
    const ny = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]);
    if (ny > 0) tris.push(a, b, c, a, c, d);
    else tris.push(a, c, b, a, d, c);
  };
  for (let i = 0; i < path.length - 1; i += 1) {
    quad(left[i], left[i + 1], right[i + 1], right[i]);
  }
  const mesh = new THREE.Mesh(trianglesToGeometry(tris), mat);
  parent.add(mesh);
  return mesh;
}

/** Curved slab outline: south edge bowed to +z by `sag` (convex to the river), depth `d`, x0..x1, n segments. */
function curvedSlab(x0, x1, zc, sag, d, n = 14, grow = 0) {
  const xm = (x0 + x1) / 2;
  const half = (x1 - x0) / 2;
  const mid = (x) => zc - sag * ((x - xm) / half) ** 2;
  const south = [];
  const north = [];
  for (let i = 0; i <= n; i += 1) {
    const x = x0 + ((x1 - x0) * i) / n;
    const gx = i === 0 ? -grow : i === n ? grow : 0;
    south.push([x + gx, mid(x) + d / 2 + grow]);
    north.push([x + gx, mid(x) - d / 2 - grow]);
  }
  return { points: [...south, ...north.reverse()], mid };
}

/** Rectangle w × d whose +z (front) face bows outward by `bow`; grown outward by `grow`. */
function bowedPlan(w, d, bow, grow = 0, n = 10) {
  const hw = w / 2 + grow;
  const hd = d / 2 + grow;
  const pts = [[-hw, -hd], [hw, -hd]];
  for (let i = 0; i <= n; i += 1) {
    const t = i / n;
    const x = hw - 2 * hw * t;
    pts.push([x, hd + (bow + grow * 0.3) * Math.cos((Math.PI * x) / (2 * hw))]);
  }
  return pts;
}

/** Layered pine: trunk + two stacked cones. */
function pine(parent, { x, y, z, h = 11, r = 2.6 }) {
  cyl(parent, { rTop: 0.22, rBot: 0.38, h: h * 0.42, x, y, z, mat: M.trunk, seg: 5 });
  cone(parent, { r, h: h * 0.5, x, y: y + h * 0.28, z, mat: PINE, seg: 7 });
  cone(parent, { r: r * 0.62, h: h * 0.42, x, y: y + h * 0.58, z, mat: PINE, seg: 7 });
}

/** Deterministic scatter of pines/trees inside x0..x1 × z0..z1, skipping blocked rects and the road. */
function forest(parent, { x0, x1, z0, z1, count, seed, blocked, road, groundY, pines = 0.7, h = 11, r = 2.6, maxR = 51 }) {
  const rng = seededRandom(seed);
  let placed = 0;
  for (let tries = 0; tries < count * 12 && placed < count; tries += 1) {
    const x = x0 + rng() * (x1 - x0);
    const z = z0 + rng() * (z1 - z0);
    const kind = rng();
    const scale = 0.75 + rng() * 0.5;
    if (Math.hypot(x, z) > maxR) continue;
    if (blocked.some(([bx0, bx1, bz0, bz1]) => x > bx0 && x < bx1 && z > bz0 && z < bz1)) continue;
    if (road && road.some(([rx, , rz]) => Math.hypot(rx - x, rz - z) < 5)) continue;
    const y = groundY(x, z);
    if (kind < pines) pine(parent, { x, y, z, h: h * scale, r: r * scale });
    else tree(parent, { x, y, z, h: h * 0.8 * scale, r: r * 1.1 * scale, mat: M.foliage });
    placed += 1;
  }
}

export default {
  id: "walkerhill",
  name: "그랜드 워커힐 서울",
  nameEn: "Grand Walkerhill Seoul",
  district: "광진구",
  lat: 37.5553,
  lon: 127.1101,
  height: 65,
  colliderRadius: 56,
  detail: "medium",
  description: "아차산 자락의 리조트 호텔 단지",
  create() {
    const g = new THREE.Group();
    // The slope falls to the 한강 in the south; the buildings face slightly south-south-east.
    const site = subgroup(g, { ry: deg(8) });

    // ── Terrain: forest floor, main terrace, upper terrace ─────────────────────
    cyl(site, { rTop: 55, h: T_LOW, mat: M.grassDark, seg: 32 });
    const aTop = { x0: -50, x1: 44, z0: -50, z1: 10, R: 52.5 };
    const bTop = { x0: -40, x1: 40, z0: -46, z1: -24, R: 49.5 };
    terrace(site, {
      bottom: clipRect({ x0: -54, x1: 48, z0: -54, z1: 14, R: 55.3 }),
      top: clipRect(aTop),
      h: T_MAIN - T_LOW,
      y: T_LOW,
    });
    terrace(site, {
      bottom: clipRect({ x0: -44, x1: 44, z0: -50, z1: -20, R: 52 }),
      top: clipRect(bTop),
      h: T_UP - T_MAIN,
      y: T_MAIN,
    });
    const inside = (p, x, z, margin = 0.5) => x > p.x0 + margin && x < p.x1 - margin && z > p.z0 + margin && z < p.z1 - margin && Math.hypot(x, z) < p.R - margin;
    const groundY = (x, z) => (inside(bTop, x, z) ? T_UP : inside(aTop, x, z) ? T_MAIN : T_LOW);

    // ── 본관 Grand Walkerhill: curved 17-storey slab ─────────────────────────────
    const HX0 = -42;
    const HX1 = 36;
    const HZ = 0; // southernmost midline
    const SAG = 5.5;
    const HD = 15;
    const LOBBY_H = 5.5;
    const FLOOR = 3.2;
    const roofY = T_MAIN + LOBBY_H + 16 * FLOOR; // 60.7
    const slab = curvedSlab(HX0, HX1, HZ, SAG, HD);
    prism(site, { points: slab.points, h: roofY - T_MAIN, y: T_MAIN, mat: HOTEL });
    // Glazed lobby skirt and the river-side terrace restaurant.
    prism(site, { points: curvedSlab(HX0, HX1, HZ, SAG, HD, 14, 0.35).points, h: LOBBY_H - 0.5, y: T_MAIN, mat: GLASS });
    // River (south) face, floor by floor: projecting white balcony ledge, white balcony parapet, window strip.
    for (let i = 0; i < 16; i += 1) {
      const y = T_MAIN + LOBBY_H + i * FLOOR;
      const ledge = curvedSlab(HX0 + 0.5, HX1 - 0.5, HZ + HD / 2 + 0.55, SAG, 1.5, 14);
      prism(site, { points: ledge.points, h: 0.3, y, mat: LEDGE });
      const parapet = curvedSlab(HX0 + 0.5, HX1 - 0.5, HZ + HD / 2 + 0.25, SAG, 0.5, 14);
      prism(site, { points: parapet.points, h: 0.9, y: y + 0.3, mat: LEDGE });
      const band = curvedSlab(HX0 + 0.5, HX1 - 0.5, HZ + HD / 2 + 0.1, SAG, 0.3, 14);
      prism(site, { points: band.points, h: 1.5, y: y + 1.2, mat: GLASS });
      // North face: continuous window band.
      const north = curvedSlab(HX0 + 0.5, HX1 - 0.5, HZ - HD / 2 - 0.1, SAG, 0.3, 14);
      prism(site, { points: north.points, h: 1.5, y: y + 1.1, mat: GLASS });
    }
    // Vertical stair/lift cores breaking the long facade (north side) and the end walls.
    [-22, 16].forEach((x) => box(site, { w: 4, h: roofY - T_MAIN + 2.5, d: 3, x, y: T_MAIN, z: slab.mid(x) - HD / 2 - 1.2, mat: M.concrete }));
    // Roof: parapet, plant rooms, lift overruns.
    prism(site, { points: curvedSlab(HX0, HX1, HZ, SAG, HD, 14, 0.3).points, h: 1.0, y: roofY, mat: HOTEL });
    box(site, { w: 16, h: 3, d: 7, x: -3, y: roofY + 1, z: slab.mid(-3) - 1, mat: M.concreteDark });
    box(site, { w: 8, h: 2.4, d: 6, x: 20, y: roofY + 1, z: slab.mid(20) - 1, mat: M.concreteDark });
    box(site, { w: 8, h: 2.4, d: 6, x: -28, y: roofY + 1, z: slab.mid(-28) - 1, mat: M.concreteDark });
    // Porte-cochère on the up-slope (north) side.
    const pcz = slab.mid(-3) - HD / 2;
    box(site, { w: 24, h: 0.7, d: 9.5, x: -3, y: T_MAIN + 5.0, z: pcz - 4.5, mat: LEDGE });
    [-11, -4, 4, 11].forEach((dx) => cyl(site, { rTop: 0.5, h: 5.0, x: -3 + dx, y: T_MAIN, z: pcz - 8.2, mat: M.concrete, seg: 8 }));
    // Riverside pool terrace / lawn in front of the lobby.
    box(site, { w: 40, h: 0.25, d: 6, x: -3, y: T_MAIN, z: HZ + HD / 2 + 4.5, mat: M.granite });

    // ── 비스타 워커힐 (former W Seoul): bowed dark-glass slab up-slope to the north-east ──
    {
      const v = subgroup(site, { x: 14, z: -36, ry: deg(-20) });
      const VW = 28;
      const VD = 13;
      const VH = 15 * 3.6;
      prism(v, { points: bowedPlan(VW, VD, 3), h: VH, y: T_UP, mat: GLASS });
      prism(v, { points: bowedPlan(VW, VD, 3, 0.3), h: 4.5, y: T_UP, mat: M.glassWhite }); // lobby
      for (let i = 1; i < 15; i += 1) {
        prism(v, { points: bowedPlan(VW, VD, 3, 0.25), h: 0.4, y: T_UP + i * 3.6 - 0.2, mat: M.aluminum });
      }
      // Solid aluminium end walls and roof.
      box(v, { w: 1.2, h: VH + 0.8, d: VD + 0.4, x: -VW / 2 + 0.4, y: T_UP, mat: M.aluminum });
      box(v, { w: 1.2, h: VH + 0.8, d: VD + 0.4, x: VW / 2 - 0.4, y: T_UP, mat: M.aluminum });
      prism(v, { points: bowedPlan(VW, VD, 3, 0.35), h: 0.8, y: T_UP + VH, mat: M.aluminum });
      box(v, { w: 10, h: 2.5, d: 5, x: 2, y: T_UP + VH + 0.8, z: -2, mat: M.steelDark });
      // Entrance canopy on the up-slope (back) side.
      box(v, { w: 12, h: 0.5, d: 6, x: 0, y: T_UP + 4.5, z: -VD / 2 - 3, mat: M.aluminum });
      [-4.5, 4.5].forEach((dx) => cyl(v, { rTop: 0.3, h: 4.5, x: dx, y: T_UP, z: -VD / 2 - 5.5, mat: M.aluminum, seg: 8 }));
    }
    // Low glass bridge linking 본관 and 비스타 over the road.
    box(site, { w: 3, h: 3.4, d: 15, x: 26, y: T_UP + 0.5, z: -17.5, mat: M.glass });
    box(site, { w: 3.4, h: 0.4, d: 15.4, x: 26, y: T_UP + 3.9, z: -17.5, mat: M.aluminum });
    [-12, -21].forEach((z) => cyl(site, { rTop: 0.35, h: T_UP + 0.5 - T_MAIN, x: 26, y: T_MAIN, z, mat: M.aluminum, seg: 8 }));

    // ── 더글라스 하우스: 3-storey dark timber annex among the pines (upper terrace) ─
    {
      const x = -16;
      const z = -38;
      box(site, { w: 24, h: 10, d: 9, x, y: T_UP, z, mat: TIMBER });
      for (let i = 0; i < 3; i += 1) {
        box(site, { w: 24.6, h: 0.35, d: 9.6, x, y: T_UP + 0.2 + i * 3.3, z, mat: TIMBER_LIGHT });
        box(site, { w: 23, h: 1.4, d: 0.3, x, y: T_UP + 1.6 + i * 3.3, z: z + 4.6, mat: GLASS });
      }
      box(site, { w: 25.4, h: 0.6, d: 10.4, x, y: T_UP + 10, z, mat: M.concreteDark });
    }
    // Villas (1963) in a row along the upper slope.
    [[-36, -27], [-31, -33], [-25, -38]].forEach(([x, z], i) => {
      box(site, { w: 6, h: 5.5, d: 6, x, y: T_UP, z, mat: HOTEL, ry: deg(-20) });
      box(site, { w: 6.8, h: 0.4, d: 6.8, x, y: T_UP + 5.5, z, mat: M.concreteDark, ry: deg(-20) });
      box(site, { w: 5, h: 1.2, d: 0.3, x, y: T_UP + 3.2, z: z + 3.1, mat: GLASS, ry: deg(-20) });
      if (i === 1) box(site, { w: 2, h: 2, d: 2, x: x + 1.5, y: T_UP + 5.9, z: z - 1.5, mat: M.concrete });
    });

    // ── 피자힐 (Kim Swoo-geun's Hilltop Bar): W-roofed pavilion on a knoll at the west end ─
    {
      const x = -46;
      const z = 12;
      cyl(site, { rTop: 4.5, rBot: 7.5, h: 7, x, y: T_LOW, z, mat: M.grass, seg: 14 });
      box(site, { w: 8, h: 3.2, d: 6, x, y: T_LOW + 7, z, mat: GLASS });
      [-1.4, 1.4].forEach((dx) => {
        box(site, { w: 3.2, h: 0.35, d: 7, x: x - 2.8 + dx, y: T_LOW + 10.6, z, mat: M.concrete, rz: dx < 0 ? -0.5 : 0.5 });
        box(site, { w: 3.2, h: 0.35, d: 7, x: x + 2.8 + dx, y: T_LOW + 10.6, z, mat: M.concrete, rz: dx < 0 ? -0.5 : 0.5 });
      });
    }

    // ── 리버파크 outdoor pool (south-east, river side) ─────────────────────────────
    box(site, { w: 28, h: 0.5, d: 14, x: 14, y: T_LOW, z: 22, mat: DECK });
    box(site, { w: 22, h: 0.45, d: 9, x: 14, y: T_LOW, z: 22, mat: M.water });
    box(site, { w: 8, h: 3.5, d: 3, x: 4, y: T_LOW + 0.5, z: 16.5, mat: M.white }); // pool house
    [8, 14, 20].forEach((x) => {
      cyl(site, { rTop: 0.08, h: 2.2, x, y: T_LOW + 0.5, z: 28, mat: M.steel, seg: 5 });
      cone(site, { r: 1.4, h: 0.6, x, y: T_LOW + 2.4, z: 28, mat: M.orange, seg: 8 });
    });

    // ── 애스톤 하우스: stone-and-glass mansion nearest the river ───────────────────
    {
      const x = -14;
      const z = 24;
      box(site, { w: 14, h: 7.5, d: 10, x, y: T_LOW, z, mat: M.limestone });
      box(site, { w: 12, h: 6.5, d: 0.5, x, y: T_LOW + 0.5, z: z + 5.1, mat: M.glassWhite });
      box(site, { w: 0.5, h: 6.5, d: 8, x: x + 7.1, y: T_LOW + 0.5, z, mat: M.glassWhite });
      gableRoof(site, { w: 14, d: 10, h: 3, x, y: T_LOW + 7.5, z, overhang: 0.8, mat: M.roofTile });
      box(site, { w: 1.4, h: 3.5, d: 1.4, x: x - 4, y: T_LOW + 8, z: z - 2, mat: M.graniteDark });
      box(site, { w: 22, h: 0.2, d: 8, x, y: T_LOW, z: z + 10, mat: M.grass }); // front lawn
    }

    // ── 워커힐로: access road from the river side, around the east end, along the back of 본관 ─
    const road = [
      [26, T_LOW, 44], [30, T_LOW, 36], [36, T_LOW, 26], [40, T_LOW + 0.2, 16], [43, T_MAIN - 1.5, 10],
      [43, T_MAIN, 2], [41, T_MAIN, -6], [36, T_MAIN, -14], [28, T_MAIN, -19], [16, T_MAIN, -20],
      [2, T_MAIN, -19.5], [-12, T_MAIN, -19.5], [-26, T_MAIN, -19.5], [-36, T_MAIN, -17], [-42, T_MAIN, -12],
    ].map(([x, y, z]) => [x, y + 0.12, z]);
    ribbon(site, { path: road, width: 6 });
    // Guest parking at the west end and the pool car park.
    box(site, { w: 10, h: 0.15, d: 14, x: -40, y: T_MAIN + 0.05, z: -8, mat: M.asphalt });

    // ── Pine forest and lawns all around ──────────────────────────────────────────
    const blocked = [
      [HX0 - 1, HX1 + 1, -14, 10], // 본관 + porte-cochère + terrace
      [-2, 31, -47, -22], // 비스타 (rotated bounding box)
      [24, 28, -26, -9], // bridge
      [-29, -3, -43.5, -32.5], // 더글라스 하우스
      [-40, -21, -42, -23], // villas
      [-54, -38, 4, 20], // 피자힐 knoll
      [-1, 29, 14, 30], // pool deck
      [-22, -6, 18, 30], // 애스톤 하우스
      [-46, -34, -16, 0], // parking
    ];
    const common = { blocked, road, groundY };
    forest(site, { ...common, x0: -40, x1: 40, z0: -49, z1: -22, count: 34, seed: 3 }); // upper slope
    forest(site, { ...common, x0: -50, x1: 44, z0: -22, z1: 10, count: 22, seed: 7, pines: 0.8 }); // around 본관
    forest(site, { ...common, x0: -52, x1: 50, z0: 10, z1: 52, count: 40, seed: 11, pines: 0.6 }); // lower slope
    forest(site, { ...common, x0: 38, x1: 54, z0: -24, z1: 12, count: 10, seed: 19 }); // east edge
    forest(site, { ...common, x0: -54, x1: -44, z0: -30, z1: 4, count: 8, seed: 23 }); // west edge

    return g;
  },
};
