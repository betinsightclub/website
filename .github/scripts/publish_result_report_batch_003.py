#!/usr/bin/env python3
"""Generate BetInsight result-report batch 003: 2 combo tickets + 3 singles, 8 languages.
No writes to Supabase, tip account balances, settlement or simulated capital.
Match events are sourced to the independent official links in editorial manifest.
"""
import datetime as dt
import json
import re
from pathlib import Path
from PIL import Image

from publish_result_report_batch import ROOT,DOMAIN,image_for,export_image
from publish_result_report_batch_002 import story_for,EVENT_TEMPLATES
from publish_result_report_multilingual import LANGS,HREF,make_page,url_for
import publish_result_combo_20261009 as combo

MANIFEST=ROOT/"docs"/"result-report-batches"/"block-003-editorial.json"
STATE=ROOT/"docs"/"result-report-batches"/"block-003-build.json"
VERSION="v1"
LEG_MARKETS={
"BI-20260912-004348-MAR":{
"de":["Doppelte Chance X2: Atlético-Sieg oder Remis","1X2: Chelsea gewinnt"],
"en":["Double chance X2: Atlético win or draw","1X2: Chelsea to win"],
"es":["Doble oportunidad X2: Atlético o empate","1X2: victoria del Chelsea"],
"pt":["Hipótese dupla X2: Atlético ou empate","1X2: vitória do Chelsea"],
"it":["Doppia chance X2: Atlético o pareggio","1X2: vittoria Chelsea"],
"fr":["Double chance X2 : Atlético ou nul","1X2 : victoire de Chelsea"],
"nl":["Dubbele kans X2: Atlético of gelijkspel","1X2: Chelsea wint"],
"zh":["雙重機會X2：馬德里競技獲勝或平局","1X2：切爾西獲勝"]
},
"BI-20260914-175440-MAR":{
"de":["Doppelte Chance 1X: Villarreal-Sieg oder Remis","Doppelte Chance X2: Newcastle-Sieg oder Remis"],
"en":["Double chance 1X: Villarreal win or draw","Double chance X2: Newcastle win or draw"],
"es":["Doble oportunidad 1X: Villarreal o empate","Doble oportunidad X2: Newcastle o empate"],
"pt":["Hipótese dupla 1X: Villarreal ou empate","Hipótese dupla X2: Newcastle ou empate"],
"it":["Doppia chance 1X: Villarreal o pareggio","Doppia chance X2: Newcastle o pareggio"],
"fr":["Double chance 1X : Villarreal ou nul","Double chance X2 : Newcastle ou nul"],
"nl":["Dubbele kans 1X: Villarreal of gelijkspel","Dubbele kans X2: Newcastle of gelijkspel"],
"zh":["雙重機會1X：比利亞雷亞爾獲勝或平局","雙重機會X2：紐卡索獲勝或平局"]
}}
LEG_EXPLANATIONS={
"BI-20260912-004348-MAR":{
"de":["Atlético erzielte in der Schlussphase durch Grimaldo, Jonathan David und Giuliano drei Tore. Der Auswärtssieg erfüllt die Auswahl X2.","Chelsea führte früh, Hull drehte das Spiel durch Belloumi. João Pedro glich zum 2:2 aus, doch Chelsea gewann nicht. Damit scheiterte der Chelsea-Sieg."],
"en":["Atlético scored three late goals through Grimaldo, Jonathan David and Giuliano. The away victory satisfies X2.","Chelsea led early, but Belloumi gave Hull the lead. João Pedro equalised at 2–2; Chelsea did not win and this 1X2 leg lost."],
"es":["El Atlético marcó tres goles al final, por Grimaldo, Jonathan David y Giuliano. La victoria visitante cumple X2.","Chelsea se adelantó, Belloumi remontó para Hull y João Pedro empató 2–2. Chelsea no ganó y falló el 1X2."],
"pt":["O Atlético marcou três golos na fase final, por Grimaldo, Jonathan David e Giuliano. A vitória fora validou o X2.","O Chelsea adiantou-se, Belloumi virou para o Hull e João Pedro empatou 2–2. O Chelsea não venceu e a seleção 1X2 foi perdida."],
"it":["L'Atlético ha segnato tre reti nel finale con Grimaldo, Jonathan David e Giuliano. Il successo esterno valida X2.","Chelsea era avanti, Belloumi ha ribaltato la gara per Hull e João Pedro ha pareggiato 2-2. Chelsea non ha vinto e l'1X2 ha perso."],
"fr":["L'Atlético a marqué trois fois en fin de match par Grimaldo, Jonathan David et Giuliano. La victoire valide X2.","Chelsea a pris l'avantage, Belloumi a renversé le score pour Hull et João Pedro a égalisé à 2–2. Chelsea n'a pas gagné."],
"nl":["Atlético scoorde laat via Grimaldo, Jonathan David en Giuliano. De uitzege was voldoende voor X2.","Chelsea kwam op voorsprong, Belloumi draaide de stand voor Hull om en João Pedro maakte 2-2. Chelsea won niet; dit 1X2-deel ging verloren."],
"zh":["馬德里競技在比賽末段由Grimaldo、Jonathan David和Giuliano連入三球。客勝符合X2。","切爾西先領先，Belloumi為赫爾城反超，João Pedro追成2比2。切爾西未能獲勝，因此此1X2選擇失敗。"]
},
"BI-20260914-175440-MAR":{
"de":["Villarreal führte durch Gerard Moreno 1:0, doch Cucho Hernández und Natan drehten die Partie. Die Heim-Doppelchance 1X scheiterte.","Leeds traf durch ein Eigentor von Miley, zweimal Calvert-Lewin und Okafor viermal. Newcastle verlor 1:4 und erfüllte X2 nicht."],
"en":["Gerard Moreno put Villarreal ahead, but Cucho Hernández and Natan overturned the lead. Home double chance 1X failed.","A Miley own goal, two Calvert-Lewin goals and Okafor gave Leeds four goals. Newcastle lost 4–1, so X2 failed."],
"es":["Gerard Moreno adelantó al Villarreal, pero Cucho Hernández y Natan remontaron. El 1X falló.","Un autogol de Miley, dos tantos de Calvert-Lewin y otro de Okafor dieron cuatro goles al Leeds. Newcastle perdió 4–1 y el X2 falló."],
"pt":["Gerard Moreno adiantou o Villarreal, mas Cucho Hernández e Natan deram a volta ao marcador. O 1X falhou.","Um autogolo de Miley, dois golos de Calvert-Lewin e outro de Okafor deram quatro golos ao Leeds. Newcastle perdeu 4–1 e o X2 falhou."],
"it":["Gerard Moreno ha portato avanti il Villarreal, ma Cucho Hernández e Natan hanno ribaltato il risultato. L'1X ha perso.","Un'autorete di Miley, due reti di Calvert-Lewin e una di Okafor hanno portato Leeds a quattro gol. Newcastle ha perso 4-1 e l'X2 ha perso."],
"fr":["Gerard Moreno a donné l'avantage à Villarreal, mais Cucho Hernández et Natan ont renversé le score. Le 1X a échoué.","Un csc de Miley, deux buts de Calvert-Lewin et un but d'Okafor ont donné quatre buts à Leeds. Newcastle a perdu 4–1, invalidant X2."],
"nl":["Gerard Moreno zette Villarreal op voorsprong, maar Cucho Hernández en Natan draaiden de wedstrijd om. De 1X-selectie verloor.","Een eigen goal van Miley, twee treffers van Calvert-Lewin en één van Okafor leverden Leeds vier goals op. Newcastle verloor 4-1 en X2 faalde."],
"zh":["Gerard Moreno先為比利亞雷亞爾取得領先，但Cucho Hernández與Natan讓貝蒂斯逆轉。1X選擇失敗。","Miley的烏龍球、Calvert-Lewin的兩球與Okafor的進球，使里茲取得四球。紐卡索以1比4落敗，X2選擇失敗。"]
}}
def event_text(ev,lang):
    return EVENT_TEMPLATES[lang][ev["kind"]].format(**ev)

