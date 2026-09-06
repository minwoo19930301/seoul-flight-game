"""Unofficial reference reconstruction. All small details are artistic estimates.

Run after mesh_library.py in one actual MCP payload. No file or network IO here.
Dimensions follow ../seoul-landmark-research/references.json; metres, Z-up.
"""
import json

gold=pbr('63_Gold_Bronze_Glazing',(.49,.32,.105),.26,.5)
gold_dark=pbr('63_Dark_Bronze_Mullions',(.11,.076,.037),.38,.62)
gold_high=pbr('63_Champagne_Metal',(.63,.47,.21),.3,.55)
silver_glass=pbr('Lotte_Silver_Blue_Glazing',(.36,.47,.55),.22,.47)
silver=pbr('Lotte_Pale_Aluminium_Fins',(.7,.76,.79),.3,.72)
seam=pbr('Lotte_Dark_Vertical_Seam',(.055,.09,.11),.28,.48)
trade_glass=pbr('Trade_Blue_Grey_Glazing',(.27,.4,.48),.3,.46)
trade_band=pbr('Trade_Dark_Horizontal_Spandrels',(.085,.14,.18),.35,.42)
trade_silver=pbr('Trade_Silver_Mullions',(.58,.65,.68),.3,.62)
concrete=pbr('NSeoul_Warm_Concrete',(.69,.69,.65),.76)
white=pbr('NSeoul_White_Fascia',(.88,.89,.87),.5,.12)
tower_glass=pbr('NSeoul_Observation_Glass',(.072,.15,.205),.22,.4)
mast_metal=pbr('NSeoul_Transmission_Silver',(.61,.65,.66),.45,.6)
signal=pbr('NSeoul_Signal_Red',(.52,.095,.055),.55,.1)
stone=pbr('Palace_Granite',(.64,.62,.56),.84)
stone_light=pbr('Palace_Granite_Capstones',(.8,.77,.69),.78)
roof=pbr('Palace_Charcoal_Roof_Tiles',(.065,.079,.087),.66)
tile_ridge=pbr('Palace_Raised_Tile_Seams',(.14,.16,.17),.58)
timber=pbr('Palace_Vermilion_Columns',(.40,.07,.035),.7)
green=pbr('Palace_Dancheong_Green',(.065,.255,.17),.7)
green_light=pbr('Palace_Dancheong_Jade',(.24,.42,.29),.68)
ochre=pbr('Palace_Dancheong_Ochre',(.58,.36,.1),.68)
door=pbr('Palace_Door_Shadow',(.075,.105,.075),.8)
paper=pbr('Palace_Window_Paper',(.51,.49,.36),.88)

col,root,m=begin_landmark('sixtythree')
# Rounded slab: the highest coping is part of, not on top of, 249.58 m.
levels=[(0,64.5,43.3),(5.8,64.5,43.3),(9,60.9,39.7),(231,60.9,39.7),(243,59.4,39.4),(249.58,55.4,39.0)]
rings=[rounded_rectangle(w,d,2.15,z,steps=4) for z,w,d in levels]
mesh_loft(m,rings,gold)
mesh_loft(m,[rounded_rectangle(64.5,43.3,2.15,0,4),rounded_rectangle(64.5,43.3,2.15,5.8,4)],gold_dark)
for i in range(1,61):
    z=8+(239.5-8)*i/60
    width=60.9 if z<231 else 60.9-(z-231)/18.58*5.5
    depth=39.7 if z<231 else 39.7-(z-231)/18.58*.7
    mesh_loft(m,[rounded_rectangle(width+.08,depth+.08,2.15,z,4),rounded_rectangle(width+.08,depth+.08,2.15,z+.28,4)],gold_dark,caps=False)
for i in range(-17,18):
    x=i*1.65
    if abs(x)>27: continue
    for y in (-19.88,19.88): mesh_box(m,(x,y,119.8),(.12,.12,223.6),gold_high)
for i in range(-10,11):
    y=i*1.65
    for x in (-30.48,30.48):mesh_box(m,(x,y,119.8),(.12,.12,223.6),gold_high)
# Restrained stepped entry glazing, within the published estimated footprint.
for x in (-21,-10.5,0,10.5,21):
    mesh_box(m,(x,-21.66,2.4),(8.6,.08,4.1),gold)
    mesh_box(m,(x,-21.68,2.4),(.16,.07,4.1),gold_high)
mesh_finish(m,col,root)
root['heightDatum']='249.58 m above ground; no invented rooftop antenna'

