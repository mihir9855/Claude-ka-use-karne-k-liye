#!/usr/bin/env python3
"""
Bar Unit 3D model generator — Anahata Villas, Chavda Farm House (drawing WD-06, Nirja Architects).

One geometry description produces:
  * bar_unit.ms   -> 3ds Max MAXScript (run via Scripting > Run Script). Builds the full model in mm
                     with layers, Physical materials, UVW mapping, LED emissive strips and cameras.
  * bar_unit.obj / bar_unit.mtl -> neutral mesh (File > Import in 3ds Max, SketchUp, Blender, etc.)

Coordinate convention used in this file (all millimetres, as in the drawing):
  x : along the back wall, 0 = left end of back counter, 3880 = right end
  d : depth from the back wall face into the room (0 = wall face)
  z : height from finished floor
In 3ds Max the model is placed as (x, -d, z) so the Front viewport looks straight at the bar.
"""
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))

# ----------------------------------------------------------------------------------------------
# Materials: name -> (rgb 0-1, roughness, metalness, transparency, emission)
# ----------------------------------------------------------------------------------------------
MATS = {
    "Stone_Kesariyaji_Green_Glossy": ((0.09, 0.20, 0.13), 0.06, 0.0, 0.0, 0.0),
    "Veneer_Wood":                   ((0.47, 0.29, 0.16), 0.35, 0.0, 0.0, 0.0),
    "Veneer_Carcass_Interior":       ((0.62, 0.47, 0.33), 0.50, 0.0, 0.0, 0.0),
    "Veneer_Mural_Painting":         ((0.78, 0.66, 0.50), 0.45, 0.0, 0.0, 0.0),
    "MS_Grill_Black_Powdercoat":     ((0.03, 0.03, 0.03), 0.45, 0.6, 0.0, 0.0),
    "Brass_Brushed":                 ((0.80, 0.62, 0.32), 0.25, 1.0, 0.0, 0.0),
    "Stainless_Steel":               ((0.72, 0.72, 0.74), 0.22, 1.0, 0.0, 0.0),
    "Glass_Clear":                   ((0.85, 0.95, 0.92), 0.00, 0.0, 0.92, 0.0),
    "Glass_Cooler_Door_Tinted":      ((0.25, 0.30, 0.30), 0.00, 0.0, 0.80, 0.0),
    "Black_Matte":                   ((0.02, 0.02, 0.02), 0.70, 0.0, 0.0, 0.0),
    "Cooler_Interior":               ((0.08, 0.08, 0.09), 0.40, 0.0, 0.0, 0.0),
    "LED_Warm_3000K":                ((1.00, 0.80, 0.55), 0.50, 0.0, 0.0, 1.0),
    "Plaster_Wall":                  ((0.86, 0.84, 0.80), 0.80, 0.0, 0.0, 0.0),
    "Floor_Marble_Beige":            ((0.80, 0.76, 0.69), 0.15, 0.0, 0.0, 0.0),
    "Ceiling_White":                 ((0.92, 0.92, 0.90), 0.85, 0.0, 0.0, 0.0),
    "Rubber_Bar_Mat":                ((0.04, 0.04, 0.04), 0.90, 0.0, 0.0, 0.0),
    "Leather_Seat_Tan":              ((0.45, 0.25, 0.12), 0.55, 0.0, 0.0, 0.0),
    "Bottle_Glass_Green":            ((0.10, 0.25, 0.10), 0.02, 0.0, 0.55, 0.0),
    "Bottle_Glass_Amber":            ((0.45, 0.22, 0.05), 0.02, 0.0, 0.55, 0.0),
    "Bottle_Glass_Clear":            ((0.80, 0.85, 0.85), 0.02, 0.0, 0.75, 0.0),
    "Bottle_Cap_Foil":               ((0.35, 0.05, 0.06), 0.30, 0.8, 0.0, 0.0),
}

# Map type used for UVW / procedural detail in Max
MAT_PROC = {
    "Stone_Kesariyaji_Green_Glossy": "marble",
    "Veneer_Wood": "wood",
    "Veneer_Carcass_Interior": "wood",
}

prims = []   # every primitive in the model


def box(name, x0, x1, d0, d1, z0, z1, mat, layer, fillet=0.0):
    x0, x1 = min(x0, x1), max(x0, x1)
    d0, d1 = min(d0, d1), max(d0, d1)
    z0, z1 = min(z0, z1), max(z0, z1)
    prims.append(dict(t="box", name=name, x0=x0, x1=x1, d0=d0, d1=d1, z0=z0, z1=z1,
                      mat=mat, layer=layer, fillet=fillet))


def cyl(name, base, axis, length, r0, mat, layer, r1=None, sides=24):
    """Cylinder / frustum. base=(x,d,z) centre of the start cap, axis in {'x','d','z'}."""
    prims.append(dict(t="cyl", name=name, base=base, axis=axis, length=length,
                      r0=r0, r1=(r0 if r1 is None else r1), mat=mat, layer=layer, sides=sides))


def torus(name, centre, R, r, mat, layer):
    prims.append(dict(t="torus", name=name, c=centre, R=R, r=r, mat=mat, layer=layer))


# ----------------------------------------------------------------------------------------------
# Key dimensions (from drawing WD-06)
# ----------------------------------------------------------------------------------------------
L_LEFT, L_MID, L_RIGHT = 1250, 1380, 1250
X_MID0 = L_LEFT                     # 1250
X_MID1 = L_LEFT + L_MID             # 2630
X_END = X_MID1 + L_RIGHT            # 3880

D_CLAD = 120                        # wall cladding / service zone (plan dim 120)
D_CTR = D_CLAD + 350                # back counter front face (plan dim 350) -> 470
PLINTH = 75                         # elevation dim 75
SHUT_H = 675                        # elevation dim 675
TOP_T = 20                          # elevation dim 20 (stone top)
Z_CTR = PLINTH + SHUT_H + TOP_T     # 770 counter top
Z_SPLASH = Z_CTR + 500              # 1270 long glass shelf / stone backsplash
Z_CLAD_TOP = Z_CTR + 1395           # 2165 top of stone cladding (elevation dim 1395)
Z_TOP = Z_CLAD_TOP + 570            # 2735 top of veneer / MS grill band (elevation dim 570)

RET_W = 650                         # return (wine & beer cooler platform) width
D_RET_END = D_CTR + 900 + 225       # 1595 return ends where bar front band begins
D_BAR_BACK = D_CTR + 900            # 1370 bartender edge of bar table
D_BAR_FACE = D_RET_END + 150        # 1745 front face of bar body
D_BAR_FRONT = D_BAR_FACE + 75       # 1820 front edge of raised top (75 overhang)
X_BAR_END = RET_W + 1850            # 2500 bar table right end
Z_BAR = 1050                        # raised bar ledge height (assumed - no section given)

STONE = "Stone_Kesariyaji_Green_Glossy"
VEN = "Veneer_Wood"
CARC = "Veneer_Carcass_Interior"

# ----------------------------------------------------------------------------------------------
# 1. Architecture (wall, floor, ceiling, mural panel)
# ----------------------------------------------------------------------------------------------
A = "01_Architecture"
box("Back_Wall", -800, 5600, -230, 0, 0, Z_TOP, "Plaster_Wall", A)
box("Floor", -800, 5600, 0, 4200, -20, 0, "Floor_Marble_Beige", A)
box("Ceiling", -800, 5600, 0, 4200, Z_TOP, Z_TOP + 20, "Ceiling_White", "01_Architecture_Ceiling")
box("Mural_Veneer_Panel", X_END, X_END + 920, 0, 18, 0, Z_TOP, "Veneer_Mural_Painting", A, fillet=1.5)
# thin brass reveal between bar wall and mural panel
box("Mural_Reveal_Brass", X_END + 2, X_END + 8, 18, 22, 0, Z_TOP, "Brass_Brushed", A)

