// 서울역 (문화역서울284, 1925) + 신역사 (AREP, 2003) - 중구
// Old station: red-brick eclectic hall facing north, granite plinth, Byzantine copper-green
// central dome over the booking hall, lower wings with small turret domes and a clock aedicula
// on the entrance. Immediately west/south, the modern KTX shed — a curved glass-and-steel
// volume with a rising vault. Compressed to colliderRadius 40; the new roof sets the height.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, dome, cone, prism, hipRoof, tree } from "./_helpers.mjs";

const brick = material(0x9a4a36, { roughness: 0.92 });
const trim = material(0xcfc6b4, { roughness: 0.75 });
const win = M.glassDark;

function oldWing(g, { x, z, w, d, h }) {
  box(g, { w, h, d, x, y: 2, z, mat: brick });
  box(g, { w: w + 0.4, h: 2, d: d + 0.4, x, z, mat: M.graniteDark });
  hipRoof(g, { w: w - 0.8, d: d - 0.8, h: 3.2, x, y: 2 + h, z, overhang: 1.1, ridge: 0.55, curve: 0.08, mat: M.roofTile });
  for (let i = 0; i < 4; i += 1) {
    const px = x - w / 2 + 1.8 + i * ((w - 3.6) / 3);
    box(g, { w: 1.3, h: 2.4, d: 0.14, x: px, y: 3.1, z: z - d / 2 - 0.04, mat: win });
    box(g, { w: 1.3, h: 2.2, d: 0.14, x: px, y: 6.6, z: z - d / 2 - 0.04, mat: win });
  }
}

