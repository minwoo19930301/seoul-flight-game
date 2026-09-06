export function distanceToTile(tile,point){
  const {min,max}=tile.bounds;
  return Math.hypot(Math.max(min[0]-point.x,0,point.x-max[0]),Math.max(min[2]-point.z,0,point.z-max[2]));
}
// Bounded concurrent loading, tile-local geometry, and disposal when leaving a district.
export class CityStream {
  constructor(tiles,{load,attach,dispose,onStatus=()=>{},radius=3500,releaseRadius=4500,concurrency=4}){
    Object.assign(this,{tiles,load,attach,dispose,onStatus,radius,releaseRadius,concurrency});
    this.entries=new Map();this.queue=[];this.active=0;this.center={x:0,z:0};
  }
  update(center){
    this.center={x:center.x,z:center.z};
    for(const [id,entry] of this.entries){
      if(distanceToTile(entry.tile,this.center)<=this.releaseRadius)continue;
      this.entries.delete(id);entry.obsolete=true;
      if(entry.object)this.dispose(entry.object);
      if(entry.status==='queued')entry.resolve(null);
    }
    const desired=this.tiles.filter(tile=>distanceToTile(tile,this.center)<=this.radius)
      .sort((a,b)=>distanceToTile(a,this.center)-distanceToTile(b,this.center));
    for(const tile of desired){
      if(this.entries.has(tile.id))continue;
      const entry={tile,status:'queued',obsolete:false};
      entry.promise=new Promise(resolve=>entry.resolve=resolve);
      this.entries.set(tile.id,entry);this.queue.push(entry);
    }
    this.queue.sort((a,b)=>distanceToTile(a.tile,this.center)-distanceToTile(b.tile,this.center));
    this.pump();this.status();
    return Promise.all(desired.map(tile=>this.entries.get(tile.id).promise));
  }
  pump(){
    while(this.active<this.concurrency&&this.queue.length){
      const entry=this.queue.shift();if(entry.obsolete)continue;
      this.active++;entry.status='loading';
      Promise.resolve().then(()=>this.load(entry.tile)).then(object=>{
        if(entry.obsolete)this.dispose(object);
        else {entry.object=object;entry.status='ready';this.attach(object,entry.tile);}
        entry.resolve(object);
      },error=>{entry.status='failed';entry.error=String(error);entry.resolve(null);})
        .finally(()=>{this.active--;this.pump();this.status();});
    }
  }
  status(){
    const entries=[...this.entries.values()];
    this.onStatus({ready:entries.filter(e=>e.status==='ready').length,total:entries.length,failed:entries.filter(e=>e.status==='failed').length});
  }
  retry(){
    for(const [id,entry] of this.entries)if(entry.status==='failed')this.entries.delete(id);
    return this.update(this.center);
  }
}
