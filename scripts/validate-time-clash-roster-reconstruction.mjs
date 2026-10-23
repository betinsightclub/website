/* Time Clash roster reconstruction regression guard (Node 20+, no npm dependencies).
   Tests the exact public script loading order, all club and national selections,
   and that anonymous simulation slots NEVER contaminate archival team databases. */
import fs from "node:fs";
import assert from "node:assert/strict";
import vm from "node:vm";

const LANGUAGES=["de","en","es","fr","it","pt"];
const failures=[];
const log=(msg)=>console.log("[TIME CLASH] "+msg);
const file=(path)=>fs.readFileSync(path,"utf8");
const sourcePaths=(html)=>[...html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)]
 .map(m=>m[1].split("?")[0].replace(/^\//,""))
 .filter(path=>path.startsWith("time-clash/"));
const html=file("de/time-clash/index.html"),paths=sourcePaths(html);
const keyScript="time-clash/roster-reconstruction-v1.js";
assert(paths.includes(keyScript),"Reconstruction module not loaded");
for(const lang of LANGUAGES){
 const html=file(lang+"/time-clash/index.html"),list=sourcePaths(html);
 assert(list.includes(keyScript),lang+" missing reconstruction module");
 assert(list.at(-1)!==keyScript||list.length>=2,lang+" script loading incomplete");
 assert(html.includes("tcRenderReconstructionNotice"),lang+" missing accessible notice");
 assert(html.includes("TC_RECONSTRUCT_SQUAD"),lang+" missing runtime hook");
 const embedded=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
  .filter(m=>!m[1].includes("src=")).map(m=>m[2]);
 for(const source of embedded)if(source.trim())assert.doesNotThrow(()=>new Function(source),lang+" invalid inline JavaScript");
}
const runtime={window:{},document:{documentElement:{lang:"de"}},console};
vm.createContext(runtime);
for(const path of paths){
 assert(fs.existsSync(path),"Missing public script: "+path);
 vm.runInContext(file(path),runtime,{filename:path,timeout:15_000});
}
const W=runtime.window;
assert.equal(typeof W.TC_RECONSTRUCT_SQUAD,"function");
assert.equal(typeof W.TC_RECONSTRUCT_STATUS,"function");
const clubCatalog=W.TC_CLUB_CATALOG||{},database=W.TC_ROSTER_DB||{};
const getCount=r=>Array.isArray(r)?r.length:0;
const verify=(name,teamkind,rating)=>{
 const actual=database[name]||[],before=JSON.stringify(actual);
 const pool=W.TC_RECONSTRUCT_SQUAD({name,rating},actual,teamkind,"A","de");
 const check=W.TC_RECONSTRUCT_STATUS(pool);
 assert(check.valid,name+": reconstructed XI must have 11 players and GK");
 assert(pool.length>=11,name+": incomplete XI");
 assert.equal(JSON.stringify(actual),before,name+": historic database unexpectedly mutated");
 assert.equal(new Set(pool.map(p=>p.id)).size,pool.length,name+": duplicate simulation IDs");
 assert(pool.every(p=>!p.synthetic||(p.verified===false&&p.source===null&&p.name.startsWith("Simulation"))),
   name+": anonymous slot misidentified as historic player");
 assert.equal(check.actual,actual.length,name+": preserved historical player count");
 return check;
};
let clubCount=0,clubReconstructed=0,sourceIncomplete=0;
for(const [group,list] of Object.entries(clubCatalog))for(const entry of list){
 const [name,,rating]=String(entry).split("|"),record=database[name]||[];
 let stats=verify(name,"club",Number(rating));
 clubCount++;if(stats.anonymous)clubReconstructed++;
 if(record.length<11)sourceIncomplete++;
}
assert(clubCount>=900,"club catalog unexpectedly truncated");
const nationPart=html.slice(html.indexOf("const catalog={\nnation:{"),html.indexOf("},club:{",html.indexOf("const catalog={\nnation:{")));
const nations=[...nationPart.matchAll(/"([^"]+\|[^"]+)"/g)].map(m=>m[1]);
assert.equal(nations.length,49,"National-team catalog unexpectedly changed");
let nationalReconstructed=0;
for(const entry of nations){
 const [name,,rating]=entry.split("|"),check=verify(name,"nation",Number(rating));
 if(check.anonymous)nationalReconstructed++;
}
const fixture={name:"Archive Example",rating:81};
const empty=W.TC_RECONSTRUCT_SQUAD(fixture,[],"club","A","de");
assert.equal(empty.length,11);
assert.equal(W.TC_RECONSTRUCT_STATUS(empty).anonymous,11);
assert.equal(empty.filter(p=>p.pos==="TW").length,1);
const ten=Array.from({length:10},(_,i)=>({id:"real-"+i,name:"Known "+i,pos:i===0?"TW":"MIT"}));
const tenOut=W.TC_RECONSTRUCT_SQUAD(fixture,ten,"club","B","en");
assert.equal(tenOut.length,11);assert.equal(W.TC_RECONSTRUCT_STATUS(tenOut).anonymous,1);
const noGoalkeeper=Array.from({length:11},(_,i)=>({id:"real-"+i,name:"Known "+i,pos:"ABW"}));
const rescue=W.TC_RECONSTRUCT_SQUAD(fixture,noGoalkeeper,"club","A","de");
assert.equal(rescue.length,12);assert.equal(W.TC_RECONSTRUCT_STATUS(rescue).anonymous,1);
assert.strictEqual(W.TC_RECONSTRUCT_SQUAD(fixture,ten,"myclub","A","de"),ten);
assert.strictEqual(W.TC_RECONSTRUCT_SQUAD(fixture,ten,"community","A","de"),ten);
log("PASS: "+clubCount+" historical club options and "+nations.length+" national team options are simulation-ready");
log("Historical squads using anonymous slots: "+clubReconstructed+" clubs / "+nationalReconstructed+" national teams");
log("Historical club squads with <11 actual players: "+sourceIncomplete);
log("PASS: no fake historical names, no archive mutation, goalkeeper fallback, member/community isolation and inline syntax");
