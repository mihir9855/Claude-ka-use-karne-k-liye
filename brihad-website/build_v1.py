"""Website 1: the current Brihad site, kept intact and given a refreshed look.

Reads original/index.html and writes v1-refreshed/index.html. Everything the site
already does (Gujarati switch, project slideshow, photo viewer, WhatsApp/Call
buttons, map, loading screen) stays as it is; this only adds a style layer and a
few new pieces of markup.
"""
import os

SRC = 'original/index.html'
OUT = 'v1-refreshed/index.html'

s = open(SRC, encoding='utf-8').read()


def swap(old, new, count=1):
    global s
    assert s.count(old) == count, (old[:60], s.count(old))
    s = s.replace(old, new)


# ---------- 1. hero: two clear actions under the facts ----------
WA_ICON = ('<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.5c-1.7 0-3.3-.5-4.7-1.3l-.3-.2-3.5.9.9-3.4-.2-.4C3.3 15.7 2.8 13.9 2.8 12 2.8 6.9 6.9 2.8 12 2.8s9.2 4.1 9.2 9.2-4.1 9.5-9.2 9.5zM12 1C5.9 1 1 5.9 1 12c0 1.9.5 3.8 1.5 5.5L1 23l5.6-1.5c1.6.9 3.5 1.4 5.4 1.4 6.1 0 11-4.9 11-11S18.1 1 12 1z"/></svg>')
swap('<ul class="hero-facts"><li data-i18n="fact1">Hand-carved stone</li><li data-i18n="fact2">Any stone</li><li data-i18n="fact3">Temples across India</li></ul>',
     '<ul class="hero-facts"><li data-i18n="fact1">Hand-carved stone</li><li data-i18n="fact2">Any stone</li><li data-i18n="fact3">Temples across India</li></ul>\n'
     '   <div class="hero-cta"><a class="btn btn-gold" href="#projects"><span data-i18n="heroCta1">See our temples</span> <span aria-hidden="true">→</span></a>'
     f'<a class="btn btn-ghost wa-link" id="heroWa" href="#contact" target="_blank" rel="noopener">{WA_ICON}<span data-i18n="heroCta2">Talk on WhatsApp</span></a></div>')

# ---------- 2. a band of the stones we carve, between the hero and the projects ----------
STONES = [('stn1', 'Dhrangadhra Sandstone'), ('stn2', 'Ambaji Marble'), ('stn3', 'Bansi Paharpur Pink Sandstone'),
          ('stn4', 'Roopkaam'), ('stn5', 'Nakshikaam'), ('stn6', 'Ghaatkaam'), ('stn7', 'Stone alone, never metal')]
items = ''.join(f'<li data-i18n="{k}">{t}</li>' for k, t in STONES)
swap('<!-- ===================== PROJECTS ===================== -->',
     '<!-- ===================== STONES BAND ===================== -->\n'
     '<section class="stones-band dark" data-tone="dark" aria-label="Stones and crafts">'
     f'<div class="sb-track"><ul>{items}</ul><ul aria-hidden="true">{items}</ul></div></section>\n\n'
     '<!-- ===================== PROJECTS ===================== -->')

# ---------- 3. small numbered eyebrow above each section title ----------
for sec_id, num, key, label in [('projects', '01', 'eyProjects', 'Our work'), ('home-temples', '02', 'eyHome', 'For your home'),
                                ('services', '03', 'eyServices', 'What we do'), ('studio', '04', 'eyStudio', 'Our story'),
                                ('process', '05', 'eyProcess', 'The path')]:
    marker = f'<section id="{sec_id}" '
    i = s.index(marker)
    j = s.index('<div class="sec-head reveal"><div>', i) + len('<div class="sec-head reveal"><div>')
    s = s[:j] + f'<p class="eyebrow"><b>{num}</b><span data-i18n="{key}">{label}</span></p>' + s[j:]

# ---------- 4. numbers on the four services and the four steps ----------
for n in range(1, 5):
    swap(f'<h3 data-i18n="svc{n}T">', f'<span class="svc-num" aria-hidden="true">0{n}</span><h3 data-i18n="svc{n}T">')
    swap(f'<h3 data-i18n="s{n}T">', f'<span class="step-num" aria-hidden="true">0{n}</span><h3 data-i18n="s{n}T">')

