/* Historical European champion squads 1964-1988.
   Names and playing positions transcribed from UEFA winner squad tables:
   https://www.uefa.com/news/025f-0ff0bba775e3-451a9527dcbf-1000--winning-players/
   Coach names checked against https://www.uefa.com/uefaeuro/history/news/025f-0fd28e1a592d-c389509c8b2d-1000--euro-coaches-the-records/
   Starting XI chosen for simulation using 1 GK, up to 4 DEF, 4 MID, 2 FWD, with
   historically documented substitutions when positional category has fewer.
   No claim that the simulated XI is the actual historic match XI.
*/
(function(){"use strict";
const GROUPS={"Spanien 1964 · Europameister":{"coach":"José Villalonga","TW":"José Ángel Iribar;José Vicente;Salvador Sadurní","ABW":"Luis María Echeberría;Isacio Calleja;Gallego;Ferran Olivella;Severino Reija;Feliciano Rivilla","MIT":"José Cuéllar González;Luis del Sol;Josep Maria Fusté;Paquito;Chus Pereda;Ignacio Zoco;Félix Ruiz;Adelardo Rodríguez","ST":"Enrique Collar;Amancio Amaro;Carlos Lapetra;Marcelino Martínez;Luis Suárez"},"Italien 1968 · Europameister":{"coach":"Ferruccio Valcareggi","TW":"Enrico Albertosi;Lido Vieri;Dino Zoff","ABW":"Angelo Anquilletti;Giancarlo Bercellino;Tarcisio Burgnich;Ernesto Castano;Giacinto Facchetti;Roberto Rosato;Sandro Salvadore","MIT":"Giancarlo De Sisti;Giorgio Ferrini;Aristide Guarneri;Antonio Juliano;Giovanni Lodetti;Gianni Rivera","ST":"Pietro Anastasi;Giacomo Bulgarelli;Angelo Domenghini;Sandro Mazzola;Pierino Prati;Luigi Riva"},"Deutschland 1972 · Europameister":{"coach":"Helmut Schön","TW":"Sepp Maier;Wolfgang Kleff","ABW":"Horst-Dieter Höttges;Paul Breitner;Hans-Georg Schwarzenbeck;Franz Beckenbauer;Berti Vogts;Michael Bella","MIT":"Herbert Wimmer;Günter Netzer;Rainer Bonhof;Horst Köppel","ST":"Jürgen Grabowski;Uli Hoeness;Jupp Heynckes;Erwin Kremers;Gerd Müller;Johannes Löhr"},"Tschechoslowakei 1976 · Europameister":{"coach":"Václav Ježek","TW":"Ivo Viktor;Alexander Vencel","ABW":"Karol Dobiaš;Jozef Čapkovič;Anton Ondruš;Ján Pivarník;Ladislav Jurkemik;Koloman Gögh;Jozef Barmoš;Pavol Biroš","MIT":"Antonín Panenka;Jozef Móder;Jaroslav Pollák;Dušan Herda;František Veselý;Ján Švehlík;František Štambachr;Přemysl Bičovský","ST":"Marián Masný;Zdeněk Nehoda;Dušan Galis;Ladislav Petráš"},"Deutschland 1980 · Europameister":{"coach":"Jupp Derwall","TW":"Harald Schumacher;Walter Junghans;Eike Immel","ABW":"Hans-Peter Briegel;Bernhard Cullmann;Karlheinz Förster;Bernard Dietz;Bernd Förster;Herbert Zimmermann;Manfred Kaltz","MIT":"Bernd Schuster;Hansi Müller;Caspar Memering;Rainer Bonhof;Felix Magath;Uli Stielike;Karl Del'Haye;Lothar Matthäus;Miroslav Votava","ST":"Karl-Heinz Rummenigge;Horst Hrubesch;Klaus Allofs"},"Frankreich 1984 · Europameister":{"coach":"Michel Hidalgo","TW":"Joël Bats;Philippe Bergeroo;Albert Rust","ABW":"Manuel Amoros;Jean-François Domergue;Maxime Bossis;Patrick Battiston;Yvon Le Roux;Thierry Tusseau","MIT":"Luis Fernández;Jean-Marc Ferreri;Daniel Bravo;Bernard Genghini;Michel Platini;Bruno Bellone;Alain Giresse;Didier Six;Jean Tigana","ST":"Dominique Rocheteau;Bernard Lacombe"},"Niederlande 1988 · Europameister":{"coach":"Rinus Michels","TW":"Hans van Breukelen;Joop Hiele","ABW":"Adri van Tiggelen;Sjaak Troost;Ronald Koeman;Berry van Aerle;Wim Koevermans;Frank Rijkaard;Wilbert Suvrijn","MIT":"Aron Winter;Gerald Vanenburg;Arnold Mühren;John van 't Schip;Erwin Koeman;Hendrie Krüzen;Jan Wouters","ST":"John Bosman;Ruud Gullit;Marco van Basten;Wim Kieft"}};
const db=window.TC_ROSTER_DB=window.TC_ROSTER_DB||{},coaches=window.TC_COACH_DB=window.TC_COACH_DB||{};
const src="https://www.uefa.com/news/025f-0ff0bba775e3-451a9527dcbf-1000--winning-players/",roles=["TW","ABW","MIT","ST"];
const slug=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const audit={source:src,imported:[],retained:[],invalid:[]};
for(const [team,data] of Object.entries(GROUPS)){
 const existing=db[team];if(Array.isArray(existing)&&existing.length>=11){audit.retained.push(team);if(!coaches[team])coaches[team]=data.coach;continue}
 const groups=roles.map(role=>data[role].split(";").map(s=>s.trim()).filter(Boolean).map(name=>({name,pos:role})));
 const pool=groups.flat(),unique=new Set(pool.map(p=>slug(p.name)));
 if(pool.length<15||unique.size!==pool.length||!groups[0].length){audit.invalid.push(team);continue}
 const starters=[...groups[0].slice(0,1),...groups[1].slice(0,4),...groups[2].slice(0,4),...groups[3].slice(0,2)];
 const used=new Set(starters.map(p=>slug(p.name)));
 if(starters.length<11)for(const p of [...groups[2],...groups[1],...groups[3],...groups[0]]){if(starters.length===11)break;if(!used.has(slug(p.name))){starters.push(p);used.add(slug(p.name))}}
 if(starters.length!==11){audit.invalid.push(team);continue}
 db[team]=[...starters,...pool.filter(p=>!used.has(slug(p.name)))].map((p,i)=>({id:"euro-"+slug(p.name),name:p.name,pos:p.pos,impact:3,strength:18,starter:i<11,squadIndex:i,source:src,verification:"UEFA EURO championship roster"}));
 coaches[team]=data.coach;audit.imported.push({team,players:db[team].length});
}
window.TC_EURO_1964_1988_AUDIT=audit;
})();
