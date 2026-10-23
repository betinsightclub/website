/* TIME CLASH · historic season-specific supplements, 2026-10-23
 Moroccan champions Moghreb Tétouan 2011/12, 16 names from season-specific
 Transfermarkt: https://www.transfermarkt.com/moghreb-tetouan/startseite/verein/9100/saison_id/2011
 1995 South African NSL champions Cape Town Spurs, four named players confirmed by
 contemporaneous retrospective: https://iol.co.za/capeargus/sport/2002-04-03-pirates-have-experience-santos-have-igesund/
 Additional 1995 player evidence: https://www.businessday.co.za/bd/sport/soccer/2023-06-20-mogamad-allie-memories-of-the-heyday-of-cape-town-spurs/
 Coaches: Aziz El Amri (2011/12 Moroccan champion) and Mich d'Avray (1995 NSL).
 Existing players retained; new squad players are non-starters.
 No claim that sim eleven equals historic match line-up.
*/
(function(){"use strict";
const groups={"Moghreb Tétouan 2011/12":{"coach":"Aziz El Amri","source":"https://www.transfermarkt.com/moghreb-tetouan/startseite/verein/9100/saison_id/2011","names":{"TW":"Mohamed El Yousfi;Aziz El Kinani","ABW":"Mourtada Fall;Mohamed Abarhoun;Hassan Bouizgar;Jaouad Ismaili;Zakaria Melhaoui;Youssef Bouchatta","MIT":"Ahmed Jahouh;Noussair El Mimouni","ST":"Khalid Sbai;Samir Kizani;Bilal Daalouse;Abderazak Sakim;Orlando da Costa;Gabriel Buru"}},"Cape Town Spurs 1995":{"coach":"Mich d'Avray","source":"https://iol.co.za/capeargus/sport/2002-04-03-pirates-have-experience-santos-have-igesund/","names":{"ABW":"Edries Burton;Craig Rosslee","MIT":"Ronnie Zondi;Roger Lupiya"}}};
const db=window.TC_ROSTER_DB=window.TC_ROSTER_DB||{},coaches=window.TC_COACH_DB=window.TC_COACH_DB||{};
const slug=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const audit={version:"2026-10-23-4",teams:{}};
for(const [team,info] of Object.entries(groups)){
 const players=Array.isArray(db[team])?db[team]:[],seen=new Set(players.map(p=>slug(p.name)));
 let added=0;
 for(const [pos,entry] of Object.entries(info.names))for(const name of entry.split(";").map(x=>x.trim()).filter(Boolean)){
  if(seen.has(slug(name)))continue;seen.add(slug(name));
  players.push({id:"verify-"+slug(name),name,pos,strength:18,impact:3,starter:false,squadIndex:players.length,source:info.source,verification:"season-specific historical squad"});added++;
 }
 db[team]=players;
 if(!coaches[team])coaches[team]=info.coach;
 audit.teams[team]={count:players.length,added,coach:coaches[team],ready11:players.length>=11,complete15:players.length>=15};
}
window.TC_ARCHIVE_OCT2026_AUDIT=audit;
})();
