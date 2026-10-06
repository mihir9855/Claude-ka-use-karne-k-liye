"""Temple drawing analyzer: reads DXF / PDF plans and computes sizes, area (sq ft)
and volume (cubic ft). All outputs are in feet."""
import math
import re
from collections import defaultdict

import ezdxf
from ezdxf import bbox as ezbbox
from ezdxf.recover import readfile as dxf_recover

# $INSUNITS code -> (name, feet per unit)
UNITS = {
    1: ("inch", 1 / 12),
    2: ("feet", 1.0),
    4: ("mm", 0.00328084),
    5: ("cm", 0.0328084),
    6: ("m", 3.28084),
}
UNIT_BY_NAME = {v[0]: v[1] for v in UNITS.values()}


def poly_area(pts):
    a = 0.0
    for (x1, y1), (x2, y2) in zip(pts, pts[1:] + pts[:1]):
        a += x1 * y2 - x2 * y1
    return abs(a) / 2


def poly_perimeter(pts):
    return sum(math.dist(p, q) for p, q in zip(pts, pts[1:] + pts[:1]))


def mesh_volume(vertices, faces):
    """Signed-volume of a triangulated/quad mesh; None if clearly not closed."""
    v = 0.0
    for f in faces:
        for i in range(1, len(f) - 1):
            a, b, c = vertices[f[0]], vertices[f[i]], vertices[f[i + 1]]
            v += (
                a[0] * (b[1] * c[2] - b[2] * c[1])
                - a[1] * (b[0] * c[2] - b[2] * c[0])
                + a[2] * (b[0] * c[1] - b[1] * c[0])
            ) / 6
    return abs(v)


def r(x, n=2):
    return round(x, n)


def analyze_dxf(path, unit_override=None, height_ft=None):
    try:
        doc = ezdxf.readfile(path)
    except Exception:
        doc, _ = dxf_recover(path)
    msp = doc.modelspace()

    code = doc.header.get("$INSUNITS", 0)
    if unit_override and unit_override in UNIT_BY_NAME:
        unit_name, k = unit_override, UNIT_BY_NAME[unit_override]
        unit_src = "user"
    elif code in UNITS:
        unit_name, k = UNITS[code]
        unit_src = "file"
    else:
        unit_name, k, unit_src = "mm", UNIT_BY_NAME["mm"], "assumed"

    layers = defaultdict(lambda: defaultdict(int))
    shapes, texts, dims, circles, blocks = [], [], [], [], defaultdict(int)
    mesh_vol = 0.0
    solids = 0
    lines_len = 0.0
    z_vals = []

    def add_shape(kind, layer, pts, elev=0.0, thickness=0.0):
        a = poly_area(pts) * k * k
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        shapes.append({
            "type": kind, "layer": layer,
            "width_ft": r((max(xs) - min(xs)) * k),
            "length_ft": r((max(ys) - min(ys)) * k),
            "area_sqft": r(a),
            "perimeter_ft": r(poly_perimeter(pts) * k),
            "thickness_ft": r(abs(thickness) * k),
            "vertices": len(pts),
        })

    for e in msp:
        t = e.dxftype()
        layer = e.dxf.get("layer", "0")
        layers[layer][t] += 1
        try:
            if t == "LINE":
                lines_len += math.dist(e.dxf.start, e.dxf.end) * k
                z_vals += [e.dxf.start[2], e.dxf.end[2]]
            elif t == "LWPOLYLINE":
                pts = [(p[0], p[1]) for p in e.get_points("xy")]
                if e.closed and len(pts) >= 3:
                    add_shape("closed polyline", layer, pts, e.dxf.elevation,
                              e.dxf.get("thickness", 0))
                else:
                    lines_len += sum(math.dist(p, q) for p, q in zip(pts, pts[1:])) * k
            elif t == "POLYLINE" and e.is_2d_polyline:
                pts = [(v.dxf.location[0], v.dxf.location[1]) for v in e.vertices]
                if e.is_closed and len(pts) >= 3:
                    add_shape("closed polyline", layer, pts,
                              thickness=e.dxf.get("thickness", 0))
            elif t == "CIRCLE":
                rad = e.dxf.radius * k
                circles.append({
                    "layer": layer, "diameter_ft": r(2 * rad),
                    "area_sqft": r(math.pi * rad * rad),
                    "circumference_ft": r(2 * math.pi * rad),
                })
            elif t in ("TEXT", "MTEXT"):
                s = e.dxf.text if t == "TEXT" else e.plain_text()
                texts.append({"layer": layer, "text": s.strip()})
            elif t == "DIMENSION":
                m = e.dxf.get("actual_measurement", None)
                dims.append({
                    "layer": layer, "text": e.dxf.get("text", ""),
                    "measurement_ft": r(m * k) if m else None,
                })
            elif t == "INSERT":
                blocks[e.dxf.name] += 1
            elif t == "MESH":
                verts = [tuple(v) for v in e.vertices]
                mesh_vol += mesh_volume(verts, list(e.faces)) * k ** 3
            elif t == "3DSOLID" or t == "BODY":
                solids += 1
        except Exception:
            continue

    try:
        box = ezbbox.extents(msp)
        has_box = box.has_data
    except Exception:
        has_box = False
    overall = None
    if has_box:
        dx, dy, dz = (box.size.x * k, box.size.y * k, box.size.z * k)
        overall = {"length_ft": r(dx), "width_ft": r(dy), "height_ft": r(dz)}

    height = height_ft
    height_src = "user"
    if not height:
        if overall and overall["height_ft"] > 0:
            height, height_src = overall["height_ft"], "drawing (3D extents)"
        else:
            height, height_src = None, "missing"

    footprint = sum(s["area_sqft"] for s in shapes)
    largest = max((s["area_sqft"] for s in shapes), default=0)
    for s in shapes:
        h = s["thickness_ft"] or height
        s["volume_cuft"] = r(s["area_sqft"] * h) if h else None
    for c in circles:
        c["volume_cuft"] = r(c["area_sqft"] * height) if height else None

    volume = {
        "height_used_ft": height, "height_source": height_src,
        "mesh_volume_cuft": r(mesh_vol) if mesh_vol else None,
        "largest_shape_cuft": r(largest * height) if height else None,
        "bounding_box_cuft": r(overall["length_ft"] * overall["width_ft"] * height)
        if overall and height else None,
    }
    notes = []
    if unit_src == "assumed":
        notes.append("Drawing me unit nahi mila; mm maan liya. Galat ho to Units dropdown se badlo.")
    if height_src == "missing":
        notes.append("Ye 2D drawing hai - height (ft) daalo tabhi cubic ft banega.")
    if solids:
        notes.append(f"{solids} ACIS 3D solid mile; unka volume DXF se nahi nikal sakta (mesh/polyline use karo).")
    if len(shapes) > 1:
        notes.append("Volume per shape alag-alag hai; nested shapes (andar-bahar wale) ko double mat jodna.")

    return {
        "kind": "dxf",
        "units": {"name": unit_name, "source": unit_src},
        "overall": overall,
        "total_line_length_ft": r(lines_len),
        "shapes": shapes, "circles": circles,
        "footprint_total_sqft": r(footprint),
        "volume": volume,
        "layers": {k_: dict(v) for k_, v in layers.items()},
        "blocks": dict(blocks), "texts": texts[:200], "dimensions": dims[:200],
        "notes": notes,
    }


