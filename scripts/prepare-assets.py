"""Builds the static image assets in public/ from the source files in MazzaPresskit/images.

  public/images/dj/*.webp        DJ photos at 960w, 720w and 480w
  public/images/events/*.webp    event flyers (images/flyer*.jpeg), fitted to 4:5 over a blurred backdrop
  public/video/*.mp4 + poster    gallery videos (images/video*.mp4) and a poster frame
  public/images/letras.webp      official MAZZA lettering
  public/favicon.svg, favicon-32.png, apple-touch-icon.png
  public/og.jpg                  1200x630 social sharing card

Run: python scripts/prepare-assets.py   (needs Pillow; fonts are fetched once into scripts/.cache)
"""
import os
import re
import urllib.request

import shutil

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, '..', 'images')
PUB = os.path.join(ROOT, 'public')
CACHE = os.path.join(ROOT, 'scripts', '.cache')
BONE = (242, 237, 232)
INK = (5, 5, 5)

PHOTOS = {'Hero.jpeg': 'hero', 'foto.jpeg': 'foto-1', 'foto2.jpeg': 'foto-2', 'foto3.jpeg': 'foto-3',
          'foto4.jpeg': 'foto-4', 'foto5.jpeg': 'foto-5', 'foto6.jpeg': 'foto-6', 'foto7.jpg': 'foto-7',
          'foto8.jpeg': 'foto-8', 'foto9.jpeg': 'foto-9', 'foto10.jpeg': 'foto-10'}
FONTS = {
    'PlayfairDisplay.ttf': 'ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf',
    'IBMPlexMono-Medium.ttf': 'ofl/ibmplexmono/IBMPlexMono-Medium.ttf',
}


def font(name, size, weight=None):
    path = os.path.join(CACHE, name)
    if not os.path.exists(path):
        urllib.request.urlretrieve('https://github.com/google/fonts/raw/main/' + FONTS[name], path)
    f = ImageFont.truetype(path, size)
    if weight:
        f.set_variation_by_axes([weight])
    return f


def save_webp(im, path, width):
    im = im.copy()
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(path, "WEBP", quality=76, method=6)
    return im.size


os.makedirs(os.path.join(PUB, 'images', 'dj'), exist_ok=True)
os.makedirs(os.path.join(PUB, 'images', 'events'), exist_ok=True)

for src, name in PHOTOS.items():
    im = Image.open(os.path.join(SRC, src)).convert('RGB')
    for w in (960, 720, 480):
        size = save_webp(im, os.path.join(PUB, 'images', 'dj', f'{name}-{w}.webp'), w)
    print('dj', name, size)


