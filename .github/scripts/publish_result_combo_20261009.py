#!/usr/bin/env python3
"""Publish six source-verified match-combination reviews, one unique OG image per locale.
All JavaScript inputs must pass node --check before generation.
Avoids modifying source bets, outcomes, units or both 1000 EUR statistics.
"""
import datetime as dt
import html,json
from pathlib import Path
from PIL import Image,ImageDraw,ImageOps
from publish_result_report_batch import ROOT,DOMAIN,TEMPLATE,font,fit_font,export_image,set_render_locale
from publish_result_report_multilingual import LANGS,OG,HREF,LABELS,CSS,esc
TID="BI-20261009-172442-MAR"
STORY=ROOT/"assets"/"match-report-stories"/(TID+".json")
VERS="v1"
C={
"de":{"head":"KOMBI-TIPP","lost":"LEIDER VERLOREN","won":"RICHTIG","bad":"FALSCH","conclusion":"Die Kombiwette ging verloren","stats":"2 UNITS   •   QUOTE 1,85   •   1 VON 2 RICHTIG","footer":"Echte Spiele • Echte Analysen • Ehrliche Ergebnisse","source":"Spielquelle","match":"Begegnung"},
"en":{"head":"ACCUMULATOR","lost":"LOST","won":"CORRECT","bad":"LOST","conclusion":"Why the accumulator lost","stats":"2 UNITS   •   ODDS 1.85   •   1 OF 2 CORRECT","footer":"Real Matches • Real Analysis • Honest Results","source":"Match source","match":"Fixture"},
"es":{"head":"APUESTA COMBINADA","lost":"PERDIDA","won":"ACERTADA","bad":"FALLADA","conclusion":"Por qué se perdió la combinada","stats":"2 UNITS   •   CUOTA 1,85   •   1 DE 2 ACERTADAS","footer":"Partidos reales • Análisis reales • Resultados honestos","source":"Fuente del partido","match":"Partido"},
"pt":{"head":"APOSTA MÚLTIPLA","lost":"PERDIDA","won":"CERTA","bad":"ERRADA","conclusion":"Porque foi a múltipla perdida","stats":"2 UNITS   •   COTAÇÃO 1,85   •   1 DE 2 CERTAS","footer":"Jogos reais • Análises reais • Resultados transparentes","source":"Fonte do jogo","match":"Jogo"},
"it":{"head":"SCOMMESSA MULTIPLA","lost":"PERSA","won":"CORRETTA","bad":"SBAGLIATA","conclusion":"Perché la multipla è stata persa","stats":"2 UNITS   •   QUOTA 1,85   •   1 SU 2 CORRETTE","footer":"Partite vere • Analisi vere • Risultati onesti","source":"Fonte partita","match":"Partita"},
"fr":{"head":"PARI COMBINÉ","lost":"PERDU","won":"CORRECT","bad":"PERDU","conclusion":"Pourquoi le combiné est perdu","stats":"2 UNITS   •   COTE 1,85   •   1 SUR 2 CORRECT","footer":"Matchs réels • Analyses réelles • Résultats honnêtes","source":"Source du match","match":"Rencontre"},
"nl":{"head":"COMBINATIETIP","lost":"VERLOREN","won":"GOED","bad":"FOUT","conclusion":"Waarom de combinatie verloor","stats":"2 UNITS • QUOTE 1,85 • 1 VAN 2 GOED","footer":"Echte wedstrijden • Echte analyses • Eerlijke resultaten","source":"Wedstrijdbron","match":"Wedstrijd"},
"zh":{"head":"串關投注","lost":"失敗","won":"成功","bad":"失敗","conclusion":"為什麼串關投注失敗？","stats":"2 單位 • 賠率 1.85 • 2 項中 1 項成功","footer":"真實賽事 • 真實分析 • 公開透明的結果","source":"賽事資料來源","match":"比賽"}
}
RED=(255,59,108,255);GREEN=(57,243,135,255);WHITE=(255,255,255,255);BLUE=(170,222,249,255)
def translated(story,lang):
    if lang=="de":
        return {"summary":story["summary_de"],"note":story["note_de"],"legs":[
         {"narrative":leg["narrative_de"],"market":leg["market_label"],"events":[ev["text"] for ev in leg["key_events"]]}
         for leg in story["legs"]]}
    return story["translations"][lang]

def pill(d,text,x,y,color):
    f=fit_font(d,text,156,21,17)
    w=174
    d.rounded_rectangle((x,y,x+w,y+40),radius=10,fill=(4,20,39,238),outline=color,width=3)
    b=d.textbbox((0,0),text,font=f)
    px=x+round(w/2-(b[0]+b[2])/2);py=y+round(20-(b[1]+b[3])/2)
    assert x+8<=px+b[0] and px+b[2]<=x+w-8
    d.text((px,py),text,font=f,fill=color)

