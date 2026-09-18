// 진관사 (Jingwansa Temple, founded 1011) - 은평구
// A thousand-year-old Goryeo temple in a wooded valley on the western flank of 북한산, famous today
// for its temple food. Two terraces: 대웅전 (main hall) in the centre of the upper terrace, flanked by
// 나한전 (west) and 명부전 (east), with a pair of 석등 lanterns and a small 3-tier stone pagoda in front;
// below it the courtyard, closed by the L-shaped 나가원 on the west and by the two-storey gate pavilion
// 홍제루 (open ground floor on columns) on the south, with the 동정각 bell pavilion in the south-east
// corner; the modern hanok-style 함월당 / 효림원 visitor buildings on the east; 일주문 on the entrance
// path; the 진관천 stream with a stone bridge along the west; dense forest on the surrounding slopes.
// The valley is compressed to fit r = 32 while the halls keep realistic heights.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, cone, hipRoof, pyramidRoof, stonePagoda, tree, subgroup } from "./_helpers.mjs";

const earth = material(0xb8a98a, { roughness: 1 }); // packed earth courtyard (마당)
const lattice = material(0x835a3e, { roughness: 0.85 }); // wooden lattice doors (창호)
const pine = material(0x2f6b3a, { roughness: 1 });

/** Single-storey hall (전각): granite platform, plaster walls, red columns at ~3 m spacing, 단청 band, hip roof. */
function hall(g, { x, y = 0, z, w, d, ry = 0, platformH = 0.9, pad = 1, wallH = 3.6, roofH = 3.8, overhang = 2.2, columns = true, wallMat = M.hanokWall }) {
  const s = subgroup(g, { x, y, z, ry });
  if (platformH > 0) {
    box(s, { w: w + pad * 2, h: platformH, d: d + pad * 2, mat: M.granite });
  }
  box(s, { w: w - 1, h: wallH, d: d - 1, y: platformH, mat: wallMat });
  if (columns) {
    const nx = Math.max(2, Math.round(w / 3));
    for (let i = 0; i <= nx; i += 1) {
      const px = -w / 2 + (w / nx) * i;
      cyl(s, { rTop: 0.28, h: wallH, x: px, y: platformH, z: d / 2, mat: M.hanokWood, seg: 6 });
      cyl(s, { rTop: 0.28, h: wallH, x: px, y: platformH, z: -d / 2, mat: M.hanokWood, seg: 6 });
    }
  }
  box(s, { w: w + 1, h: 0.9, d: d + 1, y: platformH + wallH, mat: M.dancheong });
  hipRoof(s, { w, d, h: roofH, y: platformH + wallH + 0.9, overhang });
  return platformH + wallH + 0.9 + roofH;
}

/** Stone lantern (석등): base, shaft, light chamber, pyramid cap. */
function lantern(g, { x, y = 0, z }) {
  box(g, { w: 1.1, h: 0.35, d: 1.1, x, y, z, mat: M.graniteDark });
  cyl(g, { rTop: 0.16, rBot: 0.2, h: 1.3, x, y: y + 0.35, z, mat: M.granite, seg: 6 });
  box(g, { w: 0.75, h: 0.7, d: 0.75, x, y: y + 1.65, z, mat: M.offWhite });
  pyramidRoof(g, { w: 0.9, d: 0.9, h: 0.45, x, y: y + 2.35, z, overhang: 0.25, mat: M.graniteDark });
  cone(g, { r: 0.14, h: 0.3, x, y: y + 2.8, z, mat: M.graniteDark, seg: 6 });
}

