// 서울대학교 정문 (Seoul National University Main Gate, 1978) - 관악구
// The famous "샤" gate: sepia-painted steel forming ㄱ·ㅅ·ㄷ of 국립서울대학교 (and a key for
// VERITAS LUX MEA). Two thick rectangular legs on granite plinths, a sharp ㅅ peak spanning them
// (~17 m real, modelled at the declared 22 m). The 2022 plaza put people under the gate: granite
// paving, the floor 문장, the 1.1 m 지식인 의자, a long name wall, and campus wall fragments with
// 느티나무. Passage runs north–south; campus lies to the south.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, frustum, slab, disc, strut, tree } from "./_helpers.mjs";

const sepia = material(0x6b4a32, { roughness: 0.42, metalness: 0.55 });
const sepiaDark = material(0x4a3224, { roughness: 0.48, metalness: 0.5 });
const paving = material(0xc9c3b6, { roughness: 0.95 });
const zelkova = material(0x4f8a3c, { roughness: 1 });

/** Rectangular steel member from `from` to `to` (centre-line), bottom-anchored box then aimed. */
function beam(g, { from, to, w = 1.5, d = 1.8, mat = sepia }) {
  const [x1, y1, z1] = from;
  const [x2, y2, z2] = to;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dz = z2 - z1;
  const len = Math.hypot(dx, dy, dz);
  const mesh = box(g, { w, h: len, d, x: (x1 + x2) / 2, y: (y1 + y2) / 2 - len / 2, z: (z1 + z2) / 2, mat });
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx, dy, dz).normalize());
  return mesh;
}

