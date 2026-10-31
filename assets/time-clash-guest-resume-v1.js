/* TIME CLASH guest continuity v1: only public TIME CLASH browser play.
 * Saves a checkpoint silently after game 1/2; never interrupts the series.
 * Finished series remain archived by the unchanged time-clash-report endpoint.
 */
(function(){
"use strict";
var path=location.pathname;
if(!/^\/(de|en|es|fr|it|pt)\/time-clash\/?$/.test(path))return;
var KEY="bi_tc_guest_checkpoint_v1",GUEST="bi_time_clash_guest";
var API="https://lszlaglwlixejzytrurg.supabase.co/functions/v1/time-clash-report";
var lang=path.split("/")[1],T={
de:["Spielstand speichern","Spielstand gesichert","Weiter spielen","Gespeicherte Serie fortsetzen","Später weiterspielen","Registrieren & Ergebnisse übernehmen","Du hast {x} von {y} Spielen abgeschlossen. Der Stand bleibt in diesem Browser erhalten.","Dein Gastspielstand wurde gespeichert. Nach der Registrierung kannst du deine abgeschlossenen Berichte dem Konto zuordnen.","Spielstand konnte nicht online gesichert werden. Er bleibt in diesem Browser gespeichert.","Spielstand vom letzten Besuch gefunden: {x} von {y} Spielen.","Gespeicherten Spielstand fortsetzen","Begegnungsbericht wird gespeichert …"],
en:["Save progress","Progress saved","Keep playing","Resume saved series","Continue later","Register & claim results","You have completed {x} of {y} matches. Progress stays in this browser.","Your guest progress is saved. After registration you can claim completed reports for your account.","Online saving failed. Progress remains in this browser.","Saved progress found: {x} of {y} matches.","Resume saved progress","Saving match report …"],
es:["Guardar progreso","Progreso guardado","Seguir jugando","Reanudar serie guardada","Continuar más tarde","Registrarse y vincular resultados","Has completado {x} de {y} partidos. Se conserva en este navegador.","Tu progreso está guardado. Tras registrarte podrás vincular los informes terminados.","No se pudo guardar en línea; sigue guardado en este navegador.","Progreso encontrado: {x} de {y} partidos.","Reanudar progreso guardado","Guardando informe …"],
fr:["Sauvegarder","Progression sauvegardée","Continuer","Reprendre la série","Reprendre plus tard","S'inscrire et récupérer les résultats","Tu as terminé {x} sur {y} matchs. Les données restent sur ce navigateur.","Progression enregistrée. Après inscription, tu peux récupérer les rapports terminés.","Enregistrement en ligne impossible. Les données restent sur ce navigateur.","Progression retrouvée : {x} sur {y} matchs.","Reprendre la partie","Enregistrement du rapport …"],
it:["Salva progressi","Progressi salvati","Continua","Riprendi la serie","Continua più tardi","Registrati e recupera i risultati","Hai completato {x} di {y} partite. I dati restano nel browser.","Progressi salvati. Dopo la registrazione potrai collegare i rapporti terminati.","Salvataggio online non riuscito. I dati restano nel browser.","Progressi trovati: {x} di {y} partite.","Riprendi progressi","Salvataggio rapporto …"],
pt:["Salvar progresso","Progresso salvo","Continuar","Retomar série","Continuar depois","Cadastrar e vincular resultados","Você concluiu {x} de {y} jogos. O progresso fica neste navegador.","Progresso salvo. Depois do cadastro, você poderá vincular os relatórios concluídos.","Falha ao salvar online. Os dados continuam neste navegador.","Progresso encontrado: {x} de {y} jogos.","Retomar progresso","Salvando relatório …"]}[lang];
var guestPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function guest(){
 var id="";try{id=localStorage.getItem(GUEST)||"";}catch(_){}
 if(!guestPattern.test(id)){
   var cookie=document.cookie.match(/(?:^|; )bi_time_clash_guest=([^;]+)/);
   if(cookie){try{id=decodeURIComponent(cookie[1]);}catch(_){}}
   if(guestPattern.test(id)){try{localStorage.setItem(GUEST,id);}catch(_){}}
 }
 if(!guestPattern.test(id)){try{id=guestRef();}catch(_){}}
 if(guestPattern.test(id))document.cookie=GUEST+"="+encodeURIComponent(id)+"; Max-Age=7776000; Path=/; Domain=.betinsight.club; SameSite=Lax; Secure";
 return guestPattern.test(id)?id:"";
}
function localRead(){
 try{var o=JSON.parse(localStorage.getItem(KEY)||"null");if(!o||o.v!==1||Date.now()-o.savedAt>1000*60*60*24*30||o.completed<1||o.completed>=o.seriesLen||!Array.isArray(o.games)||o.games.length!==o.seriesLen)return null;return o;}catch(_){return null;}
}
function localWrite(o){try{localStorage.setItem(KEY,JSON.stringify(o));return true;}catch(_){return false;}}
function localClear(){try{localStorage.removeItem(KEY);}catch(_){}}
function make(){
 return {v:1,savedAt:Date.now(),completed:g,seriesLen:seriesLen,teamA:TA,teamB:TB,pick:pick,
 kindA:kindAActive,kindB:kindBActive,chosenA:chosenA,chosenB:chosenB,
 scoreA:serA,scoreB:serB,games:JSON.parse(JSON.stringify(games)),
 selectors:["A","B"].map(function(side){return ["type","group","team"].map(function(p){return document.getElementById(p+side)?.value||"";});})};
}
async function post(action,data){
 var r=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",body:JSON.stringify(Object.assign({action:action,guest_ref:guest()},data||{}))});
 var d=await r.json();if(!r.ok||d.ok!==true)throw Error(d.error||"save_failed");return d;
}
function card(){
 var box=document.getElementById("biGuestCheckpoint");
 if(box)return box;
 box=document.createElement("aside");box.id="biGuestCheckpoint";box.setAttribute("role","status");
 box.style.cssText="position:fixed;z-index:75;bottom:18px;right:18px;max-width:430px;width:calc(100% - 36px);background:#0a293c;border:2px solid #69c9e8;border-radius:16px;padding:19px;box-shadow:0 16px 45px #000c;color:#f4fbff;font:14px/1.5 system-ui";
 var h=document.createElement("strong");h.id="biGuestSaveHead";h.style.cssText="display:block;font-size:17px;margin-bottom:8px;color:#ffda87";box.appendChild(h);
 var p=document.createElement("p");p.id="biGuestSaveDetail";p.style.cssText="margin:0 0 11px;color:#cfe5f1";box.appendChild(p);
 var b=document.createElement("div");b.id="biGuestSaveButtons";b.style.cssText="display:flex;gap:8px;flex-wrap:wrap";box.appendChild(b);
 document.body.appendChild(box);return box;
}
function status(head,detail){
 var c=card();c.querySelector("#biGuestSaveHead").textContent=head;c.querySelector("#biGuestSaveDetail").textContent=detail;c.querySelector("#biGuestSaveButtons").replaceChildren();return c.querySelector("#biGuestSaveButtons");
}
function button(where,label,click,important){
 var b=document.createElement("button");b.type="button";b.textContent=label;b.style.cssText="cursor:pointer;min-height:42px;padding:10px 13px;border-radius:10px;font:800 13px system-ui;border:1px solid #68aeca;background:"+(important?"#ffce6b;color:#0a2130":"#123e56;color:#e7f8ff");
 b.addEventListener("click",click);where.appendChild(b);return b;
}
function countMessage(o){return T[6].replace("{x}",o.completed).replace("{y}",o.seriesLen);}
var SOFT={
de:["Spiel {x} abgeschlossen!","Möchtest du deinen bisherigen Spielstand unter deinem Namen speichern? Das geht kostenlos mit einem BetInsight-Profil. Die Serie läuft automatisch weiter.","Kostenlos unter meinem Namen sichern","Später"],
en:["Match {x} complete!","Want to save your progress under your name? Create a free BetInsight profile. The series continues automatically.","Save under my name for free","Later"],
es:["¡Partido {x} terminado!","¿Quieres guardar tu progreso a tu nombre? Crea un perfil gratuito. La serie continúa automáticamente.","Guardar gratis a mi nombre","Más tarde"],
fr:["Match {x} terminé !","Tu souhaites enregistrer les résultats à ton nom ? Crée un profil gratuit. La série continue automatiquement.","Enregistrer à mon nom gratuitement","Plus tard"],
it:["Partita {x} conclusa!","Vuoi salvare i risultati a tuo nome? Crea un profilo gratuito. La serie continua automaticamente.","Salva gratis a mio nome","Più tardi"],
pt:["Jogo {x} concluído!","Quer salvar os resultados no seu nome? Crie um perfil grátis. A série continua automaticamente.","Salvar grátis no meu nome","Depois"]
}[lang];
function removeSoft(){document.getElementById("biTcGuestSoftPrompt")?.remove()}
function showSoft(){
 if(ownerRef())return;
 removeSoft();
 var panel=document.createElement("aside");panel.id="biTcGuestSoftPrompt";
 panel.style.cssText="position:fixed;right:16px;bottom:16px;z-index:76;max-width:320px;width:calc(100% - 32px);background:#092738ec;border:1px solid #6abfd7;border-radius:13px;padding:14px;box-shadow:0 12px 28px #0009;color:#f4fbff;font:13px/1.4 system-ui";
 var h=document.createElement("strong");h.textContent=SOFT[0].replace("{x}",String(g));h.style.cssText="display:block;font-size:15px;color:#ffda8a";
 var p=document.createElement("p");p.textContent=SOFT[1];p.style.cssText="margin:7px 0 10px;color:#cfe9f3";
 panel.append(h,p);
 button(panel,SOFT[2],function(){removeSoft();guest();registration();},true);
 button(panel,SOFT[3],removeSoft,false);
 document.body.appendChild(panel);
}
function checkpoint(){
 if(!!ownerRef()||!g||g>=seriesLen||seriesLen<3||!["nation","club"].includes(kindAActive)||!["nation","club"].includes(kindBActive))return;
 var o=make();localWrite(o);
 // Silent background checkpoint: do NOT interrupt the six-second transition.
 post("save_guest_progress",{snapshot:o,completed_games:o.completed,series_length:o.seriesLen}).catch(function(){});
}
function showPaused(o,returned){
 var b=status(returned?T[3]:T[0],returned?T[9].replace("{x}",o.completed).replace("{y}",o.seriesLen):countMessage(o));
 button(b,returned?T[10]:T[0],async function(){
   var current=localRead()||o;
   localWrite(current);
   this.disabled=true;this.textContent=T[11];
   try{await post("save_guest_progress",{snapshot:current,completed_games:current.completed,series_length:current.seriesLen});this.textContent=T[1];}
   catch(_){this.textContent=T[8];this.disabled=false;}
 },true);
 button(b,T[2],function(){resume(o);document.getElementById("biGuestCheckpoint")?.remove();},false);
 button(b,T[5],function(){guest();registration();},false);
}
function registration(){
 var el=document.querySelector("[data-time-clash-registration]");
 var url=el?.href||"https://betinsight.systeme.io/registrierung?ref=POOL";
 window.location.href=url;
}
function restore(o){
 if(!o||o.completed<1||o.completed>=o.seriesLen||!Array.isArray(o.games)||o.games.length!==o.seriesLen)throw Error("checkpoint_invalid");
 clearTimeout(timer);
 running=false;paused=false;fast=false;
 if(Array.isArray(o.selectors)){
   ["A","B"].forEach(function(side,k){
     var vals=o.selectors[k]||[],ty=document.getElementById("type"+side),grp=document.getElementById("group"+side),tm=document.getElementById("team"+side);
     if(ty&&["nation","club"].includes(vals[0])){ty.value=vals[0];fill(side);if(grp){grp.value=vals[1];fill(side);}if(tm)tm.value=vals[2];}
   });
 }
 chosenA=chosenB=true;TA=o.teamA;TB=o.teamB;kindAActive=o.kindA;kindBActive=o.kindB;activeMode="public";
 renderActiveTeams();
 pick=o.pick;document.getElementById("pickI")?.classList.toggle("sel",pick==="I");
 document.getElementById("pickS")?.classList.toggle("sel",pick==="S");
 seriesLen=o.seriesLen;games=o.games;g=o.completed;serA=o.scoreA;serB=o.scoreB;seriesDecision=null;
 document.querySelectorAll(".lengthpick [data-len]").forEach(function(b){b.classList.toggle("sel",Number(b.dataset.len)===seriesLen);});
 document.getElementById("serA").textContent=serA;
 document.getElementById("serB").textContent=serB;
 document.getElementById("seriesText").textContent=T[3];
 document.getElementById("status").textContent=T[1];
 document.getElementById("start").textContent=T[2];
 renderTabs();renderHistory();
}
function resume(o){
 try{restore(o);beginGame();window.scrollTo({top:Math.max(0,document.querySelector(".arena").getBoundingClientRect().top+scrollY-110),behavior:"smooth"});}
 catch(e){console.warn("TIME CLASH resume",e);status(T[8],String(e.message||e));}
}
function onReady(){
 if(typeof finishGame!=="function"||typeof finishSeries!=="function"||typeof beginGame!=="function"||typeof guestRef!=="function")return;
 guest();
 var oldFinish=finishGame,oldSeries=finishSeries,oldBegin=beginGame;
 beginGame=function(){removeSoft();return oldBegin();};
 finishGame=function(){
   oldFinish();
   // After the first/second game: save silently, keep the engine's next-game timer.
   if(g>0&&g<seriesLen&&!ownerRef()){checkpoint();showSoft();}
 };
 finishSeries=function(){
   removeSoft();
   oldSeries();
   if(ownerRef())return;
   // Only offer profile storage once Supabase archive succeeded and the URL is ready.
   // If archiving fails, leave the existing retry flow intact; never claim saved.
   var attempts=0;
   var watcher=setInterval(function(){
     var link=document.getElementById("reportLink");
     var href=link&&link.getAttribute("href");
     if(!href||href==="#"||!href.includes("/time-clash/bericht/")){
       if(++attempts>=90)clearInterval(watcher);
       return;
     }
     clearInterval(watcher);
     localClear();
     post("clear_guest_progress").catch(function(){});
     var b=status(
       lang==="de"?"Deine Serie ist abgeschlossen!":T[1],
       lang==="de"?"Der Spielbericht wurde gespeichert. Du kannst ihn jetzt ansehen oder deine Ergebnisse durch kostenlose Registrierung dauerhaft deinem Profil zuordnen.":T[7]
     );
     button(b,lang==="de"?"Bericht ansehen":T[1],function(){
       window.open(link.href,"_blank","noopener,noreferrer");
     },true);
     button(b,T[5],function(){guest();registration();},false);
     button(b,lang==="de"?"Schließen":T[2],function(){
       document.getElementById("biGuestCheckpoint")?.remove();
     },false);
   },350);
 };
 var saved=localRead();
 if(saved&&!ownerRef())setTimeout(function(){showPaused(saved,true);},450);
 else if(!saved&&!ownerRef()){
   // Recover from Supabase when this browser still has the guest cookie but localStorage is empty.
   post("get_guest_progress").then(function(d){
      if(!d.progress||!d.progress.snapshot)return;
      var remote=d.progress.snapshot;
      if(remote&&remote.v===1&&remote.completed>0&&remote.completed<remote.seriesLen){
        remote.savedAt=Date.now();
        localWrite(remote);
        showPaused(remote,true);
      }
   }).catch(function(){});
 }
 // Intercept START after a saved checkpoint is present: never charge another guest game for resume.
 document.addEventListener("click",function(e){
   var target=e.target.closest?.("#start");
   var snap=localRead();
   if(!target||!snap||running||ownerRef())return;
   e.preventDefault();e.stopImmediatePropagation();resume(snap);document.getElementById("biGuestCheckpoint")?.remove();
 },true);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",onReady,{once:true});
else onReady();
})();