#!/usr/bin/env python3
"""Offline Overture source packaging. No credentials or network operations.

Copy only the documented public allowlists and spatially split original outlines
into metre-based 1 km chunks. Subtract parts from parent outlines to avoid double
extrusion. Source geometry remains unchanged in the retained source database.
"""
import argparse, gzip, hashlib, json, math, shutil
from pathlib import Path
from shapely.geometry import shape, mapping, Point
from shapely.ops import unary_union

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/full-seoul'
R=6378137

def write_json(path,obj,compressed=False):
    path.parent.mkdir(parents=True,exist_ok=True)
    data=json.dumps(obj,ensure_ascii=False,separators=(',',':'),allow_nan=False).encode()
    path.write_bytes(gzip.compress(data,mtime=0) if compressed else data+b'\n')
    return len(path.read_bytes()),hashlib.sha256(path.read_bytes()).hexdigest()

def public_copy(source,destination,names):
    destination.mkdir(parents=True,exist_ok=True)
    for name in names:
        f=source/name
        if f.resolve()==(destination/name).resolve(): continue
        if f.is_dir(): shutil.copytree(f,destination/name,dirs_exist_ok=True)
        else: shutil.copy2(f,destination/name)

def features(source,manifest,kind):
    for file in manifest['files']:
        if file['type']==kind:
            with gzip.open(source/file['path'],'rt') as stream:
                for line in stream: yield json.loads(line)

