/* BetInsight TIME CLASH | UEFA European champion squads 1992–2024
 Names, positions: https://www.uefa.com/news/025f-0ff0bba775e3-451a9527dcbf-1000--winning-players/
 Coaches: https://www.uefa.com/uefaeuro/history/news/025f-0fd28e1a592d-c389509c8b2d-1000--euro-coaches-the-records/
 These are documented tournament squads; starting 11 is a simulation selection,
 NOT the original historical starting eleven. No invented players.
*/
(function(){"use strict";
const GROUPS={"Dänemark 1992 · Europameister":{"coach":"Richard Møller Nielsen","TW":"Peter Schmeichel;Mogens Krogh","ABW":"John Sivebæk;Kent Nielsen;Lars Olsen;Kim Christofte;Torben Piechnik;Claus Christiansen","MIT":"Henrik Andersen;John Jensen;Johnny Mølby;Henrik Larsen;Kim Vilfort;Peter Nielsen;Morten Bruun","ST":"Flemming Povlsen;Lars Elstrup;Brian Laudrup;Torben Frank;Bent Christensen Arensøe"},"Deutschland 1996 · Europameister":{"coach":"Berti Vogts","TW":"Andreas Köpke;Oliver Kahn;Oliver Reck","ABW":"Stefan Reuter;Thomas Helmer;Matthias Sammer;Markus Babbel;Jürgen Kohler;René Schneider;Christian Ziege","MIT":"Marco Bode;Steffen Freund;Andreas Möller;Mehmet Scholl;Thomas Hässler;Mario Basler;Thomas Strunz;Dieter Eilts;Jens Todt","ST":"Fredi Bobic;Stefan Kuntz;Jürgen Klinsmann;Oliver Bierhoff"},"Frankreich 2000 · Europameister":{"coach":"Roger Lemerre","TW":"Bernard Lama;Fabien Barthez;Ulrich Ramé","ABW":"Vincent Candela;Bixente Lizarazu;Laurent Blanc;Marcel Desailly;Lilian Thuram;Frank Lebœuf","MIT":"Patrick Vieira;Youri Djorkaeff;Didier Deschamps;Zinédine Zidane;Robert Pirès;Johan Micoud;Emmanuel Petit;Christian Karembeu","ST":"Nicolas Anelka;Thierry Henry;Sylvain Wiltord;David Trezeguet;Christophe Dugarry"},"Spanien 2008 · Europameister":{"coach":"Luis Aragonés","TW":"Iker Casillas;Andrés Palop;Pepe Reina","ABW":"Raúl Albiol;Fernando Navarro;Carlos Marchena;Carles Puyol;Joan Capdevila;Sergio Ramos;Álvaro Arbeloa;Juanito","MIT":"Andrés Iniesta;Xavi Hernández;Cesc Fàbregas;Santi Cazorla;Xabi Alonso;Marcos Senna;David Silva;Rubén de la Red","ST":"David Villa;Fernando Torres;Sergio García;Daniel Güiza"},"Spanien 2012 · Europameister":{"coach":"Vicente del Bosque","TW":"Iker Casillas;Víctor Valdés;Pepe Reina","ABW":"Raúl Albiol;Gerard Piqué;Juanfran;Sergio Ramos;Álvaro Arbeloa;Jordi Alba","MIT":"Javi Martínez;Andrés Iniesta;Xavi Hernández;Cesc Fàbregas;Juan Mata;Xabi Alonso;Sergio Busquets;Santi Cazorla;David Silva;Jesús Navas","ST":"Pedro Rodríguez;Fernando Torres;Álvaro Negredo;Fernando Llorente"},"Portugal 2016 · Europameister":{"coach":"Fernando Santos","TW":"Rui Patrício;Anthony Lopes;Eduardo","ABW":"Bruno Alves;Pepe;José Fonte;Raphaël Guerreiro;Ricardo Carvalho;Eliseu;Cédric","MIT":"João Moutinho;João Mário;Vieirinha;Danilo;William Carvalho;André Gomes;Renato Sanches;Rafa Silva;Adrien Silva","ST":"Cristiano Ronaldo;Éder;Nani;Ricardo Quaresma"},"Spanien 2024 · Europameister":{"coach":"Luis de la Fuente","TW":"David Raya;Álex Remiro;Unai Simón","ABW":"Dani Carvajal;Robin Le Normand;Nacho;Daniel Vivian;Alejandro Grimaldo;Aymeric Laporte;Jesús Navas;Marc Cucurella","MIT":"Mikel Merino;Fabián Ruiz;Álex Baena;Rodri;Martín Zubimendi;Pedri","ST":"Álvaro Morata;Joselu;Dani Olmo;Ferran Torres;Nico Williams;Lamine Yamal;Mikel Oyarzabal;Fermín López;Ayoze Pérez"}};
const db=window.TC_ROSTER_DB=window.TC_ROSTER_DB||{},coaches=window.TC_COACH_DB=window.TC_COACH_DB||{};
const src="https://www.uefa.com/news/025f-0ff0bba775e3-451a9527dcbf-1000--winning-players/",roles=["TW","ABW","MIT","ST"];
const slug=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const audit={source:src,imported:[],retained:[],invalid:[]};
for(const [team,data] of Object.entries(GROUPS)){
 const old=db[team];
 if(Array.isArray(old)&&old.length>=11){audit.retained.push(team);if(!coaches[team])coaches[team]=data.coach;continue}
 const groups=roles.map(pos=>data[pos].split(";").map(s=>s.trim()).filter(Boolean).map(name=>({name,pos})));
 const pool=groups.flat(),unique=new Set(pool.map(p=>slug(p.name)));
 if(pool.length<15||unique.size!==pool.length||!groups[0].length){audit.invalid.push(team);continue}
 const starters=[...groups[0].slice(0,1),...groups[1].slice(0,4),...groups[2].slice(0,4),...groups[3].slice(0,2)];
 const used=new Set(starters.map(p=>slug(p.name)));
 if(starters.length<11)for(const p of [...groups[2],...groups[1],...groups[3],...groups[0]]){if(starters.length===11)break;if(!used.has(slug(p.name))){starters.push(p);used.add(slug(p.name))}}
 if(starters.length!==11){audit.invalid.push(team);continue}
 db[team]=[...starters,...pool.filter(p=>!used.has(slug(p.name)))].map((p,i)=>({id:"euro-"+slug(p.name),name:p.name,pos:p.pos,impact:3,strength:18,starter:i<11,squadIndex:i,source:src,verification:"UEFA EURO winners squad"}));
 coaches[team]=data.coach;audit.imported.push({team,players:db[team].length});
}
window.TC_EURO_1992_2024_AUDIT=audit;
})();