col,root,m=begin_landmark('lotte')
# Smooth convex taper follows the explicit artistic height/width ledger.
fractions=[(0,1),(.2,.93),(.4,.79),(.6,.63),(.8,.47),(.92,.35),(1,.2)]
def lotte_width(z):
    fraction=z/555
    for (a,wa),(b,wb) in zip(fractions,fractions[1:]):
        if fraction<=b:return 71.5*(wa+(wb-wa)*(fraction-a)/(b-a))
    return 14.3
def lotte_ring(z,offset=0):
    return ellipse(lotte_width(z)+offset,lotte_width(z)+offset,z,32,.63)
zlevels=[0,40,111,160,222,277,333,388,444,480,500]
mesh_loft(m,[lotte_ring(z) for z in zlevels],silver_glass,smooth=True)
# Horizontal fine band rhythm is intentionally less dominant than continuous fins.
for i in range(1,116):
    z=i*500/116
    mesh_loft(m,[lotte_ring(z,.07),lotte_ring(z+.20,.07)],silver,caps=False)
for index in range(32):
    angle=math.tau*index/32
    if index in (8,24):continue
    for z0,z1 in zip(zlevels,zlevels[1:]):
        a=lotte_ring(z0,.10)[index];b=lotte_ring(z1,.10)[index]
        mesh_beam(m,a,b,.16,silver,sides=4)
# Dark narrow central seams on the two broad elevations.
for z0,z1 in zip(zlevels,zlevels[1:]):
    for side in (-1,1):
        w0,w1=lotte_width(z0),lotte_width(z1)
        mesh_add(m,seam,[(-.62,side*(w0/2+.08),z0),(.62,side*(w0/2+.08),z0),(.62,side*(w1/2+.08),z1),(-.62,side*(w1/2+.08),z1)],[(0,1,2,3) if side<0 else (3,2,1,0)])
# The top is an open pair of tapering curved ears, never a closed cone or needle.
# East/west curtain-shell crescents leave an open 6 m slot with a visible bridge.
for side in (-1,1):
    crown_rings=[]
    for z in (500,512,527,541,551,555):
        radius=lotte_width(z)/2
        extent=1.13-(z-500)/55*.33
        arc=[]
        for i in range(13):
            angle=-extent+2*extent*i/12
            x=side*(3+(radius-3)*math.cos(angle))
            y=radius*math.sin(angle)
            arc.append((x,y,z))
        for i in reversed(range(13)):
            angle=-extent+2*extent*i/12
            x=side*(3+(radius-3)*math.cos(angle)-.55)
            y=(radius-.4)*math.sin(angle)
            arc.append((x,y,z))
        crown_rings.append(arc if side>0 else list(reversed(arc)))
    mesh_loft(m,crown_rings,silver_glass)
    for edge in (0,6,12):
        for a,b in zip(crown_rings,crown_rings[1:]):mesh_beam(m,a[edge],b[edge],.18,silver,4)
    # Rounded top coping of each ear is included in 555 m, not added above it.
    mesh_loft(m,[[(x,y,554.65) for x,y,_ in crown_rings[-1]],crown_rings[-1]],silver)
mesh_box(m,(0,0,525.7),(16.6,2.2,.9),silver)
mesh_finish(m,col,root)
root['heightDatum']='555 m includes the open crown; no added spire'

col,root,m=begin_landmark('nseoul')
mesh_loft(m,[ellipse(18,18,0,32),ellipse(18,18,3.2,32),ellipse(14,14,5.6,32),ellipse(7,7,112,32)],concrete,smooth=True)
# Stacked observation platforms are only 28 m across, not the previous 60 m.
profile=[(101,3.9),(103.5,4.8),(106,7.2),(110,10),(112,13.3),(114,14),(116.0,14),(116.4,13.25),(121,13.25),(122.2,14),
         (123.5,14),(123.8,12.7),(128.4,12.7),(129.7,13.2),(131.4,13.2),(133.7,10.6),(135.7,8)]
for (z0,r0),(z1,r1) in zip(profile,profile[1:]):
    material=tower_glass if (z0,z1) in ((116.4,121),(123.8,128.4)) else white
    mesh_loft(m,[ellipse(2*r0,2*r0,z0,40),ellipse(2*r1,2*r1,z1,40)],material,caps=False)
# Close the skirt against the load-bearing shaft; no open disk underneath.
mesh_ring(m,3.9,100.7,.3,white,40)
mesh_ring(m,8,135.1,.6,white,40)
for i in range(32):
    a=math.tau*i/32
    for z0,z1,r in [(116.4,121,13.29),(123.8,128.4,12.74)]:
        mesh_beam(m,(r*math.cos(a),r*math.sin(a),z0),(r*math.cos(a),r*math.sin(a),z1),.1,white,4)
