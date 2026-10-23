/* BetInsight TIME CLASH | North America FIFA World Cup 2026 verified national rosters | 2026-10-23
 Mexico: https://datencenter.dfb.de/teams/mexiko
 Canada: https://datencenter.dfb.de/en/competitions/fifa-world-cup/seasons/2026-in-usa%2Fmexico%2Fcanada/teams/canada?datacenter_name=data-center
 NOTE: Canada midfielder Jayden Nelson replaces Marcelo Flores per June 9 update
 https://olympic.ca/2026/05/29/team-canada-unveils-26-man-roster-for-fifa-world-cup-2026/
 Every player appears in an official tournament roster. No historical match
 starting XI is asserted; first eleven are a simulation-only balanced order.
*/
(function(){
"use strict";
const teams={"Mexiko 2026":{"coach":"Javier Aguirre","source":"https://datencenter.dfb.de/teams/mexiko","players":[["José Raúl Rangel","TW"],["Jorge Sánchez","ABW"],["César Montes","ABW"],["Johan Vásquez","ABW"],["Israel Reyes","ABW"],["Edson Álvarez","MIT"],["Erik Lira","MIT"],["Álvaro Fidalgo","MIT"],["Gilberto Mora","MIT"],["Raúl Jiménez","ST"],["Santiago Giménez","ST"],["Carlos Acevedo","TW"],["Guillermo Ochoa","TW"],["Mateo Chávez","ABW"],["Jesús Gallardo","ABW"],["Luis Romo","MIT"],["Orbelín Pineda","MIT"],["Obed Vargas","MIT"],["Luis Chávez","MIT"],["Roberto Alvarado","MIT"],["Brian Gutiérrez","MIT"],["Alexis Vega","ST"],["Armando González","ST"],["Julián Quiñones","ST"],["César Huerta","ST"],["Guillermo Martínez","ST"]]},"Kanada 2026":{"coach":"Jesse Marsch","source":"https://datencenter.dfb.de/en/competitions/fifa-world-cup/seasons/2026-in-usa%2Fmexico%2Fcanada/teams/canada?datacenter_name=data-center","players":[["Maxime Crépeau","TW"],["Alphonso Davies","ABW"],["Alistair Johnston","ABW"],["Moïse Bombito","ABW"],["Derek Cornelius","ABW"],["Stephen Eustáquio","MIT"],["Ismaël Koné","MIT"],["Tajon Buchanan","MIT"],["Jonathan Osorio","MIT"],["Jonathan David","ST"],["Cyle Larin","ST"],["Owen Goodman","TW"],["Dayne St. Clair","TW"],["Luc de Fougerolles","ABW"],["Alfie Jones","ABW"],["Richie Laryea","ABW"],["Niko Sigur","ABW"],["Joel Waterman","ABW"],["Ali Ahmed","MIT"],["Mathieu Choinière","MIT"],["Liam Millar","MIT"],["Nathan Saliba","MIT"],["Jacob Shaffelburg","MIT"],["Jayden Nelson","MIT"],["Promise David","ST"],["Tani Oluwaseyi","ST"]]}};
const db=window.TC_ROSTER_DB=window.TC_ROSTER_DB||{},coaches=window.TC_COACH_DB=window.TC_COACH_DB||{};
const slug=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
for(const [team,data] of Object.entries(teams)){
 const old=db[team];
 if(!Array.isArray(old)||old.length<11){
  db[team]=data.players.map(([name,pos],i)=>({id:slug(name),name,pos,impact:3,strength:18,
    starter:false,squadIndex:i,source:data.source,verification:"official-2026-world-cup-tournament-roster"}));
 }
 coaches[team]=data.coach;
}
window.TC_NORTHAMERICA2026_AUDIT=Object.fromEntries(Object.entries(teams).map(([k,v])=>[k,{
 playerCount:db[k]?.length||0, source:v.source, coach:coaches[k],
 unique:new Set((db[k]||[]).map(p=>slug(p.name))).size}]));
})();
