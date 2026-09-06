import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import test from 'node:test';import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';import {GLTFLoader} from '../vendor/loaders/GLTFLoader.js';
import {localMetreProjection} from '../geographic-model.mjs';import {sampleLocalElevation} from '../terrain-model.mjs';
const base=new URL('../assets/landmarks/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('manifest.json',base)));
const references=JSON.parse(readFileSync(new URL('references.json',base)));
const grid=JSON.parse(readFileSync(new URL('../assets/terrain/elevation.json',import.meta.url)));
for(const asset of manifest.assets)test(`${asset.id}: shipped loader parses original GLB, physical bounds/origin and terrain placement`,async()=>{
  const bytes=readFileSync(new URL(asset.model,base));assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
  const {scene}=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
  const bounds=new THREE.Box3().setFromObject(scene),size=bounds.getSize(new THREE.Vector3());
  size.toArray().forEach((value,i)=>assert.ok(Math.abs(value-asset.dimensions[i])<.0001));assert.ok(Math.abs(bounds.min.y)<.0001);
  const reference=references.landmarks.find(r=>r.id===asset.id),p=localMetreProjection(grid.bbox).project(reference.coordinate.lon,reference.coordinate.lat);
  const ground=sampleLocalElevation(grid,p.x,p.z);scene.position.set(p.x,ground,p.z);scene.rotation.y=(reference.yawDegFromEast||0)*Math.PI/180;
  const placed=new THREE.Box3().setFromObject(scene);assert.ok(Math.abs(placed.min.y-ground)<.0001);assert.ok(placed.max.y+75<1000);
  scene.traverse(node=>{if(node.isMesh){node.geometry.dispose();for(const material of (Array.isArray(node.material)?node.material:[node.material]))material.dispose();}});
});
