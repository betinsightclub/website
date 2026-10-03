(()=>{"use strict";
const TEAMS=[
{id:"ger14",name:"Deutschland 2014",nation:"Deutschland",flag:"🇩🇪",color:0xf1f4f6,accent:0x15191f,keeper:{name:"Manuel Neuer",club:"FC Bayern München",strength:24},shooters:[["Thomas Müller",24],["Toni Kroos",23],["Bastian Schweinsteiger",23],["Mario Götze",22],["Miroslav Klose",22]]},
{id:"arg22",name:"Argentinien 2022",nation:"Argentinien",flag:"🇦🇷",color:0x79cfee,accent:0xffffff,keeper:{name:"Emiliano Martínez",club:"Aston Villa",strength:23},shooters:[["Lionel Messi",23],["Ángel Di María",20],["Lautaro Martínez",20],["Julián Álvarez",19],["Leandro Paredes",21]]},
{id:"ita06",name:"Italien 2006",nation:"Italien",flag:"🇮🇹",color:0x1558b0,accent:0xffffff,keeper:{name:"Gianluigi Buffon",club:"Juventus",strength:23},shooters:[["Francesco Totti",20],["Andrea Pirlo",20],["Alessandro Del Piero",22],["Daniele De Rossi",17],["Marco Materazzi",19]]},
{id:"esp10",name:"Spanien 2010",nation:"Spanien",flag:"🇪🇸",color:0xc61f2d,accent:0xf2c845,keeper:{name:"Iker Casillas",club:"Real Madrid",strength:23},shooters:[["David Villa",22],["Xavi",23],["Andrés Iniesta",23],["Xabi Alonso",21],["Fernando Torres",21]]},
{id:"fra98",name:"Frankreich 1998",nation:"Frankreich",flag:"🇫🇷",color:0x164fa3,accent:0xffffff,keeper:{name:"Fabien Barthez",club:"AS Monaco",strength:21},shooters:[["Zinédine Zidane",24],["Thierry Henry",21],["David Trezeguet",20],["Youri Djorkaeff",20],["Emmanuel Petit",20]]},
{id:"bra94",name:"Brasilien 1994",nation:"Brasilien",flag:"🇧🇷",color:0xf4d92d,accent:0x1c6e3c,keeper:{name:"Cláudio Taffarel",club:"Reggiana",strength:17},shooters:[["Romário",22],["Bebeto",19],["Dunga",21],["Raí",20],["Branco",21]]},
{id:"por04",name:"Portugal 2004",nation:"Portugal",flag:"🇵🇹",color:0xb32335,accent:0x1e6f45,keeper:{name:"Ricardo",club:"Sporting CP",strength:20},shooters:[["Luís Figo",22],["Cristiano Ronaldo",22],["Rui Costa",19],["Deco",21],["Nuno Gomes",18]]},
{id:"ned98",name:"Niederlande 1998",nation:"Niederlande",flag:"🇳🇱",color:0xef6c25,accent:0x15191f,keeper:{name:"Edwin van der Sar",club:"Ajax",strength:21},shooters:[["Dennis Bergkamp",21],["Patrick Kluivert",20],["Marc Overmars",20],["Ronald de Boer",21],["Clarence Seedorf",22]]}
];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let audioOn=true,actx=null,ambGain=null,ambSrc=null,tensionNodes=[];
const S={A:null,B:null,side:"A",a:0,b:0,ta:0,tb:0,shots:[],target:{x:.5,y:.5,set:false},power:78,busy:false,sudden:false,finished:false};
let game=null,scene=null;

function syncPowerUI(v){
  const n=Math.max(45,Math.min(100,Number(v)||78));S.power=n;
  ["#power","#mobilePower"].forEach(sel=>{const el=$(sel);if(el)el.value=n});
  ["#powerValue","#mobilePowerValue"].forEach(sel=>{const el=$(sel);if(el)el.textContent=n+"%"});
}
function setShootEnabled(on){
  ["#shootBtn","#mobileShootBtn"].forEach(sel=>{const el=$(sel);if(el)el.disabled=!on});
}
function focusGame(){
  if(window.innerWidth<=860){
    const el=$("#phaserMount"); if(el) setTimeout(()=>el.scrollIntoView({behavior:"smooth",block:"center"}),180);
  }
}
function fillSelectors(){for(const id of ["teamA","teamB"]){const el=$("#"+id);el.innerHTML=TEAMS.map(t=>'<option value="'+t.id+'">'+t.flag+' '+t.name+'</option>').join("")}$("#teamA").value="ger14";$("#teamB").value="arg22";renderPreview()}
function T(id){return TEAMS.find(t=>t.id===id)}
function renderPreview(){const a=T($("#teamA").value),b=T($("#teamB").value);$("#preview").innerHTML=[a,b].map(t=>'<div class="preview-team"><strong>'+t.flag+' '+t.name+'</strong><small>Torwart: '+t.keeper.name+' · '+t.keeper.club+'</small><div class="players">'+t.shooters.map((x,i)=>(i+1)+'. '+x[0]).join('<br>')+'</div></div>').join("")}
$("#teamA").onchange=()=>{if($("#teamA").value===$("#teamB").value)$("#teamB").value=TEAMS.find(t=>t.id!==$("#teamA").value).id;renderPreview()};
$("#teamB").onchange=()=>{if($("#teamA").value===$("#teamB").value)$("#teamA").value=TEAMS.find(t=>t.id!==$("#teamB").value).id;renderPreview()};

function audio(){if(!audioOn)return null;try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==="suspended")actx.resume();return actx}catch(e){return null}}
function noiseBuffer(sec,soft=false){
 const a=audio();if(!a)return null;const n=Math.max(1,Math.floor(a.sampleRate*sec)),b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);
 let last=0;for(let i=0;i<n;i++){const white=Math.random()*2-1;last=soft?(last*.94+white*.06):white;d[i]=last}return b
}
function ambience(){
 const a=audio();if(!a||ambSrc)return;
 const src=a.createBufferSource(),low=a.createBiquadFilter(),mid=a.createBiquadFilter(),g=a.createGain();
 src.buffer=noiseBuffer(4,true);src.loop=true;low.type="lowpass";low.frequency.value=2200;mid.type="bandpass";mid.frequency.value=720;mid.Q.value=.35;g.gain.value=.013;
 src.connect(low);low.connect(mid);mid.connect(g);g.connect(a.destination);src.start();ambSrc=src;ambGain=g
}
function stopTension(){
 tensionNodes.forEach(n=>{try{n.stop?.()}catch(e){}try{n.disconnect?.()}catch(e){}});tensionNodes=[];
 if(ambGain&&actx)ambGain.gain.setTargetAtTime(.013,actx.currentTime,.12)
}
function tension(){
 const a=audio();if(!a)return;stopTension();if(ambGain)ambGain.gain.setTargetAtTime(.004,a.currentTime,.08);
 const o=a.createOscillator(),g=a.createGain(),f=a.createBiquadFilter();o.type="sine";o.frequency.value=58;f.type="lowpass";f.frequency.value=150;g.gain.value=.0001;
 o.connect(f);f.connect(g);g.connect(a.destination);g.gain.exponentialRampToValueAtTime(.024,a.currentTime+.35);o.start();tensionNodes.push(o,g)
}
function transientNoise(sec=.08,gain=.05,cutoff=1800){
 const a=audio();if(!a)return;const src=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain(),t=a.currentTime;
 src.buffer=noiseBuffer(sec);f.type="lowpass";f.frequency.value=cutoff;g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.001,t+sec);
 src.connect(f);f.connect(g);g.connect(a.destination);src.start()
}
function kickSound(){
 const a=audio();if(!a)return;transientNoise(.055,.045,1200);
 const o=a.createOscillator(),g=a.createGain(),t=a.currentTime;o.type="sine";o.frequency.setValueAtTime(92,t);o.frequency.exponentialRampToValueAtTime(48,t+.11);g.gain.setValueAtTime(.065,t);g.gain.exponentialRampToValueAtTime(.001,t+.13);o.connect(g);g.connect(a.destination);o.start();o.stop(t+.14)
}
function crowdBurst(kind){
 const a=audio();if(!a)return;
 const dur=kind==="goal"?1.35:.82,src=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain(),t=a.currentTime;
 src.buffer=noiseBuffer(dur,true);f.type="bandpass";f.frequency.setValueAtTime(kind==="goal"?980:520,t);f.Q.value=.42;
 if(kind==="goal")f.frequency.linearRampToValueAtTime(1450,t+.55);else f.frequency.linearRampToValueAtTime(360,t+.6);
 g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(kind==="goal"?.085:.045,t+.12);g.gain.exponentialRampToValueAtTime(.001,t+dur);
 src.connect(f);f.connect(g);g.connect(a.destination);src.start();
 if(kind==="goal"){transientNoise(.28,.035,3600);netSound()}
}
function netSound(){transientNoise(.18,.025,4200)}
function saveSound(){transientNoise(.08,.06,1500)}
function postSound(){
 const a=audio();if(!a)return;const o=a.createOscillator(),g=a.createGain(),t=a.currentTime;o.type="sine";o.frequency.setValueAtTime(1180,t);o.frequency.exponentialRampToValueAtTime(760,t+.24);g.gain.setValueAtTime(.055,t);g.gain.exponentialRampToValueAtTime(.001,t+.28);o.connect(g);g.connect(a.destination);o.start();o.stop(t+.29)
}
$("#soundBtn").onclick=()=>{audioOn=!audioOn;$("#soundBtn").textContent=audioOn?"🔊 Stadion":"🔇 Stumm";if(audioOn)ambience();else{stopTension();try{ambSrc?.stop()}catch(e){}ambSrc=null}};

