(()=>{
  const WEBHOOK='https://hook.eu1.make.com/avimc6q8t6qxb79cuiako2xya1ow3oyx';
  const ADMIN='tombola-ui-v2';
  const STORE='betinsightTombolaRound';
  const LINK_PREFIX='betinsight-gluecksbringer-';
  const MAGIC=['GLÜCKSSTERN','FORTUNA','VOLLTREFFER','GOLDMOMENT','GLÜCKSKLEE','STERNSTUNDE','SONNENKIND','JACKPOT'];
  const CHARS='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  const $=id=>document.getElementById(id);
  const panel=$('regAdmin'),state=$('regState'),count=$('regCount'),nameList=$('regNames'),link=$('regLink'),magic=$('regMagic'),newLinkBtn=$('regNewLink'),openBtn=$('regGenerate'),countBtn=$('regLoad'),closeBtn=$('regClose'),names=$('names'),apply=$('apply');
  if(!panel||!state||!count||!nameList||!link||!magic||!newLinkBtn||!openBtn||!countBtn||!closeBtn||!names||!apply)return;

  let round=null,busy=false,lastNames=[];

  function rand(max){
    if(max<=1)return 0;
    if(globalThis.crypto?.getRandomValues){const a=new Uint32Array(1),lim=Math.floor(4294967296/max)*max;do crypto.getRandomValues(a);while(a[0]>=lim);return a[0]%max}
    return Math.floor(Math.random()*max);
  }
  function code(n=6){let s='';for(let i=0;i<n;i++)s+=CHARS[rand(CHARS.length)];return s}
  function newRoundData(){const slug=LINK_PREFIX+code();return{slug,url:'https://betinsight.club/tombula/teilnehmen/?r='+encodeURIComponent(slug),magic:MAGIC[rand(MAGIC.length)],status:'open',count:null,names:[]}}
  function save(){try{round?localStorage.setItem(STORE,JSON.stringify(round)):localStorage.removeItem(STORE)}catch(e){}}
  function restore(){try{const x=JSON.parse(localStorage.getItem(STORE)||'null');if(x&&x.slug&&x.url){round=x;lastNames=Array.isArray(x.names)?x.names:[]}}catch(e){}}
  function setBusy(v){busy=v;newLinkBtn.disabled=v;openBtn.disabled=v||!round||round.status!=='open';countBtn.disabled=v||!round||round.status!=='open';closeBtn.disabled=v||!round||round.status!=='open'}
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
    if(!round){
      link.value='';magic.textContent='–';count.textContent='–';nameList.textContent='Noch keine Namen abgerufen';
      showState('Noch keine Anmelderunde','');
      newLinkBtn.disabled=busy;openBtn.disabled=true;countBtn.disabled=true;closeBtn.disabled=true;
      return;
    }
    link.value=round.url;magic.textContent=round.magic||'–';
    count.textContent=round.count===null||round.count===undefined?'–':String(Number(round.count)||0);
    const shown=Array.isArray(round.names)?round.names:lastNames;
    nameList.innerHTML=shown.length?shown.map(n=>'<span class="regNameChip"></span>').join(''):'<span class="regNamesEmpty">Noch keine Namen abgerufen</span>';
    if(shown.length){[...nameList.querySelectorAll('.regNameChip')].forEach((el,i)=>el.textContent=shown[i])}
    if(round.status==='open')showState('🟢 Anmeldung geöffnet','open');else showState('🔒 Anmeldung geschlossen','closed');
    newLinkBtn.disabled=busy;
    openBtn.disabled=busy||round.status!=='open';
    countBtn.disabled=busy||round.status!=='open';
    closeBtn.disabled=busy||round.status!=='open';
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

  async function createRound(){
    const next=newRoundData();
    const r=await api({action:'create',admin:ADMIN,slug:next.slug,zauberwort:next.magic});
    if(!r||r.ok!==true)throw new Error('create failed');
    round=next;lastNames=[];save();render();
    return round;
  }

  async function getCount(){
    if(!round||round.status!=='open')return [];
    const data=await api({action:'list',admin:ADMIN,slug:round.slug});
    lastNames=normalizeRows(data);
    round.count=lastNames.length;
    round.names=[...lastNames];
    save();render();
    return lastNames;
  }

  newLinkBtn.addEventListener('click',async()=>{
    if(busy)return;
    if(round?.status==='open'){
      const existingCount=Number(round.count)||0;
      const msg=existingCount>0
        ? 'Für die aktuelle Runde sind bereits '+existingCount+' Teilnehmer gespeichert. Ein neuer Link macht den bisherigen Link ungültig. Wirklich neuen Link generieren?'
        : 'Ein neuer Link macht den bisherigen Link ungültig. Wirklich neuen Link generieren?';
      if(!confirm(msg))return;
    }
    setBusy(true);showState('Neuer Teilnahmelink wird generiert …','warn');
    try{
      await createRound();
      showState('🟢 Neuer Teilnahmelink erstellt','open');
    }catch(e){
      showState('🔴 Teilnahmelink konnte nicht erstellt werden','error');
    }finally{setBusy(false);render()}
  });

  openBtn.addEventListener('click',()=>{
    if(busy||!round||round.status!=='open')return;
    try{
      const tab=window.open(round.url,'_blank');
      if(!tab)window.location.href=round.url;
    }catch(e){
      window.location.href=round.url;
    }
  });

  countBtn.addEventListener('click',async()=>{
    if(!round||round.status!=='open'||busy)return;
    setBusy(true);countBtn.textContent='↻ Wird abgerufen …';
    try{
      const list=await getCount();
      showState('🟢 Anmeldung geöffnet · '+list.length+' Teilnehmer','open');
    }catch(e){
      showState('🟠 Anmeldestand konnte nicht abgerufen werden','warn');
    }finally{
      countBtn.textContent='👥 Anmeldestand abrufen';
      setBusy(false);render();
    }
  });

  closeBtn.addEventListener('click',async()=>{
    if(!round||round.status!=='open'||busy)return;
    setBusy(true);showState('Anmeldung wird geschlossen …','warn');
    try{
      const r=await api({action:'close',admin:ADMIN,slug:round.slug});
      if(!r||r.ok!==true||r.status!=='closed')throw new Error('close failed');

      lastNames=normalizeRows(r);
      round.status='closed';
      round.count=lastNames.length;
      round.names=[...lastNames];
      save();

      names.value=lastNames.join('\n');
      if(lastNames.length>=2)apply.click();

      render();
      showState('🔒 Anmeldung geschlossen · '+lastNames.length+' Teilnehmer übernommen','closed');
      if(lastNames.length<2)alert('Anmeldung geschlossen. Es wurden '+lastNames.length+' Teilnehmer übernommen. Für die Ziehung werden mindestens zwei Teilnehmer benötigt.');
    }catch(e){
      showState('🔴 Anmeldung konnte nicht geschlossen werden','error');
    }finally{setBusy(false);render()}
  });

  link.addEventListener('click',()=>{try{link.focus();link.select()}catch(e){}});
  restore();render();
})();