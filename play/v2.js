
/* BetInsight Penalty Clash V2 · cinematic interaction layer */
(function(){
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  let audioOn=true,audioCtx=null;

  function ensureAudio(){
    if(!audioOn)return null;
    try{
      audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
      if(audioCtx.state==="suspended")audioCtx.resume();
      return audioCtx;
    }catch(e){return null}
  }
  function tone(freq=220,dur=.12,type="sine",gain=.08,delay=0){
    const a=ensureAudio();if(!a)return;
    const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+delay;
    o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(gain,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+dur);
    o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+dur+.02);
  }
  function noise(dur=.12,gain=.04,delay=0){
    const a=ensureAudio();if(!a)return;
    const len=Math.max(1,Math.floor(a.sampleRate*dur)),buf=a.createBuffer(1,len,a.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);
    const src=a.createBufferSource(),g=a.createGain(),t=a.currentTime+delay;src.buffer=buf;g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
    src.connect(g);g.connect(a.destination);src.start(t);
  }
  function sKick(){noise(.07,.09);tone(85,.1,"sine",.08)}
  function sGoal(){tone(520,.14,"triangle",.05);tone(660,.2,"triangle",.06,.08);noise(.28,.035)}
  function sSave(){tone(130,.12,"square",.045);noise(.14,.07);tone(92,.2,"sine",.05,.08)}
  function sPost(){tone(1250,.23,"sine",.07);tone(920,.18,"sine",.045,.05)}
  function sMiss(){tone(150,.22,"triangle",.04)}

  function injectScene(){
    const stadium=$(".stadium"); if(!stadium||stadium.dataset.v2Ready)return;
    stadium.dataset.v2Ready="1";
    const player=document.createElement("div");
    player.className="pc-player";
    player.innerHTML='<div class="p-head"></div><div class="p-hair"></div><div class="p-body"></div><div class="arm l"></div><div class="arm r"></div><div class="leg l"></div><div class="leg r"></div>';
    const shadow=document.createElement("div");shadow.className="pc-shadow";
    const aim=document.createElement("div");aim.className="pc-aim";
    const result=document.createElement("div");result.className="pc-result";
    const flash=document.createElement("div");flash.className="pc-flash";
    const sound=document.createElement("button");sound.className="pc-sound";sound.type="button";sound.textContent="🔊 Sound";
    sound.onclick=()=>{audioOn=!audioOn;sound.textContent=audioOn?"🔊 Sound":"🔇 Sound";if(audioOn)tone(420,.06,"sine",.03)};
    stadium.append(shadow,player,aim,result,flash,sound);
    const keeper=$("#keeperFigure");if(keeper)keeper.classList.add("ready");
    $$(".zone").forEach(z=>{
      z.addEventListener("mouseenter",()=>showAim(z));
      z.addEventListener("focus",()=>showAim(z));
      z.addEventListener("mouseleave",hideAim);
      z.addEventListener("blur",hideAim);
    });
  }
  function showAim(zone){
    const stadium=$(".stadium"),aim=$(".pc-aim");if(!stadium||!aim||zone.disabled)return;
    const sr=stadium.getBoundingClientRect(),zr=zone.getBoundingClientRect();
    aim.style.left=(zr.left-sr.left+zr.width/2)+"px";
    aim.style.top=(zr.top-sr.top+zr.height/2)+"px";
    aim.classList.add("show");
  }
  function hideAim(){const a=$(".pc-aim");if(a)a.classList.remove("show")}
  function wait(ms){return new Promise(r=>setTimeout(r,ms))}
  function centerIn(el,container){
    const er=el.getBoundingClientRect(),cr=container.getBoundingClientRect();
    return {x:er.left-cr.left+er.width/2,y:er.top-cr.top+er.height/2};
  }
  function zonePoint(zoneName){
    const zone=$('.zone[data-zone="'+zoneName+'"]'),stadium=$(".stadium");
    if(!zone||!stadium)return{x:stadium.clientWidth/2,y:stadium.clientHeight*.35};
    return centerIn(zone,stadium);
  }
  function ballStart(){
    const stadium=$(".stadium"),player=$(".pc-player");
    if(!stadium||!player)return{x:stadium.clientWidth*.43,y:stadium.clientHeight*.82};
    const p=centerIn(player,stadium);return{x:p.x+31,y:p.y+65};
  }
  function placeBallAt(x,y,scale=1,rot=0){
    const ball=$("#ball");if(!ball)return;
    ball.style.left=x+"px";ball.style.top=y+"px";ball.style.bottom="auto";
    ball.style.transform="translate(-50%,-50%) scale("+scale+") rotate("+rot+"deg)";
  }
  async function flyBall(toZone,outcome){
    const stadium=$(".stadium"),ball=$("#ball");if(!stadium||!ball)return;
    const from=ballStart(),to=zonePoint(toZone);
    placeBallAt(from.x,from.y,1,0);ball.style.transition="none";ball.className="ball";
    const t0=performance.now(),dur=470;
    return new Promise(resolve=>{
      function frame(now){
        const p=Math.min(1,(now-t0)/dur),ease=1-Math.pow(1-p,3);
        const arc=-Math.sin(Math.PI*p)*42;
        const x=from.x+(to.x-from.x)*ease;
        const y=from.y+(to.y-from.y)*ease+arc;
        const scale=1-(.48*ease),rot=780*ease;
        placeBallAt(x,y,scale,rot);
        if(p<1)requestAnimationFrame(frame);else resolve();
      }
      requestAnimationFrame(frame);
    });
  }
  function impactFx(type,zone){
    const stadium=$(".stadium"),goal=$(".goal"),result=$(".pc-result"),flash=$(".pc-flash");
    if(!stadium||!result)return;
    const labels={goal:"TOR!",save:"PARADE!",miss:"DANEBEN!",post:"PFOSTEN!"};
    result.textContent=labels[type]||type.toUpperCase();result.className="pc-result "+type+" show";
    if(type==="goal"){goal?.classList.add("goal-net","goal-hit");stadium.classList.add("camera-kick");sGoal()}
    if(type==="save"){stadium.classList.add("camera-save");sSave()}
    if(type==="post"){stadium.classList.add("camera-save");sPost()}
    if(type==="miss"){sMiss()}
    flash?.classList.add("hit");
    const p=zonePoint(zone);
    for(let i=0;i<(type==="goal"?18:10);i++){
      const e=document.createElement("i");e.className="pc-particle";
      e.style.left=p.x+"px";e.style.top=p.y+"px";
      e.style.setProperty("--dx",(Math.random()*120-60)+"px");e.style.setProperty("--dy",(Math.random()*90-55)+"px");
      stadium.appendChild(e);setTimeout(()=>e.remove(),720);
    }
    setTimeout(()=>{result.className="pc-result";flash?.classList.remove("hit");goal?.classList.remove("goal-net","goal-hit");stadium.classList.remove("camera-kick","camera-save")},760);
  }
  function resetActors(){
    const player=$(".pc-player"),keeper=$("#keeperFigure"),ball=$("#ball");
    if(player)player.className="pc-player";
    if(keeper)keeper.className="keeper ready";
    if(ball){ball.className="ball";ball.removeAttribute("style")}
  }

  injectScene();

  const oldStart=window.startGame;
  window.startGame=function(){
    if(oldStart)oldStart();
    injectScene();resetActors();
    const k=$("#sideKeeperStrength"),s=$("#shotStrength");
    if(k&&window.keeper&&typeof keeperStrengthFor==="function")k.textContent=keeperStrengthFor(window.keeper||keeper)+" / 25";
    if(s&&window.team&&team?.shooters?.[0]&&typeof strengthFor==="function")s.textContent=strengthFor(team.shooters[0])+" / 25";
  };

  window.takeShot=async function(target){
    if(typeof busy==="undefined"||busy||round>=5)return;
    busy=true;setZones(false);hideAim();
    const shooter=team.shooters[round],sim=simulatePenalty(target,shooter,keeper);
    const player=$(".pc-player"),fig=$("#keeperFigure"),ball=$("#ball");
    $("#shotTarget").textContent=zoneNames[target];
    $("#prompt").textContent="ANLAUF …";
    if(player){player.className="pc-player runup";await wait(430);player.className="pc-player kick"}
    sKick();
    $(".stadium")?.classList.add("camera-kick");
    setTimeout(()=>$(".stadium")?.classList.remove("camera-kick"),250);
    await wait(65);
    if(fig)fig.className="keeper dive-"+sim.dive;
    const flight=flyBall(sim.actualZone);
    await wait(310);

    let visualZone=sim.actualZone;
    if(sim.outcome==="miss"){
      const p=zonePoint(sim.actualZone);const stadium=$(".stadium");placeBallAt(p.x+(sim.actualZone.startsWith("l")?-80:sim.actualZone.startsWith("r")?80:55),p.y-12,.5,760);
    }
    if(sim.outcome==="post"){
      const p=zonePoint(sim.actualZone);placeBallAt(p.x+(sim.actualZone.startsWith("l")?-12:sim.actualZone.startsWith("r")?12:0),p.y,.52,760);
    }
    await flight;
    impactFx(sim.outcome,visualZone);

    if(sim.outcome==="save"){
      $("#prompt").textContent="PARADE!";
      $("#commentary").textContent=`${keeper.name} liest ${shooter}. ${zoneNames[sim.actualZone]} – und die Parade sitzt.`;
      saves++;
    }else if(sim.outcome==="miss"){
      $("#prompt").textContent="DANEBEN!";
      $("#commentary").textContent=`${shooter} zielt ${zoneNames[target]}, setzt den Ball unter Druck aber neben das Tor.`;
    }else if(sim.outcome==="post"){
      $("#prompt").textContent="PFOSTEN!";
      $("#commentary").textContent=`${shooter} trifft mit dem Versuch ${zoneNames[target]} nur Aluminium. ${keeper.name} wäre in ${zoneNames[sim.dive]} gewesen.`;
    }else{
      $("#prompt").textContent="TOR!";
      const same=sim.dive===sim.actualZone;
      $("#commentary").textContent=same
        ? `${shooter} trifft ${zoneNames[sim.actualZone]} mit genug Qualität – ${keeper.name} ist dran, kommt aber nicht entscheidend heran.`
        : `${shooter} setzt den Ball ${zoneNames[sim.actualZone]}. ${keeper.name} entscheidet sich für ${zoneNames[sim.dive]}.`;
      goals++;
    }

    shots.push({shooter,target:sim.target,actualZone:sim.actualZone,dive:sim.dive,outcome:sim.outcome,saved:sim.outcome==="save",shooterStrength:sim.shooterStrength,keeperStrength:sim.keeperStrength,shotQuality:sim.shotQuality});
    const dot=$$(".dot")[round];if(dot)dot.classList.add(sim.outcome==="goal"?"goal":sim.outcome==="save"?"save":sim.outcome==="post"?"post":"miss");
    round++;updateGameUI();

    await wait(850);resetActors();
    if(round>=5){$("#prompt").textContent="Serie beendet";setTimeout(finishGame,420)}
    else{$("#prompt").textContent="Wähle deine Ecke";busy=false;setZones(true)}
  };

  // Rebind zones to the upgraded shot function.
  $$(".zone").forEach(z=>z.onclick=()=>window.takeShot(z.dataset.zone));

  // Re-run injection after browser restores BFCache or dynamic layout.
  window.addEventListener("pageshow",injectScene);
})();
