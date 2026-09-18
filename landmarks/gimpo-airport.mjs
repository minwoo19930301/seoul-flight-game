// 김포국제공항 (Gimpo International Airport) - 강서구
// Domestic-terminal area at ~0.45 plan scale (heights 1 unit ≈ 1 m): the 400 m long, four-storey
// domestic terminal with its shallow silver vault roof, glass facades, landside departure viaduct and
// car-park block; the 롯데몰 김포공항 / 김포공항역 block with its rounded glass atrium and the hotel wing at
// the north-east; the 67 m 1988 control tower (white tapering shaft, green-glass octagonal cab) on the
// apron to the north-west; and the central apron with five nose-in airliners on jet bridges.
// The whole site is rotated to the 14/32 runway bearing (135°/315° true) so it lines up with the runways on the map.
import * as THREE from "../vendor/three.module.js";
import { M, box, cyl, sphere, dome, prism, polygonPrism, strut, slab, floorBands, tree, subgroup, deg } from "./_helpers.mjs";

/** Shallow barrel-vault roof: parabolic arc across `w` (x), extruded along z for `len`, bottom of the eaves on `y`. */
function vault(parent, { w, len, rise, thick = 1, x = 0, y = 0, z = 0, mat = M.aluminum, segments = 16 }) {
  const shape = new THREE.Shape();
  const arc = (t) => [(t * w) / 2, rise * (1 - t * t)];
  for (let i = 0; i <= segments; i += 1) {
    const [px, py] = arc(-1 + (2 * i) / segments);
    if (i === 0) shape.moveTo(px, py + thick);
    else shape.lineTo(px, py + thick);
  }
  for (let i = segments; i >= 0; i -= 1) {
    const [px, py] = arc(-1 + (2 * i) / segments);
    shape.lineTo(px, py);
  }
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: len, bevelEnabled: false, curveSegments: 1, steps: 1 });
  geometry.translate(0, 0, -len / 2);
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

/** Thin vertical plate: polygon in the x-y plane, `thick` along z, centred on z (tail fins). */
function plate(parent, { points, thick = 0.5, x = 0, y = 0, z = 0, mat = M.white, ry = 0 }) {
  const shape = new THREE.Shape();
  points.forEach(([px, py], i) => (i === 0 ? shape.moveTo(px, py) : shape.lineTo(px, py)));
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: thick, bevelEnabled: false, curveSegments: 1, steps: 1 });
  geometry.translate(0, 0, -thick / 2);
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = ry;
  parent.add(mesh);
  return mesh;
}

/** Tapered tube between two points (`rA` at `from`, `rB` at `to`): fuselages, tail cones, engines. */
function tube(parent, { from, to, rA, rB = rA, mat = M.white, seg = 12 }) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rB, rA, a.distanceTo(b), seg), mat);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  parent.add(mesh);
  return mesh;
}

/** Upright box beam between two points (`w` across, `h` tall): sloping jet-bridge tunnels. */
function beam(parent, { from, to, w = 2.6, h = 2.8, mat = M.steelDark }) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const dir = b.clone().sub(a).normalize();
  const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
  const up = new THREE.Vector3().crossVectors(side, dir).normalize();
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(a.distanceTo(b), h, w), mat);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(dir, up, side));
  parent.add(mesh);
  return mesh;
}

/**
 * Narrow-body airliner (nose towards local +x, centred on x/z, standing on `y`).
 * `len` ≈ 36–40: white fuselage, swept low wings, two under-wing engines, coloured fin, low tailplane.
 */
