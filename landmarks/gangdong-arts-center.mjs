// 강동아트센터 (Gangdong Arts Center, Wondoshi, 2010) - 강동구
// White/ivory angular cultural block beside 명일근린공원: 대극장 한강 with a tall fly-tower mass,
// glass lobby facing a grass/제주석 plaza, and a lower 소극장 드림 wing. Heights 1:1; plan ~0.7.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, prism, tree, slab, subgroup, deg } from "./_helpers.mjs";

const ivory = material(0xece6d6, { roughness: 0.72 });
const ivoryDeep = material(0xd9d2c2, { roughness: 0.78 });
const jeju = material(0x6a6560, { roughness: 0.92 });

export default {
  id: "gangdong-arts-center",
  name: "강동아트센터",
  nameEn: "Gangdong Arts Center",
  district: "강동구",
  lat: 37.551,
  lon: 127.1577,
  height: 22,
  colliderRadius: 40,
  detail: "low",
  description: "명일근린공원 옆 공연장",
  create() {
    const g = new THREE.Group();
    // 동남로 to the east-south-east; park lawn opens west-north.
    const site = subgroup(g, { ry: deg(-22) });

    slab(site, { w: 56, d: 52, y: -0.2, h: 0.35, mat: M.grass });
    slab(site, { w: 30, d: 20, x: 8, y: 0.1, z: 5, h: 0.22, mat: jeju });
    box(site, { w: 16, h: 0.18, d: 14, x: 10, y: 0.3, z: -7, mat: M.grassDark });

    // 대극장 한강: low ivory auditorium box.
    box(site, { w: 32, h: 12.2, d: 26, x: -4, y: 0.2, z: -2, mat: ivory });
    box(site, { w: 28, h: 2.2, d: 8, x: -4, y: 5.4, z: 11.2, mat: M.glassDark });
    box(site, { w: 32.6, h: 0.7, d: 26.6, x: -4, y: 12.2, z: -2, mat: ivoryDeep });

    // Fly tower (무대탑) — blank taller mass on the stage / park side.
    box(site, { w: 16, h: 21.4, d: 18, x: -20, y: 0.2, z: -4, mat: ivory });
    box(site, { w: 16.5, h: 0.55, d: 18.5, x: -20, y: 21.6, z: -4, mat: M.aluminum });
    box(site, { w: 3.2, h: 14, d: 0.35, x: -20, y: 6, z: 5.2, mat: ivoryDeep });
    box(site, { w: 0.35, h: 16, d: 8, x: -28.1, y: 4, z: -4, mat: M.concreteDark });

    // Angular glass lobby facing the plaza (folded white/glass wedge).
    prism(site, {
      points: [[8, -12], [22, -9], [20, 8], [6, 7]],
      h: 9.2,
      y: 0.2,
      mat: M.glassWhite,
    });
    prism(site, {
      points: [[10, -10], [20.5, -8], [19, 6.5], [8, 5.5]],
      h: 7.4,
      y: 0.3,
      mat: M.glass,
    });
    box(site, { w: 14, h: 0.4, d: 7, x: 15, y: 9.4, z: -1, mat: M.aluminum });
    box(site, { w: 8, h: 0.35, d: 4.5, x: 16, y: 3.6, z: 10.5, mat: M.steel });

    // 소극장 드림 / gallery wing, lower and slightly canted.
    prism(site, {
      points: [[-6, 12], [14, 14], [12, 24], [-9, 22]],
      h: 8.6,
      y: 0.2,
      mat: ivory,
    });
    box(site, { w: 12, h: 2.4, d: 0.35, x: 3, y: 3.8, z: 23.8, mat: M.glassDark });
    box(site, { w: 7, h: 3.2, d: 0.3, x: -2, y: 0.3, z: 23.4, mat: M.glass });

    // Studio / café bar along the north edge.
    box(site, { w: 20, h: 6.4, d: 7, x: 5, y: 0.2, z: -18, mat: ivoryDeep });
    box(site, { w: 11, h: 3.6, d: 0.3, x: 5, y: 1.4, z: -21.6, mat: M.glass });

    // Loading dock on the fly-tower west face.
    box(site, { w: 7, h: 4.2, d: 5.5, x: -26, y: 0.2, z: -4, mat: M.concrete });
    box(site, { w: 5.5, h: 0.35, d: 4.5, x: -27.5, y: 4.4, z: -4, mat: M.steelDark });

    [[18, -20], [24, 6], [14, 20], [-6, 26], [-26, 14], [-28, -18], [2, -26]].forEach(([x, z], i) => {
      tree(site, { x, y: 0.15, z, h: 7.5 + (i % 3), r: 2.3 });
    });

    return g;
  },
};
