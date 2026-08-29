(()=>{
  const WEBHOOK='https://hook.eu1.make.com/avimc6q8t6qxb79cuiako2xya1ow3oyx';
  const ADMIN='OtWHJme9x0b0xw4xvO6Bn_4noDHF7os2';
  const STORE='betinsightTombolaRound';
  const WORDS=['gluecksstern','hufeisen','kleeblatt','fortuna','goldregen','volltreffer','jackpot','sonnenschein','glueckspilz','sternstunde','goldmoment','treffer'];
  const MAGIC=['GLÜCKSSTERN','FORTUNA','VOLLTREFFER','GOLDMOMENT','GLÜCKSKLEE','STERNSTUNDE','SONNENKIND','JACKPOT'];
  const CHARS='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  const $=id=>document.getElementById(id);
  const panel=$('regAdmin'),state=$('regState'),count=$('regCount'),link=$('regLink'),magic=$('regMagic'),generate=$('regGenerate'),copy=$('regCopy'),load=$('regLoad'),close=$('regClose'),names=$('names'),apply=$('apply');
  if(!panel||!state||!count||!link||!magic||!generate||!copy||!load||!close||!names||!apply)return;

  let round=null,pollTimer=null,busy=false,lastNames=[];

  function rand(max){
    if(max<=1)return 0;
    if(globalThis.crypto?.getRandomValues){const a=new Uint32Array(1),lim=Math.floor(4294967296/max)*max;do crypto.getRandomValues(a);while(a[0]>=lim);return a[0]%max}
    return Math.floor(Math.random()*max);
  }
  function code(n=6){let s='';for(let i=0;i<n;i++)s+=CHARS[rand(CHARS.length)];return s}
  function pickWords(){let a=rand(WORDS.length),b=rand(WORDS.length-1);if(b>=a)b++;return [WORDS[a],WORDS[b]]}
  function newRoundData(){const w=pickWords(),slug=w[0]+'-'+w[1]+'-'+code();return{slug,url:'https://betinsight.club/tombula/teilnehmen/?r='+encodeURIComponent(slug),magic:MAGIC[rand(MAGIC.length)],status:'open'}}
  function save(){try{round?localStorage.setItem(STORE,JSON.stringify(round)):localStorage.removeItem(STORE)}catch(e){}}
  function restore(){try{const x=JSON.parse(localStorage.getItem(STORE)||'null');if(x&&x.slug&&x.url)round=x}catch(e){}}
  function setBusy(v){busy=v;generate.disabled=v;copy.disabled=v||!round;load.disabled=v||!round;close.disabled=v||!round||round.status!=='open'}
  function showState(text,kind=''){state.textContent=text;state.className='regState '+kind}

  async function api(data,timeout=6500){
    const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),timeout);
    try{
      const res=await fetch(WEBHOOK,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:new URLSearchParams(data),cache:'no-store',signal:ctl.signal});
      const txt=await res.text();
      if(!res.ok)throw new Error('HTTP '+res.status);
      try{return JSON.parse(txt)}catch(e){throw new Error('Keine gültige Antwort')}
    }finally{clearTimeout(timer)}
  }

  function render(){
    if(!round){link.value='';magic.textContent='–';count.textContent='0';showState('Noch keine Anmelderunde','');copy.disabled=load.disabled=close.disabled=true;return}
    link.value=round.url;magic.textContent=round.magic||'–';
    if(round.status==='open')showState('🟢 Anmeldung geöffnet','open');else showState('🔒 Anmeldung geschlossen','closed');
    copy.disabled=false;load.disabled=false;close.disabled=round.status!=='open';
  }

  function normalizeRows(data){
    let rows=data;
    if(data&&Array.isArray(data.array))rows=data.array;
    if(!Array.isArray(rows))return [];
    const seen=new Set(),out=[];
    rows.forEach(r=>{
      const n=String(r?.name??r?.['2']??'').trim().replace(/\s+/g,' ');
      const st=String(r?.status??r?.['5']??'').toLowerCase();
      if(!n||st!=='active')return;
      const key=n.toLocaleLowerCase('de-DE');
      if(seen.has(key))return;seen.add(key);out.push(n);
    });
    return out;
  }

  async function refresh(applyToTombola=false){
    if(!round)return [];
    try{
      const data=await api({action:'list',admin:ADMIN,slug:round.slug});
      lastNames=normalizeRows(data);count.textContent=String(lastNames.length);
      if(lastNames.length)names.value=lastNames.join('\n');
      if(applyToTombola&&lastNames.length>=2){names.value=lastNames.join('\n');apply.click()}
      return lastNames;
    }catch(e){showState(round.status==='open'?'🟠 Verbindung wird erneut geprüft':'🔒 Anmeldung geschlossen',round.status==='open'?'warn':'closed');return lastNames}
  }

  function startPolling(){clearInterval(pollTimer);if(round?.status==='open'){pollTimer=setInterval(()=>{if(!busy)refresh(false)},15000);refresh(false)}}

  generate.addEventListener('click',async()=>{
    if(busy)return;
    if(round?.status==='open'&&Number(count.textContent||0)>0&&!confirm('Die aktuelle Anmelderunde wird durch einen neuen Link ersetzt. Fortfahren?'))return;
    const next=newRoundData();setBusy(true);showState('Neuer Teilnahme-Link wird erstellt …','warn');
    try{
      const r=await api({action:'create',admin:ADMIN,slug:next.slug,zauberwort:next.magic});
      if(!r||r.ok!==true)throw new Error('create failed');
      round=next;lastNames=[];count.textContent='0';names.value='';save();render();startPolling();
    }catch(e){showState('🔴 Link konnte nicht erstellt werden','error')}
    finally{setBusy(false);render()}
  });

  copy.addEventListener('click',async()=>{
    if(!round)return;
    try{await navigator.clipboard.writeText(round.url);copy.textContent='✅ Link kopiert';setTimeout(()=>copy.textContent='📋 Link kopieren',1600)}
    catch(e){link.focus();link.select();try{document.execCommand('copy');copy.textContent='✅ Link kopiert';setTimeout(()=>copy.textContent='📋 Link kopieren',1600)}catch(x){}}
  });

  load.addEventListener('click',async()=>{
    if(!round||busy)return;
    setBusy(true);load.textContent='↻ Wird geladen …';
    try{
      const list=await refresh(false);
      if(list.length<2){alert('Es sind noch nicht mindestens zwei Teilnehmer angemeldet.');return}
      names.value=list.join('\n');apply.click();load.textContent='✅ Namen übernommen';setTimeout(()=>load.textContent='↻ Namen übernehmen',1700)
    }finally{setBusy(false);render()}
  });

  close.addEventListener('click',async()=>{
    if(!round||round.status!=='open'||busy)return;
    setBusy(true);showState('Anmeldung wird geschlossen …','warn');
    try{
      const r=await api({action:'close',admin:ADMIN,slug:round.slug});
      if(!r||r.ok!==true)throw new Error('close failed');
      round.status='closed';save();clearInterval(pollTimer);await refresh(true);render();
    }catch(e){showState('🔴 Anmeldung konnte nicht geschlossen werden','error')}
    finally{setBusy(false);render()}
  });

  restore();render();startPolling();
})();
