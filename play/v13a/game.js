import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js";

const TEAMS=[
{id:"ger14",name:"Deutschland 2014",nation:"Deutschland",flag:"🇩🇪",shirt:0xf2f2f2,shorts:0x171b22,keeperColor:0xe4b72f,keeper:{name:"Manuel Neuer",club:"FC Bayern München",strength:24},shooters:[["Thomas Müller",24],["Toni Kroos",23],["Bastian Schweinsteiger",23],["Mario Götze",22],["Miroslav Klose",22]]},
{id:"arg22",name:"Argentinien 2022",nation:"Argentinien",flag:"🇦🇷",shirt:0x79cfee,shorts:0xffffff,keeperColor:0x2b7b45,keeper:{name:"Emiliano Martínez",club:"Aston Villa",strength:23},shooters:[["Lionel Messi",23],["Ángel Di María",20],["Lautaro Martínez",20],["Julián Álvarez",19],["Leandro Paredes",21]]},
{id:"ita06",name:"Italien 2006",nation:"Italien",flag:"🇮🇹",shirt:0x1558b0,shorts:0xffffff,keeperColor:0xd29f2c,keeper:{name:"Gianluigi Buffon",club:"Juventus",strength:23},shooters:[["Francesco Totti",20],["Andrea Pirlo",20],["Alessandro Del Piero",22],["Daniele De Rossi",17],["Marco Materazzi",19]]},
{id:"esp10",name:"Spanien 2010",nation:"Spanien",flag:"🇪🇸",shirt:0xc61f2d,shorts:0x283a65,keeperColor:0x1f7a42,keeper:{name:"Iker Casillas",club:"Real Madrid",strength:23},shooters:[["David Villa",22],["Xavi",23],["Andrés Iniesta",23],["Xabi Alonso",21],["Fernando Torres",21]]}
];
const $=s=>document.querySelector(s);
const S={A:null,B:null,side:"A",a:0,b:0,ta:0,tb:0,shots:[],target:{x:0,y:1.2,set:false},contact:{x:0,y:0},power:78,busy:false,sudden:false,finished:false,playerPos:{x:-1.2,z:12.2}};
let world=null;
let contactDraft={x:0,y:0};

function T(id){return TEAMS.find(t=>t.id===id)}
function fill(){for(const id of ["teamA","teamB"]){$("#"+id).innerHTML=TEAMS.map(t=>'<option value="'+t.id+'">'+t.flag+" "+t.name+"</option>").join("")}$("#teamA").value="ger14";$("#teamB").value="arg22";preview()}
function preview(){const a=T($("#teamA").value),b=T($("#teamB").value);$("#preview").innerHTML=[a,b].map(t=>'<div><b>'+t.flag+" "+t.name+'</b><small>TW: '+t.keeper.name+" · "+t.keeper.club+'</small><p>'+t.shooters.map((p,i)=>(i+1)+". "+p[0]).join("<br>")+"</p></div>").join("")}
$("#teamA").onchange=()=>{if($("#teamA").value===$("#teamB").value)$("#teamB").value=TEAMS.find(t=>t.id!==$("#teamA").value).id;preview()};
$("#teamB").onchange=()=>{if($("#teamA").value===$("#teamB").value)$("#teamA").value=TEAMS.find(t=>t.id!==$("#teamB").value).id;preview()};

