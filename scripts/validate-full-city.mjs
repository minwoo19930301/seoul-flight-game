// Offline CPU source + extrusion audit. Does not initialize WebGL or a browser.
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {buildCityGeometry} from '../city-geometry.mjs';
import {validateSceneContract} from '../scene-contract.mjs';
import {terrainLod} from '../terrain-lod.mjs';
import {sampleLocalElevation} from '../terrain-model.mjs';
import {localMetreProjection} from '../geographic-model.mjs';
import {projectWater} from '../water-model.mjs';
import {makeWaterGeometry} from '../water-geometry.mjs';
const root=new URL('../',import.meta.url),base=new URL('assets/full-seoul/',root);
const bytes=p=>fs.readFileSync(new URL(p,base));
const json=p=>JSON.parse(bytes(p));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const terrain=json('terrain/elevation.json'),map=json('scene.json'),city=json('city-manifest.json');
const coverage=validateSceneContract({map,terrain,city,districts:json('source/districts.geojson'),references:JSON.parse(fs.readFileSync(new URL('assets/landmarks/references.json',root)))});
assert.equal(sha(bytes('terrain/elevation.json')),city.source.terrainSha256);
assert.equal(sha(bytes('source/manifest.json')),city.source.manifestSha256);
const source=json('source/manifest.json');
for(const file of source.files)assert.equal(sha(bytes('source/'+file.path)),file.sha256);
const stats={tiles:0,features:0,source:0,estimated:0,holes:0,roofAreaError:0,skippedInvalidVolume:0,float32CollapsedTriangles:0,float32ReorientedTriangles:0,triangles:0,vertices:0,degenerateTriangles:0,wrongNormals:0,maxChunkBytes:0,maxTileGeometryBytes:0,lod:{near:{features:0,triangles:0},far:{features:0,triangles:0}}};
const ids=new Set();
for(const entry of city.tiles){
  const b=bytes(entry.url);assert.equal(sha(b),entry.sha256);assert.equal(b.length,entry.bytes);
  const tile=JSON.parse(gunzipSync(b));assert.equal(tile.items.length,entry.features);
  for(const item of tile.items){assert.ok(!ids.has(item.id));ids.add(item.id);}
  stats.maxChunkBytes=Math.max(stats.maxChunkBytes,b.length);let tileBytes=0;
  for(const lod of ['near','far']){
    const {groups,stats:s}=buildCityGeometry(tile,terrain,lod);
    for(const key of ['features','source','estimated','holes','skippedInvalidVolume','float32CollapsedTriangles','float32ReorientedTriangles'])stats[key]+=s[key];
    stats.roofAreaError=Math.max(stats.roofAreaError,s.roofAreaError);stats.lod[lod].features+=s.features;
    for(const g of groups){
      assert.ok(g.position.every(Number.isFinite)&&g.normal.every(Number.isFinite)&&g.uv.every(Number.isFinite));
      stats.vertices+=g.position.length/3;stats.triangles+=g.index.length/3;stats.lod[lod].triangles+=g.index.length/3;
      tileBytes+=Object.values(g).reduce((sum,a)=>sum+a.byteLength,0);
      for(let i=0;i<g.index.length;i+=3){
        const [a,b,c]=[g.index[i]*3,g.index[i+1]*3,g.index[i+2]*3];assert.ok(Math.max(a,b,c)<g.position.length);
        const p=g.position,ux=p[b]-p[a],uy=p[b+1]-p[a+1],uz=p[b+2]-p[a+2],vx=p[c]-p[a],vy=p[c+1]-p[a+1],vz=p[c+2]-p[a+2];
        const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,len=Math.hypot(nx,ny,nz);
        if(len<1e-10)stats.degenerateTriangles++;
        else if((nx*g.normal[a]+ny*g.normal[a+1]+nz*g.normal[a+2])/len<.995)stats.wrongNormals++;
      }
    }
  }
  stats.maxTileGeometryBytes=Math.max(stats.maxTileGeometryBytes,tileBytes);stats.tiles++;
}
assert.equal(stats.features+stats.skippedInvalidVolume,city.totals.renderFeatures);
const lod=terrainLod(terrain,420),projection=localMetreProjection(map.bbox);
const waterStart=performance.now();
const water=makeWaterGeometry(projectWater(json('water/water.geojson'),projection.project),{minX:-projection.width/2,maxX:projection.width/2,minZ:-projection.depth/2,maxZ:projection.depth/2},(x,z)=>sampleLocalElevation(lod,x,z),{columns:lod.width-1,rows:lod.height-1});
assert.ok(water.attributes.position.array.every(Number.isFinite));
const result={evidence:'CPU only; no browser, GPU, mobile-device, frame-rate or visual approval',coverage,geometry:stats,terrain:{sourceSamples:terrain.elevations.length,desktopLod:[lod.width,lod.height],desktopTriangles:(lod.width-1)*(lod.height-1)*2},water:{triangles:water.attributes.position.count/3,bytes:water.attributes.position.array.byteLength,buildMs:Math.round(performance.now()-waterStart)},startupCoreBytes:['scene.json','city-manifest.json','terrain/elevation.json.gz','districts.json.gz','water/water.geojson.gz'].reduce((sum,p)=>sum+bytes(p).length,0)};
console.log(JSON.stringify(result,null,2));
assert.equal(stats.skippedInvalidVolume,0,'a source feature has an invalid display volume');
assert.equal(stats.degenerateTriangles,0,'Float32 mesh contains collapsed triangles');
assert.equal(stats.wrongNormals,0,'Float32 triangle disagrees with its wall/roof normal');
if(process.argv.includes('--report'))fs.writeFileSync(new URL('docs/full-city-validation.json',root),JSON.stringify({...result,result:'PASS'},null,2)+'\n');
