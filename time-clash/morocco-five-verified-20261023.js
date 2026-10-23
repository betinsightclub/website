/* TIME CLASH | five Moroccan championship seasons.
 All player names come from season-specific published squads. Source per added player.
 Coaches: RS Berkane Mouine Chaabani; FAR Rabat Fernando da Cruz;
 Wydad 2020/21 Faouzi Benzarti; Raja 2019/20 Jamal Sellami;
 Wydad 2016/17 Houcine Ammouta. First XI not claimed historically accurate.
 Sources: https://www.transfermarkt.com/renaissance-de-berkane/kader/verein/37176/saison_id/2024; https://www.transfermarkt.com/far-rabat/kader/verein/9099/saison_id/2022; https://en.wikipedia.org/wiki/2020%E2%80%9321_Wydad_AC_season; https://en.wikipedia.org/wiki/2019%E2%80%9320_Raja_CA_season; https://www.national-football-teams.com/app.php/club/1670/2016_1/Wydad_Ac_Casablanca.html
*/
(function(){"use strict";
const SQUADS={"Renaissance Berkane 2024/25":{"coach":"Mouine Chaabani","source":"https://www.transfermarkt.com/renaissance-de-berkane/kader/verein/37176/saison_id/2024","names":{"TW":"Munir El Kajoui;Hamza Hamiani;Mehdi Maftah;Kamal Bilal","ABW":"Amine Sadiki;Amine Ennajihi;Ahmed Ait Ouzogar;Ilyass Bouqdire;Reda Hanane;Hamza El Moussaoui;Mohamed Aymen Sadil;Walid Maataoui;Haytam Manaout;Omar Nefah;Mohamed Farhane","MIT":"Mamadou Lamine Camara;Soumaila Sidibe;Ayoub Khairi;Mateus Santos;Imad Riahi","ST":"Youssef Mehri;Abdellah Ziani;Zaid Dkioukien;Abdelghafour Gourari;Youssef Zghoudi;Yassine Belghroudi;Mohammed Amrani;Houssam Djellal;Oussama Lamlioui;Paul Bassène;Baba Bello Ilou;Mohamed El-Haoudar;Papa Souley Diallo;Wassim Mellouk;Hamza Raji"}},"FAR Rabat 2022/23":{"coach":"Fernando da Cruz","source":"https://www.transfermarkt.com/far-rabat/kader/verein/9099/saison_id/2022","names":{"TW":"Ayoub Lakred;Mohamed Baayou;Hassan Doughmi;Ayoub Boulbir","ABW":"Diney Borges;Hatim Es-Saoubi;Anouar Tarkhatt;Dhiaeddine Jouini;Abdessamad Ammal;Emmanuel Imanishimwe","MIT":"Mohamed Hrimat;Abdelfettah Hadraf;Zineddine Derrag;Ayoub El Malyani;Soulaimane El Bouchqali","ST":"Ahmed Hammoudan;Adam Ennaffati;Lamine Diakité;Zakaria Fati;Mohamed El Khaloui;Reda Slim;Ayoub Assout;Mustapha Sahd;Joseph Guédé Gnadou;Hamza Igamane;Ismail Khafi;Lambert Gueme Araina"}},"Wydad AC Casablanca 2020/21":{"coach":"Faouzi Benzarti","source":"https://en.wikipedia.org/wiki/2020%E2%80%9321_Wydad_AC_season","names":{"TW":"Yanis Henin;Ahmed Reda Tagnaouti;Aissa Sioudi","ABW":"Achraf Dari;Badr Gaddarine;Yahia Attiyat Allah;Ayoub Benchaoui;Hamza Asrir;Soufiane Karkache;Ayoub El Amloud;Zakaria Kiani;Mohamed Rahim;Cheick Comara;Amine Aboulfath","MIT":"Ayoub Skouma;Salaheddine Saidi;Yahya Jabrane;Anas Serrhat;Walid El Karti;Sofian El Moudane;Hamza Ait Allal;Abdellah Haimoud","ST":"Mohamed Ounajem;Ayoub El Kaabi;Simon Msuva;Badie Aouk;Ayman El Hassouni;Muaid Ellafi;Mounsef Chrachem;Zouhair El Moutaraji;Mohamed El Ouardi"}},"Raja Casablanca 2019/20":{"coach":"Jamal Sellami","source":"https://en.wikipedia.org/wiki/2019%E2%80%9320_Raja_CA_season","names":{"TW":"Anas Zniti;Mohamed Bouamira;Amir El Haddaoui","ABW":"Ilias Haddad;Salif Coulibaly;Sanad Al Warfali;Badr Benoun;Omar Boutayeb;Abdelilah Madkour;Abdeljalil Jbira;Fabrice Ngah;Mohamed Douik;Zakaria Driouch;Oussama Soukhane","MIT":"Mohamed Zrida;Abderrahim Achchakir;Omar Arjoune;Mohamed Al Makahasi;Fabrice Ngoma;Zakaria El Wardi;Mouad Mouchtanim;Ayoub Nanah;Mohsine Moutaouali;Abdelilah Hafidi","ST":"Mahmoud Benhalib;Ben Malango;Youssef Bekkari;Hamid Ahadad;Zakaria Habti;Anas Jabroun;Soufiane Rahimi;Hicham Islah"}},"Wydad AC Casablanca 2016/17":{"coach":"Houcine Ammouta","source":"https://www.national-football-teams.com/app.php/club/1670/2016_1/Wydad_Ac_Casablanca.html","names":{"TW":"Ahmed Reda Tagnaouti","ABW":"Amine El Attouchi;Abdellatif Noussir;Youssef Rabeh;Anass Lamrabat;Younès Bellakhdar;Achraf Dari","MIT":"Brahim Nekkach;Walid El Karti;Salaheddine Saïdi;Jamel Aït Ben Idir;Anas El Asbahi;Aymane El Hassouni;El Mehdi Karnas","ST":"William Jebor;Mohamed Ounajem;Achraf Bencharki;Fabrice Ondama;Abdeladim Khadrouf;Ismail El Haddad;Chisom Chikatara;Ibrahima Sory Keïta"}}};
const db=window.TC_ROSTER_DB=window.TC_ROSTER_DB||{},coaches=window.TC_COACH_DB=window.TC_COACH_DB||{};
const slug=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const norm=s=>slug(s).split("-").map(x=>x==="aymane"?"ayman":x).filter(Boolean).sort().join("-");
const audit={teams:{},incomplete:[]};
for(const [team,info] of Object.entries(SQUADS)){
 const players=Array.isArray(db[team])?db[team]:[],byName=new Map(players.map(p=>[norm(p.name),p]));
 let added=0;
 for(const [pos,text] of Object.entries(info.names)){
  for(const name of text.split(";").map(x=>x.trim()).filter(Boolean)){
   const key=norm(name),old=byName.get(key);
   if(old){if(!old.pos)old.pos=pos;continue}
   const p={id:"mar2-"+slug(name),name,pos,strength:18,impact:3,
     starter:false,squadIndex:players.length,source:info.source,
     verification:"historical-champion-season-squad"};
   players.push(p);byName.set(key,p);added++;
  }
 }
 db[team]=players;if(info.coach&&!coaches[team])coaches[team]=info.coach;
 const gk=players.filter(p=>p.pos==="TW").length;
 audit.teams[team]={players:players.length,added,goalkeepers:gk,coach:coaches[team]};
 if(players.length<15||gk<1)audit.incomplete.push(team);
}
window.TC_MOROCCO_FIVE_AUDIT=audit;
})();
