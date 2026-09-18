// 아모레퍼시픽 본사 (Amorepacific Headquarters, David Chipperfield Architects 2017) - 용산구
// One monumental 22-storey block (real ≈ 100 × 100 × 110 m; the footprint is scaled to ~0.55 so the
// model fits its collider) wrapped in a lattice of closely spaced white aluminium fins over grey glass,
// hollowed by a central courtyard and three huge "hanging garden" openings that connect the courtyard
// to the outside: SE face 5–10F, SW face 11–16F, NE face 17–21F. Like the real building the block is
// turned 45° to the cardinal points, and it floats on a recessed double-height glass atrium behind a
// colonnade of slender white columns. Plaza with maples and the small pavilions around it.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, prism, tree, subgroup, seededRandom, trianglesToGeometry } from "./_helpers.mjs";

export default {
  id: "amorepacific-hq",
  name: "아모레퍼시픽 본사",
  nameEn: "Amorepacific Headquarters",
  district: "용산구",
  lat: 37.5288,
  lon: 126.9686,
  height: 110,
  colliderRadius: 40,
  detail: "high",
  description: "치퍼필드의 정육면체, 세 개의 대형 개구부와 수직 핀",
  create() {
    const g = new THREE.Group();
    // Rotated frame: local +z faces south-east, -x south-west, +x north-east, -z north-west (Hangang-daero side).
    const r = subgroup(g, { ry: Math.PI / 4 });

    const S = 54; // cube side
    const H = S / 2;
    const C = 9; // courtyard half-width (18 × 18 light well)
    const V = 12.5; // opening half-width (25 ≈ 45 % of the face)
    const FLOOR = 5;
    const BASE_TOP = 10; // double-height recessed colonnade level
    const L5 = 20; // 5F courtyard / first hanging garden
    const L11 = 50;
    const L17 = 80;
    const L22 = 105;
    const ROOF = 108.8;
    const TOP = 110;
    const BAND = 0.7;
    const PROTRUDE = 0.9; // how far fins and bands stand in front of the glass
    const glass = material(0xafbbc5, { roughness: 0.3, metalness: 0.55, emissive: 0x141f28, emissiveIntensity: 0.14 });
    const fin = M.white;

    // Hundreds of fins / floor lines are batched into two meshes (one per material) instead of one mesh each.
    const finTris = [];
    const lineTris = [];
    const pushBox = (tris, { w, h, d, x = 0, y = 0, z = 0 }) => {
      const x0 = x - w / 2;
      const x1 = x + w / 2;
      const y0 = y;
      const y1 = y + h;
      const z0 = z - d / 2;
      const z1 = z + d / 2;
      tris.push(
        [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y0, z1], [x1, y1, z0], [x1, y1, z1], // +x
        [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y0, z0], [x0, y1, z1], [x0, y1, z0], // -x
        [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y0, z1], [x1, y1, z1], [x0, y1, z1], // +z
        [x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y0, z0], [x0, y1, z0], [x1, y1, z0], // -z
        [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z1], [x1, y1, z0], [x0, y1, z0], // +y
        [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z0], [x1, y0, z1], [x0, y0, z1], // -y
      );
    };

    // ── Plaza (square with clipped corners so every vertex stays inside the collider) ──
    const PH = 33;
    const PT = 21.7;
    const PC = 27.8;
    prism(r, {
      points: [[PH, -PT], [PH, PT], [PC, PC], [PT, PH], [-PT, PH], [-PC, PC], [-PH, PT], [-PH, -PT], [-PC, -PC], [-PT, -PH], [PT, -PH], [PC, -PC]],
      h: 0.5, mat: M.granite,
    });
    // Paving joints
    [-24, -12, 0, 12, 24].forEach((t) => {
      const len = Math.abs(t) > 20 ? 60 : 66;
      box(r, { w: len, h: 0.06, d: 0.35, y: 0.5, z: t, mat: M.graniteDark });
      box(r, { w: 0.35, h: 0.06, d: len, y: 0.5, x: t, mat: M.graniteDark });
    });

    // ── Ground level: recessed glass atrium behind slender columns ──
    const baseW = S - 8;
    box(r, { w: baseW, h: BASE_TOP - 0.5, d: baseW, y: 0.5, mat: M.glassWhite });
    for (let i = 0; i <= 12; i += 1) {
      const t = -baseW / 2 + (baseW / 12) * i;
      pushBox(lineTris, { w: 0.25, h: BASE_TOP - 0.5, d: 0.25, x: t, y: 0.5, z: baseW / 2 });
      pushBox(lineTris, { w: 0.25, h: BASE_TOP - 0.5, d: 0.25, x: t, y: 0.5, z: -baseW / 2 });
      pushBox(lineTris, { w: 0.25, h: BASE_TOP - 0.5, d: 0.25, x: baseW / 2, y: 0.5, z: t });
      pushBox(lineTris, { w: 0.25, h: BASE_TOP - 0.5, d: 0.25, x: -baseW / 2, y: 0.5, z: t });
    }
    // Entrance canopies on the NW (Hangang-daero) and SE (park) sides
    box(r, { w: 16, h: 0.5, d: 5, y: 5.2, z: -(baseW / 2) - 2.2, mat: M.white });
    box(r, { w: 16, h: 0.5, d: 5, y: 5.2, z: baseW / 2 + 2.2, mat: M.white });
    const colE = H - 1.6;
    const perSide = 9;
    for (let i = 0; i < perSide; i += 1) {
      const t = -colE + ((2 * colE) / (perSide - 1)) * i;
      cyl(r, { rTop: 0.45, h: BASE_TOP - 0.5, x: t, y: 0.5, z: colE, mat: M.white, seg: 10 });
      cyl(r, { rTop: 0.45, h: BASE_TOP - 0.5, x: t, y: 0.5, z: -colE, mat: M.white, seg: 10 });
      if (i > 0 && i < perSide - 1) {
        cyl(r, { rTop: 0.45, h: BASE_TOP - 0.5, x: colE, y: 0.5, z: t, mat: M.white, seg: 10 });
        cyl(r, { rTop: 0.45, h: BASE_TOP - 0.5, x: -colE, y: 0.5, z: t, mat: M.white, seg: 10 });
      }
    }
    // Soffit / sill slab of the fin skin, then floors 3–4 (solid; the atrium sits inside)
    box(r, { w: S + 2 * PROTRUDE, h: 0.6, d: S + 2 * PROTRUDE, y: BASE_TOP, mat: fin });
    box(r, { w: S, h: L5 - BASE_TOP - 0.6, d: S, y: BASE_TOP + 0.6, mat: glass });

    // ── Upper block: horseshoe floor plates (courtyard + one opening) stacked in three orientations ──
    const horseshoe = (y, h, ry) => prism(r, {
      points: [[-H, -H], [H, -H], [H, H], [V, H], [V, C], [C, C], [C, -C], [-C, -C], [-C, C], [-V, C], [-V, H], [-H, H]],
      h, y, mat: glass, ry,
    });
    const ring = (y, h, mat) => prism(r, {
      points: [[-H, -H], [H, -H], [H, H], [-H, H]],
      holes: [[[-C, -C], [C, -C], [C, C], [-C, C]]],
      h, y, mat,
    });
    horseshoe(L5, L11 - L5, 0); // 5–10F, opening to the south-east (Yongsan Park)
    horseshoe(L11, L17 - L11, -Math.PI / 2); // 11–16F, opening to the south-west (Sinyongsan station)
    horseshoe(L17, L22 - L17, Math.PI / 2); // 17–21F, opening to the north-east (Namsan)
    ring(L22, ROOF - L22, glass); // 22F
    ring(ROOF, 0.8, fin); // roof slab around the open courtyard

    // ── Fin lattice: 50 white vertical fins per face, interrupted by bands at the three garden levels ──
    const faces = [
      { nx: 0, nz: 1, hole: [L5, L11] }, // SE
      { nx: -1, nz: 0, hole: [L11, L17] }, // SW
      { nx: 1, nz: 0, hole: [L17, L22] }, // NE
      { nx: 0, nz: -1, hole: null }, // NW
    ];
    const faceBox = (f, t, y, h, len, depth, protrude, tris) => {
      const off = H + protrude - depth / 2;
      const alongX = f.nz !== 0;
      pushBox(tris, {
        w: alongX ? len : depth, h, d: alongX ? depth : len,
        x: alongX ? t : f.nx * off, y, z: alongX ? f.nz * off : t,
      });
    };
    const subtract = ([a, b], [y0, y1]) => {
      const out = [];
      if (a < y0) out.push([a, Math.min(b, y0)]);
      if (b > y1) out.push([Math.max(a, y1), b]);
      return out.filter(([p, q]) => q - p > 0.05);
    };
    const finTop = TOP - 0.8;
    const finSegments = [[BASE_TOP + 0.6, L5], [L5 + BAND, L11], [L11 + BAND, L17], [L17 + BAND, finTop]];
    const finCount = 51;
    const finSpan = S - 0.34;
    // White corner posts close the lattice at the four vertical edges
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz]) => {
      pushBox(finTris, { w: PROTRUDE, h: TOP - (BASE_TOP + 0.6), d: PROTRUDE, x: sx * (H + PROTRUDE / 2), y: BASE_TOP + 0.6, z: sz * (H + PROTRUDE / 2) });
    });
    faces.forEach((f) => {
      for (let i = 0; i < finCount; i += 1) {
        const t = -finSpan / 2 + (finSpan / (finCount - 1)) * i;
        finSegments.forEach((segment) => {
          const pieces = f.hole && Math.abs(t) < V ? subtract(segment, f.hole) : [segment];
          pieces.forEach(([p, q]) => faceBox(f, t, p, q - p, 0.34, PROTRUDE, PROTRUDE, finTris));
        });
      }
      // Horizontal bands at the garden levels and the roof fascia
      [L5, L11, L17].forEach((y) => faceBox(f, 0, y, BAND, S + 2 * PROTRUDE, PROTRUDE, PROTRUDE, finTris));
      faceBox(f, 0, finTop, TOP - finTop, S + 2 * PROTRUDE, PROTRUDE, PROTRUDE, finTris);
      // Subtle floor lines behind the fins
      for (let y = BASE_TOP + FLOOR; y <= L22; y += FLOOR) {
        if (y === L5 || y === L11 || y === L17) continue;
        if (f.hole && y > f.hole[0] && y < f.hole[1]) {
          faceBox(f, -(H + V) / 2, y - 0.2, 0.45, H - V, 0.3, 0.15, lineTris);
          faceBox(f, (H + V) / 2, y - 0.2, 0.45, H - V, 0.3, 0.15, lineTris);
        } else {
          faceBox(f, 0, y - 0.2, 0.45, S, 0.3, 0.15, lineTris);
        }
      }
    });

    // Floor lines on the courtyard walls (skipped where an opening replaces the wall)
    for (let y = L5 + FLOOR; y <= L22; y += FLOOR) {
      if (!(y > L5 && y < L11)) pushBox(finTris, { w: 2 * C + 0.5, h: 0.35, d: 0.25, y: y - 0.2, z: C - 0.125 }); // +z wall
      pushBox(finTris, { w: 2 * C + 0.5, h: 0.35, d: 0.25, y: y - 0.2, z: -(C - 0.125) }); // -z wall
      if (!(y > L11 && y < L17)) pushBox(finTris, { w: 0.25, h: 0.35, d: 2 * C + 0.5, y: y - 0.2, x: -(C - 0.125) }); // -x wall
      if (!(y > L17 && y < L22)) pushBox(finTris, { w: 0.25, h: 0.35, d: 2 * C + 0.5, y: y - 0.2, x: C - 0.125 }); // +x wall
    }

    // ── Hanging gardens inside the three openings (built with the opening towards +z, then rotated) ──
    const depth = H - C;
    const garden = (y, ceiling, ry, seed, withCourtyard) => {
      const t = subgroup(r, { ry });
      box(t, { w: 2 * V, h: 0.4, d: depth, y, z: (C + H) / 2, mat: M.granite });
      box(t, { w: 6, h: 0.5, d: depth - 5, x: -7.5, y: y + 0.4, z: (C + H) / 2 - 0.5, mat: M.grass });
      box(t, { w: 6, h: 0.5, d: depth - 5, x: 7.5, y: y + 0.4, z: (C + H) / 2 - 0.5, mat: M.grass });
      const rng = seededRandom(seed);
      for (let i = 0; i < 6; i += 1) {
        const x = (i % 2 ? 7.5 : -7.5) + (rng() - 0.5) * 2.4;
        const z = C + 3.5 + rng() * (depth - 7);
        tree(t, { x, y: y + 0.9, z, h: 5 + rng() * 2.5, r: 1.5 + rng() * 0.6 });
      }
      // Glass balustrades at the outer edge (and at the light-well edge on the upper gardens)
      box(t, { w: 2 * V - 0.2, h: 1.2, d: 0.12, y: y + 0.4, z: H - 0.3, mat: M.glassWhite });
      if (!withCourtyard) {
        box(t, { w: 2 * V - 0.2, h: 1.2, d: 0.12, y: y + 0.4, z: C + 0.25, mat: M.glassWhite });
      }
      // White soffit under the opening
      box(t, { w: 2 * V - 0.2, h: 0.6, d: depth - 0.1, y: ceiling - 0.6, z: (C + H) / 2 + 0.05, mat: M.white });
      // Floor lines on the two jamb walls of the opening
      const cos = Math.cos(ry);
      const sin = Math.sin(ry);
      for (let fy = y + FLOOR; fy < ceiling; fy += FLOOR) {
        [-1, 1].forEach((side) => {
          const lx = side * (V - 0.125);
          const lz = (C + H) / 2;
          const wx = lx * cos + lz * sin;
          const wz = -lx * sin + lz * cos;
          const swap = Math.abs(sin) > 0.5;
          pushBox(finTris, { w: swap ? depth : 0.25, h: 0.35, d: swap ? 0.25 : depth, x: wx, y: fy - 0.2, z: wz });
        });
      }
      if (withCourtyard) {
        // 5F courtyard: stone deck with the shallow reflecting pool over the atrium skylights
        box(t, { w: 2 * C, h: 0.4, d: 2 * C, y, mat: M.granite });
        box(t, { w: 10, h: 0.3, d: 10, y: y + 0.4, mat: M.water });
        box(t, { w: 2 * C - 1, h: 0.4, d: 2.2, y: y + 0.4, z: -C + 1.6, mat: M.grass });
        box(t, { w: 2.2, h: 0.4, d: 2 * C - 1, y: y + 0.4, x: -C + 1.6, mat: M.grass });
        box(t, { w: 2.2, h: 0.4, d: 2 * C - 1, y: y + 0.4, x: C - 1.6, mat: M.grass });
      }
    };
    garden(L5, L11, 0, 11, true);
    garden(L11, L17, -Math.PI / 2, 23, false);
    garden(L17, L22, Math.PI / 2, 37, false);

    // ── Roof garden around the light well ──
    const roofDeck = ROOF + 0.8;
    box(r, { w: 38, h: 0.3, d: 7, y: roofDeck, z: -(C + 8.5), mat: M.grass });
    box(r, { w: 30, h: 0.3, d: 6, y: roofDeck, x: 3, z: C + 9, mat: M.grass });
    box(r, { w: 7, h: 0.3, d: 34, y: roofDeck, x: -(C + 8.5), z: 1, mat: M.grass });
    box(r, { w: 6, h: 0.3, d: 24, y: roofDeck, x: C + 9, z: -3, mat: M.grassDark });
    // Kerb around the open courtyard
    box(r, { w: 2 * C + 0.6, h: 0.4, d: 0.3, y: roofDeck, z: C + 0.15, mat: M.white });
    box(r, { w: 2 * C + 0.6, h: 0.4, d: 0.3, y: roofDeck, z: -(C + 0.15), mat: M.white });
    box(r, { w: 0.3, h: 0.4, d: 2 * C + 0.6, y: roofDeck, x: C + 0.15, mat: M.white });
    box(r, { w: 0.3, h: 0.4, d: 2 * C + 0.6, y: roofDeck, x: -(C + 0.15), mat: M.white });

    // ── Surroundings: maples on the park (SE) and NE sides, a row facing Hangang-daero (NW),
    //    the Sinyongsan-station passage pavilion (SW) and a low park pavilion (SE corner) ──
    const rng = seededRandom(5);
    for (let x = -18; x <= 6; x += 4.6) {
      tree(r, { x: x + (rng() - 0.5) * 1.2, y: 0.5, z: 30.4 + (rng() - 0.5) * 1.2, h: 6 + rng() * 2, r: 1.9 + rng() * 0.4 });
    }
    for (let z = -16; z <= 16; z += 4.6) {
      tree(r, { x: 30.4 + (rng() - 0.5) * 1.2, y: 0.5, z: z + (rng() - 0.5) * 1.2, h: 6 + rng() * 2, r: 1.9 + rng() * 0.4 });
    }
    for (let x = -14; x <= 14; x += 7) {
      tree(r, { x, y: 0.5, z: -30.4, h: 5.5 + rng() * 1.5, r: 1.9 });
    }
    box(r, { w: 20, h: 0.4, d: 4, y: 0.5, x: -8, z: 30.6, mat: M.grass });
    // Underground-passage pavilion to Sinyongsan station
    box(r, { w: 5, h: 4, d: 12, y: 0.5, x: -30.4, z: -12, mat: M.glassWhite });
    box(r, { w: 6, h: 0.4, d: 13, y: 4.5, x: -30.4, z: -12, mat: M.white });
    // Park pavilion / museum garden entrance
    box(r, { w: 9, h: 3.4, d: 3, y: 0.5, x: 16.5, z: 31, mat: M.offWhite });
    box(r, { w: 10, h: 0.4, d: 4, y: 3.9, x: 16.5, z: 31, mat: M.white });

    r.add(new THREE.Mesh(trianglesToGeometry(finTris), fin));
    r.add(new THREE.Mesh(trianglesToGeometry(lineTris), M.aluminum));

    return g;
  },
};
