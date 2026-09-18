// 갤러리아 명품관 WEST (Galleria Department Store West, UNStudio 2004) - 강남구
// Apgujeong corner box (~10 storeys, 30 m). UNStudio hung 4,330 dichroic glass discs (850 mm)
// on the existing concrete; here the discs are scaled up and hex-packed so the pixel facade
// still reads from the air. Dark shopfront under the disc field; two street faces (south / west)
// are the ones seen from 압구정로.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, slab, seededRandom, subgroup, trianglesToGeometry } from "./_helpers.mjs";

const BODY = material(0x1a1c20, { roughness: 0.75 });
const DISC_MATS = [
  material(0xe8e4dc, { roughness: 0.24, metalness: 0.46, emissive: 0x2a2820, emissiveIntensity: 0.14 }),
  material(0xd4b86a, { roughness: 0.22, metalness: 0.5, emissive: 0x3a2a10, emissiveIntensity: 0.18 }),
  material(0xc5d4e8, { roughness: 0.2, metalness: 0.48, emissive: 0x1a2838, emissiveIntensity: 0.16 }),
  material(0xe8c8c0, { roughness: 0.26, metalness: 0.4, emissive: 0x3a2020, emissiveIntensity: 0.12 }),
];

/** Short octagonal coin in the local xy plane, facing +z. */
function pushCoin(tris, cx, cy, cz, r, depth, seg = 8) {
  for (let i = 0; i < seg; i += 1) {
    const a0 = (i / seg) * Math.PI * 2;
    const a1 = ((i + 1) / seg) * Math.PI * 2;
    const x0 = cx + Math.cos(a0) * r;
    const y0 = cy + Math.sin(a0) * r;
    const x1 = cx + Math.cos(a1) * r;
    const y1 = cy + Math.sin(a1) * r;
    const z1 = cz + depth;
    tris.push([cx, cy, z1], [x0, y0, z1], [x1, y1, z1]);
    tris.push([cx, cy, cz], [x1, y1, cz], [x0, y0, cz]);
    tris.push([x0, y0, cz], [x1, y1, cz], [x1, y1, z1]);
    tris.push([x0, y0, cz], [x1, y1, z1], [x0, y0, z1]);
  }
}

/** Hex-packed disc field on a wall of width `w` and height `h`, local +z outward. */
function discWall(parent, { w, h, x, y, z, ry = 0, cols, rows, seed }) {
  const s = subgroup(parent, { x, y: 0, z, ry });
  const buckets = DISC_MATS.map(() => []);
  const rng = seededRandom(seed);
  const dx = w / cols;
  const dy = h / rows;
  const radius = Math.min(dx, dy) * 0.54;
  for (let j = 0; j < rows; j += 1) {
    const odd = j % 2;
    const n = cols - (odd ? 1 : 0);
    for (let i = 0; i < n; i += 1) {
      const px = -w / 2 + (i + 0.5 + odd * 0.5) * dx;
      const py = y + (j + 0.5) * dy;
      pushCoin(buckets[Math.floor(rng() * DISC_MATS.length)], px, py, 0, radius, 0.32, 8);
    }
  }
  buckets.forEach((tris, i) => {
    if (tris.length) s.add(new THREE.Mesh(trianglesToGeometry(tris), DISC_MATS[i]));
  });
}

export default {
  id: "galleria-west",
  name: "갤러리아 명품관 WEST",
  nameEn: "Galleria Department Store West",
  district: "강남구",
  lat: 37.5277,
  lon: 127.0398,
  height: 30,
  colliderRadius: 30,
  detail: "medium",
  description: "4,330개 유리 디스크 파사드",
  create() {
    const g = new THREE.Group();
    const W = 40;
    const D = 26;
    const SHOP = 4.4;
    const DISC_H = 23.2;
    const ROOF = SHOP + DISC_H;

    slab(g, { w: W + 6, d: D + 6, h: 0.5, mat: M.graniteDark });
    box(g, { w: W, h: ROOF, d: D, y: 0.5, mat: BODY });
    // Ground-floor shopfronts on the two street faces.
    box(g, { w: W - 2, h: 3.6, d: 0.45, y: 0.7, z: D / 2 + 0.1, mat: M.glassDark });
    box(g, { w: 0.45, h: 3.6, d: D - 2, x: -W / 2 - 0.1, y: 0.7, mat: M.glassDark });
    box(g, { w: W + 0.4, h: 0.45, d: D + 0.4, y: SHOP + 0.5, mat: M.steelDark });

    discWall(g, { w: W - 0.8, h: DISC_H, x: 0, y: SHOP + 0.5, z: D / 2 + 0.2, ry: 0, cols: 16, rows: 10, seed: 11 });
    discWall(g, { w: W - 0.8, h: DISC_H, x: 0, y: SHOP + 0.5, z: -D / 2 - 0.2, ry: Math.PI, cols: 16, rows: 10, seed: 23 });
    discWall(g, { w: D - 0.8, h: DISC_H, x: W / 2 + 0.2, y: SHOP + 0.5, z: 0, ry: -Math.PI / 2, cols: 10, rows: 10, seed: 37 });
    discWall(g, { w: D - 0.8, h: DISC_H, x: -W / 2 - 0.2, y: SHOP + 0.5, z: 0, ry: Math.PI / 2, cols: 10, rows: 10, seed: 53 });

    box(g, { w: W + 0.6, h: 0.7, d: D + 0.6, y: ROOF + 0.5, mat: M.aluminum });
    box(g, { w: W * 0.42, h: 1.3, d: D * 0.4, y: ROOF + 1.2, mat: M.steelDark });

    return g;
  },
};
