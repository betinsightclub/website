/* BetInsight TIME CLASH · USA 2026 FIFA World Cup roster, 26 officially named players.
   Authoritative: https://www.ussoccer.com/stories/2026/05/usmnt/meet-the-team-world-cup-roster
   Released May 26, 2026 by U.S. Soccer; manager Mauricio Pochettino.
   This is NOT an assertion of a historical starting XI. Squad order is a
   balanced simulation reference order (GK/DEF/MID/FWD) because TIME CLASH
   promotes the first 11 to the simulation XI if none has starter=true.
*/
(function(){
"use strict";
const team="USA 2026";
const src="https://www.ussoccer.com/stories/2026/05/usmnt/meet-the-team-world-cup-roster";
const list=[["Matt Turner","TW",1],["Sergiño Dest","ABW",2],["Chris Richards","ABW",3],["Antonee Robinson","ABW",5],["Auston Trusty","ABW",6],["Tyler Adams","MIT",4],["Weston McKennie","MIT",8],["Gio Reyna","MIT",7],["Malik Tillman","MIT",17],["Ricardo Pepi","ST",9],["Christian Pulisic","ST",10],["Brenden Aaronson","ST",11],["Miles Robinson","ABW",12],["Tim Ream","ABW",13],["Sebastian Berhalter","MIT",14],["Cristian Roldan","MIT",15],["Alex Freeman","ABW",16],["Max Arfsten","ABW",18],["Haji Wright","ST",19],["Folarin Balogun","ST",20],["Timothy Weah","ST",21],["Mark McKenzie","ABW",22],["Joe Scally","ABW",23],["Matt Freese","TW",24],["Chris Brady","TW",25],["Alejandro Zendejas","ST",26]];
const slug=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const db=window.TC_ROSTER_DB=window.TC_ROSTER_DB||{};
if(!Array.isArray(db[team])||db[team].length<11){
 db[team]=list.map(([name,pos,number],i)=>({
  id:slug(name),name,pos,impact:3,strength:18,
  squadIndex:i,starter:false,shirtNumber:number,
  source:src,verification:"official-federation-final-tournament-squad"
 }));
}
const coaches=window.TC_COACH_DB=window.TC_COACH_DB||{};
coaches[team]="Mauricio Pochettino";
window.TC_USA2026_AUDIT={source:src,team,players:db[team].length,
 minimumMet:db[team].length>=15,uniqueNames:new Set(db[team].map(p=>slug(p.name))).size,
 firstElevenFormation:"1 GK, 4 DEF, 4 MID, 2 FWD — simulation reference, not historical starting XI"};
})();
