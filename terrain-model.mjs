// Shared CPU/runtime sampler. All consumers must use the SAME sampler/grid.
const rad = Math.PI / 180;
const mercY = lat => Math.log(Math.tan(Math.PI / 4 + lat * rad / 2));
export function sampleElevationUV(grid, u, v) {
  if (![u, v].every(Number.isFinite)) throw new RangeError('Invalid terrain coordinates');
  if (grid.width < 2 || grid.height < 2 || grid.elevations.length !== grid.width * grid.height) throw new Error('Invalid terrain grid');
  // Explicit edge clamp for padded scene only; not additional geographic coverage.
  const x = Math.max(0, Math.min(1, u)) * (grid.width - 1);
  const y = Math.max(0, Math.min(1, v)) * (grid.height - 1);
  const x0 = Math.min(grid.width - 2, Math.floor(x));
  const y0 = Math.min(grid.height - 2, Math.floor(y));
  const fx = x - x0, fy = y - y0, i = y0 * grid.width + x0;
  const a = grid.elevations[i], b = grid.elevations[i + 1];
  const c = grid.elevations[i + grid.width], d = grid.elevations[i + grid.width + 1];
  if (![a, b, c, d].every(Number.isFinite)) throw new Error('Terrain no-data encountered');
  return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
}
export function sampleElevationLonLat(grid, lon, lat) {
  const b = grid.bbox;
  return sampleElevationUV(grid, (lon - b.minLon) / (b.maxLon - b.minLon), (mercY(b.maxLat) - mercY(lat)) / (mercY(b.maxLat) - mercY(b.minLat)));
}
export function sampleLocalElevation(grid, x, z) {
  // Same origin as localMetreProjection(bbox): bbox centre, x east, z south.
  return sampleSurfaceUV(grid, x / grid.projectedWidthM + 0.5, z / grid.projectedDepthM + 0.5);
}

export function sampleSurfaceUV(grid,u,v){
  if(![u,v].every(Number.isFinite))throw new RangeError('Invalid terrain coordinates');
  if(grid.width<2||grid.height<2||grid.elevations.length!==grid.width*grid.height)throw Error('Invalid terrain grid');
  const x=Math.max(0,Math.min(1,u))*(grid.width-1),z=Math.max(0,Math.min(1,v))*(grid.height-1);
  const col=Math.min(grid.width-2,Math.floor(x)),row=Math.min(grid.height-2,Math.floor(z));
  const fx=x-col,fz=z-row,i=row*grid.width+col;
  const [a,b,c,d]=[grid.elevations[i],grid.elevations[i+1],grid.elevations[i+grid.width],grid.elevations[i+grid.width+1]];
  if(![a,b,c,d].every(Number.isFinite))throw Error('Terrain no-data encountered');
  // Ground mesh diagonal SW--NE; bilinear resampling alone is NOT the rendered plane.
  return fx+fz<=1?a+(b-a)*fx+(c-a)*fz:d+(c-d)*(1-fx)+(b-d)*(1-fz);
}
