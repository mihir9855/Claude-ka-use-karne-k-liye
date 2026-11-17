# WallDraft

A small CAD-style app for measuring flats, bungalows and offices on site: draw the floor plan by hand, then open any wall to draft its elevation with doors, windows, ventilators and openings.

## Floor plan (Plan view)
- **✎ Draw walls**: tap each corner, or **sketch a room with your finger**. The sketch is straightened into walls (90°/45° lock with ⟂). Finish at the first corner and a room is made with its area.
- While drawing, **type a length and tap an arrow** (← ↑ ↓ →) to place the next corner exactly. On a computer, just type the number.
- **▭ Room**: type a room's width and depth; place it next to the selected room so they share a wall.
- Lines are the **inside faces** (what you measure with the tape); wall thickness is drawn outside the room. Corners are mitred, back-to-back walls share door openings.
- Tap a wall to select it and type its exact length (everything beyond it moves along), change thickness or height, or add a door/window to it. Double-tap a wall, or press "Open wall elevation", to see and edit that wall in elevation.
- Drag corners or a selected room; they snap to other corners and to a wall-thickness gap.
- Room list with area (m², ft²), perimeter (skirting) and total carpet area.

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
