"""Build the app from index.src.html + icon.txt.
  artifact.html : fragment for publishing as an Artifact (the host adds the page skeleton)
  index.html    : the same, as a standalone page you can open from a file"""
import pathlib
here = pathlib.Path(__file__).parent
icon = (here / "icon.txt").read_text().strip()
src = (here / "index.src.html").read_text(encoding="utf8")
assert "__ICON__" in src
frag = src.replace("__ICON__", icon)
(here / "artifact.html").write_text(frag, encoding="utf8")
page = ('<!doctype html>\n<html lang="gu">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n</head>\n<body>\n'
        + frag + '\n</body>\n</html>\n')
(here / "index.html").write_text(page, encoding="utf8")
