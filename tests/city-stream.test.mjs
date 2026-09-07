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
test('near and far classes have independent load/release distances and reuse resident entries',async()=>{
  const near={...tile('a/near',0),loadRadius:100,releaseRadius:150};
  const far={...tile('a/far',0),loadRadius:300,releaseRadius:350};
  const attached=[],disposed=[];
  const stream=new CityStream([near,far],{load:async t=>t.id,attach:o=>attached.push(o),dispose:o=>disposed.push(o)});
  await stream.update({x:250,z:0});assert.deepEqual(attached,['a/far']);
  await stream.update({x:0,z:0});assert.deepEqual(attached,['a/far','a/near']);
  await stream.update({x:300,z:0});assert.deepEqual(disposed,['a/near']);
  await stream.update({x:600,z:0});assert.deepEqual(disposed,['a/near','a/far']);
});

function settled(promise){
  let timer;
  return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('entry promise did not settle')),1000);})]).finally(()=>clearTimeout(timer));
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));

test('attach failure settles as failed, disposes once, and retries a fresh object',async()=>{
  let broken=true,loads=0;const disposed=[],attached=[];let status;
  const stream=new CityStream([tile('a',0)],{
    load:()=>({id:++loads}),attach:o=>{attached.push(o.id);if(broken)throw Error('attach failed');},
    dispose:o=>disposed.push(o.id),onStatus:s=>status=s,
  });
  assert.deepEqual(await settled(stream.update({x:0,z:0})),[null]);await flush();
  const failed=stream.entries.get('a');
  assert.equal(failed.status,'failed');assert.match(failed.error,/attach failed/);assert.equal(failed.object,null);
  assert.equal(status.failed,1);assert.equal(status.ready,0);assert.equal(stream.active,0);assert.deepEqual(disposed,[1]);
  broken=false;const result=await settled(stream.retry());await flush();
  assert.equal(result[0].id,2);assert.equal(stream.entries.get('a').status,'ready');assert.equal(status.failed,0);
  await settled(stream.update({x:10000,z:0}));await settled(stream.update({x:10000,z:0}));
  assert.deepEqual(disposed,[1,2]);assert.deepEqual(attached,[1,2]);
});

test('synchronous load and combined attach/dispose failures settle without stopping the queue',async()=>{
  const attempts=[],released=[];
  const stream=new CityStream([tile('a',0),tile('b',100),tile('c',200)],{
    concurrency:1,load:t=>{attempts.push(t.id);if(t.id==='a')throw Error('sync load');return {id:t.id};},
    attach:o=>{if(o.id==='b')throw Error('partial attach');},
    dispose:o=>{released.push(o.id);throw Error('dispose failed');},
  });
  const result=await settled(stream.update({x:0,z:0}));await flush();
  assert.deepEqual(result.map(o=>o?.id??null),[null,null,'c']);
  assert.deepEqual(attempts,['a','b','c']);assert.deepEqual(released,['b']);assert.equal(stream.active,0);
  assert.match(stream.entries.get('b').error,/partial attach.*dispose failed/);
  assert.equal(stream.entries.get('b').object,null);
  const resident=stream.entries.get('c');
  await settled(stream.update({x:10000,z:0}));await flush();
  assert.equal(resident.status,'failed');assert.match(resident.error,/dispose failed/);assert.equal(resident.object,null);
  assert.deepEqual(released,['b','c']);assert.equal(stream.entries.size,0);
});

test('obsolete in-flight disposal failure settles old callers and cannot attach stale district geometry',async()=>{
  const requests=[],attached=[],released=[];
  const stream=new CityStream([tile('a',0),tile('b',10000)],{
    radius:300,releaseRadius:400,concurrency:1,
    load:t=>new Promise(resolve=>requests.push({id:t.id,resolve})),attach:o=>attached.push(o.id),
    dispose:o=>{released.push(o.id);throw Error('obsolete disposal failed');},
  });
  const initial=stream.update({x:0,z:0});await flush();const original=stream.entries.get('a');
  const moved=stream.update({x:10000,z:0});assert.deepEqual(await settled(initial),[null]);
  requests[0].resolve({id:'a'});await flush();assert.equal(requests[1].id,'b');requests[1].resolve({id:'b'});
  await settled(moved);await flush();
  assert.deepEqual(attached,['b']);assert.deepEqual(released,['a']);assert.equal(original.status,'failed');
  assert.equal(stream.active,0);assert.equal(stream.entries.get('b').status,'ready');
});

test('rapid A to B to A uses the new entry identity and releases the old A only once',async()=>{
  const requests=[],attached=[],released=[];
  const stream=new CityStream([tile('a',0),tile('b',10000)],{
    radius:300,releaseRadius:400,concurrency:1,
    load:t=>new Promise(resolve=>requests.push({id:t.id,resolve})),attach:o=>attached.push(o),dispose:o=>released.push(o),
  });
  const first=stream.update({x:0,z:0});await flush();
  const second=stream.update({x:10000,z:0});const third=stream.update({x:0,z:0});
  assert.deepEqual(await settled(first),[null]);assert.deepEqual(await settled(second),[null]);
  requests[0].resolve('old-a');await flush();
  assert.equal(requests.length,2);assert.equal(requests[1].id,'a');requests[1].resolve('new-a');
  assert.deepEqual(await settled(third),['new-a']);await flush();
  assert.deepEqual(attached,['new-a']);assert.deepEqual(released,['old-a']);assert.equal(stream.entries.size,1);
});

test('status callback failure is contained and retried without unloading healthy geometry',async()=>{
  let broken=true,loads=0,disposed=0;
  const stream=new CityStream([tile('a',0)],{
    load:async()=>({id:++loads}),attach:()=>{},dispose:()=>disposed++,
    onStatus:()=>{if(broken)throw Error('missing status label');},
  });
  await settled(stream.update({x:0,z:0}));await flush();
  assert.match(stream.statusError,/missing status label/);assert.equal(stream.entries.get('a').status,'ready');
  broken=false;await settled(stream.retry());await flush();
  assert.equal(stream.statusError,null);assert.equal(loads,1);assert.equal(disposed,0);
});
