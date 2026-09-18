// 노량진수산시장 신시장 (Noryangjin Fish Market, SPACE GROUP 2009–2016) - 동작구
// Long white-and-blue wholesale shed on the south bank of the Han: a 6-storey body compressed to 22 m,
// glass curtain on the long street (south) face, blue spandrel bands, and a dolphin / wave roof of
// white metal ridges running the length of the hall. A glass entrance canopy and north loading deck
// sit on an asphalt apron. Footprint scaled to the 40 m collider; the roof peak is the declared height.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, slab, floorBands, mullions, trianglesToGeometry } from "./_helpers.mjs";

const whiteMetal = material(0xe8eef3, { roughness: 0.32, metalness: 0.42 });
const bluePanel = material(0x1f6fb5, { roughness: 0.4, metalness: 0.25 });
const paving = material(0x8a9096, { roughness: 0.95 });

/** Wave roof: sine ridges along x, extruded in z. Peak height `h` above `y`. */
function waveRoof(parent, { w, d, h, x = 0, y = 0, z = 0, crests = 3, mat = whiteMetal }) {
  const nx = crests * 8;
  const tris = [];
  const yAt = (i) => {
    const t = i / nx;
    return h * (0.22 + 0.78 * (0.5 + 0.5 * Math.sin(t * crests * Math.PI * 2 - Math.PI / 2)));
  };
  for (let i = 0; i < nx; i += 1) {
    const x0 = -w / 2 + (w * i) / nx;
    const x1 = -w / 2 + (w * (i + 1)) / nx;
    const y0 = yAt(i);
    const y1 = yAt(i + 1);
    const a = [x0, y0, d / 2];
    const b = [x1, y1, d / 2];
    const c = [x1, y1, -d / 2];
    const e = [x0, y0, -d / 2];
    tris.push(a, b, c, a, c, e);
  }
  const mesh = new THREE.Mesh(trianglesToGeometry(tris), mat);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

export default {
  id: "noryangjin-market",
  name: "노량진수산시장",
  nameEn: "Noryangjin Fish Market",
  district: "동작구",
  lat: 37.5147,
  lon: 126.9377,
  height: 22,
  colliderRadius: 40,
  detail: "low",
  description: "2016년 신축 수산시장 건물",
  create() {
    const g = new THREE.Group();

    const BW = 58;
    const BD = 24;
    const BH = 16.2;

    // Apron and a thin river-edge strip to the north.
    slab(g, { w: 66, d: 42, h: 0.2, y: -0.05, mat: M.asphalt });
    slab(g, { w: 58, d: 7, h: 0.18, y: 0.15, z: -17.5, mat: paving });
    box(g, { w: 56, h: 0.35, d: 2.6, y: -0.1, z: -19.6, mat: M.water });

    // Main shed: white body, blue mid-band, glass curtain on +z (street).
    box(g, { w: BW, h: BH, d: BD, y: 0.2, mat: M.white });
    box(g, { w: BW + 0.3, h: 2.4, d: BD + 0.3, y: 8.4, mat: bluePanel });
    box(g, { w: BW - 1.2, h: BH - 1.4, d: 0.35, y: 0.9, z: BD / 2 + 0.05, mat: M.glassBlue });
    box(g, { w: BW - 1.2, h: BH - 2.2, d: 0.28, y: 1.4, z: -BD / 2 - 0.04, mat: M.glass });
    floorBands(g, { w: BW, d: BD, h: BH, y: 0.2, floorHeight: 3.6, mat: M.aluminum, inset: -0.08, thickness: 0.28 });
    mullions(g, { w: BW - 2, d: BD + 0.15, h: BH - 1.2, y: 0.8, spacing: 5.2, mat: M.aluminum, thickness: 0.22 });

    // End walls: white with a vertical blue glass slot.
    [-1, 1].forEach((side) => {
      box(g, { w: 0.35, h: BH - 1, d: 8, x: side * (BW / 2 + 0.1), y: 1.2, mat: M.glassBlue });
      box(g, { w: 0.8, h: 1.1, d: BD + 0.6, x: side * (BW / 2), y: BH + 0.2, mat: M.aluminum });
    });

    // Street entrance canopy and blue signage bar.
    box(g, { w: 18, h: 0.35, d: 6, y: 6.4, z: BD / 2 + 3.2, mat: M.aluminum });
    [-8, 8].forEach((x) => cyl(g, { rTop: 0.18, h: 6.4, x, y: 0.2, z: BD / 2 + 4.4, mat: M.steel, seg: 6 }));
    box(g, { w: 14, h: 5.2, d: 3.2, y: 0.2, z: BD / 2 + 1.4, mat: M.glassWhite });
    box(g, { w: 16, h: 1.3, d: 0.4, y: 7.0, z: BD / 2 + 0.4, mat: bluePanel });

    // North loading deck (하역).
    box(g, { w: 40, h: 0.45, d: 5.5, y: 1.2, z: -BD / 2 - 2.4, mat: M.concrete });
    box(g, { w: 42, h: 0.25, d: 6, y: 5.4, z: -BD / 2 - 2.6, mat: M.aluminum });
    [-16, 0, 16].forEach((x) => {
      box(g, { w: 3.6, h: 3.4, d: 0.2, x, y: 1.6, z: -BD / 2 - 0.05, mat: M.black });
    });

    // Wave / dolphin roof — peaks at 22.
    waveRoof(g, { w: BW + 2.4, d: BD + 3.2, h: 5.55, y: 16.45, crests: 3, mat: whiteMetal });
    box(g, { w: BW + 2.6, h: 0.35, d: 0.45, y: 16.45, z: (BD + 3.2) / 2, mat: M.aluminum });
    box(g, { w: BW + 2.6, h: 0.35, d: 0.45, y: 16.45, z: -(BD + 3.2) / 2, mat: M.aluminum });
    // Roof-garden strip on one valley (5층 옥상정원).
    box(g, { w: 18, h: 0.3, d: 8, x: -8, y: 17.6, mat: M.grass });

    // A couple of street trees on the south apron.
    [-24, -16, 16, 24].forEach((x) => {
      cyl(g, { rTop: 0.16, rBot: 0.24, h: 2.4, x, y: 0.2, z: 18, mat: M.trunk, seg: 6 });
      cyl(g, { rTop: 1.5, rBot: 1.8, h: 2.6, x, y: 2.4, z: 18, mat: M.foliage, seg: 7 });
    });

    return g;
  },
};
