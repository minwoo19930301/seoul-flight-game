import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { validateSceneContract, validateRasterDimensions } from '../scene-contract.mjs';

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url));
const json = file => JSON.parse(read(file));
const data = {
  map: json('assets/seoul-scene-data.json'),
  terrain: json('assets/terrain/elevation.json'),
  city: json('assets/city/manifest.json'),
  raster: json('assets/seoul-raster-map.metadata.json'),
  references: json('assets/landmarks/references.json'),
};

test('retained scene, DEM, city and raster share their real central-Seoul footprint', () => {
  const coverage = validateSceneContract(data);
  assert.equal(coverage.buildings, 69716);
  assert.equal(coverage.landmarks, 5);
  assert.ok(coverage.widthM > 16700 && coverage.widthM < 16800);
  assert.ok(coverage.depthM > 10000 && coverage.depthM < 10100);
});

for (const layer of ['terrain', 'city', 'raster']) {
  test(`reject a mismatched ${layer} bbox instead of stretching/clamping old data`, () => {
    const changed = layer === 'city'
      ? { ...data.city, projection: { ...data.city.projection,
        bbox: { ...data.map.bbox, minLon: 126.76 } } }
      : { ...data[layer], bbox: { ...data.map.bbox, minLon: 126.76 } };
    assert.throws(() => validateSceneContract({ ...data, [layer]: changed }), /좌표 범위/);
  });
}

test('changing only the map bbox cannot silently turn the city into all Seoul', () => {
  assert.throws(() => validateSceneContract({ ...data,
    map: { ...data.map, bbox: { minLon:126.76,maxLon:127.19,minLat:37.42,maxLat:37.71 } },
  }), /좌표 범위/);
});

test('reject inconsistent ground-metre dimensions and incompatible height datum offsets', () => {
  assert.throws(() => validateSceneContract({ ...data,
    terrain: { ...data.terrain, projectedWidthM:3200 },
  }), /미터 축척/);
  assert.throws(() => validateSceneContract({ ...data,
    terrain: { ...data.terrain, verticalOffsetM:100 },
  }), /고도 단위/);
});

test('reject missing terrain samples and invalid tile transforms', () => {
  assert.throws(() => validateSceneContract({ ...data,
    terrain: { ...data.terrain, elevations:[0] },
  }), /지형 표본/);
  const tiles = data.city.tiles.map((tile,index) => index ? tile : { ...tile, origin:[NaN,0,0] });
  assert.throws(() => validateSceneContract({ ...data, city:{ ...data.city, tiles } }), /원점/);
});

test('reject missing city tiles and out-of-coverage landmarks', () => {
  assert.throws(() => validateSceneContract({ ...data,
    city: { ...data.city, tiles:data.city.tiles.slice(1) },
  }), /타일 목록/);
  assert.throws(() => validateSceneContract({ ...data,
    references: { landmarks:[{ nameKo:'범위 밖',coordinate:{ lon:126.8,lat:37.6 } }] },
  }), /실제 지형 범위/);
});

test('raster provenance matches the retained PNG bytes and dimensions', () => {
  const bytes = read('assets/seoul-raster-map.png');
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), data.raster.sha256);
  assert.equal(bytes.readUInt32BE(16), data.raster.width);
  assert.equal(bytes.readUInt32BE(20), data.raster.height);
  validateRasterDimensions({ naturalWidth:data.raster.width,naturalHeight:data.raster.height },data.raster);
  assert.throws(() => validateRasterDimensions({ naturalWidth:256,naturalHeight:256 },data.raster), /이미지/);
  validateRasterDimensions(null,data.raster); // Missing image retains vector fallback.
});

test('city provenance still refers to the exact map and terrain payloads', () => {
  for (const [file, expected] of [
    ['assets/seoul-scene-data.json',data.city.source.sceneSha256],
    ['assets/terrain/elevation.json',data.city.source.terrainSha256],
  ]) assert.equal(crypto.createHash('sha256').update(read(file)).digest('hex'),expected);
});

test('runtime validates the combined dataset before creating the scene', () => {
  const source = read('seoul-flight.mjs').toString();
  const init = source.slice(source.indexOf('async function init()'),source.indexOf('function showFatalError'));
  assert.ok(init.indexOf('validateSceneContract(') < init.indexOf('configureSeoulMap('));
  assert.ok(init.indexOf('validateRasterDimensions(') < init.indexOf('setupThree('));
  assert.match(source,/async function createCityTiles\(scene\)\{\s*const manifest=runtime.cityManifest;/);
});
