// 세종대학교 (Sejong University) - 광진구
// Palace-style 정문 (1974, after 창경궁 명정문: 3-bay 팔작 gate, 배흘림 columns, 단청) facing
// south toward 어린이대공원, and the 5-storey 백제탑-style museum (1973/77) with stacked tiled
// eaves over 아사달 연못 and stone lanterns. Lawn and a low academic wing fill the precinct.
// Gate is low; the museum roof / finial is the height marker (~30 m). Fit r = 44.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, cone, hipRoof, pyramidRoof, tree, subgroup, trianglesToGeometry } from "./_helpers.mjs";

const CREAM = M.offWhite;
const WIN = M.glassDark;
const paving = material(0xcac4b9, { roughness: 0.95 });

function wins(parent, { x = 0, y = 0, z = 0, ry = 0, length, floors, storey, spacing, w = 1.15, h = 2.0, sill = 0.85 }) {
  const count = Math.max(1, Math.floor((length - 0.8) / spacing));
  const span = (count - 1) * spacing;
  const tris = [];
  for (let f = 0; f < floors; f += 1) {
    const v0 = f * storey + sill;
    for (let i = 0; i < count; i += 1) {
      const u = -span / 2 + i * spacing;
      tris.push([u - w / 2, v0, 0], [u + w / 2, v0, 0], [u + w / 2, v0 + h, 0], [u - w / 2, v0, 0], [u + w / 2, v0 + h, 0], [u - w / 2, v0 + h, 0]);
    }
  }
  const mesh = new THREE.Mesh(trianglesToGeometry(tris), WIN);
  mesh.position.set(x, y, z);
  mesh.rotation.y = ry;
  parent.add(mesh);
}

/** 3-bay palace gate after 명정문: stone 월대, red columns, 단청 beam, 팔작 roof. */
function palaceGate(parent, { x = 0, z = 0 }) {
  const s = subgroup(parent, { x, z });
  box(s, { w: 22, h: 1.35, d: 10, mat: M.granite }); // 월대
  box(s, { w: 23, h: 0.25, d: 11, y: 1.35, mat: M.graniteDark });
  const PH = 4.4;
  const piers = [-7.2, -2.5, 2.5, 7.2];
  piers.forEach((px) => {
    box(s, { w: 1.5, h: PH, d: 6.4, x: px, y: 1.6, mat: M.hanokWall });
    cyl(s, { rTop: 0.32, rBot: 0.4, h: PH, x: px, y: 1.6, z: 3.0, mat: M.hanokWood, seg: 8 });
    cyl(s, { rTop: 0.32, rBot: 0.4, h: PH, x: px, y: 1.6, z: -3.0, mat: M.hanokWood, seg: 8 });
  });
  // side walls of the gate house
  box(s, { w: 2.4, h: PH, d: 6.4, x: -9.4, y: 1.6, mat: M.hanokWall });
  box(s, { w: 2.4, h: PH, d: 6.4, x: 9.4, y: 1.6, mat: M.hanokWall });
  box(s, { w: 20.4, h: 1.15, d: 7.4, y: 1.6 + PH, mat: M.dancheong });
  box(s, { w: 3.6, h: 0.7, d: 0.25, y: 1.6 + PH + 0.15, z: 3.85, mat: M.black }); // 현판
  hipRoof(s, { w: 18.5, d: 6.8, h: 4.8, y: 1.6 + PH + 1.15, overhang: 2.4, ridge: 0.5 });
  // three door leaves (centre larger), hung in the openings
  box(s, { w: 3.4, h: 3.6, d: 0.18, y: 1.7, z: 0.2, mat: M.hanokWood });
  [-4.85, 4.85].forEach((px) => box(s, { w: 2.6, h: 3.2, d: 0.16, x: px, y: 1.7, z: 0.2, mat: M.hanokWood }));
  // short 담장 stubs
  [-1, 1].forEach((side) => {
    box(s, { w: 7, h: 0.5, d: 1.1, x: side * 15, y: 0, z: 0, mat: M.graniteDark });
    box(s, { w: 7, h: 1.6, d: 0.85, x: side * 15, y: 0.5, z: 0, mat: M.hanokWall });
    box(s, { w: 7.3, h: 0.4, d: 1.3, x: side * 15, y: 2.1, z: 0, mat: M.roofTile });
  });
}