def main():
    global OUT
    ap=argparse.ArgumentParser();ap.add_argument('--buildings',type=Path,required=True);ap.add_argument('--terrain',type=Path,required=True)
    ap.add_argument('--water',type=Path);ap.add_argument('--base-map',type=Path,default=ROOT/'assets/seoul-scene-data.json');ap.add_argument('--output',type=Path,default=OUT)
    args=ap.parse_args();src=args.buildings;terrain=args.terrain
    OUT=args.output;water_source=args.water or terrain
    manifest=json.loads((src/'manifest.json').read_text());bbox=manifest['bbox']
    public_copy(src,OUT/'source',['district-data','manifest.json','boundary-manifest.json','seoul-boundary.geojson','districts.geojson','validation.json','release-check.json','ATTRIBUTION.md'])
    public_copy(terrain,OUT/'terrain',['elevation.json','source-tiles','manifest.json','scope.json','terrain-quality-audit.json','terrain-verification.json'])
    public_copy(water_source,OUT/'water',['water.geojson','water-source-features.geojson','provenance.json','water-validation.json'])
    factor=math.cos(math.radians((bbox['minLat']+bbox['maxLat'])/2))
    mx=lambda lon:R*math.radians(lon)
    my=lambda lat:R*math.log(math.tan(math.pi/4+math.radians(lat)/2))
    cx=(mx(bbox['minLon'])+mx(bbox['maxLon']))/2;cy=(my(bbox['minLat'])+my(bbox['maxLat']))/2
    project=lambda lon,lat: [(mx(lon)-cx)*factor,-(my(lat)-cy)*factor]
    width=(mx(bbox['maxLon'])-mx(bbox['minLon']))*factor;depth=(my(bbox['maxLat'])-my(bbox['minLat']))*factor
    districts=json.loads((src/'districts.geojson').read_text())['features']
    district_meta=[]
    for f in districts:
        p=shape(f['geometry']).representative_point()
        district_meta.append({'id':f['id'],'name':f['properties']['names']['primary'],'position':project(p.x,p.y),'coordinate':[p.x,p.y]})
    parts=list(features(src,manifest,'building_part'));by_parent={}
    for f in parts: by_parent.setdefault(f['properties']['building_id'],[]).append(f)
    exclusions=[];parent_info={};tiles={};counts={'inputBuildings':manifest['totals']['building']['count'],'inputParts':manifest['totals']['building_part']['count'],'renderFeatures':0,'renderPolygons':0,'holes':0,'parentResiduals':0,'excludedLandmarkFeatures':0,'fullyCoveredParents':0}
    exclude_osm={64989671,170199428,74056379,914963586}
    nseoul_point=Point(126.9882805,37.55127)
    def excluded(f):
        p=f['properties']
        for source in p.get('sources',[]):
            record=source.get('record_id','') or ''
            if record.startswith('w') and record.split('@')[0][1:].isdigit() and int(record.split('@')[0][1:]) in exclude_osm:return True
        name=(p.get('names') or {}).get('primary','')
        return ('서울타워' in name or 'N Seoul Tower' in name) and shape(f['geometry']).covers(nseoul_point)
    def output(f,geom,anchor,parent_height=None):
        if geom.is_empty:return
        p=f['properties'];ground=project(*anchor)
        center=geom.representative_point();local_center=project(center.x,center.y)
        tx=math.floor(local_center[0]/1000);tz=math.floor(local_center[1]/1000);key=f'{tx},{tz}'
        tile=tiles.setdefault(key,{'id':key,'origin':[(tx+.5)*1000,0,(tz+.5)*1000],'items':[]})
        polygons=[geom] if geom.geom_type=='Polygon' else list(geom.geoms)
        rings=[]
        for poly in polygons:
            if poly.geom_type!='Polygon' or poly.area<=0:continue
            rr=[]
            for ring in [poly.exterior,*poly.interiors]:
                rr.append([[q[0]-tile['origin'][0],q[1]-tile['origin'][2]] for ll in ring.coords for q in [project(*ll)]])
            rings.append(rr)
        if not rings:return
        area=sum(poly.area for poly in polygons)*((math.pi*R/180)**2)*factor
        item={'id':f['id'],'polygons':rings,'anchor':ground,'height':p.get('height'),'minHeight':p.get('min_height'),
          'floors':p.get('num_floors'),'minFloor':p.get('min_floor'),'parentHeight':parent_height,'kind':p.get('subtype') or p.get('class'),
          'type':p['feature_type'],'districtId':p['_seoul']['district_id'],'areaM2':area}
        tile['items'].append(item);counts['renderFeatures']+=1;counts['renderPolygons']+=len(rings);counts['holes']+=sum(len(x)-1 for x in rings)
    excluded_parents=set()
    for f in features(src,manifest,'building'):
        geom=shape(f['geometry']);point=geom.representative_point();anchor=[point.x,point.y]
        if f['id'] in by_parent:parent_info[f['id']]={'anchor':anchor,'height':f['properties'].get('height')}
        if excluded(f):
            excluded_parents.add(f['id']);exclusions.append({'id':f['id'],'sources':f['properties']['sources'],'reason':'Exact identified bespoke landmark replacement'});continue
        if f['id'] in by_parent:
            # Real geometric difference, not a blanket missing parent or a second roof.
            residual=geom.difference(unary_union([shape(p['geometry']) for p in by_parent[f['id']]]))
            if residual.is_empty:counts['fullyCoveredParents']+=1;continue
            counts['parentResiduals']+=1;geom=residual
        output(f,geom,anchor)
    for f in parts:
        parent_id=f['properties']['building_id'];info=parent_info[parent_id]
        if parent_id in excluded_parents:
            exclusions.append({'id':f['id'],'parent':parent_id,'reason':'Part of exact identified bespoke landmark'});continue
        output(f,shape(f['geometry']),info['anchor'],info['height'])
    counts['excludedLandmarkFeatures']=len(exclusions)
    entries=[]
    for tile in sorted(tiles.values(),key=lambda t:t['id']):
        tile['items'].sort(key=lambda f:f['id'])
        coords=[q for item in tile['items'] for poly in item['polygons'] for ring in poly for q in ring]
        bounds={'min':[min(q[0] for q in coords)+tile['origin'][0],-200,min(q[1] for q in coords)+tile['origin'][2]],'max':[max(q[0] for q in coords)+tile['origin'][0],1800,max(q[1] for q in coords)+tile['origin'][2]]}
        url=f"tiles/{tile['id'].replace(',','_')}.json.gz";size,sha=write_json(OUT/url,tile,True)
        entries.append({'id':tile['id'],'url':url,'origin':tile['origin'],'bounds':bounds,'features':len(tile['items']),'bytes':size,'sha256':sha})
    grid=json.loads((terrain/'elevation.json').read_text());write_json(OUT/'terrain/elevation.json.gz',grid,True)
    water=json.loads((water_source/'water.geojson').read_text());write_json(OUT/'water/water.geojson.gz',water,True)
    write_json(OUT/'districts.json.gz',{'type':'FeatureCollection','features':districts},True)
    legacy=json.loads(args.base_map.read_text())
    meta={'schemaVersion':2,'scope':'Seoul administrative territory; terrain and water cover its full bounding rectangle',
      'bbox':bbox,'attribution':manifest['attribution'],'landmarks':legacy['landmarks'],'districts':district_meta,
      'sourceCounts':manifest['totals'],'ground':'Elevation-shaded vector terrain, actual water polygons; no stretched legacy raster.',
      'roads':legacy['roads'],'roadsCoverage':legacy.get('roadsCoverage',{'bbox':legacy['bbox'],'status':'Retained central-Seoul OSM roads only; not citywide road coverage'}),
      'route':legacy['route'],'waterLines':legacy['waterLines']}
    write_json(OUT/'scene.json',meta)
    city={'schemaVersion':2,'units':'metres','axes':'x east, y up, z south','tileSizeMeters':1000,
      'projection':{'bbox':bbox,'width':width,'depth':depth},'totals':{**counts,'tiles':len(entries),'bytes':sum(t['bytes'] for t in entries)},
      'sourceCounts':manifest['totals'],'source':{'manifestSha256':hashlib.sha256((src/'manifest.json').read_bytes()).hexdigest(),'terrainSha256':hashlib.sha256((terrain/'elevation.json').read_bytes()).hexdigest()},
      'exclusions':exclusions,'tiles':entries,'heightPolicy':'Original optional source height retained. Rendering distinguishes source reported, floor-based estimate, parent-height estimate, and 8m missing-height placeholder. No surveyed-height claim.',
      'partsPolicy':'Parent outline minus union of source parts, retaining residual walls/roofs; each part keeps holes and own original outline. Shared source-parent terrain base anchor.',
      'lodPolicy':'Near: all source footprints. Far: retain buildings >=24m rendered height or >=500m2 footprint; no AABB replacement. Detail fallback heights are disclosed estimates.'}
    write_json(OUT/'city-manifest.json',city)
    print(json.dumps(city['totals'],indent=2));print('Exclusions',len(exclusions))

if __name__=='__main__':main()
