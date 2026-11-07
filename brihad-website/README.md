# Brihad Temple website: two new versions

| Folder | What it is |
| --- | --- |
| `v1-refreshed/index.html` | **Website 1.** Your current site, same layout and features, with a refreshed look |
| `v2-redesign/index.html` | **Website 2.** A full redesign: new layout, new sections, built mobile-first |
| `original/index.html` | Your current site, as uploaded (the source both versions are built from) |
| `previews/` | Screenshots of both versions (desktop, phone, Gujarati) |

## How to put one live

Each version is a single `index.html`, like your current site. Copy it into your website folder, next to your existing
`images/` folder, replacing the old `index.html`. The project galleries, hero photos, home-temple photos and favicons
still load from `images/`, using the same paths as before.

Contact details are at the top of each file in `window.BRIHAD_CONTACT`, the same as now.

## What changed

**Website 1 (refreshed)**
- Hero: two buttons ("See our temples", "Talk on WhatsApp"), a faint carved-lattice background, and a gold frame on the arch photo
- A dark band of your stones and crafts that scrolls slowly (Dhrangadhra sandstone, Ambaji marble, Roopkaam…)
- Numbered gold labels above every section title
- Services: numbers, gold top line on hover, illustrations on an arch tile
- How We Work: large faint step numbers. Studio numbers in a terra gradient
- The floating WhatsApp/Call buttons step aside while the hero buttons are on screen, so they never overlap
- Everything else stays as it is: Gujarati switch, slideshow, photo viewer, map, loading screen

**Website 2 (redesign)**
- Full-screen dark hero: big title, a gold mantra, five completed temples taking turns in the arch, and a rotating "Since 1999" seal
- A numbers card (50+, 100+, 10+, years) overlapping the hero, plus the scrolling stones band
- Projects as a grid of arch cards (Champapuri large, with its description). Tap any card to open the photo viewer
- Home Temples: three numbered points and a WhatsApp button
- Services: four cards with your illustrations
- The Studio: a dark section with the family story told as a timeline, the three crafts, and Vision and Mission
- How We Work: four numbered steps
- Contact: call, second number, WhatsApp and email tiles, with the map and directions
- A full-screen menu on phones, floating WhatsApp/Call buttons, and the Ganesh loading screen once per visit
- Gujarati switch, using your existing Gujarati lines. Translations for the new lines are in `GU_NEW`; please have a
  Gujarati speaker check them

## Rebuilding

Both pages are generated from `original/index.html`:

```bash
python3 build_v1.py   # writes v1-refreshed/index.html
python3 build_v2.py   # writes v2-redesign/index.html (layout and styles live in v2-template.html)
```

If you change the original site (new project, new photos, new Gujarati lines), replace `original/index.html` and run
both scripts again.
