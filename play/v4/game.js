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

function fillSelectors(){for(const id of ["teamA","teamB"]){const el=$("#"+id);el.innerHTML=TEAMS.map(t=>'<option value="'+t.id+'">'+t.flag+' '+t.name+'</option>').join("")}$("#teamA").value="ger14";$("#teamB").value="arg22";renderPreview()}
function T(id){return TEAMS.find(t=>t.id===id)}
function renderPreview(){const a=T($("#teamA").value),b=T($("#teamB").value);$("#preview").innerHTML=[a,b].map(t=>'<div class="preview-team"><strong>'+t.flag+' '+t.name+'</strong><small>Torwart: '+t.keeper.name+' · '+t.keeper.club+'</small><div class="players">'+t.shooters.map((x,i)=>(i+1)+'. '+x[0]).join('<br>')+'</div></div>').join("")}
$("#teamA").onchange=()=>{if($("#teamA").value===$("#teamB").value)$("#teamB").value=TEAMS.find(t=>t.id!==$("#teamA").value).id;renderPreview()};
$("#teamB").onchange=()=>{if($("#teamA").value===$("#teamB").value)$("#teamA").value=TEAMS.find(t=>t.id!==$("#teamB").value).id;renderPreview()};

function audio(){if(!audioOn)return null;try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==="suspended")actx.resume();return actx}catch(e){return null}}
function noiseBuffer(sec){const a=audio();if(!a)return null;const n=Math.max(1,Math.floor(a.sampleRate*sec)),b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;return b}
function ambience(){const a=audio();if(!a||ambSrc)return;const src=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();src.buffer=noiseBuffer(2);src.loop=true;f.type="bandpass";f.frequency.value=900;f.Q.value=.45;g.gain.value=.018;src.connect(f);f.connect(g);g.connect(a.destination);src.start();ambSrc=src;ambGain=g}
function stopTension(){tensionNodes.forEach(n=>{try{n.stop?.()}catch(e){}try{n.disconnect?.()}catch(e){}});tensionNodes=[];if(ambGain&&actx)ambGain.gain.setTargetAtTime(.018,actx.currentTime,.1)}
function tension(){const a=audio();if(!a)return;stopTension();if(ambGain)ambGain.gain.setTargetAtTime(.006,a.currentTime,.08);[72,108].forEach((f,i)=>{const o=a.createOscillator(),g=a.createGain();o.type=i?"sine":"triangle";o.frequency.value=f;g.gain.value=.0001;o.connect(g);g.connect(a.destination);g.gain.exponentialRampToValueAtTime(i?.018:.032,a.currentTime+.35);o.start();tensionNodes.push(o,g)})}
function kickSound(){const a=audio();if(!a)return;const o=a.createOscillator(),g=a.createGain(),t=a.currentTime;o.type="sine";o.frequency.setValueAtTime(105,t);o.frequency.exponentialRampToValueAtTime(46,t+.1);g.gain.value=.12;g.gain.exponentialRampToValueAtTime(.001,t+.14);o.connect(g);g.connect(a.destination);o.start();o.stop(t+.15)}
function crowdBurst(kind){const a=audio();if(!a)return;const src=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain(),t=a.currentTime;src.buffer=noiseBuffer(kind==="goal"?1.15:.85);f.type="bandpass";f.frequency.value=kind==="goal"?1300:650;f.Q.value=.55;g.gain.value=kind==="goal"?.11:.07;src.connect(f);f.connect(g);g.connect(a.destination);src.start();if(kind==="goal"){[440,550,660].forEach((hz,i)=>{const o=a.createOscillator(),og=a.createGain();o.type="triangle";o.frequency.value=hz;og.gain.setValueAtTime(.001,t+i*.04);og.gain.linearRampToValueAtTime(.025,t+i*.04+.03);og.gain.exponentialRampToValueAtTime(.001,t+.65);o.connect(og);og.connect(a.destination);o.start(t+i*.04);o.stop(t+.7)})}else{const o=a.createOscillator(),og=a.createGain();o.type="sine";o.frequency.setValueAtTime(210,t);o.frequency.exponentialRampToValueAtTime(118,t+.65);og.gain.value=.045;og.gain.exponentialRampToValueAtTime(.001,t+.68);o.connect(og);og.connect(a.destination);o.start();o.stop(t+.7)}}
function postSound(){const a=audio();if(!a)return;const o=a.createOscillator(),g=a.createGain(),t=a.currentTime;o.type="sine";o.frequency.value=1450;g.gain.value=.09;g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g);g.connect(a.destination);o.start();o.stop(t+.31)}
$("#soundBtn").onclick=()=>{audioOn=!audioOn;$("#soundBtn").textContent=audioOn?"🔊 Sound":"🔇 Sound";if(audioOn)ambience();else{stopTension();try{ambSrc?.stop()}catch(e){}ambSrc=null}};

