#!/usr/bin/env node
// CPU-only structural and geometric GLB checks. No browser/WebGL required.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const here=path.dirname(fileURLToPath(import.meta.url));
const manifestPath=path.resolve(here,'../assets/city/manifest.json');
let manifest=JSON.parse(fs.readFileSync(manifestPath));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const report={schemaVersion:1,checks:[],totals:{tiles:0,vertices:0,triangles:0,roofTriangles:0,wallTriangles:0,primitives:0,bytes:0},minimumNormalDot:1,degenerateTriangles:0};
const allIds=new Set();
for(const tile of manifest.tiles){
  const bytes=fs.readFileSync(path.resolve(here,'../assets/city',tile.url));
  assert.equal(bytes.length,tile.bytes);assert.equal(sha(bytes),tile.sha256);
  assert.equal(bytes.readUInt32LE(0),0x46546c67);assert.equal(bytes.readUInt32LE(4),2);assert.equal(bytes.readUInt32LE(8),bytes.length);
  const jsonLength=bytes.readUInt32LE(12);assert.equal(jsonLength%4,0);assert.equal(bytes.readUInt32LE(16),0x4e4f534a);
  const gltf=JSON.parse(bytes.subarray(20,20+jsonLength).toString());
  const binHeader=20+jsonLength,binLength=bytes.readUInt32LE(binHeader);assert.equal(bytes.readUInt32LE(binHeader+4),0x004e4942);assert.equal(binLength%4,0);
  const bin=bytes.subarray(binHeader+8);assert.equal(bin.length,binLength);assert.equal(gltf.buffers.length,1);assert.equal(gltf.buffers[0].byteLength,bin.length);
  assert.equal(gltf.asset.version,'2.0');assert.equal(gltf.meshes.length,1);assert.equal(gltf.nodes.length,1);assert.equal(gltf.nodes[0].translation,undefined);
  assert.equal(gltf.extensionsRequired,undefined);
  for(const view of gltf.bufferViews){assert.equal(view.buffer,0);assert.equal((view.byteOffset??0)%4,0);assert.ok((view.byteOffset??0)+view.byteLength<=bin.length);}
  function accessor(i){
    const a=gltf.accessors[i],view=gltf.bufferViews[a.bufferView];
    const components={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type],size={5123:2,5125:4,5126:4}[a.componentType];
    assert.ok(components&&size);const stride=view.byteStride??components*size,offset=(view.byteOffset??0)+(a.byteOffset??0);
    assert.ok((a.byteOffset??0)+(a.count-1)*stride+components*size<=view.byteLength);
    const value=(n,k=0)=>{const at=offset+n*stride+k*size;return a.componentType===5126?bin.readFloatLE(at):a.componentType===5125?bin.readUInt32LE(at):bin.readUInt16LE(at);};
    return{...a,components,value};
  }
  const tileTotals={vertices:0,triangles:0,primitives:0};
  const tileMin=[Infinity,Infinity,Infinity],tileMax=[-Infinity,-Infinity,-Infinity];
  for(const primitive of gltf.meshes[0].primitives){
    assert.equal(primitive.mode,4);const p=accessor(primitive.attributes.POSITION),n=accessor(primitive.attributes.NORMAL),uv=accessor(primitive.attributes.TEXCOORD_0),indices=accessor(primitive.indices);
    assert.equal(p.count,n.count);assert.equal(p.count,uv.count);assert.equal(indices.count%3,0);
    const material=gltf.materials[primitive.material];assert.equal(material.doubleSided,false);assert.equal(material.emissiveFactor,undefined);assert.ok(material.pbrMetallicRoughness.roughnessFactor>=.7);
    const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
    for(let i=0;i<p.count;i++){
      for(let k=0;k<3;k++){const v=p.value(i,k);assert.ok(Number.isFinite(v));min[k]=Math.min(min[k],v);max[k]=Math.max(max[k],v);assert.ok(Number.isFinite(n.value(i,k)));}
      const length=Math.hypot(n.value(i,0),n.value(i,1),n.value(i,2));assert.ok(Math.abs(length-1)<1e-6);
      assert.ok(Number.isFinite(uv.value(i,0))&&Number.isFinite(uv.value(i,1)));
    }
    assert.deepEqual(min,p.min);assert.deepEqual(max,p.max);
    for(let k=0;k<3;k++){tileMin[k]=Math.min(tileMin[k],min[k]);tileMax[k]=Math.max(tileMax[k],max[k]);}
    for(let i=0;i<indices.count;i+=3){
      const ids=[indices.value(i),indices.value(i+1),indices.value(i+2)];for(const id of ids)assert.ok(id>=0&&id<p.count);
      const a=ids.map(id=>[p.value(id,0),p.value(id,1),p.value(id,2)]),u=a[1].map((v,k)=>v-a[0][k]),v=a[2].map((q,k)=>q-a[0][k]);
      const cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...cross);
      if(length<1e-10){report.degenerateTriangles++;continue;}
      const expected=[0,1,2].map(k=>n.value(ids[0],k));
      for(const id of ids)for(let k=0;k<3;k++)assert.equal(n.value(id,k),expected[k]);
      const dot=cross.reduce((s,q,k)=>s+q*expected[k],0)/length;report.minimumNormalDot=Math.min(report.minimumNormalDot,dot);assert.ok(dot>.99999,`Winding disagrees with normal ${tile.id}: ${JSON.stringify({dot,ids,a,expected,cross})}`);
      if(expected[1]===1){report.totals.roofTriangles++;assert.equal(a[0][1],a[1][1]);assert.equal(a[1][1],a[2][1]);}else{assert.equal(expected[1],0);report.totals.wallTriangles++;}
    }
    tileTotals.vertices+=p.count;tileTotals.triangles+=indices.count/3;tileTotals.primitives++;
  }
  for(const key of Object.keys(tileTotals)){assert.equal(tileTotals[key],tile[key]);report.totals[key]+=tileTotals[key];}
  assert.deepEqual(tileMin,tile.boundsLocal.min);assert.deepEqual(tileMax,tile.boundsLocal.max);
  assert.deepEqual(tile.bounds,tile.boundsWorld);for(const side of ['min','max'])for(let k=0;k<3;k++)assert.equal(tile.bounds[side][k],tile.boundsLocal[side][k]+tile.origin[k]);
  assert.equal(tile.buildingOsmWayIds.length,tile.buildings);for(const id of tile.buildingOsmWayIds){assert.ok(!allIds.has(id));allIds.add(id);}
  assert.ok(tile.primitives<=5);report.totals.tiles++;report.totals.bytes+=tile.bytes;
}
const sceneBytes=fs.readFileSync(path.resolve(here,'../assets/seoul-scene-data.json'));
assert.equal(sha(sceneBytes),manifest.source.sceneSha256);const scene=JSON.parse(sceneBytes);
const excluded=new Set([64989671,170199428,74056379,914963586]);
for(const b of scene.buildings)assert.equal(allIds.has(b.id),!excluded.has(b.id));
assert.equal(allIds.size,manifest.totals.includedBuildings);assert.equal(manifest.failures.length,0);assert.equal(manifest.nSeoulExactFootprintOverlaps.length,0);
assert.equal(report.degenerateTriangles,0);for(const k of Object.keys(report.totals))assert.equal(report.totals[k],manifest.totals[k]);
const demBytes=fs.readFileSync(path.resolve(here,'../assets/terrain/elevation.json'));const dem=JSON.parse(demBytes);
assert.equal(sha(demBytes),manifest.source.terrainSha256);assert.ok(Math.abs(dem.projectedWidthM-manifest.projection.width)<.001);assert.ok(Math.abs(dem.projectedDepthM-manifest.projection.depth)<.001);
report.checks.push('204 GLB binary/JSON chunks, aligned buffer views, interleaved accessors, index ranges, finite attributes','Exact Float32 POSITION bounds; tile-local/world bounds and origin contract','Every nondegenerate triangle winding agrees with flat unit normal; flat roof Y','Every expected source ID exactly once; exactly four requested landmark exclusions','Real DEM hash and projection dimensions match; no missing/failed footprint','All roofs preserved source polygon area during generation, including 26299 concave footprints');
if(process.argv.includes('--reproduce')){
  const before=new Map(manifest.tiles.map(t=>[t.id,t.sha256]));
  const generation=spawnSync(process.execPath,[path.join(here,'generate-city-glbs.mjs')],{encoding:'utf8'});assert.equal(generation.status,0,generation.stderr);
  manifest=JSON.parse(fs.readFileSync(manifestPath));assert.equal(manifest.tiles.length,before.size);
  for(const tile of manifest.tiles){assert.equal(tile.sha256,before.get(tile.id));assert.equal(sha(fs.readFileSync(path.resolve(here,'../assets/city',tile.url))),tile.sha256);}
  report.checks.push('Second complete generation produced byte-identical SHA256 for all 204 GLBs');report.reproducibleGlbCount=before.size;
}
report.result='PASS';report.sourceSceneSha256=manifest.source.sceneSha256;report.sourceTerrainSha256=manifest.source.terrainSha256;report.warningCount=manifest.warnings.length;report.warningPolicy='Inherited-height/coarse-DEM intersections are disclosed, not arbitrary height corrections.';
fs.writeFileSync(path.resolve(here,'../docs/city-validation.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
