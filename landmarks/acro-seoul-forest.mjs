// 아크로 서울포레스트 (Acro Seoul Forest, DL E&C 2020) - 성동구
// Two near-identical 49-floor residential towers (199.98 m) at the south-east corner of 서울숲, facing the
// 한강. Rounded-corner rectangular plans clad in warm champagne ceramic/metal panels with continuous vertical
// strips of bronze-tinted glass; thin panel floor lines cross the strips so the facade reads as the
// 432-Park-like grid of near-square "art frame" windows. Green balconies on the park side (2F-21F), a glazed
// community floor (29F 클라우드 클럽), and a two-tier stepped crown finished by a slender open frame and fin.
// Between and south of the towers sits the low glass 디뮤지엄 / 아크로 갤러리 block on a granite plaza; the
// 서울숲 edge (lawn + trees) runs along the north-west. Footprints ~0.6 of real, heights 1:1.
// (The 33F 디타워 office stands east of the residential site, outside this collider.)
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, prism, subgroup, tree, treePatch, deg } from "./_helpers.mjs";

const PANEL = material(0xcfc2a8, { metalness: 0.4, roughness: 0.5 });
const PANEL_LIGHT = material(0xdcd1bb, { metalness: 0.35, roughness: 0.55 });
const GLASS = M.glassDark;

const BASE = 0.8; // plaza deck
const LOBBY_H = 6.6; // double-height lobby (1F)
const FLOOR = 3.7; // 2F-49F
const FLOORS = 48;
const W = 28; // tower plan (real ~45 x 25 m)
const D = 16;
const R = 3.5; // corner radius

/** Rectangle `w × d` with rounded corners (radius `r`, `n` segments per corner), centred at (cx, cz). */
function roundedRect(w, d, r, n = 5, cx = 0, cz = 0) {
  const hw = w / 2 - r;
  const hd = d / 2 - r;
  const pts = [];
  [[hw, hd, 0], [-hw, hd, Math.PI / 2], [-hw, -hd, Math.PI], [hw, -hd, Math.PI * 1.5]].forEach(([ox, oz, a0]) => {
    for (let i = 0; i <= n; i += 1) {
      const a = a0 + (Math.PI / 2) * (i / n);
      pts.push([cx + ox + Math.cos(a) * r, cz + oz + Math.sin(a) * r]);
    }
  });
  return pts;
}

/** Vertical glass strips proud of the four flat faces of a rounded rectangle between y0 and y1. */
function glassStrips(g, { w, d, r, y0, y1, stripW = 2.1, mat = GLASS }) {
  const h = y1 - y0;
  const flatX = w - 2 * r;
  const flatZ = d - 2 * r;
  const nx = Math.max(1, Math.round(flatX / 3.5));
  const nz = Math.max(1, Math.round(flatZ / 3.5));
  for (let i = 0; i < nx; i += 1) {
    const px = (i - (nx - 1) / 2) * (flatX / nx);
    box(g, { w: stripW, h, d: 0.4, x: px, y: y0, z: d / 2, mat });
    box(g, { w: stripW, h, d: 0.4, x: px, y: y0, z: -d / 2, mat });
  }
  for (let i = 0; i < nz; i += 1) {
    const pz = (i - (nz - 1) / 2) * (flatZ / nz);
    box(g, { w: 0.4, h, d: stripW, x: w / 2, y: y0, z: pz, mat });
    box(g, { w: 0.4, h, d: stripW, x: -w / 2, y: y0, z: pz, mat });
  }
}

