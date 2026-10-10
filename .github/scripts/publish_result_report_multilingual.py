#!/usr/bin/env python3
"""Mandatory 8-language, all-or-nothing BetInsight result-review publishing.

One original user-uploaded background containing original brand logo;
unique localized overlay and EXIF image per report; independently indexable
HTML/canonical/OG/JSON-LD per locale; retain existing master-confirmed
original BetInsight report and both 1000-EUR statistics via embed.
"""
import datetime as dt
import html
import json
import re
from pathlib import Path
from PIL import Image

from publish_result_report_batch import (ROOT,DOMAIN,BATCH,CSS,IMAGE_W,IMAGE_H,
                                         image_for,export_image,valid,clean)

LANGS=("de","en","es","pt","it","fr","nl","zh")
LABELS={
"de":dict(native="Deutsch",page_title="Tippauswertung und Spielbericht",title="BetInsight-Spielbericht",tip="Veröffentlichter Tipp",original="Ursprünglicher vollständiger Bericht und Statistik",origin_desc="Die Originaldaten bleiben vollständig erhalten: Tipp, Quote, Units, Ergebniswertung, Nachweis, Bestätigung und die 1.000-€-Statistik mit und ohne Zinseszins.",loading="Ursprünglicher Bericht wird geladen …",original_tip="Ursprüngliche Auswahl",highlights="Spielverlauf und Höhepunkte",outcome="Warum wurde der Tipp so gewertet?",source="Offizielle Spielquelle",note="Dies ist die nachträgliche Auswertung eines bereits veröffentlichten Tipps. Die ursprünglichen Buchungen und Statistikberechnungen wurden nicht verändert.",win="Gewonnen",lost="Verloren",odds="Quote",units="Units",market="Markt",date="Datum",back="Weitere Tipps",og_foot="Echte Spiele · Echte Analysen · Ehrliche Ergebnisse",original_link="Originalbericht öffnen",read="Nachträgliche Tippauswertung",source_line="Der bestätigte Tipp und die Wertung stammen aus dem BetInsight-Master-Backoffice. Spielereignisse stammen aus der unten verlinkten Quelle."),
"en":dict(native="English",page_title="Tip result and match review",title="BetInsight Match Review",tip="Published selection",original="Full original report and statistics",origin_desc="All original details remain intact: selection, odds, units, grading, evidence, confirmation and the €1,000 statistics with and without compounding.",loading="Loading original report …",original_tip="Original selection",highlights="Match timeline and key moments",outcome="Why was this selection graded this way?",source="Official match source",note="This is a retrospective review of an earlier published selection. Original bookings and statistics have not been modified.",win="Won",lost="Lost",odds="Odds",units="Units",market="Market",date="Date",back="More tips",og_foot="Real Matches · Real Analysis · Honest Results",original_link="Open original report",read="Post-match review",source_line="The selection and grading are taken from BetInsight's confirmed Master Backoffice. Match events come from the linked source."),
"es":dict(native="Español",page_title="Resultado y análisis del pronóstico",title="Crónica de BetInsight",tip="Pronóstico publicado",original="Informe original completo y estadísticas",origin_desc="Se conservan la selección inicial, cuota, units, valoración, pruebas, confirmación y el cálculo de 1.000 € con y sin interés compuesto.",loading="Cargando el informe original …",original_tip="Selección original",highlights="Desarrollo del partido y momentos clave",outcome="¿Por qué se valoró así el pronóstico?",source="Fuente oficial del partido",note="Análisis posterior de un pronóstico publicado antes del partido. No se han modificado las operaciones ni las estadísticas originales.",win="Ganado",lost="Perdido",odds="Cuota",units="Units",market="Mercado",date="Fecha",back="Otros pronósticos",og_foot="Partidos reales · Análisis reales · Resultados honestos",original_link="Abrir informe original",read="Análisis posterior al encuentro",source_line="La selección y la valoración proceden del Master Backoffice confirmado de BetInsight. Los hechos del encuentro se basan en la fuente enlazada."),
"pt":dict(native="Português (Portugal)",page_title="Resultado e análise do prognóstico",title="Análise BetInsight",tip="Prognóstico publicado",original="Relatório original completo e estatísticas",origin_desc="Mantêm-se todos os dados originais: prognóstico, cotação, units, resultado, comprovativos, confirmação e estatísticas de 1 000 € com e sem capitalização.",loading="A carregar o relatório original …",original_tip="Seleção original",highlights="Decorrer do jogo e momentos decisivos",outcome="Porque foi o prognóstico avaliado desta forma?",source="Fonte oficial do jogo",note="Análise posterior a um prognóstico publicado antes do jogo. Os registos e cálculos estatísticos originais não foram alterados.",win="Ganho",lost="Perdido",odds="Cotação",units="Units",market="Mercado",date="Data",back="Mais prognósticos",og_foot="Jogos reais · Análises reais · Resultados transparentes",original_link="Abrir relatório original",read="Análise após o jogo",source_line="O prognóstico e o resultado foram confirmados no Master Backoffice da BetInsight. Os acontecimentos do jogo provêm da fonte indicada."),
"it":dict(native="Italiano",page_title="Risultato e analisi del pronostico",title="Analisi partita BetInsight",tip="Pronostico pubblicato",original="Report originale completo e statistiche",origin_desc="Restano tutti i dati originali: pronostico, quota, units, valutazione, prove, conferma e statistiche su € 1.000 con e senza interesse composto.",loading="Caricamento del report originale …",original_tip="Selezione originale",highlights="Svolgimento e momenti decisivi",outcome="Perché il pronostico è stato valutato così?",source="Fonte ufficiale della partita",note="Analisi successiva di un pronostico pubblicato prima della gara. I dati e i calcoli statistici originali non sono stati modificati.",win="Vinto",lost="Perso",odds="Quota",units="Units",market="Mercato",date="Data",back="Altri pronostici",og_foot="Partite vere · Analisi vere · Risultati onesti",original_link="Apri report originale",read="Analisi dopo la partita",source_line="Pronostico e valutazione provengono dal Master Backoffice BetInsight confermato. Gli eventi derivano dalla fonte collegata."),
"fr":dict(native="Français",page_title="Résultat et analyse du pronostic",title="Analyse de match BetInsight",tip="Pronostic publié",original="Rapport original intégral et statistiques",origin_desc="Les données d'origine restent intactes : choix, cote, units, résultat, justificatifs, confirmation et statistiques sur 1 000 € avec et sans intérêts composés.",loading="Chargement du rapport original …",original_tip="Choix initial",highlights="Déroulement du match et temps forts",outcome="Pourquoi le pronostic a-t-il été ainsi évalué ?",source="Source officielle du match",note="Analyse rétrospective d'un pronostic publié avant la rencontre. Les enregistrements et calculs statistiques d'origine n'ont pas été modifiés.",win="Gagné",lost="Perdu",odds="Cote",units="Units",market="Marché",date="Date",back="Autres pronostics",og_foot="Matchs réels · Analyses réelles · Résultats honnêtes",original_link="Ouvrir le rapport original",read="Analyse après le match",source_line="Le choix et son résultat proviennent du Master Backoffice BetInsight confirmé. Les événements viennent de la source liée."),

"nl":dict(native="Nederlands",page_title="Resultaat en wedstrijdanalyse",title="BetInsight-wedstrijdanalyse",tip="Gepubliceerde voorspelling",original="Volledig oorspronkelijk rapport en statistieken",origin_desc="De oorspronkelijke selectie, quote, Units, beoordeling, bewijs, bevestiging en beide berekeningen voor € 1.000 blijven ongewijzigd.",loading="Oorspronkelijk rapport wordt geladen …",original_tip="Oorspronkelijke selectie",highlights="Wedstrijdverloop en beslissende momenten",outcome="Waarom kreeg de voorspelling deze beoordeling?",source="Officiële wedstrijdbron",note="Dit is een analyse achteraf van een eerder gepubliceerde voorspelling. De oorspronkelijke registraties en statistieken zijn niet aangepast.",win="Gewonnen",lost="Verloren",odds="Quote",units="Units",market="Markt",date="Datum",back="Meer voorspellingen",og_foot="Echte wedstrijden · Echte analyses · Eerlijke resultaten",original_link="Oorspronkelijk rapport openen",read="Analyse na afloop",source_line="De voorspelling en uitkomst komen uit het bevestigde BetInsight Master Backoffice. De wedstrijdevenementen zijn afkomstig uit de vermelde bron."),
"zh":dict(native="繁體中文",page_title="投注結果及賽後分析",title="BetInsight 賽後分析",tip="賽前公布的預測",original="原始完整報告與統計",origin_desc="原始預測、賠率、單位、結果判定、證明、確認資料，以及以1,000歐元計算的固定與複利統計，均保持不變。",loading="正在載入原始報告……",original_tip="原始投注選擇",highlights="比賽過程與關鍵時刻",outcome="為什麼這項投注如此判定？",source="官方賽事資料來源",note="這是對賽前發布預測的賽後回顧，未修改原有投注紀錄或統計計算。",win="獲勝",lost="失敗",odds="賠率",units="單位",market="投注類型",date="日期",back="更多預測",og_foot="真實賽事 · 真實分析 · 公開透明的結果",original_link="查看原始報告",read="賽後回顧",source_line="預測與判定來自BetInsight主後台的已確認紀錄，賽事資料取自下方連結的公開來源。"),
}
OG={
"de":"de_DE","en":"en_GB","es":"es_ES","pt":"pt_PT","it":"it_IT","fr":"fr_FR","nl":"nl_NL","zh":"zh_TW"
}
HREF={"de":"de-DE","en":"en-GB","es":"es-ES","pt":"pt-PT","it":"it-IT","fr":"fr-FR","nl":"nl-NL","zh":"zh-Hant-TW"}
SOURCE_LABEL={"de":"LaLiga / offizieller Spielbericht","en":"LaLiga / official match report","es":"LaLiga / crónica oficial del partido","pt":"LaLiga / relato oficial do jogo","it":"LaLiga / resoconto ufficiale","fr":"LaLiga / compte rendu officiel","nl":"LaLiga / officieel wedstrijdverslag","zh":"LaLiga／官方比賽報告"}

