// 전쟁기념관 (War Memorial of Korea, 1994) - 용산구
// Symmetrical light-granite complex facing east-south-east towards 이태원로 / 삼각지 (site plan at
// ~0.4 of real, heights real). The main building (본관) is a central block with the circular
// 호국추모실 rotunda under a shallow grey dome (top ≈ 36 m) flanked by two long four-storey wings with
// tall recessed windows and a square-column portico. From the wings' front corners the 전사자명비
// 회랑 - two curved arms of granite columns and name-plate walls - embrace the paved 평화의 광장,
// which opens east to the street entrance with its flag rows. On the plaza stand the 6·25전쟁
// 조형물 (a 27 m bronze sword rising from a bronze bowl) and 형제의 상 (a cracked bronze dome with the
// two brothers). The outdoor exhibition surrounds the site: a B-52 bomber, a transport, jet
// fighters and helicopters on the north lawn, tanks, self-propelled guns and artillery on the south.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, dome, sphere, prism, tree, subgroup, deg } from "./_helpers.mjs";

const paving = material(0xd6d1c6, { roughness: 0.95 });
const domeGrey = material(0x8a9096, { roughness: 0.55, metalness: 0.35 });
const olive = material(0x4f5d3a, { roughness: 0.9 });

/** Flat annulus sector from angle `a0` to `a1` (radians, 0 = +x, positive towards +z), radii r0 < r1. */
function ringSector(parent, { r0, r1, a0, a1, h, x = 0, y = 0, z = 0, mat, steps = 20 }) {
  const outer = [];
  const inner = [];
  for (let i = 0; i <= steps; i += 1) {
    const a = a0 + ((a1 - a0) * i) / steps;
    outer.push([Math.cos(a) * r1, Math.sin(a) * r1]);
    inner.push([Math.cos(a) * r0, Math.sin(a) * r0]);
  }
  return prism(parent, { points: [...outer, ...inner.reverse()], h, x, y, z, mat });
}

/** Tapered horizontal tube between two points (fuselages, booms). */
function tube(parent, { from, to, rA, rB = rA, mat = M.white, seg = 10 }) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rB, rA, a.distanceTo(b), seg), mat);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  parent.add(mesh);
  return mesh;
}

/** Thin vertical plate: polygon in the x-y plane, `thick` along z (tail fins). */
function plate(parent, { points, thick = 0.4, x = 0, y = 0, z = 0, mat = M.white }) {
  const shape = new THREE.Shape();
  points.forEach(([px, py], i) => (i === 0 ? shape.moveTo(px, py) : shape.lineTo(px, py)));
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: thick, bevelEnabled: false, curveSegments: 1, steps: 1 });
  geometry.translate(0, 0, -thick / 2);
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

