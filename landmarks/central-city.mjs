// 센트럴시티·신세계강남 (TSKP Studio, 1999) - 서초구
// One mixed-use block on 신반포로: JW Marriott hotel tower (~144 m, 33F glass/metal shaft on the
// NW podium), Shinsegae Gangnam cream-stone department-store podium, and the Honam-line bus
// terminal as a low south box with a long steel canopy and bays. Plan compressed to fit
// colliderRadius 60; the hotel crown is the 144 m top.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, tree, floorBands, mullions } from "./_helpers.mjs";

const cream = material(0xddd4c4, { roughness: 0.82 });
const creamDark = material(0xb9b0a0, { roughness: 0.85 });
const champagne = material(0xc4b49a, { roughness: 0.38, metalness: 0.55 });
const burgundy = material(0x7a2e32, { roughness: 0.55 });
const hotelGlass = material(0x8fb4c8, { roughness: 0.2, metalness: 0.48, emissive: 0x102838, emissiveIntensity: 0.2 });

export default {
  id: "central-city",
  name: "센트럴시티·신세계강남",
  nameEn: "Central City & Shinsegae Gangnam",
  district: "서초구",
  lat: 37.5042,
  lon: 127.0047,
  height: 144,
  colliderRadius: 60,
  detail: "medium",
  description: "JW메리어트 호텔 타워와 신세계백화점, 고속버스터미널",
  create() {
    const g = new THREE.Group();

    const POD = 28; // ~7F podium (hotel lobby / 숲속의 거실 roof garden)
    const STORE = 36; // department-store roof
    const TERM = 13.5;

    // ── Site ──
    cyl(g, { rTop: 58.5, h: 0.35, y: -0.2, mat: M.asphalt, seg: 48 });
    box(g, { w: 88, h: 0.22, d: 72, y: 0.1, z: 2, mat: M.granite });

    // ── Shared podium: cream stone wrapping hotel base + Shinsegae ──
    // Main retail/hotel podium (NW–E), chamfered on the NE so it stays inside the collider.
    box(g, { w: 68, h: POD, d: 38, x: 2, y: 0.15, z: -8, mat: cream });
    // darker plinth / storefront glass
    box(g, { w: 68.4, h: 5.4, d: 38.4, x: 2, y: 0.15, z: -8, mat: M.glassDark });
    box(g, { w: 69, h: 0.7, d: 39, x: 2, y: 5.4, z: -8, mat: creamDark });
    // Shinsegae horizontal stone bands
    for (let y = 10; y < POD; y += 4.4) {
      box(g, { w: 68.5, h: 0.55, d: 38.5, x: 2, y, z: -8, mat: creamDark });
    }
    // punched retail windows on the east (plaza / 고속터미널 쪽) and south
    for (let y = 7.2; y < POD - 1; y += 4.4) {
      box(g, { w: 0.3, h: 2.6, d: 28, x: 36.2, y, z: -8, mat: M.glass });
      box(g, { w: 40, h: 2.6, d: 0.3, x: 10, y, z: 11.2, mat: M.glass });
    }
    // Shinsegae east entrance: tall glass + gold canopy + burgundy fascia
    box(g, { w: 0.4, h: 10.5, d: 16, x: 36.3, y: 0.15, z: -6, mat: M.glassWhite });
    box(g, { w: 6, h: 0.45, d: 18, x: 39.2, y: 10.4, z: -6, mat: M.gold });
    box(g, { w: 0.35, h: 1.2, d: 18, x: 36.3, y: POD - 1.4, z: -6, mat: burgundy });
    box(g, { w: 8, h: 1.1, d: 0.35, x: 32, y: POD - 1.4, z: 11.15, mat: M.gold });

    // Department-store roof (slightly taller east mass + mechanical)
    box(g, { w: 40, h: STORE - POD, d: 30, x: 12, y: POD, z: -6, mat: cream });
    box(g, { w: 41, h: 0.7, d: 31, x: 12, y: STORE, z: -6, mat: creamDark });
    box(g, { w: 12, h: 3.2, d: 8, x: 18, y: STORE + 0.7, z: -4, mat: M.steelDark });

    // ── JW Marriott tower on the NW corner of the podium ──
    const hx = -18;
    const hz = -12;
    const hw = 22;
    const hd = 30;
    const SHAFT = 138;
    box(g, { w: hw, h: SHAFT - POD, d: hd, x: hx, y: POD, z: hz, mat: hotelGlass });
    floorBands(g, {
      w: hw, d: hd, h: SHAFT - POD, x: hx, y: POD, z: hz,
      floorHeight: 3.85, mat: champagne, inset: -0.16, thickness: 0.55,
    });
    mullions(g, { w: hw, d: hd, h: SHAFT - POD, x: hx, y: POD, z: hz, spacing: 5.5, mat: champagne, thickness: 0.32 });
    // vertical champagne corners
    [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => {
      box(g, { w: 0.7, h: SHAFT - POD, d: 0.7, x: hx + sx * (hw / 2), y: POD, z: hz + sz * (hd / 2), mat: champagne });
    }));
    // crown / mechanical penthouse — 144 m
    box(g, { w: hw + 0.8, h: 1.2, d: hd + 0.8, x: hx, y: SHAFT, z: hz, mat: champagne });
    box(g, { w: hw * 0.72, h: 3.6, d: hd * 0.55, x: hx, y: SHAFT + 1.2, z: hz, mat: M.steelDark });
    box(g, { w: hw * 0.5, h: 1.2, d: hd * 0.32, x: hx, y: 142.8, z: hz, mat: champagne }); // 144.0
    // hotel drop-off canopy on the north (−z, Banpo / river side)
    box(g, { w: 16, h: 0.4, d: 7, x: hx, y: 7.2, z: hz - hd / 2 - 3.2, mat: champagne });
    [-6, 6].forEach((dx) => {
      cyl(g, { rTop: 0.28, h: 7.2, x: hx + dx, y: 0.15, z: hz - hd / 2 - 4.4, mat: M.steel, seg: 8 });
    });

    // 7F roof garden ("숲속의 거실") west of the shaft
    box(g, { w: 16, h: 0.25, d: 14, x: hx - 2, y: POD, z: 6, mat: M.grass });
    [[-22, 4], [-16, 8], [-10, 3]].forEach(([x, z]) => {
      tree(g, { x, y: POD + 0.25, z, h: 5.2, r: 1.7 });
    });
    box(g, { w: 10, h: 2.4, d: 4, x: hx + 2, y: POD, z: 8, mat: M.glassWhite });

    // ── Honam bus terminal: low south box + canopy + bays ──
    box(g, { w: 70, h: TERM, d: 20, x: 2, y: 0.15, z: 24, mat: M.concrete });
    box(g, { w: 70.4, h: 4.6, d: 20.4, x: 2, y: 0.15, z: 24, mat: M.glassDark });
    box(g, { w: 71, h: 0.6, d: 21, x: 2, y: TERM, z: 24, mat: M.steelDark });
    for (let y = 6.2; y < TERM - 0.4; y += 3.6) {
      box(g, { w: 56, h: 1.8, d: 0.28, x: 2, y, z: 34.15, mat: M.glass });
    }
    // long departure canopy over the bus apron (south / 신반포로)
    box(g, { w: 64, h: 0.45, d: 12, x: 2, y: 8.2, z: 38, mat: M.steel });
    for (let i = -4; i <= 4; i += 1) {
      cyl(g, { rTop: 0.28, h: 8.2, x: 2 + i * 7.2, y: 0.15, z: 42.2, mat: M.steelDark, seg: 6 });
    }
    box(g, { w: 64, h: 0.18, d: 11, x: 2, y: 0.15, z: 39, mat: M.asphalt });
    // a few coaches in the bays
    const busMat = [M.navy, M.red, M.steelDark, M.navy, burgundy];
    for (let i = 0; i < 5; i += 1) {
      const bx = -22 + i * 11;
      box(g, { w: 9.2, h: 3.1, d: 2.6, x: bx, y: 0.2, z: 39.2, mat: busMat[i] });
      box(g, { w: 2.4, h: 1.4, d: 2.5, x: bx + 3.1, y: 1.5, z: 39.2, mat: M.glass });
    }
    // terminal sign bar
    box(g, { w: 22, h: 1.4, d: 0.35, x: 2, y: 9.4, z: 34.3, mat: M.navy });

    // east plaza drop-off (toward the separate 경부 고속터미널)
    box(g, { w: 8, h: 0.12, d: 28, x: 42, y: 0.28, z: -4, mat: M.asphalt });
    [-16, -6, 4, 14].forEach((z) => {
      tree(g, { x: 46, y: 0.3, z, h: 7, r: 2.1 });
    });
    [-30, -10, 10, 28].forEach((x) => {
      tree(g, { x, y: 0.3, z: 48, h: 6.5, r: 2 });
    });

    return g;
  },
};