export default {
  id: "snu-main-gate",
  name: "서울대학교 정문",
  nameEn: "Seoul National University Main Gate",
  district: "관악구",
  lat: 37.4664,
  lon: 126.9484,
  height: 22,
  colliderRadius: 30,
  detail: "medium",
  description: "'샤' 형태의 상징 조형 정문",
  create() {
    const g = new THREE.Group();

    // ── Plaza (보행광장) and the floor 문장 ──
    slab(g, { w: 44, d: 36, h: 0.28, mat: paving });
    disc(g, { r: 5.4, y: 0.3, mat: M.graniteDark, seg: 24 });
    disc(g, { r: 3.6, y: 0.32, mat: M.granite, seg: 24 });
    disc(g, { r: 1.3, y: 0.34, mat: sepiaDark, seg: 16 });
    // Laurel-leaf rays of the 문장 (stylised, no texture).
    for (let i = 0; i < 12; i += 1) {
      const a = (i / 12) * Math.PI * 2;
      box(g, {
        w: 0.7, h: 0.08, d: 2.4,
        x: Math.cos(a) * 4.2, y: 0.3, z: Math.sin(a) * 4.2,
        mat: M.graniteDark, ry: -a,
      });
    }

    // ── Two granite plinths + sepia steel legs ──
    const px = 8.4;
    [-1, 1].forEach((s) => {
      box(g, { w: 4.2, h: 1.15, d: 4.4, x: s * px, mat: M.graniteDark });
      box(g, { w: 3.6, h: 0.35, d: 3.8, x: s * px, y: 1.15, mat: M.granite });
      // Vertical leg (the upright of 샤 / the ㄱ·ㄷ stems).
      frustum(g, {
        wBot: 2.5, dBot: 2.7, wTop: 2.15, dTop: 2.35,
        h: 13.4, x: s * px, y: 1.5, mat: sepia,
      });
      // Inner shoulder at the kink where the ㅅ begins.
      box(g, { w: 2.3, h: 1.1, d: 2.5, x: s * (px - s * 0.15), y: 14.7, mat: sepiaDark });
    });

    // ㅅ peak: two thick rectangular members meeting at 22 m.
    beam(g, { from: [-8.0, 15.4, 0], to: [0, 21.15, 0], w: 1.55, d: 2.0, mat: sepia });
    beam(g, { from: [8.0, 15.4, 0], to: [0, 21.15, 0], w: 1.55, d: 2.0, mat: sepia });
    // Peak cap and a short key-bit (the 샤 / 열쇠 reading).
    box(g, { w: 1.7, h: 0.85, d: 2.15, y: 21.15, mat: sepiaDark });
    // ㄱ on the left inner face (horizontal then down).
    box(g, { w: 2.6, h: 0.45, d: 0.7, x: -5.6, y: 13.6, z: 0, mat: sepiaDark });
    box(g, { w: 0.45, h: 2.4, d: 0.7, x: -4.5, y: 11.2, z: 0, mat: sepiaDark });
    // ㄷ on the right inner face (C / ㄷ).
    box(g, { w: 2.6, h: 0.45, d: 0.7, x: 5.6, y: 13.6, z: 0, mat: sepiaDark });
    box(g, { w: 2.6, h: 0.45, d: 0.7, x: 5.6, y: 11.2, z: 0, mat: sepiaDark });
    box(g, { w: 0.45, h: 2.85, d: 0.7, x: 4.5, y: 11.2, z: 0, mat: sepiaDark });
    // Thin cross-brace so the ㅅ reads in profile from the east/west.
    strut(g, { from: [-6.6, 16.2, 0], to: [6.6, 16.2, 0], r: 0.16, mat: sepiaDark, seg: 6 });

    // ── 지식인 의자 (1.1 m granite chair) north of the gate, looking at the 샤 ──
    box(g, { w: 1.7, h: 0.45, d: 1.6, x: 0, y: 0.28, z: -9.2, mat: M.granite });
    box(g, { w: 1.7, h: 1.1, d: 0.28, x: 0, y: 0.28, z: -9.95, mat: M.graniteDark });
    box(g, { w: 0.22, h: 0.55, d: 1.5, x: -0.74, y: 0.73, z: -9.2, mat: M.granite });
    box(g, { w: 0.22, h: 0.55, d: 1.5, x: 0.74, y: 0.73, z: -9.2, mat: M.granite });

    // ── Campus wall fragments + the long name wall ──
    // East name wall (한글/영문 자리 — raised blocks stand in for the letters).
    box(g, { w: 0.7, h: 2.4, d: 18, x: 20.5, y: 0.28, z: 2, mat: M.concrete });
    [-6, -3, 0, 3, 6].forEach((dz, i) => {
      box(g, { w: 0.2, h: 0.7 + (i % 2) * 0.25, d: 2.0, x: 20.05, y: 1.15, z: 2 + dz, mat: M.graniteDark });
    });
    // West + east stone campus walls with a granite cap (담장 fragments).
    [[-21.5, -4], [21.5, -12]].forEach(([x, z]) => {
      box(g, { w: 1.1, h: 1.5, d: 12, x, y: 0.28, z, mat: M.graniteDark });
      box(g, { w: 1.3, h: 0.35, d: 12.3, x, y: 1.78, z, mat: M.granite });
    });
    // South campus wall stubs flanking the walk into campus.
    [-12, 12].forEach((x) => {
      box(g, { w: 8, h: 1.6, d: 0.9, x, y: 0.28, z: 16.4, mat: M.graniteDark });
      box(g, { w: 8.2, h: 0.3, d: 1.1, x, y: 1.88, z: 16.4, mat: M.granite });
    });

    // ── Walk into campus and a pair of low granite benches ──
    slab(g, { w: 8, d: 10, h: 0.12, y: 0.28, z: 14, mat: M.granite });
    [-1, 1].forEach((s) => {
      box(g, { w: 2.2, h: 0.45, d: 0.55, x: s * 6.5, y: 0.28, z: -6.5, mat: M.granite });
    });

    // ── 느티나무 (교목) along the plaza edges ──
    [[-16, 10, 10], [16, 11, 10.5], [-17, -12, 9], [17, -13, 9.5], [-14, 15.5, 8.5], [14, 15.5, 8.5]]
      .forEach(([x, z, h]) => tree(g, { x, y: 0.28, z, h, r: 2.8, mat: zelkova }));

    return g;
  },
};
