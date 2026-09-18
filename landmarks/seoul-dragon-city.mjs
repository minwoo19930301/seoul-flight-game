// 서울드래곤시티 (Seoul Dragon City, 2017) - 용산구
// Korea's largest hotel complex (four Accor hotels, 1,700 rooms) on the former bus-terminal site west
// of 용산역. Two 30-storey twin towers (Novotel Ambassador and Novotel Suites / ibis Styles) in dark
// glass with warm bronze spandrel bands stand side by side on a north-south line; their tops are tied
// together by 스카이킹덤 - a four-storey glass "sky kingdom" bar (bars, pool deck, glowing light band)
// that sits on both towers and bridges the gap between them, topping out at 135 m. The lower Grand
// Mercure tower (≈ 82 m) stands to the west, and a five-storey limestone podium with the convention
// hall, retail, a roof garden and a curved glass entrance canopy ties the three together. A short
// skywalk leaves the east side towards the 용산역 west exit. Plan compressed to ~0.6 of real to fit the
// collider (tower gap 24 instead of 40 m); heights are real.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, prism, floorBands, tree } from "./_helpers.mjs";

const bronzeBand = material(0x9a7a4a, { roughness: 0.4, metalness: 0.6 });
const paving = material(0xd0cbc0, { roughness: 0.95 });

/** Curved glass canopy: parabolic arc across `w` (local x), extruded `len` along local z, eaves at `y`. */
function canopy(parent, { w, len, rise, thick = 0.5, x = 0, y = 0, z = 0, ry = 0, mat = M.glassWhite, segments = 14 }) {
  const shape = new THREE.Shape();
  const arc = (t) => [(t * w) / 2, rise * (1 - t * t)];
  for (let i = 0; i <= segments; i += 1) {
    const [px, py] = arc(-1 + (2 * i) / segments);
    if (i === 0) shape.moveTo(px, py + thick);
    else shape.lineTo(px, py + thick);
  }
  for (let i = segments; i >= 0; i -= 1) {
    const [px, py] = arc(-1 + (2 * i) / segments);
    shape.lineTo(px, py);
  }
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: len, bevelEnabled: false, curveSegments: 1, steps: 1 });
  geometry.translate(0, 0, -len / 2);
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = ry;
  parent.add(mesh);
  return mesh;
}

/** Hotel tower: dark glass slab with bronze spandrel bands on every floor above the podium. */
function hotelTower(parent, { x, z, w, d, h, podiumTop, floorHeight = 3.8 }) {
  box(parent, { w, h, d, x, y: 0, z, mat: M.glassDark });
  floorBands(parent, { w, d, h: h - podiumTop, x, y: podiumTop, z, floorHeight, mat: bronzeBand, inset: -0.18, thickness: 0.75 });
  // vertical bronze fins dividing each long face into three bays
  [-1, 1].forEach((side) => [-1 / 6, 1 / 6].forEach((k) => {
    if (d >= w) {
      box(parent, { w: 0.6, h: h - podiumTop, d: 0.7, x: x + side * (w / 2 + 0.1), y: podiumTop, z: z + k * d, mat: bronzeBand });
    } else {
      box(parent, { w: 0.7, h: h - podiumTop, d: 0.6, x: x + k * w, y: podiumTop, z: z + side * (d / 2 + 0.1), mat: bronzeBand });
    }
  }));
}

