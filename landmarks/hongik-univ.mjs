// 홍익대학교 서울캠퍼스 (Hongik University) - 마포구
// 홍문관 (R동, 2006): 16-storey beige concrete/glass tower that is itself the main gate — a 45 m
// arched opening through the building, five floors spanning the arch, the campus rising behind on
// the Wausan hill. 문헌관 (brick) and a concrete academic block sit on the terrace; a granite stair
// and plaza run through the arch. Real gate is ~56 m wide; the cluster is scaled to fit r = 40
// while the 16-storey height stays ~65 m.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, archBlock, floorBands, mullions, slab, tree } from "./_helpers.mjs";

const beige = material(0xd8d0c2, { roughness: 0.78 });
const beigeDark = material(0xb7b0a4, { roughness: 0.82 });
const paving = material(0xc9c3b6, { roughness: 0.95 });
const brick = M.brick;
const glass = M.glassDark;

export default {
  id: "hongik-univ",
  name: "홍익대학교",
  nameEn: "Hongik University",
  district: "마포구",
  lat: 37.5525,
  lon: 126.9249,
  height: 65,
  colliderRadius: 40,
  detail: "low",
  description: "정문의 홍문관과 언덕 위 캠퍼스",
  create() {
    const g = new THREE.Group();

    // ── Ground: street plaza south of the gate, campus lawn on the hill ──
    cyl(g, { rTop: 39, h: 0.22, y: -0.22, mat: M.grass, seg: 18 });
    slab(g, { w: 36, d: 22, z: 20, h: 0.18, mat: paving }); // Hongdae-side plaza
    slab(g, { w: 12, d: 36, z: 6, h: 0.16, mat: paving }); // axis through the arch
    slab(g, { w: 28, d: 14, z: -4, h: 0.16, mat: paving }); // inner courtyard

    // ── 홍문관: portal tower, arch faces south (+z) toward 홍대 앞 ──
    const GZ = 14; // gate centre
    const GW = 36;
    const GD = 13;
    const ARCH = 45; // opening + legs
    archBlock(g, { w: GW, h: ARCH, d: GD, archW: 18, archH: 40, z: GZ, mat: beige });
    // Five floors over the arch (46–65 m)
    box(g, { w: GW, h: 19, d: GD, y: ARCH, z: GZ, mat: beige });
    box(g, { w: GW - 1.2, h: 1.0, d: GD - 1.2, y: 64, z: GZ, mat: beigeDark });
    floorBands(g, { w: GW, d: GD, h: 19, y: ARCH, z: GZ, floorHeight: 3.8, mat: beigeDark, thickness: 0.4 });
    mullions(g, { w: GW - 2, d: GD, h: 18, y: ARCH + 0.4, z: GZ, spacing: 4.2, mat: M.aluminum, thickness: 0.28 });
    // Glazing in the spanning floors and on the inner faces of the legs
    box(g, { w: GW - 3, h: 16.5, d: 0.35, y: ARCH + 1.2, z: GZ + GD / 2 - 0.15, mat: glass });
    box(g, { w: GW - 3, h: 16.5, d: 0.35, y: ARCH + 1.2, z: GZ - GD / 2 + 0.15, mat: glass });
    box(g, { w: 0.3, h: 38, d: GD - 2, x: -9.1, y: 0.4, z: GZ, mat: glass });
    box(g, { w: 0.3, h: 38, d: GD - 2, x: 9.1, y: 0.4, z: GZ, mat: glass });
    // Horizontal bands on the outer legs
    for (let i = 1; i <= 10; i += 1) {
      const y = i * 4;
      box(g, { w: 9.2, h: 0.35, d: GD + 0.25, x: -13.4, y, z: GZ, mat: beigeDark });
      box(g, { w: 9.2, h: 0.35, d: GD + 0.25, x: 13.4, y, z: GZ, mat: beigeDark });
    }
    // Window strips on the outer ends of the legs
    box(g, { w: 0.3, h: 62, d: GD - 3, x: -18, y: 1.5, z: GZ, mat: glass });
    box(g, { w: 0.3, h: 62, d: GD - 3, x: 18, y: 1.5, z: GZ, mat: glass });

    // ── Hill terrace (와우산) north of the gate ──
    box(g, { w: 52, h: 5.2, d: 28, z: -16, mat: M.concreteDark });
    box(g, { w: 50, h: 0.2, d: 26.5, y: 5.2, z: -16, mat: M.grass });
    // Granite stair from the courtyard up the terrace
    for (let i = 0; i < 8; i += 1) {
      box(g, { w: 9, h: 5.2 - i * 0.65, d: 0.85, z: -2.2 + i * 0.85, mat: M.granite });
    }

    // ── 문헌관: brick campus hall on the terrace ──
    const HY = 5.2;
    box(g, { w: 18, h: 24, d: 11, x: 2, y: HY, z: -20, mat: brick });
    floorBands(g, { w: 18, d: 11, h: 24, x: 2, y: HY, z: -20, floorHeight: 3.5, mat: M.brickDark, thickness: 0.35 });
    box(g, { w: 16.5, h: 1.1, d: 10, x: 2, y: HY + 24, z: -20, mat: M.concreteDark });
    box(g, { w: 14, h: 10, d: 0.3, x: 2, y: HY + 6, z: -14.4, mat: glass });
    // Concrete academic wing (제1공학관-ish) to the west
    box(g, { w: 12, h: 16, d: 9, x: -16, y: HY, z: -18, mat: M.concrete });
    floorBands(g, { w: 12, d: 9, h: 16, x: -16, y: HY, z: -18, floorHeight: 3.6, mat: M.concreteDark, thickness: 0.3 });
    box(g, { w: 10, h: 8, d: 0.25, x: -16, y: HY + 3, z: -13.4, mat: glass });
    // Lower brick studio block to the east
    box(g, { w: 10, h: 11, d: 8, x: 16, y: HY, z: -14, mat: M.brickDark });
    box(g, { w: 8, h: 0.7, d: 6.5, x: 16, y: HY + 11, z: -14, mat: M.concrete });

    // ── Name wall / 표지석 by the arch and a few campus trees ──
    box(g, { w: 4.2, h: 1.4, d: 0.55, x: -14, z: 24, mat: M.graniteDark });
    box(g, { w: 3.6, h: 0.15, d: 0.2, x: -14, y: 1.5, z: 24.1, mat: M.bronze });
    [[-22, 22], [22, 22], [-24, 6], [24, 4], [-28, -8], [20, -30], [-8, -32], [12, -32]]
      .forEach(([x, z], i) => tree(g, { x, z, h: 7.5 + (i % 3) * 0.6, r: 2.3 }));

    return g;
  },
};
