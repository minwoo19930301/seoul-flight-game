// CPU-only execution of actual source functions, not a browser/DOM/WebGL test.
// Rendering/event effects are excluded; Three.js camera matrices are CPU objects.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from '../vendor/three.module.js';
import {FlightInputs,updateAttitude,yawToTarget} from '../flight-model.mjs';
import {localMetreProjection} from '../geographic-model.mjs';
import {sampleLocalElevation} from '../terrain-model.mjs';
import {projectWater} from '../water-model.mjs';

const source=fs.readFileSync(new URL('../seoul-flight.mjs',import.meta.url),'utf8');
const json=path=>JSON.parse(fs.readFileSync(new URL(path,import.meta.url)));
const terrain=json('../assets/terrain/elevation.json');
const references=json('../assets/landmarks/references.json');
const water=json('../assets/water/water.geojson');
const map=json('../assets/seoul-scene-data.json');
const functions=['configureSeoulMap','projectLine','projectBuilding','polygonSignedArea','polygonCentroid','normalizeBuildingHeight','pickLongestLine','polylineLength','getTerrainHeight','horizontalDistance','updateFlight','updateCamera','enforceBoundary','shortestAngle','getRelativeBearing','getHeadingRadians','updateCheckpoints'];
const functionSource=functions.map(name=>{
  const match=source.match(new RegExp(`^function ${name}\\([^]*?^}`, 'm'));
  assert.ok(match,`source function ${name} must remain inspectable`);return match[0];
}).join('\n');

function setup(){
  let now=0;
  const context=vm.createContext({
    THREE,updateAttitude,yawToTarget,localMetreProjection,sampleLocalElevation,projectWater,
    world:vm.runInNewContext(`(${source.match(/const world =\s*({[^;]+});/)[1]})`),
    state:{mode:'running',position:new THREE.Vector3(),forward:new THREE.Vector3(),yaw:0,pitch:0,roll:0,speed:68,checkpointIndex:0},
    input:new FlightInputs().state,
    runtime:{terrain,landmarkReferences:references,waterData:water,lookRollVelocity:0,pointerLocked:false,camera:new THREE.PerspectiveCamera(76,1,.5,36000),cockpitLight:{intensity:.48},checkpointGroups:[]},
    dom:{miniMap:{width:240}},riverPath:[],landmarkDefs:[],checkpointDefs:[],
    performance:{now:()=>now},window:{matchMedia:()=>({matches:false})},
    updateCheckpointVisuals:()=>{},finishRun:()=>{context.state.mode='complete';},
  });
  vm.runInContext(functionSource,context);
  context.configureSeoulMap(map);
  const first=context.checkpointDefs[0];
  context.state.position.set(Math.max(-context.world.width/2+context.world.boundaryPadding+20,first.x-360),first.y,first.z+36);
  context.state.yaw=yawToTarget(context.state.position,first);
  context.tick=dt=>{now+=dt*1000;context.updateFlight(dt);context.updateCheckpoints(now);};
  return context;
}

for(const hz of [20,60,120])test(`actual flight functions reach all five source landmarks through continuous keyboard controls at ${hz} Hz`,()=>{
  const t=setup(),dt=1/hz;
  let elapsed=0,flown=0;
  while(t.state.mode==='running'&&elapsed<900){
    const target=t.checkpointDefs[t.state.checkpointIndex],p=t.state.position;
    const distance=Math.hypot(target.x-p.x,target.z-p.z);
    const yawError=t.shortestAngle(t.state.yaw,yawToTarget(p,target));
    // Test-only bounded bang-bang keyboard pilot. No position/yaw teleporting.
    t.input.bankLeft=yawError>.012;t.input.bankRight=yawError<-.012;
    const desiredPitch=Math.max(-.25,Math.min(.35,Math.atan2(target.y-p.y,Math.max(distance,250))));
    const pitchError=desiredPitch-t.state.pitch;
    t.input.pitchUp=pitchError>.008;t.input.pitchDown=pitchError<-.008;
    const before=p.clone();t.tick(dt);flown+=p.distanceTo(before);elapsed+=dt;
    assert.ok(p.toArray().every(Number.isFinite));
    assert.ok(Math.abs(p.x)<=t.world.width/2-t.world.boundaryPadding+.001);
    assert.ok(Math.abs(p.z)<=t.world.depth/2-t.world.boundaryPadding+.001);
    assert.ok(p.y<=t.world.ceiling&&p.y>=sampleLocalElevation(terrain,p.x,p.z)+18-.001);
    assert.ok(p.distanceTo(before)<120*dt+.001,'continuous motion, not test warping');
  }
  assert.equal(t.state.checkpointIndex,5,`reached ${t.state.checkpointIndex} / 5 after ${elapsed}s`);
  assert.equal(t.state.mode,'complete');assert.ok(flown>20000&&elapsed>250);
});

test('actual flight clamps terrain, ceiling and all four boundary approaches',()=>{
  const t=setup(),x=t.world.width/2-t.world.boundaryPadding,z=t.world.depth/2-t.world.boundaryPadding;
  for(const [px,pz,yaw] of [[x+1,0,-Math.PI/2],[-x-1,0,Math.PI/2],[0,z+1,Math.PI],[0,-z-1,0]]){
    t.state.position.set(px,500,pz);t.state.yaw=yaw;t.enforceBoundary(1);t.updateFlight(1/60);
    assert.ok(Math.abs(t.state.position.x)<x&&Math.abs(t.state.position.z)<z);
    assert.ok(t.state.forward.x*px+t.state.forward.z*pz<0,'forward points inward');
  }
  t.state.position.set(0,-500,0);t.state.pitch=-.4;t.updateFlight(1/60);
  assert.ok(t.state.position.y>=t.getTerrainHeight(t.state.position.x,t.state.position.z)+18-.001);
  t.state.position.y=1500;t.state.pitch=.4;t.updateFlight(1/60);
  assert.equal(t.state.position.y,t.world.ceiling);assert.ok(t.state.pitch<=0);
});

test('minimap keeps its geographic intrinsic aspect at desktop and mobile CSS widths',()=>{
  const t=setup();
  assert.equal(t.dom.miniMap.height,Math.round(t.dom.miniMap.width*t.world.depth/t.world.width));
  const css=fs.readFileSync(new URL('../seoul-flight.css',import.meta.url),'utf8');
  const rules=[...css.matchAll(/#mini-map\s*\{([^}]+)\}/g)].map(m=>m[1]);
  assert.ok(rules.length>=2);
  for(const rule of rules)for(const height of rule.matchAll(/(?:^|;)\s*height:\s*([^;]+)/g))assert.equal(height[1].trim(),'auto');
});
