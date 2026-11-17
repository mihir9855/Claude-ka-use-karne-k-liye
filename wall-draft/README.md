# WallDraft

A small CAD-style app for measuring flats, bungalows and offices on site: draw the floor plan by hand, then open any wall to draft its elevation with doors, windows, ventilators and openings.

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

Open `index.html` in any browser (phone or computer). No install, no build, works offline. Work is saved on the device automatically.

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
