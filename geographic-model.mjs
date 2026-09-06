// Local east/up/south scene coordinates. Ground distances and heights share metres.
const R = 6378137;
const radians = Math.PI / 180;
export function localMetreProjection(bbox) {
  const { minLon, maxLon, minLat, maxLat } = bbox;
  if (![minLon, maxLon, minLat, maxLat].every(Number.isFinite)
    || minLon >= maxLon || minLat >= maxLat || minLat <= -85 || maxLat >= 85) {
    throw new RangeError("Invalid local geographic bounds");
  }
  const mx = lon => R * lon * radians;
  const my = lat => R * Math.log(Math.tan(Math.PI / 4 + lat * radians / 2));
  const factor = Math.cos((minLat + maxLat) / 2 * radians);
  const cx = (mx(minLon) + mx(maxLon)) / 2;
  const cy = (my(minLat) + my(maxLat)) / 2;
  return {
    width: (mx(maxLon) - mx(minLon)) * factor,
    depth: (my(maxLat) - my(minLat)) * factor,
    project(lon, lat) {
      if (![lon, lat].every(Number.isFinite) || Math.abs(lat) >= 85) throw new RangeError("Invalid coordinate");
      return { x: (mx(lon) - cx) * factor, z: -(my(lat) - cy) * factor };
    },
  };
}
