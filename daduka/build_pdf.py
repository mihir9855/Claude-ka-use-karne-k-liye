"""Daduka Sinhasan: numbered drawing + a short list of part -> measurement (only measurements the file itself carries).
Callout positions come from the first version (_old.py). Print with `node topdf.js`."""
import pathlib, base64, importlib.util
H = pathlib.Path(__file__).parent
spec = importlib.util.spec_from_file_location("old", H / "_old.py"); old = importlib.util.module_from_spec(spec); spec.loader.exec_module(old)
b64, fig, CSS, E_PTS, P_PTS = old.b64, old.fig, old.CSS, old.E_PTS, old.P_PTS

ELEV = [  # (no, part, left, middle, right)  — heights/sizes exactly as written in the drawing
 (6, "પીઠનો નીચેનો થર (ઊંચાઈ)", "0′-5″", "0′-7″", "0′-5″"),
 (7, "પીઠનો વચલો થર (ઊંચાઈ)", "1′-0.5″", "1′-5.5″", "1′-3.5″"),
 (8, "પીઠનો ઉપરનો થર (ઊંચાઈ)", "0′-5″", "0′-5″", "0′-5″"),
 (0, "પીઠની કુલ ઊંચાઈ", "2′-2″", "2′-9″", "2′-5″"),
 (6, "નીચેના થરના પથ્થર (પહોળાઈ)", "1′-1″ · 1′-2″ · 1′-2″ · 1′-1″ (કુલ 4′-6″)", "1′-4″ · 1′-5″", "1′-4″"),
 (10, "બેઠક", "જાડાઈ 0′-4⅜″", "4′-1″ × 0′-6″", "4′-1″ પહોળી, જાડાઈ 0′-4¼″"),
 (15, "મૂર્તિ", "ઊંચાઈ 3′-0″ અને 2′-4″, પહોળાઈ 3′-1″", "", ""),
 (21, "મૂર્તિ-પેનલ (ત્રણ)", "", "", "ઊંચાઈ 2′-6″"),
 (0, "બીજાં લખેલાં ઊભાં માપ", "5′-5″ · 1′-3.25″ · 3′-5″", "3′-5″ · 2′-6″ · 0′-6″", "3′-5″ · 2′-6″ · 1′-3.25″ · 5′-5″"),
 (0, "ગોખ વચ્ચે પીઠની ઊંચાઈ", "ડાબા-વચલા વચ્ચે 2′-0.5″ · વચલા-જમણા વચ્ચે 2′-5″", "", ""),
 (0, "ગોખ વચ્ચેનું અંતર (પીઠ પર)", "ડાબા-વચલા વચ્ચે 1′-10″ · વચલા-જમણા વચ્ચે 1′-4″", "", ""),
]
PLAN = [
 (3, "ગોખની ઊંડાઈ", "2′-6″", "2′-6″", "2′-6″"),
 (3, "ગોખની પહોળાઈ", "4′-6″", "5′-6″", "5′-6″"),
 (6, "થાંભલાની જોડી વચ્ચે", "3′-2″ (બહારથી 4′-1″)", "4′-1″", "4′-1″"),
 (7, "આગળનાં સ્ટેપ", "1′-1″ · 1′-2″ · 1′-2″ · 1′-1″", "1′-4″ · 1′-5″ · 1′-5″ · 1′-4″", "1′-4″ · 2′-10″ · 1′-4″ (કુલ 3′-3″)"),
 (2, "અંદરની પહોળાઈ (દીવાલ થી દીવાલ)", "6′-9″", "6′-11″", "6′-9″"),
 (11, "ગોખ વચ્ચેનો ખાંચો", "1′-10″ · 1′-5″", "1′-4″", "1′-4″"),
 (12, "નીચેના ખૂણિયા થાંભલા વચ્ચે", "3′-1″", "", ""),
 (0, "બીજાં લખેલાં માપ", "1′-1.5″", "", "0′-7.5″ · 0′-5″"),
]
def table(rows):
    tr = ''.join(f'<tr><td class="n">{"<span class=bd>%d</span>"%r[0] if r[0] else ""}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td></tr>' for r in rows)
    return f'<table><tr><th></th><th>ભાગ</th><th>ડાબો</th><th>વચલો</th><th>જમણો</th></tr>{tr}</table>'
html = f"""<!doctype html><meta charset=utf-8><style>{CSS}</style>
<div class="page"><h1>દદુકા સિંહાસન · એલિવેશન</h1>{fig('elev.png',2430,1314,E_PTS,17,21)}</div>
<div class="page"><h2>એલિવેશનનાં માપ</h2>{table(ELEV)}</div>
<div class="page"><h1>દદુકા સિંહાસન · પ્લાન</h1>{fig('plan.png',2790,1269,P_PTS,17,21)}</div>
<div class="page"><h2>પ્લાનનાં માપ</h2>{table(PLAN)}</div>"""
(H / "annotated.html").write_text(html, encoding="utf8"); print("html written")