export default {
  id: "seoul-station",
  name: "서울역(문화역서울284)",
  nameEn: "Seoul Station (Old Station Hall)",
  district: "중구",
  lat: 37.556,
  lon: 126.9714,
  height: 34,
  colliderRadius: 40,
  detail: "medium",
  description: "비잔틴 돔의 붉은 벽돌 구역사와 유리 곡면 신역사",
  create() {
    const g = new THREE.Group();
    const G = 0.12;

    cyl(g, { rTop: 38.6, h: 0.35, y: -0.22, mat: M.asphalt, seg: 20 });
    box(g, { w: 32, h: 0.14, d: 12, x: 8, y: G, z: -16, mat: M.granite });

    // ── Old station, facing north (−z) ──────────────────────────────────────
    const CX = 10;
    const CZ = -3;
    const CW = 20;
    const CD = 18;
    const CH = 12;
    box(g, { w: CW + 0.6, h: 2.1, d: CD + 0.6, x: CX, z: CZ, mat: M.graniteDark });
    box(g, { w: CW, h: CH, d: CD, x: CX, y: 2.1, z: CZ, mat: brick });
    box(g, { w: CW + 0.5, h: 0.45, d: CD + 0.5, x: CX, y: 6.4, z: CZ, mat: trim });
    box(g, { w: CW + 0.8, h: 0.7, d: CD + 0.8, x: CX, y: 2.1 + CH, z: CZ, mat: trim });

    // North entrance: arched recess, clock aedicula
    box(g, { w: 8.4, h: 7.2, d: 1.2, x: CX, y: 2.1, z: CZ - CD / 2 - 0.4, mat: M.granite });
    box(g, { w: 5.2, h: 5.4, d: 0.5, x: CX, y: 2.3, z: CZ - CD / 2 - 0.85, mat: M.black });
    box(g, { w: 3.2, h: 3.2, d: 0.8, x: CX, y: 9.4, z: CZ - CD / 2 - 0.55, mat: trim });
    cyl(g, { rTop: 0.85, h: 0.22, x: CX, y: 10.4, z: CZ - CD / 2 - 0.95, mat: M.black, seg: 12, sx: 1, sz: 0.25 });
    cyl(g, { rTop: 0.7, h: 0.18, x: CX, y: 10.45, z: CZ - CD / 2 - 1.05, mat: M.white, seg: 12, sx: 1, sz: 0.25 });

    // Windows on the central block
    [-6, -2, 2, 6].forEach((dx) => {
      box(g, { w: 1.6, h: 2.6, d: 0.14, x: CX + dx, y: 3.2, z: CZ - CD / 2 - 0.04, mat: win });
      box(g, { w: 1.6, h: 2.2, d: 0.14, x: CX + dx, y: 8.4, z: CZ - CD / 2 - 0.04, mat: win });
    });

    // Byzantine drum + dome + lantern
    cyl(g, { rTop: 6.4, h: 3.2, x: CX, y: 14.8, z: CZ, mat: brick, seg: 20 });
    box(g, { w: 13.2, h: 0.45, d: 13.2, x: CX, y: 18, z: CZ, mat: trim });
    dome(g, { r: 6.6, x: CX, y: 18.4, z: CZ, mat: M.copperGreen, seg: 20, scaleY: 0.92 });
    cyl(g, { rTop: 1.1, h: 1.6, x: CX, y: 24.4, z: CZ, mat: M.copperGreen, seg: 10 });
    dome(g, { r: 1.2, x: CX, y: 26, z: CZ, mat: M.copperGreen, seg: 10, scaleY: 0.8 });
    cone(g, { r: 0.35, h: 1.4, x: CX, y: 27.8, z: CZ, mat: M.copperGreen, seg: 8 });

    oldWing(g, { x: 26.4, z: CZ + 0.6, w: 14, d: 13.5, h: 9.2 });
    oldWing(g, { x: -5.2, z: CZ + 0.6, w: 13, d: 13.5, h: 9.2 });
    // Small turret domes on the wing inner corners
    [-1, 1].forEach((s) => {
      const tx = CX + s * 11.2;
      cyl(g, { rTop: 1.7, h: 2.2, x: tx, y: 14.2, z: CZ - 4, mat: brick, seg: 12 });
      dome(g, { r: 1.85, x: tx, y: 16.4, z: CZ - 4, mat: M.copperGreen, seg: 12, scaleY: 0.85 });
    });

    // ── New station: curved glass shed to the west ──────────────────────────
    const curve = [];
    for (let i = 0; i <= 8; i += 1) {
      const t = i / 8;
      const a = -0.25 + t * 1.25;
      curve.push([-20 + Math.sin(a) * 11, -8 + t * 30]);
    }
    for (let i = 8; i >= 0; i -= 1) {
      const t = i / 8;
      const a = -0.25 + t * 1.25;
      curve.push([-20 + Math.sin(a) * 11 - 13.5, -8 + t * 30]);
    }
    prism(g, { points: curve, h: 18, y: 0, mat: M.glassWhite });
    // Rising vault along the spine
    for (let i = 0; i < 7; i += 1) {
      const t = i / 6;
      const a = -0.2 + t * 1.15;
      const x = -26.5 + Math.sin(a) * 10;
      const z = -4 + t * 24;
      const h = 16 + Math.sin(t * Math.PI) * 16;
      box(g, { w: 6.5, h: 0.7, d: 4.2, x, y: 18 + h * 0.15, z, mat: M.aluminum });
      box(g, { w: 5.2, h: h * 0.55, d: 3.4, x, y: 18, z, mat: M.glass });
    }
    // Steel ribs
    for (let i = 0; i < 6; i += 1) {
      const t = i / 5;
      const a = -0.2 + t * 1.15;
      const x = -26.5 + Math.sin(a) * 10;
      const z = -4 + t * 24;
      box(g, { w: 0.35, h: 15.5, d: 0.35, x: x + 3.4, z, mat: M.steel });
      box(g, { w: 0.35, h: 15.5, d: 0.35, x: x - 3.4, z, mat: M.steel });
    }

    [[28, -18, 7], [22, 14, 6], [-8, 22, 6.5]].forEach(([x, z, h]) => {
      tree(g, { x, z, h, r: h * 0.3 });
    });

    return g;
  },
};
