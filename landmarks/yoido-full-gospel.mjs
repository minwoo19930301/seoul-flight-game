// 여의도순복음교회 (Yoido Full Gospel Church, 대성전 1973 / 1980s) - 영등포구
// World's largest single Pentecostal congregation. The main sanctuary is a huge pale cream drum
// under a shallow dome (the building is often mistaken for an arena), with vertical glass bays,
// a south plaza stair and the tall outdoor Latin cross. Education towers sit outside this collider,
// so the model is the 대성전 alone, scaled to r = 30; heights stay near the real ~40 m crown.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, dome, polygonPrism, disc, tree } from "./_helpers.mjs";

const PALE = material(0xe8e2d2, { roughness: 0.78 });
const PALE_WARM = material(0xf0ead8, { roughness: 0.72 });
const DOME = material(0xe4dcc8, { roughness: 0.62, metalness: 0.08 });
const TRIM = material(0xcfc6b4, { roughness: 0.7 });

export default {
  id: "yoido-full-gospel",
  name: "여의도순복음교회",
  nameEn: "Yoido Full Gospel Church",
  district: "영등포구",
  lat: 37.531,
  lon: 126.9233,
  height: 40,
  colliderRadius: 30,
  detail: "medium",
  description: "돔형 대성전, 세계 최대 단일 교회",
  create() {
    const g = new THREE.Group();

    // ── Site: lawn disc, granite forecourt to the south ──
    cyl(g, { rTop: 29.4, h: 0.28, y: -0.22, mat: M.grass, seg: 40 });
    disc(g, { r: 16, y: 0.08, z: 10, mat: M.granite, seg: 32 });
    box(g, { w: 18, h: 0.22, d: 10, z: 18, mat: M.granite });

    // ── Pale octagonal sanctuary drum (대성전) ──
    const BODY = 20.4;
    polygonPrism(g, { sides: 12, r: 17.6, h: 1.3, mat: M.granite });
    polygonPrism(g, { sides: 12, r: 17.1, h: BODY - 1.3, y: 1.3, mat: PALE });
    // Recessed glass bays on every other facet, pale piers between them
    for (let i = 0; i < 12; i += 1) {
      const a = (i / 12) * Math.PI * 2 + Math.PI / 12;
      const r = 17.05;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      box(g, { w: 2.1, h: BODY - 2.4, d: 0.45, x, y: 2.0, z, mat: M.glass, ry: -a + Math.PI / 2 });
      box(g, { w: 2.4, h: 0.45, d: 0.55, x, y: 6.4, z, mat: TRIM, ry: -a + Math.PI / 2 });
      box(g, { w: 2.4, h: 0.45, d: 0.55, x, y: 11.2, z, mat: TRIM, ry: -a + Math.PI / 2 });
      box(g, { w: 2.4, h: 0.45, d: 0.55, x, y: 16.0, z, mat: TRIM, ry: -a + Math.PI / 2 });
    }
    // Cornice and roof deck
    polygonPrism(g, { sides: 12, r: 17.8, h: 1.15, y: BODY, mat: TRIM });
    cyl(g, { rTop: 15.2, h: 0.35, y: BODY + 1.15, mat: M.concrete, seg: 32 });

    // ── Drum + shallow cream dome ──
    const drumY = BODY + 1.5;
    cyl(g, { rTop: 12.4, h: 3.4, y: drumY, mat: PALE_WARM, seg: 32 });
    cyl(g, { rTop: 12.55, h: 1.3, y: drumY + 0.9, mat: M.glass, seg: 32, open: true });
    cyl(g, { rTop: 12.8, h: 0.55, y: drumY + 3.4, mat: TRIM, seg: 32 });
    const domeY = drumY + 3.95;
    dome(g, { r: 12.2, y: domeY, scaleY: 0.92, mat: DOME, seg: 32 });
    // Light ribs so the dome reads from the air
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      box(g, { w: 0.28, h: 10.6, d: 0.22, x: Math.cos(a) * 6.1, y: domeY, z: Math.sin(a) * 6.1, mat: TRIM, rz: Math.cos(a) * 0.55, rx: -Math.sin(a) * 0.55 });
    }
    const crown = domeY + 12.2 * 0.92; // ≈ 36.6
    cyl(g, { rTop: 1.5, rBot: 2.1, h: 1.1, y: crown - 0.2, mat: TRIM, seg: 12 });
    // Dome cross
    box(g, { w: 0.28, h: 3.4, d: 0.22, y: crown + 0.9, mat: M.white });
    box(g, { w: 1.7, h: 0.24, d: 0.2, y: crown + 2.55, mat: M.white });

    // ── South portico and grand stair ──
    box(g, { w: 14, h: 5.6, d: 4.2, y: 1.3, z: 16.4, mat: PALE });
    box(g, { w: 12.4, h: 4.4, d: 1.1, y: 1.6, z: 18.3, mat: M.glass });
    [-5.2, -1.75, 1.75, 5.2].forEach((x) => {
      cyl(g, { rTop: 0.42, h: 5.4, x, y: 1.3, z: 18.5, mat: M.limestone, seg: 8 });
    });
    box(g, { w: 14.6, h: 0.7, d: 4.6, y: 6.9, z: 16.4, mat: TRIM });
    for (let i = 0; i < 7; i += 1) {
      box(g, { w: 13 - i * 0.15, h: 0.32, d: 1.15, y: i * 0.32, z: 20.2 + i * 0.7, mat: M.granite });
    }

    // ── Outdoor Latin cross on the south plaza ──
    const cx = 0;
    const cz = 25.4;
    box(g, { w: 3.4, h: 0.7, d: 3.4, x: cx, z: cz, mat: M.graniteDark });
    box(g, { w: 0.55, h: 14.2, d: 0.45, x: cx, y: 0.7, z: cz, mat: M.white });
    box(g, { w: 6.4, h: 0.5, d: 0.4, x: cx, y: 11.4, z: cz, mat: M.white });

    // Low east/west annex narthex wings (pale, stay inside the collider)
    [-1, 1].forEach((s) => {
      box(g, { w: 8.5, h: 8.2, d: 10, x: s * 19.2, z: 2, mat: PALE });
      box(g, { w: 7.6, h: 3.2, d: 0.4, x: s * 19.2, y: 2.4, z: 7.1, mat: M.glass });
      box(g, { w: 8.7, h: 0.45, d: 10.2, x: s * 19.2, y: 8.2, z: 2, mat: TRIM });
    });

    // ── Trees flanking the plaza ──
    [[-10, 22, 7], [10, 22, 7.4], [-12, 14, 6.5], [12, 14, 6.8], [-8, -20, 8], [8, -20, 7.5]].forEach(([x, z, h]) => {
      tree(g, { x, z, h, r: Math.min(2.4, 29.2 - Math.hypot(x, z)) });
    });

    return g;
  },
};