/** Wheel lying on the ground with its axle along local z. */
function wheel(parent, { x, z, r = 0.55, w = 0.4, mat = M.steelDark }) {
  const mesh = cyl(parent, { rTop: r, h: w, x, y: r - w / 2, z, mat, seg: 10 });
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

/** Tank (M48 / K1 class at ~0.6 scale): tracks, hull, turret, gun. Gun towards local +x. */
function tank(parent, { x, z, ry = 0, mat = olive }) {
  const s = subgroup(parent, { x, y: 0.1, z, ry });
  [-1, 1].forEach((side) => box(s, { w: 6.6, h: 0.8, d: 0.9, z: side * 1.5, mat: M.steelDark }));
  box(s, { w: 6.2, h: 1.0, d: 2.4, y: 0.6, mat });
  box(s, { w: 3.4, h: 1.0, d: 2.6, x: -0.4, y: 1.6, mat });
  box(s, { w: 4.4, h: 0.28, d: 0.28, x: 3.2, y: 2.0, mat: M.steelDark });
  return s;
}

/** Self-propelled gun / armoured vehicle: tall hull box with a short gun. */
function spg(parent, { x, z, ry = 0, mat = olive }) {
  const s = subgroup(parent, { x, y: 0.1, z, ry });
  [-1, 1].forEach((side) => box(s, { w: 6, h: 0.8, d: 0.8, z: side * 1.5, mat: M.steelDark }));
  box(s, { w: 5.6, h: 2.0, d: 2.6, y: 0.5, mat });
  box(s, { w: 3.6, h: 0.3, d: 0.3, x: 3.6, y: 2.0, rz: deg(12), mat: M.steelDark });
  return s;
}

/** Towed howitzer: split trail carriage, two wheels, long elevated barrel. */
function howitzer(parent, { x, z, ry = 0, mat = olive }) {
  const s = subgroup(parent, { x, y: 0.1, z, ry });
  box(s, { w: 2.2, h: 0.9, d: 1.6, x: 0.2, y: 0.5, mat });
  box(s, { w: 3.4, h: 0.25, d: 0.3, x: -1.6, y: 0.2, z: 0.7, mat });
  box(s, { w: 3.4, h: 0.25, d: 0.3, x: -1.6, y: 0.2, z: -0.7, mat });
  wheel(s, { x: 0.3, z: 1.1 });
  wheel(s, { x: 0.3, z: -1.1 });
  box(s, { w: 5.2, h: 0.28, d: 0.28, x: 2.4, y: 1.5, rz: deg(18), mat });
  return s;
}

/** Utility helicopter (UH-1 class): cabin, tail boom, main rotor disc, skids. Nose towards +x. */
function helicopter(parent, { x, z, ry = 0, mat = olive }) {
  const s = subgroup(parent, { x, y: 0.1, z, ry });
  box(s, { w: 5, h: 2.0, d: 2.2, x: 0.4, y: 0.7, mat });
  sphere(s, { r: 1.05, x: 3.0, y: 0.75, mat: M.glassDark, seg: 10, sx: 1.2 });
  box(s, { w: 5.5, h: 0.6, d: 0.6, x: -4.6, y: 1.8, mat });
  plate(s, { points: [[-7.6, 1.6], [-6.6, 1.6], [-6.8, 3.6], [-7.8, 3.6]], thick: 0.25, mat });
  box(s, { w: 1.4, h: 1, d: 1.2, x: 0.2, y: 2.7, mat: M.steelDark });
  cyl(s, { rTop: 5.2, h: 0.08, x: 0.2, y: 3.7, mat: M.steelDark, seg: 16 });
  [-1, 1].forEach((side) => box(s, { w: 4.2, h: 0.15, d: 0.15, x: 0.6, y: 0.1, z: side * 1.2, mat: M.steelDark }));
  return s;
}

/** Jet fighter (F-4 / F-86 class at ~0.6 scale). Nose towards +x. */
function jet(parent, { x, z, ry = 0, len = 11, span = 7, mat = M.white, finMat = M.steelDark }) {
  const s = subgroup(parent, { x, y: 0.1, z, ry });
  const yc = 1.5;
  const r = len * 0.06;
  sphere(s, { r, x: len / 2 - r, y: yc - r, mat, seg: 10, sx: 1.6 });
  tube(s, { from: [len / 2 - r, yc, 0], to: [-len * 0.3, yc, 0], rA: r, mat, seg: 10 });
  tube(s, { from: [-len * 0.3, yc, 0], to: [-len / 2, yc + r * 0.4, 0], rA: r, rB: r * 0.35, mat, seg: 10 });
  box(s, { w: len * 0.16, h: r * 0.9, d: r * 1.7, x: len * 0.22, y: yc + r * 0.55, mat: M.glassDark });
  const wing = [[len * 0.1, r * 0.8], [-len * 0.32, span / 2], [-len * 0.42, span / 2], [-len * 0.28, r * 0.8],
    [-len * 0.28, -r * 0.8], [-len * 0.42, -span / 2], [-len * 0.32, -span / 2], [len * 0.1, -r * 0.8]];
  prism(s, { points: wing, h: 0.3, y: yc - 0.3, mat });
  const stab = [[-len * 0.34, r * 0.6], [-len * 0.46, span * 0.22], [-len * 0.5, span * 0.22], [-len * 0.45, r * 0.6],
    [-len * 0.45, -r * 0.6], [-len * 0.5, -span * 0.22], [-len * 0.46, -span * 0.22], [-len * 0.34, -r * 0.6]];
  prism(s, { points: stab, h: 0.25, y: yc + r * 0.3, mat });
  plate(s, { points: [[-len * 0.32, yc + r * 0.6], [-len * 0.44, yc + r + span * 0.3], [-len * 0.5, yc + r + span * 0.3], [-len * 0.46, yc + r * 0.6]], thick: 0.3, mat: finMat });
  cyl(s, { rTop: 0.12, h: yc - r, x: len * 0.3, mat: M.black, seg: 6 });
  [-1, 1].forEach((side) => cyl(s, { rTop: 0.15, h: yc - r, x: -len * 0.15, z: side * 1.1, mat: M.black, seg: 6 }));
  return s;
}

/** B-52 heavy bomber (~0.55 scale): long fuselage, shoulder-mounted swept wings with four engine pods, tall fin. */
function bomber(parent, { x, z, ry = 0, len = 28, span = 30 }) {
  const s = subgroup(parent, { x, y: 0.1, z, ry });
  const yc = 2.8;
  const r = 1.4;
  const mat = M.white;
  sphere(s, { r, x: len / 2 - r, y: yc - r, mat, seg: 12, sx: 1.8 });
  tube(s, { from: [len / 2 - r, yc, 0], to: [-len * 0.28, yc, 0], rA: r, mat, seg: 12 });
  tube(s, { from: [-len * 0.28, yc, 0], to: [-len / 2, yc + r * 0.8, 0], rA: r, rB: r * 0.3, mat, seg: 12 });
  box(s, { w: 2.4, h: r * 0.8, d: r * 1.9, x: len / 2 - 3.2, y: yc + r * 0.35, mat: M.black });
  // swept wing plate through the fuselage (root chord ≈ 0.25 len, tips well aft)
  const hs = span / 2;
  const wing = [[len * 0.12, r], [-len * 0.3, hs], [-len * 0.4, hs], [-len * 0.14, r],
    [-len * 0.14, -r], [-len * 0.4, -hs], [-len * 0.3, -hs], [len * 0.12, -r]];
  prism(s, { points: wing, h: 0.5, y: yc + r * 0.35, mat });
  // paired engine pods hanging under the wing
  [0.38, 0.68].forEach((f) => [-1, 1].forEach((side) => {
    const zz = side * hs * f;
    const xLead = len * 0.12 - (len * 0.42) * f;
    tube(s, { from: [xLead + 1.5, yc - 0.6, zz], to: [xLead - 2.2, yc - 0.6, zz], rA: 0.65, rB: 0.55, mat: M.steelDark, seg: 8 });
    tube(s, { from: [xLead + 1.5, yc - 0.6, zz + 1.5], to: [xLead - 2.2, yc - 0.6, zz + 1.5], rA: 0.65, rB: 0.55, mat: M.steelDark, seg: 8 });
  }));
  // tail: low stabiliser, tall swept fin
  prism(s, { points: [[-len * 0.38, r * 0.7], [-len * 0.47, span * 0.2], [-len * 0.5, span * 0.2], [-len * 0.46, r * 0.7],
    [-len * 0.46, -r * 0.7], [-len * 0.5, -span * 0.2], [-len * 0.47, -span * 0.2], [-len * 0.38, -r * 0.7]], h: 0.3, y: yc + r * 0.6, mat });
  plate(s, { points: [[-len * 0.3, yc + r * 0.9], [-len * 0.45, yc + r + 7], [-len * 0.5, yc + r + 7], [-len * 0.48, yc + r * 0.9]], thick: 0.4, mat });
  cyl(s, { rTop: 0.18, h: yc - r, x: len * 0.3, mat: M.black, seg: 6 });
  [-1, 1].forEach((side) => cyl(s, { rTop: 0.25, h: yc - r, x: -len * 0.12, z: side * 1.2, mat: M.black, seg: 6 }));
  return s;
}

/** Twin-engine transport (C-123 / C-54 class at ~0.5 scale): high wing, big fin. Nose towards +x. */
function transport(parent, { x, z, ry = 0, len = 16, span = 19 }) {
  const s = subgroup(parent, { x, y: 0.1, z, ry });
  const yc = 2.4;
  const r = 1.2;
  const mat = M.aluminum;
  sphere(s, { r, x: len / 2 - r, y: yc - r, mat, seg: 12, sx: 1.4 });
  tube(s, { from: [len / 2 - r, yc, 0], to: [-len * 0.25, yc, 0], rA: r, mat, seg: 12 });
  tube(s, { from: [-len * 0.25, yc, 0], to: [-len / 2, yc + r * 0.9, 0], rA: r, rB: r * 0.3, mat, seg: 12 });
  const hs = span / 2;
  prism(s, { points: [[len * 0.12, r * 0.9], [-len * 0.02, hs], [-len * 0.14, hs], [-len * 0.14, r * 0.9],
    [-len * 0.14, -r * 0.9], [-len * 0.14, -hs], [-len * 0.02, -hs], [len * 0.12, -r * 0.9]], h: 0.45, y: yc + r * 0.5, mat });
  [-1, 1].forEach((side) => tube(s, { from: [len * 0.2, yc + r * 0.3, side * hs * 0.38], to: [-len * 0.1, yc + r * 0.3, side * hs * 0.38], rA: 0.8, rB: 0.6, mat: M.steelDark, seg: 8 }));
  prism(s, { points: [[-len * 0.38, r * 0.6], [-len * 0.45, span * 0.2], [-len * 0.5, span * 0.2], [-len * 0.47, r * 0.6],
    [-len * 0.47, -r * 0.6], [-len * 0.5, -span * 0.2], [-len * 0.45, -span * 0.2], [-len * 0.38, -r * 0.6]], h: 0.3, y: yc + r * 0.6, mat });
  plate(s, { points: [[-len * 0.3, yc + r * 0.8], [-len * 0.45, yc + r + 4.5], [-len * 0.5, yc + r + 4.5], [-len * 0.49, yc + r * 0.8]], thick: 0.35, mat });
  cyl(s, { rTop: 0.15, h: yc - r, x: len * 0.3, mat: M.black, seg: 6 });
  [-1, 1].forEach((side) => cyl(s, { rTop: 0.2, h: yc - r, x: -len * 0.05, z: side * 1.4, mat: M.black, seg: 6 }));
  return s;
}

export default {
  id: "war-memorial",
  name: "전쟁기념관",
  nameEn: "War Memorial of Korea",
  district: "용산구",
  lat: 37.536,
  lon: 126.9773,
  height: 36,
  colliderRadius: 58,
  detail: "medium",
  description: "반원형 열주 회랑과 중앙 돔형 본관",
  create() {
    const g = new THREE.Group();
    // Local frame: +x = front of the complex. Rotated so the front faces east-south-east (towards 이태원로).
    const r = subgroup(g, { ry: -deg(25) });

    // ── Site: lawn disc (top at y = 0.1) ──
    cyl(r, { rTop: 58, h: 0.4, y: -0.3, mat: M.grass, seg: 64 });

    // ── Main building (본관): podium, two wings, central block, portico, rotunda + dome ──
    const POD_H = 2.4;
    const BX = -22; // building centre
    box(r, { w: 34, h: POD_H, d: 62, x: BX, y: 0.1, mat: M.granite });
    box(r, { w: 34.6, h: 0.5, d: 62.6, x: BX, y: 0.1, mat: M.graniteDark });
    const base = POD_H + 0.1;
    // front steps (east) down from the podium
    for (let i = 0; i < 5; i += 1) {
      const d = (5 - i) * 1.3;
      box(r, { w: 40, h: POD_H / 5, d, x: -5 + d / 2, y: 0.1 + (POD_H / 5) * i, mat: M.granite });
    }
    const WING_H = 21;
    [-1, 1].forEach((side) => {
      const zc = side * 19.5;
      box(r, { w: 24, h: WING_H, d: 22, x: -24, y: base, z: zc, mat: M.granite });
      box(r, { w: 24.8, h: 1.2, d: 22.8, x: -24, y: base + WING_H, z: zc, mat: M.limestone });
      // tall recessed windows on the front and outer faces
      for (let i = 0; i < 6; i += 1) {
        box(r, { w: 0.4, h: 16, d: 1.5, x: -11.9, y: base + 2.5, z: zc - 7.5 + i * 3, mat: M.glassDark });
      }
      for (let i = 0; i < 6; i += 1) {
        box(r, { w: 1.5, h: 16, d: 0.4, x: -33 + i * 3.6, y: base + 2.5, z: side * 30.6, mat: M.glassDark });
      }
    });
    const CORE_H = 26;
    box(r, { w: 28, h: CORE_H, d: 18, x: -23, y: base, mat: M.granite }); // x -37..-9, projects 3 m in front of the wings
    box(r, { w: 28.8, h: 1.2, d: 18.8, x: -23, y: base + CORE_H, z: 0, mat: M.limestone });
    // entrance portal (dark recess) and the square-column portico with its entablature
    box(r, { w: 1, h: 15, d: 12, x: -8.6, y: base, mat: M.glassDark });
    for (let i = 0; i < 6; i += 1) {
      cyl(r, { rTop: 1.05, h: 21, x: -6.8, y: base, z: -7.5 + i * 3, mat: M.granite, seg: 4, ry: Math.PI / 4 });
    }
    box(r, { w: 4.4, h: 3, d: 20, x: -7, y: base + 21, mat: M.limestone });
    // rotunda drum and shallow grey dome (호국추모실), top ≈ 36
    const drumY = base + CORE_H;
    cyl(r, { rTop: 8.6, h: 3.2, x: BX, y: drumY, mat: M.granite, seg: 40 });
    cyl(r, { rTop: 8.9, h: 0.5, x: BX, y: drumY + 3.2, mat: M.graniteDark, seg: 40 });
    const DR = 8.8;
    const RISE = 3.6;
    const R = (DR * DR + RISE * RISE) / (2 * RISE);
    dome(r, { r: R, theta: Math.asin(DR / R), x: BX, y: drumY + 3.7 - (R - RISE), mat: domeGrey, seg: 40 });
    cyl(r, { rTop: 0.2, rBot: 0.45, h: 0.6, x: BX, y: drumY + 3.7 + RISE - 0.1, mat: M.steel, seg: 8 });

    // ── 전사자명비 회랑: two curved colonnade arms from the wing corners, embracing the plaza ──
    const CC = -12; // arc centre x (front face of the wings), z = 0
    const COL_H = 8.6;
    [-1, 1].forEach((side) => {
      const a0 = side * deg(30);
      const a1 = side * deg(90);
      const lo = Math.min(a0, a1);
      const hi = Math.max(a0, a1);
      ringSector(r, { r0: 29.6, r1: 31.6, a0: lo, a1: hi, h: 0.6, x: CC, y: 0.1, mat: M.graniteDark }); // plinth
      ringSector(r, { r0: 30.4, r1: 31.6, a0: lo, a1: hi, h: COL_H, x: CC, y: 0.1, mat: M.granite }); // name-plate wall
      ringSector(r, { r0: 27.3, r1: 32.4, a0: lo, a1: hi, h: 1.3, x: CC, y: 0.1 + COL_H, mat: M.limestone }); // roof
      ringSector(r, { r0: 27.1, r1: 32.6, a0: lo, a1: hi, h: 0.4, x: CC, y: 0.1 + COL_H + 1.3, mat: M.granite });
      const n = 14;
      for (let i = 0; i <= n; i += 1) {
        const a = lo + ((hi - lo) * i) / n;
        cyl(r, { rTop: 0.7, h: COL_H, x: CC + Math.cos(a) * 28.4, y: 0.1, z: Math.sin(a) * 28.4, mat: M.granite, seg: 4, ry: -a + Math.PI / 4 });
      }
      // end pier closing each arm
      box(r, { w: 2.2, h: COL_H + 1.7, d: 4.6, x: CC + Math.cos(a0) * 30, y: 0.1, z: Math.sin(a0) * 30, ry: -a0, mat: M.granite });
    });

    // ── 평화의 광장: paved plaza inside the arms, extension east to the street entrance ──
    cyl(r, { rTop: 30.4, h: 0.2, x: CC, y: 0.1, mat: paving, seg: 48 });
    box(r, { w: 34, h: 0.2, d: 38, x: 27, y: 0.1, mat: paving });
    box(r, { w: 50, h: 0.06, d: 5, x: 20, y: 0.3, mat: M.granite }); // axis band
    for (let i = 0; i < 3; i += 1) {
      box(r, { w: 1.2, h: 0.24 - i * 0.08, d: 34, x: 44.6 + i * 1.2, y: 0.1, mat: paving }); // steps to the street
    }
    [-1, 1].forEach((side) => {
      box(r, { w: 1.6, h: 6, d: 1.6, x: 44, y: 0.1, z: side * 18, mat: M.granite }); // entrance pylons
      for (let i = 0; i < 6; i += 1) {
        const px = 18 + i * 4.6;
        cyl(r, { rTop: 0.09, h: 11, x: px, y: 0.3, z: side * 21, mat: M.steel, seg: 5 });
        box(r, { w: 0.08, h: 1.6, d: 2.4, x: px, y: 9.2, z: side * 21 + side * 1.2, mat: i % 2 ? M.red : M.blue });
      }
    });

    // ── 6·25전쟁 조형물: bronze bowl with the 27 m bronze sword rising from it ──
    const MX = 32;
    const MZ = -7;
    cyl(r, { rTop: 8, h: 0.6, x: MX, y: 0.3, z: MZ, mat: M.granite, seg: 32 });
    cyl(r, { rTop: 6.8, rBot: 5.6, h: 1.4, x: MX, y: 0.9, z: MZ, mat: M.bronze, seg: 32 }); // bowl rim
    dome(r, { r: 6.4, scaleY: 0.4, x: MX, y: 2.3, z: MZ, mat: M.bronze, seg: 32 });
    cyl(r, { rTop: 0.35, rBot: 2.2, h: 25.5, x: MX, y: 4.3, z: MZ, mat: M.bronze, seg: 6 }); // sword blade
    [0, 1, 2].forEach((i) => cyl(r, { rTop: 0.1, rBot: 0.9, h: 11, x: MX, y: 4.3, z: MZ, mat: M.bronze, seg: 4, ry: (i * Math.PI) / 3, sx: 3.4, sz: 0.25 })); // splayed blades
    cyl(r, { rTop: 0.15, rBot: 0.3, h: 1.8, x: MX, y: 29.7, z: MZ, mat: M.steel, seg: 6 });

    // ── 형제의 상: cracked bronze dome with the two brothers on top ──
    const BXs = 31;
    const BZ = 18;
    cyl(r, { rTop: 6.2, h: 0.5, x: BXs, y: 0.3, z: BZ, mat: M.granite, seg: 32 });
    dome(r, { r: 5.2, scaleY: 0.72, x: BXs, y: 0.8, z: BZ, mat: M.bronze, seg: 28 });
    box(r, { w: 0.4, h: 2.2, d: 5, x: BXs + 2.2, y: 1.0, z: BZ, mat: M.granite, ry: deg(30) }); // the crack
    cyl(r, { rTop: 1.1, rBot: 1.4, h: 3.2, x: BXs, y: 4.5, z: BZ, mat: M.bronze, seg: 8 });
    sphere(r, { r: 0.6, x: BXs - 0.4, y: 7.6, z: BZ - 0.3, mat: M.bronze, seg: 8 });
    sphere(r, { r: 0.5, x: BXs + 0.5, y: 7.3, z: BZ + 0.4, mat: M.bronze, seg: 8 });

    // ── Outdoor exhibition (야외전시장): aircraft on the north lawn, armour and artillery on the south ──
    bomber(r, { x: 24, z: -38, ry: deg(-8) });
    transport(r, { x: -22, z: -41, ry: deg(6) });
    jet(r, { x: -47, z: -20, ry: deg(30), len: 11, span: 7.2 });
    jet(r, { x: 4, z: -47, ry: deg(-15), len: 9, span: 6.4, finMat: M.red });
    helicopter(r, { x: -45, z: 22, ry: deg(-60) });
    helicopter(r, { x: -7, z: -50, ry: deg(-20) });
    [-36, -28, -20, -12, -4].forEach((x) => tank(r, { x, z: 37, ry: deg(-90) }));
    [-26, -14].forEach((x) => spg(r, { x, z: 44, ry: deg(-90) }));
    [-2, 8].forEach((x) => howitzer(r, { x, z: 44, ry: deg(-90) }));
    howitzer(r, { x: 16, z: 36, ry: deg(-120) });
    tank(r, { x: 24, z: 30, ry: deg(-150) });
    tank(r, { x: -48, z: -6, ry: deg(180) });
    spg(r, { x: -48, z: 6, ry: deg(180) });
    // walkway through the south exhibition
    box(r, { w: 46, h: 0.08, d: 3, x: -14, y: 0.1, z: 41, mat: paving });

    // ── Trees around the perimeter (kept inside the collider) ──
    const trees = [
      [-52, -20, 9, 3.2], [-54, 8, 9, 3], [-50, 24, 8, 3], [-44, -38, 9, 3.2], [-30, -50, 8, 3], [-14, -46, 6, 2.2],
      [40, -34, 8, 3], [46, -24, 8, 2.8], [48, 30, 8, 3], [40, 38, 8, 2.8], [30, 46, 8, 3], [14, 52, 8, 3],
      [-2, 54, 8, 3], [-20, 54, 9, 3.2], [-36, 50, 8, 3], [-46, 40, 8, 3], [-50, 32, 7, 2.6],
      [-8, -34, 5, 1.8], [10, -30, 5, 1.8], [12, -56, 6, 2.2], [-54, -6, 7, 2.6],
    ];
    trees.forEach(([x, z, h, rad]) => {
      const d = Math.hypot(x, z);
      const k = d + rad > 57.5 ? (57.5 - rad) / d : 1;
      tree(r, { x: x * k, y: 0.1, z: z * k, h, r: rad, mat: M.foliage });
    });

    return g;
  },
};
