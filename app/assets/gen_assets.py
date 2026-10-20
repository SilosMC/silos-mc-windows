import os
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.dirname(os.path.abspath(__file__))

def font(size, bold=False):
    # try common fonts
    candidates = []
    if bold:
        candidates += ["C:/Windows/Fonts/segoeuib.ttf","C:/Windows/Fonts/arialbd.ttf","C:/Windows/Fonts/calibrib.ttf"]
    candidates += ["C:/Windows/Fonts/segoeui.ttf","C:/Windows/Fonts/arial.ttf","C:/Windows/Fonts/calibri.ttf"]
    for c in candidates:
        if os.path.exists(c):
            try:
                return ImageFont.truetype(c, size)
            except Exception:
                pass
    return ImageFont.load_default()

ACCENT = (34, 197, 94)
ACCENT2 = (14, 165, 233)
BG = (11, 18, 32)
BG2 = (17, 26, 46)
TEXT = (230, 236, 245)
MUTED = (138, 151, 179)

def draw_silo(draw, cx, cy, scale=1.0, color=ACCENT):
    # silo: dome top + cylinder body
    w = int(90*scale); h = int(140*scale); dome = int(45*scale)
    left = cx - w//2; right = cx + w//2; top = cy - h//2; bottom = cy + h//2
    # dome
    draw.ellipse([left, top - dome, right, top + dome], fill=color)
    # body
    draw.rectangle([left, top, right, bottom], fill=color)
    # band
    draw.rectangle([left, top + int(40*scale), right, top + int(55*scale)], fill=(20, 120, 60))
    # door
    dw, dh = int(24*scale), int(34*scale)
    draw.rectangle([cx-dw//2, bottom-dh, cx+dw//2, bottom], fill=BG)
    # highlight stripe
    draw.rectangle([left+int(6*scale), top+int(10*scale), left+int(14*scale), bottom-int(10*scale)], fill=(255,255,255,40))

def make_profile(size=800):
    img = Image.new('RGB', (size, size), BG)
    d = ImageDraw.Draw(img)
    # radial-ish gradient background
    for i in range(size):
        t = i/size
        c = (int(BG[0]+(BG2[0]-BG[0])*t), int(BG[1]+(BG2[1]-BG[1])*t), int(BG[2]+(BG2[2]-BG[2])*t))
        d.line([(0,i),(size,i)], fill=c)
    # glow circle
    for r in range(200, 0, -2):
        alpha = int(60*(1-r/200))
        d.ellipse([size//2-r, size//2-r-40, size//2+r, size//2+r-40], outline=(34,197,94,alpha) if False else None)
    # silo
    draw_silo(d, size//2, size//2 - 20, scale=2.2)
    # text
    f = font(int(size*0.12), bold=True)
    txt = "SilosMC"
    bbox = d.textbbox((0,0), txt, font=f)
    tw = bbox[2]-bbox[0]
    d.text(((size-tw)//2, size//2 + 150), txt, font=f, fill=TEXT)
    f2 = font(int(size*0.045))
    sub = "Minecraft Server Host"
    bbox2 = d.textbbox((0,0), sub, font=f2)
    tw2 = bbox2[2]-bbox2[0]
    d.text(((size-tw2)//2, size//2 + 210), sub, font=f2, fill=MUTED)
    return img

def make_banner(w=2560, h=1440):
    img = Image.new('RGB', (w, h), BG)
    d = ImageDraw.Draw(img)
    # gradient
    for i in range(h):
        t = i/h
        c = (int(BG[0]+(BG2[0]-BG[0])*t*0.6), int(BG[1]+(BG2[1]-BG[1])*t*0.6), int(BG[2]+(BG2[2]-BG[2])*t*0.6))
        d.line([(0,i),(w,i)], fill=c)
    # decorative silos on left and right
    draw_silo(d, int(w*0.12), int(h*0.55), scale=2.6, color=(30, 60, 45))
    draw_silo(d, int(w*0.88), int(h*0.55), scale=2.6, color=(30, 60, 45))
    # center silo larger
    draw_silo(d, w//2, int(h*0.5), scale=3.4)
    # title
    f = font(int(h*0.16), bold=True)
    txt = "SilosMC"
    bbox = d.textbbox((0,0), txt, font=f)
    tw = bbox[2]-bbox[0]
    d.text(((w-tw)//2, int(h*0.12)), txt, font=f, fill=TEXT)
    f2 = font(int(h*0.05))
    sub = "Local-first Minecraft Server Manager for Windows, macOS & Linux"
    bbox2 = d.textbbox((0,0), sub, font=f2)
    tw2 = bbox2[2]-bbox2[0]
    d.text(((w-tw2)//2, int(h*0.30)), sub, font=f2, fill=MUTED)
    # feature pills
    pills = ["Paper", "Fabric", "Forge", "NeoForge", "Bedrock", "PocketMine", "Playit.gg"]
    f3 = font(int(h*0.035), bold=True)
    x = (w - (len(pills)*150))//2
    y = int(h*0.78)
    for p in pills:
        bb = d.textbbox((0,0), p, font=f3)
        pw = bb[2]-bb[0]+28
        d.rounded_rectangle([x, y, x+pw, y+44], radius=22, fill=(20,35,60), outline=ACCENT)
        d.text((x+14, y+8), p, font=f3, fill=TEXT)
        x += pw + 12
    # bottom tag
    f4 = font(int(h*0.03))
    tag = "Free & Open Source  ·  MIT License  ·  github.com/SilosMC"
    bb4 = d.textbbox((0,0), tag, font=f4)
    tw4 = bb4[2]-bb4[0]
    d.text(((w-tw4)//2, int(h*0.92)), tag, font=f4, fill=MUTED)
    return img

def make_logo(size=512):
    img = Image.new('RGBA', (size, size), (0,0,0,0))
    d = ImageDraw.Draw(img)
    # background rounded square
    d.rounded_rectangle([0,0,size-1,size-1], radius=int(size*0.18), fill=BG)
    draw_silo(d, size//2, int(size*0.42), scale=1.9)
    f = font(int(size*0.16), bold=True)
    txt = "SilosMC"
    bbox = d.textbbox((0,0), txt, font=f)
    tw = bbox[2]-bbox[0]
    d.text(((size-tw)//2, int(size*0.78)), txt, font=f, fill=TEXT)
    return img

os.makedirs(OUT, exist_ok=True)
make_profile(800).save(os.path.join(OUT, "youtube-profile.png"))
make_banner(2560, 1440).save(os.path.join(OUT, "youtube-banner.png"))
make_logo(512).save(os.path.join(OUT, "logo.png"))
make_logo(256).save(os.path.join(OUT, "icon-256.png"))
print("assets generated")