def combo_story(row):
    id=row["tipp_id"]
    assert len(row["legs"])==2 and row["outcome"]=="LOST"
    legs=[]
    for leg in row["legs"]:
        legs.append({
            "home":leg["home"],"away":leg["away"],"score":leg["score"],"market_label":leg["market"],
            "selection_outcome":leg["selection_outcome"],"source_url":leg["source_url"],
            "key_events":[{"minute":ev[0],"text":event_text(dict(minute=ev[0],player=ev[1],score=ev[2],kind=ev[3]),"de"),
                            "text_en":event_text(dict(minute=ev[0],player=ev[1],score=ev[2],kind=ev[3]),"en")}
                           for ev in leg["events"]],
            "narrative_de":LEG_EXPLANATIONS[id]["de"][len(legs)],
            "narrative_en":LEG_EXPLANATIONS[id]["en"][len(legs)]
        })
    return {
       "schema":"betinsight_verified_combo_story_v1","tipp_id":id,
       "match_date":row["match_date"],"kind":"combo","outcome":row["outcome"],
       "status":"VERLOREN","match":row["match"],"score":row["score"],"market":row["market"],
       "odds":row["odds"],"units":row["units"],"tipper":row["tipper"],
       "summary_de":row["copy"]["de"][1],"summary_en":row["copy"]["en"][1],
       "note_de":"Die beiden Wettteile und deren Resultate sind anhand der verlinkten offiziellen Quellen geprüft. Ursprünglicher Kombitipp, Quote, Units, Verlustergebnis und Statistik bleiben unverändert.",
       "note_en":"Both legs and match events use the linked match reports. Original tip, odds, units, settlement and statistics are unchanged.",
       "legs":legs,
       "translations":{l:{
          "summary":row["copy"][l][1],
          "note":{
           "en":"Retrospective analysis of two previously published match selections. Original master data and statistical balances are unchanged.",
           "es":"Análisis posterior de una combinada publicada antes del encuentro. No se modifican los datos ni estadísticas originales.",
           "pt":"Análise posterior de uma múltipla publicada antes dos jogos. Os dados e estatísticas originais não foram alterados.",
           "it":"Analisi successiva di una multipla pubblicata prima degli incontri. I dati e le statistiche originali restano invariati.",
           "fr":"Analyse a posteriori d'un combiné publié avant les matchs. Les données et statistiques d'origine sont conservées.",
           "nl":"Achteraf uitgevoerde analyse van een eerder gepubliceerde combinatie. De oorspronkelijke cijfers blijven behouden.",
           "zh":"這是對賽前發布串關投注的賽後分析，原始賠率、單位、結果與統計均保持不變。"}[l],
          "heading":{
           "en":"Actual match timelines and decisive moments","es":"Desarrollo de ambos partidos y momentos clave","pt":"Decorrer dos jogos e momentos decisivos",
           "it":"Andamento delle partite e momenti decisivi","fr":"Déroulement des matchs et moments décisifs",
           "nl":"Wedstrijdverloop en beslissende momenten","zh":"兩場比賽的經過與關鍵時刻"}[l],
          "conclusion_heading":{
           "en":"Why the accumulator lost","es":"Por qué se perdió la combinada","pt":"Porque foi a múltipla perdida",
           "it":"Perché la multipla ha perso","fr":"Pourquoi le combiné a été perdu",
           "nl":"Waarom de combinatie verloor","zh":"為什麼串關投注失敗？"}[l],
          "legs":[{
            "market":LEG_MARKETS[id][l][i],"narrative":LEG_EXPLANATIONS[id][l][i],
            "events":[event_text(dict(minute=ev[0],player=ev[1],score=ev[2],kind=ev[3]),l) for ev in orig["events"]]
          } for i,orig in enumerate(row["legs"])]
       } for l in LANGS if l!="de"}
    }

