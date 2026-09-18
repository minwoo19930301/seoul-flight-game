// 흥인지문 (Heunginjimun Gate, Dongdaemun, 1869) - 종로구
// The east gate of the Seoul fortress wall, today on a traffic island. A granite base with a single
// arched passage - the gate faces east, so the passage runs east-west and the long side of the base
// runs north-south - carries a two-storey wooden pavilion (5칸 × 2칸) under a 우진각 hip roof, with a
// crenellated parapet (여장) around the base. The semicircular 옹성 (barbican) wrapping the east side
// and opening at its north end is unique among Seoul's gates and is the feature people recognise.
// Short stubs of the city wall attach to the north and south ends of the base; the island is a lawn
// with a paved kerb and a few trees (no roads are modelled).
import * as THREE from "../vendor/three.module.js";
import { M, material, box, cyl, prism, hanokHall, gableRoof, archBlock, tree } from "./_helpers.mjs";

const paving = material(0xcac4b9, { roughness: 0.95 });
const pine = material(0x2f6b3a, { roughness: 1 });

/** Closed ellipse outline as [[x, z], ...]. */
function ellipse(rx, rz, n = 40) {
  const points = [];
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    points.push([Math.cos(a) * rx, Math.sin(a) * rz]);
  }
  return points;
}

/** Annulus sector outline between radii `rIn`/`rOut` from angle `a0` to `a1` (z grows south). */
function arcBand(cx, cz, rIn, rOut, a0, a1, n = 26) {
  const points = [];
  for (let i = 0; i <= n; i += 1) {
    const a = a0 + ((a1 - a0) * i) / n;
    points.push([cx + Math.cos(a) * rOut, cz + Math.sin(a) * rOut]);
  }
  for (let i = n; i >= 0; i -= 1) {
    const a = a0 + ((a1 - a0) * i) / n;
    points.push([cx + Math.cos(a) * rIn, cz + Math.sin(a) * rIn]);
  }
  return points;
}