# ----------------------------------------------------------------------------------------------
# 2. Back wall cladding : stone 1395 high, glass shelves, veneer / MS grill bulkhead 570 high
# ----------------------------------------------------------------------------------------------
W = "02_Wall_Cladding"
box("Cladding_Substructure", 0, X_END, 0, D_CLAD - 20, 0, Z_CLAD_TOP, "Plaster_Wall", W)
for i, (a, b) in enumerate([(0, X_MID0), (X_MID0, X_MID1), (X_MID1, X_END)]):
    box(f"Stone_Cladding_Slab_{i+1}", a + (1 if i else 0), b - (1 if i < 2 else 0),
        D_CLAD - 20, D_CLAD, Z_CTR, Z_CLAD_TOP, STONE, W, fillet=1.0)
# end returns of the cladding (visible at both ends)
box("Stone_Cladding_End_L", -20, 0, 0, D_CLAD, Z_CTR, Z_CLAD_TOP, STONE, W)
box("Stone_Cladding_End_R", X_END, X_END + 0.1, 0, D_CLAD, Z_CTR, Z_CLAD_TOP, STONE, W)

# Long glass shelf at +500 over counter, full width of middle bay (elevation "GLASS SHELF")
box("Glass_Shelf_Long", X_MID0 + 5, X_MID1 - 5, D_CLAD, D_CLAD + 250, Z_SPLASH, Z_SPLASH + 12,
    "Glass_Clear", W, fillet=1.0)
box("Glass_Shelf_Long_LED_Channel", X_MID0 + 5, X_MID1 - 5, D_CLAD, D_CLAD + 25, Z_SPLASH - 30, Z_SPLASH,
    "Brass_Brushed", W)
box("Glass_Shelf_Long_LED", X_MID0 + 10, X_MID1 - 10, D_CLAD + 24, D_CLAD + 26, Z_SPLASH - 25, Z_SPLASH - 5,
    "LED_Warm_3000K", W)
for k, xb in enumerate([X_MID0 + 60, X_MID1 - 80]):
    box(f"Glass_Shelf_Long_Bracket_{k+1}", xb, xb + 20, D_CLAD, D_CLAD + 220, Z_SPLASH - 8, Z_SPLASH,
        "Brass_Brushed", W)

# Small staggered glass bottle shelves: slots of 150 with 158 gaps (150,158,150,158,150,158,150,158,150)
SLOT = [0, 308, 616, 924, 1232]
ROW_A = [Z_CLAD_TOP - 350, Z_CLAD_TOP - 700]          # 1815, 1465 -> slots 1,3,5
ROW_B = [Z_CLAD_TOP - 195, Z_CLAD_TOP - 545]          # 1970, 1620 -> slots 2,4
small_shelves = []
for z in ROW_A:
    for s in (0, 2, 4):
        small_shelves.append((X_MID0 + SLOT[s], z))
for z in ROW_B:
    for s in (1, 3):
        small_shelves.append((X_MID0 + SLOT[s], z))
for n, (sx, sz) in enumerate(small_shelves, 1):
    box(f"Glass_Bottle_Shelf_{n:02d}", sx, sx + 150, D_CLAD, D_CLAD + 150, sz, sz + 10, "Glass_Clear", W, fillet=1.0)
    box(f"Glass_Bottle_Shelf_{n:02d}_Bracket", sx + 10, sx + 140, D_CLAD, D_CLAD + 4, sz - 35, sz, "Brass_Brushed", W)
    box(f"Glass_Bottle_Shelf_{n:02d}_BracketArmL", sx + 15, sx + 21, D_CLAD, D_CLAD + 120, sz - 6, sz, "Brass_Brushed", W)
    box(f"Glass_Bottle_Shelf_{n:02d}_BracketArmR", sx + 129, sx + 135, D_CLAD, D_CLAD + 120, sz - 6, sz, "Brass_Brushed", W)
    cyl(f"Glass_Bottle_Shelf_{n:02d}_Stop_Rail", (sx + 5, D_CLAD + 140, sz + 22), "x", 140, 3, "Brass_Brushed", W, sides=12)
    for xp in (sx + 8, sx + 142):
        cyl(f"Glass_Bottle_Shelf_{n:02d}_Stop_Post", (xp, D_CLAD + 140, sz + 10), "z", 12, 3, "Brass_Brushed", W, sides=12)

# Bulkhead band 570 high: veneer left & right, MS grill in the middle bay, indirect light below
D_BULK = 250
box("Bulkhead_Veneer_Left", 0, X_MID0, 0, D_BULK, Z_CLAD_TOP, Z_TOP, VEN, W, fillet=1.5)
box("Bulkhead_Veneer_Right", X_MID1, X_END, 0, D_BULK, Z_CLAD_TOP, Z_TOP, VEN, W, fillet=1.5)
box("Bulkhead_Mid_Void", X_MID0, X_MID1, 0, D_BULK - 60, Z_CLAD_TOP, Z_TOP, "Black_Matte", W)
box("Bulkhead_Mid_Frame_Top", X_MID0, X_MID1, D_BULK - 60, D_BULK, Z_TOP - 50, Z_TOP, VEN, W)
box("Bulkhead_Mid_Frame_Bot", X_MID0, X_MID1, D_BULK - 60, D_BULK, Z_CLAD_TOP, Z_CLAD_TOP + 40, VEN, W)
box("Bulkhead_Mid_Frame_L", X_MID0, X_MID0 + 50, D_BULK - 60, D_BULK, Z_CLAD_TOP + 40, Z_TOP - 50, VEN, W)
box("Bulkhead_Mid_Frame_R", X_MID1 - 50, X_MID1, D_BULK - 60, D_BULK, Z_CLAD_TOP + 40, Z_TOP - 50, VEN, W)
# MS grill: 25x25 frame + vertical flats
gx0, gx1, gz0, gz1 = X_MID0 + 50, X_MID1 - 50, Z_CLAD_TOP + 40, Z_TOP - 50
gd0, gd1 = D_BULK - 40, D_BULK - 15
box("MS_Grill_Frame_Top", gx0, gx1, gd0, gd1, gz1 - 25, gz1, "MS_Grill_Black_Powdercoat", W)
box("MS_Grill_Frame_Bot", gx0, gx1, gd0, gd1, gz0, gz0 + 25, "MS_Grill_Black_Powdercoat", W)
box("MS_Grill_Frame_L", gx0, gx0 + 25, gd0, gd1, gz0 + 25, gz1 - 25, "MS_Grill_Black_Powdercoat", W)
box("MS_Grill_Frame_R", gx1 - 25, gx1, gd0, gd1, gz0 + 25, gz1 - 25, "MS_Grill_Black_Powdercoat", W)
nbar = 25
pitch = (gx1 - gx0 - 50) / nbar
for i in range(1, nbar):
    bx = gx0 + 25 + i * pitch
    box(f"MS_Grill_Flat_{i:02d}", bx - 6, bx + 6, gd0 + 5, gd1 - 5, gz0 + 25, gz1 - 25, "MS_Grill_Black_Powdercoat", W)
