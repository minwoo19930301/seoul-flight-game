// 교보타워 (Kyobo Tower, Mario Botta 1999–2003) - 서초구
// Two red-terracotta slabs facing east onto 강남대로, split by a glass slot / atrium, with
// Botta's striped columns in the staggered base cut, a glass bridge at the crown and glazed
// lantern roofs on the north and south tops. Colour + twin-slab form is the signature.
// 25F, 118 m. Plan scaled to sit inside colliderRadius 30.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, floorBands } from "./_helpers.mjs";

const brick = material(0xb24a30, { roughness: 0.88 });
const brickDark = material(0x8a3824, { roughness: 0.9 });
const brickDeep = material(0x6e2c1c, { roughness: 0.9 });

/** Round column with Botta's white / charcoal horizontal stripes. */
function stripedCol(g, { x, z, h, y = 0, r = 0.55 }) {
  const band = 0.55;
  const n = Math.max(4, Math.round(h / band));
  for (let i = 0; i < n; i += 1) {
    const bh = i === n - 1 ? h - i * band : band;
    cyl(g, {
      rTop: r, h: bh, x, y: y + i * band, z,
      mat: i % 2 === 0 ? M.white : M.concreteDark,
      seg: 10,
    });
  }
}

export default {
  id: "kyobo-tower",
  name: "교보타워",
  nameEn: "Kyobo Tower (Gangnam)",
  district: "서초구",
  lat: 37.5038,
  lon: 127.0241,
  height: 118,
  colliderRadius: 30,
  detail: "medium",
  description: "마리오 보타의 붉은 테라코타 트윈 매스",
  create() {
    const g = new THREE.Group();

    const W = 21; // E–W depth of each slab
    const D = 13.2; // N–S thickness
    const GAP = 7; // glass slot between the twins (real ≈ 18 m, scaled)
    const CZ = GAP / 2 + D / 2; // ± slab centres
    const BODY = 108;
    const CUT = 14; // height of the staggered east entrance cut

    // ── Sidewalk / plaza on 강남대로 (east / +x) ──
    box(g, { w: 28, h: 0.35, d: 42, x: 2, y: 0, mat: M.granite });
    box(g, { w: 10, h: 0.12, d: 40, x: 16, y: 0.35, mat: M.asphalt });

    // ── Twin terracotta masses (upper full slab + lower mass stepped back from the east) ──
    const slab = (z) => {
      const lowW = W - 5.2;
      const lowX = -2.6;
      box(g, { w: W, h: BODY - CUT, d: D, y: CUT, z, mat: brick });
      box(g, { w: lowW, h: CUT, d: D, x: lowX, y: 0, z, mat: brick });
      floorBands(g, { w: W, d: D, h: BODY - CUT, y: CUT, z, floorHeight: 4.5, mat: brickDark, inset: -0.1, thickness: 0.28 });
      floorBands(g, { w: W, d: D, h: BODY - CUT, y: CUT, z, floorHeight: 9, mat: brickDeep, inset: -0.16, thickness: 0.18 });
      floorBands(g, { w: lowW, d: D, h: CUT, x: lowX, z, floorHeight: 4.5, mat: brickDark, inset: -0.1, thickness: 0.28 });
      // east / west: brick screen — vertical glass slots on the Gangnam-daero and rear faces
      const slots = [-3.6, -1.2, 1.2, 3.6];
      slots.forEach((dz) => {
        box(g, { w: 0.22, h: BODY - CUT - 6, d: 1.35, x: W / 2 + 0.08, y: CUT + 2, z: z + dz, mat: M.glassDark });
        box(g, { w: 0.22, h: BODY - 8, d: 1.35, x: -W / 2 - 0.08, y: 6, z: z + dz, mat: M.glassDark });
      });
      // north / south: nearly blind brick, three thin slit windows
      const faceZ = z + Math.sign(z) * (D / 2 + 0.06);
      [28, 56, 84].forEach((y) => {
        box(g, { w: 4.2, h: 1.1, d: 0.2, y, z: faceZ, mat: M.glassDark });
      });
      box(g, { w: lowW + 0.2, h: 0.45, d: D + 0.3, x: lowX, y: CUT, z, mat: brickDark });
    };
    slab(-CZ);
    slab(CZ);

    // Glass heart / slot between the twins
    box(g, { w: W - 3, h: BODY, d: GAP - 0.4, x: -0.4, y: 0, z: 0, mat: M.glass });
    floorBands(g, { w: W - 3, d: GAP - 0.4, h: BODY, x: -0.4, floorHeight: 4.5, mat: M.steelDark, inset: -0.08, thickness: 0.22 });
    // brighter lobby glass in the slot
    box(g, { w: 0.35, h: 12.5, d: GAP - 0.6, x: W / 2 - 2.4, y: 0.3, mat: M.glassWhite });

    // Striped Botta columns in the east cut and the slot
    [-CZ, 0, CZ].forEach((z) => {
      stripedCol(g, { x: 7.4, z: z - 2.1, h: CUT - 0.2 });
      stripedCol(g, { x: 7.4, z: z + 2.1, h: CUT - 0.2 });
    });
    stripedCol(g, { x: 9.2, z: -2.4, h: CUT + 1.2, r: 0.62 });
    stripedCol(g, { x: 9.2, z: 2.4, h: CUT + 1.2, r: 0.62 });

    // East entrance canopy / stepped soffit
    box(g, { w: 6.5, h: 0.4, d: GAP + D, x: 9.6, y: CUT - 0.1, mat: brickDark });
    box(g, { w: 3.2, h: 0.35, d: 10, x: 12.4, y: 8.4, mat: M.steel });

    // ── Crown: 18 m glass bridge + glazed lanterns on each slab (top = 118) ──
    box(g, { w: 16, h: 5.2, d: GAP + 2.4, y: BODY, mat: M.glassWhite });
    box(g, { w: 16.6, h: 0.45, d: GAP + 3, y: BODY + 5.2, mat: M.steel });
    // lantern roofs (north / south terraces)
    [-CZ, CZ].forEach((z) => {
      box(g, { w: W - 3, h: 4.2, d: D - 2.4, y: BODY, z, mat: M.glass });
      // open steel frame over the terrace
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
        box(g, {
          w: 0.4, h: 5.6, d: 0.4,
          x: sx * ((W - 4) / 2), y: BODY + 4.2, z: z + sz * ((D - 3.2) / 2),
          mat: M.steel,
        });
      });
      box(g, { w: W - 3.2, h: 0.35, d: D - 2.2, y: 117.65, z, mat: M.steel }); // 118.0
    });
    // thin mast on the bridge
    cyl(g, { rTop: 0.12, h: 4.2, y: BODY + 5.6, mat: M.steel, seg: 6 });

    // west (rear) service strip
    box(g, { w: 3.2, h: 6, d: 8, x: -12.2, y: 0, mat: M.graniteDark });

    return g;
  },
};
