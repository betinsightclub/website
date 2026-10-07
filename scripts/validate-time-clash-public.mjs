import fs from "node:fs";

const languages=["de","en","es","fr","it","pt"];
const failures=[];

function read(path){
  if(!fs.existsSync(path)){failures.push(`missing file: ${path}`);return "";}
  return fs.readFileSync(path,"utf8");
}
function requireIn(text,needle,label){
  if(!text.includes(needle)) failures.push(`${label}: missing ${needle}`);
}
function forbid(text,needle,label){
  if(text.includes(needle)) failures.push(`${label}: forbidden legacy pattern ${needle}`);
}

for(const lang of languages){
  const path=`${lang}/time-clash/index.html`;
  const html=read(path);
  requireIn(html,'data-lang-extra="nl"',"language menu "+path);
  requireIn(html,'data-lang-extra="zh-tw"',"language menu "+path);
  requireIn(html,'tc-mobile-layout-fix-20260930',"mobile guard "+path);
  requireIn(html,'images.unsplash.com/photo-1765130729366-b54d7b2c8ea2',"stadium hero background "+path);
  requireIn(html,'time-clash-wordmark-clean-1024.png',"hero wordmark "+path);
  forbid(html,'time-clash-hero-cinematic.webp',"retired baked German hero "+path);
  requireIn(html,'/time-clash/rosters-all.js?v=20260930-1',"roster cache-bust "+path);
  requireIn(html,'function rosterReady(side){return startingLineup(side).length>=11}',"roster readiness "+path);
  forbid(html,'for(let i=own.length;i<17',"generic roster padding "+path);
  forbid(html,'name:"Teamspieler ',"generic player names "+path);
}

const roster=read("time-clash/rosters-all.js");
if(roster.length<1_000_000) failures.push("time-clash/rosters-all.js unexpectedly small or truncated");
requireIn(roster,'"Deutschland 2014 · Weltmeister"',"Germany 2014 roster");
requireIn(roster,'"Griechenland 2004 · Europameister"',"Greece 2004 roster");
requireIn(roster,'"Manuel Neuer"',"Germany 2014 player data");
requireIn(roster,'"Antonios Nikopolidis"',"Greece 2004 player data");

for(const lang of languages){
  const archive=read(`${lang}/time-clash/community/index.html`);
  requireIn(archive,"clubArchiveMap","custom club archive identity "+lang);
  requireIn(archive,'["deutschland"',"Germany flag mapping "+lang);
  requireIn(archive,'["griechenland"',"Greece flag mapping "+lang);

  const report=read(`${lang}/time-clash/bericht/index.html`);
  requireIn(report,"clubReportMap","custom club report identity "+lang);
  requireIn(report,"teamMark","report flag mapping "+lang);
}

if(failures.length){
  console.error("TIME CLASH public guard FAILED:");
  for(const f of failures) console.error(" - "+f);
  process.exit(1);
}
console.log("TIME CLASH public guard OK");
