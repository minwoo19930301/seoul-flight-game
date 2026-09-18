// 독립문 (Dongnimmun, Independence Gate, 1897) - 서대문구
// A granite triumphal arch modelled on the Arc de Triomphe: 14.3 m tall, 11.5 m wide, single arch,
// with the two stone pillars of the former 영은문 standing in front.
import * as THREE from "../vendor/three.module.js";
import { M, box, archBlock, slab, cyl } from "./_helpers.mjs";

export default {
  id: "dongnimmun",
  name: "독립문",
  nameEn: "Dongnimmun (Independence Gate)",
  district: "서대문구",
  lat: 37.5744,
  lon: 126.9597,
  height: 15,
  colliderRadius: 12,
  detail: "medium",
  description: "1897년 화강석 개선문형 기념문",
  create() {
    const g = new THREE.Group();

    // Plaza and plinth.
    slab(g, { w: 22, d: 20, h: 0.3, mat: M.granite });
    box(g, { w: 13, h: 0.8, d: 6.4, y: 0.3, mat: M.graniteDark });

    // Main arch body (passage runs north-south).
    archBlock(g, { w: 11.5, h: 11.6, d: 5.6, archW: 4.4, archH: 7.6, y: 1.1, mat: M.granite });
    // Impost band and cornice courses.
    box(g, { w: 11.9, h: 0.5, d: 6, y: 7.9, mat: M.graniteDark });
    box(g, { w: 12.1, h: 0.7, d: 6.2, y: 11.9, mat: M.graniteDark });
    // Attic storey carrying the inscription and the taegukgi relief (suggested by a recessed panel).
    box(g, { w: 11.5, h: 2.1, d: 5.6, y: 12.6, mat: M.granite });
    box(g, { w: 5.6, h: 1.2, d: 0.2, y: 13, z: 2.9, mat: M.graniteDark });
    box(g, { w: 5.6, h: 1.2, d: 0.2, y: 13, z: -2.9, mat: M.graniteDark });
    // Parapet with corner posts.
    box(g, { w: 11.9, h: 0.6, d: 6, y: 14.7, mat: M.graniteDark });
    [[-5.4, 2.5], [5.4, 2.5], [-5.4, -2.5], [5.4, -2.5]].forEach(([x, z]) => {
      box(g, { w: 0.9, h: 0.9, d: 0.9, x, y: 15.3, z, mat: M.granite });
    });
    // Internal stair turret (the real gate has a stair inside the west pier) - suggested by a small roof box.
    box(g, { w: 2.4, h: 0.6, d: 2.4, x: -3.6, y: 15.3, mat: M.granite });

    // 영은문 주초: two stone pillar bases in front (south) of the gate.
    [-2.8, 2.8].forEach((x) => {
      box(g, { w: 1.6, h: 0.6, d: 1.6, x, y: 0.3, z: 7.5, mat: M.graniteDark });
      cyl(g, { rTop: 0.5, rBot: 0.6, h: 3.6, x, y: 0.9, z: 7.5, mat: M.granite, seg: 10 });
    });

    return g;
  },
};