# Indirect light below bulkhead (cove LED + diffuser)
box("Bulkhead_LED_Profile", 0, X_END, D_BULK - 45, D_BULK - 15, Z_CLAD_TOP - 12, Z_CLAD_TOP, "Brass_Brushed", W)
box("Bulkhead_LED_Strip", 5, X_END - 5, D_BULK - 40, D_BULK - 20, Z_CLAD_TOP - 13, Z_CLAD_TOP - 11, "LED_Warm_3000K", W)

# ----------------------------------------------------------------------------------------------
# 3. Back counter (3880 x 350, top at 770): cooler bay + 8 veneer shutters + stone top + bar trough
# ----------------------------------------------------------------------------------------------
B = "03_Back_Counter"
D_SHUT = D_CTR - 19                 # 451, shutters 19 thk
box("BackCtr_Plinth", 0, X_END, D_CLAD, D_CTR - 50, 0, PLINTH, "Black_Matte", B)
box("BackCtr_Plinth_LED", X_MID0, X_END, D_CTR - 52, D_CTR - 48, PLINTH - 6, PLINTH - 2, "LED_Warm_3000K", B)
box("BackCtr_Carcass_Back", 0, X_END, D_CLAD, D_CLAD + 18, PLINTH, Z_CTR - TOP_T, CARC, B)
box("BackCtr_Carcass_Bottom", 0, X_END, D_CLAD, D_SHUT, PLINTH, PLINTH + 18, CARC, B)
for k, xs in enumerate([0, RET_W, X_MID0, X_MID1, X_END - 18]):
    box(f"BackCtr_Partition_{k+1}", xs, xs + 18, D_CLAD, D_SHUT, PLINTH, Z_CTR - TOP_T, CARC, B)
for k, (a, b) in enumerate([(X_MID0 + 18, X_MID1), (X_MID1 + 18, X_END - 18)]):
    box(f"BackCtr_Internal_Shelf_{k+1}", a, b, D_CLAD + 18, D_SHUT - 20, 420, 438, CARC, B)
box("BackCtr_Blind_Panel_Behind_Return", 18, RET_W, D_SHUT, D_CTR, PLINTH, Z_CTR - TOP_T, VEN, B)

# 8 shutters (4 EQ in each bay) with continuous brass gola handle channel at the top
GAP = 3
Z_SH0, Z_SH1 = PLINTH + 2, Z_CTR - TOP_T - 32
n = 0
for a, b in [(X_MID0, X_MID1), (X_MID1, X_END)]:
    w = (b - a) / 4
    for i in range(4):
        n += 1
        sx0 = a + i * w + GAP / 2
        sx1 = a + (i + 1) * w - GAP / 2
        box(f"BackCtr_Shutter_{n}", sx0, sx1, D_SHUT, D_CTR, Z_SH0, Z_SH1, VEN, B, fillet=1.5)
        # concealed hinges hint: two black hinge cups visible in the gap side (tiny)
box("BackCtr_Gola_Channel", X_MID0, X_END, D_SHUT - 20, D_CTR - 2, Z_SH1 + 2, Z_CTR - TOP_T, "Brass_Brushed", B)
box("BackCtr_Gola_Recess_Shadow", X_MID0, X_END, D_SHUT - 25, D_SHUT - 20, Z_SH1 + 2, Z_CTR - TOP_T, "Black_Matte", B)

# Under-counter beverage cooler (X 650-1250) - "COOLER UNDER PLATFORM"
cx0, cx1 = RET_W + 18, X_MID0
box("BackCooler_Body", cx0, cx1, D_CLAD + 20, D_CTR - 25, PLINTH, Z_CTR - TOP_T - 5, "Cooler_Interior", B)
box("BackCooler_Frame_L", cx0, cx0 + 35, D_CTR - 25, D_CTR, PLINTH + 80, Z_CTR - TOP_T - 5, "Stainless_Steel", B)
box("BackCooler_Frame_R", cx1 - 35, cx1, D_CTR - 25, D_CTR, PLINTH + 80, Z_CTR - TOP_T - 5, "Stainless_Steel", B)
box("BackCooler_Frame_Top", cx0, cx1, D_CTR - 25, D_CTR, Z_CTR - TOP_T - 55, Z_CTR - TOP_T - 5, "Stainless_Steel", B)
box("BackCooler_Glass_Door", cx0 + 35, cx1 - 35, D_CTR - 14, D_CTR - 8, PLINTH + 80, Z_CTR - TOP_T - 55,
    "Glass_Cooler_Door_Tinted", B)
box("BackCooler_Handle", cx1 - 70, cx1 - 55, D_CTR, D_CTR + 25, PLINTH + 200, Z_CTR - TOP_T - 120, "Stainless_Steel", B, fillet=3)
box("BackCooler_Interior_LED", cx0 + 40, cx1 - 40, D_CTR - 40, D_CTR - 30, Z_CTR - TOP_T - 70, Z_CTR - TOP_T - 62,
    "LED_Warm_3000K", B)
for k, zs in enumerate([PLINTH + 230, PLINTH + 420]):
    box(f"BackCooler_Wire_Shelf_{k+1}", cx0 + 40, cx1 - 40, D_CLAD + 30, D_CTR - 40, zs, zs + 6, "Stainless_Steel", B)
# louvred jali kick for releasing cooler heat
box("BackCooler_Louvre_Frame", cx0, cx1, D_CTR - 30, D_CTR - 25, PLINTH, PLINTH + 80, "Black_Matte", B)
for i in range(6):
    zz = PLINTH + 6 + i * 12
    box(f"BackCooler_Louvre_Slat_{i+1}", cx0 + 5, cx1 - 5, D_CTR - 25, D_CTR - 2, zz, zz + 6, "Stainless_Steel", B)

# Stone top with thickened 40 mm front edge; opening for the bar trough in the middle bay
TX0, TX1, TD0, TD1 = X_MID0 + 130, X_MID1 - 130, D_CLAD + 70, D_CTR - 50   # trough opening
box("BackCtr_Top_Front", 0, X_END, TD1, D_CTR + 20, Z_CTR - TOP_T, Z_CTR, STONE, B, fillet=2)
box("BackCtr_Top_Rear", 0, X_END, D_CLAD, TD0, Z_CTR - TOP_T, Z_CTR, STONE, B)
box("BackCtr_Top_Left", 0, TX0, TD0, TD1, Z_CTR - TOP_T, Z_CTR, STONE, B)
box("BackCtr_Top_Right", TX1, X_END, TD0, TD1, Z_CTR - TOP_T, Z_CTR, STONE, B)
box("BackCtr_Top_Edge_Apron", 0, X_END, D_CTR, D_CTR + 20, Z_CTR - 40, Z_CTR - TOP_T, STONE, B, fillet=1)
box("BackCtr_Top_Upstand", 0, X_END, D_CLAD, D_CLAD + 15, Z_CTR, Z_CTR + 100, STONE, B, fillet=1)

# Stainless bar trough / ice well with slatted drain grate (plan, middle bay)
T = "04_Bar_Trough"
box("Trough_Liner_Bottom", TX0, TX1, TD0, TD1, Z_CTR - 170, Z_CTR - 167, "Stainless_Steel", T)
box("Trough_Liner_Back", TX0, TX1, TD0, TD0 + 3, Z_CTR - 170, Z_CTR, "Stainless_Steel", T)
box("Trough_Liner_Front", TX0, TX1, TD1 - 3, TD1, Z_CTR - 170, Z_CTR, "Stainless_Steel", T)
box("Trough_Liner_L", TX0, TX0 + 3, TD0, TD1, Z_CTR - 170, Z_CTR, "Stainless_Steel", T)
box("Trough_Liner_R", TX1 - 3, TX1, TD0, TD1, Z_CTR - 170, Z_CTR, "Stainless_Steel", T)
box("Trough_Rim", TX0 - 10, TX1 + 10, TD0 - 10, TD1 + 10, Z_CTR, Z_CTR + 2, "Stainless_Steel", T, fillet=1)
# grate: slats along the length (rear drain zone) + 3 dividers (as in plan)
for i in range(9):
    dd = TD0 + 8 + i * 13
    box(f"Trough_Grate_Slat_{i+1}", TX0 + 5, TX1 - 5, dd, dd + 7, Z_CTR - 12, Z_CTR - 2, "Stainless_Steel", T)
