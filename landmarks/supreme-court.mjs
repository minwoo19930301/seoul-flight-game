// 대법원 (Supreme Court of Korea, 1995, 원도시건축) - 서초구
// Pocheon-granite GPC civic block facing south onto 서초대로. Four connected masses:
// 법정동 (taller central courtroom with a deep square-pier colonnade), 본관 (long horizontal
// bar behind it), 동관 (법원행정처) and 서관 (도서관). Forecourt with the circular Harmony-95
// lawn. Plan ~0.45 of real so the site fits colliderRadius 50; the courtroom tops out at 40 m.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, tree, floorBands } from "./_helpers.mjs";

const pocheon = material(0xc9c2b3, { roughness: 0.86 });
const pocheonDark = material(0x8f8a80, { roughness: 0.88 });
const paving = material(0xd6d0c4, { roughness: 0.95 });

/** Broad stair descending from `top` toward +z (south) or −z. */
function stair(g, { x, z0, w, top, dir = 1, steps = 7, tread = 1.15, base = 0.15 }) {
  const rise = (top - base) / steps;
  for (let i = 0; i < steps; i += 1) {
    const d = (steps - i) * tread;
    box(g, { w, h: rise, d, x, y: base + i * rise, z: z0 + (dir * d) / 2, mat: pocheon });
  }
}

/** Granite bar with a dark plinth, punched window strips and stone piers. */
function wing(g, { x, z, w, d, h, y, floors, pier = 5.6 }) {
  box(g, { w: w + 0.6, h: 0.7, d: d + 0.6, x, y, z, mat: pocheonDark });
  box(g, { w, h: h - 0.7, d, x, y: y + 0.7, z, mat: pocheon });
  const wallH = h - 1.8;
  const fh = wallH / floors;
  for (let f = 0; f < floors; f += 1) {
    const wy = y + 1.15 + f * fh;
    const strip = f === 0 ? Math.min(2.8, fh * 0.62) : fh * 0.42;
    box(g, { w: w - 2.4, h: strip, d: 0.28, x, y: wy, z: z + d / 2 + 0.04, mat: M.glassDark });
    box(g, { w: w - 2.4, h: strip, d: 0.28, x, y: wy, z: z - d / 2 - 0.04, mat: M.glassDark });
    box(g, { w: 0.28, h: strip, d: d - 2.4, x: x + w / 2 + 0.04, y: wy, z, mat: M.glassDark });
    box(g, { w: 0.28, h: strip, d: d - 2.4, x: x - w / 2 - 0.04, y: wy, z, mat: M.glassDark });
  }
  const n = Math.max(2, Math.round(w / pier));
  for (let i = 1; i < n; i += 1) {
    const px = x - w / 2 + (w / n) * i;
    box(g, { w: 1.15, h: wallH, d: 0.45, x: px, y: y + 0.7, z: z + d / 2 + 0.08, mat: pocheon });
    box(g, { w: 1.15, h: wallH, d: 0.45, x: px, y: y + 0.7, z: z - d / 2 - 0.08, mat: pocheon });
  }
  box(g, { w: w + 1.2, h: 1.1, d: d + 1.2, x, y: y + h - 0.15, z, mat: M.limestone });
  box(g, { w: w - 1.4, h: 0.85, d: d - 1.4, x, y: y + h + 0.95, z, mat: pocheon });
}

