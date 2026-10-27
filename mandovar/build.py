"""Build index.html: put the traced plate 86 (plate86.d) into index.src.html."""
import pathlib
here = pathlib.Path(__file__).parent
d = (here / "plate86.d").read_text().strip()
svg = ('<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>'
       '<path id="plate86" fill="currentColor" fill-rule="evenodd" d="' + d + '"/></defs></svg>')
src = (here / "index.src.html").read_text(encoding="utf8")
assert "<!--PLATE-->" in src
(here / "index.html").write_text(src.replace("<!--PLATE-->", svg), encoding="utf8")
