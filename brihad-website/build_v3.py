"""Website 3: a completely new design for Brihad (saffron, ink and stone; big type; moving photo columns;
horizontal project gallery). Fills v3-template.html with the content of the current site."""
import html, json, os, re
from content import CONTACT, DATA, GU, IMG, PHONE_ICON, PROJECTS, WA_ICON, plain

TPL, OUT = 'v3-template.html', 'v3-new-design/index.html'
out = open(TPL, encoding='utf-8').read()
by = {p['id']: p for p in PROJECTS}

GO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>'
cards = ''.join(
    f'<button class="card" type="button" data-open="{p["id"]}" aria-label="Open the photos of {html.escape(plain(p["title"]))}">'
    f'<span class="ph"><img src="{p["img"]}" alt="{p["alt"]}" width="640" height="800" loading="{"eager" if i < 3 else "lazy"}" decoding="async">'
    f'<span class="idx">{i + 1:02d} / {len(PROJECTS):02d}</span><span class="go">{GO}</span></span>'
    f'<h3 data-i18n="{p["t"]}">{p["title"]}</h3><span class="loc" data-i18n="{p["l"]}">{p["loc"]}</span>'
    f'<span class="desc" data-desc-for="{p["id"]}" data-i18n="{p["d"]}">{p["desc"]}</span></button>'
    for i, p in enumerate(PROJECTS))

COLS = [['champapuri', 'ramji-wadhwan', 'patanvav', 'gauridad'],
        ['ulhasnagar', 'bevta-dhanera', 'omkaleshavar-ranjitgadh', 'gokul-haldia'],
        ['bevta-dhanera', 'gokul-haldia', 'champapuri', 'ramji-wadhwan']]


def col(ids):
    one = ''.join(f'<button type="button" data-open="{i}" aria-label="Open the photos of {html.escape(plain(by[i]["title"]))}">'
                  f'<img data-cover="{i}" alt="{by[i]["alt"]}" width="640" height="800"></button>' for i in ids)
    dup = re.sub(r'<button ', '<button tabindex="-1" aria-hidden="true" ', one)   # second copy only makes the loop seamless
    return f'<div class="mcol">{one}{dup}</div>'


mosaic = ''.join(col(c) for c in COLS)

GU_NEW = {
    'menu': 'મેનુ', 'heroCta1': 'અમારાં મંદિરો જુઓ', 'heroCta2': 'WhatsApp પર વાત કરો',
    'h3H1': 'શુદ્ધ <span class="serif">પથ્થરમાં,</span> હાથથી કોતરેલાં મંદિરો.',
    'kAbout': 'અમે કોણ છીએ',
    'stmt': 'માઉન્ટ આબુના દેલવાડા દેરાસરથી લઈને આખા ભારતનાં મંદિરો સુધી, અમારો પરિવાર પેઢીઓથી પથ્થર કોતરે છે. દરેક મંદિરની ડિઝાઇન, કોતરણી અને બાંધકામ અમે જાતે કરીએ છીએ, <mark>ફક્ત પથ્થરમાં, ક્યારેય ધાતુ નહીં.</mark>',
    'kWork': 'પસંદગીનું કામ', 'kServices': 'અમે શું કરીએ છીએ', 'kStory': 'અમારી વાત', 'kHome': 'તમારા ઘર માટે',
    'kProcess': 'કામની રીત', 'kContact': 'વાતચીત શરૂ કરો',
    'ctH3': 'મનમાં કોઈ <span class="serif">મંદિર છે?</span>',
    'stn4': 'રૂપકામ', 'stn5': 'નકશીકામ', 'stn6': 'ઘાટકામ',
    'tl1': 'આખા ભારતમાં', 'tl2': 'ત્રણ કળા, એક પરિવાર', 'tl4': 'આજે',
}

rep = {'{{CONTACT}}': CONTACT, '{{DATA}}': DATA, '{{GU}}': GU, '{{GU_NEW}}': json.dumps(GU_NEW, ensure_ascii=False),
       '{{PROJECT_CARDS}}': cards, '{{MOSAIC}}': mosaic, '{{ICON:wa}}': WA_ICON, '{{ICON:phone}}': PHONE_ICON}
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
