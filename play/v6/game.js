import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const TEAMS=[
{id:"ger14",name:"Deutschland 2014",nation:"Deutschland",flag:"🇩🇪",shirt:0xf2f2f2,shorts:0x171b22,keeperColor:0xe4b72f,keeper:{name:"Manuel Neuer",club:"FC Bayern München",strength:24},shooters:[["Thomas Müller",24],["Toni Kroos",23],["Bastian Schweinsteiger",23],["Mario Götze",22],["Miroslav Klose",22]]},
{id:"arg22",name:"Argentinien 2022",nation:"Argentinien",flag:"🇦🇷",shirt:0x79cfee,shorts:0xffffff,keeperColor:0x2b7b45,keeper:{name:"Emiliano Martínez",club:"Aston Villa",strength:23},shooters:[["Lionel Messi",23],["Ángel Di María",20],["Lautaro Martínez",20],["Julián Álvarez",19],["Leandro Paredes",21]]},
{id:"ita06",name:"Italien 2006",nation:"Italien",flag:"🇮🇹",shirt:0x1558b0,shorts:0xffffff,keeperColor:0xd29f2c,keeper:{name:"Gianluigi Buffon",club:"Juventus",strength:23},shooters:[["Francesco Totti",20],["Andrea Pirlo",20],["Alessandro Del Piero",22],["Daniele De Rossi",17],["Marco Materazzi",19]]},
{id:"esp10",name:"Spanien 2010",nation:"Spanien",flag:"🇪🇸",shirt:0xc61f2d,shorts:0x283a65,keeperColor:0x1f7a42,keeper:{name:"Iker Casillas",club:"Real Madrid",strength:23},shooters:[["David Villa",22],["Xavi",23],["Andrés Iniesta",23],["Xabi Alonso",21],["Fernando Torres",21]]}
];
const $=s=>document.querySelector(s);
const S={A:null,B:null,side:"A",a:0,b:0,ta:0,tb:0,shots:[],target:{x:0,y:1.2,set:false},contact:{x:0,y:0},power:78,busy:false,sudden:false,finished:false};
let world=null;

function T(id){return TEAMS.find(t=>t.id===id)}
function fill(){for(const id of ["teamA","teamB"]){$("#"+id).innerHTML=TEAMS.map(t=>'<option value="'+t.id+'">'+t.flag+" "+t.name+"</option>").join("")}$("#teamA").value="ger14";$("#teamB").value="arg22";preview()}
function preview(){const a=T($("#teamA").value),b=T($("#teamB").value);$("#preview").innerHTML=[a,b].map(t=>'<div><b>'+t.flag+" "+t.name+'</b><small>TW: '+t.keeper.name+" · "+t.keeper.club+'</small><p>'+t.shooters.map((p,i)=>(i+1)+". "+p[0]).join("<br>")+"</p></div>").join("")}
$("#teamA").onchange=()=>{if($("#teamA").value===$("#teamB").value)$("#teamB").value=TEAMS.find(t=>t.id!==$("#teamA").value).id;preview()};
$("#teamB").onchange=()=>{if($("#teamA").value===$("#teamB").value)$("#teamA").value=TEAMS.find(t=>t.id!==$("#teamB").value).id;preview()};

