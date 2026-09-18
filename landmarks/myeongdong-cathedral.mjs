// 명동성당 (Myeongdong Cathedral, Eugène Coste, 1898) - 중구
// Korea's first Gothic Revival church: a red-brick Latin-cross basilica (real 68.25 × 29 m, nave
// ridge 23.4 m) with gray-brick trims, a single 46.7 m bell tower with a steep dark spire on the
// NNW facade, two octagonal stair turrets flanking the tower, shallow one-bay transepts and a
// polygonal apse wrapped by a low ambulatory at the SSE end. Plan scaled ×0.76 so the whole site
// fits the 28 m collider, heights ×0.85 so the massing stays as slender as the original.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, cone, frustum, prism, polygonPrism, gableRoof, subgroup, tree, deg } from "./_helpers.mjs";

const S = 0.76; // plan scale (real metres -> units)
const V = 0.85; // height scale
/** Real metres along the long axis (0 = front of the tower, 68.25 = back of the ambulatory) -> local z. */
const Z = (m) => (m - 68.25 / 2) * S;

const brick = material(0x8e4838, { roughness: 0.92 });
const gray = material(0x6e7074, { roughness: 0.9 }); // gray brick trims, string courses, copings
const glass = material(0x1c2230, { roughness: 0.45, metalness: 0.35 }); // stained glass seen from outside
const roof = M.roofTile; // weathered dark copper/slate

// Heights (scaled)
const aisleEave = 8.5 * V; // 7.2
const aisleTop = 12.3 * V; // 10.5 (lean-to roof meets the clerestory wall)
const naveEave = 17 * V; // 14.45
const ridge = 23.43 * V; // 19.9
// Half-widths (scaled)
const naveHW = 6 * S; // 4.56
const aisleHW = 11 * S; // 8.36
const transeptHW = 14.5 * S; // 11.0
// Stations along the axis
const zFacade = Z(3.2);
const zTranF = Z(38.6);
const zTranB = Z(47);
const zApse = Z(57.25); // centre of the apse / ambulatory polygons

/** Extrude a 2-D outline (points in the XY plane, y up) by `d` along its normal; centred in depth. */
function shapeExtrude(parent, { points, d = 0.4, x = 0, y = 0, z = 0, ry = 0, mat }) {
  const shape = new THREE.Shape();
  points.forEach(([px, py], index) => (index === 0 ? shape.moveTo(px, py) : shape.lineTo(px, py)));
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false, curveSegments: 1, steps: 1 });
  geometry.translate(0, 0, -d / 2);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = ry;
  parent.add(mesh);
  return mesh;
}

/** Outline of a pointed (Gothic) arch opening, `w` wide and `h` tall, base at y = 0. */
function archPoints(w, h) {
  const hw = w / 2;
  const spring = h - w * 0.75;
  return [
    [-hw, 0], [hw, 0], [hw, spring],
    [hw * 0.86, spring + w * 0.3], [hw * 0.55, spring + w * 0.56], [0, h],
    [-hw * 0.55, spring + w * 0.56], [-hw * 0.86, spring + w * 0.3], [-hw, spring],
  ];
}

/** Pointed-arch window: gray brick surround + dark glass, centred on a wall face whose normal is `ry`. */
function lancet(parent, { w, h, x, y, z, ry, frame = 0.22 }) {
  shapeExtrude(parent, { points: archPoints(w + frame * 2, h + frame), d: 0.3, x, y: y - frame, z, ry, mat: gray });
  shapeExtrude(parent, { points: archPoints(w, h), d: 0.5, x, y, z, ry, mat: glass });
}

/** Stepped wall buttress protruding along local +z (aim it with `ry`), with gray set-off caps. */
function buttress(parent, { x, z, ry, w = 0.76, d1 = 0.95, d2 = 0.6, h1, h2 }) {
  const s = subgroup(parent, { x, z, ry });
  box(s, { w, h: h1, d: d1, z: d1 / 2, mat: brick });
  box(s, { w: w + 0.14, h: 0.22, d: d1 + 0.12, y: h1, z: d1 / 2, mat: gray });
  box(s, { w, h: h2 - h1 - 0.44, d: d2, y: h1 + 0.22, z: d2 / 2, mat: brick });
  box(s, { w: w + 0.14, h: 0.22, d: d2 + 0.12, y: h2 - 0.22, z: d2 / 2, mat: gray });
}

