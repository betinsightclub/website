/* BetInsight presentation-only translations. Source bet/statistics remain unchanged. */
(function(){
"use strict";
const langs=["de","en","es","pt","it","fr","nl","zh"];
const W={
de:{combo:"Kombi",choices:"Auswahlen",comboBet:"Kombi-Wette",dc:"Doppelte Chance",draw:"Unentschieden",or:"oder"},
en:{combo:"Accumulator",choices:"selections",comboBet:"Accumulator",dc:"Double chance",draw:"draw",or:"or"},
es:{combo:"Combinada",choices:"selecciones",comboBet:"Apuesta combinada",dc:"Doble oportunidad",draw:"empate",or:"o"},
pt:{combo:"Múltipla",choices:"seleções",comboBet:"Aposta múltipla",dc:"Hipótese dupla",draw:"empate",or:"ou"},
it:{combo:"Multipla",choices:"selezioni",comboBet:"Scommessa multipla",dc:"Doppia chance",draw:"pareggio",or:"o"},
fr:{combo:"Combiné",choices:"sélections",comboBet:"Pari combiné",dc:"Double chance",draw:"nul",or:"ou"},
nl:{combo:"Combinatie",choices:"selecties",comboBet:"Combinatieweddenschap",dc:"Dubbele kans",draw:"gelijkspel",or:"of"},
zh:{combo:"串關",choices:"項選擇",comboBet:"串關投注",dc:"雙重機會",draw:"平局",or:"或"}};
const comboID="BI-20261009-172442-MAR";
const picks={
de:"1. Borussia Dortmund – Werder Bremen – 1X2: Borussia Dortmund Sieg @ 1.35 | 2. Málaga – Espanyol – Doppelte Chance X2: Unentschieden oder Espanyol Sieg @ 1.37",
en:"1. Borussia Dortmund – Werder Bremen – 1X2: Dortmund to win @ 1.35 | 2. Málaga – Espanyol – Double chance X2: draw or Espanyol win @ 1.37",
es:"1. Borussia Dortmund – Werder Bremen – 1X2: victoria del Dortmund @ 1,35 | 2. Málaga – Espanyol – Doble oportunidad X2: empate o victoria del Espanyol @ 1,37",
pt:"1. Borussia Dortmund – Werder Bremen – 1X2: vitória do Dortmund @ 1,35 | 2. Málaga – Espanyol – Hipótese dupla X2: empate ou vitória do Espanyol @ 1,37",
it:"1. Borussia Dortmund – Werder Bremen – 1X2: vittoria Dortmund @ 1,35 | 2. Málaga – Espanyol – Doppia chance X2: pareggio o vittoria Espanyol @ 1,37",
fr:"1. Borussia Dortmund – Werder Bremen – 1X2 : victoire de Dortmund @ 1,35 | 2. Málaga – Espanyol – Double chance X2 : nul ou victoire de l'Espanyol @ 1,37",
nl:"1. Borussia Dortmund – Werder Bremen – 1X2: Dortmund wint @ 1,35 | 2. Málaga – Espanyol – Dubbele kans X2: gelijkspel of Espanyol wint @ 1,37",
zh:"1. Borussia Dortmund – Werder Bremen – 1X2：多特蒙德獲勝 @ 1.35 | 2. Málaga – Espanyol – 雙重機會X2：平局或西班牙人獲勝 @ 1.37"};
const confirmed={
"BI-20261004-011406-MAR":{nl:"Mallorca wint (1X2)",zh:"馬略卡獲勝（1X2）"},
"BI-20261004-011255-MAR":{nl:"Las Palmas wint (1X2)",zh:"拉斯帕爾馬斯獲勝（1X2）"},
"BI-20261002-145749-MAR":{nl:"Eldense – gelijkspel geen weddenschap (Draw No Bet)",zh:"埃登斯——和局退款（Draw No Bet）"},
"BI-20260927-040207-MAR":{nl:"Real Valladolid wint (1X2)",zh:"皇家瓦拉多利德獲勝（1X2）"},
"BI-20260925-185756-MAR":{nl:"Girona FC wint (1X2)",zh:"赫羅納獲勝（1X2）"}
};
function code(l){return langs.includes(l)?l:"de";}
function market(v,l){l=code(l);let s=String(v||"").trim();if(l==="de")return s;
if(/^(kombi[- ]wette|accumulator)$/i.test(s))return W[l].comboBet;
if(/^doppelte chance$/i.test(s))return W[l].dc;
return s.replace(/Doppelte Chance/gi,W[l].dc).replace(/Kombi-Wette/gi,W[l].comboBet);}
function match(v,l){l=code(l);let s=String(v||"");if(l==="de")return s;return s.replace(/Kombi\s*\(\s*(\d+)\s+Auswahlen\s*\)\s*:/gi,function(_,n){return W[l].combo+" ("+n+" "+W[l].choices+"):";});}
function selection(v,l,id){l=code(l);let s=String(v||"");if(l==="de")return s;if(String(id||"")===comboID)return picks[l];if(confirmed[id]?.[l])return confirmed[id][l];
s=s.replace(/Kombi\s*\(\s*(\d+)\s+Auswahlen\s*\)\s*:/gi,function(_,n){return W[l].combo+" ("+n+" "+W[l].choices+"):";})
.replace(/Doppelte Chance/gi,W[l].dc).replace(/Kombi-Wette/gi,W[l].comboBet).replace(/\bUnentschieden\b/gi,W[l].draw).replace(/\boder\b/gi,W[l].or);
s=s.replace(/([A-Za-zÀ-ÿ.]+(?: [A-Za-zÀ-ÿ.]+){0,3}) (gewinnt|Sieg)\b/gi,function(_,team){return l==="en"?team+" to win":l==="es"?"Victoria de "+team:l==="pt"?"Vitória de "+team:l==="it"?"Vittoria "+team:l==="fr"?"Victoire de "+team:l==="nl"?team+" wint":team+"獲勝";});
return s;}
function league(v,l){l=code(l);let s=String(v||"");return l==="de"?s:s.replace(/Kombi-Wette/gi,W[l].comboBet);}
window.BetInsightResultI18n=Object.freeze({code,market,match,selection,league,comboID});
})();