# WallDraft

A small CAD-style app for measuring flats, bungalows and offices on site: draw the floor plan by hand, then open any wall to draft its elevation with doors, windows, ventilators and openings.

## Made for phones
- ▦ All tools (first button in the bottom bar) shows every feature as big buttons: walls, rooms, doors and windows, columns and beams, plan and wall measuring, view and units, undo/redo, and shortcuts to rooms, history and sharing.
- ⊞ Room in the bottom bar adds a room by typing its inside size.
- Full-screen drawing, tools in a bottom bar (thumb reach), details in a pull-up sheet that opens to whatever you tap.
- Units picker on the top bar: mm, cm, m, feet, feet-inch, inch. You can type any unit in any field (4.2m, 10.5ft, 10'6").

## Moving things & measuring on the plan
- Press and drag a door, window, column, beam or measurement straight away (no need to tap first).
- Doors/windows slide along their wall and hop onto another wall when you drag over it; they snap to wall ends, the centre and other openings.
- Columns snap to wall corners and along walls and turn to match the wall; beams snap onto columns, corners and wall centre lines.
- "Door, window & column positions" draws running dimensions outside each wall (corner → door → corner) that update while you drag.
- ↔ Measure: drag or tap between any two points (corners, inside corners, wall faces, door edges, columns). Drag a measurement to move its line; change its text or flip it in the sheet.

## Columns & beams
- ▣ Column: tap to place; snaps to wall corners (centre of the walls) and along walls. Sizes 230×230 … 450×450, round, or imperial 9"×9" … 18"×18". Rotate, resize, drag.
- ┅ Beam: drag, or tap its ends; snaps to columns and wall corners. Width × depth presets; drag the beam or its ends.
- Wall elevations show columns standing in the wall and beams above it (with beam depth). Schedule and "Copy measurements" list them.
- Tap a selected beam/column again to select the wall underneath.

## Floor plan (Plan view)
- Opens on a **blank black CAD canvas** (◐ switches to a white one). "Start blank drawing" clears it; "Load example flat" shows a sample.
- Wall tools: **✎ Hand** (draw with your finger, straightened automatically), **╱ Line** (tap corners, or drag one wall), **▭ Box** (drag corner to corner for four walls, or "Type size…").
- Pick the **wall thickness** on the drawing bar (75–350 mm) before drawing; change any wall later.
- **Walls merge automatically**: touching, crossing or overlapping walls are joined and drawn as one solid wall; straight pieces become one wall; a wall drawn across a room splits it into two rooms.
- **Rooms are found automatically** from any closed area, with inside size, area (m², ft²), perimeter and total carpet area. Names are kept when you edit.
- The line you draw is the room's inside face (thickness goes outside) or, if you choose, the wall centre. Walls between two rooms stay as one shared wall.
- While drawing a line, type a length and tap an arrow (← ↑ ↓ →) for exact corners. Tap a wall to type its exact inside length, thickness, height, or add a door/window. Double-tap a wall to open its elevation.
- Keys: D hand, W line, B box, O angle lock, R room by size, Esc stop.

## Wall elevation (Wall view)

Open `WallDraft.html` (same as `index.html`) in any browser (phone or computer). No install, no build, works offline. Work is saved on the device automatically.

## What it does
- Several walls per project (length, height, thickness).
- Openings: door, window, ventilator, plain opening. Enter width, height, distance from left **or** right end, sill or head height. Doors have hinge side and opening direction.
- Drawing updates live: elevation with chain dimensions, overall length and height, sill/head heights for every opening, and a plan strip with door swings.
- Drag openings on the drawing to move them (windows and vents also move up/down). Pinch or scroll to zoom, drag empty space to pan.
- Checks: opening past the wall end, above the wall top, or overlapping another opening.
- Units: mm, cm, m, inch, feet-inch. Type `900+300`, `4.2m`, `5'6"`, `5-6`, `5' 6 1/2"`.
- Areas per wall (gross, openings, net in m² and ft²) and a door & window schedule.
- Share: drawing image (PNG), SVG file, measurements as text (for WhatsApp), JSON backup and restore.
- **Dimension tools** (toolbar): ↔ horizontal, ↕ vertical, ⤡ aligned (slanted), ▽ level mark (height from floor), ∠ angle. Tap points on the drawing; a dimension attached to an opening moves with it. Drag a dimension to move its line, flip it, or replace its text (EQ, CLR…). Automatic dimensions (running, overall, sill/head heights, plan) can be switched on or off.
- **Snap**: on/off (toolbar or S key), grid step, and snap to corners & ends, midpoints & centres, edges, grid. "Line up openings" makes a dragged window stick to the head/sill/edge of other openings, with pink guide lines.
- **Undo / redo**: big ↶ ↷ buttons, Ctrl+Z / Ctrl+Y, two-finger tap = undo, three-finger tap = redo, an Undo button on every delete message, and a History list where you tap any step to go back to it. History is kept after closing the app.
- Keys: H V A L G pick a dimension tool, Esc ends it, F fits the drawing, arrow keys nudge the selected opening, Delete removes the selection.
