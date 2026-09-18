// 고려대학교 본관 (Korea University Main Hall, 박동진 설계, 1934) - 성북구
// Collegiate Gothic main hall on the rise at the north end of the 중앙광장: a symmetrical three-storey
// light-granite block (real ≈ 75 m wide) with a steep dark slate roof, stone-mullioned windows between
// buttress-like piers, a crenellated parapet all round, gabled end pavilions whose wings run back to
// make a shallow ㄷ plan, and the central five-storey square tower with stepped corner buttresses,
// battlements, a stepped crown and the pointed-arch entrance porch at its foot. A broad granite stair
// drops to the paved 중앙광장 with its two lawns, the bronze tiger (호상) on a plinth and zelkovas.
// Plan scaled ≈ 0.73 (75 m → 55 units) so hall and plaza fit the 40 m collider; heights are real.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cone, gableRoof, subgroup, tree } from "./_helpers.mjs";

const stone = M.granite;
const trim = M.graniteDark;
const slate = M.roofTile;
const glass = material(0x1b222b, { roughness: 0.4, metalness: 0.3 });
const paving = material(0xc9c3b8, { roughness: 0.95 });

// Plan (units; +x east, +z south). The facade faces south onto the plaza.
const HW = 27.5; // half-width of the whole front
const ZF = -6; // front face of the wings
const ZB = -18; // back face of the wings
const PW = 8; // end pavilion width
const PZF = ZF + 2; // pavilion front (projects 2 units)
const PZB = -26; // back of the rear wings (ㄷ plan)
const TW = 10; // tower width (x)
const TD = 12; // tower depth (z)
const TZ = -11; // tower centre (front face at -5)
const TT = 26.2; // tower parapet level
const SILL = [1.9, 6.2, 10.5]; // window sills per storey
const WIN_H = [3.0, 2.7, 2.5];
const WALL_TOP = 13.7;
const PARAPET = 14.7;
const TERRACE = 1.6; // the hall stands on a terrace above the plaza

/** Collects boxes per material and emits one merged mesh per material (keeps the mesh count low). */
class Batch {
  constructor() {
    this.buckets = new Map();
  }

  /** Bottom-anchored box in the local frame `frame` (a Matrix4; null = parent space). */
  box({ w, h, d, x = 0, y = 0, z = 0, mat }, frame = null) {
    const geometry = new THREE.BoxGeometry(w, h, d).toNonIndexed();
    geometry.translate(x, y + h / 2, z);
    if (frame) {
      geometry.applyMatrix4(frame);
    }
    if (!this.buckets.has(mat)) {
      this.buckets.set(mat, []);
    }
    this.buckets.get(mat).push(geometry);
  }

  flush(parent) {
    this.buckets.forEach((geometries, mat) => {
      const total = geometries.reduce((sum, geometry) => sum + geometry.attributes.position.count, 0);
      const positions = new Float32Array(total * 3);
      const normals = new Float32Array(total * 3);
      let offset = 0;
      geometries.forEach((geometry) => {
        positions.set(geometry.attributes.position.array, offset * 3);
        normals.set(geometry.attributes.normal.array, offset * 3);
        offset += geometry.attributes.position.count;
      });
      const merged = new THREE.BufferGeometry();
      merged.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      merged.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
      parent.add(new THREE.Mesh(merged, mat));
    });
  }
}

/** Local frame of a wall face: origin on the face at (x, y, z), local +z = outward normal (rotated `ry` from +z). */
function frame(x, y, z, ry) {
  const m = new THREE.Matrix4().makeRotationY(ry).setPosition(x, y, z);
  m.ry = ry;
  return m;
}