/** One residential tower (A동 / B동). Returns the top of the fin. */
function acroTower(parent, { x, z }) {
  const g = subgroup(parent, { x, z });
  const plan = roundedRect(W, D, R);
  const lobbyTop = BASE + LOBBY_H;
  const roofY = lobbyTop + FLOORS * FLOOR; // 185.0

  // Body and the fully glazed double-height lobby skirt.
  prism(g, { points: plan, h: roofY - BASE, y: BASE, mat: PANEL });
  prism(g, { points: roundedRect(W + 0.5, D + 0.5, R + 0.25), h: LOBBY_H - 0.6, y: BASE, mat: GLASS });
  prism(g, { points: roundedRect(W + 0.7, D + 0.7, R + 0.35), h: 0.6, y: lobbyTop - 0.6, mat: PANEL });

  // Continuous vertical glazing strips (proud 0.2) from 2F to the roof.
  glassStrips(g, { w: W, d: D, r: R, y0: lobbyTop, y1: roofY - 0.4 });

  // Thin panel floor lines crossing the strips -> the grid of near-square windows.
  for (let i = 1; i < FLOORS; i += 1) {
    const y = lobbyTop + i * FLOOR;
    prism(g, { points: roundedRect(W + 0.6, D + 0.6, R + 0.3), h: 0.28, y: y - 0.14, mat: PANEL });
  }

  // Green balconies 2F-21F on the park (north) side: projecting white ledges with a glass front.
  for (let i = 0; i < 20; i += 1) {
    const y = lobbyTop + i * FLOOR;
    box(g, { w: W - 2 * R + 1, h: 0.3, d: 1.5, y, z: -D / 2 - 0.75, mat: M.offWhite });
    box(g, { w: W - 2 * R + 1, h: 1.1, d: 0.15, y: y + 0.3, z: -D / 2 - 1.45, mat: M.glassWhite });
  }

  // Entrance canopy on the north (park) side.
  box(g, { w: 12, h: 0.4, d: 5, y: BASE + 5.2, z: -D / 2 - 2.8, mat: M.steel });
  [-4.5, 4.5].forEach((px) => cyl(g, { rTop: 0.25, h: 5.2, x: px, y: BASE, z: -D / 2 - 4.8, mat: M.steel, seg: 8 }));

  // Two-tier stepped crown: glazed mechanical tier with panel rims, then a smaller panel tier.
  const t1 = 4.5;
  const t2 = 4;
  prism(g, { points: roundedRect(W - 3, D - 3, R - 1), h: t1, y: roofY, mat: GLASS });
  prism(g, { points: roundedRect(W - 2.6, D - 2.6, R - 0.9), h: 0.5, y: roofY, mat: PANEL });
  prism(g, { points: roundedRect(W - 2.6, D - 2.6, R - 0.9), h: 0.5, y: roofY + t1 - 0.5, mat: PANEL });
  prism(g, { points: roundedRect(W - 6.5, D - 6.5, R - 2), h: t2, y: roofY + t1, mat: PANEL_LIGHT });
  box(g, { w: W - 8, h: 0.8, d: 1.2, y: roofY + t1 + 1.2, z: 0, mat: M.black }); // louvre slot
  box(g, { w: W - 8, h: 0.8, d: 1.2, y: roofY + t1 + 2.6, z: 0, mat: M.black });

  // Slender open frame: steel posts continuing the pier rhythm, tied by a top rail.
  const frameTop = 199;
  const fx = W / 2 - 1.6;
  const fz = D / 2 - 1.6;
  const posts = [[-fx, -fz], [fx, -fz], [-fx, fz], [fx, fz], [-fx / 3, -fz], [fx / 3, -fz], [-fx / 3, fz], [fx / 3, fz]];
  posts.forEach(([px, pz]) => box(g, { w: 0.45, h: frameTop - 0.5 - roofY, d: 0.45, x: px, y: roofY, z: pz, mat: M.steel }));
  box(g, { w: 2 * fx + 0.45, h: 0.5, d: 0.45, y: frameTop - 0.5, z: -fz, mat: M.steel });
  box(g, { w: 2 * fx + 0.45, h: 0.5, d: 0.45, y: frameTop - 0.5, z: fz, mat: M.steel });
  box(g, { w: 0.45, h: 0.5, d: 2 * fz, x: -fx, y: frameTop - 0.5, mat: M.steel });
  box(g, { w: 0.45, h: 0.5, d: 2 * fz, x: fx, y: frameTop - 0.5, mat: M.steel });
  // Central vertical fin - the tallest point (~200 m).
  const finTop = 199.9;
  box(g, { w: 0.5, h: finTop - (roofY + t1 + t2), d: 3.6, y: roofY + t1 + t2, mat: M.steel });
  return finTop;
}

