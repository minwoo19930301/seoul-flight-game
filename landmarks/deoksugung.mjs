// 덕수궁 (Deoksugung Palace) - 중구
// The palace that sits next to City Hall: traditional 중화전 (single-storey 팔작 hall on a double
// 월대, rebuilt 1906) side by side with 석조전 (1910 neoclassical stone palace — rusticated base,
// columned portico, pediment, dark hip roof). 대한문 faces east toward the plaza; a wall fragment
// ties the gate to the compound. Site compressed to colliderRadius 30; heights stay real.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, hipRoof, gableRoof, hanokHall, hanokWall, tree, subgroup } from "./_helpers.mjs";

const paving = material(0xcac4b9, { roughness: 0.95 });
const earth = material(0xa89670, { roughness: 1 });
const win = M.glassDark;
const pine = material(0x2f6b3a, { roughness: 1 });

function railing(g, { x, z, w, d, y, gap = 0 }) {
  const t = 0.3;
  const h = 0.7;
  box(g, { w, h, d: t, x, y, z: z - d / 2 + t / 2, mat: M.granite });
  if (gap > 0) {
    const side = (w - gap) / 2;
    box(g, { w: side, h, d: t, x: x - gap / 2 - side / 2, y, z: z + d / 2 - t / 2, mat: M.granite });
    box(g, { w: side, h, d: t, x: x + gap / 2 + side / 2, y, z: z + d / 2 - t / 2, mat: M.granite });
  } else {
    box(g, { w, h, d: t, x, y, z: z + d / 2 - t / 2, mat: M.granite });
  }
  box(g, { w: t, h, d, x: x - w / 2 + t / 2, y, z, mat: M.granite });
  box(g, { w: t, h, d, x: x + w / 2 - t / 2, y, z, mat: M.granite });
}

function seokjojeon(g, { x, z }) {
  const s = subgroup(g, { x, z });
  const W = 18;
  const D = 11;
  const base = 1.6;
  const storey = 4.6;
  box(s, { w: W + 0.8, h: base, d: D + 0.8, mat: M.graniteDark });
  for (let i = 1; i <= 3; i += 1) {
    box(s, { w: W + 0.9, h: 0.12, d: D + 0.9, y: i * 0.45, mat: M.granite });
  }
  box(s, { w: W, h: storey * 3, d: D, y: base, mat: M.limestone });
  [base + storey, base + storey * 2].forEach((y) => {
    box(s, { w: W + 0.35, h: 0.28, d: D + 0.35, y, mat: M.granite });
  });
  box(s, { w: W + 0.9, h: 0.7, d: D + 0.9, y: base + storey * 3, mat: M.limestone });
  hipRoof(s, {
    w: W - 0.6, d: D - 0.6, h: 4.2, y: base + storey * 3 + 0.7,
    overhang: 1.5, ridge: 0.5, curve: 0.1, mat: M.roofTile,
  });

  // South portico: four columns + balcony + pediment
  const pz = D / 2 + 1.5;
  [-5.4, -1.8, 1.8, 5.4].forEach((px) => {
    cyl(s, { rTop: 0.38, rBot: 0.44, h: storey + 0.2, x: px, y: base, z: pz, mat: M.limestone, seg: 10 });
  });
  box(s, { w: 13.2, h: 0.55, d: 2.6, y: base + storey + 0.2, z: pz - 0.2, mat: M.limestone });
  box(s, { w: 12.4, h: 0.35, d: 0.4, y: base + storey + 0.75, z: pz + 0.9, mat: M.limestone });
  gableRoof(s, { w: 12.6, d: 2.4, h: 2.6, y: base + storey + 1.1, z: pz - 0.1, overhang: 0.15, mat: M.limestone });
  box(s, { w: 10.5, h: base, d: 2.8, z: pz - 0.1, mat: M.graniteDark });
  for (let i = 0; i < 3; i += 1) {
    box(s, { w: 8 - i * 1.2, h: 0.28, d: 0.9, y: i * 0.28, z: pz + 1.5 + i * 0.35, mat: M.granite });
  }

  // Window grid
  for (let floor = 0; floor < 3; floor += 1) {
    const y = base + 1.1 + floor * storey;
    const h = floor === 0 ? 2.2 : 2.4;
    for (let i = 0; i < 7; i += 1) {
      const px = -7.2 + i * 2.4;
      if (floor === 0 && Math.abs(px) < 6.2) continue;
      box(s, { w: 1.15, h, d: 0.14, x: px, y, z: D / 2 + 0.04, mat: win });
      box(s, { w: 1.15, h, d: 0.14, x: px, y, z: -D / 2 - 0.04, mat: win });
    }
    [-1, 1].forEach((sx) => {
      [-3, 0, 3].forEach((dz) => {
        box(s, { w: 0.14, h, d: 1.15, x: sx * (W / 2 + 0.04), y, z: dz, mat: win });
      });
    });
  }
}