/** Paired right-angle corner buttresses (직교 부벽) at a wall corner; `sx`/`sz` = outward directions. */
function cornerButtress(parent, { x, z, sx, sz, h, p = 0.8, w = 1.0 }) {
  box(parent, { w: p, h, d: w, x: x + (sx * p) / 2, z: z - (sz * w) / 2, mat: brick });
  box(parent, { w, h, d: p, x: x - (sx * w) / 2, z: z + (sz * p) / 2, mat: brick });
  box(parent, { w: p + 0.12, h: 0.22, d: w + 0.12, x: x + (sx * p) / 2, y: h, z: z - (sz * w) / 2, mat: gray });
  box(parent, { w: w + 0.12, h: 0.22, d: p + 0.12, x: x - (sx * w) / 2, y: h, z: z + (sz * p) / 2, mat: gray });
}

/** Pinnacle (소첨탑): square brick shaft, gray coping, steep dark pyramid. */
function pinnacle(parent, { x, y, z, s = 0.9, h = 1.8, cap = 2 }) {
  box(parent, { w: s, h, d: s, x, y, z, mat: brick });
  box(parent, { w: s + 0.2, h: 0.2, d: s + 0.2, x, y: y + h, z, mat: gray });
  cone(parent, { r: (s + 0.2) * 0.71, h: cap, x, y: y + h + 0.2, z, mat: roof, seg: 4, ry: Math.PI / 4 });
}

/** Clerestory buttress on the nave wall (x = ±naveHW), rising out of the aisle roof. */
function clerestoryButtress(parent, { sx, z }) {
  const x = sx * (naveHW + 0.22);
  box(parent, { w: 0.45, h: naveEave - 0.35 - (aisleTop - 0.6), d: 0.65, x, y: aisleTop - 0.6, z, mat: brick });
  box(parent, { w: 0.57, h: 0.2, d: 0.77, x, y: naveEave - 0.35, z, mat: gray });
}

/** The single bell tower on the facade (real 8.6 m square, 46.7 m to the spire tip). Returns the top. */
function bellTower(parent, { z }) {
  const t = subgroup(parent, { z });
  const hw = 8.6 * S / 2; // 3.27
  const shaftH = 29 * V; // 24.65 - top of the belfry
  const spireH = (46.7 - 29) * V; // 15.0

  box(t, { w: hw * 2, h: shaftH, d: hw * 2, mat: brick });
  box(t, { w: hw * 2 + 0.16, h: 0.28, d: hw * 2 + 0.16, y: 20 * V, mat: gray }); // belfry sill course
  box(t, { w: hw * 2 + 0.46, h: 0.45, d: hw * 2 + 0.46, y: shaftH - 0.45, mat: gray }); // cornice

  // Stepped right-angle corner buttresses (three stages) topped by pinnacles at the spire base.
  const stages = [[0, 9, 0.78], [9.22, 17, 0.58], [17.22, shaftH - 0.45, 0.4]];
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => {
    stages.forEach(([y0, y1, p]) => {
      box(t, { w: p, h: y1 - y0, d: 1.1, x: sx * (hw + p / 2), y: y0, z: sz * (hw - 0.55), mat: brick });
      box(t, { w: 1.1, h: y1 - y0, d: p, x: sx * (hw - 0.55), y: y0, z: sz * (hw + p / 2), mat: brick });
      if (y1 < shaftH - 1) {
        box(t, { w: p + 0.1, h: 0.22, d: 1.2, x: sx * (hw + p / 2), y: y1, z: sz * (hw - 0.55), mat: gray });
        box(t, { w: 1.2, h: 0.22, d: p + 0.1, x: sx * (hw - 0.55), y: y1, z: sz * (hw + p / 2), mat: gray });
      }
    });
    pinnacle(t, { x: sx * 2.8, y: shaftH, z: sz * 2.8, s: 0.9, h: 2, cap: 2.4 });
  });

  // Four faces: paired belfry lancets and a gable at the spire base. Face k = 2 looks out to the front (-z).
  for (let k = 0; k < 4; k += 1) {
    const f = subgroup(t, { ry: (k * Math.PI) / 2 });
    [-0.9, 0.9].forEach((x) => lancet(f, { w: 0.85, h: 4.6, x, y: 18.3, z: hw, ry: 0, frame: 0.18 }));
    shapeExtrude(f, { points: [[-2.6, 0], [2.6, 0], [0, 2.1]], d: 0.5, y: shaftH, z: hw - 0.1, mat: brick });
    if (k % 2 === 1) {
      // Narrow organ-level window on each flank of the tower.
      lancet(f, { w: 0.8, h: 3, x: 0, y: 10.5, z: hw, ry: 0, frame: 0.18 });
    }
    if (k === 2) {
      // Main portal: pointed-arch doorway with gray surround and a gable above, then the organ-room window.
      shapeExtrude(f, { points: archPoints(4, 5.9), d: 0.35, y: 0.9, z: hw, mat: gray });
      shapeExtrude(f, { points: archPoints(3.2, 5.4), d: 0.7, y: 0.9, z: hw, mat: M.black });
      shapeExtrude(f, { points: [[-2.5, 0], [2.5, 0], [0, 1.9]], d: 0.5, y: 6.7, z: hw + 0.05, mat: gray });
      lancet(f, { w: 2.6, h: 6.2, x: 0, y: 8.9, z: hw, ry: 0 });
      // Entrance steps
      box(f, { w: 4.2, h: 0.3, d: 1, y: 0.6, z: hw + 0.5, mat: M.granite });
      box(f, { w: 5.6, h: 0.3, d: 1.5, y: 0.3, z: hw + 0.75, mat: M.granite });
    }
  }

  // Spire (square pyramid, half-width 2.81) and the cross.
  cone(t, { r: 2.81 * Math.SQRT2, h: spireH, y: shaftH, mat: roof, seg: 4, ry: Math.PI / 4 });
  cyl(t, { rTop: 0.1, rBot: 0.1, h: 2.3, y: shaftH + spireH - 0.1, mat: M.steel, seg: 6 });
  box(t, { w: 1.3, h: 0.2, d: 0.2, y: shaftH + spireH + 1.3, mat: M.steel });
  return shaftH + spireH + 2.2;
}

