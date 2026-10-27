"""Build the app from index.src.html + plate86.d + icon.txt.
  artifact.html : fragment for publishing as an Artifact (the host adds the page skeleton)
  index.html    : the same, as a standalone page you can open from a file"""
import pathlib
here = pathlib.Path(__file__).parent
d = (here / "plate86.d").read_text().strip()
icon = (here / "icon.txt").read_text().strip()
plate = ('<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>'
         '<path id="plate86" fill="currentColor" fill-rule="evenodd" d="' + d + '"/></defs></svg>')
src = (here / "index.src.html").read_text(encoding="utf8")
assert "<!--PLATE-->" in src and "__ICON__" in src
frag = src.replace("<!--PLATE-->", plate).replace("__ICON__", icon)
(here / "artifact.html").write_text(frag, encoding="utf8")
page = ('<!doctype html>\n<html lang="gu">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n</head>\n<body>\n'
        + frag + '\n</body>\n</html>\n')
(here / "index.html").write_text(page, encoding="utf8")
