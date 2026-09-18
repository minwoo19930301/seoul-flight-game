// 중앙대학교 서울캠퍼스 (Chung-Ang University) - 동작구
// 흑석 언덕: 1937 영신관 (101관) is the grey stone I-plan hall facing west over 중앙광장 — rusticated
// base, three storeys of regular windows, end gables, and a taller central entrance tower under a
// steep 맞배. Behind and uphill sit a brick classroom block and a taller white/glass academic wing
// (the 30 m mark). A granite 정문 letter wall and elms sit on the sloping lawn.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, gableRoof, slab, floorBands, mullions, tree, subgroup } from "./_helpers.mjs";

const stone = M.limestone;
const stoneDark = M.graniteDark;
const glass = material(0x1c2833, { roughness: 0.38, metalness: 0.28 });
const paving = material(0xc9c3b6, { roughness: 0.95 });

export default {
  id: "chung-ang-univ",
  name: "중앙대학교",
  nameEn: "Chung-Ang University",
  district: "동작구",
  lat: 37.5058,
  lon: 126.9575,
  height: 30,
  colliderRadius: 44,
  detail: "low",
  description: "영신관과 언덕 위 캠퍼스",
  create() {
    const g = new THREE.Group();

    // ── Hill: grass steps rising east, paved axis from the open 정문 ──
    cyl(g, { rTop: 42, h: 0.22, y: -0.05, mat: M.grass, seg: 28 });
    box(g, { w: 32, h: 0.7, d: 44, x: 10, mat: M.grassDark });
    box(g, { w: 20, h: 1.4, d: 34, x: 18, mat: M.grass });
    slab(g, { w: 7, d: 32, h: 0.18, y: 0.15, x: -8, mat: paving });
    slab(g, { w: 20, d: 16, h: 0.16, y: 0.7, x: 4, mat: paving }); // terrace in front of 영신관
    slab(g, { w: 14, d: 20, h: 0.2, y: 0.2, x: -18, mat: M.grass }); // 중앙광장 lawn

    // 정문 letter wall (open campus — no gate)
    box(g, { w: 10, h: 1.6, d: 0.55, x: -26, y: 0.15, z: 0, mat: stoneDark });
    [-3.2, -1.6, 0, 1.6, 3.2].forEach((dx, i) => {
      box(g, { w: 0.9, h: 1.1 + (i % 2) * 0.25, d: 0.35, x: -26 + dx, y: 1.75, mat: stone });
    });

    // ── 영신관: I-plan stone hall, central tower facing west (−x) ──
    const hall = subgroup(g, { x: 6, y: 1.4, z: 0 });
    const WALL = 11.6;
    box(hall, { w: 11, h: 0.7, d: 30, mat: stoneDark }); // rusticated plinth, long N–S
    box(hall, { w: 10.4, h: WALL, d: 28, y: 0.7, mat: stone });
    // Windows on the long east/west faces.
    const sills = [2.2, 5.8, 9.3];
    for (let i = 0; i < 7; i += 1) {
      const pz = -10.5 + i * 3.5;
      sills.forEach((sill) => {
        box(hall, { w: 0.22, h: 1.65, d: 1.2, x: -5.25, y: 0.7 + sill - 1.6, z: pz, mat: glass });
        box(hall, { w: 0.22, h: 1.65, d: 1.2, x: 5.25, y: 0.7 + sill - 1.6, z: pz, mat: glass });
      });
    }
    gableRoof(hall, { w: 11.2, d: 28.6, h: 3.8, y: 0.7 + WALL, overhang: 0.8, mat: M.roofTile, ry: Math.PI / 2 });

    // End pavilions (I serifs) with gables facing north / south
    [-1, 1].forEach((side) => {
      box(hall, { w: 14, h: WALL, d: 6.2, y: 0.7, z: side * 13.4, mat: stone });
      box(hall, { w: 14.4, h: 0.45, d: 6.6, y: 0.35, z: side * 13.4, mat: stoneDark });
      gableRoof(hall, { w: 14.2, d: 6.6, h: 3.4, y: 0.7 + WALL, z: side * 13.4, overhang: 0.6, mat: M.roofTile });
      [-4, 0, 4].forEach((px) => {
        sills.forEach((sill) => {
          box(hall, { w: 1.15, h: 1.6, d: 0.22, x: px, y: 0.7 + sill - 1.6, z: side * 16.55, mat: glass });
        });
      });
    });

    // Central tower / entrance bay projecting west
    box(hall, { w: 6.4, h: 16.4, d: 8.2, x: -5.6, y: 0.7, mat: stone });
    box(hall, { w: 6.8, h: 0.4, d: 8.6, x: -5.6, y: 0.35, mat: stoneDark });
    box(hall, { w: 2.2, h: 3.4, d: 2.4, x: -8.7, y: 0.7, mat: stoneDark }); // porch
    box(hall, { w: 1.5, h: 2.6, d: 0.2, x: -9.9, y: 0.7, mat: M.black });
    sills.concat([13.2]).forEach((sill) => {
      [-2.2, 0, 2.2].forEach((pz) => {
        if (sill < 16) box(hall, { w: 0.22, h: 1.5, d: 1.1, x: -8.85, y: 0.7 + sill - 1.6, z: pz, mat: glass });
      });
    });
    gableRoof(hall, { w: 7.2, d: 8.6, h: 3.6, x: -5.6, y: 17.1, overhang: 0.7, mat: M.roofTile, ry: Math.PI / 2 });
    // tower top ≈ 1.4 + 17.1 + 3.6 = 22.1 (campus block takes the 30 m)

    // ── Brick classroom block (north, mid-hill) ──
    const brickY = 1.2;
    box(g, { w: 18, h: 14.5, d: 10, x: 8, y: brickY, z: -26, mat: M.brick });
    box(g, { w: 18.4, h: 0.4, d: 10.4, x: 8, y: brickY, z: -26, mat: M.brickDark });
    floorBands(g, { w: 18, d: 10, h: 14.5, x: 8, y: brickY, z: -26, floorHeight: 3.6, mat: M.concreteDark, thickness: 0.28 });
    mullions(g, { w: 17, d: 10.1, h: 13.5, x: 8, y: brickY + 0.6, z: -26, spacing: 3.4, mat: M.brickDark, thickness: 0.2 });
    box(g, { w: 17.2, h: 0.7, d: 9.4, x: 8, y: brickY + 14.5, z: -26, mat: M.concrete });

    // ── Taller modern academic wing (east, uphill) — top ≈ 30 ──
    const tw = 14;
    const td = 18;
    const th = 27.4;
    const tx = 26;
    const tz = 8;
    const ty = 1.4;
    box(g, { w: tw, h: th, d: td, x: tx, y: ty, z: tz, mat: M.white });
    box(g, { w: tw + 0.2, h: 1.2, d: td + 0.2, x: tx, y: ty, z: tz, mat: M.concreteDark });
    box(g, { w: 0.3, h: th - 2, d: td - 1.6, x: tx - tw / 2 - 0.05, y: ty + 1.4, z: tz, mat: M.glassBlue });
    box(g, { w: 0.3, h: th - 2, d: td - 1.6, x: tx + tw / 2 + 0.05, y: ty + 1.4, z: tz, mat: M.glass });
    floorBands(g, { w: tw, d: td, h: th, x: tx, y: ty, z: tz, floorHeight: 3.5, mat: M.aluminum, thickness: 0.26 });
    mullions(g, { w: tw - 0.4, d: td + 0.12, h: th - 1.4, x: tx, y: ty + 1, z: tz, spacing: 3.2, mat: M.aluminum, thickness: 0.18 });
    box(g, { w: tw * 0.9, h: 1.15, d: td * 0.9, x: tx, y: ty + th, z: tz, mat: M.steelDark });
    // 1.4 + 27.4 + 1.15 = 29.95

    // Paths and a few 느릅나무
    slab(g, { w: 3.2, d: 20, h: 0.15, y: 1.35, x: 16, z: -8, mat: paving });
    [
      [-22, -12, 8], [-22, 12, 7.5], [-14, -18, 7], [-14, 18, 7],
      [2, -20, 6.5], [-4, 22, 6.5], [16, 24, 7], [20, -18, 6],
      [-30, -8, 6], [-30, 8, 6], [32, -10, 6.5],
    ].forEach(([x, z, h]) => tree(g, { x, y: 0.15, z, h, r: h * 0.34 }));

    return g;
  },
};
