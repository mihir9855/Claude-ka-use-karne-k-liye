"""Content of the current Brihad site (original/index.html), shared by the build scripts:
images, project photo lists, contact details, Gujarati lines and the eight projects."""
import re
from extract import images

SRC = 'original/index.html'
src = open(SRC, encoding='utf-8').read()
IMG = images(SRC)


def between(a, b, text=src):
    i = text.index(a)
    return text[i:text.index(b, i) + len(b)]


CONTACT = between('window.BRIHAD_CONTACT={', '};')
_hs = src.index('const HOME_TEMPLES=[')
DATA = src[src.index('const PROJECTS={'):src.index('];', _hs) + 2]   # photo lists up to the end of HOME_TEMPLES
GU = between('const GU={', '\n};')[len('const GU='):-1]
WA_ICON = re.search(r'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17\.5 14\.4.*?</svg>', src).group(0)
PHONE_ICON = re.search(r"phone:'(<svg.*?</svg>)'", src).group(1).replace("'", '"')

PROJECTS = []
for m in re.finditer(r'<article class="pj[^"]*" data-project="([^"]+)">(.*?)</article>', src, re.S):
    pid, body = m.groups()
    t_key, title = re.search(r'<h3 data-i18n="(\w+)">(.*?)</h3>', body).groups()
    l_key, loc = re.search(r'<span data-i18n="(\w+)">(.*?)</span>', body).groups()
    d_key, desc = re.search(r'<p class="pj-text" data-i18n="(\w+)">(.*?)</p>', body).groups()
    PROJECTS.append(dict(id=pid, alt=re.search(r'alt="([^"]*)"', body).group(1), t=t_key, title=title,
                         l=l_key, loc=loc, d=d_key, desc=desc, img=IMG['pj_' + pid]))
assert len(PROJECTS) == 8


def plain(s):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', s)).strip()
