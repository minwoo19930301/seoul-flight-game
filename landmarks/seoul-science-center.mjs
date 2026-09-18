// 서울시립과학관 (Seoul Science Center, Heerim 2017) - 노원구
// Kids' science museum in 불암산 도시자연공원: a white looping mass (사람·자연·과학의 무한고리)
// around a glass atrium, green roof tying into the north park, and playful G/O/B/R coloured
// exhibition volumes. South plaza with outdoor exhibits. 3 storeys + lantern; compressed to r = 34.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, cone, sphere, prism, slab, disc, tree } from "./_helpers.mjs";

const white = M.white;
const greenRoof = material(0x6a9a4a, { roughness: 1 });
const gMat = material(0x3aa36a, { roughness: 0.55 });
const oMat = material(0xe07a2c, { roughness: 0.55 });
const bMat = material(0x2c7ec8, { roughness: 0.5 });
const rMat = material(0xd94b4b, { roughness: 0.55 });
const paving = material(0xd5d1c8, { roughness: 0.95 });

/** Rounded-rectangle outline for the looping plan. */
function roundRect(hw, hd, r = 4, segs = 4) {
  const pts = [];
  const corners = [[hw - r, hd - r, 90], [hw - r, r - hd, 0], [r - hw, r - hd, -90], [r - hw, hd - r, 180]];
  corners.forEach(([cx, cz, start]) => {
    for (let i = 0; i <= segs; i += 1) {
      const a = ((start - (90 / segs) * i) * Math.PI) / 180;
      pts.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]);
    }
  });
  return pts;
}

export default {
  id: "seoul-science-center",
  name: "서울시립과학관",
  nameEn: "Seoul Science Center",
  district: "노원구",
  lat: 37.642,
  lon: 127.0773,
  height: 20,
  colliderRadius: 34,
  detail: "low",
  description: "하계동 어린이 과학 체험관",
  create() {
    const g = new THREE.Group();

    // ── Park lawn, south plaza, north green berm (불암산 쪽) ──
    cyl(g, { rTop: 31, h: 0.22, y: -0.22, mat: M.grass, seg: 18 });
    slab(g, { w: 24, d: 13, z: 16, h: 0.15, mat: paving });
    box(g, { w: 26, h: 3.0, d: 8, z: -23, mat: M.grassDark });

    // ── White loop around a courtyard (infinite-ring massing) ──
    const outer = roundRect(20, 14, 5, 4);
    const inner = roundRect(8.5, 5.5, 3, 4).reverse();
    prism(g, { points: outer, holes: [inner], h: 11.2, mat: white });
    // Ribbon windows
    box(g, { w: 18, h: 2.2, d: 0.25, y: 3.2, z: 14.1, mat: M.glass });
    box(g, { w: 18, h: 2.2, d: 0.25, y: 7.2, z: 14.1, mat: M.glass });
    box(g, { w: 0.25, h: 2.2, d: 12, x: 20.1, y: 3.2, mat: M.glass });
    box(g, { w: 0.25, h: 2.2, d: 12, x: -20.1, y: 3.2, mat: M.glass });
    box(g, { w: 16, h: 2.0, d: 0.25, y: 3.2, z: -14.1, mat: M.glass });
    // Green roof continuing the park
    prism(g, { points: roundRect(19.2, 13.2, 4.6, 4), holes: [roundRect(8.2, 5.2, 2.8, 4).reverse()], h: 0.7, y: 11.2, mat: greenRoof });
    // Solar strip
    box(g, { w: 8, h: 0.15, d: 2.2, x: -8, y: 11.95, z: 6, mat: M.navy });

    // ── Glass atrium in the loop, lantern to 20 m ──
    cyl(g, { rTop: 4.6, h: 16.2, mat: M.glassWhite, seg: 20 });
    cyl(g, { rTop: 4.9, h: 0.45, y: 5.4, mat: M.aluminum, seg: 20 });
    cyl(g, { rTop: 4.9, h: 0.45, y: 10.6, mat: M.aluminum, seg: 20 });
    cyl(g, { rTop: 3.2, rBot: 4.4, h: 2.4, y: 16.2, mat: M.white, seg: 16 });
    cyl(g, { rTop: 1.1, rBot: 2.0, h: 1.4, y: 18.6, mat: M.aluminum, seg: 12 });

    // ── G / O / B / R playful exhibition volumes ──
    box(g, { w: 8.5, h: 7.2, d: 7.5, x: -17, z: 4, mat: gMat }); // G 공존
    box(g, { w: 7.6, h: 0.35, d: 6.6, x: -17, y: 7.2, z: 4, mat: M.white });
    box(g, { w: 7.2, h: 6.4, d: 6.8, x: 10, z: 16, mat: oMat }); // O 생존
    box(g, { w: 6.4, h: 0.3, d: 6.0, x: 10, y: 6.4, z: 16, mat: M.white });
    box(g, { w: 9.0, h: 13.5, d: 8.2, x: 18, z: -4, mat: bMat }); // B 연결 (taller 6 m hall)
    box(g, { w: 8.0, h: 0.35, d: 7.2, x: 18, y: 13.5, z: -4, mat: M.white });
    box(g, { w: 7.4, h: 8.8, d: 6.4, x: -6, z: -16, mat: rMat }); // R 순환
    box(g, { w: 6.6, h: 0.3, d: 5.6, x: -6, y: 8.8, z: -16, mat: M.white });
    // Window cuts on the coloured boxes
    box(g, { w: 4, h: 2.4, d: 0.2, x: -17, y: 2.4, z: 7.85, mat: M.glassWhite });
    box(g, { w: 3.6, h: 2.2, d: 0.2, x: 10, y: 2.2, z: 19.5, mat: M.glassWhite });
    box(g, { w: 0.2, h: 6, d: 4, x: 22.6, y: 3.2, z: -4, mat: M.glassWhite });

    // ── South plaza: outdoor science toys ──
    disc(g, { r: 3.6, y: 0.16, z: 20, mat: M.granite, seg: 20 });
    sphere(g, { r: 1.4, x: -5, z: 21, mat: rMat, seg: 12 });
    sphere(g, { r: 1.0, x: -2.6, z: 23, mat: oMat, seg: 10 });
    sphere(g, { r: 0.8, x: -6.4, z: 23.2, mat: bMat, seg: 10 });
    // toy rocket
    cyl(g, { rTop: 0.55, rBot: 0.7, h: 4.2, x: 7, z: 21, mat: M.white, seg: 10 });
    cone(g, { r: 0.75, h: 1.6, x: 7, y: 4.2, z: 21, mat: rMat, seg: 10 });
    [-1, 1].forEach((s) => box(g, { w: 1.1, h: 0.15, d: 0.5, x: 7 + s * 0.9, y: 1.2, z: 21, mat: bMat }));
    // sundial disc + coloured climbing cubes
    disc(g, { r: 2.0, x: 13, y: 0.2, z: 20, mat: M.yellow, seg: 16 });
    cyl(g, { rTop: 0.08, h: 1.8, x: 13, y: 0.2, z: 20, mat: M.steelDark, seg: 6 });
    [[-12, 18, M.yellow], [-10, 20, gMat], [3, 24, bMat]].forEach(([x, z, mat]) => {
      box(g, { w: 1.6, h: 1.6, d: 1.6, x, z, mat });
    });

    // ── Park trees on the north berm ──
    [[-12, -24], [-2, -26], [8, -25], [14, -23], [-18, -14], [18, -12]]
      .forEach(([x, z], i) => tree(g, { x, y: 3.0, z, h: 6.5 + (i % 3) * 0.4, r: 2.0 }));

    return g;
  },
};
