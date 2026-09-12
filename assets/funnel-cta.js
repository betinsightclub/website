/* BetInsight public funnel CTA · multilingual · 2026-09-12
   Adds localized Webinar / Founder-Call options before the final registration CTA.
   Public referral codes are preserved. No protected dashboard token is handled here.
*/
(() => {
  "use strict";

  const REF_STORAGE_KEY = "betinsight_ref_code";
  const DEFAULT_REF_CODE = "POOL";
  const SUPPORTED = ["de","en","es","pt","it","fr"];
  const COPY = {
    de:{section:"BetInsight persönlich kennenlernen",title:"Du möchtest BetInsight erst sehen oder deine Fragen persönlich klären?",intro:"Wähle den Weg, der zu dir passt. Danach kannst du dich jederzeit kostenlos registrieren.",wk:"🔴 Live oder flexibel ansehen",wt:"Live-Webinar & Aufzeichnung",wd:"Lerne BetInsight im Live-Webinar kennen oder sieh dir die Aufzeichnung an, sobald sie verfügbar ist.",wp:["Live jeden Donnerstag um 20:00 Uhr (Europe/Berlin)","Fragen nach dem Live-Webinar direkt an den Founder","Aufzeichnung nach kurzer kostenloser Anmeldung"],wb:"Zum Webinar & zur Aufzeichnung",fk:"👤 Persönlicher Austausch",ft:"Persönliches Gespräch mit dem Founder",fd:"Wenn du offene Fragen direkt klären möchtest, kannst du einen der begrenzten persönlichen Gesprächstermine buchen.",fp:["50 Minuten persönlicher Video-Call","Fragen zu BetInsight und deinen nächsten Schritten","Nur ausgewählte freie Termine"],fb:"Persönlichen Termin ansehen",footerW:"Live-Webinar & Aufzeichnung",footerF:"Founder-Call"},
    en:{section:"Get to know BetInsight personally",title:"Would you like to see BetInsight first or discuss your questions personally?",intro:"Choose the option that suits you. You can still register for free at any time afterwards.",wk:"🔴 Watch live or on demand",wt:"Live webinar & replay",wd:"Get to know BetInsight in the live webinar or watch the replay as soon as it is available.",wp:["Live every Thursday at 20:00 (Europe/Berlin)","Ask the Founder questions after the live webinar","Replay after a short free registration"],wb:"Go to webinar & replay",fk:"👤 Personal conversation",ft:"Personal call with the Founder",fd:"If you want to clarify open questions directly, you can book one of the limited personal call slots.",fp:["50-minute personal video call","Questions about BetInsight and your next steps","Only selected available appointments"],fb:"View personal appointment",footerW:"Live webinar & replay",footerF:"Founder call"},
    es:{section:"Conoce BetInsight personalmente",title:"¿Quieres ver BetInsight primero o resolver tus preguntas personalmente?",intro:"Elige la opción que mejor se adapte a ti. Después puedes registrarte gratis en cualquier momento.",wk:"🔴 En directo o cuando quieras",wt:"Webinar en directo y grabación",wd:"Conoce BetInsight en el webinar en directo o mira la grabación cuando esté disponible.",wp:["En directo cada jueves a las 20:00 (Europe/Berlin)","Preguntas al Founder después del webinar","Grabación tras un breve registro gratuito"],wb:"Ir al webinar y la grabación",fk:"👤 Conversación personal",ft:"Conversación personal con el Founder",fd:"Si quieres resolver preguntas directamente, puedes reservar uno de los horarios personales limitados.",fp:["Videollamada personal de 50 minutos","Preguntas sobre BetInsight y tus próximos pasos","Solo horarios seleccionados disponibles"],fb:"Ver cita personal",footerW:"Webinar y grabación",footerF:"Llamada con el Founder"},
    pt:{section:"Conheça a BetInsight pessoalmente",title:"Quer conhecer a BetInsight primeiro ou tirar suas dúvidas pessoalmente?",intro:"Escolha a opção que combina com você. Depois, você pode criar sua conta gratuita a qualquer momento.",wk:"🔴 Ao vivo ou quando quiser",wt:"Webinar ao vivo e gravação",wd:"Conheça a BetInsight no webinar ao vivo ou assista à gravação assim que estiver disponível.",wp:["Ao vivo toda quinta-feira às 20:00 (Europe/Berlin)","Perguntas ao Founder após o webinar ao vivo","Gravação após um breve cadastro gratuito"],wb:"Ir para o webinar e a gravação",fk:"👤 Conversa pessoal",ft:"Conversa pessoal com o Founder",fd:"Se quiser esclarecer dúvidas diretamente, você pode agendar um dos horários pessoais limitados.",fp:["Videochamada pessoal de 50 minutos","Perguntas sobre a BetInsight e seus próximos passos","Apenas horários selecionados disponíveis"],fb:"Ver horário pessoal",footerW:"Webinar ao vivo e gravação",footerF:"Founder Call"},
    it:{section:"Conosci BetInsight personalmente",title:"Vuoi prima vedere BetInsight o chiarire le tue domande personalmente?",intro:"Scegli l'opzione più adatta a te. In seguito potrai registrarti gratuitamente in qualsiasi momento.",wk:"🔴 Live o quando vuoi",wt:"Webinar live e registrazione",wd:"Conosci BetInsight nel webinar live oppure guarda la registrazione non appena è disponibile.",wp:["Live ogni giovedì alle 20:00 (Europe/Berlin)","Domande al Founder dopo il webinar live","Registrazione disponibile dopo una breve iscrizione gratuita"],wb:"Vai al webinar e alla registrazione",fk:"👤 Conversazione personale",ft:"Conversazione personale con il Founder",fd:"Se vuoi chiarire direttamente le tue domande, puoi prenotare uno dei limitati appuntamenti personali disponibili.",fp:["Videochiamata personale di 50 minuti","Domande su BetInsight e sui tuoi prossimi passi","Solo appuntamenti selezionati disponibili"],fb:"Vedi appuntamento personale",footerW:"Webinar live e registrazione",footerF:"Founder Call"},
    fr:{section:"Découvrir BetInsight personnellement",title:"Vous souhaitez d'abord découvrir BetInsight ou poser vos questions personnellement ?",intro:"Choisissez l'option qui vous convient. Vous pourrez ensuite vous inscrire gratuitement à tout moment.",wk:"🔴 En direct ou à votre rythme",wt:"Webinaire en direct et replay",wd:"Découvrez BetInsight lors du webinaire en direct ou regardez le replay dès qu'il est disponible.",wp:["En direct chaque jeudi à 20:00 (Europe/Berlin)","Questions au Founder après le webinaire","Replay après une courte inscription gratuite"],wb:"Accéder au webinaire et au replay",fk:"👤 Échange personnel",ft:"Entretien personnel avec le Founder",fd:"Si vous souhaitez clarifier vos questions directement, vous pouvez réserver l'un des créneaux personnels limités.",fp:["Appel vidéo personnel de 50 minutes","Questions sur BetInsight et vos prochaines étapes","Uniquement certains créneaux disponibles"],fb:"Voir les rendez-vous",footerW:"Webinaire et replay",footerF:"Appel Founder"}
  };

  function language() {
    const first = location.pathname.split("/").filter(Boolean)[0]?.toLowerCase();
    return SUPPORTED.includes(first) ? first : "";
  }

  function isLanguageLanding(lang) {
    if (!lang) return false;
    const path = location.pathname.replace(/\/+$/, "/");
    return path === `/${lang}/` || path === `/${lang}/index.html/` || path === `/${lang}/index.html`;
  }

  function cleanRef(value) {
    const ref = String(value || "").trim();
    return /^[A-Za-z0-9_-]{2,50}$/.test(ref) ? ref : "";
  }

  function cookieRef() {
    const prefix = REF_STORAGE_KEY + "=";
    const row = document.cookie.split("; ").find(item => item.startsWith(prefix));
    if (!row) return "";
    try { return cleanRef(decodeURIComponent(row.substring(prefix.length))); }
    catch (_) { return ""; }
  }

  function activeRef() {
    const params = new URLSearchParams(location.search);
    const fromUrl = cleanRef(params.get("ref") || params.get("ref_code"));
    if (fromUrl) return fromUrl;
    try {
      const stored = cleanRef(localStorage.getItem(REF_STORAGE_KEY));
      if (stored) return stored;
    } catch (_) {}
    return cookieRef() || DEFAULT_REF_CODE;
  }

  function withRef(base, refCode) {
    const url = new URL(base, location.origin);
    if (refCode && refCode !== DEFAULT_REF_CODE) url.searchParams.set("ref", refCode);
    else { url.searchParams.delete("ref"); url.searchParams.delete("ref_code"); }
    return url.toString();
  }

  function addStyles() {
    if (document.getElementById("bi-funnel-cta-style")) return;
    const style = document.createElement("style");
    style.id = "bi-funnel-cta-style";
    style.textContent = `
      .bi-funnel-choice{background:linear-gradient(180deg,#031720,#041a25)}
      .bi-funnel-choice .section-head{margin-bottom:28px;text-align:center}
      .bi-funnel-choice .section-head h2{max-width:820px;margin-inline:auto}
      .bi-funnel-choice .section-head p{max-width:760px;margin-inline:auto}
      .bi-funnel-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
      .bi-funnel-card{position:relative;overflow:hidden;display:flex;flex-direction:column;min-height:300px;padding:28px;border:1px solid rgba(126,211,255,.18);border-radius:24px;background:linear-gradient(155deg,rgba(10,43,59,.96),rgba(5,28,39,.98));box-shadow:var(--shadow)}
      .bi-funnel-card.webinar{border-color:rgba(255,95,101,.28);background:radial-gradient(circle at 92% 8%,rgba(255,95,101,.12),transparent 15rem),linear-gradient(155deg,rgba(10,43,59,.96),rgba(5,28,39,.98))}
      .bi-funnel-card.founder{border-color:rgba(0,217,155,.27);background:radial-gradient(circle at 92% 8%,rgba(0,217,155,.11),transparent 15rem),linear-gradient(155deg,rgba(10,43,59,.96),rgba(5,28,39,.98))}
      .bi-funnel-kicker{display:inline-flex;width:max-content;margin-bottom:17px;padding:7px 10px;border:1px solid rgba(255,255,255,.12);border-radius:999px;color:#dcebf3;background:rgba(255,255,255,.04);font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
      .bi-funnel-card h3{margin:0 0 11px;font-size:clamp(25px,3vw,34px);line-height:1.16;letter-spacing:-.025em}
      .bi-funnel-card p{margin:0 0 18px;color:var(--muted);font-size:16px;line-height:1.65}
      .bi-funnel-points{display:grid;gap:8px;margin:0 0 22px;padding:0;list-style:none;color:#d8e8ef;font-size:14px}
      .bi-funnel-points li{position:relative;padding-left:22px}.bi-funnel-points li:before{content:"✓";position:absolute;left:0;color:var(--green);font-weight:900}
      .bi-funnel-card .btn{margin-top:auto;width:100%}.bi-funnel-card.webinar .btn{background:linear-gradient(135deg,#ff6b70,#dc3f4d);box-shadow:0 12px 28px rgba(255,95,101,.18)}.bi-funnel-card.founder .btn{background:linear-gradient(135deg,#00b986,#008e69);box-shadow:0 12px 28px rgba(0,217,155,.15)}
      @media(max-width:780px){.bi-funnel-grid{grid-template-columns:1fr}.bi-funnel-card{min-height:0;padding:23px}}
    `;
    document.head.appendChild(style);
  }

  function buildSection(lang, refCode) {
    if (document.querySelector("[data-bi-funnel-choice]")) return;
    const finalCta = document.querySelector(".final-cta");
    if (!finalCta) return;
    const c = COPY[lang];
    const webinarUrl = `https://betinsight.club/${lang}/webinar/`;
    const founderUrl = `https://betinsight.club/${lang}/termin/`;
    const section = document.createElement("section");
    section.className = "bi-funnel-choice";
    section.dataset.biFunnelChoice = "1";
    section.setAttribute("aria-labelledby", "bi-funnel-choice-title");
    section.innerHTML = `
      <div class="container"><div class="section-head"><div class="section-label">${c.section}</div><h2 id="bi-funnel-choice-title">${c.title}</h2><p>${c.intro}</p></div>
      <div class="bi-funnel-grid">
        <article class="bi-funnel-card webinar"><span class="bi-funnel-kicker">${c.wk}</span><h3>${c.wt}</h3><p>${c.wd}</p><ul class="bi-funnel-points">${c.wp.map(x=>`<li>${x}</li>`).join("")}</ul><a class="btn" href="${withRef(webinarUrl, refCode)}">${c.wb}</a></article>
        <article class="bi-funnel-card founder"><span class="bi-funnel-kicker">${c.fk}</span><h3>${c.ft}</h3><p>${c.fd}</p><ul class="bi-funnel-points">${c.fp.map(x=>`<li>${x}</li>`).join("")}</ul><a class="btn" href="${withRef(founderUrl, refCode)}">${c.fb}</a></article>
      </div></div>`;
    finalCta.insertAdjacentElement("beforebegin", section);
  }

  function buildFooterLinks(lang, refCode) {
    const footerLinks = document.querySelector(".site-footer .footer-grid > div:nth-child(2) .footer-links");
    if (!footerLinks || footerLinks.querySelector("[data-bi-funnel-footer-link]")) return;
    const c = COPY[lang];
    const webinar = document.createElement("a");
    webinar.href = withRef(`https://betinsight.club/${lang}/webinar/`, refCode);
    webinar.textContent = c.footerW;
    webinar.dataset.biFunnelFooterLink = "webinar";
    const founder = document.createElement("a");
    founder.href = withRef(`https://betinsight.club/${lang}/termin/`, refCode);
    founder.textContent = c.footerF;
    founder.dataset.biFunnelFooterLink = "founder";
    const registration = footerLinks.querySelector("[data-registration-link]");
    if (registration) { footerLinks.insertBefore(webinar, registration); footerLinks.insertBefore(founder, registration); }
    else footerLinks.append(webinar, founder);
  }

  function init() {
    const lang = language();
    if (!isLanguageLanding(lang)) return;
    const refCode = activeRef();
    addStyles();
    buildSection(lang, refCode);
    buildFooterLinks(lang, refCode);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
