import * as THREE from './vendor/three.module.js';
import {sampleLocalElevation} from './terrain-model.mjs';
export function createTerrainGeometry(grid,width,depth){
  const xs=[-width/2,...Array.from({length:grid.width},(_,i)=>(i/(grid.width-1)-.5)*grid.projectedWidthM),width/2];
  const zs=[-depth/2,...Array.from({length:grid.height},(_,i)=>(i/(grid.height-1)-.5)*grid.projectedDepthM),depth/2];
  const positions=[],uvs=[],indices=[];
  for(const z of zs)for(const x of xs){positions.push(x,sampleLocalElevation(grid,x,z),z);uvs.push(x/width+.5,.5-z/depth);}
  for(let row=0;row<zs.length-1;row++)for(let col=0;col<xs.length-1;col++){
    const a=row*xs.length+col,b=a+xs.length,c=b+1,d=a+1;
    indices.push(a,b,d,b,c,d);
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingSphere();return geometry;
}
