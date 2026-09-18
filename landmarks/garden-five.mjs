// 가든파이브 (Garden Five / 동남권유통단지, 2010) - 송파구
// Munjeong-dong wholesale complex: four pale retail bars (라이프 패션·영·리빙·테크노) around a
// courtyard, linked at the upper floors like a four-leaf clover, plus a fifth lower works bar.
// 11 storeys read as ~60 m including roof gardens. Plan ~0.22 of real; heights 1:1.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, tower, slab, tree, subgroup, deg } from "./_helpers.mjs";

const paleA = material(0xe4ddd0, { roughness: 0.78 });
const paleB = material(0xd8d2c6, { roughness: 0.8 });
const paleC = material(0xece8de, { roughness: 0.74 });
const paleD = material(0xcfc9bc, { roughness: 0.82 });
const FLOOR = 5.15;
const H = 56.6; // 11 floors + tower() roof slab → ~58; penthouse brings top to ~60

function retailWing(g, { w, d, x, z, mat, h = H }) {
  tower(g, { w, d, h, x, z, mat, bandMat: M.aluminum, floorHeight: FLOOR, roofMat: M.concreteDark, bands: true });
  box(g, { w: w * 0.78, h: 0.4, d: d * 0.78, x, y: h + 1.2, z, mat: M.grass });
  // Pale cladding fins on the long faces (punched-window read without a dense grid).
  const long = w >= d;
  if (long) {
    box(g, { w: w * 0.92, h: h * 0.9, d: 0.28, x, y: 2, z: z + d / 2 + 0.1, mat: M.aluminum });
    box(g, { w: w * 0.92, h: h * 0.9, d: 0.28, x, y: 2, z: z - d / 2 - 0.1, mat: M.aluminum });
  } else {
    box(g, { w: 0.28, h: h * 0.9, d: d * 0.92, x: x + w / 2 + 0.1, y: 2, z, mat: M.aluminum });
    box(g, { w: 0.28, h: h * 0.9, d: d * 0.92, x: x - w / 2 - 0.1, y: 2, z, mat: M.aluminum });
  }
}

export default {
  id: "garden-five",
  name: "가든파이브",
  nameEn: "Garden Five",
  district: "송파구",
  lat: 37.4781,
  lon: 127.1249,
  height: 60,
  colliderRadius: 80,
  detail: "low",
  description: "문정동 대형 복합 유통단지",
  create() {
    const g = new THREE.Group();
    const site = subgroup(g, { ry: deg(-8) });

    slab(site, { w: 112, d: 106, y: -0.2, h: 0.35, mat: M.asphalt });
    slab(site, { w: 34, d: 34, y: 0.12, h: 0.22, mat: M.granite });
    box(site, { w: 18, h: 0.15, d: 18, y: 0.32, mat: M.grass });

    // Four clover wings around 센트럴가든.
    retailWing(site, { w: 44, d: 26, x: 0, z: -32, mat: paleA }); // 패션관 (north)
    retailWing(site, { w: 26, d: 44, x: 32, z: 0, mat: paleB }); // 영관 (east)
    retailWing(site, { w: 44, d: 26, x: 0, z: 32, mat: paleC }); // 리빙관 (south)
    retailWing(site, { w: 26, d: 44, x: -32, z: 0, mat: paleD }); // 테크노관 (west)

    // Upper-floor links (3F–10F) at the four corners — reads as one connected complex.
    const linkH = 36;
    const linkY = 14;
    [[18, -18], [18, 18], [-18, 18], [-18, -18]].forEach(([x, z]) => {
      box(site, { w: 14, h: linkH, d: 14, x, y: linkY, z, mat: M.offWhite });
      box(site, { w: 12, h: 3.2, d: 12, x, y: linkY + linkH, z, mat: M.concreteDark });
    });

    // Fifth lower works / tool bar on the south-east (나·다 블록 hint).
    tower(site, {
      w: 36, d: 14, h: 42, x: 22, z: 52,
      mat: M.limestone, bandMat: M.aluminum, floorHeight: FLOOR, roofMat: M.concreteDark,
    });

    // Low plaza canopy (hint of the 스카이파라솔 without the real 76 m mast).
    cyl(site, { rTop: 11, rBot: 12.5, h: 0.45, y: 14.2, mat: M.membrane, seg: 16 });
    cyl(site, { rTop: 0.35, h: 14.2, y: 0.2, mat: M.steel, seg: 8 });
    [[-8, -8], [8, -8], [8, 8], [-8, 8]].forEach(([x, z]) => {
      box(site, { w: 0.25, h: 0.25, d: 12, x: x / 2, y: 13.9, z: z / 2, mat: M.steel, ry: Math.atan2(z, x) });
    });

    // Glass shopfronts on the plaza faces and a small penthouse on the north wing (height ~60).
    box(site, { w: 30, h: 5.2, d: 0.4, x: 0, y: 0.3, z: -18.8, mat: M.glass });
    box(site, { w: 0.4, h: 5.2, d: 30, x: 18.8, y: 0.3, z: 0, mat: M.glass });
    box(site, { w: 30, h: 5.2, d: 0.4, x: 0, y: 0.3, z: 18.8, mat: M.glass });
    box(site, { w: 0.4, h: 5.2, d: 30, x: -18.8, y: 0.3, z: 0, mat: M.glass });
    box(site, { w: 10, h: 2.2, d: 7, x: -8, y: H + 1.6, z: -32, mat: M.concreteDark });

    [[-50, -32], [-50, 0], [-50, 32], [50, -32], [50, 8], [0, -52], [-16, 52], [40, 40]].forEach(([x, z], i) => {
      tree(site, { x, y: 0.15, z, h: 7 + (i % 3) * 0.4, r: 2.1 });
    });

    return g;
  },
};
