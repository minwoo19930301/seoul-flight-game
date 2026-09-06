#!/usr/bin/env node
// CPU-only GLB writer; actual footprint rings, inherited estimated heights, real DEM.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {fileURLToPath,pathToFileURL} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const options={scene:'../assets/seoul-scene-data.json',projection:'../geographic-model.mjs',three:'../vendor/three.module.js',dem:'../assets/terrain/elevation.json',sampler:'../terrain-model.mjs',out:'../assets/city/tiles',tile:1000};
for(let i=2;i<process.argv.length;i+=2){const key=process.argv[i].replace(/^--/,'');if(!(key in options)||!process.argv[i+1])throw Error('Unknown/missing option '+key);options[key]=process.argv[i+1];}
const resolved=key=>path.resolve(here,options[key]);
const tileSize=+options.tile;if(tileSize<750||tileSize>1000)throw Error('Tile size must be750–1000m');
for(const key of ['scene','projection','three','dem','sampler'])if(!fs.existsSync(resolved(key)))throw Error('Required actual input missing: '+key+' (no synthetic/flat DEM fallback)');
const hash=buf=>crypto.createHash('sha256').update(buf).digest('hex');
const sceneBytes=fs.readFileSync(resolved('scene')),demBytes=fs.readFileSync(resolved('dem'));
const scene=JSON.parse(sceneBytes),dem=JSON.parse(demBytes);
const {localMetreProjection}=await import(pathToFileURL(resolved('projection')));
const {ShapeUtils,Vector2}=await import(pathToFileURL(resolved('three')));
const samplerModule=await import(pathToFileURL(resolved('sampler')));
const projection=localMetreProjection(scene.bbox);
// Explicit small adapter to the supplied actual terrain sampler; no alternate elevations.
const sample = typeof samplerModule.sampleLocalElevation==='function'
  ? (x,z)=>samplerModule.sampleLocalElevation(dem,x,z)
  : null;
if(!sample)throw Error('Expected sampler export sampleLocalElevation(grid,x,z); no fallback elevations');
const sampleHeight=(x,z)=>{
  const y=typeof sample==='function'?sample(x,z):sample.sample(x,z);
  if(!Number.isFinite(y))throw Error('DEM sample unavailable/nonfinite at '+x+','+z);
  return y;
};
const excludedIds=new Set([64989671,170199428,74056379,914963586]);
const exclusions=scene.buildings.filter(b=>excludedIds.has(b.id)).map(b=>({osmWayId:b.id,name:b.name??null,reason:'Explicit bespoke-landmark replacement requested'}));
const warnings=[];
const out=resolved('out');fs.mkdirSync(out,{recursive:true});

function area(r){let a=0;for(let i=0,j=r.length-1;i<r.length;j=i++)a+=r[j].x*r[i].z-r[i].x*r[j].z;return a*.5;}
function contains(r,p){let yes=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[j],b=r[i];if((a.z>p.z)!==(b.z>p.z)&&p.x<(b.x-a.x)*(p.z-a.z)/(b.z-a.z)+a.x)yes=!yes;}return yes;}
function cleanRing(b){
  const ring=[];
  for(const ll of b.points){const p=projection.project(...ll);const prev=ring.at(-1);if(!prev||Math.hypot(p.x-prev.x,p.z-prev.z)>1e-6)ring.push(p);}
  if(ring.length>1&&Math.hypot(ring[0].x-ring.at(-1).x,ring[0].z-ring.at(-1).z)<1e-6)ring.pop();
  if(ring.length<3||Math.abs(area(ring))<.01)throw Error('Degenerate footprint '+b.id);
  return ring;
}
function materialIndex(b){
  if(/apartments|residential|dormitory|officetel/.test(b.kind))return 0;
  if(/house|detached|terrace|hut/.test(b.kind))return 1;
  if(/office|commercial|retail|hotel|mice/.test(b.kind))return 2;
  if(/school|university|college|public|civic|hospital|government/.test(b.kind))return 3;
  return 4;
}
const palette=[
  {name:'estimated-residential',rgb:[.74,.78,.77]},
  {name:'estimated-lowrise',rgb:[.71,.65,.59]},
  {name:'estimated-commercial',rgb:[.64,.72,.77]},
  {name:'estimated-public',rgb:[.79,.75,.68]},
  {name:'estimated-neutral',rgb:[.71,.73,.72]},
];