def esc(x):
    return html.escape(str(x or ""),quote=True)

def url_for(id,lang):
    return f"{DOMAIN}/{lang}/tipps/ergebnis/{id}/"

def prepare(item,id,lang,translations):
    if lang=="de":
        leg=item["legs"][0]
        return {"headline":item["match"]+": "+item["score"],"market":item["market"],
                "summary":item["summary_de"],"narrative":leg["narrative_de"],
                "events":[e["text"] for e in leg["key_events"]]}
    translations=translations["items"].get(id,{}).get(lang)
    if not translations:
        raise ValueError(f"Missing localized editorial copy: {id} / {lang}")
    orig=item["legs"][0]["key_events"]
    if not isinstance(translations.get("events"),list) or len(translations["events"])!=len(orig):
        raise ValueError(f"Wrong event translation count: {id} / {lang}")
    for key in ("headline","market","summary","narrative"):
        if len(str(translations.get(key,"")).strip())<12:
            raise ValueError(f"Missing detailed translation: {id} / {lang} / {key}")
    return translations

def make_page(item,id,lang,tr,imgurl):
    L=LABELS[lang]
    html_lang=HREF[lang] if lang in ("pt","zh") else lang
    won=item["outcome"]=="WON"
    term=L["win"] if won else L["lost"]
    original=f"{DOMAIN}/{lang}/tipps/bericht/?id={id}"
    url=url_for(id,lang)
    caption=f"{item['match']} {item['score']} – {L['title']} – {term}"
    seo_title=f"{item['home']} – {item['away']} {item['score']} | {term} | BetInsight"
    description=(tr["summary"]+" "+L["source_line"])[:265]
    alt=f"{L['title']}: {item['match']} {item['score']}, {term}. {tr['market']}"
    date=dt.date.fromisoformat(item["match_date"]).strftime("%d.%m.%Y")
    alternates="\n".join(f'<link rel="alternate" hreflang="{HREF[l]}" href="{esc(url_for(id,l))}">' for l in LANGS)
    alternates+='\n<link rel="alternate" hreflang="x-default" href="'+esc(url_for(id,"de"))+'">'
    timeline="\n".join(f'<li><strong>{esc(event["minute"])}</strong> {esc(tr["events"][i])}</li>' for i,event in enumerate(item["legs"][0]["key_events"]))
    ld={
        "@context":"https://schema.org","@type":"Article",
        "mainEntityOfPage":{"@type":"WebPage","@id":url},
        "headline":seo_title,"description":description,
        "inLanguage":HREF[lang],"datePublished":"2026-10-10","dateModified":"2026-10-10",
        "author":{"@type":"Organization","name":"BetInsight.club","url":DOMAIN+"/"},
        "publisher":{"@type":"Organization","name":"BetInsight.club","url":DOMAIN+"/"},
        "image":{"@type":"ImageObject","contentUrl":imgurl,"width":IMAGE_W,
                 "height":IMAGE_H,"caption":caption},
        "citation":[item["source_url"]]
    }
    ldjson=json.dumps(ld,ensure_ascii=False).replace("<","\\u003c")
    share=f"{L['title']} | {item['home']} – {item['away']} | {item['score']} | {term}"
    price=str(item["odds"]).replace(".",",")
    return f"""<!doctype html>
<html lang="{html_lang}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(seo_title)}</title>
<meta name="description" content="{esc(description)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="{esc(url)}">
{alternates}
<meta property="og:type" content="article">
<meta property="og:site_name" content="BetInsight.club">
<meta property="og:locale" content="{OG[lang]}">
<meta property="og:title" content="{esc(share)}">
<meta property="og:description" content="{esc(description)}">
<meta property="og:url" content="{esc(url)}">
<meta property="og:image" content="{esc(imgurl)}">
<meta property="og:image:secure_url" content="{esc(imgurl)}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{esc(alt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(share)}">
<meta name="twitter:description" content="{esc(description)}">
<meta name="twitter:image" content="{esc(imgurl)}">
<meta name="twitter:image:alt" content="{esc(alt)}">
<script type="application/ld+json">{ldjson}</script>
<link rel="stylesheet" href="/assets/tip-report.css?v=20261010-3">
<style>{CSS}
.languages{{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin:10px 0 28px;}}
.languages a{{font-size:12px;text-decoration:none;border:1px solid #2c6b83;color:#c7ecff;border-radius:8px;padding:6px 10px;background:#052c43}}
.languages a.sel{{color:#021c2b;background:#82e8fa;font-weight:850}}
.original-archive{{margin:28px 0 34px;padding:20px 0 25px;border-block:1px solid #28586e}}
.original-archive>h2{{font-size:clamp(22px,3.2vw,30px);margin:0 0 5px}}
.original-archive>p{{margin:5px 0 18px;color:#b0d3df;font-size:14px}}
.original-archive .wrap{{width:100%;max-width:100%}}
.original-archive .layout{{display:grid;grid-template-columns:minmax(0,1fr) 230px;gap:14px;padding:0}}
.original-archive .article{{padding:clamp(15px,3vw,28px)}}
.original-archive .article h2{{font-size:clamp(20px,3vw,27px)}}
.original-archive .sidebar{{position:static}}
@media(max-width:820px){{.original-archive .layout{{grid-template-columns:1fr}}.original-archive .sidebar{{grid-template-columns:1fr}}}}
@media(max-width:470px){{.original-archive .stats-grid{{grid-template-columns:1fr}}}}
</style>
</head><body>
<main><header><a href="{DOMAIN}/{lang}/">betInsight.club</a><span class="crumb"><a href="{DOMAIN}/{lang}/tipps/">{esc(L['back'])}</a></span></header>
<article><figure class="hero" style="margin:0"><img src="{esc(imgurl)}" alt="{esc(alt)}" width="1200" height="630" fetchpriority="high"></figure>
<p class="kicker">BetInsight · {esc(L["read"])}</p>
<h1>{esc(item['match'])}: {esc(item['score'])}</h1>
<span class="status {'win' if won else 'lose'}">{esc(term)}</span>
<div class="keydata"><span>{esc(L['date'])}: {esc(date)}</span><span>{esc(L['market'])}: {esc(tr['market'])}</span><span>{esc(L['odds'])}: {esc(price)}</span><span>{esc(L['units'])}: {item['units']:g}</span></div>
<section class="original-archive"><h2>{esc(L['original'])}</h2>
<p>{esc(L['origin_desc'])}</p>
<div data-report-root data-report-embedded="1"><p>{esc(L['loading'])}</p></div>
</section>
<section class="article"><h2>{esc(L['highlights'])}</h2>
<h3>{esc(tr['headline'])}</h3>
<ul class="timeline">{timeline}</ul>
<p>{esc(tr['narrative'])}</p>
<div class="conclusion"><h2>{esc(L['outcome'])}</h2><p>{esc(tr['summary'])}</p></div>
<p class="source">{esc(L['source'])}: <a href="{esc(item['source_url'])}" target="_blank" rel="noopener noreferrer">{esc(SOURCE_LABEL[lang])} ↗</a></p>
<p class="source">{esc(L['source_line'])}</p>
<p class="note">{esc(L['note'])}</p></section>
<nav><a href="{esc(original)}">{esc(L['original_link'])} ↗</a><a href="{DOMAIN}/{lang}/tipps/">{esc(L['back'])} ↗</a></nav>
</article><p class="footer">{esc(L['og_foot'])}</p></main>
<script defer src="/assets/result-report-locale.js?v=20261010-1"></script>
<script defer src="/assets/result-localization.js?v=20261010-1"></script>
<script defer src="/assets/tip-report-live.js?v=20261010-6"></script>
</body></html>"""

