// 경희대 평화의전당 (Kyung Hee Grand Peace Palace, 1999) - 동대문구
// A 4,500-seat concert hall dressed as a Gothic cathedral (modelled on Brussels' St Gudula):
// light-grey granite, two tall FLAT-TOPPED square front towers with stepped corner buttresses,
// crenellated parapets and corner pinnacles; a central gable with a slender spire over a huge
// pointed stained-glass window that carries the rose window in its head; an arcade band and three
// pointed portals reached by a stair; a buttressed nave with side aisles, pinnacled parapets and a
// low roof; a gabled stage house and a small apse at the rear. Footprint ≈ 0.8 × real, heights ≈ real.
import * as THREE from "../vendor/three.module.js";
import { M, box, cyl, cone, gableRoof, polygonPrism, tree, deg, subgroup } from "./_helpers.mjs";

const STONE = M.granite;
const TRIM = M.graniteDark;
const GLASS = M.glassDark;

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
function gablePanel(parent, { w, h, x = 0, y = 0, z = 0, depth = 1, mat = STONE, ry = 0 }) {
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
function pinnacle(parent, { x, y, z, s = 1.2, h = 5, mat = STONE, tipMat = TRIM }) {
  const shaftH = h * 0.42;
  box(parent, { w: s, h: shaftH, d: s, x, y, z, mat });
  cone(parent, { r: s * 0.72, h: h - shaftH, x, y: y + shaftH, z, mat: tipMat, seg: 4, ry: Math.PI / 4 });
}

/** Small single-mesh finial (steep pyramid) for parapets and ridges. */
function finial(parent, { x, y, z, s = 0.7, h = 2.6, mat = TRIM }) {
  cone(parent, { r: s * 0.72, h, x, y, z, mat, seg: 4, ry: Math.PI / 4 });
}

/** Low parapet wall with merlons along x (`along: "x"`) or z. Centred on x/z, bottom at `y`. */
function crenels(parent, { length, x, y, z, along = "x", t = 0.6, wallH = 1, merlonH = 0.8, pitch = 2.2, mat = STONE }) {
  const alongX = along === "x";
  box(parent, { w: alongX ? length : t, h: wallH, d: alongX ? t : length, x, y, z, mat });
  const n = Math.floor(length / pitch);
  for (let i = 0; i < n; i += 1) {
    const off = -length / 2 + pitch / 2 + i * pitch;
    box(parent, {
      w: alongX ? 0.9 : t, h: merlonH, d: alongX ? t : 0.9,
      x: x + (alongX ? off : 0), y: y + wallH, z: z + (alongX ? 0 : off), mat,
    });
  }
}

/** Plain parapet wall (no merlons) along x or z. */
function parapet(parent, { length, x, y, z, along = "x", t = 0.6, h = 1, mat = STONE }) {
  const alongX = along === "x";
  box(parent, { w: alongX ? length : t, h, d: alongX ? t : length, x, y, z, mat });
}

export default {
  id: "kyunghee-peace-hall",
  name: "경희대 평화의전당",
  nameEn: "Kyung Hee Grand Peace Palace",
  district: "동대문구",
  lat: 37.5986,
  lon: 127.0527,
  height: 66,
  colliderRadius: 50,
  detail: "high",
  description: "고딕 성당 양식의 대형 공연장",
  create() {
    const g = new THREE.Group();
    // The facade faces roughly south-south-west, down the hill towards the campus (본관).
    const b = subgroup(g, { ry: -deg(25) });

    const yP = 1.6; // forecourt terrace level
    const yB = 3.2; // hall floor (plinth top)
    const zF = 28; // facade plane (front face of the towers)

    // ── Site: plinth, forecourt terrace, two stair flights, lawns, trees ─────────────────────
    box(b, { w: 51, h: yB, d: 72, z: -6.5, mat: M.granite }); // plinth under the hall
    polygonPrism(b, { sides: 8, r: 9.2, h: yB, z: -41, mat: M.granite }); // plinth under the apse
    box(b, { w: 44, h: yP, d: 12, z: 35.5, mat: M.rockLight }); // forecourt terrace (paved)
    // upper flight: terrace -> hall floor (8 steps), stepped solid mass so no gaps underneath
    for (let i = 0; i < 8; i += 1) {
      box(b, { w: 30, h: (i + 1) * 0.2, d: 0.8, y: yP, z: 29.5 + 0.4 + (7 - i) * 0.8, mat: M.granite });
    }
    // cheek walls + pedestals flanking the upper flight
    [-1, 1].forEach((s) => {
      box(b, { w: 1.2, h: 1.9, d: 6.6, x: s * 15.6, y: yP, z: 32.7, mat: M.granite });
      box(b, { w: 1.7, h: 2.4, d: 1.7, x: s * 15.6, y: yP, z: 36.4, mat: TRIM });
      box(b, { w: 1.7, h: 2.4, d: 1.7, x: s * 15.6, y: yP, z: 29.9, mat: TRIM });
    });
    // lower flight: ground -> terrace (4 steps)
    for (let i = 0; i < 4; i += 1) {
      box(b, { w: 30, h: (i + 1) * 0.4, d: 1, y: 0, z: 41.5 + 0.5 + (3 - i) * 1, mat: M.granite });
    }
    // lawns along both flanks and beside the lower flight
    [-1, 1].forEach((s) => {
      box(b, { w: 4.6, h: 0.5, d: 46, x: s * 27.8, z: 2, mat: M.grass });
      box(b, { w: 5.5, h: 0.4, d: 3, x: s * 18.2, z: 43, mat: M.grass });
      tree(b, { x: s * 28.5, z: 22, h: 9, r: 3.2 });
      tree(b, { x: s * 28.5, z: 8, h: 11, r: 3.8 });
      tree(b, { x: s * 28.5, z: -8, h: 10, r: 3.4 });
      tree(b, { x: s * 28.5, z: -21, h: 8.5, r: 3 });
      tree(b, { x: s * 17.5, z: 42.5, h: 6, r: 2.2 });
    });

    // ── Hall: everything below is relative to the hall floor ─────────────────────────────────
    const h = subgroup(b, { y: yB });

    // ── Nave block (x ±16, z -27..17), height 34, low roof, buttresses + pinnacled parapet ───
    const naveH = 34;
    const naveZ0 = -27;
    const naveZ1 = 17;
    const naveL = naveZ1 - naveZ0;
    const naveC = (naveZ0 + naveZ1) / 2;
    box(h, { w: 32, h: naveH, d: naveL, z: naveC, mat: STONE });
    gableRoof(h, { w: naveL, d: 32, h: 4.5, y: naveH + 0.3, z: naveC, overhang: -0.6, ry: Math.PI / 2, mat: M.roofTile });
    parapet(h, { length: naveL, x: 15.7, y: naveH, z: naveC, along: "z" });
    parapet(h, { length: naveL, x: -15.7, y: naveH, z: naveC, along: "z" });
    // ridge finials
    for (let i = 0; i < 5; i += 1) {
      finial(h, { x: 0, y: naveH + 4.3, z: naveZ0 + 6 + i * 8, s: 0.8, h: 3 });
    }

    // ── Side aisles (x ±16..±24), height 22, flat roof, buttresses, pointed windows ──────────
    const aisleH = 22;
    [-1, 1].forEach((s) => {
      box(h, { w: 8, h: aisleH, d: naveL, x: s * 20, z: naveC, mat: STONE });
      box(h, { w: 7, h: 0.3, d: naveL - 1, x: s * 20, y: aisleH, z: naveC, mat: M.asphalt });
      parapet(h, { length: naveL, x: s * 23.7, y: aisleH, z: naveC, along: "z" });
      // front aisle block flanking the tower (x ±19..±24, z 17..26.5), a bit taller
      box(h, { w: 5, h: 25, d: 9.5, x: s * 21.5, z: 21.75, mat: STONE });
      parapet(h, { length: 5, x: s * 21.5, y: 25, z: 26.2, along: "x" });
      parapet(h, { length: 9.5, x: s * 23.7, y: 25, z: 21.75, along: "z" });
      pinnacle(h, { x: s * 23.6, y: 25, z: 26.1, s: 1.1, h: 5 });
      pinnacle(h, { x: s * 23.6, y: 25, z: 17.6, s: 1.1, h: 5 });
      arch(h, { w: 2.6, h: 10, x: s * 21.5, y: 10, z: 26.62, mat: GLASS });
      arch(h, { w: 2.6, h: 10, x: s * 24.12, y: 10, z: 21.75, ry: s * Math.PI / 2, mat: GLASS });
      box(h, { w: 5.2, h: 0.4, d: 0.5, x: s * 21.5, y: 9.4, z: 26.55, mat: TRIM });

      // buttresses along the aisle wall and up the clerestory, windows between them
      for (let i = 0; i < 6; i += 1) {
        const z = naveZ0 + 0.8 + i * 7.4;
        box(h, { w: 1.4, h: aisleH, d: 1.8, x: s * 24.5, z, mat: STONE });
        box(h, { w: 1.4, h: naveH - aisleH, d: 1.6, x: s * 16.5, y: aisleH, z, mat: STONE });
        pinnacle(h, { x: s * 24.3, y: aisleH, z, s: 1.1, h: 5 });
        pinnacle(h, { x: s * 16.3, y: naveH, z, s: 1.3, h: 6 });
      }
      for (let i = 0; i < 6; i += 1) {
        const z = naveZ0 + 4.5 + i * 7.4;
        arch(h, { w: 3.2, h: 10.5, x: s * 24.12, y: 7.5, z, ry: s * Math.PI / 2, mat: GLASS });
        arch(h, { w: 3.4, h: 9, x: s * 16.12, y: aisleH + 2, z, ry: s * Math.PI / 2, mat: GLASS });
        finial(h, { x: s * 23.7, y: aisleH + 1, z, s: 0.8, h: 2.6 });
        finial(h, { x: s * 15.7, y: naveH + 1, z, s: 0.8, h: 2.8 });
      }
    });

    // ── Stage house at the rear (x ±14, z -41..-27), height 36: transept-like block whose steep
    //    slate gable roof runs across the building (ridge along x), stone gable walls facing the sides
    const stageH = 36;
    box(h, { w: 28, h: stageH, d: 14, z: -34, mat: STONE });
    gableRoof(h, { w: 28, d: 14, h: 11, y: stageH, z: -34, overhang: -0.4, mat: M.roofTile });
    parapet(h, { length: 28, y: stageH, z: -34 + 6.6, along: "x", t: 0.8 });
    parapet(h, { length: 28, y: stageH, z: -34 - 6.6, along: "x", t: 0.8 });
    [-1, 1].forEach((s) => {
      gablePanel(h, { w: 14.2, h: 10.8, x: s * 13.9, y: stageH, z: -34, depth: 1.4, ry: Math.PI / 2 });
      pinnacle(h, { x: s * 13.9, y: stageH + 10.4, z: -34, s: 0.9, h: 3.6 });
      [-39.6, -34, -28.4].forEach((z) => {
        box(h, { w: 1.4, h: stageH, d: 1.8, x: s * 14.5, z, mat: STONE });
        pinnacle(h, { x: s * 14.3, y: stageH, z, s: 1.3, h: 6 });
      });
      [-36.8, -31.2].forEach((z) => {
        arch(h, { w: 3, h: 12, x: s * 14.12, y: 18, z, ry: s * Math.PI / 2, mat: GLASS });
      });
    });
    arch(h, { w: 6, h: 14, y: 19, z: -41.12, ry: Math.PI, mat: GLASS });
    pinnacle(h, { x: 13.4, y: stageH, z: -40.8, s: 1.3, h: 6 });
    pinnacle(h, { x: -13.4, y: stageH, z: -40.8, s: 1.3, h: 6 });

    // ── Apse (half-octagon) at the very rear with a slate pyramid roof ──────────────────────
    const apseH = 18;
    polygonPrism(h, { sides: 8, r: 8, h: apseH, z: -41, mat: STONE });
    cone(h, { r: 8.6, h: 7, y: apseH, z: -41, mat: M.roofTile, seg: 8, ry: Math.PI / 8 });
    [Math.PI, Math.PI * 0.75, Math.PI * 1.25].forEach((t) => {
      const d = 8 * Math.cos(Math.PI / 8) + 0.15;
      arch(h, { w: 2.2, h: 8, x: Math.sin(t) * d, y: 6, z: -41 + Math.cos(t) * d, ry: t, mat: GLASS });
    });
    for (let i = 0; i < 5; i += 1) {
      const t = Math.PI * 0.625 + i * (Math.PI / 4) + Math.PI / 8;
      const r = 8 * Math.cos(Math.PI / 8) + 0.4;
      pinnacle(h, { x: Math.sin(t) * r * 1.0, y: apseH, z: -41 + Math.cos(t) * r * 1.0, s: 0.8, h: 3.4 });
    }

    // ── Central facade bay (x ±8, z 20..28): great window with rose, gable + spire, portal ───
    const bayH = 42;
    box(h, { w: 16, h: bayH, d: 8, z: 24, mat: STONE });
    gablePanel(h, { w: 16.4, h: 5.2, y: bayH, z: 26.6, depth: 2.8 });
    // slender octagonal spire (첨탑) on the gable apex, flanked by pinnacles
    cyl(h, { rTop: 0.95, rBot: 1.05, h: 3.6, y: bayH + 3.4, z: 26.6, mat: STONE, seg: 8 });
    cone(h, { r: 1.25, h: 5, y: bayH + 7, z: 26.6, mat: TRIM, seg: 8 });
    [-1, 1].forEach((s) => {
      pinnacle(h, { x: s * 4.6, y: bayH + 1.7, z: 26.6, s: 0.9, h: 4 });
      pinnacle(h, { x: s * 7.3, y: bayH - 0.2, z: 26.6, s: 1.1, h: 4.6 });
    });
    // great pointed window (stained glass) with stone tracery and the rose window in its head
    const gwW = 9;
    const gwH = 19;
    const gwY = 20;
    arch(h, { w: gwW, h: gwH, y: gwY, z: zF + 0.25, depth: 0.4, mat: M.glassBlue, seg: 8 });
    [-3.6, -1.2, 1.2, 3.6].forEach((x) => {
      box(h, { w: 0.28, h: 12.5, d: 0.5, x, y: gwY, z: zF + 0.35, mat: STONE });
    });
    box(h, { w: gwW, h: 0.35, d: 0.5, y: gwY + 6.2, z: zF + 0.35, mat: STONE });
    box(h, { w: gwW, h: 0.35, d: 0.5, y: gwY + 11.9, z: zF + 0.35, mat: STONE });
    box(h, { w: gwW + 1.6, h: 0.5, d: 0.6, y: gwY - 0.5, z: zF + 0.3, mat: TRIM }); // sill
    const roseY = gwY + (gwH - (gwW * Math.sqrt(3)) / 2) + 3.3;
    const roseRing = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 0.5, 24), STONE);
    roseRing.rotation.x = Math.PI / 2;
    roseRing.position.set(0, roseY, zF + 0.35);
    h.add(roseRing);
    const roseGlass = new THREE.Mesh(new THREE.CylinderGeometry(2.95, 2.95, 0.7, 24), GLASS);
    roseGlass.rotation.x = Math.PI / 2;
    roseGlass.position.set(0, roseY, zF + 0.4);
    h.add(roseGlass);
    for (let i = 0; i < 4; i += 1) {
      box(h, { w: 0.22, h: 5.6, d: 0.25, y: roseY - 2.8, z: zF + 0.85, rz: (i * Math.PI) / 4, mat: STONE });
    }
    const roseHub = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.3, 12), STONE);
    roseHub.rotation.x = Math.PI / 2;
    roseHub.position.set(0, roseY, zF + 0.9);
    h.add(roseHub);

    // arcade band (gallery of small arches) across the central bay and the tower fronts
    [[-7, 7], [-16.6, -10.4], [10.4, 16.6]].forEach(([x0, x1]) => {
      const len = x1 - x0;
      const cx = (x0 + x1) / 2;
      box(h, { w: len, h: 0.5, d: 0.7, x: cx, y: 13.2, z: zF + 0.15, mat: TRIM });
      box(h, { w: len, h: 0.5, d: 0.7, x: cx, y: 16.6, z: zF + 0.15, mat: TRIM });
      const n = Math.floor(len / 1.5);
      for (let i = 0; i < n; i += 1) {
        arch(h, { w: 0.85, h: 2.7, x: x0 + 0.75 + i * 1.5 + (len - n * 1.5) / 2, y: 13.7, z: zF + 0.3, depth: 0.3, mat: GLASS, seg: 3 });
      }
    });

    // central portal: deep dark recess, bronze doors, steep stone gable hood with a finial
    arch(h, { w: 5.4, h: 9.6, y: 0, z: zF + 0.2, depth: 0.5, mat: M.black });
    box(h, { w: 4.4, h: 4.8, d: 0.5, y: 0, z: zF + 0.35, mat: M.bronze });
    box(h, { w: 0.4, h: 4.8, d: 0.6, y: 0, z: zF + 0.4, mat: TRIM });
    gablePanel(h, { w: 7.8, h: 4.2, y: 9.4, z: zF + 0.65, depth: 1.3 });
    pinnacle(h, { x: 0, y: 13.2, z: zF + 0.65, s: 0.7, h: 2.6 });
    [-1, 1].forEach((s) => {
      box(h, { w: 1.2, h: 9.4, d: 1.3, x: s * 3.9, y: 0, z: zF + 0.65, mat: STONE });
    });

    // ── Twin west-front towers (11 × 11), flat tops with crenels + corner pinnacles ─────────
    const towerH = 56;
    const tS = 11;
    const tZ = zF - tS / 2;
    [-1, 1].forEach((s) => {
      const cx = s * 13.5;
      box(h, { w: tS, h: towerH, d: tS, x: cx, z: tZ, mat: STONE });
      // stepped corner buttress piers, string courses between stages
      const stages = [[0, 17, 1.4], [17, 31, 1.1], [31, 45, 0.8], [45, towerH, 0.5]];
      stages.forEach(([y0, y1, p]) => {
        const pw = 2.1;
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
          box(h, {
            w: pw + p, h: y1 - y0, d: pw + p,
            x: cx + sx * (tS / 2 - pw / 2 + p / 2), y: y0, z: tZ + sz * (tS / 2 - pw / 2 + p / 2), mat: STONE,
          });
        });
        box(h, { w: tS + p * 2 + 0.3, h: 0.5, d: tS + p * 2 + 0.3, x: cx, y: y1 - 0.5, z: tZ, mat: TRIM });
        // mid-face pilasters between the paired lancets (upper stages, all faces)
        if (y0 >= 31) {
          box(h, { w: 0.9, h: y1 - y0, d: tS + p * 1.6, x: cx, y: y0, z: tZ, mat: STONE });
          box(h, { w: tS + p * 1.6, h: y1 - y0, d: 0.9, x: cx, y: y0, z: tZ, mat: STONE });
        }
      });

      // windows: faces are [dx, dz, ry]; inner faces (towards the central bay) only get the top stage
      const faces = [
        { dx: 0, dz: 1, ry: 0, key: "front" },
        { dx: 0, dz: -1, ry: Math.PI, key: "back" },
        { dx: s, dz: 0, ry: s * Math.PI / 2, key: "outer" },
        { dx: -s, dz: 0, ry: -s * Math.PI / 2, key: "inner" },
      ];
      const off = tS / 2 + 0.12;
      faces.forEach(({ dx, dz, ry, key }) => {
        const fx = cx + dx * off;
        const fz = tZ + dz * off;
        // tangent direction along the face for lateral offsets
        const tx = dz;
        const tzz = -dx;
        const pair = (y, w, hh, gap) => {
          [-gap, gap].forEach((o) => {
            arch(h, { w, h: hh, x: fx + tx * o, y, z: fz + tzz * o, ry, mat: GLASS });
          });
        };
        pair(46.5, 2, 8.5, 1.7); // top (belfry-like) stage
        if (key !== "inner") {
          pair(33, 1.7, 10.5, 1.65); // third stage
        }
        if (key === "front") {
          arch(h, { w: 4.2, h: 11, x: fx, y: 19.5, z: fz, ry, mat: GLASS });
          [-1.4, 0, 1.4].forEach((o) => {
            box(h, { w: 0.25, h: 7, d: 0.4, x: fx + o, y: 19.5, z: fz + 0.2, mat: STONE });
          });
          box(h, { w: 5.4, h: 0.45, d: 0.6, x: fx, y: 19, z: fz + 0.1, mat: TRIM });
          // side portal at the tower base with a gabled hood
          arch(h, { w: 3.4, h: 7.6, x: fx, y: 0, z: fz + 0.1, depth: 0.5, mat: M.black });
          box(h, { w: 2.8, h: 3.8, d: 0.5, x: fx, y: 0, z: fz + 0.25, mat: M.bronze });
          gablePanel(h, { w: 5.4, h: 3.2, x: fx, y: 7.4, z: fz + 0.5, depth: 1.1 });
          pinnacle(h, { x: fx, y: 10.4, z: fz + 0.5, s: 0.6, h: 2.2 });
        }
      });

      // crenellated parapet and pinnacles on the flat top
      const edge = tS / 2 + 0.5 - 0.3;
      crenels(h, { length: tS + 1, x: cx, y: towerH, z: tZ + edge, along: "x" });
      crenels(h, { length: tS + 1, x: cx, y: towerH, z: tZ - edge, along: "x" });
      crenels(h, { length: tS + 1, x: cx + edge, y: towerH, z: tZ, along: "z" });
      crenels(h, { length: tS + 1, x: cx - edge, y: towerH, z: tZ, along: "z" });
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
        pinnacle(h, { x: cx + sx * (tS / 2 - 0.5), y: towerH, z: tZ + sz * (tS / 2 - 0.5), s: 1.7, h: 6.5 });
      });
      [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dx, dz]) => {
        pinnacle(h, { x: cx + dx * (tS / 2 - 0.4), y: towerH, z: tZ + dz * (tS / 2 - 0.4), s: 0.9, h: 3.6 });
      });
      // low roof slab inside the parapet
      box(h, { w: tS - 1.4, h: 0.4, d: tS - 1.4, x: cx, y: towerH, z: tZ, mat: M.concreteDark });
    });

    return g;
  },
};