// Original64px repeating window/mullion diagram, not photographic/source facade texture.
function crc32(buf){let crc=0xffffffff;for(const byte of buf){crc^=byte;for(let k=0;k<8;k++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return(crc^0xffffffff)>>>0;}
function pngChunk(type,data){const t=Buffer.from(type),size=Buffer.alloc(4),crc=Buffer.alloc(4);size.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([t,data])));return Buffer.concat([size,t,data,crc]);}
function windowTexture(){const width=64,height=64,raw=Buffer.alloc(height*(1+width*4));for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  let rgb=[244,242,235];
  if(x>=10&&x<54&&y>=13&&y<53)rgb=[111,137,150];
  if(x>=13&&x<51&&y>=16&&y<50)rgb=[72,93,107];
  if(x===31||x===32)if(y>=14&&y<52)rgb=[192,202,202];
  if(y===33&&x>=12&&x<52)rgb=[166,181,185];
  if(y>=54&&y<=56&&x>=8&&x<=55)rgb=[194,194,185];
  const at=y*(1+width*4)+1+x*4;raw[at]=rgb[0];raw[at+1]=rgb[1];raw[at+2]=rgb[2];raw[at+3]=255;
}const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(width,0);ihdr.writeUInt32BE(height,4);ihdr[8]=8;ihdr[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),pngChunk('IHDR',ihdr),pngChunk('IDAT',zlib.deflateSync(raw,{level:9})),pngChunk('IEND',Buffer.alloc(0))]);}
const texture=windowTexture();fs.writeFileSync(path.join(here,'generic-window-original.png'),texture);

function makeBatch(){return{vertices:[],indices:[],min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity],buildings:0};}
function vertex(batch,x,y,z,nx,ny,nz,u,v){x=Math.fround(x);y=Math.fround(y);z=Math.fround(z);const id=batch.vertices.length/8;batch.vertices.push(x,y,z,nx,ny,nz,u,v);for(let i=0;i<3;i++){const value=[x,y,z][i];batch.min[i]=Math.min(batch.min[i],value);batch.max[i]=Math.max(batch.max[i],value);}return id;}
function tileGLB(batches){
  const gltf={asset:{version:'2.0',generator:'Seoul actual-footprint tile generator; inherited heights, DEM bases'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0}],meshes:[{primitives:[]}],buffers:[{byteLength:0}],bufferViews:[],accessors:[],materials:[],images:[],textures:[],samplers:[{magFilter:9729,minFilter:9987,wrapS:10497,wrapT:10497}]};
  const buffers=[];let offset=0;
  const view=(buf,extra={})=>{const pad=(4-offset%4)%4;if(pad){buffers.push(Buffer.alloc(pad));offset+=pad;}const idx=gltf.bufferViews.length;gltf.bufferViews.push({buffer:0,byteOffset:offset,byteLength:buf.length,...extra});buffers.push(buf);offset+=buf.length;return idx;};
  const texView=view(texture);gltf.images.push({bufferView:texView,mimeType:'image/png',name:'generic-window-mullion-original-not-surveyed'});gltf.textures.push({source:0,sampler:0});
  let vertices=0,triangles=0;
  for(let m=0;m<batches.length;m++){
    const b=batches[m];if(!b.indices.length)continue;
    const p=palette[m];const material=gltf.materials.length;
    gltf.materials.push({name:p.name,pbrMetallicRoughness:{baseColorFactor:[...p.rgb,1],baseColorTexture:{index:0},metallicFactor:.03,roughnessFactor:.82},doubleSided:false,extras:{facade:'Original deterministic generic repeat, not measured or photographic facade'}});
    const count=b.vertices.length/8,typed=new Float32Array(b.vertices);const vb=view(Buffer.from(typed.buffer),{target:34962,byteStride:32});
    const position=gltf.accessors.length;gltf.accessors.push({bufferView:vb,byteOffset:0,componentType:5126,count,type:'VEC3',min:b.min,max:b.max});
    const normal=gltf.accessors.length;gltf.accessors.push({bufferView:vb,byteOffset:12,componentType:5126,count,type:'VEC3'});
    const uv=gltf.accessors.length;gltf.accessors.push({bufferView:vb,byteOffset:24,componentType:5126,count,type:'VEC2'});
    const shorts=count<=65535;const indexArray=shorts?new Uint16Array(b.indices):new Uint32Array(b.indices);
    const ib=view(Buffer.from(indexArray.buffer),{target:34963});const index=gltf.accessors.length;gltf.accessors.push({bufferView:ib,componentType:shorts?5123:5125,count:b.indices.length,type:'SCALAR'});
    gltf.meshes[0].primitives.push({attributes:{POSITION:position,NORMAL:normal,TEXCOORD_0:uv},indices:index,material,mode:4});
    vertices+=count;triangles+=b.indices.length/3;
  }
  let bin=Buffer.concat(buffers);if(bin.length%4)bin=Buffer.concat([bin,Buffer.alloc(4-bin.length%4)]);gltf.buffers[0].byteLength=bin.length;
  let json=Buffer.from(JSON.stringify(gltf));if(json.length%4)json=Buffer.concat([json,Buffer.alloc(4-json.length%4,32)]);
  const header=Buffer.alloc(12);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(12+8+json.length+8+bin.length,8);
  const jh=Buffer.alloc(8);jh.writeUInt32LE(json.length);jh.writeUInt32LE(0x4e4f534a,4);const bh=Buffer.alloc(8);bh.writeUInt32LE(bin.length);bh.writeUInt32LE(0x004e4942,4);
  return{bytes:Buffer.concat([header,jh,json,bh,bin]),vertices,triangles,primitives:gltf.meshes[0].primitives.length};
}

