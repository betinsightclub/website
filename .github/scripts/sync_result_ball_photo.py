#!/usr/bin/env python3
"""Download one specifically identified royalty-free Unsplash ball photograph
for the BetInsight dynamic result-card visual. Preserve attribution/license.
"""
from pathlib import Path
from io import BytesIO
import urllib.request, json
from PIL import Image, ImageOps, ImageEnhance
root=Path(__file__).resolve().parents[2]
url="https://images.unsplash.com/photo-1721257001239-60fe6a768dbb?auto=format&fit=crop&w=1800&q=89"
request=urllib.request.Request(url,headers={"User-Agent":"BetInsight-Public-Preview/1.0"})
with urllib.request.urlopen(request,timeout=45) as r: raw=r.read(6_000_000)
im=Image.open(BytesIO(raw)).convert("RGB")
if im.width<900 or im.height<500:
    raise RuntimeError("Downloaded Unsplash licensed sports photo resolution too small")
# Preserve sharp real ball/grass details; the CSS applies the stadium-dark atmosphere.
out=root/"assets"/"brand"/"result-ball-field-photo.jpg"
out.parent.mkdir(exist_ok=True,parents=True)
im.save(out,format="JPEG",quality=91,optimize=True,subsampling=0)
meta={"photo":"A close up of a soccer ball on a field","photographer":"Max Titov",
      "source":"https://unsplash.com/photos/a-close-up-of-a-soccer-ball-on-a-field-gYFOFUnSBF0",
      "license":"https://unsplash.com/license","license_type":"Unsplash License",
      "note":"Published as a football illustration; not a photo of the represented match; no player or team endorses BetInsight.",
      "image_size":im.size}
(root/"assets"/"brand"/"result-ball-field-attribution.json").write_text(json.dumps(meta,indent=2)+"\n",encoding="utf-8")
print(json.dumps(meta))