/** 홍제루: two-storey gate pavilion - open ground floor on columns, lattice-walled hall above, hip roof. */
function gatePavilion(g, { x, z, w = 12, d = 6 }) {
  const s = subgroup(g, { x, z });
  box(s, { w: w + 1.6, h: 0.6, d: d + 1.6, mat: M.granite });
  const colH = 3.4;
  for (let i = 0; i <= 3; i += 1) {
    const px = -w / 2 + (w / 3) * i;
    cyl(s, { rTop: 0.32, h: colH, x: px, y: 0.6, z: d / 2, mat: M.hanokWood, seg: 8 });
    cyl(s, { rTop: 0.32, h: colH, x: px, y: 0.6, z: -d / 2, mat: M.hanokWood, seg: 8 });
  }
  const floorY = 0.6 + colH;
  box(s, { w: w + 0.8, h: 0.6, d: d + 0.8, y: floorY, mat: M.hanokWood }); // floor beams and boards
  // balustrade (난간) around the upper floor
  box(s, { w: w + 0.8, h: 0.6, d: 0.15, y: floorY + 0.6, z: d / 2 + 0.4, mat: M.hanokWood });
  box(s, { w: w + 0.8, h: 0.6, d: 0.15, y: floorY + 0.6, z: -d / 2 - 0.4, mat: M.hanokWood });
  box(s, { w: 0.15, h: 0.6, d: d + 0.8, y: floorY + 0.6, x: w / 2 + 0.4, mat: M.hanokWood });
  box(s, { w: 0.15, h: 0.6, d: d + 0.8, y: floorY + 0.6, x: -w / 2 - 0.4, mat: M.hanokWood });
  const upperH = 3;
  box(s, { w: w - 1, h: upperH, d: d - 1, y: floorY + 0.6, mat: lattice });
  for (let i = 0; i <= 3; i += 1) {
    const px = -w / 2 + (w / 3) * i;
    cyl(s, { rTop: 0.26, h: upperH, x: px, y: floorY + 0.6, z: d / 2, mat: M.hanokWood, seg: 6 });
    cyl(s, { rTop: 0.26, h: upperH, x: px, y: floorY + 0.6, z: -d / 2, mat: M.hanokWood, seg: 6 });
  }
  const beamY = floorY + 0.6 + upperH;
  box(s, { w: w + 1, h: 1, d: d + 1, y: beamY, mat: M.dancheong });
  hipRoof(s, { w, d, h: 3.6, y: beamY + 1, overhang: 2.4 });
  return beamY + 1 + 3.6;
}

/** 동정각: small open bell pavilion with a bronze bell under a pyramid roof. */
function bellPavilion(g, { x, z }) {
  const s = subgroup(g, { x, z });
  box(s, { w: 4.4, h: 0.5, d: 4.4, mat: M.granite });
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    cyl(s, { rTop: 0.22, h: 3, x: sx * 1.5, y: 0.5, z: sz * 1.5, mat: M.hanokWood, seg: 6 });
  });
  cyl(s, { rTop: 0.7, rBot: 0.85, h: 1.5, y: 1.4, mat: M.bronze, seg: 10 });
  box(s, { w: 3.8, h: 0.6, d: 3.8, y: 3.5, mat: M.dancheong });
  pyramidRoof(s, { w: 3.4, d: 3.4, h: 1.7, y: 4.1, overhang: 1.2 });
}

