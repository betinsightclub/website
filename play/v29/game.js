import * as THREE from "https://esm.sh/three@0.152.2";
import { GLTFLoader } from "https://esm.sh/three@0.152.2/examples/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "https://esm.sh/three@0.152.2/examples/jsm/utils/SkeletonUtils.js";
import { FBXLoader } from "https://esm.sh/three@0.152.2/examples/jsm/loaders/FBXLoader.js";

import { KICK_SPRITE_URL, KICK_VARIANTS } from "/play/v25/kick-soundpack.js?v=20261012-s1";
import { CROWD_SPRITE_URL, CROWD_SOUNDS } from "/play/v28/crowd-soundpack.js?v=20261013-s1";

/* V25 – Real impact sounds selected by the existing shot power.
 * Single predecoded Ogg audio sprite: true separate field recordings, not tones.
 * Audio starts with the ball's first animated movement, never on button press.
 */
const kickAudio={
  context:null,buffer:null,loading:null,enabled:true,volume:.76,
  status(message,failed=false){
    for(const id of ["v25AudioStatus","v25InGameStatus"]){
      const el=document.getElementById(id);
      if(el){el.textContent=message;el.style.color=failed?"#ff9a9a":"#a6f4d0";}
    }
  },
  async prepare(){
    if(!this.context){
      const AudioCtor=window.AudioContext||window.webkitAudioContext;
      if(!AudioCtor){this.status("Dieser Browser unterstützt kein Web Audio.",true);return;}
      this.context=new AudioCtor();
    }
    if(this.context.state==="suspended")await this.context.resume();
    if(!this.loading){
      this.loading=fetch(KICK_SPRITE_URL).then(r=>{
        if(!r.ok)throw Error("Audio nicht geladen");return r.arrayBuffer()
      }).then(b=>this.context.decodeAudioData(b)).then(b=>{
        this.buffer=b;this.status("✓ Vier Schusssounds geladen – Soundeffekt folgt der Schussstärke.");
        return b;
      }).catch(e=>{
        this.loading=null;this.status("Sound konnte nicht geladen werden: "+e.message,true);throw e;
      });
    }
    await this.loading;
  },
  variant(power){
    return KICK_VARIANTS.find(v=>Number(power)>=v.min&&Number(power)<=v.max)||KICK_VARIANTS[2];
  },
  play(power){
    if(!this.enabled)return;
    const ctx=this.context,buf=this.buffer;
    if(!ctx||!buf||ctx.state!=="running"){
      // Never play a delayed sound on a later animation frame: silence is
      // preferable to a kick that occurs after the ball is already flying.
      return;
    }
    const v=this.variant(power);
    const src=ctx.createBufferSource();
    src.buffer=buf;
    const gain=ctx.createGain();
    const intensity=Math.max(0,Math.min(1,(Number(power)-45)/55));
    const level=this.volume*(.52+.31*intensity);
    const now=ctx.currentTime;
    gain.gain.setValueAtTime(level,now);
    gain.gain.setValueAtTime(level,now+.26);
    gain.gain.linearRampToValueAtTime(.0005,now+.315);
    src.connect(gain);gain.connect(ctx.destination);
    src.start(0,v.offset,v.duration);
    this.status("⚽ "+v.name+" – Schussstärke "+Math.round(Number(power))+" %");
  }
};


/** V28 crowd reaction samples; does not affect physics, scoring or animation. */
const crowdAudio={
 buffer:null,loading:null,volume:.72,
 status(message,failed=false){
  for(const id of ["v28CrowdStatus","v28CrowdGameStatus"]){
   const el=document.getElementById(id);
   if(el){el.textContent=message;el.style.color=failed?"#ff9a9a":"#a6f4d0";}
  }
 },
 async prepare(){
  // Reuse the already-unlocked kick sound context, avoid duplicate devices.
  await kickAudio.prepare();
  const ctx=kickAudio.context;
  if(!ctx)return;
  if(!this.loading){
   this.loading=fetch(CROWD_SPRITE_URL)
     .then(res=>{if(!res.ok)throw Error("Publikumsaufnahme nicht erreichbar");return res.arrayBuffer();})
     .then(ab=>ctx.decodeAudioData(ab))
     .then(buffer=>{
       this.buffer=buffer;
       this.status("✓ Torjubel und enttäuschtes Ooh sind geladen.");
       return buffer;
     }).catch(err=>{this.loading=null;this.status("Publikums-Soundfehler: "+String(err?.message||err),true);throw err;});
  }
  await this.loading;
 },
 play(outcome){
  if(!kickAudio.enabled){this.status("Publikum stummgeschaltet – Sound aktivieren.");return;}
  const ctx=kickAudio.context,buffer=this.buffer;
  if(!ctx||!buffer){
    this.status("Publikum wird geladen …");
    this.prepare().then(()=>this.play(outcome))
      .catch(e=>this.status("Publikums-Soundfehler: "+String(e?.message||e),true));
    return;
  }
  if(ctx.state!=="running"){
    this.status("Audio ist gesperrt – bitte Sound aktivieren.",true);
    ctx.resume().then(()=>this.play(outcome))
      .catch(e=>this.status("Audio-Freigabe fehlgeschlagen: "+String(e?.message||e),true));
    return;
  }
  const kind=outcome==="goal"?"goal":"ooh";
  const clip=CROWD_SOUNDS[kind];
  if(!clip)return;
  const src=ctx.createBufferSource();src.buffer=buffer;
  const gain=ctx.createGain();
  const when=ctx.currentTime;
  const volume=THREE.MathUtils.clamp(this.volume*(kind==="goal"?1.08:1.03)*Math.max(.60,kickAudio.volume),0,.90);
  gain.gain.setValueAtTime(.0001,when);
  gain.gain.linearRampToValueAtTime(volume,when+.055);
  gain.gain.setValueAtTime(volume,when+Math.max(.15,clip.duration-.29));
  gain.gain.linearRampToValueAtTime(.0001,when+clip.duration);
  src.connect(gain);gain.connect(ctx.destination);
  src.start(when,clip.offset,clip.duration);
  this.status(kind==="goal"?"🔊 TORJUBEL wird abgespielt":"🔊 OOOOH wird abgespielt");
 }
};

const v24DataPromise=Promise.resolve(null); // disabled dangerous V24 retarget
function v24Report(message,err=false){for(const id of ["v24Status","v24GameStatus"]){const e=document.getElementById(id);if(e){e.textContent=message;e.style.color=err?"#ff8686":"#8ff4c4";}}}

/* V23: Mixamo files are parsed entirely inside the visitor's browser.
 * No upload to a server, no changes to the match engine. */
const v23Files=new Map();
let v23LastReport="Noch keine Mixamo-FBX ausgewählt.";
function v23Kind(name){const n=String(name).toLowerCase();
 if(/diving.?save/.test(n))return "dive";
 if(/body.?block/.test(n))return "block";
 if(/catch/.test(n))return "catch";
 if(/scoop/.test(n))return "scoop";
 if(/miss/.test(n))return "miss";
 if(/side.?step/.test(n))return "sidestep";
 if(/goalkeeper.?idle/.test(n))return "idle";
 if(/penalty.?kick/.test(n))return "kick";
 return null;
}
function v23Status(txt,bad=false){v23LastReport=txt;for(const id of ["v23LoadState","v23GameState"]){const el=document.getElementById(id);if(el){el.textContent=txt;el.style.color=bad?"#ff8888":"#9cf5cb";}}}
async function v23ReceiveFiles(list){
 const chosen=Array.from(list||[]).filter(f=>/\.fbx$/i.test(f.name)&&v23Kind(f.name));
 if(!chosen.length){v23Status("Bitte FBX-Dateien auswählen – z. B. Goalkeeper Diving Save.fbx.",true);return;}
 for(const file of chosen){const kind=v23Kind(file.name);if(!v23Files.has(kind))v23Files.set(kind,file);}
 v23Status(v23Files.size+" Mixamo-Bewegungsarten ausgewählt. FBX wird im Browser geprüft …");
 if(world && typeof world.installV23FBX==="function"){
   try{await world.installV23FBX();}catch(e){console.error("V23 FBX import",e);v23Status("FBX konnte nicht verarbeitet werden: "+(e?.message||e),true);}
 }else v23Status(v23Files.size+" Mixamo-Bewegungen bereit. Jetzt das Duell starten.");
}


let TEAMS=[
{id:"ger14",name:"Deutschland 2014",nation:"Deutschland",flag:"🇩🇪",shirt:0xf2f2f2,shorts:0x171b22,keeperColor:0xe4b72f,keeper:{name:"Manuel Neuer",club:"FC Bayern München",strength:24},shooters:[["Thomas Müller",24],["Toni Kroos",23],["Bastian Schweinsteiger",23],["Mario Götze",22],["Miroslav Klose",22]]},
{id:"arg22",name:"Argentinien 2022",nation:"Argentinien",flag:"🇦🇷",shirt:0x79cfee,shorts:0xffffff,keeperColor:0x2b7b45,keeper:{name:"Emiliano Martínez",club:"Aston Villa",strength:23},shooters:[["Lionel Messi",23],["Ángel Di María",20],["Lautaro Martínez",20],["Julián Álvarez",19],["Leandro Paredes",21]]},
{id:"ita06",name:"Italien 2006",nation:"Italien",flag:"🇮🇹",shirt:0x1558b0,shorts:0xffffff,keeperColor:0xd29f2c,keeper:{name:"Gianluigi Buffon",club:"Juventus",strength:23},shooters:[["Francesco Totti",20],["Andrea Pirlo",20],["Alessandro Del Piero",22],["Daniele De Rossi",17],["Marco Materazzi",19]]},
{id:"esp10",name:"Spanien 2010",nation:"Spanien",flag:"🇪🇸",shirt:0xc61f2d,shorts:0x283a65,keeperColor:0x1f7a42,keeper:{name:"Iker Casillas",club:"Real Madrid",strength:23},shooters:[["David Villa",22],["Xavi",23],["Andrés Iniesta",23],["Xabi Alonso",21],["Fernando Torres",21]]}
];

const TEAM_KITS={
  ger14:{
    shirt:0xf4f4f1,shirt2:0xe8e8e4,shorts:0x17191d,socks:0xf4f4f1,shoes:0x111317,
    accent:0xb21f2d,pattern:"solid",
    gkShirt:0xe0b52c,gkShirt2:0xc89d22,gkShorts:0x252a31,gkSocks:0xe0b52c,gkShoes:0x14171a
  },
  arg22:{
    shirt:0x75c9ee,shirt2:0xffffff,shorts:0x17191d,socks:0xf7f7f5,shoes:0x111317,
    accent:0xffffff,pattern:"stripes",
    gkShirt:0x2d8749,gkShirt2:0x256f3d,gkShorts:0x1c3325,gkSocks:0x2d8749,gkShoes:0x14171a
  },
  ita06:{
    shirt:0x1d58b7,shirt2:0x174996,shorts:0xf1f1ee,socks:0x1d58b7,shoes:0x111317,
    accent:0xffffff,pattern:"solid",
    gkShirt:0xb99527,gkShirt2:0x9d7e20,gkShorts:0x252932,gkSocks:0xb99527,gkShoes:0x14171a
  },
  esp10:{
    shirt:0xc41f2a,shirt2:0xa71924,shorts:0x253458,socks:0xc41f2a,shoes:0x111317,
    accent:0xe7c15a,pattern:"solid",
    gkShirt:0x3f9c53,gkShirt2:0x347f45,gkShorts:0x203127,gkSocks:0x3f9c53,gkShoes:0x14171a
  }
};
function kitFor(team){return TEAM_KITS[team.id]||{
  shirt:team.shirt,shirt2:team.shirt,shorts:team.shorts,socks:team.shirt,shoes:0x111317,
  accent:0xffffff,pattern:"solid",
  gkShirt:team.keeperColor,gkShirt2:team.keeperColor,gkShorts:0x20242b,gkSocks:team.keeperColor,gkShoes:0x14171a
}}

const STADIUMS=[
 {id:"aurelia-olympic-park",code:"STADIUM_01",name:"Aurelia Olympic Park",city:"Rome",country:"Italy",row:0,col:0},
 {id:"koenigsbogen-arena",code:"STADIUM_02",name:"Königsbogen Arena",city:"Munich",country:"Germany",row:0,col:1},
 {id:"estadio-del-mar-norte",code:"STADIUM_03",name:"Estadio del Mar Norte",city:"Barcelona",country:"Spain",row:0,col:2},
 {id:"ironbridge-ground",code:"STADIUM_04",name:"Ironbridge Ground",city:"Liverpool",country:"England",row:0,col:3},
 {id:"atlantic-riviera-stadium",code:"STADIUM_05",name:"Atlantic Riviera Stadium",city:"Lisbon",country:"Portugal",row:0,col:4},
 {id:"arena-verdanza",code:"STADIUM_06",name:"Arena Verdanza",city:"Milan",country:"Italy",row:1,col:0},
 {id:"northgate-bowl",code:"STADIUM_07",name:"Northgate Bowl",city:"Glasgow",country:"Scotland",row:1,col:1},
 {id:"arena-do-horizonte",code:"STADIUM_08",name:"Arena do Horizonte",city:"São Paulo",country:"Brazil",row:1,col:2},
 {id:"estadio-sierra-alta",code:"STADIUM_09",name:"Estadio Sierra Alta",city:"Bogotá",country:"Colombia",row:1,col:3},
 {id:"desert-crown-stadium",code:"STADIUM_10",name:"Desert Crown Stadium",city:"Doha",country:"Qatar",row:1,col:4},
 {id:"sapphire-bay-arena",code:"STADIUM_11",name:"Sapphire Bay Arena",city:"Istanbul",country:"Turkey",row:2,col:0},
 {id:"fjordlight-park",code:"STADIUM_12",name:"Fjordlight Park",city:"Oslo",country:"Norway",row:2,col:1},
 {id:"redstone-athletic-park",code:"STADIUM_13",name:"Redstone Athletic Park",city:"Chicago",country:"USA",row:2,col:2},
 {id:"emerald-ring-stadium",code:"STADIUM_14",name:"Emerald Ring Stadium",city:"Dublin",country:"Ireland",row:2,col:3},
 {id:"titan-forge-arena",code:"STADIUM_15",name:"Titan Forge Arena",city:"Warsaw",country:"Poland",row:2,col:4},
 {id:"aurora-steps-stadium",code:"STADIUM_16",name:"Aurora Steps Stadium",city:"Stockholm",country:"Sweden",row:3,col:0},
 {id:"bastion-21",code:"STADIUM_17",name:"Bastion 21",city:"Buenos Aires",country:"Argentina",row:3,col:1},
 {id:"solaris-dome",code:"STADIUM_18",name:"Solaris Dome",city:"Los Angeles",country:"USA",row:3,col:2},
 {id:"highland-gate-arena",code:"STADIUM_19",name:"Highland Gate Arena",city:"Edinburgh",country:"Scotland",row:3,col:3},
 {id:"horizon-pulse-arena",code:"STADIUM_20",name:"Horizon Pulse Arena",city:"Tokyo",country:"Japan",row:3,col:4}
];
let selectedStadiumId="aurelia-olympic-park";
const STADIUM_X=["0%","25%","50%","75%","100%"];
function stadiumById(id){return STADIUMS.find(s=>s.id===id)||STADIUMS[0]}
function stadiumVars(s){
  return{"--stadium-img":'url("/play/v21/stadium-row'+s.row+'.webp")',"--stadium-x":STADIUM_X[s.col]}
}
function applyStadiumVars(el,s){
  if(!el||!s)return;
  const v=stadiumVars(s);
  el.style.setProperty("--stadium-img",v["--stadium-img"]);
  el.style.setProperty("--stadium-x",v["--stadium-x"]);
}

const TIMECLASH_HQ_STADIUM_SPRITE="https://app.betinsight.club/time-clash/assets/stadiums/timeclash_stadiums_hq_v2.webp?v=20260930hq3";
const TIMECLASH_HQ_ORDER=[
  "koenigsbogen-arena","atlantic-riviera-stadium","sapphire-bay-arena","solaris-dome",
  "arena-verdanza","aurora-steps-stadium","aurelia-olympic-park","desert-crown-stadium",
  "redstone-athletic-park","emerald-ring-stadium","highland-gate-arena","horizon-pulse-arena",
  "northgate-bowl","arena-do-horizonte","estadio-sierra-alta","bastion-21",
  "ironbridge-ground","fjordlight-park","estadio-del-mar-norte","titan-forge-arena"
];
let stadiumSpriteReady=null;
function loadTimeClashStadiumSprite(){
  if(stadiumSpriteReady)return stadiumSpriteReady;
  stadiumSpriteReady=new Promise((resolve,reject)=>{
    const img=new Image();
    img.decoding="async";
    img.onload=()=>resolve(TIMECLASH_HQ_STADIUM_SPRITE);
    img.onerror=()=>reject(new Error("TIME CLASH HQ stadium sprite could not be loaded."));
    img.src=TIMECLASH_HQ_STADIUM_SPRITE;
  });
  return stadiumSpriteReady;
}
function timeClashStadiumCell(st){
  const idx=TIMECLASH_HQ_ORDER.indexOf(st?.id);
  return idx<0?{col:0,row:0}:{col:idx%4,row:Math.floor(idx/4)};
}
function ensureTimeClashBackdrop(el){
  let layer=el.querySelector(":scope > .v21-stadium-backdrop");
  if(!layer){
    layer=document.createElement("div");
    layer.className="v21-stadium-backdrop";
    layer.setAttribute("aria-hidden","true");
    el.prepend(layer);
  }
  return layer;
}
function paintTimeClashStadium(el,sprite,st,overlay="",focusY=.72){
  if(!el||!sprite||!st)return;
  const cell=timeClashStadiumCell(st);
  const rect=el.getBoundingClientRect();
  const cw=Math.max(1,rect.width||el.clientWidth||1),ch=Math.max(1,rect.height||el.clientHeight||1);
  const tileW=800,tileH=450,spriteCols=4,spriteRows=5;

  // Keep the exact TIME CLASH sharpness rule: never upscale a tile beyond 800x450.
  const scale=Math.min(1,Math.max(cw/tileW,ch/tileH));
  const sw=tileW*scale,sh=tileH*scale;
  const left=(cw-sw)*.5;
  const top=(ch-sh)*(ch>=sh?.5:Math.max(0,Math.min(1,focusY)));

  // Important for the penalty view: the HQ atlas is painted inside a tile-sized,
  // clipped child layer. This prevents the previous/next atlas row from bleeding
  // into the top or bottom of the stadium view.
  const layer=ensureTimeClashBackdrop(el);
  layer.style.left=left+"px";
  layer.style.top=top+"px";
  layer.style.width=sw+"px";
  layer.style.height=sh+"px";
  layer.style.backgroundColor="#06131c";

  const tileX=-cell.col*sw,tileY=-cell.row*sh;
  if(overlay){
    layer.style.backgroundImage=overlay+',url("'+sprite+'")';
    layer.style.backgroundSize='100% 100%,'+(spriteCols*sw)+'px '+(spriteRows*sh)+'px';
    layer.style.backgroundPosition='center,'+tileX+'px '+tileY+'px';
    layer.style.backgroundRepeat='no-repeat,no-repeat';
  }else{
    layer.style.backgroundImage='url("'+sprite+'")';
    layer.style.backgroundSize=(spriteCols*sw)+'px '+(spriteRows*sh)+'px';
    layer.style.backgroundPosition=tileX+'px '+tileY+'px';
    layer.style.backgroundRepeat='no-repeat';
  }

  // Once HQ is ready, do not leave the low-res preview atlas behind it.
  el.style.backgroundImage="none";
  el.style.backgroundPosition="";
  el.style.backgroundSize="";
  el.style.backgroundRepeat="";
}

