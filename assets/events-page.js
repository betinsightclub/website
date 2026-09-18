
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
      workshop:"Workshop", webinar:"Live-Webinar", external:"Gast-Webinar",
      german:"Deutsch", online:"Online", at:"20:00 Uhr · Deutschland",
      workshopTitle:"BetInsight Workshop", webinarTitle:"BetInsight Live-Webinar",
      workshopDesc:"Praxis, Fragen und gemeinsamer Austausch rund um BetInsight. Die konkreten Inhalte können von Woche zu Woche wechseln.",
      webinarDesc:"BetInsight live kennenlernen: Konzept, Plattform und Anwendung. Fragen sind im Anschluss möglich.",
      details:"Zum Webinar", save:"Termin speichern", upcoming:"Nächste Termine",
      noEvents:"Aktuell sind keine weiteren Termine eingetragen.",
      hostTitle:"Du möchtest dein Webinar hinzufügen?",
      hostLead:"Stell dich und dein Thema kurz vor. Wir prüfen jede Einreichung vor einer Veröffentlichung im BetInsight-Eventkalender.",
      hostBtn:"Webinar vorschlagen",
      hostPoints:["Eigene Webinare oder Workshops vorstellen","Thema, Sprache und Wunschdatum angeben","Veröffentlichung erst nach Prüfung durch BetInsight"],
      modalTitle:"Webinar / Workshop vorstellen", close:"Schließen",
      name:"Name", email:"E-Mail", title:"Titel des Webinars", topic:"Thema / Kurzbeschreibung",
      language:"Sprache des Webinars", date:"Wunschdatum", links:"Website / Social / Referenzlink (optional)",
      intro:"Stell dich kurz vor", submit:"Bewerbung per E-Mail vorbereiten",
      note:"Beim Absenden öffnet sich dein E-Mail-Programm mit den eingegebenen Angaben. Die Nachricht wird nicht automatisch versendet.",
      mailSubject:"Webinar-Vorschlag für den BetInsight Eventkalender",
      workshopMini:"Workshop", webinarMini:"Webinar",
      footer:"© 2026 BetInsight Club · Events"
    },
    en:{
      months:["January","February","March","April","May","June","July","August","September","October","November","December"],
      weekdays:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
      workshop:"Workshop", webinar:"Live webinar", external:"Guest webinar",
      german:"German", online:"Online", at:"20:00 · Germany time",
      workshopTitle:"BetInsight Workshop", webinarTitle:"BetInsight Live Webinar",
      workshopDesc:"Practical topics, questions and community exchange around BetInsight. The exact focus may change from week to week.",
      webinarDesc:"Discover BetInsight live: concept, platform and practical use. Questions are welcome afterwards.",
      details:"Open webinar", save:"Save event", upcoming:"Upcoming events",
      noEvents:"No further events are currently listed.",
      hostTitle:"Would you like to add your webinar?",
      hostLead:"Introduce yourself and your topic briefly. Every submission is reviewed before it is published in the BetInsight event calendar.",
      hostBtn:"Suggest a webinar",
      hostPoints:["Present your own webinar or workshop","Provide topic, language and preferred date","Publication only after review by BetInsight"],
      modalTitle:"Introduce your webinar / workshop", close:"Close",
      name:"Name", email:"Email", title:"Webinar title", topic:"Topic / short description",
      language:"Webinar language", date:"Preferred date", links:"Website / social / reference link (optional)",
      intro:"Briefly introduce yourself", submit:"Prepare email application",
      note:"Submitting opens your email app with the details you entered. The message is not sent automatically.",
      mailSubject:"Webinar proposal for the BetInsight event calendar",
      workshopMini:"Workshop", webinarMini:"Webinar",
      footer:"© 2026 BetInsight Club · Events"
    },
    es:{
      months:["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],
      weekdays:["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"],
      workshop:"Taller", webinar:"Webinar en directo", external:"Webinar invitado",
      german:"Alemán", online:"Online", at:"20:00 · hora de Alemania",
      workshopTitle:"Taller BetInsight", webinarTitle:"Webinar en directo de BetInsight",
      workshopDesc:"Práctica, preguntas e intercambio sobre BetInsight. El contenido concreto puede variar cada semana.",
      webinarDesc:"Conoce BetInsight en directo: concepto, plataforma y uso práctico. Habrá espacio para preguntas al final.",
      details:"Ir al webinar", save:"Guardar evento", upcoming:"Próximos eventos",
      noEvents:"Actualmente no hay más eventos publicados.",
      hostTitle:"¿Quieres añadir tu webinar?",
      hostLead:"Preséntate brevemente y cuéntanos tu tema. Revisamos cada propuesta antes de publicarla en el calendario de BetInsight.",
      hostBtn:"Proponer webinar",
      hostPoints:["Presenta tu propio webinar o taller","Indica tema, idioma y fecha preferida","Publicación solo tras revisión de BetInsight"],
      modalTitle:"Presenta tu webinar / taller", close:"Cerrar",
      name:"Nombre", email:"Correo electrónico", title:"Título del webinar", topic:"Tema / breve descripción",
      language:"Idioma del webinar", date:"Fecha preferida", links:"Web / redes / enlace de referencia (opcional)",
      intro:"Preséntate brevemente", submit:"Preparar solicitud por correo",
      note:"Al enviar se abrirá tu aplicación de correo con los datos introducidos. El mensaje no se envía automáticamente.",
      mailSubject:"Propuesta de webinar para el calendario de BetInsight",
      workshopMini:"Taller", webinarMini:"Webinar",
      footer:"© 2026 BetInsight Club · Eventos"
    },
    pt:{
      months:["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
      weekdays:["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"],
      workshop:"Workshop", webinar:"Webinar ao vivo", external:"Webinar convidado",
      german:"Alemão", online:"Online", at:"20:00 · horário da Alemanha",
      workshopTitle:"Workshop BetInsight", webinarTitle:"Webinar ao vivo BetInsight",
      workshopDesc:"Prática, perguntas e troca de experiências sobre o BetInsight. O tema específico pode mudar a cada semana.",
      webinarDesc:"Conheça o BetInsight ao vivo: conceito, plataforma e uso prático. Perguntas podem ser feitas ao final.",
      details:"Abrir webinar", save:"Salvar evento", upcoming:"Próximos eventos",
      noEvents:"No momento não há outros eventos publicados.",
      hostTitle:"Quer adicionar seu webinar?",
      hostLead:"Apresente-se brevemente e conte qual é o seu tema. Cada envio é analisado antes de ser publicado no calendário da BetInsight.",
      hostBtn:"Sugerir webinar",
      hostPoints:["Apresente seu próprio webinar ou workshop","Informe tema, idioma e data desejada","Publicação somente após análise da BetInsight"],
      modalTitle:"Apresente seu webinar / workshop", close:"Fechar",
      name:"Nome", email:"E-mail", title:"Título do webinar", topic:"Tema / breve descrição",
      language:"Idioma do webinar", date:"Data desejada", links:"Site / redes sociais / referência (opcional)",
      intro:"Apresente-se brevemente", submit:"Preparar candidatura por e-mail",
      note:"Ao enviar, seu aplicativo de e-mail será aberto com os dados preenchidos. A mensagem não é enviada automaticamente.",
      mailSubject:"Proposta de webinar para o calendário de eventos BetInsight",
      workshopMini:"Workshop", webinarMini:"Webinar",
      footer:"© 2026 BetInsight Club · Eventos"
    },
    it:{
      months:["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"],
      weekdays:["Lun","Mar","Mer","Gio","Ven","Sab","Dom"],
      workshop:"Workshop", webinar:"Webinar live", external:"Webinar ospite",
      german:"Tedesco", online:"Online", at:"20:00 · ora tedesca",
      workshopTitle:"Workshop BetInsight", webinarTitle:"Webinar live BetInsight",
      workshopDesc:"Pratica, domande e confronto sulla piattaforma BetInsight. Il tema specifico può cambiare di settimana in settimana.",
      webinarDesc:"Scopri BetInsight dal vivo: concetto, piattaforma e utilizzo pratico. Alla fine ci sarà spazio per le domande.",
      details:"Apri webinar", save:"Salva evento", upcoming:"Prossimi eventi",
      noEvents:"Al momento non sono pubblicati altri eventi.",
      hostTitle:"Vuoi aggiungere il tuo webinar?",
      hostLead:"Presentati brevemente e raccontaci il tuo tema. Ogni proposta viene verificata prima della pubblicazione nel calendario BetInsight.",
      hostBtn:"Proponi un webinar",
      hostPoints:["Presenta il tuo webinar o workshop","Indica tema, lingua e data preferita","Pubblicazione solo dopo la verifica di BetInsight"],
      modalTitle:"Presenta il tuo webinar / workshop", close:"Chiudi",
      name:"Nome", email:"E-mail", title:"Titolo del webinar", topic:"Tema / breve descrizione",
      language:"Lingua del webinar", date:"Data preferita", links:"Sito / social / link di riferimento (opzionale)",
      intro:"Presentati brevemente", submit:"Prepara la candidatura via e-mail",
      note:"Con l'invio si aprirà il tuo programma e-mail con i dati inseriti. Il messaggio non viene inviato automaticamente.",
      mailSubject:"Proposta webinar per il calendario eventi BetInsight",
      workshopMini:"Workshop", webinarMini:"Webinar",
      footer:"© 2026 BetInsight Club · Eventi"
    },
    fr:{
      months:["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],
      weekdays:["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"],
      workshop:"Atelier", webinar:"Webinaire en direct", external:"Webinaire invité",
      german:"Allemand", online:"En ligne", at:"20:00 · heure allemande",
      workshopTitle:"Atelier BetInsight", webinarTitle:"Webinaire en direct BetInsight",
      workshopDesc:"Pratique, questions et échanges autour de BetInsight. Le thème précis peut varier d'une semaine à l'autre.",
      webinarDesc:"Découvrez BetInsight en direct : concept, plateforme et utilisation pratique. Une session de questions est prévue à la fin.",
      details:"Ouvrir le webinaire", save:"Ajouter au calendrier", upcoming:"Prochains événements",
      noEvents:"Aucun autre événement n'est actuellement publié.",
      hostTitle:"Vous souhaitez ajouter votre webinaire ?",
      hostLead:"Présentez-vous brièvement et décrivez votre sujet. Chaque proposition est examinée avant publication dans le calendrier BetInsight.",
      hostBtn:"Proposer un webinaire",
      hostPoints:["Présenter votre propre webinaire ou atelier","Indiquer le sujet, la langue et la date souhaitée","Publication uniquement après validation par BetInsight"],
      modalTitle:"Présentez votre webinaire / atelier", close:"Fermer",
      name:"Nom", email:"E-mail", title:"Titre du webinaire", topic:"Sujet / brève description",
      language:"Langue du webinaire", date:"Date souhaitée", links:"Site / réseaux / lien de référence (facultatif)",
      intro:"Présentez-vous brièvement", submit:"Préparer la candidature par e-mail",
      note:"L'envoi ouvre votre application e-mail avec les informations saisies. Le message n'est pas envoyé automatiquement.",
      mailSubject:"Proposition de webinaire pour le calendrier BetInsight",
      workshopMini:"Atelier", webinarMini:"Webinaire",
      footer:"© 2026 BetInsight Club · Événements"
    }
  }[currentLang];

  const EXTRA_EVENTS = []; // Approved one-off guest events can be added here later.

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
      location.href=`mailto:betinsight.club@gmail.com?subject=${encodeURIComponent(T.mailSubject)}&body=${encodeURIComponent(lines.join("\n"))}`;
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
