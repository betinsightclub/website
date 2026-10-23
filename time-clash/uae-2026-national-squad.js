/* BetInsight TIME CLASH | UAE 2026 actual national team.
 Specific reference: 2026 27th Arabian Gulf Cup (not FIFA World Cup).
 Squad snapshot: https://en.wikipedia.org/wiki/United_Arab_Emirates_national_football_team
 Head coach Zlatko Dalić (September/October 2026).
 Names are from the published 26-player national-team roster, not generated.
*/
(function(){"use strict";
const NAME="VAE 2026",SOURCE="https://en.wikipedia.org/wiki/United_Arab_Emirates_national_football_team",POOL={"TW":"Khalid Eisa;Hamad Al-Meqbaali;Fahad Al-Dhanhani","ABW":"Khalifa Al Hammadi;Khaled Ibrahim;Marcus Meloni;Lucas Pimenta;Zayed Sultan;Rúben Canedo;Ala Zhir;Saša Ivković;Erik","MIT":"Fábio Lima;Harib Abdalla;Isam Faiz;Nicolás Giménez;Luanzinho;Abdulla Hamad;Mamadou Coulibaly","ST":"Ali Saleh;Sultan Adil;Bruno;Richard Akonnor;Ousmane Camara;Guilherme Bala;Yuri César"};
const db=window.TC_ROSTER_DB=window.TC_ROSTER_DB||{},coaches=window.TC_COACH_DB=window.TC_COACH_DB||{};
const slug=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const roleNames=Object.fromEntries(Object.entries(POOL).map(([pos,raw])=>[pos,raw.split(";").map(x=>x.trim()).filter(Boolean).map(name=>({name,pos}))]));
const all=Object.values(roleNames).flat(),starters=[...roleNames.TW.slice(0,1),...roleNames.ABW.slice(0,4),...roleNames.MIT.slice(0,4),...roleNames.ST.slice(0,2)];
const sel=new Set(starters.map(p=>slug(p.name)));
if(starters.length===11&&new Set(all.map(p=>slug(p.name))).size===26&&(!db[NAME]||db[NAME].length<11)){
 db[NAME]=[...starters,...all.filter(p=>!sel.has(slug(p.name)))].map((p,i)=>({
  id:"uae-2026-"+slug(p.name),name:p.name,pos:p.pos,strength:18,impact:3,
  starter:i<11,squadIndex:i,source:SOURCE,verification:"2026 Arabian Gulf Cup squad, not World Cup"}));
}
coaches[NAME]="Zlatko Dalić";
window.TC_UAE_2026_AUDIT={team:NAME,players:db[NAME]?.length||0,source:SOURCE,competition:"2026 Arabian Gulf Cup"};
})();
