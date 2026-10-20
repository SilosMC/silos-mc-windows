import os, glob
from PIL import Image
ph = Image.open('A:/SilosMC/assets/placeholder.png')
for d in ['A:/silosmc-website/public/screenshots', 'A:/silosmc-website/static/screenshots']:
    if not os.path.isdir(d):
        continue
    for fn in os.listdir(d):
        if fn.lower().endswith('.webp'):
            p = os.path.join(d, fn)
            ph.save(p, 'WEBP', quality=85)
            print('replaced', p)
print('done')