class ShootoutScene extends Phaser.Scene{
 constructor(){super("shootout")}
 create(){
   scene=this;const w=this.scale.width,h=this.scale.height;
   this.cameras.main.setBackgroundColor("#020914");
   this.drawArena(w,h);
   this.goal={x:w*.18,y:h*.17,w:w*.64,h:h*.43};
   this.drawGoal();
   this.keeperGroup=this.add.container(w/2,h*.565).setDepth(11);this.drawKeeper(this.keeperGroup);
   this.playerGroup=this.add.container(w*.255,h*.865).setDepth(14);this.drawPlayer(this.playerGroup);
   this.playerName=this.add.text(w*.255,h*.925,"",{fontFamily:"Arial",fontSize:15,color:"#f5fbff",backgroundColor:"#03101ccc",padding:{x:7,y:3}}).setOrigin(.5).setDepth(18);
   this.keeperName=this.add.text(w/2,h*.605,"",{fontFamily:"Arial",fontSize:14,color:"#f5fbff",backgroundColor:"#03101ccc",padding:{x:7,y:3}}).setOrigin(.5).setDepth(18);
   this.ball=this.add.image(w*.365,h*.845,"ball").setDisplaySize(44,44).setDepth(16).setAngle(-8);
   this.ballShadow=this.add.ellipse(w*.365,h*.875,58,15,0x000000,.34).setDepth(13);
   this.target=this.add.container(0,0).setDepth(21).setVisible(false);this.drawTarget();
   this.resultText=this.add.text(w/2,h*.105,"",{fontFamily:"Arial Black,Arial",fontSize:58,color:"#ffffff",stroke:"#06101a",strokeThickness:11}).setOrigin(.5).setDepth(40).setAlpha(0);
   this.turnText=this.add.text(w/2,h*.69,"",{fontFamily:"Arial Black,Arial",fontSize:25,color:"#e9f8ff",stroke:"#03101a",strokeThickness:7,align:"center"}).setOrigin(.5).setDepth(30).setAlpha(0);
   this.input.on("pointermove",p=>{
     if(S.busy||S.finished)return;
     if(p.x<this.goal.x||p.x>this.goal.x+this.goal.w||p.y<this.goal.y||p.y>this.goal.y+this.goal.h)return;
     if(!S.target.set)this.target.setPosition(p.x,p.y).setVisible(true).setAlpha(.42);
   });
   this.input.on("pointerout",()=>{if(!S.target.set)this.target.setVisible(false)});
   this.input.on("pointerdown",p=>{
     if(S.busy||S.finished)return;
     if(p.x<this.goal.x||p.x>this.goal.x+this.goal.w||p.y<this.goal.y||p.y>this.goal.y+this.goal.h)return;
     S.target.x=(p.x-this.goal.x)/this.goal.w;S.target.y=(p.y-this.goal.y)/this.goal.h;S.target.set=true;
     this.target.setPosition(p.x,p.y).setVisible(true).setAlpha(1);
     $("#aimValue").textContent=Math.round(S.target.x*100)+" / "+Math.round((1-S.target.y)*100);
     setShootEnabled(true);$("#commentary").textContent="Ziel gesetzt. Jetzt Power wählen und SCHIESSEN drücken.";tension()
   });
 }
 drawArena(w,h){
   const g=this.add.graphics().setDepth(0);
   g.fillGradientStyle(0x06111f,0x06111f,0x0a263b,0x0a263b,1);g.fillRect(0,0,w,h);
   // Stadium roof + floodlight glow
   g.fillStyle(0x0b2234,.95);g.fillRect(0,h*.03,w,h*.20);
   g.fillStyle(0x112f45,.9);g.fillTriangle(0,h*.25,w*.18,h*.10,w*.34,h*.25);g.fillTriangle(w,h*.25,w*.82,h*.10,w*.66,h*.25);
   for(let i=0;i<7;i++){const x=w*(.20+i*.10);g.fillStyle(0xe8fbff,.78);g.fillCircle(x,h*.095,6);g.fillStyle(0x6bdcff,.10);g.fillCircle(x,h*.095,34)}
   // Crowd tiers
   g.fillStyle(0x0d2638,1);g.fillRect(0,h*.20,w,h*.28);
   g.fillStyle(0x18364a,.9);g.fillRect(0,h*.29,w,h*.03);g.fillRect(0,h*.405,w,h*.025);
   for(let y=h*.225;y<h*.46;y+=13){for(let x=8+(y%26);x<w;x+=18){const colors=[0xe7eef5,0x76b7df,0xf0c85f,0xb54855];g.fillStyle(colors[Math.floor((x+y)/10)%colors.length],.45);g.fillCircle(x,y,2.2)}}
   // Pitch with mowing bands and perspective lines
   g.fillStyle(0x0b713d,1);g.fillRect(0,h*.47,w,h*.53);
   for(let i=0;i<10;i++){g.fillStyle(i%2?0x0a6738:0x0c7741,.42);g.fillRect(i*w/10,h*.47,w/10,h*.53)}
   g.lineStyle(2,0xffffff,.19);g.lineBetween(w*.08,h,w*.34,h*.47);g.lineBetween(w*.92,h,w*.66,h*.47);
   g.strokeEllipse(w/2,h*.84,w*.42,h*.22);g.lineBetween(0,h*.735,w,h*.735);
   // Perspective shadow behind player
   this.add.ellipse(w*.42,h*.89,w*.38,h*.075,0x000000,.28).setDepth(2);
 }
 drawGoal(){
   const g=this.add.graphics().setDepth(8),x=this.goal.x,y=this.goal.y,w=this.goal.w,h=this.goal.h;
   // depth frame
   g.lineStyle(4,0xaebfca,.55);g.lineBetween(x+14,y+13,x+w-14,y+13);g.lineBetween(x+14,y+13,x+3,y+h+19);g.lineBetween(x+w-14,y+13,x+w-3,y+h+19);g.lineBetween(x+3,y+h+19,x+w-3,y+h+19);
   // net - fine "millimeter paper"
   g.lineStyle(1,0x8fdff7,.15);
   for(let i=1;i<50;i++)g.lineBetween(x+w*i/50,y,x+w*i/50,y+h);
   for(let i=1;i<25;i++)g.lineBetween(x,y+h*i/25,x+w,y+h*i/25);
   g.lineStyle(1,0xe3f7ff,.24);for(let i=5;i<50;i+=5)g.lineBetween(x+w*i/50,y,x+w*i/50,y+h);for(let i=5;i<25;i+=5)g.lineBetween(x,y+h*i/25,x+w,y+h*i/25);
   g.lineStyle(8,0xf7fbff,1);g.strokeRect(x,y,w,h);
   g.lineStyle(2,0x7ce7ff,.35);g.strokeRect(x+5,y+5,w-10,h-10);
 }
 drawTarget(){const g=this.add.graphics();this.target.add(g);g.lineStyle(2,0x63e5ff,1);g.strokeCircle(0,0,18);g.lineBetween(-27,0,27,0);g.lineBetween(0,-27,0,27);g.strokeCircle(0,0,5);g.fillStyle(0x63e5ff,.9);g.fillCircle(0,0,2.5)}
 drawKeeper(c){
   this.keeperSprite=this.add.image(0,0,"keeper-ger14").setOrigin(.5,.83).setDisplaySize(154,194).setVisible(true).setAlpha(1);c.add(this.keeperSprite);
   this.keeperFace=this.add.image(0,-78,"creator-face-2").setDisplaySize(39,39).setDepth(4);c.add(this.keeperFace)
 }
 drawPlayer(c){
   this.playerSprite=this.add.image(0,0,"player-ger14").setOrigin(.5,.92).setDisplaySize(122,217).setVisible(true).setAlpha(1);c.add(this.playerSprite);
   this.playerFace=this.add.image(0,-121,"creator-face-1").setDisplaySize(37,37).setDepth(4);c.add(this.playerFace)
 }
 setColors(att,def){
   if(this.playerSprite)this.playerSprite.setTexture("player-"+att.id).setDisplaySize(122,217);
   if(this.keeperSprite)this.keeperSprite.setTexture("keeper-"+def.id).setDisplaySize(154,194);
   const pidx=(TEAMS.findIndex(t=>t.id===att.id)%6)+1,kidx=((TEAMS.findIndex(t=>t.id===def.id)+2)%6)+1;
   if(this.playerFace)this.playerFace.setTexture("creator-face-"+pidx).setDisplaySize(37,37);
   if(this.keeperFace)this.keeperFace.setTexture("creator-face-"+kidx).setDisplaySize(39,39)
 }
 setActorLabels(shooter,keeper){
   this.playerName?.setText(shooter||"");this.keeperName?.setText(keeper||"")
 }
 stopIdleMotion(){
   if(this.idleTimer){this.idleTimer.remove(false);this.idleTimer=null}
   if(this.idleTweens){this.idleTweens.forEach(t=>{try{t.stop()}catch(e){}});this.idleTweens=[]}
 }
 depthScale(y,minY,maxY,minS=.82,maxS=1.06){
   const p=Phaser.Math.Clamp((y-minY)/(maxY-minY),0,1);return Phaser.Math.Linear(minS,maxS,p)
 }
 startIdleMotion(){
   this.stopIdleMotion();const w=this.scale.width,h=this.scale.height;this.idleTweens=[];
   const move=()=>{
     if(S.busy||S.finished)return;
     // Shooter: left/right and forward/back in perspective, never colliding with ball.
     const px=Phaser.Math.Between(Math.round(w*.20),Math.round(w*.31));
     const py=Phaser.Math.Between(Math.round(h*.79),Math.round(h*.885));
     const ps=this.depthScale(py,h*.76,h*.90,.86,1.05);
     const pt=this.tweens.add({targets:this.playerGroup,x:px,y:py,scale:ps,duration:Phaser.Math.Between(700,1100),ease:"Sine.easeInOut"});
     // Keeper: shuffles along line and slightly changes depth/body readiness.
     const kx=Phaser.Math.Between(Math.round(w*.43),Math.round(w*.57));
     const ky=Phaser.Math.Between(Math.round(h*.54),Math.round(h*.575));
     const kt=this.tweens.add({targets:this.keeperGroup,x:kx,y:ky,scaleX:Phaser.Math.FloatBetween(.96,1.04),scaleY:Phaser.Math.FloatBetween(.96,1.03),duration:Phaser.Math.Between(520,820),ease:"Sine.easeInOut"});
     if(this.playerName)this.tweens.add({targets:this.playerName,x:px,y:py+h*.065,duration:pt.duration,ease:"Sine.easeInOut"});
     if(this.keeperName)this.tweens.add({targets:this.keeperName,x:kx,y:ky+h*.04,duration:kt.duration,ease:"Sine.easeInOut"});
     this.idleTweens=[pt,kt]
   };
   move();this.idleTimer=this.time.addEvent({delay:1100,loop:true,callback:move})
 }
 async runUp3D(){
   this.stopIdleMotion();const w=this.scale.width,h=this.scale.height;
   const bx=w*.365,by=h*.845;
   const sx=this.playerGroup.x,sy=this.playerGroup.y;
   // Three-stage curved run-up gives depth: approach diagonally, close on ball, follow through beyond ball.
   await tween(this,this.playerGroup,{x:Phaser.Math.Linear(sx,bx,.48),y:Phaser.Math.Linear(sy,by,.52),scale:this.depthScale(Phaser.Math.Linear(sy,by,.52),h*.76,h*.90,.86,1.05),duration:230,ease:"Sine.easeIn"});
   if(this.playerSprite)this.playerSprite.setRotation(-.08);
   await tween(this,this.playerGroup,{x:bx-18,y:by-8,scale:this.depthScale(by-8,h*.76,h*.90,.86,1.05),duration:230,ease:"Cubic.easeIn"});
   return {bx,by}
 }
 async followThrough3D(){
   const w=this.scale.width,h=this.scale.height;
   await tween(this,this.playerGroup,{x:w*.405,y:h*.805,scale:.91,rotation:.045,duration:330,ease:"Quad.easeOut"});
 }
 showLineReplay(sim){
   const w=this.scale.width,h=this.scale.height;
   if(this.replayLayer)this.replayLayer.destroy(true);
   const layer=this.add.container(w*.77,h*.74).setDepth(55).setAlpha(0);this.replayLayer=layer;
   const bg=this.add.graphics();bg.fillStyle(0x03101b,.93);bg.fillRoundedRect(-122,-72,244,144,14);bg.lineStyle(2,0x5adff7,.75);bg.strokeRoundedRect(-122,-72,244,144,14);
   bg.lineStyle(3,0xf4f7fa,.9);bg.lineBetween(12,-49,12,48); // goal line
   bg.lineStyle(3,0x9eb8c8,.75);bg.lineBetween(12,-49,74,-38);bg.lineBetween(74,-38,74,48);bg.lineBetween(12,48,74,48);
   layer.add(bg);
   const lab=this.add.text(-104,-59,"SEITENKAMERA",{fontFamily:"Arial Black,Arial",fontSize:13,color:"#65e6ff"});layer.add(lab);
   const lineLab=this.add.text(18,30,"TORLINIE",{fontFamily:"Arial",fontSize:10,color:"#d8e7ef"});layer.add(lineLab);
   const keeper=this.add.graphics();keeper.fillStyle(0xe8bc39);keeper.fillRoundedRect(-24,-14,18,46,6);keeper.fillStyle(0xdfaf8a);keeper.fillCircle(-15,-22,8);layer.add(keeper);
   const ball=this.add.graphics();ball.fillStyle(0xf7fafb);ball.fillCircle(sim.outcome==="goal"?43:-2,-8,7);ball.lineStyle(1,0x152230,1);ball.strokeCircle(sim.outcome==="goal"?43:-2,-8,7);layer.add(ball);
   const txt=this.add.text(-104,45,sim.outcome==="goal"?"BALL HINTER DER LINIE":"BALL VOR DER LINIE",{fontFamily:"Arial Black,Arial",fontSize:12,color:sim.outcome==="goal"?"#45ef9b":"#ff7084"});layer.add(txt);
   this.tweens.add({targets:layer,alpha:1,duration:140});
   this.time.delayedCall(850,()=>this.tweens.add({targets:layer,alpha:0,duration:220,onComplete:()=>{layer.destroy(true);if(this.replayLayer===layer)this.replayLayer=null}}));
 } 
 resetActors(){const w=this.scale.width,h=this.scale.height;if(this.replayLayer){this.replayLayer.destroy(true);this.replayLayer=null;}
   this.playerGroup.setPosition(w*.255,h*.865).setRotation(0).setScale(1);if(this.playerSprite)this.playerSprite.setRotation(0).setScale(1);if(this.playerFace)this.playerFace.setRotation(0).setScale(1);if(this.playerName)this.playerName.setPosition(w*.255,h*.925).setAlpha(1);
   if(false&&this.playerParts){this.playerParts.armL.setRotation(.08);this.playerParts.armR.setRotation(-.10);this.playerParts.legL.setRotation(0);this.playerParts.legR.setRotation(0)}
   this.keeperGroup.setPosition(w/2,h*.565).setRotation(0).setScale(1);if(this.keeperSprite)this.keeperSprite.setRotation(0).setScale(1);if(this.keeperFace)this.keeperFace.setRotation(0).setScale(1);if(this.keeperName)this.keeperName.setPosition(w/2,h*.605).setAlpha(1);
   if(false&&this.keeperParts){this.keeperParts.armL.setRotation(-.12);this.keeperParts.armR.setRotation(.12);this.keeperParts.legL.setRotation(.04);this.keeperParts.legR.setRotation(-.04)}
   this.ball.setPosition(w*.365,h*.845).setDisplaySize(44,44).setAngle(-8).setVisible(true);
   if(this.ballShadow)this.ballShadow.setPosition(w*.365,h*.875).setVisible(true);
 }
 async animate(sim,att,def){
   const w=this.scale.width,h=this.scale.height;this.setColors(att,def);this.target.setVisible(false);this.resultText.setAlpha(0);
   this.turnText.setText("ANLAUF").setAlpha(1).setScale(.9);this.tweens.add({targets:this.turnText,alpha:.15,duration:460});
   this.tweens.add({targets:this.keeperGroup,scaleX:1.04,scaleY:.96,yoyo:true,repeat:2,duration:120});
   if(false&&this.playerParts){
     this.tweens.add({targets:this.playerParts.armL,rotation:-.45,yoyo:true,repeat:2,duration:135});
     this.tweens.add({targets:this.playerParts.armR,rotation:.48,yoyo:true,repeat:2,duration:135});
     this.tweens.add({targets:this.playerParts.legL,rotation:.34,yoyo:true,repeat:2,duration:135});
     this.tweens.add({targets:this.playerParts.legR,rotation:-.42,yoyo:true,repeat:2,duration:135});
   }
   this.tweens.add({targets:this.playerSprite,rotation:-.06,yoyo:true,repeat:1,duration:150});
   await this.runUp3D();
   this.playerGroup.setRotation(-.035);if(this.playerSprite)this.playerSprite.setRotation(.15);if(this.playerFace)this.playerFace.setRotation(.05);if(this.playerName)this.playerName.setAlpha(0);kickSound();if(this.ballShadow)this.ballShadow.setVisible(false);
   this.followThrough3D();

   const kx=this.goal.x+this.goal.w*sim.kx,ky=this.goal.y+this.goal.h*sim.ky;
   await sleep(45);
   this.tweens.add({targets:this.keeperGroup,y:this.keeperGroup.y+7,scaleY:.94,duration:75,yoyo:true,ease:"Quad.easeInOut"});
   this.tweens.add({targets:this.keeperGroup,x:kx,y:ky+62,rotation:(sim.kx<.5?-1:1)*.58,scaleX:1.12,scaleY:.94,duration:430,ease:"Cubic.easeOut"});if(this.keeperName)this.keeperName.setAlpha(0);
   if(false&&this.keeperParts){const dir=sim.kx<.5?-1:1;this.tweens.add({targets:this.keeperParts.armL,rotation:dir<0?-1.05:-.45,duration:260});this.tweens.add({targets:this.keeperParts.armR,rotation:dir>0?1.05:.45,duration:260});this.tweens.add({targets:this.keeperParts.legL,rotation:dir<0?.45:.15,duration:320});this.tweens.add({targets:this.keeperParts.legR,rotation:dir>0?-.45:-.15,duration:320})}

   const bx=this.goal.x+this.goal.w*sim.ax,by=this.goal.y+this.goal.h*sim.ay;

   if(sim.outcome==="save"){
     // Ball visibly meets the keeper BEFORE the goal line, then rebounds toward the field.
     this.ball.setDepth(18);
     await tween(this,this.ball,{x:bx,y:by,displayWidth:24,displayHeight:24,angle:680,duration:360+(100-S.power)*2,ease:"Cubic.easeOut"});
     this.cameras.main.shake(90,.005);saveSound();
     const reboundX=bx+(bx<w/2?-72:72),reboundY=Math.min(h*.77,by+92);
     await tween(this,this.ball,{x:reboundX,y:reboundY,displayWidth:31,displayHeight:31,angle:920,duration:260,ease:"Quad.easeOut"});
   }else if(sim.outcome==="post"){
     this.ball.setDepth(18);
     await tween(this,this.ball,{x:bx,y:by,displayWidth:21,displayHeight:21,angle:900,duration:390+(100-S.power)*2,ease:"Cubic.easeOut"});
     postSound();this.cameras.main.shake(120,.004);
     const reboundX=bx+(sim.ax<.5?88:-88),reboundY=Math.min(h*.73,by+70);
     await tween(this,this.ball,{x:reboundX,y:reboundY,displayWidth:29,displayHeight:29,angle:1160,duration:280,ease:"Quad.easeOut"});
   }else if(sim.outcome==="miss"){
     this.ball.setDepth(18);
     await tween(this,this.ball,{x:bx,y:by,displayWidth:20,displayHeight:20,angle:1080,duration:410+(100-S.power)*2,ease:"Cubic.easeOut"});
   }else{
     // GOAL: cross the line, then move behind keeper and into the net.
     this.ball.setDepth(18);
     await tween(this,this.ball,{x:bx,y:by,displayWidth:21,displayHeight:21,angle:980,duration:390+(100-S.power)*2,ease:"Cubic.easeOut"});
     this.ball.setDepth(7); // visually behind keeper / goal frame
     await tween(this,this.ball,{x:bx+(sim.ax<.5?-8:8),y:by+13,displayWidth:16,displayHeight:16,angle:1130,duration:125,ease:"Quad.easeOut"});
   }

   this.showResult(sim.outcome);
   if(sim.outcome==="goal")crowdBurst("goal");else if(sim.outcome!=="post")crowdBurst("miss");
   this.cameras.main.shake(sim.outcome==="save"?190:120,sim.outcome==="save"?.006:.003);

   if(sim.outcome==="goal"||sim.outcome==="save")this.showLineReplay(sim);
   await sleep(1250);this.turnText.setAlpha(0);this.ball.setDepth(16);this.resetActors()
 }
 showResult(out){const map={goal:["TOR!","#45ef9b"],save:["PARADE!","#ff7084"],post:["PFOSTEN!","#f7d678"],miss:["DANEBEN!","#ff9477"]},m=map[out];this.resultText.setText(m[0]).setColor(m[1]).setScale(.65).setAlpha(1);this.tweens.add({targets:this.resultText,scale:1,duration:180,ease:"Back.easeOut"});this.time.delayedCall(700,()=>this.tweens.add({targets:this.resultText,alpha:0,duration:180}))}
}
function tween(sc,target,props){return new Promise(res=>sc.tweens.add({targets:target,...props,onComplete:res}))}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function makeBallTexture(sc){const g=sc.make.graphics({x:0,y:0,add:false});g.fillStyle(0xf8fafb);g.fillCircle(64,64,60);g.lineStyle(3,0x172331,.85);g.strokeCircle(64,64,59);g.fillStyle(0x202a36);const pts=[[64,42],[43,58],[51,84],[77,84],[85,58]];g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fillPath();g.lineStyle(3,0x5b6672,.65);[[64,42,64,8],[43,58,11,48],[51,84,29,111],[77,84,100,111],[85,58,117,48]].forEach(a=>g.lineBetween(...a));g.generateTexture("ball",128,128);g.destroy()}
function bootPhaser(){game=new Phaser.Game({type:Phaser.AUTO,parent:"phaserMount",width:960,height:540,transparent:false,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:{
 preload(){
   TEAMS.forEach(t=>{this.load.svg("player-"+t.id,"/play/v6/assets/player-"+t.id+".svg",{width:180,height:320});this.load.svg("keeper-"+t.id,"/play/v6/assets/keeper-"+t.id+".svg",{width:240,height:300})});
   for(let i=1;i<=6;i++)this.load.image("creator-face-"+i,"https://raw.githubusercontent.com/betinsightclub/profil/main/time-clash/assets/faces/real0"+i+".webp")
 },
 create(){makeBallTexture(this);this.scene.start("shootout")}
}});game.scene.add("shootout",ShootoutScene,false)}
function sideTeam(s){return s==="A"?S.A:S.B}function oppTeam(s){return s==="A"?S.B:S.A}function taken(s){return s==="A"?S.ta:S.tb}function goals(s){return s==="A"?S.a:S.b}
function shooter(s){const t=sideTeam(s),i=taken(s)%t.shooters.length;return t.shooters[i]}
function board(){const row=s=>{const t=sideTeam(s),own=S.shots.filter(x=>x.side===s),tk=taken(s),g=goals(s),chips=t.shooters.map((p,i)=>{const sh=own[i],cl=sh?(sh.outcome==="goal"?"good":"bad"):(S.side===s&&i===tk&&!S.sudden&&!S.finished?"now":"");return '<span class="kick '+cl+'"><b>'+p[0].split(" ").slice(-1)[0]+'</b>'+(sh?(sh.outcome==="goal"?"✓":"✕"):"·")+'</span>'}).join("")+own.slice(5).map(sh=>'<span class="kick extra '+(sh.outcome==="goal"?"good":"bad")+'"><b>'+sh.shooter.split(" ").slice(-1)[0]+'</b>'+(sh.outcome==="goal"?"✓":"✕")+'</span>').join("");return '<div class="score-row '+(S.side===s&&!S.finished?"active":"")+'"><div class="score-team">'+t.flag+' '+t.name+'<small>TW: '+t.keeper.name+'</small></div><div class="score-num">'+g+'</div><div class="kick-list">'+chips+'</div></div>'};$("#shootoutBoard").innerHTML=row("A")+row("B")}
function uiTurn(){board();const t=sideTeam(S.side),d=oppTeam(S.side),sh=shooter(S.side);$("#turnTitle").textContent=t.flag+" "+t.name+" ist am Punkt";$("#turnMeta").textContent=sh[0]+" gegen "+d.keeper.name;$("#shooterName").textContent=sh[0];$("#shooterInfo").textContent=t.name+" · Stärke "+sh[1]+"/25";$("#keeperName").textContent=d.keeper.name;$("#keeperInfo").textContent=d.nation+" · "+d.keeper.club+" · Stärke "+d.keeper.strength+"/25";$("#commentary").innerHTML="<b>JETZT: "+sh[0]+"</b><br>Zuerst ins Tor klicken → Zielpunkt setzen → Stärke wählen → SCHIESSEN.";
 $("#pressureLabel").textContent=S.sudden?"SUDDEN DEATH":(taken(S.side)>=4?"MATCHBALL":"DRUCK");
 setShootEnabled(S.target.set);
 if(scene){scene.setColors(t,d);scene.setActorLabels(sh[0],d.keeper.name);scene.resetActors();scene.startIdleMotion();scene.target.setVisible(false);scene.turnText.setText("JETZT: "+sh[0]+"\n1. ZIEL SETZEN  ·  2. POWER  ·  3. SCHIESSEN").setAlpha(1).setScale(1);scene.time.delayedCall(1500,()=>scene.tweens.add({targets:scene.turnText,alpha:0,duration:350}))}
 tension();focusGame()}
