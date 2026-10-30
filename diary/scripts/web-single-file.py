#!/usr/bin/env python3
"""Turns `npx expo export --platform web --output-dir <dir>` into ONE html file, with the fonts inside it.
Usage: python3 scripts/web-single-file.py <export-dir> <out.html>"""
import base64, glob, sys

src, out = sys.argv[1], sys.argv[2]
jsf = glob.glob(f'{src}/_expo/static/js/web/*.js')[0]
js = open(jsf).read()
count = 0
for f in glob.glob(f'{src}/assets/**/*.ttf', recursive=True):
    url = '/' + f[len(src) + 1:]
    if url in js:
        js = js.replace('"' + url + '"', '"data:font/ttf;base64,' + base64.b64encode(open(f, 'rb').read()).decode() + '"')
        count += 1
js = js.replace('</script', '<\\/script').replace('<!--', '<\\!--')
html = ('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<title>Khana Diary</title><style>html,body{width:100%;height:100%;margin:0;overflow:hidden;background:#FFF1C1}'
        '#root{display:flex;flex-direction:column;width:100%;height:100%;flex:1}</style></head><body><div id="root"></div><script>' + js + '</script></body></html>')
open(out, 'w').write(html)
print(f'{count} fonts inside, {len(html) / 1e6:.2f} MB -> {out}')
