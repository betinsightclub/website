/* TIME CLASH guest quick start. Only activates with ?entry=free.
 * Preserves all existing member, music, support, ranking and gameplay sections.
 * No changes to balances, backend or save logic.
 */
(function () {
  "use strict";
  var params=new URLSearchParams(location.search);
  if(params.get("entry")!=="free")return;
  var path=location.pathname.split("/").filter(Boolean)[0]||"de";
  var lang=(params.get("lang")||path).toLowerCase();
  var allowed=["de","en","es","fr","it","pt","nl","zh-tw"];
  if(allowed.indexOf(lang)<0)lang="de";
  var i18n={
    de:{title:"Dein TIME-CLASH-Schnellstart",intro:"Du musst dich nicht anmelden. Wähle zwei historische oder echte Mannschaften und starte dein eigenes Duell.",steps:["1. Zwei Mannschaften auswählen","2. Einen Favoriten bestimmen","3. Simulation starten und Bericht ansehen"],remaining:"Noch {n} von 3 kostenlosen Gastspielen",registered:"Du bist bereits angemeldet. Wähle deine Mannschaften und starte.",one:"Für den ersten Versuch ist 1 Spiel ausgewählt.",multi:"Wähle zunächst die kürzeste verfügbare Serie.",next:"Weiter zur Siegerwahl & zum Anpfiff ↓",back:"↑ Mannschaften ändern",used:"Deine drei Gastspiele sind verbraucht. Registriere dich kostenlos, um weiterzuspielen.",here:"TEAM-AUSWAHL",hint:"Die weiteren Funktionen, Musik, Statistiken und Community bleiben auf dieser Seite erhalten."},
    en:{title:"Your TIME CLASH quick start",intro:"No registration needed. Pick two real or historic teams and start your own matchup.",steps:["1. Choose two teams","2. Pick your favorite","3. Start the simulation and view your report"],remaining:"{n} of 3 free guest matches remain",registered:"You're signed in. Select teams and start.",one:"One match is selected for your first try.",multi:"Start with the shortest available series.",next:"Continue to winner pick & kick-off ↓",back:"↑ Change teams",used:"Your three guest matches are used. Sign up for free to continue.",here:"TEAM SELECTION",hint:"Music, statistics, community and all other features remain available here."},
    es:{title:"Tu inicio rápido de TIME CLASH",intro:"No necesitas registrarte. Elige dos equipos reales o históricos y comienza tu duelo.",steps:["1. Elige dos equipos","2. Elige tu favorito","3. Inicia la simulación y consulta el informe"],remaining:"Te quedan {n} de 3 partidos gratis",registered:"Ya has iniciado sesión. Selecciona los equipos y empieza.",one:"Se ha seleccionado un solo partido para empezar.",multi:"Comienza con la serie más corta disponible.",next:"Ir a elegir ganador y comenzar ↓",back:"↑ Cambiar equipos",used:"Ya utilizaste tus tres partidos gratis. Regístrate para continuar.",here:"SELECCIÓN DE EQUIPOS",hint:"La música, las estadísticas y las demás funciones siguen disponibles."},
    fr:{title:"Démarrage rapide TIME CLASH",intro:"Pas besoin de vous inscrire. Choisissez deux équipes réelles ou historiques et lancez votre duel.",steps:["1. Choisissez deux équipes","2. Choisissez votre favori","3. Lancez la simulation et consultez le rapport"],remaining:"Encore {n} matchs gratuits sur 3",registered:"Vous êtes connecté. Choisissez vos équipes et commencez.",one:"Un seul match est sélectionné pour votre premier essai.",multi:"Commencez par la série la plus courte.",next:"Choisir le vainqueur et commencer ↓",back:"↑ Changer d'équipes",used:"Vos trois matchs gratuits sont épuisés. Inscrivez-vous pour continuer.",here:"CHOIX DES ÉQUIPES",hint:"La musique, les statistiques et toutes les autres fonctionnalités sont conservées."},
    it:{title:"TIME CLASH: guida rapida",intro:"Nessuna registrazione necessaria. Scegli due squadre reali o storiche e inizia la sfida.",steps:["1. Scegli due squadre","2. Scegli la favorita","3. Avvia la simulazione e leggi il rapporto"],remaining:"Restano {n} partite gratuite su 3",registered:"Hai effettuato l'accesso. Scegli le squadre e inizia.",one:"Per iniziare è selezionata una sola partita.",multi:"Inizia dalla serie più breve disponibile.",next:"Vai alla scelta del vincitore e avvia ↓",back:"↑ Cambia squadre",used:"Hai utilizzato le tre partite gratuite. Registrati per continuare.",here:"SCELTA DELLE SQUADRE",hint:"Musica, statistiche, community e tutte le altre funzioni restano disponibili."},
    pt:{title:"TIME CLASH: início rápido",intro:"Não é necessário cadastro. Escolha dois times reais ou históricos e comece seu duelo.",steps:["1. Escolha dois times","2. Escolha seu favorito","3. Inicie a simulação e veja o relatório"],remaining:"Restam {n} de 3 jogos grátis",registered:"Você já está conectado. Escolha os times e comece.",one:"Um jogo está selecionado para sua primeira experiência.",multi:"Comece pela série mais curta disponível.",next:"Escolher vencedor e começar ↓",back:"↑ Alterar times",used:"Seus três jogos grátis acabaram. Cadastre-se para continuar.",here:"ESCOLHA DOS TIMES",hint:"Música, estatísticas, comunidade e demais recursos continuam disponíveis."},
    nl:{title:"TIME CLASH: snel beginnen",intro:"Registreren is niet nodig. Kies twee echte of historische teams en start je duel.",steps:["1. Kies twee teams","2. Kies je favoriet","3. Start de simulatie en bekijk het verslag"],remaining:"Nog {n} van 3 gratis gastwedstrijden",registered:"Je bent ingelogd. Kies je teams en start.",one:"Voor je eerste poging is één wedstrijd gekozen.",multi:"Begin met de kortst beschikbare reeks.",next:"Verder naar winnaar kiezen & aftrap ↓",back:"↑ Teams wijzigen",used:"Je drie gratis gastwedstrijden zijn op. Registreer je gratis om verder te spelen.",here:"TEAMS KIEZEN",hint:"Muziek, statistieken, community en alle andere functies blijven beschikbaar."},
    "zh-tw":{title:"TIME CLASH 快速入門",intro:"無須註冊。選擇兩支真實或歷史球隊，立即展開你的對戰。",steps:["1. 選擇兩支球隊","2. 選出你看好的勝方","3. 開始模擬並查看賽事報告"],remaining:"還剩 {n}／3 場免費訪客比賽",registered:"你已登入。選好球隊即可開始。",one:"已為首次體驗選擇單場比賽。",multi:"請先選擇最短的系列賽。",next:"繼續選擇勝方並開賽 ↓",back:"↑ 更換球隊",used:"你已用完三場免費訪客比賽。免費註冊後可繼續遊玩。",here:"選擇球隊",hint:"音樂、統計、社群及所有其他功能都會保留。"}
  };
  var T=i18n[lang]||i18n.de;
  var SERIES_WORDS={"de":["Noch {n} von 3 kostenlosen Serien","Deine 3 kostenlosen Serien sind verbraucht. Registriere dich kostenlos für weitere Durchgänge."],"en":["{n} of 3 free series remain","Your 3 free series are used. Register free to play more."],"es":["Te quedan {n} de 3 series gratuitas","Has utilizado tus 3 series gratuitas. Regístrate para continuar."],"fr":["Encore {n} séries gratuites sur 3","Tes 3 séries gratuites sont épuisées. Inscris-toi gratuitement."],"it":["Restano {n} serie gratuite su 3","Hai usato le tue 3 serie gratuite. Registrati per continuare."],"pt":["Restam {n} de 3 séries grátis","Você usou suas 3 séries grátis. Cadastre-se para continuar."],"nl":["Nog {n} van 3 gratis reeksen","Je 3 gratis reeksen zijn gebruikt. Registreer je gratis."],"zh-tw":["剩餘 {n}／3 次免費系列賽","你已用完 3 次免費系列賽。免費註冊後可繼續遊玩。"]};
  T.remaining=SERIES_WORDS[lang][0];T.used=SERIES_WORDS[lang][1];
  function el(tag,cls,text){
    var n=document.createElement(tag);
    if(cls)n.className=cls;
    if(text!==undefined)n.textContent=text;
    return n;
  }
  function scrollTo(e){
    if(!e)return;
    var target=e.getBoundingClientRect().top+window.scrollY-151;
    window.scrollTo({top:Math.max(0,target),behavior:"smooth"});
  }
  function getRemaining(){
    var used=0;
    try{used=Number(localStorage.getItem("bi_time_clash_guest_series_used_v2")||0)||0;}catch(_){}
    var m=document.cookie.match(/(?:^|; )bi_time_clash_guest_series_used_v2=([^;]+)/);
    if(m)used=Math.max(used,Number(m[1])||0);
    return Math.max(0,3-Math.min(3,Math.max(0,used)));
  }
  function signedIn(){
    if(params.get("token"))return true;
    try{return !!(localStorage.getItem("betinsight_dashboard_token")||localStorage.getItem("betinsight_profile_token"));}catch(_){return false;}
  }
  function start(){
    var chooser=document.querySelector("section.chooser"), arena=document.querySelector(".arena"), pick=document.querySelector(".pick");
    if(!chooser||!pick)return;
    var isMember=signedIn(),isApp=location.hostname==="app.betinsight.club",remaining=getRemaining();
    if(isApp){
      var mode=document.querySelector('[data-tc-mode="lab"]');
      if(mode)mode.click();
    }
    var css=el("style");
    css.textContent=".biTcQuickGuide{border:1px solid #50a2c4;border-radius:15px;background:linear-gradient(125deg,#0c3046,#092231);padding:20px;margin:0 0 20px;color:#effaff;box-shadow:0 12px 34px #00101a66}.biTcQuickGuide h2{font-size:clamp(19px,2.2vw,26px);margin:7px 0 8px}.biTcQuickGuide .biTcMini{letter-spacing:.12em;color:#85e4f3;font-size:11px;font-weight:900}.biTcQuickGuide p{margin:8px 0;color:#c5e3ed;font-size:14px}.biTcQuickGuide ol{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;list-style:none;padding:0;margin:16px 0 12px}.biTcQuickGuide li{border:1px solid #34708a;border-radius:10px;background:#082338;padding:12px;font-size:13px;font-weight:750;line-height:1.45}.biTcQuickGuide strong{color:#ffd87a;font-size:14px}.biTcQuickGuide button,.biTcBackGuide{border:1px solid #f1c463;background:#f5c967;color:#102231;border-radius:10px;padding:11px 16px;font-weight:900;font-size:13px;cursor:pointer;min-height:42px}.biTcBackGuide{background:#0c3449;color:#ccf4ff;border-color:#347991;margin:12px 0}.biTcQuickGuide .biTcNote{font-size:12px;color:#9ac6d9}.biTcQuickGuide .biTcWarning{color:#ffce87}.biTcQuickGuide~.choosegrid{scroll-margin-top:160px}.biTcQuickGuide{scroll-margin-top:150px}@media(max-width:650px){.biTcQuickGuide{padding:16px}.biTcQuickGuide ol{grid-template-columns:1fr}.biTcQuickGuide li{padding:9px 12px}}";
    document.head.appendChild(css);
    var guide=el("div","biTcQuickGuide");
    guide.id="biTcQuickGuide";
    guide.setAttribute("role","region");
    guide.setAttribute("aria-label",T.title);
    guide.appendChild(el("div","biTcMini",T.here));
    guide.appendChild(el("h2","",T.title));
    guide.appendChild(el("p","",T.intro));
    var ol=el("ol");
    T.steps.forEach(function(item){ol.appendChild(el("li","",item));});
    guide.appendChild(ol);
    var credit=el("strong","",isMember?T.registered:T.remaining.replace("{n}",String(remaining)));
    guide.appendChild(credit);
    var length1=chooser.querySelector('.lengthpick [data-len="1"]');
    if(!isMember&&remaining>0&&length1) {
      length1.click();
      guide.appendChild(el("p","",T.one));
      var buttons=chooser.querySelectorAll(".lengthpick [data-len]");
      buttons.forEach(function(btn){
        if(remaining<1) {
          btn.disabled=true;btn.setAttribute("aria-disabled","true");btn.style.opacity=".45";btn.style.cursor="not-allowed";
        }
      });
    }else if(!isMember&&remaining>0){
      guide.appendChild(el("p","",T.multi));
    }else if(!isMember){
      guide.appendChild(el("p","biTcWarning",T.used));
    }
    var next=el("button","",T.next);next.type="button";
    next.addEventListener("click",function(){scrollTo(arena||pick);});
    guide.appendChild(next);
    guide.appendChild(el("p","biTcNote",T.hint));
    chooser.insertBefore(guide,chooser.firstChild);
    var back=el("button","biTcBackGuide",T.back);back.type="button";
    back.addEventListener("click",function(){scrollTo(chooser);});
    pick.parentNode.insertBefore(back,pick);
    setTimeout(function(){scrollTo(guide);},220);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();