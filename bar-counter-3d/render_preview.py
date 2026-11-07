#!/usr/bin/env python3
"""Tiny z-buffer software renderer used to produce preview images of the bar model (no 3D app needed)."""
import math
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_bar_model as M  # noqa: E402


def look_at(eye, target, up=(0, 0, 1)):
    eye, target, up = map(np.array, (eye, target, up))
    f = target - eye
    f = f / np.linalg.norm(f)
    r = np.cross(f, up)
    r = r / np.linalg.norm(r)
    u = np.cross(r, f)
    return eye, r, u, f


def render(path, eye, target, fov=55, W=1600, H=1000, skip_layers=(), ortho=None, ss=2, up=(0, 0, 1)):
    """eye/target in model (x, d, z); internally converted to right-handed (x, -d, z) like 3ds Max."""
    W2, H2 = W * ss, H * ss
    eye = (eye[0], -eye[1], eye[2])
    target = (target[0], -target[1], target[2])
    eye, r, u, f = look_at(eye, target, up)
    fpx = (W2 / 2) / math.tan(math.radians(fov) / 2)
    zbuf = np.full((H2, W2), np.inf)
    img = np.zeros((H2, W2, 3))
    # background gradient
    img[:] = np.linspace(0.93, 0.80, H2)[:, None, None] * np.array([1.0, 0.98, 0.95])
    light = np.array([0.35, -0.75, 0.55])  # from front-right-above
    light = light / np.linalg.norm(light)
    trans = []

    def project(P):
        q = P - eye
        x, y, z = q @ r, q @ u, q @ f
        if ortho:
            return np.stack([W2 / 2 + x * ortho * ss, H2 / 2 - y * ortho * ss, z], axis=-1)
        z = np.maximum(z, 1.0)
        return np.stack([W2 / 2 + fpx * x / z, H2 / 2 - fpx * y / z, z], axis=-1)

    def raster(tri2, col, alpha=1.0):
        (x0, y0, z0), (x1, y1, z1), (x2, y2, z2) = tri2
        minx, maxx = int(max(min(x0, x1, x2), 0)), int(min(max(x0, x1, x2) + 1, W2))
        miny, maxy = int(max(min(y0, y1, y2), 0)), int(min(max(y0, y1, y2) + 1, H2))
        if minx >= maxx or miny >= maxy:
            return
        den = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2)
        if abs(den) < 1e-9:
            return
        xs, ys = np.meshgrid(np.arange(minx, maxx) + 0.5, np.arange(miny, maxy) + 0.5)
        a = ((y1 - y2) * (xs - x2) + (x2 - x1) * (ys - y2)) / den
        b = ((y2 - y0) * (xs - x2) + (x0 - x2) * (ys - y2)) / den
        c = 1 - a - b
        inside = (a >= -1e-6) & (b >= -1e-6) & (c >= -1e-6)
        if not inside.any():
            return
        if ortho:
            z = a * z0 + b * z1 + c * z2
        else:
            z = 1.0 / (a / z0 + b / z1 + c / z2)
        sub = zbuf[miny:maxy, minx:maxx]
        m = inside & (z < sub)
        if alpha >= 1.0:
            sub[m] = z[m]
            img[miny:maxy, minx:maxx][m] = col
        else:
            region = img[miny:maxy, minx:maxx]
            region[m] = region[m] * (1 - alpha) + np.array(col) * alpha

    for p in M.prims:
        if p["layer"] in skip_layers:
            continue
        V, F = M.mesh_of(p)
        V = np.array(V, dtype=float)
        V[:, 1] *= -1
        rgb, rough, metal, transp, emit = M.MATS[p["mat"]]
        base = np.array(rgb)
        P2 = project(V)
        if (P2[:, 2] <= 1.0).all() and not ortho:
            continue
        for face in F:
            tris = [(face[0], face[i], face[i + 1]) for i in range(1, len(face) - 1)]
            for t in tris:
                A, B, C = V[list(t)]
                n = np.cross(B - A, C - A)
                ln = np.linalg.norm(n)
                if ln < 1e-9:
                    continue
                n = n / ln
                view = eye - A
                if n @ view < 0:
                    n = -n
                diff = max(n @ light, 0) * 0.75 + 0.30
                hv = light + view / np.linalg.norm(view)
                hv = hv / np.linalg.norm(hv)
                spec = (max(n @ hv, 0) ** (6 + (1 - rough) * 120)) * (0.25 + 0.5 * (1 - rough))
                if emit:
                    col = np.minimum(base * 1.15 + 0.1, 1)
                else:
                    tint = base if metal > 0.5 else np.ones(3)
                    col = np.clip(base * diff + spec * tint, 0, 1)
                tri2 = P2[list(t)]
                if transp > 0:
                    trans.append((tri2, col, 1 - transp * 0.85))
                else:
                    raster(tri2, col)
    for tri2, col, a in trans:
        raster(tri2, col, max(a, 0.12))
    out = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))
    out = out.resize((W, H), Image.LANCZOS)
    out.save(path)
    print("wrote", path)


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    out = os.path.join(here, "previews")
    os.makedirs(out, exist_ok=True)
    ceil = ("01_Architecture_Ceiling",)
    # Model coordinates are (x, d, z): d = distance from wall into room
    render(os.path.join(out, "01_perspective.png"), (4600, 4700, 1750), (1600, 1100, 950), fov=58, skip_layers=ceil)
    render(os.path.join(out, "02_elevation_back_wall.png"), (1940, 9000, 1370), (1940, 0, 1370),
           skip_layers=ceil + ("06_Bar_Table", "07_Props_Bar_Top", "08_Bar_Stools", "09_Lighting_Pendants", "05_Return_Wine_Beer_Cooler"),
           ortho=0.27)
    render(os.path.join(out, "03_bartender_view.png"), (2500, 1150, 1600), (1100, 400, 1250), fov=70, skip_layers=ceil)
    render(os.path.join(out, "04_left_return_coolers.png"), (1900, 750, 1350), (500, 1050, 450), fov=62, skip_layers=ceil)
    render(os.path.join(out, "05_plan_top.png"), (1940, 1300, 9000), (1940, 1300, 0), skip_layers=ceil +
           ("09_Lighting_Pendants",), ortho=0.30, up=(0, 1, 0))
