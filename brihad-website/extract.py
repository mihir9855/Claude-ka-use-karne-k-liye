"""Pull the embedded images out of the original page, keyed by what they show."""
import base64, re

KEYS = ['mantra', 'mantra_dup', 'contact_bg', 'ganesh',
        'pj_champapuri', 'pj_ulhasnagar', 'pj_gokul-haldia', 'pj_ramji-wadhwan',
        'pj_omkaleshavar-ranjitgadh', 'pj_bevta-dhanera', 'pj_patanvav', 'pj_gauridad',
        'svc1', 'svc2', 'svc3', 'svc4', 'studio']


def images(path='original/index.html'):
    s = open(path, encoding='utf-8').read()
    uris = re.findall(r'data:image/\w+;base64,[A-Za-z0-9+/=]+', s)
    assert len(uris) == len(KEYS), len(uris)
    return dict(zip(KEYS, uris))


if __name__ == '__main__':
    import os, sys
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    for k, u in images().items():
        ext = 'jpg' if 'jpeg' in u[:20] else 'png'
        open(f'{out}/{k}.{ext}', 'wb').write(base64.b64decode(u.split(',', 1)[1]))