function gaussian(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function simulate(sh,kp){
 const x=S.target.x,y=S.target.y,p=S.power,ss=sh[1],ks=kp.strength,pn=(p-45)/55;
 const disp=Math.max(.012,.052-(ss-18)*.0035+Math.max(0,pn-.60)*.06);
 let ax=x+gaussian()*disp,ay=y+gaussian()*disp*.78;
 let out=(ax<0||ax>1||ay<0||ay>1)?"miss":"goal";
 if(out==="goal"&&(ax<.028||ax>.972||ay<.028)&&Math.random()<.18+.22*pn)out="post";
 const read=.14+(ks-18)*.018;
 let kx=Math.random()<read?ax:.5+gaussian()*.20,ky=Math.random()<read?ay:.54+gaussian()*.17;
 const saveRadius=.105+(ks-18)*.0065-(ss-18)*.003-(pn*.027);
 const dist=Math.hypot(ax-kx,(ay-ky)*1.18);
 if(out==="goal"&&dist<saveRadius)out="save";

 // Visual truth rule:
 // A goal must show daylight between keeper and ball.
 // A save must end at a keeper contact point in front of the line.
 if(out==="goal"){
   const visualClearance=.205;
   let dx=ax-kx,dy=(ay-ky)*1.18,d=Math.hypot(dx,dy);
   if(d<visualClearance){
     const dir=(dx===0?(ax<.5?-1:1):Math.sign(dx));
     kx=ax-dir*(visualClearance+.025);
     ky=ay+(ky<ay?-.065:.065);
   }
 }
 if(out==="save"){
   // Contact point follows keeper instead of continuing into the net.
   ax=kx+(ax-kx)*.42;
   ay=ky+(ay-ky)*.42;
 }
 return{
   outcome:out,
   ax:Math.max(-.13,Math.min(1.13,ax)),ay:Math.max(-.12,Math.min(1.12,ay)),
   kx:Math.max(.03,Math.min(.97,kx)),ky:Math.max(.05,Math.min(.95,ky)),
   originalTargetX:x,originalTargetY:y
 }
}
function ended(){if(S.ta<5||S.tb<5){const ra=5-S.ta,rb=5-S.tb;if(S.a>S.b+rb||S.b>S.a+ra)return true;return false}return S.ta===S.tb&&S.a!==S.b}
async function shootNow(){if(S.busy||S.finished||!S.target.set)return;S.busy=true;stopTension();if(scene)scene.stopIdleMotion();setShootEnabled(false);const side=S.side,att=sideTeam(side),def=oppTeam(side),sh=shooter(side),sim=simulate(sh,def.keeper);$("#commentary").textContent=sh[0]+" läuft an …";await scene.animate(sim,att,def);S.shots.push({side,team:att.name,shooter:sh[0],keeper:def.keeper.name,power:S.power,...sim});if(side==="A"){S.ta++;if(sim.outcome==="goal")S.a++}else{S.tb++;if(sim.outcome==="goal")S.b++}$("#commentary").textContent=sim.outcome==="goal"?sh[0]+" verwandelt!":sim.outcome==="save"?def.keeper.name+" hält!":sim.outcome==="post"?"Pfosten!":"Daneben!";board();if(ended()){finish();return}S.side=side==="A"?"B":"A";if(S.ta>=5&&S.tb>=5&&S.a===S.b)S.sudden=true;
 S.target.set=false;S.target.x=.5;S.target.y=.5;$("#aimValue").textContent="— / —";setShootEnabled(false);
 if(scene)scene.target.setVisible(false);
 S.busy=false;await sleep(250);uiTurn()}
function finish(){S.finished=true;stopTension();const win=S.a>S.b?"A":"B",wa=win==="A",w=sideTeam(win);$("#game").classList.add("hidden");$("#result").classList.remove("hidden");$("#winnerCard").innerHTML='<div class="winner-wrap"><div class="winner-team '+(wa?"win":"lose")+'"><div class="flag">'+S.A.flag+'</div><h3>'+S.A.name+'</h3><strong>'+S.a+'</strong><br><span>'+(wa?"SIEGER":"AUSGESCHIEDEN")+'</span></div><div class="winner-vs">:</div><div class="winner-team '+(!wa?"win":"lose")+'"><div class="flag">'+S.B.flag+'</div><h3>'+S.B.name+'</h3><strong>'+S.b+'</strong><br><span>'+(!wa?"SIEGER":"AUSGESCHIEDEN")+'</span></div></div>';$("#shotLog").innerHTML=S.shots.map((x,i)=>'<div class="log-row '+(x.outcome==="goal"?"good":"bad")+'"><span class="mark">'+(x.outcome==="goal"?"✓":"✕")+'</span><div><b>'+(i+1)+'. '+x.shooter+'</b><small>'+x.team+' · gegen '+x.keeper+' · '+x.power+'% Power</small></div><strong>'+(x.outcome==="goal"?"GETROFFEN":x.outcome==="save"?"GEHALTEN":x.outcome==="post"?"PFOSTEN":"DANEBEN")+'</strong></div>').join("");crowdBurst("goal");window.scrollTo({top:$("#result").offsetTop-8,behavior:"smooth"})}
function start(){S.A=T($("#teamA").value);S.B=T($("#teamB").value);Object.assign(S,{side:"A",a:0,b:0,ta:0,tb:0,shots:[],power:78,busy:false,sudden:false,finished:false});S.target={x:.5,y:.5,set:false};syncPowerUI(78);$("#aimValue").textContent="— / —";$("#setup").classList.add("hidden");$("#result").classList.add("hidden");$("#game").classList.remove("hidden");if(!game)bootPhaser();else scene?.resetActors();ambience();setTimeout(uiTurn,game?100:700);window.scrollTo({top:$("#game").offsetTop-8,behavior:"smooth"})}
$("#power").oninput=e=>{syncPowerUI(e.target.value);tension()};
if($("#mobilePower"))$("#mobilePower").oninput=e=>{syncPowerUI(e.target.value);tension()};
$("#shootBtn").onclick=shootNow;
if($("#mobileShootBtn"))$("#mobileShootBtn").onclick=shootNow;$("#startBtn").onclick=start;$("#rematchBtn").onclick=start;$("#newBtn").onclick=()=>{$("#result").classList.add("hidden");$("#game").classList.add("hidden");$("#setup").classList.remove("hidden");window.scrollTo({top:$("#setup").offsetTop-8,behavior:"smooth"})};
fillSelectors();
})();