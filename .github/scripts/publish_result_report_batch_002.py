#!/usr/bin/env python3
"""BetInsight batch 002: five real settled tips, 8 native languages, 40 approved-logo previews.
Source of truth: published tip data in docs/.../block-002-editorial.json;
match chronology: linked official club / league / national association sources.
No Supabase or original 1,000 EUR statistics writes.
"""
import datetime as dt, json, re
from pathlib import Path
from PIL import Image
from publish_result_report_batch import ROOT, DOMAIN, image_for, export_image, valid
from publish_result_report_multilingual import LANGS, HREF, OG, make_page, url_for

SOURCE=ROOT/"docs"/"result-report-batches"/"block-002-editorial.json"
STATE=ROOT/"docs"/"result-report-batches"/"block-002-build.json"
VERSION="v1"
EVENT_TEMPLATES={
"de":{"goal":"{player} erzielt das {score}.","own":"Eigentor durch {player}: {score}.","penalty":"{player} verwandelt einen Strafstoß zum {score}.","second_yellow":"{player} sieht Gelb-Rot, der Spielstand bleibt {score}."},
"en":{"goal":"{player} scores to make it {score}.","own":"Own goal by {player}: {score}.","penalty":"{player} converts a penalty for {score}.","second_yellow":"{player} is sent off for a second yellow; the score is {score}."},
"es":{"goal":"{player} marca el {score}.","own":"Autogol de {player}: {score}.","penalty":"{player} convierte un penalti para el {score}.","second_yellow":"{player} es expulsado por doble amarilla con el marcador {score}."},
"pt":{"goal":"{player} marca o {score}.","own":"Autogolo de {player}: {score}.","penalty":"{player} converte um penálti para o {score}.","second_yellow":"{player} é expulso por acumulação de amarelos com o resultado em {score}."},
"it":{"goal":"{player} segna il {score}.","own":"Autogol di {player}: {score}.","penalty":"{player} trasforma un rigore per il {score}.","second_yellow":"{player} viene espulso per doppia ammonizione sul {score}."},
"fr":{"goal":"{player} marque : {score}.","own":"But contre son camp de {player} : {score}.","penalty":"{player} transforme un penalty : {score}.","second_yellow":"{player} est expulsé après un deuxième jaune, score {score}."},
"nl":{"goal":"{player} scoort en brengt de stand op {score}.","own":"Eigen doelpunt van {player}: {score}.","penalty":"{player} benut een strafschop: {score}.","second_yellow":"{player} krijgt zijn tweede gele kaart en moet vertrekken bij {score}."},
"zh":{"goal":"{player}進球，比分改寫為{score}。","own":"{player}踢進烏龍球，比分{score}。","penalty":"{player}主罰十二碼得手，比分{score}。","second_yellow":"{player}領到第二張黃牌被罰下，比分仍為{score}。"}
}
def story_for(row):
    leg={"home":row["home"],"away":row["away"],"score":row["score"],"status":"FT","market_label":row["market"],
         "selection_outcome":row["outcome"],"source_url":row["source_url"],"source_label":"Offizieller Spielbericht / offizieller Ticker",
         "key_events":[{"minute":ev["minute"],
                        "text":EVENT_TEMPLATES["de"][ev["kind"]].format(**ev),
                        "text_en":EVENT_TEMPLATES["en"][ev["kind"]].format(**ev)}
                        for ev in row["events"]],
         "narrative_de":row["copy"]["de"][2],"narrative_en":row["copy"]["en"][2]}
    return {
       "schema":"betinsight_verified_match_story_v1","tipp_id":row["tipp_id"],"match_date":row["match_date"],
       "kind":"single","outcome":row["outcome"],"status":"GEWONNEN" if row["outcome"]=="WON" else "VERLOREN",
       "home":row["home"],"away":row["away"],"match":row["match"],"score":row["score"],"market":row["market"],
       "odds":row["odds"],"units":row["units"],"league":row["league"],
       "verified_source":"Independent official match report","source_url":row["source_url"],
       "source_checked_at":"2026-10-10","leg_status":row["outcome"],"legs":[leg],
       "summary_de":row["copy"]["de"][1],"summary_en":row["copy"]["en"][1],
       "note_de":"Nachträgliche Prüfung des vor dem Spiel veröffentlichten Tipps. Quote, Einsatz und Wertung stammen aus dem bestätigten BetInsight-Master-Backoffice. Spielverlauf laut verlinkter öffentlicher Quelle.",
       "note_en":"Post-match review of a pre-match tip. Odds, units and grading are from the confirmed BetInsight Master Backoffice. Match events are from the linked public source.",
       "translations":{language:{
          "headline":row["copy"][language][0],
          "market":row["copy"][language][3],
          "summary":row["copy"][language][1],
          "narrative":row["copy"][language][2],
          "events":[EVENT_TEMPLATES[language][e["kind"]].format(**e) for e in row["events"]]}
          for language in LANGS if language!="de"}
    }

