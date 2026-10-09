#!/usr/bin/env python3
"""Publish ONE reviewed batch of five official-source BetInsight match reports.

Immutable original master image with logo pre-embedded (no second logo overlay).
Per-tip public JPG with real EXIF descriptive metadata, independent static HTML,
server-readable article metadata, JSON-LD and sources. This is a reviewed
historical backlog publisher: NOT a replacement for live result confirmation.
"""
from __future__ import annotations

import datetime as dt
import html
import json
import re
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/".github"/"scripts"))
from result_image_metadata import export_image

TEMPLATE=ROOT/"assets"/"templates"/"betinsight-result-master-blanko.png"
BATCH=ROOT/"docs"/"result-report-batches"/"block-001.json"
DOMAIN="https://betinsight.club"
IMAGE_W,IMAGE_H=1200,630
WHITE=(255,255,255,255)
LIGHT=(186,225,245,255)
CYAN=(52,188,253,255)
GREEN=(64,246,139,255)
RED=(255,67,116,255)

IMAGE_COPY={
    "de":{"type":"EINZEL-TIPP  /  SPIELBERICHT","won":"GEWONNEN","lost":"LEIDER VERLOREN","versus":"VS  ","unit":"UNITS","odds":"QUOTE","footer":"Echte Spiele  •  Echte Analysen  •  Ehrliche Ergebnisse","yes":"WON","no":"LOST"},
    "en":{"type":"SINGLE TIP  /  MATCH REVIEW","won":"WON","lost":"LOST","versus":"VS  ","unit":"UNITS","odds":"ODDS","footer":"Real Matches  •  Real Analysis  •  Honest Results","yes":"WON","no":"LOST"},
    "es":{"type":"APUESTA SIMPLE  /  ANÁLISIS","won":"GANADO","lost":"PERDIDO","versus":"VS  ","unit":"UNITS","odds":"CUOTA","footer":"Partidos reales  •  Análisis reales  •  Resultados honestos","yes":"GANADO","no":"PERDIDO"},
    "pt":{"type":"PALPITE ÚNICO  /  ANÁLISE","won":"GANHO","lost":"PERDIDO","versus":"X  ","unit":"UNITS","odds":"ODD","footer":"Jogos reais  •  Análises reais  •  Resultados honestos","yes":"GANHO","no":"PERDIDO"},
    "it":{"type":"SINGOLA  /  ANALISI PARTITA","won":"VINTO","lost":"PERSO","versus":"VS  ","unit":"UNITS","odds":"QUOTA","footer":"Partite vere  •  Analisi vere  •  Risultati onesti","yes":"VINTO","no":"PERSO"},
    "fr":{"type":"PARI SIMPLE  /  ANALYSE","won":"GAGNÉ","lost":"PERDU","versus":"VS  ","unit":"UNITS","odds":"COTE","footer":"Matchs réels  •  Analyses réelles  •  Résultats honnêtes","yes":"GAGNÉ","no":"PERDU"},
}

def clean(value):
    return str(value or "").strip()

def esc(value):
    return html.escape(clean(value),quote=True)

def font(size,bold=True):
    choices=(
        ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf","DejaVuSans-Bold.ttf"] if bold else
        ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf","DejaVuSans.ttf"]
    )
    for choice in choices:
        try:return ImageFont.truetype(choice,size)
        except OSError:pass
    return ImageFont.load_default()

def fit_font(draw,s,maxwidth,size,maxmin=22,bold=True):
    while size>maxmin and draw.textbbox((0,0),s,font=font(size,bold))[2]>maxwidth:
        size-=1
    return font(size,bold)

def valid(item):
    must=("tipp_id","match","score","match_date","outcome","source_url","home","away","market","odds","units","summary_de","legs")
    for key in must:
        if not item.get(key) and item.get(key)!=0:raise ValueError("Missing: "+key)
    if not re.fullmatch(r"BI-[A-Za-z0-9_-]{7,80}",item["tipp_id"]):raise ValueError("Bad id")
    if item["outcome"] not in ("WON","LOST"):raise ValueError("Unconfirmed outcome")
    if not re.fullmatch(r"\d+:\d+",item["score"]):raise ValueError("Unknown score")
    if not item["source_url"].startswith("https://"):raise ValueError("Missing source")
    assert len(item["legs"])==1 and item["legs"][0]["key_events"]