for i in range(1, 4):
    xd = TX0 + i * (TX1 - TX0) / 4
    box(f"Trough_Divider_{i}", xd - 2, xd + 2, TD0 + 3, TD1 - 3, Z_CTR - 160, Z_CTR - 2, "Stainless_Steel", T)
box("Trough_Front_Rinse_Rail", TX0 + 50, TX1 - 50, TD1 - 60, TD1 - 15, Z_CTR - 25, Z_CTR - 5, "Stainless_Steel", T)
box("Trough_Rubber_Bar_Mat", TX0 + 40, TX1 - 40, D_CLAD + 18, D_CLAD + 58, Z_CTR, Z_CTR + 6, "Rubber_Bar_Mat", T, fillet=2)
# ice inside trough (a few cubes)
for i in range(12):
    ix = TX0 + 40 + (i * 97) % (TX1 - TX0 - 80)
    idd = TD0 + 30 + (i * 53) % (TD1 - TD0 - 60)
    box(f"Trough_Ice_{i+1}", ix, ix + 28, idd, idd + 28, Z_CTR - 70, Z_CTR - 42, "Glass_Clear", T, fillet=4)
# bar tap / gooseneck faucet behind trough
cyl("Faucet_Base", (X_MID0 + L_MID / 2, D_CLAD + 38, Z_CTR + 6), "z", 20, 25, "Stainless_Steel", T)
cyl("Faucet_Riser", (X_MID0 + L_MID / 2, D_CLAD + 38, Z_CTR + 26), "z", 260, 12, "Stainless_Steel", T)
cyl("Faucet_Spout", (X_MID0 + L_MID / 2, D_CLAD + 38, Z_CTR + 280), "d", 170, 10, "Stainless_Steel", T)
cyl("Faucet_Nozzle", (X_MID0 + L_MID / 2, D_CLAD + 205, Z_CTR + 280), "z", -45, 10, "Stainless_Steel", T)
box("Faucet_Lever", X_MID0 + L_MID / 2 + 12, X_MID0 + L_MID / 2 + 80, D_CLAD + 33, D_CLAD + 43,
    Z_CTR + 200, Z_CTR + 210, "Stainless_Steel", T, fillet=2)

# ----------------------------------------------------------------------------------------------
# 5. Return platform 650 wide: wine & beer coolers under, louvres / jali for releasing heat
# ----------------------------------------------------------------------------------------------
R = "05_Return_Wine_Beer_Cooler"
RX_FACE = RET_W                      # bartender-side face
box("Return_Plinth", 40, RET_W - 50, D_CTR, D_RET_END, 0, PLINTH, "Black_Matte", R)
box("Return_Plinth_LED", 40, RET_W - 50, D_CTR + 20, D_RET_END - 20, PLINTH - 6, PLINTH - 2, "LED_Warm_3000K", R)
box("Return_Carcass", 18, RET_W - 25, D_CTR, D_RET_END, PLINTH, Z_CTR - TOP_T, "Cooler_Interior", R)
box("Return_Top", 0, RET_W + 20, D_CTR + 20, D_RET_END, Z_CTR - TOP_T, Z_CTR, STONE, R, fillet=2)
box("Return_Top_Edge_Apron", RET_W, RET_W + 20, D_CTR + 20, D_RET_END, Z_CTR - 40, Z_CTR - TOP_T, STONE, R, fillet=1)
# left end panel with louvres / jali (elevation note "LOUVERS OR JALI FOR RELEASING HEAT OF COOLERS")
box("Return_End_Panel_Frame_Top", 0, 18, D_CTR, D_RET_END, Z_CTR - TOP_T - 80, Z_CTR - TOP_T, VEN, R)
box("Return_End_Panel_Frame_Bot", 0, 18, D_CTR, D_RET_END, 0, PLINTH + 60, VEN, R)
box("Return_End_Panel_Frame_Rear", 0, 18, D_CTR, D_CTR + 80, PLINTH + 60, Z_CTR - TOP_T - 80, VEN, R)
box("Return_End_Panel_Frame_Front", 0, 18, D_RET_END - 80, D_RET_END, PLINTH + 60, Z_CTR - TOP_T - 80, VEN, R)
zl = PLINTH + 70
i = 0
while zl + 22 < Z_CTR - TOP_T - 85:
    i += 1
    box(f"Return_Jali_Louvre_{i:02d}", -6, 16, D_CTR + 80, D_RET_END - 80, zl, zl + 22, VEN, R, fillet=2)
    zl += 34
# two coolers (550 each, plan dims) on the bartender-side face
bays = [(D_CTR + 5, D_CTR + 550), (D_CTR + 555, D_RET_END - 5)]
for b, (da, db) in enumerate(bays, 1):
    nm = "WineCooler" if b == 1 else "BeerCooler"
    box(f"{nm}_Frame_Top", RX_FACE - 25, RX_FACE, da, db, Z_CTR - TOP_T - 55, Z_CTR - TOP_T - 5, "Stainless_Steel", R)
    box(f"{nm}_Frame_Near", RX_FACE - 25, RX_FACE, da, da + 35, PLINTH + 80, Z_CTR - TOP_T - 55, "Stainless_Steel", R)
    box(f"{nm}_Frame_Far", RX_FACE - 25, RX_FACE, db - 35, db, PLINTH + 80, Z_CTR - TOP_T - 55, "Stainless_Steel", R)
    box(f"{nm}_Glass_Door", RX_FACE - 14, RX_FACE - 8, da + 35, db - 35, PLINTH + 80, Z_CTR - TOP_T - 55,
        "Glass_Cooler_Door_Tinted", R)
    box(f"{nm}_Handle", RX_FACE, RX_FACE + 25, db - 70, db - 55, PLINTH + 200, Z_CTR - TOP_T - 120, "Stainless_Steel", R, fillet=3)
    box(f"{nm}_LED", RX_FACE - 40, RX_FACE - 30, da + 40, db - 40, Z_CTR - TOP_T - 70, Z_CTR - TOP_T - 62, "LED_Warm_3000K", R)
    box(f"{nm}_Louvre_Back", RX_FACE - 30, RX_FACE - 25, da, db, PLINTH, PLINTH + 80, "Black_Matte", R)
    for j in range(6):
        zz = PLINTH + 6 + j * 12
        box(f"{nm}_Louvre_Slat_{j+1}", RX_FACE - 25, RX_FACE - 2, da + 5, db - 5, zz, zz + 6, "Stainless_Steel", R)
    if b == 1:   # wine racks, bottles lying
        for k, zr in enumerate([PLINTH + 130, PLINTH + 260, PLINTH + 390, PLINTH + 520]):
            box(f"WineCooler_Rack_{k+1}", 40, RX_FACE - 45, da + 40, db - 40, zr, zr + 12, "Brass_Brushed", R)
            for m in range(5):
                dm = da + 85 + m * 95
                cyl(f"WineCooler_Bottle_{k+1}_{m+1}", (60, dm, zr + 50), "x", 230, 37,
                    "Bottle_Glass_Green" if (m + k) % 2 else "Bottle_Glass_Amber", R, sides=16)
                cyl(f"WineCooler_Bottle_{k+1}_{m+1}_Neck", (290, dm, zr + 50), "x", 110, 14,
                    "Bottle_Glass_Green" if (m + k) % 2 else "Bottle_Glass_Amber", R, r1=12, sides=12)
                cyl(f"WineCooler_Bottle_{k+1}_{m+1}_Foil", (400, dm, zr + 50), "x", 40, 15, "Bottle_Cap_Foil", R, sides=12)
    else:        # beer cooler, standing bottles
        for k, zr in enumerate([PLINTH + 240, PLINTH + 470]):
            box(f"BeerCooler_Shelf_{k+1}", 40, RX_FACE - 45, da + 40, db - 40, zr, zr + 6, "Stainless_Steel", R)
        for k, zr in enumerate([PLINTH + 22, PLINTH + 246, PLINTH + 476]):
            for m in range(4):
                for q in range(2):
                    bx_, bd_ = 200 + q * 180, da + 110 + m * 105
                    cyl(f"BeerCooler_Bottle_{k}_{m}_{q}", (bx_, bd_, zr), "z", 150, 30, "Bottle_Glass_Amber", R, sides=14)
                    cyl(f"BeerCooler_Bottle_{k}_{m}_{q}_Neck", (bx_, bd_, zr + 150), "z", 60, 28, "Bottle_Glass_Amber", R, r1=12, sides=12)

