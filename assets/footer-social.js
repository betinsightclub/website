(() => {
  "use strict";

  const YOUTUBE_URL = "https://www.youtube.com/@betinsightclub";
  const TELEGRAM_URL = "https://t.me/+iKZj1FvUf4RmMjdh";
  const X_URL = "https://x.com/betinsightclub";
  const FACEBOOK_URL = "https://www.facebook.com/betinsightclub";
  const SUPPORTED = ["de","en","es","pt","it","fr"];
  const COPY = {
    de:{follow:"Folge uns",youtube:"BetInsight Club auf YouTube öffnen",telegram:"BetInsight Club auf Telegram öffnen",x:"BetInsight Club auf X öffnen",facebook:"BetInsight Club auf Facebook öffnen"},
    en:{follow:"Follow us",youtube:"Open BetInsight Club on YouTube",telegram:"Open BetInsight Club on Telegram",x:"Open BetInsight Club on X",facebook:"Open BetInsight Club on Facebook"},
    es:{follow:"Síguenos",youtube:"Abrir BetInsight Club en YouTube",telegram:"Abrir BetInsight Club en Telegram",x:"Abrir BetInsight Club en X",facebook:"Abrir BetInsight Club en Facebook"},
    pt:{follow:"Siga-nos",youtube:"Abrir BetInsight Club no YouTube",telegram:"Abrir BetInsight Club no Telegram",x:"Abrir BetInsight Club no X",facebook:"Abrir BetInsight Club no Facebook"},
    it:{follow:"Seguici",youtube:"Apri BetInsight Club su YouTube",telegram:"Apri BetInsight Club su Telegram",x:"Apri BetInsight Club su X",facebook:"Apri BetInsight Club su Facebook"},
    fr:{follow:"Suivez-nous",youtube:"Ouvrir BetInsight Club sur YouTube",telegram:"Ouvrir BetInsight Club sur Telegram",x:"Ouvrir BetInsight Club sur X",facebook:"Ouvrir BetInsight Club sur Facebook"}
  };

  function lang(){
    const html = String(document.documentElement.lang || "").toLowerCase().split("-")[0];
    if (SUPPORTED.includes(html)) return html;
    const first = location.pathname.split("/").filter(Boolean)[0]?.toLowerCase();
    return SUPPORTED.includes(first) ? first : "de";
  }

  function addStyles(){
    if (document.getElementById("bi-footer-social-global-style")) return;
    const style = document.createElement("style");
    style.id = "bi-footer-social-global-style";
    style.textContent = `
      .betinsight-footer-social{display:flex;align-items:center;flex-wrap:wrap;gap:9px;margin-top:18px}
      .betinsight-footer-social-label{color:#718a96;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}
      .betinsight-footer-social-link{display:grid;place-items:center;width:34px;height:34px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(255,255,255,.04);text-decoration:none;transition:transform .16s ease,border-color .16s ease,background .16s ease}
      .betinsight-footer-social-link:hover,.betinsight-footer-social-link:focus-visible{transform:translateY(-1px);border-color:rgba(73,183,255,.58);background:rgba(73,183,255,.09);outline:none}
      .betinsight-footer-social-icon{display:block;width:20px;height:20px}
      .betinsight-footer-social-link[data-social="x"]{color:#fff;font:900 17px/1 Arial,Helvetica,sans-serif}
      footer .betinsight-footer-social,.footer .betinsight-footer-social{max-width:100%}
      @media(max-width:720px){.betinsight-footer-social{justify-content:center}}
      @media(prefers-reduced-motion:reduce){.betinsight-footer-social-link{transition:none}}
    `;
    document.head.appendChild(style);
  }

  function link(kind, href, label, title, icon){
    const a = document.createElement("a");
    a.className = "betinsight-footer-social-link";
    a.dataset.social = kind;
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.setAttribute("aria-label", label);
    a.title = title;
    if (icon) a.innerHTML = icon;
    else a.textContent = "X";
    return a;
  }

  function ensureLinks(wrapper){
    const c = COPY[lang()] || COPY.de;

    if (!wrapper.querySelector(".betinsight-footer-social-label")) {
      const label = document.createElement("span");
      label.className = "betinsight-footer-social-label";
      label.textContent = c.follow;
      wrapper.prepend(label);
    }

    if (!wrapper.querySelector('[data-social="youtube"]') && !wrapper.querySelector('a[href*="youtube.com"]')) {
      wrapper.appendChild(link(
        "youtube", YOUTUBE_URL, c.youtube, "BetInsight Club · YouTube",
        '<svg class="betinsight-footer-social-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5.2" width="20" height="13.6" rx="4.2" fill="#ff0033"/><path d="M10 8.7 16 12l-6 3.3Z" fill="#fff"/></svg>'
      ));
    }

    if (!wrapper.querySelector('[data-social="telegram"]') && !wrapper.querySelector('a[href*="t.me/"]')) {
      wrapper.appendChild(link(
        "telegram", TELEGRAM_URL, c.telegram, "BetInsight Club · Telegram",
        '<svg class="betinsight-footer-social-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#229ED9"/><path d="M17.8 7.2 15 17.3c-.2.7-.8.9-1.4.5l-4.2-3.1-2 1.9c-.2.2-.4.4-.8.4l.3-4.3 7.8-7c.3-.3-.1-.5-.5-.2l-9.6 6-4.1-1.3c-.9-.3-.9-.9.2-1.3l16-6.2c.8-.3 1.5.2 1.1 1.5Z" fill="#fff" transform="translate(2 2) scale(.83)"/></svg>'
      ));
    }

    if (!wrapper.querySelector('[data-social="x"]') && !wrapper.querySelector('a[href*="x.com/betinsightclub"]')) {
      wrapper.appendChild(link("x", X_URL, c.x, "BetInsight Club · X", ""));
    }

    if (!wrapper.querySelector('[data-social="facebook"]') && !wrapper.querySelector('a[href*="facebook.com/betinsightclub"]')) {
      wrapper.appendChild(link(
        "facebook", FACEBOOK_URL, c.facebook, "BetInsight Club · Facebook",
        '<svg class="betinsight-footer-social-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#1877F2"/><path d="M13.4 20v-7h2.35l.35-2.73h-2.7V8.53c0-.79.22-1.33 1.35-1.33h1.44V4.76c-.25-.03-1.1-.11-2.1-.11-2.08 0-3.5 1.27-3.5 3.61v2.01H8.24V13h2.35v7h2.81Z" fill="#fff"/></svg>'
      ));
    }
  }

  function target(){
    return document.querySelector(".site-footer .footer-grid > div:first-child")
      || document.querySelector("footer .footer-row")
      || document.querySelector("footer .wrap")
      || document.querySelector("footer")
      || document.querySelector(".footer");
  }

  function init(){
    addStyles();
    let wrapper = document.querySelector("[data-betinsight-footer-social]");
    if (!wrapper) {
      const host = target();
      if (!host) return;
      wrapper = document.createElement("div");
      wrapper.className = "betinsight-footer-social";
      wrapper.dataset.betinsightFooterSocial = "";
      host.appendChild(wrapper);
    }
    ensureLinks(wrapper);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
})();