def image_for(item, lang='de'):
    copy=IMAGE_COPY[lang]
    im=Image.open(TEMPLATE).convert("RGBA")
    if im.width<1000 or im.height<500:raise RuntimeError("Invalid original master dimensions")
    # ImageOps.fit preserves the user's design as closely as possible.
    canvas=ImageOps.fit(im,(IMAGE_W,IMAGE_H),method=Image.Resampling.LANCZOS)
    # Crucial: upper 145px are untouched to preserve logo EMBEDDED in master.
    shading=Image.new("RGBA",canvas.size,(0,0,0,0))
    sp=shading.load()
    for x in range(0,820):
        fade=max(0.0,min(1.0,(820-x)/360))
        alpha=int((140 if x<585 else 140*fade))
        for y in range(148,IMAGE_H):
            sp[x,y]=(0,11,27,alpha)
    canvas=Image.alpha_composite(canvas,shading)
    d=ImageDraw.Draw(canvas)
    x=63
    ok=item["outcome"]=="WON"
    accent=GREEN if ok else RED
    status=(copy["won"] if ok else copy["lost"])
    d.text((x,156),copy["type"],font=font(20),fill=LIGHT,stroke_width=0)
    d.text((x,192),status,font=fit_font(d,status,715,58),fill=WHITE,stroke_width=2,stroke_fill=(4,16,33,255))
    d.rounded_rectangle((x,262,744,268),radius=2,fill=accent)
    d.text((x,287),item["home"].upper(),font=fit_font(d,item["home"].upper(),670,36),fill=WHITE,stroke_width=1,stroke_fill=(0,6,18,255))
    d.text((x,337),copy["versus"]+item["away"].upper(),font=fit_font(d,"VS  "+item["away"].upper(),670,33),fill=LIGHT,stroke_width=1,stroke_fill=(0,6,18,255))
    d.text((x,389),item["score"],font=font(76),fill=WHITE,stroke_width=2,stroke_fill=(0,6,18,255))
    badge=copy["yes"] if ok else copy["no"]
    bx=335
    d.rounded_rectangle((bx,412,bx+166,468),radius=13,fill=(1,26,35,235),outline=accent,width=4)
    d.text((bx+83,440),badge,anchor="mm",font=font(35),fill=accent)
    d.rounded_rectangle((x,504,750,510),radius=2,fill=(32,174,242,255))
    date=dt.date.fromisoformat(item["match_date"]).strftime("%d.%m.%Y")
    footer=f"{date}   •   {item['units']:g} {copy['unit']}   •   {copy['odds']} {str(item['odds']).replace('.',',')}"
    d.text((x,525),footer,font=fit_font(d,footer,710,22,18),fill=WHITE)
    d.text((x,565),copy["footer"],font=fit_font(d,copy["footer"],705,19,16,bold=False),fill=LIGHT)
    return canvas

