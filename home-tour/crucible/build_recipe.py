"""Builds the Crucible scene recipe for Flat E-1303 from the CAD measurements.

Units are metres. x runs east, z runs south, y is up. The origin is the
north-west corner of the flat, the same frame as flat-e1303-tour.html.

    python3 build_recipe.py            -> recipe.json (with ceilings)
    python3 build_recipe.py --open     -> recipe-open.json (roof off, for the dollhouse view)
"""
import json, math, sys

H = 2.845                      # clear ceiling height, 9'4"
OPEN = '--open' in sys.argv

geoms, mats, nodes = [], [], []
_ids = {}


def uid(prefix):
    _ids[prefix] = _ids.get(prefix, 0) + 1
    return f'{prefix}-{_ids[prefix]}'


def lin(hexstr):
    """sRGB hex to the linear RGB Crucible expects."""
    h = hexstr.lstrip('#')
    out = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255
        out.append(round(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4, 4))
    return out


def yaw(deg):
    a = math.radians(deg) / 2
    return [0, round(math.sin(a), 6), 0, round(math.cos(a), 6)]


def mat(id, **kw):
    m = {'id': id}
    m.update(kw)
    mats.append(m)
    return id


def geo(id, type, **kw):
    g = {'id': id, 'type': type}
    g.update(kw)
    geoms.append(g)
    return id


def node(geometry, material, t, s=None, rot=None, id=None, **kw):
    n = {'id': id or uid(geometry), 'geometry': geometry, 'material': material, 'translation': [round(v, 4) for v in t]}
    if s is not None:
        n['scale'] = [round(max(v, 0.0005), 4) for v in s]
    if rot is not None:
        n['rotation'] = rot
    n.update(kw)
    nodes.append(n)
    return n['id']


