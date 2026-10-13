/* BetInsight TIME CLASH: shared multilingual music player + quick navigation.
   Audio only loads on manual playback. Does not touch the match engine. */
(function () {
  "use strict";
  var BASE = "https://betinsight.club";
  var SONGS = [
    {id:"de",flag:"🇩🇪",name:"Deutsch",file:"Time Clash (deutsch).mp3"},
    {id:"en-gb",flag:"🇬🇧",name:"English · UK",file:"Time Clash ENGLND.mp3"},
    {id:"en-world",flag:"🌍",name:"English · International",file:"Time Clash international .mp3"},
    {id:"pt-br",flag:"🇧🇷",name:"Português · Brasil",file:"Time Clash port Brasil.mp3"},
    {id:"pt-pt",flag:"🇵🇹",name:"Português · Portugal",file:"Time ClashPort port.mp3"},
    {id:"es-es",flag:"🇪🇸",name:"Español · España",file:"Time Clash SPAIN.mp3"},
    {id:"es-ar",flag:"🇦🇷",name:"Español · Argentina",file:"Time Clash-spain-argent.mp3"},
    {id:"it",flag:"🇮🇹",name:"Italiano",file:"Time Clash ITALIA.mp3"},
    {id:"fr",flag:"🇫🇷",name:"Français",file:"Time Clash -Franz.mp3"},
    {id:"nl",flag:"🇳🇱",name:"Nederlands",file:"Time Clash Niederlande.mp3"}
  ];
  var I18N = {
    de:{music:"DER SOUND VON TIME CLASH",choose:"Deine Lieblingsversion",note:"Starte den Song selbst. Wähle darunter jede andere Länder- und Sprachversion.",other:"Alle 10 Songversionen",selected:"Ausgewählt",wiki:"Football Wiki",wikiSub:"Historische Duelle entdecken",gallery:"Galerie",gallerySub:"Bilder & Momente ansehen",community:"Community",communitySub:"Bereits gespielte Duelle",rank:"Weltrangliste",rankSub:"Die erfolgreichsten Teams",nav:"Entdecke mehr"},
    en:{music:"THE SOUND OF TIME CLASH",choose:"Your favourite version",note:"Start the song when you want. Pick any other country or language below.",other:"All 10 song versions",selected:"Selected",wiki:"Football Wiki",wikiSub:"Explore historic matchups",gallery:"Gallery",gallerySub:"Images and moments",community:"Community",communitySub:"Matches already played",rank:"World ranking",rankSub:"Top-performing teams",nav:"Explore more"},
    es:{music:"LA MÚSICA DE TIME CLASH",choose:"Tu versión favorita",note:"Reproduce la canción cuando quieras. Elige otra versión por país o idioma.",other:"Las 10 versiones",selected:"Seleccionada",wiki:"Wiki de fútbol",wikiSub:"Explora duelos históricos",gallery:"Galería",gallerySub:"Imágenes y momentos",community:"Comunidad",communitySub:"Duelos ya jugados",rank:"Clasificación mundial",rankSub:"Los mejores equipos",nav:"Explora más"},
    pt:{music:"A MÚSICA DO TIME CLASH",choose:"Sua versão favorita",note:"Dê o play quando quiser. Escolha outra versão por país ou idioma abaixo.",other:"As 10 versões",selected:"Selecionada",wiki:"Wiki do futebol",wikiSub:"Descubra duelos históricos",gallery:"Galeria",gallerySub:"Imagens e momentos",community:"Comunidade",communitySub:"Duelo já realizado",rank:"Ranking mundial",rankSub:"As melhores equipes",nav:"Explore mais"},
    it:{music:"LA MUSICA DI TIME CLASH",choose:"La tua versione preferita",note:"Avvia il brano quando vuoi. Scegli altre versioni per lingua o paese.",other:"Tutte le 10 versioni",selected:"Selezionata",wiki:"Wiki del calcio",wikiSub:"Esplora sfide storiche",gallery:"Galleria",gallerySub:"Immagini e momenti",community:"Community",communitySub:"Sfide già giocate",rank:"Classifica mondiale",rankSub:"Le migliori squadre",nav:"Scopri di più"},
    fr:{music:"LA MUSIQUE DE TIME CLASH",choose:"Votre version préférée",note:"Lancez la musique quand vous le souhaitez. Choisissez d'autres versions ci-dessous.",other:"Les 10 versions",selected:"Sélectionnée",wiki:"Wiki du football",wikiSub:"Explorer les duels historiques",gallery:"Galerie",gallerySub:"Images et moments",community:"Communauté",communitySub:"Duels déjà joués",rank:"Classement mondial",rankSub:"Les meilleures équipes",nav:"À découvrir"},
    nl:{music:"DE MUZIEK VAN TIME CLASH",choose:"Jouw favoriete versie",note:"Start zelf de muziek. Kies hieronder een land of een andere taal.",other:"Alle 10 versies",selected:"Geselecteerd",wiki:"Voetbalwiki",wikiSub:"Ontdek historische duels",gallery:"Galerij",gallerySub:"Beelden en momenten",community:"Community",communitySub:"Al gespeelde duels",rank:"Wereldranglijst",rankSub:"De beste teams",nav:"Meer ontdekken"},
    "zh-tw":{music:"TIME CLASH 音樂",choose:"選擇喜愛的版本",note:"音樂不會自動播放。可在下方選擇不同國家與語言版本。",other:"全部 10 個版本",selected:"已選擇",wiki:"足球維基",wikiSub:"探索歷史對決",gallery:"圖片集",gallerySub:"精彩畫面",community:"社群",communitySub:"已進行的對決",rank:"世界排行榜",rankSub:"表現最佳的球隊",nav:"探索更多"}
  };
  function elem(tag, cls, text) {
    var e = document.createElement(tag);
    if(cls) e.className = cls;
    if(text !== undefined) e.textContent = text;
    return e;
  }
  function init() {
    if(document.getElementById("tcAudioV1")) return;
    var main = document.querySelector("main.wrap") || document.querySelector("main");
    var hero = main && main.querySelector("section.hero");
    if(!main || !hero) return;
    var isApp = location.hostname.indexOf("app.betinsight.club") !== -1;
    var pathLocale = location.pathname.split("/")[1];
    var locale = (isApp ? new URLSearchParams(location.search).get("lang") : pathLocale) || "de";
    locale = locale.toLowerCase();
    if(!I18N[locale]) locale = "en";
    var t = I18N[locale];
    var initial = {de:"de",en:"en-gb",es:"es-es",pt:"pt-br",it:"it",fr:"fr",nl:"nl","zh-tw":"en-world"}[locale] || "en-world";
    var current = SONGS.filter(function(s){return s.id === initial;})[0] || SONGS[0];
    var css = elem("style");
    css.textContent = [
      "#tcAudioV1,#tcQuickNavV1{box-sizing:border-box;max-width:100%;font-family:Inter,system-ui,sans-serif}",
      "#tcAudioV1 * ,#tcQuickNavV1 *{box-sizing:border-box}",
      "#tcAudioV1{margin:18px 0 24px;padding:24px;border:1px solid rgba(72,170,214,.32);border-radius:22px;background:linear-gradient(135deg,#092c40 0%,#061b29 65%,#092434 100%);box-shadow:0 16px 42px rgba(0,0,0,.24)}",
      "#tcAudioV1 .tcMusicEyebrow{font-size:12px;letter-spacing:.16em;font-weight:900;color:#74d9ff}",
      "#tcAudioV1 h2{font-size:clamp(21px,3vw,28px);margin:6px 0 4px;color:#fff}",
      "#tcAudioV1 .tcMusicNote{margin:0 0 18px;color:#b7cddd;font-size:14px;line-height:1.45}",
      "#tcAudioV1 .tcNowPlaying{display:flex;gap:14px;align-items:center;padding:15px 17px;border:1px solid rgba(116,217,255,.28);border-radius:16px;background:rgba(0,8,18,.45)}",
      "#tcAudioV1 .tcDisc{flex:0 0 48px;width:48px;height:48px;display:grid;place-items:center;border-radius:15px;background:linear-gradient(145deg,#1567bc,#02b9a5);font-size:25px}",
      "#tcAudioV1 .tcCurrentLabel{font-size:12px;color:#99bfd1;font-weight:750}",
      "#tcAudioV1 .tcCurrentName{font-size:17px;color:#fff;font-weight:900;margin-top:2px}",
      "#tcAudioV1 audio{width:100%;max-width:100%;height:44px;margin:13px 0 8px;display:block;accent-color:#18baff}",
      "#tcAudioV1 h3{font-size:13px;font-weight:850;letter-spacing:.04em;color:#dff4ff;margin:10px 0}",
      "#tcAudioV1 .tcSongGrid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:9px}",
      "#tcAudioV1 .tcSongTile{display:flex;align-items:center;gap:9px;min-width:0;min-height:63px;padding:10px;background:#072333;color:#e8f7ff;border:1px solid #23516a;border-radius:12px;text-align:left;cursor:pointer;font-family:inherit;font-size:12px;font-weight:750;line-height:1.2;transition:background .18s,border-color .18s,transform .18s}",
      "#tcAudioV1 .tcSongTile:hover,#tcAudioV1 .tcSongTile:focus-visible{background:#10405b;border-color:#3ed5ff;transform:translateY(-1px)}",
      "#tcAudioV1 .tcSongTile[aria-pressed='true']{background:#104c56;border-color:#36dab9;box-shadow:inset 0 0 0 1px rgba(54,218,185,.16)}",
      "#tcAudioV1 .tcSongFlag{font-size:23px;line-height:1;flex:none}#tcAudioV1 .tcSongTileLabel{overflow-wrap:anywhere}",
      "#tcQuickNavV1{margin:4px 0 28px}#tcQuickNavV1 h2{font-size:16px;margin:0 0 11px;color:#d8ebf5}",
      "#tcQuickNavV1 .tcNavGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px}",
      "#tcQuickNavV1 a.tcNavTile{display:flex;align-items:flex-start;gap:11px;min-height:86px;margin:0;padding:15px;text-decoration:none!important;border:1px solid #23516a;border-radius:15px;background:linear-gradient(145deg,#082a3d,#071d2b);color:#fff!important;transition:transform .15s,border-color .15s,background .15s}",
      "#tcQuickNavV1 a.tcNavTile:hover,#tcQuickNavV1 a.tcNavTile:focus-visible{transform:translateY(-2px);border-color:#36c5fa;background:#0b344b}",
      "#tcQuickNavV1 .tcNavIcon{font-size:24px;line-height:1.1}#tcQuickNavV1 .tcNavTitle{font-size:14px;font-weight:900;display:block;line-height:1.2}#tcQuickNavV1 .tcNavSub{display:block;margin-top:5px;color:#a8c5d3;font-size:12px;line-height:1.3}",
      ".tcLegacyNavV1Hidden{display:none!important}",
      "@media(max-width:900px){#tcAudioV1 .tcSongGrid{grid-template-columns:repeat(3,minmax(0,1fr))}#tcQuickNavV1 .tcNavGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}",
      "@media(max-width:560px){#tcAudioV1{padding:16px;margin:12px 0 18px}#tcAudioV1 .tcSongGrid{grid-template-columns:repeat(2,minmax(0,1fr))}#tcQuickNavV1 .tcNavGrid{grid-template-columns:1fr 1fr;gap:8px}#tcQuickNavV1 a.tcNavTile{padding:11px;min-height:90px;gap:7px}#tcQuickNavV1 .tcNavTitle{font-size:13px}#tcQuickNavV1 .tcNavSub{font-size:11px}}"
    ].join("\n");
    document.head.appendChild(css);

    var music = elem("section");
    music.id = "tcAudioV1";
    music.setAttribute("aria-label",t.music);
    music.appendChild(elem("div","tcMusicEyebrow","♫ " + t.music));
    music.appendChild(elem("h2","",t.choose));
    music.appendChild(elem("p","tcMusicNote",t.note));
    var now = elem("div","tcNowPlaying");
    now.appendChild(elem("div","tcDisc","♫"));
    var details = elem("div");
    details.appendChild(elem("div","tcCurrentLabel","TIME CLASH · " + t.selected));
    var trackTitle = elem("div","tcCurrentName", current.flag + " " + current.name);
    details.appendChild(trackTitle);now.appendChild(details);music.appendChild(now);
    var player = elem("audio");
    player.controls = true;
    player.preload = "none";
    player.setAttribute("aria-label",t.choose);
    player.src = BASE + "/assets/time-clash/audio/" + encodeURIComponent(current.file);
    music.appendChild(player);
    music.appendChild(elem("h3","",t.other));
    var grid = elem("div","tcSongGrid");
    var buttons = [];
    SONGS.forEach(function(song){
      var b = elem("button","tcSongTile");
      b.type = "button";
      b.setAttribute("aria-pressed",String(song.id === current.id));
      b.setAttribute("title",song.name);
      b.appendChild(elem("span","tcSongFlag",song.flag));
      b.appendChild(elem("span","tcSongTileLabel",song.name));
      b.addEventListener("click",function(){
        current = song;
        player.pause();
        player.src = BASE + "/assets/time-clash/audio/" + encodeURIComponent(song.file);
        player.load();
        trackTitle.textContent = song.flag + " " + song.name;
        buttons.forEach(function(x){x.setAttribute("aria-pressed",String(x === b));});
        var start = player.play();
        if(start && typeof start.catch === "function") start.catch(function(){});
      });
      grid.appendChild(b);buttons.push(b);
    });
    music.appendChild(grid);

    var publicLocale = (locale === "nl" || locale === "zh-tw") ? "en" : locale;
    var nav = elem("section");
    nav.id = "tcQuickNavV1";
    nav.setAttribute("aria-label",t.nav);
    nav.appendChild(elem("h2","",t.nav));
    var navGrid=elem("div","tcNavGrid");
    var cards=[
      {icon:"📚",title:t.wiki,sub:t.wikiSub,href:BASE+"/"+locale+"/wiki/time-clash/"},
      {icon:"🖼️",title:t.gallery,sub:t.gallerySub,href:BASE+"/"+publicLocale+"/time-clash/galerie/"},
      {icon:"🌍",title:t.community,sub:t.communitySub,href:BASE+"/"+publicLocale+"/time-clash/community/"},
      {icon:"🏆",title:t.rank,sub:t.rankSub,href:BASE+"/"+publicLocale+"/time-clash/rangliste/"}
    ];
    cards.forEach(function(c){
      var a=elem("a","tcNavTile");a.href=c.href;
      if(isApp){a.target="_blank";a.rel="noopener noreferrer";}
      a.appendChild(elem("span","tcNavIcon",c.icon));
      var words=elem("span");
      words.appendChild(elem("span","tcNavTitle",c.title));
      words.appendChild(elem("span","tcNavSub",c.sub));
      a.appendChild(words);navGrid.appendChild(a);
    });
    nav.appendChild(navGrid);
    hero.insertAdjacentElement("afterend",nav);
    hero.insertAdjacentElement("afterend",music);

    /* Replace only old free-standing underlined shortcuts, not functional game links. */
    main.querySelectorAll(".seoLink > a").forEach(function(a){
      if(/\/(wiki\/time-clash|time-clash\/(?:community|galerie|rangliste))\/?/.test(a.pathname)){
        if(a.parentElement && a.parentElement.classList.contains("seoLink")) a.parentElement.classList.add("tcLegacyNavV1Hidden");
      }
    });
    /* Fix legacy app Wiki URL which otherwise points to app.betinsight.club/wiki/. */
    var wiki = document.getElementById("tcWikiLink");
    if(wiki) wiki.href = BASE + "/" + locale + "/wiki/time-clash/";
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();