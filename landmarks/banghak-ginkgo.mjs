// 방학동 은행나무 (Banghak-dong Ginkgo Tree) - 도봉구
// A single 600-year-old ginkgo, 25 m tall with a ~23 m wide crown, next to 연산군묘 (a royal tomb mound).
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, sphere, slab, hanokWall, seededRandom } from "./_helpers.mjs";

const ginkgoLeaf = material(0xa9b83c, { roughness: 0.95 });
const ginkgoLeafDark = material(0x8a9a30, { roughness: 0.95 });

export default {
  id: "banghak-ginkgo",
  name: "방학동 은행나무",
  nameEn: "Banghak-dong Ginkgo Tree",
  district: "도봉구",
  lat: 37.6661,
  lon: 127.0246,
  height: 25,
  colliderRadius: 20,
  detail: "low",
  description: "수령 600년, 높이 25m 서울시 보호수",
  create() {
    const g = new THREE.Group();
    const rng = seededRandom(31);

    // Small paved enclosure with a low fence around the protected tree.
    slab(g, { w: 22, d: 22, h: 0.4, mat: M.granite });
    box(g, { w: 22, h: 1, d: 0.3, y: 0.4, z: 11, mat: M.hanokWood });
    box(g, { w: 22, h: 1, d: 0.3, y: 0.4, z: -11, mat: M.hanokWood });
    box(g, { w: 0.3, h: 1, d: 22, y: 0.4, x: 11, mat: M.hanokWood });
    box(g, { w: 0.3, h: 1, d: 22, y: 0.4, x: -11, mat: M.hanokWood });

    // Massive trunk (≈3.5 m diameter) splitting into main limbs.
    cyl(g, { rTop: 1.4, rBot: 2, h: 7, y: 0.4, mat: M.trunk, seg: 10 });
    [[-1.2, 0, 0.35], [1.1, 0.4, -0.3], [0.2, -1.1, 0.1], [0.4, 1.2, -0.2]].forEach(([dx, dz, lean]) => {
      const limb = cyl(g, { rTop: 0.45, rBot: 0.9, h: 8, x: dx * 1.2, y: 6.5, z: dz * 1.2, mat: M.trunk, seg: 8 });
      limb.rotation.z = -lean * 0.6;
      limb.rotation.x = dz * 0.35;
    });

    // Rounded crown made of overlapping leaf blobs (yellow-green ginkgo foliage).
    const blobs = [
      [0, 15, 0, 7.5], [-5.5, 13, 2, 5.2], [5.5, 13.5, -2, 5.4], [1, 13, 5.5, 5], [-1.5, 12.5, -5.5, 5.2],
      [-4, 18.5, -3, 4.4], [4, 18.5, 3, 4.6], [0, 21, 0, 4],
    ];
    blobs.forEach(([x, y, z, r], index) => {
      sphere(g, { r, x, y: y - r, z, mat: index % 3 === 0 ? ginkgoLeafDark : ginkgoLeaf, seg: 12, sy: 0.9 + rng() * 0.15 });
    });

    // 연산군묘 next door: a grass burial mound on a terrace with a low stone wall and a tombstone.
    slab(g, { w: 14, d: 12, h: 1.2, x: 0, z: 0, mat: M.grassDark });
    const tomb = new THREE.Group();
    tomb.position.set(-3, 0, -26);
    g.add(tomb);
    slab(tomb, { w: 16, d: 14, h: 1.4, mat: M.grassDark });
    sphere(tomb, { r: 4.2, y: 1.4, mat: M.grass, seg: 14, sy: 0.55 });
    box(tomb, { w: 1.2, h: 2.2, d: 0.5, y: 1.4, z: 5.2, mat: M.graniteDark });
    hanokWall(tomb, { length: 16, y: 1.4, z: -7.2, h: 1.6 });
    tomb.position.set(-3, 0, -18);
    tomb.scale.set(0.7, 0.7, 0.7);

    return g;
  },
};
