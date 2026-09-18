// 조계사 (Jogyesa Temple, 대웅전 1938) - 종로구
// Head temple of the Jogye Order, packed into a city courtyard. Signature: ornate two-storey
// 대웅전 (bright 단청, floral lattice doors) facing a stone court that holds the huge 회화나무
// (Chinese scholar / pagoda tree) and the slender 10-storey 진신사리탑. 일주문 on the south;
// a pale 백송 beside the hall. Compressed to colliderRadius 26; hall height is real.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, sphere, hipRoof, hanokHall, hanokWall, stonePagoda, tree } from "./_helpers.mjs";

const paving = material(0xcac4b9, { roughness: 0.95 });
const lattice = material(0x7a3a28, { roughness: 0.8 });
const pinePale = material(0xcfc6b0, { roughness: 1 });
const bark = material(0x4a3524, { roughness: 0.95 });
const canopy = material(0x3a7a38, { roughness: 1 });

function pagodaTree(g, { x, z }) {
  cyl(g, { rTop: 0.55, rBot: 0.95, h: 6.4, x, z, mat: bark, seg: 8 });
  sphere(g, { r: 5.6, x: x - 1.2, y: 6.2, z: z + 0.4, mat: canopy, seg: 8, sy: 0.85 });
  sphere(g, { r: 4.8, x: x + 1.6, y: 7.4, z: z - 0.8, mat: canopy, seg: 8, sy: 0.75 });
  sphere(g, { r: 3.8, x, y: 10.2, z: z + 1.1, mat: canopy, seg: 8, sy: 0.7 });
}

export default {
  id: "jogyesa",
  name: "조계사",
  nameEn: "Jogyesa Temple",
  district: "종로구",
  lat: 37.5741,
  lon: 126.9819,
  height: 20,
  colliderRadius: 26,
  detail: "low",
  description: "대한불교조계종 총본산 대웅전과 회화나무",
  create() {
    const g = new THREE.Group();
    const G = 0.12;

    cyl(g, { rTop: 25.2, h: 0.35, y: -0.2, mat: M.grassDark, seg: 20 });
    box(g, { w: 24, h: 0.14, d: 26, y: G, z: 1, mat: paving });

    // 대웅전 — two-storey, extra 단청 bands and lattice doors
    const HZ = -7.2;
    hanokHall(g, {
      w: 15, d: 11, z: HZ, platformH: 1.25, wallH: 4.35, roofH: 5.35,
      stories: 2, overhang: 2.6, upperScale: 0.84,
    });
    box(g, { w: 16.4, h: 0.35, d: 12.4, y: 1.25 + 4.35 - 0.1, z: HZ, mat: M.red });
    box(g, { w: 16.8, h: 0.22, d: 12.8, y: 1.25 + 4.35 + 0.7, z: HZ, mat: M.yellow });
    box(g, { w: 16.2, h: 0.28, d: 12.2, y: 1.25 + 4.35 + 0.28, z: HZ, mat: M.blue });
    for (let i = 0; i < 5; i += 1) {
      const px = -6 + i * 3;
      box(g, { w: 2.4, h: 3.2, d: 0.16, x: px, y: 1.45, z: HZ + 5.55, mat: lattice });
    }
    for (let i = 0; i < 3; i += 1) {
      box(g, { w: 2.4, h: 1.1, d: 0.7, x: -3.6 + i * 3.6, z: HZ + 7.1, mat: M.granite });
    }

    // Courtyard: 회화나무 (the big one), 백송, 10-storey stone pagoda
    pagodaTree(g, { x: 7.4, z: 3.2 });
    tree(g, { x: -8.2, z: -5.4, h: 9, r: 2.4, mat: pinePale, trunkMat: M.offWhite });
    stonePagoda(g, { tiers: 8, baseW: 2.2, x: -5.2, z: 4.4 });

    // 일주문 on the south
    const GZ = 16.2;
    [-2.6, 2.6].forEach((dx) => {
      box(g, { w: 1, h: 0.45, d: 1, x: dx, z: GZ, mat: M.graniteDark });
      cyl(g, { rTop: 0.38, h: 4.2, x: dx, y: 0.45, z: GZ, mat: M.hanokWood, seg: 8 });
    });
    box(g, { w: 7.4, h: 1.05, d: 1.5, y: 4.65, z: GZ, mat: M.dancheong });
    box(g, { w: 7.6, h: 0.22, d: 1.7, y: 4.55, z: GZ, mat: M.red });
    box(g, { w: 7.6, h: 0.16, d: 1.7, y: 5.55, z: GZ, mat: M.yellow });
    hipRoof(g, { w: 6.4, d: 1.6, h: 2.3, y: 5.7, z: GZ, overhang: 1.6, ridge: 0.55, curve: 0.14 });

    // Side wall / 극락전 hint and courtyard walls
    hanokHall(g, { w: 7.2, d: 4.8, x: -14.2, z: -1.5, platformH: 0.7, wallH: 3.1, roofH: 3, overhang: 1.4, columns: false });
    hanokWall(g, { length: 16, x: -16.6, z: 6, ry: Math.PI / 2, h: 2.4 });
    hanokWall(g, { length: 14, x: 16.8, z: 5, ry: Math.PI / 2, h: 2.4 });
    hanokWall(g, { length: 10, x: -8, z: 17.8, h: 2.3 });
    hanokWall(g, { length: 8, x: 10, z: 17.8, h: 2.3 });

    [[-14, 12, 5.5], [14, 11, 5.5], [13, -10, 5], [-13, -12, 5.5]].forEach(([x, z, h]) => {
      tree(g, { x, z, h, r: h * 0.28 });
    });

    return g;
  },
};
