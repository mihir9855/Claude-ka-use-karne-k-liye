import os, sys, tempfile
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import ezdxf
from analyzer import analyze_dxf


def make_dxf(path):
    doc = ezdxf.new(setup=True)
    doc.header["$INSUNITS"] = 4  # mm
    msp = doc.modelspace()
    # 6096 x 3048 mm = 20 ft x 10 ft
    msp.add_lwpolyline([(0, 0), (6096, 0), (6096, 3048), (0, 3048)], close=True,
                       dxfattribs={"layer": "SANCTUM"})
    msp.add_circle((1000, 1000), 152.4)  # 1 ft diameter
    msp.add_text("GARBHAGRIHA")
    doc.saveas(path)


def test_dxf():
    with tempfile.TemporaryDirectory() as d:
        p = os.path.join(d, "t.dxf")
        make_dxf(p)
        res = analyze_dxf(p, height_ft=15)
    s = res["shapes"][0]
    assert abs(s["area_sqft"] - 200) < 0.5
    assert abs(s["volume_cuft"] - 3000) < 5
    assert res["texts"][0]["text"] == "GARBHAGRIHA"
    assert abs(res["circles"][0]["diameter_ft"] - 1) < 0.01
