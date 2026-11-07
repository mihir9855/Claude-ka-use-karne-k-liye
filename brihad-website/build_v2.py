"""Website 2: a full redesign of the Brihad site.

Fills v2-template.html with the content of the current site (original/index.html):
its images, project photo lists, contact details and Gujarati lines. Writes v2-redesign/index.html.
"""
import html, json, os, re
from extract import images

SRC, TPL, OUT = 'original/index.html', 'v2-template.html', 'v2-redesign/index.html'
src = open(SRC, encoding='utf-8').read()
out = open(TPL, encoding='utf-8').read()
IMG = images(SRC)


def between(a, b, text=src):
    i = text.index(a)
    return text[i:text.index(b, i) + len(b)]


contact = between('window.BRIHAD_CONTACT={', '};')
hs = src.index('const HOME_TEMPLES=[')  # project photo lists up to the end of HOME_TEMPLES
data = src[src.index('const PROJECTS={'):src.index('];', hs) + 2]
gu = between('const GU={', '\n};')[len('const GU='):-1]

# the eight projects, read from the current page
pj = []
for m in re.finditer(r'<article class="pj[^"]*" data-project="([^"]+)">(.*?)</article>', src, re.S):
    pid, body = m.groups()
    alt = re.search(r'alt="([^"]*)"', body).group(1)
    t_key, title = re.search(r'<h3 data-i18n="(\w+)">(.*?)</h3>', body).groups()
    l_key, loc = re.search(r'<span data-i18n="(\w+)">(.*?)</span>', body).groups()
    d_key, desc = re.search(r'<p class="pj-text" data-i18n="(\w+)">(.*?)</p>', body).groups()
    pj.append(dict(id=pid, alt=alt, t=t_key, title=title, l=l_key, loc=loc, d=d_key, desc=desc))
assert len(pj) == 8

PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>'
cards = []
for i, p in enumerate(pj):
    cls = 'pcard rv' + (' big' if i == 0 else ' wide' if i == len(pj) - 1 else '') + ('' if i == 0 else f' d{i % 4}' if i % 4 else '')
    cards.append(
        f'<button class="{cls}" type="button" data-open="{p["id"]}" aria-label="Open the photos of {html.escape(re.sub("<[^>]+>", " ", p["title"]))}">'
        f'<span class="arch" style="display:block"><img src="{IMG["pj_" + p["id"]]}" alt="{p["alt"]}" width="640" height="800" loading="{"eager" if i < 2 else "lazy"}" decoding="async"></span>'
        f'<span class="pinfo"><span class="loc">{PIN}<span data-i18n="{p["l"]}">{p["loc"]}</span></span>'
        f'<h3 data-i18n="{p["t"]}">{p["title"]}</h3>'
        f'<span class="desc" data-desc-for="{p["id"]}" data-i18n="{p["d"]}">{p["desc"]}</span>'
        f'<span class="more"><span data-i18n="viewPhotos">View photos →</span></span></span></button>')

# hero: five completed temples take turns (images copied from the cards at runtime)
HERO = ['champapuri', 'ulhasnagar', 'ramji-wadhwan', 'bevta-dhanera', 'gauridad']
by = {p['id']: p for p in pj}
hero_imgs = ''.join(
    f'<img class="{"on" if i == 0 else ""}" data-open="{h}" data-t="{by[h]["t"]}" data-l="{by[h]["l"]}" data-tt="{html.escape(re.sub("<[^>]+>", " ", by[h]["title"]))}" data-ll="{html.escape(by[h]["loc"])}" alt="{by[h]["alt"]}" width="640" height="800">'
    for i, h in enumerate(HERO))
hero_dots = ''.join(f'<i class="{"on" if i == 0 else ""}"></i>' for i in range(len(HERO)))

STONES = [('stn1', 'Dhrangadhra Sandstone'), ('stn2', 'Ambaji Marble'), ('stn3', 'Bansi Paharpur Pink Sandstone'),
          ('stn4', 'Roopkaam'), ('stn5', 'Nakshikaam'), ('stn6', 'Ghaatkaam'), ('stn7', 'Stone alone, never metal')]
stones = ''.join(f'<li data-i18n="{k}">{t}</li>' for k, t in STONES)

GU_NEW = {
    'heroCta1': 'અમારાં મંદિરો જુઓ', 'heroCta2': 'WhatsApp પર વાત કરો', 'callUs': 'ફોન કરો',
    'stn1': 'ધ્રાંગધ્રા સેન્ડસ્ટોન', 'stn2': 'અંબાજી આરસ', 'stn3': 'બંસી પહાડપુર ગુલાબી સેન્ડસ્ટોન',
    'stn4': 'રૂપકામ', 'stn5': 'નકશીકામ', 'stn6': 'ઘાટકામ', 'stn7': 'ફક્ત પથ્થર, ક્યારેય ધાતુ નહીં',
    'eyProjects': 'અમારું કામ', 'eyHome': 'તમારા ઘર માટે', 'eyServices': 'અમે શું કરીએ છીએ',
    'eyStudio': 'અમારી વાત', 'eyProcess': 'કામની રીત', 'eyContact': 'તમારા મંદિરની શરૂઆત',
    'tl1': 'આખા ભારતમાં', 'tl2': 'ત્રણ કળા, એક પરિવાર', 'tl3': 'અમારો એક નિયમ', 'tl4': 'આજે',
}

WA = re.search(r'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17\.5 14\.4.*?</svg>', src).group(0)
PHONE = re.search(r"phone:'(<svg.*?</svg>)'", src).group(1)

rep = {
    '{{CONTACT}}': contact, '{{DATA}}': data, '{{GU}}': gu, '{{GU_NEW}}': json.dumps(GU_NEW, ensure_ascii=False),
    '{{PROJECT_CARDS}}': ''.join(cards), '{{HERO_IMGS}}': hero_imgs, '{{HERO_DOTS}}': hero_dots, '{{STONES}}': stones,
    '{{ICON:wa}}': WA, '{{ICON:phone}}': PHONE.replace("'", '"'),
}
for k, v in rep.items():
    assert k in out, k
    out = out.replace(k, v)
for k, v in IMG.items():
    out = out.replace('{{IMG:' + k + '}}', v)
left = re.findall(r'\{\{[A-Z_:a-z0-9-]+\}\}', out)
assert not left, left

os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, 'w', encoding='utf-8').write(out)
print('wrote', OUT, len(out) // 1024, 'KB')
