#!/usr/bin/env python3
"""First BetInsight social-preview pilot. Original logo pixels are always reused unchanged.
This produces a site-hosted OG image, two bilingual report pages, and updates one known
already-public match-review page. It is NOT the future Master result event handler.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import html
import re

ROOT = Path(__file__).resolve().parents[2]
ASSET = ROOT / "assets" / "brand" / "betinsight-original-transparent.png"
OUT = ROOT / "assets" / "og" / "flipboard-crystal-palace-man-city-2026-10-09-v3.jpg"
SOURCE = "https://betinsight.club/en/tipps/crystal-palace-man-city-28-08-2026/"
SHARE = "https://flip.it/0.zhyl"
OG = "https://betinsight.club/assets/og/flipboard-crystal-palace-man-city-2026-10-09-v3.jpg"
SLUG = "flipboard-crystal-palace-man-city-2026-10-09"
UTM = SOURCE + "?utm_source=flipboard&utm_medium=organic_social&utm_campaign=football_analysis_202610&utm_content=palace_city_review"

def font(size, bold=False):
    choices = (["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "DejaVuSans-Bold.ttf"] if bold
               else ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "DejaVuSans.ttf"])
    for f in choices:
        try:
            return ImageFont.truetype(f, size)
        except OSError:
            continue
    return ImageFont.load_default()

def render():
    """Render a modern sports cover with the exact ORIGINAL GitHub brand asset.
    The stadium/ball comes from BetInsight's existing website photo. No AI logos,
    player portraits, team crests, sponsors or league trademarks are generated.
    """
    from PIL import ImageOps, ImageFilter, ImageEnhance
    assert ASSET.is_file(), "Approved original GitHub BetInsight logo missing"
    bg_asset = ROOT / "assets" / "brand" / "result-ball-field-photo.jpg"
    assert bg_asset.is_file(), "Approved football image missing"
    w, h = 1200, 630
    original = Image.open(bg_asset).convert("RGB")
    # Stadium atmosphere out of focus; retain a sharp football and detailed turf on the right.
    background = ImageOps.fit(original,(w,h),method=Image.Resampling.LANCZOS,centering=(0.50,0.65))
    background = ImageEnhance.Brightness(background.filter(ImageFilter.GaussianBlur(13))).enhance(0.43)
    foreground = ImageOps.fit(original,(740,h),method=Image.Resampling.LANCZOS,centering=(0.50,0.67))
    foreground = ImageEnhance.Contrast(ImageEnhance.Brightness(foreground).enhance(1.26)).enhance(1.22)
    mask = Image.new("L",(740,h),0)
    mp = mask.load()
    for y in range(h):
        for x in range(740):
            # Soft dissolve into dark copy on the left.
            fade = max(0,min(255,round(255*(x/260))))
            mp[x,y] = fade
    background.paste(foreground,(460,0),mask)
    im = background.convert("RGBA")
    # Dark translucent left plate; no new illustrated marks or generic replacement logos.
    shade = Image.new("RGBA",(w,h),(0,0,0,0))
    sp = shade.load()
    for y in range(h):
        for x in range(w):
            a = int(232 * max(0,1.0-x/895) + 28)
            sp[x,y]=(2,14,30,min(245,a))
    im = Image.alpha_composite(im,shade)
    d=ImageDraw.Draw(im,"RGBA")
    d.rectangle((0,0,w,7),fill=(53,184,229,210))
    d.line([(52,237),(639,237)],fill=(52,179,231,200),width=3)
    d.line([(52,462),(615,462)],fill=(42,171,216,130),width=2)
    # Original PNG from GitHub is pasted as-is, with only proportional resizing.
    logo = Image.open(ASSET).convert("RGBA")
    logo.thumbnail((256,100),Image.Resampling.LANCZOS)
    d.rounded_rectangle((45,32,324,144),radius=18,fill=(0,13,30,176),outline=(80,188,226,110),width=2)
    im.alpha_composite(logo,(50+(269-logo.width)//2,38+(100-logo.height)//2))
    d=ImageDraw.Draw(im)
    d.text((359,79),"MATCH REVIEW",font=font(25,True),fill=(189,226,244,255))
    d.text((54,180),"CRYSTAL PALACE",font=font(43,True),fill="white")
    d.text((55,247),"vs  MANCHESTER CITY",font=font(39,True),fill="#d4f3ff")
    d.text((54,322),"1  :  4",font=font(104,True),fill="#ffffff")
    d.rounded_rectangle((53,482,236,550),radius=22,fill=(4,100,49,235),outline=(51,243,122,235),width=3)
    d.text((102,497),"WON",font=font(39,True),fill="#ffffff")
    d.text((52,578),"28 AUG 2026  •  MATCH PLAYED  •  DOCUMENTED RESULT",font=font(17,True),fill="#e2eff7")
    OUT.parent.mkdir(parents=True,exist_ok=True)
    im.convert("RGB").save(OUT,"JPEG",quality=91,subsampling=0,optimize=True)

def new_page(lang):
    en=lang=="en"
    base=f"https://betinsight.club/{'en/ads' if en else 'de/anzeigen'}/{SLUG}/"
    other=f"https://betinsight.club/{'de/anzeigen' if en else 'en/ads'}/{SLUG}/"
    title=("Crystal Palace – Manchester City: Match Review on Flipboard | BetInsight"
           if en else "Crystal Palace – Manchester City: Flipboard-Bericht | BetInsight")
    head=("Crystal Palace – Manchester City: A documented match review"
          if en else "Crystal Palace – Manchester City: Dokumentierter Spielbericht")
    description=("BetInsight on Flipboard: a previously published English review of Crystal Palace versus Manchester City (1–4), with the reported selection and result."
                 if en else "BetInsight auf Flipboard: englischer Bericht über Crystal Palace gegen Manchester City (1:4) mit dokumentierter Tippauswertung.")
    summary=("The BetInsight magazine shares a report about the completed match, the published selection and the final score. This is a retrospective review, not a forecast."
             if en else "Das BetInsight-Magazin teilt einen Bericht über das abgeschlossene Spiel, die veröffentlichte Auswahl und das Endergebnis. Dies ist eine rückblickende Auswertung, keine Vorhersage.")
    cta_orig=("Open Flipboard post" if en else "Flipboard-Beitrag öffnen")
    cta_source=("Read original match report" if en else "Originalen Spielbericht lesen")
    note=("The short Flipboard URL was supplied by the publisher. Automatic resolution was unavailable during preparation; confirm the shared post after publishing."
          if en else "Der Flipboard-Kurzlink wurde vom Herausgeber übermittelt. Er ließ sich bei der Vorbereitung nicht automatisch auflösen; den geteilten Beitrag nach Veröffentlichung prüfen.")
    disclaimer=("No guaranteed results. For adults where applicable; gambling laws vary by country."
                if en else "Keine garantierten Gewinne. Angebote nur für Volljährige, soweit gesetzlich zulässig.")
    return f"""<!doctype html>
