# Bar Unit 3D model (WD-06, Anahata Villas, Chavda Farm House)

This is a 3D model of the bar unit from drawing **WD-06 "Bar Unit Detail"** by Nirja Architects (scale 1:10, dated 02.11.2026). All dimensions are in millimetres and follow the drawing.

| File | Use |
|---|---|
| `bar_unit.ms` | **3ds Max**: go to *Scripting → Run Script…* and pick this file. It builds the whole model natively, with 674 objects, layers, Physical materials, UVW mapping and 3 cameras. |
| `bar_unit.obj` + `bar_unit.mtl` | Neutral mesh you can import into 3ds Max, SketchUp, Blender or Rhino. |
| `build_bar_model.py` | Source of the model. Change a dimension here and run `python3 build_bar_model.py` to regenerate both files. |
| `render_preview.py` | Makes the PNG previews in `previews/`. |

## What is modelled (from the drawing)

**Back counter, 3880 long (1250 + 1380 + 1250) × 350 deep**, with a 120 service/cladding zone behind it:
- 75 plinth, recessed, with an LED strip ("indirect light below").
- 8 veneer shutters, 675 high, in 4 equal (EQ) parts per bay, with a brass gola handle channel.
- An under-counter glass-door cooler in the left bay, with a louvred heat-vent kick.
- A 20 mm Kesariyaji Green glossy stone top with a 40 mm front edge and a 100 mm upstand.
- A stainless bar trough / ice well with a slatted grate, a rubber bar mat and a gooseneck tap in the middle bay.

**Back wall cladding:**
- Kesariyaji Green stone, 1395 high, in 3 slabs.
- A long glass shelf at +500, 1380 wide, with an LED channel.
- 12 small glass bottle shelves, each 150 wide, staggered on the 150/158 grid at the drawing levels (195 / 350 / 350 spacing). They have brass brackets and stop rails.
- A 570 high veneer bulkhead with an M.S. grill (25×25 frame and flats) in the middle bay, and an LED cove below it.
- The veneer mural panel to the right.

**Return platform, 650 wide (550 + 550):**
- A wine cooler (bottles on racks) and a beer cooler.
- A louvre/jali end panel for releasing cooler heat, and a stone top.

**Bar table, 1850 long, 450 deep (225 work top + 150 body + 75 overhang):**
- A raised stone bar top.
- A fluted veneer front, an LED strip under the overhang, open shelves and a speed rail on the bartender side.
- A brass foot rail.

**Props:** bottles, glassware, ice bucket, 3 bar stools and 3 brass pendants.

## Assumptions (the drawing has no section, so check these with the architect)

- **Raised bar top height is 1050.** The bartender work top, return and back counter are 770, which comes from 75 + 675 + 20 in the elevation.
- **The bulkhead projects 250 from the wall.** The middle feature in the plan is read as a bar trough / ice well.
- **The bar front is fluted veneer.** The drawing does not give the finish for the front face.
- **The mural panel uses a flat placeholder colour.** Load the mural image into `Veneer_Mural_Painting` → Base Color Map.

The ceiling is on the layer `01_Architecture_Ceiling` and is hidden by default. Unhide it before you render interior views.
