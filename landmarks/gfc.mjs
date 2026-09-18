// 강남파이낸스센터 (Gangnam Finance Center / Star Tower, Kevin Roche 2001) - 강남구
// 45-storey, 206 m Class-A office on 테헤란로: recessed square-cut stone podium, a slim
// rectangular dark-blue glass curtain wall, exposed HVAC grille strips on the short east/west
// sides, and a sloped upper mass. Long axis is N–S; the north face addresses the street.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, frustum, floorBands, mullions, slab, tree } from "./_helpers.mjs";

const GLASS = material(0x2a4a68, { roughness: 0.18, metalness: 0.5, emissive: 0x0a1828, emissiveIntensity: 0.22 });
const GLASS_TOP = material(0x243e58, { roughness: 0.2, metalness: 0.52, emissive: 0x081420, emissiveIntensity: 0.2 });
const GRILLE = M.steelDark;

const W = 24;
const D = 46;
const POD_H = 16;
const SHAFT_H = 150;
const SLOPE_H = 34;
const TOP = 206;

export default {
  id: "gfc",
  name: "강남파이낸스센터",
  nameEn: "Gangnam Finance Center",
  district: "강남구",
  lat: 37.5,
  lon: 127.0366,
  height: 206,
  colliderRadius: 36,
  detail: "medium",
  description: "45층 206m 유리 커튼월 오피스",
  create() {
    const g = new THREE.Group();

    slab(g, { w: 34, d: 56, h: 0.7, mat: M.granite });
    box(g, { w: 12, h: 0.15, d: 8, y: 0.7, z: -26, mat: M.asphalt });

    // Recessed stone podium with a deep-set north lobby.
    box(g, { w: W + 2, h: POD_H, d: D + 2, y: 0.7, mat: M.graniteDark });
    box(g, { w: W - 2, h: 8.5, d: 0.6, y: 2.2, z: -(D + 2) / 2 + 0.1, mat: M.glassDark });
    box(g, { w: 11, h: 7.5, d: 3.2, y: 1.4, z: -(D + 2) / 2 + 2.2, mat: M.glass });
    for (let y = 4.4; y < POD_H; y += 3.8) {
      box(g, { w: W + 2.3, h: 0.28, d: D + 2.3, y: y, mat: M.granite });
    }

    // Curtain-wall shaft.
    box(g, { w: W, h: SHAFT_H, d: D, y: POD_H + 0.7, mat: GLASS });
    floorBands(g, {
      w: W, d: D, h: SHAFT_H, y: POD_H + 0.7, floorHeight: 4.5, mat: GRILLE, inset: -0.12, thickness: 0.4,
    });
    mullions(g, { w: W, d: D, h: SHAFT_H, y: POD_H + 0.7, spacing: 4, mat: M.aluminum, thickness: 0.28 });

    // HVAC grille rhythm on the short east / west faces.
    const grilleY0 = POD_H + 0.7;
    for (let i = 1; i < Math.floor(SHAFT_H / 4.5); i += 1) {
      const y = grilleY0 + i * 4.5 - 0.55;
      box(g, { w: 0.45, h: 0.7, d: D - 3, x: W / 2 + 0.15, y, mat: GRILLE });
      box(g, { w: 0.45, h: 0.7, d: D - 3, x: -W / 2 - 0.15, y, mat: GRILLE });
    }

    // Sloped upper mass + mechanical crown to 206 m.
    const slopeY = POD_H + 0.7 + SHAFT_H;
    frustum(g, { wBot: W, dBot: D, wTop: 16, dTop: 30, h: SLOPE_H, y: slopeY, mat: GLASS_TOP });
    for (let i = 1; i <= 7; i += 1) {
      const t = i / 7;
      box(g, {
        w: W - t * 8 + 0.3, h: 0.35, d: D - t * 16 + 0.3,
        y: slopeY + t * SLOPE_H - 0.18, mat: GRILLE,
      });
    }
    const crownY = slopeY + SLOPE_H;
    box(g, { w: 14, h: 2.6, d: 26, y: crownY, mat: M.steelDark });
    box(g, { w: 8, h: 1.2, d: 12, y: crownY + 2.6, mat: GRILLE });
    cyl(g, { rTop: 0.18, rBot: 0.45, h: TOP - (crownY + 3.8), y: crownY + 3.8, mat: M.steel, seg: 6 });

    // South plaza (후면 공개공지) and a couple of street trees.
    box(g, { w: 16, h: 0.2, d: 8, y: 0.7, z: 26, mat: M.grass });
    [-6, 6].forEach((x) => tree(g, { x, y: 0.9, z: 26, h: 7, r: 2 }));
    [-10, 10].forEach((x) => tree(g, { x, y: 0.7, z: -26, h: 6.5, r: 1.8 }));

    return g;
  },
};