# ---------- 5. hero WhatsApp button gets the same link as the floating one ----------
swap("if(phone||waUrl)$('quick').hidden=false;",
     "if(phone||waUrl)$('quick').hidden=false;\n"
     "if($('heroWa')){if(waUrl)$('heroWa').href=waUrl;else{$('heroWa').removeAttribute('target');$('heroWa').classList.remove('wa-link')}}\n"
     "/* the floating buttons step aside while the hero's own buttons are on screen, so they never cover them */\n"
     "{const hc=document.querySelector('.hero-cta'),q=$('quick');if(hc&&q)new IntersectionObserver(es=>q.classList.toggle('away',es[0].isIntersecting),{threshold:0}).observe(hc)}")

# ---------- 6. Gujarati for every new line ----------
GU_EXTRA = {
    'heroCta1': 'અમારાં મંદિરો જુઓ', 'heroCta2': 'WhatsApp પર વાત કરો',
    'stn1': 'ધ્રાંગધ્રા સેન્ડસ્ટોન', 'stn2': 'અંબાજી આરસ', 'stn3': 'બંસી પહાડપુર ગુલાબી સેન્ડસ્ટોન',
    'stn4': 'રૂપકામ', 'stn5': 'નકશીકામ', 'stn6': 'ઘાટકામ', 'stn7': 'ફક્ત પથ્થર, ક્યારેય ધાતુ નહીં',
    'eyProjects': 'અમારું કામ', 'eyHome': 'તમારા ઘર માટે', 'eyServices': 'અમે શું કરીએ છીએ',
    'eyStudio': 'અમારી વાત', 'eyProcess': 'કામની રીત',
}
import json
swap('<script>\n/* ================= GUJARATI TRANSLATION',
     f'<script>window.BRIHAD_GU_EXTRA={json.dumps(GU_EXTRA, ensure_ascii=False)};</script>\n'
     '<script>\n/* ================= GUJARATI TRANSLATION')