# Silver lattice base and segmented transmission cylinder, exactly 101 m tall.
for side in (-1,1):
    for cross in (-1,1):
        mesh_beam(m,(side*2.1,cross*2.1,135.7),(side*1.45,cross*1.45,163.7),.25,mast_metal,6)
for z in (136,141,146,151,156):
    t=(z-135.7)/28;radius=2.1-.65*t
    for side in (-1,1):
        mesh_beam(m,(-radius,side*radius,z),(radius,side*radius,z+4.6),.13,mast_metal,4)
        mesh_beam(m,(side*radius,-radius,z),(side*radius,radius,z+4.6),.13,mast_metal,4)
for a,b,diam0,diam1 in [(156,177.5,4.6,4.1),(177.5,192,3.5,3),(192,211,2.5,2),(211,230,1.7,1.2),(230,236.7,1.2,.9)]:
    mesh_loft(m,[ellipse(diam0,diam0,a,20),ellipse(diam1,diam1,b,20)],white)
for z,r in [(146,3.3),(158,3),(178,2.6),(193,2.1),(210,1.7),(225,1.3)]:
    mesh_ring(m,r,z,.35,mast_metal,20)
    for i in range(8):
        ang=math.tau*i/8
        mesh_beam(m,(r*math.cos(ang),r*math.sin(ang),z),(r*math.cos(ang),r*math.sin(ang),z+1.2),.055,mast_metal,4)
for z in (180,198,216):mesh_ring(m,1.48 if z==180 else 1.05 if z==198 else .7,z,1.1,signal,20)
mesh_finish(m,col,root)
root['heightDatum']='236.7 m = 135.7 m tower body + 101 m transmission tower; hill is external'

col,root,m=begin_landmark('coex')
# Two interlocking glazed plates with an offset, stair-stepped top envelope.
# The full footprint is estimated; no exhibition hall or ASEM tower is included.
def trade_plate(x,width,y,depth,height):
    mesh_box(m,(x,y,height/2),(width,depth,height),trade_glass)
    for i in range(1,int(height/4.14)):
        z=i*4.14
        mesh_box(m,(x,y-depth/2-.035,z),(width,.07,.48),trade_band)
        mesh_box(m,(x,y+depth/2+.035,z),(width,.07,.48),trade_band)
        mesh_box(m,(x-width/2-.035,y,z),(.07,depth,.48),trade_band)
        mesh_box(m,(x+width/2+.035,y,z),(.07,depth,.48),trade_band)
    for i in range(1,int(width/2.15)):
        px=x-width/2+i*2.15
        for py in (y-depth/2-.08,y+depth/2+.08):mesh_box(m,(px,py,height/2),(.09,.08,height),trade_silver)
    for i in range(1,int(depth/2.15)):
        py=y-depth/2+i*2.15
        for px in (x-width/2-.08,x+width/2+.08):mesh_box(m,(px,py,height/2),(.08,.09,height),trade_silver)
trade_plate(-12.55,36.2,-5.77,30.38,205.2)
trade_plate(14.65,31.96,6.58,28.73,218.0)
# Terraced upper plate rises to a small flat roof at 228 m.
for z,x,width,depth in [(205.2,-13.9,31.8,30.38),(209.76,-15.7,28.2,30.38),(214.32,-17.5,24.6,30.38),(218.88,-19.3,21.0,30.38),(223.44,-21.1,17.4,30.38)]:
    mesh_box(m,(x,-5.77,z+2.28),(width,depth,4.56),trade_glass)
    mesh_box(m,(x,-21.0,z+.12),(width,.08,.24),trade_silver)
    mesh_box(m,(x,9.46,z+.12),(width,.08,.24),trade_silver)
mesh_box(m,(-21.1,-5.77,227.83),(17.4,30.38,.34),trade_silver)
# Thin technical mast from the 228 m roof to 256.5 m tip.
mesh_beam(m,(-21.1,-5.77,228),(-21.1,-5.77,247),.62,trade_silver,10,.3)
mesh_beam(m,(-21.1,-5.77,247),(-21.1,-5.77,256.5),.28,trade_silver,8,.12)
for dx,dy in [(3,0),(-3,0),(0,3),(0,-3)]:
    mesh_beam(m,(-21.1+dx,-5.77+dy,228),(-21.1,-5.77,242),.08,trade_silver,4)
mesh_finish(m,col,root)
root['heightDatum']='228 m roof / 256.5 m tip; 28.5 m slim technical mast'