function renderStadiumGrid(){
 const grid=document.querySelector("#stadiumGrid");if(!grid)return;
 grid.innerHTML=STADIUMS.map(s=>
   '<button type="button" class="stadium-card'+(s.id===selectedStadiumId?' selected':'')+'" data-stadium="'+s.id+'" role="option" aria-selected="'+(s.id===selectedStadiumId?'true':'false')+'">'+
   '<span class="stadium-thumb"></span><strong>'+s.code.replace("STADIUM_","")+' · '+s.name+'</strong><small>'+s.city+' · '+s.country+'</small></button>'
 ).join("");
 grid.querySelectorAll(".stadium-card").forEach(card=>{
   const s=stadiumById(card.dataset.stadium),thumb=card.querySelector(".stadium-thumb");
   applyStadiumVars(thumb,s);
   card.onclick=()=>selectStadium(s.id);
 });
 selectStadium(selectedStadiumId,false);
}
function selectStadium(id,rerender=true){
 selectedStadiumId=stadiumById(id).id;
 const s=stadiumById(selectedStadiumId);
 const label=document.querySelector("#stadiumSelectedLabel");
 if(label)label.textContent=s.code+" · "+s.name+" · "+s.city;
 if(rerender){
   document.querySelectorAll(".stadium-card").forEach(card=>{
     const yes=card.dataset.stadium===selectedStadiumId;
     card.classList.toggle("selected",yes);
     card.setAttribute("aria-selected",yes?"true":"false");
   });
 }
}
function applyStadiumAmbience(){
 const s=stadiumById(S.stadiumId||selectedStadiumId);
 const stage=document.querySelector("#stage");
 if(stage){
   stage.classList.add("v21-stadium");
   stage.classList.remove("v21-stadium-sharp");
   // Temporary visual fallback while the HQ TIME CLASH sprite loads.
   applyStadiumVars(stage,s);
 }
 const badge=document.querySelector("#stadiumMatchBadge");
 if(badge)badge.textContent="🏟️ "+s.name+" · "+s.city;
 if(world&&world.renderer){
   world.scene.background=null;
   world.renderer.setClearColor(0x07131f,0);
 }
 loadTimeClashStadiumSprite().then(sprite=>{
   const active=stadiumById(S.stadiumId||selectedStadiumId);
   if(!stage||active.id!==s.id)return;
   paintTimeClashStadium(
     stage,
     sprite,
     s,
     'linear-gradient(180deg,rgba(0,12,18,.03),rgba(0,12,18,.30))',
     .72
   );
   stage.classList.add("v21-timeclash-hq");
 }).catch(err=>{
   console.warn("V21 HQ stadium fallback active",err);
 });
}

const $=s=>document.querySelector(s);
const BRIDGE_MODE=new URLSearchParams(location.search).get("bridge")==="1";
const TRUSTED_BRIDGE_ORIGINS=new Set(["https://app.betinsight.club","https://betinsight.club","https://www.betinsight.club"]);
let bridgeParentOrigin="",bridgeContext=null;
const S={A:null,B:null,stadiumId:"aurelia-olympic-park",side:"A",a:0,b:0,ta:0,tb:0,shots:[],target:{x:0,y:1.2,set:false},contact:{x:0,y:0},power:78,busy:false,sudden:false,finished:false,playerPos:{x:-1.2,z:12.2}};
let world=null;
let contactDraft={x:0,y:0};
let stadiumResizeTimer=null;
addEventListener("resize",()=>{
  clearTimeout(stadiumResizeTimer);
  stadiumResizeTimer=setTimeout(()=>{
    if(!document.querySelector("#game")?.classList.contains("hidden"))applyStadiumAmbience();
  },120);
});

function T(id){return TEAMS.find(t=>t.id===id)}
function fill(){for(const id of ["teamA","teamB"]){$("#"+id).innerHTML=TEAMS.map(t=>'<option value="'+t.id+'">'+t.flag+" "+t.name+"</option>").join("")}const a=TEAMS[0]?.id||"",b=TEAMS[1]?.id||a;if($("#teamA"))$("#teamA").value=a;if($("#teamB"))$("#teamB").value=b;preview();renderStadiumGrid()}
function preview(){const a=T($("#teamA").value),b=T($("#teamB").value);$("#preview").innerHTML=[a,b].map(t=>'<div><b>'+t.flag+" "+t.name+'</b><small>TW: '+t.keeper.name+" · "+t.keeper.club+'</small><p>'+t.shooters.map((p,i)=>(i+1)+". "+p[0]).join("<br>")+"</p></div>").join("")}
$("#teamA").onchange=()=>{if($("#teamA").value===$("#teamB").value)$("#teamB").value=TEAMS.find(t=>t.id!==$("#teamA").value).id;preview()};
$("#teamB").onchange=()=>{if($("#teamA").value===$("#teamB").value)$("#teamA").value=TEAMS.find(t=>t.id!==$("#teamB").value).id;preview()};

