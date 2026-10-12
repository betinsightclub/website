#!/usr/bin/env python3
"""Final historic result batch 004: 2 confirmed singles, 8 languages, 16 own OG images.
Original BetInsight bookings/stats untouched; externally documented match chronology.
"""
import datetime as dt
import json,re
from pathlib import Path
from PIL import Image
from publish_result_report_batch import ROOT,DOMAIN,image_for,export_image
from publish_result_report_batch_002 import story_for,EVENT_TEMPLATES
from publish_result_report_multilingual import LANGS,HREF,make_page,url_for

MANIFEST=ROOT/"docs"/"result-report-batches"/"block-004-editorial.json"
STATE=ROOT/"docs"/"result-report-batches"/"block-004-build.json"
NON_GOALS={
"de":{"substitution":"{player} wird eingewechselt; es steht {score}.","var":"VAR prüft den Treffer von {player} und lässt das {score} bestehen.","post":"{player} trifft den Pfosten; es bleibt beim {score}."},
"en":{"substitution":"{player} comes on as a substitute; score {score}.","var":"VAR checks the {player} goal and confirms {score}.","post":"{player} strikes the post; the score remains {score}."},
"es":{"substitution":"Entra {player} como suplente con el marcador {score}.","var":"El VAR revisa y confirma el gol de {player}: {score}.","post":"{player} remata al poste; sigue el {score}."},
"pt":{"substitution":"{player} entra como suplente com o resultado em {score}.","var":"O VAR analisa e valida o golo de {player}: {score}.","post":"{player} acerta no poste; mantém-se o {score}."},
"it":{"substitution":"Entra {player} dalla panchina sul {score}.","var":"Il VAR controlla e conferma la rete di {player}: {score}.","post":"{player} colpisce il palo; resta {score}."},
"fr":{"substitution":"{player} entre en jeu alors que le score est de {score}.","var":"La VAR examine puis valide le but de {player} : {score}.","post":"{player} touche le poteau, le score reste de {score}."},
"nl":{"substitution":"{player} komt als invaller binnen de lijnen bij {score}.","var":"VAR controleert en bevestigt de treffer van {player}: {score}.","post":"{player} raakt de paal; het blijft {score}."},
"zh":{"substitution":"{player}替補登場，當時比分為{score}。","var":"VAR覆核並確認{player}的進球有效，比分{score}。","post":"{player}射中門柱，比分仍為{score}。"}
}
for l,m in NON_GOALS.items():
    EVENT_TEMPLATES[l].update(m)

def main():
    raw=json.loads(MANIFEST.read_text(encoding="utf-8"))
    assert raw["language_codes"]==list(LANGS) and raw["tip_count"]==2
    assert len(raw["items"])==2
    records=[]
    for row in raw["items"]:
        id=row["tipp_id"]
        assert id in {"BI-20260918-164427-FRA","BI-20260920-134759-MAR"}
        assert row["outcome"]=="WON" and row["odds"]>1 and row["units"]>0
        item=story_for(row)
        item["source_checked_at"]="2026-10-12"
        if id=="BI-20260920-134759-MAR":
            item["score_source_note"]="Master confirmed a win but did not store a final-score string. Official LALIGA reports Valencia 2-3 Real Sociedad."
        st=ROOT/"assets"/"match-report-stories"/(id+".json")
        st.parent.mkdir(parents=True,exist_ok=True)
        st.write_text(json.dumps(item,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        for l in LANGS:
            copy=row["copy"][l]
            tr={"headline":copy[0],"summary":copy[1],"narrative":copy[2],"market":copy[3],
                "events":[EVENT_TEMPLATES[l][e["kind"]].format(**e) for e in row["events"]]}
            url=url_for(id,l)
            pic=ROOT/"assets"/"og"/(id.lower()+"-"+l+"-v1.jpg")
            temp=ROOT/"assets"/"og"/(id.lower()+"-"+l+"-final-temp.png")
            pic.parent.mkdir(parents=True,exist_ok=True)
            image_for(item,lang=l).save(temp,"PNG",optimize=True)
            export_image(temp,pic,{
                "title":copy[0],"description":copy[1],
                "graphic_creator":"BetInsight.club original approved stadium master",
                "rights":"BetInsight.club branded graphic; factual public match events linked",
                "source_url":url})
            temp.unlink()
            page=ROOT/l/"tipps"/"ergebnis"/id/"index.html"
            page.parent.mkdir(parents=True,exist_ok=True)
            doc=make_page(item,id,l,tr,DOMAIN+"/assets/og/"+pic.name)
            page.write_text(doc,encoding="utf-8")
            with Image.open(pic) as im:
                assert im.size==(1200,630) and im.getexif().get(270)
            assert doc.count('rel="alternate" hreflang=')==9
            assert "data-report-embedded" in doc and 'application/ld+json' in doc
            assert 'property="og:image"' in doc and 'name="twitter:image"' in doc
            assert row["source_url"] in doc and len(re.findall(r'<li><strong>',doc))==len(row["events"])
            assert "pt-BR" not in doc and "Português (Brasil)" not in doc
            assert (f'<html lang="{HREF[l]}">' if l in ("pt","zh") else f'<html lang="{l}">') in doc
            records.append({"id":id,"lang":l,"url":url,"image":pic.name})
            print("PASS",id,l,url)
    assert len(records)==16
    STATE.write_text(json.dumps({
      "batch_id":"004","tip_count":2,"page_count":16,"image_count":16,
      "locales":list(LANGS),"original_stats_mutated":False,
      "verified_public_official_source":True,"results":records
    },ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("SUCCESS: 2 verified matches x 8 BetInsight languages")
if __name__=="__main__":
    main()
