/* BetInsight TIME CLASH | Morocco champion squads 2005-2007
 Wydad 2005/06 season roster and Jose Romao:
 https://www.transfermarkt.co.uk/wydad-casablanca/startseite/verein/6603/saison_id/2005
 Khouribga 2006/07 documented 2006 summer arrivals and Mustapha Madih:
 https://www.transfermarkt.com/olympique-khouribga/transfers/verein/18702/saison_id/2006
 Durban City 1982/83 coach Clive Barker:
 https://iol.co.za/sunday-tribune/news/2023-06-15-obituary-of-former-bafana-coach-clive-the-dog-barker/
 Exact season sources, no manufactured player or historic first XI.
*/
(function(){"use strict";
const PACK={"Wydad AC Casablanca 2005/06":{"source":"https://www.transfermarkt.co.uk/wydad-casablanca/startseite/verein/6603/saison_id/2005","coach":"José Romão","players":{"TW":["Hakim Mouzaki"],"ABW":["Zakaria Aoudane","Mustapha Talha","Hicham Louissi","Nabil Moustade","Hamza Hajji"],"MIT":["Hamid Termina","Youness Mankari","Ahmed Talbi","Reda Doulyazal","Yasine Zouchou","Chamseddine El Janabi","Youssef Mariana"],"ST":["Faouzi Abdelghani","Abderrahim Saidi","Ibrahim Kabore","Ibrahima Touré"]}},"Olympique Khouribga 2006/07":{"source":"https://www.transfermarkt.com/olympique-khouribga/transfers/verein/18702/saison_id/2006","coach":"Mustapha Madih","players":{"ABW":["Adil Bekkari","Hassan Bouizgar"],"ST":["Jamal Triki"]}}};
const db=window.TC_ROSTER_DB=window.TC_ROSTER_DB||{},coaches=window.TC_COACH_DB=window.TC_COACH_DB||{};
const slug=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const norm=s=>slug(s).replace(/-/g,"");
const audit={version:"2026-10-23-5",sources:[],teams:{}};
for(const [team,info] of Object.entries(PACK)){
 const all=Array.isArray(db[team])?db[team]:[],seen=new Set(all.map(p=>norm(p.name))),added=[];
 for(const [pos,names] of Object.entries(info.players)){
  for(const name of names){
   if(seen.has(norm(name)))continue;
   seen.add(norm(name));
   all.push({id:"mar-"+slug(name),name,pos,strength:18,impact:3,starter:false,
      squadIndex:all.length,source:info.source,verification:"historic season roster / transfer record"});
   added.push(name);
  }
 }
 db[team]=all;
 if(!coaches[team])coaches[team]=info.coach;
 audit.sources.push(info.source);
 audit.teams[team]={added,players:all.length,keeper:all.some(p=>p.pos==="TW"),coach:coaches[team]};
}
for(const team of ["Durban City 1982","Durban City 1983"])
 if(!coaches[team])coaches[team]="Clive Barker";
audit.durbanCoachSource="https://iol.co.za/sunday-tribune/news/2023-06-15-obituary-of-former-bafana-coach-clive-the-dog-barker/";
window.TC_MOROCCO_2005_2007_AUDIT=audit;
})();
