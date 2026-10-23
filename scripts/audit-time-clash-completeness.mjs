/* TIME CLASH real squad completeness audit.
 * Executes the exact shared roster modules in page load order (Node.js only).
 * Flags missing real players, missing named goalkeepers, duplicate IDs and
 * absent coach references without inventing or adding roster players.
 * Prints a concise summary; --json prints machine-readable audit details.
 */
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";

const root=process.cwd();
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");
const html=read("de/time-clash/index.html");
const srcs=[...html.matchAll(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g)]
  .map(m=>m[1].split("?")[0])
  .filter(s=>s.startsWith("/time-clash/")).map(s=>s.slice(1));
const window={};
const context=vm.createContext({window});
const errors=[];
for(const src of srcs){
  try{vm.runInContext(read(src),context,{filename:src,timeout:10000});}
  catch(e){errors.push({module:src,error:String(e.message||e)});}
}
const clubs=window.TC_CLUB_CATALOG||{};
const natStart=html.indexOf("const catalog={\nnation:{");
const natEnd=natStart<0?-1:html.indexOf("},club:{",natStart);
if(natStart<0||natEnd<0)errors.push({module:"de/time-clash/index.html",error:"National catalogue not found"});
const nationalNames=natEnd>=0?[...html.slice(natStart,natEnd).matchAll(/"([^"\n]+\|[^"\n]+)"/g)]
  .map(m=>m[1].split("|")[0]):[];
const groups=[...Object.entries(clubs).map(([group,entries])=>({group,names:entries.map(s=>String(s).split("|")[0])})),
  {group:"Nationalmannschaften",names:nationalNames}];
const db=window.TC_ROSTER_DB||{},coaches=window.TC_COACH_DB||{};
const slug=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-");
const teamData=(name,group)=>{
  const players=Array.isArray(db[name])?db[name]:[];
  const named=players.filter(p=>p&&typeof p.name==="string"&&p.name.trim()!=="");
  const uniqueNames=new Set(named.map(p=>slug(p.name)));
  const goalkeepers=named.filter(p=>["TW","Torwart","GK","Goalkeeper"].includes(p.pos||p.prole||p.role));
  return {team:name,group,count:named.length,goalkeepers:goalkeepers.length,duplicateNames:named.length-uniqueNames.size,
    missingCoach:!coaches[name],ready11:named.length>=11,ready15:named.length>=15,
    playable:named.length>=11&&goalkeepers.length>0&&uniqueNames.size>=11,
    complete:named.length>=15&&goalkeepers.length>0&&uniqueNames.size===named.length};
};
const teamRows=groups.flatMap(x=>x.names.map(n=>teamData(n,x.group)));
const byGroup=groups.map(g=>{
 const rows=teamRows.filter(x=>x.group===g.group);
 return {group:g.group,total:rows.length,ready11:rows.filter(x=>x.ready11).length,
   playable:rows.filter(x=>x.playable).length,
   complete:rows.filter(x=>x.complete).length,
   under11:rows.filter(x=>!x.ready11).length,
   under15:rows.filter(x=>!x.ready15).length,
   noGoalkeeper:rows.filter(x=>!x.goalkeepers).length,
   duplicateNames:rows.filter(x=>x.duplicateNames).length,
   missingCoaches:rows.filter(x=>x.missingCoach).length};
});
const summary={date:"2026-10-23",loadedModules:srcs.length,groups:byGroup.length,
  clubs:byGroup.filter(x=>x.group!=="Nationalmannschaften").reduce((a,g)=>a+g.total,0),
  nationalTeams:nationalNames.length,
  under11:teamRows.filter(x=>!x.ready11).length,
  unplayable:teamRows.filter(x=>!x.playable).length,
  missingGoalkeepers:teamRows.filter(x=>!x.goalkeepers).length,
  noCoach:teamRows.filter(x=>x.missingCoach).length};
const report={summary,byGroup,blocked:teamRows.filter(x=>!x.playable),
  physicallyUnder11:teamRows.filter(x=>!x.ready11),
  needingVerification:teamRows.filter(x=>!x.complete),
  moduleErrors:errors};
if(process.argv.includes("--json"))console.log(JSON.stringify(report,null,2));
else {
 console.log("TIME CLASH roster completeness audit");
 console.log(JSON.stringify(summary,null,2));
 for(const g of byGroup)console.log(
   g.group+": "+g.playable+"/"+g.total+" spielbar (11+ und Torwart); "+g.complete+"/"+g.total+
   " ≥15 + goalkeeper + no duplicates; missing coach "+g.missingCoaches
 );
 if(report.blocked.length){
  console.log("\nMissing playing XI:");
  for(const x of report.blocked)console.log("- "+x.group+" :: "+x.team+" ("+x.count+"/11)");
 }
 if(errors.length){console.error("\nRuntime module load failures:",errors);}
}
const national=byGroup.find(g=>g.group==="Nationalmannschaften");
if(errors.length||!national||national.total!==49||national.under11!==0||national.under15!==0||national.playable!==49){
 console.error("AUDIT FAIL: module error or incomplete national team list");
 process.exitCode=1;
}
