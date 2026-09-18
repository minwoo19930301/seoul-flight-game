// 목동종합운동장 (Mokdong Stadium, 1987–89) - 양천구
// Three sports bowls west → east along the Anyangcheon: the indoor ice rink (low white dome),
// 목동야구장 (horseshoe, home plate SW / outfield NNE) and the main football-and-track stadium
// (concrete oval, red 400 m track). Floodlight masts on the main bowl set the 24 m height.
// Footprints compressed to r = 50; the real cluster is much longer east–west.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, dome, disc, prism, tree, subgroup, deg } from "./_helpers.mjs";

const SEAT = material(0xb0b4b8, { roughness: 0.92 });
const SEAT_BLUE = material(0x3a6aa8, { roughness: 0.9 });
const TRACK = material(0xb04a32, { roughness: 1 });
const DIRT = material(0x9d6a40, { roughness: 1 });
const ICE = material(0xd8eef8, { roughness: 0.22, metalness: 0.15, emissive: 0x1a3344, emissiveIntensity: 0.08 });

export default {
  id: "mokdong-stadium",
  name: "목동종합운동장",
  nameEn: "Mokdong Stadium",
  district: "양천구",
  lat: 37.5306,
  lon: 126.88,
  height: 24,
  colliderRadius: 50,
  detail: "low",
  description: "주경기장과 야구장, 아이스링크",
  create() {
    const g = new THREE.Group();

    cyl(g, { rTop: 48.6, h: 0.22, y: -0.18, mat: M.grass, seg: 36 });
    box(g, { w: 72, h: 0.18, d: 12, z: 16, mat: M.asphalt });
    box(g, { w: 12, h: 0.18, d: 52, x: -2, mat: M.asphalt });

    iceRink(g, { x: -28, z: 2 });
    baseball(g, { x: -2, z: 1, ry: deg(22) });
    mainStadium(g, { x: 23, z: -2 });

    // Trees along the south highway edge and between venues
    [[-36, 16, 8], [-20, 18, 7.5], [6, 18, 8], [20, 16, 7], [34, 14, 8],
      [-36, -14, 7.5], [6, -18, 8], [34, -16, 7], [-16, -16, 7]].forEach(([x, z, h]) => {
      tree(g, { x, z, h, r: Math.min(2.4, 48.2 - Math.hypot(x, z)) });
    });

    return g;
  },
};

/** Indoor ice rink: rectangular hall under a flattened white dome (the western bowl). */
function iceRink(parent, { x, z }) {
  const s = subgroup(parent, { x, z });
  box(s, { w: 22, h: 0.4, d: 28, mat: M.granite });
  box(s, { w: 20, h: 6.5, d: 26, y: 0.4, mat: M.concrete });
  box(s, { w: 20.2, h: 2.2, d: 0.35, y: 1.6, z: 13.1, mat: M.glassDark });
  box(s, { w: 20.2, h: 2.2, d: 0.35, y: 1.6, z: -13.1, mat: M.glassDark });
  box(s, { w: 14, h: 0.12, d: 22, y: 0.45, mat: ICE });
  cyl(s, { rTop: 11.4, h: 0.6, y: 6.9, mat: M.aluminum, seg: 24, sx: 0.95, sz: 1.2 });
  dome(s, { r: 11.2, y: 7.5, scaleY: 0.48, mat: M.offWhite, seg: 24, sx: 0.95, sz: 1.2 });
  cyl(s, { rTop: 1.4, h: 0.7, y: 12.7, mat: M.steelDark, seg: 8 });
}

