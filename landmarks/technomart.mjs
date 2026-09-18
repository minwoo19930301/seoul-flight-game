// 강변 테크노마트 (Techno Mart 21, Samoo 1998) - 광진구
// A 12-storey retail block (판매동: 전자상가, 롯데마트, CGV) filling the whole plot next to 강변역 and the
// 동서울터미널, with the 39-floor glass office slab (사무동, ~155 m) rising from it. The office tower is a wide
// blue-glass slab with strong horizontal spandrels whose long faces end in the building's signature curved
// crown - a flattened barrel vault lying across the top. The podium is light grey concrete/aluminium over a
// dark granite base with continuous horizontal window bands, big coloured sign panels and a giant screen
// facing the river, and an entrance canopy; the low bus-terminal block is attached on the west.
// Footprints ~0.6 of real, heights 1:1.
import * as THREE from "../vendor/three.module.js";
import { M, box, cyl, prism, floorBands, subgroup, tree, deg } from "./_helpers.mjs";

const PODIUM_H = 46; // 12 floors
const PODIUM_FLOOR = PODIUM_H / 12;
const TOWER_TOP = 141; // glass body ends where the vault begins
const CROWN_H = 14; // vault rise -> 155 m
const TW = 38; // office slab plan (real ~70 x 40 m)
const TD = 22;
const TX = 8; // tower sits east of the podium centre
const PW = 66; // podium plan
const PD = 42;
const PX = 3;

/** Semi-elliptical arch profile of width `w` and rise `h`; `t` > 0 makes it a rim (ring) instead of a solid. */
function archShape(w, h, t = 0, seg = 22) {
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0);
  for (let i = 0; i <= seg; i += 1) {
    const a = Math.PI - (Math.PI * i) / seg;
    shape.lineTo(Math.cos(a) * (w / 2), Math.sin(a) * h);
  }
  if (t > 0) {
    shape.lineTo(w / 2 - t, 0);
    for (let i = seg; i >= 0; i -= 1) {
      const a = Math.PI - (Math.PI * i) / seg;
      shape.lineTo(Math.cos(a) * (w / 2 - t), Math.sin(a) * (h - t));
    }
  }
  shape.closePath();
  return shape;
}

