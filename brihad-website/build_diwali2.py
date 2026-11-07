"""Diwali card, round 2: Ganesh ji and Lakshmi ji (cut out from the user's ChatGPT image) with the
website's mantra, the Brihad rath logo and contact details. Writes diwali-card/card2.html."""
import base64, re
from content import CONTACT, IMG, PHONE_ICON

import sys
TPL, OUT = (sys.argv[1], sys.argv[2]) if len(sys.argv) > 2 else ('diwali-card/card2-template.html', 'diwali-card/card2.html')
tpl = open(TPL, encoding='utf-8').read()
c = dict(re.findall(r"(\w+):'([^']*)'", CONTACT))
gods = 'data:image/png;base64,' + base64.b64encode(open('diwali-card/ganesh-lakshmi-cutout.png', 'rb').read()).decode()
MAIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>'
WEB = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>'
CONTACT_BLOCK = ('<div class="name">BRIHAD TEMPLE CONSTRUCTION CO.</div><div class="tag">Sculpture to Structure · Since 1999</div>'
                 '<div class="rows"><div class="row">{{ICON:phone}}{{PHONE1}}</div><div class="row">{{ICON:phone}}{{PHONE2}}</div>'
                 '<div class="row">{{ICON:mail}}{{EMAIL}}</div><div class="row">{{ICON:web}}{{WEBSITE}}</div></div>')
tpl = tpl.replace('{{CONTACT_BLOCK}}', CONTACT_BLOCK)
_wsvg = open('diwali-card/konark-wheel-traced.svg', encoding='utf-8').read().replace('currentColor', '#000')
rep = {'{{WHEELURI}}': 'data:image/svg+xml;base64,' + base64.b64encode(_wsvg.encode()).decode(),
       '{{IMG:ganesh}}': 'data:image/png;base64,' + base64.b64encode(open('diwali-card/ganesh-cutout.png', 'rb').read()).decode(),
       '{{IMG:lakshmi}}': 'data:image/png;base64,' + base64.b64encode(open('diwali-card/lakshmi-cutout.png', 'rb').read()).decode(),
       '{{WHEEL}}': open('diwali-card/konark-wheel-traced.svg', encoding='utf-8').read(),
       '{{PHONE1}}': c['phone'], '{{PHONE2}}': c['phone2'], '{{EMAIL}}': c['email'], '{{WEBSITE}}': 'www.brihadtemple.com',
       '{{ICON:phone}}': PHONE_ICON, '{{ICON:mail}}': MAIL, '{{ICON:web}}': WEB, '{{IMG:gods}}': gods,
       '{{IMG:mantra}}': IMG['mantra'], '{{IMG:contact_bg}}': IMG['contact_bg']}
for k, v in rep.items():
    tpl = tpl.replace(k, v)
assert '{{' not in tpl, tpl[tpl.index('{{'):tpl.index('{{')+30]
open(OUT, 'w', encoding='utf-8').write(tpl)