export default {
  id: "heunginjimun",
  name: "흥인지문",
  nameEn: "Heunginjimun Gate (Dongdaemun)",
  district: "종로구",
  lat: 37.5711,
  lon: 127.0096,
  height: 23,
  colliderRadius: 25,
  detail: "medium",
  description: "옹성이 둘러싼 2층 문루의 동대문",
  create() {
    const g = new THREE.Group();

    // ── Traffic island: paved kerb, lawn, stone apron under the gate and inside the 옹성 ─────
    const G = 0.35; // top of the stone apron (ground level of the gate)
    prism(g, { points: ellipse(24.5, 20), h: 0.25, mat: paving });
    prism(g, { points: ellipse(22.8, 18.3), h: 0.3, mat: M.grass });
    box(g, { w: 15.5, h: G, d: 31, mat: paving });
    cyl(g, { rTop: 12.6, h: G, x: 6.5, mat: paving, seg: 28 });

    // ── Granite base (석축) with the E-W arched passage (홍예) ─────────────────────────────
    const baseH = 7;
    const BW = 28; // north-south
    const BD = 13; // east-west
    archBlock(g, { w: BW, h: baseH, d: BD, archW: 5.4, archH: 6, y: G, mat: M.granite, ry: Math.PI / 2 });
    // stone course lines on the four faces (split around the arch on the east/west faces)
    for (let i = 1; i < 5; i += 1) {
      const y = G + i * 1.4;
      [-1, 1].forEach((s) => {
        box(g, { w: 0.2, h: 0.16, d: 11.4, x: s * BD / 2, y, z: 8.3, mat: M.graniteDark });
        box(g, { w: 0.2, h: 0.16, d: 11.4, x: s * BD / 2, y, z: -8.3, mat: M.graniteDark });
        box(g, { w: BD + 0.2, h: 0.16, d: 0.2, y, z: s * BW / 2, mat: M.graniteDark });
      });
    }
    // Parapet (여장) with merlons along the edge of the base
    const py = G + baseH;
    [-1, 1].forEach((s) => {
      box(g, { w: 0.5, h: 0.7, d: BW, x: s * (BD / 2 - 0.25), y: py, mat: M.granite });
      box(g, { w: BD, h: 0.7, d: 0.5, y: py, z: s * (BW / 2 - 0.25), mat: M.granite });
      for (let i = 0; i < 12; i += 1) {
        box(g, { w: 0.5, h: 0.8, d: 1.2, x: s * (BD / 2 - 0.25), y: py + 0.7, z: -12.65 + i * 2.3, mat: M.granite });
      }
      for (let i = 0; i < 5; i += 1) {
        box(g, { w: 1.2, h: 0.8, d: 0.5, x: -4.8 + i * 2.4, y: py + 0.7, z: s * (BW / 2 - 0.25), mat: M.granite });
      }
    });

    // ── City-wall stubs (성곽) at the north and south ends of the base ───────────────────
    [-1, 1].forEach((s) => {
      box(g, { w: 7, h: 5.6, d: 7, y: G, z: s * 17.5, mat: M.graniteDark });
      box(g, { w: 7.4, h: 0.9, d: 7.4, y: G + 5.6, z: s * 17.5, mat: M.granite });
      gableRoof(g, { w: 7.4, d: 1.4, h: 0.6, x: 2.9, y: G + 6.5, z: s * 17.5, overhang: 0.2, ry: Math.PI / 2 });
      gableRoof(g, { w: 7.4, d: 1.4, h: 0.6, x: -2.9, y: G + 6.5, z: s * 17.5, overhang: 0.2, ry: Math.PI / 2 });
    });

    // ── 옹성: semicircular barbican east of the gate, opening at the north end ─────────────
    const OC = { x: 6.5, z: 0 };
    const R_IN = 12.2;
    const R_OUT = 14.8;
    const A0 = -Math.PI * 0.34; // north end (leaves the entrance gap towards the base)
    const A1 = Math.PI / 2; // south end, meeting the base's east face
    const wallH = 5.4;
    prism(g, { points: arcBand(OC.x, OC.z, R_IN - 0.25, R_OUT + 0.25, A0, A1), h: 0.6, y: G, mat: M.graniteDark });
    prism(g, { points: arcBand(OC.x, OC.z, R_IN, R_OUT, A0, A1), h: wallH, y: G, mat: M.granite });
    // parapet (여장) on the outer edge of the walkway with merlons
    prism(g, { points: arcBand(OC.x, OC.z, R_OUT - 0.9, R_OUT, A0, A1), h: 0.7, y: G + wallH, mat: M.granite });
    const rMid = R_OUT - 0.45;
    const merlons = 16;
    for (let i = 0; i <= merlons; i += 1) {
      const a = A0 + 0.03 + ((A1 - A0 - 0.06) * i) / merlons;
      box(g, {
        w: 1.3, h: 0.8, d: 0.9,
        x: OC.x + Math.cos(a) * rMid, y: G + wallH + 0.7, z: OC.z + Math.sin(a) * rMid,
        mat: M.granite, ry: -(a + Math.PI / 2),
      });
    }
    // squared-off end block at the north end of the 옹성
    const ex = OC.x + Math.cos(A0) * (R_IN + R_OUT) / 2;
    const ez = OC.z + Math.sin(A0) * (R_IN + R_OUT) / 2;
    box(g, { w: 1.2, h: wallH + 0.7, d: R_OUT - R_IN + 0.3, x: ex, y: G, z: ez, mat: M.granite, ry: -(A0 + Math.PI / 2) });

    // ── Two-storey pavilion (문루), long side north-south ─────────────────────────────────
    const PW = 22; // along z
    const PD = 9; // along x
    hanokHall(g, {
      w: PW, d: PD, y: py, ry: Math.PI / 2,
      platform: false, platformH: 0, wallH: 3.8, roofH: 4.2, overhang: 2.8, stories: 2, upperScale: 0.9,
      columns: false,
    });
    // 5-bay column grid on both storeys (6 columns per long face, one at each short face centre)
    const cols = (halfW, halfD, y, h, r) => {
      for (let i = 0; i <= 5; i += 1) {
        const pz = -halfW + (halfW * 2 / 5) * i;
        cyl(g, { rTop: r, h, x: halfD, y, z: pz, mat: M.hanokWood, seg: 8 });
        cyl(g, { rTop: r, h, x: -halfD, y, z: pz, mat: M.hanokWood, seg: 8 });
      }
      cyl(g, { rTop: r, h, x: 0, y, z: halfW, mat: M.hanokWood, seg: 8 });
      cyl(g, { rTop: r, h, x: 0, y, z: -halfW, mat: M.hanokWood, seg: 8 });
    };
    cols(PW / 2, PD / 2, py, 3.8, 0.5);
    const y2 = py + 3.8 + 1.1 + 4.2 * 0.55;
    cols((PW * 0.9) / 2, (PD * 0.9) / 2, y2, 3.8 * 0.8, 0.42);

    // ── Trees on the island ──────────────────────────────────────────────────────────────
    [
      [-16, 9, 8, 2.8], [-17.5, -7.5, 7, 2.5], [-9, 15.5, 6.5, 2.3], [17, 13, 7.5, 2.6],
      [16.5, -14, 6.5, 2.3], [-12, -14.5, 7, 2.4], [8, -17.5, 6, 2.1],
    ].forEach(([x, z, h, r]) => tree(g, { x, y: 0.3, z, h, r, mat: pine }));

    return g;
  },
};
