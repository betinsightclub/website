/* BetInsight TIME CLASH | Wydad Casablanca champion season 2014/15.
 Goalkeepers, directly from season 2014/15 historic squad list:
 https://www.transfermarkt.com/wydad-athletic-club-casablanca/kader/verein/6603/saison_id/2014/plus/1
 New players join as bench/available candidates; do not claim historic XI.
*/
(function(){"use strict";
const team="Wydad AC Casablanca 2014/15",src="https://www.transfermarkt.com/wydad-athletic-club-casablanca/kader/verein/6603/saison_id/2014/plus/1";
const db=window.TC_ROSTER_DB=window.TC_ROSTER_DB||{},squad=Array.isArray(db[team])?db[team]:[];
const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const seen=new Set(squad.map(p=>norm(p.name)));
for(const name of ["Mohamed Akid","Yassine Boutaib","Badereddine Benaachour","Hamza Ouzal"]){
 if(seen.has(norm(name)))continue;seen.add(norm(name));
 squad.push({id:"wyd-2015-"+norm(name),name,pos:"TW",prole:"Torwart",strength:18,
  impact:3,starter:false,squadIndex:squad.length,source:src,verification:"2014/15 team goalkeeper"});
}
db[team]=squad;
window.TC_WYDAD_2015_GOALKEEPER_AUDIT={team,players:squad.length,goalkeepers:squad.filter(p=>p.pos==="TW").length,source:src};
})();
