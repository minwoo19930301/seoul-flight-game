export function distanceToTile(tile,point){
  const {min,max}=tile.bounds;
  return Math.hypot(Math.max(min[0]-point.x,0,point.x-max[0]),Math.max(min[2]-point.z,0,point.z-max[2]));
}
// Bounded concurrent loading, tile-local geometry, and disposal when leaving a district.
export class CityStream {
  constructor(tiles,{load,attach,dispose,onStatus=()=>{},radius=3500,releaseRadius=4500,concurrency=4}){
    Object.assign(this,{tiles,load,attach,dispose,onStatus,radius,releaseRadius,concurrency});
    this.entries=new Map();this.queue=[];this.active=0;this.center={x:0,z:0};
    this.statusError=null;
  }
  update(center){
    this.center={x:center.x,z:center.z};
    for(const [id,entry] of this.entries){
      if(distanceToTile(entry.tile,this.center)<=(entry.tile.releaseRadius??this.releaseRadius))continue;
      this.entries.delete(id);entry.obsolete=true;
      this.release(entry);
      // A caller waiting on the old district must not wait on obsolete I/O.
      // A late object is still released by pump(), never attached to a new entry.
      entry.resolve(null);
    }
    const desired=this.tiles.filter(tile=>distanceToTile(tile,this.center)<=(tile.loadRadius??this.radius))
      .sort((a,b)=>distanceToTile(a,this.center)-distanceToTile(b,this.center));
    for(const tile of desired){
      if(this.entries.has(tile.id))continue;
      const entry={tile,status:'queued',obsolete:false,settled:false,disposeAttempted:false};
      entry.promise=new Promise(resolve=>entry.resolve=value=>{
        if(entry.settled)return;entry.settled=true;resolve(value);
      });
      this.entries.set(tile.id,entry);this.queue.push(entry);
    }
    this.queue.sort((a,b)=>distanceToTile(a.tile,this.center)-distanceToTile(b.tile,this.center));
    // Capture before callbacks: a status consumer can request another district.
    const pending=desired.map(tile=>this.entries.get(tile.id).promise);
    this.pump();this.status();
    return Promise.all(pending);
  }
  fail(entry,error){
    entry.status='failed';
    const message=String(error);
    entry.error=entry.error?entry.error+'; '+message:message;
  }
  release(entry){
    if(entry.object==null||entry.disposeAttempted)return;
    const object=entry.object;
    // Mark before invoking user code: even a throwing disposer is attempted only
    // once. Do not retain the failed object or retry its partially freed geometry.
    entry.object=null;entry.disposeAttempted=true;
    try{this.dispose(object);}catch(error){this.fail(entry,error);}
  }
  pump(){
    while(this.active<this.concurrency&&this.queue.length){
      const entry=this.queue.shift();if(entry.obsolete)continue;
      this.active++;entry.status='loading';
      Promise.resolve().then(()=>entry.obsolete?null:this.load(entry.tile)).then(object=>{
        entry.object=object;
        if(entry.obsolete){this.release(entry);entry.resolve(null);return;}
        this.attach(object,entry.tile);
        entry.status='ready';entry.resolve(object);
      }).catch(error=>{
        // This catches load AND attach errors, unlike then(success, failure).
        this.fail(entry,error);this.release(entry);entry.resolve(null);
      })
        .finally(()=>{this.active--;this.pump();this.status();});
    }
  }
  status(){
    const entries=[...this.entries.values()];
    const snapshot={ready:entries.filter(e=>e.status==='ready').length,total:entries.length,failed:entries.filter(e=>e.status==='failed').length};
    // A broken status label must not turn resident geometry into failed assets or
    // reject an unrelated load. The callback is tried again on the next update.
    try{this.onStatus(snapshot);this.statusError=null;}catch(error){this.statusError=String(error);}
    return snapshot;
  }
  retry(){
    for(const [id,entry] of this.entries)if(entry.status==='failed')this.entries.delete(id);
    return this.update(this.center);
  }
}
