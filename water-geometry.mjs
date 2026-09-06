import * as THREE from './vendor/three.module.js';
// Clip source banks to the loaded map; never turn an 85 km river centreline into a ribbon.
export function clipPolygon(points,bounds){
  let result=points.map(p=>[...p]);
  for(const [axis,value,sign] of [[0,bounds.minX,1],[0,bounds.maxX,-1],[1,bounds.minZ,1],[1,bounds.maxZ,-1]]){
    const output=[];
    for(let i=0;i<result.length;i++){
      const a=result[i],b=result[(i+1)%result.length];
      const insideA=(a[axis]-value)*sign>=0,insideB=(b[axis]-value)*sign>=0;
      if(insideA)output.push(a);
      if(insideA!==insideB){const t=(value-a[axis])/(b[axis]-a[axis]);output.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}
    }
    result=output;
  }
  return result;
}
function clipTriangle(subject,clip){
  let result=subject;
  const cross=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
  const sign=Math.sign(cross(clip[0],clip[1],clip[2]))||1;
  for(let edge=0;edge<3&&result.length;edge++){
    const a=clip[edge],b=clip[(edge+1)%3],output=[];
    for(let i=0;i<result.length;i++){
      const p=result[i],q=result[(i+1)%result.length],dp=cross(a,b,p)*sign,dq=cross(a,b,q)*sign;
      if(dp>=0)output.push(p);
      if((dp>=0)!==(dq>=0)){const t=dp/(dp-dq);output.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}
    }
    result=output;
  }
  return result;
}
export function makeWaterGeometry(polygons,bounds,heightAt,{columns=16,rows=16}={}){
  const positions=[],dx=(bounds.maxX-bounds.minX)/columns,dz=(bounds.maxZ-bounds.minZ)/rows;
  for(const input of polygons){
    const rings=typeof input[0]?.[0]==='number'?[input]:input;
    if(!rings.length||rings[0].length<3)continue;
    const contour=rings[0].map(([x,z])=>new THREE.Vector2(x,z));
    const holes=rings.slice(1).map(r=>r.map(([x,z])=>new THREE.Vector2(x,z)));
    // ShapeUtils removes closing duplicates in place. Flatten AFTER this call,
    // otherwise every hole's face indices address the wrong source vertex.
    const faces=THREE.ShapeUtils.triangulateShape(contour,holes);
    const vertices=[...contour,...holes.flat()];
    for(const face of faces){
      const triangle=face.map(i=>[vertices[i].x,vertices[i].y]);
      const minX=Math.min(...triangle.map(p=>p[0])),maxX=Math.max(...triangle.map(p=>p[0]));
      const minZ=Math.min(...triangle.map(p=>p[1])),maxZ=Math.max(...triangle.map(p=>p[1]));
      const c0=Math.max(0,Math.floor((minX-bounds.minX)/dx)),c1=Math.min(columns-1,Math.floor((maxX-bounds.minX)/dx));
      const r0=Math.max(0,Math.floor((minZ-bounds.minZ)/dz)),r1=Math.min(rows-1,Math.floor((maxZ-bounds.minZ)/dz));
      for(let row=r0;row<=r1;row++)for(let col=c0;col<=c1;col++){
        const x=bounds.minX+col*dx,z=bounds.minZ+row*dz;
        const a=[x,z],b=[x,z+dz],c=[x+dx,z+dz],d=[x+dx,z];
        for(const terrainTriangle of [[a,b,d],[b,c,d]]){
          const clipped=clipTriangle(triangle,terrainTriangle);
          for(let i=1;i<clipped.length-1;i++){
            const [p,q,r]=[clipped[0],clipped[i],clipped[i+1]];
            if(Math.abs((q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]))<1e-7)continue;
            const upward=(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0])<0;
            for(const point of upward?[p,q,r]:[p,r,q])positions.push(point[0],heightAt(point[0],point[1])+.3,point[1]);
          }
        }
      }
    }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.computeVertexNormals();geometry.computeBoundingSphere();return geometry;
}