# ---------- 7. the refresh style layer ----------
CSS = r'''
/* =====================================================================
   REFRESH LAYER (Website 1): same layout and colours, sharper finish.
   ===================================================================== */
:root{--gold-grad:linear-gradient(135deg,#E5C98F,#C9A25E 55%,#A9813F)}
body{font-size:16px}
.label,.hero-facts li,.step-sub,.fact span,.foot-col h4{font-size:12px}
.sec-lead{font-size:15.5px;color:#4F5968}

/* eyebrow: gold number + small caps label above every title */
.eyebrow{display:flex;align-items:center;gap:12px;margin:0 0 16px;font-size:12px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
.eyebrow b{font:600 13px/1 "Cinzel",Georgia,serif;letter-spacing:.1em;color:var(--terra)}
.eyebrow b::after{content:"";display:inline-block;width:34px;height:1px;margin-left:12px;vertical-align:middle;background:var(--gold)}
.dark .eyebrow{color:rgba(255,255,255,.7)}.dark .eyebrow b{color:var(--gold)}
html[lang=gu] .eyebrow{letter-spacing:.02em}

/* hero: carved-lattice texture, gold frame on the arch, two actions */
.hero{background:
  radial-gradient(900px 520px at 88% 8%,#E6EBF2 0,rgba(230,235,242,0) 70%),
  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cpath d='M28 4l24 24-24 24L4 28z' fill='none' stroke='%23C9A25E' stroke-opacity='.16'/%3E%3Ccircle cx='28' cy='28' r='3' fill='none' stroke='%23C9A25E' stroke-opacity='.2'/%3E%3C/svg%3E"),
  #FFFFFF}
.hero::after{content:"";position:absolute;left:0;right:0;bottom:0;height:140px;background:linear-gradient(to bottom,rgba(255,255,255,0),#FFFFFF);pointer-events:none}
.hero .shell{position:relative;z-index:1}
.hero h1{font-size:clamp(42px,5.4vw,74px)}
.hero-art::before{background:var(--gold-grad);opacity:.9}
.hero-art::after{content:"";position:absolute;inset:-14px 14px 14px -14px;border-radius:var(--arch);border:1px solid rgba(117,68,55,.35);pointer-events:none}
.hero-badge{border-left:3px solid var(--gold)}
.hero-cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}
.hero-cta .btn{padding:15px 26px;font-size:13.5px}
.btn-gold{background:var(--terra);border-color:var(--terra)}
.btn-gold:hover{background:var(--navy);border-color:var(--navy)}
.btn-ghost{background:transparent;color:var(--ink);border-color:rgba(30,42,58,.28)}
.btn-ghost svg{width:17px;height:17px;color:#1F8F55}
.btn-ghost:hover{background:var(--navy);color:#FFFFFF;border-color:var(--navy)}.btn-ghost:hover svg{color:#FFFFFF}
@media(max-width:900px){.hero-cta{justify-content:center}}
@media(max-width:520px){.hero-cta .btn{flex:1 1 100%;justify-content:center}}

/* stones band: slow marquee of materials and crafts */
.stones-band{overflow:hidden;padding:22px 0;border-top:1px solid rgba(201,162,94,.35);border-bottom:1px solid rgba(201,162,94,.35)}
.sb-track{display:flex;width:max-content;animation:sbMove 46s linear infinite}
.stones-band:hover .sb-track{animation-play-state:paused}
.sb-track ul{display:flex;margin:0;padding:0;list-style:none}
.sb-track li{display:flex;align-items:center;gap:26px;padding-right:26px;white-space:nowrap;font:italic 500 clamp(19px,2vw,26px)/1 "Cormorant Garamond","Noto Serif Gujarati",Georgia,serif;color:#FFFFFF}
.sb-track li::after{content:"";width:8px;height:8px;border:1.5px solid var(--gold);transform:rotate(45deg)}
@keyframes sbMove{to{transform:translateX(-50%)}}

/* projects */
.pj-info h3{text-wrap:balance}
.pj-chip.on{box-shadow:0 0 0 1px var(--terra),var(--shadow-sm)}

/* services: number, gold rule, illustration on a soft arch tile */
.svc{position:relative;overflow:hidden;border-radius:20px}
.svc::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:var(--gold-grad);transform:scaleX(0);transform-origin:left;transition:transform .5s cubic-bezier(.2,.7,.2,1)}
.svc:hover::before{transform:scaleX(1)}
.svc-img{border-radius:999px 999px 16px 16px;background:linear-gradient(180deg,#F2F4F7,#FFFFFF)}
.svc-num{display:block;margin-top:18px;font:600 13px/1 "Cinzel",Georgia,serif;letter-spacing:.14em;color:var(--gold)}
.svc h3{margin-top:8px}

/* studio facts and vision */
.fact strong{background:linear-gradient(135deg,#8A5444,var(--terra2));-webkit-background-clip:text;background-clip:text;color:transparent}
.vm{border-top:3px solid transparent;background:linear-gradient(#FFFFFF,#FFFFFF) padding-box,var(--gold-grad) border-box}

/* how we work: big ghost numbers */
.step{position:relative;overflow:hidden}
.step-num{position:absolute;right:16px;top:8px;font:600 64px/1 "Cinzel",Georgia,serif;color:rgba(201,162,94,.12);pointer-events:none}
@media(max-width:520px){.step-num{font-size:44px;top:6px}}

/* contact and footer */
.contact{box-shadow:0 40px 80px -40px rgba(78,44,34,.7)}
.ct-tile.call{box-shadow:0 12px 26px -14px rgba(0,0,0,.45)}
.footer{position:relative}
.footer::before{content:"";position:absolute;left:50%;top:0;width:min(420px,70%);height:1px;transform:translateX(-50%);background:linear-gradient(90deg,rgba(201,162,94,0),var(--gold),rgba(201,162,94,0))}

.quick{transition:opacity .4s,transform .4s}
.quick.away{opacity:0;transform:translateY(14px);pointer-events:none}

@media(prefers-reduced-motion:reduce){.sb-track{animation:none}}
'''
swap('@media(prefers-reduced-motion:reduce){*{animation-duration',
     CSS + '\n@media(prefers-reduced-motion:reduce){*{animation-duration')

os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, 'w', encoding='utf-8').write(s)
print('wrote', OUT, len(s) // 1024, 'KB')