class World3D{
 constructor(el){
   this.el=el;this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0x07131f);
   this.camera=new THREE.PerspectiveCamera(44,16/9,.1,100);this.camera.position.set(0,2.55,15.5);this.camera.lookAt(0,1.15,4.2);
   const probe=document.createElement("canvas");
   const gl2=probe.getContext("webgl2",{failIfMajorPerformanceCaveat:false});
   const gl1=!gl2&&probe.getContext("webgl",{failIfMajorPerformanceCaveat:false});
   if(!gl2&&!gl1)throw new Error("WEBGL_NOT_AVAILABLE");
   this.renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"default",failIfMajorPerformanceCaveat:false});
   this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;el.innerHTML="";el.appendChild(this.renderer.domElement);
   this.clock=new THREE.Clock();this.anim=[];this.targetMarker=null;this.player=null;this.keeper=null;this.ball=null;this.cameraTarget=new THREE.Vector3(0,1.15,4.2);
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
   this.player=this.makeHuman(1.80,0xf2f2f2,0x171b22,false);this.setHairStyle(this.player,0);this.player.position.set(-1.2,0,12.2);this.player.rotation.y=Math.PI;this.scene.add(this.player);
   this.keeper=this.makeHuman(1.92,0xe4b72f,0x182235,true);this.setHairStyle(this.keeper,10);this.keeper.position.set(0,0,.35);this.keeper.rotation.y=0;this.scene.add(this.keeper);
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
     this.camera.position.copy(desired);this.camera.lookAt(look);return
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
   S.playerPos.x=nx;S.playerPos.z=nz;
   if(!this.player||S.busy)return;
   if(animate){
     const from=this.player.position.clone(),to=new THREE.Vector3(nx,0,nz);
     this.tween(140,e=>{this.player.position.lerpVectors(from,to,e);const g=Math.sin(e*Math.PI*2);this.player.legL.rotation.x=.18*g;this.player.legR.rotation.x=-.18*g});
   } else this.player.position.set(nx,0,nz);
   this.updatePositionReadout();this.updateCameraForPlayer(false);
 }
 movePlayer(dx,dz){if(S.busy||S.finished)return;this.stopIdle();this.setPlayerPosition(S.playerPos.x+dx,S.playerPos.z+dz,true);this.startIdle()}
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
   this.setHairStyle(this.player,playerStyle);this.setFaceStyle(this.player,teamIndex*5+shooterIndex);
   this.setHairStyle(this.keeper,keeperStyle);this.setFaceStyle(this.keeper,defIndex*5+4);
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
   const t=this.clock.getElapsedTime();
   if(this.idle&&!S.busy){
     const idleAge=Math.max(0,t-(this.idleSince||t));
     const breathe=Math.sin(t*1.35);
     this.player.position.x=S.playerPos.x+Math.sin(t*.9)*.03;
     this.player.position.z=S.playerPos.z+Math.sin(t*.63)*.02;
     this.player.position.y=.012*breathe;
     this.player.scale.setScalar(1+Math.sin(t*.63)*.006);

     // Small natural stance shifts.
     this.player.armL.rotation.z=-.10+Math.sin(t*.85)*.025;
     this.player.armR.rotation.z=.10-Math.sin(t*.85)*.025;
     this.player.armL.userData.fore.rotation.x=.05+Math.sin(t*.72)*.035;
     this.player.armR.userData.fore.rotation.x=.05-Math.sin(t*.72)*.035;
     this.player.legL.userData.shin.rotation.x=Math.max(0,Math.sin(t*.7))*.035;
     this.player.legR.userData.shin.rotation.x=Math.max(0,-Math.sin(t*.7))*.035;

     // After waiting, the player turns partially toward the user so the face becomes visible.
     // The motion is slow and cyclic, like a glance over the shoulder, not a robotic 180-degree spin.
     const hp=this.player.userData.headPivot;
     let bodyTurn=0,headTurn=0;
     if(idleAge>4.5){
       const phase=(idleAge-4.5)%8.5;
       const rise=phase<1.5?phase/1.5:phase<5.3?1:phase<6.8?(6.8-phase)/1.5:0;
       const eased=rise*rise*(3-2*rise);
       const side=(Math.floor((idleAge-4.5)/8.5)%2===0)?-1:1;
       bodyTurn=side*.38*eased;
       headTurn=side*.90*eased;
       // Gesture: one forearm briefly lifts, as if asking "ready?"
       const gesture=Math.max(0,Math.sin(Math.PI*THREE.MathUtils.clamp((phase-2.0)/2.4,0,1)));
       if(side<0){
         this.player.armR.rotation.x=-.22*gesture;
         this.player.armR.userData.fore.rotation.x=.55*gesture;
       }else{
         this.player.armL.rotation.x=-.22*gesture;
         this.player.armL.userData.fore.rotation.x=.55*gesture;
       }
     }
     this.player.rotation.y=Math.PI+bodyTurn;
     if(hp){
       hp.rotation.y=headTurn;
       hp.rotation.x=.025*Math.sin(t*.55);
       hp.rotation.z=.018*Math.sin(t*.43);
     }

     this.keeper.position.x=Math.sin(t*1.25)*.52;
     this.keeper.position.z=.35+Math.sin(t*.85)*.08;
     this.keeper.armL.rotation.z=-.52+Math.sin(t*1.7)*.08;
     this.keeper.armR.rotation.z=.52-Math.sin(t*1.7)*.08;
     this.keeper.legL.userData.shin.rotation.x=.10+Math.sin(t*1.6)*.04;
     this.keeper.legR.userData.shin.rotation.x=.10-Math.sin(t*1.6)*.04;
   }
   this.anim=this.anim.filter(a=>{
     const p=Math.min(1,(performance.now()-a.t0)/a.d),e=1-Math.pow(1-p,3);
     a.step(e,p);if(p>=1){a.done?.();return false}return true
   });
   this.renderer.render(this.scene,this.camera)
 }
 tween(d,step){return new Promise(res=>this.anim.push({t0:performance.now(),d,step,done:res}))}
 pickGoal(e){if(S.busy||S.finished)return;const r=this.renderer.domElement.getBoundingClientRect(),m=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1),ray=new THREE.Raycaster();ray.setFromCamera(m,this.camera);const hit=ray.intersectObject(this.hitPlane)[0];if(!hit)return;S.target.x=THREE.MathUtils.clamp(hit.point.x,-3.55,3.55);S.target.y=THREE.MathUtils.clamp(hit.point.y,.08,2.36);S.target.set=true;this.showMarker();$("#aim").textContent=Math.round((S.target.x/7.32+.5)*100)+" / "+Math.round(S.target.y/2.44*100);enableShoot(true);$("#commentary").textContent="Ziel gesetzt. Optional Alt+B für Ballkontakt, dann Power und Schießen."}
 showMarker(){if(this.targetMarker)this.scene.remove(this.targetMarker);const ring=new THREE.Mesh(new THREE.RingGeometry(.12,.16,32),new THREE.MeshBasicMaterial({color:0x62e7ff,side:THREE.DoubleSide}));ring.position.set(S.target.x,S.target.y,.08);this.scene.add(ring);this.targetMarker=ring}
 async shoot(sim){
   this.stopIdle();this.resetIdlePose();const p0=this.player.position.clone(),approach=new THREE.Vector3(-.28,0,11.30),p2=new THREE.Vector3(.18,0,10.85);
   const runDistance=Math.hypot(p0.x-approach.x,p0.z-approach.z);
   const runMs=THREE.MathUtils.clamp(280+runDistance*150,340,1050);
   const p1=new THREE.Vector3(THREE.MathUtils.lerp(p0.x,approach.x,.72),0,THREE.MathUtils.lerp(p0.z,approach.z,.72));
   await this.tween(runMs*.68,e=>{this.player.position.lerpVectors(p0,p1,e);this.player.legL.rotation.x=.48*Math.sin(e*Math.PI*2);this.player.legR.rotation.x=-.56*Math.sin(e*Math.PI*2);
 this.player.legL.userData.shin.rotation.x=Math.max(0,-Math.sin(e*Math.PI*2))*.75;this.player.legR.userData.shin.rotation.x=Math.max(0,Math.sin(e*Math.PI*2))*.75;
 this.player.armL.rotation.x=-.42*Math.sin(e*Math.PI*2);this.player.armR.rotation.x=.42*Math.sin(e*Math.PI*2);
 this.player.armL.userData.fore.rotation.x=.18+Math.max(0,Math.sin(e*Math.PI*2))*.25;this.player.armR.userData.fore.rotation.x=.18+Math.max(0,-Math.sin(e*Math.PI*2))*.25});
   await this.tween(Math.max(150,runMs*.32),e=>{this.player.position.lerpVectors(p1,p2,e);this.player.legR.rotation.x=-1.05*Math.sin(e*Math.PI);
 this.player.legR.userData.shin.rotation.x=1.35*Math.sin(e*Math.PI);
 this.player.legL.rotation.x=.16*Math.sin(e*Math.PI);
 this.player.rotation.y=Math.PI-.12*e});
   const kp0=this.keeper.position.clone(),kdir=sim.kx>=0?1:-1;this.tween(420,e=>{this.keeper.position.x=THREE.MathUtils.lerp(kp0.x,sim.kx,e);this.keeper.position.y=Math.sin(e*Math.PI)*.35;this.keeper.position.z=THREE.MathUtils.lerp(kp0.z,.2,e);this.keeper.rotation.z=-kdir*.95*e;this.keeper.armL.rotation.z=-.5-kdir*.7*e;this.keeper.armR.rotation.z=.5-kdir*.7*e;
 this.keeper.armL.userData.fore.rotation.z=-kdir*.28*e;this.keeper.armR.userData.fore.rotation.z=-kdir*.28*e;
 this.keeper.legL.rotation.z=-kdir*.18*e;this.keeper.legR.rotation.z=-kdir*.32*e;
 this.keeper.legL.userData.shin.rotation.x=.35*e;this.keeper.legR.userData.shin.rotation.x=.48*e});
   const b0=this.ball.position.clone(),b1=new THREE.Vector3(sim.ax,sim.ay,0),cx=(b0.x+b1.x)/2+sim.curveX,cy=(b0.y+b1.y)/2+sim.curveY,cz=(b0.z+b1.z)/2-1.5;
   await this.tween(460+(100-S.power)*2,(e,p)=>{const u=1-e;this.ball.position.set(u*u*b0.x+2*u*e*cx+e*e*b1.x,u*u*b0.y+2*u*e*cy+e*e*b1.y,u*u*b0.z+2*u*e*cz+e*e*b1.z);this.ball.rotation.x+=.25;this.ball.rotation.y+=.18+Math.abs(sim.spinX)*.05});
   if(sim.outcome==="goal")await this.tween(130,e=>this.ball.position.z=-.7*e);
   if(sim.outcome==="save"){const q=this.ball.position.clone();await this.tween(220,e=>{this.ball.position.x=q.x+kdir*.7*e;this.ball.position.z=q.z+1.3*e;this.ball.position.y=Math.max(.11,q.y-.4*e)})}
   if(sim.outcome==="post"){const q=this.ball.position.clone();await this.tween(220,e=>{this.ball.position.x=q.x-kdir*.9*e;this.ball.position.z=q.z+1.2*e})}
   await this.tween(320,e=>{this.player.position.lerpVectors(p2,new THREE.Vector3(.75,0,10.2),e);this.player.rotation.y=Math.PI-.25*e});
 }
 reset(){this.player.position.set(S.playerPos.x,0,S.playerPos.z);this.player.rotation.set(0,Math.PI,0);if(this.player.userData.headPivot)this.player.userData.headPivot.rotation.set(0,0,0);this.player.scale.setScalar(1);this.player.armL.rotation.set(0,0,-.1);this.player.armR.rotation.set(0,0,.1);this.player.legL.rotation.set(0,0,0);this.player.legR.rotation.set(0,0,0);
 this.player.legL.userData.shin.rotation.set(0,0,0);this.player.legR.userData.shin.rotation.set(0,0,0);
 this.player.armL.userData.fore.rotation.set(0,0,0);this.player.armR.userData.fore.rotation.set(0,0,0);
 this.keeper.position.set(0,0,.35);this.keeper.rotation.set(0,0,0);this.keeper.armL.rotation.set(0,0,-.48);this.keeper.armR.rotation.set(0,0,.48);
 this.keeper.armL.userData.fore.rotation.set(0,0,0);this.keeper.armR.userData.fore.rotation.set(0,0,0);
 this.keeper.legL.rotation.set(0,0,0);this.keeper.legR.rotation.set(0,0,0);
 this.keeper.legL.userData.shin.rotation.set(0,0,0);this.keeper.legR.userData.shin.rotation.set(0,0,0);
 this.ball.position.set(0,.11,11);this.ball.rotation.set(0,0,0);if(this.targetMarker){this.scene.remove(this.targetMarker);this.targetMarker=null}this.updateCameraForPlayer(true);this.startIdle()}
}

