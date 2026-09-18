// 세종문화회관 (Sejong Center, 엄덕문, 1978) - 종로구
// Performing-arts block on Sejong-daero, facing east toward Gwanghwamun. The signature is the
// granite 대극장: six stout 배흘림 columns carrying a heavy horizontal roof (a modern reading of
// a hanok eave), 완자문 lattice on the side walls, and the tall 비천상 relief panels. 세종M시어터
// sits to the north across a stepped 안뜰. Compressed to colliderRadius 34; height is real.
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, hipRoof, tree } from "./_helpers.mjs";

const lattice = material(0xb7b0a4, { roughness: 0.75, metalness: 0.08 });
const relief = material(0x8a7348, { roughness: 0.55, metalness: 0.35 });

export default {
  id: "sejong-center",
  name: "세종문화회관",
  nameEn: "Sejong Center",
  district: "종로구",
  lat: 37.5726,
  lon: 126.9756,
  height: 30,
  colliderRadius: 34,
  detail: "low",
  description: "열주가 늘어선 화강석 파사드의 공연장",
  create() {
    const g = new THREE.Group();
    const G = 0.15;

    box(g, { w: 58, h: 0.35, d: 62, y: -0.2, mat: M.asphalt });
    box(g, { w: 22, h: 0.16, d: 52, x: 16, y: G, z: 2, mat: M.granite });
    box(g, { w: 14, h: 0.2, d: 16, x: 2, y: G, z: -4, mat: M.graniteDark });

    // 대극장 — east-facing granite hall
    const BX = -7;
    const BZ = 8;
    const BW = 20;
    const BD = 30;
    const pod = 1.3;
    box(g, { w: BW + 2.4, h: pod, d: BD + 2.4, x: BX, z: BZ, mat: M.graniteDark });
    box(g, { w: BW, h: 21.4, d: BD, x: BX, y: pod, z: BZ, mat: M.granite });
    box(g, { w: BW - 3.2, h: 18, d: 0.4, x: BX + BW / 2 - 0.3, y: pod + 1.6, z: BZ, mat: M.glassDark });

    // Six 배흘림 columns on the east facade
    const faceX = BX + BW / 2 + 1.35;
    for (let i = 0; i < 6; i += 1) {
      const pz = BZ - 11.5 + i * 4.6;
      cyl(g, { rTop: 0.95, rBot: 1.22, h: 22.2, x: faceX, y: pod, z: pz, mat: M.granite, seg: 10 });
    }
    // 비천상 panels at the north and south ends of the colonnade
    [-1, 1].forEach((s) => {
      box(g, { w: 0.45, h: 11, d: 5.4, x: BX + BW / 2 + 0.15, y: pod + 3.2, z: BZ + s * 11.6, mat: relief });
    });

    // Heavy horizontal roof (modern 추녀) and a shallow granite hip cap
    box(g, { w: BW + 5.2, h: 0.7, d: BD + 5.6, x: BX + 0.6, y: 23.5, z: BZ, mat: M.graniteDark });
    box(g, { w: BW + 3.6, h: 2.2, d: BD + 3.8, x: BX + 0.4, y: 24.2, z: BZ, mat: M.granite });
    hipRoof(g, {
      w: BW + 1.2, d: BD + 1.4, h: 3.4, x: BX + 0.3, y: 26.4, z: BZ,
      overhang: 2.2, ridge: 0.62, curve: 0.18, mat: M.granite, ridgeMat: M.graniteDark,
    });

    // 완자문 lattice on the north and south granite flanks
    [-1, 1].forEach((s) => {
      for (let i = 0; i < 5; i += 1) {
        for (let j = 0; j < 4; j += 1) {
          box(g, {
            w: 1.6, h: 1.6, d: 0.12,
            x: BX - 2 + i * 2.4, y: pod + 4.2 + j * 3.2, z: BZ + s * (BD / 2 + 0.08),
            mat: lattice,
          });
        }
      }
    });

    // 세종M시어터 to the north, across the 안뜰
    const MX = -6;
    const MZ = -16;
    box(g, { w: 16, h: 1, d: 14, x: MX, z: MZ, mat: M.graniteDark });
    box(g, { w: 15, h: 14, d: 13, x: MX, y: 1, z: MZ, mat: M.granite });
    for (let i = 0; i < 4; i += 1) {
      cyl(g, { rTop: 0.55, rBot: 0.7, h: 12.5, x: MX + 8.2, y: 1, z: MZ - 4.2 + i * 2.8, mat: M.granite, seg: 8 });
    }
    box(g, { w: 17.4, h: 1.6, d: 15.2, x: MX, y: 15, z: MZ, mat: M.granite });
    hipRoof(g, { w: 15, d: 13, h: 2.4, x: MX, y: 16.6, z: MZ, overhang: 1.6, ridge: 0.6, curve: 0.14, mat: M.granite, ridgeMat: false });

    // East plaza steps toward Sejong-daero
    for (let i = 0; i < 5; i += 1) {
      box(g, { w: 2.2 - i * 0.15, h: pod - i * 0.22, d: 18, x: faceX + 2.2 + i * 1.1, z: BZ, mat: M.granite });
    }

    [[16, 24, 7], [18, -22, 6.5], [-22, 22, 6], [-20, -24, 6]].forEach(([x, z, h]) => {
      tree(g, { x, z, h, r: h * 0.3 });
    });

    return g;
  },
};
