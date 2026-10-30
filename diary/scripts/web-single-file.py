#!/usr/bin/env python3
"""Turns `npx expo export --platform web --output-dir <dir>` into ONE html file, with the fonts inside it.
The fonts are cut down to Latin letters and stored as woff2, so the file stays small.
Needs fonttools and brotli:  pip install fonttools brotli
Usage: python3 scripts/web-single-file.py <export-dir> <out.html>"""
import base64, glob, gzip, io, sys
from fontTools import subset
from fontTools.ttLib import TTFont

LATIN = list(range(0x20, 0x7F)) + list(range(0xA0, 0x100)) + [0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2026, 0x20B9, 0x00B7]


def small_woff2(path):
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['*']
    opts.notdef_outline = True
    font = TTFont(path)
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=LATIN)
    sub.subset(font)
    font.flavor = 'woff2'
    buf = io.BytesIO()
    font.save(buf)
    return buf.getvalue()


src, out = sys.argv[1], sys.argv[2]
jsf = glob.glob(f'{src}/_expo/static/js/web/*.js')[0]
js = open(jsf).read()
count = 0
for f in glob.glob(f'{src}/assets/**/*.ttf', recursive=True):
    url = '/' + f[len(src) + 1:]
    if url in js:
        js = js.replace('"' + url + '"', '"data:font/woff2;base64,' + base64.b64encode(small_woff2(f)).decode() + '"')
        count += 1
# the code is gzipped inside the page and unpacked when it opens, so the file stays small
packed = base64.b64encode(gzip.compress(js.encode('utf-8'), 9)).decode()
boot = ('(async()=>{try{const b=atob("' + packed + '"),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);'
        'const t=await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream("gzip"))).text();'
        'const s=document.createElement("script");s.textContent=t;document.body.appendChild(s)}catch(e){document.body.textContent="This browser is too old to open Khana Diary. Please update it."}})();')
html = ('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<title>Khana Diary</title><style>html,body{width:100%;height:100%;margin:0;overflow:hidden;background:#FFF1C1}'
        '#root{display:flex;flex-direction:column;width:100%;height:100%;flex:1}</style></head><body><div id="root"></div><script>' + boot + '</script></body></html>')
open(out, 'w').write(html)
print(f'{count} fonts inside, {len(html) / 1e6:.2f} MB -> {out}')
