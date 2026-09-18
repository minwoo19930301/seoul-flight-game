// 세빛섬 (Sebitseom (Floating Islands)) - 서초구
// Some Sevit (Haeahn / H Architecture, 2011-2014): three moored pontoon islands off the south bank
// just downstream (west) of 반포대교, in a row along the river. West to east: 가빛섬 (the "blossom" -
// the big flaring glass pavilion with layered white-edged petals, 27 m real), the little 솔빛섬
// (the "seed" - a low glass lens under a white husk) set towards the bank, and 채빛섬 (the "bud" -
// a leaning egg wrapped in a white diagrid, 21 m real). The small 예빛섬 media-art stage float with
// its LED screen sits west of 가빛섬. Floating walkways link the islands; three wider access bridges
// run south towards the bank and meet a landing dock (the real ones are 36-80 m long). Plan is
// compressed to ~0.4 of the real spacing, heights are ~0.9 of real. y = 0 is the nominal pontoon
// deck level (the viewer floats the group ~2.6 above the water); the hulls hang 2.7 below it.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, sphere, prism, strut, subgroup } from "./_helpers.mjs";

export default {
  id: "sebitseom",
  name: "세빛섬",
  nameEn: "Sebitseom (Floating Islands)",
  district: "서초구",
  lat: 37.5117,
  lon: 126.9949,
  height: 26,
  colliderRadius: 48,
  detail: "high",
  description: "한강 위 세 개의 인공섬(가빛·채빛·솔빛)",
  create() {
    const g = new THREE.Group();
    const B = 0.7; // top of the pontoon deck surface

    // ── Materials ──────────────────────────────────────────────────────────────────────────
    const HULL = M.white; // painted steel pontoon sides
    const DECK = M.offWhite; // pale deck paving
    const DECK_DS = material(0xe4e1d8, { roughness: 0.75, side: THREE.DoubleSide });
    const WOOD = material(0xc8b08a, { roughness: 0.9 }); // timber decking
    const WALK = material(0xd2d6d9, { roughness: 0.85 }); // light-gray walkway decks
    // Pale glass for the open shells: low metalness plus a sky-blue emissive so the outward-leaning
    // skins (normals pointing down, away from the sun) still read as light glass, not dark metal.
    const GLASS_DS = material(0xdce8f3, { roughness: 0.3, metalness: 0.35, emissive: 0x43678a, emissiveIntensity: 0.55, side: THREE.DoubleSide });
    const HUSK = material(0xf3f4f1, { roughness: 0.5, metalness: 0.2, side: THREE.DoubleSide });
    const SCREEN = material(0x121826, { roughness: 0.4, emissive: 0x2b5fa8, emissiveIntensity: 0.55 });
    const FRAME = M.white; // white steel ribs / rims

    // ── Local helpers ──────────────────────────────────────────────────────────────────────
    /** Rounded organic deck outline (superellipse), [[x, z], ...]. */
    const superEllipse = (a, b, { n = 3.4, count = 48 } = {}) => {
      const pts = [];
      for (let i = 0; i < count; i += 1) {
        const t = (i / count) * Math.PI * 2;
        const c = Math.cos(t);
        const s = Math.sin(t);
        pts.push([Math.sign(c) * Math.pow(Math.abs(c), 2 / n) * a, Math.sign(s) * Math.pow(Math.abs(s), 2 / n) * b]);
      }
      return pts;
    };
    /** Smooth tube along a polyline of [x, y, z] points (white frame ribs, rims, bands). */
    const tube = (parent, pts, { r = 0.16, mat = FRAME, closed = false, radial = 6 } = {}) => {
      const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])), closed, "centripetal");
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(6, Math.round(pts.length * 1.6)), r, radial, closed), mat);
      parent.add(mesh);
      return mesh;
    };
    /** Smooth-shaded parametric surface fn(u, v) -> [x, y, z], u/v in 0..1. */
    const surface = (parent, fn, nu, nv, mat) => {
      const pos = [];
      for (let j = 0; j <= nv; j += 1) {
        for (let i = 0; i <= nu; i += 1) {
          pos.push(...fn(i / nu, j / nv));
        }
      }
      const idx = [];
      for (let j = 0; j < nv; j += 1) {
        for (let i = 0; i < nu; i += 1) {
          const a = j * (nu + 1) + i;
          const b = a + 1;
          const c = a + nu + 1;
          const d = c + 1;
          idx.push(a, b, d, a, d, c);
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      geometry.setIndex(idx);
      geometry.computeVertexNormals();
      const mesh = new THREE.Mesh(geometry, mat);
      parent.add(mesh);
      return mesh;
    };
    /** Piecewise-linear radius of a [[r, y], ...] profile at height y (extrapolates past the ends). */
    const radiusAt = (profile, y) => {
      if (y <= profile[0][1]) return profile[0][0];
      for (let i = 0; i < profile.length - 1; i += 1) {
        const [r0, y0] = profile[i];
        const [r1, y1] = profile[i + 1];
        if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
      }
      const [ra, ya] = profile[profile.length - 2];
      const [rb, yb] = profile[profile.length - 1];
      return rb + ((rb - ra) / (yb - ya)) * (y - yb);
    };
    /** Petal shell: a slice of the body skin (angle span) whose top edge peaks in the middle, with a white rim. */
    const petal = (parent, P, { phi, span, top, edge, k, y0, flareFrom = 14, flare = 0.012, rimR = 0.22 }) => {
      const hTop = (u) => edge + (top - edge) * Math.pow(Math.sin(Math.PI * u), 0.65);
      const Q = (u, v) => {
        const a = phi - span / 2 + u * span;
        const y = y0 + v * (hTop(u) - y0);
        return P(a, y, k + Math.max(0, y - flareFrom) * flare);
      };
      surface(parent, Q, 28, 10, GLASS_DS);
      const rim = [];
      for (let i = 0; i <= 6; i += 1) rim.push(Q(0, 0.3 + (0.7 * i) / 6));
      for (let i = 1; i <= 24; i += 1) rim.push(Q(i / 24, 1));
      for (let i = 1; i <= 6; i += 1) rim.push(Q(1, 1 - (0.7 * i) / 6));
      tube(parent, rim, { r: rimR });
    };
    /** Closed horizontal ring of skin points at height y (floor bands, rims). */
    const ringPts = (P, y, k = 1, count = 32) => {
      const pts = [];
      for (let i = 0; i < count; i += 1) pts.push(P((i / count) * Math.PI * 2, y, k));
      return pts;
    };
    /** Floating pontoon: white hull hanging below the deck, pale deck surface, glass balustrade. */
    const pontoon = (parent, { a, b, deck = DECK, rail = true, n = 3.4 }) => {
      prism(parent, { points: superEllipse(a, b, { n }), h: 3.2, y: -2.7, mat: HULL });
      prism(parent, { points: superEllipse(a - 0.2, b - 0.2, { n }), h: B - 0.5, y: 0.5, mat: deck });
      if (rail) {
        prism(parent, { points: superEllipse(a - 0.45, b - 0.45, { n }), holes: [superEllipse(a - 0.6, b - 0.6, { n }).reverse()], h: 1.05, y: B, mat: M.glassWhite });
        prism(parent, { points: superEllipse(a - 0.4, b - 0.4, { n }), holes: [superEllipse(a - 0.65, b - 0.65, { n }).reverse()], h: 0.1, y: B + 1.05, mat: M.aluminum });
      }
    };
    /** Floating walkway / access bridge between two deck points (world xz), deck flush with the islands. */
    const walkway = (parent, { from, to, w = 2.4, rails = true, hull = true, mat = WALK }) => {
      const [x0, z0] = from;
      const [x1, z1] = to;
      const dx = x1 - x0;
      const dz = z1 - z0;
      const len = Math.hypot(dx, dz);
      const ry = Math.atan2(-dz, dx);
      const cx = (x0 + x1) / 2;
      const cz = (z0 + z1) / 2;
      const nx = -dz / len;
      const nz = dx / len;
      box(parent, { w: len, h: 0.9, d: w, x: cx, y: B - 0.9, z: cz, ry, mat });
      if (hull) box(parent, { w: len - 1.2, h: 2.5, d: w - 0.6, x: cx, y: -2.7, z: cz, ry, mat: HULL });
      if (rails) {
        [-1, 1].forEach((side) => {
          const ox = nx * (w / 2 - 0.1) * side;
          const oz = nz * (w / 2 - 0.1) * side;
          box(parent, { w: len - 0.6, h: 1.0, d: 0.08, x: cx + ox, y: B, z: cz + oz, ry, mat: M.glassWhite });
          box(parent, { w: len - 0.6, h: 0.1, d: 0.14, x: cx + ox, y: B + 1.0, z: cz + oz, ry, mat: M.aluminum });
        });
      }
    };

    // ── 가빛섬 (Gavit, the blossom) - west ────────────────────────────────────────────────
    const gavit = subgroup(g, { x: -27.5, z: -4.5, ry: 0.06 });
    pontoon(gavit, { a: 19.5, b: 13.5 });
    {
      const sx = 14;
      const sz = 10.8;
      // Vase-like skin: narrow above the recessed ground floor, flaring out to the roof terrace,
      // bulging a little more towards the river side so the "flower" leans.
      const prof = [[0.62, 4.2], [0.65, 6], [0.7, 8], [0.76, 10], [0.82, 12], [0.88, 14], [0.93, 16], [0.97, 18], [1.0, 20], [1.03, 22]];
      const P = (phi, y, k = 1) => {
        const r = radiusAt(prof, y) * (1 + 0.05 * Math.sin(phi + 0.8) * Math.max(0, (y - 4) / 18)) * k;
        return [r * sx * Math.sin(phi), B + y, r * sz * Math.cos(phi)];
      };
      // Recessed glass ground floor with slender white columns under the overhang.
      cyl(gavit, { rTop: 1, h: 4.2, y: B, sx: sx * 0.56, sz: sz * 0.56, seg: 40, mat: M.glass });
      for (let i = 0; i < 14; i += 1) {
        const [x, , z] = P((i / 14) * Math.PI * 2, 4.2, 0.97);
        cyl(gavit, { rTop: 0.28, h: 4.2, x, y: B, z, seg: 8, mat: FRAME });
      }
      surface(gavit, (u, v) => { const p = P(u * Math.PI * 2, 4.2, v); return [p[0], B + 4.2, p[2]]; }, 40, 1, DECK_DS);
      tube(gavit, ringPts(P, 4.2, 1.01, 40), { r: 0.26, closed: true });
      // Main glass body (open top) with curved white ribs and floor bands.
      surface(gavit, (u, v) => P(u * Math.PI * 2, 4.2 + v * 17.8), 56, 12, GLASS_DS);
      [9, 13.8, 18.6].forEach((y) => tube(gavit, ringPts(P, y, 1.012, 40), { r: 0.14, closed: true }));
      for (let i = 0; i < 16; i += 1) {
        const phi = (i / 16) * Math.PI * 2 + 0.1;
        const pts = [];
        for (let y = 4.2; y <= 22.01; y += 1.48) pts.push(P(phi, y, 1.014));
        tube(gavit, pts, { r: 0.13 });
      }
      // Layered petals of different heights wrapping the upper body (the tallest faces the river).
      [
        { phi: 0.2, span: 2.6, top: 24.6, edge: 13, k: 1.035 },
        { phi: 1.75, span: 2.3, top: 22.4, edge: 12, k: 1.075 },
        { phi: 3.35, span: 2.5, top: 23.6, edge: 13.5, k: 1.055 },
        { phi: 4.85, span: 2.2, top: 21.2, edge: 11.5, k: 1.095 },
      ].forEach((spec) => petal(gavit, P, { ...spec, y0: 7 }));
      // Roof terrace (달빛산책로), observation room and planters.
      surface(gavit, (u, v) => { const p = P(u * Math.PI * 2, 21, 0.975 * v); return [p[0], B + 21.2, p[2]]; }, 48, 1, DECK_DS);
      cyl(gavit, { rTop: 1, h: 3.0, x: -2, y: B + 21.2, z: 1, sx: 4.6, sz: 3.6, seg: 32, mat: M.glass });
      cyl(gavit, { rTop: 1, h: 0.35, x: -2, y: B + 24.2, z: 1, sx: 5.0, sz: 4.0, seg: 32, mat: FRAME });
      [[6.5, -4], [-7, 5], [5.5, 4.5], [-6, -5.5]].forEach(([x, z]) => sphere(gavit, { r: 1.1, x, y: B + 21.2, z, seg: 10, mat: M.foliage }));
      // Planters along the outdoor deck.
      [[-15, -8], [-16, 6], [14, -8.5], [15, 5.5], [-4, 11], [6, -11.5]].forEach(([x, z]) => sphere(gavit, { r: 1.0, x, y: B, z, seg: 10, mat: M.foliage }));
    }

    // ── 솔빛섬 (Solvit, the seed) - middle, set towards the bank ──────────────────────────
    const solvit = subgroup(g, { x: 5, z: 13, ry: -0.12 });
    pontoon(solvit, { a: 8.5, b: 6, deck: WOOD });
    {
      const a = 7.2;
      const b = 3.8;
      const c = 5.2;
      // Low glass lens with a white band at its waist ...
      sphere(solvit, { r: 1, y: B, sx: a, sy: b, sz: c, seg: 36, mat: M.glassWhite });
      const waist = [];
      for (let i = 0; i < 32; i += 1) {
        const t = (i / 32) * Math.PI * 2;
        waist.push([a * 1.01 * Math.sin(t), B + b, c * 1.01 * Math.cos(t)]);
      }
      tube(solvit, waist, { r: 0.14, closed: true });
      // ... under a tilted white husk shell that covers the river side and both ends.
      const hs = subgroup(solvit, { x: 0.5, y: B + 4.0, z: -0.4 });
      hs.rotation.set(-0.05, 0, 0.1);
      const ha = 7.9;
      const hb = 4.6;
      const hc = 5.9;
      const phiS = 0.9 * Math.PI;
      const phiL = 1.2 * Math.PI;
      const thetaL = 0.62 * Math.PI;
      const husk = new THREE.Mesh(new THREE.SphereGeometry(1, 36, 14, phiS, phiL, 0, thetaL), HUSK);
      husk.scale.set(ha, hb, hc);
      hs.add(husk);
      const S = (phi, theta) => [-ha * Math.cos(phi) * Math.sin(theta), hb * Math.cos(theta), hc * Math.sin(phi) * Math.sin(theta)];
      const rim = [];
      for (let i = 0; i <= 8; i += 1) rim.push(S(phiS, 0.04 + ((thetaL - 0.04) * i) / 8));
      for (let i = 1; i <= 24; i += 1) rim.push(S(phiS + (phiL * i) / 24, thetaL));
      for (let i = 1; i <= 8; i += 1) rim.push(S(phiS + phiL, thetaL - ((thetaL - 0.04) * i) / 8));
      tube(hs, rim, { r: 0.2 });
    }

    // ── 채빛섬 (Chavit, the bud) - east, nearest 반포대교 ─────────────────────────────────
    const chavit = subgroup(g, { x: 30.5, z: -6.5, ry: -0.08 });
    pontoon(chavit, { a: 15.5, b: 12 });
    {
      const sx = 10;
      const sz = 8.6;
      const prof = [[0.68, 3.5], [0.8, 5.5], [0.9, 7.5], [0.97, 9.5], [1.0, 11], [0.97, 12.5], [0.9, 14], [0.78, 15.4], [0.6, 16.5], [0.4, 17.2], [0.24, 17.6]];
      const bud = subgroup(chavit, { y: B });
      bud.rotation.x = -0.09; // leans towards the river
      const P = (phi, y, k = 1) => {
        const r = radiusAt(prof, y) * k;
        return [r * sx * Math.sin(phi), y, r * sz * Math.cos(phi)];
      };
      // Recessed ground floor and columns (upright, on the deck).
      cyl(chavit, { rTop: 1, h: 4.0, y: B, sx: sx * 0.6, sz: sz * 0.6, seg: 36, mat: M.glass });
      for (let i = 0; i < 12; i += 1) {
        const [x, , z] = P((i / 12) * Math.PI * 2, 3.5, 0.96);
        cyl(chavit, { rTop: 0.26, h: 4.2, x, y: B, z, seg: 8, mat: FRAME });
      }
      // Egg-shaped glass bud, open at the tip (roof terrace), wrapped in a white diagrid.
      surface(bud, (u, v) => { const p = P(u * Math.PI * 2, 3.5, v); return [p[0], 3.5, p[2]]; }, 36, 1, DECK_DS);
      surface(bud, (u, v) => P(u * Math.PI * 2, 3.5 + v * 14.1), 48, 14, GLASS_DS);
      tube(bud, ringPts(P, 3.5, 1.01, 36), { r: 0.24, closed: true });
      [8, 12.5].forEach((y) => tube(bud, ringPts(P, y, 1.012, 36), { r: 0.12, closed: true }));
      tube(bud, ringPts(P, 17.6, 1.0, 24), { r: 0.26, closed: true });
      cyl(bud, { rTop: 1, h: 0.3, y: 17.1, sx: 0.4 * sx, sz: 0.4 * sz, seg: 24, mat: DECK });
      for (let j = 0; j < 9; j += 1) {
        [-1, 1].forEach((s) => {
          const phi0 = (j / 9) * Math.PI * 2 + (s > 0 ? 0 : 0.35);
          const pts = [];
          for (let i = 0; i <= 12; i += 1) {
            const t = i / 12;
            pts.push(P(phi0 + s * t * 2.3, 3.6 + t * 13.9, 1.02));
          }
          tube(bud, pts, { r: 0.13, radial: 5 });
        });
      }
      // Two sepal-like lower petals layered over the bud.
      petal(bud, P, { phi: 0.5, span: 2.4, top: 12.5, edge: 6.5, k: 1.06, y0: 3.5, flareFrom: 9, flare: 0.01, rimR: 0.2 });
      petal(bud, P, { phi: 3.9, span: 2.2, top: 11, edge: 6, k: 1.09, y0: 3.5, flareFrom: 9, flare: 0.01, rimR: 0.2 });
      // Planters on the deck (beer garden side faces the bank).
      [[-12, 7], [12, 7.5], [-12.5, -6.5], [0, 10]].forEach(([x, z]) => sphere(chavit, { r: 1.0, x, y: B, z, seg: 10, mat: M.foliage }));
    }

    // ── 예빛섬 (Yevit, the media-art stage float) - west of 가빛섬, near the bank ──────────
    const yevit = subgroup(g, { x: -33, z: 19.5, ry: 0.1 });
    pontoon(yevit, { a: 8, b: 4.5, rail: false });
    {
      box(yevit, { w: 12, h: 0.3, d: 5, y: B, z: 0.8, mat: WOOD });
      box(yevit, { w: 12.5, h: 8, d: 0.5, y: B + 1.4, z: -2.6, mat: SCREEN });
      box(yevit, { w: 13.3, h: 0.5, d: 0.9, y: B + 9.4, z: -2.6, mat: FRAME });
      box(yevit, { w: 13.3, h: 1.4, d: 0.9, y: B, z: -2.6, mat: FRAME });
      [-6.4, 6.4].forEach((x) => box(yevit, { w: 0.5, h: 9.9, d: 0.9, x, y: B, z: -2.6, mat: FRAME }));
      [-5, 0, 5].forEach((x) => strut(yevit, { from: [x, B + 9.4, -2.6], to: [x, B, -4.0], r: 0.12, mat: M.steel }));
    }

    // ── Walkways between the islands and access bridges towards the bank ─────────────────
    walkway(g, { from: [-10.8, 4.5], to: [-1.8, 9.3] }); // 가빛 - 솔빛
    walkway(g, { from: [10.9, 8.5], to: [17.0, 3.8] }); // 솔빛 - 채빛
    walkway(g, { from: [-33, 8.0], to: [-33, 16.0], w: 2.2 }); // 가빛 - 예빛
    walkway(g, { from: [-20, 8.0], to: [-20, 30.6], w: 3.6 }); // 가빛 - bank
    walkway(g, { from: [5, 18.2], to: [5, 30.6], w: 3.6 }); // 솔빛 - bank
    walkway(g, { from: [24, 4.5], to: [24, 30.6], w: 3.6 }); // 채빛 - bank
    // Landing dock where the access bridges meet (the real bridges continue to the riverbank).
    box(g, { w: 54, h: 3.2, d: 3.6, x: 3, y: -2.7, z: 31.8, mat: HULL });
    box(g, { w: 53.6, h: 0.2, d: 3.3, x: 3, y: 0.5, z: 31.8, mat: WALK });
    box(g, { w: 53.6, h: 1.0, d: 0.08, x: 3, y: B, z: 33.5, mat: M.glassWhite });
    box(g, { w: 53.6, h: 0.1, d: 0.14, x: 3, y: B + 1.0, z: 33.5, mat: M.aluminum });

    // ── Marina (골든블루마리나) pontoon with a few moored boats south-east of 채빛섬 ──────────
    walkway(g, { from: [34, 4.7], to: [34, 13.6], w: 2.0 });
    box(g, { w: 12, h: 3.2, d: 2.2, x: 37, y: -2.7, z: 14.5, mat: HULL });
    box(g, { w: 11.8, h: 0.2, d: 2.0, x: 37, y: 0.5, z: 14.5, mat: WOOD });
    [33.5, 37, 40.5].forEach((x) => {
      sphere(g, { r: 1, x, y: -2.9, z: 17.6, sx: 1.1, sy: 0.65, sz: 3.0, seg: 12, mat: M.white });
      box(g, { w: 1.4, h: 1.0, d: 2.6, x, y: -1.7, z: 17.4, mat: M.glassWhite });
    });

    return g;
  },
};
