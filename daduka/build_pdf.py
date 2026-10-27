"""Measurements-only sheets of DADUKA SHIHASHN: the drawing with the dimensions already in the file, no extra labels.
Writes annotated.html; print it with `node topdf.js`. Images come from the repaired DXF (see README in this folder)."""
import pathlib, base64
H = pathlib.Path(__file__).parent
b64 = lambda f: base64.b64encode((H / f).read_bytes()).decode()
PAGES = [
 ("એલિવેશન · આખો", "elev.png"), ("એલિવેશન · ડાબો ગોખ", "z_el_L.png"), ("એલિવેશન · વચલો ગોખ", "z_el_M.png"), ("એલિવેશન · જમણો ગોખ", "z_el_R.png"),
 ("પ્લાન · આખો", "plan.png"), ("પ્લાન · ડાબો ભાગ", "z_pl_L.png"), ("પ્લાન · વચલો ભાગ", "z_pl_M.png"), ("પ્લાન · જમણો ભાગ", "z_pl_R.png"),
]
CSS = f"""
@font-face {{ font-family: G; src: url(data:font/ttf;base64,{b64('NotoSansGujarati-Regular.ttf')}); font-weight:400 }}
@font-face {{ font-family: G; src: url(data:font/ttf;base64,{b64('NotoSansGujarati-Bold.ttf')}); font-weight:700 }}
@page {{ size: A3 landscape; margin: 0 }}
* {{ box-sizing: border-box }}
html,body {{ margin:0; background:#fff; color:#14181f; font-family:G,sans-serif }}
.page {{ width:420mm; height:297mm; padding:10mm 12mm 8mm; page-break-after:always; display:flex; flex-direction:column; gap:3mm }}
h1 {{ font-size:15pt; margin:0; font-weight:700 }} h1 small {{ font-size:10pt; color:#667085; font-weight:400; margin-left:4mm }}
.im {{ flex:1; min-height:0; display:flex; align-items:center; justify-content:center }}
.im img {{ max-width:100%; max-height:100%; display:block }}
"""
body = ''.join(f'<div class="page"><h1>દદુકા સિંહાસન · {t}<small>માપ ફૂટ-ઇંચમાં, ફાઇલમાં લખ્યા મુજબ</small></h1><div class="im"><img src="data:image/png;base64,{b64(f)}"></div></div>' for t, f in PAGES)
(H / "annotated.html").write_text(f'<!doctype html><meta charset=utf-8><style>{CSS}</style>{body}', encoding="utf8")
print("html written")
