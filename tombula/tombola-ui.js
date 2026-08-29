(()=>{
  const overlay=document.getElementById('overlay');
  const overlayTitle=document.getElementById('ob');
  const overlayText=document.getElementById('os');
  const winner=document.getElementById('winner');
  const winnerName=document.getElementById('wn');
  const winnerPrize=document.getElementById('wp');
  const prize=document.getElementById('prize');
  const legendText=document.querySelector('.bar .info:last-child .m');
  if(!overlay||!overlayTitle||!overlayText||!winner||!winnerName)return;

  const STORAGE_KEY='betinsightTombolaLastWinner';
  let releasing=false;
  let sequenceTimer=null;

  function renderLegend(name){
    if(!legendText)return;
    legendText.innerHTML='<span style="color:#79ef58;font-weight:800;letter-spacing:.04em">LETZTER GEWINNER</span><br><strong style="color:#fff;font-size:14px">'+(name||'Noch keine Ziehung')+'</strong>';
  }

  function saveWinner(name){
    if(!name||name==='–')return;
    try{localStorage.setItem(STORAGE_KEY,name)}catch(e){}
    renderLegend(name);
  }

  try{renderLegend(localStorage.getItem(STORAGE_KEY)||'')}catch(e){renderLegend('')}

  const observer=new MutationObserver(()=>{
    if(!winner.classList.contains('show')||releasing)return;

    const name=(winnerName.textContent||'').trim();
    if(!name||name==='–')return;
    const prizeText=(prize?.textContent||'').trim();

    clearTimeout(sequenceTimer);

    /* Stufe 1: nur die erste grüne Meldung zeigen. */
    winner.classList.remove('show');
    overlay.classList.add('green','show');
    overlayTitle.textContent=name;
    overlayText.textContent='wurde ausgelost.';

    /* Stufe 2: nach 1,5 Sekunden finale Gewinnerkarte mit Units-Gewinn. */
    sequenceTimer=setTimeout(()=>{
      overlay.classList.remove('show','green');
      saveWinner(name);
      if(winnerPrize){
        winnerPrize.textContent=prizeText&&prizeText!=='–'?'hat '+prizeText+' gewonnen.':'hat den heutigen Preis gewonnen.';
      }
      releasing=true;
      winner.classList.add('show');
      setTimeout(()=>{releasing=false},0);
    },1500);
  });

  observer.observe(winner,{attributes:true,attributeFilter:['class']});
})();