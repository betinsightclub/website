/* TIME CLASH – Moroccan season roster patch for Raja 2010/11, FUS Rabat 2015/16.
   Season-specific archive sources:
   https://en.wikipedia.org/wiki/2010%E2%80%9311_Raja_CA_season
   https://www.transfermarkt.com/fus-rabat/kader/verein/6371/saison_id/2015/plus/1
   Historic coaches: Mohamed Fakhir and Walid Regragui.
   Order is simulation reference, not factual historic starting XI.
*/
(function(){"use strict";
const SQUADS={"Raja Casablanca 2010/11":{"coach":"Mohamed Fakhir","source":"https://en.wikipedia.org/wiki/2010%E2%80%9311_Raja_CA_season","names":{"TW":"Yassine El Had;Tarek El Jarmouni;Younes Ataba","ABW":"Youness Bellakhdar;Hicham Mahdoufi;Mourad Ainy;Oumar Diop;Abdessamad Ouarrad;Zakaria Ismaili;Mohamed Oulhaj;Rachid Soulaimani;Zakaria Zerouali;Hicham Ait Lkrif;Ismail Belmaalem;Amin Erbati","MIT":"Lanciné Koné;Abdelhak Talhaoui;Abdessamad Ouhaki;Nabil Mesloub;Hassan Alas;Souleymane Demba;Said Fettah;Kouko Guehi;Mamadou Baila","ST":"Mohsine Moutouali;Bilal Danguir;Hassan Souari;Pape Ndiaye;Abdelmoula Berrabeh;Bouchaib El Moubarki;Omar Najdi;Yassine Salhi;Hicham Aboucherouane;Hassan Tair;Soufiane Alloudi"}},"FUS Rabat 2015/16":{"coach":"Walid Regragui","source":"https://www.transfermarkt.com/fus-rabat/kader/verein/6371/saison_id/2015/plus/1","names":{"TW":"Abderahmane El Houasli;Younes Ezziadi;Aymane Majid;Anas Chellaf","ABW":"Ass Mandaw Sy;Marwane Saadane;El Mehdi El Bassil;Mehdi Khalis;Adil Benzariouh;Nayef Aguerd;Mohammed Nahiri;Reda Ennaoualy;Yassine Jbira;Achraf Berqi","MIT":"Ayoub Skouma;Badr Boulahroud;Youssef El Gnaoui;Adam Ennaffati;Mohammed Fouzair;Amine Mamouni","ST":"Mourad Batna;Abdessalam Benjelloun;Nabil Baha;Moustapha Kondé;Yusupha Njie;Saoud Izzem"}}};
const db=window.TC_ROSTER_DB=window.TC_ROSTER_DB||{},coaches=window.TC_COACH_DB=window.TC_COACH_DB||{};
const slug=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const norm=s=>slug(s).split("-").filter(Boolean).map(x=>x==="aymane"?"ayman":x).sort().join("-");
const audit={teams:{},incomplete:[]};
for(const [team,info] of Object.entries(SQUADS)){
 const all=Array.isArray(db[team])?db[team]:[],known=new Map(all.map(p=>[norm(p.name),p]));
 let added=0;
 for(const [pos,list] of Object.entries(info.names))
  for(const name of list.split(";").map(x=>x.trim()).filter(Boolean)){
   const key=norm(name),old=known.get(key);
   if(old){if(!old.pos)old.pos=pos;continue}
   const p={id:"mar3-"+slug(name),name,pos,strength:18,impact:3,
     starter:false,squadIndex:all.length,source:info.source,
     verification:"historic-champion-season-squad"};
   all.push(p);known.set(key,p);added++;
  }
 db[team]=all;if(info.coach&&!coaches[team])coaches[team]=info.coach;
 audit.teams[team]={total:all.length,added,goalkeepers:all.filter(p=>p.pos==="TW").length};
 if(all.length<15||!all.some(p=>p.pos==="TW"))audit.incomplete.push(team);
}
window.TC_MOROCCO_ARCHIVE_AUDIT=audit;
})();
