import {loadCompressedJson} from './compressed-assets.mjs';
import {buildCityGeometry} from './city-geometry.mjs';
let terrain;
const inflight=new Map();
self.onmessage=async({data})=>{
  const {id,type}=data;
  try{
    if(type==='init'){terrain=data.terrain;self.postMessage({id,ready:true});return;}
    if(!terrain)throw Error('Terrain not initialized');
    const url=data.tile.url;
    if(!inflight.has(url))inflight.set(url,loadCompressedJson(new URL('./assets/full-seoul/'+url,import.meta.url)));
    const tile=await inflight.get(url);
    const result=buildCityGeometry(tile,terrain,data.tile.lod);
    inflight.delete(url);
    const transfers=result.groups.flatMap(g=>Object.values(g).map(a=>a.buffer));
    self.postMessage({id,result},transfers);
  }catch(error){if(data.tile)inflight.delete(data.tile.url);self.postMessage({id,error:String(error.message||error)});}
};
