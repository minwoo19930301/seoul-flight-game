import bpy
import json
from mathutils import Vector
if bpy.context.scene.name != 'Seoul Landmark Asset Studio':raise RuntimeError('Unexpected scene')
targets={'sixtythree':(64.5,43.3,249.58),'lotte':(71.5,71.5,555),'nseoul':(28,28,236.7),'coex':(61.48,42.06,256.5),'gyeongbokgung':(47,38,26)}
reports=[]
for kind,target in targets.items():
    col=bpy.data.collections['LANDMARK_'+kind]
    meshes=[obj for obj in col.objects if obj.type=='MESH']
    vertices=[v.co for obj in meshes for v in obj.data.vertices]
    low=[min(v[i] for v in vertices) for i in range(3)]
    high=[max(v[i] for v in vertices) for i in range(3)]
    factors=[target[i]/(high[i]-low[i]) for i in range(3)]
    factors[2]=1.0
    # Millimetre-scale coping/fins stay inside total heights and floor-centred bounds.
    # Exact normalisation is recorded, not mistaken for a new architectural survey.
    for obj in meshes:
        for v in obj.data.vertices:
            v.co.x=(v.co.x-(low[0]+high[0])/2)*factors[0]
            v.co.y=(v.co.y-(low[1]+high[1])/2)*factors[1]
            v.co.z=max(0,min(target[2],v.co.z))
        obj.data.update()
    root=bpy.data.objects[kind+'_root']
    root['dimensionsWHD']=[target[0],target[2],target[1]]
    root['normalizationFactorsXYZ']=factors
    root['heightEnvelopeMethod']='Clamp sub-6cm coping/fin overshoot to height envelope; internal floor and mast datums remain unchanged'
    root['sourceBrief']='references.json; no reference photographs embedded'
    reports.append({'id':kind,'dimensionsWHD':[target[0],target[2],target[1]],'normalizationFactorsXYZ':factors})
bpy.context.view_layer.update()
print(json.dumps({'normalized':reports}))
