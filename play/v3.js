
/* BetInsight Penalty Clash V3 · alternating World-Cup-style shootout */
(function(){
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const S={homeTeam:null,awayTeam:null,homeKeeper:null,awayKeeper:null,current:"A",aGoals:0,bGoals:0,aTaken:0,bTaken:0,shots:[],busy:false,targetX:.5,targetY:.5,power:78,sudden:false,finished:false};
  let ctx=null,tensionOsc=null,tensionGain=null;

  function audio(){
    try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==="suspended")ctx.resume();return ctx}catch(e){return null}
  }
  function stopTension(){
    try{if(tensionGain){tensionGain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.08)}if(tensionOsc){tensionOsc.stop(ctx.currentTime+.1)}}catch(e){}
    tensionOsc=tensionGain=null;
  }
  function tension(){
    stopTension();const a=audio();if(!a)return;
    const o=a.createOscillator(),g=a.createGain();o.type="sine";o.frequency.value=74;g.gain.value=.0001;
    o.connect(g);g.connect(a.destination);g.gain.exponentialRampToValueAtTime(.045,a.currentTime+.25);
    o.start();tensionOsc=o;tensionGain=g;
  }
  function thump(){
    const a=audio();if(!a)return;const o=a.createOscillator(),g=a.createGain(),t=a.currentTime;
    o.type="sine";o.frequency.setValueAtTime(98,t);o.frequency.exponentialRampToValueAtTime(52,t+.14);
    g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);o.connect(g);g.connect(a.destination);o.start();o.stop(t+.18)
  }
  function crowdNoise(dur=.7,gain=.055){
    const a=audio();if(!a)return;const n=Math.floor(a.sampleRate*dur),b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);
    for(let i=0;i<n;i++){const env=Math.sin(Math.PI*i/n);d[i]=(Math.random()*2-1)*env}
    const s=a.createBufferSource(),g=a.createGain(),f=a.createBiquadFilter();f.type="bandpass";f.frequency.value=820;f.Q.value=.55;
    s.buffer=b;g.gain.value=gain;s.connect(f);f.connect(g);g.connect(a.destination);s.start()
  }
  function cheer(){
    crowdNoise(1.05,.095);const a=audio();if(!a)return;
    [420,520,660].forEach((f,i)=>{const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+i*.045;o.type="triangle";o.frequency.value=f;g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(.035,t+.03);g.gain.exponentialRampToValueAtTime(.001,t+.45);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+.5)})
  }
  function ohhh(){
    crowdNoise(.85,.06);const a=audio();if(a){
      [220,185,150].forEach((f,i)=>{const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+i*.055;o.type="sine";o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*.72,t+.55);g.gain.setValueAtTime(.045,t);g.gain.exponentialRampToValueAtTime(.001,t+.6);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+.62)})
    }
    try{
      if("speechSynthesis" in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance("Ooooh!");u.rate=.72;u.pitch=.62;u.volume=.28;speechSynthesis.speak(u)}
    }catch(e){}
  }
  function ping(){const a=audio();if(!a)return;const o=a.createOscillator(),g=a.createGain(),t=a.currentTime;o.type="sine";o.frequency.value=1280;g.gain.value=.08;g.gain.exponentialRampToValueAtTime(.001,t+.26);o.connect(g);g.connect(a.destination);o.start();o.stop(t+.27)}

  function matchingTeam(nation){return TEAMS.find(t=>t.name.startsWith(nation+" "))||null}
  function matchingKeeper(t){return KEEPERS.find(k=>t.name.startsWith(k.nation+" "))||KEEPERS[0]}
  function abbr(n){const p=String(n).trim().split(/\s+/);return p.length===1?p[0]:p[p.length-1]}
  function shooterFor(side){
    const team=side==="A"?S.homeTeam:S.awayTeam;
    const taken=side==="A"?S.aTaken:S.bTaken;
    return team.shooters[taken%team.shooters.length]
  }
  function keeperForShot(side){return side==="A"?S.awayKeeper:S.homeKeeper}
  function teamFor(side){return side==="A"?S.homeTeam:S.awayTeam}
  function scoreFor(side){return side==="A"?S.aGoals:S.bGoals}
  function takenFor(side){return side==="A"?S.aTaken:S.bTaken}

  function ensureV3UI(){
    const gameBody=$("#gamePanel .panel-body"),stadium=$(".stadium"),goal=$(".goal");
    if(!gameBody||!stadium||!goal)return;
    if(!$("#pcShootoutBoard")){
      const board=document.createElement("div");board.id="pcShootoutBoard";board.className="pc-shootout-board";
      const sb=$(".scoreboard");sb.parentNode.insertBefore(board,sb);sb.style.display="none";
    }
    if(!$(".pc-precision")){
      const grid=document.createElement("div");grid.className="pc-precision";grid.setAttribute("aria-label","Präzises Schussziel");
      const target=document.createElement("div");target.className="pc-target";target.id="pcTarget";
      goal.append(grid,target);
      grid.addEventListener("pointerdown",e=>{
        if(S.busy||S.finished)return;
        const r=goal.getBoundingClientRect();
        S.targetX=Math.max(.01,Math.min(.99,(e.clientX-r.left)/r.width));
        S.targetY=Math.max(.01,Math.min(.99,(e.clientY-r.top)/r.height));
        placeTarget();$("#shotTarget").textContent=Math.round(S.targetX*100)+" / "+Math.round((1-S.targetY)*100);
        tension();
      });
    }
    if(!$("#pcPowerBox")){
      const box=document.createElement("div");box.id="pcPowerBox";box.className="pc-power-box";
      box.innerHTML='<div class="pc-power-head"><b>Schussstärke wählen</b><span class="pc-power-val" id="pcPowerVal">78%</span></div><input class="pc-power" id="pcPower" type="range" min="45" max="100" value="78" step="1"><div class="pc-power-scale"><span>präziser</span><span>ausgewogen</span><span>maximal</span></div><button class="pc-shoot-btn" id="pcShootBtn">⚽ SCHIESSEN</button>';
      const engine=$("#shotStrength")?.closest(".sidebox");if(engine)engine.appendChild(box);
      $("#pcPower").oninput=e=>{S.power=+e.target.value;$("#pcPowerVal").textContent=S.power+"%";tension()};
      $("#pcShootBtn").onclick=()=>shoot();
    }
  }
  function placeTarget(){
    const t=$("#pcTarget");if(!t)return;t.style.left=(S.targetX*100)+"%";t.style.top=(S.targetY*100)+"%";t.classList.add("locked")
  }
  function buildBoard(){
    const b=$("#pcShootoutBoard");if(!b)return;
    const row=(side,team,keeper,taken,goals)=>'<div class="pc-team-row '+(S.current===side&&!S.finished?"active":"")+'" data-side="'+side+'"><div class="pc-team-title">'+team.flag+' '+team.name+'<small>Torwart: '+keeper.name+'</small></div><div class="pc-team-score">'+goals+'</div><div class="pc-kicks">'+buildChips(side,team,taken)+'</div></div>';
    b.innerHTML=row("A",S.homeTeam,S.homeKeeper,S.aTaken,S.aGoals)+row("B",S.awayTeam,S.awayKeeper,S.bTaken,S.bGoals);
  }
  function buildChips(side,team,taken){
    const own=S.shots.filter(x=>x.side===side);
    const regular=team.shooters.map((n,i)=>{
      const sh=own[i],cls=sh?(sh.outcome==="goal"?"goal":"fail"):(i===taken&&!S.sudden&&S.current===side?"current":"");
      const mark=sh?(sh.outcome==="goal"?"✓":"✕"):"·";
      return '<span class="pc-kick-chip '+cls+'"><b>'+abbr(n)+'</b>'+mark+'</span>'
    }).join("");
    const sudden=own.slice(5).map((sh,i)=>'<span class="pc-kick-chip sudden '+(sh.outcome==="goal"?"goal":"fail")+'"><b>'+abbr(sh.shooter)+'</b>'+(sh.outcome==="goal"?"✓":"✕")+'</span>').join("");
    return regular+sudden
  }
  function updateTurnUI(){
    buildBoard();const side=S.current,tm=teamFor(side),kp=keeperForShot(side),sh=shooterFor(side),ss=strengthFor(sh);
    $("#gameTitle").textContent=tm.flag+" "+tm.name+" · "+sh+" gegen "+kp.name;
    $("#shooterName").textContent=sh;
    $("#shooterMeta").textContent=tm.flag+" "+tm.name+" · "+(S.sudden?"Sudden Death":"Elfmeter "+(takenFor(side)+1)+" von 5")+" · Stärke "+ss+"/25";
    $("#shotStrength").textContent=ss+" / 25";
    $("#sideKeeper").textContent=kp.name;$("#sideNationality").textContent=kp.nation;$("#sideClub").textContent=kp.club;$("#sideRating").textContent=kp.rating+" / 100";$("#sideKeeperStrength").textContent=keeperStrengthFor(kp)+" / 25";
    $("#commentary").textContent=sh+" legt sich den Ball zurecht. "+kp.name+" wartet auf der Linie.";
    $("#prompt").textContent="Ziel im Raster setzen · Stärke wählen";
    const btn=$("#pcShootBtn");if(btn)btn.disabled=false;
    placeTarget();resetActors();tension();
  }
  function resetActors(){
    const p=$(".pc-player"),k=$("#keeperFigure"),b=$("#ball");if(p)p.className="pc-player";if(k)k.className="keeper ready";if(b){b.className="ball";b.removeAttribute("style")}
  }
  function gaussian(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
  function zoneFromXY(x,y){return (x<.333?"l":x>.667?"r":"c")+(y<.5?"t":"b")}
  function simulate(shooter,kp,x,y,power){
    const s=strengthFor(shooter),ks=keeperStrengthFor(kp),edge=Math.min(x,1-x,y,1-y);
    const powerN=(power-45)/55;
    const dispersion=Math.max(.012,.052-(s-18)*.0035 + Math.max(0,powerN-.62)*.055);
    let ax=x+gaussian()*dispersion, ay=y+gaussian()*dispersion*.78;
    const outside=ax<0||ax>1||ay<0||ay>1;
    const nearFrame=!outside&&(ax<.035||ax>.965||ay<.035);
    let outcome=outside?"miss":nearFrame&&Math.random()<(.16+.20*powerN)?"post":"goal";
    const read=.16+(ks-18)*.017;
    const kx=Math.random()<read?ax:.5+gaussian()*.21;
    const ky=Math.random()<read?ay:.52+gaussian()*.18;
    const dist=Math.hypot(ax-kx,(ay-ky)*1.18);
    if(outcome==="goal"){
      const saveRadius=.105+(ks-18)*.0065-(s-18)*.0032-(powerN*.028);
      if(dist<saveRadius)outcome="save";
    }
    ax=Math.max(-.12,Math.min(1.12,ax));ay=Math.max(-.10,Math.min(1.08,ay));
    return{outcome,targetX:x,targetY:y,actualX:ax,actualY:ay,dive:zoneFromXY(Math.max(0,Math.min(1,kx)),Math.max(0,Math.min(1,ky))),shooterStrength:s,keeperStrength:ks,power}
  }
  function wait(ms){return new Promise(r=>setTimeout(r,ms))}
  function localPoint(x,y){
    const goal=$(".goal"),stadium=$(".stadium"),gr=goal.getBoundingClientRect(),sr=stadium.getBoundingClientRect();
    return{x:gr.left-sr.left+gr.width*x,y:gr.top-sr.top+gr.height*y}
  }
  function ballStart(){
    const stadium=$(".stadium"),player=$(".pc-player");if(!stadium||!player)return{x:stadium.clientWidth*.44,y:stadium.clientHeight*.84};
    const pr=player.getBoundingClientRect(),sr=stadium.getBoundingClientRect();return{x:pr.left-sr.left+pr.width*.66,y:pr.top-sr.top+pr.height*.82}
  }
  function setBall(x,y,scale,rot){
    const b=$("#ball");b.style.left=x+"px";b.style.top=y+"px";b.style.bottom="auto";b.style.transform="translate(-50%,-50%) scale("+scale+") rotate("+rot+"deg)"
  }
  function fly(sim){
    const from=ballStart(),to=localPoint(sim.actualX,sim.actualY),dur=430+Math.round((100-sim.power)*2.1),b=$("#ball");
    return new Promise(resolve=>{const t0=performance.now();function frame(now){const p=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-p,3),arc=-Math.sin(Math.PI*p)*(28+sim.power*.16);setBall(from.x+(to.x-from.x)*e,from.y+(to.y-from.y)*e+arc,1-.47*e,900*e);if(p<1)requestAnimationFrame(frame);else resolve()}requestAnimationFrame(frame)})
  }
  function resultFx(sim){
    const res=$(".pc-result"),goal=$(".goal"),stad=$(".stadium"),flash=$(".pc-flash");
    const label=sim.outcome==="goal"?"TOR!":sim.outcome==="save"?"PARADE!":sim.outcome==="post"?"PFOSTEN!":"DANEBEN!";
    if(res){res.textContent=label;res.className="pc-result "+(sim.outcome==="goal"?"goal":sim.outcome==="save"?"save":sim.outcome)+" show"}
    if(sim.outcome==="goal"){goal?.classList.add("goal-net","goal-hit");cheer()}else if(sim.outcome==="post"){ping();ohhh()}else{ohhh()}
    flash?.classList.add("hit");stad?.classList.add(sim.outcome==="save"?"camera-save":"camera-kick");
    setTimeout(()=>{if(res)res.className="pc-result";goal?.classList.remove("goal-net","goal-hit");flash?.classList.remove("hit");stad?.classList.remove("camera-save","camera-kick")},820)
  }
  async function shoot(){
    if(S.busy||S.finished)return;S.busy=true;stopTension();const btn=$("#pcShootBtn");if(btn)btn.disabled=true;
    const side=S.current,sh=shooterFor(side),kp=keeperForShot(side),sim=simulate(sh,kp,S.targetX,S.targetY,S.power);
    const p=$(".pc-player"),fig=$("#keeperFigure");
    $("#prompt").textContent="ANLAUF …";if(p){p.className="pc-player runup";await wait(420);p.className="pc-player kick"}thump();await wait(55);if(fig)fig.className="keeper dive-"+sim.dive;
    await fly(sim);resultFx(sim);
    const shot={side,team:teamFor(side).name,shooter:sh,keeper:kp.name,...sim};S.shots.push(shot);
    if(side==="A"){S.aTaken++;if(sim.outcome==="goal")S.aGoals++}else{S.bTaken++;if(sim.outcome==="goal")S.bGoals++}
    $("#commentary").textContent=sim.outcome==="goal"?sh+" verwandelt gegen "+kp.name+".":sim.outcome==="save"?kp.name+" hält gegen "+sh+"!":sim.outcome==="post"?sh+" trifft nur den Pfosten.":sh+" setzt den Ball daneben.";
    buildBoard();await wait(1050);
    if(checkFinished()){finishV3();return}
    S.current=side==="A"?"B":"A";
    if(S.aTaken>=5&&S.bTaken>=5&&S.aGoals===S.bGoals)S.sudden=true;
    S.busy=false;updateTurnUI()
  }
  function checkFinished(){
    if(S.aTaken<5||S.bTaken<5){
      const remA=Math.max(0,5-S.aTaken),remB=Math.max(0,5-S.bTaken);
      if(S.aGoals>S.bGoals+remB)return true;
      if(S.bGoals>S.aGoals+remA)return true;
      return false
    }
    if(S.aTaken===S.bTaken&&S.aGoals!==S.bGoals)return true;
    return false
  }
  function recordKeeper(k,shotsFaced){
    try{const all=JSON.parse(localStorage.getItem("betinsight_penalty_keeper_stats_v1")||"{}"),s=all[k.id]||{games:0,shots:0,saves:0};s.games++;s.shots+=shotsFaced.length;s.saves+=shotsFaced.filter(x=>x.outcome==="save").length;all[k.id]=s;localStorage.setItem("betinsight_penalty_keeper_stats_v1",JSON.stringify(all))}catch(e){}
  }
  function finishV3(){
    S.finished=true;stopTension();const winner=S.aGoals>S.bGoals?"A":"B",loser=winner==="A"?"B":"A",wt=teamFor(winner),lt=teamFor(loser);
    if(S.current===winner)cheer();else ohhh();
    recordKeeper(S.homeKeeper,S.shots.filter(x=>x.side==="B"));recordKeeper(S.awayKeeper,S.shots.filter(x=>x.side==="A"));
    $("#gamePanel").classList.add("hidden");$("#reportPanel").classList.remove("hidden");
    const body=$("#reportPanel .panel-body");
    body.innerHTML='<div class="pc-winner"><div class="pc-result-team '+(winner==="A"?"win":"lose")+'"><div class="flagbig">'+S.homeTeam.flag+'</div><h3>'+S.homeTeam.name+'</h3><strong>'+S.aGoals+'</strong><br><span class="pc-winner-label">'+(winner==="A"?"SIEGER":"AUSGESCHIEDEN")+'</span></div><div class="pc-vs">:</div><div class="pc-result-team '+(winner==="B"?"win":"lose")+'"><div class="flagbig">'+S.awayTeam.flag+'</div><h3>'+S.awayTeam.name+'</h3><strong>'+S.bGoals+'</strong><br><span class="pc-winner-label">'+(winner==="B"?"SIEGER":"AUSGESCHIEDEN")+'</span></div></div><div class="result-box"><div class="eyebrow">ELFMETERSCHIESSEN</div><div class="big-number">'+wt.flag+' '+wt.name+' gewinnt</div><div class="meta">'+(S.sudden?"Entscheidung im Sudden Death.":"Entscheidung nach der regulären Elfmeterserie.")+' Zwei Torhüter, abwechselnde Schützen und ein eindeutiger Sieger.</div><div class="pc-shootout-log">'+S.shots.map((x,i)=>'<div class="pc-shotline '+(x.outcome==="goal"?"goal":"fail")+'"><span class="ico">'+(x.outcome==="goal"?"✓":"✕")+'</span><div><b>'+(i+1)+'. '+x.shooter+'</b><small>'+x.team+' · gegen '+x.keeper+' · Stärke '+x.power+'%</small></div><strong>'+(x.outcome==="goal"?"GETROFFEN":x.outcome==="save"?"GEHALTEN":x.outcome==="post"?"PFOSTEN":"DANEBEN")+'</strong></div>').join("")+'</div></div><div class="actions"><button class="btn" id="sameAgainV3">Revanche</button><button class="btn primary" id="newMatchV3">Neues Duell</button></div>';
    $("#sameAgainV3").onclick=startV3;$("#newMatchV3").onclick=resetToSetup;
    if(typeof renderRanking==="function")renderRanking();window.scrollTo({top:$("#reportPanel").offsetTop-10,behavior:"smooth"})
  }
  function startV3(){
    S.homeKeeper=keeper;S.homeTeam=matchingTeam(keeper.nation);S.awayTeam=team;S.awayKeeper=matchingKeeper(team);
    if(!S.homeTeam||!S.awayTeam||!S.homeKeeper||!S.awayKeeper)return;
    Object.assign(S,{current:"A",aGoals:0,bGoals:0,aTaken:0,bTaken:0,shots:[],busy:false,targetX:.5,targetY:.5,power:78,sudden:false,finished:false});
    $("#setupPanel").classList.add("hidden");$("#reportPanel").classList.add("hidden");$("#gamePanel").classList.remove("hidden");
    ensureV3UI();const pow=$("#pcPower");if(pow){pow.value=78;$("#pcPowerVal").textContent="78%"}buildBoard();updateTurnUI();
    window.scrollTo({top:$("#gamePanel").offsetTop-10,behavior:"smooth"})
  }

  function patchSetupCopy(){
    const h=$("#step1 .section-title");if(h)h.textContent="Wähle die erste Nationalmannschaft über ihren Torwart";
    const h2=$("#step2 .section-title");if(h2)h2.textContent="Wähle die zweite Nationalmannschaft";
    const s3=$('[data-step="3"] small');if(s3)s3.textContent="abwechselnd 5 Schützen je Nation";
    const hero=$(".hero p");if(hero)hero.textContent="Präzise zielen, Schussstärke wählen und wie bei einem großen Turnier abwechselnd antreten: zwei Nationaltorhüter, fünf Schützen pro Nation und ein eindeutiger Sieger.";
    const badge=$$(".badges .badge")[0];if(badge)badge.textContent="5 Schützen je Nation";
  }

  ensureV3UI();patchSetupCopy();
  const start=$("#startBtn");if(start)start.onclick=startV3;
  const same=$("#sameAgain");if(same)same.onclick=startV3;
  window.PenaltyClashV3={start:startV3,state:S};
})();
