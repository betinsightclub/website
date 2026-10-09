(()=>{"use strict";
const API="https://lszlaglwlixejzytrurg.supabase.co/functions/v1/betinsight-member-gateway?route=tip-results";
const lang=(document.documentElement.lang||"de").toLowerCase().split("-")[0];
const L={
de:{loading:"Bericht wird geladen …",error:"Der bestätigte Tipp konnte momentan nicht geladen werden.",back:"← Alle Tippauswertungen",ey:"BetInsight · Automatische Tippauswertung",lead:"Dieser Bericht wurde automatisch aus dem im Master-Backoffice bestätigten Ergebnis erzeugt. Er dokumentiert einen bereits abgeschlossenen Tipp und ist keine nachträgliche Vorhersage.",published:"Veröffentlichter Tipp",publishedCopy:"Vor dem Spiel war bei BetInsight folgender Tipp veröffentlicht.",odds:"Quote",units:"Units",market:"Markt",outcome:"Ergebnis und Wertung",won:"Gewonnen",lost:"Verloren",outWon:"Der Tipp wurde im Master-Backoffice als gewonnen bestätigt und wird deshalb in der BetInsight-Statistik als Gewinn gewertet.",outLost:"Der Tipp wurde im Master-Backoffice als verloren bestätigt und wird deshalb in der BetInsight-Statistik als Verlust gewertet.",scoreTitle:"Endstand und Nachweis",scoreKnown:"Im bestätigten Ergebnisdatensatz ist folgender Endstand hinterlegt:",scoreMissing:"Im bestätigten Ergebnisdatensatz ist derzeit kein Endstand hinterlegt. Deshalb wird hier bewusst kein Spielstand erfunden.",impact:"Auswirkung auf die 1.000-€-Statistik",impactCopy:"Die Berechnung folgt exakt derselben Modelllogik wie die öffentliche BetInsight-Statistik.",fixed:"Ohne Zinseszins",compound:"Mit Zinseszins",change:"Veränderung",after:"Stand danach",confirmed:"Bestätigt",tipper:"Tippgeber",reportAuto:"Automatisch erstellt nach Ergebnisbestätigung",sidebarTitle:"Tippauswertungen & Ergebnisse",sidebarCopy:"Alle abgeschlossenen und im System bestätigten Tipps.",sidebarBtn:"Alle Tippauswertungen",statsBtn:"Statistik & Verlauf",home:"Zur BetInsight-Startseite",note:"BetInsight ist kein Wettanbieter und nimmt keine Wetten oder Kundengelder entgegen. 18+. Vergangene Ergebnisse sind keine Garantie für zukünftige Ergebnisse.",metaDesc:"Automatisch erstellte BetInsight-Tippauswertung eines im Master-Backoffice bestätigten Ergebnisses."},
en:{loading:"Loading report …",error:"The confirmed tip cannot be loaded at the moment.",back:"← All tip reviews",ey:"BetInsight · Automatic tip review",lead:"This report was generated automatically from the result confirmed in the Master Backoffice. It documents a completed tip and is not a retroactive prediction.",published:"Published tip",publishedCopy:"Before the match, the following tip was published by BetInsight.",odds:"Odds",units:"Units",market:"Market",outcome:"Result and grading",won:"Won",lost:"Lost",outWon:"The tip was confirmed as won in the Master Backoffice and is therefore recorded as a win in the BetInsight statistics.",outLost:"The tip was confirmed as lost in the Master Backoffice and is therefore recorded as a loss in the BetInsight statistics.",scoreTitle:"Final score and evidence",scoreKnown:"The confirmed result record contains the following final score:",scoreMissing:"No final score is currently stored in the confirmed result record. No score is invented here.",impact:"Impact on the €1,000 statistics",impactCopy:"The calculation uses exactly the same model logic as the public BetInsight statistics.",fixed:"Without compounding",compound:"With compounding",change:"Change",after:"Balance after",confirmed:"Confirmed",tipper:"Tipster",reportAuto:"Automatically created after result confirmation",sidebarTitle:"Tip reviews & results",sidebarCopy:"All completed tips confirmed in the system.",sidebarBtn:"All tip reviews",statsBtn:"Statistics & performance",home:"Back to BetInsight home",note:"BetInsight is not a betting operator and does not accept bets or customer funds. 18+. Past results do not guarantee future results.",metaDesc:"Automatically generated BetInsight review of a result confirmed in the Master Backoffice."},
es:{loading:"Cargando informe …",error:"El pronóstico confirmado no se puede cargar en este momento.",back:"← Todos los análisis",ey:"BetInsight · Análisis automático",lead:"Este informe se generó automáticamente a partir del resultado confirmado en el Master Backoffice. Documenta un pronóstico ya finalizado y no es una predicción posterior.",published:"Pronóstico publicado",publishedCopy:"Antes del partido, BetInsight publicó el siguiente pronóstico.",odds:"Cuota",units:"Units",market:"Mercado",outcome:"Resultado y valoración",won:"Ganado",lost:"Perdido",outWon:"El pronóstico fue confirmado como ganado en el Master Backoffice y se registra como victoria en las estadísticas de BetInsight.",outLost:"El pronóstico fue confirmado como perdido en el Master Backoffice y se registra como pérdida en las estadísticas de BetInsight.",scoreTitle:"Resultado final y comprobación",scoreKnown:"El registro confirmado contiene el siguiente resultado final:",scoreMissing:"Actualmente no hay un resultado final guardado en el registro confirmado. Por eso no se inventa ningún marcador.",impact:"Impacto en la estadística de 1.000 €",impactCopy:"El cálculo utiliza exactamente la misma lógica de modelo que la estadística pública de BetInsight.",fixed:"Sin interés compuesto",compound:"Con interés compuesto",change:"Variación",after:"Saldo después",confirmed:"Confirmado",tipper:"Analista",reportAuto:"Creado automáticamente tras confirmar el resultado",sidebarTitle:"Análisis y resultados",sidebarCopy:"Todos los pronósticos finalizados y confirmados en el sistema.",sidebarBtn:"Todos los análisis",statsBtn:"Estadísticas y evolución",home:"Volver a BetInsight",note:"BetInsight no es una casa de apuestas y no acepta apuestas ni fondos de clientes. 18+. Los resultados pasados no garantizan resultados futuros.",metaDesc:"Análisis BetInsight generado automáticamente a partir de un resultado confirmado en el Master Backoffice."},
pt:{loading:"Carregando relatório …",error:"O palpite confirmado não pôde ser carregado no momento.",back:"← Todas as análises",ey:"BetInsight · Análise automática",lead:"Este relatório foi gerado automaticamente a partir do resultado confirmado no Master Backoffice. Ele documenta um palpite já encerrado e não é uma previsão retroativa.",published:"Palpite publicado",publishedCopy:"Antes da partida, a BetInsight publicou o seguinte palpite.",odds:"Odd",units:"Units",market:"Mercado",outcome:"Resultado e avaliação",won:"Ganho",lost:"Perdido",outWon:"O palpite foi confirmado como ganho no Master Backoffice e por isso é registrado como vitória nas estatísticas da BetInsight.",outLost:"O palpite foi confirmado como perdido no Master Backoffice e por isso é registrado como perda nas estatísticas da BetInsight.",scoreTitle:"Placar final e comprovação",scoreKnown:"O registro de resultado confirmado contém o seguinte placar final:",scoreMissing:"No momento não há placar final salvo no registro confirmado. Por isso nenhum placar é inventado aqui.",impact:"Impacto na estatística de € 1.000",impactCopy:"O cálculo usa exatamente a mesma lógica de modelo da estatística pública da BetInsight.",fixed:"Sem juros compostos",compound:"Com juros compostos",change:"Variação",after:"Saldo depois",confirmed:"Confirmado",tipper:"Analista",reportAuto:"Criado automaticamente após a confirmação do resultado",sidebarTitle:"Análises e resultados",sidebarCopy:"Todos os palpites encerrados e confirmados no sistema.",sidebarBtn:"Todas as análises",statsBtn:"Estatísticas e evolução",home:"Voltar à BetInsight",note:"A BetInsight não é uma casa de apostas e não aceita apostas nem recursos de clientes. 18+. Resultados passados não garantem resultados futuros.",metaDesc:"Análise BetInsight gerada automaticamente a partir de um resultado confirmado no Master Backoffice."},
it:{loading:"Caricamento report …",error:"Il pronostico confermato non può essere caricato al momento.",back:"← Tutte le valutazioni",ey:"BetInsight · Valutazione automatica",lead:"Questo report è stato generato automaticamente dal risultato confermato nel Master Backoffice. Documenta un pronostico già concluso e non è una previsione retroattiva.",published:"Pronostico pubblicato",publishedCopy:"Prima della partita BetInsight aveva pubblicato il seguente pronostico.",odds:"Quota",units:"Units",market:"Mercato",outcome:"Risultato e valutazione",won:"Vinto",lost:"Perso",outWon:"Il pronostico è stato confermato come vinto nel Master Backoffice e viene quindi registrato come vittoria nelle statistiche BetInsight.",outLost:"Il pronostico è stato confermato come perso nel Master Backoffice e viene quindi registrato come perdita nelle statistiche BetInsight.",scoreTitle:"Risultato finale e verifica",scoreKnown:"Nel record confermato è memorizzato il seguente risultato finale:",scoreMissing:"Nel record confermato non è attualmente memorizzato alcun risultato finale. Per questo non viene inventato alcun punteggio.",impact:"Impatto sulla statistica da 1.000 €",impactCopy:"Il calcolo utilizza esattamente la stessa logica del modello della statistica pubblica BetInsight.",fixed:"Senza interesse composto",compound:"Con interesse composto",change:"Variazione",after:"Saldo dopo",confirmed:"Confermato",tipper:"Tipster",reportAuto:"Creato automaticamente dopo la conferma del risultato",sidebarTitle:"Valutazioni e risultati",sidebarCopy:"Tutti i pronostici conclusi e confermati nel sistema.",sidebarBtn:"Tutte le valutazioni",statsBtn:"Statistiche e andamento",home:"Torna a BetInsight",note:"BetInsight non è un operatore di scommesse e non accetta scommesse o fondi dei clienti. 18+. I risultati passati non garantiscono risultati futuri.",metaDesc:"Valutazione BetInsight generata automaticamente da un risultato confermato nel Master Backoffice."},
fr:{loading:"Chargement du bilan …",error:"Le pronostic confirmé ne peut pas être chargé pour le moment.",back:"← Tous les bilans",ey:"BetInsight · Bilan automatique",lead:"Ce bilan a été généré automatiquement à partir du résultat confirmé dans le Master Backoffice. Il documente un pronostic déjà terminé et ne constitue pas une prédiction rétroactive.",published:"Pronostic publié",publishedCopy:"Avant le match, BetInsight avait publié le pronostic suivant.",odds:"Cote",units:"Units",market:"Marché",outcome:"Résultat et évaluation",won:"Gagné",lost:"Perdu",outWon:"Le pronostic a été confirmé comme gagné dans le Master Backoffice et est donc comptabilisé comme gain dans les statistiques BetInsight.",outLost:"Le pronostic a été confirmé comme perdu dans le Master Backoffice et est donc comptabilisé comme perte dans les statistiques BetInsight.",scoreTitle:"Score final et preuve",scoreKnown:"Le résultat confirmé contient le score final suivant :",scoreMissing:"Aucun score final n'est actuellement enregistré dans le résultat confirmé. Aucun score n'est donc inventé ici.",impact:"Impact sur la statistique à 1 000 €",impactCopy:"Le calcul suit exactement la même logique de modèle que la statistique publique BetInsight.",fixed:"Sans intérêts composés",compound:"Avec intérêts composés",change:"Variation",after:"Solde après",confirmed:"Confirmé",tipper:"Pronostiqueur",reportAuto:"Créé automatiquement après confirmation du résultat",sidebarTitle:"Bilans & résultats",sidebarCopy:"Tous les pronostics terminés et confirmés dans le système.",sidebarBtn:"Tous les bilans",statsBtn:"Statistiques & évolution",home:"Retour à BetInsight",note:"BetInsight n'est pas un opérateur de paris et n'accepte ni paris ni fonds de clients. 18+. Les résultats passés ne garantissent pas les résultats futurs.",metaDesc:"Bilan BetInsight généré automatiquement à partir d'un résultat confirmé dans le Master Backoffice."}
}[lang]||null;
const root=document.querySelector("[data-report-root]");
const back=document.querySelector("[data-back]");
const home=document.querySelector("[data-home]");
if(back)back.textContent=L.back;if(home)home.textContent=L.home;
if(root)root.innerHTML='<div class="wrap" style="padding:70px 0"><p class="lead">'+L.loading+'</p></div>';
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const num=v=>{const s=String(v??"").trim();if(!s)return 0;return Number(s.includes(",")?s.replace(/\./g,"").replace(",","."):s)||0};
const dnum=v=>{const m=String(v||"").match(/(\d{2})\.(\d{2})\.(\d{4})/);return m?Number(m[3]+m[2]+m[1]):0};
const locale={de:"de-DE",en:"en-GB",es:"es-ES",pt:"pt-BR",it:"it-IT",fr:"fr-FR"}[lang]||"de-DE";
const money=n=>new Intl.NumberFormat(locale,{style:"currency",currency:"EUR",minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
const delta=n=>(n>=0?"+":"−")+money(Math.abs(n));
const tipper=r=>String(r.tippgeber||r.admin_name||"").trim()||(String(r.tipp_id||"").includes("-FRA")?"Frank":String(r.tipp_id||"").includes("-MAR")?"Martin":"");
function validRows(rows){return rows.filter(r=>r&&r.qualitaetsrelevant==="JA"&&r.sichtbar_fuer_teilnehmer==="JA"&&(r.ergebnis_status==="GEWONNEN"||r.ergebnis_status==="VERLOREN")&&dnum(r.spiel_datum)>=20260828&&num(r.preis_units)>0).sort((a,b)=>dnum(a.spiel_datum)-dnum(b.spiel_datum)||String(a.bestaetigt_am||"").localeCompare(String(b.bestaetigt_am||"")))}
function calculate(rows,id){let bf=1000,gf=1000,bc=1000,gc=1000,hit=null;for(const r of rows){const q=num(r.quote),u=num(r.preis_units),won=r.ergebnis_status==="GEWONNEN",who=tipper(r),frank=/frank/i.test(who)||String(r.tipp_id||"").includes("-FRA");const fd=won?u*10*(q-1):-u*10;if(frank)gf+=fd;else bf+=fd;const base=frank?gc:bc,stake=base*(u/100),cd=won?stake*(q-1):-stake;if(frank)gc+=cd;else bc+=cd;const fixedTotal=1000+(bf-1000)+(gf-1000),compoundTotal=1000+(bc-1000)+(gc-1000);if(String(r.tipp_id)===String(id))hit={fd,cd,fixedTotal,compoundTotal}}return hit}
function setMeta(r){document.title=(r.spiel||"BetInsight")+" – "+(r.ergebnis_status==="GEWONNEN"?L.won:L.lost)+" | BetInsight";const desc=document.querySelector('meta[name="description"]');if(desc)desc.setAttribute("content",L.metaDesc+" "+String(r.spiel||""));let can=document.querySelector('link[rel="canonical"]');if(!can){can=document.createElement("link");can.rel="canonical";document.head.appendChild(can)}can.href=location.origin+location.pathname+"?id="+encodeURIComponent(String(r.tipp_id||""))}

function resultCover(r){
  const won=r.ergebnis_status==="GEWONNEN";
  const status=won?L.won:L.lost;
  const result=String(r.endergebnis||"").trim();

  const reviewedIDs=new Set([
    "BI-20261004-011406-MAR",
    "BI-20261004-011255-MAR",
    "BI-20261002-145749-MAR",
    "BI-20260927-040207-MAR",
    "BI-20260925-185756-MAR"
  ]);
  const id=String(r.tipp_id||"").trim();
  if(lang==="de"&&reviewedIDs.has(id)){
    const img="/assets/og/"+id.toLowerCase()+"-de-v1.jpg";
    const destination="/de/tipps/ergebnis/"+encodeURIComponent(id)+"/";
    const alt="BetInsight Ergebnisbild "+String(r.spiel||"")+" – "+(won?"Tipp gewonnen":"Tipp verloren");
    return '<section class="wrap reviewed-poster">'+
      '<a href="'+destination+'" title="Spielbericht mit SEO-Vorschau öffnen"><img src="'+img+'" alt="'+esc(alt)+'" width="1200" height="630" loading="eager" decoding="async"></a>'+
      '<div class="reviewed-poster-link"><a href="'+destination+'">Ausführlichen Spielbericht mit Höhepunkten öffnen →</a></div>'+
      '</section><div class="wrap result-context"><h1>'+esc(r.spiel||"")+'</h1><p>'+esc(L.lead)+'</p><div class="meta"><span>'+esc(L.tipper)+': '+esc(tipper(r)||"—")+'</span><span>'+esc(status)+'</span></div></div>';
  }

  // The cover is a responsive design with the unmodified, verified corporate
  // logo. No generated logos, invented goals, or external club trademarks.
  return '<section class="result-cover wrap '+(won?'is-won':'is-lost')+'">'+
    '<div class="result-cover-photo" aria-hidden="true"></div>'+
    '<div class="result-cover-content">'+
    '<img class="result-cover-brand" loading="eager" decoding="async" src="/assets/brand/betinsight-original-transparent.png" alt="BetInsight.club – Original-Logo">'+
    '<div class="result-cover-overline">'+esc(L.ey)+'</div>'+
    '<h1>'+esc(r.spiel||"")+'</h1>'+
    (result?'<div class="result-cover-score" data-cover-scores>'+esc(result)+'</div>':'')+
    '<div class="result-cover-footer"><span class="result-cover-status">'+esc(status)+'</span><span>'+esc(r.spiel_datum||"")+'</span><span>'+esc(r.liga||r.sportart||"")+'</span></div>'+
    '</div></section>'+
    '<div class="wrap result-context"><p>'+esc(L.lead)+'</p><div class="meta"><span>'+esc(L.tipper)+': '+esc(tipper(r)||"—")+'</span><span>'+esc(status)+'</span></div></div>';
}
function storyHTML(story){
  if(!story||!Array.isArray(story.legs)||!story.legs.length)return "";
  const de=lang==="de",hdr=de?"Tatsächlicher Spielverlauf & entscheidende Szenen":"Match timeline & decisive moments";
  const resultLabel=(v)=>v==="WON"?(de?"Auswahl richtig":"Selection won"):(v==="LOST"?(de?"Auswahl falsch":"Selection lost"):(de?"Auswertung offen":"Unverified"));
  const legs=story.legs.map((leg,i)=>{
    const title=String(leg.home||"")+" – "+String(leg.away||"");
    const narrative=de?leg.narrative_de:leg.narrative_en;
    const items=(Array.isArray(leg.key_events)?leg.key_events:[]).slice(0,14).map(ev=>
      '<li><strong>'+esc(ev.minute||"")+'</strong> '+esc((de?ev.text:ev.text_en)||ev.text||"")+'</li>').join("");
    const source=String(leg.source_url||"");
    const isTrusted=/^https:\/\/[a-z0-9.-]+\//i.test(source);
    return '<section class="story-leg"><div class="story-leg-header"><span class="story-leg-num">'+(i+1)+'</span><h3>'+esc(title)+'</h3><strong>'+esc(leg.score||"")+'</strong></div>'+
      '<p class="story-leg-market">'+esc(leg.market_label||"")+' · '+esc(resultLabel(leg.selection_outcome))+'</p>'+
      '<ul class="story-events">'+items+'</ul>'+
      '<p>'+esc(narrative||"")+'</p>'+
      (isTrusted?'<p class="story-source"><a target="_blank" rel="noopener noreferrer" href="'+esc(source)+'">'+esc(leg.source_label||"Quelle")+' ↗</a></p>':'')+
      '</section>';
  }).join("");
  const conclusion=de?story.summary_de:story.summary_en;
  const note=de?story.note_de:story.note_en;
  return '<section class="story"><div class="story-head"><span>BETINSIGHT · '+esc(de?"SPIELANALYSE":"MATCH ANALYSIS")+'</span><h2>'+esc(hdr)+'</h2></div>'+
    legs+'<div class="story-summary"><h3>'+esc(de?"BetInsight-Fazit":"BetInsight conclusion")+'</h3><p>'+esc(conclusion||"")+'</p></div>'+
    '<p class="story-footnote">'+esc(note||"")+'</p></section>';
}
async function loadStory(r){
  const slot=root.querySelector("[data-story-slot]");
  if(!slot)return;
  const id=String(r.tipp_id||"").trim();
  if(!/^[A-Za-z0-9_-]{7,90}$/.test(id))return;
  try{
    let story=null;
    const local=await fetch("/assets/match-report-stories/"+encodeURIComponent(id)+".json",{cache:"no-store"});
    if(local.ok)story=await local.json();
    if(!story){
      // Read ONLY verified/cached summaries; never call the sports provider per browser visit.
      const api="https://lszlaglwlixejzytrurg.supabase.co/functions/v1/betinsight-public-result-story?id="+encodeURIComponent(id);
      const remote=await fetch(api,{cache:"no-store"});
      if(remote.ok){
        const info=await remote.json();
        if(info.ok&&info.status==="READY")story=info.story;
      }
    }
    if(story&&story.tipp_id===id&&root.contains(slot)){
      slot.innerHTML=storyHTML(story);
      const scores=root.querySelector("[data-cover-scores]");
      if(scores&&Array.isArray(story.legs)){
        const parts=story.legs.filter(x=>x.score).map(x=>String(x.home||"")+" "+String(x.score));
        if(parts.length)scores.textContent=parts.join("   •   ");
      }
    }else if(root.contains(slot)){
      slot.innerHTML='<div class="story-pending">'+esc(lang==="de"?"Ein ausführlicher, quellengeprüfter Spielverlauf ist für diesen Tipp noch in Bearbeitung.":"A source-verified match timeline is still being prepared for this tip.")+'</div>';
    }
  }catch(e){
    console.warn("BetInsight public result timeline unavailable",String(e));
  }
}

function render(r,calc){const won=r.ergebnis_status==="GEWONNEN",status=won?L.won:L.lost,score=String(r.endergebnis||"").trim(),who=tipper(r)||"—",confirmed=String(r.bestaetigt_am||"").trim();setMeta(r);root.innerHTML=resultCover(r)+'<div class="wrap layout"><article class="article"><h2>'+esc(L.published)+'</h2><p>'+esc(L.publishedCopy)+'</p><div class="tipbox"><strong>'+esc(r.tipp||r.markt||"")+'</strong><div class="tipmeta"><div><span>'+esc(L.odds)+'</span><b>'+esc(r.quote||"")+'</b></div><div><span>'+esc(L.units)+'</span><b>'+esc(r.preis_units||"")+'</b></div><div><span>'+esc(L.market)+'</span><b>'+esc(r.markt||"")+'</b></div></div></div><h2>'+esc(L.outcome)+'</h2><div class="outcome '+(won?"":"loss")+'"><p>'+(won?esc(L.outWon):esc(L.outLost))+'</p></div><div data-story-slot></div><h2>'+esc(L.scoreTitle)+'</h2><p>'+esc(score?L.scoreKnown:L.scoreMissing)+(score?' <strong>'+esc(score)+'</strong>.':'')+'</p><h2>'+esc(L.impact)+'</h2><p>'+esc(L.impactCopy)+'</p><div class="stats-grid"><div class="stat-card"><span>'+esc(L.fixed)+'</span><b class="'+(calc.fd>=0?"pos":"neg")+'">'+esc(delta(calc.fd))+'</b><span>'+esc(L.after)+'</span><b>'+esc(money(calc.fixedTotal))+'</b></div><div class="stat-card"><span>'+esc(L.compound)+'</span><b class="'+(calc.cd>=0?"pos":"neg")+'">'+esc(delta(calc.cd))+'</b><span>'+esc(L.after)+'</span><b>'+esc(money(calc.compoundTotal))+'</b></div></div><h2>'+esc(L.confirmed)+'</h2><p>'+esc(L.reportAuto)+(confirmed?' · '+esc(confirmed):'')+'</p><div class="note">'+esc(L.note)+'</div></article><aside class="sidebar"><div class="sidecard"><h3>'+esc(L.sidebarTitle)+'</h3><p>'+esc(L.sidebarCopy)+'</p><a class="sidebtn" href="../">'+esc(L.sidebarBtn)+'</a><a class="sidebtn secondary" href="../../statistik-vorschau/">'+esc(L.statsBtn)+'</a></div><div class="sidecard"><h3>BetInsight.club</h3><a class="sidebtn secondary" href="../../">'+esc(L.home)+'</a></div></aside></div>'}
const id=new URLSearchParams(location.search).get("id");
if(!id){root.innerHTML='<div class="wrap" style="padding:70px 0"><p class="lead">'+esc(L.error)+'</p></div>';return}
fetch(API,{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject(new Error("HTTP"))).then(all=>{if(!Array.isArray(all))throw new Error("DATA");const rows=validRows(all),r=rows.find(x=>String(x.tipp_id)===String(id));if(!r)throw new Error("NOT_FOUND");const calc=calculate(rows,id);if(!calc)throw new Error("CALC");render(r,calc);loadStory(r)}).catch(()=>{root.innerHTML='<div class="wrap" style="padding:70px 0"><p class="lead">'+esc(L.error)+'</p></div>'});
})();