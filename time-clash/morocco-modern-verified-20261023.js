/* TIME CLASH · Morocco historic champion roster patches, dated 2026-10-23.
   Sources are preserved per player. No fabricated names, no claimed starting XIs.
   MAS Fès: club squad listing https://www.maghreb-fes.com/
   Raja 2023/24: https://en.wikipedia.org/wiki/2023%E2%80%9324_Raja_CA_season
   Wydad 2021/22: https://en.wikipedia.org/wiki/2021%E2%80%9322_Wydad_AC_season
   The MAS Fès page should be rechecked against archival season records; supplement is
   season-scoped, and all additions retain their source for later correction.
*/
(function(){"use strict";
const SQUADS={"MAS Fès 2025/26":{"coach":null,"source":"https://www.maghreb-fes.com/","names":{"TW":["Oussama Errahmany","Salaheddine Chihab"],"ABW":["Adil Rhaili","Reda Mhannaoui","Saad Ait Khorsa","Salaheddine Ghedamsi","Driss El Jabli","Ayman Chbani","Hamza Ait Allal"],"MIT":["Anas Tahiri","Kabelo Seakanyeng","Marouane Ouhrou","Amine Mehdi Oudrhiri Idrissi","Oussama Noureddine","Achraf Harmach","Hamza Afsal","Zakaria Hamadi","Salaheddine Faiz","Adam Brika","El Habib Brija"],"ST":["Arthur Kevin Yamga Tientcheu","Cheikhna Semega","Youssef Dalouzi","Soufiane Benjdida","Khalid Baba","Soulaïman Allouch"]}},"Raja Casablanca 2023/24":{"coach":"Josef Zinnbauer","source":"https://en.wikipedia.org/wiki/2023%E2%80%9324_Raja_CA_season","names":{"TW":["Anas Zniti","Yassine Zoubir","Mohamed Baayou"],"ABW":["Abdellah Khafifi","Ismael Mokadem","Bouchaib Arrassi","Mehdi Mchakhchekh","Mohamed Boulacsoute","Youssef Belammari","Zakaria Labib"],"MIT":["El Mehdi Moubarik","Ahmadou Camara","Mohamed Zrida","Zakaria El Wardi","Mohamed Al Makahasi","Haashim Domingo","Sabir Bougrine","Adam Ennafati","Hervé Guy"],"ST":["Nawfel Zerhouni","Yousri Bouzok","Marouane Zila","El Mehdi Maouhoub","Víctor Ábrego","Riad Benayad"]}},"Wydad AC Casablanca 2021/22":{"coach":"Walid Regragui","source":"https://en.wikipedia.org/wiki/2021%E2%80%9322_Wydad_AC_season","names":{"TW":["Yanis Henin","Ahmed Reda Tagnaouti","Aissa Sioudi"],"ABW":["Achraf Dari","Amine Aboulfath","Yahia Attiyat Allah","Hamza Asrir","Ayoub El Amloud","Mohamed Rahim","Amine Farhane","Cheick Comara","Ayoub Benchaoui"],"MIT":["Ayoub Skouma","Yahya Jabrane","Anas Serrhat","Zouhair El Moutaraji","Aymane El Hassouni","Abdellah Haimoud","Jalal Daoudi","Walid El Karti","Reda Jaadi","Hamza Ait Allal"],"ST":["Badie Aouk","Mohamed El Ouardi","Muaid Ellafi","Chouaib Faidi","Salaheddine Benyachou","Mounsef Chrachem","Juvhel Tsoumou"]}}};
const db=window.TC_ROSTER_DB=window.TC_ROSTER_DB||{},coaches=window.TC_COACH_DB=window.TC_COACH_DB||{};
const slug=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const norm=s=>slug(s).split("-").filter(Boolean).sort().join("-");
const audit={teams:{},stillIncomplete:[]};
for(const [team,info] of Object.entries(SQUADS)){
 const existing=Array.isArray(db[team])?db[team]:[];
 const lookup=new Map(existing.map(p=>[norm(p.name),p]));
 let added=0;
 for(const [pos,players] of Object.entries(info.names)){
   for(const name of players){
     const old=lookup.get(norm(name));
     if(old){ if(!old.pos||team==="MAS Fès 2025/26")old.pos=pos;continue}
     const p={id:"mar-"+slug(name),name,pos,strength:18,impact:3,starter:false,
       squadIndex:existing.length,source:info.source,verification:"documented-season-squad"};
     existing.push(p);lookup.set(norm(name),p);added++;
   }
 }
 db[team]=existing;
 if(info.coach&&!coaches[team])coaches[team]=info.coach;
 const gks=existing.filter(p=>p.pos==="TW").length;
 audit.teams[team]={players:existing.length,added,goalkeepers:gks,coach:coaches[team]||null};
 if(existing.length<15||gks<1)audit.stillIncomplete.push(team);
}
window.TC_MOROCCO_20261023_AUDIT=audit;
})();