class World3D{
 constructor(el){
   this.el=el;this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0x07131f);
   this.camera=new THREE.PerspectiveCamera(44,16/9,.1,100);this.camera.position.set(0,2.55,15.5);this.camera.lookAt(0,1.15,4.2);
   this.renderer=new THREE.WebGLRenderer({antialias:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;el.innerHTML="";el.appendChild(this.renderer.domElement);
   this.clock=new THREE.Clock();this.anim=[];this.targetMarker=null;this.player=null;this.keeper=null;this.ball=null;
   this.makeScene();this.resize();addEventListener("resize",()=>this.resize());this.renderer.domElement.addEventListener("pointerdown",e=>this.pickGoal(e));this.loop();
 }
 resize(){const r=this.el.getBoundingClientRect();this.renderer.setSize(r.width,r.height,false);this.camera.aspect=r.width/r.height;this.camera.updateProjectionMatrix()}
 makeScene(){
   const hemi=new THREE.HemisphereLight(0xcdefff,0x193517,1.6);this.scene.add(hemi);
   const sun=new THREE.DirectionalLight(0xffffff,2.2);sun.position.set(-6,12,8);sun.castShadow=true;this.scene.add(sun);
   const pitch=new THREE.Mesh(new THREE.PlaneGeometry(22,34),new THREE.MeshStandardMaterial({color:0x0c6d39,roughness:.95}));pitch.rotation.x=-Math.PI/2;pitch.position.z=5;pitch.receiveShadow=true;this.scene.add(pitch);
   for(let i=0;i<12;i++){const strip=new THREE.Mesh(new THREE.PlaneGeometry(1.8,34),new THREE.MeshBasicMaterial({color:i%2?0x0f7740:0x0b6536,transparent:true,opacity:.22}));strip.rotation.x=-Math.PI/2;strip.position.set(-9.9+i*1.8,.002,5);this.scene.add(strip)}
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
   this.player=this.makeHuman(1.80,0xf2f2f2,0x171b22,false);this.player.position.set(-1.2,0,12.2);this.player.rotation.y=Math.PI;this.scene.add(this.player);
   this.keeper=this.makeHuman(1.92,0xe4b72f,0x182235,true);this.keeper.position.set(0,0,.35);this.keeper.rotation.y=0;this.scene.add(this.keeper);
   this.startIdle();
 }
 makeBall(){const g=new THREE.Group();const ball=new THREE.Mesh(new THREE.SphereGeometry(.11,28,20),new THREE.MeshStandardMaterial({color:0xf8f8f6,roughness:.5}));ball.castShadow=true;g.add(ball);for(let i=0;i<8;i++){const p=new THREE.Mesh(new THREE.CircleGeometry(.024,5),new THREE.MeshBasicMaterial({color:0x17202b}));p.position.set(Math.sin(i*.78)*.102,Math.cos(i*.78)*.07,Math.cos(i*.78)*.08);p.lookAt(new THREE.Vector3(0,0,0));g.add(p)}return g}
 makeHuman(height,shirt,shorts,isKeeper){
   const root=new THREE.Group(),skin=0xc78f6f;
   const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.72});
   const part=(geo,c)=>{const m=new THREE.Mesh(geo,mat(c));m.castShadow=true;return m};
   const pelvis=new THREE.Group();pelvis.position.y=height*.53;root.add(pelvis);
   const torso=part(new THREE.CapsuleGeometry(height*.15,height*.27,5,12),shirt);torso.position.y=height*.16;pelvis.add(torso);
   const head=part(new THREE.SphereGeometry(height*.105,24,18),skin);head.scale.set(.85,1,.92);head.position.y=height*.43;pelvis.add(head);
   const hair=part(new THREE.SphereGeometry(height*.108,20,12),0x2a211d);hair.scale.set(.86,.48,.94);hair.position.y=height*.475;pelvis.add(hair);
   const faceMat=new THREE.MeshBasicMaterial({color:0x3b241d,transparent:true,opacity:.65});const face=new THREE.Mesh(new THREE.CircleGeometry(height*.035,16),faceMat);face.position.set(0,height*.43,height*.096);pelvis.add(face);
   const mkLimb=(x,y,len,r,c)=>{const pivot=new THREE.Group();pivot.position.set(x,y,0);const limb=part(new THREE.CapsuleGeometry(r,len-r*2,4,10),c);limb.position.y=-len/2;limb.rotation.z=0;pivot.add(limb);pelvis.add(pivot);return pivot};
   root.armL=mkLimb(-height*.18,height*.30,height*.34,height*.045,skin);root.armR=mkLimb(height*.18,height*.30,height*.34,height*.045,skin);
   root.legL=mkLimb(-height*.09,0,height*.53,height*.058,shorts);root.legR=mkLimb(height*.09,0,height*.53,height*.058,shorts);
   if(isKeeper){root.armL.rotation.z=-.48;root.armR.rotation.z=.48}else{root.armL.rotation.z=-.1;root.armR.rotation.z=.1}
   root.userData.height=height;return root
 }
 recolorHuman(h,shirt,shorts){h.traverse(o=>{if(o.isMesh&&o.geometry.type.includes("Capsule")){if(o===h.children?.[0])return}})}
 setTeams(att,def){this.player.traverse(o=>{if(o.isMesh&&o.material&&o.geometry.type.includes("Capsule")&&o.parent!==this.player.armL&&o.parent!==this.player.armR&&o.parent!==this.player.legL&&o.parent!==this.player.legR)o.material.color.setHex(att.shirt)});this.player.legL.children[0].material.color.setHex(att.shorts);this.player.legR.children[0].material.color.setHex(att.shorts);this.keeper.traverse(o=>{if(o.isMesh&&o.geometry.type.includes("Capsule")&&o.parent!==this.keeper.legL&&o.parent!==this.keeper.legR)o.material.color.setHex(def.keeperColor)});}
 startIdle(){this.idle=true}
 stopIdle(){this.idle=false}
 loop(){requestAnimationFrame(()=>this.loop());const t=this.clock.getElapsedTime();if(this.idle&&!S.busy){this.player.position.x=-1.2+Math.sin(t*.9)*.28;this.player.position.z=12.15+Math.sin(t*.63)*.35;this.player.scale.setScalar(1+Math.sin(t*.63)*.012);this.player.armL.rotation.z=-.12+Math.sin(t*1.4)*.08;this.player.armR.rotation.z=.12-Math.sin(t*1.4)*.08;this.keeper.position.x=Math.sin(t*1.25)*.52;this.keeper.position.z=.35+Math.sin(t*.85)*.08;this.keeper.armL.rotation.z=-.52+Math.sin(t*1.7)*.08;this.keeper.armR.rotation.z=.52-Math.sin(t*1.7)*.08}this.anim=this.anim.filter(a=>{const p=Math.min(1,(performance.now()-a.t0)/a.d),e=1-Math.pow(1-p,3);a.step(e,p);if(p>=1){a.done?.();return false}return true});this.renderer.render(this.scene,this.camera)}
 tween(d,step){return new Promise(res=>this.anim.push({t0:performance.now(),d,step,done:res}))}
 pickGoal(e){if(S.busy||S.finished)return;const r=this.renderer.domElement.getBoundingClientRect(),m=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1),ray=new THREE.Raycaster();ray.setFromCamera(m,this.camera);const hit=ray.intersectObject(this.hitPlane)[0];if(!hit)return;S.target.x=THREE.MathUtils.clamp(hit.point.x,-3.55,3.55);S.target.y=THREE.MathUtils.clamp(hit.point.y,.08,2.36);S.target.set=true;this.showMarker();$("#aim").textContent=Math.round((S.target.x/7.32+.5)*100)+" / "+Math.round(S.target.y/2.44*100);enableShoot(true);$("#commentary").textContent="Ziel gesetzt. Optional Alt+B für Ballkontakt, dann Power und Schießen."}
 showMarker(){if(this.targetMarker)this.scene.remove(this.targetMarker);const ring=new THREE.Mesh(new THREE.RingGeometry(.12,.16,32),new THREE.MeshBasicMaterial({color:0x62e7ff,side:THREE.DoubleSide}));ring.position.set(S.target.x,S.target.y,.08);this.scene.add(ring);this.targetMarker=ring}
 async shoot(sim){
   this.stopIdle();const p0=this.player.position.clone(),p1=new THREE.Vector3(-.45,0,11.35),p2=new THREE.Vector3(.18,0,10.85);
   await this.tween(360,e=>{this.player.position.lerpVectors(p0,p1,e);this.player.legL.rotation.z=.28*Math.sin(e*Math.PI*2);this.player.legR.rotation.z=-.34*Math.sin(e*Math.PI*2);this.player.armL.rotation.z=-.15-.25*Math.sin(e*Math.PI*2);this.player.armR.rotation.z=.15+.25*Math.sin(e*Math.PI*2)});
   await this.tween(150,e=>{this.player.position.lerpVectors(p1,p2,e);this.player.legR.rotation.x=-1.15*Math.sin(e*Math.PI);this.player.rotation.y=Math.PI-.12*e});
   const kp0=this.keeper.position.clone(),kdir=sim.kx>=0?1:-1;this.tween(420,e=>{this.keeper.position.x=THREE.MathUtils.lerp(kp0.x,sim.kx,e);this.keeper.position.y=Math.sin(e*Math.PI)*.35;this.keeper.position.z=THREE.MathUtils.lerp(kp0.z,.2,e);this.keeper.rotation.z=-kdir*.95*e;this.keeper.armL.rotation.z=-.5-kdir*.7*e;this.keeper.armR.rotation.z=.5-kdir*.7*e});
   const b0=this.ball.position.clone(),b1=new THREE.Vector3(sim.ax,sim.ay,0),cx=(b0.x+b1.x)/2+sim.curveX,cy=(b0.y+b1.y)/2+sim.curveY,cz=(b0.z+b1.z)/2-1.5;
   await this.tween(460+(100-S.power)*2,(e,p)=>{const u=1-e;this.ball.position.set(u*u*b0.x+2*u*e*cx+e*e*b1.x,u*u*b0.y+2*u*e*cy+e*e*b1.y,u*u*b0.z+2*u*e*cz+e*e*b1.z);this.ball.rotation.x+=.25;this.ball.rotation.y+=.18+Math.abs(sim.spinX)*.05});
   if(sim.outcome==="goal")await this.tween(130,e=>this.ball.position.z=-.7*e);
   if(sim.outcome==="save"){const q=this.ball.position.clone();await this.tween(220,e=>{this.ball.position.x=q.x+kdir*.7*e;this.ball.position.z=q.z+1.3*e;this.ball.position.y=Math.max(.11,q.y-.4*e)})}
   if(sim.outcome==="post"){const q=this.ball.position.clone();await this.tween(220,e=>{this.ball.position.x=q.x-kdir*.9*e;this.ball.position.z=q.z+1.2*e})}
   await this.tween(320,e=>{this.player.position.lerpVectors(p2,new THREE.Vector3(.75,0,10.2),e);this.player.rotation.y=Math.PI-.25*e});
 }
 reset(){this.player.position.set(-1.2,0,12.2);this.player.rotation.set(0,Math.PI,0);this.player.scale.setScalar(1);this.player.armL.rotation.set(0,0,-.1);this.player.armR.rotation.set(0,0,.1);this.player.legL.rotation.set(0,0,0);this.player.legR.rotation.set(0,0,0);this.keeper.position.set(0,0,.35);this.keeper.rotation.set(0,0,0);this.keeper.armL.rotation.set(0,0,-.48);this.keeper.armR.rotation.set(0,0,.48);this.ball.position.set(0,.11,11);this.ball.rotation.set(0,0,0);if(this.targetMarker){this.scene.remove(this.targetMarker);this.targetMarker=null}this.startIdle()}
}

