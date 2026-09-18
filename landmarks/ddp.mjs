// DDP 동대문디자인플라자 (Dongdaemun Design Plaza, Zaha Hadid 2014) - 중구
// One continuous silver aluminium-panel blob at ~0.35 plan scale with real heights (29 m): a
// single lofted "pebble" body whose roof undulates from the big Art Hall / Museum mass at the
// west over a low neck into the Design Lab, whose east end lifts off the ground as the famous
// cantilevered belly over the sunken 어울림광장 (north-east). 동대문역사문화공원 with the grass
// hill rolling onto the roof, 이간수문 water gate, fortress-wall remnants and the two preserved
// floodlight towers of the old Dongdaemun Stadium sits to the south-east.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, sphere, prism, tree, archBlock, subgroup, deg } from "./_helpers.mjs";

export default {
  id: "ddp",
  name: "DDP 동대문디자인플라자",
  nameEn: "Dongdaemun Design Plaza",
  district: "중구",
  lat: 37.5666,
  lon: 127.0099,
  height: 30,
  colliderRadius: 55,
  detail: "high",
  description: "자하 하디드의 유선형 알루미늄 패널 건축",
  create() {
    const g = new THREE.Group();

    // Materials
    const AL = material(0xbcc1c6, { metalness: 0.7, roughness: 0.38 }); // aluminium panels
    const PAVE = material(0xd7d9db, { roughness: 0.92 }); // light plaza paving
    const PAVE_LOW = material(0xaeb2b6, { roughness: 0.92 }); // sunken plaza floor / steps
    const PAVE_WALL = material(0xc4c7ca, { roughness: 0.9, side: THREE.DoubleSide });
    const LED = material(0x2a3742, { roughness: 0.5, emissive: 0x2a5a78, emissiveIntensity: 0.5 });
    const GLASS = material(0x4f6b82, { roughness: 0.2, metalness: 0.6, emissive: 0x16283a, emissiveIntensity: 0.35 }); // recessed glazing

    // The real long axis runs WSW -> ENE (station at the south-west, fashion district / 흥인지문
    // to the north-east); the whole site is turned 22° so the east end swings north-east.
    const ry = deg(22);
    const PAVING_TOP = 0.6;
    const site = subgroup(g, { ry });
    const b = subgroup(g, { y: PAVING_TOP, ry }); // everything that stands on the paving

    /** Floating lobe: ellipsoid with semi-axes sx, sy, sz whose centre is at height cy. */
    const blob = (parent, { x, z, cy, sx, sy, sz, mat = AL, seg = 40 }) => sphere(parent, { r: 1, x, y: cy - sy, z, sx, sy, sz, mat, seg });

    /**
     * Lofted pebble: a smooth closed cross-section (rounded belly, widest at 30 % of the section
     * height, flat-ish rounded top) swept along x. `keys` = [u, top, bottom, halfWidth, zCentre]
     * control points (u 0..1) blended with cosine easing; both ends taper elliptically to a
     * rounded nose at `tipWest` / `tipEast` height. Returns the mesh and a surface() sampler.
     */
    const loft = (parent, { x0, length, keys, taper = 0.2, tipWest = 9, tipEast = 14, yWide = 0.3, pBot = 2.2, pTop = 3, J = 18, N = 84, mat = AL }) => {
      const interp = (u, idx) => {
        let i = 0;
        while (i < keys.length - 2 && u > keys[i + 1][0]) i += 1;
        const t = Math.min(1, Math.max(0, (u - keys[i][0]) / (keys[i + 1][0] - keys[i][0])));
        const s = 0.5 - 0.5 * Math.cos(Math.PI * t);
        return keys[i][idx] + (keys[i + 1][idx] - keys[i][idx]) * s;
      };
      const ease = (u) => {
        const d = Math.abs(u - 0.5) - (0.5 - taper);
        return d <= 0 ? 1 : Math.sqrt(Math.max(0, 1 - (d / taper) ** 2));
      };
      const sectionShape = (phi) => {
        const r = Math.sin(phi);
        const v = phi <= Math.PI / 2
          ? yWide * (1 - Math.pow(1 - Math.pow(r, pBot), 1 / pBot))
          : yWide + (1 - yWide) * Math.pow(1 - Math.pow(r, pTop), 1 / pTop);
        return [r, v];
      };
      const half = [];
      for (let j = 0; j <= J; j += 1) half.push(sectionShape((j / J) * Math.PI));
      const loop = [...half, ...half.slice(1, -1).reverse().map(([r, v]) => [-r, v])];
      const K = loop.length;
      const section = (u) => {
        const f = ease(u);
        const tip = u < 0.5 ? tipWest : tipEast;
        return { x: x0 + length * u, top: tip + (interp(u, 1) - tip) * f, bottom: tip + (interp(u, 2) - tip) * f, w: interp(u, 3) * f, zc: interp(u, 4) };
      };
      const positions = [];
      for (let i = 0; i <= N; i += 1) {
        const s = section(0.5 - 0.5 * Math.cos((Math.PI * i) / N));
        loop.forEach(([r, v]) => positions.push(s.x, s.bottom + (s.top - s.bottom) * v, s.zc + s.w * r));
      }
      const index = [];
      for (let i = 0; i < N; i += 1) {
        for (let k = 0; k < K; k += 1) {
          const a = i * K + k;
          const b2 = i * K + ((k + 1) % K);
          const c = (i + 1) * K + k;
          const d = (i + 1) * K + ((k + 1) % K);
          index.push(a, c, d, a, d, b2);
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geometry.setIndex(index);
      geometry.computeVertexNormals();
      const mesh = new THREE.Mesh(geometry, mat);
      parent.add(mesh);
      /** Point on the skin at station u, section angle phi (0 = belly, π/2 = widest, π = ridge), side ±1 (+1 = south). */
      const surface = (u, phi, side) => {
        const s = section(u);
        const [r, v] = sectionShape(phi);
        return [s.x, s.bottom + (s.top - s.bottom) * v, s.zc + side * s.w * r];
      };
      return { mesh, surface };
    };
    /** Flat arc line on the paving (LED strips of 어울림광장). Angle 0 = east, positive = towards north. */
    const arcLine = (parent, { x, z, a, b: bb, start, length, w = 0.55, y = 0.05, mat = LED }) => {
      const mesh = new THREE.Mesh(new THREE.RingGeometry(1 - w / a, 1, 64, 1, start, length), mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(x, y, z);
      mesh.scale.set(a, bb, 1);
      parent.add(mesh);
      return mesh;
    };

    // ── Site: organic paving slab with the sunken plaza cut out of it ──────────────────────
    const siteRadius = (t) => 51.5 + 2.5 * Math.sin(2 * t + 0.9) + Math.sin(3 * t - 0.4); // 48..55
    const outline = [];
    for (let i = 0; i < 64; i += 1) {
      const t = (i / 64) * Math.PI * 2;
      outline.push([Math.cos(t) * siteRadius(t), Math.sin(t) * siteRadius(t)]);
    }
    const pit = { x: 26, z: -21, a: 11, b: 7, depth: 2 };
    const pitHole = [];
    for (let i = 0; i < 40; i += 1) {
      const t = (i / 40) * Math.PI * 2;
      pitHole.push([pit.x + Math.cos(t) * pit.a, pit.z + Math.sin(t) * pit.b]);
    }
    prism(site, { points: outline, holes: [pitHole.slice().reverse()], h: PAVING_TOP, mat: PAVE });

    // Sunken 어울림광장 (two levels below the street): floor, wall and a broad stair on its west side.
    cyl(b, { rTop: 1, h: 0.3, x: pit.x, y: -pit.depth - 0.3, z: pit.z, sx: pit.a, sz: pit.b, seg: 48, mat: PAVE_LOW });
    cyl(b, { rTop: 1, h: pit.depth, x: pit.x, y: -pit.depth, z: pit.z, sx: pit.a, sz: pit.b, seg: 48, open: true, mat: PAVE_WALL });
    for (let k = 0; k < 4; k += 1) {
      box(b, { w: 1.1, h: pit.depth - 0.4 * (k + 1), d: 6, x: pit.x - pit.a + 0.55 + k * 1.1, y: -pit.depth, z: pit.z, mat: PAVE_LOW });
    }

    // LED light lines flowing across the plaza (north side, around the Museum and the sunken plaza).
    [[33, 27], [37, 30.5], [41, 34]].forEach(([a, bb], i) => {
      arcLine(b, { x: -5, z: -3, a, b: bb, start: Math.PI * (0.3 - i * 0.02), length: Math.PI * (0.55 + i * 0.03) });
    });
    arcLine(b, { x: pit.x, z: pit.z, a: 15, b: 10, start: Math.PI * 0.2, length: Math.PI * 0.75 });
    arcLine(b, { x: pit.x, z: pit.z, a: 17, b: 12, start: Math.PI * 0.3, length: Math.PI * 0.65 });
    arcLine(b, { x: -30, z: 4, a: 18, b: 20, start: Math.PI * 1.05, length: Math.PI * 0.55 });

    // ── The building: one continuous silver skin ───────────────────────────────────────────
    // Main lofted body, x -51 .. 47. Roof: Art Hall 23 -> Museum 29.4 -> neck 16.5 -> Design Lab 22.
    // The underside stays buried (-2) up to the neck, then lifts to a hovering belly (cantilever)
    // over the sunken plaza while the centre line swings north.
    const body = loft(b, {
      x0: -51,
      length: 98,
      keys: [
        //  u    top   bottom  halfW  zCentre
        [0.0, 20, -2, 14, 3],
        [0.15, 23, -2, 17, 3],
        [0.38, 29.4, -2, 21, -1],
        [0.58, 20, -2, 17, -4],
        [0.68, 16.5, -2, 13, -6],
        [0.84, 22, 5.5, 15, -10],
        [1.0, 20, 8, 12, -13],
      ],
    });
    // Design Lab south wing (grounded plinth) carrying the hovering east end; the grass hill climbs it.
    blob(b, { x: 31, z: 4, cy: 8.5, sx: 15, sy: 10.5, sz: 12.5, seg: 48 });
    // Lower swelling volumes: south flank of the main body, north flank of the Art Hall,
    // the hovering north lobe of the Museum over the plaza (미래로 side).
    blob(b, { x: -16, z: 12, cy: 4.5, sx: 22, sy: 6.5, sz: 10 });
    blob(b, { x: -32, z: -12, cy: 4, sx: 13, sy: 5.5, sz: 8 });
    blob(b, { x: -4, z: -20, cy: 10.5, sx: 18, sy: 6, sz: 8 });

    // Glazing under the floating parts (entrances / DDP Market at the sunken plaza).
    cyl(b, { rTop: 1, h: 10, x: 34, y: -pit.depth, z: -12, sx: 10, sz: 9, seg: 40, mat: GLASS });
    cyl(b, { rTop: 1, h: 5, x: -4, y: 0, z: -19, sx: 13, sz: 5.5, seg: 40, mat: GLASS });
    cyl(b, { rTop: 1, h: 7, x: -44, y: 0, z: 3, sx: 6, sz: 10, seg: 32, mat: GLASS });
    // Dark glazing slits cut into the panels (Art Hall north-west, Museum south, Design Lab north).
    [[0.18, 2.05, -1, 7], [0.42, 2.0, 1, 9], [0.8, 2.05, -1, 8]].forEach(([u, phi, side, sx]) => {
      const [x, y, z] = body.surface(u, phi, side);
      blob(b, { x, z, cy: y, sx, sy: 0.8, sz: 0.9, mat: GLASS, seg: 16 });
    });

    // 미래로 (Miraero) bridge: a slender silver ribbon crossing the sunken plaza between the lobes.
    box(b, { w: 26, h: 1.3, d: 3.2, x: 12, y: 7.2, z: -24, mat: AL });
    box(b, { w: 26, h: 1, d: 0.25, x: 12, y: 8.5, z: -22.5, mat: M.glassWhite });
    box(b, { w: 26, h: 1, d: 0.25, x: 12, y: 8.5, z: -25.5, mat: M.glassWhite });

    // ── 동대문역사문화공원: lawn, grass hill onto the roof, 이간수문, fortress wall, light towers ──
    const park = [];
    for (let a = -5; a <= 78; a += 6) {
      const t = deg(a);
      park.push([Math.cos(t) * (siteRadius(t) - 1.2), Math.sin(t) * (siteRadius(t) - 1.2)]);
    }
    park.push([4, 40], [6, 32], [14, 28], [24, 25], [34, 20], [42, 14], [48, 6]);
    prism(b, { points: park, h: 0.3, mat: M.grass });
    // Grass hill (잔디언덕): a lawn ramp climbing from the park onto the Design Lab roof.
    box(b, { w: 12, h: 3, d: 26.8, x: 30, y: 3.8, z: 25.3, rx: 0.4636, mat: M.grass });
    blob(b, { x: 19, z: 28, cy: 0.4, sx: 5.5, sy: 3, sz: 10, mat: M.grassDark, seg: 20 });
    blob(b, { x: 40, z: 26, cy: 0.4, sx: 5.5, sy: 3, sz: 8, mat: M.grassDark, seg: 20 });
    blob(b, { x: 31, z: 8, cy: 17, sx: 9, sy: 2.4, sz: 8, mat: M.grass, seg: 24 }).rotation.x = 0.35; // lawn sloping onto the roof

    // 이간수문: two-arch stone water gate sitting in a dark stone channel.
    box(b, { w: 13, h: 0.15, d: 9, x: 14, y: 0.3, z: 38, mat: M.rock });
    archBlock(b, { w: 5.5, h: 3.4, d: 3, archW: 2.4, archH: 2.6, x: 11.25, y: 0.3, z: 38, mat: M.granite });
    archBlock(b, { w: 5.5, h: 3.4, d: 3, archW: 2.4, archH: 2.6, x: 16.75, y: 0.3, z: 38, mat: M.granite });
    box(b, { w: 11.6, h: 0.4, d: 3.4, x: 14, y: 3.7, z: 38, mat: M.graniteDark });
    // Fortress wall remnants (한양도성) along the east edge of the park.
    for (let a = -4; a <= 16; a += 5) {
      const t = deg(a);
      const x = Math.cos(t) * 45.5;
      const z = Math.sin(t) * 45.5;
      box(b, { w: 4.2, h: 3.2, d: 2.2, x, y: 0.3, z, ry: -t - Math.PI / 2, mat: M.graniteDark });
      box(b, { w: 4.4, h: 0.4, d: 2.5, x, y: 3.5, z, ry: -t - Math.PI / 2, mat: M.granite });
    }
    // Preserved floodlight towers of the old Dongdaemun Stadium.
    [[39, 20], [47.5, 8]].forEach(([x, z]) => {
      cyl(b, { rTop: 0.5, rBot: 1.3, h: 24, x, y: 0.3, z, seg: 6, mat: M.steelDark });
      box(b, { w: 5, h: 3.4, d: 0.9, x, y: 24.3, z, mat: M.steelDark });
      box(b, { w: 4.6, h: 2.6, d: 0.3, x, y: 24.7, z: z - 0.5, mat: M.glow });
    });
    // Trees
    [[4, 42, 8, 2.5], [8, 34, 7.5, 2.4], [22, 42, 8.5, 2.6], [10, 45, 7, 2.2], [27, 42, 7.5, 2.4], [44, 20, 8, 2.5], [17, 32, 6.5, 2.1], [50, 0, 7.5, 2.3]]
      .forEach(([x, z, h, r]) => tree(b, { x, z, y: 0.3, h, r }));

    return g;
  },
};