export default {
  id: "acro-seoul-forest",
  name: "아크로 서울포레스트",
  nameEn: "Acro Seoul Forest",
  district: "성동구",
  lat: 37.5445,
  lon: 127.0437,
  height: 200,
  colliderRadius: 45,
  detail: "medium",
  description: "서울숲 옆 199m 트윈 주거 타워",
  create() {
    const g = new THREE.Group();
    // The block follows the river bank here (ENE-WSW); long faces look SSE to the 한강, NNW to 서울숲.
    const site = subgroup(g, { ry: deg(15) });

    // ── Granite plaza (chamfered so its corners stay inside the collider) ───────
    prism(site, {
      points: [[-32, -26], [32, -26], [42, -16], [42, 12], [32, 26], [-32, 26], [-42, 12], [-42, -16]],
      h: BASE,
      mat: M.granite,
    });
    // 공공보행통로: lighter paving between the towers running from the park to the river.
    box(site, { w: 8, h: 0.08, d: 50, y: BASE, z: 0, mat: M.marble });
    box(site, { w: 80, h: 0.08, d: 5, y: BASE, z: -12.5, mat: M.marble });

    // ── The two towers (A동 west, B동 east), slightly staggered ─────────────────
    acroTower(site, { x: -23, z: -2.5 });
    acroTower(site, { x: 23, z: 2.5 });

    // ── 디뮤지엄 / 아크로 갤러리: 4-storey glass culture block south of the towers ──
    {
      const x = 0;
      const z = 18;
      const w = 30;
      const d = 13;
      const h = 15.5;
      box(site, { w, h, d, x, y: BASE, z, mat: M.glassWhite });
      for (let i = 1; i <= 3; i += 1) {
        box(site, { w: w + 0.3, h: 0.5, d: d + 0.3, x, y: BASE + i * 3.8, z, mat: M.steel });
      }
      // Panel-clad end walls and a white roof edge echoing the towers' cladding.
      box(site, { w: 2.2, h: h + 0.6, d: d + 0.6, x: x - w / 2 + 0.6, y: BASE, z, mat: PANEL });
      box(site, { w: 2.2, h: h + 0.6, d: d + 0.6, x: x + w / 2 - 0.6, y: BASE, z, mat: PANEL });
      box(site, { w: w + 0.6, h: 0.7, d: d + 0.6, x, y: BASE + h, z, mat: M.white });
      // Sculptural entrance canopy towards the plaza.
      box(site, { w: 14, h: 0.5, d: 6, x, y: BASE + 5.5, z: z - d / 2 - 2.5, mat: M.steel });
      [-5, 5].forEach((px) => cyl(site, { rTop: 0.3, h: 5.5, x: x + px, y: BASE, z: z - d / 2 - 4.8, mat: M.steel, seg: 8 }));
      // Rooftop garden.
      box(site, { w: w - 8, h: 0.3, d: d - 4, x, y: BASE + h + 0.7, z, mat: M.grass });
    }

    // ── 서울숲 edge: lawn strip and dense trees along the north-west, lawns at both ends ──
    box(site, { w: 76, h: 0.3, d: 7, x: 0, y: BASE, z: -20.5, mat: M.grass });
    treePatch(site, { w: 68, d: 5, x: 0, y: BASE + 0.3, z: -20, count: 15, seed: 21, h: 9, r: 3 });
    box(site, { w: 6, h: 0.3, d: 24, x: -39, y: BASE, z: -4, mat: M.grass });
    treePatch(site, { w: 3, d: 20, x: -39, y: BASE + 0.3, z: -4, count: 5, seed: 5, h: 8.5, r: 2.8 });
    box(site, { w: 6, h: 0.3, d: 24, x: 39, y: BASE, z: 2, mat: M.grass });
    treePatch(site, { w: 3, d: 18, x: 39, y: BASE + 0.3, z: 2, count: 4, seed: 9, h: 8, r: 2.6 });
    // Plaza planting: small trees around the gallery and along the river-side edge.
    [[-24, 16], [-30, 20], [24, 16], [30, 20], [-12, 24], [12, 24]].forEach(([x, z], i) => {
      tree(site, { x, y: BASE, z, h: 6 + (i % 2), r: 2 });
    });

    return g;
  },
};
