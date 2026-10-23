/* BetInsight TIME CLASH · Egyptian historic squad supplements · 2026-10-23.
  Sources: 1982/83 Al Mokawloon historical season list:
  https://3rabica.org/نادي_المقاولون_العرب_موسم_1982–83
  Independent 1982/83 team-name corroboration: https://www.vetogate.com/5747440
  Ghazl 1972/73 documented goals: https://koraapedia.com/نتائج-الدوري-المصري-موسم-1972-1973/
  and https://koraapedia.com/مواجهات-الزمالك-وغزل-المحلة/
  No historical XI asserted. Unverified goalkeeper for Ghazl has NOT been fabricated.
*/
(function(){
"use strict";
const db=window.TC_ROSTER_DB=window.TC_ROSTER_DB||{},coaches=window.TC_COACH_DB=window.TC_COACH_DB||{};
const extra={"Al Mokawloon 1982/83":[["Alaa Khalil","TW"],["Mohamed Younes","TW"],["Ali Shehata","ABW"],["Mohamed Zamzam","ABW"],["Said El Shishini","ABW"],["Karim Abdel Razek","MIT"],["Alaa Abdel Hafiz","ST"],["Nabil Ibrahim","MIT"],["Hazem Khaled","MIT"],["Wahid Murad","ST"],["Mohamed Abdel Rahim (Omar)","ST"],["Ismail Deivan","ST"],["Magdy Mostafa","ST"],["Magdy Kamel","ST"],["Mohamed Adly","ST"]],"Ghazl El Mahalla 1972/73":[["Omar Ramadan","Feldspieler"],["Ahmed Abu Ismail","Feldspieler"]]};
const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const sources={
 "Al Mokawloon 1982/83":"https://3rabica.org/نادي_المقاولون_العرب_موسم_1982–83",
 "Ghazl El Mahalla 1972/73":"https://koraapedia.com/نتائج-الدوري-المصري-موسم-1972-1973/"
};
for(const [team,players] of Object.entries(extra)){
 const roster=Array.isArray(db[team])?db[team]:[],names=new Set(roster.map(p=>norm(p.name)));
 for(const [name,pos] of players){
  if(names.has(norm(name)))continue;
  names.add(norm(name));
  roster.push({id:norm(name),name,pos,prole:pos==="Feldspieler"?"Feldspieler":undefined,
    impact:3,strength:pos==="TW"?15:14,starter:false,squadIndex:roster.length,
    source:team==="Ghazl El Mahalla 1972/73"&&name==="Ahmed Abu Ismail"?
      "https://koraapedia.com/مواجهات-الزمالك-وغزل-المحلة/":sources[team],
    verification:"historical-season-source"});
 }
 db[team]=roster;
}
if(!coaches["Al Mokawloon 1982/83"])coaches["Al Mokawloon 1982/83"]="Michael Everitt";
const teams=(window.TC_CLUB_CATALOG?.["Ägypten · Egyptian Premier League"]||[]).map(x=>String(x).split("|")[0]);
const count=t=>Array.isArray(db[t])?db[t].length:0;
window.TC_EGYPT_ROSTER_AUDIT={version:"2026-10-23-1",seasons:teams.length,
 under11:teams.filter(t=>count(t)<11),under15:teams.filter(t=>count(t)<15),
 missingCoaches:teams.filter(t=>!coaches[t]),
 addedToContractors:15,addedToGhazl:2,
 notes:"Ghazl 1972/73 remains below 11 and without an identified goalkeeper; no simulated placeholders."};
})();