/** 5-storey 백제탑 museum: receding storeys, tiled eave at each floor, hip roof + finial. */
function museum(parent, { x, z }) {
  const s = subgroup(parent, { x, z });
  let y = 0;
  let w = 16;
  let d = 14;
  const storey = 3.7;
  for (let i = 0; i < 5; i += 1) {
    box(s, { w, h: storey, d, y, mat: CREAM });
    const off = 0.08;
    wins(s, { y, z: d / 2 + off, length: w - 1.2, floors: 1, storey, spacing: 2.3, w: 1.1, h: 2.05, sill: 0.9 });
    wins(s, { y, z: -d / 2 - off, ry: Math.PI, length: w - 1.2, floors: 1, storey, spacing: 2.3, w: 1.1, h: 2.05, sill: 0.9 });
    wins(s, { x: w / 2 + off, y, z: 0, ry: Math.PI / 2, length: d - 1.2, floors: 1, storey, spacing: 2.3, w: 1.1, h: 2.05, sill: 0.9 });
    wins(s, { x: -w / 2 - off, y, z: 0, ry: -Math.PI / 2, length: d - 1.2, floors: 1, storey, spacing: 2.3, w: 1.1, h: 2.05, sill: 0.9 });
    y += storey;
    hipRoof(s, { w, d, h: i === 4 ? 5.6 : 1.7, y, overhang: i === 4 ? 2.2 : 1.6, ridge: i === 4 ? 0.4 : 0.02, ridgeMat: i === 4 ? M.black : false });
    y += i === 4 ? 0 : 0.55;
    w *= 0.88;
    d *= 0.88;
  }
  cone(s, { r: 0.45, h: 1.5, y: 5 * storey + 5.6 + 0.4, mat: M.gold, seg: 8 });
}

function lantern(g, { x, z }) {
  box(g, { w: 0.9, h: 0.28, d: 0.9, x, z, mat: M.graniteDark });
  cyl(g, { rTop: 0.14, h: 1.05, x, y: 0.28, z, mat: M.granite, seg: 6 });
  box(g, { w: 0.6, h: 0.5, d: 0.6, x, y: 1.33, z, mat: M.offWhite });
  pyramidRoof(g, { w: 0.75, d: 0.75, h: 0.35, x, y: 1.83, z, overhang: 0.18, mat: M.graniteDark });
}

export default {
  id: "sejong-univ",
  name: "세종대학교",
  nameEn: "Sejong University",
  district: "광진구",
  lat: 37.5509,
  lon: 127.0741,
  height: 30,
  colliderRadius: 44,
  detail: "low",
  description: "궐(闕) 양식 정문과 전통 지붕의 박물관",
  create() {
    const g = new THREE.Group();

    cyl(g, { rTop: 1, h: 0.22, y: -0.06, mat: M.grass, seg: 18, sx: 43, sz: 38 });
    box(g, { w: 14, h: 0.26, d: 36, z: 4, mat: paving }); // axial path, gate south → museum north
    box(g, { w: 28, h: 0.2, d: 12, z: 28, mat: M.grassDark }); // lawn just inside the gate

    palaceGate(g, { z: 32 });

    // ── 아사달 연못 and 백제탑 museum ────────────────────────────────────
    cyl(g, { rTop: 9.5, h: 0.45, z: 6, mat: M.granite, seg: 24 });
    cyl(g, { rTop: 8.4, h: 0.28, y: 0.4, z: 6, mat: M.water, seg: 24 });
    cyl(g, { rTop: 0.45, h: 0.7, y: 0.45, z: 6, mat: M.granite, seg: 8 });
    lantern(g, { x: -6.5, z: 10 });
    lantern(g, { x: 6.5, z: 10 });
    lantern(g, { x: -6.5, z: 2 });
    lantern(g, { x: 6.5, z: 2 });

    museum(g, { x: 0, z: -12 });

    // a low classroom wing so the precinct reads as a campus
    box(g, { w: 22, h: 11, d: 8, x: -26, z: -8, mat: M.brick });
    box(g, { w: 22.3, h: 0.45, d: 8.3, x: -26, y: 11, z: -8, mat: M.concreteDark });
    wins(g, { x: -26, z: -4 + 0.08, length: 20, floors: 3, storey: 3.5, spacing: 2.5, w: 1.3, h: 1.8, sill: 1.0 });

    [[-18, 22, 8], [18, 22, 8], [-22, 10, 7], [22, 10, 7], [-16, -28, 9], [16, -28, 9],
      [-30, -20, 8], [28, -18, 8], [24, 28, 7], [-24, 28, 7], [0, -32, 8]].forEach(([x, z, h]) => {
      tree(g, { x, z, h, r: Math.min(h * 0.26, 43.2 - Math.hypot(x, z)) });
    });

    return g;
  },
};
