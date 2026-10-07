/* BetInsight TIME CLASH · Niederlande Meisterkader · WIP Block 1 · 2026-10-07
   Block 1 covers Eredivisie champions 1970/71 through 1984/85.
   The 15 historical champion squads already present in rosters-all.js were checked
   against the verified Google Sheet "BetInsight – TIME CLASH Meisterkader ab 1970":
   player counts and player names match 1:1 for all 15 seasons (17–22 players).
   No roster replacement is needed in this block.
   Coach sources: season/club archives, Voetbalstats, DFB Datencenter and Ajax club archive.
   IMPORTANT: This file is intentionally NOT loaded by the public TIME CLASH pages yet.
   It is a staged work file until the complete Netherlands audit is finished.
*/
(function(){
"use strict";

const NETHERLANDS_GROUP="Niederlande · Eredivisie";
const PART1_FROM="1970/71";
const PART1_THROUGH="1984/85";

const COACH_BY_SEASON={
  "1970/71":"Ernst Happel",
  "1971/72":"Ștefan Kovács",
  "1972/73":"Ștefan Kovács",
  "1973/74":"Wiel Coerver",
  "1974/75":"Kees Rijvers",
  "1975/76":"Kees Rijvers",
  "1976/77":"Tomislav Ivić",
  "1977/78":"Kees Rijvers",
  "1978/79":"Cor Brom",
  "1979/80":"Leo Beenhakker",
  "1980/81":"Georg Keßler",
  "1981/82":"Kurt Linder",
  "1982/83":"Aad de Mos",
  "1983/84":"Thijs Libregts",
  "1984/85":"Aad de Mos"
};

const PART1_SEASONS=Object.keys(COACH_BY_SEASON);

window.TC_CLUB_CATALOG=window.TC_CLUB_CATALOG||{};
window.TC_ROSTER_DB=window.TC_ROSTER_DB||{};
window.TC_COACH_DB=window.TC_COACH_DB||{};

const seasonOf=name=>{
  const m=String(name||"").match(/((?:19|20)\d{2}\/\d{2})$/);
  return m?m[1]:"";
};

const part1Teams=(Array.isArray(window.TC_CLUB_CATALOG[NETHERLANDS_GROUP])
  ? window.TC_CLUB_CATALOG[NETHERLANDS_GROUP]
  : [])
  .map(row=>String(row).split("|")[0])
  .filter(team=>PART1_SEASONS.includes(seasonOf(team)));

for(const team of part1Teams){
  const season=seasonOf(team);
  if(COACH_BY_SEASON[season]) window.TC_COACH_DB[team]=COACH_BY_SEASON[season];
}

const counts=part1Teams.map(team=>
  Array.isArray(window.TC_ROSTER_DB[team])?window.TC_ROSTER_DB[team].length:0
);

window.TC_NETHERLANDS_ROSTER_AUDIT_PART1={
  version:"2026-10-07-part1",
  completedFrom:PART1_FROM,
  completedThrough:PART1_THROUGH,
  seasons:part1Teams.length,
  minimumPlayers:counts.length?Math.min(...counts):0,
  maximumPlayers:counts.length?Math.max(...counts):0,
  under15:part1Teams.filter((team,i)=>counts[i]<15),
  under11:part1Teams.filter((team,i)=>counts[i]<11),
  missingCoaches:part1Teams.filter(team=>!window.TC_COACH_DB[team]),
  rosterSource:"BetInsight – TIME CLASH Meisterkader ab 1970 · verified Google Sheet",
  status:"STAGED_NOT_PUBLIC"
};
})();