col,root,m=begin_landmark('gyeongbokgung')
# Two stone woldae terraces. The steps remain inside the full 47 x 38 m envelope.
mesh_box(m,(0,0,.75),(47,38,1.5),stone)
mesh_box(m,(0,0,1.6),(47,38,.2),stone_light)
mesh_box(m,(0,0,2.5),(40,31.5,1.6),stone)
mesh_box(m,(0,0,3.4),(40,31.5,.2),stone_light)
for step in range(10):
    depth=3.25-step*.29
    mesh_box(m,(0,-15.75-depth/2,1.7+(step+1)*.18/2),(7.0,depth,(step+1)*.18),stone_light)
for level,w,d in [(1.7,46,37),(3.5,39,30.5)]:
    for y in (-d/2,d/2):
        for i in range(int(w/2.3)+1):
            x=-w/2+i*w/int(w/2.3)
            if y<0 and abs(x)<4:continue
            mesh_box(m,(x,y,level+.48),(.34,.34,.96),stone_light)
            mesh_box(m,(x,y,level+1.02),(.52,.52,.15),stone_light)
        for a,b in [(-w/2,-4),(4,w/2)] if y<0 else [(-w/2,w/2)]:
            mesh_box(m,((a+b)/2,y,level+.78),(b-a,.20,.20),stone_light)
    for x in (-w/2,w/2):
        for i in range(1,int(d/2.3)):
            y=-d/2+i*d/int(d/2.3)
            mesh_box(m,(x,y,level+.48),(.34,.34,.96),stone_light)
        mesh_box(m,(x,0,level+.78),(.2,d,.2),stone_light)
# Five bays in both directions, six column lines; central timber hall.
mesh_box(m,(0,0,3.72),(30,21,.44),stone_light)
mesh_box(m,(0,0,7.45),(28.1,19.1,6.9),door)
xs=[-14.2+i*5.68 for i in range(6)]
ys=[-9.7+i*3.88 for i in range(6)]
for x in xs:
    for y in (-9.7,9.7):
        mesh_beam(m,(x,y,3.94),(x,y,4.20),.58,stone_light,10)
        mesh_beam(m,(x,y,4.0),(x,y,10.9),.37,timber,12,.33)
for y in ys[1:-1]:
    for x in (-14.2,14.2):mesh_beam(m,(x,y,4),(x,y,10.9),.37,timber,12,.33)
# Front lattice doors, six vertical divisions per bay and three cross rails.
for bay in range(5):
    x=(xs[bay]+xs[bay+1])/2
    for front in (-1,1):
        y=front*9.61
        mesh_box(m,(x,y,7.25),(5.15,.12,5.25),paper)
        for j in range(7):mesh_box(m,(x-2.5+j*5/6,y+front*.10,7.25),(.10,.13,5.35),green)
        for z in (4.65,5.8,7.15,8.5,9.85):mesh_box(m,(x,y+front*.11,z),(5.22,.14,.10),green)
for z,w,d in [(10.6,30.3,21.5),(11.15,31,22.1),(17.6,23.8,15.4),(18.2,24.7,16.2)]:
    mesh_box(m,(0,-d/2,z),(w,.38,.4),green)
    mesh_box(m,(0,d/2,z),(w,.38,.4),green)
    mesh_box(m,(-w/2,0,z),(.38,d,.4),green)
    mesh_box(m,(w/2,0,z),(.38,d,.4),green)
    for x in [(-w/2+.65)+i*(w-1.3)/20 for i in range(21)]:
        for y in (-d/2,d/2):
            mesh_box(m,(x,y,z+.34),(.24,1.1,.23),ochre)
            mesh_box(m,(x,y,z+.62),(.62,.82,.18),green_light)
# Upper clerestory is separate between roof tiers.
mesh_box(m,(0,0,16.18),(22.3,13.9,3.65),door)
for x in [-10.8+i*4.32 for i in range(6)]:
    for y in (-7.1,7.1):
        mesh_beam(m,(x,y,14.45),(x,y,18.2),.28,timber,10)
        mesh_box(m,(x,y,16.7),(3.55,.14,1.8),green)

