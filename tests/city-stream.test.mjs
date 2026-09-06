import test from 'node:test';import assert from 'node:assert/strict';
import {CityStream,distanceToTile} from '../city-stream.mjs';
const tile=(id,x)=>({id,bounds:{min:[x,0,0],max:[x+100,100,100]}});
test('tile distances use the bounds, not their centre',()=>{assert.equal(distanceToTile(tile('a',0),{x:50,z:50}),0);assert.equal(distanceToTile(tile('a',0),{x:103,z:104}),5);});
test('concurrency is bounded and district change disposes in-flight obsolete assets',async()=>{
  let active=0,max=0;const requests=[],attached=[],disposed=[];
  const stream=new CityStream([tile('a',0),tile('b',100),tile('c',200),tile('d',10000)],{
    radius:500,releaseRadius:700,concurrency:2,
    load:t=>{active++;max=Math.max(max,active);return new Promise(resolve=>requests.push(()=>{active--;resolve(t.id);}));},
    attach:o=>attached.push(o),dispose:o=>disposed.push(o),
  });
  const initial=stream.update({x:0,z:0});await Promise.resolve();assert.equal(requests.length,2);
  const moved=stream.update({x:10000,z:0});requests.shift()();requests.shift()();
  await new Promise(resolve=>setImmediate(resolve));assert.equal(requests.length,1);requests.shift()();
  await Promise.all([initial,moved]);assert.equal(max,2);assert.deepEqual(attached,['d']);assert.deepEqual(disposed.sort(),['a','b']);assert.equal(stream.entries.size,1);
});
test('failed loads are reported and retry without duplicate resident assets',async()=>{
  let fail=true,attaches=0,status;
  const stream=new CityStream([tile('a',0)],{load:async()=>{if(fail)throw Error('offline');return {};},attach:()=>attaches++,dispose:()=>{},onStatus:s=>status=s});
  await stream.update({x:0,z:0});await new Promise(resolve=>setImmediate(resolve));assert.equal(status.failed,1);
  fail=false;await stream.retry();await stream.update({x:0,z:0});assert.equal(attaches,1);
});