/** Barrel vault lying along z: arch profile in the x/y plane extruded over depth `d`, centred on (x, z). */
function vault(parent, { w, h, d, x = 0, y = 0, z = 0, t = 0, mat = M.glassBlue }) {
  const geometry = new THREE.ExtrudeGeometry(archShape(w, h, t), { depth: d, bevelEnabled: false, curveSegments: 1 });
  geometry.translate(0, 0, -d / 2);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

/** Flat sign panel stuck on a face. `face` = "s" | "n" | "e" | "w" of the box x0..x1 × z0..z1. */
function signPanel(g, { face, x0, x1, z0, z1, along, y, w, h, mat, depth = 0.35 }) {
  if (face === "s" || face === "n") {
    const z = face === "s" ? z1 + depth / 2 : z0 - depth / 2;
    box(g, { w, h, d: depth, x: along, y, z, mat });
  } else {
    const x = face === "e" ? x1 + depth / 2 : x0 - depth / 2;
    box(g, { w: depth, h, d: w, x, y, z: along, mat });
  }
}

export default {
  id: "technomart",
  name: "강변 테크노마트",
  nameEn: "Technomart (Gangbyeon)",
  district: "광진구",
  lat: 37.5355,
  lon: 127.0956,
  height: 155,
  colliderRadius: 46,
  detail: "medium",
  description: "39층 전자상가 복합 타워",
  create() {
    const g = new THREE.Group();
    // The block follows the river bank (ENE-WSW); the long faces look SSE over 올림픽대로 to the 한강.
    const site = subgroup(g, { ry: deg(18) });

    // ── Plot: asphalt service yard/parking with a granite forecourt on the river side ─────
    prism(site, {
      points: [[-31, -26], [31, -26], [44, -13], [44, 13], [31, 26], [-31, 26], [-44, 13], [-44, -13]],
      h: 0.5,
      mat: M.asphalt,
    });
    box(site, { w: 56, h: 0.6, d: 4, x: PX, y: 0, z: PD / 2 + 2.1, mat: M.granite });
    box(site, { w: 4, h: 0.6, d: 36, x: PX + PW / 2 + 2.1, y: 0, z: 0, mat: M.granite });

    // ── 판매동: 12-storey retail podium ───────────────────────────────────────────
    const px0 = PX - PW / 2;
    const px1 = PX + PW / 2;
    const pz0 = -PD / 2;
    const pz1 = PD / 2;
    box(site, { w: PW, h: PODIUM_H, d: PD, x: PX, y: 0.5, mat: M.concrete });
    // Dark granite base (1F-2F) with glazed shopfronts.
    box(site, { w: PW + 0.4, h: PODIUM_FLOOR * 2, d: PD + 0.4, x: PX, y: 0.5, mat: M.graniteDark });
    box(site, { w: PW - 6, h: 4.2, d: PD + 0.7, x: PX, y: 0.5, mat: M.glassDark });
    box(site, { w: PW + 0.7, h: 4.2, d: PD - 8, x: PX, y: 0.5, mat: M.glassDark });
    // Continuous horizontal window bands on every retail floor above the base.
    for (let f = 2; f < 12; f += 1) {
      const y = 0.5 + f * PODIUM_FLOOR + 1.1;
      box(site, { w: PW + 0.3, h: 1.7, d: PD + 0.3, x: PX, y, mat: M.glassDark });
    }
    // Aluminium piers and cornice.
    for (let i = 0; i <= 8; i += 1) {
      const x = px0 + (PW / 8) * i;
      box(site, { w: 1, h: PODIUM_H + 0.4, d: 0.5, x, y: 0.5, z: pz1 + 0.15, mat: M.aluminum });
      box(site, { w: 1, h: PODIUM_H + 0.4, d: 0.5, x, y: 0.5, z: pz0 - 0.15, mat: M.aluminum });
    }
    for (let i = 1; i < 5; i += 1) {
      const z = pz0 + (PD / 5) * i;
      box(site, { w: 0.5, h: PODIUM_H + 0.4, d: 1, x: px1 + 0.15, y: 0.5, z, mat: M.aluminum });
      box(site, { w: 0.5, h: PODIUM_H + 0.4, d: 1, x: px0 - 0.15, y: 0.5, z, mat: M.aluminum });
    }
    box(site, { w: PW + 0.9, h: 1.3, d: PD + 0.9, x: PX, y: 0.5 + PODIUM_H - 0.9, mat: M.aluminum });

    // Sign panels (plain rectangles) and the giant screen on the river (south) face.
    const faceArgs = { x0: px0, x1: px1, z0: pz0, z1: pz1 };
    signPanel(site, { ...faceArgs, face: "s", along: PX - 18, y: 0.5 + PODIUM_H - 6.2, w: 20, h: 4.2, mat: M.red });
    signPanel(site, { ...faceArgs, face: "s", along: PX + 22, y: 0.5 + PODIUM_H - 6.2, w: 12, h: 4.2, mat: M.blue });
    signPanel(site, { ...faceArgs, face: "s", along: PX + 24, y: 30, w: 9, h: 3, mat: M.orange });
    signPanel(site, { ...faceArgs, face: "s", along: PX - 22, y: 15, w: 8, h: 2.6, mat: M.yellow });
    signPanel(site, { ...faceArgs, face: "s", along: PX - 3, y: 19, w: 22, h: 11.5, mat: M.steelDark, depth: 0.5 }); // screen frame
    signPanel(site, { ...faceArgs, face: "s", along: PX - 3, y: 19.7, w: 20.6, h: 10.1, mat: M.black, depth: 0.7 });
    signPanel(site, { ...faceArgs, face: "n", along: PX + 10, y: 0.5 + PODIUM_H - 6.2, w: 24, h: 4.2, mat: M.red });
    signPanel(site, { ...faceArgs, face: "w", along: 0, y: 0.5 + PODIUM_H - 6.2, w: 16, h: 4.2, mat: M.red });
    signPanel(site, { ...faceArgs, face: "w", along: -12, y: 24, w: 7, h: 3, mat: M.blue });
    signPanel(site, { ...faceArgs, face: "e", along: 4, y: 0.5 + PODIUM_H - 6.2, w: 16, h: 4.2, mat: M.blue });
    signPanel(site, { ...faceArgs, face: "e", along: -10, y: 26, w: 7, h: 3, mat: M.orange });

    // Main entrance: canopy on columns and a tall glazed entrance bay (south face, centre).
    box(site, { w: 26, h: 8, d: 1, x: PX - 3, y: 0.5, z: pz1 + 0.3, mat: M.glassBlue });
    box(site, { w: 28, h: 0.7, d: 9, x: PX - 3, y: 8.5, z: pz1 + 4.5, mat: M.steel });
    [-11, -4, 4, 11].forEach((dx) => cyl(site, { rTop: 0.45, h: 8.5, x: PX - 3 + dx, y: 0.5, z: pz1 + 8.2, mat: M.steel, seg: 8 }));
    // Station-side entrance on the west face with a smaller canopy.
    box(site, { w: 6, h: 0.5, d: 14, x: px0 - 3, y: 6.5, z: 6, mat: M.steel });

    // Roof of the podium: plant rooms, cooling towers, rooftop stair cores.
    box(site, { w: 14, h: 3.2, d: 8, x: px0 + 10, y: 0.5 + PODIUM_H, z: -8, mat: M.concreteDark });
    box(site, { w: 8, h: 2.6, d: 10, x: px0 + 9, y: 0.5 + PODIUM_H, z: 9, mat: M.concreteDark });
    [-6, 0, 6].forEach((dz) => cyl(site, { rTop: 1.6, h: 2.8, x: px1 - 5, y: 0.5 + PODIUM_H, z: dz, mat: M.steelDark, seg: 12 }));
    box(site, { w: 5, h: 2.2, d: 5, x: px0 + 26, y: 0.5 + PODIUM_H, z: 14, mat: M.concreteDark });

    // ── 사무동: 39-floor office slab with the curved crown ──────────────────────────
    const ty0 = 0.5 + PODIUM_H;
    const bodyH = TOWER_TOP - ty0;
    box(site, { w: TW, h: bodyH, d: TD, x: TX, y: ty0, mat: M.glassBlue });
    floorBands(site, { w: TW, d: TD, h: bodyH, x: TX, y: ty0, floorHeight: 3.76, mat: M.steel, inset: -0.16, thickness: 0.75 });
    // Aluminium end piers and a centre pier on both long faces, running into the crown.
    [-TW / 2 + 0.6, 0, TW / 2 - 0.6].forEach((dx) => {
      box(site, { w: 1.2, h: bodyH + 1.5, d: 0.5, x: TX + dx, y: ty0, z: TD / 2 + 0.1, mat: M.aluminum });
      box(site, { w: 1.2, h: bodyH + 1.5, d: 0.5, x: TX + dx, y: ty0, z: -TD / 2 - 0.1, mat: M.aluminum });
    });
    // Curved crown: flattened barrel vault across the long faces, with steel rims and spandrels.
    vault(site, { w: TW, h: CROWN_H, d: TD, x: TX, y: TOWER_TOP, mat: M.glassBlue });
    vault(site, { w: TW + 0.5, h: CROWN_H + 0.25, d: 0.6, x: TX, y: TOWER_TOP - 0.1, z: TD / 2 + 0.1, t: 1.1, mat: M.steel });
    vault(site, { w: TW + 0.5, h: CROWN_H + 0.25, d: 0.6, x: TX, y: TOWER_TOP - 0.1, z: -TD / 2 - 0.1, t: 1.1, mat: M.steel });
    [3.76, 7.52, 11.28].forEach((dy) => {
      const hw = (TW / 2) * Math.sqrt(Math.max(0, 1 - ((dy + 0.35) / CROWN_H) ** 2));
      box(site, { w: hw * 2 - 0.3, h: 0.7, d: TD + 0.32, x: TX, y: TOWER_TOP + dy - 0.35, mat: M.steel });
    });
    // Belt at the transition and the "TECHNO MART" sign band on the river face of the crown.
    box(site, { w: TW + 0.5, h: 1.2, d: TD + 0.5, x: TX, y: TOWER_TOP - 0.7, mat: M.steel });
    box(site, { w: 26, h: 2.2, d: 0.4, x: TX, y: TOWER_TOP + 1.2, z: TD / 2 + 0.2, mat: M.red });
    box(site, { w: 26, h: 2.2, d: 0.4, x: TX, y: TOWER_TOP + 1.2, z: -TD / 2 - 0.2, mat: M.red });

    // ── 동서울터미널: low bus terminal block and its long roof, west of the podium ───
    box(site, { w: 10, h: 8.5, d: 24, x: -36.5, y: 0.5, mat: M.concrete });
    box(site, { w: 6, h: 3.5, d: 22, x: -35, y: 0.5, mat: M.glassDark });
    box(site, { w: 12.5, h: 0.7, d: 26, x: -36.6, y: 9, mat: M.steelDark });
    box(site, { w: 11.5, h: 0.4, d: 25, x: -36.6, y: 9.7, mat: M.aluminum });
    // Coaches at the bays.
    [[-39, 14, M.blue], [-35, 14.5, M.orange], [-31, 14, M.red]].forEach(([x, z, mat]) => {
      box(site, { w: 2.5, h: 3.2, d: 10, x, y: 0.5, z, mat });
      box(site, { w: 2.6, h: 1.1, d: 8, x, y: 1.7, z, mat: M.glassDark });
    });

    // Street trees along the north (역로) side and the forecourt.
    [[-20, -24], [-8, -24], [4, -24], [16, -24], [28, -24], [-26, 24.5], [34, 24.5]].forEach(([x, z], i) => {
      tree(site, { x, y: 0.5, z, h: 6 + (i % 3) * 0.6, r: 2 });
    });

    return g;
  },
};
