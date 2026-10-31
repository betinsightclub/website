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
 return {v:1,savedAt:Date.now(),completed:g,seriesLen,teamA:TA,teamB:TB,pick,games:JSON.parse(JSON.stringify(games)),
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
function afterGame(){
 if(ownerRef()||g<1||g>=seriesLen)return;
 clearTimeout(timer);
 running=false;
 const details=L[3].replace("{x}",String(g)).replace("{y}",String(seriesLen));
 let box=notice(L[0],details);
 button(box,L[0],async function(){
  saveActiveSeries();
  this.disabled=true;
  try{await backup();this.textContent=L[1];}catch(_){this.textContent=L[7];this.disabled=false;}
 });
 button(box,L[2],function(){box.remove();beginGame();});
 button(box,L[4],register);
 // Automatic server backup also survives closing the tab without pressing Save.
 backup().catch(function(){});
}
function canRestore(x){
 return x&&x.v===1&&[3,5,10].includes(x.seriesLen)&&x.completed>=1&&x.completed<x.seriesLen&&Array.isArray(x.games)&&x.games.length===x.seriesLen;
}
async function restoreLater(){
 if(ownerRef())return;
 try{
  const d=await api("get_guest_progress");
  const x=d.progress?.snapshot;
  if(!canRestore(x))return;
  const current=JSON.parse(localStorage.getItem(SERIES)||"null");
  if(current&&Number(current.g)>=x.completed&&Date.now()-Number(current.saved_at||0)<1000*60*60*24)return;
  localStorage.setItem(SERIES,JSON.stringify({
   saved_at:Date.now(),owner:guestId(),TA:x.teamA,TB:x.teamB,kindAActive:x.kindA,kindBActive:x.kindB,
   activeMode:"public",seriesLen:x.seriesLen,selectedStartStadium:x.selectedStartStadium||"",
   pick:x.pick,g:x.completed,serA:x.scoreA,serB:x.scoreB,games:x.games,chosenA:true,chosenB:true,fast:false
  }));
  const panel=notice(L[5],L[3].replace("{x}",String(x.completed)).replace("{y}",String(x.seriesLen)));
  button(panel,L[6],function(){panel.remove();if(typeof window.tcSetMode==="function")window.tcSetMode("lab");restoreActiveSeries();});
 }catch(_){}
}
function init(){
 if(typeof finishGame!=="function"||typeof saveActiveSeries!=="function")return;
 guestId();
 const old=finishGame;
 finishGame=function(){old();afterGame();};
 restoreLater();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();