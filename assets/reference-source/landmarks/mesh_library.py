"""Local geometric helpers for source-grounded landmark reconstructions.

Included in the reviewed MCP payload; no external assets or filesystem actions.
Blender Z-up, front -Y. All dimensions are physical metres.
"""
import bpy
import math
from mathutils import Vector

def mesh_add(m, material, vertices, faces, smooth=False):
    part = m.setdefault(material.name, {'material':material,'vertices':[],'faces':[],'smooth':[]})
    offset = len(part['vertices'])
    part['vertices'].extend(vertices)
    part['faces'].extend(tuple(offset+i for i in face) for face in faces)
    part['smooth'].extend([smooth] * len(faces))

def mesh_box(m, center, size, material):
    x,y,z = center
    w,d,h = (s/2 for s in size)
    vertices = [(x-w,y-d,z-h),(x+w,y-d,z-h),(x+w,y+d,z-h),(x-w,y+d,z-h),
                (x-w,y-d,z+h),(x+w,y-d,z+h),(x+w,y+d,z+h),(x-w,y+d,z+h)]
    mesh_add(m,material,vertices,[(3,2,1,0),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7),(4,5,6,7)])

def mesh_beam(m, a, b, radius, material, sides=8, radius_top=None):
    a,b = Vector(a),Vector(b)
    direction=(b-a).normalized()
    across=direction.cross(Vector((0,0,1)))
    if across.length < .01:
        across=direction.cross(Vector((0,1,0)))
    across.normalize()
    other=direction.cross(across)
    top=radius if radius_top is None else radius_top
    vertices=[]
    for center,r in [(a,radius),(b,top)]:
        for i in range(sides):
            ang=math.tau*i/sides
            vertices.append(tuple(center+r*(math.cos(ang)*across+math.sin(ang)*other)))
    faces=[tuple(reversed(range(sides))),tuple(range(sides,sides*2))]
    faces.extend((i,(i+1)%sides,(i+1)%sides+sides,i+sides) for i in range(sides))
    mesh_add(m,material,vertices,faces)

def mesh_loft(m, rings, material, caps=True, smooth=False):
    count=len(rings[0])
    if any(len(ring)!=count for ring in rings):
        raise RuntimeError('Inconsistent loft ring sizes')
    vertices=[point for ring in rings for point in ring]
    faces=[]
    for j in range(len(rings)-1):
        faces.extend((j*count+i,j*count+(i+1)%count,(j+1)*count+(i+1)%count,(j+1)*count+i) for i in range(count))
    if caps:
        faces.extend([tuple(reversed(range(count))),tuple((len(rings)-1)*count+i for i in range(count))])
    mesh_add(m,material,vertices,faces,smooth)
    if caps and smooth:
        m[material.name]['smooth'][-2:]=[False,False]

def mesh_ring(m, radius, z, height, material, sides=48, depth=None):
    depth=radius if depth is None else depth
    mesh_loft(m,[[(radius*math.cos(math.tau*i/sides),depth*math.sin(math.tau*i/sides),level) for i in range(sides)]
               for level in (z,z+height)],material)

def mesh_finish(m, collection, root):
    objects=[]
    for name,part in m.items():
        mesh=bpy.data.meshes.new(root.name+'_'+name+'_mesh')
        mesh.from_pydata(part['vertices'],[],part['faces'])
        mesh.update()
        for polygon,smooth in zip(mesh.polygons,part['smooth']):
            polygon.use_smooth=smooth
        obj=bpy.data.objects.new(root.name+'_'+name,mesh)
        collection.objects.link(obj)
        obj.parent=root
        mesh.materials.append(part['material'])
        objects.append(obj)
    return objects

def pbr(name, color, roughness=.5, metal=0, emission=0):
    mat=bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes=True
    shader=mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value=(*color,1)
    shader.inputs['Roughness'].default_value=roughness
    shader.inputs['Metallic'].default_value=metal
    if emission:
        shader.inputs['Emission Color'].default_value=(*color,1)
        shader.inputs['Emission Strength'].default_value=emission
    return mat

def rounded_rectangle(width, depth, corner, z, steps=6):
    points=[]
    for cx,cy,start in [(width/2-corner,depth/2-corner,0),(-width/2+corner,depth/2-corner,90),
                        (-width/2+corner,-depth/2+corner,180),(width/2-corner,-depth/2+corner,270)]:
        for j in range(steps+1):
            angle=math.radians(start+j*90/steps)
            points.append((cx+corner*math.cos(angle),cy+corner*math.sin(angle),z))
    return points

def ellipse(width, depth, z, count=64, exponent=1):
    def power(value): return (1 if value>=0 else -1)*abs(value)**exponent
    return [(width/2*power(math.cos(math.tau*i/count)),depth/2*power(math.sin(math.tau*i/count)),z) for i in range(count)]

def profile_band(mesh, profile, z, height, material):
    mesh_loft(mesh,[[(x,y,z) for x,y,_ in profile],[(x,y,z+height) for x,y,_ in profile]],material)

def begin_landmark(kind):
    if bpy.context.scene.name != 'Seoul Landmark Asset Studio':
        raise RuntimeError('Not the dedicated landmark scene')
    if bpy.data.collections.get('LANDMARK_'+kind):
        raise RuntimeError('Refusing to overwrite an existing landmark collection')
    col=bpy.data.collections.new('LANDMARK_'+kind)
    bpy.context.scene.collection.children.link(col)
    root=bpy.data.objects.new(kind+'_root',None)
    col.objects.link(root)
    root['assetKind']=kind
    root['units']='metres'
    root['notice']='Unofficial reference reconstruction; detailed facade and footprint proportions are documented estimates.'
    return col,root,{}
