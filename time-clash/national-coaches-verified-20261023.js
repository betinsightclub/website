/* TIME CLASH | National-team championship/tournament coaches
 World champion coaches: https://www.fifa.com/en/tournaments/mens/worldcup/articles/world-cup-champions-1982-2026-italy-argentina-germany-brazil-france-spain
 Historical confirmation: https://www.rsssf.org/players/3098f-coaches.html
 Saudi 2026 tournament: https://www.saff.com.sa/en/news.php?id=4174
 Qatar 2026: https://www.qfa.qa/en/national-team/first-national-team
 AFC 2026 tournament coaches: https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026
 2026 denotes TOURNAMENT manager, not necessarily current manager in Oct 2026
 (South Korea tournament coach Hong Myung-bo replaced subsequently).
 Existing recorded managers are never overwritten.
*/
(function(){"use strict";
const champions={"Italien 1934 · Weltmeister":"Vittorio Pozzo","Italien 1938 · Weltmeister":"Vittorio Pozzo","Italien 1982 · Weltmeister":"Enzo Bearzot","Italien 2006 · Weltmeister":"Marcello Lippi","Deutschland 1954 · Weltmeister":"Sepp Herberger","Deutschland 1974 · Weltmeister":"Helmut Schön","Deutschland 1990 · Weltmeister":"Franz Beckenbauer","England 1966 · Weltmeister":"Alf Ramsey","Frankreich 1998 · Weltmeister":"Aimé Jacquet","Frankreich 2018 · Weltmeister":"Didier Deschamps","Spanien 2010 · Weltmeister":"Vicente del Bosque","Spanien 2026 · Weltmeister":"Luis de la Fuente","Brasilien 1958 · Weltmeister":"Vicente Feola","Brasilien 1962 · Weltmeister":"Aymoré Moreira","Brasilien 1970 · Weltmeister":"Mário Zagallo","Brasilien 1994 · Weltmeister":"Carlos Alberto Parreira","Brasilien 2002 · Weltmeister":"Luiz Felipe Scolari","Argentinien 1978 · Weltmeister":"César Luis Menotti","Argentinien 1986 · Weltmeister":"Carlos Bilardo","Argentinien 2022 · Weltmeister":"Lionel Scaloni","Uruguay 1930 · Weltmeister":"Alberto Suppici","Uruguay 1950 · Weltmeister":"Juan López Fontana"};
const tournament2026={"Saudi-Arabien 2026":"Georgios Donis","Katar 2026":"Julen Lopetegui","Japan 2026":"Hajime Moriyasu","Südkorea 2026":"Hong Myung-bo","Australien 2026":"Tony Popovic"};
const coaches=window.TC_COACH_DB=window.TC_COACH_DB||{},audit={added:[],retained:[],conflicts:[]};
for(const [team,name] of Object.entries({...champions,...tournament2026})){
 if(coaches[team]){if(coaches[team]!==name)audit.conflicts.push({team,existing:coaches[team],expected:name});else audit.retained.push(team);continue}
 coaches[team]=name;audit.added.push(team);
}
window.TC_NATIONAL_COACHES_AUDIT={version:"2026-10-23-2",source:{"winners":"https://www.fifa.com/en/tournaments/mens/worldcup/articles/world-cup-champions-1982-2026-italy-argentina-germany-brazil-france-spain","historical":"https://www.rsssf.org/players/3098f-coaches.html","wc2026":"https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026","saudi":"https://www.saff.com.sa/en/news.php?id=4174","qatar":"https://www.qfa.qa/en/national-team/first-national-team"},...audit};
})();