class ShootoutScene extends Phaser.Scene{
 constructor(){super("shootout")}
 create(){
   scene=this;const w=this.scale.width,h=this.scale.height;
   this.cameras.main.setBackgroundColor("#07101d");
   this.add.image(w/2,h/2,"stadium").setDisplaySize(w,h).setAlpha(.96);
   this.add.rectangle(w/2,h*.8,w,h*.42,0x0e6a3a,.65);
   for(let i=0;i<12;i++)this.add.line(0,0,w*.05+i*w*.09,h*.64,w*.02+i*w*.095,h,0xffffff,.045).setOrigin(0);
   this.add.ellipse(w/2,h*.86,w*.82,h*.14,0x000000,.25);
   this.goal={x:w*.22,y:h*.18,w:w*.56,h:h*.42};
   this.drawGoal();
   this.keeperGroup=this.add.container(w/2,h*.56);this.drawKeeper(this.keeperGroup);
   this.playerGroup=this.add.container(w*.26,h*.83);this.drawPlayer(this.playerGroup);
   this.ball=this.add.image(w*.36,h*.83,"ball").setDisplaySize(42,42).setDepth(15).setAngle(-8);
   this.target=this.add.container(0,0).setDepth(20).setVisible(false);this.drawTarget();
   this.resultText=this.add.text(w/2,h*.105,"",{fontFamily:"Arial Black,Arial",fontSize:56,color:"#ffffff",stroke:"#06101a",strokeThickness:10}).setOrigin(.5).setDepth(40).setAlpha(0);
   this.input.on("pointerdown",p=>{if(S.busy||S.finished)return;if(p.x<this.goal.x||p.x>this.goal.x+this.goal.w||p.y<this.goal.y||p.y>this.goal.y+this.goal.h)return;S.target.x=(p.x-this.goal.x)/this.goal.w;S.target.y=(p.y-this.goal.y)/this.goal.h;S.target.set=true;this.target.setPosition(p.x,p.y).setVisible(true);$("#aimValue").textContent=Math.round(S.target.x*100)+" / "+Math.round((1-S.target.y)*100);$("#shootBtn").disabled=false;tension()});
   this.scale.on("resize",(gameSize)=>{
     const w=gameSize.width,h=gameSize.height;
     this.cameras.resize(w,h);
   });
 }
 drawGoal(){
   const g=this.add.graphics().setDepth(5),x=this.goal.x,y=this.goal.y,w=this.goal.w,h=this.goal.h;
   g.lineStyle(7,0xf6fbff,1);g.strokeRect(x,y,w,h);g.lineStyle(1,0xd8efff,.18);
   for(let i=1;i<10;i++)g.lineBetween(x+w*i/10,y,x+w*i/10,y+h);for(let i=1;i<10;i++)g.lineBetween(x,y+h*i/10,x+w,y+h*i/10);
   g.lineStyle(1,0x76dfff,.12);for(let i=1;i<50;i++)g.lineBetween(x+w*i/50,y,x+w*i/50,y+h);for(let i=1;i<25;i++)g.lineBetween(x,y+h*i/25,x+w,y+h*i/25);
 }
 drawTarget(){const g=this.add.graphics();g.lineStyle(2,0x63e5ff,1);g.strokeCircle(0,0,18);g.lineBetween(-27,0,27,0);g.lineBetween(0,-27,0,27);g.strokeCircle(0,0,5)}
 drawKeeper(c){const g=this.add.graphics();g.fillStyle(0xe0b08d);g.fillCircle(0,-82,15);g.fillStyle(0x2f251f);g.fillEllipse(0,-93,29,10);g.fillStyle(0xe9b92f);g.fillRoundedRect(-25,-65,50,67,10);g.fillStyle(0xf8d85e);g.fillRoundedRect(-58,-58,35,12,6);g.fillRoundedRect(23,-58,35,12,6);g.fillStyle(0x182235);g.fillRoundedRect(-24,0,20,58,8);g.fillRoundedRect(4,0,20,58,8);g.fillStyle(0xffffff);g.fillRoundedRect(-66,-61,11,18,5);g.fillRoundedRect(55,-61,11,18,5)}
 drawPlayer(c){const g=this.add.graphics();g.fillStyle(0xc7926d);g.fillCircle(0,-111,15);g.fillStyle(0x2b211d);g.fillEllipse(0,-121,28,9);g.fillStyle(0xdddddd);g.fillRoundedRect(-23,-92,46,67,11);g.fillStyle(0x1a2b42);g.fillRoundedRect(-21,-27,17,71,8);g.fillRoundedRect(4,-27,17,71,8);g.fillStyle(0xc7926d);g.fillRoundedRect(-37,-84,13,55,7);g.fillRoundedRect(24,-84,13,55,7)}
 setColors(att,def){const pg=this.playerGroup.list[0],kg=this.keeperGroup.list[0];if(pg){pg.clear();this.drawColoredPlayer(pg,att)}if(kg){kg.clear();this.drawColoredKeeper(kg,def)}}
 drawColoredPlayer(g,t){g.fillStyle(0xc7926d);g.fillCircle(0,-111,15);g.fillStyle(0x2b211d);g.fillEllipse(0,-121,28,9);g.fillStyle(t.color);g.fillRoundedRect(-23,-92,46,67,11);g.lineStyle(4,t.accent,.9);g.lineBetween(-19,-56,19,-56);g.fillStyle(0x16253c);g.fillRoundedRect(-21,-27,17,71,8);g.fillRoundedRect(4,-27,17,71,8);g.fillStyle(0xc7926d);g.fillRoundedRect(-37,-84,13,55,7);g.fillRoundedRect(24,-84,13,55,7)}
 drawColoredKeeper(g,t){g.fillStyle(0xe0b08d);g.fillCircle(0,-82,15);g.fillStyle(0x2f251f);g.fillEllipse(0,-93,29,10);g.fillStyle(t.accent===0xffffff?0xe9b92f:t.accent);g.fillRoundedRect(-25,-65,50,67,10);g.fillStyle(0xf8d85e);g.fillRoundedRect(-58,-58,35,12,6);g.fillRoundedRect(23,-58,35,12,6);g.fillStyle(0x182235);g.fillRoundedRect(-24,0,20,58,8);g.fillRoundedRect(4,0,20,58,8);g.fillStyle(0xffffff);g.fillRoundedRect(-66,-61,11,18,5);g.fillRoundedRect(55,-61,11,18,5)}
 resetActors(){const w=this.scale.width,h=this.scale.height;this.playerGroup.setPosition(w*.26,h*.83).setRotation(0);this.keeperGroup.setPosition(w/2,h*.56).setRotation(0).setScale(1);this.ball.setPosition(w*.36,h*.83).setDisplaySize(42,42).setAngle(-8).setVisible(true)}
 async animate(sim,att,def){
   const w=this.scale.width,h=this.scale.height;this.setColors(att,def);this.target.setVisible(false);this.resultText.setAlpha(0);
   await tween(this,this.playerGroup,{x:w*.34,duration:470,ease:"Cubic.easeInOut"});kickSound();
   const kx=this.goal.x+this.goal.w*sim.kx,ky=this.goal.y+this.goal.h*sim.ky;
   this.tweens.add({targets:this.keeperGroup,x:kx,y:ky+45,rotation:(sim.kx<.5?-1:1)*.42,scaleX:1.08,scaleY:.94,duration:410,ease:"Cubic.easeOut"});
   const bx=this.goal.x+this.goal.w*sim.ax,by=this.goal.y+this.goal.h*sim.ay;
   await tween(this,this.ball,{x:bx,y:by,displayWidth:21,displayHeight:21,angle:920,duration:390+(100-S.power)*2,ease:"Cubic.easeOut"});
   this.showResult(sim.outcome);
   if(sim.outcome==="goal")crowdBurst("goal");else if(sim.outcome==="post"){postSound();crowdBurst("miss")}else crowdBurst("miss");
   this.cameras.main.shake(sim.outcome==="goal"?120:190,sim.outcome==="save"?.006:.003);
   await sleep(900);this.resetActors()
 }
 showResult(out){const map={goal:["TOR!","#45ef9b"],save:["PARADE!","#ff7084"],post:["PFOSTEN!","#f7d678"],miss:["DANEBEN!","#ff9477"]},m=map[out];this.resultText.setText(m[0]).setColor(m[1]).setScale(.65).setAlpha(1);this.tweens.add({targets:this.resultText,scale:1,duration:180,ease:"Back.easeOut"});this.time.delayedCall(700,()=>this.tweens.add({targets:this.resultText,alpha:0,duration:180}))}
}
function tween(sc,target,props){return new Promise(res=>sc.tweens.add({targets:target,...props,onComplete:res}))}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function makeBallTexture(sc){const g=sc.make.graphics({x:0,y:0,add:false});g.fillStyle(0xf8fafb);g.fillCircle(64,64,60);g.lineStyle(3,0x172331,.85);g.strokeCircle(64,64,59);g.fillStyle(0x202a36);const pts=[[64,42],[43,58],[51,84],[77,84],[85,58]];g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fillPath();g.lineStyle(3,0x5b6672,.65);[[64,42,64,8],[43,58,11,48],[51,84,29,111],[77,84,100,111],[85,58,117,48]].forEach(a=>g.lineBetween(...a));g.generateTexture("ball",128,128);g.destroy()}
function bootPhaser(){game=new Phaser.Game({type:Phaser.AUTO,parent:"phaserMount",width:960,height:540,transparent:false,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:{preload(){this.load.image("stadium","/assets/hero-fussball-dunkel.png")},create(){makeBallTexture(this);this.scene.start("shootout")}}});game.scene.add("shootout",ShootoutScene,false)}
function sideTeam(s){return s==="A"?S.A:S.B}function oppTeam(s){return s==="A"?S.B:S.A}function taken(s){return s==="A"?S.ta:S.tb}function goals(s){return s==="A"?S.a:S.b}
function shooter(s){const t=sideTeam(s),i=taken(s)%t.shooters.length;return t.shooters[i]}
function board(){const row=s=>{const t=sideTeam(s),own=S.shots.filter(x=>x.side===s),tk=taken(s),g=goals(s),chips=t.shooters.map((p,i)=>{const sh=own[i],cl=sh?(sh.outcome==="goal"?"good":"bad"):(S.side===s&&i===tk&&!S.sudden&&!S.finished?"now":"");return '<span class="kick '+cl+'"><b>'+p[0].split(" ").slice(-1)[0]+'</b>'+(sh?(sh.outcome==="goal"?"✓":"✕"):"·")+'</span>'}).join("")+own.slice(5).map(sh=>'<span class="kick extra '+(sh.outcome==="goal"?"good":"bad")+'"><b>'+sh.shooter.split(" ").slice(-1)[0]+'</b>'+(sh.outcome==="goal"?"✓":"✕")+'</span>').join("");return '<div class="score-row '+(S.side===s&&!S.finished?"active":"")+'"><div class="score-team">'+t.flag+' '+t.name+'<small>TW: '+t.keeper.name+'</small></div><div class="score-num">'+g+'</div><div class="kick-list">'+chips+'</div></div>'};$("#shootoutBoard").innerHTML=row("A")+row("B")}
function uiTurn(){board();const t=sideTeam(S.side),d=oppTeam(S.side),sh=shooter(S.side);$("#turnTitle").textContent=t.flag+" "+t.name+" ist am Punkt";$("#turnMeta").textContent=sh[0]+" gegen "+d.keeper.name;$("#shooterName").textContent=sh[0];$("#shooterInfo").textContent=t.name+" · Stärke "+sh[1]+"/25";$("#keeperName").textContent=d.keeper.name;$("#keeperInfo").textContent=d.nation+" · "+d.keeper.club+" · Stärke "+d.keeper.strength+"/25";$("#commentary").textContent="Setze den Zielpunkt im Tor und wähle anschließend deine Schussstärke.";$("#pressureLabel").textContent=S.sudden?"SUDDEN DEATH":(taken(S.side)>=4?"MATCHBALL":"DRUCK");$("#shootBtn").disabled=!S.target.set;scene?.setColors(t,d);tension()}
function gaussian(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function simulate(sh,kp){const x=S.target.x,y=S.target.y,p=S.power,ss=sh[1],ks=kp.strength,pn=(p-45)/55,disp=Math.max(.012,.052-(ss-18)*.0035+Math.max(0,pn-.60)*.06);let ax=x+gaussian()*disp,ay=y+gaussian()*disp*.78,out=(ax<0||ax>1||ay<0||ay>1)?"miss":"goal";if(out==="goal"&&(ax<.028||ax>.972||ay<.028)&&Math.random()<.18+.22*pn)out="post";const read=.14+(ks-18)*.018,kx=Math.random()<read?ax:.5+gaussian()*.20,ky=Math.random()<read?ay:.54+gaussian()*.17,dist=Math.hypot(ax-kx,(ay-ky)*1.18),saveRadius=.105+(ks-18)*.0065-(ss-18)*.003-(pn*.027);if(out==="goal"&&dist<saveRadius)out="save";return{outcome:out,ax:Math.max(-.13,Math.min(1.13,ax)),ay:Math.max(-.12,Math.min(1.12,ay)),kx:Math.max(.03,Math.min(.97,kx)),ky:Math.max(.05,Math.min(.95,ky))}}
function ended(){if(S.ta<5||S.tb<5){const ra=5-S.ta,rb=5-S.tb;if(S.a>S.b+rb||S.b>S.a+ra)return true;return false}return S.ta===S.tb&&S.a!==S.b}
async function shootNow(){if(S.busy||S.finished||!S.target.set)return;S.busy=true;stopTension();$("#shootBtn").disabled=true;const side=S.side,att=sideTeam(side),def=oppTeam(side),sh=shooter(side),sim=simulate(sh,def.keeper);$("#commentary").textContent=sh[0]+" läuft an …";await scene.animate(sim,att,def);S.shots.push({side,team:att.name,shooter:sh[0],keeper:def.keeper.name,power:S.power,...sim});if(side==="A"){S.ta++;if(sim.outcome==="goal")S.a++}else{S.tb++;if(sim.outcome==="goal")S.b++}$("#commentary").textContent=sim.outcome==="goal"?sh[0]+" verwandelt!":sim.outcome==="save"?def.keeper.name+" hält!":sim.outcome==="post"?"Pfosten!":"Daneben!";board();if(ended()){finish();return}S.side=side==="A"?"B":"A";if(S.ta>=5&&S.tb>=5&&S.a===S.b)S.sudden=true;S.target.set=false;S.target.x=.5;S.target.y=.5;$("#aimValue").textContent="50 / 50";scene.target.setVisible(false);S.busy=false;uiTurn()}
function finish(){S.finished=true;stopTension();const win=S.a>S.b?"A":"B",wa=win==="A",w=sideTeam(win);$("#game").classList.add("hidden");$("#result").classList.remove("hidden");$("#winnerCard").innerHTML='<div class="winner-wrap"><div class="winner-team '+(wa?"win":"lose")+'"><div class="flag">'+S.A.flag+'</div><h3>'+S.A.name+'</h3><strong>'+S.a+'</strong><br><span>'+(wa?"SIEGER":"AUSGESCHIEDEN")+'</span></div><div class="winner-vs">:</div><div class="winner-team '+(!wa?"win":"lose")+'"><div class="flag">'+S.B.flag+'</div><h3>'+S.B.name+'</h3><strong>'+S.b+'</strong><br><span>'+(!wa?"SIEGER":"AUSGESCHIEDEN")+'</span></div></div>';$("#shotLog").innerHTML=S.shots.map((x,i)=>'<div class="log-row '+(x.outcome==="goal"?"good":"bad")+'"><span class="mark">'+(x.outcome==="goal"?"✓":"✕")+'</span><div><b>'+(i+1)+'. '+x.shooter+'</b><small>'+x.team+' · gegen '+x.keeper+' · '+x.power+'% Power</small></div><strong>'+(x.outcome==="goal"?"GETROFFEN":x.outcome==="save"?"GEHALTEN":x.outcome==="post"?"PFOSTEN":"DANEBEN")+'</strong></div>').join("");crowdBurst("goal");window.scrollTo({top:$("#result").offsetTop-8,behavior:"smooth"})}
function start(){S.A=T($("#teamA").value);S.B=T($("#teamB").value);Object.assign(S,{side:"A",a:0,b:0,ta:0,tb:0,shots:[],power:78,busy:false,sudden:false,finished:false});S.target={x:.5,y:.5,set:false};$("#power").value=78;$("#powerValue").textContent="78%";$("#setup").classList.add("hidden");$("#result").classList.add("hidden");$("#game").classList.remove("hidden");if(!game)bootPhaser();else scene?.resetActors();ambience();setTimeout(uiTurn,game?100:700);window.scrollTo({top:$("#game").offsetTop-8,behavior:"smooth"})}
$("#power").oninput=e=>{S.power=+e.target.value;$("#powerValue").textContent=S.power+"%";tension()};
$("#shootBtn").onclick=shootNow;$("#startBtn").onclick=start;$("#rematchBtn").onclick=start;$("#newBtn").onclick=()=>{$("#result").classList.add("hidden");$("#game").classList.add("hidden");$("#setup").classList.remove("hidden");window.scrollTo({top:$("#setup").offsetTop-8,behavior:"smooth"})};
fillSelectors();
})();