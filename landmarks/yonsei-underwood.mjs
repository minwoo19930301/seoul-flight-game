// 연세대학교 언더우드관 (Yonsei University Underwood Hall, 1924) - 서대문구
// The Collegiate Gothic heart of the Yonsei campus at the head of the 백양로 avenue, facing south.
// 언더우드관: a symmetrical three-storey granite hall with a steep slate roof, gabled end wings, rows of
// tall stone-mullioned windows, ivy on the lower walls and a five-storey central tower with stepped
// corner buttresses, battlements, corner pinnacles and a small pointed cap over the pointed-arch
// entrance. 스팀슨관 (west, 1920, with a small crenellated entrance tower) and 아펜젤러관 (east, 1924,
// with a pinnacled gable front) flank it to form a U around the central lawn, where the bronze
// Underwood statue stands on its tall granite plinth; the tree-lined 백양로 runs off to the south.
// Footprints ≈ 0.7 × real (언더우드관 60 → 42 m wide), heights real; site compressed to r = 40.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, cone, sphere, disc, gableRoof, pyramidRoof, tree, subgroup } from "./_helpers.mjs";

const STONE = M.granite;
const TRIM = M.graniteDark;
const GLASS = M.glassDark;
const ROOF = M.roofTile;
const paving = material(0xcac4b9, { roughness: 0.95 });
const IVY = M.foliage;

/** Vertical pointed (equilateral) arch panel, bottom-anchored at `y`, centred on x/z, facing +z (rotate with `ry`). */
function arch(parent, { w, h, x = 0, y = 0, z = 0, depth = 0.3, mat = GLASS, ry = 0, seg = 5 }) {
  const headH = (w * Math.sqrt(3)) / 2;
  const spring = Math.max(0.1, h - headH);
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0);
  shape.lineTo(w / 2, 0);
  shape.lineTo(w / 2, spring);
  shape.absarc(-w / 2, spring, w, 0, Math.PI / 3, false);
  shape.absarc(w / 2, spring, w, (Math.PI * 2) / 3, Math.PI, false);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: seg });
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = ry;
  parent.add(mesh);
  return mesh;
}

/** Vertical triangular gable wall (apex up), bottom-anchored, facing ±z (rotate with `ry`). */
function gablePanel(parent, { w, h, x = 0, y = 0, z = 0, depth = 0.8, mat = STONE, ry = 0 }) {
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0);
  shape.lineTo(w / 2, 0);
  shape.lineTo(0, h);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = ry;
  parent.add(mesh);
  return mesh;
}

/** Stone pinnacle: square shaft + steep pyramid tip. */
function pinnacle(parent, { x, y, z, s = 1, h = 3.5 }) {
  const shaftH = h * 0.45;
  box(parent, { w: s, h: shaftH, d: s, x, y, z, mat: STONE });
  cone(parent, { r: s * 0.72, h: h - shaftH, x, y: y + shaftH, z, mat: TRIM, seg: 4, ry: Math.PI / 4 });
}

/** Crenellated parapet around a square/rect top: four walls with merlons. Centre (x, z), bottom at `y`. */
function battlements(parent, { x, y, z, w, d, t = 0.5, wallH = 0.9, merlonH = 0.7, pitch = 1.6 }) {
  const sides = [
    { cx: x, cz: z + d / 2 - t / 2, len: w, alongX: true },
    { cx: x, cz: z - d / 2 + t / 2, len: w, alongX: true },
    { cx: x + w / 2 - t / 2, cz: z, len: d, alongX: false },
    { cx: x - w / 2 + t / 2, cz: z, len: d, alongX: false },
  ];
  sides.forEach(({ cx, cz, len, alongX }) => {
    box(parent, { w: alongX ? len : t, h: wallH, d: alongX ? t : len, x: cx, y, z: cz, mat: STONE });
    const n = Math.floor(len / pitch);
    for (let i = 0; i < n; i += 1) {
      const off = -len / 2 + pitch / 2 + i * pitch;
      box(parent, {
        w: alongX ? 0.8 : t, h: merlonH, d: alongX ? t : 0.8,
        x: cx + (alongX ? off : 0), y: y + wallH, z: cz + (alongX ? 0 : off), mat: STONE,
      });
    }
  });
}

/**
 * Row of tall Gothic windows on a wall face. `along` = "x" (face normal ±z) or "z" (face normal ±x).
 * `xs` are the positions along the face; `face` is the coordinate of the wall plane; `out` = outward sign.
 */