/** Extruded 2-D outline in a vertical plane (local XY, y up), `d` thick, centred on the plane with normal `ry`. */
function plate(parent, { points, d = 0.4, x = 0, y = 0, z = 0, ry = 0, mat }) {
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

/** Outline of a pointed (Gothic) arch opening, `w` wide, `h` tall, base at y = 0. */
function archPoints(w, h) {
  const hw = w / 2;
  const spring = h - w * 0.7;
  return [
    [-hw, 0], [hw, 0], [hw, spring],
    [hw * 0.86, spring + w * 0.28], [hw * 0.55, spring + w * 0.52], [0, h],
    [-hw * 0.55, spring + w * 0.52], [-hw * 0.86, spring + w * 0.28], [-hw, spring],
  ];
}

/** Rectangular window with a stone surround, sill, transom and `lights` - 1 stone mullions. */
function win(b, f, { x, y, w = 1.5, h = 2.6, lights = 2 }) {
  b.box({ w: w + 0.5, h: h + 0.3, d: 0.5, x, y: y - 0.1, mat: stone }, f);
  b.box({ w: w + 0.7, h: 0.22, d: 0.7, x, y: y - 0.32, mat: trim }, f);
  b.box({ w, h, d: 0.6, x, y, mat: glass }, f);
  for (let i = 1; i < lights; i += 1) {
    b.box({ w: 0.16, h, d: 0.7, x: x - w / 2 + (w / lights) * i, y, mat: stone }, f);
  }
  b.box({ w, h: 0.14, d: 0.7, x, y: y + h * 0.62, mat: stone }, f);
}

/** Pointed-arch window (stone surround + dark glazing) at local (x, y) of face frame `f`. */
function lancet(parent, f, { x, y, w, h }) {
  const p = new THREE.Vector3(x, y, 0).applyMatrix4(f);
  plate(parent, { points: archPoints(w + 0.45, h + 0.3), d: 0.5, x: p.x, y: p.y - 0.1, z: p.z, ry: f.ry, mat: stone });
  plate(parent, { points: archPoints(w, h), d: 0.6, x: p.x, y: p.y, z: p.z, ry: f.ry, mat: glass });
}

/** Buttress-like pier between window bays, with a dark cap just above the parapet. */
function pier(b, f, { x, h = PARAPET + 0.4, w = 0.6, p = 0.45 }) {
  b.box({ w, h, d: p + 0.1, x, z: p / 2 - 0.05, mat: stone }, f);
  b.box({ w: w + 0.2, h: 0.25, d: p + 0.3, x, y: h, z: p / 2 - 0.05, mat: trim }, f);
}

/** Parapet wall with merlons along a face between local x0 and x1. */
function battlement(b, f, { x0, x1, y = WALL_TOP, wallH = 1.0, merlonH = 0.6, pitch = 1.8, t = 0.5, out = 0.1 }) {
  const len = x1 - x0;
  b.box({ w: len, h: wallH, d: t, x: (x0 + x1) / 2, y, z: out - t / 2, mat: stone }, f);
  const n = Math.max(1, Math.floor(len / pitch));
  const start = x0 + (len - (n - 1) * pitch) / 2;
  for (let i = 0; i < n; i += 1) {
    b.box({ w: pitch * 0.5, h: merlonH, d: t, x: start + i * pitch, y: y + wallH, z: out - t / 2, mat: stone }, f);
  }
}

/** Paired right-angle corner buttress; (x, z) = wall corner, (sx, sz) = outward directions. */
function cornerButtress(b, { x, z, sx, sz, stages = [[0, 9.5, 0.85], [9.5, PARAPET + 0.5, 0.55]], lastCap = true }) {
  stages.forEach(([y0, y1, p], i) => {
    const h = y1 - y0;
    b.box({ w: p, h, d: 1.3, x: x + (sx * p) / 2, y: y0, z: z - sz * 0.65, mat: stone });
    b.box({ w: 1.3, h, d: p, x: x - sx * 0.65, y: y0, z: z + (sz * p) / 2, mat: stone });
    if (lastCap || i < stages.length - 1) {
      b.box({ w: p + 0.15, h: 0.25, d: 1.45, x: x + (sx * p) / 2, y: y1, z: z - sz * 0.65, mat: trim });
      b.box({ w: 1.45, h: 0.25, d: p + 0.15, x: x - sx * 0.65, y: y1, z: z + (sz * p) / 2, mat: trim });
    }
  });
}

export default {
  id: "korea-univ-main",
  name: "고려대학교 본관",
  nameEn: "Korea University Main Hall",
  district: "성북구",
  lat: 37.5893,
  lon: 127.0322,
  height: 31,
  colliderRadius: 40,
  detail: "medium",
  description: "1934년 고딕 화강석 본관과 중앙 탑",
  create() {
    const g = new THREE.Group();
    const b = new Batch();

    // ── Terrace, grand stair and the 중앙광장 (plaza at y = 0.2, terrace at y = 1.6) ────────
    box(g, { w: 57, h: TERRACE, d: 27, z: -14, mat: paving });
    box(g, { w: 57, h: 0.25, d: 0.5, y: TERRACE, z: -0.75, mat: stone }); // south kerb
    for (let i = 0; i < 7; i += 1) {
      box(g, { w: 12, h: TERRACE - 0.2 * (i + 1), d: 0.5, z: -0.25 + 0.5 * i, mat: stone });
    }
    [-1, 1].forEach((s) => box(g, { w: 0.7, h: TERRACE + 0.5, d: 4, x: s * 6.35, z: 1.25, mat: stone }));
    box(g, { w: 48, h: 0.2, d: 30.5, z: 14.75, mat: paving }); // plaza: z -0.5 .. 30
    [-1, 1].forEach((s) => box(g, { w: 16, h: 0.15, d: 19, x: s * 13, y: 0.2, z: 17.5, mat: M.grass })); // lawns
    // 호상 (bronze tiger) on its granite plinth, on the axis in front of the stair
    box(g, { w: 1.8, h: 1.3, d: 3.2, y: 0.2, z: 6.5, mat: trim });
    box(g, { w: 1.4, h: 0.3, d: 2.7, y: 1.5, z: 6.5, mat: stone });
    box(g, { w: 0.7, h: 0.75, d: 2.0, y: 2.35, z: 6.4, mat: M.bronze }); // body
    box(g, { w: 0.6, h: 0.6, d: 0.7, y: 2.7, z: 7.65, mat: M.bronze }); // head
    [[-0.22, -0.7], [0.22, -0.7], [-0.22, 0.7], [0.22, 0.7]].forEach(([dx, dz]) => {
      box(g, { w: 0.22, h: 0.6, d: 0.22, x: dx, y: 1.8, z: 6.4 + dz, mat: M.bronze });
    });
    box(g, { w: 0.12, h: 0.12, d: 0.9, y: 2.75, z: 5.0, mat: M.bronze }); // tail
    // Zelkova rows along both sides of the plaza and flanking the hall
    [3, 10, 17, 24].forEach((z, i) => {
      [-1, 1].forEach((s) => tree(g, { x: s * 25, y: 0.2, z, h: 9 + (i % 2) * 1.2, r: 3.1 + (i % 3) * 0.2 }));
    });
    [-9, -17].forEach((z, i) => [-1, 1].forEach((s) => tree(g, { x: s * 31, z, h: 8.5 + i, r: 2.8 })));

    // ── Building (all coordinates relative to the terrace) ───────────────────────────────
    const B = subgroup(g, { y: TERRACE });

    // Massing: main body, two end pavilions with rear wings, central tower; dark plinth course.
    box(B, { w: HW * 2, h: WALL_TOP, d: ZF - ZB, z: (ZF + ZB) / 2, mat: stone });
    box(B, { w: HW * 2 + 0.3, h: 0.9, d: ZF - ZB + 0.3, z: (ZF + ZB) / 2, mat: trim });
    [-1, 1].forEach((s) => {
      box(B, { w: PW, h: WALL_TOP, d: PZF - PZB, x: s * (HW - PW / 2), z: (PZF + PZB) / 2, mat: stone });
      box(B, { w: PW + 0.3, h: 0.9, d: PZF - PZB + 0.3, x: s * (HW - PW / 2), z: (PZF + PZB) / 2, mat: trim });
    });
    box(B, { w: TW, h: TT, d: TD, z: TZ, mat: stone });
    box(B, { w: TW + 0.3, h: 0.9, d: TD + 0.3, z: TZ, mat: trim });

    // Steep slate roofs: wing roof between the pavilions, gabled pavilion roofs (ridge north-south).
    gableRoof(B, { w: 39.6, d: 11.6, h: 6.4, y: WALL_TOP - 0.2, z: (ZF + ZB) / 2, overhang: 0, mat: slate });
    [-1, 1].forEach((s) => {
      gableRoof(B, { w: PZF - PZB + 0.2, d: PW - 0.4, h: 6.0, x: s * (HW - PW / 2), y: WALL_TOP - 0.2, z: (PZF + PZB) / 2, overhang: 0, ry: Math.PI / 2, mat: slate });
    });
    // Gabled dormers on the front slope
    [-15, -9, 9, 15].forEach((x) => {
      b.box({ w: 1.8, h: 1.9, d: 2.0, x, y: 14.9, z: -8.1, mat: stone });
      b.box({ w: 0.9, h: 1.1, d: 0.4, x, y: 15.3, z: -7.05, mat: glass });
      gableRoof(B, { w: 2.2, d: 2.0, h: 1.0, x, y: 16.8, z: -8.1, overhang: 0, ry: Math.PI / 2, mat: slate });
    });

    // ── Wings: window bays, piers and battlements on the front and back faces ────────────
    const front = frame(0, 0, ZF, 0);
    const back = frame(0, 0, ZB, Math.PI);
    for (let k = 0; k < 5; k += 1) {
      const cx = 5 + 1.45 + 2.9 * k;
      [-1, 1].forEach((s) => {
        SILL.forEach((sill, i) => win(b, front, { x: s * cx, y: sill, w: 1.6, h: WIN_H[i] }));
        if (k < 4) {
          pier(b, front, { x: s * (5 + 2.9 * (k + 1)) });
        }
      });
    }
    battlement(b, front, { x0: 5, x1: HW - PW });
    battlement(b, front, { x0: -(HW - PW), x1: -5 });
    for (let k = -6; k <= 6; k += 1) {
      SILL.forEach((sill, i) => win(b, back, { x: 2.9 * k, y: sill, w: 1.6, h: WIN_H[i] }));
      if (k < 6) {
        pier(b, back, { x: 2.9 * k + 1.45 });
      }
    }
    battlement(b, back, { x0: -(HW - PW), x1: HW - PW });

    // ── End pavilions: triple windows, stone gable parapets, corner buttresses ────────────
    [-1, 1].forEach((s) => {
      const cx = s * (HW - PW / 2);
      const pf = frame(cx, 0, PZF, 0);
      const pb = frame(cx, 0, PZB, Math.PI);
      const po = frame(s * HW, 0, (PZF + PZB) / 2, (s * Math.PI) / 2); // outer side
      const pi = frame(s * (HW - PW), 0, (ZB + PZB) / 2, (-s * Math.PI) / 2); // inner side of the rear wing
      [pf, pb].forEach((f) => {
        SILL.forEach((sill, i) => [-2.2, 0, 2.2].forEach((dx) => win(b, f, { x: dx, y: sill, w: 1.3, h: WIN_H[i], lights: 1 })));
        battlement(b, f, { x0: -PW / 2, x1: PW / 2 });
      });
      [[PZF, 0, 1], [PZB, Math.PI, -1]].forEach(([z, ry, dir]) => {
        plate(B, { points: [[-4.4, 0], [4.4, 0], [0, 6.1]], d: 0.5, x: cx, y: PARAPET - 0.2, z: z + dir * 0.05, ry, mat: stone });
        win(b, frame(cx, 0, z + dir * 0.3, ry), { x: 0, y: PARAPET + 0.7, w: 1.1, h: 2.2, lights: 1 });
      });
      for (let k = -2; k <= 2; k += 1) {
        SILL.forEach((sill, i) => win(b, po, { x: 4.2 * k, y: sill, w: 1.5, h: WIN_H[i] }));
        if (k < 2) {
          pier(b, po, { x: 4.2 * k + 2.1 });
        }
      }
      battlement(b, po, { x0: -(PZF - PZB) / 2, x1: (PZF - PZB) / 2 });
      SILL.forEach((sill, i) => [-2, 2].forEach((dx) => win(b, pi, { x: dx, y: sill, w: 1.4, h: WIN_H[i] })));
      battlement(b, pi, { x0: -(ZB - PZB) / 2, x1: (ZB - PZB) / 2 });
      cornerButtress(b, { x: s * HW, z: PZF, sx: s, sz: 1 });
      cornerButtress(b, { x: s * HW, z: PZB, sx: s, sz: -1 });
      cornerButtress(b, { x: s * (HW - PW), z: PZB, sx: -s, sz: -1 });
      cornerButtress(b, { x: s * (HW - PW), z: PZF, sx: -s, sz: 1 });
    });

    // ── Central tower ────────────────────────────────────────────────────────────────────
    const tf = frame(0, 0, TZ + TD / 2, 0);
    const tb = frame(0, 0, TZ - TD / 2, Math.PI);
    const te = frame(TW / 2, 0, TZ, Math.PI / 2);
    const tw = frame(-TW / 2, 0, TZ, -Math.PI / 2);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) => {
      cornerButtress(b, {
        x: (sx * TW) / 2, z: TZ + (sz * TD) / 2, sx, sz,
        stages: [[0, 10, 0.95], [10, 19, 0.7], [19, TT, 0.45]], lastCap: false,
      });
    });
    [7.0, 17.3, 24.9].forEach((y) => box(B, { w: TW + 0.5, h: 0.3, d: TD + 0.5, y, z: TZ, mat: trim })); // string courses

    // Entrance porch with the pointed-arch doorway and a crenellated top
    box(B, { w: 7, h: 6.4, d: 3, z: -3.5, mat: stone });
    box(B, { w: 7.3, h: 0.9, d: 3.3, z: -3.5, mat: trim });
    [-1, 1].forEach((s) => b.box({ w: 0.8, h: 7.0, d: 0.8, x: s * 3.3, z: -2.1, mat: stone }));
    battlement(b, frame(0, 0, -2, 0), { x0: -3.5, x1: 3.5, y: 6.4, wallH: 0.8, merlonH: 0.5, pitch: 1.4 });
    battlement(b, frame(3.5, 0, -3.5, Math.PI / 2), { x0: -1.5, x1: 1.5, y: 6.4, wallH: 0.8, merlonH: 0.5, pitch: 1.4 });
    battlement(b, frame(-3.5, 0, -3.5, -Math.PI / 2), { x0: -1.5, x1: 1.5, y: 6.4, wallH: 0.8, merlonH: 0.5, pitch: 1.4 });
    plate(B, { points: archPoints(4.6, 5.8), d: 0.5, z: -2, mat: trim });
    plate(B, { points: archPoints(3.6, 5.2), d: 0.7, z: -2, mat: M.black });

    // Tall traceried window above the porch, paired lancets on the top storey, side windows
    plate(B, { points: archPoints(4.5, 9.6), d: 0.5, y: 7.4, z: TZ + TD / 2, mat: stone });
    plate(B, { points: archPoints(3.9, 9.0), d: 0.6, y: 7.7, z: TZ + TD / 2, mat: glass });
    [-0.65, 0.65].forEach((x) => b.box({ w: 0.18, h: 8.2, d: 0.7, x, y: 7.7, mat: stone }, tf));
    [10.6, 13.6].forEach((y) => b.box({ w: 3.9, h: 0.16, d: 0.7, y, mat: stone }, tf));
    [tf, tb, te, tw].forEach((f) => [-1.7, 1.7].forEach((x) => lancet(B, f, { x, y: 19.8, w: 0.9, h: 3.4 })));
    [-1.7, 1.7].forEach((x) => win(b, tb, { x, y: 15.2, w: 1.2, h: 2.6, lights: 1 }));
    [te, tw].forEach((f) => win(b, f, { x: 4.6, y: 15.2, w: 1.2, h: 2.6, lights: 1 }));

    // Battlemented parapet, four corner posts with pyramidal caps and the stepped crown
    const crown = { y: TT, wallH: 1.1, merlonH: 0.7, pitch: 1.6 };
    battlement(b, tf, { x0: -TW / 2, x1: TW / 2, ...crown });
    battlement(b, tb, { x0: -TW / 2, x1: TW / 2, ...crown });
    battlement(b, te, { x0: -TD / 2, x1: TD / 2, ...crown });
    battlement(b, tw, { x0: -TD / 2, x1: TD / 2, ...crown });
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) => {
      const x = sx * (TW / 2 - 0.7);
      const z = TZ + sz * (TD / 2 - 0.7);
      b.box({ w: 1.5, h: 2.2, d: 1.5, x, y: TT, z, mat: stone });
      b.box({ w: 1.7, h: 0.2, d: 1.7, x, y: TT + 2.2, z, mat: trim });
      cone(B, { r: 1.1, h: 0.8, x, y: TT + 2.4, z, mat: slate, seg: 4, ry: Math.PI / 4 });
    });
    b.box({ w: 5.6, h: 1.6, d: 7.4, y: TT, z: TZ, mat: stone });
    b.box({ w: 6.0, h: 0.25, d: 7.8, y: TT + 1.6, z: TZ, mat: trim });

    b.flush(B);
    return g;
  },
};
