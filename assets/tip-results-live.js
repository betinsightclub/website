(()=>{"use strict";
const URL="https://lszlaglwlixejzytrurg.supabase.co/functions/v1/betinsight-member-gateway?route=tip-results";
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
"BI-20260920-134759-MAR":"valencia-real-sociedad-20-09-2026/"
};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const n=v=>{const s=String(v??"").trim();return Number(s.includes(",")?s.replace(/\./g,"").replace(",","."):s)||0};
const dnum=v=>{const m=String(v||"").match(/(\d{2})\.(\d{2})\.(\d{4})/);return m?Number(m[3]+m[2]+m[1]):0};
fetch(URL,{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject()).then(rows=>{
 if(!Array.isArray(rows))return;
 rows.filter(r=>r&&r.qualitaetsrelevant==="JA"&&r.sichtbar_fuer_teilnehmer==="JA"&&(r.ergebnis_status==="GEWONNEN"||r.ergebnis_status==="VERLOREN")&&dnum(r.spiel_datum)>=20260828&&n(r.preis_units)>0)
 .sort((a,b)=>dnum(a.spiel_datum)-dnum(b.spiel_datum)||String(a.bestaetigt_am||"").localeCompare(String(b.bestaetigt_am||"")))
 .forEach(r=>{
   const mapped=reportMap[r.tipp_id];
   if(mapped&&grid.querySelector('a[href="'+mapped+'"]'))return;
   if(grid.querySelector('[data-live-id="'+CSS.escape(String(r.tipp_id))+'"]'))return;
   const won=r.ergebnis_status==="GEWONNEN",tag=mapped?"a":"article",el=document.createElement(tag);
   el.className="report-card";el.dataset.liveId=String(r.tipp_id||"");
   if(mapped)el.href=mapped;
   el.innerHTML='<span class="date">'+esc(r.spiel_datum)+' · '+esc(r.liga||r.sportart||"")+'</span><h2>'+esc(r.spiel)+'</h2><p>'+esc(r.tipp||r.markt||"")+'</p><div class="cardmeta"><span>Quote '+esc(r.quote)+'</span><span>'+esc(r.preis_units)+' Units</span>'+(r.endergebnis?'<span>Endstand '+esc(r.endergebnis)+'</span>':'')+'<span class="'+(won?"result-win":"result-loss")+'">'+(won?"Gewonnen":"Verloren")+'</span></div><span class="read">'+(mapped?"Auswertung lesen →":"Ergebnis bestätigt")+'</span>';
   grid.appendChild(el);
 });
}).catch(()=>{});
})();