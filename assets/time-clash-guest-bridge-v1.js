/* BetInsight TIME CLASH: guest report handoff v1. 2026-10-31
 * Public mode: store high-entropy guest_ref in same-site cookie, preserving localStorage.
 * Member mode: offer explicit claim after checking server; never auto-transfer.
 * No Unit, wallet, reward or prediction changes.
 */
(function() {
  "use strict";
  var KEY = "bi_time_clash_guest";
  var REPORT_API = "https://lszlaglwlixejzytrurg.supabase.co/functions/v1/time-clash-report";
  var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  var appMode = location.hostname === "app.betinsight.club";
  var publicMode = location.hostname === "betinsight.club" || location.hostname === "www.betinsight.club";
  var language=(new URLSearchParams(location.search).get("lang")||(appMode?"de":location.pathname.split("/")[1])||"de").toLowerCase();
  var DICT={
  de:["Deine Gastspiele übernehmen","{n} abgeschlossene Gastserien{p} gefunden. Möchtest du sie deinem Konto zuordnen? Keine zusätzliche Unit- oder Punktgutschrift.","Jetzt meinem Profil zuordnen","Übernahme wird geprüft …","{n} Gastserien deinem Konto zugeordnet.","Keine neuen Gastberichte zu übernehmen.","Bericht öffnen","Übernahme konnte nicht bestätigt werden. Bitte erneut versuchen.","Erneut versuchen","Gespeicherte Serie fortsetzen"," und ein gesicherter Zwischenstand"],
  en:["Claim your guest games","Found {n} completed guest series{p}. Link them to your account? No extra Units or points are credited.","Link to my account","Checking claim …","{n} guest series linked to your account.","No new guest reports to claim.","Open report","Could not confirm transfer. Please try again.","Try again","Continue saved series"," and one saved checkpoint"],
  es:["Vincular mis partidos de invitado","Se encontraron {n} series terminadas{p}. ¿Vincularlas a tu cuenta? Sin Units ni puntos adicionales.","Vincular a mi cuenta","Comprobando …","{n} series vinculadas a tu cuenta.","No hay informes nuevos.","Abrir informe","No se pudo confirmar la transferencia.","Reintentar","Continuar serie guardada"," y un progreso guardado"],
  fr:["Récupérer mes matchs invités","{n} séries terminées{p} trouvées. Les lier à votre compte ? Aucun Unit ni point supplémentaire.","Lier à mon compte","Vérification …","{n} séries liées à votre compte.","Aucun nouveau rapport à récupérer.","Ouvrir le rapport","Transfert non confirmé. Veuillez réessayer.","Réessayer","Reprendre la série enregistrée"," et une sauvegarde"],
  it:["Recupera le partite ospite","Trovate {n} serie concluse{p}. Vuoi collegarle al tuo account? Nessun Unit o punto aggiuntivo.","Collega al mio account","Verifica in corso …","{n} serie collegate al tuo account.","Nessun nuovo rapporto da recuperare.","Apri rapporto","Impossibile confermare il trasferimento.","Riprova","Riprendi serie salvata"," e un salvataggio"],
  pt:["Vincular jogos de visitante","Encontradas {n} séries concluídas{p}. Vincular à sua conta? Sem Units ou pontos extras.","Vincular à minha conta","Verificando …","{n} séries vinculadas à conta.","Nenhum relatório novo para vincular.","Abrir relatório","Não foi possível confirmar a transferência.","Tentar novamente","Continuar série salva"," e um progresso salvo"],
  nl:["Gastwedstrijden overnemen","{n} afgesloten gastseries{p} gevonden. Aan je account koppelen? Geen extra Units of punten.","Aan mijn profiel koppelen","Overdracht controleren …","{n} gastseries aan je profiel gekoppeld.","Geen nieuwe verslagen gevonden.","Verslag openen","Overdracht niet bevestigd. Probeer opnieuw.","Opnieuw proberen","Opgeslagen reeks hervatten"," en één opgeslagen tussenstand"],
  "zh-tw":["將訪客比賽連結到帳號","找到 {n} 個已完成的訪客系列賽{p}。要連結至帳號嗎？不會額外發放 Units 或積分。","連結到我的帳號","正在確認 …","已將 {n} 個系列賽連結到你的帳號。","沒有新的訪客報告。","查看報告","無法確認轉移，請重試。","重試","繼續已儲存的系列賽","，以及一筆已儲存的進度"]
  };
  var W=DICT[language]||DICT.de;

  if (!appMode && !publicMode) return;

  function getCookie() {
    var part = document.cookie.split("; ").find(function(x){return x.indexOf(KEY+"=")===0;});
    if(!part) return "";
    try{return decodeURIComponent(part.slice(KEY.length+1));}catch(e){return "";}
  }
  function getLocal() {
    try{return localStorage.getItem(KEY)||"";}catch(e){return "";}
  }
  function setCookie(value) {
    if (!UUID.test(value)) return;
    document.cookie=KEY+"="+encodeURIComponent(value)+"; Max-Age=7776000; Path=/; Domain=.betinsight.club; SameSite=Lax; Secure";
  }
  function getValidGuest() {
    var fromCookie=getCookie(),fromLocal=getLocal();
    if (appMode) return UUID.test(fromCookie)?fromCookie:(UUID.test(fromLocal)?fromLocal:"");
    return UUID.test(fromLocal)?fromLocal:(UUID.test(fromCookie)?fromCookie:"");
  }
  function syncPublicGuest() {
    var guest=getValidGuest();
    if(!guest && typeof window.guestRef==="function") {
      try{guest=window.guestRef();}catch(e){}
    }
    if(UUID.test(guest))setCookie(guest);
  }
  function credential() {
    try{if(typeof window.ownerRef==="function")return String(window.ownerRef()||"").trim();}catch(e){}
    try{return String(localStorage.getItem("betinsight_dashboard_token")||localStorage.getItem("betinsight_profile_token")||"").trim();}catch(e){return "";}
  }
  function reportLink(r) {
    var lang=String(r.language||"de").toLowerCase();
    if(!/^(de|en|es|fr|it|pt)$/.test(lang))lang="de";
    var slug=String(r.public_slug||"");
    if(!/^[a-z0-9-]{4,140}$/.test(slug))return "";
    return "https://betinsight.club/"+lang+"/time-clash/bericht/?clash="+encodeURIComponent(slug);
  }
  function showClaim(guest,cred,available,hasProgress) {
    if(document.getElementById("biTcGuestClaim"))return;
    var panel=document.createElement("aside");
    panel.id="biTcGuestClaim";
    panel.setAttribute("role","region");
    panel.setAttribute("aria-label",W[0]);
    panel.style.cssText="position:fixed;bottom:18px;right:18px;z-index:99998;max-width:385px;width:calc(100% - 36px);border:1px solid #62b2ce;border-radius:15px;background:#0a2436;color:#f3faff;padding:18px 18px 15px;box-shadow:0 16px 40px #000b;font:14px/1.45 system-ui,-apple-system,Arial,sans-serif;";
    var close=document.createElement("button");
    close.type="button";close.textContent="✕";close.setAttribute("aria-label","Schließen");
    close.style.cssText="position:absolute;top:8px;right:10px;border:0;background:none;color:#d5eaf4;cursor:pointer;font-size:19px";
    close.addEventListener("click",function(){panel.remove();});
    var heading=document.createElement("strong");heading.textContent=W[0];
    heading.textContent=W[0];
    heading.style.cssText="display:block;font-size:17px;padding-right:25px;margin-bottom:7px";
    var body=document.createElement("p");
    body.textContent=W[1].replace("{n}",String(available)).replace("{p}",hasProgress?W[10]:"");
    body.style.cssText="margin:0 0 12px;color:#c3dce8";
    var action=document.createElement("button");
    action.type="button";action.textContent=W[2];
    action.style.cssText="background:#f0bf61;color:#092033;border:0;border-radius:9px;padding:10px 13px;font:800 13px system-ui;cursor:pointer";
    var status=document.createElement("div");
    status.setAttribute("aria-live","polite");status.style.cssText="margin-top:10px;color:#b5e7e9;font-size:13px";
    panel.append(close,heading,body,action,status);
    document.body.appendChild(panel);
    action.addEventListener("click",async function(){
      if(action.disabled)return;
      action.disabled=true;action.textContent=W[3];
      try{
        var res=await fetch(REPORT_API,{method:"POST",mode:"cors",cache:"no-store",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"claim_guest",credential:cred,guest_ref:guest})});
        var data=await res.json();
        if(!res.ok||data.ok!==true)throw new Error("claim_failed");
        var n=Number(data.claimed||0);
        status.textContent=n>0?W[4].replace("{n}",String(n)):W[5];
        action.remove();
        if(data.saved_progress){
          var next=document.createElement("a");
          next.href="https://betinsight.club/de/time-clash/?entry=free";
          next.textContent=W[9];
          next.style.cssText="display:block;margin-top:9px;color:#9fe7ff;text-decoration:underline";
          status.appendChild(next);
        }
        try{sessionStorage.setItem("bi_tc_claim_handled_"+guest,"1");}catch(e){}
        (Array.isArray(data.reports)?data.reports:[]).slice(0,5).forEach(function(r){
          var href=reportLink(r);
          if(!href)return;
          var a=document.createElement("a");a.href=href;a.target="_blank";a.rel="noopener noreferrer";
          a.textContent=(r.team_a||"Team A")+" – "+(r.team_b||"Team B")+" · "+W[6];
          a.style.cssText="display:block;margin-top:7px;color:#9fe7ff;font-size:12px;text-decoration:underline";
          status.appendChild(a);
        });
      }catch(e){
        status.textContent=W[7];
        action.disabled=false;action.textContent=W[8];
      }
    });
  }
  async function inspectGuest() {
    var guest=getValidGuest(),cred=credential();
    if(!guest||!cred)return;
    try{if(sessionStorage.getItem("bi_tc_claim_handled_"+guest)==="1")return;}catch(e){}
    try{
      var res=await fetch(REPORT_API,{method:"POST",mode:"cors",cache:"no-store",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"inspect_guest",credential:cred,guest_ref:guest})});
      if(!res.ok)return;
      var d=await res.json();
      if(d.ok===true&&(Number(d.available)>0||d.saved_progress===true))showClaim(guest,cred,Number(d.available),d.saved_progress===true);
    }catch(e){}
  }
  function ready(){
    if(publicMode)syncPublicGuest();
    else inspectGuest();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ready,{once:true});
  else ready();
})();