def main():
    batch=json.loads(BATCH.read_text(encoding="utf-8"))
    ids=batch["tip_ids"]
    assert tuple(batch["required_languages"])==LANGS
    translations=json.loads((ROOT/"docs"/"result-report-batches"/"block-001-translations.json").read_text(encoding="utf-8"))
    assert len(ids)==5 and len(set(ids))==5
    count=0
    for id in ids:
        item=json.loads((ROOT/"assets"/"match-report-stories"/(id+".json")).read_text(encoding="utf-8"))
        valid(item)
        assert item["tipp_id"]==id
        for lang in LANGS:
            tr=prepare(item,id,lang,translations)
            image_path=ROOT/"assets"/"og"/(id.lower()+"-"+lang+"-v2.jpg")
            image_url=DOMAIN+"/assets/og/"+image_path.name
            url=url_for(id,lang)
            source=ROOT/"assets"/"og"/(id.lower()+"-"+lang+"-temp.png")
            image_for(item,lang=lang).save(source,"PNG",optimize=True)
            metadata={"title":tr["headline"],"description":tr["summary"],
                      "graphic_creator":"BetInsight.club (graphical presentation from its own branded template)",
                      "rights":"BetInsight.club – layout; football facts cited from source.","source_url":url}
            export_image(source,image_path,metadata)
            source.unlink(missing_ok=True)
            destination=ROOT/lang/"tipps"/"ergebnis"/id/"index.html"
            destination.parent.mkdir(parents=True,exist_ok=True)
            destination.write_text(make_page(item,id,lang,tr,image_url),encoding="utf-8")
            with Image.open(image_path) as v:
                assert v.size==(1200,630)
                assert v.getexif().get(270)
            markup=destination.read_text(encoding="utf-8")
            assert image_url in markup and f'<html lang="{HREF[lang] if lang in ("pt","zh") else lang}">' in markup
            assert "data-report-embedded" in markup
            assert len(re.findall(r'link rel="alternate" hreflang=',markup))==9
            assert 'application/ld+json' in markup
            assert all(t in markup for t in ["og:image","twitter:image","rel=\"canonical\""])
            count+=1
            print(json.dumps({"lang":lang,"id":id,"page":url,"image":image_url,"verified":True},ensure_ascii=False))
    assert count==40, count
    out=ROOT/"docs"/"result-report-batches"/"block-001-i18n-build.json"
    out.write_text(json.dumps({"languages":list(LANGS),"tip_count":len(ids),
       "page_count":count,"image_count":count,"all_original_statistical_components_preserved":True,
       "original_tip_data_mutated":False},indent=2)+"\n",encoding="utf-8")
    print(f"SUCCESS: {count} fully localized SEO HTML pages + {count} JPEG previews")

if __name__=="__main__":main()
