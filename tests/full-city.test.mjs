import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {validateSceneContract} from '../scene-contract.mjs';
import {displayHeight,isFarFeature,buildCityGeometry} from '../city-geometry.mjs';
import {localMetreProjection} from '../geographic-model.mjs';
import {terrainLod,safeFlightFloor} from '../terrain-lod.mjs';
import {sampleLocalElevation} from '../terrain-model.mjs';
import {createTerrainGeometry} from '../terrain-geometry.mjs';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root)),json=p=>JSON.parse(read(p));
const map=json('assets/full-seoul/scene.json'),terrain=json('assets/full-seoul/terrain/elevation.json'),city=json('assets/full-seoul/city-manifest.json');
const data={map,terrain,city,districts:json('assets/full-seoul/source/districts.geojson'),references:json('assets/landmarks/references.json')};

test('full-city source contract covers 25 districts, 365456 buildings and 1684 parts without a raster',()=>{
  const c=validateSceneContract(data);assert.equal(c.buildings,365456);assert.equal(c.parts,1684);assert.equal(c.districts,25);
  assert.ok(c.widthM>37000&&c.widthM<37010&&c.depthM>30380&&c.depthM<30390);
  assert.equal(city.totals.renderFeatures,366746);assert.equal(city.tiles.length,657);
  assert.throws(()=>validateSceneContract({...data,districts:{features:data.districts.features.slice(1)}}),/25개 구/);
  assert.throws(()=>validateSceneContract({...data,city:{...city,tiles:city.tiles.slice(1)}}),/타일 목록/);
  assert.throws(()=>validateSceneContract({...data,terrain:{...terrain,bbox:{...terrain.bbox,maxLat:37.59}}}),/좌표 범위/);
});

test('all 25 real district destinations use the same metre projection and safe ceiling envelope',()=>{
  const p=localMetreProjection(map.bbox),lod=terrainLod(terrain,420);
  for(const d of map.districts){
    const point=p.project(...d.coordinate);assert.ok(Math.hypot(point.x-d.position[0],point.z-d.position[1])<1e-6);
    const [x,z]=d.position;assert.ok(Math.abs(x)<p.width/2-50&&Math.abs(z)<p.depth/2-50);
    assert.ok(safeFlightFloor(terrain,lod,x,z)+430<1520);
  }
});

test('display heights distinguish source, floor, parent and missing estimates without clipping skyscrapers',()=>{
  assert.deepEqual(displayHeight({height:554.5}),{height:554.5,status:'source',estimated:false});
  assert.equal(displayHeight({height:null,floors:12}).height,37.2);
  assert.equal(displayHeight({height:null,parentHeight:45}).status,'parent-estimate');
  assert.deepEqual(displayHeight({height:null}),{height:8,status:'missing-estimate',estimated:true});
  assert.equal(isFarFeature({height:25,areaM2:20}),true);assert.equal(isFarFeature({height:null,areaM2:30}),false);
});

test('closed outer contours, holes and rotated concavity survive both disjoint LOD categories',()=>{
  const tile={origin:[0,0,0],items:[{id:'courtyard',polygons:[[[[0,0],[10,0],[10,10],[0,10],[0,0]],[[2,2],[2,4],[4,4],[4,2],[2,2]]]],anchor:[5,5],height:30,areaM2:96},
    {id:'concave',polygons:[[[[0,15],[4,19],[7,16],[5,14],[7,12],[3,12],[0,15]]]],anchor:[4,15],height:null,areaM2:24}]};
  const flat={width:2,height:2,elevations:[20,20,20,20],projectedWidthM:100,projectedDepthM:100};
  const near=buildCityGeometry(tile,flat,'near'),far=buildCityGeometry(tile,flat,'far');
  assert.equal(near.stats.features,1);assert.equal(far.stats.features,1);assert.equal(far.stats.holes,1);
  assert.ok(far.stats.roofAreaError<1e-10);assert.equal(near.stats.estimated,1);assert.equal(far.stats.source,1);
});

test('visual terrain LOD is bounded while source samples and safety floor remain intact',()=>{
  const desktop=terrainLod(terrain,420),mobile=terrainLod(terrain,280);
  assert.ok((desktop.width-1)*(desktop.height-1)*2<300000);assert.ok((mobile.width-1)*(mobile.height-1)*2<135000);
  const mesh=createTerrainGeometry(desktop,desktop.projectedWidthM,desktop.projectedDepthM);
  assert.equal(mesh.index.count/3,(desktop.width-1)*(desktop.height-1)*2);
  assert.equal(terrain.elevations.length,557848);
  const p=localMetreProjection(map.bbox).project(126.8067251,37.5982363);
  assert.ok(sampleLocalElevation(terrain,p.x,p.z)<-50);assert.ok(safeFlightFloor(terrain,desktop,p.x,p.z)>=18);
  assert.equal(createHash('sha256').update(read('assets/full-seoul/terrain/elevation.json')).digest('hex'),city.source.terrainSha256);
});

test('startup payload is below 2.5MB before runtime libraries, landmarks and nearby chunks; source databases stay cold',()=>{
  const files=['scene.json','city-manifest.json','terrain/elevation.json.gz','districts.json.gz','water/water.geojson.gz'];
  assert.ok(files.reduce((sum,p)=>sum+read('assets/full-seoul/'+p).length,0)<2500000);
  assert.deepEqual(JSON.parse(gunzipSync(read('assets/full-seoul/terrain/elevation.json.gz'))),terrain);
  const source=read('seoul-flight.mjs').toString(),init=source.slice(source.indexOf('async function init()'),source.indexOf('function showFatalError'));
  assert.doesNotMatch(init,/seoul-scene-data|raster|district-data/);
  assert.match(source,/new CityWorkerClient\(runtime.terrain\)/);assert.match(source,/concurrency:3/);
});
