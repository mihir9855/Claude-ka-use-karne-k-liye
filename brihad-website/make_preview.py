"""Make a light copy of a page for phone previews: every embedded photo is shrunk and recompressed."""
import base64, io, re, sys
from PIL import Image


def shrink(m):
    uri = m.group(0)
    raw = base64.b64decode(uri.split(',', 1)[1])
    if len(raw) < 40_000:          # small images (the mantra mask) stay as they are
        return uri
    im = Image.open(io.BytesIO(raw))
    im.thumbnail((420, 420))
    buf = io.BytesIO()
    if im.mode in ('RGBA', 'LA', 'P'):
        im.convert('RGBA').save(buf, 'WEBP', quality=62, method=6)
    else:
        im.convert('RGB').save(buf, 'WEBP', quality=58, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()


src, dst = sys.argv[1:3]
s = open(src, encoding='utf-8').read()
s = re.sub(r'data:image/\w+;base64,[A-Za-z0-9+/=]+', shrink, s)
open(dst, 'w', encoding='utf-8').write(s)
print(dst, len(s) // 1024, 'KB')