def main():
    source=json.loads(SOURCE.read_text(encoding="utf8"))
    assert source["language_codes"]==list(LANGS),source["language_codes"]
    rows=source["items"]
    assert len(rows)==5 and len({v["tipp_id"] for v in rows})==5
    generated=[]
    for row in rows:
      item=story_for(row)
      valid(item)
      assert item["outcome"] in ("WON","LOST") and row["units"]>0 and row["odds"]>1
      id=row["tipp_id"]
      for language in LANGS:
        assert len(item["translations"].get(language,{}).get("events",[]))==len(row["events"]) if language!="de" else True
      storyfile=ROOT/"assets"/"match-report-stories"/(id+".json")
      storyfile.parent.mkdir(parents=True,exist_ok=True)
      storyfile.write_text(json.dumps(item,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
      for lang in LANGS:
        c=row["copy"][lang]
        tr={"headline":c[0],"market":c[3],"summary":c[1],"narrative":c[2],
            "events":[EVENT_TEMPLATES[lang][ev["kind"]].format(**ev) for ev in row["events"]]}
        img=ROOT/"assets"/"og"/(id.lower()+"-"+lang+"-"+VERSION+".jpg")
        tmp=ROOT/"assets"/"og"/(id.lower()+"-"+lang+"-batch2-tmp.png")
        img.parent.mkdir(parents=True,exist_ok=True)
        image_for(item,lang=lang).save(tmp,"PNG",optimize=True)
        url=url_for(id,lang)
        metadata={"title":tr["headline"],"description":tr["summary"],
             "graphic_creator":"BetInsight.club (original approved branded master)",
             "rights":"BetInsight.club editorial artwork; independently sourced match facts",
             "source_url":url}
        export_image(tmp,img,metadata)
        tmp.unlink()
        page=ROOT/lang/"tipps"/"ergebnis"/id/"index.html"
        page.parent.mkdir(parents=True,exist_ok=True)
        markup=make_page(item,id,lang,tr,DOMAIN+"/assets/og/"+img.name)
        page.write_text(markup,encoding="utf8")
        with Image.open(img) as im:
          assert im.size==(1200,630) and im.getexif().get(270),img
        assert len(re.findall(r'rel="alternate" hreflang=',markup))==9, (lang,id)
        assert "data-report-embedded" in markup
        assert "application/ld+json" in markup and "og:image" in markup
        assert row["source_url"] in markup, (lang,id)
        assert len(re.findall(r'<li><strong>',markup))==len(row["events"]), (lang,id)
        assert 'pt-BR' not in markup and '🇧🇷' not in markup and "Português (Brasil)" not in markup
        assert (f'<html lang="{HREF[lang]}">' if lang in ["pt","zh"] else f'<html lang="{lang}">') in markup
        generated.append({"id":id,"language":lang,"url":url,"image":img.name,"verified":True})
        print("VERIFIED",lang,id,img.name)
    assert len(generated)==40
    STATE.write_text(json.dumps({"batch_id":"002","tip_count":5,"languages":list(LANGS),
       "pages":40,"images":40,"preserved_original_stats":True,"results":generated},indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print("SUCCESS: 5 source-backed official reports x 8 native languages = 40 SEO pages + 40 original-logo JPGs")
if __name__=="__main__": main()
