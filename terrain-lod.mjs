import {sampleSurfaceUV,sampleLocalElevation} from './terrain-model.mjs';
// Explicit visual LOD resampling, not a replacement for the retained raw grid.
export function terrainLod(grid,maxCells=420){
  const scale=Math.min(1,maxCells/Math.max(grid.width-1,grid.height-1));
  const width=Math.ceil((grid.width-1)*scale)+1,height=Math.ceil((grid.height-1)*scale)+1;
  const elevations=[];
  for(let r=0;r<height;r++)for(let c=0;c<width;c++)elevations.push(sampleSurfaceUV(grid,c/(width-1),r/(height-1)));
  return {...grid,width,height,elevations,lod:{sourceWidth:grid.width,sourceHeight:grid.height,policy:'Uniform source-triangle samples for visual LOD; raw source unchanged'}};
}
export function safeFlightFloor(raw,rendered,x,z){
  // Safety floor is explicitly a gameplay envelope, not a corrected measurement:
  // no descent into known negative DEM artifacts, or through a visual LOD ridge.
  return Math.max(0,sampleLocalElevation(raw,x,z),sampleLocalElevation(rendered??raw,x,z))+18;
}
