// 종로타워 (Jongno Tower, Rafael Viñoly 1999) - 종로구
// Reference model for modern towers: a dark-glass office body (≈23 floors), an open void,
// three slender steel legs, and the elliptical "Top Cloud" ring floating at the top (33F, 132 m).
import * as THREE from "../vendor/three.module.js";
import { M, box, cyl, prism, floorBands, strut, polar } from "./_helpers.mjs";

export default {
  id: "jongno-tower",
  name: "종로타워",
  nameEn: "Jongno Tower",
  district: "종로구",
  lat: 37.5707,
  lon: 126.9836,
  height: 132,
  colliderRadius: 30,
  detail: "high",
  description: "상부가 떠 있는 탑클라우드 링 구조의 33층 오피스",
  create() {
    const g = new THREE.Group();

    // Plaza plinth
    box(g, { w: 48, h: 0.8, d: 36, mat: M.granite });

    // Main body: two glass volumes joined by a taller central atrium slab.
    const bodyH = 92;
    box(g, { w: 44, h: bodyH, d: 30, y: 0.8, mat: M.glassDark });
    floorBands(g, { w: 44, d: 30, h: bodyH, y: 0.8, floorHeight: 4, mat: M.steelDark, inset: -0.1, thickness: 0.4 });
    // Curved (bowed) north-facing bay - a half-cylinder pressed against the body.
    const bay = cyl(g, { rTop: 8, h: bodyH, y: 0.8, z: -15, mat: M.glass, seg: 24, sx: 1.6, sz: 0.5 });
    bay.position.z = -15;
    // Side service cores clad in stone.
    box(g, { w: 6, h: bodyH + 6, d: 12, x: -25, y: 0.8, mat: M.limestone });
    box(g, { w: 6, h: bodyH + 6, d: 12, x: 25, y: 0.8, mat: M.limestone });

    // Three steel legs rising through the void.
    const legBase = 0.8 + bodyH;
    const cloudBase = 118;
    const legs = [[-19, -10], [19, -10], [0, 12]];
    legs.forEach(([x, z]) => {
      cyl(g, { rTop: 1.6, rBot: 2.1, h: cloudBase - legBase, x, y: legBase, z, mat: M.steel, seg: 12 });
      // Small diagonal braces near the top
      strut(g, { from: [x, cloudBase - 6, z], to: [x * 0.6, cloudBase + 1, z * 0.6], r: 0.45, mat: M.steel });
    });

    // Top Cloud: elliptical ring with a hollow centre.
    const outer = [];
    const inner = [];
    for (let i = 0; i < 48; i += 1) {
      const { x, z } = polar(i, 48, 1);
      outer.push([x * 29.5, z * 18.5]);
      inner.push([x * 17, z * 8.5]);
    }
    const cloudH = 11;
    prism(g, { points: outer, holes: [inner.slice().reverse()], h: cloudH, y: cloudBase, mat: M.glass });
    // Floor bands and a light steel frame around the cloud
    for (let i = 0; i <= 3; i += 1) {
      prism(g, { points: outer.map(([x, z]) => [x * 1.01, z * 1.01]), holes: [inner.slice().reverse()], h: 0.35, y: cloudBase + i * (cloudH / 3) - 0.1, mat: M.steel });
    }
    // Roof truss: radial spokes over the ring
    for (let i = 0; i < 12; i += 1) {
      const { x, z } = polar(i, 12, 1);
      strut(g, { from: [x * 17, cloudBase + cloudH + 0.5, z * 8.5], to: [x * 29.5, cloudBase + cloudH + 1.8, z * 18.5], r: 0.35, mat: M.steel });
    }
    // Central mast reaching 132 m
    cyl(g, { rTop: 0.4, rBot: 0.8, h: 132 - (cloudBase + cloudH), x: 0, y: cloudBase + cloudH, z: 0, mat: M.steel, seg: 8 });
    strut(g, { from: [-17, cloudBase + cloudH, 0], to: [17, cloudBase + cloudH, 0], r: 0.5, mat: M.steel });

    return g;
  },
};
