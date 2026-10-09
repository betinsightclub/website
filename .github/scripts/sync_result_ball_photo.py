#!/usr/bin/env python3
"""Download one specifically identified royalty-free Unsplash ball photograph
for the BetInsight dynamic result-card visual. Preserve attribution/license.
"""
from pathlib import Path
from io import BytesIO
import urllib.request, json
from PIL import Image, ImageOps, ImageEnhance
root=Path(__file__).resolve().parents[2]
url="https://images.unsplash.com/photo-1656599896998-2fecd1ea0071?auto=format&fit=crop&w=1800&q=89"
request=urllib.request.Request(url,headers={"User-Agent":"BetInsight-Public-Preview/1.0"})
with urllib.request.urlopen(request,timeout=45) as r: raw=r.read(6_000_000)
im=Image.open(BytesIO(raw)).convert("RGB")
if im.width<900 or im.height<500:
    raise RuntimeError("Downloaded Unsplash licensed sports photo resolution too small")
# Preserve sharp real ball/grass details; the CSS applies the stadium-dark atmosphere.
out=root/"assets"/"brand"/"result-ball-field-photo-v2.jpg"
out.parent.mkdir(exist_ok=True,parents=True)
im.save(out,format="JPEG",quality=91,optimize=True,subsampling=0)
thumb=im.copy()
thumb.thumbnail((330,500),Image.Resampling.LANCZOS)
thumb.save(root/"assets"/"brand"/"result-photo-inspection-v2.jpg",format="JPEG",quality=73,optimize=True)

meta={"photo":"A football ball in the grass","photographer":"Joshua Hoehne",
      "source":"https://unsplash.com/photos/a-football-ball-in-the-grass-YFqEiR2euVg",
      "license":"https://unsplash.com/license","license_type":"Unsplash License",
      "note":"Published as a football illustration; not a photo of the represented match; no player or team endorses BetInsight.",
      "image_size":im.size}
(root/"assets"/"brand"/"result-ball-field-attribution-v2.json").write_text(json.dumps(meta,indent=2)+"\n",encoding="utf-8")
print(json.dumps(meta))
