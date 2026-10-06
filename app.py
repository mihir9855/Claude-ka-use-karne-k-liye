import os
import tempfile

from flask import Flask, jsonify, render_template, request

from analyzer import analyze_dxf, analyze_pdf

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024


@app.get("/")
def index():
    return render_template("index.html")


def _f(name):
    try:
        v = float(request.form.get(name, "") or 0)
        return v or None
    except ValueError:
        return None


@app.post("/analyze")
def analyze():
    f = request.files.get("file")
    if not f or not f.filename:
        return jsonify(error="File select karo (.dxf ya .pdf)"), 400
    ext = os.path.splitext(f.filename)[1].lower()
    if ext not in (".dxf", ".pdf"):
        return jsonify(error="Sirf .dxf ya .pdf chalega (DWG ko pehle DXF me save karo)"), 400
    unit = request.form.get("unit") or None
    height = _f("height_ft")
    with tempfile.TemporaryDirectory() as d:
        path = os.path.join(d, "upload" + ext)
        f.save(path)
        try:
            if ext == ".dxf":
                res = analyze_dxf(path, unit, height)
            else:
                res = analyze_pdf(path, _f("scale"), unit or "mm", height)
        except Exception as e:
            return jsonify(error=f"File padh nahi paya: {e}"), 422
    res["filename"] = f.filename
    return jsonify(res)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