function airliner(parent, { x, y = 0, z, ry = 0, len = 40, tailMat = M.blue }) {
  const g = subgroup(parent, { x, y, z, ry });
  const s = len / 40;
  const r = 2 * s; // fuselage radius
  const yc = 3.6; // fuselage centreline height (gear keeps the belly ~1.6 above the apron)
  const noseCentre = len / 2 - 2 * r;
  const tailStart = -0.2 * len;
  sphere(g, { r, x: noseCentre, y: yc - r, z: 0, mat: M.white, seg: 12, sx: 2 });
  tube(g, { from: [noseCentre, yc, 0], to: [tailStart, yc, 0], rA: r, mat: M.white, seg: 14 });
  tube(g, { from: [tailStart, yc, 0], to: [-len / 2, yc + 0.9 * r, 0], rA: r, rB: 0.3 * r, mat: M.white, seg: 14 });
  // cockpit window band
  box(g, { w: 1.1 * s, h: 0.6 * r, d: 2.1 * r, x: noseCentre - 0.3 * r, y: yc + 0.2 * r, mat: M.black });
  // swept wings (one plate through the fuselage)
  const wing = [[-8, -15], [2, -1.6], [2, 1.6], [-8, 15], [-11, 15], [-6, 1.6], [-6, -1.6], [-11, -15]];
  prism(g, { points: wing.map(([px, pz]) => [px * s, pz * s]), h: 0.6, y: yc - 0.55 * r - 0.3, mat: M.white });
  // engines under the wings
  [-1, 1].forEach((side) => {
    const ez = side * 6.5 * s;
    tube(g, { from: [4 * s, 1.5 * s + 0.25, ez], to: [-2.5 * s, 1.5 * s + 0.25, ez], rA: 1.25 * s, rB: 1.1 * s, mat: M.steelDark, seg: 12 });
    box(g, { w: 3 * s, h: 0.9, d: 0.5, x: -0.5 * s, y: 1.5 * s + 1.2, z: ez, mat: M.steel });
  });
  // tailplane and fin
  const stab = [[-14, -1.2], [-14, 1.2], [-19.5, 6.5], [-21, 6.5], [-19.5, 1.2], [-19.5, -1.2], [-21, -6.5], [-19.5, -6.5]];
  prism(g, { points: stab.map(([px, pz]) => [px * s, pz * s]), h: 0.4, y: yc + 1.0, mat: M.white });
  plate(g, {
    points: [[-12 * s, yc + 1.2], [-18.5 * s, yc + 9 * s], [-21 * s, yc + 9 * s], [-19.5 * s, yc + 1.2]],
    thick: 0.5, mat: tailMat,
  });
  // landing gear
  cyl(g, { rTop: 0.3, h: yc - r + 0.3, x: noseCentre - 1, mat: M.black, seg: 6 });
  [-1, 1].forEach((side) => cyl(g, { rTop: 0.45, h: yc - r + 0.3, x: -1 * s, z: side * 2.2 * s, mat: M.black, seg: 6 }));
  return g;
}