def paljak_roof(w,d,eave_z,shoulder_w,shoulder_d,shoulder_z,ridge_half,ridge_z):
    # Curved lower hip skirt rises at the corners; upper gable slopes terminate
    # at a long horizontal ridge. This is not a pyramidal roof.
    rows=[]
    for t in (0,.25,.6,1):
        rw=w+(shoulder_w-w)*t;rd=d+(shoulder_d-d)*t
        row=[]
        profile=rounded_rectangle(rw,rd,.35,eave_z,steps=1)
        for x,y,_ in profile:
            corner_lift=.85*(1-t)**2
            z=eave_z+(shoulder_z-eave_z)*(t**1.6)+corner_lift
            row.append((x,y,z))
        rows.append(row)
    mesh_loft(m,rows,roof,caps=False)
    # Main gable slopes, two triangular hip ends close the gable roof profile.
    vertices=[(-ridge_half,-shoulder_d/2,shoulder_z),(ridge_half,-shoulder_d/2,shoulder_z),
              (ridge_half,shoulder_d/2,shoulder_z),(-ridge_half,shoulder_d/2,shoulder_z),
              (-ridge_half,0,ridge_z),(ridge_half,0,ridge_z)]
    mesh_add(m,roof,vertices,[(0,1,5,4),(2,3,4,5)])
    # Upright gable ends distinguish the paljak hip-and-gable from a hip pyramid.
    mesh_add(m,green,vertices,[(1,2,5),(3,0,4)])
    for side in (-1,1):
        mesh_add(m,roof,[(side*ridge_half,-shoulder_d/2,shoulder_z),
                      (side*shoulder_w/2,-shoulder_d/2,shoulder_z),
                      (side*shoulder_w/2,shoulder_d/2,shoulder_z),
                      (side*ridge_half,shoulder_d/2,shoulder_z)],[(0,1,2,3) if side>0 else (3,2,1,0)])
    # Substantial horizontal main ridge with lifted terminal caps.
    mesh_beam(m,(-ridge_half,0,ridge_z-.20),(ridge_half,0,ridge_z-.20),.20,tile_ridge,8)
    for side in (-1,1):
        mesh_beam(m,(side*ridge_half,0,ridge_z-.25),(side*(ridge_half+.9),0,ridge_z-.03),.10,tile_ridge,6)
    # Raised tile rolls on both main slopes, each within the roof envelope.
    for i in range(43):
        x=-ridge_half+(2*ridge_half)*i/42
        for side in (-1,1):
            mesh_beam(m,(x,0,ridge_z-.10),(x,side*shoulder_d/2,shoulder_z+.045),.045,tile_ridge,4)
    for a,b in zip(rows[0],rows[0][1:]+rows[0][:1]):mesh_beam(m,a,b,.095,tile_ridge,6)
    # Tile lines follow the lifted skirt, preserving real horizontal eaves.
    for side in (-1,1):
        for i in range(49):
            q=-.97+1.94*i/48
            points=[]
            for t in (0,.25,.6,1):
                rw=w+(shoulder_w-w)*t;rd=d+(shoulder_d-d)*t
                points.append((q*rw/2,side*rd/2,eave_z+(shoulder_z-eave_z)*(t**1.6)+.85*(1-t)**2+.06))
            for a,b in zip(points,points[1:]):mesh_beam(m,a,b,.035,tile_ridge,4)
    # Red-and-green gable timbers sit just below the upper roof slopes.
    for side in (-1,1):
        mesh_beam(m,(side*ridge_half,-shoulder_d/2,shoulder_z-.1),(side*ridge_half,0,ridge_z-.35),.11,timber,6)
        mesh_beam(m,(side*ridge_half,0,ridge_z-.35),(side*ridge_half,shoulder_d/2,shoulder_z-.1),.11,timber,6)

paljak_roof(32.04,23.57,11.5,24.8,14.0,14.35,8.4,18.8)
paljak_roof(27.7,19.3,18.55,19.4,10.3,22.1,7.1,26.0)
mesh_finish(m,col,root)
root['heightDatum']='26 m total is an artistic estimate (approximately +/-4 m), including 3.5 m estimated terrace'
root['scope']='Geunjeongjeon main hall, two-tier terrace and steps only; not the complete palace'

bpy.context.view_layer.update()
report=[]
for collection in bpy.data.collections:
    if not collection.name.startswith('LANDMARK_'):continue
    vertices=[obj.matrix_world@Vector(v) for obj in collection.objects if obj.type=='MESH' for v in obj.bound_box]
    low=[min(v[i] for v in vertices) for i in range(3)]
    high=[max(v[i] for v in vertices) for i in range(3)]
    tris=0
    for obj in collection.objects:
        if obj.type=='MESH':obj.data.calc_loop_triangles();tris+=len(obj.data.loop_triangles)
    report.append({'id':collection.name[9:],'nativeBounds':{'min':low,'max':high},'dimensionsWHD':[high[0]-low[0],high[2]-low[2],high[1]-low[1]],'triangles':tris})
print(json.dumps({'created':report}))
