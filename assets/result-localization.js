/* BetInsight presentation-only translations. Source bet/statistics remain unchanged. */
(function(){
"use strict";
const langs=["de","en","es","pt","it","fr"];
const W={
de:{combo:"Kombi",choices:"Auswahlen",comboBet:"Kombi-Wette",dc:"Doppelte Chance",draw:"Unentschieden",or:"oder"},
en:{combo:"Accumulator",choices:"selections",comboBet:"Accumulator",dc:"Double chance",draw:"draw",or:"or"},
es:{combo:"Combinada",choices:"selecciones",comboBet:"Apuesta combinada",dc:"Doble oportunidad",draw:"empate",or:"o"},
pt:{combo:"Múltipla",choices:"seleções",comboBet:"Aposta múltipla",dc:"Hipótese dupla",draw:"empate",or:"ou"},
it:{combo:"Multipla",choices:"selezioni",comboBet:"Scommessa multipla",dc:"Doppia chance",draw:"pareggio",or:"o"},
fr:{combo:"Combiné",choices:"sélections",comboBet:"Pari combiné",dc:"Double chance",draw:"nul",or:"ou"}};
const comboID="BI-20261009-172442-MAR";
const picks={
de:"1. Borussia Dortmund – Werder Bremen – 1X2: Borussia Dortmund Sieg @ 1.35 | 2. Málaga – Espanyol – Doppelte Chance X2: Unentschieden oder Espanyol Sieg @ 1.37",
en:"1. Borussia Dortmund – Werder Bremen – 1X2: Dortmund to win @ 1.35 | 2. Málaga – Espanyol – Double chance X2: draw or Espanyol win @ 1.37",
es:"1. Borussia Dortmund – Werder Bremen – 1X2: victoria del Dortmund @ 1,35 | 2. Málaga – Espanyol – Doble oportunidad X2: empate o victoria del Espanyol @ 1,37",
pt:"1. Borussia Dortmund – Werder Bremen – 1X2: vitória do Dortmund @ 1,35 | 2. Málaga – Espanyol – Hipótese dupla X2: empate ou vitória do Espanyol @ 1,37",
it:"1. Borussia Dortmund – Werder Bremen – 1X2: vittoria Dortmund @ 1,35 | 2. Málaga – Espanyol – Doppia chance X2: pareggio o vittoria Espanyol @ 1,37",
fr:"1. Borussia Dortmund – Werder Bremen – 1X2 : victoire de Dortmund @ 1,35 | 2. Málaga – Espanyol – Double chance X2 : nul ou victoire de l'Espanyol @ 1,37"};
function code(l){return langs.includes(l)?l:"de";}
function market(v,l){l=code(l);let s=String(v||"").trim();if(l==="de")return s;
if(/^(kombi[- ]wette|accumulator)$/i.test(s))return W[l].comboBet;
if(/^doppelte chance$/i.test(s))return W[l].dc;
return s.replace(/Doppelte Chance/gi,W[l].dc).replace(/Kombi-Wette/gi,W[l].comboBet);}
function match(v,l){l=code(l);let s=String(v||"");if(l==="de")return s;return s.replace(/Kombi\s*\(\s*(\d+)\s+Auswahlen\s*\)\s*:/gi,function(_,n){return W[l].combo+" ("+n+" "+W[l].choices+"):";});}
function selection(v,l,id){l=code(l);let s=String(v||"");if(l==="de")return s;if(String(id||"")===comboID)return picks[l];
s=s.replace(/Kombi\s*\(\s*(\d+)\s+Auswahlen\s*\)\s*:/gi,function(_,n){return W[l].combo+" ("+n+" "+W[l].choices+"):";})
.replace(/Doppelte Chance/gi,W[l].dc).replace(/Kombi-Wette/gi,W[l].comboBet).replace(/\bUnentschieden\b/gi,W[l].draw).replace(/\boder\b/gi,W[l].or);
s=s.replace(/([A-Za-zÀ-ÿ.]+(?: [A-Za-zÀ-ÿ.]+){0,3}) (gewinnt|Sieg)\b/gi,function(_,team){return l==="en"?team+" to win":l==="es"?"Victoria de "+team:l==="pt"?"Vitória de "+team:l==="it"?"Vittoria "+team:"Victoire de "+team;});
return s;}
function league(v,l){l=code(l);let s=String(v||"");return l==="de"?s:s.replace(/Kombi-Wette/gi,W[l].comboBet);}
window.BetInsightResultI18n=Object.freeze({code,market,match,selection,league,comboID});
})();