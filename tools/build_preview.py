"""Builds frontend/preview.html: the app as one self-contained file with generated demo data (no server needed)."""
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
fe = root / "frontend"
html = (fe / "index.html").read_text()
lw = (fe / "lightweight-charts.js").read_text().replace("</script", "<\\/script")
an = (fe / "anime.min.js").read_text().replace("</script", "<\\/script")
demo = (root / "tools" / "demo_api.js").read_text()

html = html.replace('<script src="/static/lightweight-charts.js"></script>', f"<script>{lw}</script>")
html = html.replace('<script src="/static/anime.min.js"></script>', f"<script>{an}</script>")
html, n = re.subn(r"async function api\(path\)\{.*?\n", "async function api(path){return demoApi(path)}\n", html, count=1)
assert n == 1
html = html.replace("<script>\nconst $=", f"<script>\n{demo}\nconst $=", 1)
(fe / "preview.html").write_text(html)
print("wrote", fe / "preview.html", len(html) // 1024, "KB")