CSS=r"""
.legacy-report{margin:30px 0 38px;padding:18px 0;border-top:1px solid #1f576f;border-bottom:1px solid #1f576f}
.legacy-report>h2{font-size:clamp(22px,3.5vw,29px);margin:0 0 8px}
.legacy-report>p{color:#afcedd;margin-bottom:20px;font-size:14px}
.legacy-report .wrap{width:100%;max-width:100%}
.legacy-report .layout{padding:0 0 26px;grid-template-columns:minmax(0,1fr) 235px;gap:15px}
.legacy-report .article{padding:clamp(15px,3vw,28px);box-shadow:none}
.legacy-report .article h2{font-size:clamp(20px,3vw,26px)}
.legacy-report .sidebar{position:static}
.legacy-report .stat-card b{font-size:clamp(13px,2vw,17px)}
@media(max-width:830px){.legacy-report .layout{grid-template-columns:1fr}.legacy-report .sidebar{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:480px){.legacy-report .stats-grid{grid-template-columns:1fr}.legacy-report .sidebar{grid-template-columns:1fr}}

:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#031724;color:#effaff;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:16px;line-height:1.72}
a{color:#72ddff}a:hover{color:#a9fffa}main{max-width:1000px;margin:auto;padding:26px 22px 90px}
header{border-bottom:1px solid #224454;padding-bottom:20px;margin-bottom:27px;display:flex;justify-content:space-between;align-items:center;gap:12px}
header a{font-weight:850;text-decoration:none}.crumb{font-size:13px;color:#a8c6d8}.hero img{display:block;width:100%;height:auto;border-radius:18px;border:1px solid #287195;box-shadow:0 25px 70px #0008}.kicker{margin-top:32px;color:#77dbff;text-transform:uppercase;letter-spacing:.16em;font-weight:800;font-size:13px}
h1{font-size:clamp(29px,5vw,46px);line-height:1.14;letter-spacing:-.025em;margin:14px 0 12px}
.subtitle{color:#b8d9e4;max-width:780px}.status{display:inline-flex;padding:5px 13px;border-radius:9px;font-weight:900;font-size:14px;margin:12px 0}
.status.win{color:#8affbc;border:1px solid #21b764}.status.lose{color:#ff839c;border:1px solid #e34069}
.keydata{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}.keydata span{display:inline-flex;background:#0e3044;border:1px solid #22566e;border-radius:11px;padding:7px 14px;font-weight:650}
.article{margin:28px 0;border:1px solid #17455e;background:#092b3d;border-radius:16px;padding:clamp(18px,4vw,35px)}h2{font-size:clamp(21px,3vw,26px);margin:0 0 16px}
.timeline{list-style:none;padding:0;margin:10px 0 26px}.timeline li{padding:12px 15px;margin:8px 0;border-left:4px solid #25b2d8;background:#0d3a50;border-radius:4px 12px 12px 4px}
.timeline strong{color:#7bd9ff;margin-right:12px}.conclusion{background:#0f3840;border:1px solid #258c88;border-radius:13px;padding:17px 21px}.conclusion h2{margin-bottom:8px}
.source{font-size:13px;color:#b1d1df}.note{font-size:12px;color:#96b1bf;margin-top:24px}
nav{display:flex;gap:16px;flex-wrap:wrap;margin-top:25px}.footer{font-size:13px;border-top:1px solid #204759;padding-top:25px;color:#9cbccf}
@media(max-width:600px){main{padding:15px 13px 65px}.hero img{border-radius:12px}.article{padding:18px}}
"""
def report_html(item,image_url,page_url):
    date=dt.date.fromisoformat(item["match_date"]).strftime("%d.%m.%Y")
    won=item["outcome"]=="WON"
    term="gewonnen" if won else "verloren"
    seo_title=f"{item['home']} – {item['away']} {item['score']}: Tipp {term} | BetInsight"
    meta=f"{item['match']} endet {item['score']}. BetInsight-Tipp {term}. {clean(item['summary_de'])}"
    meta=meta[:248]
    alt=f"BetInsight Ergebnisgrafik: {item['match']} {item['score']}, Tipp {term}, Quote {str(item['odds']).replace('.',',')}"
    structured={
      "@context":"https://schema.org",
      "@type":"Article",
      "mainEntityOfPage":{"@type":"WebPage","@id":page_url},
      "headline":seo_title,
      "description":meta,
      "datePublished":"2026-10-10",
      "dateModified":"2026-10-10",
      "inLanguage":"de",
      "author":{"@type":"Organization","name":"BetInsight.club","url":DOMAIN+"/"},
      "publisher":{"@type":"Organization","name":"BetInsight.club","url":DOMAIN+"/"},
      "image":{"@type":"ImageObject","contentUrl":image_url,"width":1200,"height":630,
               "caption":alt,"name":f"{item['match']} {item['score']} – BetInsight {term}"}
    }
    jsonld=json.dumps(structured,ensure_ascii=False).replace("<","\\u003c")
    events="\n".join("<li><strong>"+esc(e["minute"])+"</strong>"+esc(e["text"])+"</li>" for e in item["legs"][0]["key_events"])
    original=DOMAIN+"/de/tipps/bericht/?id="+item["tipp_id"]
    content=f"""<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(seo_title)}</title>
<meta name="description" content="{esc(meta)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="{esc(page_url)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="BetInsight.club">
<meta property="og:locale" content="de_DE">
<meta property="og:title" content="{esc(seo_title)}">
<meta property="og:description" content="{esc(meta)}">
<meta property="og:url" content="{esc(page_url)}">
<meta property="og:image" content="{esc(image_url)}">
<meta property="og:image:secure_url" content="{esc(image_url)}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{esc(alt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(seo_title)}">
<meta name="twitter:description" content="{esc(meta)}">
<meta name="twitter:image" content="{esc(image_url)}">
<meta name="twitter:image:alt" content="{esc(alt)}">
<script type="application/ld+json">{jsonld}</script>
<link rel="stylesheet" href="/assets/tip-report.css?v=20261010-2"><style>{CSS}</style></head><body>
<main><header><a href="{DOMAIN}/">betInsight.club</a><span class="crumb"><a href="{DOMAIN}/de/tipps/">Tipps</a> / Ergebnisbericht</span></header>
<article><figure class="hero" style="margin:0"><img src="{esc(image_url)}" width="1200" height="630" alt="{esc(alt)}" fetchpriority="high"></figure>
<p class="kicker">BetInsight · Nachträgliche Tippauswertung</p>
<h1>{esc(item['match'])}: {esc(item['score'])}</h1>
<span class="status {'win' if won else 'lose'}">Tipp {'GEWONNEN' if won else 'VERLOREN'}</span>
<p class="subtitle">Das tatsächliche Spielergebnis, die entscheidenden Szenen und die Einordnung unserer vor dem Spiel veröffentlichten Auswahl.</p>
<div class="keydata"><span>Datum: {esc(date)}</span><span>Markt: {esc(item['market'])}</span><span>Quote: {str(item['odds']).replace('.',',')}</span><span>Units: {item['units']:g}</span></div>
<section class="legacy-report"><h2>Ursprüngliche vollständige Auswertung und 1.000-€-Statistik</h2>
<p>Hier bleibt der bisherige BetInsight-Bericht vollständig erhalten – einschließlich des vor dem Spiel veröffentlichten Tipps, der Ergebniswertung, beider Statistikmodelle und des Bestätigungsnachweises. Die Zahlen werden weiterhin aus der bestehenden Statistikberechnung geladen.</p>
<div data-report-root data-report-embedded="1"><p>Originalbericht und Statistik werden geladen …</p></div></section>
<div class="article"><h2>Zusätzliche Spielanalyse mit Höhepunkten</h2><h3>Originalauswahl</h3>
<p>Unsere ursprüngliche Auswahl laut BetInsight-Master-Backoffice: <strong>{esc(item['market'])}</strong>. Der Tipp wurde nach Spielende offiziell als <strong>{'gewonnen' if won else 'verloren'}</strong> bestätigt.</p>
<h2>Spielverlauf und Höhepunkte</h2><ul class="timeline">{events}</ul>
<p>{esc(item['legs'][0]['narrative_de'])}</p>
<div class="conclusion"><h2>Warum {term}?</h2><p>{esc(item['summary_de'])}</p></div>
<p class="source">Spielereignisse und Endstand: <a href="{esc(item['source_url'])}" rel="noopener noreferrer" target="_blank">offizieller Spielbericht / LaLiga ↗</a></p>
<p class="note">{esc(item['note_de'])}</p></div>
<nav><a href="{esc(original)}">Ursprünglichen BetInsight-Bericht öffnen ↗</a><a href="{DOMAIN}/de/tipps/">Weitere veröffentlichte Tipps ansehen ↗</a></nav>
</article><p class="footer">BetInsight.club · Echte Spiele · Echte Analysen · Ehrliche Ergebnisse</p></main>
<script src="/assets/tip-report-live.js?v=20261010-2" defer></script></body></html>"""
    return content,seo_title,meta,alt