const start=performance.now(),groups=new Map(),failures=[],nseoul=projection.project(scene.landmarks.nseoul.lon,scene.landmarks.nseoul.lat),nSeoulOverlaps=[];
for(const b of scene.buildings){
  if(excludedIds.has(b.id))continue;
  try{
    const r=cleanRing(b);const cx=r.reduce((s,p)=>s+p.x,0)/r.length,cz=r.reduce((s,p)=>s+p.z,0)/r.length;
    if(contains(r,nseoul))nSeoulOverlaps.push({id:b.id,name:b.name??null,kind:b.kind});
    const tx=Math.floor(cx/tileSize),tz=Math.floor(cz/tileSize),key=tx+','+tz;
    if(!groups.has(key))groups.set(key,{tx,tz,buildings:[]});groups.get(key).buildings.push(b);
  }catch(e){failures.push({id:b.id,reason:e.message});}
}
// No exact footprint contains the supplied NSeoul landmark in the inherited snapshot.
// Do not clear nearby pavilion/facilities merely because they are near that location.
if(nSeoulOverlaps.length)warnings.push({kind:'NSeoul-overlap-needs-exact-identity-review',features:nSeoulOverlaps});
const tiles=[],totals={inputBuildings:scene.buildings.length,includedBuildings:0,excludedBuildings:exclusions.length,roofTriangles:0,wallTriangles:0,vertices:0,triangles:0,primitives:0,bytes:0,concaveBuildings:0,roofAreaMaxRelativeError:0,float32DegenerateRoofTrianglesRemoved:0,baseSampleMin:Infinity,baseSampleMax:-Infinity};
for(const group of [...groups.values()].sort((a,b)=>a.tz-b.tz||a.tx-b.tx)){
  const ox=(group.tx+.5)*tileSize,oz=(group.tz+.5)*tileSize,batches=palette.map(makeBatch),ids=[];
  for(const b of group.buildings.sort((a,b)=>a.id-b.id)){
    try{
      if(!(Number.isFinite(b.height)&&b.height>0))throw Error('Invalid inherited height');
      const ring=cleanRing(b),signedArea=area(ring),sign=signedArea>0?1:-1,n=ring.length;
      const faces=ShapeUtils.triangulateShape(ring.map(p=>new Vector2(p.x,p.z)),[]);
      let triArea=0,concave=false;for(let i=0;i<n;i++){const a=ring[(i+n-1)%n],p=ring[i],c=ring[(i+1)%n];if(sign*((p.x-a.x)*(c.z-p.z)-(p.z-a.z)*(c.x-p.x))<-.001)concave=true;}
      for(const f of faces){const a=ring[f[0]],p=ring[f[1]],c=ring[f[2]];triArea+=Math.abs((p.x-a.x)*(c.z-a.z)-(p.z-a.z)*(c.x-a.x))*.5;}
      const error=Math.abs(triArea-Math.abs(signedArea))/Math.max(.01,Math.abs(signedArea));
      if(!faces.length||error>1e-5)throw Error('Triangulation fails area preservation: '+error);
      const center={x:ring.reduce((s,p)=>s+p.x,0)/n,z:ring.reduce((s,p)=>s+p.z,0)/n};
      const walls=[];const floor=sampleHeight(center.x,center.z);let maxEdgeElevation=-Infinity;
      for(let i=0;i<n;i++){
        const a=ring[i],p=ring[(i+1)%n],len=Math.hypot(p.x-a.x,p.z-a.z),steps=Math.max(1,Math.ceil(len/25));
        for(let step=0;step<steps;step++){
          const t=step/steps,u=(step+1)/steps,aa={x:a.x+(p.x-a.x)*t,z:a.z+(p.z-a.z)*t},bb={x:a.x+(p.x-a.x)*u,z:a.z+(p.z-a.z)*u};
          const groundA=sampleHeight(aa.x,aa.z),groundB=sampleHeight(bb.x,bb.z);maxEdgeElevation=Math.max(maxEdgeElevation,groundA,groundB);const ya=Math.min(floor,groundA),yb=Math.min(floor,groundB);walls.push({a:aa,b:bb,ya,yb,nx:sign*(p.z-a.z)/len,nz:-sign*(p.x-a.x)/len,u0:len*t/3.6,u1:len*u/3.6});
        }
      }
      const roofY=floor+b.height,batch=batches[materialIndex(b)],roof=[];
      if(maxEdgeElevation>roofY)warnings.push({kind:'coarse-DEM-edge-above-inherited-roof',osmWayId:b.id,roofY,maxEdgeElevation,note:'Retained original estimated height; terrain can intersect this shell. No invented height correction.'});
      for(const p of ring)roof.push(vertex(batch,p.x-ox,roofY,p.z-oz,0,1,0,.02,.02));
      let emittedRoofTriangles=0;
      for(const f of faces){let[a,bb,c]=f;const ax=batch.vertices[roof[a]*8],az=batch.vertices[roof[a]*8+2],bx=batch.vertices[roof[bb]*8],bz=batch.vertices[roof[bb]*8+2],cx=batch.vertices[roof[c]*8],cz=batch.vertices[roof[c]*8+2];const crossY=(bz-az)*(cx-ax)-(bx-ax)*(cz-az);if(crossY===0){totals.float32DegenerateRoofTrianglesRemoved++;continue;}if(crossY<0)[bb,c]=[c,bb];batch.indices.push(roof[a],roof[bb],roof[c]);emittedRoofTriangles++;}
      for(const w of walls){
        const a=vertex(batch,w.a.x-ox,w.ya,w.a.z-oz,w.nx,0,w.nz,w.u0,(w.ya-floor)/3.2),b0=vertex(batch,w.b.x-ox,w.yb,w.b.z-oz,w.nx,0,w.nz,w.u1,(w.yb-floor)/3.2),at=vertex(batch,w.a.x-ox,roofY,w.a.z-oz,w.nx,0,w.nz,w.u0,b.height/3.2),bt=vertex(batch,w.b.x-ox,roofY,w.b.z-oz,w.nx,0,w.nz,w.u1,b.height/3.2);
        if(sign>0)batch.indices.push(a,at,bt,a,bt,b0);else batch.indices.push(a,bt,at,a,b0,bt);
      }
      ids.push(b.id);batch.buildings++;totals.includedBuildings++;totals.roofTriangles+=emittedRoofTriangles;totals.wallTriangles+=walls.length*2;totals.concaveBuildings+=+concave;totals.roofAreaMaxRelativeError=Math.max(totals.roofAreaMaxRelativeError,error);totals.baseSampleMin=Math.min(totals.baseSampleMin,floor);totals.baseSampleMax=Math.max(totals.baseSampleMax,floor);
    }catch(e){failures.push({id:b.id,reason:e.message});}
  }
  if(!ids.length)continue;
  const result=tileGLB(batches),name=`city_${group.tx}_${group.tz}.glb`;fs.writeFileSync(path.join(out,name),result.bytes);
  const used=batches.filter(b=>b.indices.length),min=[0,1,2].map(i=>Math.min(...used.map(b=>b.min[i]))),max=[0,1,2].map(i=>Math.max(...used.map(b=>b.max[i])));
  const boundsWorld={min:[min[0]+ox,min[1],min[2]+oz],max:[max[0]+ox,max[1],max[2]+oz]};
  tiles.push({id:`${group.tx},${group.tz}`,url:path.basename(out)+'/'+name,uri:path.basename(out)+'/'+name,origin:[ox,0,oz],bounds:boundsWorld,boundsLocal:{min,max},boundsWorld,buildings:ids.length,buildingOsmWayIds:ids,vertices:result.vertices,triangles:result.triangles,primitives:result.primitives,bytes:result.bytes.length,sha256:hash(result.bytes)});
  for(const k of ['vertices','triangles','primitives'])totals[k]+=result[k];totals.bytes+=result.bytes.length;
  if(tiles.length%25===0)console.log('tiles',tiles.length,'buildings',totals.includedBuildings);
}
totals.tiles=tiles.length;totals.seconds=+( (performance.now()-start)/1000 ).toFixed(2);totals.peakRssMiB=+(process.resourceUsage().maxRSS/1024).toFixed(1);
const manifest={schemaVersion:1,assetType:'tiled-real-footprint-building-GLB',units:'metres',axes:'x east, y up, z south',tileSizeMeters:tileSize,projection:{type:'localMetreProjection; local WebMercator scaled by cos bbox-center latitude',bbox:scene.bbox,width:projection.width,depth:projection.depth,sourceSha256:hash(fs.readFileSync(resolved('projection')))},positioning:'Each GLB has origin(0,0,0) and tile-local x/z; set loaded root.position to manifest tile.origin exactly once. Y is terrain source elevation with zero vertical datum offset.',source:{scene:path.basename(resolved('scene')),sceneSha256:hash(sceneBytes),buildingsAttribution:scene.attribution,buildingGeometryLicense:'OpenStreetMap contributors, ODbL1.0. https://www.openstreetmap.org/copyright',terrain:path.basename(resolved('dem')),terrainSha256:hash(demBytes),terrainSamplerSha256:hash(fs.readFileSync(resolved('sampler')))},heightProvenance:'Every building height is inherited from a flattened snapshot without per-feature measurement/estimate provenance. Treat ALL these heights as inherited estimates, even if an upstream height tag may once have existed. Not a current/surveyed skyline.',basePolicy:'Exact shared rendered terrain triangle sampler (SW-NE grid diagonal). Flat floor datum=sample at mean footprint vertex position; roof=floor+inherited height. Walls extend below floor only where <=25m edge DEM samples are lower, preventing floating skirts without raising roofs. Higher ground may intersect shell; flagged if edge terrain exceeds roof. This is coarse-DEM placement/foundation treatment, not measured foundations.',geometryPolicy:'Input ring rotation and concavity retained; duplicate consecutive/closure vertices cleaned. No AABB replacement, polygon neighborhood clearing, fake courtyard holes, or bottom faces. Earcut roof area compared against input ring. Roof normals +Y, wall normals flat per edge; indexed triangles.',facadePolicy:'Original deterministic64px generic repeating window/mullion texture and five material families; illustrative, not measured facade, roof material or floor spacing. Roof UV pinned to plain border color.',excludedBuildings:exclusions,nSeoulExactFootprintOverlaps:nSeoulOverlaps,nSeoulPolicy:'No proximity exclusion. Own tower excluded only if its exact identity is established; near pavilions and facilities retained.',totals,failures,warnings,streamingAdvice:{loadByDistanceToTileBounds:true,maxConcurrentFetches:3,desktopSuggestedRadiusMeters:2400,mobileSuggestedRadiusMeters:1400,keepBudgetMiB:96,notes:'Suggestions, not measured runtime performance. Load near tiles first; unload geometries/materials/textures when far. All-city byte size is not the startup payload.'},tiles};
fs.writeFileSync(path.join(path.dirname(out),'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(totals,null,2));if(failures.length){console.error('Failed source footprints:',failures.length);process.exitCode=2;}
