// 보라매공원 (Boramae Park, former ROKAF academy) - 동작구
// Civic park on the old parade ground: an oval jogging track around a lawn, a pond with a music
// fountain and 벽천 wall, two retired aircraft on plinths (C-123K high-wing transport, F-5 fighter),
// the brick 청소년수련관 (ex-HQ, the 20 m mark) and a small gabled gallery. Pines and paths fill the rest.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, cone, sphere, prism, gableRoof, slab, disc, floorBands, tree, subgroup } from "./_helpers.mjs";

const olive = material(0x4f5d3a, { roughness: 0.9 });
const paving = material(0xcac4b8, { roughness: 0.95 });
const jetGrey = material(0xc5c8cc, { roughness: 0.45, metalness: 0.35 });

/** F-5-class fighter on a plinth, nose toward local +x. */
function fighter(parent, { x, z, ry = 0 }) {
  const s = subgroup(parent, { x, z, ry });
  box(s, { w: 3.2, h: 0.7, d: 2.4, mat: M.concrete });
  box(s, { w: 9.2, h: 1.05, d: 1.25, y: 1.55, mat: jetGrey });
  box(s, { w: 1.9, h: 0.7, d: 0.7, x: 5.5, y: 1.72, mat: jetGrey });
  box(s, { w: 1.6, h: 0.55, d: 1.05, x: 1.6, y: 2.5, mat: M.glassDark });
  prism(s, {
    points: [[1.6, 0.5], [-2.4, 4.6], [-3.2, 4.6], [-2.0, 0.5], [-2.0, -0.5], [-3.2, -4.6], [-2.4, -4.6], [1.6, -0.5]],
    h: 0.18, y: 1.85, mat: jetGrey,
  });
  box(s, { w: 1.5, h: 1.8, d: 0.16, x: -4.2, y: 2.1, mat: M.navy });
  box(s, { w: 2.2, h: 0.14, d: 2.4, x: -3.8, y: 2.3, mat: jetGrey });
  cyl(s, { rTop: 0.12, h: 0.7, x: 2.4, y: 0.7, mat: M.black, seg: 6 });
  [-1, 1].forEach((side) => cyl(s, { rTop: 0.12, h: 0.7, x: -1.2, y: 0.7, z: side * 0.9, mat: M.black, seg: 6 }));
}

/** C-123-class high-wing transport on a plinth, nose toward local +x. */
function transport(parent, { x, z, ry = 0 }) {
  const s = subgroup(parent, { x, z, ry });
  box(s, { w: 4.4, h: 0.75, d: 3.2, mat: M.concrete });
  box(s, { w: 12.5, h: 2.3, d: 2.8, y: 1.5, mat: M.aluminum });
  box(s, { w: 1.8, h: 1.1, d: 2.2, x: 6.4, y: 1.9, mat: M.glassDark });
  prism(s, {
    points: [[2.2, 1.2], [0.4, 7.4], [-1.4, 7.4], [-1.4, 1.2], [-1.4, -1.2], [-1.4, -7.4], [0.4, -7.4], [2.2, -1.2]],
    h: 0.28, y: 3.55, mat: M.aluminum,
  });
  [-1, 1].forEach((side) => {
    box(s, { w: 2.8, h: 0.85, d: 0.85, x: 0.6, y: 2.7, z: side * 3.4, mat: M.steelDark });
  });
  box(s, { w: 2.0, h: 3.4, d: 0.22, x: -5.6, y: 3.4, mat: olive });
  box(s, { w: 2.4, h: 0.16, d: 3.6, x: -5.4, y: 3.6, mat: M.aluminum });
  cyl(s, { rTop: 0.16, h: 1.2, x: 3.6, y: 0.75, mat: M.black, seg: 6 });
  [-1, 1].forEach((side) => cyl(s, { rTop: 0.18, h: 1.2, x: -2.2, y: 0.75, z: side * 1.2, mat: M.black, seg: 6 }));
}

