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
    bbox=im.getchannel("A").getbbox()
    if not bbox:
        raise RuntimeError("Approved source is fully transparent")
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
    reference=ROOT/"docs"/"brand-original-logo-preview.base64.txt"
    reference.parent.mkdir(parents=True,exist_ok=True)
    reference.write_text(base64.b64encode(thumb_io.getvalue()).decode("ascii"),encoding="ascii")
    info={
      "source_repo":"betinsightclub/profil",
      "source_path":"logo_betisight.club.png",
      "approved_original_git_blob":EXPECTED_SHA,
      "source_dimensions":im.size,
      "cropped_dimensions":cropped.size,
      "transparent_background":True,
      "modifications":"Only invisible alpha padding was cropped; RGB, font and brand content unchanged",
    }
    METADATA.write_text(json.dumps(info,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(info))

if __name__=="__main__":main()
