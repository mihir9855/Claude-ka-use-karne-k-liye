"""Phone-friendly page: numbered drawings + measurement tables (same data as the PDF). Output: page.html (artifact fragment)."""
import pathlib, importlib.util
H = pathlib.Path(__file__).parent
spec = importlib.util.spec_from_file_location("bp", H / "build_pdf.py"); bp = importlib.util.module_from_spec(spec); spec.loader.exec_module(bp)
fig = bp.fig
def t(rows):
    tr = ''.join(f'<tr><td class="n">{"<span class=bd>%d</span>"%r[0] if r[0] else ""}</td><td class="p">{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td></tr>' for r in rows)
    return f'<div class="sc"><table><tr><th></th><th>ભાગ</th><th>ડાબો</th><th>વચલો</th><th>જમણો</th></tr>{tr}</table></div>'
css = """
:root{--bg:#fff;--fg:#14181f;--mu:#667085;--ln:#e1e5ee;--ac:#0f5f66;--sans:"Noto Sans Gujarati",system-ui,sans-serif}
*{box-sizing:border-box} body{background:var(--bg);color:var(--fg);font-family:var(--sans);font-size:15px;line-height:1.55;padding-block:18px 40px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.w{max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:22px} h1{font-size:24px;margin:0} h2{font-size:18px;margin:0 0 8px}
.hint{color:var(--mu);margin:0;font-size:13.5px}
.sc{overflow-x:auto} .fz{overflow:auto;border:1px solid var(--ln);border-radius:12px}
.fig{position:relative;min-width:900px} .fig img{width:100%;display:block} .fig svg{position:absolute;inset:0;width:100%;height:100%}
table{border-collapse:collapse;width:100%;min-width:640px} th,td{text-align:left;padding:8px 10px;border-top:1px solid var(--ln);vertical-align:top;font-variant-numeric:tabular-nums} th{color:var(--mu);font-weight:600;border-top:0} td.p{font-weight:600}
.bd{display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;background:var(--ac);color:#fff;font-weight:700;font-size:12px}
"""
def wrap(f): return f'<div class="fz">{f}</div>'
html = f"""<title>દદુકા સિંહાસન માપ</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;600;700&display=swap">
<style>{css}</style>
<div class="w"><h1>દદુકા સિંહાસન</h1>
<section><h2>એલિવેશન</h2><p class="hint">ચિત્રને આંગળીથી આડું ખસેડી શકાય. નંબર નીચેની યાદી સાથે જોડાયેલા છે.</p>{wrap(fig('elev.png',2430,1314,bp.E_PTS,17,21))}</section>
<section><h2>એલિવેશનનાં માપ</h2>{t(bp.ELEV)}</section>
<section><h2>પ્લાન</h2>{wrap(fig('plan.png',2790,1269,bp.P_PTS,17,21))}</section>
<section><h2>પ્લાનનાં માપ</h2>{t(bp.PLAN)}</section></div>"""
(H / "page.html").write_text(html, encoding="utf8"); print(len(html))
