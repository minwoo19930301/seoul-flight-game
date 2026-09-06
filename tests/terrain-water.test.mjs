import {readFileSync} from 'node:fs';import test from 'node:test';import assert from 'node:assert/strict';
import {sampleLocalElevation,sampleElevationUV} from '../terrain-model.mjs';
import {clipPolygon,makeWaterGeometry} from '../water-geometry.mjs';
import {createTerrainGeometry} from '../terrain-geometry.mjs';
import {localMetreProjection} from '../geographic-model.mjs';
import {projectWater} from '../water-model.mjs';
import {createHash} from 'node:crypto';
import * as THREE from '../vendor/three.module.js';
const grid=JSON.parse(readFileSync(new URL('../assets/terrain/elevation.json',import.meta.url)));
test('terrain endpoints, finite source values and local metre alignment',()=>{
  assert.equal(grid.elevations.length,257*257);assert.ok(grid.elevations.every(Number.isFinite));
  assert.equal(sampleLocalElevation(grid,-grid.projectedWidthM/2,-grid.projectedDepthM/2),grid.elevations[0]);
  assert.equal(sampleLocalElevation(grid,grid.projectedWidthM/2,grid.projectedDepthM/2),grid.elevations.at(-1));
  assert.equal(sampleLocalElevation(grid,0,0),sampleElevationUV(grid,.5,.5));
});
test('water uses clipped source banks and sampled terrain, never fixed river width',()=>{
  const polygon=[[-200,-50],[200,-50],[200,50],[-200,50]];
  const bounds={minX:-100,maxX:100,minZ:-30,maxZ:30};
  const clipped=clipPolygon(polygon,bounds);assert.ok(clipped.every(([x,z])=>Math.abs(x)<=100&&Math.abs(z)<=30));
  const geometry=makeWaterGeometry([polygon],bounds,(x,z)=>x*.01+z*.02);
  const p=geometry.getAttribute('position');assert.ok(p.count>6);
  for(let i=0;i<p.count;i++){assert.ok(Math.abs(p.getX(i))<=100&&Math.abs(p.getZ(i))<=30);assert.ok(Math.abs(p.getY(i)-p.getX(i)*.01-p.getZ(i)*.02-.3)<.0001);}
  geometry.dispose();
});

test('actual rendered non-affine DEM triangles equal the shared placement surface',()=>{
  const geometry=createTerrainGeometry(grid,grid.projectedWidthM+1000,grid.projectedDepthM+1000);
  const p=geometry.getAttribute('position'),indices=geometry.index;
  for(let t=0;t<indices.count;t+=237){
    const ids=[indices.getX(t),indices.getX(t+1),indices.getX(t+2)];
    const x=ids.reduce((s,i)=>s+p.getX(i),0)/3,z=ids.reduce((s,i)=>s+p.getZ(i),0)/3,y=ids.reduce((s,i)=>s+p.getY(i),0)/3;
    assert.ok(Math.abs(y-sampleLocalElevation(grid,x,z))<.002);
  }
  geometry.dispose();
});

test('closed-ring holes keep correct indices and upward normals',()=>{
  const geometry=makeWaterGeometry([[[[-10,-10],[10,-10],[10,10],[-10,10],[-10,-10]],[[-4,-4],[-4,4],[4,4],[4,-4],[-4,-4]]]],{minX:-10,maxX:10,minZ:-10,maxZ:10},()=>0);
  const p=geometry.getAttribute('position'),n=geometry.getAttribute('normal');let area=0;
  for(let i=0;i<p.count;i+=3){
    const x=(p.getX(i)+p.getX(i+1)+p.getX(i+2))/3,z=(p.getZ(i)+p.getZ(i+1)+p.getZ(i+2))/3;
    assert.ok(Math.abs(x)>=4-1e-6||Math.abs(z)>=4-1e-6,'island must be dry');
    area+=Math.abs((p.getX(i+1)-p.getX(i))*(p.getZ(i+2)-p.getZ(i))-(p.getZ(i+1)-p.getZ(i))*(p.getX(i+2)-p.getX(i)))/2;
    assert.ok(n.getY(i)>.999);
  }
  assert.ok(Math.abs(area-336)<1e-5);geometry.dispose();
});

test('actual Han banks, islands and all water triangles preserve source area and sit on DEM',()=>{
  const map=JSON.parse(readFileSync(new URL('../assets/seoul-scene-data.json',import.meta.url)));
  const projection=localMetreProjection(map.bbox);
  const waterBytes=readFileSync(new URL('../assets/water/water.geojson',import.meta.url));
  const provenance=JSON.parse(readFileSync(new URL('../assets/water/provenance.json',import.meta.url)));
  assert.equal(createHash('sha256').update(waterBytes).digest('hex'),provenance.outputSha256);
  const polygons=projectWater(JSON.parse(waterBytes),projection.project);
  assert.equal(polygons.length,206);assert.equal(polygons.reduce((s,p)=>s+p.length-1,0),41);
  const holes=polygons.flatMap(p=>p.slice(1));
  const holeProbes=holes.map(r=>{
    const contour=r.map(([x,z])=>new THREE.Vector2(x,z));
    const faces=THREE.ShapeUtils.triangulateShape(contour,[]);
    let probe=null,bestArea=-1;
    for(const face of faces){const [a,b,c]=face.map(i=>contour[i]);const area=Math.abs((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x));if(area>bestArea){bestArea=area;probe=[(a.x+b.x+c.x)/3,(a.y+b.y+c.y)/3];}}
    return probe;
  });
  const bounds={minX:-grid.projectedWidthM/2,maxX:grid.projectedWidthM/2,minZ:-grid.projectedDepthM/2,maxZ:grid.projectedDepthM/2};
  const geometry=makeWaterGeometry(polygons,bounds,(x,z)=>sampleLocalElevation(grid,x,z),{columns:grid.width-1,rows:grid.height-1});
  const p=geometry.getAttribute('position');assert.ok(p.count>100);let area=0;
  const cross=(ax,az,bx,bz,x,z)=>(bx-ax)*(z-az)-(bz-az)*(x-ax);
  for(let i=0;i<p.count;i+=3){
    const ax=p.getX(i),az=p.getZ(i),bx=p.getX(i+1),bz=p.getZ(i+1),cx=p.getX(i+2),cz=p.getZ(i+2);
    const x=(ax+bx+cx)/3,z=(az+bz+cz)/3,y=(p.getY(i)+p.getY(i+1)+p.getY(i+2))/3;
    assert.ok(Math.abs(y-sampleLocalElevation(grid,x,z)-.3)<.002);
    const signedArea=cross(ax,az,bx,bz,cx,cz);area+=Math.abs(signedArea)/2;
    for(const [hx,hz] of holeProbes){
      if(hx<Math.min(ax,bx,cx)||hx>Math.max(ax,bx,cx)||hz<Math.min(az,bz,cz)||hz>Math.max(az,bz,cz))continue;
      const signs=[cross(ax,az,bx,bz,hx,hz),cross(bx,bz,cx,cz,hx,hz),cross(cx,cz,ax,az,hx,hz)];
      assert.ok(!(signs.every(n=>n>1e-6)||signs.every(n=>n< -1e-6)),'water triangle covers an island');
    }
  }
  assert.ok(Math.abs(area-provenance.summary.areaUnionM2)/area<1e-6,'source shoreline area preserved');
  geometry.dispose();
});