export default {
  id: "boramae-park",
  name: "보라매공원",
  nameEn: "Boramae Park",
  district: "동작구",
  lat: 37.4932,
  lon: 126.9205,
  height: 20,
  colliderRadius: 50,
  detail: "low",
  description: "옛 공군사관학교 터, 에어파크 전시 항공기와 음악분수",
  create() {
    const g = new THREE.Group();

    // ── Park carpet, oval track (old parade ground), cross paths ──
    cyl(g, { rTop: 48, h: 0.22, y: -0.05, mat: M.grass, seg: 32 });
    disc(g, { r: 22, rInner: 18.2, y: 0.24, mat: M.asphalt, seg: 32 });
    slab(g, { w: 28, d: 28, h: 0.08, y: 0.2, mat: M.grassDark });
    slab(g, { w: 4, d: 44, h: 0.12, y: 0.2, mat: paving });
    slab(g, { w: 40, d: 3.4, h: 0.12, y: 0.2, mat: paving });

    // ── Pond + music fountain + 벽천 ──
    const px = -16;
    const pz = 16;
    cyl(g, { rTop: 9.5, h: 0.45, x: px, y: 0.15, z: pz, mat: M.granite, seg: 24, sx: 1.25, sz: 0.85 });
    cyl(g, { rTop: 8.6, h: 0.28, x: px, y: 0.32, z: pz, mat: M.water, seg: 24, sx: 1.25, sz: 0.85 });
    cyl(g, { rTop: 1.3, h: 0.5, x: px, y: 0.55, z: pz, mat: M.granite, seg: 12 });
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      cyl(g, { rTop: 0.08, h: 3.4 + (i % 2) * 0.8, x: px + Math.cos(a) * 1.6, y: 1.0, z: pz + Math.sin(a) * 1.2, mat: M.glassWhite, seg: 5 });
    }
    cyl(g, { rTop: 0.12, h: 5.2, x: px, y: 1.0, z: pz, mat: M.glassWhite, seg: 5 });
    sphere(g, { r: 0.7, x: px, y: 6.0, z: pz, mat: M.glassWhite, seg: 8, sy: 0.45 });
    box(g, { w: 10, h: 2.6, d: 0.55, x: px, y: 0.2, z: pz + 8.4, mat: M.granite }); // 벽천
    box(g, { w: 8.5, h: 1.8, d: 0.2, x: px, y: 0.5, z: pz + 8.1, mat: M.water });

    // ── Air park: transport + fighter ──
    transport(g, { x: 18, z: -16, ry: -0.35 });
    fighter(g, { x: 26, z: -6, ry: 0.4 });
    slab(g, { w: 22, d: 16, h: 0.12, y: 0.18, x: 20, z: -12, mat: M.concrete });

    // ── 청소년수련관 (ex HQ company) — five storeys, top ≈ 20 ──
    const bx = -24;
    const bz = -18;
    box(g, { w: 16, h: 18.4, d: 10, x: bx, y: 0.2, z: bz, mat: M.brick });
    box(g, { w: 16.4, h: 0.4, d: 10.4, x: bx, y: 0.2, z: bz, mat: M.brickDark });
    floorBands(g, { w: 16, d: 10, h: 18.4, x: bx, y: 0.2, z: bz, floorHeight: 3.6, mat: M.concrete, thickness: 0.28 });
    box(g, { w: 14.8, h: 16.6, d: 0.22, x: bx, y: 1.2, z: bz + 5.12, mat: M.glass });
    box(g, { w: 15.2, h: 0.9, d: 9.4, x: bx, y: 18.6, z: bz, mat: M.concreteDark });
    box(g, { w: 4.2, h: 0.5, d: 3.6, x: bx, y: 19.5, z: bz, mat: M.concrete });
    // flag
    cyl(g, { rTop: 0.07, h: 8, x: bx + 9.2, y: 0.2, z: bz + 6.4, mat: M.steel, seg: 5 });
    box(g, { w: 0.08, h: 1.2, d: 1.8, x: bx + 9.2, y: 7.2, z: bz + 7.3, mat: M.blue });

    // Low gabled gallery (former chapel massing)
    box(g, { w: 10, h: 5.2, d: 7, x: 20, y: 0.2, z: 20, mat: M.offWhite });
    gableRoof(g, { w: 10.2, d: 7.2, h: 2.8, x: 20, y: 5.4, z: 20, overhang: 0.5, mat: M.roofTile });
    box(g, { w: 1.6, h: 2.2, d: 0.2, x: 20, y: 0.2, z: 23.6, mat: M.black });
    box(g, { w: 3.2, h: 1.6, d: 0.15, x: 20, y: 2.6, z: 23.55, mat: M.glassDark });

    // Small 충효 석탑 near the east path
    box(g, { w: 2.4, h: 0.5, d: 2.4, x: 8, y: 0.2, z: -28, mat: M.granite });
    box(g, { w: 1.3, h: 4.2, d: 1.3, x: 8, y: 0.7, z: -28, mat: M.graniteDark });
    cone(g, { r: 0.7, h: 1.1, x: 8, y: 4.9, z: -28, mat: M.granite, seg: 4 });

    const pines = [
      [-36, -8, 8], [-38, 8, 8], [-32, 22, 7.5], [-20, 30, 8], [-4, 34, 7],
      [12, 32, 7.5], [28, 26, 7], [36, 10, 7.5], [36, -20, 7], [24, -30, 7],
      [6, -36, 7], [-12, -34, 7.5], [-28, -30, 7], [32, 18, 6.5], [-34, -20, 7],
    ];
    pines.forEach(([x, z, h]) => {
      cyl(g, { rTop: 0.16, rBot: 0.28, h: h * 0.36, x, y: 0.2, z, mat: M.trunk, seg: 6 });
      cone(g, { r: 2.0, h: h * 0.7, x, y: 0.2 + h * 0.3, z, mat: M.foliage, seg: 8 });
    });
    [[-8, 8, 6], [8, 10, 5.5], [-6, -10, 5.5]].forEach(([x, z, h]) => {
      tree(g, { x, y: 0.2, z, h, r: h * 0.32 });
    });

    return g;
  },
};
