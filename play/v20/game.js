import * as THREE from "https://esm.sh/three@0.152.2";
import { GLTFLoader } from "https://esm.sh/three@0.152.2/examples/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "https://esm.sh/three@0.152.2/examples/jsm/utils/SkeletonUtils.js";

const TEAMS=[
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
   this.sideCamera=new THREE.PerspectiveCamera(38,16/9,.1,100);
   this.sideCamera.position.set(6.6,2.15,2.7);this.sideCamera.lookAt(0,1.05,.45);
   const probe=document.createElement("canvas");
   const gl2=probe.getContext("webgl2",{failIfMajorPerformanceCaveat:false});
   const gl1=!gl2&&probe.getContext("webgl",{failIfMajorPerformanceCaveat:false});
   if(!gl2&&!gl1)throw new Error("WEBGL_NOT_AVAILABLE");
   this.renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance",failIfMajorPerformanceCaveat:false});
   this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.65));
   this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
   this.renderer.outputColorSpace=THREE.SRGBColorSpace;
   this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
   this.renderer.toneMappingExposure=1.08;
   el.innerHTML="";el.appendChild(this.renderer.domElement);
   this.clock=new THREE.Clock();this.anim=[];this.targetMarker=null;this.player=null;this.keeper=null;this.ball=null;this.cameraTarget=new THREE.Vector3(0,1.15,4.2);this.realModel=null;this.prevFrameMs=performance.now();this.moveSeq=0;this.cameraMode="setup";this.cameraBase=new THREE.Vector3(0,2.55,15.5);this.keeperState="ready";this.keeperStateSince=0;this.stadiumEnvironment=null;this.ballCaught=false;this.goalLineZ=0;this.savePlaneZ=.72;this.showSideCam=false;this.sideCamHoldUntil=0;
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
   const minY=box?.min.y??0,maxY=box?.max.y??1;
   const skin=new THREE.Color(this.v20SkinColor||0xc98f70);
   const shorts=new THREE.Color(kit.shorts);
   mat.onBeforeCompile=shader=>{
     shader.uniforms.uV20MinY={value:minY};
     shader.uniforms.uV20MaxY={value:maxY};
     shader.uniforms.uV20Skin={value:skin};
     shader.uniforms.uV20Shorts={value:shorts};
     shader.vertexShader=shader.vertexShader
       .replace('#include <common>','#include <common>\nvarying vec3 vV20BindPos;')
       .replace('#include <begin_vertex>','#include <begin_vertex>\nvV20BindPos = position;');
     shader.fragmentShader=shader.fragmentShader
       .replace('#include <common>','#include <common>\nvarying vec3 vV20BindPos;\nuniform float uV20MinY;\nuniform float uV20MaxY;\nuniform vec3 uV20Skin;\nuniform vec3 uV20Shorts;')
       .replace('#include <color_fragment>',
         '#include <color_fragment>\n'+
         'float ny=clamp((vV20BindPos.y-uV20MinY)/max(0.0001,uV20MaxY-uV20MinY),0.0,1.0);\n'+
         '// The original long-pants mesh stays closed, so hip/butt can never open.\n'+
         '// Only the upper-thigh zone reads as shorts; lower leg reads as skin.\n'+
         'float shortMask=smoothstep(0.405,0.445,ny);\n'+
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
     const g=new THREE.Group();g.name='V20_SHORT_HEM_'+side;
     // Thin football-short cuff: close to the thigh, not a bulky shell.
     const cuff=new THREE.Mesh(new THREE.CylinderGeometry(.108,.113,.072,28,1,false),shortsMat);
     cuff.scale.z=.78;cuff.position.y=.145;cuff.castShadow=true;cuff.receiveShadow=true;g.add(cuff);
     const pipe=new THREE.Mesh(new THREE.TorusGeometry(.109,.0045,8,28),accentMat);
     pipe.rotation.x=Math.PI/2;pipe.position.y=.181;pipe.scale.z=.78;g.add(pipe);
     bone.add(g);return g
   };
   const makeBoot=(bone,side)=>{
     if(!bone)return null;
     const g=new THREE.Group();g.name='V20_BOOT_'+side;
     // Local +Y follows the foot toward the toe on this rig.
     const upper=new THREE.Mesh(new THREE.CapsuleGeometry(.052,.095,5,14),bootMat);
     upper.position.y=.083;upper.scale.set(1.0,1.05,.70);upper.castShadow=true;g.add(upper);
     const sole=new THREE.Mesh(new THREE.BoxGeometry(.105,.175,.018),soleMat);
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
   if(!isKeeper)this.buildV20RigKit(root,bones,team,height,false);
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
     const el=$("#commentary");if(el)el.textContent="V20A: geschlossene Shorts-Basis + rig-follow Cuffs + Stutzen/Boot-Pass geladen."
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
     THREE.MathUtils.clamp((bx+this.keeper.position.x)*.35,-1.2,1.2),
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
     this.renderer.setScissorTest(true);
     this.renderer.setScissor(x,y,iw,ih);
     this.renderer.setViewport(x,y,iw,ih);
     this.renderer.setClearColor(0x020910,1);
     this.renderer.clearDepth();
     this.renderer.render(this.scene,this.sideCamera);
     this.renderer.setScissorTest(false);
     this.renderer.setClearColor(0x07131f,1);
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
 async keeperDiveSequence(sim,duration=430){
   this.setKeeperState("react");
   this.stopKeeperIdle=true;
   const k=this.keeper,start=k.position.clone();
   const dir=sim.kx>=0?1:-1;
   const contact=new THREE.Vector3(sim.kx,Math.max(.28,sim.ky),sim.contactZ??.42);
   this.playRigClip(k,"Jump",{fade:.10,once:true,speed:1.08});
   this.setKeeperState("push_off");
   await this.tween(Math.max(90,duration*.20),e=>{
     k.position.x=THREE.MathUtils.lerp(start.x,contact.x*.28,e);
     k.position.y=.10*Math.sin(e*Math.PI);
     k.position.z=THREE.MathUtils.lerp(start.z,.28,e);
     k.rotation.z=-dir*.18*e;
   });
   this.setKeeperState("dive");
   await this.tween(Math.max(220,duration*.80),e=>{
     k.position.x=THREE.MathUtils.lerp(start.x+(contact.x*.28-start.x),contact.x,e);
     k.position.y=THREE.MathUtils.lerp(.08,Math.max(.12,contact.y*.36),Math.sin(e*Math.PI*.86));
     k.position.z=THREE.MathUtils.lerp(.28,contact.z,e);
     k.rotation.z=-dir*(.18+1.00*e);
   });
   this.setKeeperState(sim.outcome==="save"?"intercept":"miss");
 }
 catchBallAtKeeper(sim){
   if(!this.ball||!this.keeper)return;
   this.ballCaught=true;
   // keep ball in scene coordinates; updateCaughtBallHands() moves it between both hands.
   if(this.ball.parent!==this.scene)this.scene.attach(this.ball);
   this.closeKeeperHands();
   this.updateCaughtBallHands();
 }
 releaseCaughtBall(){if(!this.ballCaught||!this.ball)return;if(this.ball.parent!==this.scene)this.scene.attach(this.ball);this.ballCaught=false;}
 async keeperLandRecover(sim){
   const k=this.keeper,dir=sim.kx>=0?1:-1;
   this.setKeeperState("land");
   const p=k.position.clone(),rz=k.rotation.z;
   await this.tween(260,e=>{
     k.position.y=THREE.MathUtils.lerp(p.y,.02,e);
     k.position.z=THREE.MathUtils.lerp(p.z,.34,e);
     k.rotation.z=THREE.MathUtils.lerp(rz,-dir*1.28,e);
   });
   await new Promise(r=>setTimeout(r,120));
   this.setKeeperState("recover");
   this.playRigClip(k,"Idle",{fade:.18,speed:.9});
   const lp=k.position.clone(),lrz=k.rotation.z;
   await this.tween(420,e=>{
     const smooth=e*e*(3-2*e);
     k.position.x=THREE.MathUtils.lerp(lp.x,THREE.MathUtils.clamp(lp.x,-.65,.65),smooth);
     k.position.y=THREE.MathUtils.lerp(lp.y,0,smooth);
     k.position.z=THREE.MathUtils.lerp(lp.z,.35,smooth);
     k.rotation.z=THREE.MathUtils.lerp(lrz,0,smooth);
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
   this.updateV20RigKit(this.player,att);
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
   if(this.keeper?.userData?.mixer)this.keeper.userData.mixer.update(dt);
   if(this.ballCaught)this.updateCaughtBallHands();
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
   const duration=THREE.MathUtils.clamp(520-(S.power-50)*2.6,330,520);
   const b0=this.ball.position.clone();

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
 reset(){this.endSideCam(true);this.releaseCaughtBall();this.stopKeeperIdle=false;this.setKeeperState("ready");this.player.position.set(S.playerPos.x,0,S.playerPos.z);this.player.rotation.set(0,Math.PI,0);if(this.player.userData.headPivot)this.player.userData.headPivot.rotation.set(0,0,0);this.player.scale.setScalar(1);this.player.armL.rotation.set(0,0,-.1);this.player.armR.rotation.set(0,0,.1);this.player.legL.rotation.set(0,0,0);this.player.legR.rotation.set(0,0,0);
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
function board(){const row=s=>{const t=sideTeam(s),own=S.shots.filter(x=>x.side===s),tk=taken(s);return '<div class="score-row '+(S.side===s&&!S.finished?"active":"")+'"><div class="score-team">'+t.flag+" "+t.name+'<small>TW: '+t.keeper.name+'</small></div><div class="score-num">'+goals(s)+'</div><div class="kicks">'+t.shooters.map((p,i)=>{const sh=own[i],cl=sh?(sh.outcome==="goal"?"good":"bad"):(i===tk&&S.side===s?"now":"");return '<span class="kick '+cl+'"><b>'+p[0].split(" ").slice(-1)[0]+'</b>'+(sh?(sh.outcome==="goal"?"✓":"✕"):"·")+'</span>'}).join("")+own.slice(5).map(sh=>'<span class="kick '+(sh.outcome==="goal"?"good":"bad")+'"><b>'+sh.shooter.split(" ").slice(-1)[0]+'</b>'+(sh.outcome==="goal"?"✓":"✕")+"</span>").join("")+"</div></div>"};$("#scoreboard").innerHTML=row("A")+row("B")}
function ui(){const oc=$("#outcomeCallout");if(oc)oc.classList.add("hidden");S.playerPos={x:-1.2,z:12.2};board();const a=sideTeam(S.side),d=oppTeam(S.side),sh=shooter(S.side);$("#turnTitle").textContent=a.flag+" "+a.name+" am Punkt";$("#turnMeta").textContent=sh[0]+" gegen "+d.keeper.name;$("#shooter").textContent=sh[0];$("#shooterMeta").textContent=a.name+" · Stärke "+sh[1]+"/25";$("#keeper").textContent=d.keeper.name;$("#keeperMeta").textContent=d.keeper.club+" · Stärke "+d.keeper.strength+"/25";$("#pressure").textContent=S.sudden?"SUDDEN DEATH":taken(S.side)>=4?"MATCHBALL":"DRUCK";$("#commentary").textContent="Ziel setzen. Mit Alt+B kannst du zusätzlich festlegen, wo der Fuß den Ball trifft.";world.setTeams(a,d);world.applyHairForTurn(a,d,taken(S.side)%10);world.reset();world.updatePositionReadout();enableShoot(false);S.target.set=false;$("#aim").textContent="— / —"}
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
async function shootNow(){if(S.busy||S.finished||!S.target.set)return;S.busy=true;enableShoot(false);const side=S.side,a=sideTeam(side),d=oppTeam(side),sh=shooter(side),sim=simulate(sh,d.keeper);$("#commentary").textContent=sh[0]+" läuft an …";await world.shoot(sim);S.shots.push({side,team:a.name,shooter:sh[0],keeper:d.keeper.name,power:S.power,contactX:S.contact.x,contactY:S.contact.y,...sim});if(side==="A"){S.ta++;if(sim.outcome==="goal")S.a++}else{S.tb++;if(sim.outcome==="goal")S.b++}$("#commentary").textContent=sim.outcome==="goal"?"TOR!":sim.outcome==="save"?"GEHALTEN!":sim.outcome==="post"?(sim.frameType==="crossbar"?"LATTE!":"PFOSTEN!"):"DANEBEN!";showOutcomeCallout(sim.outcome,sim.frameType);board();await new Promise(r=>setTimeout(r,850));if(ended()){finish();return}S.side=side==="A"?"B":"A";if(S.ta>=5&&S.tb>=5&&S.a===S.b)S.sudden=true;S.busy=false;ui()}
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
const _ms=document.querySelector("#moduleStatus");if(_ms){_ms.textContent="3D-Modul bereit";_ms.style.color="#63e6a3";}