def cover(story,lang):
    set_render_locale(lang)
    cp=C[lang]
    im=ImageOps.fit(Image.open(TEMPLATE).convert("RGBA"),(1200,630),method=Image.Resampling.LANCZOS)
    overlay=Image.new("RGBA",(1200,630),(0,0,0,0))
    px=overlay.load()
    for x in range(0,745):
       a=int(146*max(0,min(1,(745-x)/220)))
       for y in range(147,630):px[x,y]=(1,9,26,a)
    im=Image.alpha_composite(im,overlay)
    d=ImageDraw.Draw(im)
    x=64
    d.text((x,156),cp["head"],font=font(21),fill=BLUE)
    d.text((x,188),cp["lost"],font=fit_font(d,cp["lost"],650,52,35),fill=WHITE)
    d.rounded_rectangle((x,251,700,257),radius=2,fill=RED)
    for i,leg in enumerate(story["legs"]):
       y=269+i*110
       title=(leg["home"]+" – "+leg["away"]).upper()
       d.text((x,y),title,font=fit_font(d,title,637,27,18),fill=WHITE)
       d.text((x,y+35),leg["score"],font=font(46),fill=WHITE)
       pill(d,cp["won"] if leg["selection_outcome"]=="WON" else cp["bad"],305,y+44,
            GREEN if leg["selection_outcome"]=="WON" else RED)
       if i==0:d.rounded_rectangle((x,y+103,700,y+106),radius=1,fill=(57,173,245,255))
    d.rounded_rectangle((x,510,700,515),radius=2,fill=(40,179,239,255))
    d.text((x,528),cp["stats"],font=fit_font(d,cp["stats"],645,19,15),fill=WHITE)
    d.text((x,562),cp["footer"],font=fit_font(d,cp["footer"],650,15,12,bold=False),fill=BLUE)
    return im

