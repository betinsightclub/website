/* TIME CLASH | Ghazl El Mahalla 1972/73 historical squad completion.
 Real players from season-specific contemporary match archives and retrospective
 player interviews. Simulation lineup is a MODEL selection, not actual starting XI.
 Sources:
 goalkeeper Mahmoud Shaheen 1972–1979: https://www.masrawy.com/news/news_regions/details/2019/6/15/1584959/
 goalkeeper Abdel Sattar Ali (correction from ABW): https://www.youm7.com/story/2026/2/23/حدث-لا-يُنسى-عندما-خطف-غزل-المحلة-لقب-الدورى-عام/7314981
 match scorers Nov 1972: https://koraapedia.com/نتائج-الدوري-المصري-موسم-1972-1973/
 champion-generation players and Ahmed Hamada coach: https://almahallaelyoum.blogspot.com/2014/06/?m=0
 No generated placeholders.
*/
(function(){"use strict";
const team="Ghazl El Mahalla 1972/73",db=window.TC_ROSTER_DB=window.TC_ROSTER_DB||{},coaches=window.TC_COACH_DB=window.TC_COACH_DB||{};
const all=Array.isArray(db[team])?db[team]:[];
const existing=all.find(x=>x.name==="Abdel Sattar Ali");
if(existing){existing.pos="TW";existing.prole="Torwart";existing.source="https://www.youm7.com/story/2026/2/23/حدث-لا-يُنسى-عندما-خطف-غزل-المحلة-لقب-الدورى-عام/7314981";existing.verification="confirmed historical goalkeeper"}
const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const known=new Set(all.map(x=>norm(x.name))),add=[["Mahmoud Shaheen","TW","https://www.masrawy.com/news/news_regions/details/2019/6/15/1584959/","Torwart laut eigenem Bericht 1972–1979"],["Sayed Mahrez","MIT","https://koraapedia.com/نتائج-الدوري-المصري-موسم-1972-1973/","Elfmetertor 05.11.1972 als Mahrez"],["Mohsen El Nahriri","ST","https://koraapedia.com/نتائج-الدوري-المصري-موسم-1972-1973/","Tor am 10.11.1972"],["Tarek El Seyagy","Feldspieler","https://almahallaelyoum.blogspot.com/2014/06/?m=0","Rückblick auf Meistersaison 1972/73"],["Ibrahim Hussein","Feldspieler","https://almahallaelyoum.blogspot.com/2014/06/?m=0","Rückblick auf Meistersaison 1972/73"]];
for(const [name,pos,source,note] of add){if(known.has(norm(name)))continue;known.add(norm(name));
 all.push({id:"gha-1973-"+norm(name),name,pos,prole:pos==="TW"?"Torwart":pos==="Feldspieler"?"Feldspieler":undefined,
 strength:14,impact:2,starter:false,squadIndex:all.length,source,verification:note});
}
db[team]=all;
coaches[team]="Ahmed Hamada";
const catalog=(window.TC_CLUB_CATALOG?.["Ägypten · Egyptian Premier League"]||[]).map(x=>x.split("|")[0]);
const count=t=>db[t]?.length||0;
window.TC_EGYPT_ROSTER_AUDIT={version:"2026-10-23-2",seasons:catalog.length,
 under11:catalog.filter(t=>count(t)<11),under15:catalog.filter(t=>count(t)<15),
 historicalKeeper:all.filter(p=>p.pos==="TW").map(p=>p.name),
 completedTeam:team,totalPlayers:all.length,coach:coaches[team],
 note:"historical starter XI unknown; simulation choices only"};
})();
