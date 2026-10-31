/* BetInsight TIME CLASH - eight-language live commentary. No API calls, no change to results or credits. */
(function(){
"use strict";
const KEYS=["kick","chance","shot","save","miss","corner","foul","yellow","second","red","offside","defense","neutral","sub","goal","own","offGoal","half","end","extraStart","extraGoal","extraEnd","penaltyStart","penalty","penaltyEnd","seriesWin","next","saveTitle","saveDetail","register","later","game","summary","pointsLead","seriesDone"];
const RAW={"en":["⚽ Kick-off! Match {n} of the TIME CLASH series is underway.","🔥 {p} launches a dangerous attack for {t}.","⚡ {p} pushes forward for {t} and looks for a shot.","🧤 {p} makes the save for {t}!","🎯 A dangerous effort by {p} for {t}.","🚩 Corner kick for {t}, won by {p}.","💥 Foul involving {p} ({t}). Free kick.","🟨 Yellow card for {p} ({t}).","🟨🟥 Second yellow for {p} ({t}) — sent off!","🟥 Straight red card for {p} ({t}).","🚫 Offside against {t}.","🛡️ {p} makes a vital defensive intervention for {t}.","Both teams continue their midfield battle.","🔄 Substitution for {t}: {a} replaces {b}.","⚽ GOAL, {t}! {p}{s}","⚽ OWN GOAL! {p} accidentally scores in favour of {t}.","🚫 DISALLOWED GOAL! {p} scores for {t}, but offside is given.","⏱ Half-time.","⏱ Full-time.","⏱ Level on points after {n} matches ({x}). The series goes to extra time.","⚽ EXTRA TIME: {t} scores{p}.","⏱ Extra time ends. Score: {x}.","🎯 Still level after extra time — penalty shootout!","🎯 Penalty for {t}: {p} {s}. Score: {x}.","🏁 {t} wins the penalty shootout {x}.","SERIES WINNER: {t}","Next match starts automatically…","Match {n} finished!","Save your results under your name with a free account. The next match starts automatically.","Register for free","Later","MATCH {n} OF {x}","Match summary","Series points","Series finished"],"es":["⚽ ¡Comienza el partido {n} de la serie TIME CLASH!","🔥 {p} inicia un ataque peligroso para {t}.","⚡ {p} avanza para {t} y busca el remate.","🧤 ¡Gran parada de {p} para {t}!","🎯 Ocasión peligrosa de {p} para {t}.","🚩 Córner para {t}, provocado por {p}.","💥 Falta sobre {p} ({t}). Tiro libre.","🟨 Tarjeta amarilla para {p} ({t}).","🟨🟥 Segunda amarilla para {p} ({t}). ¡Expulsado!","🟥 Roja directa para {p} ({t}).","🚫 Fuera de juego de {t}.","🛡️ {p} salva a {t} con una intervención defensiva.","Ambos equipos luchan por el centro del campo.","🔄 Cambio en {t}: entra {a} por {b}.","⚽ ¡GOL DE {t}! {p}{s}","⚽ ¡AUTOGOL! {p} marca en propia puerta y favorece a {t}.","🚫 ¡GOL ANULADO! {p} marca para {t}, pero hay fuera de juego.","⏱ Descanso.","⏱ Final del partido.","⏱ Empate a puntos tras {n} partidos ({x}). ¡Prórroga!","⚽ PRÓRROGA: marca {t}{p}.","⏱ Final de la prórroga. Marcador: {x}.","🎯 Sigue el empate. ¡Tanda de penaltis!","🎯 Penalti de {t}: {p} {s}. Marcador: {x}.","🏁 {t} gana la tanda de penaltis {x}.","GANADOR DE LA SERIE: {t}","El próximo partido comienza automáticamente…","¡Terminó el partido {n}!","Guarda los resultados a tu nombre registrándote gratis. El siguiente partido empieza automáticamente.","Registrarse gratis","Más tarde","PARTIDO {n} DE {x}","Resumen del partido","Puntos de la serie","Serie terminada"],"fr":["⚽ Coup d’envoi du match {n} de la série TIME CLASH !","🔥 {p} lance une attaque dangereuse pour {t}.","⚡ {p} accélère pour {t} et tente sa chance.","🧤 Superbe arrêt de {p} pour {t} !","🎯 Occasion dangereuse de {p} pour {t}.","🚩 Corner pour {t}, obtenu par {p}.","💥 Faute sur {p} ({t}). Coup franc.","🟨 Carton jaune pour {p} ({t}).","🟨🟥 Deuxième jaune pour {p} ({t}) — expulsé !","🟥 Carton rouge direct pour {p} ({t}).","🚫 Hors-jeu de {t}.","🛡️ {p} réalise une intervention décisive pour {t}.","La bataille du milieu de terrain se poursuit.","🔄 Changement pour {t} : {a} remplace {b}.","⚽ BUT POUR {t} ! {p}{s}","⚽ BUT CONTRE SON CAMP ! {p} marque involontairement pour {t}.","🚫 BUT REFUSÉ ! {p} marque pour {t}, mais il y a hors-jeu.","⏱ Mi-temps.","⏱ Fin du match.","⏱ Égalité après {n} matchs ({x}). Place à la prolongation !","⚽ PROLONGATION : {t} marque{p}.","⏱ Fin de la prolongation. Score : {x}.","🎯 Toujours à égalité : tirs au but !","🎯 Tir au but de {t} : {p} {s}. Score : {x}.","🏁 {t} remporte la séance de tirs au but {x}.","VAINQUEUR DE LA SÉRIE : {t}","Le match suivant commence automatiquement…","Match {n} terminé !","Enregistre tes résultats à ton nom avec une inscription gratuite. Le prochain match démarre automatiquement.","S’inscrire gratuitement","Plus tard","MATCH {n} SUR {x}","Résumé du match","Points de série","Série terminée"],"it":["⚽ Calcio d’inizio! È cominciata la partita {n} della serie TIME CLASH.","🔥 {p} avvia un attacco pericoloso per {t}.","⚡ {p} avanza per {t} e cerca il tiro.","🧤 Grande parata di {p} per {t}!","🎯 Occasione pericolosa di {p} per {t}.","🚩 Calcio d’angolo per {t}, conquistato da {p}.","💥 Fallo su {p} ({t}). Punizione.","🟨 Ammonizione per {p} ({t}).","🟨🟥 Secondo giallo per {p} ({t}) — espulso!","🟥 Espulsione diretta per {p} ({t}).","🚫 Fuorigioco di {t}.","🛡️ {p} interviene in difesa per {t}.","Le due squadre si contendono il centrocampo.","🔄 Cambio per {t}: {a} sostituisce {b}.","⚽ GOL DI {t}! {p}{s}","⚽ AUTOGOL! {p} segna nella propria porta favorendo {t}.","🚫 GOL ANNULLATO! {p} segna per {t}, ma è fuorigioco.","⏱ Intervallo.","⏱ Fine partita.","⏱ Parità dopo {n} partite ({x}). Si va ai supplementari.","⚽ SUPPLEMENTARI: segna {t}{p}.","⏱ Fine dei supplementari. Risultato: {x}.","🎯 Ancora pari: si va ai rigori!","🎯 Rigore per {t}: {p} {s}. Risultato: {x}.","🏁 {t} vince ai rigori {x}.","VINCITORE DELLA SERIE: {t}","La prossima partita inizia automaticamente…","Partita {n} terminata!","Salva i risultati a tuo nome registrandoti gratuitamente. La prossima partita parte automaticamente.","Registrati gratis","Più tardi","PARTITA {n} DI {x}","Riepilogo della partita","Punti della serie","Serie conclusa"],"pt":["⚽ Apito inicial! Começa o jogo {n} da série TIME CLASH.","🔥 {p} inicia um ataque perigoso para {t}.","⚡ {p} avança para {t} e procura a finalização.","🧤 Grande defesa de {p} para {t}!","🎯 Oportunidade perigosa de {p} para {t}.","🚩 Escanteio para {t}, conquistado por {p}.","💥 Falta em {p} ({t}). Tiro livre.","🟨 Cartão amarelo para {p} ({t}).","🟨🟥 Segundo amarelo para {p} ({t}) — expulso!","🟥 Cartão vermelho direto para {p} ({t}).","🚫 Impedimento de {t}.","🛡️ {p} faz um corte decisivo para {t}.","As equipes disputam o controle do meio-campo.","🔄 Substituição em {t}: entra {a}, sai {b}.","⚽ GOL DE {t}! {p}{s}","⚽ GOL CONTRA! {p} marca contra e favorece {t}.","🚫 GOL ANULADO! {p} marca para {t}, mas há impedimento.","⏱ Intervalo.","⏱ Fim de jogo.","⏱ Empate em pontos após {n} jogos ({x}). Vamos para a prorrogação.","⚽ PRORROGAÇÃO: {t} marca{p}.","⏱ Fim da prorrogação. Placar: {x}.","🎯 Continua empatado: disputa de pênaltis!","🎯 Pênalti de {t}: {p} {s}. Placar: {x}.","🏁 {t} vence nos pênaltis por {x}.","VENCEDOR DA SÉRIE: {t}","O próximo jogo começa automaticamente…","Jogo {n} encerrado!","Salve os resultados no seu nome com um cadastro gratuito. O próximo jogo começa automaticamente.","Cadastre-se grátis","Depois","JOGO {n} DE {x}","Resumo do jogo","Pontos da série","Série encerrada"],"nl":["⚽ Aftrap! Wedstrijd {n} van de TIME CLASH-serie is begonnen.","🔥 {p} zet een gevaarlijke aanval op voor {t}.","⚡ {p} versnelt voor {t} en zoekt het schot.","🧤 Geweldige redding van {p} voor {t}!","🎯 Gevaarlijke kans van {p} voor {t}.","🚩 Hoekschop voor {t}, afgedwongen door {p}.","💥 Overtreding op {p} ({t}). Vrije trap.","🟨 Gele kaart voor {p} ({t}).","🟨🟥 Tweede geel voor {p} ({t}) — rood!","🟥 Direct rood voor {p} ({t}).","🚫 Buitenspel van {t}.","🛡️ {p} grijpt beslissend in voor {t}.","Beide teams strijden op het middenveld.","🔄 Wissel bij {t}: {a} vervangt {b}.","⚽ DOELPUNT VOOR {t}! {p}{s}","⚽ EIGEN DOELPUNT! {p} scoort ongelukkig in eigen doel voor {t}.","🚫 DOELPUNT AFGEKEURD! {p} scoort voor {t}, maar staat buitenspel.","⏱ Rust.","⏱ Einde wedstrijd.","⏱ Gelijk na {n} wedstrijden ({x}). Verlenging volgt.","⚽ VERLENGING: {t} scoort{p}.","⏱ Einde verlenging. Stand: {x}.","🎯 Nog steeds gelijk: strafschoppen!","🎯 Strafschop voor {t}: {p} {s}. Stand: {x}.","🏁 {t} wint de strafschoppenserie met {x}.","SERIEWINNAAR: {t}","De volgende wedstrijd start automatisch…","Wedstrijd {n} afgelopen!","Bewaar je uitslag op naam door je gratis te registreren. De volgende wedstrijd start automatisch.","Gratis registreren","Later","WEDSTRIJD {n} VAN {x}","Wedstrijdverslag","Seriepunten","Serie afgelopen"],"zh-tw":["⚽ 開球！TIME CLASH 系列賽第 {n} 場比賽開始。","🔥 {p} 為 {t} 發動危險攻勢。","⚡ {p} 為 {t} 快速推進並尋找射門機會。","🧤 {p} 為 {t} 做出精彩撲救！","🎯 {p} 為 {t} 創造絕佳機會。","🚩 {p} 為 {t} 贏得角球。","💥 {p}（{t}）遭到犯規，判罰自由球。","🟨 {p}（{t}）領到黃牌。","🟨🟥 {p}（{t}）第二張黃牌，被罰下場！","🟥 {p}（{t}）直接被紅牌罰下。","🚫 {t} 越位。","🛡️ {p} 為 {t} 做出關鍵防守。","雙方持續爭奪中場控制權。","🔄 {t} 換人：{a} 換下 {b}。","⚽ {t} 進球！{p}{s}","⚽ 烏龍球！{p} 不慎將球踢進自家球門，{t} 得分。","🚫 進球無效！{p} 為 {t} 進球，但被判越位。","⏱ 上半場結束。","⏱ 全場比賽結束。","⏱ {n} 場比賽後積分相同（{x}），進入延長賽！","⚽ 延長賽：{t} 進球{p}。","⏱ 延長賽結束，比分 {x}。","🎯 仍未分出勝負，進入十二碼決勝！","🎯 {t} 罰十二碼：{p}{s}。比分 {x}。","🏁 {t} 以 {x} 贏得十二碼決勝！","系列賽冠軍：{t}","下一場比賽將自動開始…","第 {n} 場比賽結束！","免費註冊即可將賽果儲存在你的名下。下一場比賽會自動開始。","免費註冊","稍後","第 {n} 場／共 {x} 場","比賽摘要","系列賽積分","系列賽結束"]};
const COPY=Object.fromEntries(Object.entries(RAW).map(([l,v])=>[l,Object.fromEntries(KEYS.map((k,i)=>[k,v[i]]))]));
function lang(){let q=new URLSearchParams(location.search).get("lang");let p=location.pathname.split("/")[1];return (q||(/^(de|en|es|fr|it|pt|nl|zh-tw)$/.test(p)?p:document.documentElement.lang)||"de").toLowerCase().replace("pt-br","pt").replace("zh-hant","zh-tw");}
function t(key,values,l){l=l||lang();let s=(COPY[l]||COPY.en)[key]||COPY.en[key]||"";return s.replace(/\{([a-zA-Z]+)\}/g,(_,k)=>String(values?.[k]??""));}
function event(e,l,A,B,n,series){
 if(l==="de"||!e||typeof e.msg!=="string")return e?.msg||"";
 const m=String(e.msg),type=String(e.type||"");
 if(type==="tactic")return m; // Tactical copy already has its own eight-language dictionary.
 const side=type.endsWith("A")?"A":type.endsWith("B")?"B":null;
 const ownTeam=side==="A"?A?.name:side==="B"?B?.name:"";
 const otherTeam=side==="A"?B?.name:side==="B"?A?.name:"";
 const actor=e.player||e.scenePlayer||e.attacker||"";
 const fallback=ownTeam||"";
 const put=(k,v)=>{const vals={...v};if(vals.t&&typeof window.localTeamName==="function"){try{vals.t=window.localTeamName(vals.t)||vals.t}catch(_){}}return t(k,vals,l)};
 if(type==="chance")return put("chance",{p:e.scenePlayer||ownTeam||"",t:ownTeam|| (e.sceneSide==="A"?A?.name:B?.name)});
 if(/^shot[AB]$/.test(type))return put("shot",{p:e.scenePlayer||ownTeam,t:ownTeam});
 if(/^target[AB]$/.test(type))return put(e.sceneKind==="shot"?"miss":"save",{p:e.scenePlayer||e.attacker||ownTeam,t:e.sceneKind==="shot"?ownTeam:(e.sceneSide==="A"?A?.name:B?.name)||otherTeam});
 if(/^corner[AB]$/.test(type))return put("corner",{p:e.scenePlayer||ownTeam,t:ownTeam});
 if(/^foul[AB]$/.test(type))return put("foul",{p:e.scenePlayer||ownTeam,t:ownTeam});
 if(/^card[AB]$/.test(type))return put("yellow",{p:actor,t:ownTeam});
 if(/^secondYellow[AB]$/.test(type))return put("second",{p:actor,t:ownTeam});
 if(/^red[AB]$/.test(type))return put("red",{p:actor,t:ownTeam});
 if(type==="offside"){let which=m.includes(A?.name||"////")?A?.name:B?.name;return put("offside",{t:which||""})}
 if(/^defense[AB]$/.test(type))return put("defense",{p:e.scenePlayer||ownTeam,t:ownTeam});
 if(/^sub[AB]$/.test(type))return put("sub",{t:ownTeam,a:e.sub_in,b:e.sub_out});
 if(/^goal[AB]$/.test(type)){
   if(e.ownGoal){let found=m.match(/^⚽ EIGENTOR! (.*?) lenkt/);return put("own",{p:found?.[1]||"",t:ownTeam})}
   let s=e.assist? (l==="zh-tw"?"（助攻："+e.assist+"）":l==="es"?" Asistencia: "+e.assist+".":l==="fr"?" Passe décisive : "+e.assist+".":l==="it"?" Assist: "+e.assist+".":l==="pt"?" Assistência: "+e.assist+".":l==="nl"?" Assist: "+e.assist+".":" Assist: "+e.assist+"."):"";
   return put("goal",{t:ownTeam,p:e.scorer||"",s});
 }
 if(type==="offsideGoal"){let scorer=m.match(/^🚫 ABSEITS-TOR! (.*?) trifft für/);let which=m.includes(A?.name||"////")?A?.name:B?.name;return put("offGoal",{p:scorer?.[1]||"",t:which||""})}
 if(type==="seriesExtraStart")return put("extraStart",{n, x:series?.score||""});
 if(/^seriesExtraGoal[AB]$/.test(type))return put("extraGoal",{t:ownTeam,p:e.scorer?" ("+e.scorer+")":""});
 if(type==="seriesExtraEnd")return put("extraEnd",{x:(m.match(/Stand\s*(\d+:\d+)/)||[])[1]||series?.extra||""});
 if(type==="shootoutStart")return put("penaltyStart",{});
 if(type==="shootoutEnd")return put("penaltyEnd",{t:series?.winner||"",x:series?.penalties||""});
 if(type==="shootout"){
   let team=m.includes(A?.name||"////")?A?.name:B?.name||"";
   let score=(m.match(/Stand\s*(\d+:\d+)/)||[])[1]||"";
   let player=m.split(":").slice(1).join(":").replace(/\s+(trifft\.|scheitert\.|verschießt\.).*$/,"").trim();
   let success=/\btrifft\./.test(m);
   let successWords={en:["scores","misses"],es:["marca","falla"],fr:["marque","échoue"],it:["segna","sbaglia"],pt:["marca","erra"],nl:["scoort","mist"],"zh-tw":["射進","未進"]};
   return put("penalty",{t:team,p:player,s:(successWords[l]||successWords.en)[success?0:1],x:score});
 }
 if(e.m===1&&m.includes("Anpfiff"))return put("kick",{n:(Number(series?.idx)||0)+1});
 if(e.m===45&&m.includes("Halbzeit"))return put("half",{});
 if(e.m===90&&m.includes("Abpfiff"))return put("end",{});
 if(!type)return put("neutral",{});
 return m;
}
function translateGame(game,l,A,B,idx){
 if(!game||!Array.isArray(game.ev)||l==="de")return game;
 for(const e of game.ev)e.msg=event(e,l,A,B,idx+1,{idx});
 return game;
}
function translateDecision(dec,l,A,B,count,score){
 if(!dec||l==="de"||dec.__localized===l)return dec;
 for(const e of dec.events||[])e.msg=event(e,l,A,B,count,{idx:count-1,score,extra:String(dec.extra_a||0)+":"+String(dec.extra_b||0),winner:dec.winner,penalties:String(dec.penalties_a||0)+":"+String(dec.penalties_b||0)});
 dec.__localized=l;return dec;
}
function uiText(s,l){
 if(l==="de"||!s)return s;
 let z=String(s),v=(k,x)=>t(k,x,l);
 if(/^SERIENSIEGER:\s*/.test(z))return z.replace(/^SERIENSIEGER:\s*/,v("seriesWin",{t:""}));
 if(/^GAME\s+\d+\s+VON\s+\d+/.test(z))return z.replace(/^GAME\s+(\d+)\s+VON\s+(\d+)/,(_,n,x)=>v("game",{n,x}));
 if(/^Spiel\s+(\d+)\s+beendet!/.test(z))return z.replace(/^Spiel\s+(\d+)\s+beendet!/,(_,n)=>v("saveTitle",{n}));
 if(/^Spiel\s+(\d+):/.test(z))return z.replace(/^Spiel\s+(\d+):/,(_,n)=>({en:"Match",es:"Partido",fr:"Match",it:"Partita",pt:"Jogo",nl:"Wedstrijd","zh-tw":"第"}[l]||"Match")+" "+n+(l==="zh-tw"?" 場：":":"));
 if(/^Nächstes Spiel startet/.test(z))return v("next",{});
 if(/^Nächstes Ereignis/.test(z))return ({en:"Next event in approximately 3–5 seconds…",es:"Siguiente jugada en unos 3–5 segundos…",fr:"Prochaine action dans environ 3 à 5 secondes…",it:"Prossima azione tra circa 3–5 secondi…",pt:"Próximo lance em cerca de 3–5 segundos…",nl:"Volgende gebeurtenis over ongeveer 3–5 seconden…","zh-tw":"約 3–5 秒後出現下一個事件…"}[l]||z);
 if(/^Kurzbericht:/.test(z)){const points=(z.match(/Serienstand:\s*(\d+:\d+)/)||[])[1]||"";return v("summary",{})+": "+(points?v("pointsLead",{})+" "+points+".":"");}
 if(/^Punktestand ausgeglichen$/.test(z))return ({en:"Level on points",es:"Empate a puntos",fr:"Égalité aux points",it:"Parità di punti",pt:"Empate em pontos",nl:"Gelijk in punten","zh-tw":"積分相同"}[l]||z);
 if(/ führt nach Punkten$/.test(z)){const team=z.replace(/ führt nach Punkten$/,"");return ({en:team+" leads on points",es:team+" lidera por puntos",fr:team+" mène aux points",it:team+" è in vantaggio ai punti",pt:team+" lidera em pontos",nl:team+" leidt op punten","zh-tw":team+" 積分領先"}[l]||z)}
 if(/^TIME CLASH beendet/.test(z)){let score=(z.match(/Serienpunkte\s+(\d+:\d+)/)||[])[1]||"";return v("seriesDone",{})+(score?" · "+v("pointsLead",{})+": "+score:"")}
 if(/^Serienbericht wird erstellt/.test(z))return ({en:"Creating series report…",es:"Preparando informe de la serie…",fr:"Création du rapport de série…",it:"Preparazione del rapporto della serie…",pt:"Preparando relatório da série…",nl:"Serieverslag wordt opgesteld…","zh-tw":"正在建立系列賽報告…"}[l]||z);
 if(/^Bericht nach Serienende verfügbar/.test(z))return ({en:"Report available after the series",es:"Informe disponible al terminar la serie",fr:"Rapport disponible après la série",it:"Rapporto disponibile al termine della serie",pt:"Relatório disponível após a série",nl:"Verslag beschikbaar na de serie","zh-tw":"系列賽結束後可查看報告"}[l]||z);
 if(/^Bericht erneut versuchen$/.test(z))return ({en:"Retry report",es:"Reintentar informe",fr:"Réessayer le rapport",it:"Riprova il rapporto",pt:"Tentar relatório novamente",nl:"Verslag opnieuw proberen","zh-tw":"重新取得報告"}[l]||z);
 if(/^ENDE$/.test(z))return ({en:"FULL-TIME",es:"FINAL",fr:"TERMINÉ",it:"FINALE",pt:"FIM",nl:"AFGELOPEN","zh-tw":"完場"}[l]||z);
 if(/^📰 ZEITUNGSBILD ERSTELLEN$/.test(z))return ({en:"📰 CREATE NEWSPAPER IMAGE",es:"📰 CREAR IMAGEN DE PERIÓDICO",fr:"📰 CRÉER UNE IMAGE DE JOURNAL",it:"📰 CREA IMMAGINE GIORNALE",pt:"📰 CRIAR IMAGEM DE JORNAL",nl:"📰 KRANTENAFBEELDING MAKEN","zh-tw":"📰 製作報紙圖片"}[l]||z);
 if(/^SERIE ENDE$/.test(z))return v("seriesDone",{});
 if(/^Kostenlos registrieren$/.test(z))return v("register",{});
 if(/^Später$/.test(z))return v("later",{});
 if(/^Spiel beendet!/.test(z))return v("saveTitle",{n:""});
 if(/^Spielstand unter deinem Namen speichern/.test(z))return v("saveDetail",{});
 if(/^Vollständigen TIME-CLASH-Bericht ansehen$/.test(z))return ({en:"View full TIME CLASH report",es:"Ver informe completo de TIME CLASH",fr:"Voir le rapport complet TIME CLASH",it:"Visualizza il rapporto completo TIME CLASH",pt:"Ver relatório completo do TIME CLASH",nl:"Bekijk het volledige TIME CLASH-verslag","zh-tw":"查看完整 TIME CLASH 報告"}[l]||z);
 if(/^Begegnungsbericht wird vorbereitet$/.test(z))return ({en:"Match report is being prepared",es:"Preparando el informe",fr:"Préparation du rapport",it:"Preparazione del rapporto",pt:"Preparando o relatório",nl:"Wedstrijdverslag wordt voorbereid","zh-tw":"正在準備比賽報告"}[l]||z);
 if(/^Nächstes Spiel startet in/.test(z))return v("next",{});
 return z;
}
function localizeTextNode(node,l){
 if(node.nodeType!==3||!node.nodeValue?.trim())return;
 const old=node.nodeValue,trim=old.trim(),newText=uiText(trim,l);
 if(newText!==trim)node.nodeValue=old.replace(trim,newText);
}
function scan(root,l){
 if(root.nodeType===3){localizeTextNode(root,l);return;}
 if(root.nodeType!==1&&root.nodeType!==9)return;
 if(root.nodeType===1&&/^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION|NOSCRIPT)$/.test(root.tagName))return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 let n;while((n=walker.nextNode()))if(n.parentElement&&!/^(SCRIPT|STYLE|TEXTAREA|OPTION|NOSCRIPT)$/.test(n.parentElement.tagName))localizeTextNode(n,l);
}
function init(){
 const l=lang();if(l==="de")return;
 document.documentElement.lang=l==="zh-tw"?"zh-Hant":l;
 scan(document.body,l);
 const obs=new MutationObserver(items=>{for(const rec of items){if(rec.type==="characterData")localizeTextNode(rec.target,l);else for(const node of rec.addedNodes)scan(node,l)}});
 obs.observe(document.body,{subtree:true,characterData:true,childList:true});
}
window.TC_TICKER_I18N={lang,t,event,translateGame,translateDecision,uiText};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();