"""Vectorize the Mazza monogram PNG into contours for the 3D hero and an SVG for 2D use.

Outputs
  src/hero/mark-shapes.json  outer contours with their holes, normalized (width 2, y up)
  public/mark.svg            single-colour SVG of the mark (fill: currentColor)

Run: python scripts/vectorize-logo.py [path/to/Logo.png]
"""
import json
import os
import sys

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '..', 'images', 'Logo.png')
EPS = 1.6  # px tolerance for polygon simplification at source resolution

img = cv2.imread(SRC, cv2.IMREAD_UNCHANGED)
alpha = img[:, :, 3]
_, mask = cv2.threshold(alpha, 127, 255, cv2.THRESH_BINARY)
h, w = mask.shape
contours, hierarchy = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
hierarchy = hierarchy[0]


def simplify(c):
    pts = cv2.approxPolyDP(c, EPS, True).reshape(-1, 2)
    return pts


scale = 2.0 / w
shapes = []
svg_paths = []
for i, c in enumerate(contours):
    if hierarchy[i][3] != -1:
        continue  # holes are attached to their parent below
    if cv2.contourArea(c) < 400:
        continue
    outer = simplify(c)
    holes = []
    child = hierarchy[i][2]
    while child != -1:
        if cv2.contourArea(contours[child]) >= 200:
            holes.append(simplify(contours[child]))
        child = hierarchy[child][0]
    norm = lambda pts: [[round((x - w / 2) * scale, 5), round((h / 2 - y) * scale, 5)] for x, y in pts]
    shapes.append({'outer': norm(outer), 'holes': [norm(hh) for hh in holes]})
    d = 'M' + ' L'.join(f'{x},{y}' for x, y in outer) + ' Z'
    for hh in holes:
        d += ' M' + ' L'.join(f'{x},{y}' for x, y in hh) + ' Z'
    svg_paths.append(d)

out_json = os.path.join(ROOT, 'src', 'hero', 'mark-shapes.json')
os.makedirs(os.path.dirname(out_json), exist_ok=True)
with open(out_json, 'w', encoding='utf-8') as f:
    json.dump({'aspect': round(w / h, 5), 'height': round(h * scale, 5), 'shapes': shapes}, f, separators=(',', ':'))

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" fill="currentColor" fill-rule="evenodd">'
       + ''.join(f'<path d="{d}"/>' for d in svg_paths) + '</svg>')
out_svg = os.path.join(ROOT, 'public', 'mark.svg')
with open(out_svg, 'w', encoding='utf-8') as f:
    f.write(svg)

pts = sum(len(s['outer']) + sum(len(hh) for hh in s['holes']) for s in shapes)
print(f'shapes={len(shapes)} holes={sum(len(s["holes"]) for s in shapes)} points={pts}')
print(f'json={os.path.getsize(out_json)}B svg={os.path.getsize(out_svg)}B')