<html lang="{lang}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="index,follow,max-image-preview:large">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(description,quote=True)}">
<link rel="canonical" href="{base}">
<link rel="alternate" hreflang="en" href="https://betinsight.club/en/ads/{SLUG}/">
<link rel="alternate" hreflang="de" href="https://betinsight.club/de/anzeigen/{SLUG}/">
<meta property="og:type" content="article">
<meta property="og:site_name" content="BetInsight Club">
<meta property="og:title" content="{html.escape(title,quote=True)}">
<meta property="og:description" content="{html.escape(description,quote=True)}">
<meta property="og:url" content="{base}">
<meta property="og:image" content="{OG}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="BetInsight Crystal Palace vs Manchester City football match review">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{html.escape(title,quote=True)}">
<meta name="twitter:description" content="{html.escape(description,quote=True)}">
<meta name="twitter:image" content="{OG}">
<link rel="icon" href="/favicon.ico">
<style>
:root{{color-scheme:dark}}*{{box-sizing:border-box}}body{{margin:0;background:#061b2b;color:#ecf6fe;font:17px/1.65 system-ui,Arial,sans-serif}}.wrap{{max-width:920px;margin:auto;padding:22px}}header{{border-bottom:1px solid #35576f}}header img{{width:195px;height:auto;max-height:100px;object-fit:contain}}main{{padding-top:40px;padding-bottom:70px}}h1{{font-size:clamp(30px,5vw,50px);line-height:1.1}}h2{{margin-top:26px}}.hero{{display:block;width:100%;border-radius:16px;margin:26px 0}}a{{color:#88d8ff}}.btn{{display:inline-block;background:#146da0;color:white;text-decoration:none;font-weight:700;border-radius:10px;padding:12px 18px;margin:5px 12px 5px 0}}small{{color:#c1d0dc}}footer{{border-top:1px solid #35576f}}
</style>
</head><body>
<header><div class="wrap"><a href="/{lang}/"><img src="/assets/betinsight-logo.png" alt="BetInsight Club"></a></div></header>
<main class="wrap">
<p><strong>BETINSIGHT · FLIPBOARD · {'ENGLISH' if en else 'DEUTSCH'}</strong></p>
<h1>{html.escape(head)}</h1>
<p>{html.escape(description)}</p>
<img class="hero" src="{OG}" width="1200" height="630" alt="Crystal Palace vs Manchester City BetInsight match review">
<h2>{"The report" if en else "Der Bericht"}</h2><p>{html.escape(summary)}</p>
<p><a class="btn" rel="noopener noreferrer" href="{SHARE}">{cta_orig}</a>
<a class="btn" href="{html.escape(UTM,quote=True)}">{cta_source}</a></p>
<p><small>{html.escape(note)}</small></p>
<p><small>{html.escape(disclaimer)}</small></p>
<p><a href="{other}">{"Deutsch" if en else "English"}</a></p>
</main><footer><div class="wrap">© BetInsight.club</div></footer>
</body></html>
"""

def put_report_pages():
    for lang, section in (("en","ads"),("de","anzeigen")):
        path = ROOT/lang/section/SLUG/"index.html"
        path.parent.mkdir(parents=True,exist_ok=True)
        path.write_text(new_page(lang),encoding="utf-8")

def update_source():
    path = ROOT/"en"/"tipps"/"crystal-palace-man-city-28-08-2026"/"index.html"
    text = path.read_text(encoding="utf-8")
    allowed = (
        "https://betinsight.club/assets/hero-fussball-dunkel.png",
        "https://betinsight.club/assets/og/flipboard-crystal-palace-man-city-2026-10-09.jpg",
        "https://betinsight.club/assets/og/flipboard-crystal-palace-man-city-2026-10-09-v2.jpg",
        OG,
    )
    og_match = re.search(r'<meta property="og:image" content="([^"]+)">', text)
    if not og_match or og_match.group(1) not in allowed:
        raise RuntimeError("Unexpected OG asset: review manually rather than overwrite")
    text = text.replace(og_match.group(0), f'<meta property="og:image" content="{OG}">', 1)
    tw = re.search(r'<meta name="twitter:image" content="([^"]+)">',text)
    if tw:
        if tw.group(1) not in allowed:
            raise RuntimeError("Unexpected Twitter image: review manually")
        text=text.replace(tw.group(0),f'<meta name="twitter:image" content="{OG}">',1)
    else:
        text=text.replace("</head>",f'<meta name="twitter:image" content="{OG}"></head>',1)
    path.write_text(text,encoding="utf-8")

if __name__=="__main__":
    render()
    put_report_pages()
    update_source()
    print("Created:", OUT.relative_to(ROOT), "and Flipboard pilot pages with unchanged BetInsight logo")