# ----------------------------------------------------------------------------------------------
# 6. Bar table: 1850 x 450 (225 work top + 150 body + 75 overhang), fluted veneer front, brass foot rail
# ----------------------------------------------------------------------------------------------
BT = "06_Bar_Table"
box("Bar_Plinth", 40, X_BAR_END - 40, D_RET_END, D_BAR_FACE - 60, 0, PLINTH, "Black_Matte", BT)
box("Bar_Plinth_LED", 40, X_BAR_END - 40, D_BAR_FACE - 62, D_BAR_FACE - 58, PLINTH - 6, PLINTH - 2, "LED_Warm_3000K", BT)
box("Bar_Body_Core", 0, X_BAR_END - 18, D_RET_END, D_BAR_FACE - 30, PLINTH, Z_BAR - 30, CARC, BT)
box("Bar_Body_Back_Veneer", RET_W, X_BAR_END - 18, D_RET_END - 18, D_RET_END, Z_CTR, Z_BAR - 30, VEN, BT)
box("Bar_Front_Backing", 0, X_BAR_END, D_BAR_FACE - 30, D_BAR_FACE - 15, PLINTH, Z_BAR - 30, VEN, BT)
# fluted (vertical slat) veneer front
fl_w, fl_g = 30, 10
nfl = int((X_BAR_END - 10) // (fl_w + fl_g))
off = (X_BAR_END - nfl * (fl_w + fl_g) + fl_g) / 2
for i in range(nfl):
    fx = off + i * (fl_w + fl_g)
    box(f"Bar_Front_Flute_{i+1:02d}", fx, fx + fl_w, D_BAR_FACE - 15, D_BAR_FACE, PLINTH + 10, Z_BAR - 40, VEN, BT, fillet=4)
# end panels
box("Bar_End_Panel_Right", X_BAR_END - 18, X_BAR_END, D_BAR_BACK, D_BAR_FACE, 0, Z_BAR - 30, VEN, BT, fillet=1)
box("Bar_End_Panel_Left", -18, 0, D_RET_END, D_BAR_FACE, 0, Z_BAR - 30, VEN, BT, fillet=1)
# raised stone bar top (patron ledge) with 75 overhang
box("Bar_Top_Raised", -18, X_BAR_END, D_RET_END - 18, D_BAR_FRONT, Z_BAR - 30, Z_BAR, STONE, BT, fillet=3)
box("Bar_Top_LED_Under_Overhang", 0, X_BAR_END - 20, D_BAR_FRONT - 55, D_BAR_FRONT - 45, Z_BAR - 33, Z_BAR - 30,
    "LED_Warm_3000K", BT)
# bartender work top (225 deep) with open shelving below
box("Bar_Worktop", RET_W + 20, X_BAR_END - 18, D_BAR_BACK, D_RET_END - 18, Z_CTR - TOP_T, Z_CTR, STONE, BT, fillet=2)
box("Bar_Worktop_Edge_Apron", RET_W + 20, X_BAR_END - 18, D_BAR_BACK, D_BAR_BACK + 20, Z_CTR - 40, Z_CTR - TOP_T, STONE, BT)
box("Bar_Under_Bottom", RET_W, X_BAR_END - 18, D_BAR_BACK + 20, D_RET_END, PLINTH, PLINTH + 18, CARC, BT)
box("Bar_Under_Kick", RET_W, X_BAR_END - 18, D_BAR_BACK + 20, D_BAR_BACK + 70, 0, PLINTH, "Black_Matte", BT)
for k, xu in enumerate([RET_W + 20, RET_W + 20 + 610, RET_W + 20 + 1220]):
    box(f"Bar_Under_Upright_{k+1}", xu, xu + 18, D_BAR_BACK + 20, D_RET_END, PLINTH + 18, Z_CTR - TOP_T, CARC, BT)
box("Bar_Under_Shelf", RET_W + 20, X_BAR_END - 18, D_BAR_BACK + 20, D_RET_END - 10, 400, 418, CARC, BT)
# stainless speed rail on bartender side
box("Bar_Speed_Rail_Tray", RET_W + 120, RET_W + 1220, D_BAR_BACK - 90, D_BAR_BACK, 520, 525, "Stainless_Steel", BT)
box("Bar_Speed_Rail_Front", RET_W + 120, RET_W + 1220, D_BAR_BACK - 92, D_BAR_BACK - 88, 520, 600, "Stainless_Steel", BT)
for e, xe in enumerate([RET_W + 120, RET_W + 1216]):
    box(f"Bar_Speed_Rail_End_{e+1}", xe, xe + 4, D_BAR_BACK - 90, D_BAR_BACK, 520, 600, "Stainless_Steel", BT)
for i in range(10):
    sxp = RET_W + 175 + i * 105
    matb = ["Bottle_Glass_Clear", "Bottle_Glass_Amber", "Bottle_Glass_Green"][i % 3]
    cyl(f"Speed_Rail_Bottle_{i+1}", (sxp, D_BAR_BACK - 45, 525), "z", 200, 38, matb, BT, sides=16)
    cyl(f"Speed_Rail_Bottle_{i+1}_Shoulder", (sxp, D_BAR_BACK - 45, 725), "z", 35, 38, matb, BT, r1=14, sides=16)
    cyl(f"Speed_Rail_Bottle_{i+1}_Neck", (sxp, D_BAR_BACK - 45, 760), "z", 55, 14, matb, BT, sides=12)
    cyl(f"Speed_Rail_Bottle_{i+1}_Pourer", (sxp, D_BAR_BACK - 45, 815), "z", 35, 6, "Stainless_Steel", BT, r1=3, sides=8)
# brass foot rail with brackets
cyl("Bar_Foot_Rail", (120, D_BAR_FACE + 70, 230), "x", X_BAR_END - 240, 25, "Brass_Brushed", BT, sides=24)
for e, xe in enumerate([120, X_BAR_END - 120]):
    cyl(f"Bar_Foot_Rail_EndCap_{e+1}", (xe - (6 if e == 0 else 0), D_BAR_FACE + 70, 230), "x", 6, 27, "Brass_Brushed", BT)
for k, xbk in enumerate([300, X_BAR_END / 2, X_BAR_END - 300]):
    cyl(f"Bar_Foot_Rail_Bracket_{k+1}", (xbk, D_BAR_FACE, 230), "d", 70, 12, "Brass_Brushed", BT, sides=12)
    cyl(f"Bar_Foot_Rail_Rose_{k+1}", (xbk, D_BAR_FACE, 230), "d", 8, 35, "Brass_Brushed", BT, sides=20)

# ----------------------------------------------------------------------------------------------
# 7. Props: bottles on glass shelves, glassware, bar stools, pendant lights
# ----------------------------------------------------------------------------------------------
P = "07_Props_Bottles_Glassware"


def bottle(name, x, d, z, kind, layer=P):
    if kind == "wine":
        m = "Bottle_Glass_Green"
        cyl(name + "_Body", (x, d, z), "z", 200, 37, m, layer, sides=18)
        cyl(name + "_Shoulder", (x, d, z + 200), "z", 40, 37, m, layer, r1=14, sides=18)
        cyl(name + "_Neck", (x, d, z + 240), "z", 45, 14, m, layer, sides=12)
        cyl(name + "_Foil", (x, d, z + 270), "z", 25, 15, "Bottle_Cap_Foil", layer, sides=12)
    elif kind == "whisky":
        m = "Bottle_Glass_Amber"
        box(name + "_Body", x - 42, x + 42, d - 32, d + 32, z, z + 190, m, layer, fillet=10)
        cyl(name + "_Neck", (x, d, z + 190), "z", 45, 16, m, layer, sides=12)
        cyl(name + "_Cap", (x, d, z + 235), "z", 30, 19, "Black_Matte", layer, sides=16)
    else:  # gin / clear spirit
        m = "Bottle_Glass_Clear"
        cyl(name + "_Body", (x, d, z), "z", 180, 42, m, layer, sides=18)
        cyl(name + "_Shoulder", (x, d, z + 180), "z", 30, 42, m, layer, r1=15, sides=18)
        cyl(name + "_Neck", (x, d, z + 210), "z", 35, 15, m, layer, sides=12)
        cyl(name + "_Cap", (x, d, z + 245), "z", 25, 17, "Brass_Brushed", layer, sides=12)


def tumbler(name, x, d, z, layer=P):
    cyl(name + "_Base", (x, d, z), "z", 12, 38, "Glass_Clear", layer, sides=20)
    cyl(name + "_Wall", (x, d, z + 12), "z", 80, 38, "Glass_Clear", layer, r1=41, sides=20)


def wine_glass(name, x, d, z, layer=P):
    cyl(name + "_Foot", (x, d, z), "z", 3, 38, "Glass_Clear", layer, sides=20)
    cyl(name + "_Stem", (x, d, z + 3), "z", 100, 4, "Glass_Clear", layer, sides=10)
    cyl(name + "_BowlLow", (x, d, z + 103), "z", 40, 12, "Glass_Clear", layer, r1=42, sides=20)
    cyl(name + "_BowlTop", (x, d, z + 143), "z", 60, 42, "Glass_Clear", layer, r1=33, sides=20)


kinds = ["wine", "whisky", "gin"]
for n, (sx, sz) in enumerate(small_shelves):
    if sz > Z_CLAD_TOP - 300:   # top row has only 185 clear below the bulkhead -> glassware
        tumbler(f"Shelf_Tumbler_{n+1:02d}a", sx + 40, D_CLAD + 75, sz + 10)
        tumbler(f"Shelf_Tumbler_{n+1:02d}b", sx + 110, D_CLAD + 75, sz + 10)
    else:
        bottle(f"Shelf_Bottle_{n+1:02d}", sx + 75, D_CLAD + 75, sz + 10, kinds[n % 3])
# long shelf: tall bottles only where no small shelf sits 183 mm above (row A slots 1,3,5)
free_x = [X_MID0 + 230, X_MID0 + 383, X_MID0 + 536, X_MID0 + 846, X_MID0 + 999, X_MID0 + 1152]
for i, bx_ in enumerate(free_x):
    bottle(f"LongShelf_Bottle_{i+1:02d}", bx_, D_CLAD + 120, Z_SPLASH + 12, kinds[(i + 1) % 3])
for s_ in (0, 2, 4):
    tumbler(f"LongShelf_Tumbler_{s_}a", X_MID0 + SLOT[s_] + 40, D_CLAD + 120, Z_SPLASH + 12)
    tumbler(f"LongShelf_Tumbler_{s_}b", X_MID0 + SLOT[s_] + 110, D_CLAD + 120, Z_SPLASH + 12)


for i in range(6):
    tumbler(f"BackCtr_Tumbler_{i+1}", X_MID1 + 200 + (i % 3) * 95, D_CLAD + 150 + (i // 3) * 95, Z_CTR)
for i in range(4):
    wine_glass(f"BackCtr_WineGlass_{i+1}", X_MID1 + 650 + i * 110, D_CLAD + 200, Z_CTR)
# ice bucket on the bar
PB = "07_Props_Bar_Top"
cyl("Ice_Bucket", (1900, D_BAR_FRONT - 110, Z_BAR), "z", 200, 95, "Stainless_Steel", PB, r1=110, sides=28)
bottle("Ice_Bucket_Bottle", 1900, D_BAR_FRONT - 110, Z_BAR + 60, "wine", PB)
for i in range(3):
    wine_glass(f"Bar_WineGlass_{i+1}", 500 + i * 600, D_BAR_FRONT - 100, Z_BAR, PB)

S = "08_Bar_Stools"
for k, sx in enumerate([600, 1250, 1900], 1):
    sd = D_BAR_FRONT + 380
    cyl(f"Stool_{k}_Base", (sx, sd, 0), "z", 12, 220, "Brass_Brushed", S, r1=200, sides=32)
    cyl(f"Stool_{k}_Column", (sx, sd, 12), "z", 610, 28, "Brass_Brushed", S, sides=20)
    torus(f"Stool_{k}_Foot_Ring", (sx, sd, 300), 200, 10, "Brass_Brushed", S)
    for a in range(4):
        ang = a * math.pi / 2 + math.pi / 4
        ex, ed = sx + 190 * math.cos(ang), sd + 190 * math.sin(ang)
        prims.append(dict(t="seg", name=f"Stool_{k}_Ring_Spoke_{a+1}", p0=(sx, sd, 300), p1=(ex, ed, 300),
                          r=7, mat="Brass_Brushed", layer=S))
    cyl(f"Stool_{k}_Seat_Plate", (sx, sd, 622), "z", 15, 160, "Brass_Brushed", S, sides=24)
    cyl(f"Stool_{k}_Seat_Cushion", (sx, sd, 637), "z", 75, 195, "Leather_Seat_Tan", S, r1=185, sides=32)
    # low backrest
    for a in range(5):
        ang = math.pi / 2 + (a - 2) * 0.35
        px, pd = sx + 170 * math.cos(ang), sd + 170 * math.sin(ang)
        cyl(f"Stool_{k}_Back_Post_{a+1}", (px, pd, 712), "z", 160, 7, "Brass_Brushed", S, sides=10)
    cyl(f"Stool_{k}_Backrest_Pad", (sx, sd, 840), "z", 70, 185, "Leather_Seat_Tan", S, sides=32)

LT = "09_Lighting_Pendants"
for k, px in enumerate([600, 1250, 1900], 1):
    pd = (D_BAR_BACK + D_BAR_FRONT) / 2
    cyl(f"Pendant_{k}_Canopy", (px, pd, Z_TOP - 25), "z", 25, 60, "Brass_Brushed", LT)
    cyl(f"Pendant_{k}_Cord", (px, pd, 1820), "z", Z_TOP - 25 - 1820, 3, "Black_Matte", LT, sides=8)
    cyl(f"Pendant_{k}_Shade", (px, pd, 1600), "z", 220, 150, "Brass_Brushed", LT, r1=35, sides=32)
    cyl(f"Pendant_{k}_Bulb", (px, pd, 1620), "z", 60, 45, "LED_Warm_3000K", LT, r1=30, sides=20)


# ==============================================================================================
# Writers
# ==============================================================================================
def to_max(x, d, z):
    return (x, -d, z)


def fmt(v):
    return f"{v:.2f}".rstrip("0").rstrip(".") if isinstance(v, float) else str(v)


def p3(t):
    return "[" + ",".join(fmt(float(v)) for v in t) + "]"


def write_maxscript(path):
    L = []
    w = L.append
    w("-- =====================================================================================")
    w("-- BAR UNIT DETAIL (WD-06) - Anahata Villas, Chavda Farm House - Nirja Architects")
    w("-- Auto-generated 3ds Max MAXScript. Units: millimetres. Run: Scripting > Run Script...")
    w("-- Builds the complete bar: back counter, wall cladding, glass shelves, MS grill bulkhead,")
    w("-- wine/beer cooler return, bar table, foot rail, stools, pendants, props, materials, cameras.")
    w("-- =====================================================================================")
    w("(")
    w("units.SystemType = #millimeters")
    w("units.DisplayType = #metric")
    w("units.MetricType = #millimeters")
    w("")
    w("fn mkMat nm col rough metal transp emit proc = (")
    w("  local m")
    w("  local hasPhys = false")
    w("  try (hasPhys = (classof PhysicalMaterial == MaterialClass)) catch ()")
    w("  if hasPhys then (")
    w("    m = PhysicalMaterial name:nm")
    w("    m.base_color = col")
    w("    m.roughness = rough")
    w("    m.metalness = metal")
    w("    if transp > 0 do try (m.transparency = transp; m.trans_color = col; m.trans_ior = 1.52) catch ()")
    w("    if emit > 0 do try (m.emission = 1.0; m.emit_color = col; m.emit_luminance = 1500.0) catch ()")
    w("    try (")
    w("      if proc == \"marble\" do (")
    w("        local mb = Marble size:900 vein_width:0.035")
    w("        mb.color1 = (color 18 52 33); mb.color2 = (color 120 160 125)")
    w("        local nz = Noise size:60 type:1")
    w("        nz.color1 = (color 14 40 26); nz.color2 = (color 34 78 50)")
    w("        local mix = Mix(); mix.map1 = nz; mix.map2 = mb; mix.mixAmount = 35")
    w("        m.base_color_map = mix")
    w("      )")
    w("      if proc == \"wood\" do (")
    w("        local wd = Wood thickness:6.0 radial_noise:0.6 axial_noise:0.8")
    w("        wd.color1 = (col * 0.75); wd.color2 = col")
    w("        m.base_color_map = wd")
    w("      )")
    w("    ) catch ()")
    w("  ) else (")
    w("    m = StandardMaterial name:nm diffuse:col")
    w("    m.specularLevel = (1.0 - rough) * 90; m.glossiness = (1.0 - rough) * 70")
    w("    if transp > 0 do m.opacity = (1.0 - transp) * 100")
    w("    if emit > 0 do (m.useSelfIllumColor = true; m.selfIllumColor = col)")
    w("  )")
    w("  m")
    w(")")
    w("-- materials (open the Slate Material Editor to tweak; swap Veneer_Mural_Painting base colour for the mural bitmap)")
    for nm, (rgb, rough, metal, transp, emit) in MATS.items():
        c = "(color " + " ".join(str(int(round(v * 255))) for v in rgb) + ")"
        proc = MAT_PROC.get(nm, "")
        w(f"local m_{nm} = mkMat \"{nm}\" {c} {rough} {metal} {transp} {emit} \"{proc}\"")
    w("")
    w("fn getLayer nm = (")
    w("  local l = LayerManager.getLayerFromName nm")
    w("  if l == undefined do l = LayerManager.newLayerFromName nm")
    w("  l")
    w(")")
    w("fn fin o mat lay mapsz = (")
    w("  o.material = mat")
    w("  (getLayer lay).addNode o")
    w("  if mapsz > 0 do addModifier o (Uvwmap maptype:4 length:mapsz width:mapsz height:mapsz)")
    w("  o")
    w(")")
    w("fn mkBox nm cx cy z0 lx wy hz fil mat lay mapsz = (")
    w("  local o")
    w("  if fil > 0 then o = ChamferBox name:nm width:lx length:wy height:hz fillet:fil Fillet_Segments:2 smooth:true pos:[cx,cy,z0]")
    w("  else o = Box name:nm width:lx length:wy height:hz pos:[cx,cy,z0]")
    w("  fin o mat lay mapsz")
    w(")")
    w("fn mkCyl nm p dirv h r0 r1 sd mat lay = (")
    w("  local o")
    w("  if r0 == r1 then o = Cylinder name:nm radius:r0 height:h sides:sd heightsegs:1 smooth:true pos:p")
    w("  else o = Cone name:nm radius1:r0 radius2:r1 height:h sides:sd heightsegs:1 smooth:true pos:p")
    w("  o.dir = dirv")
    w("  fin o mat lay 0")
    w(")")
    w("fn mkTorus nm p R1 r2 mat lay = (")
    w("  local o = Torus name:nm radius1:R1 radius2:r2 segs:48 sides:12 smooth:2 pos:p")
    w("  fin o mat lay 0")
    w(")")
    w("")
    w("disableSceneRedraw()")
    w("with undo off (")
    for p in prims:
        m = f"m_{p['mat']}"
        lay = p["layer"]
        mapsz = 600 if MAT_PROC.get(p["mat"]) or p["mat"] in ("Veneer_Mural_Painting", "Floor_Marble_Beige") else 0
        if p["t"] == "box":
            cx = (p["x0"] + p["x1"]) / 2
            cd = (p["d0"] + p["d1"]) / 2
            lx, wy, hz = p["x1"] - p["x0"], p["d1"] - p["d0"], p["z1"] - p["z0"]
            fil = min(p["fillet"], 0.45 * min(lx, wy, hz))
            w(f"mkBox \"{p['name']}\" {fmt(float(cx))} {fmt(float(-cd))} {fmt(float(p['z0']))} "
              f"{fmt(float(lx))} {fmt(float(wy))} {fmt(float(hz))} {fmt(float(fil))} {m} \"{lay}\" {mapsz}")
        elif p["t"] == "cyl":
            x, d, z = p["base"]
            h = p["length"]
            ax = {"x": "[1,0,0]", "d": "[0,-1,0]", "z": "[0,0,1]"}[p["axis"]]
            if h < 0:
                ax = {"x": "[-1,0,0]", "d": "[0,1,0]", "z": "[0,0,-1]"}[p["axis"]]
                h = -h
            w(f"mkCyl \"{p['name']}\" {p3(to_max(x, d, z))} {ax} {fmt(float(h))} {fmt(float(p['r0']))} "
              f"{fmt(float(p['r1']))} {p['sides']} {m} \"{lay}\"")
        elif p["t"] == "seg":
            p0, p1 = p["p0"], p["p1"]
            v = [p1[i] - p0[i] for i in range(3)]
            ln = math.sqrt(sum(c * c for c in v))
            dv = (v[0] / ln, -v[1] / ln, v[2] / ln)
            w(f"mkCyl \"{p['name']}\" {p3(to_max(*p0))} {p3(dv)} {fmt(float(ln))} {p['r']} {p['r']} 10 {m} \"{lay}\"")
        elif p["t"] == "torus":
            w(f"mkTorus \"{p['name']}\" {p3(to_max(*p['c']))} {p['R']} {p['r']} {m} \"{lay}\"")
    w(")")
    w("")
    w("-- ceiling is kept on its own layer and hidden so the viewport can orbit from above")
    w("(getLayer \"01_Architecture_Ceiling\").isHidden = true")
    w("")
    w("-- Cameras")
    w("local tPersp = Targetobject name:\"Cam_Persp_Target\" pos:[1700,-1200,1000]")
    w("local cPersp = Targetcamera name:\"Cam_Perspective\" fov:55 pos:[4300,-4600,1650] target:tPersp")
    w("local tFront = Targetobject name:\"Cam_Front_Target\" pos:[1940,0,1370]")
    w("local cFront = Targetcamera name:\"Cam_Elevation_Back_Wall\" fov:45 pos:[1940,-5200,1370] target:tFront")
    w("local tBar = Targetobject name:\"Cam_Bartender_Target\" pos:[1250,-1700,900]")
    w("local cBar = Targetcamera name:\"Cam_Bartender_View\" fov:60 pos:[2300,-700,1550] target:tBar")
    w("for o in #(tPersp,cPersp,tFront,cFront,tBar,cBar) do (getLayer \"10_Cameras\").addNode o")
    w("")
    w("-- soft daylight + warm fill (renderer independent)")
    w("try (")
    w("  local sun = Omnilight name:\"Key_Light\" pos:[2500,-3500,2600] multiplier:0.9 rgb:(color 255 244 230) castShadows:true")
    w("  local fill = Omnilight name:\"Fill_Light\" pos:[-800,-2500,1800] multiplier:0.35 rgb:(color 230 236 255)")
    w("  for o in #(sun,fill) do (getLayer \"09_Lighting_Pendants\").addNode o")
    w(") catch ()")
    w("")
    w("enableSceneRedraw()")
    w("viewport.setLayout #layout_1")
    w("viewport.setType #view_persp_user")
    w("max zoomext sel all")
    w("redrawViews()")
    w(f"format \"Bar unit built: % objects\\n\" {len(prims)}")
    w(")")
    with open(path, "w", newline="\r\n") as f:
        f.write("\n".join(L) + "\n")


# ---------------------------- mesh generation (OBJ + preview) --------------------------------
def basis(axis_vec):
    ax = axis_vec
    ref = (0, 0, 1) if abs(ax[2]) < 0.9 else (1, 0, 0)
    u = cross(ax, ref)
    u = norm(u)
    v = cross(ax, u)
    return u, v


def cross(a, b):
    return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])


def norm(a):
    l = math.sqrt(sum(c * c for c in a))
    return tuple(c / l for c in a)


def mesh_of(p):
    """Return (verts in model x,d,z space, quads/tris as index lists)."""
    if p["t"] == "box":
        x0, x1, d0, d1, z0, z1 = p["x0"], p["x1"], p["d0"], p["d1"], p["z0"], p["z1"]
        V = [(x0, d0, z0), (x1, d0, z0), (x1, d1, z0), (x0, d1, z0),
             (x0, d0, z1), (x1, d0, z1), (x1, d1, z1), (x0, d1, z1)]
        F = [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]]
        return V, F
    if p["t"] in ("cyl", "seg"):
        if p["t"] == "cyl":
            b = p["base"]
            h = p["length"]
            a = {"x": (1, 0, 0), "d": (0, 1, 0), "z": (0, 0, 1)}[p["axis"]]
            r0, r1, sides = p["r0"], p["r1"], p["sides"]
        else:
            b = p["p0"]
            v = tuple(p["p1"][i] - p["p0"][i] for i in range(3))
            h = math.sqrt(sum(c * c for c in v))
            a = norm(v)
            r0 = r1 = p["r"]
            sides = 10
        u, v = basis(a)
        V = []
        for ring, r in ((0, r0), (h, r1)):
            for i in range(sides):
                t = 2 * math.pi * i / sides
                V.append(tuple(b[k] + a[k] * ring + r * (math.cos(t) * u[k] + math.sin(t) * v[k]) for k in range(3)))
        c0 = len(V); V.append(tuple(b[k] for k in range(3)))
        c1 = len(V); V.append(tuple(b[k] + a[k] * h for k in range(3)))
        F = []
        for i in range(sides):
            j = (i + 1) % sides
            F.append([i, j, sides + j, sides + i])
            F.append([c0, j, i])
            F.append([c1, sides + i, sides + j])
        if h < 0:
            F = [f[::-1] for f in F]
        return V, F
    if p["t"] == "torus":
        cx, cd, cz = p["c"]
        R, r = p["R"], p["r"]
        S1, S2 = 48, 10
        V, F = [], []
        for i in range(S1):
            t = 2 * math.pi * i / S1
            for j in range(S2):
                s = 2 * math.pi * j / S2
                V.append((cx + (R + r * math.cos(s)) * math.cos(t), cd + (R + r * math.cos(s)) * math.sin(t), cz + r * math.sin(s)))
        for i in range(S1):
            for j in range(S2):
                a = i * S2 + j
                b_ = ((i + 1) % S1) * S2 + j
                c = ((i + 1) % S1) * S2 + (j + 1) % S2
                d = i * S2 + (j + 1) % S2
                F.append([a, b_, c, d])
        return V, F
    raise ValueError(p["t"])


