"""Diwali greeting card for Brihad: fills diwali-card/card-template.html with the logo art and contact details."""
import re
from content import CONTACT, IMG, PHONE_ICON

tpl = open('diwali-card/card-template.html', encoding='utf-8').read()
c = dict(re.findall(r"(\w+):'([^']*)'", CONTACT))
MAIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>'
WEB = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>'
rep = {'{{PHONE1}}': c['phone'], '{{PHONE2}}': c['phone2'], '{{EMAIL}}': c['email'], '{{WEBSITE}}': 'www.brihadtemple.com',
       '{{ICON:phone}}': PHONE_ICON, '{{ICON:mail}}': MAIL, '{{ICON:web}}': WEB,
       '{{IMG:mantra}}': IMG['mantra'], '{{IMG:contact_bg}}': IMG['contact_bg']}
for k, v in rep.items():
    assert k in tpl, k
    tpl = tpl.replace(k, v)
open('diwali-card/card.html', 'w', encoding='utf-8').write(tpl)
print('phone', c['phone'], '| phone2', c['phone2'], '| email', c['email'])
