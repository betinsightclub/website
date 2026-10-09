#!/usr/bin/env python3
"""Mirror the ORIGINAL BetInsight corporate logo from its approved GitHub source.
No generative AI, recoloring, sharpening, filters or vector replacement.
Only crop fully transparent padding and proportional Lanczos downscaling if necessary.
"""
from pathlib import Path
from io import BytesIO
import hashlib
import base64
import json
import urllib.request
from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
SRC="https://raw.githubusercontent.com/betinsightclub/profil/main/logo_betisight.club.png"
EXPECTED_SHA="28d37857985982a5f28a4435db6dcbb2e6033f34"
ORIGINAL=ROOT/"assets"/"brand"/"betinsight-original-source.png"
CROPPED=ROOT/"assets"/"brand"/"betinsight-original-transparent.png"
METADATA=ROOT/"assets"/"brand"/"betinsight-original-logo.json"

def main():
    with urllib.request.urlopen(urllib.request.Request(SRC,headers={"User-Agent":"BetInsight-brand-sync/1.0"}), timeout=35) as f:
        raw=f.read(7_000_000)
    actual_sha=hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\x00"+raw).hexdigest()
    if actual_sha!=EXPECTED_SHA:
        raise RuntimeError("ORIGINAL_LOGO_SHA_MISMATCH. Do not use different or generated logo.")
    im=Image.open(BytesIO(raw)).convert("RGBA")
    if im.size[0]<700 or im.size[1]<150:
        raise RuntimeError("Approved source logo unexpectedly small")
    # Original transparent file contains scattered almost invisible pixels around
    # a much smaller actual wordmark. Alpha.getbbox() consequently selects the
    # entire 1536×1024 canvas and makes the brand appear tiny on social cards.
    # Crop ONLY outside the actual readable artwork, keeping all logo pixels
    # intact inside the crop. Projected opaque pixel counts reject stray noise.
    alpha=im.getchannel("A")
    w,h=im.size
    mask=list(alpha.point(lambda a: 1 if a>=70 else 0).getdata())
    row_counts=[sum(mask[y*w:(y+1)*w]) for y in range(h)]
    col_counts=[0]*w
    for y in range(h):
        for x in range(w):
            col_counts[x]+=mask[y*w+x]
    rows=[y for y,count in enumerate(row_counts) if count>=max(6,w//200)]
    cols=[x for x,count in enumerate(col_counts) if count>=max(5,h//200)]
    if not rows or not cols:
        raise RuntimeError("Cannot identify visible original logo safely")
    margin=24
    bbox=(max(0,min(cols)-margin),max(0,min(rows)-margin),
          min(w,max(cols)+margin+1),min(h,max(rows)+margin+1))
    cropped=im.crop(bbox)
    # Do not distort the typography or introduce colored backgrounds.
    ORIGINAL.parent.mkdir(parents=True,exist_ok=True)
    ORIGINAL.write_bytes(raw)
    cropped.save(CROPPED,format="PNG",optimize=True)
    thumb=cropped.copy()
    thumb.thumbnail((280,200),Image.Resampling.LANCZOS)
    thumb=thumb.quantize(colors=64,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE)
    thumb_io=BytesIO()
    thumb.save(thumb_io,format="PNG",optimize=True)
    (ROOT/"assets"/"brand"/"betinsight-logo-review-thumb.png").write_bytes(thumb_io.getvalue())
    reference=ROOT/"docs"/"brand-original-logo-preview.base64.txt"
    reference.parent.mkdir(parents=True,exist_ok=True)
    reference.write_text(base64.b64encode(thumb_io.getvalue()).decode("ascii"),encoding="ascii")
    alpha_hist=im.getchannel("A").histogram()
    translucent_fraction=round(sum(alpha_hist[:255])/(im.width*im.height),4)
    info={
      "transparent_pixel_fraction":translucent_fraction,
      "source_repo":"betinsightclub/profil",
      "source_path":"logo_betisight.club.png",
      "approved_original_git_blob":EXPECTED_SHA,
      "source_dimensions":im.size,
      "cropped_dimensions":cropped.size,
      "artwork_crop_bbox":bbox,
      "transparent_background":True,
      "modifications":"Only invisible alpha padding was cropped; RGB, font and brand content unchanged",
    }
    METADATA.write_text(json.dumps(info,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(info))

if __name__=="__main__":main()
