// CPU-only module execution with local-file fetch and an in-memory worker port.
// No browser, DOM, WebGL or application preview is created.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadCompressedJson} from '../compressed-assets.mjs';
import {CityWorkerClient} from '../city-worker-client.mjs';

test('actual gzip loader handles gzip bytes, server-decoded JSON and HTTP errors',async()=>{
  const previous=globalThis.fetch;
  try{
    const url=new URL('../assets/full-seoul/districts.json.gz',import.meta.url);
    globalThis.fetch=async()=>new Response(fs.readFileSync(url));
    assert.equal((await loadCompressedJson('local-fixture')).features.length,25);
    globalThis.fetch=async()=>new Response('{"ok":true}');assert.deepEqual(await loadCompressedJson('decoded-fixture'),{ok:true});
    globalThis.fetch=async()=>new Response('offline',{status:503});await assert.rejects(loadCompressedJson('error-fixture'),/503/);
  }finally{globalThis.fetch=previous;}
});

test('actual worker resolves local tile URLs, returns typed geometry and shares concurrent source fetches',async()=>{
  const previousFetch=globalThis.fetch,previousSelf=globalThis.self;
  const messages=[];let fetches=0;
  try{
    globalThis.self={postMessage:(message,transfers)=>messages.push({message,transfers})};
    globalThis.fetch=async url=>{fetches++;return new Response(fs.readFileSync(url));};
    await import('../city-worker.mjs');
    const base=new URL('../assets/full-seoul/',import.meta.url);
    const terrain=JSON.parse(fs.readFileSync(new URL('terrain/elevation.json',base)));
    const city=JSON.parse(fs.readFileSync(new URL('city-manifest.json',base)));
    const tile=city.tiles.reduce((a,b)=>a.features>b.features?a:b);
    await self.onmessage({data:{id:1,type:'init',terrain}});
    await Promise.all(['near','far'].map((lod,index)=>self.onmessage({data:{id:index+2,type:'tile',tile:{...tile,lod}}})));
    assert.equal(fetches,1);assert.equal(messages[0].message.ready,true);
    const results=messages.slice(1);assert.equal(results.reduce((sum,r)=>sum+r.message.result.stats.features,0),tile.features);
    for(const r of results){assert.ok(r.transfers.every(b=>b instanceof ArrayBuffer));assert.ok(r.message.result.groups[0].position instanceof Float32Array);}
  }finally{globalThis.fetch=previousFetch;if(previousSelf===undefined)delete globalThis.self;else globalThis.self=previousSelf;}
});

test('worker client restarts after fatal worker error and disposal forbids further requests',async()=>{
  const workers=[];
  class Port{
    constructor(){workers.push(this);}
    postMessage(data){queueMicrotask(()=>{if(data.type==='init')this.onmessage({data:{id:data.id,ready:true}});else if(workers.length===1)this.onerror({message:'fixture crash'});else this.onmessage({data:{id:data.id,result:{ok:true}}});});}
    terminate(){this.terminated=true;}
  }
  const client=new CityWorkerClient({}, {WorkerClass:Port});
  await assert.rejects(client.load({}),/fixture crash/);
  assert.deepEqual(await client.load({}),{ok:true});assert.equal(workers.length,2);assert.equal(workers[0].terminated,true);
  client.dispose();await assert.rejects(client.load({}),/종료/);
});

test('init timeout rejects all waiters and the next load initializes a fresh worker',async()=>{
  const workers=[];
  class Port{
    constructor(){workers.push(this);this.number=workers.length;}
    postMessage(data){if(this.number===1)return;queueMicrotask(()=>this.onmessage({data:{id:data.id,...(data.type==='init'?{ready:true}:{result:{ok:true}})}}));}
    terminate(){this.terminated=true;}
  }
  const client=new CityWorkerClient({}, {WorkerClass:Port,timeoutMs:10});
  try{
    await assert.rejects(client.load({}),/시간 초과/);
    assert.ok(client.failure);assert.equal(client.pending.size,0);assert.equal(workers[0].terminated,true);
    assert.deepEqual(await client.load({}),{ok:true});assert.equal(workers.length,2);assert.equal(client.failure,null);
  }finally{client.dispose();}
});

test('tile timeout restarts a stuck worker and late old-worker errors cannot poison recovery',async()=>{
  const workers=[];
  class Port{
    constructor(){workers.push(this);this.number=workers.length;}
    postMessage(data){
      if(data.type==='init')queueMicrotask(()=>this.onmessage({data:{id:data.id,ready:true}}));
      else if(this.number>1)queueMicrotask(()=>this.onmessage({data:{id:data.id,result:{fresh:true}}}));
    }
    terminate(){this.terminated=true;}
  }
  const client=new CityWorkerClient({}, {WorkerClass:Port,timeoutMs:10});
  try{
    const results=await Promise.allSettled([client.load({}),client.load({})]);
    assert(results.every(r=>r.status==='rejected'&&/시간 초과/.test(r.reason.message)));
    assert.equal(client.pending.size,0);
    const recovery=client.load({});
    workers[0].onerror({message:'late terminated-worker failure'});
    assert.deepEqual(await recovery,{fresh:true});assert.equal(client.failure,null);assert.equal(workers.length,2);
  }finally{client.dispose();}
});

test('init protocol errors and postMessage failures can retry instead of retaining rejected ready',async()=>{
  for(const failure of ['protocol','post']){
    const workers=[];
    class Port{
      constructor(){workers.push(this);this.number=workers.length;}
      postMessage(data){
        if(this.number===1&&failure==='post')throw Error('init clone failed');
        queueMicrotask(()=>this.onmessage({data:{id:data.id,...(this.number===1?{error:'init rejected'}:data.type==='init'?{ready:true}:{result:{ok:true}})}}));
      }
      terminate(){this.terminated=true;}
    }
    const client=new CityWorkerClient({}, {WorkerClass:Port});
    try{
      await assert.rejects(client.ready,/init/);
      assert.deepEqual(await client.load({}),{ok:true});assert.equal(workers.length,2);
    }finally{client.dispose();}
  }
});

test('dispose during the ready continuation never sends a tile or leaves a timeout pending',async()=>{
  const posts=[];
  class Port{
    postMessage(data){posts.push(data.type);queueMicrotask(()=>this.onmessage({data:{id:data.id,ready:true}}));}
    terminate(){this.terminated=true;}
  }
  const client=new CityWorkerClient({}, {WorkerClass:Port});await client.ready;
  const loading=client.load({});client.dispose();client.dispose();
  await assert.rejects(loading,/종료/);await assert.rejects(client.request({type:'tile'}),/종료/);
  assert.deepEqual(posts,['init']);assert.equal(client.pending.size,0);
});
