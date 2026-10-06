# Mandir Plan Analyzer

Temple ka AutoCAD **DXF** ya **PDF** upload karo; app size (ft), area (sq ft) aur volume (cubic ft) nikalta hai.

```
pip install -r requirements.txt
python app.py        # http://localhost:5000
pytest tests
```

- **DXF**: lines, closed polylines, circles, text, dimensions, blocks, layers, 3D mesh. Units file se (`$INSUNITS`) ya dropdown se.
- **2D plan** me cubic ft ke liye *Height (ft)* daalna zaroori hai.
- **PDF**: vector drawing ho to rectangles/extents; *scale (1:N)* auto-detect ya manual. Scanned PDF reliable nahi - DXF best hai.
- DWG ko pehle DXF me save karo.