export default {
  id: "supreme-court",
  name: "대법원",
  nameEn: "Supreme Court of Korea",
  district: "서초구",
  lat: 37.4923,
  lon: 127.0052,
  height: 40,
  colliderRadius: 50,
  detail: "medium",
  description: "화강석 대법정 매스와 수평 청사",
  create() {
    const g = new THREE.Group();

    const POD = 1.7;
    const COURT_H = 36.2; // podium + courtroom + cornice → 40
    const MAIN_H = 26.4;
    const WING_H = 20.2;

    // ── Ground: lawn disc + granite forecourt facing 서초대로 (south / +z) ──
    cyl(g, { rTop: 47.5, h: 0.35, y: -0.2, mat: M.grass, seg: 48 });
    box(g, { w: 74, h: 0.28, d: 48, y: 0.12, z: 1, mat: paving });
    box(g, { w: 48, h: 0.12, d: 20, y: 0.38, z: 16, mat: M.granite });

    // Harmony-95 circular plaza
    cyl(g, { rTop: 9.2, h: 0.22, y: 0.38, z: 28, mat: M.grass, seg: 28 });
    cyl(g, { rTop: 9.8, h: 0.1, y: 0.38, z: 28, mat: M.limestone, seg: 28 });
    cyl(g, { rTop: 1.6, h: 0.35, y: 0.55, z: 28, mat: pocheonDark, seg: 12 });
    // stainless "Harmony-95" upright (abstracted as a thin steel blade)
    box(g, { w: 0.35, h: 5.4, d: 2.1, y: 0.9, z: 28, mat: M.steel });

    // ── Shared podium ──
    box(g, { w: 78, h: 0.45, d: 46, y: 0.15, z: -4, mat: pocheonDark });
    box(g, { w: 76.5, h: POD - 0.3, d: 44.5, y: 0.55, z: -4, mat: pocheon });
    stair(g, { x: 0, z0: 18.4, w: 22, top: POD + 0.15, dir: 1 });

    // ── 본관: long horizontal bar (justices / chambers), north of the courtroom ──
    wing(g, { x: 0, z: -12, w: 62, d: 18, h: MAIN_H, y: POD, floors: 8, pier: 6.2 });
    box(g, { w: 14, h: 2.4, d: 8, y: POD + MAIN_H + 1.7, z: -12, mat: pocheonDark });

    // ── 동관 (법원행정처) / 서관 (도서관) ──
    wing(g, { x: 32.5, z: -5, w: 17, d: 30, h: WING_H, y: POD, floors: 6, pier: 5.5 });
    wing(g, { x: -32.5, z: -5, w: 17, d: 30, h: WING_H, y: POD, floors: 6, pier: 5.5 });
    // library reading-room glass on the west wing's south end
    box(g, { w: 12, h: 6.2, d: 0.35, x: -32.5, y: POD + 1.4, z: 10.2, mat: M.glass });

    // ── 법정동: taller central courtroom, projecting south ──
    const cz = 7.2;
    const cw = 28;
    const cd = 20;
    box(g, { w: cw + 0.8, h: 0.8, d: cd + 0.8, y: POD, z: cz, mat: pocheonDark });
    box(g, { w: cw, h: COURT_H - 2.4, d: cd, y: POD + 0.8, z: cz, mat: pocheon });
    // more solid courtroom walls: tall recessed slots rather than office bands
    for (let i = -2; i <= 2; i += 1) {
      if (i === 0) continue;
      box(g, { w: 2.4, h: 7.2, d: 0.28, x: i * 4.6, y: POD + 18, z: cz - cd / 2 - 0.05, mat: M.glassDark });
    }
    floorBands(g, { w: cw, d: cd, h: COURT_H - 8, y: POD + 4, z: cz, floorHeight: 4.4, mat: pocheonDark, inset: -0.08, thickness: 0.28 });
    // deep cornice and parapet — architectural top at 40 m
    box(g, { w: cw + 1.6, h: 1.35, d: cd + 1.6, y: POD + COURT_H - 2.4, z: cz, mat: M.limestone });
    box(g, { w: cw - 1, h: 0.95, d: cd - 1, y: POD + COURT_H - 1.05, z: cz, mat: pocheon });
    box(g, { w: 8, h: 1.15, d: 6, y: 38.85, z: cz, mat: pocheonDark }); // 40.0

    // Colonnade: eight square granite piers carrying a heavy entablature (south portico)
    const colZ = cz + cd / 2 + 2.4;
    const colH = 15.2;
    for (let i = 0; i < 8; i += 1) {
      const px = -13.3 + i * 3.8;
      box(g, { w: 1.25, h: colH, d: 1.25, x: px, y: POD, z: colZ, mat: pocheon });
      box(g, { w: 1.45, h: 0.35, d: 1.45, x: px, y: POD + colH, z: colZ, mat: M.limestone });
    }
    box(g, { w: 29.5, h: 2.4, d: 5.2, y: POD + colH, z: colZ - 0.4, mat: pocheon });
    box(g, { w: 30.4, h: 0.7, d: 5.8, y: POD + colH + 2.4, z: colZ - 0.4, mat: M.limestone });
    // recessed glass hall behind the piers
    box(g, { w: 24, h: 12.5, d: 0.35, y: POD + 1.2, z: cz + cd / 2 + 0.1, mat: M.glassDark });
    // 자유 · 평등 · 정의 — three dark plaques over the doors
    [-5.2, 0, 5.2].forEach((x) => {
      box(g, { w: 3.4, h: 1.05, d: 0.18, x, y: POD + 13.4, z: cz + cd / 2 + 0.28, mat: pocheonDark });
      box(g, { w: 2.6, h: 4.6, d: 0.2, x, y: POD + 1.2, z: cz + cd / 2 + 0.22, mat: M.glass });
    });

    // Flagpoles on the forecourt, not the roof (keeps the model top at 40 m)
    [-10, 10].forEach((x) => {
      cyl(g, { rTop: 0.08, rBot: 0.11, h: 12, x, y: 0.4, z: 20.5, mat: M.steel, seg: 6 });
      box(g, { w: 1.5, h: 0.65, d: 0.08, x: x + 0.8, y: 11.2, z: 20.5, mat: M.red });
    });

    // ── Planting: rows along the plaza and the north lawn ──
    [-30, -20, -12, 12, 20, 30].forEach((x) => {
      tree(g, { x, y: 0.4, z: 20, h: 7, r: 2.1 });
    });
    [-32, -16, 0, 16, 32].forEach((x) => {
      tree(g, { x, y: 0.15, z: -28, h: 7.5, r: 2.2 });
    });

    return g;
  },
};
