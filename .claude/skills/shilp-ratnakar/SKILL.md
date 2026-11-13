---
name: shilp-ratnakar
description: Complete Gujarati summary and calculation methods of "Shilp Ratnakar" (શિલ્પ રત્નાકર) by Shilpashastri Narmadashankar Muljibhai Sompura — Ratna 1–7 — for temple (prasad / પ્રાસાદ) architecture. Use for any question or calculation about Hindu/Jain temple design: gaj/angul units, Ayadi 21 angas (aay, vyay, nakshatra, gan, rashi…), kurmashila, bhit, pith, jagati, mandovar, garbhagruh, dwarshakha, mandap, stambh, murti/jaladhari/drishti, shikhar, shrung, dhwaj, nirdosh, and the 25 Keshari-adi and 25 Tilaksagar-adi prasads; also for converting results to feet-inch / metre / mm, or building an app/calculator on these rules.
---

# Shilp Ratnakar — reference skill

The full source notes are in [reference.md](reference.md) (Gujarati, 620 lines). Always read the
relevant section from it before answering — don't answer rules or numbers from memory. Cite
ratna, page (પૃ.) and shlok (શ્લોક) numbers as given there.

## Key conventions (from the notes)

- Shloks are not reproduced; only their meaning and calculations.
- Units: **1 gaj = 24 angul = 18″ (1′-6″) = 457.2 mm; 1 angul = ¾″ = 19.05 mm; 1 dora = ⅛ angul ≈ 2.4 mm.**
  If the site gaj differs: value × (site gaj ÷ 24) (mm = angul × site-gaj-mm ÷ 24).
- G = prasad width in gaj; most rules give the result in angul with step increments
  ("1 gaj = X; up to N gaj +Y per gaj …"). Show working step by step, then convert to ft-in and mm.
- Missing pages (no information): Ratna 2 p. 65–68; Ratna 4 p. 117–119 and 137; Ratna 6 p. 222, 225–228.
  Ratna 8 is not in the available pages. Say so instead of guessing.
- Where the notes flag doubt (e.g. "ખાતરી કરવી" = verify), repeat that caveat.

## Index (line numbers in reference.md)

| Lines | Ratna | Topic | Pages |
|---|---|---|---|
| 1–18 | — | Title, notes, contents table | — |
| 19–107 | 1 પ્રથમ | Sutradhar, muhurat, gaj; Ayadi 21 angas: aay, kshetrafal, nakshatra, gan, vyay, tara, nadi, rashi, ghar naam, anshak, lagna/tithi/var/karan/yog, varg, tattva, ayushya, mel; tables | 3–40 |
| 108–168 | 2 દ્વિતીય | Prasadotpatti; rachna vidhi; calc rules (kurmashila, kurma, disha shila, bhit, pith, mahapith 53 bhag); modern units (l.145); jagati uday (l.158) | 41–74 |
| 169–240 | 3 તૃતીય | Mandovar height, 144-bhag mandovar, other mandovars, nasika/garbhagruh/wall/bhram, part 2 (dwarshakha etc.) | 75–112 |
| 241–310 | 4 ચતુર્થ | Mandap basics, vedika/rangbhumi/pratoli, mandap kul, stambh, part 2, murti vidhan, jaladhari/ling/drishti | 113–170 |
| 311–403 | 5 પંચમ | Shikhar: jati & plan, shrung, skandh/dhwaj, gavaksh/sinh/shuknas, andak, tilak, rekha/padhro/bhadra (l.348), height (l.352); nirdosh (l.377); gruh (l.387); Nandan prasad | 171–220 |
| 404–517 | 6 ષષ્ઠ | 25 Keshari-adi prasads (Keshari, Sarvatobhadra, Nandan … Airavat …); table of tal bhag / andak (l.512) | 221–260 |
| 518–620 | 7 સપ્તમ | Tilaksagar-adi prasads (22 listed, l.528) | 261–280 |

Find a topic quickly: `grep -n "<Gujarati term>" .claude/skills/shilp-ratnakar/reference.md`.

## Answering

- Reply in the language the user writes in (Gujarati / Hindi / English); keep technical terms in Gujarati.
- For calculations: state the rule and its source (ratna, page, shlok), compute in angul,
  then give ft-in and mm (and the site-gaj adjustment if the user's gaj is not 18″).
- If an app/calculator is being built from these rules, encode each rule as a data table
  (breakpoints + increment per gaj) with its source reference, and unit-test it against the
  worked examples in the notes (e.g. 25-gaj example in Ratna 2, l.~143).

## Active project

The owner is building a new app, **Brihad Temple Estimate** (temple part measurements + stone
CFT and cost from the garbhagruh size). Plan: `brihad-temple-estimate/PLAN.md` — read it first
when working on that app. The app must never show gaj or angul — only inches and feet (convert internally, 1 gaj = 18″); owner works in inches / feet-inch; stone = L × W × H × Nang ÷ 1728 CFT,
cost = CFT × rate, no wastage. Default rules will come from the owner's CAD drawings.