def fit_4x5(im):
    """Whole flyer on a 4:5 card: never crops its text, fills the rest with a dark blurred copy."""
    W = 1080
    H = 1350
    bg = ImageOps.fit(im, (W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(40))
    bg = bg.point(lambda v: int(v * 0.35))
    fg = im.copy()
    fg.thumbnail((W, H), Image.LANCZOS)
    if fg.width < W and fg.height < H:
        scale = min(W / fg.width, H / fg.height)
        fg = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    bg.paste(fg, ((W - fg.width) // 2, (H - fg.height) // 2))
    return bg


flyer_re = re.compile(r'^flyer(\d+)\.(jpe?g|png|webp)$', re.I)
for f in sorted(os.listdir(SRC)):
    m = flyer_re.match(f)
    if not m:
        continue
    card = fit_4x5(Image.open(os.path.join(SRC, f)).convert('RGB'))
    base = f'flyer-{int(m.group(1)):02d}'
    for w in (1080, 540):
        save_webp(card, os.path.join(PUB, 'images', 'events', f'{base}-{w}.webp'), w)
    print('flyer', base)

os.makedirs(os.path.join(PUB, 'video'), exist_ok=True)
video_re = re.compile(r'^video(\d+)\.mp4$', re.I)
for f in sorted(os.listdir(SRC)):
    m = video_re.match(f)
    if not m:
        continue
    base = f'video-{int(m.group(1)):02d}'
    shutil.copyfile(os.path.join(SRC, f), os.path.join(PUB, 'video', f'{base}.mp4'))
    try:
        import cv2
        cap = cv2.VideoCapture(os.path.join(SRC, f))
        cap.set(cv2.CAP_PROP_POS_MSEC, 1000)
        ok, frame = cap.read()
        if ok:
            poster = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            save_webp(poster, os.path.join(PUB, 'video', f'{base}-poster.webp'), 720)
    except ImportError:
        print('opencv not installed: no poster for', base)
    print('video', base)

letras = Image.open(os.path.join(SRC, 'Letras.png')).convert('RGBA')
save_webp(letras, os.path.join(PUB, 'images', 'letras.webp'), 1800)

# Favicon: bone monogram on a near-black rounded square, built from the vectorized mark.
mark_svg = open(os.path.join(PUB, 'mark.svg'), encoding='utf-8').read()
paths = ''.join(re.findall(r'<path [^>]+/>', mark_svg))
vb_w, vb_h = 4580, 3853
pad = 900
side = vb_w + pad * 2
fav = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {side} {side}">'
       f'<rect width="{side}" height="{side}" rx="{side * 0.18:.0f}" fill="#050505"/>'
       f'<g transform="translate({pad} {(side - vb_h) / 2:.0f})" fill="#F2EDE8" fill-rule="evenodd">{paths}</g></svg>')
open(os.path.join(PUB, 'favicon.svg'), 'w', encoding='utf-8').write(fav)

logo = Image.open(os.path.join(SRC, 'Logo.png')).convert('RGBA')


def icon(size, radius_ratio=0.18):
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * radius_ratio), fill=255)
    canvas.paste(Image.new('RGBA', (size, size), INK + (255,)), (0, 0), mask)
    inner = int(size * 0.66)
    m = logo.copy()
    m.thumbnail((inner, inner), Image.LANCZOS)
    tint = Image.new('RGBA', m.size, BONE + (255,))
    tint.putalpha(m.getchannel('A'))
    canvas.alpha_composite(tint, ((size - m.width) // 2, (size - m.height) // 2))
    return canvas


icon(32).save(os.path.join(PUB, 'favicon-32.png'))
icon(180, 0).convert('RGB').save(os.path.join(PUB, 'apple-touch-icon.png'))

# Open Graph card 1200x630
W, H = 1200, 630
hero = Image.open(os.path.join(SRC, 'Hero.jpeg')).convert('RGB')
hero = ImageOps.fit(hero, (W, H), Image.LANCZOS, centering=(0.5, 0.3))
g = ImageOps.grayscale(hero).point(lambda v: int(v * 0.42))
og = Image.merge('RGB', (g, g.point(lambda v: int(v * 0.9)), g.point(lambda v: int(v * 0.92))))
shade = Image.new('L', (W, H))
d = ImageDraw.Draw(shade)
for x in range(W):
    d.line([(x, 0), (x, H)], fill=int(255 * max(0.0, 1 - x / (W * 0.75)) ** 1.1))
og = Image.composite(Image.new('RGB', (W, H), INK), og, shade)
draw = ImageDraw.Draw(og)
mk = logo.copy()
mk.thumbnail((150, 150), Image.LANCZOS)
tint = Image.new('RGBA', mk.size, BONE + (255,))
tint.putalpha(mk.getchannel('A'))
og.paste(tint, (72, 72), tint)
draw.text((66, 300), 'MAZZA', font=font('PlayfairDisplay.ttf', 168, 600), fill=BONE)
mono = font('IBMPlexMono-Medium.ttf', 24)
draw.text((72, 500), 'DJ & PRODUCTOR', font=mono, fill=BONE)
draw.text((72, 536), 'TIZIMÍN, YUCATÁN  [PRESSKIT]', font=mono, fill=(207, 199, 193))
draw.rectangle([72, 488, 72 + 120, 490], fill=(122, 15, 31))
og.save(os.path.join(PUB, 'og.jpg'), quality=86, optimize=True, progressive=True)
print('og, favicons, letras done')