class World3D{
 constructor(el){
   this.el=el;this.scene=new THREE.Scene();this.scene.background=null;
   this.camera=new THREE.PerspectiveCamera(44,16/9,.1,100);this.camera.position.set(0,2.55,15.5);this.camera.lookAt(0,1.15,4.2);
   this.sideCamera=new THREE.PerspectiveCamera(38,16/9,.1,100);
   this.sideCamera.position.set(5.9,2.08,2.45);this.sideCamera.lookAt(0,1.06,.45);
   const probe=document.createElement("canvas");
   const gl2=probe.getContext("webgl2",{failIfMajorPerformanceCaveat:false});
   const gl1=!gl2&&probe.getContext("webgl",{failIfMajorPerformanceCaveat:false});
   if(!gl2&&!gl1)throw new Error("WEBGL_NOT_AVAILABLE");
   this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance",failIfMajorPerformanceCaveat:false});
   this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.65));this.renderer.setClearColor(0x07131f,0);
   this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
   this.renderer.outputColorSpace=THREE.SRGBColorSpace;
   this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
   this.renderer.toneMappingExposure=1.08;
   el.innerHTML="";el.appendChild(this.renderer.domElement);
   this.clock=new THREE.Clock();this.anim=[];this.targetMarker=null;this.player=null;this.keeper=null;this.ball=null;this.cameraTarget=new THREE.Vector3(0,1.15,4.2);this.realModel=null;this.prevFrameMs=performance.now();this.moveSeq=0;this.cameraMode="setup";this.cameraBase=new THREE.Vector3(0,2.55,15.5);this.keeperState="ready";this.keeperStateSince=0;this.stadiumEnvironment=null;this.ballCaught=false;this.goalLineZ=0;this.savePlaneZ=.72;this.showSideCam=false;this.sideCamHoldUntil=0;this.v29ArmReach=null;this.v27Active=false;this.v27CatchStart=0;this.v27CatchInitial=null;this.v26Active=false;this.v26StartBones=null;this.mixamoRig=null;this.mixamoMixer=null;this.mixamoClips={};this.mixamoLastClip=null;this.mixamoActive=false;this.mixamoOriginalMeshes=[];this.v24Motions=null;this.v24Active=false;this.v24PoseBase=null;this.v24MotionName=null;
   v24DataPromise.then(data=>{this.v24Motions=data;v24Report("V26: gefährliche Rohwinkel-Übertragung deaktiviert")}).catch(e=>{console.error(e);v24Report("V24 Animationsdaten nicht geladen: "+String(e.message||e),true)});
   this.makeScene();this.resize();addEventListener("resize",()=>this.resize());this.renderer.domElement.addEventListener("pointerdown",e=>this.pickGoal(e));this.loop();
 }
 resize(){const r=this.el.getBoundingClientRect();this.renderer.setSize(r.width,r.height,false);this.camera.aspect=r.width/r.height;this.camera.updateProjectionMatrix();this.sideCamera.aspect=16/9;this.sideCamera.updateProjectionMatrix()}
 async loadRealCharacterModel(){
   if(this.realModel)return this.realModel;
   const url="https://cdn.jsdelivr.net/gh/kendrekaran/striker-3d@main/assets/player.glb";
   const loader=new GLTFLoader();
   const gltf=await loader.loadAsync(url);
   const clips={};
   for(const clip of gltf.animations||[]){
     const key=clip.name.replace(/^HumanArmature\|Man_/,"");
     clips[key]=clip;
   }
   // IMPORTANT: the source armature carries a large internal scale.
   // Measuring the whole scene with Box3.setFromObject makes the rig appear
   // ~100x taller than the visible skinned body, which then shrinks our player
   // to a tiny dot. Measure the actual skinned meshes in bind pose instead.
   gltf.scene.updateMatrixWorld(true);
   const box=new THREE.Box3();box.makeEmpty();
   const meshBox=new THREE.Box3();
   gltf.scene.traverse(o=>{
     if(!o.isSkinnedMesh)return;
     if(typeof o.computeBoundingBox==="function")o.computeBoundingBox();
     if(o.boundingBox){
       meshBox.copy(o.boundingBox).applyMatrix4(o.matrixWorld);
       box.union(meshBox);
     }
   });
   if(box.isEmpty())box.setFromObject(gltf.scene);
   const sourceHeight=Math.max(.001,box.max.y-box.min.y);
   this.realModel={scene:gltf.scene,clips,sourceHeight,sourceMinY:box.min.y};
   return this.realModel
 }
 getSkinColor(root){
   let color=0xc98f70;
   root.traverse(o=>{
     if(!o.isMesh)return;
     const mats=Array.isArray(o.material)?o.material:[o.material];
     for(const m of mats){
       const n=(m?.name||"").toLowerCase();
       if(n==="skin"||n.includes("skin")){color=m.color?.getHex?.()??color;return}
     }
   });
   return color
 }
 fieldShirtMaterial(baseColor,altColor,accentColor,pattern,skinColor,geometry,slotName){
   const mat=new THREE.MeshStandardMaterial({color:baseColor,roughness:.80,metalness:.015});
   mat.name=slotName;
   geometry?.computeBoundingBox?.();
   const box=geometry?.boundingBox;
   const maxAbsX=box?Math.max(Math.abs(box.min.x),Math.abs(box.max.x)):1;
   const armCut=maxAbsX*.58;
   const stripeScale=maxAbsX>0?5.2/(maxAbsX*2):5.2;
   const skin=new THREE.Color(skinColor);
   const alt=new THREE.Color(altColor);
   const accent=new THREE.Color(accentColor);
   mat.onBeforeCompile=shader=>{
     shader.uniforms.uArmCut={value:armCut};
     shader.uniforms.uSkinColor={value:skin};
     shader.uniforms.uAltColor={value:alt};
     shader.uniforms.uAccentColor={value:accent};
     shader.uniforms.uStripeScale={value:stripeScale};
     shader.uniforms.uPattern={value:pattern==="stripes"?1:0};
     shader.vertexShader=shader.vertexShader
       .replace('#include <common>','#include <common>\nvarying vec3 vKitBindPos;')
       .replace('#include <begin_vertex>','#include <begin_vertex>\nvKitBindPos = position;');
     shader.fragmentShader=shader.fragmentShader
       .replace('#include <common>','#include <common>\nvarying vec3 vKitBindPos;\nuniform float uArmCut;\nuniform vec3 uSkinColor;\nuniform vec3 uAltColor;\nuniform vec3 uAccentColor;\nuniform float uStripeScale;\nuniform int uPattern;')
       .replace('#include <color_fragment>',
          '#include <color_fragment>\n' +
          'float armMask = step(uArmCut, abs(vKitBindPos.x));\n' +
          'if (armMask > 0.5) {\n' +
          '  diffuseColor.rgb = uSkinColor;\n' +
          '} else {\n' +
          '  if (uPattern == 1) {\n' +
          '    float stripe = step(0.5, fract((vKitBindPos.x + uArmCut) * uStripeScale));\n' +
          '    diffuseColor.rgb = mix(diffuseColor.rgb, uAltColor, stripe);\n' +
          '  }\n' +
          '  float sideTrim = smoothstep(uArmCut*.72, uArmCut*.94, abs(vKitBindPos.x));\n' +
          '  diffuseColor.rgb = mix(diffuseColor.rgb, uAccentColor, sideTrim*.16);\n' +
          '}'
       );
   };
   mat.customProgramCacheKey=()=>('v17a-fieldshirt-'+pattern+'-'+baseColor+'-'+skinColor);
   return mat
 }
 fieldPantsV20Material(base,team,geometry,slotName){
   const kit=kitFor(team);
   const mat=base?.clone?base.clone():new THREE.MeshStandardMaterial({color:0xffffff});
   mat.name=slotName;mat.roughness=.86;mat.metalness=.005;mat.flatShading=false;
   geometry?.computeBoundingBox?.();
   const box=geometry?.boundingBox;
   const minZ=box?.min.z??0,maxZ=box?.max.z??1;
   const skin=new THREE.Color(this.v20SkinColor||0xc98f70);
   const shorts=new THREE.Color(kit.shorts);
   mat.onBeforeCompile=shader=>{
     shader.uniforms.uV20MinZ={value:minZ};
     shader.uniforms.uV20MaxZ={value:maxZ};
     shader.uniforms.uV20Skin={value:skin};
     shader.uniforms.uV20Shorts={value:shorts};
     shader.vertexShader=shader.vertexShader
       .replace('#include <common>','#include <common>\nvarying vec3 vV20BindPos;')
       .replace('#include <begin_vertex>','#include <begin_vertex>\nvV20BindPos = position;');
     shader.fragmentShader=shader.fragmentShader
       .replace('#include <common>','#include <common>\nvarying vec3 vV20BindPos;\nuniform float uV20MinZ;\nuniform float uV20MaxZ;\nuniform vec3 uV20Skin;\nuniform vec3 uV20Shorts;')
       .replace('#include <color_fragment>',
         '#include <color_fragment>\n'+
         'float nz=clamp((vV20BindPos.z-uV20MinZ)/max(0.0001,uV20MaxZ-uV20MinZ),0.0,1.0);\n'+
         '// The original long-pants mesh stays closed, so hip/butt can never open.\n'+
         '// Only the upper-thigh zone reads as shorts; lower leg reads as skin.\n'+
         'float shortMask=step(0.585,nz);\n'+
         'diffuseColor.rgb=mix(uV20Skin,uV20Shorts,shortMask);'
       );
   };
   mat.customProgramCacheKey=()=>('v20-pants-'+team.id);
   mat.needsUpdate=true;
   return mat
 }
 buildV20RigKit(root,bones,team,height,isKeeper=false){
   if(isKeeper||!bones)return;
   const kit=kitFor(team);
   const shortsMat=new THREE.MeshStandardMaterial({color:kit.shorts,roughness:.88,metalness:.005});
   const accentMat=new THREE.MeshStandardMaterial({color:kit.accent,roughness:.82,metalness:.005});
   const bootMat=new THREE.MeshStandardMaterial({color:kit.shoes,roughness:.48,metalness:.10});
   const soleMat=new THREE.MeshStandardMaterial({color:0x080b0e,roughness:.56,metalness:.08});

   const makeHem=(bone,side)=>{
     if(!bone)return null;
     const g=new THREE.Group();g.name='V20_SHORT_HEM_'+side;g.scale.setScalar(.01);
     // Thin football-short cuff: close to the thigh, not a bulky shell.
     const cuff=new THREE.Mesh(new THREE.CylinderGeometry(.096,.104,.060,28,1,false),shortsMat);
     cuff.scale.z=.78;cuff.position.y=.145;cuff.castShadow=true;cuff.receiveShadow=true;g.add(cuff);
     const pipe=new THREE.Mesh(new THREE.TorusGeometry(.100,.0038,8,28),accentMat);
     pipe.rotation.x=Math.PI/2;pipe.position.y=.181;pipe.scale.z=.78;g.add(pipe);
     bone.add(g);return g
   };
   const makeBoot=(bone,side)=>{
     if(!bone)return null;
     const g=new THREE.Group();g.name='V20_BOOT_'+side;g.scale.setScalar(.01);
     // Local +Y follows the foot toward the toe on this rig.
     const upper=new THREE.Mesh(new THREE.CapsuleGeometry(.044,.082,5,14),bootMat);
     upper.position.y=.083;upper.scale.set(1.0,1.05,.70);upper.castShadow=true;g.add(upper);
     const sole=new THREE.Mesh(new THREE.BoxGeometry(.088,.155,.014),soleMat);
     sole.position.set(0,.083,-.045);sole.castShadow=true;g.add(sole);
     bone.add(g);return g
   };

   const hemL=makeHem(bones.thighL,'L'),hemR=makeHem(bones.thighR,'R');
   const bootL=makeBoot(bones.footL,'L'),bootR=makeBoot(bones.footR,'R');
   root.userData.v20Kit={shortsMat,accentMat,bootMat,hemL,hemR,bootL,bootR};
 }
 updateV20RigKit(root,team){
   const v=root?.userData?.v20Kit;if(!v)return;
   const kit=kitFor(team);
   v.shortsMat.color.setHex(kit.shorts);
   v.accentMat.color.setHex(kit.accent);
   v.bootMat.color.setHex(kit.shoes);
   v.shortsMat.needsUpdate=v.accentMat.needsUpdate=v.bootMat.needsUpdate=true
 }
 applyRigKit(root,team,isKeeper=false){
   const kit=kitFor(team),skinColor=this.getSkinColor(root);
   this.v20SkinColor=skinColor;
   root.traverse(o=>{
     if(!o.isMesh)return;
     o.castShadow=true;o.receiveShadow=true;
     const mats=Array.isArray(o.material)?o.material:[o.material];
     const mapped=mats.map(m=>{
       const originalName=m?.name||"";
       const n=originalName.toLowerCase();
       let clone=m?.clone?m.clone():new THREE.MeshStandardMaterial({color:0xffffff,roughness:.85});
       clone.name=originalName;clone.flatShading=false;
       if(isKeeper){
         if(n.includes("shirt")){
           clone.color.setHex(n.includes("shirt2")?kit.gkShirt2:kit.gkShirt);
           clone.roughness=.80;clone.metalness=.015;
         }else if(n.includes("pants")){
           clone.color.setHex(kit.gkShorts);clone.roughness=.88;clone.metalness=.01;
         }else if(n.includes("socks")){
           clone.color.setHex(kit.gkSocks);clone.roughness=.90;clone.metalness=0;
         }else if(n.includes("shoes")){
           clone.color.setHex(kit.gkShoes);clone.roughness=.54;clone.metalness=.08;
         }
       }else{
         if(n.includes("shirt")){
           clone=this.fieldShirtMaterial(
             n.includes("shirt2")?kit.shirt2:kit.shirt,
             kit.shirt2,kit.accent,kit.pattern,skinColor,o.geometry,originalName
           );
           clone.flatShading=false;
         }else if(n.includes("pants")){
           clone=this.fieldPantsV20Material(clone,team,o.geometry,originalName);
         }else if(n.includes("socks")){
           clone.color.setHex(kit.socks);clone.roughness=.92;clone.metalness=0;
         }else if(n.includes("shoes")){
           clone.color.setHex(kit.shoes);clone.roughness=.48;clone.metalness=.10;
         }
       }
       clone.needsUpdate=true;
       return clone
     });
     o.material=Array.isArray(o.material)?mapped:mapped[0]
   });
   this.v20SkinColor=null
 }
 playRigClip(root,key,{fade=.14,once=false,speed=1}={}){
   const mixer=root?.userData?.mixer,clips=root?.userData?.clips;if(!mixer||!clips)return;
   const clip=clips[key]||clips.Idle||Object.values(clips)[0];if(!clip)return;
   const actions=root.userData.actions||(root.userData.actions={});
   let action=actions[clip.name];if(!action){action=mixer.clipAction(clip);actions[clip.name]=action}
   const prev=root.userData.activeAction;
   if(prev===action&&!once){
     action.setEffectiveTimeScale(speed);return
   }
   if(prev&&prev!==action)prev.fadeOut(fade);
   action.enabled=true;action.reset();action.setEffectiveTimeScale(speed);action.setEffectiveWeight(1);
   if(once){action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true}else{action.setLoop(THREE.LoopRepeat,Infinity)}
   action.fadeIn(fade).play();root.userData.activeAction=action
 }
 async installRealRig(root,height,team,isKeeper=false){
   const model=await this.loadRealCharacterModel();
   const rig=SkeletonUtils.clone(model.scene);
   // Normalize from the measured skinned-body height, not the armature bounds.
   const scale=height/model.sourceHeight;
   rig.scale.setScalar(scale);
   rig.position.y=-model.sourceMinY*scale;
   rig.updateMatrixWorld(true);
   this.applyRigKit(rig,team,isKeeper);
   // Hide primitive fallback meshes but keep their groups/joints for existing motion code.
   root.traverse(o=>{if(o.isMesh)o.visible=false});
   root.add(rig);
   rig.traverse(o=>{if(o.isMesh)o.visible=true});
   // Final visual-height sanity pass. This catches GLB exporter/armature quirks.
   rig.updateMatrixWorld(true);
   const visualBox=new THREE.Box3();visualBox.makeEmpty();
   const tempBox=new THREE.Box3();
   rig.traverse(o=>{
     if(!o.isSkinnedMesh)return;
     if(typeof o.computeBoundingBox==="function")o.computeBoundingBox();
     if(o.boundingBox){tempBox.copy(o.boundingBox).applyMatrix4(o.matrixWorld);visualBox.union(tempBox)}
   });
   if(!visualBox.isEmpty()){
     const vh=visualBox.max.y-visualBox.min.y;
     if(vh>0.001 && (vh<height*.85 || vh>height*1.15)){
       const correction=height/vh;
       rig.scale.multiplyScalar(correction);
       rig.updateMatrixWorld(true);
       const corrected=new THREE.Box3();corrected.makeEmpty();
       rig.traverse(o=>{
         if(!o.isSkinnedMesh)return;
         if(typeof o.computeBoundingBox==="function")o.computeBoundingBox();
         if(o.boundingBox){tempBox.copy(o.boundingBox).applyMatrix4(o.matrixWorld);corrected.union(tempBox)}
       });
       if(!corrected.isEmpty())rig.position.y-=corrected.min.y;
     }
   }
   const mixer=new THREE.AnimationMixer(rig);
   const bones={};
   rig.traverse(o=>{
     if(!o.isBone)return;
     const n=(o.name||"").toLowerCase().replace(/[_\s-]/g,"");
     const left=/left|\.l$|l$/.test(n),right=/right|\.r$|r$/.test(n);
     if(!bones.upperArmL && left && /upperarm|arm/.test(n) && !/fore|lower/.test(n))bones.upperArmL=o;
     if(!bones.upperArmR && right && /upperarm|arm/.test(n) && !/fore|lower/.test(n))bones.upperArmR=o;
     if(!bones.foreArmL && left && /forearm|lowerarm/.test(n))bones.foreArmL=o;
     if(!bones.foreArmR && right && /forearm|lowerarm/.test(n))bones.foreArmR=o;
     if(!bones.handL && left && /hand|wrist/.test(n))bones.handL=o;
     if(!bones.handR && right && /hand|wrist/.test(n))bones.handR=o;
     if(!bones.pelvis && /pelvis|hips/.test(n))bones.pelvis=o;
     if(!bones.thighL && left && /thigh|upperleg/.test(n))bones.thighL=o;
     if(!bones.thighR && right && /thigh|upperleg/.test(n))bones.thighR=o;
     if(!bones.calfL && left && /calf|lowerleg/.test(n))bones.calfL=o;
     if(!bones.calfR && right && /calf|lowerleg/.test(n))bones.calfR=o;
     if(!bones.footL && left && /foot/.test(n))bones.footL=o;
     if(!bones.footR && right && /foot/.test(n))bones.footR=o;
     if(!bones.spine && /spine2|spine1|chest/.test(n))bones.spine=o;
   });
   root.userData.realRig=rig;root.userData.mixer=mixer;root.userData.clips=model.clips;root.userData.actions={};root.userData.isGLB=true;root.userData.bones=bones;
   // V20A.3 uses only the source skinned mesh for field-player clothing.
   this.playRigClip(root,"Idle",{fade:0});
 }
 async installRealPlayers(){
   try{
     const a=S.A||TEAMS[0],d=S.B||TEAMS[1];
     await Promise.all([
       this.installRealRig(this.player,1.80,a,false),
       this.installRealRig(this.keeper,1.92,d,true)
     ]);
     this.setTeams(a,d);
     this.playRigClip(this.player,"Idle",{fade:0});
     this.playRigClip(this.keeper,"Idle",{fade:0});
     this.realRigReady=true;
     const el=$("#commentary");if(el)el.textContent="V20A.3: Shorts-Zone entlang der echten Modell-Höhenachse geladen."
   }catch(err){
     console.error("GLB character load failed; using procedural fallback",err);
     this.realRigReady=false
   }
 }
 setCameraPose(pos,look,ms=0){
   const to=pos.clone(),target=look.clone();
   if(!ms){this.camera.position.copy(to);this.cameraTarget.copy(target);this.camera.lookAt(target);return}
   const from=this.camera.position.clone(),fromLook=this.cameraTarget.clone();
   this.tween(ms,e=>{
     this.camera.position.lerpVectors(from,to,e);
     this.cameraTarget.lerpVectors(fromLook,target,e);
     this.camera.lookAt(this.cameraTarget)
   })
 }
 cinematicRunCamera(runDistance){
   const retreat=THREE.MathUtils.clamp((S.playerPos.z-12.2)/4,0,1);
   const side=S.playerPos.x;
   const pos=new THREE.Vector3(side*.18,2.35+retreat*.45,15.05+retreat*4.65);
   const look=new THREE.Vector3(side*.05,1.0,5.2);
   return this.setCameraPose(pos,look,240)
 }
 cinematicShotCamera(sim){
   const sideBias=THREE.MathUtils.clamp(sim.ax/3.66,-1,1)*.45;
   const pos=new THREE.Vector3(sideBias,2.15,13.7);
   const look=new THREE.Vector3(sim.ax*.20,1.15,1.6);
   return this.setCameraPose(pos,look,180)
 }
 beginSideCam(){
   this.showSideCam=true;this.sideCamHoldUntil=performance.now()+1600;
   const badge=$("#sideCamBadge");if(badge)badge.classList.remove("hidden");
 }
 endSideCam(force=false){
   if(!force&&performance.now()<this.sideCamHoldUntil)return;
   this.showSideCam=false;
   const badge=$("#sideCamBadge");if(badge)badge.classList.add("hidden");
 }
 updateSideCamera(){
   if(!this.sideCamera||!this.keeper||!this.ball)return;
   const bx=this.ball.position.x,by=this.ball.position.y;
   const target=new THREE.Vector3(
     THREE.MathUtils.clamp((bx+this.keeper.position.x)*.5,-2.45,2.45),
     THREE.MathUtils.clamp((by+1.0)*.48,.75,1.5),
     .38
   );
   this.sideCamera.lookAt(target)
 }
 renderScene(){
   const w=this.el.clientWidth,h=this.el.clientHeight;
   this.renderer.setScissorTest(false);
   this.renderer.setViewport(0,0,w,h);
   this.renderer.render(this.scene,this.camera);
   if(this.showSideCam){
     this.updateSideCamera();
     const iw=Math.max(220,Math.floor(w*.31)),ih=Math.floor(iw*9/16);
     const margin=14,x=w-iw-margin,y=h-ih-margin;
     const previousClearColor=this.renderer.getClearColor(new THREE.Color()).clone();
     const previousClearAlpha=this.renderer.getClearAlpha();
     this.renderer.setScissorTest(true);
     this.renderer.setScissor(x,y,iw,ih);
     this.renderer.setViewport(x,y,iw,ih);
     this.renderer.setClearColor(0x020910,1);
     this.renderer.clearDepth();
     this.renderer.render(this.scene,this.sideCamera);
     this.renderer.setScissorTest(false);
     this.renderer.setClearColor(previousClearColor,previousClearAlpha);
   }
 }
 prepareStadiumEnvironment(){
   // V15 deliberately keeps the exterior neutral.
   // This group is the permanent insertion point for future BetInsight stadium assets.
   this.stadiumEnvironment=new THREE.Group();
   this.stadiumEnvironment.name="BETINSIGHT_STADIUM_ENVIRONMENT";
   this.scene.add(this.stadiumEnvironment);
   this.scene.userData.stadiumSlots={
     shell:new THREE.Group(),
     stands:new THREE.Group(),
     crowd:new THREE.Group(),
     boards:new THREE.Group(),
     ambientLights:new THREE.Group()
   };
   Object.values(this.scene.userData.stadiumSlots).forEach(g=>this.stadiumEnvironment.add(g));
 }
 async loadStadiumEnvironment(url){
   // Future hook: load our own GLB stadium/tribune here without changing gameplay coordinates.
   if(!url||!this.stadiumEnvironment)return;
   const loader=new GLTFLoader();
   const gltf=await loader.loadAsync(url);
   this.scene.userData.stadiumSlots.shell.clear();
   this.scene.userData.stadiumSlots.shell.add(gltf.scene);
 }
 setKeeperState(state){
   this.keeperState=state;this.keeperStateSince=this.clock.getElapsedTime();
   if(this.keeper)this.keeper.userData.keeperState=state;
 }
 updateCaughtBallHands(){
   if(!this.ballCaught||!this.ball||!this.keeper)return;
   if(this.v27Active){
     const anchor=new THREE.Vector3(0,1.17,.28);this.keeper.localToWorld(anchor);
     // Blend ball toward the player's glove/chest center, never teleport.
     const blend=THREE.MathUtils.clamp((performance.now()-this.v27CatchStart)/240,0,1);
     const from=this.v27CatchInitial||this.ball.position;
     this.ball.position.lerpVectors(from,anchor,blend*blend*(3-2*blend));return;
   }
   const b=this.keeper.userData.bones||{};
   if(b.handL&&b.handR){
     const l=new THREE.Vector3(),r=new THREE.Vector3();b.handL.getWorldPosition(l);b.handR.getWorldPosition(r);
     const mid=l.clone().lerp(r,.5);
     const spread=l.distanceTo(r);
     const fwd=new THREE.Vector3(0,0,.11).applyQuaternion(this.keeper.getWorldQuaternion(new THREE.Quaternion()));
     mid.add(fwd);
     // Hands should visibly surround the ball; keep it just in front of their midpoint.
     this.ball.position.copy(mid);
     if(spread<.12){
       const lift=new THREE.Vector3(0,.035,0);this.ball.position.add(lift)
     }
   }else{
     // fallback: front of chest, never inside the torso
     const p=new THREE.Vector3(0,1.18,.22);this.keeper.localToWorld(p);this.ball.position.copy(p)
   }
 }
 closeKeeperHands(){
   const b=this.keeper?.userData?.bones||{};
   if(b.upperArmL){b.upperArmL.rotation.z-=.35;b.upperArmL.rotation.x+=.18}
   if(b.upperArmR){b.upperArmR.rotation.z+=.35;b.upperArmR.rotation.x+=.18}
   if(b.foreArmL)b.foreArmL.rotation.x+=.75;
   if(b.foreArmR)b.foreArmR.rotation.x+=.75;
 }
 async playReaction(outcome){
   const groups={goal:8,save:5,post:4,miss:3};
   const count=groups[outcome]||3;
   const variant=Math.floor(Math.random()*count);
   const p=this.player,b=p.userData.bones||{};
   this.playRigClip(p,"Idle",{fade:.12,speed:1});
   const startPos=p.position.clone(),startRot=p.rotation.clone();
   const dur=720+variant*35;
   const sign=variant%2?1:-1;
   await this.tween(dur,e=>{
     const wave=Math.sin(e*Math.PI),pulse=Math.sin(e*Math.PI*2);
     if(outcome==="goal"){
       // 8 victory variants: both arms high, one-arm punch, small jump, turn, wide arms...
       const mode=variant%8;
       p.position.y=(mode===3||mode===6)?Math.sin(e*Math.PI)*.10:0;
       p.rotation.y=startRot.y+sign*(mode===4?.42:mode===7?.22:0)*wave;
       if(b.upperArmL)b.upperArmL.rotation.z-= (mode===1?.45:.75)*wave;
       if(b.upperArmR)b.upperArmR.rotation.z+= (mode===2?.45:.75)*wave;
       if(b.foreArmL)b.foreArmL.rotation.x+= (mode===5?.35:.18)*wave;
       if(b.foreArmR)b.foreArmR.rotation.x+= (mode===5?.35:.18)*wave;
     }else if(outcome==="save"){
       // frustration: hands/head, arms apart, freeze, step back, head/body drop
       p.position.z=startPos.z+(variant===3?.22*wave:0);
       p.rotation.x=(variant===4?.10:.04)*wave;
       if(b.upperArmL)b.upperArmL.rotation.z-= (variant===0?.70:.28)*wave;
       if(b.upperArmR)b.upperArmR.rotation.z+= (variant===0?.70:.28)*wave;
       if(b.foreArmL)b.foreArmL.rotation.x+= (variant===0?1.0:.20)*wave;
       if(b.foreArmR)b.foreArmR.rotation.x+= (variant===0?1.0:.20)*wave;
     }else if(outcome==="post"){
       p.rotation.y=startRot.y+sign*.18*wave;
       if(b.upperArmL)b.upperArmL.rotation.z-= (.45+.08*variant)*wave;
       if(b.upperArmR)b.upperArmR.rotation.z+= (.45+.08*variant)*wave;
       if(b.foreArmL)b.foreArmL.rotation.x+= .45*wave;
       if(b.foreArmR)b.foreArmR.rotation.x+= .45*wave;
     }else{
       p.rotation.x=.06*wave;
       p.position.z=startPos.z+.10*wave;
       if(b.upperArmL)b.upperArmL.rotation.z-= (variant===1?.40:.18)*wave;
       if(b.upperArmR)b.upperArmR.rotation.z+= (variant===1?.40:.18)*wave;
     }
   });
   p.position.copy(startPos);p.rotation.copy(startRot);this.playRigClip(p,"Idle",{fade:.18,speed:1})
 }
 keeperReadyPose(){
   if(!this.keeper||S.busy)return;
   const t=this.clock.getElapsedTime(),age=t-this.keeperStateSince;
   const x=Math.sin(t*1.55)*.42;
   const z=.34+Math.sin(t*.95)*.035;
   this.keeper.position.x=x;this.keeper.position.y=0;this.keeper.position.z=z;
   this.keeper.rotation.set(0,0,0);
   // Small line shuffles: stay on the line, never walk toward the shooter.
   if(this.keeper.userData.isGLB){
     const phase=Math.sin(t*1.55);
     this.playRigClip(this.keeper,Math.abs(phase)>.55?"Walk":"Idle",{fade:.22,speed:.42});
     const b=this.keeper.userData.bones||{},raise=.16+.08*Math.sin(t*2.05);
     if(b.upperArmL){b.upperArmL.rotation.z-=raise;b.upperArmL.rotation.x+=.04*Math.sin(t*1.7)}
     if(b.upperArmR){b.upperArmR.rotation.z+=raise;b.upperArmR.rotation.x-=.04*Math.sin(t*1.7)}
     if(b.foreArmL)b.foreArmL.rotation.x+=.08+.04*Math.sin(t*1.9);
     if(b.foreArmR)b.foreArmR.rotation.x+=.08-.04*Math.sin(t*1.9);
     if(b.spine)b.spine.rotation.x+=.035+.012*Math.sin(t*1.2);
   }
   // Fallback body: slightly bent, hands active.
   if(!this.keeper.userData.isGLB){
     const ready=.10+.05*Math.sin(t*2.2);
     this.keeper.armL.rotation.z=-.52-ready;
     this.keeper.armR.rotation.z=.52+ready;
     this.keeper.legL.rotation.x=.05;
     this.keeper.legR.rotation.x=.05;
   }
 }
 /**
  * V22 PREVIEW – separate keeper motion layer. Match outcome and trajectory remain
  * exactly the same as V21; only the visual representation is modified.
  * Keeper arms follow the expected interception side and height.
  */
 keeperPoseV22(phase,t,sim){
   const k=this.keeper;if(!k)return;
   const b=k.userData.bones||{};
   const c=THREE.MathUtils.clamp;
   const side=sim.kx>=0?1:-1;
   const lateral=c(Math.abs(sim.kx)/3.15,0,1);
   const high=c((sim.ky-.4)/1.65,0,1);
   const alpha=c(t,0,1);
   const reach=phase==="push"?(.12+.35*alpha):(phase==="flight"?(.35+.65*Math.sin(alpha*Math.PI*.76)):(phase==="contact"?1:0));
   // All adjustments are applied *after* AnimationMixer.update() each frame;
   // the source skeleton remains unmodified.
   if(k.userData.isGLB){
     if(b.spine){b.spine.rotation.z+=side*.08*lateral*reach;b.spine.rotation.x-=.08*reach;}
     if(b.upperArmL)b.upperArmL.rotation.z+=(-.28-side*.45)*reach;
     if(b.upperArmR)b.upperArmR.rotation.z+=(.28-side*.45)*reach;
     if(b.foreArmL)b.foreArmL.rotation.x+=(-.28-.20*high)*reach;
     if(b.foreArmR)b.foreArmR.rotation.x+=(-.28-.20*high)*reach;
     if(b.handL)b.handL.rotation.z-=.13*reach;
     if(b.handR)b.handR.rotation.z+=.13*reach;
     if(b.thighL)b.thighL.rotation.x+=.22*reach;
     if(b.thighR)b.thighR.rotation.x-=.18*reach;
   }else if(k.armL&&k.armR){
     k.armL.rotation.z=-.42-.48*reach-side*.16*lateral;
     k.armR.rotation.z=.42+.48*reach-side*.16*lateral;
     k.legL.rotation.x=.1+.3*reach;
     k.legR.rotation.x=-.1-.2*reach;
   }
 }

 /** Import Mixamo FBX with skin to preserve its native authored skeleton poses.
  * The model is attached to the existing keeper group; V21's model is hidden,
  * not removed, and it is restored automatically if import fails. */
 async installV23FBX(){
   if(!v23Files.size)return;
   const loader=new FBXLoader();
   const staged={};
   let base=null;
   for(const kind of ["idle","dive","catch","block","scoop","miss","sidestep"]){
     const file=v23Files.get(kind);if(!file)continue;
     const parsed=loader.parse(await file.arrayBuffer(),"");
     if(!parsed.animations?.length)throw new Error("Keine Bewegung in "+file.name);
     const hasSkin=!!parsed.getObjectByProperty("isSkinnedMesh",true);
     if(!base && hasSkin)base=parsed;
     staged[kind]=parsed.animations[0];
   }
   if(!base)throw new Error("Es wird mindestens eine FBX mit 'With Skin' benötigt.");
   if(this.mixamoRig){this.keeper.remove(this.mixamoRig);this.mixamoRig=null;}
   this.mixamoOriginalMeshes.forEach(o=>o.visible=true);
   this.mixamoOriginalMeshes=[];
   this.keeper.traverse(o=>{if(o.isMesh){this.mixamoOriginalMeshes.push(o);o.visible=false;}});
   let bb=new THREE.Box3().setFromObject(base);
   if(bb.isEmpty())throw new Error("FBX enthält kein darstellbares 3D-Modell.");
   const h=bb.max.y-bb.min.y;
   if(!(h>0.01))throw new Error("Ungültige Modellhöhe");
   const scalar=THREE.MathUtils.clamp(1.92/h,.0001,100);
   base.scale.multiplyScalar(scalar);
   base.position.y-=bb.min.y*scalar;
   // Match the keeper's existing forward-facing direction.
   base.position.x-=((bb.min.x+bb.max.x)/2)*scalar;
   base.position.z-=((bb.min.z+bb.max.z)/2)*scalar;
   base.traverse(o=>{if(o.isMesh){o.visible=true;o.castShadow=true;o.receiveShadow=true;}});
   this.keeper.add(base);
   this.mixamoRig=base;
   this.mixamoClips=staged;
   this.mixamoMixer=new THREE.AnimationMixer(base);
   this.mixamoLastClip=null;
   this.mixamoActive=false;
   this.v23Idle();
   v23Status("✓ Echte FBX-Torwartanimation aktiv: "+Object.keys(staged).join(", ")+" · V23");
 }
 v23Idle(){
   if(!this.mixamoMixer || !this.mixamoRig)return;
   this.mixamoMixer.stopAllAction();
   const clip=this.mixamoClips.idle||this.mixamoClips.sidestep;
   if(clip){const a=this.mixamoMixer.clipAction(clip);a.reset();a.setLoop(THREE.LoopRepeat,Infinity);a.play();}
   this.mixamoActive=false;
 }
 v23SelectClip(sim){
   const p=this.mixamoClips;
   return (sim.outcome==="save"
       ?(sim.saveType==="caught"?(p.catch||p.scoop||p.dive):(p.dive||p.block||p.catch))
       :sim.outcome==="miss"?(p.miss||p.dive||p.block)
       :sim.outcome==="post"?(p.dive||p.miss||p.block)
       :(p.miss||p.dive||p.block||p.catch))||p.idle||null;
 }
 async v23Dive(sim,duration){
   const clip=this.v23SelectClip(sim);
   if(!clip)return false;
   const k=this.keeper,start=k.position.clone(),sgn=sim.kx>=0?1:-1;
   this.setKeeperState("push_off");
   this.stopKeeperIdle=true;
   this.mixamoMixer.stopAllAction();
   const action=this.mixamoMixer.clipAction(clip);
   action.reset();action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;action.play();
   this.mixamoMixer.setTime(0);
   this.mixamoActive=true;
   this.mixamoLastClip=clip;
   const flightMs=Math.max(590,duration);
   await this.tween(flightMs,e=>{
     // Body joints now come from the actual Mixamo FBX keyframes.
     this.mixamoMixer.setTime(clip.duration*Math.min(.78,e*.78));
     const p=e*e*(3-2*e);
     k.position.x=THREE.MathUtils.lerp(start.x,sim.kx*.66,p);
     k.position.y=THREE.MathUtils.lerp(start.y,.06,p);
     k.position.z=THREE.MathUtils.lerp(start.z,sim.contactZ??this.savePlaneZ,p);
     k.rotation.z=-sgn*.06*p;
   });
   this.setKeeperState(sim.outcome==="save"?"intercept":"miss");
   return true;
 }


 /** V24 uses motion keyframes sampled from the FBX files the user supplied.
  * No import dialog is needed. Movement selection follows ball height and
  * target side. The original Quaternius GLB mesh remains visible and is
  * retargeted through its existing humanoid joint skeleton. */
 v24MotionKind(sim){
   if(sim.outcome==="save"&&sim.saveType==="caught")return "catch";
   if(sim.outcome==="save")return sim.ay>=1.50?"save_high":"save";
   return "miss";
 }
 v24MotionTargets(){
   const u=this.keeper?.userData;
   if(!u?.isGLB)return null;
   const b=u.bones||{},rig=u.realRig;
   if(!rig)return null;
   if(!this.v24RetargetBones){
     this.v24RetargetBones={
       spine:b.spine,chest:b.spine1||b.spine,armL:b.upperArmL,armR:b.upperArmR,
       foreL:b.foreArmL,foreR:b.foreArmR,thighL:b.thighL,thighR:b.thighR,
       calfL:b.calfL,calfR:b.calfR,footL:b.footL,footR:b.footR
     };
     rig.traverse(o=>{
       if(!o.isBone)return;
       const name=String(o.name||"").toLowerCase().replace(/[_\s-]/g,"");
       if(!this.v24RetargetBones.chest&&/spine1|chest/.test(name))this.v24RetargetBones.chest=o;
     });
   }
   return this.v24RetargetBones;
 }
 v24PoseAt(motion,progress){
   if(!this.v24PoseBase)return;
   const b=motion?.b;if(!b)return;
   const targets=this.v24MotionTargets();if(!targets)return;
   const p=THREE.MathUtils.clamp(progress,0,1)*19,i=Math.min(18,Math.floor(p)),frac=p-i;
   const toRadians=Math.PI/180;
   const eul=new THREE.Euler(),quat=new THREE.Quaternion();
   for(const [key,node] of Object.entries(targets)){
     if(!node||!b[key])continue;
     const values=b[key],off=i*3,next=(i+1)*3;
     // Source FBX animation is sampled in degrees. Local Euler delta
     // approximates retargeting onto the Quaternius skeleton.
     let rx=THREE.MathUtils.lerp(values[off],values[next],frac);
     let ry=THREE.MathUtils.lerp(values[off+1],values[next+1],frac);
     let rz=THREE.MathUtils.lerp(values[off+2],values[next+2],frac);
     const weight=(key==="spine"||key==="chest")?.67:.82;
     rx=THREE.MathUtils.clamp(rx,-115,115)*weight;
     ry=THREE.MathUtils.clamp(ry,-90,90)*weight;
     rz=THREE.MathUtils.clamp(rz,-115,115)*weight;
     eul.set(rx*toRadians,ry*toRadians,rz*toRadians,"XYZ");
     quat.setFromEuler(eul);
     node.quaternion.copy(this.v24PoseBase[key]).multiply(quat);
   }
 }
 v24Reset(){
   if(this.v24PoseBase){
     const targets=this.v24MotionTargets();
     if(targets)for(const [key,q] of Object.entries(this.v24PoseBase)){if(targets[key])targets[key].quaternion.copy(q);}
   }
   const rig=this.keeper?.userData?.realRig;
   if(rig&&this.v24RigScaleX!=null)rig.scale.x=this.v24RigScaleX;
   this.v24PoseBase=null;this.v24Active=false;this.v24MotionName=null;
 }
 async v24Dive(sim,duration){
   const motionName=this.v24MotionKind(sim);
   const motion=this.v24Motions?.[motionName];
   const targets=this.v24MotionTargets();
   if(!motion||!targets)return false;
   this.v24Reset();
   const k=this.keeper,rig=k.userData.realRig;
   const mixer=k.userData.mixer;
   mixer?.stopAllAction();
   const base={};
   for(const [name,node] of Object.entries(targets)){if(node)base[name]=node.quaternion.clone();}
   this.v24PoseBase=base;this.v24Active=true;this.v24MotionName=motionName;
   const targetX=sim.outcome==="save"?sim.ax:sim.kx;
   const side=targetX>=0?1:-1,high=THREE.MathUtils.clamp(sim.ay/2.44,0,1);
   // Native Mixamo save footage primarily dives to one side. Mirroring the
   // skinned visual gives symmetric left/right variants.
   this.v24RigScaleX=rig.scale.x;
   rig.scale.x=Math.abs(rig.scale.x)*(side>0?-1:1);
   const p0=k.position.clone();
   this.stopKeeperIdle=true;this.setKeeperState("push_off");
   const durationMs=Math.max(780,duration);
   v24Report("✓ "+(side>0?"RECHTS":"LINKS")+" · "+(high>.59?"HOCH":"FLACH")+" · "+motionName.toUpperCase());
   await this.tween(durationMs,(ease,t)=>{
     const flight=t*t*(3-2*t);
     const maxX=THREE.MathUtils.clamp(targetX,-3.15,3.15);
     k.position.x=THREE.MathUtils.lerp(p0.x,maxX*.74,flight);
     k.position.y=(.12+.27*high)*Math.sin(Math.PI*t);
     k.position.z=THREE.MathUtils.lerp(p0.z,sim.contactZ??this.savePlaneZ,flight);
     // Whole body flight direction + articulated animation from sampled FBX.
     k.rotation.z=-side*(.14+.94*Math.min(1,Math.abs(targetX)/3.2))*flight;
     this.v24PoseAt(motion,t);
     if(t>.25)this.setKeeperState("dive");
   });
   this.setKeeperState(sim.outcome==="save"?"intercept":"miss");
   return true;
 }


 // V26 stability first: no Mixamo Euler deltas applied to the different rig.
 v26Begin(){
   this.v26Active=true;
   this.keeper.userData.mixer?.stopAllAction();
   const b=this.keeper.userData.bones||{};
   const keys=["upperArmL","upperArmR","foreArmL","foreArmR","spine","thighL","thighR"];
   this.v26StartBones=keys.map(key=>({key,bone:b[key],rest:b[key]?.quaternion.clone()})).filter(x=>x.bone);
 }
 v26SafePose(t,sim){
   if(!this.v26StartBones)return;
   const catchBall=sim.outcome==="save"&&sim.saveType==="caught";
   const e=Math.max(0,Math.min(1,t));
   const amounts=catchBall?
       {upperArmL:-.16,upperArmR:.16,foreArmL:-.17,foreArmR:-.17,spine:0,thighL:.09,thighR:-.09}:
       {upperArmL:-.25,upperArmR:.25,foreArmL:-.20,foreArmR:-.20,spine:sim.kx<0?.08:-.08,thighL:.12,thighR:-.12};
   const axis=new THREE.Vector3(0,0,1),q=new THREE.Quaternion();
   this.v26StartBones.forEach(({key,bone,rest})=>{
     if(!bone||!rest)return;
     const rot=(amounts[key]||0)*e;
     axis.set(key.startsWith("foreArm")?1:0,0,key.startsWith("foreArm")?0:1);
     q.setFromAxisAngle(axis,rot);
     bone.quaternion.copy(rest).multiply(q);
   });
 }
 v26Restore(){
   if(this.v26StartBones)for(const {bone,rest} of this.v26StartBones){
     if(bone&&rest)bone.quaternion.copy(rest);
   }
   this.v26StartBones=null;
   this.v26Active=false;
   if(this.keeper?.userData?.isGLB){
     this.keeper.userData.activeAction=null;
     this.playRigClip(this.keeper,"Idle",{fade:0});
   }
 }
 async v26Dive(sim,duration){
   const keeper=this.keeper;if(!keeper)return false;
   this.stopKeeperIdle=true;
   this.v26Begin();
   const side=sim.kx<0?-1:1;
   const h=THREE.MathUtils.clamp(sim.ky/2.44,0,1);
   const start=keeper.position.clone();
   this.setKeeperState("push_off");
   await this.tween(110,e=>{
     const p=e*e*(3-2*e);
     keeper.position.x=start.x+side*.08*p;
     keeper.position.y=-.035*p;
     keeper.rotation.z=-side*.08*p;
     this.v26SafePose(.15*p,sim);
   });
   this.setKeeperState("dive");
   const from=keeper.position.clone();
   const targetX=THREE.MathUtils.clamp(sim.kx*.78,-2.65,2.65);
   await this.tween(THREE.MathUtils.clamp(duration,420,730),e=>{
     const p=e*e*(3-2*e);
     keeper.position.x=THREE.MathUtils.lerp(from.x,targetX,p);
     keeper.position.y=Math.max(.02,-.035+(.08+h*.21)*Math.sin(Math.PI*e));
     keeper.position.z=THREE.MathUtils.lerp(from.z,sim.contactZ??this.savePlaneZ,p);
     keeper.rotation.z=-side*THREE.MathUtils.lerp(.08,.32+.46*Math.abs(targetX)/2.65,p);
     keeper.rotation.x=-.04*h*Math.sin(Math.PI*e);
     this.v26SafePose(.15+.85*p,sim);
   });
   this.setKeeperState(sim.outcome==="save"?"intercept":"miss");
   v24Report("✓ V26 stabil: "+(side>0?"RECHTS":"LINKS")+" – keine Gelenküberstreckung");
   return true;
 }
 async v26Recover(){
   const k=this.keeper,p=k.position.clone(),rot=k.rotation.clone();
   this.setKeeperState("land");
   await this.tween(300,e=>{
     const t=e*e*(3-2*e);
     k.position.y=THREE.MathUtils.lerp(p.y,0,t);
     k.position.z=THREE.MathUtils.lerp(p.z,.35,t);
     k.rotation.z=THREE.MathUtils.lerp(rot.z,-Math.sign(rot.z||1)*.3,t);
     k.rotation.x=THREE.MathUtils.lerp(rot.x,0,t);
   });
   const x=k.position.x,z=k.position.z,r=k.rotation.z;
   this.setKeeperState("recover");
   await this.tween(480,e=>{
     const t=e*e*(3-2*e);
     k.position.x=THREE.MathUtils.lerp(x,THREE.MathUtils.clamp(x,-.55,.55),t);
     k.position.z=THREE.MathUtils.lerp(z,.35,t);
     k.rotation.z=THREE.MathUtils.lerp(r,0,t);
     this.v26SafePose(1-t,{kx:0,outcome:"save",saveType:"caught"});
   });
   this.releaseCaughtBall();
   this.v26Restore();
   k.rotation.set(0,0,0);
   this.setKeeperState("ready");this.stopKeeperIdle=false;
 }

 // V27: use full-body animation authored specifically for this GLB skeleton.
 // Unlike V24-V26, never mix external Euler angles into Quaternius bones.

 /** V29: reach correction for native skinned goalkeeper arms. This is NOT
  * Mixamo retargeting. Conservative CCD is applied AFTER the GLB mixer
  * update; upper arms and elbows never exceed a per-frame angular cap.
  * The visual save point is determined by the existing simulation. */
 v29IKTurn(joint,wrist,target,maxDelta){
   if(!joint||!wrist||!joint.parent)return;
   joint.updateWorldMatrix(true,true);
   const origin=joint.getWorldPosition(new THREE.Vector3());
   const end=wrist.getWorldPosition(new THREE.Vector3());
   const a=end.sub(origin),b=target.clone().sub(origin);
   if(a.lengthSq()<.00001||b.lengthSq()<.00001)return;
   a.normalize();b.normalize();
   const angle=Math.acos(THREE.MathUtils.clamp(a.dot(b),-1,1));
   if(angle<.008)return;
   const axis=a.clone().cross(b);
   if(axis.lengthSq()<.00001)return;
   axis.normalize();
   const worldDelta=new THREE.Quaternion().setFromAxisAngle(axis,Math.min(angle,maxDelta));
   const parentWorld=joint.parent.getWorldQuaternion(new THREE.Quaternion());
   const localDelta=parentWorld.clone().invert().multiply(worldDelta).multiply(parentWorld);
   joint.quaternion.premultiply(localDelta).normalize();
   joint.updateWorldMatrix(true,true);
 }
 v29ReachGloves(){
   const anim=this.v29ArmReach;
   const b=this.keeper?.userData?.bones||{};
   if(!anim||!this.keeper?.userData?.isGLB||!b.handL||!b.handR||
       !b.upperArmL||!b.upperArmR||!b.foreArmL||!b.foreArmR)return;
   const power=THREE.MathUtils.clamp(anim.weight,0,1);
   if(power<.015)return;
   // Let the full-body Jump animation provide natural leg/core dynamics.
   // Reach only towards the BALL'S future position, never toward an arbitrary
   // frame coordinate or toward the goal center.
   const side=anim.x<0?-1:1;
   const ball=new THREE.Vector3(anim.x,anim.y,anim.z);
   this.keeper.updateMatrixWorld(true);
   const targets=[
     [b.upperArmL,b.foreArmL,b.handL,ball.clone().add(new THREE.Vector3(-.085,0,.05))],
     [b.upperArmR,b.foreArmR,b.handR,ball.clone().add(new THREE.Vector3(.085,0,.05))]
   ];
   for(const [upper,fore,hand,target] of targets){
     // Limit reach to arm length measured on the rig to prevent shoulder
     // collapse when a very wide goal/save outcome is simulated.
     const shoulder=upper.getWorldPosition(new THREE.Vector3());
     const reach=upper.getWorldPosition(new THREE.Vector3())
       .distanceTo(fore.getWorldPosition(new THREE.Vector3()))+
       fore.getWorldPosition(new THREE.Vector3())
       .distanceTo(hand.getWorldPosition(new THREE.Vector3()));
     const delta=target.sub(shoulder);
     if(reach>.05&&delta.length()>reach*.96)target.copy(shoulder).add(delta.normalize().multiplyScalar(reach*.96));
     const shoulderMax=.23*power,elbowMax=.34*power;
     for(let n=0;n<2;n++){
       this.v29IKTurn(fore,hand,target,elbowMax/2);
       this.v29IKTurn(upper,hand,target,shoulderMax/2);
     }
   }
 }

 async v27Dive(sim,duration){
   const keeper=this.keeper;
   if(!keeper?.userData?.isGLB || !keeper.userData.mixer)return false;
   // Mixer MUST advance while the goalkeeper is diving. This animates all
   // arm, leg, shoulder, spine and hip tracks, not just the parent transform.
   this.v27Active=true;
   this.v29ArmReach={x:sim.outcome==="save"?sim.ax:sim.kx,y:sim.outcome==="save"?sim.ay:sim.ky,z:this.savePlaneZ,weight:0};
   const side=sim.kx<0?-1:1;
   const targetX=THREE.MathUtils.clamp(
     (sim.outcome==="save"?sim.ax:sim.kx),-3.15,3.15
   );
   const high=THREE.MathUtils.clamp(sim.ky/2.44,0,1);
   const clipName=high<.32?"Jump":"RunningJump";
   const hasClip=!!keeper.userData.clips?.[clipName];
   const activeClip=hasClip?clipName:"Jump";
   this.stopKeeperIdle=true;
   this.setKeeperState("react");
   this.playRigClip(keeper,activeClip,{once:true,fade:.10,speed:1.12});
   const p0=keeper.position.clone();
   this.setKeeperState("push_off");
   const prep=Math.max(105,Math.round(duration*.19));
   await this.tween(prep,e=>{
     const s=e*e*(3-2*e);
     keeper.position.x=THREE.MathUtils.lerp(p0.x,p0.x+side*.14,s);
     keeper.position.y=-.035*Math.sin(Math.PI*e);
     keeper.position.z=THREE.MathUtils.lerp(p0.z,.34,s);
     keeper.rotation.z=-side*.12*s;
   });
   this.setKeeperState("dive");
   const start=keeper.position.clone(),tilt0=keeper.rotation.z;
   const flight=Math.max(330,duration-prep);
   await this.tween(flight,e=>{
     const s=e*e*(3-2*e);
     keeper.position.x=THREE.MathUtils.lerp(start.x,targetX*.86,s);
     // Full-body keyframed jump plus the spatial trajectory.
     keeper.position.y=Math.max(.01,.03+(.13+.23*high)*Math.sin(Math.PI*e));
     keeper.position.z=THREE.MathUtils.lerp(start.z,sim.contactZ??this.savePlaneZ,s);
     const lean=THREE.MathUtils.clamp(.22+.74*Math.abs(targetX)/3.15,.22,.94);
     keeper.rotation.z=THREE.MathUtils.lerp(tilt0,-side*lean,s);
     keeper.rotation.x=-.06*high*Math.sin(Math.PI*e);
     if(this.v29ArmReach)this.v29ArmReach.weight=THREE.MathUtils.clamp((e-.12)*2.1,0,1);
   });
   this.setKeeperState(sim.outcome==="save"?"intercept":"miss");
   if(this.v29ArmReach)this.v29ArmReach.weight=1;
   v24Report("V29 · "+activeClip.toUpperCase()+"-SKELETTANIMATION · "+(side<0?"LINKS":"RECHTS"));
   return true;
 }
 async v27Recover(sim){
   const k=this.keeper,p=k.position.clone(),rz=k.rotation.z,rx=k.rotation.x;
   this.setKeeperState("land");
   await this.tween(310,e=>{
     const s=e*e*(3-2*e);
     k.position.y=THREE.MathUtils.lerp(p.y,0,s);
     k.position.z=THREE.MathUtils.lerp(p.z,.35,s);
     k.rotation.z=THREE.MathUtils.lerp(rz,-Math.sign(rz||1)*.38,s);
     k.rotation.x=THREE.MathUtils.lerp(rx,0,s);
   });
   // Cross-fade directly into the model's native Idle without stopping its
   // mixer. Native bone data neutralizes the jump pose across the skeleton.
   this.playRigClip(k,"Idle",{fade:.32,speed:1});
   const from=k.position.clone(),rot=k.rotation.z;
   this.setKeeperState("recover");
   await this.tween(480,e=>{
     const s=e*e*(3-2*e);
     k.position.x=THREE.MathUtils.lerp(from.x,THREE.MathUtils.clamp(from.x,-.55,.55),s);
     k.position.z=THREE.MathUtils.lerp(from.z,.35,s);
     k.rotation.z=THREE.MathUtils.lerp(rot,0,s);
   });
   this.releaseCaughtBall();
   this.v29ArmReach=null;
   this.v27Active=false;
   this.v27CatchStart=0;
   this.v27CatchInitial=null;
   k.rotation.set(0,0,0);
   this.setKeeperState("ready");
   this.stopKeeperIdle=false;
 }
 async keeperDiveSequence(sim,duration=430){
   if(await this.v27Dive(sim,duration))return;
   if(await this.v26Dive(sim,duration))return;
   if(this.v24Motions&&this.keeper?.userData?.isGLB){if(await this.v24Dive(sim,duration))return;}
   if(this.mixamoRig){const real=await this.v23Dive(sim,duration);if(real)return;}
   this.setKeeperState("react");
   this.stopKeeperIdle=true;
   const k=this.keeper,start=k.position.clone();
   const side=sim.kx>=0?1:-1;
   const lateral=THREE.MathUtils.clamp(Math.abs(sim.kx)/3.15,0,1);
   const high=THREE.MathUtils.clamp((sim.ky-.35)/1.75,0,1);
   const target=new THREE.Vector3(sim.kx,Math.max(.28,sim.ky),sim.contactZ??this.savePlaneZ);
   const prepMs=Math.max(85,Math.round(duration*.23));
   const flightMs=Math.max(180,duration-prepMs);
   // Low shots start as a sharp side step; high shots use the jump clip.
   this.playRigClip(k,high>.32?"Jump":"Walk",{fade:.09,once:high>.32,speed:high>.32?.9:1.5});
   this.setKeeperState("push_off");
   await this.tween(prepMs,e=>{
     const smooth=e*e*(3-2*e);
     k.position.x=THREE.MathUtils.lerp(start.x,target.x*.13,smooth);
     k.position.y=(.025+.055*high)*Math.sin(e*Math.PI);
     k.position.z=THREE.MathUtils.lerp(start.z,.34,smooth);
     k.rotation.z=-side*.12*lateral*smooth;
     this.keeperPoseV22("push",e,sim);
   });
   this.setKeeperState("dive");
   const from=k.position.clone();
   const yaw=-side*(.25+.93*lateral);
   await this.tween(flightMs,e=>{
     const smooth=e*e*(3-2*e);
     const lift=(.06+.37*high)*Math.sin(Math.PI*e);
     k.position.x=THREE.MathUtils.lerp(from.x,target.x,smooth);
     k.position.y=THREE.MathUtils.lerp(from.y,Math.max(.08,high*.20),smooth)+lift;
     k.position.z=THREE.MathUtils.lerp(from.z,target.z,smooth);
     k.rotation.z=THREE.MathUtils.lerp(-side*.12*lateral,yaw,smooth);
     k.rotation.x=-.05*high*Math.sin(Math.PI*e);
     this.keeperPoseV22("flight",e,sim);
   });
   // V22 keeps visual contact in front of the goal line, matching V21 physics.
   this.setKeeperState(sim.outcome==="save"?"intercept":"miss");
   if(sim.outcome==="save")this.keeperPoseV22("contact",1,sim);
 }

 catchBallAtKeeper(sim){
   if(!this.ball||!this.keeper)return;
   this.ballCaught=true;
   // keep ball in scene coordinates; updateCaughtBallHands() moves it between both hands.
   if(this.ball.parent!==this.scene)this.scene.attach(this.ball);
   if(this.v27Active){this.v27CatchInitial=this.ball.position.clone();this.v27CatchStart=performance.now();}
   if(!this.v27Active&&!this.v26Active)this.closeKeeperHands();
   this.updateCaughtBallHands();
 }
 releaseCaughtBall(){if(!this.ballCaught||!this.ball)return;if(this.ball.parent!==this.scene)this.scene.attach(this.ball);this.ballCaught=false;}
 async keeperLandRecover(sim){
   if(this.v27Active){await this.v27Recover(sim);return;}
   if(this.v26Active){await this.v26Recover();return;}
   if(this.v24Active){
     const k=this.keeper,start=k.position.clone(),rot=k.rotation.z,pose=this.v24Motions[this.v24MotionName];
     this.setKeeperState("land");
     await this.tween(490,(e,p)=>{
       this.v24PoseAt(pose,1);
       k.position.y=THREE.MathUtils.lerp(start.y,0,e);
       k.position.z=THREE.MathUtils.lerp(start.z,.35,e);
       k.rotation.z=THREE.MathUtils.lerp(rot,-Math.sign(rot||1)*.7,e);
     });
     this.setKeeperState("recover");
     await this.tween(500,(e,p)=>{
       const targets=this.v24MotionTargets();
       for(const [key,q] of Object.entries(this.v24PoseBase||{})){if(targets?.[key])targets[key].quaternion.slerpQuaternions(targets[key].quaternion,q,e);}
       k.position.x=THREE.MathUtils.lerp(start.x,THREE.MathUtils.clamp(start.x,-.6,.6),e);
       k.rotation.z=THREE.MathUtils.lerp(-Math.sign(rot||1)*.7,0,e);
     });
     this.v24Reset();this.releaseCaughtBall();this.playRigClip(k,"Idle",{fade:.28});
     this.stopKeeperIdle=false;this.setKeeperState("ready");return;
   }
   if(this.mixamoRig && this.mixamoLastClip){
     const clip=this.mixamoLastClip,k=this.keeper,p=k.position.clone(),rz=k.rotation.z;
     this.setKeeperState("land");
     await this.tween(510,e=>{
       this.mixamoMixer.setTime(clip.duration*(.78+.22*e));
       const smooth=e*e*(3-2*e);
       k.position.x=THREE.MathUtils.lerp(p.x,THREE.MathUtils.clamp(p.x,-.65,.65),smooth);
       k.position.y=THREE.MathUtils.lerp(p.y,0,smooth);
       k.position.z=THREE.MathUtils.lerp(p.z,.35,smooth);
       k.rotation.z=THREE.MathUtils.lerp(rz,0,smooth);
     });
     this.setKeeperState("recover");
     await new Promise(r=>setTimeout(r,180));
     this.releaseCaughtBall();
     this.v23Idle();this.setKeeperState("ready");this.stopKeeperIdle=false;
     return;
   }

   const k=this.keeper,side=sim.kx>=0?1:-1;
   this.setKeeperState("land");
   const p=k.position.clone(),rz=k.rotation.z;
   // Slower impact, low center of gravity, then recover the standing stance.
   await this.tween(350,e=>{
     const ease=e*e*(3-2*e);
     k.position.y=THREE.MathUtils.lerp(p.y,.015,ease);
     k.position.z=THREE.MathUtils.lerp(p.z,.34,ease);
     k.rotation.z=THREE.MathUtils.lerp(rz,-side*Math.min(1.34,Math.abs(rz)+.15),ease);
     k.rotation.x=THREE.MathUtils.lerp(k.rotation.x,-.08,ease);
   });
   await new Promise(r=>setTimeout(r,90));
   this.setKeeperState("recover");
   this.playRigClip(k,"Idle",{fade:.28,speed:.85});
   const lp=k.position.clone(),lr=k.rotation.clone();
   await this.tween(530,e=>{
     const ease=e*e*(3-2*e);
     k.position.x=THREE.MathUtils.lerp(lp.x,THREE.MathUtils.clamp(lp.x,-.65,.65),ease);
     k.position.y=THREE.MathUtils.lerp(lp.y,0,ease);
     k.position.z=THREE.MathUtils.lerp(lp.z,.35,ease);
     k.rotation.z=THREE.MathUtils.lerp(lr.z,0,ease);
     k.rotation.x=THREE.MathUtils.lerp(lr.x,0,ease);
   });
   this.releaseCaughtBall();
   this.setKeeperState("ready");
   this.stopKeeperIdle=false;
 }

 makeScene(){
   this.scene.fog=new THREE.Fog(0x07131f,20,48);
   const hemi=new THREE.HemisphereLight(0xd9f0ff,0x122c18,1.25);this.scene.add(hemi);
   const sun=new THREE.DirectionalLight(0xf4fbff,2.4);sun.position.set(-7,13,9);sun.castShadow=true;
   sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-13;sun.shadow.camera.right=13;sun.shadow.camera.top=20;sun.shadow.camera.bottom=-4;this.scene.add(sun);
   const pitch=new THREE.Mesh(new THREE.PlaneGeometry(22,34),new THREE.MeshStandardMaterial({color:0x0d733d,roughness:.92,metalness:0}));pitch.rotation.x=-Math.PI/2;pitch.position.z=5;pitch.receiveShadow=true;this.scene.add(pitch);
   for(let i=0;i<12;i++){const strip=new THREE.Mesh(new THREE.PlaneGeometry(1.8,34),new THREE.MeshStandardMaterial({color:i%2?0x117a42:0x0b6637,roughness:.98,transparent:true,opacity:.48}));strip.rotation.x=-Math.PI/2;strip.position.set(-9.9+i*1.8,.002,5);this.scene.add(strip)}
   this.prepareStadiumEnvironment();
   const lineMat=new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.5});
   const boxPts=[[-4.5,0,0],[-4.5,0,5.5],[4.5,0,5.5],[4.5,0,0]];this.scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(boxPts.map(p=>new THREE.Vector3(...p))),lineMat));
   this.goalGroup=new THREE.Group();this.scene.add(this.goalGroup);const postMat=new THREE.MeshStandardMaterial({color:0xffffff,metalness:.05,roughness:.3});
   const cyl=(r,h)=>new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,18),postMat);
   const lp=cyl(.06,2.44);lp.position.set(-3.66,1.22,0);lp.castShadow=true;this.goalGroup.add(lp);const rp=lp.clone();rp.position.x=3.66;this.goalGroup.add(rp);
   const bar=cyl(.06,7.32);bar.rotation.z=Math.PI/2;bar.position.set(0,2.44,0);this.goalGroup.add(bar);
   const netMat=new THREE.LineBasicMaterial({color:0xbfeeff,transparent:true,opacity:.18});for(let i=0;i<=18;i++){const x=-3.66+i*(7.32/18);this.goalGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,0,0.03),new THREE.Vector3(x,2.44,0.03),new THREE.Vector3(x,2.1,-1.1)]),netMat))}for(let j=0;j<=8;j++){const y=j*(2.44/8);this.goalGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-3.66,y,0.03),new THREE.Vector3(3.66,y,0.03)]),netMat))}
   this.hitPlane=new THREE.Mesh(new THREE.PlaneGeometry(7.32,2.44),new THREE.MeshBasicMaterial({transparent:true,opacity:0,side:THREE.DoubleSide}));this.hitPlane.position.set(0,1.22,0.04);this.scene.add(this.hitPlane);
   const spot=new THREE.Mesh(new THREE.CircleGeometry(.12,24),new THREE.MeshBasicMaterial({color:0xffffff}));spot.rotation.x=-Math.PI/2;spot.position.set(0,.006,11);this.scene.add(spot);
   this.ball=this.makeBall();this.ball.position.set(0,.11,11);this.scene.add(this.ball);
   this.player=this.makeHuman(1.80,0xf2f2f2,0x171b22,false);this.setHairStyle(this.player,0);this.player.position.set(-1.2,0,12.2);this.player.rotation.y=Math.PI;this.scene.add(this.player);
   this.keeper=this.makeHuman(1.92,0xe4b72f,0x182235,true);this.setHairStyle(this.keeper,10);this.keeper.position.set(0,0,.35);this.keeper.rotation.y=0;this.scene.add(this.keeper);this.setKeeperState("ready");
   this.installRealPlayers();
   this.updateCameraForPlayer(true);this.startIdle();
 }
 makeBall(){const g=new THREE.Group();const ball=new THREE.Mesh(new THREE.SphereGeometry(.11,28,20),new THREE.MeshStandardMaterial({color:0xf8f8f6,roughness:.5}));ball.castShadow=true;g.add(ball);for(let i=0;i<8;i++){const p=new THREE.Mesh(new THREE.CircleGeometry(.024,5),new THREE.MeshBasicMaterial({color:0x17202b}));p.position.set(Math.sin(i*.78)*.102,Math.cos(i*.78)*.07,Math.cos(i*.78)*.08);p.lookAt(new THREE.Vector3(0,0,0));g.add(p)}return g}
 makeHuman(height,shirt,shorts,isKeeper){
   const root=new THREE.Group();
   const skin=0xc78f6f,skinDark=0x9b664d,hairColor=0x241b18,bootColor=0x10151d,sockColor=0xf0f3f5;
   const mkMat=(c,r=.68,m=.02)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
   const part=(geo,c,r=.68)=>{const m=new THREE.Mesh(geo,mkMat(c,r));m.castShadow=true;m.receiveShadow=true;return m};

   // Feet on y=0, total height approximately equals requested player height.
   const pelvisY=height*.53;
   const pelvis=new THREE.Group();pelvis.position.y=pelvisY;root.add(pelvis);

   // Pelvis / shorts block
   const hip=part(new THREE.SphereGeometry(height*.115,20,14),shorts,.82);
   hip.scale.set(1.35,.72,.82);hip.position.y=-height*.015;pelvis.add(hip);

   // Tapered torso with shoulders
   const torsoGeo=new THREE.CylinderGeometry(height*.155,height*.125,height*.39,18,1,false);
   const torso=part(torsoGeo,shirt,.76);torso.position.y=height*.20;torso.scale.z=.72;pelvis.add(torso);
   const shoulderL=part(new THREE.SphereGeometry(height*.075,16,12),shirt,.76);shoulderL.scale.set(1.0,.92,.9);shoulderL.position.set(-height*.16,height*.34,0);pelvis.add(shoulderL);
   const shoulderR=shoulderL.clone();shoulderR.material=mkMat(shirt,.76);shoulderR.position.x=height*.16;pelvis.add(shoulderR);

   // Neck and articulated head.
   const neck=part(new THREE.CylinderGeometry(height*.043,height*.05,height*.078,18),skin,.82);neck.position.y=height*.435;pelvis.add(neck);
   const headPivot=new THREE.Group();pelvis.add(headPivot);

   // More natural head: oval cranium + jaw + cheek volume.
   const head=part(new THREE.SphereGeometry(height*.106,32,24),skin,.84);
   head.scale.set(.84,1.07,.90);head.position.y=height*.535;headPivot.add(head);
   const jaw=part(new THREE.SphereGeometry(height*.073,28,20),skin,.86);
   jaw.scale.set(.93,.72,.90);jaw.position.set(0,height*.486,height*.008);headPivot.add(jaw);
   const cheekL=part(new THREE.SphereGeometry(height*.033,18,12),skin,.86);cheekL.scale.set(1.18,.78,.55);cheekL.position.set(-height*.047,height*.515,height*.079);headPivot.add(cheekL);
   const cheekR=cheekL.clone();cheekR.material=mkMat(skin,.86);cheekR.position.x=height*.047;headPivot.add(cheekR);

   // Smaller ears, positioned closer to the skull.
   const earGeo=new THREE.SphereGeometry(height*.019,16,10);
   const earL=part(earGeo,skin,.86);earL.scale.set(.50,1.0,.45);earL.position.set(-height*.091,height*.535,-height*.002);headPivot.add(earL);
   const earR=earL.clone();earR.material=mkMat(skin,.86);earR.position.x=height*.091;headPivot.add(earR);

   const hairGroup=new THREE.Group();headPivot.add(hairGroup);

   // Eyes with subtle eyelids instead of cartoon dots.
   const eyeWhiteMat=new THREE.MeshStandardMaterial({color:0xe9ecec,roughness:.8});
   const irisMat=new THREE.MeshStandardMaterial({color:0x2b211b,roughness:.7});
   const pupilMat=new THREE.MeshBasicMaterial({color:0x090909});
   const eyeRefs=[];
   [-1,1].forEach(side=>{
     const eg=new THREE.Group();eg.position.set(side*height*.034,height*.548,height*.094);headPivot.add(eg);
     const white=new THREE.Mesh(new THREE.SphereGeometry(height*.0135,16,10),eyeWhiteMat.clone());white.scale.set(1.25,.70,.46);eg.add(white);
     const iris=new THREE.Mesh(new THREE.SphereGeometry(height*.007,14,10),irisMat.clone());iris.scale.set(1,.9,.42);iris.position.z=height*.011;eg.add(iris);
     const pupil=new THREE.Mesh(new THREE.SphereGeometry(height*.0032,10,8),pupilMat);pupil.position.z=height*.016;eg.add(pupil);
     const lid=part(new THREE.TorusGeometry(height*.014,height*.0024,6,18,Math.PI),skinDark,.9);lid.rotation.z=Math.PI;lid.position.set(0,height*.006,height*.014);eg.add(lid);
     const brow=part(new THREE.CapsuleGeometry(height*.0038,height*.032,4,8),hairColor,.95);brow.rotation.z=side*.10;brow.position.set(0,height*.026,height*.015);eg.add(brow);
     eyeRefs.push(eg);
   });

   // Nose with bridge + tip, not a cone.
   const noseBridge=part(new THREE.CapsuleGeometry(height*.010,height*.035,5,10),skinDark,.86);
   noseBridge.rotation.x=Math.PI/2;noseBridge.position.set(0,height*.526,height*.098);headPivot.add(noseBridge);
   const noseTip=part(new THREE.SphereGeometry(height*.018,16,12),skinDark,.86);
   noseTip.scale.set(.82,.70,.80);noseTip.position.set(0,height*.507,height*.115);headPivot.add(noseTip);

   // Mouth: two short lip volumes; no torus, so no red "earring" from side view.
   const lipMat=new THREE.MeshStandardMaterial({color:0x8a514b,roughness:.9});
   const mouthUpper=new THREE.Mesh(new THREE.CapsuleGeometry(height*.0035,height*.026,4,8),lipMat);mouthUpper.rotation.z=Math.PI/2;mouthUpper.position.set(0,height*.486,height*.102);headPivot.add(mouthUpper);
   const mouthLower=new THREE.Mesh(new THREE.CapsuleGeometry(height*.0032,height*.022,4,8),lipMat.clone());mouthLower.rotation.z=Math.PI/2;mouthLower.position.set(0,height*.479,height*.101);headPivot.add(mouthLower);
   // Segmented arms with elbow joints.
   function makeArm(side){
     const shoulder=new THREE.Group();shoulder.position.set(side*height*.18,height*.335,0);pelvis.add(shoulder);
     const upper=part(new THREE.CapsuleGeometry(height*.038,height*.15,5,10),isKeeper?shirt:skin,.8);
     upper.position.y=-height*.095;shoulder.add(upper);
     const elbow=part(new THREE.SphereGeometry(height*.043,14,10),skin,.82);elbow.position.y=-height*.19;shoulder.add(elbow);
     const forePivot=new THREE.Group();forePivot.position.y=-height*.19;shoulder.add(forePivot);
     const fore=part(new THREE.CapsuleGeometry(height*.034,height*.145,5,10),skin,.82);fore.position.y=-height*.087;forePivot.add(fore);
     const hand=part(new THREE.SphereGeometry(height*.045,14,10),isKeeper?0xf5f7f8:skin,.72);hand.scale.set(.75,1.0,.55);hand.position.y=-height*.18;forePivot.add(hand);
     shoulder.userData.fore=forePivot;
     return shoulder;
   }
   root.armL=makeArm(-1);root.armR=makeArm(1);

   // Segmented legs with knee, socks, boots.
   function makeLeg(side){
     const hipPivot=new THREE.Group();hipPivot.position.set(side*height*.085,0,0);pelvis.add(hipPivot);
     const thigh=part(new THREE.CapsuleGeometry(height*.055,height*.18,5,10),shorts,.82);thigh.position.y=-height*.12;hipPivot.add(thigh);
     const knee=part(new THREE.SphereGeometry(height*.05,14,10),skin,.83);knee.position.y=-height*.245;hipPivot.add(knee);
     const shinPivot=new THREE.Group();shinPivot.position.y=-height*.245;hipPivot.add(shinPivot);
     const shin=part(new THREE.CapsuleGeometry(height*.047,height*.185,5,10),skin,.83);shin.position.y=-height*.115;shinPivot.add(shin);
     const sock=part(new THREE.CylinderGeometry(height*.048,height*.052,height*.13,14),sockColor,.88);sock.position.y=-height*.24;shinPivot.add(sock);
     const boot=part(new THREE.BoxGeometry(height*.12,height*.055,height*.23),bootColor,.62);boot.position.set(0,-height*.31,height*.055);boot.rotation.x=.03;shinPivot.add(boot);
     hipPivot.userData.shin=shinPivot;
     return hipPivot;
   }
   root.legL=makeLeg(-1);root.legR=makeLeg(1);

   // Keeper gloves/cuffs
   if(isKeeper){
     root.armL.rotation.z=-.52;root.armR.rotation.z=.52;
     root.armL.userData.fore.rotation.z=-.08;root.armR.userData.fore.rotation.z=.08;
   }else{
     root.armL.rotation.z=-.10;root.armR.rotation.z=.10;
   }

   // Save references/materials for recoloring and animation.
   root.userData.height=height;root.userData.hairGroup=hairGroup;root.userData.headPivot=headPivot;root.userData.earL=earL;root.userData.earR=earR;root.userData.head=head;root.userData.jaw=jaw;root.userData.noseTip=noseTip;root.userData.eyeRefs=eyeRefs;
   root.userData.torso=torso;root.userData.shoulderL=shoulderL;root.userData.shoulderR=shoulderR;root.userData.hip=hip;
   root.userData.shirtMat=torso.material;root.userData.shortMat=hip.material;
   root.userData.isKeeper=isKeeper;
   return root
 }
 recolorHuman(h,shirt,shorts){h.traverse(o=>{if(o.isMesh&&o.geometry.type.includes("Capsule")){if(o===h.children?.[0])return}})}
 setHairStyle(root,style){
   const hg=root.userData.hairGroup;if(!hg)return;
   while(hg.children.length){const o=hg.children.pop();o.geometry?.dispose?.();o.material?.dispose?.()}
   const h=root.userData.height,s=((style%11)+11)%11;
   const tones=[0x181311,0x241a16,0x30221b,0x171412,0x3b2b22];
   const mat=()=>new THREE.MeshStandardMaterial({color:tones[s%tones.length],roughness:.98});
   const add=(geo,pos,scale=[1,1,1],rot=[0,0,0])=>{const m=new THREE.Mesh(geo,mat());m.position.set(...pos);m.scale.set(...scale);m.rotation.set(...rot);m.castShadow=true;hg.add(m);return m};
   const y=h*.592;

   // Full scalp coverage from crown to occipital area.
   add(new THREE.SphereGeometry(h*.123,32,22),[0,y-h*.002,-h*.006],[.97,.80,1.03]);
   add(new THREE.SphereGeometry(h*.118,30,20),[0,y-h*.032,-h*.050],[.96,.70,1.04]);
   add(new THREE.SphereGeometry(h*.102,26,18),[0,y-h*.065,-h*.076],[1.00,.62,1.02]);

   // Temple coverage hides scalp from rear/three-quarter views.
   add(new THREE.SphereGeometry(h*.060,20,14),[-h*.078,y-h*.020,-h*.004],[.92,1.20,.80],[0,0,.05]);
   add(new THREE.SphereGeometry(h*.060,20,14),[ h*.078,y-h*.020,-h*.004],[.92,1.20,.80],[0,0,-.05]);

   if(s===0){ // short natural
     add(new THREE.SphereGeometry(h*.083,22,16),[0,y+h*.042,h*.012],[1.06,.46,1.00]);
   }else if(s===1){ // textured crop
     for(let i=-3;i<=3;i++)add(new THREE.SphereGeometry(h*.022,14,10),[i*h*.025,y+h*.070-Math.abs(i)*h*.005,h*.026],[1.06,.88,1.00]);
   }else if(s===2){ // clean side part
     add(new THREE.SphereGeometry(h*.082,22,16),[-h*.040,y+h*.052,h*.016],[1.35,.58,1.06],[0,0,.16]);
     add(new THREE.SphereGeometry(h*.052,18,12),[h*.048,y+h*.022,h*.024],[1.08,.46,.96]);
   }else if(s===3){ // short curls
     const pts=[[-.07,.042],[-.035,.068],[0,.076],[.035,.068],[.07,.042],[-.05,.015],[0,.030],[.05,.015]];
     pts.forEach(([x,yy])=>add(new THREE.SphereGeometry(h*.027,16,12),[x*h,y+yy*h,h*.018]));
   }else if(s===4){ // brushed back
     add(new THREE.SphereGeometry(h*.090,24,16),[0,y+h*.052,-h*.004],[1.18,.50,1.02],[.08,0,0]);
   }else if(s===5){ // medium over ears
     add(new THREE.SphereGeometry(h*.074,22,15),[-h*.085,y-h*.030,-h*.006],[.95,1.48,.82],[0,0,.04]);
     add(new THREE.SphereGeometry(h*.074,22,15),[ h*.085,y-h*.030,-h*.006],[.95,1.48,.82],[0,0,-.04]);
     add(new THREE.CapsuleGeometry(h*.032,h*.090,6,12),[-h*.078,y-h*.115,-h*.045],[1,1,1],[0,0,.03]);
     add(new THREE.CapsuleGeometry(h*.032,h*.090,6,12),[ h*.078,y-h*.115,-h*.045],[1,1,1],[0,0,-.03]);
   }else if(s===6){ // longer nape
     add(new THREE.CapsuleGeometry(h*.036,h*.13,6,12),[-h*.072,y-h*.13,-h*.055],[1,1,1],[0,0,.03]);
     add(new THREE.CapsuleGeometry(h*.036,h*.13,6,12),[ h*.072,y-h*.13,-h*.055],[1,1,1],[0,0,-.03]);
     add(new THREE.SphereGeometry(h*.090,22,16),[0,y-h*.11,-h*.085],[1.12,1.10,1.04]);
   }else if(s===7){ // swept right with fringe
     add(new THREE.SphereGeometry(h*.086,22,16),[h*.040,y+h*.046,h*.010],[1.32,.58,1.02],[0,0,-.12]);
     add(new THREE.CapsuleGeometry(h*.024,h*.070,5,10),[h*.082,y-h*.070,-h*.020],[1,1,1],[0,0,-.08]);
   }else if(s===8){ // swept left
     add(new THREE.SphereGeometry(h*.086,22,16),[-h*.040,y+h*.046,h*.010],[1.32,.58,1.02],[0,0,.12]);
     add(new THREE.CapsuleGeometry(h*.024,h*.070,5,10),[-h*.082,y-h*.070,-h*.020],[1,1,1],[0,0,.08]);
   }else if(s===9){ // wavy medium
     for(let i=-2;i<=2;i++)add(new THREE.SphereGeometry(h*.030,16,12),[i*h*.038,y+h*.052-Math.abs(i)*h*.007,h*.018],[1.05,1.0,1]);
     add(new THREE.CapsuleGeometry(h*.035,h*.11,6,12),[-h*.082,y-h*.110,-h*.050]);
     add(new THREE.CapsuleGeometry(h*.035,h*.11,6,12),[ h*.082,y-h*.110,-h*.050]);
   }else if(s===10){ // longer brushed back, still clearly male
     add(new THREE.SphereGeometry(h*.092,24,16),[0,y+h*.052,-h*.012],[1.18,.55,1.04],[.10,0,0]);
     add(new THREE.SphereGeometry(h*.095,24,16),[0,y-h*.105,-h*.088],[1.10,1.10,1.04]);
     add(new THREE.CapsuleGeometry(h*.030,h*.090,6,12),[-h*.072,y-h*.115,-h*.045]);
     add(new THREE.CapsuleGeometry(h*.030,h*.090,6,12),[ h*.072,y-h*.115,-h*.045]);
   }
 } 
 setFaceStyle(root,style){
   const h=root.userData.height,s=((style%7)+7)%7;
   const head=root.userData.head,jaw=root.userData.jaw,nose=root.userData.noseTip,eyes=root.userData.eyeRefs||[];
   if(head)head.scale.set(.82+.018*(s%3),1.04+.018*((s+1)%3),.89+.014*(s%2));
   if(jaw)jaw.scale.set(.88+.035*(s%4),.68+.025*((s+2)%3),.89);
   if(nose)nose.scale.set(.72+.05*(s%3),.66+.035*((s+1)%3),.78+.04*(s%2));
   const spacing=.032+.0025*(s%4);
   eyes.forEach((eg,idx)=>eg.position.x=(idx===0?-1:1)*h*spacing);
 } 
 updateCameraForPlayer(immediate=false){
   if(!this.player)return;
   const retreat=THREE.MathUtils.clamp((S.playerPos.z-12.2)/4.0,0,1);
   const side=S.playerPos.x;
   // Camera follows backward so player never leaves frame.
   // As camera retreats, ball and goal become naturally smaller / farther away.
   const desired=new THREE.Vector3(
     side*.22,
     2.55+retreat*.55,
     15.5+retreat*5.2
   );
   const look=new THREE.Vector3(side*.08,1.15,4.0-retreat*.35);
   if(immediate){
     this.camera.position.copy(desired);this.cameraTarget.copy(look);this.camera.lookAt(look);return
   }
   const from=this.camera.position.clone();
   const startTarget=this.cameraTarget?this.cameraTarget.clone():new THREE.Vector3(0,1.15,4.2);
   this.cameraTarget=look.clone();
   this.tween(180,e=>{
     this.camera.position.lerpVectors(from,desired,e);
     const lt=startTarget.clone().lerp(look,e);
     this.camera.lookAt(lt)
   });
 }
 setPlayerPosition(x,z,animate=false){
   const nx=THREE.MathUtils.clamp(x,-2,2),nz=THREE.MathUtils.clamp(z,11.38,16.2);
   const ox=S.playerPos.x,oz=S.playerPos.z;S.playerPos.x=nx;S.playerPos.z=nz;
   if(!this.player||S.busy)return;
   if(animate){
     const from=this.player.position.clone(),to=new THREE.Vector3(nx,0,nz);
     const dist=Math.hypot(nx-from.x,nz-from.z);
     const ms=THREE.MathUtils.clamp(220+dist*220,220,460);
     const seq=++this.moveSeq;
     this.playRigClip(this.player,"Walk",{fade:.16,speed:.88+Math.min(.25,dist)});
     // turn only a little toward movement direction while keeping the goal as visual reference.
     const heading=Math.atan2(nx-from.x,nz-from.z);
     const base=Math.PI;
     this.tween(ms,e=>{
       this.player.position.lerpVectors(from,to,e);
       const lean=Math.sin(e*Math.PI)*.03;
       this.player.rotation.y=THREE.MathUtils.lerp(base,base+heading*.28,Math.sin(e*Math.PI));
       this.player.rotation.z=lean*Math.sign(nx-ox||1)
     }).then(()=>{
       if(seq!==this.moveSeq)return;
       this.player.rotation.set(0,Math.PI,0);this.playRigClip(this.player,"Idle",{fade:.18});this.startIdle()
     });
   } else this.player.position.set(nx,0,nz);
   this.updatePositionReadout();this.updateCameraForPlayer(false);
 }
 movePlayer(dx,dz){
   if(S.busy||S.finished)return;
   this.stopIdle();this.setPlayerPosition(S.playerPos.x+dx,S.playerPos.z+dz,true)
 }
 updatePositionReadout(){
   const el=$("#positionReadout");if(!el)return;
   const side=Math.abs(S.playerPos.x)<.05?"mittig":Math.abs(S.playerPos.x).toFixed(1)+" m "+(S.playerPos.x<0?"links":"rechts");
   el.textContent="Position: "+side+" · "+Math.max(0,S.playerPos.z-11).toFixed(1)+" m hinter Ball";
 }
 applyHairForTurn(attacker,defender,shooterIndex){
   const teamIndex=Math.max(0,TEAMS.findIndex(t=>t.id===attacker.id));
   const defIndex=Math.max(0,TEAMS.findIndex(t=>t.id===defender.id));
   const playerStyle=(teamIndex*5+shooterIndex)%11;
   let keeperStyle=(defIndex*5+10)%11;
   if(keeperStyle===playerStyle)keeperStyle=(keeperStyle+1)%11;
   if(!this.player.userData.isGLB){this.setHairStyle(this.player,playerStyle);this.setFaceStyle(this.player,teamIndex*5+shooterIndex)}
   if(!this.keeper.userData.isGLB){this.setHairStyle(this.keeper,keeperStyle);this.setFaceStyle(this.keeper,defIndex*5+4)}
 }
 setTeams(att,def){
   const recolor=(human,shirt,shorts)=>{
     if(human.userData.torso)human.userData.torso.material.color.setHex(shirt);
     if(human.userData.shoulderL)human.userData.shoulderL.material.color.setHex(shirt);
     if(human.userData.shoulderR)human.userData.shoulderR.material.color.setHex(shirt);
     if(human.userData.hip)human.userData.hip.material.color.setHex(shorts);
     // keeper upper arms use shirt color
     if(human.userData.isKeeper){
       human.armL.children[0].material.color.setHex(shirt);
       human.armR.children[0].material.color.setHex(shirt);
     }
     human.legL.children[0].material.color.setHex(shorts);
     human.legR.children[0].material.color.setHex(shorts);
   };
   recolor(this.player,att.shirt,att.shorts);
   recolor(this.keeper,def.keeperColor,0x17263a);
   if(this.player.userData.realRig)this.applyRigKit(this.player.userData.realRig,att,false);
   // V20A.3 no add-on lower-body meshes.
   if(this.keeper.userData.realRig)this.applyRigKit(this.keeper.userData.realRig,def,true);
 } 
 startIdle(){this.idle=true;this.idleSince=this.clock.getElapsedTime()}
 stopIdle(){this.idle=false}
 resetIdlePose(){
   if(!this.player)return;
   this.player.rotation.y=Math.PI;
   if(this.player.userData.headPivot)this.player.userData.headPivot.rotation.set(0,0,0);
   this.player.position.y=0;
 }
 loop(){
   requestAnimationFrame(()=>this.loop());
   const now=performance.now(),dt=Math.min(.05,(now-this.prevFrameMs)/1000);this.prevFrameMs=now;
   if(this.player?.userData?.mixer)this.player.userData.mixer.update(dt);
   if(this.keeper?.userData?.mixer&&!this.v24Active&&!this.v26Active)this.keeper.userData.mixer.update(dt);
   if(this.ballCaught)this.updateCaughtBallHands();
   if(this.mixamoMixer&&!this.mixamoActive)this.mixamoMixer.update(dt);
   const t=this.clock.getElapsedTime();
   if(this.idle&&!S.busy){
     const idleAge=Math.max(0,t-(this.idleSince||t));
     const breathe=Math.sin(t*1.35);
     this.player.position.x=S.playerPos.x+Math.sin(t*.9)*.03;
     this.player.position.z=S.playerPos.z+Math.sin(t*.63)*.02;
     this.player.position.y=.012*breathe;
     this.player.scale.setScalar(1+Math.sin(t*.63)*.006);

     // Primitive fallback gets joint motion; GLB uses its real skeleton animation.
     if(!this.player.userData.isGLB){
       this.player.armL.rotation.z=-.10+Math.sin(t*.85)*.025;
       this.player.armR.rotation.z=.10-Math.sin(t*.85)*.025;
       this.player.armL.userData.fore.rotation.x=.05+Math.sin(t*.72)*.035;
       this.player.armR.userData.fore.rotation.x=.05-Math.sin(t*.72)*.035;
       this.player.legL.userData.shin.rotation.x=Math.max(0,Math.sin(t*.7))*.035;
       this.player.legR.userData.shin.rotation.x=Math.max(0,-Math.sin(t*.7))*.035;
     }

     // After waiting, the player turns partially toward the user so the face becomes visible.
     // The motion is slow and cyclic, like a glance over the shoulder, not a robotic 180-degree spin.
     const hp=this.player.userData.headPivot;
     const bodyTurn=0;
     this.player.rotation.y=Math.PI;
     if(hp){
       // V17C: only tiny natural micro-movements; no puppet-like head turn.
       hp.rotation.y=.035*Math.sin(t*.31);
       hp.rotation.x=.018*Math.sin(t*.55);
       hp.rotation.z=.012*Math.sin(t*.43);
     }

     if(!this.stopKeeperIdle && (this.keeperState==="ready"||this.keeperState==="shuffle"))this.keeperReadyPose();
   }
   this.anim=this.anim.filter(a=>{
     const p=Math.min(1,(performance.now()-a.t0)/a.d),e=1-Math.pow(1-p,3);
     a.step(e,p);if(p>=1){a.done?.();return false}return true
   });
   if(this.showSideCam&&performance.now()>this.sideCamHoldUntil&&!S.busy)this.endSideCam(true);
   this.renderScene()
 }
 tween(d,step){return new Promise(res=>this.anim.push({t0:performance.now(),d,step,done:res}))}
 pickGoal(e){if(S.busy||S.finished)return;const r=this.renderer.domElement.getBoundingClientRect(),m=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1),ray=new THREE.Raycaster();ray.setFromCamera(m,this.camera);const hit=ray.intersectObject(this.hitPlane)[0];if(!hit)return;S.target.x=THREE.MathUtils.clamp(hit.point.x,-3.55,3.55);S.target.y=THREE.MathUtils.clamp(hit.point.y,.08,2.36);S.target.set=true;this.showMarker();$("#aim").textContent=Math.round((S.target.x/7.32+.5)*100)+" / "+Math.round(S.target.y/2.44*100);enableShoot(true);$("#commentary").textContent="Ziel gesetzt. Optional Alt+B für Ballkontakt, dann Power und Schießen."}
 showMarker(){if(this.targetMarker)this.scene.remove(this.targetMarker);const ring=new THREE.Mesh(new THREE.RingGeometry(.12,.16,32),new THREE.MeshBasicMaterial({color:0x62e7ff,side:THREE.DoubleSide}));ring.position.set(S.target.x,S.target.y,.08);this.scene.add(ring);this.targetMarker=ring}
 async shoot(sim){
   this.stopIdle();this.resetIdlePose();this.stopKeeperIdle=true;
   this.beginSideCam();
   await this.cinematicRunCamera(Math.hypot(this.player.position.x+.28,this.player.position.z-11.3));
   this.playRigClip(this.player,"Run",{fade:.18,speed:1.04});
   const p0=this.player.position.clone(),approach=new THREE.Vector3(-.28,0,11.30),p2=new THREE.Vector3(.18,0,10.85);
   const runDistance=Math.hypot(p0.x-approach.x,p0.z-approach.z);
   const runMs=THREE.MathUtils.clamp(280+runDistance*150,340,1050);
   const p1=new THREE.Vector3(THREE.MathUtils.lerp(p0.x,approach.x,.72),0,THREE.MathUtils.lerp(p0.z,approach.z,.72));
   await this.tween(runMs*.68,e=>{
     this.player.position.lerpVectors(p0,p1,e);this.player.rotation.x=-.035*Math.sin(e*Math.PI)
   });
   this.playRigClip(this.player,"Run",{fade:.08,speed:.58});
   await this.tween(Math.max(170,runMs*.32),e=>{
     this.player.position.lerpVectors(p1,p2,e);
     this.player.rotation.x=-.07*Math.sin(e*Math.PI);this.player.rotation.z=.08*Math.sin(e*Math.PI);
     this.player.rotation.y=Math.PI-.12*e
   });

   await this.cinematicShotCamera(sim);
   const baseDuration=THREE.MathUtils.clamp(520-(S.power-50)*2.6,330,520);
   const dramaticSave=sim.outcome==="save"&&(Math.abs(sim.ax)>1.55||sim.ay>1.52);
   const duration=this.v24Motions&&this.keeper?.userData?.isGLB?Math.round((dramaticSave?990:860)):dramaticSave?Math.round(baseDuration*1.65):baseDuration;
   const slowBadge=document.getElementById("slowMoBadge");
   if(slowBadge){slowBadge.classList.toggle("hidden",!dramaticSave);}
   const b0=this.ball.position.clone();
   kickAudio.play(S.power); // Exactly at the first ball-flight animation frame.

   // IMPORTANT: save trajectories terminate on a plane IN FRONT of the goal line.
   // The ball can never visually enter the goal and then be "pulled back" into the keeper.
   const flightEndZ = sim.outcome==="save" ? this.savePlaneZ : this.goalLineZ;
   const b1=new THREE.Vector3(sim.ax,sim.ay,flightEndZ);
   const cx=(b0.x+b1.x)/2+sim.curveX,cy=(b0.y+b1.y)/2+sim.curveY,cz=(b0.z+b1.z)/2-1.10;

   const keeperPromise=this.keeperDiveSequence(sim,duration);
   const ballPromise=this.tween(duration,(e,p)=>{
     const u=1-e;
     const z=u*u*b0.z+2*u*e*cz+e*e*b1.z;
     this.ball.position.set(
       u*u*b0.x+2*u*e*cx+e*e*b1.x,
       u*u*b0.y+2*u*e*cy+e*e*b1.y,
       sim.outcome==="save"?Math.max(this.savePlaneZ,z):z
     );
     this.ball.rotation.x+=.24;this.ball.rotation.y+=.17+Math.abs(sim.spinX)*.05
   });
   await Promise.all([keeperPromise,ballPromise]);
   // Trigger when the ball reaches its result/contact location, not on click.
   crowdAudio.play(sim.outcome);
   if(slowBadge)slowBadge.classList.add("hidden");

   if(sim.outcome==="save"){
     // Lock save position before any post-contact motion.
     this.ball.position.z=this.savePlaneZ;
     if(sim.saveType==="caught"){
       this.catchBallAtKeeper(sim);
       await new Promise(r=>setTimeout(r,260));
     }else{
       const q=this.ball.position.clone(),dx=(sim.ax>=0?1:-1)*(0.75+Math.random()*.35);
       await this.tween(280,e=>{
         this.ball.position.x=q.x+dx*e;
         this.ball.position.z=this.savePlaneZ+1.65*e; // rebound AWAY from goal
         this.ball.position.y=Math.max(.11,q.y-.60*e)
       })
     }
   }else if(sim.outcome==="goal"){
     // Only a true goal is allowed to cross behind z=0.
     await this.tween(170,e=>{this.ball.position.z=THREE.MathUtils.lerp(this.goalLineZ,-.90,e)});
   }else if(sim.outcome==="post"){
     const q=this.ball.position.clone(),dir=sim.ax>=0?1:-1;
     await this.tween(240,e=>{
       this.ball.position.x=q.x-dir*.95*e;
       this.ball.position.z=this.goalLineZ+1.35*e;
     });
   }else{
     const q=this.ball.position.clone();
     await this.tween(220,e=>{
       this.ball.position.z=this.goalLineZ+1.1*e;
       this.ball.position.x=q.x+(q.x>=0?.40:-.40)*e
     })
   }

   await this.keeperLandRecover(sim);
   await this.playReaction(sim.outcome);
   this.sideCamHoldUntil=performance.now()+700;
   await this.tween(320,e=>{
     this.player.position.lerpVectors(p2,new THREE.Vector3(.72,0,10.15),e);
     this.player.rotation.x=0;this.player.rotation.z=0;this.player.rotation.y=Math.PI-.20*e
   });
   await this.setCameraPose(new THREE.Vector3(0,2.45,14.8),new THREE.Vector3(0,1.1,3.6),220);
 }
 reset(){if(this.v27Active){this.v27Active=false;this.v27CatchInitial=null;this.v27CatchStart=0;this.playRigClip(this.keeper,"Idle",{fade:.18});}if(this.v26Active)this.v26Restore();if(this.v24Active)this.v24Reset();if(this.mixamoRig)this.v23Idle();this.endSideCam(true);this.releaseCaughtBall();this.stopKeeperIdle=false;this.setKeeperState("ready");this.player.position.set(S.playerPos.x,0,S.playerPos.z);this.player.rotation.set(0,Math.PI,0);if(this.player.userData.headPivot)this.player.userData.headPivot.rotation.set(0,0,0);this.player.scale.setScalar(1);this.player.armL.rotation.set(0,0,-.1);this.player.armR.rotation.set(0,0,.1);this.player.legL.rotation.set(0,0,0);this.player.legR.rotation.set(0,0,0);
 this.player.legL.userData.shin.rotation.set(0,0,0);this.player.legR.userData.shin.rotation.set(0,0,0);
 this.player.armL.userData.fore.rotation.set(0,0,0);this.player.armR.userData.fore.rotation.set(0,0,0);
 this.keeper.position.set(0,0,.35);this.keeper.rotation.set(0,0,0);this.keeper.armL.rotation.set(0,0,-.48);this.keeper.armR.rotation.set(0,0,.48);
 this.keeper.armL.userData.fore.rotation.set(0,0,0);this.keeper.armR.userData.fore.rotation.set(0,0,0);
 this.keeper.legL.rotation.set(0,0,0);this.keeper.legR.rotation.set(0,0,0);
 this.keeper.legL.userData.shin.rotation.set(0,0,0);this.keeper.legR.userData.shin.rotation.set(0,0,0);
 this.ball.position.set(0,.11,11);this.ball.rotation.set(0,0,0);if(this.targetMarker){this.scene.remove(this.targetMarker);this.targetMarker=null}this.playRigClip(this.player,"Idle",{fade:.18});this.playRigClip(this.keeper,"Idle",{fade:.18});this.updateCameraForPlayer(true);this.startIdle()}
}

