# Brihad Temple Estimate — App Plan (Draft 1)

> Status: **plan only, no code yet.** Base: "Shilp Ratnakar" notes (`.claude/skills/shilp-ratnakar/reference.md`).
> Default rules will be fixed after the owner shares his CAD drawings. Until then the app uses the
> temporary defaults in section 8 and every number is to be refined later.

## 1. Hetu (Purpose)

Mandir na darek bhaag nu **maap** ane tena **stone ni cubic feet + kharch** kadhvu.
Garbhagruh nu maap nakho → option ma thi bhaag select karo → te bhaag na badha maap ane stone CFT male.

- Vaparnar: fakt owner (ek j user). Login ni jarur nathi.
- Device: **computer + phone** (internet vagar pan chale).
- Bhasha: Gujarati; shilp na shabdo Gujarati ma.

## 2. Unit na niyam

| Vastu | Kevi rite batavvu |
|---|---|
| Darek maap | **Inch mukhya**, saathe feet-inch (dakhla: `162″ = 13′-6″`) |
| Lambai jevi vastu (thar, pattika, chhajju, kathedo) | **Running feet (RFT)** |
| Sapati (farsh, chhat, vitan, mandap) | **Sq. ft** |
| Stone | **Cubic feet (CFT)** |
| Rounding | **Fakt aakha inch, hamesha upar.** Koi pan fraction (⅛″ pan) hoy to aakho 1″ umero: 11⅛″ → 12″, 11½″ → 12″, 12″ → 12″. Kyay ½″, ¼″, ⅛″ nahi dekhay. |

Rounding kevi rite lagu thay:
- Andar ni ganatari chokkas (exact) thay; **fakt batavti vakhate** darek maap upar na aakha inch ma.
- **Stone CFT rounded maap thi j** gana (L × W × H × Nang, aakha inch) — pathar e j maap thi kapay chhe.
- Ek bhaag na thar (dakhla mandovar 144 bhaag) darek upar round thay, etle temno sarvalo kul unchai karta 1–2″ vadhi shake; app tyaa nondh batave.

**App ma kyay gaj ke angul nahi dekhay — fakt inch ane feet.** Input, output, chitra, PDF, Excel badhe inch/feet.
Chopadi na niyam gaj-angul ma chhe, etle app **andar thi** te inch ma badli nakhe (1 gaj = 18″, 1 angul = ¾″ — fakt code ma, user ne nahi dekhay).
Niyam pan feet ma lakhaay: dakhla "prasad 15′ sudhi darek 1′-6″ e +1½″".

## 3. Input (ek screen)

1. **Garbhagruh nu andar nu maap** (pahodai × undai, inch ke feet-inch). Mostly chorus.
2. **Prasad ni jati** — Nagar, Latin, Sandhar, Bhumij, Dravid, Vimana, Mishrak, Pushpak, Valabhi…
3. **Prasad nu naam** — Shashth ratna na 25 (Keshari… Meru) + Saptam ratna na 22 (Tilaksagar…). Aana thi **tal bhag** (8/10/12/14/16/18/22) ane andak nakki thay.
4. **Nirandhar / Sandhar** (bhram vagar / sathe).
5. **Jyeshth / Madhyam / Kanishth**.
6. **Dev** (Shiv, Vishnu, Jain, Devi…) — dwar, drishti, pratima, shakha, dwar disha na niyam aana par badlay chhe.
7. **Rate (₹ per CFT)** — kharch maate.

Garbhagruh parthi prasad ni bahar ni pahodai (karna thi karna, kumbha na mul par):
- Deewal jadai = prasad pahodai na **⅕ / 1⁄5½ / ⅙** (pathar, Tritiya ratna shlok 108–109).
- Garbhagruh = P − 2 × deewal → **P = Garbhagruh × 5⁄3** (⅕ deewal) athva **× 3⁄2** (⅙ deewal).
- App banne batavshe; owner ni CAD parthi default nakki thashe.
- Aakhi app prasad ni pahodai P (inch) parthi chale chhe.

## 4. Vaparvani rit (selection)

Daabi baju bhaag nu **jhaad (tree)**, neeche thi upar. Je select karo te j jamani baju khule:

```
Paya / Khatmuhurt   ─ Kurmashila, Kurma, Disha shila (8), Dharani
Bhit                ─ Bhit 1, 2, 3, 4
Pith                ─ Mahapith 53 / Kamad 23 / Karna 16 — thar pramane
Jagati              ─ Uday, 28 bhaag na thar, bhramni, sopan, pranal
Mandovar            ─ 144 / Meru 198 / 108 / 27 / Chaturmukh 57 / Samanya — thar pramane
Garbhagruh          ─ Deewal, bhram, bhram deewal, stambh, ghummat
Dwar                ─ Unchai, pahodai, shakha (3/5/7/9), umbar, shankhavat, otarang
Pratima / Sinhasan  ─ Pratima, sinhasan sthan, drishti, jaladhari, ling
Mandap              ─ Gudh / Nritya / Rang mandap, chowki, shringar chowki, pad vibhag
Stambh              ─ Kumbhi, stambh, bharnu, sharu, paat, chhajju
Ghummat / Vitan     ─ Karnadardarika, rupkanth, kol, unchai
Shikhar             ─ Rekha, padhro, bhadra, skandh, shrung, urushrung, shuknas, sinh
Amalsaro / Kalash   ─ Griva, amalsaro, chandrika, kalash bhaag
Dhwajdand           ─ Lambai, jadai, markati, pataka, dhwajpurush
Bijaa               ─ Balanak, deri (24/52/72), parikota, sopan
```

