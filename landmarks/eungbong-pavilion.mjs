// 응봉산 팔각정 (Eungbongsan Octagonal Pavilion) - 성동구
// Octagonal two-tier-roof pavilion on the rocky summit of 응봉산, famous for its forsythia (개나리) bloom.
import * as THREE from "../vendor/three.module.js";
import { M, material, cyl, polygonPrism, slab, cone, sphere, seededRandom } from "./_helpers.mjs";

const forsythia = material(0xe8c83a, { roughness: 0.95 });

export default {
  id: "eungbong-pavilion",
  name: "응봉산 팔각정",
  nameEn: "Eungbongsan Octagonal Pavilion",
  district: "성동구",
  lat: 37.5479,
  lon: 127.0299,
  height: 13,
  colliderRadius: 16,
  detail: "low",
  description: "개나리 명소 응봉산 정상의 팔각정",
  create() {
    const g = new THREE.Group();
    const rng = seededRandom(9);

    // Rocky summit platform with a paved deck.
    polygonPrism(g, { sides: 8, r: 15, h: 1.6, mat: M.rock });
    polygonPrism(g, { sides: 8, r: 9, h: 0.6, y: 1.6, mat: M.granite });

    // Pavilion: 8 red columns, open floor, lower skirt roof, upper roof, finial.
    for (let i = 0; i < 8; i += 1) {
      const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
      cyl(g, { rTop: 0.28, h: 4.2, x: Math.cos(angle) * 4.4, y: 2.2, z: Math.sin(angle) * 4.4, mat: M.hanokWood, seg: 8 });
    }
    polygonPrism(g, { sides: 8, r: 4.9, h: 0.5, y: 2.2, mat: M.hanokWood });
    polygonPrism(g, { sides: 8, r: 5.2, h: 0.8, y: 6.4, mat: M.dancheong });
    // Lower roof: an octagonal frustum skirt.
    cyl(g, { rTop: 3.3, rBot: 7.2, h: 2.2, y: 7.2, mat: M.roofTile, seg: 8, ry: Math.PI / 8 });
    // Upper storey (short) and top roof.
    polygonPrism(g, { sides: 8, r: 3, h: 1.4, y: 9.4, mat: M.hanokWall });
    cone(g, { r: 4.6, h: 2.2, y: 10.8, mat: M.roofTile, seg: 8, ry: Math.PI / 8 });
    cyl(g, { rTop: 0.15, rBot: 0.35, h: 0.8, y: 12.9, mat: M.gold, seg: 8 });

    // Forsythia bushes tumbling down the slope (yellow blobs) and a few pines.
    for (let i = 0; i < 26; i += 1) {
      const angle = rng() * Math.PI * 2;
      const radius = 9 + rng() * 5.5;
      sphere(g, { r: 1 + rng() * 0.9, x: Math.cos(angle) * radius, y: 0.6, z: Math.sin(angle) * radius, mat: forsythia, seg: 7, sy: 0.7 });
    }
    for (let i = 0; i < 5; i += 1) {
      const angle = rng() * Math.PI * 2;
      const radius = 11 + rng() * 3;
      cyl(g, { rTop: 0.15, rBot: 0.3, h: 3, x: Math.cos(angle) * radius, y: 1.2, z: Math.sin(angle) * radius, mat: M.trunk, seg: 6 });
      cone(g, { r: 1.6, h: 3.8, x: Math.cos(angle) * radius, y: 3.4, z: Math.sin(angle) * radius, mat: M.foliage, seg: 8 });
    }

    return g;
  },
};
