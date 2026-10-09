#!/usr/bin/env python3
"""Embed factual *invisible* metadata in a generated BetInsight result image.

This script is a reusable build component, not a live backoffice trigger.
Usage:
 python .github/scripts/result_image_metadata.py input.png output.jpg metadata.json

The original approved blanko/master image is never edited.
Google/Flipboard also require server-readable article HTML and OG tags.
"""
import argparse
import json
from pathlib import Path
from PIL import Image, PngImagePlugin

def metadata_string(data, key, max_len=800):
    value = str(data.get(key, "")).strip()
    if not value or len(value) > max_len:
        raise ValueError(f"Missing or invalid metadata field: {key}")
    return value

def export_image(source: Path, target: Path, data: dict) -> None:
    if source.resolve() == target.resolve():
        raise ValueError("Never overwrite master/input images")
    title = metadata_string(data, "title", 240)
    description = metadata_string(data, "description", 700)
    creator = metadata_string(data, "graphic_creator", 150)
    rights = metadata_string(data, "rights", 400)
    source_url = metadata_string(data, "source_url", 350)
    if not source_url.startswith("https://"):
        raise ValueError("source_url must be https")
    image = Image.open(source)
    target.parent.mkdir(parents=True, exist_ok=True)
    extension = target.suffix.lower()
    if extension in {".jpg", ".jpeg"}:
        # Separate descriptive EXIF fields, not visible text printed into the image.
        exif = Image.Exif()
        exif[270] = f"{title}. {description}"  # ImageDescription
        exif[315] = creator                    # Artist: graphic/composite creator
        exif[33432] = rights                  # Copyright / image rights
        exif[305] = "BetInsight result-image pipeline"
        image.convert("RGB").save(target, "JPEG", quality=91, optimize=True,
                                  subsampling=0, exif=exif)
    elif extension == ".png":
        pnginfo = PngImagePlugin.PngInfo()
        for key, value in {
            "Title": title, "Description": description, "Author": creator,
            "Copyright": rights, "Source": source_url
        }.items():
            pnginfo.add_itxt(key, value)
        image.save(target, "PNG", pnginfo=pnginfo, optimize=True)
    else:
        raise ValueError("Output must be .jpg or .png")

    with Image.open(target) as check:
        if check.width < 600 or check.height < 315:
            target.unlink(missing_ok=True)
            raise ValueError("Social preview image too small")
        if extension == ".png":
            assert check.info.get("Title") == title
        else:
            assert title in str(check.getexif().get(270, ""))
    print(f"BetInsight metadata written: {target}")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("metadata_json", type=Path)
    args = parser.parse_args()
    data = json.loads(args.metadata_json.read_text(encoding="utf-8"))
    export_image(args.input, args.output, data)

if __name__ == "__main__":
    main()