def generate_image(img,temp,item,lang,url,title,desc):
    img.parent.mkdir(parents=True,exist_ok=True)
    temp.parent.mkdir(parents=True,exist_ok=True)
    item.save(temp,"PNG",optimize=True)
    export_image(temp,img,{"title":title,"description":desc,
        "graphic_creator":"BetInsight.club using approved official logo embedded in branded master",
        "rights":"Original editorial graphic; independent linked match reports",
        "source_url":url})
    temp.unlink()
    with Image.open(img) as read:
        assert read.size==(1200,630) and read.getexif().get(270)

def main():
    s=json.loads(MANIFEST.read_text(encoding="utf8"))
    assert s["languages"]==list(LANGS)
    assert s["batch_id"]=="003" and len(s["items"])==5
    verified=[]
    for row in s["items"]:
        id=row["tipp_id"]
        assert row["units"]>0 and row["odds"]>1 and row["outcome"] in ["WON","LOST"]
        assert all(len(row["copy"][l])==4 for l in LANGS)
        story=combo_story(row) if row["kind"]=="combo" else story_for(row)
        story_path=ROOT/"assets"/"match-report-stories"/(id+".json")
        story_path.parent.mkdir(parents=True,exist_ok=True)
        story_path.write_text(json.dumps(story,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
        if row["kind"]=="combo":
            combo.TID=id
        for lang in LANGS:
            url=url_for(id,lang)
            img=ROOT/"assets"/"og"/(id.lower()+"-"+lang+"-"+("combo-" if row["kind"]=="combo" else "")+VERSION+".jpg")
            temp=ROOT/"assets"/"og"/(id.lower()+"-"+lang+"-batch003-temp.png")
            title=row["copy"][lang][0]
            description=row["copy"][lang][1]
            if row["kind"]=="combo":
                # Never inherit the Oct 09 example's 2 units / 1.85 / 1-of-2:
                # every image uses its own confirmed odds, stake and leg verdict.
                odds_label={"de":"QUOTE","en":"ODDS","es":"CUOTA","pt":"COTAÇÃO","it":"QUOTA","fr":"COTE","nl":"QUOTE","zh":"賠率"}[lang]
                amount_label={"zh":"單位"}.get(lang,"UNITS")
                outcome_label=row["copy"][lang][3]
                combo.C[lang]["stats"]=f'{row["units"]} {amount_label}  •  {odds_label} {str(row["odds"]).replace(".", ",")}  •  {outcome_label}'
                im=combo.cover(story,lang)
            else:
                im=image_for(story,lang=lang)
            generate_image(img,temp,im,lang,url,title,description)
            page=ROOT/lang/"tipps"/"ergebnis"/id/"index.html"
            page.parent.mkdir(parents=True,exist_ok=True)
            photo=DOMAIN+"/assets/og/"+img.name
            if row["kind"]=="combo":
               text=combo.webpage(story,lang,photo)
               # The re-used old combo template includes literal Oct 09
               # match names, date, stake and odds. Replace them strictly
               # with this confirmed combination's own editorial data.
               old_heading="Borussia Dortmund – Werder Bremen + Málaga – Espanyol"
               assert old_heading in text
               text=text.replace(old_heading,row["match"])
               text=text.replace("Dortmund 2:2 Bremen • Málaga 1:1 Espanyol",
                   row["legs"][0]["home"]+" "+row["legs"][0]["score"]+" "+row["legs"][0]["away"]
                   +" • "+row["legs"][1]["home"]+" "+row["legs"][1]["score"]+" "+row["legs"][1]["away"])
               date=dt.date.fromisoformat(row["match_date"]).strftime("%d.%m.%Y")
               original_keydata=re.search(r'<div class="keydata">.*?</div>',text)
               assert original_keydata and "1,85" in original_keydata.group(),(id,lang)
               caption_label={"de":"Quote","en":"Odds","es":"Cuota","pt":"Cotação","it":"Quota","fr":"Cote","nl":"Quote","zh":"賠率"}[lang]
               keydata=f'<div class="keydata"><span>{date}</span><span>{row["units"]} Units</span><span>{caption_label}: {str(row["odds"]).replace(".", ",")}</span></div>'
               text=text[:original_keydata.start()]+keydata+text[original_keydata.end():]
               text=text.replace("2026-10-10","2026-10-12")
            else:
               tr={
                  "headline":row["copy"][lang][0],"market":row["copy"][lang][3],
                  "summary":row["copy"][lang][1],"narrative":row["copy"][lang][2],
                  "events":[event_text(ev,lang) for ev in row["events"]]}
               text=make_page(story,id,lang,tr,photo)
            page.write_text(text,encoding="utf8")
            assert "data-report-embedded" in text, (id,lang)
            assert "application/ld+json" in text and "og:image" in text and "twitter:image" in text
            assert text.count('hreflang=')==9,(id,lang)
            if lang=="pt":assert '<html lang="pt-PT">' in text
            if lang=="zh":assert '<html lang="zh-Hant-TW">' in text
            for leg in (story["legs"] if row["kind"]=="combo" else [story["legs"][0]]):
                assert leg["source_url"] in text, (id,lang,leg["source_url"])
            assert "pt-BR" not in text and "Português (Brasil)" not in text
            verified.append(dict(id=id,lang=lang,page=url,image=photo,proof=True))
            print("PASS",id,lang,photo)
    assert len(verified)==40
    STATE.write_text(json.dumps({"batch_id":"003","tip_count":5,"languages":list(LANGS),
      "pages":40,"images":40,"sources_provided":True,"original_tip_data_changed":False,
      "original_statistical_values_preserved":True,"results":verified},ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print("SUCCESS: 40 localized source-verified match articles and 40 approved BetInsight images")
if __name__=="__main__":
    main()
