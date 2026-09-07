import { localMetreProjection } from './geographic-model.mjs';

const bboxFields = ['minLon', 'maxLon', 'minLat', 'maxLat'];
const fail = message => { throw new Error(`지도 자료 불일치: ${message}`); };

function sameBounds(expected, actual, label) {
  if (!actual || bboxFields.some(key => !Number.isFinite(actual[key])
    || Math.abs(expected[key] - actual[key]) > 1e-9)) {
    fail(`${label}의 좌표 범위가 지도와 다릅니다. 함께 재생성해야 합니다.`);
  }
}

function sameMetres(expected, actual, label) {
  if (!Number.isFinite(actual) || Math.abs(expected - actual) > 0.01) {
    fail(`${label}의 미터 축척이 다릅니다.`);
  }
}

// A larger bbox is not new source coverage. Refuse mixed-origin datasets before
// creating any terrain, city meshes or stretched raster textures.
export function validateSceneContract({ map, terrain, city, raster, references, districts }) {
  const projection = localMetreProjection(map.bbox);
  sameBounds(map.bbox, terrain.bbox, '지형');
  sameBounds(map.bbox, city.projection?.bbox, '건물 타일');
  const fullCity = map.schemaVersion === 2;
  if (!fullCity) sameBounds(map.bbox, raster?.bbox, '바탕 지도');
  sameMetres(projection.width, terrain.projectedWidthM, '지형 가로');
  sameMetres(projection.depth, terrain.projectedDepthM, '지형 세로');
  sameMetres(projection.width, city.projection?.width, '건물 가로');
  sameMetres(projection.depth, city.projection?.depth, '건물 세로');
  if (terrain.units !== 'metres' || terrain.verticalOffsetM !== 0
    || city.units !== 'metres' || city.axes !== 'x east, y up, z south') {
    fail('좌표 축 또는 고도 단위가 호환되지 않습니다.');
  }
  if (!Number.isInteger(terrain.width) || terrain.width < 2
    || !Number.isInteger(terrain.height) || terrain.height < 2
    || !Array.isArray(terrain.elevations)
    || terrain.elevations.length !== terrain.width * terrain.height
    || !terrain.elevations.every(Number.isFinite)) {
    fail('지형 표본이 누락되었거나 유효하지 않습니다.');
  }
  if (!fullCity && (!Number.isInteger(raster.width) || raster.width <= 0
    || !Number.isInteger(raster.height) || raster.height <= 0)) {
    fail('바탕 지도 이미지 크기가 유효하지 않습니다.');
  }
  if (fullCity) {
    if (city.schemaVersion !== 2 || !Array.isArray(city.tiles)
      || city.totals?.inputBuildings !== map.sourceCounts?.building?.count
      || city.totals?.inputParts !== map.sourceCounts?.building_part?.count
      || city.totals?.tiles !== city.tiles.length
      || city.tiles.reduce((sum, tile) => sum + tile.features, 0) !== city.totals.renderFeatures) {
      fail('원본 건물 수와 타일 목록이 일치하지 않습니다.');
    }
    const ids = new Set(districts?.features?.map(feature => feature.id));
    if (ids.size !== 25 || districts.features.length !== 25 || map.districts?.length !== 25
      || new Set(map.districts.map(d => d.id)).size !== 25
      || map.districts.some(d => !ids.has(d.id) || !Array.isArray(d.position)
        || d.position.length !== 2 || !d.position.every(Number.isFinite)
        || Math.abs(d.position[0]) > projection.width / 2 || Math.abs(d.position[1]) > projection.depth / 2)) {
      fail('서울 25개 구의 경계와 이동 좌표가 일치하지 않습니다.');
    }
  } else if (!Array.isArray(map.buildings) || !Array.isArray(city.tiles)
    || city.totals?.inputBuildings !== map.buildings.length
    || city.totals?.tiles !== city.tiles.length
    || city.tiles.reduce((sum, tile) => sum + tile.buildings, 0) !== city.totals.includedBuildings) {
    fail('원본 건물 수와 타일 목록이 일치하지 않습니다.');
  }
  for (const tile of city.tiles) {
    if (!Array.isArray(tile.origin) || tile.origin.length !== 3 || !tile.origin.every(Number.isFinite)
      || ![tile.bounds?.min, tile.bounds?.max].every(values => Array.isArray(values)
        && values.length === 3 && values.every(Number.isFinite))
      || tile.bounds.min.some((value, index) => value > tile.bounds.max[index])) {
      fail(`건물 타일 ${tile.id}의 원점 또는 범위가 유효하지 않습니다.`);
    }
  }
  if (!Array.isArray(references.landmarks) || references.landmarks.length === 0) {
    fail('랜드마크 위치 자료가 없습니다.');
  }
  for (const landmark of references.landmarks) {
    const { lon, lat } = landmark.coordinate ?? {};
    if (![lon, lat].every(Number.isFinite) || lon < map.bbox.minLon || lon > map.bbox.maxLon
      || lat < map.bbox.minLat || lat > map.bbox.maxLat) {
      fail(`${landmark.nameKo}가 실제 지형 범위를 벗어납니다.`);
    }
  }
  return {
    widthM: projection.width,
    depthM: projection.depth,
    buildings: fullCity ? city.totals.inputBuildings : city.totals.includedBuildings,
    ...(fullCity ? { parts:city.totals.inputParts, renderedFeatures:city.totals.renderFeatures, districts:25 } : {}),
    landmarks: references.landmarks.length,
  };
}

export function validateRasterDimensions(image, raster) {
  if (image && (image.naturalWidth !== raster.width || image.naturalHeight !== raster.height)) {
    fail('바탕 지도 이미지와 출처 기록의 크기가 다릅니다.');
  }
}
