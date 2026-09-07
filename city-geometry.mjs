import {ShapeUtils,Vector2} from './vendor/three.module.js';
import {sampleLocalElevation} from './terrain-model.mjs';

// Heights are display policy, NEVER a change to the retained source database.
export function displayHeight(item){
  if(Number.isFinite(item.height)&&item.height>0)return {height:item.height,status:'source',estimated:false};
  if(Number.isFinite(item.floors)&&item.floors>0)return {height:item.floors*3.1,status:'floors-estimate',estimated:true};
  if(Number.isFinite(item.parentHeight)&&item.parentHeight>0)return {height:item.parentHeight,status:'parent-estimate',estimated:true};
  return {height:8,status:'missing-estimate',estimated:true};
}
export function isFarFeature(item){return displayHeight(item).height>=24||item.areaM2>=500;}
export function ringArea(ring){let sum=0;for(let i=0,j=ring.length-1;i<ring.length;j=i++)sum+=ring[j][0]*ring[i][1]-ring[i][0]*ring[j][1];return sum/2;}

export function buildCityGeometry(tile,terrain,lod='near'){
  const groups=[{p:[],n:[],u:[],c:[],i:[]},{p:[],n:[],u:[],c:[],i:[]}];
  const stats={features:0,source:0,estimated:0,holes:0,roofAreaError:0,skippedInvalidVolume:0,float32CollapsedTriangles:0,float32ReorientedTriangles:0};
  function vertex(g,x,y,z,nx,ny,nz,u,v,color){const id=g.p.length/3;g.p.push(x,y,z);g.n.push(nx,ny,nz);g.u.push(u,v);g.c.push(...color);return id;}
  for(const item of tile.items){
    if(lod==='far'&&!isFarFeature(item))continue;
    if(lod==='near'&&isFarFeature(item))continue;
    const height=displayHeight(item),base=sampleLocalElevation(terrain,...item.anchor);
    const minHeight=Number.isFinite(item.minHeight)?Math.max(0,item.minHeight):Number.isFinite(item.minFloor)?Math.max(0,item.minFloor*3.1):0;
    if(minHeight>=height.height){stats.skippedInvalidVolume++;continue;}
    const top=base+height.height,bottom=base+minHeight,g=groups[+height.estimated];
    const color=height.estimated?[.68,.65,.59]:[.57,.67,.72];
    for(const polygon of item.polygons){
      const rings=polygon.map(r=>r.map(([x,z])=>new Vector2(x,z)));
      const faces=ShapeUtils.triangulateShape(rings[0],rings.slice(1));
      const flat=rings.flat(),roof=flat.map(p=>vertex(g,p.x,top,p.y,0,1,0,0,0,color.map(c=>Math.min(1,c+.12))));
      let actualArea=0;
      for(const [a,b,c] of faces){
        const p=flat[a],q=flat[b],r=flat[c];
        const cross=(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);
        actualArea+=Math.abs(cross)/2;
        if(cross>0)g.i.push(roof[a],roof[c],roof[b]);else if(cross<0)g.i.push(roof[a],roof[b],roof[c]);
      }
      const expectedArea=Math.abs(ringArea(rings[0].map(v=>[v.x,v.y])))-rings.slice(1).reduce((s,r)=>s+Math.abs(ringArea(r.map(v=>[v.x,v.y]))),0);
      const error=Math.abs(actualArea-expectedArea)/Math.max(.001,expectedArea);stats.roofAreaError=Math.max(stats.roofAreaError,error);
      if(error>1e-5)throw Error('Roof triangulation changed source area: '+item.id);
      for(let ri=0;ri<rings.length;ri++){
        const ring=rings[ri],sign=(ringArea(ring.map(v=>[v.x,v.y]))>0?1:-1)*(ri===0?1:-1);
        for(let i=0;i<ring.length;i++){
          const a=ring[i],b=ring[(i+1)%ring.length],dx=b.x-a.x,dz=b.y-a.y,len=Math.hypot(dx,dz);if(len<1e-6)continue;
          // Real parent base datum stays common to all its parts. Foundation skirts
          // only extend below that base; they don't raise roof heights on slopes.
          const ya=minHeight?bottom:Math.min(bottom,sampleLocalElevation(terrain,a.x+tile.origin[0],a.y+tile.origin[2]));
          const yb=minHeight?bottom:Math.min(bottom,sampleLocalElevation(terrain,b.x+tile.origin[0],b.y+tile.origin[2]));
          const nx=sign*dz/len,nz=-sign*dx/len;
          const a0=vertex(g,a.x,ya,a.y,nx,0,nz,0,(ya-base)/3.1,color),b0=vertex(g,b.x,yb,b.y,nx,0,nz,len/3.3,(yb-base)/3.1,color);
          const at=vertex(g,a.x,top,a.y,nx,0,nz,0,height.height/3.1,color),bt=vertex(g,b.x,top,b.y,nx,0,nz,len/3.3,height.height/3.1,color);
          if(sign>0)g.i.push(a0,at,bt,a0,bt,b0);else g.i.push(a0,bt,at,a0,b0,bt);
        }
      }
      stats.holes+=rings.length-1;
    }
    stats.features++;stats[height.estimated?'estimated':'source']++;
  }
  // Tile-local Float32 conversion can collapse a source's sub-millimetre slivers.
  // Keep the double-precision source unchanged; omit only zero-area GPU faces,
  // preserve outward winding and derive flat normals from the actual GPU values.
  return {groups:groups.map(g=>{
    const position=new Float32Array(g.p),normal=new Float32Array(g.n.length),index=[];
    for(let i=0;i<g.i.length;i+=3){
      let [a,b,c]=g.i.slice(i,i+3);const ai=a*3,bi=b*3,ci=c*3,p=position;
      const ux=p[bi]-p[ai],uy=p[bi+1]-p[ai+1],uz=p[bi+2]-p[ai+2],vx=p[ci]-p[ai],vy=p[ci+1]-p[ai+1],vz=p[ci+2]-p[ai+2];
      let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const len=Math.hypot(nx,ny,nz);
      if(len<1e-10){stats.float32CollapsedTriangles++;continue;}
      if(nx*g.n[ai]+ny*g.n[ai+1]+nz*g.n[ai+2]<0){[b,c]=[c,b];nx=-nx;ny=-ny;nz=-nz;stats.float32ReorientedTriangles++;}
      index.push(a,b,c);
      for(const v of [a,b,c]){normal[v*3]+=nx/len;normal[v*3+1]+=ny/len;normal[v*3+2]+=nz/len;}
    }
    for(let i=0;i<normal.length;i+=3){const len=Math.hypot(normal[i],normal[i+1],normal[i+2]);if(len)for(let j=0;j<3;j++)normal[i+j]/=len;}
    return {position,normal,uv:new Float32Array(g.u),color:new Float32Array(g.c),index:new Uint32Array(index)};
  }),stats};
}