function sideTeam(s){return s==="A"?S.A:S.B}function oppTeam(s){return s==="A"?S.B:S.A}function taken(s){return s==="A"?S.ta:S.tb}function goals(s){return s==="A"?S.a:S.b}function shooter(s){const t=sideTeam(s);return t.shooters[taken(s)%t.shooters.length]}
function syncPower(v){S.power=+v;$("#power").value=v;$("#powerMobile").value=v;$("#powerVal").textContent=v+"%";$("#powerMobileVal").textContent=v+"%"}function enableShoot(v){$("#shootBtn").disabled=!v;$("#shootMobile").disabled=!v}
function board(){const row=s=>{const t=sideTeam(s),own=S.shots.filter(x=>x.side===s),tk=taken(s),base=t.shooters.slice(0,5);return '<div class="score-row '+(S.side===s&&!S.finished?"active":"")+'"><div class="score-team">'+t.flag+" "+t.name+'<small>TW: '+t.keeper.name+'</small></div><div class="score-num">'+goals(s)+'</div><div class="kicks">'+base.map((p,i)=>{const sh=own[i],cl=sh?(sh.outcome==="goal"?"good":"bad"):(i===tk&&S.side===s?"now":"");return '<span class="kick '+cl+'"><b>'+p[0].split(" ").slice(-1)[0]+'</b>'+(sh?(sh.outcome==="goal"?"✓":"✕"):"·")+'</span>'}).join("")+own.slice(5).map(sh=>'<span class="kick '+(sh.outcome==="goal"?"good":"bad")+'"><b>'+sh.shooter.split(" ").slice(-1)[0]+'</b>'+(sh.outcome==="goal"?"✓":"✕")+"</span>").join("")+"</div></div>"};$("#scoreboard").innerHTML=row("A")+row("B")}
function ui(){const oc=$("#outcomeCallout");if(oc)oc.classList.add("hidden");S.playerPos={x:-1.2,z:12.2};board();const a=sideTeam(S.side),d=oppTeam(S.side),sh=shooter(S.side);$("#turnTitle").textContent=a.flag+" "+a.name+" am Punkt";$("#turnMeta").textContent=sh[0]+" gegen "+d.keeper.name;$("#shooter").textContent=sh[0];$("#shooterMeta").textContent=a.name+" · Stärke "+sh[1]+"/25";$("#keeper").textContent=d.keeper.name;$("#keeperMeta").textContent=d.keeper.club+" · Stärke "+d.keeper.strength+"/25";$("#pressure").textContent=S.sudden?"SUDDEN DEATH":taken(S.side)>=4?"MATCHBALL":"DRUCK";$("#commentary").textContent="Ziel setzen. Mit Alt+B kannst du zusätzlich festlegen, wo der Fuß den Ball trifft.";world.setTeams(a,d);world.applyHairForTurn(a,d,taken(S.side)%10);world.reset();applyStadiumAmbience();world.updatePositionReadout();enableShoot(false);S.target.set=false;$("#aim").textContent="— / —"}
function gauss(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function simulate(sh,kp){
  const pn=(S.power-45)/55,ss=sh[1],ks=kp.strength;
  const cp=contactPhysicsPreview(S.contact.x,S.contact.y),spinX=cp.sideSpin,spinY=cp.verticalSpin;
  const edgeRisk=Math.max(Math.abs(S.target.x)/3.55,S.target.y/2.36);
  const offCenter=Math.min(1,Math.hypot(S.contact.x,S.contact.y));
  const disp=.12-(ss-18)*.006+Math.max(0,pn-.58)*.14+edgeRisk*.05+offCenter*.045;
  let rawX=S.target.x+gauss()*disp+spinX*.22;
  let rawY=S.target.y+gauss()*disp*.72-spinY*.18;
  let out="goal";

  // Real miss/post risk: extreme power, edge aiming and off-centre contact all raise it.
  const risk=Math.max(0,(S.power-82)/18)*.075 + Math.max(0,edgeRisk-.78)*.24 + offCenter*.045;
  const roll=Math.random();
  if(Math.abs(rawX)>3.66||rawY<0||rawY>2.44){
    out="miss";
  }else if(roll<risk*.34){
    out="miss";
    rawX+=rawX>=0?.35:-.35;rawY+=gauss()*.12;
  }else{
    const nearFrame=Math.min(Math.abs(Math.abs(rawX)-3.66),Math.abs(rawY-2.44));
    const postChance=.035 + Math.max(0,.22-nearFrame)*.22 + risk*.28;
    if(Math.random()<postChance)out="post";
  }

  const reaction=.18+(ks-18)*.028;
  let kx=Math.random()<reaction?rawX:gauss()*1.35;
  let ky=.55+Math.random()*1.25;
  kx=THREE.MathUtils.clamp(kx,-3.15,3.15);
  ky=THREE.MathUtils.clamp(ky,.28,2.15);
  const dist=Math.hypot(rawX-kx,(rawY-ky)*1.15);
  const saveRadius=.62+(ks-18)*.045-(ss-18)*.032-pn*.10;
  const contactZ=.72;
  let saveType=null;

  if(out==="goal"&&dist<saveRadius){
    out="save";
    const close=dist<saveRadius*.42 && rawY>.42 && rawY<1.85;
    saveType=close?"caught":"deflect";
    rawX=kx+(rawX-kx)*.18;
    rawY=ky+(rawY-ky)*.18;
  }else if(out==="goal"&&Math.abs(rawX-kx)<.36){
    kx+=rawX>=0?-.72:.72;
  }
  let frameType=null;
  if(out==="post"){
    const topGap=Math.abs(rawY-2.44),sideGap=Math.abs(Math.abs(rawX)-3.66);
    frameType=topGap<=sideGap?"crossbar":"post";
  }
  return{outcome:out,frameType,ax:rawX,ay:rawY,kx,ky,contactZ,saveType,spinX,spinY,curveX:spinX*.75,curveY:spinY*.38}
}
function ended(){if(S.ta<5||S.tb<5){const ra=5-S.ta,rb=5-S.tb;return S.a>S.b+rb||S.b>S.a+ra}return S.ta===S.tb&&S.a!==S.b}
function showOutcomeCallout(outcome,frameType=null){
 const el=$("#outcomeCallout");if(!el)return;
 const map={
   goal:["TOR!","goal"],
   save:["GEHALTEN!","save"],
   post:[frameType==="crossbar"?"LATTE!":"PFOSTEN!","post"],
   miss:["DANEBEN!","miss"]
 };
 const [label,cls]=map[outcome]||["",""];
 el.className="outcome-callout "+cls;
 el.textContent=label;
 el.classList.remove("hidden");
 clearTimeout(showOutcomeCallout._t);
 showOutcomeCallout._t=setTimeout(()=>el.classList.add("hidden"),1500);
}
async function shootNow(){if(S.busy||S.finished||!S.target.set)return;S.busy=true;enableShoot(false);const side=S.side,a=sideTeam(side),d=oppTeam(side),sh=shooter(side),sim=simulate(sh,d.keeper);$("#commentary").textContent=sh[0]+" läuft an …";await world.shoot(sim);S.shots.push({side,team:a.name,shooter:sh[0],shooterId:sh[2]||null,keeper:d.keeper.name,keeperId:d.keeper.id||null,power:S.power,contactX:S.contact.x,contactY:S.contact.y,...sim});resetContactAfterShot();if(side==="A"){S.ta++;if(sim.outcome==="goal")S.a++}else{S.tb++;if(sim.outcome==="goal")S.b++}$("#commentary").textContent=sim.outcome==="goal"?"TOR!":sim.outcome==="save"?"GEHALTEN!":sim.outcome==="post"?(sim.frameType==="crossbar"?"LATTE!":"PFOSTEN!"):"DANEBEN!";showOutcomeCallout(sim.outcome,sim.frameType);board();await new Promise(r=>setTimeout(r,850));if(ended()){await finish();return}S.side=side==="A"?"B":"A";if(S.ta>=5&&S.tb>=5&&S.a===S.b)S.sudden=true;S.busy=false;ui()}
function bridgeResultPayload(win){
 return{protocol:"betinsight-penalty-v1",context_id:bridgeContext?.context_id||null,reason:bridgeContext?.reason||"direct",language:bridgeContext?.language||"de",stadium_id:S.stadiumId,winner_side:win,winner:win==="A"?S.A.name:S.B.name,team_a:S.A.name,team_b:S.B.name,penalties_a:S.a,penalties_b:S.b,shots:S.shots.map((x,i)=>({order:i+1,side:x.side,team:x.team,shooter:x.shooter,shooter_id:x.shooterId||null,keeper:x.keeper,keeper_id:x.keeperId||null,outcome:x.outcome,frame_type:x.frameType||null,power:x.power,contact_x:x.contactX,contact_y:x.contactY}))}
}
const SHOOTOUT_API="https://lszlaglwlixejzytrurg.supabase.co/functions/v1/time-clash-shootout";
const PENALTY_BUILD="20261013-v29-keeper-ik-audio";
async function persistBridgeResult(win){return {ok:false,skipped:true,error:"V29 IK- und Audiotest – keine produktive Speicherung"};}
function sendBridgeResult(win,storage=null){
 if(!BRIDGE_MODE||!bridgeParentOrigin||!window.parent||window.parent===window)return;
 window.parent.postMessage({type:"betinsight:penalty-result",payload:{...bridgeResultPayload(win),storage}},bridgeParentOrigin);
}
async function finish(){S.finished=true;const win=S.a>S.b?"A":"B";const storage=await persistBridgeResult(win);/* V23 preview: no bridge result is emitted */$("#game").classList.add("hidden");$("#result").classList.remove("hidden");const saveNote=BRIDGE_MODE?'<div style="margin:0 0 14px;padding:10px 12px;border-radius:10px;border:1px solid '+(storage.ok?'#2b8f70':'#a84c55')+';background:'+(storage.ok?'#073528':'#40151b')+';font-weight:900;text-align:center">'+(storage.ok?'✓ SUPABASE GESPEICHERT · SHOOTOUT-STATISTIK AKTUALISIERT':'⚠ NICHT DAUERHAFT GESPEICHERT · '+String(storage.error||'Fehler'))+' · V24 TESTMODUS</div>':'';$("#winner").innerHTML=saveNote+'<div class="winner-wrap"><div class="winner-team '+(win==="A"?"win":"lose")+'"><div>'+S.A.flag+'</div><h3>'+S.A.name+'</h3><strong>'+S.a+'</strong><br><span>'+(win==="A"?"SIEGER":"AUSGESCHIEDEN")+'</span></div><div class="vs">:</div><div class="winner-team '+(win==="B"?"win":"lose")+'"><div>'+S.B.flag+'</div><h3>'+S.B.name+'</h3><strong>'+S.b+'</strong><br><span>'+(win==="B"?"SIEGER":"AUSGESCHIEDEN")+'</span></div></div>';$("#log").innerHTML=S.shots.map((x,i)=>'<div class="log-row '+(x.outcome==="goal"?"good":"bad")+'"><span>'+(x.outcome==="goal"?"✓":"✕")+'</span><div><b>'+(i+1)+". "+x.shooter+'</b><small>'+x.team+" · "+x.power+'% · Kontakt '+(Math.round(x.contactX*100))+"/"+(Math.round(x.contactY*100))+'</small></div><b>'+(x.outcome==="goal"?"GETROFFEN":x.outcome==="save"?"GEHALTEN":x.outcome==="post"?"PFOSTEN":"DANEBEN")+"</b></div>").join("")}
function showRenderError(err){
 const box=$("#renderError"),txt=$("#renderErrorText");
 if(box){box.classList.remove("hidden");box.style.display="grid"}
 const msg=String(err&&err.message||err||"Unbekannter Fehler");
 if(txt)txt.textContent=msg==="WEBGL_NOT_AVAILABLE"
   ?"Dein Browser stellt hier aktuell kein WebGL bereit. Unter Linux liegt das meist an deaktivierter Hardwarebeschleunigung oder blockiertem WebGL – nicht an Linux selbst."
   :"3D-Fehler: "+msg;
 $("#commentary").textContent="3D konnte nicht initialisiert werden.";
}
function clearRenderError(){const box=$("#renderError");if(box){box.classList.add("hidden");box.style.display=""}}
function start(){kickAudio.prepare().then(()=>crowdAudio.prepare()).catch(err=>console.warn("V28 audio decode",err));S.A=T($("#teamA").value);S.B=T($("#teamB").value);S.stadiumId=selectedStadiumId;Object.assign(S,{side:"A",a:0,b:0,ta:0,tb:0,shots:[],power:78,busy:false,sudden:false,finished:false,playerPos:{x:-1.2,z:12.2}});S.target={x:0,y:1.2,set:false};S.contact={x:0,y:0};syncPower(78);$("#setup").classList.add("hidden");$("#result").classList.add("hidden");$("#game").classList.remove("hidden");applyStadiumAmbience();try{
   clearRenderError();
   if(!world)world=new World3D($("#stage"));
   if(v23Files.size)world.installV23FBX().catch(e=>{console.error(e);v23Status('FBX-Fehler: '+(e?.message||e),true)});
   applyStadiumAmbience();
   setTimeout(ui,120);
 }catch(err){
   console.error("Penalty Clash 3D init failed",err);
   showRenderError(err);
 }}
function bridgeColor(v,fallback){
 if(typeof v==="number"&&Number.isFinite(v))return v;
 let s=String(v||"").trim().replace("#","");
 return /^[0-9a-f]{6}$/i.test(s)?parseInt(s,16):fallback;
}
function bridgeTeam(src,id,fallbackFlag,fallbackShirt){
 const shooters=Array.isArray(src?.shooters)?src.shooters.map((p,i)=>[String(p?.name||p?.[0]||("Spieler "+(i+1))),Math.max(1,Math.min(25,Number(p?.strength||p?.[1]||12))),p?.id||p?.[2]||null]):[];
 const keeper=src?.keeper||{};
 return{id,name:String(src?.name||id),nation:String(src?.nation||src?.name||id),flag:String(src?.flag||fallbackFlag),shirt:bridgeColor(src?.shirt,fallbackShirt),shorts:bridgeColor(src?.shorts,0x17202b),keeperColor:bridgeColor(src?.keeperColor,0x2c8a54),keeper:{id:keeper.id||null,name:String(keeper.name||"Torwart"),club:String(keeper.club||src?.name||"TIME CLASH"),strength:Math.max(1,Math.min(25,Number(keeper.strength||12)))},shooters:shooters.length?shooters:[["Schütze 1",12,null],["Schütze 2",12,null],["Schütze 3",12,null],["Schütze 4",12,null],["Schütze 5",12,null]]}
}
function applyBridgePayload(payload){
 if(!payload||payload.protocol!=="betinsight-penalty-v1"||!payload.team_a||!payload.team_b)return false;
 bridgeContext=payload;
 TEAMS=[bridgeTeam(payload.team_a,"tc-a","⚽",0xf2f2f2),bridgeTeam(payload.team_b,"tc-b","⚽",0x244f9e)];
 selectedStadiumId=stadiumById(payload.stadium_id).id;
 fill();
 selectStadium(selectedStadiumId);
 const title=document.querySelector(".title span");if(title)title.textContent="TIME CLASH · SHOOTOUT · V24 TESTMODUS";
 const note=$("#moduleStatus");if(note){note.textContent="TIME-CLASH-KADER ÜBERNOMMEN · "+TEAMS[0].name+" vs. "+TEAMS[1].name;note.style.color="#63e6a3"}
 const back=$("#newMatch");if(back){back.textContent="← ZURÜCK ZU TIME CLASH";back.onclick=()=>window.parent.postMessage({type:"betinsight:penalty-close"},bridgeParentOrigin||"*")}
 start();
 return true;
}
function notifyBridgeReady(){
 if(!BRIDGE_MODE||!window.parent||window.parent===window)return;
 window.parent.postMessage({type:"betinsight:penalty-ready",version:"20261008-p6"},"*");
}
if(BRIDGE_MODE){
 document.documentElement.classList.add("penalty-bridge-mode");
 addEventListener("message",e=>{
   if(!TRUSTED_BRIDGE_ORIGINS.has(e.origin)||e.data?.type!=="betinsight:penalty-init")return;
   bridgeParentOrigin=e.origin;
   applyBridgePayload(e.data.payload);
 });
 setTimeout(notifyBridgeReady,0);setTimeout(notifyBridgeReady,500);setTimeout(notifyBridgeReady,1400);
}

for(const id of ["v23FbxFiles","v23FbxGameFiles"]){const el=document.getElementById(id);if(el)el.addEventListener("change",e=>v23ReceiveFiles(e.target.files));}
// Browser autoplay policy: in the Time-Clash iframe an actual pointer/keyboard
// gesture unlocks sound even if game setup was started by a postMessage event.
const v25UnlockAudio=()=>kickAudio.prepare().then(()=>crowdAudio.prepare()).catch(e=>console.warn("V28 audio unlock",e));
document.addEventListener("pointerdown",v25UnlockAudio,{once:true,capture:true});
document.addEventListener("keydown",v25UnlockAudio,{once:true,capture:true});
document.querySelectorAll("[data-v28-crowd-test]").forEach(btn=>btn.addEventListener("click",()=>{
  const type=btn.dataset.v28CrowdTest;
  crowdAudio.prepare().then(()=>crowdAudio.play(type)).catch(e=>console.warn("V28 crowd sound test",e));
}));
document.getElementById("v25SoundEnabled")?.addEventListener("change",e=>{
  kickAudio.enabled=e.target.checked;
  if(kickAudio.enabled)kickAudio.prepare().then(()=>crowdAudio.prepare()).catch(()=>{});
});
document.getElementById("v25SoundVolume")?.addEventListener("input",e=>{
  kickAudio.volume=Math.max(0,Math.min(1,Number(e.target.value)/100));
});
document.querySelectorAll("[data-v25-kick-test]").forEach(btn=>btn.addEventListener("click",()=>{
  const power=Number(btn.dataset.v25KickTest);
  kickAudio.prepare().then(()=>kickAudio.play(power)).catch(err=>console.warn(err));
}));
$("#startBtn").onclick=start;$("#shootBtn").onclick=shootNow;$("#shootMobile").onclick=shootNow;$("#power").oninput=e=>syncPower(e.target.value);$("#powerMobile").oninput=e=>syncPower(e.target.value);$("#rematch").onclick=start;if(!BRIDGE_MODE)$("#newMatch").onclick=()=>{$("#result").classList.add("hidden");$("#game").classList.add("hidden");$("#setup").classList.remove("hidden");renderStadiumGrid()};

function contactPhysicsPreview(x,y){
  const p=(S.power-45)/55;
  const sideSpin=x*(0.85+0.75*p);
  const verticalSpin=y*(0.70+0.60*p);
  const curveM=sideSpin*(0.42+0.18*p);
  const liftM=verticalSpin*(0.30+0.15*p);
  const offCenter=Math.min(1,Math.hypot(x,y));
  const quality=Math.max(58,Math.round(100-offCenter*28-Math.max(0,p-.72)*12));
  return{sideSpin,verticalSpin,curveM,liftM,quality}
}
function setContact(x,y){
 const l=Math.hypot(x,y);if(l>.92){x=x/l*.92;y=y/l*.92}
 contactDraft.x=x;contactDraft.y=y;
 $("#contactDot").style.left=((x+1)*50)+"%";$("#contactDot").style.top=((y+1)*50)+"%";
 $("#cx").textContent=Math.abs(x)<.12?"MITTE":x<0?"LINKS":"RECHTS";
 $("#cy").textContent=Math.abs(y)<.12?"MITTE":y<0?"OBEN":"UNTEN";
 const ph=contactPhysicsPreview(x,y);
 $("#spin").textContent=Math.round(Math.abs(ph.sideSpin)*100);
 $("#flight").textContent=(Math.abs(x)>.18?(x<0?"KURVE LINKS":"KURVE RECHTS"):"GERADE")+(y>.25?" + AUFTRIEB":y<-.25?" + DIP":"");
 $("#curve").textContent=(ph.curveM>=0?"+":"")+Math.round(ph.curveM*100)+" cm";
 $("#lift").textContent=(ph.liftM>=0?"+":"")+Math.round(ph.liftM*100)+" cm";
 $("#quality").textContent=ph.quality+"%";
}
function contactLabel(x,y){
 return (Math.abs(x)<.12&&Math.abs(y)<.12)?"MITTE":(x<-.12?"LINKS ":x>.12?"RECHTS ":"")+(y<-.12?"OBEN":y>.12?"UNTEN":"");
}
function resetContactAfterShot(){
 S.contact={x:0,y:0};
 contactDraft={x:0,y:0};
 const label=$("#contactLabel");if(label)label.textContent="MITTE";
 const modal=$("#contactModal");
 if(modal&&!modal.classList.contains("hidden"))setContact(0,0);
}
function openContact(){
 if(S.busy||S.finished)return;
 contactDraft={x:S.contact.x,y:S.contact.y};
 $("#contactModal").classList.remove("hidden");
 setContact(contactDraft.x,contactDraft.y);
}
function closeContact(){$("#contactModal").classList.add("hidden")}
function applyContact(){
 S.contact={x:contactDraft.x,y:contactDraft.y};
 $("#contactLabel").textContent=contactLabel(S.contact.x,S.contact.y);
 closeContact();
 $("#commentary").textContent="Ballkontakt übernommen: "+contactLabel(S.contact.x,S.contact.y)+". Gilt nur für diesen Schuss.";
}
function cancelContact(){
 contactDraft={x:S.contact.x,y:S.contact.y};
 closeContact();
}
$("#contactBtn").onclick=openContact;
$("#contactBtnMobile").onclick=openContact;
$("#closeContact").onclick=cancelContact;
$("#cancelContact").onclick=cancelContact;
$("#applyContact").onclick=applyContact;
$("#resetContact").onclick=()=>setContact(0,0);
$("#contactBall").onpointerdown=e=>{const r=e.currentTarget.getBoundingClientRect();setContact(((e.clientX-r.left)/r.width-.5)*2,((e.clientY-r.top)/r.height-.5)*2)};
addEventListener("keydown",e=>{
 if(e.altKey&&(e.key==="b"||e.key==="B")&&!["INPUT","SELECT","TEXTAREA"].includes(document.activeElement?.tagName)){e.preventDefault();openContact()}
 if(e.key==="Escape")cancelContact()
});
const MOVE_STEP=.25;
addEventListener("keydown",e=>{
 if(!world||S.busy||S.finished||["INPUT","SELECT","TEXTAREA"].includes(document.activeElement?.tagName))return;
 if(e.key==="ArrowLeft"){e.preventDefault();world.movePlayer(-MOVE_STEP,0)}
 if(e.key==="ArrowRight"){e.preventDefault();world.movePlayer(MOVE_STEP,0)}
 if(e.key==="ArrowUp"){e.preventDefault();world.movePlayer(0,-MOVE_STEP)}
 if(e.key==="ArrowDown"){e.preventDefault();world.movePlayer(0,MOVE_STEP)}
});
document.querySelectorAll("[data-move]").forEach(btn=>btn.addEventListener("pointerdown",e=>{
 e.preventDefault();if(!world||S.busy||S.finished)return;
 const d=btn.dataset.move;
 if(d==="left")world.movePlayer(-MOVE_STEP,0);
 if(d==="right")world.movePlayer(MOVE_STEP,0);
 if(d==="forward")world.movePlayer(0,-MOVE_STEP);
 if(d==="back")world.movePlayer(0,MOVE_STEP);
}));
fill();
const _ms=document.querySelector("#moduleStatus");if(_ms){_ms.textContent="3D-Modul bereit · 20 Stadien geladen";_ms.style.color="#63e6a3";}