export default {
  id: "seoul-dragon-city",
  name: "서울드래곤시티",
  nameEn: "Seoul Dragon City",
  district: "용산구",
  lat: 37.532,
  lon: 126.9622,
  height: 135,
  colliderRadius: 46,
  detail: "medium",
  description: "스카이브리지 '스카이킹덤'으로 연결된 트윈 호텔 타워",
  create() {
    const g = new THREE.Group();

    // ── Site: granite plaza disc (top at y = 0.1) with a paved drop-off strip on the east ──
    cyl(g, { rTop: 45.5, h: 0.4, y: -0.3, mat: M.granite, seg: 64 });
    box(g, { w: 8, h: 0.08, d: 30, x: 36, y: 0.1, mat: M.asphalt });
    box(g, { w: 3, h: 0.08, d: 24, x: 42, y: 0.1, mat: paving });

    // ── Podium: five storeys (convention hall, retail), chamfered so it fits the collider ──
    const POD_H = 22;
    const POD = [[-32, -28], [-24, -36], [24, -36], [32, -28], [32, 28], [24, 36], [-24, 36], [-32, 28]];
    const grow = (pts, e) => pts.map(([px, pz]) => [px + Math.sign(px) * e, pz + Math.sign(pz) * e]);
    prism(g, { points: POD, h: POD_H, y: 0.1, mat: M.limestone });
    prism(g, { points: grow(POD, 0.2), h: 4.6, y: 0.4, mat: M.glassDark }); // ground-floor storefront band
    for (let f = 2; f <= 4; f += 1) {
      prism(g, { points: grow(POD, 0.2), h: 1.7, y: 0.1 + f * 4.4 - 1.2, mat: M.glassDark });
    }
    prism(g, { points: grow(POD, 0.4), h: 0.8, y: POD_H - 0.6, mat: M.concreteDark }); // cornice
    // roof garden: lawn strips, paths, small trees, glass pavilion
    prism(g, { points: grow(POD, -1.2), h: 0.3, y: POD_H + 0.1, mat: paving });
    box(g, { w: 14, h: 0.3, d: 40, x: -4, y: POD_H + 0.4, z: 0, mat: M.grass });
    box(g, { w: 12, h: 0.3, d: 12, x: -24, y: POD_H + 0.4, z: -26, mat: M.grass });
    box(g, { w: 12, h: 0.3, d: 12, x: 24, y: POD_H + 0.4, z: 0, mat: M.grass });
    box(g, { w: 10, h: 4, d: 8, x: -4, y: POD_H + 0.4, z: 0, mat: M.glassWhite }); // rooftop lounge
    [[-4, -14], [-4, 14], [-22, -24], [-26, -28], [24, -3], [26, 4], [-8, 6], [0, -6]].forEach(([x, z]) => {
      tree(g, { x, y: POD_H + 0.6, z, h: 5, r: 1.7 });
    });

    // ── Curved glass entrance canopy on the east (station) side, on slender steel posts ──
    canopy(g, { w: 28, len: 10, rise: 3.2, thick: 0.5, x: 37, y: 7.5, z: 0, ry: Math.PI / 2, mat: M.glassWhite });
    [-10, -3.5, 3.5, 10].forEach((z) => cyl(g, { rTop: 0.3, h: 7.6, x: 41, y: 0.1, z, mat: M.steel, seg: 8 }));
    box(g, { w: 4, h: 6, d: 16, x: 33.6, y: 0.1, mat: M.glass }); // entrance hall glazing
    // skywalk towards the 용산역 west exit
    box(g, { w: 10, h: 3.2, d: 4, x: 36, y: 6, z: 16.5, mat: M.glassWhite });
    box(g, { w: 10.4, h: 0.4, d: 4.4, x: 36, y: 9.2, z: 16.5, mat: M.steel });
    cyl(g, { rTop: 0.35, h: 6, x: 40, y: 0.1, z: 16.5, mat: M.steel, seg: 8 });

    // ── Twin towers (Novotel Ambassador / Novotel Suites + ibis Styles), 30 storeys to 117 m ──
    const TW = 18; // slab depth (east-west)
    const TD = 24; // width along the bridge axis (north-south)
    const TX = 13;
    const TOWER_TOP = 117;
    hotelTower(g, { x: TX, z: -24, w: TW, d: TD, h: TOWER_TOP, podiumTop: POD_H + 0.1 });
    hotelTower(g, { x: TX, z: 24, w: TW, d: TD, h: TOWER_TOP, podiumTop: POD_H + 0.1 });

    // ── 스카이킹덤: four-storey glass bar sitting on both tower tops and bridging the 24 m gap ──
    const SK_H = 16;
    const SK_D = 72; // z -36..36, flush with the towers' outer faces
    box(g, { w: TW - 2, h: SK_H, d: SK_D, x: TX, y: TOWER_TOP, mat: M.glass });
    floorBands(g, { w: TW - 2, d: SK_D, h: SK_H, x: TX, y: TOWER_TOP, floorHeight: 4, mat: M.steel, inset: -0.12, thickness: 0.45 });
    box(g, { w: TW - 1.4, h: 0.8, d: SK_D + 0.6, x: TX, y: TOWER_TOP + 0.6, mat: M.glow }); // lit band along the underside
    box(g, { w: TW - 1.6, h: 0.5, d: SK_D + 0.3, x: TX, y: TOWER_TOP + 7.6, mat: M.glow });
    // roof: pool deck with the long pool over the span, glass parapet, two pavilions
    const deckY = TOWER_TOP + SK_H;
    box(g, { w: TW - 1.6, h: 0.4, d: SK_D - 0.4, x: TX, y: deckY, mat: M.limestone });
    box(g, { w: 7, h: 0.3, d: 30, x: TX + 1, y: deckY + 0.4, mat: M.water });
    box(g, { w: 5, h: 0.2, d: 26, x: TX - 6, y: deckY + 0.4, mat: M.grass });
    [-1, 1].forEach((side) => {
      box(g, { w: TW - 1.6, h: 1.3, d: 0.15, x: TX, y: deckY + 0.4, z: side * (SK_D / 2 - 0.3), mat: M.glass });
      box(g, { w: 0.15, h: 1.3, d: SK_D - 0.4, x: TX + side * (TW / 2 - 0.9), y: deckY + 0.4, mat: M.glass });
      box(g, { w: 6, h: 1.6, d: 8, x: TX - 3, y: deckY + 0.4, z: side * 29, mat: M.white }); // top at 135
    });

    // ── Grand Mercure tower (≈ 20 storeys) to the west with a set-back plant crown ──
    const GX = -20;
    const GZ = 6;
    hotelTower(g, { x: GX, z: GZ, w: 20, d: 30, h: 82, podiumTop: POD_H + 0.1 });
    box(g, { w: 20.6, h: 0.6, d: 30.6, x: GX, y: 82, z: GZ, mat: bronzeBand });
    box(g, { w: 15, h: 2.6, d: 24, x: GX, y: 82.6, z: GZ, mat: M.steelDark });

    // ── Plaza planting around the podium ──
    [[-40, 12], [-38, -18], [-36, 22], [10, -41], [-10, 41], [28, 33], [40, -14], [-40, -2]].forEach(([x, z]) => {
      tree(g, { x, y: 0.1, z, h: 7, r: 2.4 });
    });

    return g;
  },
};