def box(x1, x2, y1, y2, z1, z2, material, **kw):
    """An axis-aligned block with crisp edges, given by its faces."""
    return node('cube', material, [(x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2],
                [abs(x2 - x1), abs(y2 - y1), abs(z2 - z1)], **kw)


def group(id, t, deg=0):
    n = {'id': id, 'translation': [round(v, 4) for v in t]}
    if deg:
        n['rotation'] = yaw(deg)
    nodes.append(n)
    return id


def child(parent, geometry, material, t, s=None, rot=None, **kw):
    return node(geometry, material, t, s, rot, parent=parent, **kw)


def cbox(parent, x1, x2, y1, y2, z1, z2, material, **kw):
    return child(parent, 'cube', material, [(x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2],
                 [abs(x2 - x1), abs(y2 - y1), abs(z2 - z1)], **kw)


# ---------------------------------------------------------------- materials
WALL = {'DR': '#E6E1D3', 'KI': '#EEF0EC', 'CE': '#EEF0EC', 'ST': '#D9D0C3', 'B1': '#CDD3CE',
        'B2': '#D1C6B8', 'WY': '#E0E2E8', 'BA': '#D1C6B8'}
for k, v in WALL.items():
    mat('w' + k, color=lin(v), roughness=0.92)
mat('ext', color=lin('#ECE9E2'), roughness=0.95)
mat('ceil', color=lin('#FAF9F6'), roughness=0.95)
mat('skirt', color=lin('#F4F3EF'), roughness=0.6)
mat('frame', color=lin('#F2F1EC'), roughness=0.5)
# Crucible allows 16 distinct patterns, so each pattern below is shared and tinted per material with color.
G = lambda v: [v, v, v]
MARBLE = [{'type': 'marble', 'colors': [lin('#cfccc6'), lin('#f4f2ee')], 'size': 1.4, 'seed': 11 + i * 7, 'bump': 0.05} for i in range(2)]
TILES = {'type': 'tiles', 'colors': [G(0.55), G(0.75)], 'size': 0.6, 'count': 2, 'bump': 0.15}
WOODX = {'type': 'wood', 'colors': [lin('#9a6e45'), lin('#c9a274')], 'size': 0.6, 'count': 9, 'axis': 'x', 'bump': 0.15}
WOODY = dict(WOODX, axis='y', seed=3)
FABRIC = {'type': 'fabric', 'colors': [G(0.72), G(0.92)], 'size': 0.06, 'bump': 0.45}
RUG = {'type': 'fabric', 'colors': [G(0.7), G(0.95)], 'size': 0.12, 'bump': 0.8, 'seed': 12}
for i in range(2):
    mat(f'marble{i}', color=[1, 1, 1] if i < 2 else G(0.985), roughness=0.1, specular=1.1, pattern=MARBLE[i % 2])
mat('grout', color=lin('#b9b5ad'), roughness=0.8)
mat('antiskid', color=lin('#9da2a8'), roughness=0.75)
mat('balconyfloor', color=[1, 1, 1], roughness=0.8,
    pattern={'type': 'planks', 'colors': [lin('#8a6a4c'), lin('#a78463')], 'size': 1.2, 'count': 8, 'axis': 'x', 'bump': 0.3})
mat('walltile', color=lin('#e9ebf0'), roughness=0.25, pattern=dict(TILES, size=1.2))
mat('oak', color=[1, 1, 1], roughness=0.55, pattern=WOODX)
mat('oakV', color=[1, 1, 1], roughness=0.55, pattern=WOODY)
mat('walnut', color=lin('#7a5a44'), roughness=0.45, clearcoat=0.3, clearcoatRoughness=0.3, pattern=WOODX)
mat('walnutV', color=lin('#4a2f20'), roughness=0.45)
mat('linenSofa', color=lin('#d4cab8'), roughness=0.95, sheenColor=[0.25, 0.24, 0.22], sheenRoughness=0.6, pattern=FABRIC)
mat('teal', color=lin('#3f6f6a'), roughness=0.9, sheenColor=[0.25, 0.35, 0.35], sheenRoughness=0.5)
mat('mustard', color=lin('#b88f45'), roughness=0.9, sheenColor=[0.35, 0.3, 0.15], sheenRoughness=0.5)
mat('bedlinen', color=lin('#f2f0ea'), roughness=0.95, sheenColor=[0.25, 0.25, 0.25], sheenRoughness=0.7)
mat('duvetSage', color=lin('#8ea59f'), roughness=0.95, sheenColor=[0.25, 0.28, 0.26], sheenRoughness=0.6)
mat('headboard', color=lin('#b6a88f'), roughness=0.95, sheenColor=[0.25, 0.22, 0.18], sheenRoughness=0.6)
mat('rugA', color=lin('#c2c7bf'), roughness=1, pattern=RUG)
mat('rugB', color=lin('#d6ccb8'), roughness=1, sheenColor=[0.2, 0.2, 0.2], sheenRoughness=0.8)
mat('curtain', color=lin('#e6dfd2'), roughness=1, doubleSided=True, sheenColor=[0.2, 0.2, 0.2], sheenRoughness=0.8)
mat('sheer', color=lin('#ffffff'), roughness=1, opacity=0.45, doubleSided=True)
mat('brass', color=lin('#d8b46a'), metallic=1, roughness=0.28)
mat('steel', color=lin('#c9ccd0'), metallic=1, roughness=0.3)
mat('steelB', color=lin('#c9ccd0'), metallic=1, roughness=0.36)
mat('walnutP', color=lin('#4a2f20'), roughness=0.45, clearcoat=0.3)
mat('oakP', color=lin('#b48a5c'), roughness=0.55)
mat('black', color=lin('#1e2022'), roughness=0.5)
mat('screen', color=lin('#0c0d0e'), roughness=0.08, clearcoat=1)
mat('ceramic', color=lin('#f7f7f4'), roughness=0.08, clearcoat=1, clearcoatRoughness=0.05)

mat('sage', color=lin('#9fb09a'), roughness=0.4, clearcoat=0.4, clearcoatRoughness=0.3)
mat('lacquer', color=lin('#efece6'), roughness=0.35, clearcoat=0.3)
mat('glass', color=lin('#f4fbfb'), roughness=0.0, transmission=1, thickness=0.006, ior=1.5)
mat('mirror', color=lin('#f2f4f4'), metallic=1, roughness=0.02)
mat('shade', color=lin('#f1e8d6'), roughness=0.9, doubleSided=True, emissiveColor=lin('#ffd9a0'), emission=0.6)
mat('bulb', color=lin('#fff4e0'), emissiveColor=lin('#fff1d6'), emission=4)
mat('terracotta', color=lin('#b06a4a'), roughness=0.85)
mat('potWhite', color=lin('#ebe7df'), roughness=0.4)
mat('soil', color=lin('#3a2c22'), roughness=1)
mat('cane', color=lin('#c29b62'), roughness=0.8)
mat('paper', color=lin('#f2efe8'), roughness=0.9)
mat('book1', color=lin('#39494c'), roughness=0.8)
mat('book2', color=lin('#b08d57'), roughness=0.8)
mat('book3', color=lin('#8d9a8c'), roughness=0.8)
mat('fruit', color=lin('#e0892f'), roughness=0.5)
mat('artA', color=lin('#c98f6b'), roughness=0.9)
mat('artB', color=lin('#9fb5ae'), roughness=0.9)
mat('artC', color=lin('#d9c4a1'), roughness=0.9)
mat('artD', color=lin('#2f3a3a'), roughness=0.9)
mat('lobby', color=lin('#d9d6cf'), roughness=0.95)

# ---------------------------------------------------------------- shared geometry
geo('cube', 'box', bevel=0)
geo('cyl', 'cylinder', segments=40, bevel=0)
geo('sph', 'sphere', segments=32, rings=20)
geo('cone', 'cone', radiusTop=0.55, radiusBottom=1, segments=16)          # tapered leg, 1 m tall, radius 1


def rb(size, pos, r):
    return {'shape': 'roundBox', 'size': [round(v, 4) for v in size], 'position': [round(v, 4) for v in pos], 'radius': round(min(r, min(size) / 2 - 0.001), 4)}


def union(children, smooth=0):
    u = {'op': 'union', 'children': children}
    if smooth:
        u['smooth'] = smooth
    return u


def sofa_sdf(id, w, seats, d=0.9):
    """A sofa facing +z, back along -z, seat at 0.44, as one soft mesh with seams between cushions."""
    hw, arm, bk = w / 2, 0.15, 0.18
    parts = [rb([w, 0.2, d], [0, 0.22, 0], 0.04),                                   # base on its legs
             rb([w, 0.5, bk], [0, 0.52, -d / 2 + bk / 2], 0.07),                    # back frame
             rb([arm, 0.42, d], [-hw + arm / 2, 0.43, 0], 0.07),                    # arms
             rb([arm, 0.42, d], [hw - arm / 2, 0.43, 0], 0.07)]
    L = (w - 2 * arm) / seats
    for i in range(seats):
        cx = -hw + arm + L * (i + 0.5)
        parts.append(rb([L - 0.012, 0.17, d - bk - 0.01], [cx, 0.4, bk / 2 + 0.005], 0.06))     # seat cushion
        parts.append({'shape': 'roundBox', 'size': [L - 0.03, 0.44, 0.16], 'position': [cx, 0.68, -d / 2 + bk + 0.07],
                      'rotation': [-0.17, 0, 0], 'radius': 0.07})                                 # back cushion
    geo(id, 'sdf', root=union(parts), resolution=60)


def armchair_sdf(id):
    parts = [rb([0.72, 0.18, 0.74], [0, 0.3, 0], 0.05),
             rb([0.72, 0.5, 0.15], [0, 0.6, -0.3], 0.07),
             rb([0.12, 0.3, 0.72], [-0.3, 0.5, 0], 0.05),
             rb([0.12, 0.3, 0.72], [0.3, 0.5, 0], 0.05),
             rb([0.48, 0.13, 0.58], [0, 0.44, 0.06], 0.05)]
    geo(id, 'sdf', root=union(parts), resolution=44)


def pillow_sdf(id, w, h, t):
    """A plump pillow: soft-cornered, fuller in the middle."""
    root = union([rb([w, h, t * 0.7], [0, 0, 0], t * 0.34), rb([w * 0.8, h * 0.8, t], [0, 0, 0], t * 0.48)], smooth=0.04)
    geo(id, 'sdf', root=root, resolution=28)


def bed_sdf(id, w, L):
    """Bed with head at -z: upholstered base, mattress, duvet folded back, tufted headboard."""
    hw = w / 2
    parts = [rb([w + 0.08, 0.26, L + 0.04], [0, 0.23, 0.02], 0.04),                             # upholstered base
             rb([w, 0.22, L - 0.02], [0, 0.46, 0.01], 0.07),                                     # mattress
             rb([w + 0.07, 0.07, L * 0.66], [0, 0.585, L * 0.17], 0.03),                          # duvet top
             rb([w + 0.08, 0.3, L * 0.66], [0, 0.45, L * 0.17], 0.03),                            # duvet falling over the sides
             rb([w + 0.07, 0.09, 0.2], [0, 0.6, -L * 0.16], 0.045)]                               # folded edge
    n = max(4, round((w + 0.24) / 0.2))
    pw = (w + 0.24) / n
    tufts = [{'shape': 'capsule', 'radius': pw / 2 - 0.004, 'height': 0.72, 'position': [-hw - 0.12 + pw * (i + 0.5), 0.62, -L / 2 - 0.05]} for i in range(n)]
    geo(id, 'sdf', root=union(parts), resolution=60)
    geo(id + 'Head', 'sdf', root=union(tufts), resolution=48)


def dining_chair_sdf(id):
    parts = [rb([0.44, 0.07, 0.44], [0, 0.455, 0], 0.03),
             {'shape': 'roundBox', 'size': [0.43, 0.3, 0.05], 'position': [0, 0.74, -0.24], 'rotation': [-0.18, 0, 0], 'radius': 0.024}]
    geo(id, 'sdf', root=union(parts), resolution=36)


def lounge_sdf(id):
    parts = [rb([0.56, 0.1, 0.54], [0, 0.37, 0], 0.04),
             {'shape': 'roundBox', 'size': [0.54, 0.36, 0.1], 'position': [0, 0.6, -0.26], 'rotation': [-0.22, 0, 0], 'radius': 0.045}]
    geo(id, 'sdf', root=union(parts), resolution=36)


sofa_sdf('sofa3', 2.09, 3)
sofa_sdf('sofa2', 1.52, 2)
armchair_sdf('armchair')
pillow_sdf('pillow', 0.45, 0.45, 0.16)
pillow_sdf('bedpillow', 0.62, 0.4, 0.16)
bed_sdf('bedD', 1.5, 1.95)
bed_sdf('bedS', 0.92, 1.95)
dining_chair_sdf('dchair')
lounge_sdf('lounge')
geo('shade', 'lathe', profile=[[0.135, 0], [0.1, 0.22]], segments=48)
geo('lampbase', 'lathe', profile=[[0.001, 0], [0.065, 0], [0.07, 0.015], [0.035, 0.04], [0.06, 0.13], [0.05, 0.2], [0.015, 0.24], [0.012, 0.3]], segments=40)
geo('vase', 'lathe', profile=[[0.001, 0], [0.04, 0], [0.07, 0.08], [0.065, 0.17], [0.028, 0.25], [0.034, 0.3]], segments=40)
geo('bowl', 'lathe', profile=[[0.001, 0.01], [0.05, 0], [0.11, 0.06], [0.105, 0.065], [0.045, 0.012], [0.001, 0.02]], segments=40)
geo('pot', 'lathe', profile=[[0.001, 0], [0.15, 0], [0.2, 0.08], [0.2, 0.38], [0.185, 0.38], [0.18, 0.34]], segments=40)
geo('planter', 'lathe', profile=[[0.001, 0], [0.11, 0], [0.18, 0.18], [0.2, 0.42], [0.185, 0.42], [0.17, 0.39]], segments=40)
geo('pendant', 'lathe', profile=[[0.012, 0.13], [0.06, 0.12], [0.12, 0.06], [0.14, 0]], segments=48)
geo('wcbowl', 'lathe', profile=[[0.001, 0], [0.12, 0], [0.14, 0.2], [0.19, 0.38], [0.2, 0.4], [0.16, 0.4], [0.12, 0.3]], segments=40)
geo('basin', 'lathe', profile=[[0.001, 0.015], [0.07, 0], [0.18, 0.12], [0.17, 0.12], [0.07, 0.02], [0.001, 0.025]], segments=48)
geo('plate', 'lathe', profile=[[0.001, 0.004], [0.08, 0], [0.13, 0.014], [0.125, 0.018], [0.08, 0.008], [0.001, 0.008]], segments=40)
geo('glassware', 'lathe', profile=[[0.001, 0], [0.03, 0], [0.034, 0.11], [0.031, 0.11], [0.027, 0.006], [0.001, 0.006]], segments=32)
geo('wc', 'sdf', root={'op': 'subtract', 'children': [union([rb([0.36, 0.3, 0.54], [0, 0.42, 0.27], 0.13), rb([0.38, 0.03, 0.5], [0, 0.585, 0.26], 0.015)], smooth=0.01), rb([0.26, 0.2, 0.38], [0, 0.62, 0.3], 0.1)]}, resolution=40)
geo('roundmirror', 'cylinder', segments=64, bevel=0)
geo('ring', 'torus', tubeRadius=0.035, segments=64, sides=12)


def pleats(id, w, folds, amp, h):
    """A pleated curtain: a wavy strip extruded upward, then stood up by its node."""
    n = max(24, int(folds * 10))
    front = [[-w / 2 + w * i / n, amp * math.sin(i / n * folds * 2 * math.pi)] for i in range(n + 1)]
    back = [[x, y + 0.008] for x, y in reversed(front)]
    geo(id, 'extrude', contour=[[round(a, 4), round(b, 4)] for a, b in front + back], depth=h, bevel=0)


pleats('drapeL', 0.5, 4, 0.035, 2.5)
pleats('sheerW', 2.4, 14, 0.02, 2.5)
pleats('sheerS', 1.5, 9, 0.02, 1.32)
pleats('sheerG', 1.8, 11, 0.02, 1.32)
pleats('drapeS', 0.3, 2.5, 0.025, 1.36)

# ---------------------------------------------------------------- walls
def wall(direction, a, b, at, t, cA, cB, opens=(), h=H):
    """A wall along x (z = at..at+t) or along z (x = at..at+t), split around its openings.
    cA is the north/west face colour, cB the south/east face colour."""
    opens = sorted(opens, key=lambda o: o[0])

    def piece(s, e, y1, y2, material):
        if e - s < 1e-3 or y2 - y1 < 1e-3:
            return
        if direction == 'x':
            box(s, e, y1, y2, at, at + t, material)
        else:
            box(at, at + t, y1, y2, s, e, material)

    def faces(s, e, y1, y2):
        # wall core plus a thin paint skin on each face so each room keeps its own colour
        if e - s < 1e-3 or y2 - y1 < 1e-3:
            return
        piece(s, e, y1, y2, 'ext')
        k = 0.004
        for c, side in ((cA, -1), (cB, 1)):
            if c == 'ext':
                continue
            if direction == 'x':
                z0 = at - k if side < 0 else at + t
                box(s, e, y1, y2, z0, z0 + k, c)
                if y1 == 0 and c.startswith('w'):
                    zz = at - 0.012 if side < 0 else at + t
                    box(s, e, 0, 0.08, zz, zz + 0.012, 'skirt')
            else:
                x0 = at - k if side < 0 else at + t
                box(x0, x0 + k, y1, y2, s, e, c)
                if y1 == 0 and c.startswith('w'):
                    xx = at - 0.012 if side < 0 else at + t
                    box(xx, xx + 0.012, 0, 0.08, s, e, 'skirt')

    cur = a
    for s, e, sill, head, kind, *rest in opens:
        ex = rest[0] if rest else {}
        faces(cur, s, 0, h)
        faces(s, e, 0, sill)
        faces(s, e, head, h)
        cur = e
        if kind == 'open':
            continue
        lb = (lambda u1, u2, y1, y2, v1, v2, m: box(u1, u2, y1, y2, v1, v2, m)) if direction == 'x' else \
             (lambda u1, u2, y1, y2, v1, v2, m: box(v1, v2, y1, y2, u1, u2, m))
        if kind == 'door':
            d1, d2 = at - 0.015, at + t + 0.015
            lb(s, s + 0.04, 0, head, d1, d2, 'frame'); lb(e - 0.04, e, 0, head, d1, d2, 'frame'); lb(s, e, head - 0.04, head, d1, d2, 'frame')
            w = e - s - 0.09
            hinge_e = ex.get('hinge') == 'e'
            sw = ex.get('swing', 1)
            th = math.radians(ex.get('open', 88))
            hu = e - 0.045 if hinge_e else s + 0.045
            hv = at + t if sw > 0 else at
            sgn = -1 if hinge_e else 1
            m = ex.get('mat', 'oakP')
            if direction == 'x':
                ang = -th * sgn * sw
                cx = hu + math.cos(ang) * sgn * w / 2
                cz = hv - math.sin(ang) * sgn * w / 2
                node('cube', m, [cx, (head - 0.05) / 2, cz], [w, head - 0.05, 0.038], rot=[0, math.sin(ang / 2), 0, math.cos(ang / 2)])
            else:
                ang = th * sgn * sw
                cx = hv + math.sin(ang) * sgn * w / 2
                cz = hu + math.cos(ang) * sgn * w / 2
                node('cube', m, [cx, (head - 0.05) / 2, cz], [0.038, head - 0.05, w], rot=[0, math.sin(ang / 2), 0, math.cos(ang / 2)])
        else:
            plane = at + t / 2
            if t > 0.2:
                if cB == 'ext':
                    plane = at + t - 0.07
                elif cA == 'ext':
                    plane = at + 0.07
            f, p1, p2 = 0.045, plane - 0.035, plane + 0.035
            lb(s, s + f, sill, head, p1, p2, 'frame'); lb(e - f, e, sill, head, p1, p2, 'frame')
            lb(s, e, head - f, head, p1, p2, 'frame'); lb(s, e, sill, sill + f, p1, p2, 'frame')
            if e - s > 1.1:
                lb((s + e) / 2 - 0.025, (s + e) / 2 + 0.025, sill, head, p1, p2, 'frame')
            if direction == 'x':
                node('cube', 'glass', [(s + e) / 2, (sill + head) / 2, plane], [e - s - 2 * f, head - sill - 2 * f, 0.006], rayVisibility='glass', castShadow=False)
            else:
                node('cube', 'glass', [plane, (sill + head) / 2, (s + e) / 2], [0.006, head - sill - 2 * f, e - s - 2 * f], rayVisibility='glass', castShadow=False)
    faces(cur, b, 0, h)


D, Wn = 'door', 'window'
wall('x', 1.589, 4.064, -0.12, 0.12, 'ext', 'wWY', h=1.1)
wall('z', -0.12, 1.516, 1.589, 0.103, 'ext', 'wWY')
wall('x', 4.166, 6.62, -0.15, 0.15, 'ext', 'wKI')
wall('x', 6.726, 8.35, -0.15, 0.15, 'ext', 'wST')
wall('z', -0.15, 1.516, 4.064, 0.102, 'wWY', 'wKI', [(0.137, 0.68, 1.05, 2.1, Wn), (0.70, 1.50, 0, 2.1, D, {'hinge': 'e', 'swing': -1})])
wall('z', 1.516, 3.043, 4.064, 0.102, 'walltile', 'wKI')
wall('z', -0.15, 1.62, 6.62, 0.106, 'wKI', 'wST', [(0.62, 1.47, 0, 2.1, D, {'hinge': 's', 'swing': 1, 'open': 80})])
wall('z', 0, 1.516, 8.247, 0.103, 'wST', 'ext')
wall('x', -0.104, 1.692, 1.516, 0.104, 'ext', 'walltile')
wall('x', 1.692, 2.161, 1.516, 0.104, 'wWY', 'walltile')
wall('x', 2.161, 4.064, 1.516, 0.104, 'wWY', 'walltile', [(2.287, 2.914, 1.5, 2.1, Wn)])
wall('x', 6.726, 8.35, 1.516, 0.104, 'wST', 'wDR')
wall('x', 8.35, 10.004, 1.516, 0.104, 'ext', 'wDR')
box(9.139, 9.766, 0, H, 1.62, 1.755, 'wDR')                                   # thick wall with the electrical board
box(0, 0.993, 0, H, 1.62, 1.755, 'walltile')                                 # RCC columns inside the toilets
box(2.914, 4.064, 0, H, 1.62, 1.755, 'walltile')
wall('z', 1.62, 3.0, -0.104, 0.104, 'ext', 'walltile', [(1.755, 2.383, 1.5, 2.1, Wn)])
wall('z', 3.0, 7.923, -0.104, 0.104, 'ext', 'wB1')
wall('z', 1.62, 2.94, 2.059, 0.102, 'walltile', 'walltile')
wall('x', 0, 3.281, 2.94, 0.103, 'walltile', 'wB1', [(1.275, 2.059, 0, 2.1, D, {'hinge': 'e', 'swing': -1})])
wall('x', 3.281, 4.064, 2.94, 0.103, 'walltile', 'wCE', [(3.30, 4.05, 0, 2.1, D, {'hinge': 'e', 'swing': -1})])
wall('z', 3.043, 4.27, 3.04, 0.241, 'wB1', 'wCE', [(3.07, 3.986, 0, 2.1, D, {'hinge': 's', 'swing': -1})])
wall('z', 4.27, 7.923, 3.04, 0.241, 'wB1', 'wB2')
wall('x', 3.281, 6.726, 4.215, 0.105, 'wCE', 'wB2', [(3.30, 4.22, 0, 2.1, D, {'hinge': 's', 'swing': 1})])
wall('z', 4.32, 6.66, 6.62, 0.106, 'wB2', 'wDR')
wall('z', 6.66, 7.923, 6.62, 0.106, 'wB2', 'wBA')
wall('x', 0, 3.04, 7.483, 0.44, 'wB1', 'ext', [(1.149, 2.569, 0.9, 2.2, Wn)])
wall('x', 3.281, 6.62, 7.818, 0.105, 'wB2', 'ext', [(4.404, 6.127, 0.9, 2.2, Wn)])
wall('x', 6.726, 9.766, 6.608, 0.103, 'wDR', 'wBA', [(6.966, 9.525, 0, 2.3, 'open')])
wall('z', 1.62, 3.883, 9.766, 0.238, 'wDR', 'ext', [(1.76, 2.75, 0, 2.15, D, {'hinge': 's', 'swing': -1, 'mat': 'walnutP', 'open': 86})])
wall('z', 3.883, 5.614, 9.901, 0.103, 'wDR', 'ext')
wall('z', 5.614, 6.711, 9.766, 0.238, 'wDR', 'ext')
wall('z', 6.711, 7.923, 9.901, 0.103, 'wBA', 'ext')
for x in [1.76 + 0.115 * i for i in range(20)]:                               # wash yard grille
    box(x, x + 0.012, 1.1, H, -0.07, -0.058, 'black', castShadow=True)
# balcony: kerb, glass railing, sliding doors (middle panel slid open)
box(6.726, 9.901, 0, 0.1, 7.818, 7.923, 'ext')
node('cube', 'glass', [8.31, 0.65, 7.868], [3.17, 1.05, 0.012], rayVisibility='glass', castShadow=False)
box(6.726, 9.901, 1.15, 1.2, 7.84, 7.9, 'steel')
for x in (6.75, 7.8, 8.85, 9.88):
    box(x - 0.02, x + 0.02, 0.1, 1.15, 7.85, 7.89, 'steel')


def glass_panel(x1, x2, z, h):
    f = 0.045
    box(x1, x1 + f, 0, h, z - 0.02, z + 0.02, 'frame'); box(x2 - f, x2, 0, h, z - 0.02, z + 0.02, 'frame')
    box(x1, x2, h - f, h, z - 0.02, z + 0.02, 'frame'); box(x1, x2, 0, f, z - 0.02, z + 0.02, 'frame')
    node('cube', 'glass', [(x1 + x2) / 2, h / 2, z], [x2 - x1 - 2 * f, h - 2 * f, 0.006], rayVisibility='glass', castShadow=False)


glass_panel(6.966, 7.82, 6.66, 2.3)
glass_panel(8.67, 9.525, 6.66, 2.3)
glass_panel(8.7, 9.5, 6.70, 2.3)

# ---------------------------------------------------------------- floors
# grout bed under the whole flat, then 2' x 4' marble tiles laid with a 3 mm joint
box(-0.104, 10.004, -0.08, -0.002, -0.15, 7.923, 'grout')
TW, TL, J = 0.6096, 1.2192, 0.003
DRY = [(6.726, 9.766, 1.62, 6.608), (4.166, 6.726, 0, 3.043), (3.281, 6.726, 3.043, 4.215), (0, 3.04, 3.043, 7.483),
       (3.281, 6.62, 4.215, 7.818), (6.726, 8.247, 0, 1.516), (9.6, 10.004, 1.6, 3.9)]


def tiled_floor(x1, x2, z1, z2, k):
    """One marble slab per room, with 2' x 4' joints drawn on a fixed world grid so they run straight through doorways."""
    box(x1, x2, -0.012, 0, z1, z2, f'marble{k % 2}', castShadow=False)
    i = math.ceil(x1 / TW)
    while i * TW < x2:
        box(i * TW - J / 2, i * TW + J / 2, 0, 0.0006, z1, z2, 'grout', castShadow=False)
        i += 1
    k2 = math.ceil(z1 / TL)
    while k2 * TL < z2:
        box(x1, x2, 0, 0.0006, k2 * TL - J / 2, k2 * TL + J / 2, 'grout', castShadow=False)
        k2 += 1


for k, r in enumerate(DRY):
    tiled_floor(*r, k)
for r in [(0, 2.059, 1.62, 2.94), (2.161, 4.064, 1.62, 2.94), (1.692, 4.064, -0.12, 1.516)]:
    box(r[0], r[1], -0.012, 0, r[2], r[3], 'antiskid', castShadow=False)
box(6.726, 9.901, -0.012, 0, 6.711, 7.818, 'balconyfloor', castShadow=False)
box(10.004, 11.75, -0.012, 0, 0.85, 3.75, 'lobby', castShadow=False)
box(-0.104, 10.004, -0.3, -0.08, -0.15, 7.923, 'ext')                        # slab edge

# ---------------------------------------------------------------- ceiling (left out of the dollhouse view)
if not OPEN:
    box(-0.104, 10.004, H, H + 0.15, -0.15, 7.923, 'ceil', castShadow=True)
    for b in [(6.62, 6.726, 1.62, 4.215), (4.166, 6.62, 2.94, 3.043), (6.726, 9.766, 6.4, 6.608), (3.281, 6.726, 4.11, 4.215)]:
        box(b[0], b[1], H - 0.35, H, b[2], b[3], 'ceil')
    x1, x2, z1, z2, w = 6.726, 9.766, 1.62, 6.4, 0.32                          # drawing-room ceiling border
    for bb in [(x1, x2, z1, z1 + w), (x1, x2, z2 - w, z2), (x1, x1 + w, z1 + w, z2 - w), (x2 - w, x2, z1 + w, z2 - w)]:
        box(bb[0], bb[1], H - 0.11, H, bb[2], bb[3], 'ceil')
    for (x, z) in [(9.25, 2.3), (8.25, 1.8), (7.3, 1.8), (6.9, 4.3), (6.9, 5.7), (9.6, 4.3), (9.6, 5.7), (4.9, 1.3), (5.9, 1.3),
                   (1.6, 4.4), (0.6, 5.6), (2.6, 5.6), (4.4, 5.0), (5.5, 5.0)]:
        node('cyl', 'bulb', [x, H - 0.11 - 0.004 if x > 6.7 else H - 0.004, z], [0.05, 0.008, 0.05], castShadow=False)

# ---------------------------------------------------------------- furniture helpers
def legs(parent, pts, h, r, material='walnutP'):
    for (x, z) in pts:
        child(parent, 'cone', material, [x, h / 2, z], [r, h, r])


def plant(id, x, z, species, height, potgeo='planter', potmat='potWhite', seed=1, deg=0):
    g = group(id, [x, 0, z], deg)
    child(g, potgeo, potmat, [0, 0, 0])
    child(g, 'cyl', 'soil', [0, 0.37 if potgeo == 'planter' else 0.33, 0], [0.17, 0.02, 0.17])
    nodes.append({'id': id + '-leaves', 'parent': g, 'translation': [0, 0.36, 0], 'vegetation': {'species': species, 'seed': seed, 'height': height, 'leaves': 'mesh'}})


def tablelamp(parent, x, y, z):
    child(parent, 'lampbase', 'potWhite', [x, y, z])
    child(parent, 'shade', 'shade', [x, y + 0.27, z], castShadow=False)


def frame_art(id, x, y, z, deg, w, h, canvas):
    g = group(id, [x, y, z], deg)
    t = 0.022
    cbox(g, -w / 2, w / 2, h / 2 - t, h / 2, 0, 0.03, 'walnutP'); cbox(g, -w / 2, w / 2, -h / 2, -h / 2 + t, 0, 0.03, 'walnutP')
    cbox(g, -w / 2, -w / 2 + t, -h / 2, h / 2, 0, 0.03, 'walnutP'); cbox(g, w / 2 - t, w / 2, -h / 2, h / 2, 0, 0.03, 'walnutP')
    cbox(g, -w / 2 + t, w / 2 - t, -h / 2 + t, h / 2 - t, 0, 0.008, 'paper')
    m = min(w, h) * 0.14
    cw, ch = w - 2 * t - 2 * m, h - 2 * t - 2 * m
    cbox(g, -cw / 2, cw / 2, -ch / 2, ch / 2, 0.008, 0.011, canvas[0])
    cbox(g, -cw / 2, cw * 0.1, -ch / 2, ch * 0.05, 0.011, 0.013, canvas[1])
    child(g, 'cyl', canvas[2], [cw * 0.2, ch * 0.22, 0.012], [min(cw, ch) * 0.16, 0.004, min(cw, ch) * 0.16], rot=[0.7071, 0, 0, 0.7071])


def nightstand(id, x, z, deg=0, lamp=True):
    g = group(id, [x, 0, z], deg)
    legs(g, [(-0.18, -0.15), (0.18, -0.15), (-0.18, 0.15), (0.18, 0.15)], 0.16, 0.016)
    cbox(g, -0.22, 0.22, 0.16, 0.5, -0.19, 0.19, 'walnut')
    cbox(g, -0.205, 0.205, 0.34, 0.485, 0.19, 0.196, 'walnutV')
    cbox(g, -0.06, 0.06, 0.405, 0.415, 0.196, 0.21, 'brass')
    if lamp:
        tablelamp(g, -0.06, 0.5, -0.04)
    cbox(g, 0.02, 0.18, 0.5, 0.525, 0.02, 0.14, 'book1')


def curtains_window(xa, xb, z, top, inner_sign):
    """Sheer across the window with linen drapes at both sides, along x at depth z."""
    zz = z + inner_sign * 0.06
    r = [0.7071, 0, 0, -0.7071]                                               # extrude depth runs up the wall
    node('drapeS', 'curtain', [xa - 0.05, 0.93, zz], rot=r)
    node('drapeS', 'curtain', [xb + 0.05, 0.93, zz], rot=r)
    w = xb - xa
    node('sheerS' if w < 1.6 else 'sheerG', 'sheer', [(xa + xb) / 2, 0.93, zz + inner_sign * 0.03], rot=r, castShadow=False)
    box(xa - 0.25, xb + 0.25, top, top + 0.06, zz - 0.04, zz + 0.04, 'lacquer')


# ---------------------------------------------------------------- foyer and drawing room
z = 1.8
while z < 2.64:                                                               # fluted oak screen
    box(8.735, 8.775, 0.06, 2.4, z, z + 0.04, 'oakP')
    z += 0.075
box(8.73, 8.78, 0, 0.06, 1.78, 2.67, 'oak'); box(8.73, 8.78, 2.4, 2.45, 1.78, 2.67, 'oak')
box(8.95, 9.7, 0, 0.012, 1.95, 2.65, 'rugB')
g = group('pooja', [8.4, 0, 1.62])                                            # pooja unit
cbox(g, -0.3, 0.3, 0, 0.8, 0, 0.33, 'lacquer'); cbox(g, -0.32, 0.32, 0.8, 0.835, 0, 0.35, 'marble1')
cbox(g, -0.28, 0.28, 0.835, 1.66, 0.002, 0.016, 'oakV')
cbox(g, -0.2, 0.2, 0.9, 1.5, 0.016, 0.02, 'bulb')
cbox(g, -0.33, 0.33, 1.66, 1.71, 0, 0.36, 'lacquer'); cbox(g, -0.23, 0.23, 1.71, 1.77, 0, 0.3, 'lacquer'); cbox(g, -0.13, 0.13, 1.77, 1.83, 0, 0.24, 'lacquer')
child(g, 'bowl', 'brass', [0, 0.835, 0.2], [0.6, 0.6, 0.6]); child(g, 'sph', 'bulb', [0.17, 0.87, 0.25], [0.015, 0.015, 0.015], castShadow=False)
plant('plant-foyer', 7.85, 1.95, 'palm', 1.4, seed=7)
frame_art('art-door', 9.762, 1.5, 3.05, -90, 0.5, 0.66, ['artC', 'artA', 'artB'])

g = group('sofa3', [7.185, 0, 5.195], 90)                                     # 3-seater on the west wall, facing east
child(g, 'sofa3', 'linenSofa', [0, 0, 0])
legs(g, [(-0.97, -0.38), (0.97, -0.38), (-0.97, 0.38), (0.97, 0.38)], 0.13, 0.018, 'brass')
for (px, m, tilt) in [(-0.72, 'teal', 0.2), (0.74, 'mustard', -0.15), (0.48, 'teal', 0.1)]:
    child(g, 'pillow', m, [px, 0.7, -0.1], rot=[-0.2, math.sin(tilt / 2), 0, 0.98])
g = group('sofa2', [8.4, 0, 3.695], 0)                                       # 2-seater facing south
child(g, 'sofa2', 'linenSofa', [0, 0, 0])
legs(g, [(-0.7, -0.38), (0.7, -0.38), (-0.7, 0.38), (0.7, 0.38)], 0.13, 0.018, 'brass')
child(g, 'pillow', 'mustard', [-0.44, 0.7, -0.1], rot=[-0.2, 0.08, 0, 0.98])
child(g, 'pillow', 'teal', [0.45, 0.7, -0.1], rot=[-0.2, -0.1, 0, 0.98])
box(7.5, 9.4, 0, 0.014, 4.25, 6.25, 'rugA', castShadow=False)
g = group('coffee', [8.28, 0, 5.2])
child(g, 'cyl', 'walnut', [0, 0.38, 0], [0.42, 0.035, 0.42])
for a in (0, 2.094, 4.189):
    child(g, 'cyl', 'walnutP', [math.cos(a) * 0.28, 0.18, math.sin(a) * 0.28], [0.02, 0.36, 0.02])
child(g, 'bowl', 'potWhite', [0.14, 0.4, -0.12]); child(g, 'vase', 'potWhite', [-0.14, 0.4, -0.16], [0.7, 0.7, 0.7])
for i, m in enumerate(['book1', 'paper', 'book2']):
    cbox(g, -0.22 + i * 0.01, 0.02 - i * 0.01, 0.4 + i * 0.024, 0.424 + i * 0.024, 0.0, 0.17, m)
g = group('side', [7.98, 0, 4.62])
child(g, 'cyl', 'marble1', [0, 0.44, 0], [0.22, 0.025, 0.22]); child(g, 'cyl', 'brass', [0, 0.22, 0], [0.018, 0.43, 0.018]); child(g, 'cyl', 'brass', [0, 0.01, 0], [0.15, 0.02, 0.15])
g = group('tvunit', [9.74, 0, 5.15], -90)                                     # low fluted unit in the wall recess
cbox(g, -0.45, 0.45, 0.14, 0.48, -0.16, 0.16, 'walnut')
for i in range(22):
    cbox(g, -0.44 + i * 0.04, -0.44 + i * 0.04 + 0.032, 0.16, 0.46, 0.16, 0.172, 'walnutP')
legs(g, [(-0.38, -0.1), (0.38, -0.1), (-0.38, 0.1), (0.38, 0.1)], 0.14, 0.016, 'brass')
cbox(g, -0.47, 0.47, 0.48, 0.505, -0.17, 0.175, 'oak')
child(g, 'vase', 'potWhite', [0.32, 0.505, 0])
cbox(g, -0.75, 0.45, 0.98, 1.68, -0.16, -0.13, 'screen'); cbox(g, -0.5, 0.2, 0.6, 0.66, -0.13, -0.05, 'black')
frame_art('art-sofa1', 6.729, 1.6, 4.72, 90, 0.62, 0.82, ['artB', 'artA', 'artC'])
frame_art('art-sofa2', 6.729, 1.6, 5.62, 90, 0.62, 0.82, ['artC', 'artD', 'artA'])
frame_art('art-north', 7.75, 1.55, 1.623, 0, 0.95, 0.68, ['artC', 'artB', 'artA'])
g = group('floorlamp', [6.98, 0, 6.42])                                       # tripod floor lamp
for a in (0, 2.094, 4.189):
    child(g, 'cyl', 'oakP', [math.cos(a) * 0.12, 0.65, math.sin(a) * 0.12], [0.012, 1.32, 0.012],
          rot=[round(-math.sin(a) * 0.09, 4), 0, round(math.cos(a) * 0.09, 4), 0.99])
child(g, 'shade', 'shade', [0, 1.3, 0], [1.5, 1.4, 1.5], castShadow=False)
plant('plant-tv', 9.48, 6.2, 'palm', 1.6, seed=9)
r = [0.7071, 0, 0, -0.7071]                                                   # drapes at the balcony door
node('drapeL', 'curtain', [6.98, 0.02, 6.52], rot=r); node('drapeL', 'curtain', [9.5, 0.02, 6.52], rot=r)
node('sheerW', 'sheer', [8.25, 0.02, 6.48], rot=r, castShadow=False)
box(6.8, 9.7, 2.52, 2.56, 6.46, 6.54, 'lacquer')

# ---------------------------------------------------------------- balcony
for (x, zz, deg) in [(7.08, 7.38, 90), (9.0, 7.06, -90)]:
    g = group(uid('lounge'), [x, 0, zz], deg)
    child(g, 'lounge', 'linenSofa', [0, 0, 0])
    legs(g, [(-0.24, -0.24), (0.24, -0.24), (-0.24, 0.24), (0.24, 0.24)], 0.33, 0.016, 'oak')
g = group('btable', [7.6, 0, 7.42])
child(g, 'cyl', 'marble1', [0, 0.45, 0], [0.2, 0.025, 0.2]); child(g, 'cyl', 'black', [0, 0.22, 0], [0.02, 0.44, 0.02]); child(g, 'cyl', 'black', [0, 0.008, 0], [0.13, 0.016, 0.13])
box(9.2, 9.86, 0, 0.34, 7.46, 7.78, 'terracotta'); box(9.23, 9.83, 0.3, 0.32, 7.49, 7.75, 'soil')
nodes.append({'id': 'balcony-shrubs', 'translation': [9.53, 0.31, 7.62], 'vegetation': {'species': 'bush', 'seed': 15, 'height': 0.55, 'leaves': 'mesh'}})
plant('plant-balcony', 9.62, 6.98, 'palm', 1.3, seed=17)
box(6.85, 8.5, 0, 0.012, 6.85, 7.75, 'rugB', castShadow=False)

# ---------------------------------------------------------------- centre: dining for three
g = group('dining', [5.55, 0, 3.9])
cbox(g, -0.7, 0.7, 0.72, 0.755, -0.3, 0.3, 'oak')
legs(g, [(-0.62, -0.24), (0.62, -0.24), (-0.62, 0.24), (0.62, 0.24)], 0.72, 0.022, 'oak')
cbox(g, -0.6, 0.6, 0.755, 0.758, 0.02, 0.22, 'linenSofa')
for x in (-0.46, 0, 0.46):
    child(g, 'plate', 'ceramic', [x, 0.757, -0.14]); child(g, 'glassware', 'glass', [x + 0.13, 0.757, 0.0])
    cbox(g, x + 0.15, x + 0.158, 0.757, 0.76, -0.22, -0.06, 'steel'); cbox(g, x - 0.162, x - 0.154, 0.757, 0.76, -0.22, -0.06, 'steel')
child(g, 'vase', 'potWhite', [-0.2, 0.758, 0.13]); child(g, 'bowl', 'terracotta', [0.25, 0.758, 0.13])
for i in range(4):
    child(g, 'sph', 'fruit', [0.25 + math.cos(i * 1.6) * 0.04, 0.79, 0.13 + math.sin(i * 1.6) * 0.04], [0.035, 0.035, 0.035])
for i, x in enumerate((5.08, 5.55, 6.02)):
    c = group(uid('dchair'), [x, 0, 3.4], (i - 1) * 4)
    child(c, 'dchair', 'linenSofa', [0, 0, 0])
    legs(c, [(-0.18, -0.18), (0.18, -0.18), (-0.18, 0.18), (0.18, 0.18)], 0.43, 0.015, 'oak')
for i, x in enumerate((5.2, 5.55, 5.9)):
    y = 1.62 + (i % 2) * 0.14
    node('cyl', 'black', [x, (y + 0.13 + H) / 2, 3.88], [0.004, H - y - 0.13, 0.004], castShadow=False)
    node('pendant', 'brass', [x, y, 3.88]); node('sph', 'bulb', [x, y + 0.03, 3.88], [0.035, 0.035, 0.035], castShadow=False)
frame_art('art-dining', 5.55, 1.3, 4.212, 180, 0.9, 0.46, ['artC', 'artD', 'artA'])

# ---------------------------------------------------------------- kitchen (open to the centre and the drawing room)
box(4.166, 6.62, 0, 0.1, 0, 0.5, 'black')
box(4.166, 6.62, 0.1, 0.85, 0, 0.56, 'sage')
for i, (x1, x2) in enumerate([(4.166, 4.66), (4.66, 5.12), (5.12, 5.5), (5.5, 6.1), (6.1, 6.62)]):
    if i == 3:
        box(x1 + 0.003, x2 - 0.003, 0.2, 0.845, 0.56, 0.582, 'screen')          # built-in oven
        box(x1 + 0.03, x2 - 0.03, 0.72, 0.8, 0.582, 0.585, 'steel')
        box(x1 + 0.06, x2 - 0.06, 0.66, 0.672, 0.585, 0.61, 'steel')
    else:
        for (y1, y2) in ([(0.105, 0.845)] if i < 2 else [(0.105, 0.38), (0.385, 0.62), (0.625, 0.845)]):
            box(x1 + 0.003, x2 - 0.003, y1, y2, 0.56, 0.578, 'sage')
            box((x1 + x2) / 2 - 0.08, (x1 + x2) / 2 + 0.08, y2 - 0.045, y2 - 0.033, 0.578, 0.595, 'brass')
box(4.166, 6.62, 0.85, 0.89, 0, 0.62, 'marble1')                                 # stone counter and backsplash
box(4.166, 6.62, 0.89, 1.45, 0, 0.012, 'marble1')
box(4.68, 5.1, 0.886, 0.892, 0.14, 0.48, 'steel')                               # sink
child_tap = group('tap', [4.89, 0.89, 0.07])
child(child_tap, 'cyl', 'steel', [0, 0.16, 0], [0.014, 0.32, 0.014]); child(child_tap, 'cyl', 'steel', [0, 0.31, 0.08], [0.012, 0.16, 0.012], rot=[0.7071, 0, 0, 0.7071])
box(5.5, 6.1, 0.89, 0.902, 0.08, 0.54, 'steel')                                 # hob
for (x, zz) in [(5.66, 0.2), (5.94, 0.2), (5.66, 0.42), (5.94, 0.42)]:
    node('ring', 'black', [x, 0.91, zz], [0.08, 0.08, 0.08], rot=[0.7071, 0, 0, 0.7071])
box(5.5, 6.1, 1.56, 1.66, 0, 0.5, 'steelB'); box(5.68, 5.92, 1.66, 2.42, 0, 0.27, 'steelB')     # chimney
for (x1, x2) in [(4.6, 5.02), (5.02, 5.44), (6.16, 6.62)]:                       # wall cabinets
    box(x1 + 0.003, x2 - 0.003, 1.45, 2.2, 0, 0.33, 'lacquer')
    box(x1 + 0.03, x1 + 0.042, 1.5, 1.7, 0.33, 0.345, 'brass')
box(6.18, 6.6, 1.48, 1.8, 0.33, 0.336, 'screen')
box(4.62, 5.42, 1.438, 1.448, 0.2, 0.24, 'bulb', castShadow=False)
g = group('fridge', [4.166, 0, 1.93], 90)
cbox(g, -0.35, 0.35, 0.02, 1.82, 0, 0.66, 'steelB'); cbox(g, -0.003, 0.003, 0.02, 1.82, 0.66, 0.68, 'black')
cbox(g, -0.05, -0.03, 0.75, 1.45, 0.68, 0.71, 'black'); cbox(g, 0.03, 0.05, 0.75, 1.45, 0.68, 0.71, 'black')
node('bowl', 'potWhite', [5.3, 0.89, 0.3])
for i in range(4):
    node('sph', 'fruit', [5.3 + math.cos(i * 1.6) * 0.04, 0.92, 0.3 + math.sin(i * 1.6) * 0.04], [0.035, 0.035, 0.035])
box(4.22, 4.5, 0.89, 1.25, 0.015, 0.04, 'oak'); box(4.3, 4.56, 0.89, 1.15, 0.045, 0.065, 'walnut')
node('vase', 'potWhite', [6.45, 0.89, 0.25], [0.8, 0.8, 0.8])
box(4.55, 6.3, 0, 0.012, 0.76, 1.36, 'rugB', castShadow=False)
frame_art('art-kitchen', 4.169, 1.5, 2.66, 90, 0.42, 0.56, ['artB', 'artC', 'artA'])

# ---------------------------------------------------------------- kitchen store
box(6.726, 8.247, 0.76, 0.8, 0, 0.45, 'marble1'); box(7.8, 8.247, 0.76, 0.8, 0.45, 1.516, 'marble1')
box(6.726, 8.247, 0, 0.76, 0, 0.45, 'lacquer'); box(7.8, 8.247, 0, 0.76, 0.45, 1.516, 'lacquer')
for y in (1.25, 1.68, 2.1):
    box(6.726, 8.247, y, y + 0.028, 0, 0.3, 'oakP'); box(7.947, 8.247, y, y + 0.028, 0.3, 1.516, 'oakP')
    for k in range(5):
        node('glassware', 'glass' if k % 2 else 'potWhite', [6.85 + k * 0.22, y + 0.028, 0.15], [1.6, 1.6, 1.6])

# ---------------------------------------------------------------- wash yard
box(1.75, 2.35, 0, 0.86, 0.05, 0.65, 'lacquer'); node('ring', 'steel', [2.05, 0.42, 0.66], [0.2, 0.2, 0.2])
node('cyl', 'screen', [2.05, 0.42, 0.655], [0.17, 0.01, 0.17], rot=[0.7071, 0, 0, 0.7071])
for zz in (0.35, 0.49, 0.63, 0.77, 0.91):
    box(2.55, 3.95, 2.05, 2.062, zz, zz + 0.012, 'steel')
node('planter', 'cane', [3.72, 0, 0.32], [0.9, 0.9, 0.9])

# ---------------------------------------------------------------- toilets
def toilet(wcx, westx, vanx, vanz, zn, shz, tag):
    box(wcx - 0.3, wcx + 0.3, 0, 1.1, zn, zn + 0.13, 'walltile')
    box(wcx - 0.11, wcx + 0.11, 0.96, 1.06, zn + 0.13, zn + 0.142, 'steel')
    node('wc', 'ceramic', [wcx, 0, zn + 0.13])
    box(vanx, vanx + 0.44, 0.48, 0.76, vanz, vanz + 0.44, 'oakV')
    box(vanx - 0.01, vanx + 0.44, 0.76, 0.795, vanz, vanz + 0.46, 'marble1')
    node('basin', 'ceramic', [vanx + 0.22, 0.795, vanz + 0.24])
    node('cyl', 'steel', [vanx + 0.22, 0.89, vanz + 0.05], [0.011, 0.19, 0.011])
    box(vanx + 0.03, vanx + 0.41, 1.08, 1.8, vanz - 0.004, vanz + 0.006, 'mirror')
    box(vanx, vanx + 0.44, 1.82, 1.84, vanz, vanz + 0.03, 'bulb', castShadow=False)
    gx = westx + 0.78
    node('cube', 'glass', [gx + 0.005, 1.01, (shz + 2.6) / 2], [0.01, 1.98, 2.6 - shz], rayVisibility='glass', castShadow=False)
    box(gx - 0.01, gx + 0.02, 2.0, 2.02, shz, 2.6, 'steel')
    node('cyl', 'steel', [westx + 0.32, 2.03, 2.3], [0.11, 0.01, 0.11])
    box(westx, westx + 0.32, 2.045, 2.055, 2.295, 2.305, 'steel')
    box(vanx - 0.05, vanx + 0.44, 0, 0.012, 2.25, 2.62, 'rugB', castShadow=False)


toilet(1.2, 0, 1.6, 1.632, 1.62, 1.755, 'A')
toilet(3.24, 2.161, 3.61, 1.767, 1.755, 1.62, 'B')

# ---------------------------------------------------------------- bedroom-1 (master): wardrobe on the toilet wall
box(0, 1.22, 0, 0.08, 3.043, 3.6, 'black')
box(0, 1.22, 0.08, H, 3.043, 3.63, 'oakV')
for (a, b) in [(0.004, 0.608), (0.612, 1.216)]:
    box(a, b, 0.085, 2.12, 3.63, 3.65, 'oakV'); box(a, b, 2.13, H - 0.005, 3.63, 3.65, 'lacquer')
box(0.565, 0.58, 0.95, 1.35, 3.65, 3.67, 'brass'); box(0.64, 0.655, 0.95, 1.35, 3.65, 3.67, 'brass')
g = group('bed1', [1.6, 0, 6.415], 180)
child(g, 'bedD', 'bedlinen', [0, 0, 0]); child(g, 'bedDHead', 'headboard', [0, 0, 0])
child(g, 'bedpillow', 'bedlinen', [-0.37, 0.68, -0.8], rot=[0.3, 0, 0, 0.954]); child(g, 'bedpillow', 'bedlinen', [0.37, 0.68, -0.8], rot=[0.3, 0, 0, 0.954])
child(g, 'pillow', 'teal', [-0.28, 0.7, -0.64], rot=[0.38, 0, 0, 0.925]); child(g, 'pillow', 'teal', [0.28, 0.7, -0.64], rot=[0.38, 0, 0, 0.925])
child(g, 'pillow', 'mustard', [0, 0.66, -0.52], [1.2, 0.6, 1], rot=[0.42, 0, 0, 0.907])
cbox(g, -0.82, 0.82, 0.57, 0.62, 0.5, 0.86, 'duvetSage')                       # throw across the foot
nightstand('ns1a', 0.47, 7.22, 180); nightstand('ns1b', 2.73, 7.22, 180)
box(0.4, 2.8, 0, 0.014, 5.0, 7.3, 'rugA', castShadow=False)
g = group('dresser', [3.04, 0, 4.88], -90)
legs(g, [(-0.44, 0.1), (0.44, 0.1), (-0.44, 0.44), (0.44, 0.44)], 0.16, 0.018, 'brass')
cbox(g, -0.52, 0.52, 0.16, 0.78, 0, 0.5, 'oak')
for (y1, y2) in [(0.18, 0.37), (0.375, 0.565), (0.57, 0.765)]:
    cbox(g, -0.505, 0.505, y1, y2, 0.5, 0.512, 'oakP'); cbox(g, -0.07, 0.07, y2 - 0.04, y2 - 0.028, 0.512, 0.525, 'brass')
cbox(g, -0.54, 0.54, 0.78, 0.805, 0, 0.52, 'walnut')
child(g, 'roundmirror', 'mirror', [0, 1.5, 0.012], [0.36, 0.01, 0.36], rot=[0.7071, 0, 0, 0.7071])
child(g, 'ring', 'brass', [0, 1.5, 0.016], [0.36, 0.36, 0.36])
child(g, 'vase', 'potWhite', [-0.34, 0.805, 0.24]); child(g, 'bowl', 'brass', [0.2, 0.805, 0.3], [0.5, 0.5, 0.5])
node('cyl', 'headboard', [2.16, 0.22, 4.88], [0.18, 0.44, 0.18])
g = group('armchair', [0.55, 0, 4.75], 70)
child(g, 'armchair', 'mustard', [0, 0, 0])
legs(g, [(-0.3, -0.3), (0.3, -0.3), (-0.3, 0.3), (0.3, 0.3)], 0.22, 0.018, 'oak')
g = group('floorlamp1', [0.3, 0, 4.08])
for a in (0, 2.094, 4.189):
    child(g, 'cyl', 'oakP', [math.cos(a) * 0.12, 0.65, math.sin(a) * 0.12], [0.012, 1.32, 0.012], rot=[round(-math.sin(a) * 0.09, 4), 0, round(math.cos(a) * 0.09, 4), 0.99])
child(g, 'shade', 'shade', [0, 1.3, 0], [1.4, 1.3, 1.4], castShadow=False)
frame_art('art-b1', 0.003, 1.55, 5.75, 90, 0.6, 0.8, ['artB', 'artC', 'artA'])
curtains_window(1.16, 2.56, 7.483, 2.24, -1)
plant('plant-b1', 2.8, 5.75, 'palm', 1.2, seed=31)

# ---------------------------------------------------------------- bedroom-2 (guest + study)
box(3.281, 3.9, 0, 0.08, 5.36, 7.76, 'black')
box(3.281, 3.88, 0.08, H, 5.36, 7.76, 'lacquer')
for zz in (5.36, 5.96, 6.56, 7.16):
    box(3.88, 3.9, 0.085, 2.12, zz + 0.003, zz + 0.597, 'lacquer'); box(3.9, 3.915, 0.95, 1.3, zz + 0.52, zz + 0.535, 'brass')
g = group('bed2', [6.04, 0, 6.75], 180)
child(g, 'bedS', 'bedlinen', [0, 0, 0]); child(g, 'bedSHead', 'headboard', [0, 0, 0])
child(g, 'bedpillow', 'bedlinen', [0, 0.68, -0.8], rot=[0.3, 0, 0, 0.954])
child(g, 'pillow', 'teal', [0.05, 0.7, -0.64], rot=[0.38, 0, 0, 0.925])
cbox(g, -0.52, 0.52, 0.57, 0.62, 0.5, 0.86, 'teal')
nightstand('ns2', 5.2, 7.56, 180)
box(4.15, 5.55, 0, 0.014, 5.75, 7.3, 'rugB', castShadow=False)
g = group('desk', [6.62, 0, 5.04], -90)
cbox(g, -0.62, 0.62, 0.72, 0.752, 0, 0.6, 'oak')
for (x, zz) in [(-0.56, 0.52), (0.56, 0.52), (-0.56, 0.06), (0.56, 0.06)]:
    child(g, 'cyl', 'black', [x, 0.36, zz], [0.014, 0.72, 0.014])
cbox(g, 0.14, 0.58, 0.3, 0.72, 0.04, 0.56, 'lacquer')
cbox(g, -0.3, 0.3, 1.0, 1.36, 0.1, 0.118, 'screen'); child(g, 'cyl', 'black', [0, 0.92, 0.085], [0.014, 0.34, 0.014]); cbox(g, -0.1, 0.1, 0.752, 0.762, 0.03, 0.17, 'black')
cbox(g, -0.2, 0.2, 0.752, 0.766, 0.3, 0.44, 'black')
cbox(g, -0.45, 0.45, 1.52, 1.548, 0, 0.22, 'oak')
for k in range(12):
    cbox(g, -0.42 + k * 0.045, -0.42 + k * 0.045 + 0.034, 1.548, 1.548 + 0.17 + (k * 37 % 7) * 0.012, 0.03, 0.19, ['book1', 'book2', 'book3', 'paper'][k % 4])
g = group('deskchair', [5.72, 0, 5.04], 90)
child(g, 'dchair', 'teal', [0, 0, 0])
child(g, 'cyl', 'steel', [0, 0.22, 0], [0.022, 0.4, 0.022])
for i in range(5):
    a = i * 1.2566
    child(g, 'cube', 'black', [math.cos(a) * 0.13, 0.03, math.sin(a) * 0.13], [0.26, 0.025, 0.03], rot=[0, round(math.sin(-a / 2), 4), 0, round(math.cos(-a / 2), 4)])
frame_art('art-b2a', 4.72, 1.5, 4.323, 0, 0.5, 0.66, ['artA', 'artB', 'artC'])
frame_art('art-b2b', 5.34, 1.5, 4.323, 0, 0.5, 0.66, ['artC', 'artA', 'artD'])
plant('plant-b2', 4.22, 7.5, 'palm', 1.2, seed=23)
curtains_window(4.42, 6.11, 7.818, 2.24, -1)

# ---------------------------------------------------------------- lobby stub outside the main door
box(10.004, 11.85, 0, H, 0.75, 0.85, 'lobby'); box(10.004, 11.85, 0, H, 3.75, 3.85, 'lobby'); box(11.75, 11.85, 0, H, 0.75, 3.85, 'lobby')

# ---------------------------------------------------------------- light and camera
# Ahmedabad, about 9:30 am in winter: sun in the south-east, 35 degrees up (north is -z)
az, alt = math.radians(140), math.radians(35)
sun_dir = [round(math.sin(az) * math.cos(alt), 4), round(math.sin(alt), 4), round(-math.cos(az) * math.cos(alt), 4)]
lamps = [
    {'position': [6.98, 1.45, 6.42], 'color': lin('#ffcf94'), 'intensity': 18, 'radius': 0.08, 'range': 5},
    {'position': [0.3, 1.45, 4.08], 'color': lin('#ffcf94'), 'intensity': 14, 'radius': 0.08, 'range': 5},
    {'position': [0.41, 0.85, 7.18], 'color': lin('#ffcf94'), 'intensity': 6, 'radius': 0.06, 'range': 3},
    {'position': [2.67, 0.85, 7.18], 'color': lin('#ffcf94'), 'intensity': 6, 'radius': 0.06, 'range': 3},
    {'position': [5.55, 1.5, 3.88], 'color': lin('#ffd9a8'), 'intensity': 14, 'radius': 0.1, 'range': 4},
    {'position': [8.4, 1.2, 1.8], 'color': lin('#ffc27a'), 'intensity': 4, 'radius': 0.05, 'range': 2.5},
]
recipe = {
    'format': 'crucible.scene', 'schemaVersion': 1,
    'geometries': geoms, 'materials': mats, 'nodes': nodes,
    'environment': {'setup': 'daylight', 'world': True, 'ground': False, 'lightDirection': sun_dir,
                    'pointLights': lamps, 'viewTransform': 'agx', 'sunBounce': 1},
    'effects': {'ambientOcclusion': 0.6, 'ambientOcclusionRadius': 0.4},
    'shadow': {'target': [5, 0, 3.9], 'extent': 14},
    'camera': {'eye': [9.45, 1.5, 2.3], 'target': [7.6, 1.2, 4.6], 'focalLength': 18},
}
out = 'recipe-open.json' if OPEN else 'recipe.json'
with open(__file__.rsplit('/', 1)[0] + '/' + out, 'w') as f:
    json.dump(recipe, f, separators=(',', ':'))
print(out, 'nodes', len(nodes), 'geometries', len(geoms), 'materials', len(mats), 'bytes', len(json.dumps(recipe, separators=(',', ':'))))
