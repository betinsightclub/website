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
ASSET = ROOT / "assets" / "betinsight-logo.png"
OUT = ROOT / "assets" / "og" / "flipboard-crystal-palace-man-city-2026-10-09.jpg"
SOURCE = "https://betinsight.club/en/tipps/crystal-palace-man-city-28-08-2026/"
SHARE = "https://flip.it/0.zhyl"
OG = "https://betinsight.club/assets/og/flipboard-crystal-palace-man-city-2026-10-09.jpg"
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
    assert ASSET.is_file(), "Approved website BetInsight logo missing"
    w, h = 1200, 630
    im = Image.new("RGB", (w,h))
    px = im.load()
    for y in range(h):
        for x in range(w):
            a = x/w
            b = y/h
            px[x,y] = (int(4+8*a+4*b), int(18+29*(1-a)+14*b), int(33+42*(1-a)+8*b))
    d = ImageDraw.Draw(im, "RGBA")
    for i in range(4):
        d.ellipse((720-i*125,180-i*86,1340+i*85,790+i*90),outline=(31,150,191,45),width=2)
    d.polygon([(0,560),(1200,435),(1200,630),(0,630)],fill=(9,70,58,130))
    d.line([(0,555),(1200,430)],fill=(80,171,156,65),width=3)
    # Unmodified official logo, only resampled proportionally.
    logo = Image.open(ASSET).convert("RGBA")
    logo.thumbnail((300,120), Image.Resampling.LANCZOS)
    d.rounded_rectangle((42,33,366,159), radius=20, fill=(3,13,28,178), outline=(70,156,209,100), width=2)
    im.paste(logo,(48 + (314-logo.width)//2, 36 + (120-logo.height)//2), logo)
    d=ImageDraw.Draw(im)
    d.text((57,199),"BETINSIGHT  /  MATCH REVIEW",font=font(26,True),fill="#77d8ff")
    d.text((54,268),"CRYSTAL PALACE",font=font(54,True),fill="#ffffff")
    d.text((55,340),"vs  MANCHESTER CITY",font=font(48,True),fill="#ffffff")
    d.rounded_rectangle((57,428,236,492),radius=14,fill="#11705e")
    d.text((85,441),"WON",font=font(36,True),fill="#ffffff")
    d.text((269,437),"1 : 4",font=font(39,True),fill="#f6e2a7")
    d.text((57,535),"28 AUG 2026  •  PREMIER LEAGUE  •  DOCUMENTED RESULT",font=font(18,True),fill="#b8d7e8")
    OUT.parent.mkdir(parents=True,exist_ok=True)
    im.save(OUT,"JPEG",quality=89,subsampling=0,optimize=True)

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
    old = '<meta property="og:image" content="https://betinsight.club/assets/hero-fussball-dunkel.png">'
    if old in text:
        text=text.replace(old,f'<meta property="og:image" content="{OG}">')
    elif f'<meta property="og:image" content="{OG}">' not in text:
        raise RuntimeError("Source page has unexpected og:image; refusing to overwrite")
    if 'name="twitter:image"' not in text:
        insert='<meta name="twitter:card" content="summary_large_image">'
        if insert in text:
            text=text.replace(insert,insert+f'<meta name="twitter:image" content="{OG}">')
        else:
            text=text.replace("</head>",f'<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{OG}"></head>',1)
    path.write_text(text,encoding="utf-8")

if __name__=="__main__":
    render()
    put_report_pages()
    update_source()
    print("Created:", OUT.relative_to(ROOT), "and Flipboard pilot pages with unchanged BetInsight logo")