export default {
  id: "deoksugung",
  name: "덕수궁",
  nameEn: "Deoksugung Palace",
  district: "중구",
  lat: 37.566,
  lon: 126.9742,
  height: 22,
  colliderRadius: 30,
  detail: "medium",
  description: "중화전과 신고전주의 석조전",
  create() {
    const g = new THREE.Group();
    const G = 0.12;

    box(g, { w: 52, h: 0.35, d: 52, y: -0.22, mat: earth });
    box(g, { w: 22, h: 0.12, d: 16, x: -3, y: G, z: 8, mat: paving });
    box(g, { w: 16, h: 0.12, d: 14, x: -5, y: G, z: -6, mat: paving });

    // 중화전 on a double 월대, facing south
    const JX = -3;
    const JZ = 7.2;
    box(g, { w: 18, h: 1.1, d: 14, x: JX, z: JZ, mat: M.granite });
    railing(g, { x: JX, z: JZ, w: 18, d: 14, y: 1.1, gap: 4.4 });
    box(g, { w: 14.2, h: 1.05, d: 11, x: JX, y: 1.1, z: JZ, mat: M.granite });
    railing(g, { x: JX, z: JZ, w: 14.2, d: 11, y: 2.15, gap: 4.2 });
    for (let i = 0; i < 3; i += 1) {
      box(g, { w: 4.2, h: 1.1 - i * 0.28, d: 0.55, x: JX, z: JZ + 7 + i * 0.55, mat: M.granite });
    }
    hanokHall(g, {
      w: 11.2, d: 8.4, x: JX, y: 2.15, z: JZ, platform: false, platformH: 0,
      wallH: 4.4, roofH: 5.2, overhang: 2.4,
    });

    // 중화문 south of the throne hall
    hanokHall(g, {
      w: 7.2, d: 4.2, x: JX, z: 16.6, platformH: 0.7, wallH: 3.1, roofH: 3, overhang: 1.7,
    });

    // 석조전 to the north-west, facing south toward a fountain court
    seokjojeon(g, { x: -6, z: -13.2 });
    cyl(g, { rTop: 2.4, h: 0.35, x: -6, y: G, z: -3.2, mat: M.water, seg: 16 });
    discRing(g, -6, -3.2);

    // East wall and 대한문 (the only one-storey palace front gate, facing east)
    hanokWall(g, { length: 16, x: 17.6, z: -6, ry: Math.PI / 2, h: 3.3, mat: M.granite });
    hanokWall(g, { length: 12, x: 17.6, z: 16, ry: Math.PI / 2, h: 3.3, mat: M.granite });
    hanokWall(g, { length: 22, x: 4, z: 22.2, h: 3.1, mat: M.granite });
    hanokWall(g, { length: 20, x: -8, z: -22.6, h: 3, mat: M.granite });
    const gate = subgroup(g, { x: 17.4, z: 5.4, ry: -Math.PI / 2 });
    hanokHall(gate, { w: 8.4, d: 5, platformH: 0.55, wallH: 3.2, roofH: 3.3, overhang: 1.8 });
    box(gate, { w: 3.2, h: 2.6, d: 0.4, y: 0.55, z: 2.4, mat: M.black });

    [
      [-18, 16, 6], [10, 18, 5.5], [-18, -18, 6.5], [8, -20, 5.5], [14, -12, 5],
    ].forEach(([x, z, h]) => tree(g, { x, z, h, r: h * 0.32, mat: pine }));

    return g;
  },
};

function discRing(g, x, z) {
  box(g, { w: 5.4, h: 0.28, d: 0.35, x, y: 0.12, z: z + 2.5, mat: M.granite });
  box(g, { w: 5.4, h: 0.28, d: 0.35, x, y: 0.12, z: z - 2.5, mat: M.granite });
  box(g, { w: 0.35, h: 0.28, d: 5.4, x: x + 2.5, y: 0.12, z, mat: M.granite });
  box(g, { w: 0.35, h: 0.28, d: 5.4, x: x - 2.5, y: 0.12, z, mat: M.granite });
}
