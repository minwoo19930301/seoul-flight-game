import test from 'node:test';
import assert from 'node:assert/strict';
import { localMetreProjection } from '../geographic-model.mjs';

test('local axes and heights use ground metres rather than a miniature map scale', () => {
  const projection = localMetreProjection({ minLon:126.9, maxLon:127.1, minLat:37.5, maxLat:37.6 });
  const origin = projection.project(127, 37.55);
  const east = projection.project(127 + 100 / (6378137 * Math.cos(37.55 * Math.PI / 180)) * 180 / Math.PI, 37.55);
  const north = projection.project(127, 37.55 + 100 / 6378137 * 180 / Math.PI);
  assert.ok(Math.abs(east.x - origin.x - 100) < .001);
  assert.ok(Math.abs(north.z - origin.z + 100) < .01);
  assert.ok(Math.abs(east.z - origin.z) < .001);
  assert.ok(projection.width > 17000 && projection.depth > 11000);
});
test('bounds reject non-finite, reversed and polar inputs', () => {
  for (const bbox of [{minLon:2,maxLon:1,minLat:1,maxLat:2},{minLon:1,maxLon:2,minLat:85,maxLat:86},{minLon:1,maxLon:NaN,minLat:1,maxLat:2}]) {
    assert.throws(() => localMetreProjection(bbox), RangeError);
  }
});
