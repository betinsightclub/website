(()=>{"use strict";
const API="https://lszlaglwlixejzytrurg.supabase.co/functions/v1/time-clash-wiki";
const lang=(location.pathname.split("/")[1]||"de").toLowerCase();
const L={
de:{first:"Diese Konstellation wurde noch nie vollständig simuliert.",first2:"Du kannst der Erste sein. Dein vollständiger Durchgang eröffnet den ersten Wiki-Eintrag zu diesem Duell.",cta:"Diese Konstellation erstmals spielen",all:"Alle Einzelspiele der gespeicherten Serien",series:"Serie",game:"Spiel",venue:"Stadion",weather:"Bedingungen",goals:"Tore",full:"Vollständigen Bericht öffnen",date:"Datum"},
en:{first:"This constellation has never been fully simulated.",first2:"You can be the first. Your completed run will open the first Wiki entry for this matchup.",cta:"Play this constellation first",all:"All matches from the saved series",series:"Series",game:"Match",venue:"Venue",weather:"Conditions",goals:"Goals",full:"Open full report",date:"Date"},
es:{first:"Esta constelación nunca se ha simulado por completo.",first2:"Puedes ser el primero. Tu serie completa abrirá la primera entrada Wiki de este duelo.",cta:"Ser el primero en jugar este duelo",all:"Todos los partidos de las series guardadas",series:"Serie",game:"Partido",venue:"Estadio",weather:"Condiciones",goals:"Goles",full:"Abrir informe completo",date:"Fecha"},
fr:{first:"Cette constellation n’a encore jamais été simulée entièrement.",first2:"Vous pouvez être le premier. Votre série complète ouvrira la première entrée Wiki de ce duel.",cta:"Jouer ce duel en premier",all:"Tous les matchs des séries enregistrées",series:"Série",game:"Match",venue:"Stade",weather:"Conditions",goals:"Buts",full:"Ouvrir le rapport complet",date:"Date"},
it:{first:"Questa costellazione non è mai stata simulata completamente.",first2:"Puoi essere il primo. La tua serie completa aprirà la prima voce Wiki di questa sfida.",cta:"Gioca per primo questa sfida",all:"Tutte le partite delle serie salvate",series:"Serie",game:"Partita",venue:"Stadio",weather:"Condizioni",goals:"Gol",full:"Apri report completo",date:"Data"},
pt:{first:"Esta constelação ainda nunca foi simulada por completo.",first2:"Você pode ser o primeiro. Sua série completa abrirá a primeira entrada Wiki deste duelo.",cta:"Ser o primeiro a jogar este duelo",all:"Todos os jogos das séries salvas",series:"Série",game:"Jogo",venue:"Estádio",weather:"Condições",goals:"Gols",full:"Abrir relatório completo",date:"Data"},
nl:{first:"Deze combinatie is nog nooit volledig gesimuleerd.",first2:"Jij kunt de eerste zijn. Jouw voltooide serie opent de eerste Wiki-vermelding voor dit duel.",cta:"Speel deze combinatie als eerste",all:"Alle wedstrijden uit de opgeslagen series",series:"Serie",game:"Wedstrijd",venue:"Stadion",weather:"Omstandigheden",goals:"Doelpunten",full:"Open volledig verslag",date:"Datum"},
"zh-tw":{first:"這組對戰尚未完成過完整模擬。",first2:"你可以成為第一位完成此對戰的人，並建立這組對戰的第一個 Wiki 條目。",cta:"成為第一位完成此對戰的人",all:"已儲存系列賽中的所有比賽",series:"系列賽",game:"比賽",venue:"球場",weather:"條件",goals:"進球",full:"開啟完整報告",date:"日期"}
};
const T=L[lang]||L.en;
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const fd=s=>{try{return new Intl.DateTimeFormat(lang==="zh-tw"?"zh-Hant":lang,{day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date(s))}catch{return String(s||"").slice(0,10)}};
const playHref=(a,b,len)=>{const q="discoverA="+encodeURIComponent(a)+"&discoverB="+encodeURIComponent(b)+"&discoverLen="+encodeURIComponent(len||5);return (lang==="nl"||lang==="zh-tw")?"https://app.betinsight.club/time-clash/?lang="+encodeURIComponent(lang)+"&"+q:"/"+lang+"/time-clash/?"+q};
const findPair=(P,a,b)=>P.find(x=>(x.team_left===a&&x.team_right===b)||(x.team_left===b&&x.team_right===a));
const renderFirst=(box,a,b,len)=>{if(!box)return;box.innerHTML='<article class="paircard" style="grid-column:1/-1;border-color:rgba(247,201,80,.55)"><div class="ey">'+esc(T.first)+'</div><h2>'+esc(a)+' vs. '+esc(b)+'</h2><p>'+esc(T.first2)+'</p><div class="searchactions"><a class="btn primary" href="'+playHref(a,b,len)+'">'+esc(T.cta)+'</a></div></article>'};
function enhanceSelector(data,prefix){
 const q=document.getElementById(prefix+"Q")||document.getElementById("q");
 const a=document.getElementById(prefix+"A")||document.getElementById("teamA");
 const b=document.getElementById(prefix+"B")||document.getElementById("teamB");
 const len=document.getElementById(prefix+"Len")||document.getElementById("seriesLen");
 const go=document.getElementById(prefix==="detail"?"detailGo":"openPair");
 const box=document.getElementById(prefix==="detail"?"detailResults":"pairGrid");
 if(!a||!b||!go)return;
 const names=(Array.isArray(data.all_teams)&&data.all_teams.length?data.all_teams:[...new Set((data.pairs||[]).flatMap(p=>[p.team_left,p.team_right]))]).slice().sort((x,y)=>x.localeCompare(y));
 for(const s of [a,b]){
   const first=s.options[0]?s.options[0].outerHTML:'<option value=""></option>';
   s.innerHTML=first+names.map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join("");
 }
 go.addEventListener("click",e=>{
   const av=a.value,bv=b.value;if(!av||!bv||av===bv)return;
   e.preventDefault();e.stopImmediatePropagation();
   const p=findPair(data.pairs||[],av,bv);
   if(p)location.href="/"+lang+"/wiki/time-clash/konstellation/?pair="+encodeURIComponent(p.pair_slug);
   else renderFirst(box,av,bv,len?.value||5);
 },true);
}
function addGames(pair){
 const app=document.getElementById("app");if(!app||document.getElementById("wikiAllGames"))return;
 const runs=(pair.runs||[]).slice().reverse();
 let html='<section class="section" id="wikiAllGames"><div class="wrap"><h2>'+esc(T.all)+'</h2>';
 for(const run of runs){
   html+='<article class="card" style="margin:16px 0"><div class="ey">'+esc(T.series)+' · '+esc(fd(run.played_at))+'</div><h3 style="margin:7px 0">'+run.series_length+' '+esc(T.game)+(run.series_length===1?'':'s')+' · '+esc(run.winner||"–")+'</h3>';
   for(const g of (run.games||[])){
     const goalTxt=(g.goals||[]).map(z=>z.scorer?(esc(z.minute)+"′ "+esc(z.scorer)+(z.assist?" ("+esc(z.assist)+")":"")):esc(z.message||"")).join(" · ");
     const href="/"+lang+"/time-clash/bericht/?clash="+encodeURIComponent(run.public_slug)+"#"+encodeURIComponent(g.report_anchor||("spiel-"+g.game_number));
     html+='<div class="card" style="margin:10px 0;padding:16px"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><strong>'+esc(T.game)+' '+g.game_number+': '+esc(pair.team_left)+' '+g.left_goals+' : '+g.right_goals+' '+esc(pair.team_right)+'</strong><a href="'+href+'">'+esc(T.full)+'</a></div><div class="meta" style="margin-top:6px">'+esc(T.venue)+': '+esc(g.venue||"–")+' · '+esc(T.weather)+': '+esc(g.weather||"–")+(goalTxt?' · '+esc(T.goals)+': '+goalTxt:'')+'</div></div>';
   }
   html+='<div class="searchactions"><a class="btn" href="/'+lang+'/time-clash/bericht/?clash='+encodeURIComponent(run.public_slug)+'">'+esc(T.full)+'</a></div></article>';
 }
 html+='</div></section>';
 app.insertAdjacentHTML("beforeend",html);
}
document.addEventListener("DOMContentLoaded",async()=>{try{
 const r=await fetch(API,{cache:"no-store"}),data=await r.json();if(!r.ok)return;
 enhanceSelector(data,"");enhanceSelector(data,"detail");
 if(location.pathname.includes("/wiki/time-clash/konstellation/")){
   const pairSlug=new URLSearchParams(location.search).get("pair")||"";
   const pair=(data.pairs||[]).find(p=>p.pair_slug===pairSlug);if(pair)addGames(pair)
 }
}catch(e){console.warn("Wiki UI",e)}});
})();