
(() => {
  "use strict";

  const LANGS = ["de","en","es","pt","it","fr"];
  const currentLang = (() => {
    const first = location.pathname.split("/").filter(Boolean)[0]?.toLowerCase();
    return LANGS.includes(first) ? first : "de";
  })();

  const T = {
    de:{
      months:["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],
      weekdays:["Mo","Di","Mi","Do","Fr","Sa","So"],
      workshop:"Workshop", webinar:"Live-Webinar", external:"Community-Webinar",
      german:"Deutsch", online:"Online", at:"20:00 Uhr · Deutschland",
      workshopTitle:"BetInsight Workshop", webinarTitle:"BetInsight Live-Webinar",
      workshopDesc:"Praxis, Fragen und gemeinsamer Austausch rund um BetInsight. Die konkreten Inhalte können von Woche zu Woche wechseln.",
      webinarDesc:"BetInsight live kennenlernen: Konzept, Plattform und Anwendung. Fragen sind im Anschluss möglich.",
      details:"Zum Webinar", save:"Termin speichern", upcoming:"Nächste Termine",
      noEvents:"Aktuell sind keine weiteren Termine eingetragen.",
      hostTitle:"Du möchtest ein eigenes Webinar rund um BetInsight eintragen?",
      hostLead:"Wenn du ein Webinar oder einen Workshop mit klarem Bezug zu BetInsight anbieten möchtest, kannst du dich hier vorstellen. Trage dein Thema, die Sprache und dein Wunschdatum ein. Jede Einreichung wird vor einer Veröffentlichung geprüft.",
      hostBtn:"BetInsight-Webinar vorschlagen",
      hostPoints:["Das Webinar oder der Workshop muss sich konkret auf BetInsight beziehen","Thema, Sprache, Wunschdatum und kurze Vorstellung angeben","Veröffentlichung erst nach Prüfung und Freigabe durch BetInsight"],
      modalTitle:"BetInsight-Webinar / Workshop vorschlagen", close:"Schließen",
      name:"Name", email:"E-Mail", title:"Titel des Webinars", topic:"BetInsight-Thema / Kurzbeschreibung",
      language:"Sprache des Webinars", date:"Wunschdatum", links:"Website / Social / Referenzlink (optional)",
      intro:"Stell dich kurz vor und erkläre deinen Bezug zu BetInsight", submit:"Vorschlag per E-Mail vorbereiten",
      note:"Beim Absenden öffnet sich dein E-Mail-Programm mit den eingegebenen Angaben. Die Nachricht wird nicht automatisch versendet.",
      mailSubject:"BetInsight Eventkalender – Webinar-Vorschlag",
      workshopMini:"Workshop", webinarMini:"Webinar",
      footer:"© 2026 BetInsight Club · Events"
    },
    en:{
      months:["January","February","March","April","May","June","July","August","September","October","November","December"],
      weekdays:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
      workshop:"Workshop", webinar:"Live webinar", external:"Community webinar",
      german:"German", online:"Online", at:"20:00 · Germany time",
      workshopTitle:"BetInsight Workshop", webinarTitle:"BetInsight Live Webinar",
      workshopDesc:"Practical topics, questions and community exchange around BetInsight. The exact focus may change from week to week.",
      webinarDesc:"Discover BetInsight live: concept, platform and practical use. Questions are welcome afterwards.",
      details:"Open webinar", save:"Save event", upcoming:"Upcoming events",
      noEvents:"No further events are currently listed.",
      hostTitle:"Would you like to submit your own BetInsight webinar?",
      hostLead:"If you want to offer a webinar or workshop with a clear connection to BetInsight, introduce yourself here. Add your topic, language and preferred date. Every submission is reviewed before publication.",
      hostBtn:"Suggest a BetInsight webinar",
      hostPoints:["The webinar or workshop must have a clear BetInsight focus","Provide topic, language, preferred date and a short introduction","Publication only after review and approval by BetInsight"],
      modalTitle:"Suggest a BetInsight webinar / workshop", close:"Close",
      name:"Name", email:"Email", title:"Webinar title", topic:"BetInsight topic / short description",
      language:"Webinar language", date:"Preferred date", links:"Website / social / reference link (optional)",
      intro:"Briefly introduce yourself and explain your connection to BetInsight", submit:"Prepare email proposal",
      note:"Submitting opens your email app with the details you entered. The message is not sent automatically.",
      mailSubject:"BetInsight Event Calendar – Webinar Proposal",
      workshopMini:"Workshop", webinarMini:"Webinar",
      footer:"© 2026 BetInsight Club · Events"
    },
    es:{
      months:["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],
      weekdays:["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"],
      workshop:"Taller", webinar:"Webinar en directo", external:"Webinar de la comunidad",
      german:"Alemán", online:"Online", at:"20:00 · hora de Alemania",
      workshopTitle:"Taller BetInsight", webinarTitle:"Webinar en directo de BetInsight",
      workshopDesc:"Práctica, preguntas e intercambio sobre BetInsight. El contenido concreto puede variar cada semana.",
      webinarDesc:"Conoce BetInsight en directo: concepto, plataforma y uso práctico. Habrá espacio para preguntas al final.",
      details:"Ir al webinar", save:"Guardar evento", upcoming:"Próximos eventos",
      noEvents:"Actualmente no hay más eventos publicados.",
      hostTitle:"¿Quieres proponer tu propio webinar sobre BetInsight?",
      hostLead:"Si quieres ofrecer un webinar o taller claramente relacionado con BetInsight, preséntate aquí. Indica el tema, el idioma y la fecha deseada. Revisamos cada propuesta antes de publicarla.",
      hostBtn:"Proponer webinar de BetInsight",
      hostPoints:["El webinar o taller debe estar claramente relacionado con BetInsight","Indica tema, idioma, fecha preferida y una breve presentación","Publicación solo después de la revisión y aprobación de BetInsight"],
      modalTitle:"Propón un webinar / taller de BetInsight", close:"Cerrar",
      name:"Nombre", email:"Correo electrónico", title:"Título del webinar", topic:"Tema de BetInsight / breve descripción",
      language:"Idioma del webinar", date:"Fecha preferida", links:"Web / redes / enlace de referencia (opcional)",
      intro:"Preséntate brevemente y explica tu relación con BetInsight", submit:"Preparar propuesta por correo",
      note:"Al enviar se abrirá tu aplicación de correo con los datos introducidos. El mensaje no se envía automáticamente.",
      mailSubject:"Calendario BetInsight – Propuesta de webinar",
      workshopMini:"Taller", webinarMini:"Webinar",
      footer:"© 2026 BetInsight Club · Eventos"
    },
    pt:{
      months:["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
      weekdays:["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"],
      workshop:"Workshop", webinar:"Webinar ao vivo", external:"Webinar da comunidade",
      german:"Alemão", online:"Online", at:"20:00 · horário da Alemanha",
      workshopTitle:"Workshop BetInsight", webinarTitle:"Webinar ao vivo BetInsight",
      workshopDesc:"Prática, perguntas e troca de experiências sobre o BetInsight. O tema específico pode mudar a cada semana.",
      webinarDesc:"Conheça o BetInsight ao vivo: conceito, plataforma e uso prático. Perguntas podem ser feitas ao final.",
      details:"Abrir webinar", save:"Salvar evento", upcoming:"Próximos eventos",
      noEvents:"No momento não há outros eventos publicados.",
      hostTitle:"Quer propor seu próprio webinar sobre a BetInsight?",
      hostLead:"Se você quiser oferecer um webinar ou workshop com relação clara com a BetInsight, apresente-se aqui. Informe o tema, o idioma e a data desejada. Cada envio é analisado antes da publicação.",
      hostBtn:"Sugerir webinar BetInsight",
      hostPoints:["O webinar ou workshop deve ter relação clara com a BetInsight","Informe tema, idioma, data desejada e uma breve apresentação","Publicação somente após análise e aprovação da BetInsight"],
      modalTitle:"Sugira um webinar / workshop BetInsight", close:"Fechar",
      name:"Nome", email:"E-mail", title:"Título do webinar", topic:"Tema BetInsight / breve descrição",
      language:"Idioma do webinar", date:"Data desejada", links:"Site / redes sociais / referência (opcional)",
      intro:"Apresente-se brevemente e explique sua relação com a BetInsight", submit:"Preparar proposta por e-mail",
      note:"Ao enviar, seu aplicativo de e-mail será aberto com os dados preenchidos. A mensagem não é enviada automaticamente.",
      mailSubject:"Calendário BetInsight – Proposta de webinar",
      workshopMini:"Workshop", webinarMini:"Webinar",
      footer:"© 2026 BetInsight Club · Eventos"
    },
    it:{
      months:["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"],
      weekdays:["Lun","Mar","Mer","Gio","Ven","Sab","Dom"],
      workshop:"Workshop", webinar:"Webinar live", external:"Webinar della community",
      german:"Tedesco", online:"Online", at:"20:00 · ora tedesca",
      workshopTitle:"Workshop BetInsight", webinarTitle:"Webinar live BetInsight",
      workshopDesc:"Pratica, domande e confronto sulla piattaforma BetInsight. Il tema specifico può cambiare di settimana in settimana.",
      webinarDesc:"Scopri BetInsight dal vivo: concetto, piattaforma e utilizzo pratico. Alla fine ci sarà spazio per le domande.",
      details:"Apri webinar", save:"Salva evento", upcoming:"Prossimi eventi",
      noEvents:"Al momento non sono pubblicati altri eventi.",
      hostTitle:"Vuoi proporre un tuo webinar su BetInsight?",
      hostLead:"Se vuoi proporre un webinar o workshop chiaramente collegato a BetInsight, presentati qui. Indica argomento, lingua e data preferita. Ogni proposta viene verificata prima della pubblicazione.",
      hostBtn:"Proponi un webinar BetInsight",
      hostPoints:["Il webinar o workshop deve avere un chiaro collegamento con BetInsight","Indica argomento, lingua, data preferita e una breve presentazione","Pubblicazione solo dopo verifica e approvazione di BetInsight"],
      modalTitle:"Proponi un webinar / workshop BetInsight", close:"Chiudi",
      name:"Nome", email:"E-mail", title:"Titolo del webinar", topic:"Tema BetInsight / breve descrizione",
      language:"Lingua del webinar", date:"Data preferita", links:"Sito / social / link di riferimento (opzionale)",
      intro:"Presentati brevemente e spiega il tuo rapporto con BetInsight", submit:"Prepara la proposta via e-mail",
      note:"Con l'invio si aprirà il tuo programma e-mail con i dati inseriti. Il messaggio non viene inviato automaticamente.",
      mailSubject:"Calendario BetInsight – Proposta webinar",
      workshopMini:"Workshop", webinarMini:"Webinar",
      footer:"© 2026 BetInsight Club · Eventi"
    },
    fr:{
      months:["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],
      weekdays:["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"],
      workshop:"Atelier", webinar:"Webinaire en direct", external:"Webinaire de la communauté",
      german:"Allemand", online:"En ligne", at:"20:00 · heure allemande",
      workshopTitle:"Atelier BetInsight", webinarTitle:"Webinaire en direct BetInsight",
      workshopDesc:"Pratique, questions et échanges autour de BetInsight. Le thème précis peut varier d'une semaine à l'autre.",
      webinarDesc:"Découvrez BetInsight en direct : concept, plateforme et utilisation pratique. Une session de questions est prévue à la fin.",
      details:"Ouvrir le webinaire", save:"Ajouter au calendrier", upcoming:"Prochains événements",
      noEvents:"Aucun autre événement n'est actuellement publié.",
      hostTitle:"Vous souhaitez proposer votre propre webinaire sur BetInsight ?",
      hostLead:"Si vous souhaitez proposer un webinaire ou atelier clairement lié à BetInsight, présentez-vous ici. Indiquez le sujet, la langue et la date souhaitée. Chaque proposition est examinée avant publication.",
      hostBtn:"Proposer un webinaire BetInsight",
      hostPoints:["Le webinaire ou atelier doit avoir un lien clair avec BetInsight","Indiquer le sujet, la langue, la date souhaitée et une courte présentation","Publication uniquement après examen et validation par BetInsight"],
      modalTitle:"Proposer un webinaire / atelier BetInsight", close:"Fermer",
      name:"Nom", email:"E-mail", title:"Titre du webinaire", topic:"Sujet BetInsight / brève description",
      language:"Langue du webinaire", date:"Date souhaitée", links:"Site / réseaux / lien de référence (facultatif)",
      intro:"Présentez-vous brièvement et expliquez votre lien avec BetInsight", submit:"Préparer la proposition par e-mail",
      note:"L'envoi ouvre votre application e-mail avec les informations saisies. Le message n'est pas envoyé automatiquement.",
      mailSubject:"Calendrier BetInsight – Proposition de webinaire",
      workshopMini:"Atelier", webinarMini:"Webinaire",
      footer:"© 2026 BetInsight Club · Événements"
    }
  }[currentLang];

  const EXTRA_EVENTS = []; // Approved one-off BetInsight community webinars can be added here later.

  function berlinNowParts(){
    const out={};
    new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Berlin",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date()).forEach(p=>{if(p.type!=="literal")out[p.type]=p.value});
    return {year:+out.year,month:+out.month,day:+out.day,hour:+out.hour,minute:+out.minute};
  }

  function iso(y,m,d){ return `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`; }
  function parseIso(s){ const [y,m,d]=s.split("-").map(Number); return {y,m,d}; }
  function mondayIndex(y,m,d){ const n=new Date(Date.UTC(y,m-1,d)).getUTCDay(); return (n+6)%7; }
  function daysInMonth(y,m){ return new Date(Date.UTC(y,m,0)).getUTCDate(); }

  function recurringEvent(y,m,d){
    const weekday=new Date(Date.UTC(y,m-1,d)).getUTCDay();
    if(weekday===3) return {date:iso(y,m,d),time:"20:00",kind:"workshop",language:"de",title:T.workshopTitle,description:T.workshopDesc};
    if(weekday===4) return {date:iso(y,m,d),time:"20:00",kind:"webinar",language:"de",title:T.webinarTitle,description:T.webinarDesc,url:`/${currentLang}/webinar/`};
    return null;
  }

  function eventForDate(y,m,d){
    const base=recurringEvent(y,m,d);
    const extras=EXTRA_EVENTS.filter(e=>e.date===iso(y,m,d));
    return [base,...extras].filter(Boolean);
  }

  const now=berlinNowParts();
  let viewYear=now.year, viewMonth=now.month;

  const monthLabel=document.getElementById("monthLabel");
  const weekdaysEl=document.getElementById("calendarWeekdays");
  const grid=document.getElementById("calendarGrid");
  const upcomingEl=document.getElementById("upcomingEvents");

  function renderWeekdays(){
    weekdaysEl.innerHTML=T.weekdays.map(w=>`<div>${w}</div>`).join("");
  }

  function renderCalendar(){
    monthLabel.textContent=`${T.months[viewMonth-1]} ${viewYear}`;
    const first=mondayIndex(viewYear,viewMonth,1);
    const total=daysInMonth(viewYear,viewMonth);
    const prevMonth=viewMonth===1?12:viewMonth-1;
    const prevYear=viewMonth===1?viewYear-1:viewYear;
    const prevTotal=daysInMonth(prevYear,prevMonth);
    const cells=[];
    for(let i=0;i<42;i++){
      let y=viewYear,m=viewMonth,d=i-first+1,outside=false;
      if(d<1){outside=true;m=prevMonth;y=prevYear;d=prevTotal+d}
      else if(d>total){outside=true;m=viewMonth===12?1:viewMonth+1;y=viewMonth===12?viewYear+1:viewYear;d=d-total}
      const events=eventForDate(y,m,d);
      const isToday=y===now.year&&m===now.month&&d===now.day;
      const evHtml=events.map(e=>`<a class="mini-event ${e.kind}" href="#upcoming" title="${escapeHtml(e.title)} · 20:00"> ${e.kind==="workshop"?T.workshopMini:e.kind==="webinar"?T.webinarMini:T.external}</a>`).join("");
      cells.push(`<div class="day${outside?" outside":""}${isToday?" today":""}"><div class="day-num">${d}</div><div class="day-events">${evHtml}</div></div>`);
    }
    grid.innerHTML=cells.join("");
  }

  function getUpcoming(limit=8){
    const list=[];
    const todayUTC=new Date(Date.UTC(now.year,now.month-1,now.day));
    for(let add=0;add<60&&list.length<limit;add++){
      const dt=new Date(todayUTC.getTime()+add*86400000);
      const y=dt.getUTCFullYear(),m=dt.getUTCMonth()+1,d=dt.getUTCDate();
      const sameDay=add===0;
      const passed=sameDay && (now.hour>20 || (now.hour===20 && now.minute>15));
      if(passed) continue;
      eventForDate(y,m,d).forEach(e=>list.push(e));
    }
    return list.slice(0,limit);
  }

  function prettyDate(s){
    const {y,m,d}=parseIso(s);
    const dt=new Date(Date.UTC(y,m-1,d,12));
    return new Intl.DateTimeFormat(currentLang==="pt"?"pt-BR":currentLang,{weekday:"long",day:"2-digit",month:"2-digit",year:"numeric",timeZone:"UTC"}).format(dt);
  }

  function eventCard(e){
    const detailButton=e.kind==="webinar"&&e.url? `<a class="btn btn-primary" href="${e.url}">${T.details}</a>`:"";
    return `
      <article class="event-card ${e.kind}">
        <div class="event-top">
          <div class="event-type">${e.kind==="workshop"?T.workshop:e.kind==="webinar"?T.webinar:T.external}</div>
          <div class="flag">🇩🇪 ${T.german}</div>
        </div>
        <h3>${escapeHtml(e.title)}</h3>
        <div class="event-meta"><span>📅 ${prettyDate(e.date)}</span><span>🕗 ${T.at}</span><span>🌐 ${T.online}</span></div>
        <p>${escapeHtml(e.description||"")}</p>
        <div class="event-actions">${detailButton}<button class="btn btn-secondary" type="button" data-ics='${escapeAttr(JSON.stringify(e))}'>＋ ${T.save}</button></div>
      </article>`;
  }

  function renderUpcoming(){
    const events=getUpcoming();
    upcomingEl.innerHTML=events.length?events.map(eventCard).join(""):`<p>${T.noEvents}</p>`;
    upcomingEl.querySelectorAll("[data-ics]").forEach(btn=>btn.addEventListener("click",()=>downloadIcs(JSON.parse(btn.dataset.ics))));
  }

  function downloadIcs(e){
    const date=e.date.replaceAll("-","");
    const title=(e.title||"BetInsight Event").replace(/[,;]/g," ");
    const description=(e.description||"").replace(/\n/g," ").replace(/[,;]/g," ");
    const url=e.url?new URL(e.url,location.origin).toString():location.href;
    const uid=`betinsight-${e.kind}-${date}@betinsight.club`;
    const data=[
      "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//BetInsight Club//Events//EN","CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",`UID:${uid}`,`DTSTART;TZID=Europe/Berlin:${date}T200000`,`DTEND;TZID=Europe/Berlin:${date}T210000`,
      `SUMMARY:${title}`,`DESCRIPTION:${description}`,`URL:${url}`,"LOCATION:Online","END:VEVENT","END:VCALENDAR"
    ].join("\r\n");
    const blob=new Blob([data],{type:"text/calendar;charset=utf-8"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`betinsight-${e.kind}-${e.date}.ics`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),500);
  }

  function escapeHtml(v){return String(v||"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}
  function escapeAttr(v){return escapeHtml(v).replace(/\n/g," ");}

  document.getElementById("prevMonth")?.addEventListener("click",()=>{viewMonth--;if(viewMonth<1){viewMonth=12;viewYear--}renderCalendar()});
  document.getElementById("nextMonth")?.addEventListener("click",()=>{viewMonth++;if(viewMonth>12){viewMonth=1;viewYear++}renderCalendar()});

  const modal=document.getElementById("hostModal");
  const openModal=()=>{modal?.classList.add("open");document.body.style.overflow="hidden"};
  const closeModal=()=>{modal?.classList.remove("open");document.body.style.overflow=""};
  document.getElementById("hostOpen")?.addEventListener("click",openModal);
  document.getElementById("hostClose")?.addEventListener("click",closeModal);
  document.getElementById("hostCancel")?.addEventListener("click",closeModal);
  modal?.addEventListener("click",e=>{if(e.target===modal)closeModal()});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});

  const form=document.getElementById("hostForm");
  if(form){
    const labels={
      hostModalTitle:T.modalTitle,hostCloseText:T.close,labelName:T.name,labelEmail:T.email,labelTitle:T.title,
      labelTopic:T.topic,labelLanguage:T.language,labelDate:T.date,labelLinks:T.links,labelIntro:T.intro,
      hostSubmitText:T.submit,hostFormNote:T.note,hostCancelText:T.close
    };
    Object.entries(labels).forEach(([id,val])=>{const el=document.getElementById(id);if(el)el.textContent=val});
    form.addEventListener("submit",e=>{
      e.preventDefault();
      const fd=new FormData(form);
      const lines=[
        T.modalTitle,"",
        `${T.name}: ${fd.get("name")||""}`,
        `${T.email}: ${fd.get("email")||""}`,
        `${T.title}: ${fd.get("title")||""}`,
        `${T.topic}: ${fd.get("topic")||""}`,
        `${T.language}: ${fd.get("language")||""}`,
        `${T.date}: ${fd.get("date")||""}`,
        `${T.links}: ${fd.get("links")||""}`,"",
        `${T.intro}:\n${fd.get("intro")||""}`
      ];
      const subjectTitle=String(fd.get("title")||"").trim();\n      const subject=subjectTitle?`${T.mailSubject}: ${subjectTitle}`:T.mailSubject;\n      location.href=`mailto:betinsight.club@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
    });
  }

  const hostTitle=document.getElementById("hostTitle"); if(hostTitle)hostTitle.textContent=T.hostTitle;
  const hostLead=document.getElementById("hostLead"); if(hostLead)hostLead.textContent=T.hostLead;
  const hostBtn=document.getElementById("hostOpen"); if(hostBtn)hostBtn.textContent=T.hostBtn;
  const points=document.getElementById("hostPoints"); if(points)points.innerHTML=T.hostPoints.map(x=>`<span>${x}</span>`).join("");
  const upcomingTitle=document.getElementById("upcomingTitle"); if(upcomingTitle)upcomingTitle.textContent=T.upcoming;
  const footer=document.getElementById("eventsFooter"); if(footer)footer.textContent=T.footer;

  renderWeekdays();
  renderCalendar();
  renderUpcoming();
})();