def write_obj(obj_path, mtl_path):
    with open(mtl_path, "w") as f:
        f.write("# Bar unit materials\n")
        for nm, (rgb, rough, metal, transp, emit) in MATS.items():
            f.write(f"\nnewmtl {nm}\nKd {rgb[0]:.3f} {rgb[1]:.3f} {rgb[2]:.3f}\n")
            ks = 0.9 * metal + 0.5 * (1 - rough)
            f.write(f"Ks {ks:.3f} {ks:.3f} {ks:.3f}\nNs {int((1 - rough) * 900 + 10)}\n")
            f.write(f"d {1 - transp:.2f}\n")
            if emit:
                f.write(f"Ke {rgb[0]:.3f} {rgb[1]:.3f} {rgb[2]:.3f}\n")
            f.write("illum 2\n")
    off = 1
    with open(obj_path, "w") as f:
        f.write("# Bar unit WD-06 - units: millimetres, Y-up (x, height, depth-from-wall)\n")
        f.write(f"mtllib {os.path.basename(mtl_path)}\n")
        for p in prims:
            V, F = mesh_of(p)
            f.write(f"o {p['name']}\ng {p['layer']}\nusemtl {p['mat']}\n")
            for (x, d, z) in V:
                # Y-up, room towards +Z  (3ds Max importer "flip ZY" restores Z-up)
                f.write(f"v {x:.2f} {z:.2f} {d:.2f}\n")
            for face in F:
                f.write("f " + " ".join(str(off + i) for i in face) + "\n")
            off += len(V)


if __name__ == "__main__":
    write_maxscript(os.path.join(HERE, "bar_unit.ms"))
    write_obj(os.path.join(HERE, "bar_unit.obj"), os.path.join(HERE, "bar_unit.mtl"))
    print(f"primitives: {len(prims)}")
