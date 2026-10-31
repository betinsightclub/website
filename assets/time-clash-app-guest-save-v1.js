/* TIME CLASH app: guest save/resume for NL, ZH-TW and other app locales.
 * Existing engine remains authoritative for rendering and running the games.
 */
(function(){
"use strict";
if(location.hostname!=="app.betinsight.club"||!/^\/time-clash\/?$/.test(location.pathname))return;
const API="https://lszlaglwlixejzytrurg.supabase.co/functions/v1/time-clash-report";
const KEY="bi_time_clash_guest",SERIES="bi_time_clash_active_series_v1";
const locale=(new URLSearchParams(location.search).get("lang")||"de").toLowerCase();
const I={
de:["Spielstand speichern","Gesichert – du kannst später weiterspielen","Nächstes Spiel","Du hast {x} von {y} Spielen beendet.","Konto erstellen und Ergebnisse übernehmen","Gespeicherte Serie gefunden. Fortsetzen?","Fortsetzen","Online-Speicherung fehlgeschlagen. Im Browser bleibt dein Zwischenstand erhalten."],
en:["Save progress","Saved – you can return later","Next match","You completed {x} of {y} matches.","Register and claim your results","Saved series found. Resume?","Resume","Online save failed; a local copy is still available."],
es:["Guardar progreso","Guardado – puedes volver después","Siguiente partido","Terminaste {x} de {y} partidos.","Registrarse y vincular resultados","Se encontró una serie guardada. ¿Continuar?","Continuar","Error al guardar en línea. Hay una copia en el navegador."],
fr:["Sauvegarder","Enregistré – reprenez plus tard","Match suivant","Tu as terminé {x} sur {y} matchs.","S'inscrire et récupérer les résultats","Série enregistrée trouvée. Reprendre ?","Reprendre","Enregistrement en ligne impossible. Une copie locale existe."],
it:["Salva progressi","Salvato – puoi tornare più tardi","Partita successiva","Hai terminato {x} partite su {y}.","Registrati e recupera i risultati","Serie salvata trovata. Riprendere?","Riprendi","Salvataggio online non riuscito. Copia locale disponibile."],
pt:["Salvar progresso","Salvo – você pode voltar depois","Próximo jogo","Você terminou {x} de {y} jogos.","Cadastre-se e vincule os resultados","Série salva encontrada. Retomar?","Retomar","Falha ao salvar online. Há uma cópia no navegador."],
nl:["Spelstand opslaan","Opgeslagen – later verder spelen","Volgende wedstrijd","Je hebt {x} van {y} wedstrijden gespeeld.","Registreren en uitslagen overnemen","Opgeslagen reeks gevonden. Hervatten?","Hervatten","Online opslaan mislukt; je tussenstand staat nog in deze browser."],
"zh-tw":["儲存進度","已儲存，稍後可以繼續","下一場比賽","已完成 {x}／{y} 場比賽。","註冊並連結賽事結果","找到已儲存的系列賽。要繼續嗎？","繼續","無法線上儲存，本機瀏覽器仍保有進度。"]
};
const L=I[locale]||I.de;
const GUEST_SERIES_KEY="bi_time_clash_guest_series_used_v2";
const FREE_TOTAL=3;
const FREE_COPY={
de:["Deine 3 kostenlosen Serien sind aufgebraucht. Registriere dich kostenlos für weitere Durchgänge.","Gastzugang konnte nicht geprüft werden. Bitte erneut versuchen.","Kostenlose Gastserien: {n} von 3 übrig"],
en:["Your 3 free series are used. Register free to continue.","Cannot verify free access. Please retry.","Free guest series: {n} of 3 left"],
es:["Tus 3 series gratuitas se han agotado. Regístrate gratis.","No se pudo verificar el acceso. Inténtalo de nuevo.","Series gratis: {n} de 3"],
fr:["Vos 3 séries gratuites sont épuisées. Inscrivez-vous gratuitement.","Impossible de vérifier l'accès. Réessayez.","Séries gratuites : {n} sur 3 restantes"],
it:["Le 3 serie gratuite sono terminate. Registrati gratis.","Impossibile verificare l'accesso. Riprova.","Serie gratis: {n} su 3"],
pt:["As 3 séries grátis acabaram. Cadastre-se gratuitamente.","Não foi possível verificar o acesso gratuito. Tente novamente.","Séries grátis: {n} de 3 restantes"],
nl:["Je 3 gratis reeksen zijn gebruikt. Registreer je gratis.","Kan je gratis toegang niet controleren. Probeer opnieuw.","Gratis reeksen: nog {n} van 3"],
"zh-tw":["你已用完 3 次免費系列賽。免費註冊後可繼續遊玩。","無法確認免費遊玩資格，請重試。","免費系列賽：剩餘 {n}／3 次"]
};
const FREE_WORDS=FREE_COPY[locale]||FREE_COPY.de;
function seriesUsed(){
 var local=0,cookie=0;
 try{local=Number(localStorage.getItem(GUEST_SERIES_KEY)||0)||0;}catch(_){}
 var m=document.cookie.match(/(?:^|; )bi_time_clash_guest_series_used_v2=([^;]+)/);
 if(m)cookie=Number(m[1])||0;
 return Math.min(FREE_TOTAL,Math.max(0,local,cookie))
}
function recordSeriesUsed(n){
 n=Math.min(FREE_TOTAL,Math.max(0,Number(n)||0));
 try{localStorage.setItem(GUEST_SERIES_KEY,String(n));}catch(_){}
 document.cookie=GUEST_SERIES_KEY+"="+n+"; Max-Age=31536000; Path=/; Domain=.betinsight.club; SameSite=Lax; Secure";
 updateFreeBalance();
}
function updateFreeBalance(){
 var el=document.getElementById("biTcGuestSeriesNotice");
 if(!el&&typeof ownerRef==="function"&&!ownerRef()){
   var parent=document.querySelector(".chooser")||document.querySelector(".tcUxHub");
   if(parent){
     el=document.createElement("p");el.id="biTcGuestSeriesNotice";
     el.style.cssText="background:#0d3446;border:1px solid #417f91;color:#c9f4fc;border-radius:10px;padding:10px 14px;margin:10px 0;font-weight:800";
     parent.prepend(el);
   }
 }
 if(el)el.textContent=FREE_WORDS[2].replace("{n}",String(FREE_TOTAL-seriesUsed()));
}
window.biTimeClashGuestConsume=async function(length){
 if(typeof ownerRef==="function"&&ownerRef())return true;
 if(![1,3,5,10].includes(Number(length)))return false;
 if(seriesUsed()>=FREE_TOTAL){document.getElementById("next").textContent=FREE_WORDS[0];return false}
 var id=guestId(),pending=null;
 try{pending=JSON.parse(sessionStorage.getItem("bi_tc_guest_start_v2")||"null")}catch(_){}
 if(!pending||pending.guest_ref!==id||pending.series_length!==length||Date.now()-pending.created>180000){
  pending={guest_ref:id,series_length:length,start_ref:crypto.randomUUID(),created:Date.now()};
  try{sessionStorage.setItem("bi_tc_guest_start_v2",JSON.stringify(pending))}catch(_){}
 }
 try{
   var d=await api("consume_guest_start",{start_ref:pending.start_ref,series_length:length});
   recordSeriesUsed(Math.max(seriesUsed(),FREE_TOTAL-Number(d.remaining)));
   try{sessionStorage.removeItem("bi_tc_guest_start_v2")}catch(_){}
   return true;
 }catch(e){
   if(String(e.message).includes("guest_limit_reached"))recordSeriesUsed(FREE_TOTAL);
   document.getElementById("next").textContent=String(e.message).includes("guest_limit_reached")?FREE_WORDS[0]:FREE_WORDS[1];
   return false;
 }
};

function guestId(){
 const found=document.cookie.match(/(?:^|; )bi_time_clash_guest=([^;]+)/);
 let v="";
 if(found)try{v=decodeURIComponent(found[1]);}catch(_){}
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)){
  try{v=localStorage.getItem(KEY)||"";}catch(_){}
 }
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)){
  try{v=guestRef();}catch(_){}
 }
 try{localStorage.setItem(KEY,v);}catch(_){}
 document.cookie=KEY+"="+encodeURIComponent(v)+"; Max-Age=7776000; Path=/; Domain=.betinsight.club; SameSite=Lax; Secure";
 return v;
}
async function api(action,data){
 const res=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.assign({action,guest_ref:guestId()},data||{}))});
 const d=await res.json();if(!res.ok||d.ok!==true)throw Error(d.error||"request_failed");return d;
}
function snapshot(){
 return {v:1,origin:"app",savedAt:Date.now(),completed:g,seriesLen,teamA:TA,teamB:TB,pick,games:JSON.parse(JSON.stringify(games)),
 kindA:kindAActive,kindB:kindBActive,scoreA:serA,scoreB:serB,selectedStartStadium,
 chosenA,chosenB};
}
async function backup(){
 if(ownerRef()||g<1||g>=seriesLen||![3,5,10].includes(seriesLen))return;
 const o=snapshot();
 await api("save_guest_progress",{snapshot:o,completed_games:o.completed,series_length:o.seriesLen});
}
function notice(h,detail){
 let e=document.getElementById("tcAppGuestSave");
 if(!e){e=document.createElement("div");e.id="tcAppGuestSave";e.style.cssText="position:fixed;bottom:18px;right:18px;z-index:99997;width:min(410px,calc(100% - 36px));padding:16px;border:2px solid #5fc9ed;border-radius:15px;background:#0b293c;color:#f1fbff;box-shadow:0 14px 45px #000c;font:14px/1.5 system-ui";document.body.appendChild(e);}
 e.replaceChildren();const title=document.createElement("b");title.textContent=h;title.style.cssText="display:block;color:#ffda7b;font-size:17px";e.appendChild(title);
 const p=document.createElement("p");p.textContent=detail;p.style.cssText="margin:7px 0 12px";e.appendChild(p);
 return e;
}
function button(box,label,cb){
 let b=document.createElement("button");b.type="button";b.textContent=label;b.style.cssText="margin:0 7px 7px 0;border-radius:9px;border:1px solid #6eb6d4;background:#12425b;color:#fff;font-weight:800;padding:10px 12px;cursor:pointer";b.addEventListener("click",cb);box.appendChild(b);return b;
}
function register(){
 let a=document.querySelector("[data-time-clash-registration]");
 location.href=a?.href||"https://betinsight.systeme.io/registrierung?ref=POOL";
}
const SOFT_TEXT={
de:["Spiel {n} beendet!","Spielstand unter deinem Namen speichern? Das geht kostenlos mit einer Registrierung. Dein nächstes Spiel startet automatisch.","Kostenlos registrieren","Später"],
en:["Match {n} finished!","Save these results under your name with free registration. Your next match starts automatically.","Register for free","Later"],
es:["¡Partido {n} terminado!","Guarda los resultados a tu nombre con un registro gratis. El siguiente partido comienza automáticamente.","Registrarse gratis","Después"],
fr:["Match {n} terminé !","Enregistre les résultats à ton nom en t'inscrivant gratuitement. Le prochain match démarre automatiquement.","Inscription gratuite","Plus tard"],
it:["Partita {n} terminata!","Salva i risultati a tuo nome registrandoti gratis. La prossima partita inizia automaticamente.","Registrati gratis","Più tardi"],
pt:["Jogo {n} concluído!","Salve os resultados no seu nome com um cadastro gratuito. O próximo jogo começa automaticamente.","Cadastrar grátis","Depois"],
nl:["Wedstrijd {n} afgelopen!","Bewaar de uitslag op je naam door je gratis te registreren. De volgende wedstrijd start automatisch.","Gratis registreren","Later"],
"zh-tw":["第 {n} 場比賽結束！","想將結果儲存在自己的名下嗎？免費註冊即可。下一場比賽會自動開始。","免費註冊","稍後"]
};
function removeSoft(){document.getElementById("biTcAppSoftSave")?.remove()}
function showSoft(){
 var copy=SOFT_TEXT[locale]||SOFT_TEXT.de;
 removeSoft();
 var box=document.createElement("aside");box.id="biTcAppSoftSave";
 box.style.cssText="position:fixed;right:14px;bottom:14px;z-index:99996;max-width:320px;width:calc(100% - 28px);padding:14px;background:#09283bed;color:#fff;border:1px solid #78c9e0;border-radius:12px;box-shadow:0 12px 30px #000a;font:13px/1.4 system-ui";
 var h=document.createElement("b");h.textContent=copy[0].replace("{n}",String(g));h.style.cssText="display:block;color:#ffdc89;font-size:15px";
 var p=document.createElement("p");p.textContent=copy[1];p.style.cssText="margin:8px 0";box.append(h,p);
 button(box,copy[2],function(){removeSoft();register()});
 button(box,copy[3],removeSoft);
 document.body.appendChild(box);
}
function afterGame(){
 // Keep the 6-second automatic transition intact; no interruption after game 1/2.
 if(ownerRef()||g<1||g>=seriesLen)return;
 backup().catch(function(){});
 showSoft();
}
function afterArchivedReport(){
 removeSoft();
 if(ownerRef())return;
 var link=document.getElementById("reportLink");
 var href=link&&link.getAttribute("href");
 if(!href||href==="#"||!href.includes("/time-clash/bericht/"))return;
 api("clear_guest_progress").catch(function(){});
 var names={
 de:["Serie abgeschlossen – Bericht gespeichert!","Dein vollständiger Spielbericht wurde gesichert. Möchtest du ihn ansehen oder die Ergebnisse über eine kostenlose Registrierung deinem Profil zuordnen?","Bericht ansehen","Kostenlos registrieren und Ergebnisse übernehmen","Schließen"],
 en:["Series finished – report saved!","Your match report is saved. View it or register free to link the results to your profile.","View report","Register free and claim results","Close"],
 es:["Serie terminada – informe guardado","Tu informe está guardado. Puedes verlo o registrarte gratis para vincularlo a tu perfil.","Ver informe","Registro gratis y vincular resultados","Cerrar"],
 fr:["Série terminée – rapport enregistré","Votre rapport est enregistré. Consultez-le ou inscrivez-vous gratuitement pour le lier à votre profil.","Voir le rapport","S'inscrire et récupérer les résultats","Fermer"],
 it:["Serie terminata – rapporto salvato","Il rapporto è stato salvato. Aprilo o registrati gratis per collegare i risultati al profilo.","Apri rapporto","Registrati e collega i risultati","Chiudi"],
 pt:["Série concluída – relatório salvo","O relatório foi salvo. Veja os resultados ou cadastre-se grátis para vinculá-los ao seu perfil.","Ver relatório","Cadastrar grátis e vincular resultados","Fechar"],
 nl:["Reeks voltooid – verslag opgeslagen","Je wedstrijdverslag is opgeslagen. Bekijk het of registreer je gratis om de uitslag aan je profiel te koppelen.","Verslag bekijken","Gratis registreren en resultaten koppelen","Sluiten"],
 "zh-tw":["系列賽結束－報告已儲存","賽事報告已儲存。你可以查看報告，或免費註冊以將結果連結到個人檔案。","查看報告","免費註冊並連結結果","關閉"]
 };
 var labels=names[locale]||names.de,box=notice(labels[0],labels[1]);
 button(box,labels[2],function(){window.open(link.href,"_blank","noopener,noreferrer");});
 button(box,labels[3],register);
 button(box,labels[4],function(){box.remove();});
}
function canRestore(x){
 return x&&x.v===1&&[3,5,10].includes(x.seriesLen)&&x.completed>=1&&x.completed<x.seriesLen&&Array.isArray(x.games)&&x.games.length===x.seriesLen;
}
async function restoreLater(){
 const signedIn=!!ownerRef();
 try{
  const d=signedIn?await api("load_member_progress",{credential:ownerRef()}):await api("get_guest_progress");
  const x=d.progress?.snapshot;
  if(!canRestore(x))return;
  if(signedIn&&x.origin!=="app")return;
  const current=JSON.parse(localStorage.getItem(SERIES)||"null");
  if(current&&Number(current.g)>=x.completed&&Date.now()-Number(current.saved_at||0)<1000*60*60*24)return;
  localStorage.setItem(SERIES,JSON.stringify({
   saved_at:Date.now(),owner:signedIn?ownerRef():guestId(),TA:x.teamA,TB:x.teamB,kindAActive:x.kindA,kindBActive:x.kindB,
   activeMode:"public",seriesLen:x.seriesLen,selectedStartStadium:x.selectedStartStadium||"",
   pick:x.pick,g:x.completed,serA:x.scoreA,serB:x.scoreB,games:x.games,chosenA:true,chosenB:true,fast:false
  }));
  const panel=notice(L[5],L[3].replace("{x}",String(x.completed)).replace("{y}",String(x.seriesLen)));
  button(panel,L[6],function(){
    panel.remove();
    if(signedIn)window.__biClaimedGuestSeries={team_a:x.teamA.name,team_b:x.teamB.name,series_length:x.seriesLen,guest_ref:d.progress.guest_ref||guestId()};
    if(typeof window.tcSetMode==="function")window.tcSetMode("lab");
    restoreActiveSeries();
  });
 }catch(_){}
}
function init(){
 if(typeof finishGame!=="function"||typeof saveActiveSeries!=="function")return;
 guestId();
 updateFreeBalance();
 const originalBegin=beginGame;
 beginGame=function(){removeSoft();return originalBegin();};
 const old=finishGame;
 finishGame=function(){old();afterGame();};
 // Offer to save/link the result only after a confirmed Supabase archive.
 if(typeof applyReportArchiveUi==="function"){
   const originalUi=applyReportArchiveUi;
   applyReportArchiveUi=function(data){
     originalUi(data);
     if(data?.report_url&&!ownerRef())afterArchivedReport();
   };
 }
 // A previously claimed GUEST series keeps its historical ownership and never
 // consumes another token or creates new member rewards when it is resumed.
 if(typeof sendReportArchive==="function"){
   const originalArchive=sendReportArchive;
   sendReportArchive=async function(payload,attempts){
     const linked=window.__biClaimedGuestSeries;
     if(!linked||payload.team_a!==linked.team_a||payload.team_b!==linked.team_b||
        Number(payload.series_length)!==linked.series_length||
        !linked.guest_ref)return originalArchive(payload,attempts);
     const res=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},
       body:JSON.stringify(Object.assign({},payload,{guest_ref:linked.guest_ref,credential:""}))});
     const data=await res.json();
     if(!res.ok||!data.report_url)throw new Error(data.error||"archive_failed");
     window.__biClaimedGuestSeries=null;
     api("clear_guest_progress",{guest_ref:linked.guest_ref}).catch(function(){});
     return data;
   };
 }
 if(typeof finishSeries==="function"){
   const originalSeries=finishSeries;
   finishSeries=function(){
     const linked=window.__biClaimedGuestSeries;
     if(!linked)return originalSeries();
     const prev={points:matchPoints,played:played,correct:correct,streak:streak};
     originalSeries();
     matchPoints=prev.points;played=prev.played;correct=prev.correct;streak=prev.streak;
     try{
       localStorage.setItem("biMatchPoints",String(matchPoints));
       localStorage.setItem("biMatchPlayed",String(played));
       localStorage.setItem("biMatchCorrect",String(correct));
       localStorage.setItem("biMatchStreak",String(streak));
     }catch(_){}
     showPoints();
     var label=document.getElementById("next");
     if(label)label.textContent="Gastserie abgeschlossen – dem Konto zugeordnet; keine zusätzliche Punkte- oder Unit-Gutschrift.";
   };
 }
 restoreLater();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();