export default {
  id: "myeongdong-cathedral",
  name: "명동성당",
  nameEn: "Myeongdong Cathedral",
  district: "중구",
  lat: 37.5632,
  lon: 126.9872,
  height: 42,
  colliderRadius: 28,
  detail: "high",
  description: "고딕 양식 벽돌 성당, 45m 첨탑",
  create() {
    const g = new THREE.Group();
    // The real entrance faces NNW (30.5° west of north); the apse points SSE.
    const b = subgroup(g, { ry: deg(30.5) });

    // ── Paved hilltop forecourt / apron (clipped to the collider) ──────────────────────────
    prism(b, {
      points: [
        [-10.5, -24], [-8.5, -26], [-4.6, -27.1], [4.6, -27.1], [8.5, -26], [10.5, -24],
        [10.5, 1.6], [13, 1.6], [13, 11.6], [10.5, 11.6], [10.5, 20], [7, 25], [0, 27.2], [-7, 25],
        [-10.5, 20], [-10.5, 11.6], [-13, 11.6], [-13, 1.6], [-10.5, 1.6],
      ],
      h: 0.3,
      mat: M.graniteDark,
    });

    // ── Nave + aisles (facade → apse centre) ───────────────────────────────────────────────
    const bodyL = zApse - zFacade;
    const bodyZ = (zApse + zFacade) / 2;
    box(b, { w: aisleHW * 2, h: aisleEave, d: bodyL, z: bodyZ, mat: brick });
    box(b, { w: naveHW * 2, h: naveEave, d: bodyL, z: bodyZ, mat: brick });
    [2.1, aisleEave - 0.25].forEach((y) => box(b, { w: aisleHW * 2 + 0.16, h: 0.25, d: bodyL, y, z: bodyZ, mat: gray }));
    [10.75, naveEave - 0.25].forEach((y) => box(b, { w: naveHW * 2 + 0.16, h: 0.25, d: bodyL, y, z: bodyZ, mat: gray }));
    // Steep nave roof (ridge along z) and the aisle lean-to roofs (nave bays, then choir bays).
    gableRoof(b, { w: bodyL, d: naveHW * 2 + 0.9, h: ridge - naveEave, y: naveEave, z: bodyZ, overhang: 0, ry: Math.PI / 2, mat: roof });
    [[zFacade, zTranF], [zTranB, zApse]].forEach(([z0, z1]) => {
      frustum(b, { wBot: aisleHW * 2 + 0.8, dBot: z1 - z0, wTop: naveHW * 2 - 0.2, dTop: z1 - z0, h: aisleTop - aisleEave, y: aisleEave, z: (z0 + z1) / 2, mat: roof });
    });

    // Six nave bays: buttresses at the bay lines, a lancet per bay on the aisle and the clerestory.
    const bays = 6;
    const bayL = (zTranF - zFacade) / bays;
    for (let k = 0; k <= bays; k += 1) {
      const z = zFacade + k * bayL;
      [-1, 1].forEach((sx) => {
        if (k > 0 && k < bays) {
          buttress(b, { x: sx * aisleHW, z, ry: (sx * Math.PI) / 2, h1: 4.5, h2: aisleEave - 0.3 });
          clerestoryButtress(b, { sx, z });
        }
        if (k < bays) {
          lancet(b, { w: 1.3, h: 4.2, x: sx * aisleHW, y: 2.2, z: z + bayL / 2, ry: (sx * Math.PI) / 2 });
          lancet(b, { w: 1.15, h: 3.2, x: sx * naveHW, y: 10.9, z: z + bayL / 2, ry: (sx * Math.PI) / 2 });
        }
      });
    }
    // Choir bays between the transept and the apse.
    const choirL = zApse - zTranB;
    [-1, 1].forEach((sx) => {
      buttress(b, { x: sx * aisleHW, z: zTranB + choirL / 2, ry: (sx * Math.PI) / 2, h1: 4.5, h2: aisleEave - 0.3 });
      clerestoryButtress(b, { sx, z: zTranB + choirL / 2 });
      [0.25, 0.75].forEach((f) => {
        lancet(b, { w: 1.2, h: 4, x: sx * aisleHW, y: 2.2, z: zTranB + choirL * f, ry: (sx * Math.PI) / 2 });
        lancet(b, { w: 1.1, h: 3.1, x: sx * naveHW, y: 10.9, z: zTranB + choirL * f, ry: (sx * Math.PI) / 2 });
      });
    });

    // ── Transept (one bay deep, full nave height, gabled ends) ─────────────────────────────
    const tranD = zTranB - zTranF;
    const tranZ = (zTranF + zTranB) / 2;
    box(b, { w: transeptHW * 2, h: naveEave, d: tranD, z: tranZ, mat: brick });
    [2.1, aisleEave - 0.25, 10.75, naveEave - 0.25].forEach((y) => box(b, { w: transeptHW * 2 + 0.16, h: 0.25, d: tranD + 0.16, y, z: tranZ, mat: gray }));
    gableRoof(b, { w: transeptHW * 2, d: tranD + 0.8, h: ridge - naveEave, y: naveEave, z: tranZ, overhang: 0, mat: roof });
    [-1, 1].forEach((sx) => {
      const x = sx * transeptHW;
      // Gable parapet, big end window over two small ones.
      shapeExtrude(b, { points: [[-(tranD / 2 + 0.3), 0], [tranD / 2 + 0.3, 0], [0, ridge - naveEave + 0.3]], d: 0.4, x, y: naveEave, z: tranZ, ry: Math.PI / 2, mat: brick });
      lancet(b, { w: 2.8, h: 7.4, x, y: 5.2, z: tranZ, ry: Math.PI / 2 });
      [-2.2, 2.2].forEach((dz) => lancet(b, { w: 0.95, h: 2.8, x, y: 1.7, z: tranZ + dz, ry: Math.PI / 2 }));
      [-1, 1].forEach((sz) => {
        const z = sz > 0 ? zTranB : zTranF;
        cornerButtress(b, { x, z, sx, sz, h: naveEave + 0.6, p: 0.8, w: 1 });
        pinnacle(b, { x, y: naveEave + 0.82, z, s: 1, h: 1.7, cap: 2 });
      });
      [[zTranF, Math.PI], [zTranB, 0]].forEach(([z, ry]) => {
        lancet(b, { w: 0.9, h: 3.4, x: sx * 9.15, y: 2.2, z, ry });
        lancet(b, { w: 1.2, h: 3.2, x: sx * 7.9, y: 10.9, z, ry });
      });
    });

    // ── Polygonal apse with its faceted cone roof, wrapped by the low ambulatory ───────────
    polygonPrism(b, { sides: 10, r: naveHW, h: naveEave, z: zApse, mat: brick });
    [10.75, naveEave - 0.25].forEach((y) => polygonPrism(b, { sides: 10, r: naveHW + 0.08, h: 0.25, y, z: zApse, mat: gray }));
    cone(b, { r: naveHW + 0.42, h: ridge - naveEave, y: naveEave, z: zApse, mat: roof, seg: 10, ry: Math.PI / 10 });
    polygonPrism(b, { sides: 10, r: aisleHW, h: aisleEave, z: zApse, mat: brick });
    [2.1, aisleEave - 0.25].forEach((y) => polygonPrism(b, { sides: 10, r: aisleHW + 0.08, h: 0.25, y, z: zApse, mat: gray }));
    cyl(b, { rTop: naveHW - 0.1, rBot: aisleHW + 0.4, h: aisleTop - aisleEave, y: aisleEave, z: zApse, mat: roof, seg: 10, ry: Math.PI / 10 });
    for (let i = 0; i < 6; i += 1) {
      const a = deg(270 + 36 * i); // polygon vertices on the back half
      buttress(b, { x: aisleHW * Math.sin(a), z: zApse + aisleHW * Math.cos(a), ry: a, w: 0.7, d1: 0.8, d2: 0.5, h1: 4.4, h2: aisleEave - 0.3 });
      const s = subgroup(b, { x: naveHW * Math.sin(a), z: zApse + naveHW * Math.cos(a), ry: a });
      box(s, { w: 0.55, h: naveEave - 0.35 - (aisleTop - 0.6), d: 0.5, y: aisleTop - 0.6, z: 0.2, mat: brick });
      box(s, { w: 0.67, h: 0.2, d: 0.62, y: naveEave - 0.35, z: 0.2, mat: gray });
    }
    const apothem = Math.cos(Math.PI / 10);
    for (let i = 0; i < 5; i += 1) {
      const a = deg(288 + 36 * i); // facet centres on the back half
      lancet(b, { w: 1.1, h: 3.2, x: aisleHW * apothem * Math.sin(a), y: 2.2, z: zApse + aisleHW * apothem * Math.cos(a), ry: a });
      lancet(b, { w: 1.1, h: 3, x: naveHW * apothem * Math.sin(a), y: 10.9, z: zApse + naveHW * apothem * Math.cos(a), ry: a });
    }

    // ── Facade: gable parapets, corner buttresses with pinnacles, aisle windows, stair turrets ──
    shapeExtrude(b, { points: [[-(naveHW + 0.35), 0], [naveHW + 0.35, 0], [0, ridge - naveEave + 0.3]], d: 0.4, y: naveEave, z: zFacade - 0.15, mat: brick });
    shapeExtrude(b, { points: [[-aisleHW, 0], [aisleHW, 0], [naveHW, aisleTop - aisleEave], [-naveHW, aisleTop - aisleEave]], d: 0.4, y: aisleEave, z: zFacade - 0.15, mat: brick });
    [-1, 1].forEach((sx) => {
      cornerButtress(b, { x: sx * aisleHW, z: zFacade, sx, sz: -1, h: aisleEave + 0.8, p: 0.85, w: 1.1 });
      pinnacle(b, { x: sx * aisleHW, y: aisleEave + 1.02, z: zFacade, s: 1, h: 1.6, cap: 1.9 });
      lancet(b, { w: 1.2, h: 4.2, x: sx * 6.4, y: 2.4, z: zFacade, ry: Math.PI });
      // Octagonal stair turrets at the nave/aisle line, half in front of the facade.
      const x = sx * naveHW;
      const z = zFacade - 0.35;
      polygonPrism(b, { sides: 8, r: 1.05, h: 12, x, z, mat: brick });
      polygonPrism(b, { sides: 8, r: 1.15, h: 0.25, x, y: 11.75, z, mat: gray });
      cone(b, { r: 1.2, h: 2.6, x, y: 12, z, mat: roof, seg: 8, ry: Math.PI / 8 });
      cyl(b, { rTop: 0.06, rBot: 0.1, h: 0.8, x, y: 14.5, z, mat: M.steel, seg: 6 });
    });

    // ── Bell tower (centre of the facade, projecting ~2 m in front of it) ──────────────────
    bellTower(b, { z: Z(5) });

    // ── A few trees along the hilltop edges ────────────────────────────────────────────────
    [[-12.6, -20], [12.6, -20], [-13.2, -9], [13.2, -9], [-11.8, 20.5], [11.8, 20.5]].forEach(([x, z], i) => {
      tree(b, { x, z, h: 8.5 + (i % 3) * 0.8, r: 2.6 + (i % 2) * 0.4 });
    });

    return g;
  },
};