/** Baseball park: dirt diamond, green outfield, blue/grey horseshoe, home-plate canopy, CF board. */
function baseball(parent, { x, z, ry }) {
  const s = subgroup(parent, { x, z, ry });
  // Outfield grass fan (home at +z / south, looking to −z)
  prism(s, {
    points: [[-16, 6], [16, 6], [14, -16], [0, -20], [-14, -16]],
    h: 0.25,
    mat: M.grass,
  });
  box(s, { w: 13, h: 0.22, d: 13, y: 0.2, z: 1, ry: Math.PI / 4, mat: DIRT });
  cyl(s, { rTop: 1.3, h: 0.28, y: 0.35, z: -1.2, mat: DIRT, seg: 10 });
  [[0, 6.2], [5.4, 0.8], [-5.4, 0.8]].forEach(([bx, bz]) => {
    box(s, { w: 0.45, h: 0.12, d: 0.45, x: bx, y: 0.42, z: bz, mat: M.white });
  });
  // Horseshoe seating: home / 1루 / 3루, open toward centre field
  box(s, { w: 22, h: 8.5, d: 5.5, y: 0.2, z: 10.2, mat: SEAT });
  box(s, { w: 5.2, h: 7.2, d: 16, x: 13.4, y: 0.2, z: 1, mat: SEAT_BLUE });
  box(s, { w: 5.2, h: 7.2, d: 16, x: -13.4, y: 0.2, z: 1, mat: SEAT_BLUE });
  box(s, { w: 23, h: 1.5, d: 6.2, y: 8.7, z: 10.2, mat: M.concrete });
  // Home-plate canopy
  box(s, { w: 16, h: 0.4, d: 7, y: 12.2, z: 10, mat: M.aluminum });
  [-6, 0, 6].forEach((px) => cyl(s, { rTop: 0.28, h: 12.2, x: px, y: 0.2, z: 12.4, mat: M.steel, seg: 6 }));
  // Centre-field scoreboard
  box(s, { w: 8, h: 4.2, d: 0.7, y: 8, z: -19.2, mat: M.black });
  box(s, { w: 7.2, h: 3.4, d: 0.2, y: 8.4, z: -18.8, mat: M.glow });
}

/** Main stadium: oval concrete bowl, red track, pitch, side canopies, four floodlight masts. */
function mainStadium(parent, { x, z }) {
  const s = subgroup(parent, { x, z });
  const SX = 1.12;
  const SZ = 0.88;
  cyl(s, { rTop: 16.2, h: 0.35, mat: M.granite, seg: 28, sx: SX, sz: SZ });
  cyl(s, { rTop: 15.8, h: 13.5, y: 0.35, mat: M.limestone, seg: 28, sx: SX, sz: SZ });
  cyl(s, { rTop: 13.6, h: 4.2, y: 1.2, mat: SEAT, seg: 28, sx: SX, sz: SZ });
  cyl(s, { rTop: 14.8, h: 5.5, y: 5.4, mat: SEAT, seg: 28, sx: SX, sz: SZ });
  // Track and pitch (N–S)
  cyl(s, { rTop: 11.4, h: 0.2, y: 0.4, mat: TRACK, seg: 28, sx: 1.05, sz: 0.82 });
  box(s, { w: 12.4, h: 0.16, d: 18.5, y: 0.55, mat: M.grass });
  box(s, { w: 12.4, h: 0.04, d: 2.3, y: 0.7, z: -4.6, mat: M.grassDark });
  box(s, { w: 12.4, h: 0.04, d: 2.3, y: 0.7, z: 4.6, mat: M.grassDark });
  disc(s, { r: 1.6, rInner: 1.35, y: 0.74, mat: M.white, seg: 16 });
  // Glass concourse band + coping
  cyl(s, { rTop: 15.95, h: 1.6, y: 6.2, mat: M.glassDark, seg: 28, sx: SX, sz: SZ, open: true });
  cyl(s, { rTop: 16.4, h: 0.7, y: 13.85, mat: M.concrete, seg: 28, sx: SX, sz: SZ });
  // Side canopies on the long (N–S) stands
  [-1, 1].forEach((side) => {
    box(s, { w: 5.4, h: 0.45, d: 20, x: side * 13.2, y: 15.2, mat: M.aluminum });
  });
  // Four floodlight masts (set the 24 m height)
  [[15.2, 9], [15.2, -9], [-15.2, 9], [-15.2, -9]].forEach(([px, pz]) => {
    cyl(s, { rTop: 0.32, rBot: 0.45, h: 22.4, x: px, y: 0.3, z: pz, mat: M.steel, seg: 6 });
    box(s, { w: 3.6, h: 1.4, d: 0.7, x: px, y: 22.5, z: pz, mat: M.steelDark });
    box(s, { w: 3.2, h: 1.1, d: 0.2, x: px, y: 22.65, z: pz + (pz > 0 ? -0.4 : 0.4), mat: M.glow });
  });
}