export default {
  id: "gimpo-airport",
  name: "김포국제공항",
  nameEn: "Gimpo International Airport",
  district: "강서구",
  lat: 37.559,
  lon: 126.802,
  height: 67,
  colliderRadius: 115,
  detail: "high",
  description: "국내선·국제선 터미널과 관제탑",
  create() {
    const root = new THREE.Group();
    // Site frame: local -z runs along the runways towards the international terminal (RWY 32 true bearing
    // 315° per the RKSS AIP), local -x faces the runways. The subgroup rotation aligns it with the map.
    const g = subgroup(root, { ry: deg(45) });

    // ── Ground: apron (airside, west), tower pad, landside roads ─────────────────────────────────
    slab(g, { w: 54, d: 176, x: -43, z: 0, h: 0.5, mat: M.concreteDark });
    slab(g, { w: 28, d: 16, x: -34, z: -96, h: 0.5, mat: M.concreteDark });
    slab(g, { w: 44, d: 146, x: 42, z: 15, h: 0.4, mat: M.asphalt });
    slab(g, { w: 16, d: 34, x: 28, z: -75, h: 0.4, mat: M.asphalt });

    const stands = [-68, -34, 0, 34, 68];
    // apron markings: taxilane centreline and stand lead-in lines
    box(g, { w: 0.6, h: 0.06, d: 172, x: -52, y: 0.5, mat: M.yellow });
    stands.forEach((zc) => box(g, { w: 24, h: 0.06, d: 0.5, x: -40, y: 0.5, z: zc, mat: M.yellow }));
    // apron high-mast floodlights
    [-85, -51, -17, 17, 51, 85].forEach((z) => {
      cyl(g, { rTop: 0.25, rBot: 0.4, h: 26, x: -67, y: 0.5, z, mat: M.steel, seg: 6 });
      box(g, { w: 1.4, h: 0.8, d: 2.6, x: -67, y: 26.5, z, mat: M.steelDark });
    });

    // ── Domestic terminal: 180 × 36, four storeys, full-height glass, shallow silver vault roof ──
    const bodyH = 20.5;
    box(g, { w: 36, h: bodyH, d: 180, x: 2, mat: M.glassWhite });
    floorBands(g, { w: 36, d: 180, h: bodyH, x: 2, floorHeight: 5, thickness: 0.8, inset: -0.15, mat: M.white });
    // apron-level service strip along the west (airside) face
    box(g, { w: 6, h: 5, d: 176, x: -19, y: 0.5, mat: M.concrete });
    // white columns on the apron facade, closely spaced fins on the landside facade
    for (let z = -86; z <= 86.1; z += 8.6) cyl(g, { rTop: 0.45, h: bodyH, x: -16.3, z, mat: M.white, seg: 8 });
    for (let z = -87; z <= 87.1; z += 6) box(g, { w: 0.5, h: bodyH, d: 0.6, x: 20.3, z, mat: M.white });
    // curved metal roof with 3-unit overhangs, plus rooftop plant at the crown
    vault(g, { w: 42, len: 184, rise: 5, thick: 1.1, x: 2, y: bodyH, mat: M.steel });
    [-62, -20, 24, 64].forEach((z) => box(g, { w: 5, h: 1.6, d: 8, x: 2, y: bodyH + 5.6, z, mat: M.concreteDark }));

    // ── Landside: departure-level viaduct with ramps, curb canopy ───────────────────────────────
    box(g, { w: 12, h: 1.2, d: 100, x: 27, y: 9, mat: M.concrete });
    box(g, { w: 0.5, h: 1.1, d: 100, x: 32.8, y: 10.2, mat: M.concrete });
    for (let z = -48; z <= 48.1; z += 12) {
      cyl(g, { rTop: 0.6, h: 9, x: 23.5, y: 0.4, z, mat: M.concrete, seg: 8 });
      cyl(g, { rTop: 0.6, h: 9, x: 31, y: 0.4, z, mat: M.concrete, seg: 8 });
      cyl(g, { rTop: 0.3, h: 5.3, x: 29, y: 10.2, z, mat: M.white, seg: 6 });
    }
    box(g, { w: 12, h: 1.2, d: 41.2, x: 27, y: 4.1, z: -70, rx: -0.24, mat: M.concrete });
    box(g, { w: 12, h: 1.2, d: 41.2, x: 27, y: 4.1, z: 70, rx: 0.24, mat: M.concrete });
    box(g, { w: 9, h: 0.5, d: 104, x: 25, y: 15.5, mat: M.steel });

    // ── Car-park block (주차빌딩) east of the access road, surface lot to its north ──────────────
    box(g, { w: 24, h: 15, d: 60, x: 52, z: 40, mat: M.concrete });
    floorBands(g, { w: 24, d: 60, h: 15, x: 52, z: 40, floorHeight: 3, thickness: 0.7, inset: -0.15, mat: M.concreteDark });
    box(g, { w: 24.6, h: 1.2, d: 60.6, x: 52, y: 15, z: 40, mat: M.concreteDark });
    box(g, { w: 6, h: 19, d: 6, x: 61, z: 14, mat: M.concreteDark });
    for (let z = -42; z <= -2; z += 8) box(g, { w: 22, h: 0.05, d: 0.35, x: 52, y: 0.4, z, mat: M.white });
    for (let z = -44; z <= -4; z += 8) tree(g, { x: 38, z, h: 7, r: 2.6 });

    // ── 롯데몰 김포공항 / 김포공항역 block (north-east) with rounded glass atrium and hotel wing ───
    box(g, { w: 30, h: 22, d: 30, x: 51, z: -77, mat: M.limestone });
    box(g, { w: 30.4, h: 4, d: 30.4, x: 51, y: 6, z: -77, mat: M.glassDark });
    box(g, { w: 30.4, h: 1.2, d: 30.4, x: 51, y: 22, z: -77, mat: M.offWhite });
    dome(g, { r: 7, scaleY: 0.6, x: 45, y: 22.4, z: -77, mat: M.glass, seg: 24, sx: 1.2 });
    box(g, { w: 12, h: 20, d: 20, x: 60, y: 22.4, z: -78, mat: M.glassWhite });
    floorBands(g, { w: 12, d: 20, h: 20, x: 60, y: 22.4, z: -78, floorHeight: 3.3, thickness: 0.5, inset: -0.1, mat: M.steelDark });
    box(g, { w: 12.4, h: 1, d: 20.4, x: 60, y: 42.4, z: -78, mat: M.steelDark });
    // elevated glass walkway from the terminal's north end to the mall
    box(g, { w: 16, h: 4.5, d: 7, x: 28, y: 4, z: -80, mat: M.glassWhite });
    box(g, { w: 16.4, h: 0.5, d: 7.4, x: 28, y: 8.5, z: -80, mat: M.steel });

    // ── Control tower (신관제탑, 1988, 67 m) on the apron to the north-west ─────────────────────
    const tx = -34;
    const tz = -92;
    const ty = 0.5;
    box(g, { w: 12, h: 7, d: 10, x: tx, y: ty, z: tz - 6, mat: M.concrete });
    box(g, { w: 12.4, h: 0.6, d: 10.4, x: tx, y: ty + 7, z: tz - 6, mat: M.concreteDark });
    cyl(g, { rTop: 3.4, rBot: 4.4, h: 46, x: tx, y: ty, z: tz, mat: M.white, seg: 20 });
    polygonPrism(g, { sides: 8, r: 6.2, h: 5, x: tx, y: ty + 46, z: tz, mat: M.white });
    polygonPrism(g, { sides: 8, r: 6.4, h: 1.5, x: tx, y: ty + 48, z: tz, mat: M.glassDark });
    polygonPrism(g, { sides: 8, r: 7.8, h: 1, x: tx, y: ty + 51, z: tz, mat: M.concrete });
    cyl(g, { rTop: 8, rBot: 7.2, h: 4.6, x: tx, y: ty + 52, z: tz, mat: M.glassGreen, seg: 8, ry: Math.PI / 8 });
    polygonPrism(g, { sides: 8, r: 9, h: 1.3, x: tx, y: ty + 56.6, z: tz, mat: M.white });
    box(g, { w: 3.5, h: 1.6, d: 2.5, x: tx + 2.5, y: ty + 57.9, z: tz, mat: M.steelDark });
    sphere(g, { r: 1.3, x: tx - 3, y: ty + 57.9, z: tz, mat: M.white, seg: 12 });
    cyl(g, { rTop: 0.18, rBot: 0.3, h: 8.5, x: tx, y: ty + 57.9, z: tz, mat: M.steel, seg: 6 });
    strut(g, { from: [tx - 1.6, ty + 63.5, tz], to: [tx + 1.6, ty + 63.5, tz], r: 0.12, mat: M.steel });

    // ── Apron: five nose-in airliners with jet bridges ──────────────────────────────────────────
    const fleet = [
      { len: 40, tail: M.blue },
      { len: 36, tail: M.orange },
      { len: 38, tail: M.red },
      { len: 36, tail: M.green },
      { len: 40, tail: M.navy },
    ];
    stands.forEach((zc, i) => {
      const { len, tail } = fleet[i];
      const noseX = -27;
      airliner(g, { x: noseX - len / 2, y: 0.5, z: zc, len, tailMat: tail });
      // jet bridge: fixed glass corridor + rotunda at the terminal, sloping tunnel to the L1 door
      box(g, { w: 9, h: 3, d: 3, x: -20.5, y: 5.5, z: zc - 6, mat: M.glassWhite });
      cyl(g, { rTop: 1.8, h: 3.4, x: -25, y: 5.3, z: zc - 6, mat: M.steel, seg: 10 });
      beam(g, { from: [-25, 7, zc - 6], to: [noseX - 4.2, 4.2, zc - 2.4], w: 2.6, h: 2.8, mat: M.steelDark });
      cyl(g, { rTop: 0.3, h: 2.8, x: -29.5, y: 0.5, z: zc - 3.4, mat: M.steelDark, seg: 6 });
    });

    return root;
  },
};