def webpage(story,lang,imageurl):
    c=C[lang];l=LABELS[lang];tr=translated(story,lang)
    url=DOMAIN+"/"+lang+"/tipps/ergebnis/"+TID+"/"
    heading=c["head"]+" – "+c["lost"]+": Borussia Dortmund – Werder Bremen + Málaga – Espanyol"
    description=tr["summary"][:250]
    alt=heading+" • Dortmund 2:2 Bremen • Málaga 1:1 Espanyol"
    alternates="\n".join('<link rel="alternate" hreflang="'+HREF[q]+'" href="'+DOMAIN+"/"+q+"/tipps/ergebnis/"+TID+'/">' for q in LANGS)
    alternates+='\n<link rel="alternate" hreflang="x-default" href="'+DOMAIN+"/de/tipps/ergebnis/"+TID+'/">'
    ld={"@context":"https://schema.org","@type":"Article",
     "headline":heading,"description":description,"inLanguage":HREF[lang],
     "datePublished":"2026-10-10","dateModified":"2026-10-10",
     "mainEntityOfPage":{"@type":"WebPage","@id":url},
     "author":{"@type":"Organization","name":"BetInsight.club"},
     "publisher":{"@type":"Organization","name":"BetInsight.club","url":DOMAIN},
     "image":{"@type":"ImageObject","contentUrl":imageurl,"width":1200,"height":630},
     "citation":[leg["source_url"] for leg in story["legs"]]}
    ldtext=json.dumps(ld,ensure_ascii=False).replace("<","\\u003c")
    sections=[]
    for i,leg in enumerate(story["legs"]):
        trleg=tr["legs"][i]
        events="\n".join("<li><strong>"+esc(ev["minute"])+"</strong> "+esc(trleg["events"][n])+"</li>" for n,ev in enumerate(leg["key_events"]))
        status=c["won"] if leg["selection_outcome"]=="WON" else c["bad"]
        sections.append('<section class="story-leg"><div class="story-leg-header"><span class="story-leg-num">'+str(i+1)+'</span><h3>'+esc(leg["home"]+" – "+leg["away"])+'</h3><strong>'+esc(leg["score"])+'</strong></div><p class="story-leg-market">'+esc(trleg["market"])+" · "+esc(status)+'</p><ul class="story-events">'+events+'</ul><p>'+esc(trleg["narrative"])+'</p><p class="story-source"><a target="_blank" rel="noopener noreferrer" href="'+esc(leg["source_url"])+'">'+esc(c["source"])+' ↗</a></p></section>')
    html_lang=HREF[lang] if lang in ("pt","zh") else lang
    return f"""<!doctype html><html lang="{html_lang}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(heading)} | BetInsight</title>
<meta name="description" content="{esc(description)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="{esc(url)}">{alternates}
<meta property="og:type" content="article"><meta property="og:locale" content="{OG[lang]}">
<meta property="og:site_name" content="BetInsight.club">
<meta property="og:title" content="{esc(heading)}"><meta property="og:description" content="{esc(description)}">
<meta property="og:url" content="{esc(url)}"><meta property="og:image" content="{esc(imageurl)}">
<meta property="og:image:secure_url" content="{esc(imageurl)}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{esc(alt)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{esc(heading)}">
<meta name="twitter:description" content="{esc(description)}"><meta name="twitter:image" content="{esc(imageurl)}">
<script type="application/ld+json">{ldtext}</script>
<link rel="stylesheet" href="/assets/tip-report.css?v=20261010-6"><style>{CSS}
.combo-summary{{background:#123b45;padding:20px;border-radius:14px;border:1px solid #2c9c8d}}
.original-archive{{margin:30px 0;border-block:1px solid #215c71;padding:20px 0}}
.original-archive>p{{font-size:14px;color:#aac9d7}}
.original-archive .wrap{{width:100%;max-width:100%}}
.original-archive .layout{{display:grid;grid-template-columns:minmax(0,1fr) 230px;gap:15px;padding:0}}
.original-archive .article{{padding:20px}}
.original-archive .sidebar{{position:static}}
@media(max-width:800px){{.original-archive .layout{{grid-template-columns:1fr}}}}
</style></head><body>
<main><header><a href="{DOMAIN}/{lang}/">betInsight.club</a><a href="{DOMAIN}/{lang}/tipps/">{esc(l['back'])}</a></header>
<article><figure class="hero" style="margin:0"><img src="{esc(imageurl)}" width="1200" height="630" alt="{esc(alt)}" fetchpriority="high"></figure>
<p class="kicker">BetInsight · {esc(l['read'])}</p><h1>{esc(heading)}</h1>
<span class="status lose">{esc(l['lost'])}</span>
<div class="keydata"><span>09.10.2026</span><span>2 Units</span><span>{esc(l['odds'])}: 1,85</span></div>
<section class="original-archive"><h2>{esc(l['original'])}</h2><p>{esc(l['origin_desc'])}</p>
<div data-report-root data-report-embedded="1"><p>{esc(l['loading'])}</p></div></section>
<section class="article"><h2>{esc(l['highlights'])}</h2>
{''.join(sections)}<div class="combo-summary"><h2>{esc(c['conclusion'])}</h2><p>{esc(tr['summary'])}</p></div>
<p class="note">{esc(tr['note'])}</p></section></article>
<p class="footer">{esc(c['footer'])}</p></main>
<script defer src="/assets/result-localization.js?v=20261010-1"></script>
<script defer src="/assets/tip-report-live.js?v=20261010-6"></script>
</body></html>"""

def main():
    story=json.loads(STORY.read_text(encoding="utf-8"))
    assert story["tipp_id"]==TID and story["outcome"]=="LOST" and len(story["legs"])==2
    for lang in LANGS:
        t=translated(story,lang)
        assert len(t["legs"])==2 and all(len(x["events"])==len(y["key_events"]) for x,y in zip(t["legs"],story["legs"]))
        pic=ROOT/"assets"/"og"/(TID.lower()+"-"+lang+"-combo-"+VERS+".jpg")
        scratch=ROOT/"assets"/"og"/(TID.lower()+"-"+lang+"-combo-temp.png")
        scratch.parent.mkdir(parents=True,exist_ok=True)
        cover(story,lang).save(scratch,"PNG",optimize=True)
        url=DOMAIN+"/"+lang+"/tipps/ergebnis/"+TID+"/"
        export_image(scratch,pic,{"title":C[lang]["head"]+" – "+C[lang]["lost"],
          "description":t["summary"],"graphic_creator":"BetInsight.club",
          "rights":"BetInsight.club branded editorial graphics; independently cited match events",
          "source_url":url})
        scratch.unlink()
        page=ROOT/lang/"tipps"/"ergebnis"/TID/"index.html"
        page.parent.mkdir(parents=True,exist_ok=True)
        text=webpage(story,lang,DOMAIN+"/assets/og/"+pic.name)
        assert 'og:image' in text and 'application/ld+json' in text and 'data-report-embedded="1"' in text
        assert text.count('hreflang=')==9
        assert 'pt-BR' not in text and 'pt_BR' not in text
        page.write_text(text,encoding="utf-8")
        print(lang,page,pic)
if __name__=="__main__":main()