function sideTeam(s){return s==="A"?S.A:S.B}function oppTeam(s){return s==="A"?S.B:S.A}function taken(s){return s==="A"?S.ta:S.tb}function goals(s){return s==="A"?S.a:S.b}function shooter(s){const t=sideTeam(s);return t.shooters[taken(s)%t.shooters.length]}
function syncPower(v){S.power=+v;$("#power").value=v;$("#powerMobile").value=v;$("#powerVal").textContent=v+"%";$("#powerMobileVal").textContent=v+"%"}function enableShoot(v){$("#shootBtn").disabled=!v;$("#shootMobile").disabled=!v}
function board(){const row=s=>{const t=sideTeam(s),own=S.shots.filter(x=>x.side===s),tk=taken(s);return '<div class="score-row '+(S.side===s&&!S.finished?"active":"")+'"><div class="score-team">'+t.flag+" "+t.name+'<small>TW: '+t.keeper.name+'</small></div><div class="score-num">'+goals(s)+'</div><div class="kicks">'+t.shooters.map((p,i)=>{const sh=own[i],cl=sh?(sh.outcome==="goal"?"good":"bad"):(i===tk&&S.side===s?"now":"");return '<span class="kick '+cl+'"><b>'+p[0].split(" ").slice(-1)[0]+'</b>'+(sh?(sh.outcome==="goal"?"✓":"✕"):"·")+'</span>'}).join("")+own.slice(5).map(sh=>'<span class="kick '+(sh.outcome==="goal"?"good":"bad")+'"><b>'+sh.shooter.split(" ").slice(-1)[0]+'</b>'+(sh.outcome==="goal"?"✓":"✕")+"</span>").join("")+"</div></div>"};$("#scoreboard").innerHTML=row("A")+row("B")}
function ui(){board();const a=sideTeam(S.side),d=oppTeam(S.side),sh=shooter(S.side);$("#turnTitle").textContent=a.flag+" "+a.name+" am Punkt";$("#turnMeta").textContent=sh[0]+" gegen "+d.keeper.name;$("#shooter").textContent=sh[0];$("#shooterMeta").textContent=a.name+" · Stärke "+sh[1]+"/25";$("#keeper").textContent=d.keeper.name;$("#keeperMeta").textContent=d.keeper.club+" · Stärke "+d.keeper.strength+"/25";$("#pressure").textContent=S.sudden?"SUDDEN DEATH":taken(S.side)>=4?"MATCHBALL":"DRUCK";$("#commentary").textContent="Ziel setzen. Mit Alt+B kannst du zusätzlich festlegen, wo der Fuß den Ball trifft.";world.setTeams(a,d);world.reset();enableShoot(false);S.target.set=false;$("#aim").textContent="— / —"}
function gauss(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function simulate(sh,kp){const pn=(S.power-45)/55,ss=sh[1],ks=kp.strength,disp=.14-(ss-18)*.008+Math.max(0,pn-.6)*.11,cp=contactPhysicsPreview(S.contact.x,S.contact.y),spinX=cp.sideSpin,spinY=cp.verticalSpin;let ax=S.target.x+gauss()*disp+spinX*.22,ay=S.target.y+gauss()*disp*.7-spinY*.18;let out=(Math.abs(ax)>3.66||ay<0||ay>2.44)?"miss":"goal";if(out==="goal"&&(Math.abs(Math.abs(ax)-3.66)<.08||Math.abs(ay-2.44)<.08)&&Math.random()<.34)out="post";let kx=(Math.random()<(.2+(ks-18)*.025))?ax:gauss()*1.45,ky=.9+Math.random()*1.0,dist=Math.hypot(ax-kx,(ay-ky)*1.25),saveRadius=.68+(ks-18)*.045-(ss-18)*.035-pn*.12;if(out==="goal"&&dist<saveRadius)out="save";if(out==="goal"&&Math.abs(ax-kx)<.45)kx+=ax>=0?-.9:.9;if(out==="save"){ax=kx+(ax-kx)*.3;ay=ky+(ay-ky)*.3}return{outcome:out,ax,ay,kx:THREE.MathUtils.clamp(kx,-3.2,3.2),ky,spinX,spinY,curveX:spinX*.75,curveY:spinY*.38}}
function ended(){if(S.ta<5||S.tb<5){const ra=5-S.ta,rb=5-S.tb;return S.a>S.b+rb||S.b>S.a+ra}return S.ta===S.tb&&S.a!==S.b}
async function shootNow(){if(S.busy||S.finished||!S.target.set)return;S.busy=true;enableShoot(false);const side=S.side,a=sideTeam(side),d=oppTeam(side),sh=shooter(side),sim=simulate(sh,d.keeper);$("#commentary").textContent=sh[0]+" läuft an …";await world.shoot(sim);S.shots.push({side,team:a.name,shooter:sh[0],keeper:d.keeper.name,power:S.power,contactX:S.contact.x,contactY:S.contact.y,...sim});if(side==="A"){S.ta++;if(sim.outcome==="goal")S.a++}else{S.tb++;if(sim.outcome==="goal")S.b++}$("#commentary").textContent=sim.outcome==="goal"?"TOR!":sim.outcome==="save"?"PARADE!":sim.outcome==="post"?"PFOSTEN!":"DANEBEN!";board();await new Promise(r=>setTimeout(r,850));if(ended()){finish();return}S.side=side==="A"?"B":"A";if(S.ta>=5&&S.tb>=5&&S.a===S.b)S.sudden=true;S.busy=false;ui()}
function finish(){S.finished=true;const win=S.a>S.b?"A":"B";$("#game").classList.add("hidden");$("#result").classList.remove("hidden");$("#winner").innerHTML='<div class="winner-wrap"><div class="winner-team '+(win==="A"?"win":"lose")+'"><div>'+S.A.flag+'</div><h3>'+S.A.name+'</h3><strong>'+S.a+'</strong><br><span>'+(win==="A"?"SIEGER":"AUSGESCHIEDEN")+'</span></div><div class="vs">:</div><div class="winner-team '+(win==="B"?"win":"lose")+'"><div>'+S.B.flag+'</div><h3>'+S.B.name+'</h3><strong>'+S.b+'</strong><br><span>'+(win==="B"?"SIEGER":"AUSGESCHIEDEN")+'</span></div></div>';$("#log").innerHTML=S.shots.map((x,i)=>'<div class="log-row '+(x.outcome==="goal"?"good":"bad")+'"><span>'+(x.outcome==="goal"?"✓":"✕")+'</span><div><b>'+(i+1)+". "+x.shooter+'</b><small>'+x.team+" · "+x.power+'% · Kontakt '+(Math.round(x.contactX*100))+"/"+(Math.round(x.contactY*100))+'</small></div><b>'+(x.outcome==="goal"?"GETROFFEN":x.outcome==="save"?"GEHALTEN":x.outcome==="post"?"PFOSTEN":"DANEBEN")+"</b></div>").join("")}
function start(){S.A=T($("#teamA").value);S.B=T($("#teamB").value);Object.assign(S,{side:"A",a:0,b:0,ta:0,tb:0,shots:[],power:78,busy:false,sudden:false,finished:false});S.target={x:0,y:1.2,set:false};S.contact={x:0,y:0};syncPower(78);$("#setup").classList.add("hidden");$("#result").classList.add("hidden");$("#game").classList.remove("hidden");if(!world)world=new World3D($("#stage"));setTimeout(ui,120)}
$("#startBtn").onclick=start;$("#shootBtn").onclick=shootNow;$("#shootMobile").onclick=shootNow;$("#power").oninput=e=>syncPower(e.target.value);$("#powerMobile").oninput=e=>syncPower(e.target.value);$("#rematch").onclick=start;$("#newMatch").onclick=()=>{$("#result").classList.add("hidden");$("#game").classList.add("hidden");$("#setup").classList.remove("hidden")};

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
 S.contact.x=x;S.contact.y=y;
 $("#contactDot").style.left=((x+1)*50)+"%";$("#contactDot").style.top=((y+1)*50)+"%";
 $("#cx").textContent=Math.abs(x)<.12?"MITTE":x<0?"LINKS":"RECHTS";
 $("#cy").textContent=Math.abs(y)<.12?"MITTE":y<0?"OBEN":"UNTEN";
 const ph=contactPhysicsPreview(x,y);
 $("#spin").textContent=Math.round(Math.abs(ph.sideSpin)*100);
 $("#flight").textContent=(Math.abs(x)>.18?(x<0?"KURVE LINKS":"KURVE RECHTS"):"GERADE")+(y>.25?" + AUFTRIEB":y<-.25?" + DIP":"");
 $("#curve").textContent=(ph.curveM>=0?"+":"")+Math.round(ph.curveM*100)+" cm";
 $("#lift").textContent=(ph.liftM>=0?"+":"")+Math.round(ph.liftM*100)+" cm";
 $("#quality").textContent=ph.quality+"%";
 $("#contactLabel").textContent=(Math.abs(x)<.12&&Math.abs(y)<.12)?"MITTE":(x<-.12?"LINKS ":x>.12?"RECHTS ":"")+(y<-.12?"OBEN":y>.12?"UNTEN":"")
}
function openContact(){$("#contactModal").classList.remove("hidden");setContact(S.contact.x,S.contact.y)}function closeContact(){$("#contactModal").classList.add("hidden")}$("#contactBtn").onclick=openContact;$("#contactBtnMobile").onclick=openContact;$("#closeContact").onclick=closeContact;$("#applyContact").onclick=closeContact;$("#resetContact").onclick=()=>setContact(0,0);$("#contactBall").onpointerdown=e=>{const r=e.currentTarget.getBoundingClientRect();setContact(((e.clientX-r.left)/r.width-.5)*2,((e.clientY-r.top)/r.height-.5)*2)};addEventListener("keydown",e=>{if(e.altKey&&(e.key==="b"||e.key==="B")&&!["INPUT","SELECT","TEXTAREA"].includes(document.activeElement?.tagName)){e.preventDefault();openContact()}if(e.key==="Escape")closeContact()});
$("#soundBtn").onclick=()=>$("#soundBtn").textContent=$("#soundBtn").textContent.includes("🔇")?"🔊 Sound":"🔇 Sound";
fill();