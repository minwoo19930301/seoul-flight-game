// 한국은행 화폐박물관 (구 한국은행 본관, 다쓰노 긴고, 1912) - 중구
// Renaissance granite bank on the Namdaemun-ro intersection. 井-shaped plan, rusticated base,
// piano-nobile windows, central columned portico with a pediment, and the two copper corner
// domes (with restored spires) that read from the air. Main facade faces south toward the plaza.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, dome, cone, hipRoof, gableRoof, tree } from "./_helpers.mjs";

const rust = material(0x8d8778, { roughness: 0.92 });
const ashlar = material(0xcac3b4, { roughness: 0.82 });
const win = M.glassDark;

export default {
  id: "bank-of-korea",
  name: "한국은행 화폐박물관",
  nameEn: "Bank of Korea Money Museum",
  district: "중구",
  lat: 37.562,
  lon: 126.9803,
  height: 26,
  colliderRadius: 30,
  detail: "medium",
  description: "1912년 르네상스 양식 석조 건물",
  create() {
    const g = new THREE.Group();
    const G = 0.12;

    cyl(g, { rTop: 28.8, h: 0.35, y: -0.22, mat: M.asphalt, seg: 20 });
    box(g, { w: 24, h: 0.14, d: 10, y: G, z: 14, mat: M.granite });

    // 井 plan: main rectangle plus short cross arms
    const W = 32;
    const D = 20;
    const baseH = 4.4;
    const upperH = 6.6;
    box(g, { w: W + 0.7, h: baseH, d: D + 0.7, mat: rust });
    for (let i = 1; i <= 4; i += 1) {
      box(g, { w: W + 0.85, h: 0.12, d: D + 0.85, y: i * 0.95, mat: M.graniteDark });
    }
    box(g, { w: W, h: upperH, d: D, y: baseH, mat: ashlar });
    box(g, { w: W + 0.45, h: 0.35, d: D + 0.45, y: baseH, mat: M.granite });
    box(g, { w: W + 0.9, h: 0.75, d: D + 0.9, y: baseH + upperH, mat: ashlar });
    // Cross arms (the 井)
    box(g, { w: 10, h: baseH + upperH, d: 6, x: 0, z: -D / 2 - 2.4, mat: ashlar });
    box(g, { w: 10, h: 0.75, d: 6.6, y: baseH + upperH, z: -D / 2 - 2.4, mat: ashlar });
    box(g, { w: 6, h: baseH + upperH, d: 10, x: W / 2 + 2.2, z: 0, mat: ashlar });
    box(g, { w: 6, h: baseH + upperH, d: 10, x: -W / 2 - 2.2, z: 0, mat: ashlar });

    hipRoof(g, {
      w: W - 1, d: D - 1, h: 3.4, y: baseH + upperH + 0.75,
      overhang: 1.2, ridge: 0.48, curve: 0.08, mat: M.copperGreen,
    });

    // Central portico + pediment on the south face
    const pz = D / 2 + 1.6;
    [-4.2, -1.4, 1.4, 4.2].forEach((x) => {
      cyl(g, { rTop: 0.4, rBot: 0.48, h: baseH + 0.2, x, z: pz, mat: ashlar, seg: 10 });
    });
    box(g, { w: 11.4, h: 0.55, d: 2.8, y: baseH + 0.2, z: pz - 0.15, mat: ashlar });
    box(g, { w: 10.6, h: 3.8, d: 1.4, y: baseH + 0.75, z: pz - 0.4, mat: ashlar });
    gableRoof(g, { w: 11.2, d: 2.6, h: 3.2, y: baseH + 4.55, z: pz - 0.2, overhang: 0.2, mat: ashlar });
    box(g, { w: 10, h: baseH, d: 2.6, z: pz - 0.2, mat: rust });
    box(g, { w: 3.4, h: 3.2, d: 0.3, y: 0.6, z: pz + 0.9, mat: M.black });
    for (let i = 0; i < 3; i += 1) {
      box(g, { w: 8 - i, h: 0.28, d: 0.85, y: i * 0.28, z: pz + 1.5 + i * 0.3, mat: M.granite });
    }

    // Piano-nobile and rusticated windows
    for (let i = 0; i < 9; i += 1) {
      const x = -14 + i * 3.5;
      if (Math.abs(x) < 5.5) continue;
      box(g, { w: 1.5, h: 2.3, d: 0.14, x, y: 1.15, z: D / 2 + 0.04, mat: win });
      box(g, { w: 1.6, h: 3.1, d: 0.14, x, y: baseH + 1.4, z: D / 2 + 0.04, mat: win });
      box(g, { w: 1.5, h: 2.3, d: 0.14, x, y: 1.15, z: -D / 2 - 0.04, mat: win });
      box(g, { w: 1.6, h: 3.1, d: 0.14, x, y: baseH + 1.4, z: -D / 2 - 0.04, mat: win });
    }
    [-1, 1].forEach((sx) => {
      [-6, -2, 2, 6].forEach((dz) => {
        box(g, { w: 0.14, h: 2.3, d: 1.4, x: sx * (W / 2 + 0.04), y: 1.15, z: dz, mat: win });
        box(g, { w: 0.14, h: 3.1, d: 1.5, x: sx * (W / 2 + 0.04), y: baseH + 1.4, z: dz, mat: win });
      });
    });

    // Corner drums + copper domes + 3 m spires (the restored 뾰족탑)
    [[-13.2, 7.4], [13.2, 7.4]].forEach(([x, z]) => {
      cyl(g, { rTop: 3.3, h: 3.4, x, y: baseH + upperH + 0.4, z, mat: ashlar, seg: 16 });
      box(g, { w: 7.1, h: 0.35, d: 7.1, x, y: baseH + upperH + 3.8, z, mat: ashlar });
      dome(g, { r: 3.5, x, y: baseH + upperH + 4.15, z, mat: M.copperGreen, seg: 16, scaleY: 0.95 });
      cyl(g, { rTop: 0.22, rBot: 0.4, h: 4.4, x, y: baseH + upperH + 7.5, z, mat: M.copperGreen, seg: 8 });
      cone(g, { r: 0.45, h: 1.2, x, y: baseH + upperH + 11.9, z, mat: M.copperGreen, seg: 8 });
    });

    // Small central roof lantern over the crossing
    cyl(g, { rTop: 2.1, h: 1.6, y: baseH + upperH + 4.1, mat: ashlar, seg: 12 });
    dome(g, { r: 2.2, y: baseH + upperH + 5.7, mat: M.copperGreen, seg: 12, scaleY: 0.75 });

    [[-16, 16, 5.5], [16, 16, 5.5], [-15, -14, 5.5], [15, -14, 5.5]].forEach(([x, z, h]) => {
      tree(g, { x, z, h, r: h * 0.28 });
    });

    return g;
  },
};