export default {
  id: "jingwansa",
  name: "진관사",
  nameEn: "Jingwansa Temple",
  district: "은평구",
  lat: 37.6382,
  lon: 126.9461,
  height: 13,
  colliderRadius: 32,
  detail: "low",
  description: "북한산 서쪽 자락 천년 사찰",
  create() {
    const g = new THREE.Group();

    // ── Ground: grassy valley floor, upper terrace with a granite retaining wall, earth courtyard ──
    cyl(g, { rTop: 31.2, h: 0.3, y: -0.3, mat: M.grass, seg: 16 });
    const TY = 2.4; // upper terrace level
    box(g, { w: 36, h: TY, d: 16, z: -17, mat: M.graniteDark }); // x -18..18, z -25..-9
    box(g, { w: 35.4, h: 0.12, d: 15.4, y: TY, z: -17, mat: earth });
    box(g, { w: 32, h: 0.15, d: 21, x: -1, z: 1.5, mat: earth }); // lower courtyard (마당) x -17..15, z -9..12
    // stone stair between the terraces (5 steps down the retaining wall face)
    for (let i = 0; i < 5; i += 1) {
      box(g, { w: 5, h: TY - i * (TY / 5), d: 0.6, y: 0, z: -8.7 + i * 0.6, mat: M.granite });
    }

    // ── Upper terrace: 대웅전 flanked by 나한전 (west) and 명부전 (east), 석등 and pagoda in front ──
    hall(g, { x: 0, y: TY, z: -17.5, w: 12, d: 8, platformH: 1.2, pad: 1.3, wallH: 4.2, roofH: 4.4, overhang: 2.6 }); // 대웅전
    hall(g, { x: -12.5, y: TY, z: -18, w: 6.5, d: 4.5, platformH: 0.7, pad: 0.8, wallH: 3.1, roofH: 3, overhang: 1.7 }); // 나한전
    hall(g, { x: 12.5, y: TY, z: -18, w: 7, d: 4.8, platformH: 0.7, pad: 0.8, wallH: 3.2, roofH: 3.1, overhang: 1.7 }); // 명부전
    lantern(g, { x: -4, y: TY + 0.12, z: -11.8 });
    lantern(g, { x: 4, y: TY + 0.12, z: -11.8 });
    stonePagoda(g, { tiers: 3, baseW: 2.4, x: 0, y: TY + 0.12, z: -11.8 });

    // ── Lower courtyard: L-shaped 나가원 (west + south-west), 홍제루 gate pavilion (south), 동정각 ──
    hall(g, { x: -14.2, z: 0, w: 16, d: 5, ry: Math.PI / 2, platformH: 0.6, pad: 0.8, wallH: 3.2, roofH: 3.2, overhang: 1.8 }); // 나가원 west wing
    hall(g, { x: -9.5, z: 9.8, w: 10, d: 5, platformH: 0.6, pad: 0.8, wallH: 3.2, roofH: 3.2, overhang: 1.8 }); // 나가원 south wing
    gatePavilion(g, { x: 4.5, z: 10.5 }); // 홍제루
    bellPavilion(g, { x: 13, z: 5.5 }); // 동정각

    // ── East side: modern hanok-style 함월당 (temple-stay / temple food) and 효림원 ──
    hall(g, { x: 20, z: -4, w: 12, d: 7.5, ry: Math.PI / 2, platformH: 0.5, pad: 0.7, wallH: 3.4, roofH: 3.4, overhang: 2, columns: false }); // 함월당
    hall(g, { x: 19, z: 12.5, w: 9, d: 6, platformH: 0.5, pad: 0.7, wallH: 3.2, roofH: 3.2, overhang: 1.8, columns: false }); // 효림원
    box(g, { w: 8, h: 0.15, d: 10, x: 12, z: 16, mat: earth }); // path from 홍제루 to 효림원

    // ── Entrance path with 일주문 (two-post gate with a tiled roof) ──
    box(g, { w: 3.5, h: 0.15, d: 17, x: -2, z: 22, mat: earth }); // z 13.5..30.5
    [-2.2, 2.2].forEach((dx) => {
      box(g, { w: 0.9, h: 0.4, d: 0.9, x: -2 + dx, z: 26, mat: M.graniteDark });
      cyl(g, { rTop: 0.34, h: 3.8, x: -2 + dx, y: 0.4, z: 26, mat: M.hanokWood, seg: 8 });
    });
    box(g, { w: 6.2, h: 1, d: 1.4, x: -2, y: 4.2, z: 26, mat: M.dancheong });
    hipRoof(g, { w: 5.2, d: 1.6, h: 2.2, x: -2, y: 5.2, z: 26, overhang: 1.7, ridge: 0.6 });

    // ── 진관천 stream along the west with stone banks and a granite slab bridge ──
    box(g, { w: 3, h: 0.5, d: 36, x: -22.5, y: -0.4, z: 2, mat: M.water }); // z -16..20
    box(g, { w: 0.7, h: 0.5, d: 36, x: -24.35, y: -0.1, z: 2, mat: M.rock });
    box(g, { w: 0.7, h: 0.5, d: 36, x: -20.65, y: -0.1, z: 2, mat: M.rock });
    box(g, { w: 6.4, h: 0.6, d: 3, x: -22.5, y: 0.3, z: 6, mat: M.granite });
    [-1, 1].forEach((s) => box(g, { w: 6.4, h: 0.5, d: 0.3, x: -22.5, y: 0.9, z: 6 + s * 1.35, mat: M.granite }));
    box(g, { w: 4, h: 0.15, d: 3, x: -18.5, z: 6, mat: earth }); // bridge landing to the courtyard

    // ── Forest on the slopes (mountain side to the north and east, both banks of the stream) ──
    const trees = [
      // north slope behind the terrace
      [-8.5, -26.5, 12], [-1, -27.5, 13], [7, -26.5, 12.5], [-13.5, -25.5, 9], [13.5, -25.5, 9.5], [-22, -19, 10], [21.5, -19, 10],
      [-21.5, -13, 9], [22.5, -13, 9.5], [-4, -26.5, 9], [4, -26.8, 9.5],
      // east slope
      [26, -6, 10], [27, 3, 9.5], [25.5, 12, 8.5], [23, 18, 8], [16, 23.5, 8], [10, 27.5, 8.5], [3, 29, 8],
      // west bank of the stream / south of the courtyard
      [-27, -3, 9.5], [-26.5, 6, 8.5], [-25.5, 14, 9], [-20, 20, 8.5], [-15, 25, 8], [-8, 28, 8],
      [-12, 17, 6.5], [-17, -8, 6], [-19, 15, 5.5],
    ];
    // Canopy radius is clamped so that every tree stays inside the collider radius.
    trees.forEach(([x, z, h], i) => {
      const r = Math.min(h * 0.28, 31.6 - Math.hypot(x, z));
      tree(g, { x, z, h, r, mat: i % 3 === 0 ? pine : M.foliage });
    });

    return g;
  },
};