Darek bhaag ma be tab:
- **Maap** — unchai, pahodai, nikalo, bhaag (inch + ft-in) + nanu chitra + source (ratna, pu., shlok).
- **Stone** — L × W × H × Nang = CFT, × rate = ₹.

Upar **"Badhu" summary**: bhaag pramane CFT ane ₹, ane kul.

## 5. Stone ni ganatari (owner ni rit)

```
CFT = Lambai(″) × Pohdai(″) × Unchai(″) × Nang ÷ 1728
Kharch = CFT × Rate
```
- Ghadai no bagad **nathi** ganvano. Max block size **nathi** jovano (moto block kapine carving).
- Aakhu mandir ek j pathar (dakhla marble). Ek project = ek rate.
- Thar (mandovar, pith, jagati) maate: **L = te thar ni bahar ni lambai** (tal bhag na karna, pratiratha, bhadra na nikala sathe), **W = deewal ma pravesh + nikalo**, **H = thar ni unchai**.
- Darek line ma owner haath thi L/W/H/Nang badli shake (override), ane potani line umeri shake.
- Khuna (corner) bev vaar na ganay te maate app ek baju ni lambai purepuri ane saame ni baju ma deewal jadai ochhi karshe — **CAD parthi confirm karvanu**.

## 6. Screens

1. **Projects** — mandir ni list, navo project, copy.
2. **Input** — section 3.
3. **Bhaag** — tree + Maap/Stone tab.
4. **Summary** — CFT, ₹, RFT, sq.ft; PDF ane Excel export.
5. **Setting** — default rit (section 8), rounding.
6. **Rit sarkhamani** — ek bhaag ni badhi rit sathe (dakhla mandovar rit 1–4).

## 7. Niyamo kevi rite rakhvaa (code vakhte)

- Darek niyam ek **table** tarike, chopadi ni jem (andar gaj-angul), pan app tene inch ma badline j batave; saathe source (ratna, pu., shlok).
- Chopadi na udaharan thi **test** (dakhla Dwitiya ratna nu 37′-6″ prasad nu udaharan; Tritiya ratna na feet koshtak).
- Jyaa chopadi ma shanka ke khutatu hoy tyaa app ⚠ chetavani batave.

## 8. Kamchalau default rit (CAD aavya pachhi badlashe)

| Bhaag | Default (hamna) | Biji rit |
|---|---|---|
| Deewal jadai | ⅕ | 1⁄5½, ⅙ |
| Pith | Paddhati 1 (shl. 158–160) | Paddhati 2 |
| Jagati uday | Aparajit / Diparnav | Prasad Mandan |
| Mandovar unchai | Rit 2 (shl. 5–6) | Rit 1, 3, 4 |
| Mandovar bhaag | 144 bhaag | 198, 108, 27, 57, samanya |
| Dwar unchai | Nagaradi rit 1 (shl. 128–130) | Rit 2, Bhumij, Dravid |
| Mandap maap | Prasad pramane (7′-6″–15′ ×1½, 15′–75′ ×1¼) | ×1 … ×2 |
| Stambh pahodai | Rit 2 (shl. 61–63) | Rit 1 (P÷10…÷14) |
| Stambh unchai | Rit 1, 8 bhaag | Rit 2, 9 bhaag |
| Shikhar rekha unchai | Madhyam ×1⅓ | ×1¼, ×1½ |

## 9. Chopadi ma khutatu / shankaspad (app ⚠ batavshe)

- Dwitiya pu. 65–68 (jagati, shl. 125–147) nathi → "Jain Shilp Vidhan-3" ni paddhati.
- Int ni kurmashila jadai W÷6 ke W÷2 — khatri karvi.
- Mandovar rit 3: 52′-6″ thi 60′ prasad vachche kood (chhapya mujab).
- Pratima/sinhasan koshtak lakhan thi ulatu.
- Chaturth pu. 117–119, 137; Shashth pu. 222, 225–228 nathi; Ashtam ratna nathi.
- Saptam ratna: Som, Vijay, Trailokya tilak na fakt naam.

## 10. Tabakkaa (Phases)

1. **Phase 1:** Input + garbhagruh → prasad; paya, bhit, pith, jagati, mandovar, deewal, dwar; stone CFT; summary.
2. **Phase 2:** Mandap, chowki, stambh, ghummat, pratima, drishti, jaladhari.
3. **Phase 3:** Shikhar (rekha, shrung, shuknas, amalsaro, kalash, dhwajdand) — 25 + 22 prasad na tal bhag pramane.
4. **Phase 4:** Chitra (plan/elevation), PDF/Excel, deri, balanak, parikota.

## 11. Owner pase thi joie chhe

- [ ] CAD drawing (default rit nakki karva).
- [ ] Deewal jadai ⅕ ke ⅙ — kai vaparo chho.
- [ ] Thar ni W (jadai) kevi rite gano chho — fakt nikalo ke deewal ma pravesh sathe.
- [ ] Navi app maate navo GitHub repo (naam suggest: `brihad-temple-estimate`).
