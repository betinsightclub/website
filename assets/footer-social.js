(() => {
  "use strict";

  const YOUTUBE_URL = "https://www.youtube.com/@betinsightclub";
  const TELEGRAM_URL = "https://t.me/+iKZj1FvUf4RmMjdh";
  const X_URL = "https://x.com/betinsightclub";
  const FACEBOOK_URL = "https://www.facebook.com/betinsightclub";
  const BLUESKY_URL = "https://bsky.app/profile/betinsight.bsky.social";
  const MINDS_URL = "https://www.minds.com/betinsightclub/";
  const COMPANY_NAME = "LucMedia LTDA";
  const COMPANY_CNPJ = "69.449.797/0001-05";
  const SUPPORTED = ["de","en","es","pt","it","fr","nl","zh-tw"];
  const COPY = {
    de:{follow:"Folge uns",youtube:"BetInsight Club auf YouTube öffnen",telegram:"BetInsight Club auf Telegram öffnen",x:"BetInsight Club auf X öffnen",facebook:"BetInsight Club auf Facebook öffnen",bluesky:"BetInsight Club auf Bluesky öffnen",minds:"BetInsight Club auf Minds öffnen"},
    en:{follow:"Follow us",youtube:"Open BetInsight Club on YouTube",telegram:"Open BetInsight Club on Telegram",x:"Open BetInsight Club on X",facebook:"Open BetInsight Club on Facebook",bluesky:"Open BetInsight Club on Bluesky",minds:"Open BetInsight Club on Minds"},
    es:{follow:"Síguenos",youtube:"Abrir BetInsight Club en YouTube",telegram:"Abrir BetInsight Club en Telegram",x:"Abrir BetInsight Club en X",facebook:"Abrir BetInsight Club en Facebook",bluesky:"Abrir BetInsight Club en Bluesky",minds:"Abrir BetInsight Club en Minds"},
    pt:{follow:"Siga-nos",youtube:"Abrir BetInsight Club no YouTube",telegram:"Abrir BetInsight Club no Telegram",x:"Abrir BetInsight Club no X",facebook:"Abrir BetInsight Club no Facebook",bluesky:"Abrir BetInsight Club no Bluesky",minds:"Abrir BetInsight Club no Minds"},
    it:{follow:"Seguici",youtube:"Apri BetInsight Club su YouTube",telegram:"Apri BetInsight Club su Telegram",x:"Apri BetInsight Club su X",facebook:"Apri BetInsight Club su Facebook",bluesky:"Apri BetInsight Club su Bluesky",minds:"Apri BetInsight Club su Minds"},
    fr:{follow:"Suivez-nous",youtube:"Ouvrir BetInsight Club sur YouTube",telegram:"Ouvrir BetInsight Club sur Telegram",x:"Ouvrir BetInsight Club sur X",facebook:"Ouvrir BetInsight Club sur Facebook",bluesky:"Ouvrir BetInsight Club sur Bluesky",minds:"Ouvrir BetInsight Club sur Minds"},
    nl:{follow:"Volg ons",youtube:"BetInsight Club op YouTube openen",telegram:"BetInsight Club op Telegram openen",x:"BetInsight Club op X openen",facebook:"BetInsight Club op Facebook openen",bluesky:"BetInsight Club op Bluesky openen",minds:"BetInsight Club op Minds openen"},
    "zh-tw":{follow:"追蹤我們",youtube:"在 YouTube 開啟 BetInsight Club",telegram:"在 Telegram 開啟 BetInsight Club",x:"在 X 開啟 BetInsight Club",facebook:"在 Facebook 開啟 BetInsight Club",bluesky:"在 Bluesky 開啟 BetInsight Club",minds:"在 Minds 開啟 BetInsight Club"}
  };

  function lang(){
    const raw = String(document.documentElement.lang || "").toLowerCase();
    if (raw === "zh-tw" || raw.startsWith("zh-tw")) return "zh-tw";
    const html = raw.split("-")[0];
    if (SUPPORTED.includes(html)) return html;
    const first = location.pathname.split("/").filter(Boolean)[0]?.toLowerCase();
    if (first === "zh-tw") return "zh-tw";
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
      .betinsight-footer-company{margin-top:14px;color:#718a96;font-size:11px;line-height:1.6}
      .betinsight-footer-company a{color:inherit;text-decoration:underline;text-underline-offset:2px}
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

    if (!wrapper.querySelector('[data-social="bluesky"]') && !wrapper.querySelector('a[href*="bsky.app/profile/betinsight.bsky.social"]')) {
      wrapper.appendChild(link(
        "bluesky", BLUESKY_URL, c.bluesky, "BetInsight Club · Bluesky",
        '<svg class="betinsight-footer-social-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#1686ff"/><path d="M7.1 6.8c1.9 1.4 3.9 4.2 4.9 6.1 1-1.9 3-4.7 4.9-6.1 1.4-1 3.7-1.8 3.7.7 0 .5-.3 4.3-.5 4.9-.7 2.2-3.1 2.7-5.3 2.3 3.8.6 4.8 2.5 2.7 4.4-4 3.7-5.7-.9-6.2-2.1-.1-.2-.1-.3-.2-.4 0 .1-.1.2-.2.4-.5 1.2-2.2 5.8-6.2 2.1-2.1-1.9-1.1-3.8 2.7-4.4-2.2.4-4.6-.1-5.3-2.3-.2-.6-.5-4.4-.5-4.9 0-2.5 2.3-1.7 3.7-.7Z" fill="#fff" transform="scale(.88) translate(1.65 1.65)"/></svg>'
      ));
    }

    if (!wrapper.querySelector('[data-social="minds"]') && !wrapper.querySelector('a[href*="minds.com/betinsightclub"]')) {
      wrapper.appendChild(link(
        "minds", MINDS_URL, c.minds, "BetInsight Club · Minds",
        '<svg class="betinsight-footer-social-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#ffd21f"/><path d="M5.5 17.5v-11h2.7l3.8 4.7 3.8-4.7h2.7v11h-2.8v-6.6L12 15.3l-3.7-4.4v6.6Z" fill="#171717"/></svg>'
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

  function ensureCompanyIdentity(){
    const hosts = document.querySelectorAll("footer, .footer, .imprint");
    hosts.forEach((host) => {
      const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach((node) => {
        node.nodeValue = node.nodeValue
          .replaceAll("LucMedia LTDA – em fase de constituição", COMPANY_NAME + " · CNPJ " + COMPANY_CNPJ)
          .replaceAll("LucMedia LTDA - em fase de constituição", COMPANY_NAME + " · CNPJ " + COMPANY_CNPJ)
          .replaceAll("BetInsight Ltd.", COMPANY_NAME);
      });
    });

    const host = document.querySelector("footer") || document.querySelector(".footer");
    if (!host || host.textContent.includes(COMPANY_CNPJ)) return;

    const l = lang();
    const routes = {de:"/de/impressum/",en:"/en/legal-notice/",es:"/es/legal-notice/",pt:"/pt/legal-notice/",it:"/it/legal-notice/",fr:"/fr/legal-notice/"};
    const labels = {
      de:"BetInsight ist ein digitales Produkt der LucMedia LTDA",
      en:"BetInsight is a digital product of LucMedia LTDA",
      es:"BetInsight es un producto digital de LucMedia LTDA",
      pt:"BetInsight é um produto digital da LucMedia LTDA",
      it:"BetInsight è un prodotto digitale di LucMedia LTDA",
      fr:"BetInsight est un produit numérique de LucMedia LTDA"
    };
    const line = document.createElement("div");
    line.className = "betinsight-footer-company";
    const legal = routes[l] || "/en/legal-notice/";
    line.innerHTML = (labels[l] || labels.en) + " · CNPJ " + COMPANY_CNPJ + ' · <a href="' + legal + '">Legal</a>';
    host.appendChild(line);
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
    ensureCompanyIdentity();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
})();