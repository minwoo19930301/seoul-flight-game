// GeoJSON shells and holes stay together throughout projection and rendering.
export function projectWater(collection,project){
  if(collection?.type!=='FeatureCollection')throw new TypeError('Water FeatureCollection missing');
  return collection.features.flatMap(({geometry})=>{
    const polygons=geometry?.type==='Polygon'?[geometry.coordinates]:geometry?.type==='MultiPolygon'?geometry.coordinates:null;
    if(!polygons)throw new TypeError('Water Polygon or MultiPolygon required');
    return polygons.map(polygon=>polygon.map(ring=>{
      if(ring.length<4)throw new RangeError('Water ring requires a closed contour');
      return ring.map(([lon,lat])=>{const {x,z}=project(lon,lat);return [x,z];});
    }));
  });
}
