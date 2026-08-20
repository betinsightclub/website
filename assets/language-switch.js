(() => {
  "use strict";

  const LANGUAGE_KEY = "betinsight_language";
  const REF_STORAGE_KEY = "betinsight_ref_code";
  const DEFAULT_REF_CODE = "POOL";
  const SUPPORTED = ["de", "en"];

  function cleanLanguage(value) {
    const language = String(value || "")
      .trim()
      .toLowerCase()
      .split("-")[0];

    return SUPPORTED.includes(language)
      ? language
      : "";
  }

  function cleanReferral(value) {
    const referral = String(value || "").trim();

    return /^[A-Za-z0-9_-]{2,50}$/.test(referral)
      ? referral
      : "";
  }

  function currentLanguage() {
    const htmlLanguage =
      cleanLanguage(document.documentElement.lang);

    if (htmlLanguage) {
      return htmlLanguage;
    }

    const parts = window.location.pathname
      .split("/")
      .filter(Boolean);

    for (const part of parts) {
      const language = cleanLanguage(part);

      if (language) {
        return language;
      }
    }

    return "de";
  }

  function getCookieReferral() {
    const prefix = REF_STORAGE_KEY + "=";

    const row = document.cookie
      .split("; ")
      .find(item => item.startsWith(prefix));

    if (!row) {
      return "";
    }

    try {
      return cleanReferral(
        decodeURIComponent(
          row.substring(prefix.length)
        )
      );
    } catch (error) {
      return "";
    }
  }

  function saveReferral(referral) {
    if (
      !referral ||
      referral === DEFAULT_REF_CODE
    ) {
      return;
    }

    try {
      localStorage.setItem(
        REF_STORAGE_KEY,
        referral
      );
    } catch (error) {}

    document.cookie =
      REF_STORAGE_KEY +
      "=" +
      encodeURIComponent(referral) +
      "; Max-Age=15552000; Path=/; SameSite=Lax; Secure";
  }

  function activeReferral() {
    const params =
      new URLSearchParams(window.location.search);

    const fromUrl = cleanReferral(
      params.get("ref") ||
      params.get("ref_code")
    );

    if (fromUrl) {
      saveReferral(fromUrl);
      return fromUrl;
    }

    try {
      const stored = cleanReferral(
        localStorage.getItem(REF_STORAGE_KEY)
      );

      if (stored) {
        return stored;
      }
    } catch (error) {}

    return getCookieReferral() ||
      DEFAULT_REF_CODE;
  }

  function saveLanguage(language) {
    if (!SUPPORTED.includes(language)) {
      return;
    }

    try {
      localStorage.setItem(
        LANGUAGE_KEY,
        language
      );
    } catch (error) {}
  }

  function languageUrl(language, referral) {
    const siteRoot =
      new URL("../", window.location.href);

    const target =
      new URL(language + "/", siteRoot);

    const params =
      new URLSearchParams(window.location.search);

    params.delete("lang");
    params.delete("ref_code");

    if (
      referral &&
      referral !== DEFAULT_REF_CODE
    ) {
      params.set("ref", referral);
    } else {
      params.delete("ref");
    }

    target.search = params.toString();
    target.hash = window.location.hash;

    return target.toString();
  }

  function addStyles() {
    if (
      document.getElementById(
        "betinsight-language-styles"
      )
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "betinsight-language-styles";

    style.textContent = `
      .language-switch {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 4px;
        border: 1px solid rgba(255,255,255,.12);
        border-radius: 999px;
        background: rgba(255,255,255,.035);
        flex-shrink: 0;
      }

      .language-switch a {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 38px;
        min-height: 34px;
        padding: 7px 9px;
        border-radius: 999px;
        color: #b8ccd6;
        text-decoration: none;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: .04em;
        line-height: 1;
        transition:
          color .18s ease,
          background .18s ease,
          box-shadow .18s ease;
      }

      .language-switch a:hover,
      .language-switch a:focus-visible {
        color: #fff;
        background: rgba(105,184,255,.11);
        outline: none;
      }

      .language-switch a[aria-current="page"] {
        color: #fff;
        background:
          linear-gradient(
            135deg,
            var(--blue, #1687ff),
            var(--blue-2, #0a69d8)
          );
        box-shadow:
          0 7px 18px rgba(22,135,255,.22);
      }

      @media (max-width: 720px) {
        .language-switch {
          padding: 3px;
          gap: 2px;
        }

        .language-switch a {
          min-width: 34px;
          min-height: 32px;
          padding: 6px 7px;
          font-size: 11px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function buildSwitch() {
    if (
      document.querySelector(
        "[data-language-switch]"
      )
    ) {
      return;
    }

    const navActions =
      document.querySelector(".nav-actions");

    if (!navActions) {
      console.warn(
        "BetInsight: .nav-actions nicht gefunden."
      );
      return;
    }

    const current = currentLanguage();
    const referral = activeReferral();

    const wrapper =
      document.createElement("div");

    wrapper.className = "language-switch";
    wrapper.dataset.languageSwitch = "";
    wrapper.setAttribute(
      "aria-label",
      current === "de"
        ? "Sprache wählen"
        : "Choose language"
    );

    for (const language of SUPPORTED) {
      const link =
        document.createElement("a");

      link.href =
        languageUrl(language, referral);

      link.textContent =
        language.toUpperCase();

      link.dataset.languageLink = "";
      link.dataset.lang = language;

      if (language === current) {
        link.setAttribute(
          "aria-current",
          "page"
        );
      }

      link.addEventListener(
        "click",
        () => saveLanguage(language)
      );

      wrapper.appendChild(link);
    }

    navActions.prepend(wrapper);
  }

  function init() {
    addStyles();
    buildSwitch();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }
})();
