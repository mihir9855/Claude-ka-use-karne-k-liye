# WallDraft

A small CAD-style app for drafting wall elevations from site measurements, with doors, windows, ventilators and plain openings.

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
- Undo / redo (Ctrl+Z / Ctrl+Y), arrow keys nudge the selected opening, Delete removes it.