def build_one(id):
    src=ROOT/"assets"/"match-report-stories"/(id+".json")
    item=json.loads(src.read_text(encoding="utf-8"))
    valid(item)
    if item["tipp_id"] != id:raise RuntimeError("ID mismatch")
    pagepath="de/tipps/ergebnis/"+id+"/"
    pageurl=DOMAIN+"/"+pagepath
    imagepath="assets/og/"+id.lower()+"-de-v1.jpg"
    imageurl=DOMAIN+"/"+imagepath
    original=ROOT/"assets"/"og"/(id.lower()+"-raw-render.png")
    visual=image_for(item)
    original.parent.mkdir(parents=True,exist_ok=True)
    visual.save(original,"PNG",optimize=True)
    # Real EXIF metadata, not visible text.
    meta={
      "title":item["match"]+" "+item["score"]+" – BetInsight "+("gewonnen" if item["outcome"]=="WON" else "verloren"),
      "description":item["summary_de"]+" Quelle: "+item["source_url"],
      "graphic_creator":"BetInsight.club (Ergebnisgrafik auf eigener Vorlage)",
      "rights":"BetInsight.club – Grafik/Layout; zugrundeliegende Spieldaten nach offizieller Quelle.",
      "source_url":pageurl,
    }
    export_image(original,ROOT/imagepath,meta)
    original.unlink()
    htmltxt,_,_,_=report_html(item,imageurl,pageurl)
    path=ROOT/pagepath/"index.html"
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(htmltxt,encoding="utf-8")
    check=path.read_text(encoding="utf-8")
    assert ('property="og:image" content="'+imageurl+'"') in check
    assert ('<link rel="canonical" href="'+pageurl+'"') in check
    assert 'application/ld+json' in check and 'Tipp '+("GEWONNEN" if item["outcome"]=="WON" else "VERLOREN") in check
    print(json.dumps({"id":id,"page":pageurl,"image":imageurl,"score":item["score"],
                      "status":item["outcome"],"source":item["source_url"]},ensure_ascii=False))

def main():
    if not TEMPLATE.is_file():raise RuntimeError("Approved blanko not in GitHub repository")
    batch=json.loads(BATCH.read_text(encoding="utf-8"))
    ids=batch["tip_ids"]
    if len(ids)!=5 or len(set(ids))!=5:raise RuntimeError("Block must contain exactly 5 distinct tips")
    for id in ids:build_one(id)

if __name__=="__main__":main()
