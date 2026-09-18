// 숭례문 (Sungnyemun Gate, Namdaemun) - 중구
// Reference model for traditional Korean structures: granite gate base with an arched
// passage running north-south, a two-storey wooden pavilion (5칸 × 2칸) with a hip roof,
// and short remnants of the fortress wall on both sides.
import * as THREE from "../vendor/three.module.js";
import { M, box, cyl, hanokHall, gableRoof, archBlock } from "./_helpers.mjs";

export default {
  id: "sungnyemun",
  name: "숭례문",
  nameEn: "Sungnyemun Gate (Namdaemun)",
  district: "중구",
  lat: 37.5600,
  lon: 126.9754,
  height: 24,
  colliderRadius: 28,
  detail: "high",
  description: "국보 1호, 석축 위 2층 문루",
  create() {
    const g = new THREE.Group();

    // Granite base (석축) with the arched passage (홍예) through it along the N-S axis.
    const baseH = 7.5;
    archBlock(g, { w: 30, h: baseH, d: 14, archW: 5.6, archH: 6.2, mat: M.granite });
    // Subtle stone course lines
    for (let i = 1; i < 5; i += 1) {
      box(g, { w: 30.2, h: 0.18, d: 14.2, y: i * 1.5, mat: M.graniteDark });
    }
    // Balustrade (여장/난간) on the stone base
    box(g, { w: 30, h: 1.1, d: 0.6, y: baseH, z: 6.7, mat: M.granite });
    box(g, { w: 30, h: 1.1, d: 0.6, y: baseH, z: -6.7, mat: M.granite });
    box(g, { w: 0.6, h: 1.1, d: 14, y: baseH, x: 14.7, mat: M.granite });
    box(g, { w: 0.6, h: 1.1, d: 14, y: baseH, x: -14.7, mat: M.granite });

    // Fortress wall stubs (성곽) on both sides, slightly lower than the gate base.
    [-1, 1].forEach((side) => {
      box(g, { w: 10, h: 5.6, d: 7, x: side * 20, mat: M.graniteDark });
      box(g, { w: 10.4, h: 0.9, d: 7.4, x: side * 20, y: 5.6, mat: M.granite });
      gableRoof(g, { w: 10.4, d: 1.4, h: 0.6, x: side * 20, y: 6.5, z: 2.9, overhang: 0.2, mat: M.roofTile });
      gableRoof(g, { w: 10.4, d: 1.4, h: 0.6, x: side * 20, y: 6.5, z: -2.9, overhang: 0.2, mat: M.roofTile });
    });

    // Two-storey pavilion (문루). Long side runs east-west.
    hanokHall(g, {
      w: 24, d: 9.6, y: baseH,
      platformH: 0, wallH: 4.2, roofH: 4.6, overhang: 3, stories: 2, upperScale: 0.9,
      roofMat: M.roofTile, wallMat: M.hanokWall, columnMat: M.hanokWood, beamMat: M.dancheong,
    });
    // Corner columns are slightly thicker; add stout ones at the four corners of the lower storey.
    [[-12, -4.8], [12, -4.8], [-12, 4.8], [12, 4.8]].forEach(([x, z]) => {
      cyl(g, { rTop: 0.6, h: 4.2, x, y: baseH, z, mat: M.hanokWood, seg: 10 });
    });

    return g;
  },
};
