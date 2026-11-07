-- =====================================================================================
-- BAR UNIT DETAIL (WD-06) - Anahata Villas, Chavda Farm House - Nirja Architects
-- Auto-generated 3ds Max MAXScript. Units: millimetres. Run: Scripting > Run Script...
-- Builds the complete bar: back counter, wall cladding, glass shelves, MS grill bulkhead,
-- wine/beer cooler return, bar table, foot rail, stools, pendants, props, materials, cameras.
-- =====================================================================================
(
units.SystemType = #millimeters
units.DisplayType = #metric
units.MetricType = #millimeters

fn mkMat nm col rough metal transp emit proc = (
  local m
  local hasPhys = false
  try (hasPhys = (classof PhysicalMaterial == MaterialClass)) catch ()
  if hasPhys then (
    m = PhysicalMaterial name:nm
    m.base_color = col
    m.roughness = rough
    m.metalness = metal
    if transp > 0 do try (m.transparency = transp; m.trans_color = col; m.trans_ior = 1.52) catch ()
    if emit > 0 do try (m.emission = 1.0; m.emit_color = col; m.emit_luminance = 1500.0) catch ()
    try (
      if proc == "marble" do (
        local mb = Marble size:900 vein_width:0.035
        mb.color1 = (color 18 52 33); mb.color2 = (color 120 160 125)
        local nz = Noise size:60 type:1
        nz.color1 = (color 14 40 26); nz.color2 = (color 34 78 50)
        local mix = Mix(); mix.map1 = nz; mix.map2 = mb; mix.mixAmount = 35
        m.base_color_map = mix
      )
      if proc == "wood" do (
        local wd = Wood thickness:6.0 radial_noise:0.6 axial_noise:0.8
        wd.color1 = (col * 0.75); wd.color2 = col
        m.base_color_map = wd
      )
    ) catch ()
  ) else (
    m = StandardMaterial name:nm diffuse:col
    m.specularLevel = (1.0 - rough) * 90; m.glossiness = (1.0 - rough) * 70
    if transp > 0 do m.opacity = (1.0 - transp) * 100
    if emit > 0 do (m.useSelfIllumColor = true; m.selfIllumColor = col)
  )
  m
)
-- materials (open the Slate Material Editor to tweak; swap Veneer_Mural_Painting base colour for the mural bitmap)
local m_Stone_Kesariyaji_Green_Glossy = mkMat "Stone_Kesariyaji_Green_Glossy" (color 23 51 33) 0.06 0.0 0.0 0.0 "marble"
local m_Veneer_Wood = mkMat "Veneer_Wood" (color 120 74 41) 0.35 0.0 0.0 0.0 "wood"
local m_Veneer_Carcass_Interior = mkMat "Veneer_Carcass_Interior" (color 158 120 84) 0.5 0.0 0.0 0.0 "wood"
local m_Veneer_Mural_Painting = mkMat "Veneer_Mural_Painting" (color 199 168 128) 0.45 0.0 0.0 0.0 ""
local m_MS_Grill_Black_Powdercoat = mkMat "MS_Grill_Black_Powdercoat" (color 8 8 8) 0.45 0.6 0.0 0.0 ""
local m_Brass_Brushed = mkMat "Brass_Brushed" (color 204 158 82) 0.25 1.0 0.0 0.0 ""
local m_Stainless_Steel = mkMat "Stainless_Steel" (color 184 184 189) 0.22 1.0 0.0 0.0 ""
local m_Glass_Clear = mkMat "Glass_Clear" (color 217 242 235) 0.0 0.0 0.92 0.0 ""
local m_Glass_Cooler_Door_Tinted = mkMat "Glass_Cooler_Door_Tinted" (color 64 76 76) 0.0 0.0 0.8 0.0 ""
local m_Black_Matte = mkMat "Black_Matte" (color 5 5 5) 0.7 0.0 0.0 0.0 ""
local m_Cooler_Interior = mkMat "Cooler_Interior" (color 20 20 23) 0.4 0.0 0.0 0.0 ""
local m_LED_Warm_3000K = mkMat "LED_Warm_3000K" (color 255 204 140) 0.5 0.0 0.0 1.0 ""
local m_Plaster_Wall = mkMat "Plaster_Wall" (color 219 214 204) 0.8 0.0 0.0 0.0 ""
local m_Floor_Marble_Beige = mkMat "Floor_Marble_Beige" (color 204 194 176) 0.15 0.0 0.0 0.0 ""
local m_Ceiling_White = mkMat "Ceiling_White" (color 235 235 230) 0.85 0.0 0.0 0.0 ""
local m_Rubber_Bar_Mat = mkMat "Rubber_Bar_Mat" (color 10 10 10) 0.9 0.0 0.0 0.0 ""
local m_Leather_Seat_Tan = mkMat "Leather_Seat_Tan" (color 115 64 31) 0.55 0.0 0.0 0.0 ""
local m_Bottle_Glass_Green = mkMat "Bottle_Glass_Green" (color 26 64 26) 0.02 0.0 0.55 0.0 ""
local m_Bottle_Glass_Amber = mkMat "Bottle_Glass_Amber" (color 115 56 13) 0.02 0.0 0.55 0.0 ""
local m_Bottle_Glass_Clear = mkMat "Bottle_Glass_Clear" (color 204 217 217) 0.02 0.0 0.75 0.0 ""
local m_Bottle_Cap_Foil = mkMat "Bottle_Cap_Foil" (color 89 13 15) 0.3 0.8 0.0 0.0 ""

fn getLayer nm = (
  local l = LayerManager.getLayerFromName nm
  if l == undefined do l = LayerManager.newLayerFromName nm
  l
)
fn fin o mat lay mapsz = (
  o.material = mat
  (getLayer lay).addNode o
  if mapsz > 0 do addModifier o (Uvwmap maptype:4 length:mapsz width:mapsz height:mapsz)
  o
)
fn mkBox nm cx cy z0 lx wy hz fil mat lay mapsz = (
  local o
  if fil > 0 then o = ChamferBox name:nm width:lx length:wy height:hz fillet:fil Fillet_Segments:2 smooth:true pos:[cx,cy,z0]
  else o = Box name:nm width:lx length:wy height:hz pos:[cx,cy,z0]
  fin o mat lay mapsz
)
fn mkCyl nm p dirv h r0 r1 sd mat lay = (
  local o
  if r0 == r1 then o = Cylinder name:nm radius:r0 height:h sides:sd heightsegs:1 smooth:true pos:p
  else o = Cone name:nm radius1:r0 radius2:r1 height:h sides:sd heightsegs:1 smooth:true pos:p
  o.dir = dirv
  fin o mat lay 0
)
fn mkTorus nm p R1 r2 mat lay = (
  local o = Torus name:nm radius1:R1 radius2:r2 segs:48 sides:12 smooth:2 pos:p
  fin o mat lay 0
)

disableSceneRedraw()
with undo off (
mkBox "Back_Wall" 2400 115 0 6400 230 2735 0 m_Plaster_Wall "01_Architecture" 0
mkBox "Floor" 2400 -2100 -20 6400 4200 20 0 m_Floor_Marble_Beige "01_Architecture" 600
mkBox "Ceiling" 2400 -2100 2735 6400 4200 20 0 m_Ceiling_White "01_Architecture_Ceiling" 0
mkBox "Mural_Veneer_Panel" 4340 -9 0 920 18 2735 1.5 m_Veneer_Mural_Painting "01_Architecture" 600
mkBox "Mural_Reveal_Brass" 3885 -20 0 6 4 2735 0 m_Brass_Brushed "01_Architecture" 0
mkBox "Cladding_Substructure" 1940 -50 0 3880 100 2165 0 m_Plaster_Wall "02_Wall_Cladding" 0
mkBox "Stone_Cladding_Slab_1" 624.5 -110 770 1249 20 1395 1 m_Stone_Kesariyaji_Green_Glossy "02_Wall_Cladding" 600
mkBox "Stone_Cladding_Slab_2" 1940 -110 770 1378 20 1395 1 m_Stone_Kesariyaji_Green_Glossy "02_Wall_Cladding" 600
mkBox "Stone_Cladding_Slab_3" 3255.5 -110 770 1249 20 1395 1 m_Stone_Kesariyaji_Green_Glossy "02_Wall_Cladding" 600
mkBox "Stone_Cladding_End_L" -10 -60 770 20 120 1395 0 m_Stone_Kesariyaji_Green_Glossy "02_Wall_Cladding" 600
mkBox "Stone_Cladding_End_R" 3880.05 -60 770 0.1 120 1395 0 m_Stone_Kesariyaji_Green_Glossy "02_Wall_Cladding" 600
mkBox "Glass_Shelf_Long" 1940 -245 1270 1370 250 12 1 m_Glass_Clear "02_Wall_Cladding" 0
mkBox "Glass_Shelf_Long_LED_Channel" 1940 -132.5 1240 1370 25 30 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkBox "Glass_Shelf_Long_LED" 1940 -145 1245 1360 2 20 0 m_LED_Warm_3000K "02_Wall_Cladding" 0
mkBox "Glass_Shelf_Long_Bracket_1" 1320 -230 1262 20 220 8 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkBox "Glass_Shelf_Long_Bracket_2" 2560 -230 1262 20 220 8 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_01" 1325 -195 1815 150 150 10 1 m_Glass_Clear "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_01_Bracket" 1325 -122 1780 130 4 35 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_01_BracketArmL" 1268 -180 1809 6 120 6 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_01_BracketArmR" 1382 -180 1809 6 120 6 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkCyl "Glass_Bottle_Shelf_01_Stop_Rail" [1255,-260,1837] [1,0,0] 140 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkCyl "Glass_Bottle_Shelf_01_Stop_Post" [1258,-260,1825] [0,0,1] 12 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkCyl "Glass_Bottle_Shelf_01_Stop_Post" [1392,-260,1825] [0,0,1] 12 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkBox "Glass_Bottle_Shelf_02" 1941 -195 1815 150 150 10 1 m_Glass_Clear "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_02_Bracket" 1941 -122 1780 130 4 35 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_02_BracketArmL" 1884 -180 1809 6 120 6 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_02_BracketArmR" 1998 -180 1809 6 120 6 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkCyl "Glass_Bottle_Shelf_02_Stop_Rail" [1871,-260,1837] [1,0,0] 140 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkCyl "Glass_Bottle_Shelf_02_Stop_Post" [1874,-260,1825] [0,0,1] 12 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkCyl "Glass_Bottle_Shelf_02_Stop_Post" [2008,-260,1825] [0,0,1] 12 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkBox "Glass_Bottle_Shelf_03" 2557 -195 1815 150 150 10 1 m_Glass_Clear "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_03_Bracket" 2557 -122 1780 130 4 35 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_03_BracketArmL" 2500 -180 1809 6 120 6 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_03_BracketArmR" 2614 -180 1809 6 120 6 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkCyl "Glass_Bottle_Shelf_03_Stop_Rail" [2487,-260,1837] [1,0,0] 140 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkCyl "Glass_Bottle_Shelf_03_Stop_Post" [2490,-260,1825] [0,0,1] 12 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkCyl "Glass_Bottle_Shelf_03_Stop_Post" [2624,-260,1825] [0,0,1] 12 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkBox "Glass_Bottle_Shelf_04" 1325 -195 1465 150 150 10 1 m_Glass_Clear "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_04_Bracket" 1325 -122 1430 130 4 35 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_04_BracketArmL" 1268 -180 1459 6 120 6 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_04_BracketArmR" 1382 -180 1459 6 120 6 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkCyl "Glass_Bottle_Shelf_04_Stop_Rail" [1255,-260,1487] [1,0,0] 140 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkCyl "Glass_Bottle_Shelf_04_Stop_Post" [1258,-260,1475] [0,0,1] 12 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkCyl "Glass_Bottle_Shelf_04_Stop_Post" [1392,-260,1475] [0,0,1] 12 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkBox "Glass_Bottle_Shelf_05" 1941 -195 1465 150 150 10 1 m_Glass_Clear "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_05_Bracket" 1941 -122 1430 130 4 35 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_05_BracketArmL" 1884 -180 1459 6 120 6 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_05_BracketArmR" 1998 -180 1459 6 120 6 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkCyl "Glass_Bottle_Shelf_05_Stop_Rail" [1871,-260,1487] [1,0,0] 140 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkCyl "Glass_Bottle_Shelf_05_Stop_Post" [1874,-260,1475] [0,0,1] 12 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkCyl "Glass_Bottle_Shelf_05_Stop_Post" [2008,-260,1475] [0,0,1] 12 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkBox "Glass_Bottle_Shelf_06" 2557 -195 1465 150 150 10 1 m_Glass_Clear "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_06_Bracket" 2557 -122 1430 130 4 35 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_06_BracketArmL" 2500 -180 1459 6 120 6 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_06_BracketArmR" 2614 -180 1459 6 120 6 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkCyl "Glass_Bottle_Shelf_06_Stop_Rail" [2487,-260,1487] [1,0,0] 140 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkCyl "Glass_Bottle_Shelf_06_Stop_Post" [2490,-260,1475] [0,0,1] 12 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkCyl "Glass_Bottle_Shelf_06_Stop_Post" [2624,-260,1475] [0,0,1] 12 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkBox "Glass_Bottle_Shelf_07" 1633 -195 1970 150 150 10 1 m_Glass_Clear "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_07_Bracket" 1633 -122 1935 130 4 35 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_07_BracketArmL" 1576 -180 1964 6 120 6 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_07_BracketArmR" 1690 -180 1964 6 120 6 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkCyl "Glass_Bottle_Shelf_07_Stop_Rail" [1563,-260,1992] [1,0,0] 140 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkCyl "Glass_Bottle_Shelf_07_Stop_Post" [1566,-260,1980] [0,0,1] 12 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkCyl "Glass_Bottle_Shelf_07_Stop_Post" [1700,-260,1980] [0,0,1] 12 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkBox "Glass_Bottle_Shelf_08" 2249 -195 1970 150 150 10 1 m_Glass_Clear "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_08_Bracket" 2249 -122 1935 130 4 35 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_08_BracketArmL" 2192 -180 1964 6 120 6 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_08_BracketArmR" 2306 -180 1964 6 120 6 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkCyl "Glass_Bottle_Shelf_08_Stop_Rail" [2179,-260,1992] [1,0,0] 140 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkCyl "Glass_Bottle_Shelf_08_Stop_Post" [2182,-260,1980] [0,0,1] 12 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkCyl "Glass_Bottle_Shelf_08_Stop_Post" [2316,-260,1980] [0,0,1] 12 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkBox "Glass_Bottle_Shelf_09" 1633 -195 1620 150 150 10 1 m_Glass_Clear "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_09_Bracket" 1633 -122 1585 130 4 35 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_09_BracketArmL" 1576 -180 1614 6 120 6 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_09_BracketArmR" 1690 -180 1614 6 120 6 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkCyl "Glass_Bottle_Shelf_09_Stop_Rail" [1563,-260,1642] [1,0,0] 140 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkCyl "Glass_Bottle_Shelf_09_Stop_Post" [1566,-260,1630] [0,0,1] 12 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkCyl "Glass_Bottle_Shelf_09_Stop_Post" [1700,-260,1630] [0,0,1] 12 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkBox "Glass_Bottle_Shelf_10" 2249 -195 1620 150 150 10 1 m_Glass_Clear "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_10_Bracket" 2249 -122 1585 130 4 35 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_10_BracketArmL" 2192 -180 1614 6 120 6 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkBox "Glass_Bottle_Shelf_10_BracketArmR" 2306 -180 1614 6 120 6 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkCyl "Glass_Bottle_Shelf_10_Stop_Rail" [2179,-260,1642] [1,0,0] 140 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkCyl "Glass_Bottle_Shelf_10_Stop_Post" [2182,-260,1630] [0,0,1] 12 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkCyl "Glass_Bottle_Shelf_10_Stop_Post" [2316,-260,1630] [0,0,1] 12 3 3 12 m_Brass_Brushed "02_Wall_Cladding"
mkBox "Bulkhead_Veneer_Left" 625 -125 2165 1250 250 570 1.5 m_Veneer_Wood "02_Wall_Cladding" 600
mkBox "Bulkhead_Veneer_Right" 3255 -125 2165 1250 250 570 1.5 m_Veneer_Wood "02_Wall_Cladding" 600
mkBox "Bulkhead_Mid_Void" 1940 -95 2165 1380 190 570 0 m_Black_Matte "02_Wall_Cladding" 0
mkBox "Bulkhead_Mid_Frame_Top" 1940 -220 2685 1380 60 50 0 m_Veneer_Wood "02_Wall_Cladding" 600
mkBox "Bulkhead_Mid_Frame_Bot" 1940 -220 2165 1380 60 40 0 m_Veneer_Wood "02_Wall_Cladding" 600
mkBox "Bulkhead_Mid_Frame_L" 1275 -220 2205 50 60 480 0 m_Veneer_Wood "02_Wall_Cladding" 600
mkBox "Bulkhead_Mid_Frame_R" 2605 -220 2205 50 60 480 0 m_Veneer_Wood "02_Wall_Cladding" 600
mkBox "MS_Grill_Frame_Top" 1940 -222.5 2660 1280 25 25 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Frame_Bot" 1940 -222.5 2205 1280 25 25 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Frame_L" 1312.5 -222.5 2230 25 25 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Frame_R" 2567.5 -222.5 2230 25 25 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Flat_01" 1374.2 -222.5 2230 12 15 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Flat_02" 1423.4 -222.5 2230 12 15 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Flat_03" 1472.6 -222.5 2230 12 15 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Flat_04" 1521.8 -222.5 2230 12 15 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Flat_05" 1571 -222.5 2230 12 15 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Flat_06" 1620.2 -222.5 2230 12 15 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Flat_07" 1669.4 -222.5 2230 12 15 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Flat_08" 1718.6 -222.5 2230 12 15 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Flat_09" 1767.8 -222.5 2230 12 15 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Flat_10" 1817 -222.5 2230 12 15 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Flat_11" 1866.2 -222.5 2230 12 15 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Flat_12" 1915.4 -222.5 2230 12 15 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Flat_13" 1964.6 -222.5 2230 12 15 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Flat_14" 2013.8 -222.5 2230 12 15 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Flat_15" 2063 -222.5 2230 12 15 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Flat_16" 2112.2 -222.5 2230 12 15 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Flat_17" 2161.4 -222.5 2230 12 15 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Flat_18" 2210.6 -222.5 2230 12 15 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Flat_19" 2259.8 -222.5 2230 12 15 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Flat_20" 2309 -222.5 2230 12 15 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Flat_21" 2358.2 -222.5 2230 12 15 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Flat_22" 2407.4 -222.5 2230 12 15 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Flat_23" 2456.6 -222.5 2230 12 15 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "MS_Grill_Flat_24" 2505.8 -222.5 2230 12 15 430 0 m_MS_Grill_Black_Powdercoat "02_Wall_Cladding" 0
mkBox "Bulkhead_LED_Profile" 1940 -220 2153 3880 30 12 0 m_Brass_Brushed "02_Wall_Cladding" 0
mkBox "Bulkhead_LED_Strip" 1940 -220 2152 3870 20 2 0 m_LED_Warm_3000K "02_Wall_Cladding" 0
mkBox "BackCtr_Plinth" 1940 -270 0 3880 300 75 0 m_Black_Matte "03_Back_Counter" 0
mkBox "BackCtr_Plinth_LED" 2565 -420 69 2630 4 4 0 m_LED_Warm_3000K "03_Back_Counter" 0
mkBox "BackCtr_Carcass_Back" 1940 -129 75 3880 18 675 0 m_Veneer_Carcass_Interior "03_Back_Counter" 600
mkBox "BackCtr_Carcass_Bottom" 1940 -285.5 75 3880 331 18 0 m_Veneer_Carcass_Interior "03_Back_Counter" 600
mkBox "BackCtr_Partition_1" 9 -285.5 75 18 331 675 0 m_Veneer_Carcass_Interior "03_Back_Counter" 600
mkBox "BackCtr_Partition_2" 659 -285.5 75 18 331 675 0 m_Veneer_Carcass_Interior "03_Back_Counter" 600
mkBox "BackCtr_Partition_3" 1259 -285.5 75 18 331 675 0 m_Veneer_Carcass_Interior "03_Back_Counter" 600
mkBox "BackCtr_Partition_4" 2639 -285.5 75 18 331 675 0 m_Veneer_Carcass_Interior "03_Back_Counter" 600
mkBox "BackCtr_Partition_5" 3871 -285.5 75 18 331 675 0 m_Veneer_Carcass_Interior "03_Back_Counter" 600
mkBox "BackCtr_Internal_Shelf_1" 1949 -284.5 420 1362 293 18 0 m_Veneer_Carcass_Interior "03_Back_Counter" 600
mkBox "BackCtr_Internal_Shelf_2" 3255 -284.5 420 1214 293 18 0 m_Veneer_Carcass_Interior "03_Back_Counter" 600
mkBox "BackCtr_Blind_Panel_Behind_Return" 334 -460.5 75 632 19 675 0 m_Veneer_Wood "03_Back_Counter" 600
mkBox "BackCtr_Shutter_1" 1422.5 -460.5 77 342 19 641 1.5 m_Veneer_Wood "03_Back_Counter" 600
mkBox "BackCtr_Shutter_2" 1767.5 -460.5 77 342 19 641 1.5 m_Veneer_Wood "03_Back_Counter" 600
mkBox "BackCtr_Shutter_3" 2112.5 -460.5 77 342 19 641 1.5 m_Veneer_Wood "03_Back_Counter" 600
mkBox "BackCtr_Shutter_4" 2457.5 -460.5 77 342 19 641 1.5 m_Veneer_Wood "03_Back_Counter" 600
mkBox "BackCtr_Shutter_5" 2786.25 -460.5 77 309.5 19 641 1.5 m_Veneer_Wood "03_Back_Counter" 600
mkBox "BackCtr_Shutter_6" 3098.75 -460.5 77 309.5 19 641 1.5 m_Veneer_Wood "03_Back_Counter" 600
mkBox "BackCtr_Shutter_7" 3411.25 -460.5 77 309.5 19 641 1.5 m_Veneer_Wood "03_Back_Counter" 600
mkBox "BackCtr_Shutter_8" 3723.75 -460.5 77 309.5 19 641 1.5 m_Veneer_Wood "03_Back_Counter" 600
mkBox "BackCtr_Gola_Channel" 2565 -449.5 720 2630 37 30 0 m_Brass_Brushed "03_Back_Counter" 0
mkBox "BackCtr_Gola_Recess_Shadow" 2565 -428.5 720 2630 5 30 0 m_Black_Matte "03_Back_Counter" 0
mkBox "BackCooler_Body" 959 -292.5 75 582 305 670 0 m_Cooler_Interior "03_Back_Counter" 0
mkBox "BackCooler_Frame_L" 685.5 -457.5 155 35 25 590 0 m_Stainless_Steel "03_Back_Counter" 0
mkBox "BackCooler_Frame_R" 1232.5 -457.5 155 35 25 590 0 m_Stainless_Steel "03_Back_Counter" 0
mkBox "BackCooler_Frame_Top" 959 -457.5 695 582 25 50 0 m_Stainless_Steel "03_Back_Counter" 0
mkBox "BackCooler_Glass_Door" 959 -459 155 512 6 540 0 m_Glass_Cooler_Door_Tinted "03_Back_Counter" 0
mkBox "BackCooler_Handle" 1187.5 -482.5 275 15 25 355 3 m_Stainless_Steel "03_Back_Counter" 0
mkBox "BackCooler_Interior_LED" 959 -435 680 502 10 8 0 m_LED_Warm_3000K "03_Back_Counter" 0
mkBox "BackCooler_Wire_Shelf_1" 959 -290 305 502 280 6 0 m_Stainless_Steel "03_Back_Counter" 0
mkBox "BackCooler_Wire_Shelf_2" 959 -290 495 502 280 6 0 m_Stainless_Steel "03_Back_Counter" 0
mkBox "BackCooler_Louvre_Frame" 959 -442.5 75 582 5 80 0 m_Black_Matte "03_Back_Counter" 0
mkBox "BackCooler_Louvre_Slat_1" 959 -456.5 81 572 23 6 0 m_Stainless_Steel "03_Back_Counter" 0
mkBox "BackCooler_Louvre_Slat_2" 959 -456.5 93 572 23 6 0 m_Stainless_Steel "03_Back_Counter" 0
mkBox "BackCooler_Louvre_Slat_3" 959 -456.5 105 572 23 6 0 m_Stainless_Steel "03_Back_Counter" 0
mkBox "BackCooler_Louvre_Slat_4" 959 -456.5 117 572 23 6 0 m_Stainless_Steel "03_Back_Counter" 0
mkBox "BackCooler_Louvre_Slat_5" 959 -456.5 129 572 23 6 0 m_Stainless_Steel "03_Back_Counter" 0
mkBox "BackCooler_Louvre_Slat_6" 959 -456.5 141 572 23 6 0 m_Stainless_Steel "03_Back_Counter" 0
mkBox "BackCtr_Top_Front" 1940 -455 750 3880 70 20 2 m_Stone_Kesariyaji_Green_Glossy "03_Back_Counter" 600
mkBox "BackCtr_Top_Rear" 1940 -155 750 3880 70 20 0 m_Stone_Kesariyaji_Green_Glossy "03_Back_Counter" 600
mkBox "BackCtr_Top_Left" 690 -305 750 1380 230 20 0 m_Stone_Kesariyaji_Green_Glossy "03_Back_Counter" 600
mkBox "BackCtr_Top_Right" 3190 -305 750 1380 230 20 0 m_Stone_Kesariyaji_Green_Glossy "03_Back_Counter" 600
mkBox "BackCtr_Top_Edge_Apron" 1940 -480 730 3880 20 20 1 m_Stone_Kesariyaji_Green_Glossy "03_Back_Counter" 600
mkBox "BackCtr_Top_Upstand" 1940 -127.5 770 3880 15 100 1 m_Stone_Kesariyaji_Green_Glossy "03_Back_Counter" 600
mkBox "Trough_Liner_Bottom" 1940 -305 600 1120 230 3 0 m_Stainless_Steel "04_Bar_Trough" 0
mkBox "Trough_Liner_Back" 1940 -191.5 600 1120 3 170 0 m_Stainless_Steel "04_Bar_Trough" 0
mkBox "Trough_Liner_Front" 1940 -418.5 600 1120 3 170 0 m_Stainless_Steel "04_Bar_Trough" 0
mkBox "Trough_Liner_L" 1381.5 -305 600 3 230 170 0 m_Stainless_Steel "04_Bar_Trough" 0
mkBox "Trough_Liner_R" 2498.5 -305 600 3 230 170 0 m_Stainless_Steel "04_Bar_Trough" 0
mkBox "Trough_Rim" 1940 -305 770 1140 250 2 0.9 m_Stainless_Steel "04_Bar_Trough" 0
mkBox "Trough_Grate_Slat_1" 1940 -201.5 758 1110 7 10 0 m_Stainless_Steel "04_Bar_Trough" 0
mkBox "Trough_Grate_Slat_2" 1940 -214.5 758 1110 7 10 0 m_Stainless_Steel "04_Bar_Trough" 0
mkBox "Trough_Grate_Slat_3" 1940 -227.5 758 1110 7 10 0 m_Stainless_Steel "04_Bar_Trough" 0
mkBox "Trough_Grate_Slat_4" 1940 -240.5 758 1110 7 10 0 m_Stainless_Steel "04_Bar_Trough" 0
mkBox "Trough_Grate_Slat_5" 1940 -253.5 758 1110 7 10 0 m_Stainless_Steel "04_Bar_Trough" 0
mkBox "Trough_Grate_Slat_6" 1940 -266.5 758 1110 7 10 0 m_Stainless_Steel "04_Bar_Trough" 0
mkBox "Trough_Grate_Slat_7" 1940 -279.5 758 1110 7 10 0 m_Stainless_Steel "04_Bar_Trough" 0
mkBox "Trough_Grate_Slat_8" 1940 -292.5 758 1110 7 10 0 m_Stainless_Steel "04_Bar_Trough" 0
mkBox "Trough_Grate_Slat_9" 1940 -305.5 758 1110 7 10 0 m_Stainless_Steel "04_Bar_Trough" 0
mkBox "Trough_Divider_1" 1660 -305 610 4 224 158 0 m_Stainless_Steel "04_Bar_Trough" 0
mkBox "Trough_Divider_2" 1940 -305 610 4 224 158 0 m_Stainless_Steel "04_Bar_Trough" 0
mkBox "Trough_Divider_3" 2220 -305 610 4 224 158 0 m_Stainless_Steel "04_Bar_Trough" 0
mkBox "Trough_Front_Rinse_Rail" 1940 -382.5 745 1020 45 20 0 m_Stainless_Steel "04_Bar_Trough" 0
mkBox "Trough_Rubber_Bar_Mat" 1940 -158 770 1040 40 6 2 m_Rubber_Bar_Mat "04_Bar_Trough" 0
mkBox "Trough_Ice_1" 1434 -234 700 28 28 28 4 m_Glass_Clear "04_Bar_Trough" 0
mkBox "Trough_Ice_2" 1531 -287 700 28 28 28 4 m_Glass_Clear "04_Bar_Trough" 0
mkBox "Trough_Ice_3" 1628 -340 700 28 28 28 4 m_Glass_Clear "04_Bar_Trough" 0
mkBox "Trough_Ice_4" 1725 -393 700 28 28 28 4 m_Glass_Clear "04_Bar_Trough" 0
mkBox "Trough_Ice_5" 1822 -276 700 28 28 28 4 m_Glass_Clear "04_Bar_Trough" 0
mkBox "Trough_Ice_6" 1919 -329 700 28 28 28 4 m_Glass_Clear "04_Bar_Trough" 0
mkBox "Trough_Ice_7" 2016 -382 700 28 28 28 4 m_Glass_Clear "04_Bar_Trough" 0
mkBox "Trough_Ice_8" 2113 -265 700 28 28 28 4 m_Glass_Clear "04_Bar_Trough" 0
mkBox "Trough_Ice_9" 2210 -318 700 28 28 28 4 m_Glass_Clear "04_Bar_Trough" 0
mkBox "Trough_Ice_10" 2307 -371 700 28 28 28 4 m_Glass_Clear "04_Bar_Trough" 0
mkBox "Trough_Ice_11" 2404 -254 700 28 28 28 4 m_Glass_Clear "04_Bar_Trough" 0
mkBox "Trough_Ice_12" 1461 -307 700 28 28 28 4 m_Glass_Clear "04_Bar_Trough" 0
mkCyl "Faucet_Base" [1940,-158,776] [0,0,1] 20 25 25 24 m_Stainless_Steel "04_Bar_Trough"
mkCyl "Faucet_Riser" [1940,-158,796] [0,0,1] 260 12 12 24 m_Stainless_Steel "04_Bar_Trough"
mkCyl "Faucet_Spout" [1940,-158,1050] [0,-1,0] 170 10 10 24 m_Stainless_Steel "04_Bar_Trough"
mkCyl "Faucet_Nozzle" [1940,-325,1050] [0,0,-1] 45 10 10 24 m_Stainless_Steel "04_Bar_Trough"
mkBox "Faucet_Lever" 1986 -158 970 68 10 10 2 m_Stainless_Steel "04_Bar_Trough" 0
mkBox "Return_Plinth" 320 -1032.5 0 560 1125 75 0 m_Black_Matte "05_Return_Wine_Beer_Cooler" 0
mkBox "Return_Plinth_LED" 320 -1032.5 69 560 1085 4 0 m_LED_Warm_3000K "05_Return_Wine_Beer_Cooler" 0
mkBox "Return_Carcass" 321.5 -1032.5 75 607 1125 675 0 m_Cooler_Interior "05_Return_Wine_Beer_Cooler" 0
mkBox "Return_Top" 335 -1042.5 750 670 1105 20 2 m_Stone_Kesariyaji_Green_Glossy "05_Return_Wine_Beer_Cooler" 600
mkBox "Return_Top_Edge_Apron" 660 -1042.5 730 20 1105 20 1 m_Stone_Kesariyaji_Green_Glossy "05_Return_Wine_Beer_Cooler" 600
mkBox "Return_End_Panel_Frame_Top" 9 -1032.5 670 18 1125 80 0 m_Veneer_Wood "05_Return_Wine_Beer_Cooler" 600
mkBox "Return_End_Panel_Frame_Bot" 9 -1032.5 0 18 1125 135 0 m_Veneer_Wood "05_Return_Wine_Beer_Cooler" 600
mkBox "Return_End_Panel_Frame_Rear" 9 -510 135 18 80 535 0 m_Veneer_Wood "05_Return_Wine_Beer_Cooler" 600
mkBox "Return_End_Panel_Frame_Front" 9 -1555 135 18 80 535 0 m_Veneer_Wood "05_Return_Wine_Beer_Cooler" 600
mkBox "Return_Jali_Louvre_01" 5 -1032.5 145 22 965 22 2 m_Veneer_Wood "05_Return_Wine_Beer_Cooler" 600
mkBox "Return_Jali_Louvre_02" 5 -1032.5 179 22 965 22 2 m_Veneer_Wood "05_Return_Wine_Beer_Cooler" 600
mkBox "Return_Jali_Louvre_03" 5 -1032.5 213 22 965 22 2 m_Veneer_Wood "05_Return_Wine_Beer_Cooler" 600
mkBox "Return_Jali_Louvre_04" 5 -1032.5 247 22 965 22 2 m_Veneer_Wood "05_Return_Wine_Beer_Cooler" 600
mkBox "Return_Jali_Louvre_05" 5 -1032.5 281 22 965 22 2 m_Veneer_Wood "05_Return_Wine_Beer_Cooler" 600
mkBox "Return_Jali_Louvre_06" 5 -1032.5 315 22 965 22 2 m_Veneer_Wood "05_Return_Wine_Beer_Cooler" 600
mkBox "Return_Jali_Louvre_07" 5 -1032.5 349 22 965 22 2 m_Veneer_Wood "05_Return_Wine_Beer_Cooler" 600
mkBox "Return_Jali_Louvre_08" 5 -1032.5 383 22 965 22 2 m_Veneer_Wood "05_Return_Wine_Beer_Cooler" 600
mkBox "Return_Jali_Louvre_09" 5 -1032.5 417 22 965 22 2 m_Veneer_Wood "05_Return_Wine_Beer_Cooler" 600
mkBox "Return_Jali_Louvre_10" 5 -1032.5 451 22 965 22 2 m_Veneer_Wood "05_Return_Wine_Beer_Cooler" 600
mkBox "Return_Jali_Louvre_11" 5 -1032.5 485 22 965 22 2 m_Veneer_Wood "05_Return_Wine_Beer_Cooler" 600
mkBox "Return_Jali_Louvre_12" 5 -1032.5 519 22 965 22 2 m_Veneer_Wood "05_Return_Wine_Beer_Cooler" 600
mkBox "Return_Jali_Louvre_13" 5 -1032.5 553 22 965 22 2 m_Veneer_Wood "05_Return_Wine_Beer_Cooler" 600
mkBox "Return_Jali_Louvre_14" 5 -1032.5 587 22 965 22 2 m_Veneer_Wood "05_Return_Wine_Beer_Cooler" 600
mkBox "Return_Jali_Louvre_15" 5 -1032.5 621 22 965 22 2 m_Veneer_Wood "05_Return_Wine_Beer_Cooler" 600
mkBox "WineCooler_Frame_Top" 637.5 -747.5 695 25 545 50 0 m_Stainless_Steel "05_Return_Wine_Beer_Cooler" 0
mkBox "WineCooler_Frame_Near" 637.5 -492.5 155 25 35 540 0 m_Stainless_Steel "05_Return_Wine_Beer_Cooler" 0
mkBox "WineCooler_Frame_Far" 637.5 -1002.5 155 25 35 540 0 m_Stainless_Steel "05_Return_Wine_Beer_Cooler" 0
mkBox "WineCooler_Glass_Door" 639 -747.5 155 6 475 540 0 m_Glass_Cooler_Door_Tinted "05_Return_Wine_Beer_Cooler" 0
mkBox "WineCooler_Handle" 662.5 -957.5 275 25 15 355 3 m_Stainless_Steel "05_Return_Wine_Beer_Cooler" 0
mkBox "WineCooler_LED" 615 -747.5 680 10 465 8 0 m_LED_Warm_3000K "05_Return_Wine_Beer_Cooler" 0
mkBox "WineCooler_Louvre_Back" 622.5 -747.5 75 5 545 80 0 m_Black_Matte "05_Return_Wine_Beer_Cooler" 0
mkBox "WineCooler_Louvre_Slat_1" 636.5 -747.5 81 23 535 6 0 m_Stainless_Steel "05_Return_Wine_Beer_Cooler" 0
mkBox "WineCooler_Louvre_Slat_2" 636.5 -747.5 93 23 535 6 0 m_Stainless_Steel "05_Return_Wine_Beer_Cooler" 0
mkBox "WineCooler_Louvre_Slat_3" 636.5 -747.5 105 23 535 6 0 m_Stainless_Steel "05_Return_Wine_Beer_Cooler" 0
mkBox "WineCooler_Louvre_Slat_4" 636.5 -747.5 117 23 535 6 0 m_Stainless_Steel "05_Return_Wine_Beer_Cooler" 0
mkBox "WineCooler_Louvre_Slat_5" 636.5 -747.5 129 23 535 6 0 m_Stainless_Steel "05_Return_Wine_Beer_Cooler" 0
mkBox "WineCooler_Louvre_Slat_6" 636.5 -747.5 141 23 535 6 0 m_Stainless_Steel "05_Return_Wine_Beer_Cooler" 0
mkBox "WineCooler_Rack_1" 322.5 -747.5 205 565 465 12 0 m_Brass_Brushed "05_Return_Wine_Beer_Cooler" 0
mkCyl "WineCooler_Bottle_1_1" [60,-560,255] [1,0,0] 230 37 37 16 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_1_1_Neck" [290,-560,255] [1,0,0] 110 14 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_1_1_Foil" [400,-560,255] [1,0,0] 40 15 15 12 m_Bottle_Cap_Foil "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_1_2" [60,-655,255] [1,0,0] 230 37 37 16 m_Bottle_Glass_Green "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_1_2_Neck" [290,-655,255] [1,0,0] 110 14 12 12 m_Bottle_Glass_Green "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_1_2_Foil" [400,-655,255] [1,0,0] 40 15 15 12 m_Bottle_Cap_Foil "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_1_3" [60,-750,255] [1,0,0] 230 37 37 16 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_1_3_Neck" [290,-750,255] [1,0,0] 110 14 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_1_3_Foil" [400,-750,255] [1,0,0] 40 15 15 12 m_Bottle_Cap_Foil "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_1_4" [60,-845,255] [1,0,0] 230 37 37 16 m_Bottle_Glass_Green "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_1_4_Neck" [290,-845,255] [1,0,0] 110 14 12 12 m_Bottle_Glass_Green "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_1_4_Foil" [400,-845,255] [1,0,0] 40 15 15 12 m_Bottle_Cap_Foil "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_1_5" [60,-940,255] [1,0,0] 230 37 37 16 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_1_5_Neck" [290,-940,255] [1,0,0] 110 14 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_1_5_Foil" [400,-940,255] [1,0,0] 40 15 15 12 m_Bottle_Cap_Foil "05_Return_Wine_Beer_Cooler"
mkBox "WineCooler_Rack_2" 322.5 -747.5 335 565 465 12 0 m_Brass_Brushed "05_Return_Wine_Beer_Cooler" 0
mkCyl "WineCooler_Bottle_2_1" [60,-560,385] [1,0,0] 230 37 37 16 m_Bottle_Glass_Green "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_2_1_Neck" [290,-560,385] [1,0,0] 110 14 12 12 m_Bottle_Glass_Green "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_2_1_Foil" [400,-560,385] [1,0,0] 40 15 15 12 m_Bottle_Cap_Foil "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_2_2" [60,-655,385] [1,0,0] 230 37 37 16 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_2_2_Neck" [290,-655,385] [1,0,0] 110 14 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_2_2_Foil" [400,-655,385] [1,0,0] 40 15 15 12 m_Bottle_Cap_Foil "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_2_3" [60,-750,385] [1,0,0] 230 37 37 16 m_Bottle_Glass_Green "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_2_3_Neck" [290,-750,385] [1,0,0] 110 14 12 12 m_Bottle_Glass_Green "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_2_3_Foil" [400,-750,385] [1,0,0] 40 15 15 12 m_Bottle_Cap_Foil "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_2_4" [60,-845,385] [1,0,0] 230 37 37 16 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_2_4_Neck" [290,-845,385] [1,0,0] 110 14 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_2_4_Foil" [400,-845,385] [1,0,0] 40 15 15 12 m_Bottle_Cap_Foil "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_2_5" [60,-940,385] [1,0,0] 230 37 37 16 m_Bottle_Glass_Green "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_2_5_Neck" [290,-940,385] [1,0,0] 110 14 12 12 m_Bottle_Glass_Green "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_2_5_Foil" [400,-940,385] [1,0,0] 40 15 15 12 m_Bottle_Cap_Foil "05_Return_Wine_Beer_Cooler"
mkBox "WineCooler_Rack_3" 322.5 -747.5 465 565 465 12 0 m_Brass_Brushed "05_Return_Wine_Beer_Cooler" 0
mkCyl "WineCooler_Bottle_3_1" [60,-560,515] [1,0,0] 230 37 37 16 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_3_1_Neck" [290,-560,515] [1,0,0] 110 14 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_3_1_Foil" [400,-560,515] [1,0,0] 40 15 15 12 m_Bottle_Cap_Foil "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_3_2" [60,-655,515] [1,0,0] 230 37 37 16 m_Bottle_Glass_Green "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_3_2_Neck" [290,-655,515] [1,0,0] 110 14 12 12 m_Bottle_Glass_Green "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_3_2_Foil" [400,-655,515] [1,0,0] 40 15 15 12 m_Bottle_Cap_Foil "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_3_3" [60,-750,515] [1,0,0] 230 37 37 16 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_3_3_Neck" [290,-750,515] [1,0,0] 110 14 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_3_3_Foil" [400,-750,515] [1,0,0] 40 15 15 12 m_Bottle_Cap_Foil "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_3_4" [60,-845,515] [1,0,0] 230 37 37 16 m_Bottle_Glass_Green "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_3_4_Neck" [290,-845,515] [1,0,0] 110 14 12 12 m_Bottle_Glass_Green "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_3_4_Foil" [400,-845,515] [1,0,0] 40 15 15 12 m_Bottle_Cap_Foil "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_3_5" [60,-940,515] [1,0,0] 230 37 37 16 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_3_5_Neck" [290,-940,515] [1,0,0] 110 14 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_3_5_Foil" [400,-940,515] [1,0,0] 40 15 15 12 m_Bottle_Cap_Foil "05_Return_Wine_Beer_Cooler"
mkBox "WineCooler_Rack_4" 322.5 -747.5 595 565 465 12 0 m_Brass_Brushed "05_Return_Wine_Beer_Cooler" 0
mkCyl "WineCooler_Bottle_4_1" [60,-560,645] [1,0,0] 230 37 37 16 m_Bottle_Glass_Green "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_4_1_Neck" [290,-560,645] [1,0,0] 110 14 12 12 m_Bottle_Glass_Green "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_4_1_Foil" [400,-560,645] [1,0,0] 40 15 15 12 m_Bottle_Cap_Foil "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_4_2" [60,-655,645] [1,0,0] 230 37 37 16 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_4_2_Neck" [290,-655,645] [1,0,0] 110 14 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_4_2_Foil" [400,-655,645] [1,0,0] 40 15 15 12 m_Bottle_Cap_Foil "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_4_3" [60,-750,645] [1,0,0] 230 37 37 16 m_Bottle_Glass_Green "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_4_3_Neck" [290,-750,645] [1,0,0] 110 14 12 12 m_Bottle_Glass_Green "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_4_3_Foil" [400,-750,645] [1,0,0] 40 15 15 12 m_Bottle_Cap_Foil "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_4_4" [60,-845,645] [1,0,0] 230 37 37 16 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_4_4_Neck" [290,-845,645] [1,0,0] 110 14 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_4_4_Foil" [400,-845,645] [1,0,0] 40 15 15 12 m_Bottle_Cap_Foil "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_4_5" [60,-940,645] [1,0,0] 230 37 37 16 m_Bottle_Glass_Green "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_4_5_Neck" [290,-940,645] [1,0,0] 110 14 12 12 m_Bottle_Glass_Green "05_Return_Wine_Beer_Cooler"
mkCyl "WineCooler_Bottle_4_5_Foil" [400,-940,645] [1,0,0] 40 15 15 12 m_Bottle_Cap_Foil "05_Return_Wine_Beer_Cooler"
mkBox "BeerCooler_Frame_Top" 637.5 -1307.5 695 25 565 50 0 m_Stainless_Steel "05_Return_Wine_Beer_Cooler" 0
mkBox "BeerCooler_Frame_Near" 637.5 -1042.5 155 25 35 540 0 m_Stainless_Steel "05_Return_Wine_Beer_Cooler" 0
mkBox "BeerCooler_Frame_Far" 637.5 -1572.5 155 25 35 540 0 m_Stainless_Steel "05_Return_Wine_Beer_Cooler" 0
mkBox "BeerCooler_Glass_Door" 639 -1307.5 155 6 495 540 0 m_Glass_Cooler_Door_Tinted "05_Return_Wine_Beer_Cooler" 0
mkBox "BeerCooler_Handle" 662.5 -1527.5 275 25 15 355 3 m_Stainless_Steel "05_Return_Wine_Beer_Cooler" 0
mkBox "BeerCooler_LED" 615 -1307.5 680 10 485 8 0 m_LED_Warm_3000K "05_Return_Wine_Beer_Cooler" 0
mkBox "BeerCooler_Louvre_Back" 622.5 -1307.5 75 5 565 80 0 m_Black_Matte "05_Return_Wine_Beer_Cooler" 0
mkBox "BeerCooler_Louvre_Slat_1" 636.5 -1307.5 81 23 555 6 0 m_Stainless_Steel "05_Return_Wine_Beer_Cooler" 0
mkBox "BeerCooler_Louvre_Slat_2" 636.5 -1307.5 93 23 555 6 0 m_Stainless_Steel "05_Return_Wine_Beer_Cooler" 0
mkBox "BeerCooler_Louvre_Slat_3" 636.5 -1307.5 105 23 555 6 0 m_Stainless_Steel "05_Return_Wine_Beer_Cooler" 0
mkBox "BeerCooler_Louvre_Slat_4" 636.5 -1307.5 117 23 555 6 0 m_Stainless_Steel "05_Return_Wine_Beer_Cooler" 0
mkBox "BeerCooler_Louvre_Slat_5" 636.5 -1307.5 129 23 555 6 0 m_Stainless_Steel "05_Return_Wine_Beer_Cooler" 0
mkBox "BeerCooler_Louvre_Slat_6" 636.5 -1307.5 141 23 555 6 0 m_Stainless_Steel "05_Return_Wine_Beer_Cooler" 0
mkBox "BeerCooler_Shelf_1" 322.5 -1307.5 315 565 485 6 0 m_Stainless_Steel "05_Return_Wine_Beer_Cooler" 0
mkBox "BeerCooler_Shelf_2" 322.5 -1307.5 545 565 485 6 0 m_Stainless_Steel "05_Return_Wine_Beer_Cooler" 0
mkCyl "BeerCooler_Bottle_0_0_0" [200,-1135,97] [0,0,1] 150 30 30 14 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_0_0_0_Neck" [200,-1135,247] [0,0,1] 60 28 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_0_0_1" [380,-1135,97] [0,0,1] 150 30 30 14 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_0_0_1_Neck" [380,-1135,247] [0,0,1] 60 28 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_0_1_0" [200,-1240,97] [0,0,1] 150 30 30 14 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_0_1_0_Neck" [200,-1240,247] [0,0,1] 60 28 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_0_1_1" [380,-1240,97] [0,0,1] 150 30 30 14 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_0_1_1_Neck" [380,-1240,247] [0,0,1] 60 28 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_0_2_0" [200,-1345,97] [0,0,1] 150 30 30 14 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_0_2_0_Neck" [200,-1345,247] [0,0,1] 60 28 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_0_2_1" [380,-1345,97] [0,0,1] 150 30 30 14 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_0_2_1_Neck" [380,-1345,247] [0,0,1] 60 28 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_0_3_0" [200,-1450,97] [0,0,1] 150 30 30 14 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_0_3_0_Neck" [200,-1450,247] [0,0,1] 60 28 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_0_3_1" [380,-1450,97] [0,0,1] 150 30 30 14 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_0_3_1_Neck" [380,-1450,247] [0,0,1] 60 28 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_1_0_0" [200,-1135,321] [0,0,1] 150 30 30 14 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_1_0_0_Neck" [200,-1135,471] [0,0,1] 60 28 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_1_0_1" [380,-1135,321] [0,0,1] 150 30 30 14 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_1_0_1_Neck" [380,-1135,471] [0,0,1] 60 28 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_1_1_0" [200,-1240,321] [0,0,1] 150 30 30 14 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_1_1_0_Neck" [200,-1240,471] [0,0,1] 60 28 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_1_1_1" [380,-1240,321] [0,0,1] 150 30 30 14 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_1_1_1_Neck" [380,-1240,471] [0,0,1] 60 28 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_1_2_0" [200,-1345,321] [0,0,1] 150 30 30 14 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_1_2_0_Neck" [200,-1345,471] [0,0,1] 60 28 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_1_2_1" [380,-1345,321] [0,0,1] 150 30 30 14 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_1_2_1_Neck" [380,-1345,471] [0,0,1] 60 28 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_1_3_0" [200,-1450,321] [0,0,1] 150 30 30 14 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_1_3_0_Neck" [200,-1450,471] [0,0,1] 60 28 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_1_3_1" [380,-1450,321] [0,0,1] 150 30 30 14 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_1_3_1_Neck" [380,-1450,471] [0,0,1] 60 28 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_2_0_0" [200,-1135,551] [0,0,1] 150 30 30 14 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_2_0_0_Neck" [200,-1135,701] [0,0,1] 60 28 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_2_0_1" [380,-1135,551] [0,0,1] 150 30 30 14 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_2_0_1_Neck" [380,-1135,701] [0,0,1] 60 28 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_2_1_0" [200,-1240,551] [0,0,1] 150 30 30 14 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_2_1_0_Neck" [200,-1240,701] [0,0,1] 60 28 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_2_1_1" [380,-1240,551] [0,0,1] 150 30 30 14 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_2_1_1_Neck" [380,-1240,701] [0,0,1] 60 28 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_2_2_0" [200,-1345,551] [0,0,1] 150 30 30 14 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_2_2_0_Neck" [200,-1345,701] [0,0,1] 60 28 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_2_2_1" [380,-1345,551] [0,0,1] 150 30 30 14 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_2_2_1_Neck" [380,-1345,701] [0,0,1] 60 28 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_2_3_0" [200,-1450,551] [0,0,1] 150 30 30 14 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_2_3_0_Neck" [200,-1450,701] [0,0,1] 60 28 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_2_3_1" [380,-1450,551] [0,0,1] 150 30 30 14 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkCyl "BeerCooler_Bottle_2_3_1_Neck" [380,-1450,701] [0,0,1] 60 28 12 12 m_Bottle_Glass_Amber "05_Return_Wine_Beer_Cooler"
mkBox "Bar_Plinth" 1250 -1640 0 2420 90 75 0 m_Black_Matte "06_Bar_Table" 0
mkBox "Bar_Plinth_LED" 1250 -1685 69 2420 4 4 0 m_LED_Warm_3000K "06_Bar_Table" 0
mkBox "Bar_Body_Core" 1241 -1655 75 2482 120 945 0 m_Veneer_Carcass_Interior "06_Bar_Table" 600
mkBox "Bar_Body_Back_Veneer" 1566 -1586 770 1832 18 250 0 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Backing" 1250 -1722.5 75 2500 15 945 0 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_01" 30 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_02" 70 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_03" 110 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_04" 150 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_05" 190 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_06" 230 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_07" 270 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_08" 310 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_09" 350 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_10" 390 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_11" 430 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_12" 470 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_13" 510 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_14" 550 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_15" 590 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_16" 630 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_17" 670 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_18" 710 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_19" 750 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_20" 790 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_21" 830 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_22" 870 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_23" 910 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_24" 950 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_25" 990 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_26" 1030 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_27" 1070 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_28" 1110 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_29" 1150 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_30" 1190 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_31" 1230 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_32" 1270 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_33" 1310 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_34" 1350 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_35" 1390 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_36" 1430 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_37" 1470 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_38" 1510 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_39" 1550 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_40" 1590 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_41" 1630 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_42" 1670 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_43" 1710 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_44" 1750 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_45" 1790 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_46" 1830 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_47" 1870 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_48" 1910 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_49" 1950 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_50" 1990 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_51" 2030 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_52" 2070 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_53" 2110 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_54" 2150 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_55" 2190 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_56" 2230 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_57" 2270 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_58" 2310 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_59" 2350 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_60" 2390 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_61" 2430 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Front_Flute_62" 2470 -1737.5 85 30 15 925 4 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_End_Panel_Right" 2491 -1557.5 0 18 375 1020 1 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_End_Panel_Left" -9 -1670 0 18 150 1020 1 m_Veneer_Wood "06_Bar_Table" 600
mkBox "Bar_Top_Raised" 1241 -1698.5 1020 2518 243 30 3 m_Stone_Kesariyaji_Green_Glossy "06_Bar_Table" 600
mkBox "Bar_Top_LED_Under_Overhang" 1240 -1770 1017 2480 10 3 0 m_LED_Warm_3000K "06_Bar_Table" 0
mkBox "Bar_Worktop" 1576 -1473.5 750 1812 207 20 2 m_Stone_Kesariyaji_Green_Glossy "06_Bar_Table" 600
mkBox "Bar_Worktop_Edge_Apron" 1576 -1380 730 1812 20 20 0 m_Stone_Kesariyaji_Green_Glossy "06_Bar_Table" 600
mkBox "Bar_Under_Bottom" 1566 -1492.5 75 1832 205 18 0 m_Veneer_Carcass_Interior "06_Bar_Table" 600
mkBox "Bar_Under_Kick" 1566 -1415 0 1832 50 75 0 m_Black_Matte "06_Bar_Table" 0
mkBox "Bar_Under_Upright_1" 679 -1492.5 93 18 205 657 0 m_Veneer_Carcass_Interior "06_Bar_Table" 600
mkBox "Bar_Under_Upright_2" 1289 -1492.5 93 18 205 657 0 m_Veneer_Carcass_Interior "06_Bar_Table" 600
mkBox "Bar_Under_Upright_3" 1899 -1492.5 93 18 205 657 0 m_Veneer_Carcass_Interior "06_Bar_Table" 600
mkBox "Bar_Under_Shelf" 1576 -1487.5 400 1812 195 18 0 m_Veneer_Carcass_Interior "06_Bar_Table" 600
mkBox "Bar_Speed_Rail_Tray" 1320 -1325 520 1100 90 5 0 m_Stainless_Steel "06_Bar_Table" 0
mkBox "Bar_Speed_Rail_Front" 1320 -1280 520 1100 4 80 0 m_Stainless_Steel "06_Bar_Table" 0
mkBox "Bar_Speed_Rail_End_1" 772 -1325 520 4 90 80 0 m_Stainless_Steel "06_Bar_Table" 0
mkBox "Bar_Speed_Rail_End_2" 1868 -1325 520 4 90 80 0 m_Stainless_Steel "06_Bar_Table" 0
mkCyl "Speed_Rail_Bottle_1" [825,-1325,525] [0,0,1] 200 38 38 16 m_Bottle_Glass_Clear "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_1_Shoulder" [825,-1325,725] [0,0,1] 35 38 14 16 m_Bottle_Glass_Clear "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_1_Neck" [825,-1325,760] [0,0,1] 55 14 14 12 m_Bottle_Glass_Clear "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_1_Pourer" [825,-1325,815] [0,0,1] 35 6 3 8 m_Stainless_Steel "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_2" [930,-1325,525] [0,0,1] 200 38 38 16 m_Bottle_Glass_Amber "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_2_Shoulder" [930,-1325,725] [0,0,1] 35 38 14 16 m_Bottle_Glass_Amber "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_2_Neck" [930,-1325,760] [0,0,1] 55 14 14 12 m_Bottle_Glass_Amber "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_2_Pourer" [930,-1325,815] [0,0,1] 35 6 3 8 m_Stainless_Steel "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_3" [1035,-1325,525] [0,0,1] 200 38 38 16 m_Bottle_Glass_Green "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_3_Shoulder" [1035,-1325,725] [0,0,1] 35 38 14 16 m_Bottle_Glass_Green "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_3_Neck" [1035,-1325,760] [0,0,1] 55 14 14 12 m_Bottle_Glass_Green "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_3_Pourer" [1035,-1325,815] [0,0,1] 35 6 3 8 m_Stainless_Steel "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_4" [1140,-1325,525] [0,0,1] 200 38 38 16 m_Bottle_Glass_Clear "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_4_Shoulder" [1140,-1325,725] [0,0,1] 35 38 14 16 m_Bottle_Glass_Clear "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_4_Neck" [1140,-1325,760] [0,0,1] 55 14 14 12 m_Bottle_Glass_Clear "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_4_Pourer" [1140,-1325,815] [0,0,1] 35 6 3 8 m_Stainless_Steel "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_5" [1245,-1325,525] [0,0,1] 200 38 38 16 m_Bottle_Glass_Amber "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_5_Shoulder" [1245,-1325,725] [0,0,1] 35 38 14 16 m_Bottle_Glass_Amber "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_5_Neck" [1245,-1325,760] [0,0,1] 55 14 14 12 m_Bottle_Glass_Amber "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_5_Pourer" [1245,-1325,815] [0,0,1] 35 6 3 8 m_Stainless_Steel "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_6" [1350,-1325,525] [0,0,1] 200 38 38 16 m_Bottle_Glass_Green "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_6_Shoulder" [1350,-1325,725] [0,0,1] 35 38 14 16 m_Bottle_Glass_Green "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_6_Neck" [1350,-1325,760] [0,0,1] 55 14 14 12 m_Bottle_Glass_Green "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_6_Pourer" [1350,-1325,815] [0,0,1] 35 6 3 8 m_Stainless_Steel "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_7" [1455,-1325,525] [0,0,1] 200 38 38 16 m_Bottle_Glass_Clear "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_7_Shoulder" [1455,-1325,725] [0,0,1] 35 38 14 16 m_Bottle_Glass_Clear "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_7_Neck" [1455,-1325,760] [0,0,1] 55 14 14 12 m_Bottle_Glass_Clear "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_7_Pourer" [1455,-1325,815] [0,0,1] 35 6 3 8 m_Stainless_Steel "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_8" [1560,-1325,525] [0,0,1] 200 38 38 16 m_Bottle_Glass_Amber "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_8_Shoulder" [1560,-1325,725] [0,0,1] 35 38 14 16 m_Bottle_Glass_Amber "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_8_Neck" [1560,-1325,760] [0,0,1] 55 14 14 12 m_Bottle_Glass_Amber "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_8_Pourer" [1560,-1325,815] [0,0,1] 35 6 3 8 m_Stainless_Steel "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_9" [1665,-1325,525] [0,0,1] 200 38 38 16 m_Bottle_Glass_Green "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_9_Shoulder" [1665,-1325,725] [0,0,1] 35 38 14 16 m_Bottle_Glass_Green "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_9_Neck" [1665,-1325,760] [0,0,1] 55 14 14 12 m_Bottle_Glass_Green "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_9_Pourer" [1665,-1325,815] [0,0,1] 35 6 3 8 m_Stainless_Steel "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_10" [1770,-1325,525] [0,0,1] 200 38 38 16 m_Bottle_Glass_Clear "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_10_Shoulder" [1770,-1325,725] [0,0,1] 35 38 14 16 m_Bottle_Glass_Clear "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_10_Neck" [1770,-1325,760] [0,0,1] 55 14 14 12 m_Bottle_Glass_Clear "06_Bar_Table"
mkCyl "Speed_Rail_Bottle_10_Pourer" [1770,-1325,815] [0,0,1] 35 6 3 8 m_Stainless_Steel "06_Bar_Table"
mkCyl "Bar_Foot_Rail" [120,-1815,230] [1,0,0] 2260 25 25 24 m_Brass_Brushed "06_Bar_Table"
mkCyl "Bar_Foot_Rail_EndCap_1" [114,-1815,230] [1,0,0] 6 27 27 24 m_Brass_Brushed "06_Bar_Table"
mkCyl "Bar_Foot_Rail_EndCap_2" [2380,-1815,230] [1,0,0] 6 27 27 24 m_Brass_Brushed "06_Bar_Table"
mkCyl "Bar_Foot_Rail_Bracket_1" [300,-1745,230] [0,-1,0] 70 12 12 12 m_Brass_Brushed "06_Bar_Table"
mkCyl "Bar_Foot_Rail_Rose_1" [300,-1745,230] [0,-1,0] 8 35 35 20 m_Brass_Brushed "06_Bar_Table"
mkCyl "Bar_Foot_Rail_Bracket_2" [1250,-1745,230] [0,-1,0] 70 12 12 12 m_Brass_Brushed "06_Bar_Table"
mkCyl "Bar_Foot_Rail_Rose_2" [1250,-1745,230] [0,-1,0] 8 35 35 20 m_Brass_Brushed "06_Bar_Table"
mkCyl "Bar_Foot_Rail_Bracket_3" [2200,-1745,230] [0,-1,0] 70 12 12 12 m_Brass_Brushed "06_Bar_Table"
mkCyl "Bar_Foot_Rail_Rose_3" [2200,-1745,230] [0,-1,0] 8 35 35 20 m_Brass_Brushed "06_Bar_Table"
mkCyl "Shelf_Bottle_01_Body" [1325,-195,1825] [0,0,1] 200 37 37 18 m_Bottle_Glass_Green "07_Props_Bottles_Glassware"
mkCyl "Shelf_Bottle_01_Shoulder" [1325,-195,2025] [0,0,1] 40 37 14 18 m_Bottle_Glass_Green "07_Props_Bottles_Glassware"
mkCyl "Shelf_Bottle_01_Neck" [1325,-195,2065] [0,0,1] 45 14 14 12 m_Bottle_Glass_Green "07_Props_Bottles_Glassware"
mkCyl "Shelf_Bottle_01_Foil" [1325,-195,2095] [0,0,1] 25 15 15 12 m_Bottle_Cap_Foil "07_Props_Bottles_Glassware"
mkBox "Shelf_Bottle_02_Body" 1941 -195 1825 84 64 190 10 m_Bottle_Glass_Amber "07_Props_Bottles_Glassware" 0
mkCyl "Shelf_Bottle_02_Neck" [1941,-195,2015] [0,0,1] 45 16 16 12 m_Bottle_Glass_Amber "07_Props_Bottles_Glassware"
mkCyl "Shelf_Bottle_02_Cap" [1941,-195,2060] [0,0,1] 30 19 19 16 m_Black_Matte "07_Props_Bottles_Glassware"
mkCyl "Shelf_Bottle_03_Body" [2557,-195,1825] [0,0,1] 180 42 42 18 m_Bottle_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "Shelf_Bottle_03_Shoulder" [2557,-195,2005] [0,0,1] 30 42 15 18 m_Bottle_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "Shelf_Bottle_03_Neck" [2557,-195,2035] [0,0,1] 35 15 15 12 m_Bottle_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "Shelf_Bottle_03_Cap" [2557,-195,2070] [0,0,1] 25 17 17 12 m_Brass_Brushed "07_Props_Bottles_Glassware"
mkCyl "Shelf_Bottle_04_Body" [1325,-195,1475] [0,0,1] 200 37 37 18 m_Bottle_Glass_Green "07_Props_Bottles_Glassware"
mkCyl "Shelf_Bottle_04_Shoulder" [1325,-195,1675] [0,0,1] 40 37 14 18 m_Bottle_Glass_Green "07_Props_Bottles_Glassware"
mkCyl "Shelf_Bottle_04_Neck" [1325,-195,1715] [0,0,1] 45 14 14 12 m_Bottle_Glass_Green "07_Props_Bottles_Glassware"
mkCyl "Shelf_Bottle_04_Foil" [1325,-195,1745] [0,0,1] 25 15 15 12 m_Bottle_Cap_Foil "07_Props_Bottles_Glassware"
mkBox "Shelf_Bottle_05_Body" 1941 -195 1475 84 64 190 10 m_Bottle_Glass_Amber "07_Props_Bottles_Glassware" 0
mkCyl "Shelf_Bottle_05_Neck" [1941,-195,1665] [0,0,1] 45 16 16 12 m_Bottle_Glass_Amber "07_Props_Bottles_Glassware"
mkCyl "Shelf_Bottle_05_Cap" [1941,-195,1710] [0,0,1] 30 19 19 16 m_Black_Matte "07_Props_Bottles_Glassware"
mkCyl "Shelf_Bottle_06_Body" [2557,-195,1475] [0,0,1] 180 42 42 18 m_Bottle_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "Shelf_Bottle_06_Shoulder" [2557,-195,1655] [0,0,1] 30 42 15 18 m_Bottle_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "Shelf_Bottle_06_Neck" [2557,-195,1685] [0,0,1] 35 15 15 12 m_Bottle_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "Shelf_Bottle_06_Cap" [2557,-195,1720] [0,0,1] 25 17 17 12 m_Brass_Brushed "07_Props_Bottles_Glassware"
mkCyl "Shelf_Tumbler_07a_Base" [1598,-195,1980] [0,0,1] 12 38 38 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "Shelf_Tumbler_07a_Wall" [1598,-195,1992] [0,0,1] 80 38 41 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "Shelf_Tumbler_07b_Base" [1668,-195,1980] [0,0,1] 12 38 38 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "Shelf_Tumbler_07b_Wall" [1668,-195,1992] [0,0,1] 80 38 41 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "Shelf_Tumbler_08a_Base" [2214,-195,1980] [0,0,1] 12 38 38 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "Shelf_Tumbler_08a_Wall" [2214,-195,1992] [0,0,1] 80 38 41 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "Shelf_Tumbler_08b_Base" [2284,-195,1980] [0,0,1] 12 38 38 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "Shelf_Tumbler_08b_Wall" [2284,-195,1992] [0,0,1] 80 38 41 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "Shelf_Bottle_09_Body" [1633,-195,1630] [0,0,1] 180 42 42 18 m_Bottle_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "Shelf_Bottle_09_Shoulder" [1633,-195,1810] [0,0,1] 30 42 15 18 m_Bottle_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "Shelf_Bottle_09_Neck" [1633,-195,1840] [0,0,1] 35 15 15 12 m_Bottle_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "Shelf_Bottle_09_Cap" [1633,-195,1875] [0,0,1] 25 17 17 12 m_Brass_Brushed "07_Props_Bottles_Glassware"
mkCyl "Shelf_Bottle_10_Body" [2249,-195,1630] [0,0,1] 200 37 37 18 m_Bottle_Glass_Green "07_Props_Bottles_Glassware"
mkCyl "Shelf_Bottle_10_Shoulder" [2249,-195,1830] [0,0,1] 40 37 14 18 m_Bottle_Glass_Green "07_Props_Bottles_Glassware"
mkCyl "Shelf_Bottle_10_Neck" [2249,-195,1870] [0,0,1] 45 14 14 12 m_Bottle_Glass_Green "07_Props_Bottles_Glassware"
mkCyl "Shelf_Bottle_10_Foil" [2249,-195,1900] [0,0,1] 25 15 15 12 m_Bottle_Cap_Foil "07_Props_Bottles_Glassware"
mkBox "LongShelf_Bottle_01_Body" 1480 -240 1282 84 64 190 10 m_Bottle_Glass_Amber "07_Props_Bottles_Glassware" 0
mkCyl "LongShelf_Bottle_01_Neck" [1480,-240,1472] [0,0,1] 45 16 16 12 m_Bottle_Glass_Amber "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Bottle_01_Cap" [1480,-240,1517] [0,0,1] 30 19 19 16 m_Black_Matte "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Bottle_02_Body" [1633,-240,1282] [0,0,1] 180 42 42 18 m_Bottle_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Bottle_02_Shoulder" [1633,-240,1462] [0,0,1] 30 42 15 18 m_Bottle_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Bottle_02_Neck" [1633,-240,1492] [0,0,1] 35 15 15 12 m_Bottle_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Bottle_02_Cap" [1633,-240,1527] [0,0,1] 25 17 17 12 m_Brass_Brushed "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Bottle_03_Body" [1786,-240,1282] [0,0,1] 200 37 37 18 m_Bottle_Glass_Green "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Bottle_03_Shoulder" [1786,-240,1482] [0,0,1] 40 37 14 18 m_Bottle_Glass_Green "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Bottle_03_Neck" [1786,-240,1522] [0,0,1] 45 14 14 12 m_Bottle_Glass_Green "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Bottle_03_Foil" [1786,-240,1552] [0,0,1] 25 15 15 12 m_Bottle_Cap_Foil "07_Props_Bottles_Glassware"
mkBox "LongShelf_Bottle_04_Body" 2096 -240 1282 84 64 190 10 m_Bottle_Glass_Amber "07_Props_Bottles_Glassware" 0
mkCyl "LongShelf_Bottle_04_Neck" [2096,-240,1472] [0,0,1] 45 16 16 12 m_Bottle_Glass_Amber "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Bottle_04_Cap" [2096,-240,1517] [0,0,1] 30 19 19 16 m_Black_Matte "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Bottle_05_Body" [2249,-240,1282] [0,0,1] 180 42 42 18 m_Bottle_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Bottle_05_Shoulder" [2249,-240,1462] [0,0,1] 30 42 15 18 m_Bottle_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Bottle_05_Neck" [2249,-240,1492] [0,0,1] 35 15 15 12 m_Bottle_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Bottle_05_Cap" [2249,-240,1527] [0,0,1] 25 17 17 12 m_Brass_Brushed "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Bottle_06_Body" [2402,-240,1282] [0,0,1] 200 37 37 18 m_Bottle_Glass_Green "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Bottle_06_Shoulder" [2402,-240,1482] [0,0,1] 40 37 14 18 m_Bottle_Glass_Green "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Bottle_06_Neck" [2402,-240,1522] [0,0,1] 45 14 14 12 m_Bottle_Glass_Green "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Bottle_06_Foil" [2402,-240,1552] [0,0,1] 25 15 15 12 m_Bottle_Cap_Foil "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Tumbler_0a_Base" [1290,-240,1282] [0,0,1] 12 38 38 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Tumbler_0a_Wall" [1290,-240,1294] [0,0,1] 80 38 41 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Tumbler_0b_Base" [1360,-240,1282] [0,0,1] 12 38 38 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Tumbler_0b_Wall" [1360,-240,1294] [0,0,1] 80 38 41 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Tumbler_2a_Base" [1906,-240,1282] [0,0,1] 12 38 38 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Tumbler_2a_Wall" [1906,-240,1294] [0,0,1] 80 38 41 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Tumbler_2b_Base" [1976,-240,1282] [0,0,1] 12 38 38 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Tumbler_2b_Wall" [1976,-240,1294] [0,0,1] 80 38 41 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Tumbler_4a_Base" [2522,-240,1282] [0,0,1] 12 38 38 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Tumbler_4a_Wall" [2522,-240,1294] [0,0,1] 80 38 41 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Tumbler_4b_Base" [2592,-240,1282] [0,0,1] 12 38 38 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "LongShelf_Tumbler_4b_Wall" [2592,-240,1294] [0,0,1] 80 38 41 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_Tumbler_1_Base" [2830,-270,770] [0,0,1] 12 38 38 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_Tumbler_1_Wall" [2830,-270,782] [0,0,1] 80 38 41 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_Tumbler_2_Base" [2925,-270,770] [0,0,1] 12 38 38 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_Tumbler_2_Wall" [2925,-270,782] [0,0,1] 80 38 41 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_Tumbler_3_Base" [3020,-270,770] [0,0,1] 12 38 38 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_Tumbler_3_Wall" [3020,-270,782] [0,0,1] 80 38 41 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_Tumbler_4_Base" [2830,-365,770] [0,0,1] 12 38 38 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_Tumbler_4_Wall" [2830,-365,782] [0,0,1] 80 38 41 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_Tumbler_5_Base" [2925,-365,770] [0,0,1] 12 38 38 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_Tumbler_5_Wall" [2925,-365,782] [0,0,1] 80 38 41 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_Tumbler_6_Base" [3020,-365,770] [0,0,1] 12 38 38 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_Tumbler_6_Wall" [3020,-365,782] [0,0,1] 80 38 41 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_WineGlass_1_Foot" [3280,-320,770] [0,0,1] 3 38 38 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_WineGlass_1_Stem" [3280,-320,773] [0,0,1] 100 4 4 10 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_WineGlass_1_BowlLow" [3280,-320,873] [0,0,1] 40 12 42 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_WineGlass_1_BowlTop" [3280,-320,913] [0,0,1] 60 42 33 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_WineGlass_2_Foot" [3390,-320,770] [0,0,1] 3 38 38 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_WineGlass_2_Stem" [3390,-320,773] [0,0,1] 100 4 4 10 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_WineGlass_2_BowlLow" [3390,-320,873] [0,0,1] 40 12 42 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_WineGlass_2_BowlTop" [3390,-320,913] [0,0,1] 60 42 33 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_WineGlass_3_Foot" [3500,-320,770] [0,0,1] 3 38 38 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_WineGlass_3_Stem" [3500,-320,773] [0,0,1] 100 4 4 10 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_WineGlass_3_BowlLow" [3500,-320,873] [0,0,1] 40 12 42 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_WineGlass_3_BowlTop" [3500,-320,913] [0,0,1] 60 42 33 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_WineGlass_4_Foot" [3610,-320,770] [0,0,1] 3 38 38 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_WineGlass_4_Stem" [3610,-320,773] [0,0,1] 100 4 4 10 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_WineGlass_4_BowlLow" [3610,-320,873] [0,0,1] 40 12 42 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "BackCtr_WineGlass_4_BowlTop" [3610,-320,913] [0,0,1] 60 42 33 20 m_Glass_Clear "07_Props_Bottles_Glassware"
mkCyl "Ice_Bucket" [1900,-1710,1050] [0,0,1] 200 95 110 28 m_Stainless_Steel "07_Props_Bar_Top"
mkCyl "Ice_Bucket_Bottle_Body" [1900,-1710,1110] [0,0,1] 200 37 37 18 m_Bottle_Glass_Green "07_Props_Bar_Top"
mkCyl "Ice_Bucket_Bottle_Shoulder" [1900,-1710,1310] [0,0,1] 40 37 14 18 m_Bottle_Glass_Green "07_Props_Bar_Top"
mkCyl "Ice_Bucket_Bottle_Neck" [1900,-1710,1350] [0,0,1] 45 14 14 12 m_Bottle_Glass_Green "07_Props_Bar_Top"
mkCyl "Ice_Bucket_Bottle_Foil" [1900,-1710,1380] [0,0,1] 25 15 15 12 m_Bottle_Cap_Foil "07_Props_Bar_Top"
mkCyl "Bar_WineGlass_1_Foot" [500,-1720,1050] [0,0,1] 3 38 38 20 m_Glass_Clear "07_Props_Bar_Top"
mkCyl "Bar_WineGlass_1_Stem" [500,-1720,1053] [0,0,1] 100 4 4 10 m_Glass_Clear "07_Props_Bar_Top"
mkCyl "Bar_WineGlass_1_BowlLow" [500,-1720,1153] [0,0,1] 40 12 42 20 m_Glass_Clear "07_Props_Bar_Top"
mkCyl "Bar_WineGlass_1_BowlTop" [500,-1720,1193] [0,0,1] 60 42 33 20 m_Glass_Clear "07_Props_Bar_Top"
mkCyl "Bar_WineGlass_2_Foot" [1100,-1720,1050] [0,0,1] 3 38 38 20 m_Glass_Clear "07_Props_Bar_Top"
mkCyl "Bar_WineGlass_2_Stem" [1100,-1720,1053] [0,0,1] 100 4 4 10 m_Glass_Clear "07_Props_Bar_Top"
mkCyl "Bar_WineGlass_2_BowlLow" [1100,-1720,1153] [0,0,1] 40 12 42 20 m_Glass_Clear "07_Props_Bar_Top"
mkCyl "Bar_WineGlass_2_BowlTop" [1100,-1720,1193] [0,0,1] 60 42 33 20 m_Glass_Clear "07_Props_Bar_Top"
mkCyl "Bar_WineGlass_3_Foot" [1700,-1720,1050] [0,0,1] 3 38 38 20 m_Glass_Clear "07_Props_Bar_Top"
mkCyl "Bar_WineGlass_3_Stem" [1700,-1720,1053] [0,0,1] 100 4 4 10 m_Glass_Clear "07_Props_Bar_Top"
mkCyl "Bar_WineGlass_3_BowlLow" [1700,-1720,1153] [0,0,1] 40 12 42 20 m_Glass_Clear "07_Props_Bar_Top"
mkCyl "Bar_WineGlass_3_BowlTop" [1700,-1720,1193] [0,0,1] 60 42 33 20 m_Glass_Clear "07_Props_Bar_Top"
mkCyl "Stool_1_Base" [600,-2200,0] [0,0,1] 12 220 200 32 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_1_Column" [600,-2200,12] [0,0,1] 610 28 28 20 m_Brass_Brushed "08_Bar_Stools"
mkTorus "Stool_1_Foot_Ring" [600,-2200,300] 200 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_1_Ring_Spoke_1" [600,-2200,300] [0.71,-0.71,0] 190 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_1_Ring_Spoke_2" [600,-2200,300] [-0.71,-0.71,0] 190 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_1_Ring_Spoke_3" [600,-2200,300] [-0.71,0.71,0] 190 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_1_Ring_Spoke_4" [600,-2200,300] [0.71,0.71,0] 190 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_1_Seat_Plate" [600,-2200,622] [0,0,1] 15 160 160 24 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_1_Seat_Cushion" [600,-2200,637] [0,0,1] 75 195 185 32 m_Leather_Seat_Tan "08_Bar_Stools"
mkCyl "Stool_1_Back_Post_1" [709.52,-2330.02,712] [0,0,1] 160 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_1_Back_Post_2" [658.29,-2359.69,712] [0,0,1] 160 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_1_Back_Post_3" [600,-2370,712] [0,0,1] 160 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_1_Back_Post_4" [541.71,-2359.69,712] [0,0,1] 160 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_1_Back_Post_5" [490.48,-2330.02,712] [0,0,1] 160 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_1_Backrest_Pad" [600,-2200,840] [0,0,1] 70 185 185 32 m_Leather_Seat_Tan "08_Bar_Stools"
mkCyl "Stool_2_Base" [1250,-2200,0] [0,0,1] 12 220 200 32 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_2_Column" [1250,-2200,12] [0,0,1] 610 28 28 20 m_Brass_Brushed "08_Bar_Stools"
mkTorus "Stool_2_Foot_Ring" [1250,-2200,300] 200 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_2_Ring_Spoke_1" [1250,-2200,300] [0.71,-0.71,0] 190 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_2_Ring_Spoke_2" [1250,-2200,300] [-0.71,-0.71,0] 190 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_2_Ring_Spoke_3" [1250,-2200,300] [-0.71,0.71,0] 190 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_2_Ring_Spoke_4" [1250,-2200,300] [0.71,0.71,0] 190 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_2_Seat_Plate" [1250,-2200,622] [0,0,1] 15 160 160 24 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_2_Seat_Cushion" [1250,-2200,637] [0,0,1] 75 195 185 32 m_Leather_Seat_Tan "08_Bar_Stools"
mkCyl "Stool_2_Back_Post_1" [1359.52,-2330.02,712] [0,0,1] 160 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_2_Back_Post_2" [1308.29,-2359.69,712] [0,0,1] 160 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_2_Back_Post_3" [1250,-2370,712] [0,0,1] 160 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_2_Back_Post_4" [1191.71,-2359.69,712] [0,0,1] 160 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_2_Back_Post_5" [1140.48,-2330.02,712] [0,0,1] 160 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_2_Backrest_Pad" [1250,-2200,840] [0,0,1] 70 185 185 32 m_Leather_Seat_Tan "08_Bar_Stools"
mkCyl "Stool_3_Base" [1900,-2200,0] [0,0,1] 12 220 200 32 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_3_Column" [1900,-2200,12] [0,0,1] 610 28 28 20 m_Brass_Brushed "08_Bar_Stools"
mkTorus "Stool_3_Foot_Ring" [1900,-2200,300] 200 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_3_Ring_Spoke_1" [1900,-2200,300] [0.71,-0.71,0] 190 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_3_Ring_Spoke_2" [1900,-2200,300] [-0.71,-0.71,0] 190 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_3_Ring_Spoke_3" [1900,-2200,300] [-0.71,0.71,0] 190 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_3_Ring_Spoke_4" [1900,-2200,300] [0.71,0.71,0] 190 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_3_Seat_Plate" [1900,-2200,622] [0,0,1] 15 160 160 24 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_3_Seat_Cushion" [1900,-2200,637] [0,0,1] 75 195 185 32 m_Leather_Seat_Tan "08_Bar_Stools"
mkCyl "Stool_3_Back_Post_1" [2009.52,-2330.02,712] [0,0,1] 160 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_3_Back_Post_2" [1958.29,-2359.69,712] [0,0,1] 160 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_3_Back_Post_3" [1900,-2370,712] [0,0,1] 160 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_3_Back_Post_4" [1841.71,-2359.69,712] [0,0,1] 160 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_3_Back_Post_5" [1790.48,-2330.02,712] [0,0,1] 160 7 7 10 m_Brass_Brushed "08_Bar_Stools"
mkCyl "Stool_3_Backrest_Pad" [1900,-2200,840] [0,0,1] 70 185 185 32 m_Leather_Seat_Tan "08_Bar_Stools"
mkCyl "Pendant_1_Canopy" [600,-1595,2710] [0,0,1] 25 60 60 24 m_Brass_Brushed "09_Lighting_Pendants"
mkCyl "Pendant_1_Cord" [600,-1595,1820] [0,0,1] 890 3 3 8 m_Black_Matte "09_Lighting_Pendants"
mkCyl "Pendant_1_Shade" [600,-1595,1600] [0,0,1] 220 150 35 32 m_Brass_Brushed "09_Lighting_Pendants"
mkCyl "Pendant_1_Bulb" [600,-1595,1620] [0,0,1] 60 45 30 20 m_LED_Warm_3000K "09_Lighting_Pendants"
mkCyl "Pendant_2_Canopy" [1250,-1595,2710] [0,0,1] 25 60 60 24 m_Brass_Brushed "09_Lighting_Pendants"
mkCyl "Pendant_2_Cord" [1250,-1595,1820] [0,0,1] 890 3 3 8 m_Black_Matte "09_Lighting_Pendants"
mkCyl "Pendant_2_Shade" [1250,-1595,1600] [0,0,1] 220 150 35 32 m_Brass_Brushed "09_Lighting_Pendants"
mkCyl "Pendant_2_Bulb" [1250,-1595,1620] [0,0,1] 60 45 30 20 m_LED_Warm_3000K "09_Lighting_Pendants"
mkCyl "Pendant_3_Canopy" [1900,-1595,2710] [0,0,1] 25 60 60 24 m_Brass_Brushed "09_Lighting_Pendants"
mkCyl "Pendant_3_Cord" [1900,-1595,1820] [0,0,1] 890 3 3 8 m_Black_Matte "09_Lighting_Pendants"
mkCyl "Pendant_3_Shade" [1900,-1595,1600] [0,0,1] 220 150 35 32 m_Brass_Brushed "09_Lighting_Pendants"
mkCyl "Pendant_3_Bulb" [1900,-1595,1620] [0,0,1] 60 45 30 20 m_LED_Warm_3000K "09_Lighting_Pendants"
)

-- ceiling is kept on its own layer and hidden so the viewport can orbit from above
(getLayer "01_Architecture_Ceiling").isHidden = true

-- Cameras
local tPersp = Targetobject name:"Cam_Persp_Target" pos:[1700,-1200,1000]
local cPersp = Targetcamera name:"Cam_Perspective" fov:55 pos:[4300,-4600,1650] target:tPersp
local tFront = Targetobject name:"Cam_Front_Target" pos:[1940,0,1370]
local cFront = Targetcamera name:"Cam_Elevation_Back_Wall" fov:45 pos:[1940,-5200,1370] target:tFront
local tBar = Targetobject name:"Cam_Bartender_Target" pos:[1250,-1700,900]
local cBar = Targetcamera name:"Cam_Bartender_View" fov:60 pos:[2300,-700,1550] target:tBar
for o in #(tPersp,cPersp,tFront,cFront,tBar,cBar) do (getLayer "10_Cameras").addNode o

-- soft daylight + warm fill (renderer independent)
try (
  local sun = Omnilight name:"Key_Light" pos:[2500,-3500,2600] multiplier:0.9 rgb:(color 255 244 230) castShadows:true
  local fill = Omnilight name:"Fill_Light" pos:[-800,-2500,1800] multiplier:0.35 rgb:(color 230 236 255)
  for o in #(sun,fill) do (getLayer "09_Lighting_Pendants").addNode o
) catch ()

enableSceneRedraw()
viewport.setLayout #layout_1
viewport.setType #view_persp_user
max zoomext sel all
redrawViews()
format "Bar unit built: % objects\n" 674
)
