(()=>{"use strict";
const URL="https://lszlaglwlixejzytrurg.supabase.co/functions/v1/betinsight-tips-api?action=results";
const grid=document.querySelector(".report-grid");if(!grid)return;
const reportMap={
"BI-20260826-001536-MAR":"crystal-palace-man-city-28-08-2026/",
"BI-20260904-163328-FRA":"hoffenheim-dortmund-05-09-2026/",
"BI-20260908-151838-FRA":"dortmund-villarreal-08-09-2026/",
"BI-20260911-110018-FRA":"darmstadt-bielefeld-11-09-2026/",
"BI-20260911-105547-FRA":"bochum-greuther-fuerth-12-09-2026/",
"BI-20260912-004348-MAR":"real-sociedad-atletico-chelsea-hull-12-09-2026/",
"BI-20260914-175440-MAR":"villarreal-real-betis-leeds-newcastle-14-09-2026/",
"BI-20260917-003712-MAR":"real-betis-getafe-17-09-2026/",
"BI-20260917-003813-MAR":"malaga-villarreal-17-09-2026/",
"BI-20260918-160859-FRA":"holstein-kiel-vfl-osnabrueck-19-09-2026/",
"BI-20260918-164427-FRA":"kaiserslautern-braunschweig-19-09-2026/",
"BI-20260920-134759-MAR":"valencia-real-sociedad-20-09-2026/",
"BI-20260925-185756-MAR":"girona-fc-albacete-25-09-2026/"
};
const lang=(document.documentElement.lang||"de").toLowerCase().split("-")[0];
const C={
de:{odds:"Quote",units:"Units",score:"Endstand",won:"Gewonnen",lost:"Verloren",read:"Auswertung lesen →"},
en:{odds:"Odds",units:"Units",score:"Final score",won:"Won",lost:"Lost",read:"Read review →"},
es:{odds:"Cuota",units:"Units",score:"Resultado final",won:"Ganado",lost:"Perdido",read:"Leer análisis →"},
pt:{odds:"Cotação",units:"Units",score:"Resultado final",won:"Ganho",lost:"Perdido",read:"Ler a análise →"},
it:{odds:"Quota",units:"Units",score:"Risultato finale",won:"Vinto",lost:"Perso",read:"Leggi analisi →"},
fr:{odds:"Cote",units:"Units",score:"Score final",won:"Gagné",lost:"Perdu",read:"Lire le bilan →"}
}[lang]||{odds:"Quote",units:"Units",score:"Endstand",won:"Gewonnen",lost:"Verloren",read:"Auswertung lesen →"};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const n=v=>{const s=String(v??"").trim();return Number(s.includes(",")?s.replace(/\./g,"").replace(",","."):s)||0};
const dnum=v=>{const m=String(v||"").match(/(\d{2})\.(\d{2})\.(\d{4})/);return m?Number(m[3]+m[2]+m[1]):0};
fetch(URL,{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject()).then(rows=>{
 if(!Array.isArray(rows))return;
 rows.filter(r=>r&&r.qualitaetsrelevant==="JA"&&r.sichtbar_fuer_teilnehmer==="JA"&&(r.ergebnis_status==="GEWONNEN"||r.ergebnis_status==="VERLOREN")&&dnum(r.spiel_datum)>=20260828&&n(r.preis_units)>0)
 .sort((a,b)=>dnum(a.spiel_datum)-dnum(b.spiel_datum)||String(a.bestaetigt_am||"").localeCompare(String(b.bestaetigt_am||"")))
 .forEach(r=>{
   const staticPath=reportMap[r.tipp_id];
   if(staticPath&&grid.querySelector('a[href="'+staticPath+'"]'))return;
   if(grid.querySelector('[data-live-id="'+CSS.escape(String(r.tipp_id))+'"]'))return;
   const won=r.ergebnis_status==="GEWONNEN",el=document.createElement("a");
   el.className="report-card";el.dataset.liveId=String(r.tipp_id||"");
   el.href="bericht/?id="+encodeURIComponent(String(r.tipp_id||""));
   el.innerHTML='<span class="date">'+esc(r.spiel_datum)+' · '+esc(r.liga||r.sportart||"")+'</span><h2>'+esc(r.spiel)+'</h2><p>'+esc(r.tipp||r.markt||"")+'</p><div class="cardmeta"><span>'+C.odds+' '+esc(r.quote)+'</span><span>'+esc(r.preis_units)+' '+C.units+'</span>'+(r.endergebnis?'<span>'+C.score+' '+esc(r.endergebnis)+'</span>':'')+'<span class="'+(won?"result-win":"result-loss")+'">'+(won?C.won:C.lost)+'</span></div><span class="read">'+C.read+'</span>';
   grid.appendChild(el);
 });
}).catch(()=>{});
})();