function windows(parent, { xs, rows, face, out, along = "x", w = 1.5, h = 2.8, mullion = true }) {
  xs.forEach((p) => {
    rows.forEach((wy) => {
      const gx = along === "x" ? p : face + out * 0.08;
      const gz = along === "x" ? face + out * 0.08 : p;
      box(parent, { w: along === "x" ? w : 0.2, h, d: along === "x" ? 0.2 : w, x: gx, y: wy, z: gz, mat: GLASS });
      // stone mullion + sill on the principal faces only (keeps the part count down on the back faces)
      if (mullion) {
        box(parent, { w: along === "x" ? 0.18 : 0.3, h, d: along === "x" ? 0.3 : 0.18, x: gx, y: wy, z: gz, mat: STONE });
        box(parent, { w: along === "x" ? w + 0.4 : 0.35, h: 0.2, d: along === "x" ? 0.35 : w + 0.4, x: gx, y: wy - 0.2, z: gz, mat: TRIM });
      }
    });
  });
}

export default {
  id: "yonsei-underwood",
  name: "연세대학교 언더우드관",
  nameEn: "Yonsei University Underwood Hall",
  district: "서대문구",
  lat: 37.5664,
  lon: 126.939,
  height: 29,
  colliderRadius: 40,
  detail: "medium",
  description: "1924년 고딕 석조 본관과 좌우 스팀슨관·아펜젤러관",
  create() {
    const g = new THREE.Group();

    // ── Site: paved precinct, granite terrace under the hall, lawn, paths, 백양로 avenue ──
    cyl(g, { rTop: 38.5, h: 0.3, y: -0.2, mat: paving, seg: 12 });
    box(g, { w: 46, h: 0.6, d: 16, z: -22, mat: STONE }); // terrace under 언더우드관 (z -30..-14)
    for (let i = 0; i < 3; i += 1) {
      box(g, { w: 10, h: 0.6 - i * 0.2, d: 0.6, y: 0, z: -13.7 + i * 0.6, mat: STONE }); // steps to the entrance
    }
    box(g, { w: 40, h: 0.25, d: 26, z: 1, mat: M.grass }); // central lawn x -20..20, z -12..14
    box(g, { w: 3.2, h: 0.3, d: 26, z: 1, mat: paving }); // axial path
    box(g, { w: 40, h: 0.3, d: 2.6, z: 1, mat: paving }); // cross path
    disc(g, { r: 4.6, x: 0, y: 0.31, z: 1, mat: paving, seg: 24 });
    // 백양로: broad avenue with kerbs, flanking grass strips and rows of trees
    box(g, { w: 18, h: 0.32, d: 20, z: 24, mat: paving }); // z 14..34
    [-1, 1].forEach((s) => {
      box(g, { w: 0.4, h: 0.4, d: 20, x: s * 9, z: 24, mat: TRIM });
      box(g, { w: 7, h: 0.25, d: 19, x: s * 13, z: 24, mat: M.grass });
      [17, 21.5, 26, 30.5].forEach((z) => tree(g, { x: s * 11, z, h: 8.5, r: 2.5 }));
    });
    // statue of H. G. Underwood: tall granite plinth and bronze figure at the centre of the lawn
    box(g, { w: 2.8, h: 0.4, d: 2.8, y: 0.3, z: 1, mat: TRIM });
    box(g, { w: 1.7, h: 3.2, d: 1.7, y: 0.7, z: 1, mat: STONE });
    box(g, { w: 2.1, h: 0.3, d: 2.1, y: 3.9, z: 1, mat: TRIM });
    cyl(g, { rTop: 0.42, rBot: 0.5, h: 1.9, y: 4.2, z: 1, mat: M.bronze, seg: 8 });
    sphere(g, { r: 0.3, y: 6.1, z: 1, mat: M.bronze, seg: 8 });

    // ── 언더우드관: main block (42 × 12, 3 storeys) with gabled end wings and the central tower ──
    const HY = 0.6; // hall floor (terrace top)
    const h = subgroup(g, { y: HY });
    const wallH = 13;
    const ZF = -16; // south facade plane of the main block
    box(h, { w: 42, h: wallH, d: 12, z: -22, mat: STONE });
    gableRoof(h, { w: 42, d: 12, h: 6, y: wallH, z: -22, overhang: 0.5, mat: ROOF });
    box(h, { w: 42.6, h: 0.35, d: 12.6, y: 4.3, z: -22, mat: TRIM }); // string courses
    box(h, { w: 42.6, h: 0.35, d: 12.6, y: 8.5, z: -22, mat: TRIM });
    // end wings (9 × 15) projecting 2 m in front, gable fronts to the south
    [-1, 1].forEach((s) => {
      const wx = s * 16.5;
      box(h, { w: 9, h: wallH, d: 15, x: wx, z: -21.5, mat: STONE }); // z -29..-14
      gableRoof(h, { w: 15, d: 9, h: 6, x: wx, y: wallH, z: -21.5, overhang: 0.5, ry: Math.PI / 2, mat: ROOF });
      gablePanel(h, { w: 9.4, h: 6.1, x: wx, y: wallH, z: -13.7, depth: 0.7 });
      gablePanel(h, { w: 9.4, h: 6.1, x: wx, y: wallH, z: -29.3, depth: 0.7 });
      pinnacle(h, { x: wx, y: wallH + 5.8, z: -13.7, s: 0.6, h: 2.2 });
      [-1, 1].forEach((t) => {
        box(h, { w: 1.1, h: wallH + 0.6, d: 1.3, x: wx + t * 4.2, z: -14.2, mat: STONE }); // corner buttresses
        pinnacle(h, { x: wx + t * 4.2, y: wallH + 0.6, z: -14.2, s: 0.8, h: 2.6 });
      });
      windows(h, { xs: [wx - 1.9, wx + 1.9], rows: [1.6, 5.7, 9.9], face: -14, out: 1, w: 1.5, h: 2.7 });
      windows(h, { xs: [-27.5, -24, -20.5, -17, -15.5], rows: [1.6, 5.7, 9.9], face: wx + s * 4.5, out: s, along: "z", w: 1.4, h: 2.7, mullion: false });
      // ivy patches on the lower wall of the wing fronts
      box(h, { w: 3.4, h: 4.6, d: 0.14, x: wx - s * 1.9, z: -13.93, mat: IVY });
      box(h, { w: 1.6, h: 7.5, d: 0.14, x: wx + s * 3.4, z: -13.93, mat: IVY });
    });
    // main facade bays between the tower and the wings: buttresses + three rows of mullioned windows
    const bays = [];
    for (let i = 0; i < 3; i += 1) {
      bays.push(-10.8 + i * 2.5, 10.8 - i * 2.5); // -10.8, -8.3, -5.8 / 10.8, 8.3, 5.8
    }
    windows(h, { xs: bays, rows: [1.6, 5.7, 9.9], face: ZF, out: 1 });
    windows(h, { xs: bays.map((x) => x * 1.05), rows: [1.6, 5.7, 9.9], face: -28, out: -1, mullion: false });
    [-9.55, -7.05, 9.55, 7.05].forEach((x) => box(h, { w: 0.9, h: wallH + 0.4, d: 1.1, x, z: ZF - 0.1, mat: STONE }));
    box(h, { w: 5, h: 3.8, d: 0.14, x: -11.2, z: ZF + 0.07, mat: IVY });
    box(h, { w: 5, h: 2.6, d: 0.14, x: 9.6, z: ZF + 0.07, mat: IVY });
    // chimneys and roof dormers
    [-8, 8].forEach((x) => box(h, { w: 1.2, h: 4.5, d: 1.2, x, y: wallH + 2.5, z: -24.5, mat: STONE }));
    [-9, -6, 6, 9].forEach((x) => {
      box(h, { w: 1.5, h: 1.6, d: 1.6, x, y: wallH + 0.4, z: -16.6, mat: STONE });
      gableRoof(h, { w: 1.7, d: 1.8, h: 0.8, x, y: wallH + 2, z: -16.6, overhang: 0.1, mat: ROOF });
      box(h, { w: 0.9, h: 1.1, d: 0.2, x, y: wallH + 0.6, z: -15.75, mat: GLASS });
    });

    // ── Central tower (9 × 9, five storeys): stepped corner buttresses, battlements, pinnacles, pointed cap ──
    const TS = 9;
    const TZ = -17.5; // tower centre (protrudes 3 m in front of the facade)
    const TH = 24;
    box(h, { w: TS, h: TH, d: TS, z: TZ, mat: STONE });
    [[0, 9, 1.4], [9, 17, 1], [17, TH, 0.6]].forEach(([y0, y1, p]) => {
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
        box(h, { w: 1.6 + p, h: y1 - y0, d: 1.6 + p, x: sx * (TS / 2 - 0.8 + p / 2), y: y0, z: TZ + sz * (TS / 2 - 0.8 + p / 2), mat: STONE });
      });
      box(h, { w: TS + p * 2 + 0.3, h: 0.4, d: TS + p * 2 + 0.3, y: y1 - 0.4, z: TZ, mat: TRIM });
    });
    battlements(h, { x: 0, y: TH, z: TZ, w: TS + 0.4, d: TS + 0.4 });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      pinnacle(h, { x: sx * (TS / 2 - 0.4), y: TH + 0.4, z: TZ + sz * (TS / 2 - 0.4), s: 1.1, h: 3.4 });
    });
    pyramidRoof(h, { w: 5.6, d: 5.6, h: 2.4, y: TH + 0.3, z: TZ, overhang: 0.3, mat: ROOF });
    cone(h, { r: 0.25, h: 1.4, y: TH + 2.7, z: TZ, mat: TRIM, seg: 6 });
    // south face: pointed-arch entrance with a stone hood, big traceried window, paired lancets above
    const TF = TZ + TS / 2; // south face of the tower
    arch(h, { w: 3.4, h: 6.2, y: 0, z: TF + 0.15, depth: 0.5, mat: M.black });
    box(h, { w: 2.8, h: 3, d: 0.4, y: 0, z: TF + 0.3, mat: M.bronze });
    [-1, 1].forEach((s) => box(h, { w: 0.9, h: 6.4, d: 1, x: s * 2.4, y: 0, z: TF + 0.4, mat: STONE }));
    gablePanel(h, { w: 5.6, h: 2.2, y: 6.2, z: TF + 0.5, depth: 1 });
    arch(h, { w: 3, h: 6.5, y: 9.8, z: TF + 0.15, mat: GLASS, seg: 6 });
    [-0.75, 0.75].forEach((x) => box(h, { w: 0.22, h: 4.5, d: 0.4, x, y: 9.8, z: TF + 0.2, mat: STONE }));
    box(h, { w: 3.6, h: 0.3, d: 0.5, y: 9.4, z: TF + 0.2, mat: TRIM });
    // belfry-like top stage: paired lancets on all four faces
    [[0, 1, 0], [0, -1, Math.PI], [1, 0, Math.PI / 2], [-1, 0, -Math.PI / 2]].forEach(([dx, dz, ry]) => {
      const fx = dx * (TS / 2 + 0.1);
      const fz = TZ + dz * (TS / 2 + 0.1);
      [-1.3, 1.3].forEach((o) => {
        arch(h, { w: 1.3, h: 4.2, x: fx + dz * o, y: 18.2, z: fz - dx * o, ry, mat: GLASS, seg: 4 });
      });
    });

    // ── 스팀슨관 (west, 1920): two-storey granite hall, steep roof, small crenellated entrance tower on the lawn side ──
    const st = subgroup(g, { x: -30, z: -1 });
    const sH = 8.6;
    box(st, { w: 10, h: sH, d: 22, mat: STONE });
    gableRoof(st, { w: 22, d: 10, h: 4.6, y: sH, overhang: 0.5, ry: Math.PI / 2, mat: ROOF });
    gablePanel(st, { w: 10.4, h: 4.7, y: sH, z: 10.7, depth: 0.7 });
    gablePanel(st, { w: 10.4, h: 4.7, y: sH, z: -10.7, depth: 0.7 });
    box(st, { w: 10.6, h: 0.3, d: 22.6, y: 4.1, mat: TRIM });
    box(st, { w: 4.6, h: 12, d: 4.6, x: 5.2, mat: STONE }); // entrance tower
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      box(st, { w: 1.1, h: 12, d: 1.1, x: 5.2 + sx * 1.95, z: sz * 1.95, mat: STONE });
    });
    battlements(st, { x: 5.2, y: 12, z: 0, w: 5, d: 5, t: 0.4, wallH: 0.7, merlonH: 0.6, pitch: 1.3 });
    pyramidRoof(st, { w: 3, d: 3, h: 1.6, x: 5.2, y: 12.2, mat: ROOF, overhang: 0.2 });
    arch(st, { w: 2.2, h: 4.2, x: 7.55, y: 0, ry: Math.PI / 2, depth: 0.5, mat: M.black });
    arch(st, { w: 1.6, h: 3.4, x: 7.55, y: 7, ry: Math.PI / 2, mat: GLASS, seg: 4 });
    windows(st, { xs: [-8.6, -6, -3.4, 3.4, 6, 8.6], rows: [1.4, 5.2], face: 5, out: 1, along: "z", w: 1.4, h: 2.6 });
    windows(st, { xs: [-8.6, -6, -3.4, 0, 3.4, 6, 8.6], rows: [1.4, 5.2], face: -5, out: -1, along: "z", w: 1.4, h: 2.6, mullion: false });
    windows(st, { xs: [-2, 2], rows: [1.4, 5.2], face: 11, out: 1, w: 1.4, h: 2.6, mullion: false });
    box(st, { w: 0.14, h: 4, d: 4, x: 5.07, z: -7, mat: IVY });
    box(st, { w: 0.14, h: 6, d: 2.2, x: 5.07, z: 7.6, mat: IVY });

    // ── 아펜젤러관 (east, 1924): two-storey granite hall with a pinnacled gable front towards the lawn ──
    const ap = subgroup(g, { x: 30, z: -1 });
    box(ap, { w: 10, h: sH, d: 22, mat: STONE });
    gableRoof(ap, { w: 22, d: 10, h: 4.6, y: sH, overhang: 0.5, ry: Math.PI / 2, mat: ROOF });
    gablePanel(ap, { w: 10.4, h: 4.7, y: sH, z: 10.7, depth: 0.7 });
    gablePanel(ap, { w: 10.4, h: 4.7, y: sH, z: -10.7, depth: 0.7 });
    box(ap, { w: 10.6, h: 0.3, d: 22.6, y: 4.1, mat: TRIM });
    box(ap, { w: 2.6, h: sH + 1, d: 7, x: -6.2, mat: STONE }); // projecting gabled bay (west face)
    gableRoof(ap, { w: 3.4, d: 7, h: 3.2, x: -6.2, y: sH + 1, overhang: 0.3, mat: ROOF });
    gablePanel(ap, { w: 7.4, h: 3.3, x: -7.5, y: sH + 1, depth: 0.7, ry: Math.PI / 2 });
    [-1, 1].forEach((s) => {
      box(ap, { w: 1, h: sH + 1.6, d: 1, x: -7.1, z: s * 3.3, mat: STONE });
      pinnacle(ap, { x: -7.1, y: sH + 1.6, z: s * 3.3, s: 0.8, h: 2.6 });
    });
    pinnacle(ap, { x: -7.5, y: sH + 4.1, z: 0, s: 0.6, h: 2 });
    arch(ap, { w: 2.2, h: 4.4, x: -7.55, y: 0, ry: -Math.PI / 2, depth: 0.5, mat: M.black });
    arch(ap, { w: 2.6, h: 4.4, x: -7.55, y: 5.4, ry: -Math.PI / 2, mat: GLASS, seg: 5 });
    windows(ap, { xs: [-8.6, -6, 6, 8.6], rows: [1.4, 5.2], face: -5, out: -1, along: "z", w: 1.4, h: 2.6 });
    windows(ap, { xs: [-8.6, -6, -3.4, 0, 3.4, 6, 8.6], rows: [1.4, 5.2], face: 5, out: 1, along: "z", w: 1.4, h: 2.6, mullion: false });
    windows(ap, { xs: [-2, 2], rows: [1.4, 5.2], face: 11, out: 1, w: 1.4, h: 2.6, mullion: false });
    box(ap, { w: 0.14, h: 5, d: 3.4, x: -5.07, z: -7.5, mat: IVY });
    box(ap, { w: 0.14, h: 3.6, d: 3, x: -5.07, z: 7.8, mat: IVY });

    // ── Trees: the wooded slope behind the hall and beside the flanking buildings ──
    [[-15, -32, 10], [-8, -33, 11], [0, -33.5, 10.5], [8, -33, 11], [15, -32, 10], [-22, -30.5, 9], [22, -30.5, 9],
      [-33, -15.5, 8], [33, -15.5, 8], [-33, 13.5, 7.5], [33, 13.5, 7.5], [-24, 17, 7], [24, 17, 7]].forEach(([x, z, h]) => {
      tree(g, { x, z, h, r: Math.min(h * 0.3, 39.3 - Math.hypot(x, z)) });
    });

    return g;
  },
};
