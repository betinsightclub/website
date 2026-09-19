(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || new URL("assets/language-switch.js", location.href).toString();
  const ASSET_BASE = new URL("./", SCRIPT_URL);
  const LANGUAGE_KEY = "betinsight_language";
  const REF_STORAGE_KEY = "betinsight_ref_code";
  const DEFAULT_REF_CODE = "POOL";
  const YOUTUBE_URL = "https://www.youtube.com/@betinsightclub";
  const TELEGRAM_URL = "https://t.me/+iKZj1FvUf4RmMjdh";
  const SUPPORTED = ["de", "en", "es", "pt", "it", "fr"];
  const LANGUAGE_FLAG = { de:"🇩🇪", en:"🇬🇧", es:"🇪🇸", pt:"🇧🇷", it:"🇮🇹", fr:"🇫🇷" };
  const LANGUAGE_COPY = {
    de:{name:"Deutsch",language:"Sprache wählen",follow:"Folge uns",youtube:"BetInsight Club auf YouTube öffnen",telegram:"BetInsight Club auf Telegram öffnen",academy:"Academy & Hilfe"},
    en:{name:"English",language:"Choose language",follow:"Follow us",youtube:"Open BetInsight Club on YouTube",telegram:"Open BetInsight Club on Telegram",academy:"Academy & Help"},
    es:{name:"Español",language:"Elegir idioma",follow:"Síguenos",youtube:"Abrir BetInsight Club en YouTube",telegram:"Abrir BetInsight Club en Telegram",academy:"Academy y ayuda"},
    pt:{name:"Português",language:"Escolher idioma",follow:"Siga-nos",youtube:"Abrir BetInsight Club no YouTube",telegram:"Abrir BetInsight Club no Telegram",academy:"Academy e ajuda"},
    it:{name:"Italiano",language:"Scegli lingua",follow:"Seguici",youtube:"Apri BetInsight Club su YouTube",telegram:"Apri BetInsight Club su Telegram",academy:"Academy e aiuto"},
    fr:{name:"Français",language:"Choisir la langue",follow:"Suivez-nous",youtube:"Ouvrir BetInsight Club sur YouTube",telegram:"Ouvrir BetInsight Club sur Telegram",academy:"Academy et aide"}
  };

  function cleanLanguage(value) {
    const language = String(value || "").trim().toLowerCase().split("-")[0];
    return SUPPORTED.includes(language) ? language : "";
  }

  function cleanReferral(value) {
    const referral = String(value || "").trim();
    return /^[A-Za-z0-9_-]{2,50}$/.test(referral) ? referral : "";
  }

  function currentLanguage() {
    const htmlLanguage = cleanLanguage(document.documentElement.lang);
    if (htmlLanguage) return htmlLanguage;
    const parts = window.location.pathname.split("/").filter(Boolean);
    for (const part of parts) {
      const language = cleanLanguage(part);
      if (language) return language;
    }
    return "de";
  }

  function getCookieReferral() {
    const prefix = REF_STORAGE_KEY + "=";
    const row = document.cookie.split("; ").find(item => item.startsWith(prefix));
    if (!row) return "";
    try { return cleanReferral(decodeURIComponent(row.substring(prefix.length))); }
    catch (_) { return ""; }
  }

  function saveReferral(referral) {
    if (!referral || referral === DEFAULT_REF_CODE) return;
    try { localStorage.setItem(REF_STORAGE_KEY, referral); } catch (_) {}
    document.cookie = REF_STORAGE_KEY + "=" + encodeURIComponent(referral) + "; Max-Age=15552000; Path=/; SameSite=Lax; Secure";
  }

  function activeReferral() {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = cleanReferral(params.get("ref") || params.get("ref_code"));
    if (fromUrl) {
      saveReferral(fromUrl);
      return fromUrl;
    }
    try {
      const stored = cleanReferral(localStorage.getItem(REF_STORAGE_KEY));
      if (stored) return stored;
    } catch (_) {}
    return getCookieReferral() || DEFAULT_REF_CODE;
  }

  function saveLanguage(language) {
    if (!SUPPORTED.includes(language)) return;
    try { localStorage.setItem(LANGUAGE_KEY, language); } catch (_) {}
  }

  function languageUrl(language, referral) {
    const siteRoot = new URL("../", window.location.href);
    const target = new URL(language + "/", siteRoot);
    const params = new URLSearchParams(window.location.search);
    params.delete("lang");
    params.delete("ref_code");
    if (referral && referral !== DEFAULT_REF_CODE) params.set("ref", referral);
    else params.delete("ref");
    target.search = params.toString();
    target.hash = window.location.hash;
    return target.toString();
  }

  function addStyles() {
    if (document.getElementById("betinsight-language-styles")) return;
    const style = document.createElement("style");
    style.id = "betinsight-language-styles";
    style.textContent = `
      .language-switch{display:inline-flex;align-items:center;padding:4px;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:rgba(255,255,255,.035);flex-shrink:0}
      .language-switch select{min-height:34px;max-width:150px;padding:6px 28px 6px 10px;border:0;border-radius:999px;color:#fff;background:#0a69d8;font-size:12px;font-weight:900;cursor:pointer;outline:none}
      .language-switch select option{color:#071923;background:#fff}
      .betinsight-footer-social{display:flex;align-items:center;gap:9px;margin-top:18px}
      .betinsight-footer-social-label{color:#718a96;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}
      .betinsight-footer-social-link{display:grid;place-items:center;width:34px;height:34px;border:1px solid rgba(255,255,255,.10);border-radius:10px;background:rgba(255,255,255,.035);text-decoration:none;transition:transform .16s ease,border-color .16s ease,background .16s ease}
      .betinsight-footer-social-link:hover,.betinsight-footer-social-link:focus-visible{transform:translateY(-1px);border-color:rgba(255,80,90,.50);background:rgba(255,0,51,.08);outline:none}
      .betinsight-footer-social-icon{display:block;width:20px;height:20px}
      @media(max-width:720px){.language-switch{padding:3px}.language-switch select{max-width:122px;min-height:32px;font-size:11px}}
      @media(prefers-reduced-motion:reduce){.betinsight-footer-social-link{transition:none}}
    `;
    document.head.appendChild(style);
  }

  function buildSwitch() {
    if (document.querySelector("[data-language-switch]")) return;
    const navActions = document.querySelector(".nav-actions");
    if (!navActions) return;
    const current = currentLanguage();
    const referral = activeReferral();
    const wrapper = document.createElement("div");
    wrapper.className = "language-switch";
    wrapper.dataset.languageSwitch = "";
    const select = document.createElement("select");
    select.setAttribute("aria-label", LANGUAGE_COPY[current]?.language || "Choose language");
    for (const language of SUPPORTED) {
      const option = document.createElement("option");
      option.value = language;
      option.textContent = (LANGUAGE_FLAG[language] || "🌐") + " · " + (LANGUAGE_COPY[language]?.name || language.toUpperCase());
      option.selected = language === current;
      select.appendChild(option);
    }
    select.addEventListener("change", () => {
      const language = select.value;
      saveLanguage(language);
      window.location.href = languageUrl(language, referral);
    });
    wrapper.appendChild(select);
    navActions.prepend(wrapper);
  }

  function buildFooterSocial() {
    if (document.querySelector("[data-betinsight-footer-social]")) return;
    const footerBrand = document.querySelector(".site-footer .footer-grid > div:first-child");
    if (!footerBrand) return;
    const lang = currentLanguage();
    const wrapper = document.createElement("div");
    wrapper.className = "betinsight-footer-social";
    wrapper.dataset.betinsightFooterSocial = "";
    const label = document.createElement("span");
    label.className = "betinsight-footer-social-label";
    label.textContent = LANGUAGE_COPY[lang]?.follow || "Follow us";
    const youtube = document.createElement("a");
    youtube.className = "betinsight-footer-social-link";
    youtube.href = YOUTUBE_URL;
    youtube.target = "_blank";
    youtube.rel = "noopener noreferrer";
    youtube.setAttribute("aria-label", LANGUAGE_COPY[lang]?.youtube || "Open BetInsight Club on YouTube");
    youtube.title = "BetInsight Club · YouTube";
    youtube.innerHTML = '<svg class="betinsight-footer-social-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5.2" width="20" height="13.6" rx="4.2" fill="#ff0033"/><path d="M10 8.7 16 12l-6 3.3Z" fill="#fff"/></svg>';
    const telegram = document.createElement("a");
    telegram.className = "betinsight-footer-social-link betinsight-footer-telegram";
    telegram.href = TELEGRAM_URL;
    telegram.target = "_blank";
    telegram.rel = "noopener noreferrer";
    telegram.setAttribute("aria-label", LANGUAGE_COPY[lang]?.telegram || "Open BetInsight Club on Telegram");
    telegram.title = "BetInsight Club · Telegram";
    telegram.innerHTML = '<svg class="betinsight-footer-social-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#229ED9"/><path d="M17.8 7.2 15 17.3c-.2.7-.8.9-1.4.5l-4.2-3.1-2 1.9c-.2.2-.4.4-.8.4l.3-4.3 7.8-7c.3-.3-.1-.5-.5-.2l-9.6 6-4.1-1.3c-.9-.3-.9-.9.2-1.3l16-6.2c.8-.3 1.5.2 1.1 1.5Z" fill="#fff" transform="translate(2 2) scale(.83)"/></svg>';
    wrapper.append(label, youtube, telegram);
    footerBrand.appendChild(wrapper);
  }

  function buildFooterAcademyLink() {
    if (document.querySelector("[data-betinsight-academy-link]")) return;
    const footerLinks = document.querySelector(".site-footer .footer-grid > div:nth-child(2) .footer-links");
    if (!footerLinks) return;
    const lang = currentLanguage();
    const link = document.createElement("a");
    link.href = "academy/";
    link.textContent = LANGUAGE_COPY[lang]?.academy || "Academy";
    link.dataset.betinsightAcademyLink = "";
    footerLinks.appendChild(link);
  }

  function loadFunnelCta() {
    if (document.querySelector('script[data-bi-funnel-cta-loader]')) return;
    const script = document.createElement("script");
    script.src = new URL("funnel-cta.js?v=20260912-2", ASSET_BASE).toString();
    script.dataset.biFunnelCtaLoader = "1";
    document.head.appendChild(script);
  }

  function init() {
    addStyles();
    buildSwitch();
    buildFooterSocial();
    buildFooterAcademyLink();
    loadFunnelCta();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
