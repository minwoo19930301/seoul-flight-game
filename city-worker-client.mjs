// Worker keeps gzip/JSON parsing, hole triangulation and extrusion off the UI thread.
export class CityWorkerClient{
  constructor(terrain,{WorkerClass=globalThis.Worker,timeoutMs=60000}={}){
    this.terrain=terrain;this.WorkerClass=WorkerClass;this.timeoutMs=timeoutMs;this.pending=new Map();this.sequence=0;this.disposed=false;this.initialize();
  }
  initialize(){
    const worker=new this.WorkerClass(new URL('./city-worker.mjs',import.meta.url),{type:'module'});
    this.worker=worker;this.failure=null;
    worker.onmessage=({data})=>{
      if(this.disposed||this.worker!==worker)return;
      const p=this.pending.get(data.id);if(!p)return;
      if(data.error&&p.type==='init'){this.failWorker(Error(data.error),worker);return;}
      clearTimeout(p.timer);this.pending.delete(data.id);data.error?p.reject(Error(data.error)):p.resolve(data.result??data.ready);
    };
    worker.onerror=event=>this.failWorker(Error(event.message||'건물 작업자 오류'),worker);
    this.ready=this.request({type:'init',terrain:this.terrain});
    // No nearby tile is required to exist; init failure must not become an
    // unhandled rejection while the first consumer is still outside the radius.
    void this.ready.catch(()=>{});
  }
  failWorker(error,worker){
    if(this.disposed||this.worker!==worker)return;
    this.failure=error;
    for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(error);}
    this.pending.clear();worker.terminate();
  }
  request(message){
    if(this.disposed)return Promise.reject(Error('건물 작업자 종료'));
    if(this.failure)return Promise.reject(this.failure);
    const worker=this.worker;
    return new Promise((resolve,reject)=>{
      const id=++this.sequence;
      const timer=setTimeout(()=>{
        // A timed-out worker may be stuck parsing/triangulating, or its init
        // promise may be permanently rejected. Restart it on the next load.
        this.failWorker(Error('건물 자료 처리 시간 초과 · 재시도 가능'),worker);
      },this.timeoutMs);
      this.pending.set(id,{resolve,reject,timer,type:message.type});
      try{worker.postMessage({id,...message});}catch(error){this.failWorker(error,worker);}
    });
  }
  async load(tile){
    if(this.disposed)throw Error('건물 작업자 종료');
    if(this.failure)this.initialize();
    await this.ready;return this.request({type:'tile',tile});
  }
  dispose(){if(this.disposed)return;this.disposed=true;this.worker.terminate();for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(Error('건물 작업자 종료'));}this.pending.clear();}
}
