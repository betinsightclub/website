/* BetInsight TIME CLASH · optional historical roster reconstruction v1 · 2026-10-23
 * A missing historical name is NEVER fabricated. Only the simulated match engine
 * receives anonymous numbered position slots. The archived TC_ROSTER_DB remains
 * untouched, as do member/community teams and official squad records.
 * This is a fictional what-if simulation, never an official historic line-up.
 */
(function(root) {
"use strict";
const DICT={
 de:{TW:"Simulation · Torwart",ABW:"Simulation · Abwehr",MIT:"Simulation · Mittelfeld",ST:"Simulation · Sturm"},
 en:{TW:"Simulation · Goalkeeper",ABW:"Simulation · Defender",MIT:"Simulation · Midfielder",ST:"Simulation · Forward"},
 es:{TW:"Simulación · Portero",ABW:"Simulación · Defensa",MIT:"Simulación · Centrocampista",ST:"Simulación · Delantero"},
 fr:{TW:"Simulation · Gardien",ABW:"Simulation · Défenseur",MIT:"Simulation · Milieu",ST:"Simulation · Attaquant"},
 it:{TW:"Simulazione · Portiere",ABW:"Simulazione · Difensore",MIT:"Simulazione · Centrocampista",ST:"Simulazione · Attaccante"},
 pt:{TW:"Simulação · Goleiro",ABW:"Simulação · Defensor",MIT:"Simulação · Meio-campo",ST:"Simulação · Atacante"}
};
const POSITION={TW:"Torwart",ABW:"Abwehr",MIT:"Mittelfeld",ST:"Sturm"};
const QUOTA={TW:1,ABW:4,MIT:4,ST:2};
function role(player) {
 const raw=String(player?.prole||player?.role||player?.pos||"").toUpperCase();
 if(["TW","TORWART","GOALKEEPER","GK","GOLEIRO","PORTERO"].includes(raw))return "TW";
 if(["ABW","ABWEHR","DEF","DEFENDER","DEFENCE","DEFENSE"].includes(raw))return "ABW";
 if(["MIT","MITTELFELD","MF","MIDFIELDER","MIDFIELD"].includes(raw))return "MIT";
 if(["ST","STURM","FW","FORWARD","STRIKER"].includes(raw))return "ST";
 return "UNKNOWN";
}
function build(team,players,kind,side,language){
 if(kind!=="club"&&kind!=="nation")return players;
 const pool=Array.isArray(players)?players.slice():[];
 const code=(DICT[language]||DICT.de);
 const count={TW:0,ABW:0,MIT:0,ST:0};
 for(const p of pool){const r=role(p);if(r in count)count[r]++;}
 const usedIds=new Set(pool.map(p=>p.id));
 const strength=Math.max(9,Math.min(22,Math.round(4+Number(team?.rating||78)*.16)));
 let index=0;
 function add(pos){
  index++;
  const key="tc-reconstructed-"+side+"-"+index+"-"+pos;
  if(usedIds.has(key))throw Error("Reconstruction slot ID collision");
  usedIds.add(key);
  pool.push({
   id:key,name:code[pos]+" "+index,pos,prole:POSITION[pos],
   strength,impact:3,squadIndex:10000+index,starter:false,
   synthetic:true,verified:false,source:null,
   reconstruction:"ANONYMOUS_POSITION_ONLY"
  });
  count[pos]++;
 }
 if(!count.TW)add("TW");
 while(pool.length<11){
  const next=["ABW","MIT","ST"].find(r=>count[r]<QUOTA[r])
   ||["ABW","MIT","ST"].sort((a,b)=>count[a]-count[b])[0];
  add(next);
 }
 return pool;
}
function status(players){
 const p=Array.isArray(players)?players:[];
 return {actual:p.filter(x=>!x.synthetic).length,anonymous:p.filter(x=>x.synthetic).length,
  hasGoalkeeper:p.some(x=>role(x)==="TW"),valid:p.length>=11&&p.some(x=>role(x)==="TW")};
}
root.TC_RECONSTRUCT_SQUAD=build;
root.TC_RECONSTRUCT_STATUS=status;
if(typeof module!=="undefined"&&module.exports){module.exports={build,status,role};}
})(typeof window!=="undefined"?window:globalThis);
