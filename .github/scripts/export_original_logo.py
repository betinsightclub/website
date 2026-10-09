#!/usr/bin/env python3
"""Export a small, exact-pixel resampling of the APPROVED GitHub BetInsight logo.
The temporary Base64 UTF-8 file is solely for transferring the original image into
the local graphics compositor. No AI regeneration of logos.
"""
from pathlib import Path
from PIL import Image
from io import BytesIO
import base64
root = Path(__file__).resolve().parents[2]
src = root / "assets" / "betinsight-logo.png"
assert src.is_file(), "Original BetInsight logo missing"
img = Image.open(src).convert("RGBA")
img.thumbnail((255,144),Image.Resampling.LANCZOS)
img = img.quantize(colors=64,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE)
b = BytesIO()
img.save(b,format="PNG",optimize=True)
dest = root / "docs" / "official_logo_small.base64.txt"
dest.parent.mkdir(parents=True,exist_ok=True)
dest.write_text(base64.b64encode(b.getvalue()).decode("ascii"),encoding="ascii")
print("Original logo reference generated",img.size,len(b.getvalue()))