NUM = re.compile(r"(\d+(?:\.\d+)?)\s*(?:'|ft|feet)?(?:\s*-?\s*(\d+(?:\.\d+)?)\s*(?:\"|in))?")
SCALE = re.compile(r"1\s*[:/]\s*(\d+)")


def analyze_pdf(path, scale=None, unit="mm", height_ft=None):
    import pdfplumber
    k = UNIT_BY_NAME.get(unit, UNIT_BY_NAME["mm"])
    pages = []
    all_text = ""
    detected_scale = None
    with pdfplumber.open(path) as pdf:
        for i, page in enumerate(pdf.pages, 1):
            txt = page.extract_text() or ""
            all_text += txt + "\n"
            m = SCALE.search(txt)
            if m and not detected_scale:
                detected_scale = int(m.group(1))
            pages.append(page)
        use_scale = scale or detected_scale
        out_pages = []
        for i, page in enumerate(pages, 1):
            # PDF points -> paper mm -> real units via scale
            pt_to_ft = None
            if use_scale:
                paper_mm = 25.4 / 72
                real_mm = paper_mm * use_scale
                pt_to_ft = real_mm * UNIT_BY_NAME["mm"]
                if unit != "mm":
                    pass  # scale is paper:real in same unit, so mm paper stays mm real
            rects = []
            for rc in page.rects:
                w, h = rc["width"], rc["height"]
                if w < 2 or h < 2:
                    continue
                rects.append({
                    "w_pt": r(w), "h_pt": r(h),
                    "width_ft": r(w * pt_to_ft) if pt_to_ft else None,
                    "length_ft": r(h * pt_to_ft) if pt_to_ft else None,
                    "area_sqft": r(w * h * pt_to_ft ** 2) if pt_to_ft else None,
                })
            rects.sort(key=lambda x: x["w_pt"] * x["h_pt"], reverse=True)
            xs = [o["x0"] for o in page.lines + page.rects + page.curves]
            ys = [o["top"] for o in page.lines + page.rects + page.curves]
            xe = [o["x1"] for o in page.lines + page.rects + page.curves]
            ye = [o["bottom"] for o in page.lines + page.rects + page.curves]
            ext = None
            if xs and pt_to_ft:
                ext = {"length_ft": r((max(xe) - min(xs)) * pt_to_ft),
                       "width_ft": r((max(ye) - min(ys)) * pt_to_ft)}
            out_pages.append({
                "page": i, "lines": len(page.lines), "rects": len(page.rects),
                "curves": len(page.curves), "images": len(page.images),
                "drawing_extents": ext, "largest_rects": rects[:15],
            })
    dims = [m.group(0).strip() for m in NUM.finditer(all_text)
            if "'" in m.group(0) or "ft" in m.group(0)][:100]
    notes = []
    if not use_scale:
        notes.append("PDF me scale (jaise 1:100) nahi mila - Scale field me daalo, tabhi real size aayegi.")
    if not any(p["lines"] or p["rects"] or p["curves"] for p in out_pages):
        notes.append("PDF me vector lines nahi mili (scanned image lagti hai). Isse size nikalna reliable nahi; DXF upload karo.")
    top = next((p["largest_rects"][0] for p in out_pages if p["largest_rects"]), None)
    volume = None
    if height_ft and top and top["area_sqft"]:
        volume = {"height_used_ft": height_ft,
                  "largest_rect_cuft": r(top["area_sqft"] * height_ft)}
    return {
        "kind": "pdf", "scale_used": use_scale,
        "scale_detected": detected_scale, "pages": out_pages,
        "dimension_texts": dims, "text_preview": all_text[:3000],
        "volume": volume, "notes": notes,
    }