function sideTeam(s){return s==="A"?S.A:S.B}function oppTeam(s){return s==="A"?S.B:S.A}function taken(s){return s==="A"?S.ta:S.tb}function goals(s){return s==="A"?S.a:S.b}function shooter(s){const t=sideTeam(s);return t.shooters[taken(s)%t.shooters.length]}
function syncPower(v){S.power=+v;$("#power").value=v;$("#powerMobile").value=v;$("#powerVal").textContent=v+"%";$("#powerMobileVal").textContent=v+"%"}function enableShoot(v){$("#shootBtn").disabled=!v;$("#shootMobile").disabled=!v}
function board(){const row=s=>{const t=sideTeam(s),own=S.shots.filter(x=>x.side===s),tk=taken(s);return '<div class="score-row '+(S.side===s&&!S.finished?"active":"")+'"><div class="score-team">'+t.flag+" "+t.name+'<small>TW: '+t.keeper.name+'</small></div><div class="score-num">'+goals(s)+'</div><div class="kicks">'+t.shooters.map((p,i)=>{const sh=own[i],cl=sh?(sh.outcome==="goal"?"good":"bad"):(i===tk&&S.side===s?"now":"");return '<span class="kick '+cl+'"><b>'+p[0].split(" ").slice(-1)[0]+'</b>'+(sh?(sh.outcome==="goal"?"✓":"✕"):"·")+'</span>'}).join("")+own.slice(5).map(sh=>'<span class="kick '+(sh.outcome==="goal"?"good":"bad")+'"><b>'+sh.shooter.split(" ").slice(-1)[0]+'</b>'+(sh.outcome==="goal"?"✓":"✕")+"</span>").join("")+"</div></div>"};$("#scoreboard").innerHTML=row("A")+row("B")}
function ui(){S.playerPos={x:-1.2,z:12.2};board();const a=sideTeam(S.side),d=oppTeam(S.side),sh=shooter(S.side);$("#turnTitle").textContent=a.flag+" "+a.name+" am Punkt";$("#turnMeta").textContent=sh[0]+" gegen "+d.keeper.name;$("#shooter").textContent=sh[0];$("#shooterMeta").textContent=a.name+" · Stärke "+sh[1]+"/25";$("#keeper").textContent=d.keeper.name;$("#keeperMeta").textContent=d.keeper.club+" · Stärke "+d.keeper.strength+"/25";$("#pressure").textContent=S.sudden?"SUDDEN DEATH":taken(S.side)>=4?"MATCHBALL":"DRUCK";$("#commentary").textContent="Ziel setzen. Mit Alt+B kannst du zusätzlich festlegen, wo der Fuß den Ball trifft.";world.setTeams(a,d);world.applyHairForTurn(a,d,taken(S.side)%10);world.reset();world.updatePositionReadout();enableShoot(false);S.target.set=false;$("#aim").textContent="— / —"}
function gauss(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function simulate(sh,kp){const pn=(S.power-45)/55,ss=sh[1],ks=kp.strength,disp=.14-(ss-18)*.008+Math.max(0,pn-.6)*.11,cp=contactPhysicsPreview(S.contact.x,S.contact.y),spinX=cp.sideSpin,spinY=cp.verticalSpin;let ax=S.target.x+gauss()*disp+spinX*.22,ay=S.target.y+gauss()*disp*.7-spinY*.18;let out=(Math.abs(ax)>3.66||ay<0||ay>2.44)?"miss":"goal";if(out==="goal"&&(Math.abs(Math.abs(ax)-3.66)<.08||Math.abs(ay-2.44)<.08)&&Math.random()<.34)out="post";let kx=(Math.random()<(.2+(ks-18)*.025))?ax:gauss()*1.45,ky=.9+Math.random()*1.0,dist=Math.hypot(ax-kx,(ay-ky)*1.25),saveRadius=.68+(ks-18)*.045-(ss-18)*.035-pn*.12;if(out==="goal"&&dist<saveRadius)out="save";if(out==="goal"&&Math.abs(ax-kx)<.45)kx+=ax>=0?-.9:.9;if(out==="save"){ax=kx+(ax-kx)*.3;ay=ky+(ay-ky)*.3}return{outcome:out,ax,ay,kx:THREE.MathUtils.clamp(kx,-3.2,3.2),ky,spinX,spinY,curveX:spinX*.75,curveY:spinY*.38}}
function ended(){if(S.ta<5||S.tb<5){const ra=5-S.ta,rb=5-S.tb;return S.a>S.b+rb||S.b>S.a+ra}return S.ta===S.tb&&S.a!==S.b}
async function shootNow(){if(S.busy||S.finished||!S.target.set)return;S.busy=true;enableShoot(false);const side=S.side,a=sideTeam(side),d=oppTeam(side),sh=shooter(side),sim=simulate(sh,d.keeper);$("#commentary").textContent=sh[0]+" läuft an …";await world.shoot(sim);S.shots.push({side,team:a.name,shooter:sh[0],keeper:d.keeper.name,power:S.power,contactX:S.contact.x,contactY:S.contact.y,...sim});if(side==="A"){S.ta++;if(sim.outcome==="goal")S.a++}else{S.tb++;if(sim.outcome==="goal")S.b++}$("#commentary").textContent=sim.outcome==="goal"?"TOR!":sim.outcome==="save"?"PARADE!":sim.outcome==="post"?"PFOSTEN!":"DANEBEN!";board();await new Promise(r=>setTimeout(r,850));if(ended()){finish();return}S.side=side==="A"?"B":"A";if(S.ta>=5&&S.tb>=5&&S.a===S.b)S.sudden=true;S.busy=false;ui()}
function finish(){S.finished=true;const win=S.a>S.b?"A":"B";$("#game").classList.add("hidden");$("#result").classList.remove("hidden");$("#winner").innerHTML='<div class="winner-wrap"><div class="winner-team '+(win==="A"?"win":"lose")+'"><div>'+S.A.flag+'</div><h3>'+S.A.name+'</h3><strong>'+S.a+'</strong><br><span>'+(win==="A"?"SIEGER":"AUSGESCHIEDEN")+'</span></div><div class="vs">:</div><div class="winner-team '+(win==="B"?"win":"lose")+'"><div>'+S.B.flag+'</div><h3>'+S.B.name+'</h3><strong>'+S.b+'</strong><br><span>'+(win==="B"?"SIEGER":"AUSGESCHIEDEN")+'</span></div></div>';$("#log").innerHTML=S.shots.map((x,i)=>'<div class="log-row '+(x.outcome==="goal"?"good":"bad")+'"><span>'+(x.outcome==="goal"?"✓":"✕")+'</span><div><b>'+(i+1)+". "+x.shooter+'</b><small>'+x.team+" · "+x.power+'% · Kontakt '+(Math.round(x.contactX*100))+"/"+(Math.round(x.contactY*100))+'</small></div><b>'+(x.outcome==="goal"?"GETROFFEN":x.outcome==="save"?"GEHALTEN":x.outcome==="post"?"PFOSTEN":"DANEBEN")+"</b></div>").join("")}
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
function start(){S.A=T($("#teamA").value);S.B=T($("#teamB").value);Object.assign(S,{side:"A",a:0,b:0,ta:0,tb:0,shots:[],power:78,busy:false,sudden:false,finished:false,playerPos:{x:-1.2,z:12.2}});S.target={x:0,y:1.2,set:false};S.contact={x:0,y:0};syncPower(78);$("#setup").classList.add("hidden");$("#result").classList.add("hidden");$("#game").classList.remove("hidden");try{
   clearRenderError();
   if(!world)world=new World3D($("#stage"));
   setTimeout(ui,120);
 }catch(err){
   console.error("Penalty Clash 3D init failed",err);
   showRenderError(err);
 }}
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
function openContact(){
 contactDraft={x:S.contact.x,y:S.contact.y};
 $("#contactModal").classList.remove("hidden");
 setContact(contactDraft.x,contactDraft.y);
}
function closeContact(){$("#contactModal").classList.add("hidden")}
function applyContact(){
 S.contact={x:contactDraft.x,y:contactDraft.y};
 $("#contactLabel").textContent=contactLabel(S.contact.x,S.contact.y);
 closeContact();
 $("#commentary").textContent="Ballkontakt übernommen: "+contactLabel(S.contact.x,S.contact.y)+". Jetzt Ziel/Power prüfen und schießen.";
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
$("#soundBtn").onclick=()=>$("#soundBtn").textContent=$("#soundBtn").textContent.includes("🔇")?"🔊 Sound":"🔇 Sound";
fill();