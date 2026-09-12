(() => {
  "use strict";

  const SUPPORTED = ["de","en","es","pt","it","fr"];
  const NAMES = {de:"Deutsch",en:"English",es:"Español",pt:"Português",it:"Italiano",fr:"Français"};
  const LANGUAGE_KEY = "betinsight_language";
  const REF_STORAGE_KEY = "betinsight_ref_code";
  const DEFAULT_REF_CODE = "POOL";

  function currentLanguage() {
    const first = location.pathname.split("/").filter(Boolean)[0]?.toLowerCase();
    return SUPPORTED.includes(first) ? first : "de";
  }

  function cleanRef(value) {
    const ref = String(value || "").trim();
    return /^[A-Za-z0-9_-]{2,50}$/.test(ref) ? ref : "";
  }

  function activeRef() {
    const params = new URLSearchParams(location.search);
    const fromUrl = cleanRef(params.get("ref") || params.get("ref_code"));
    if (fromUrl) return fromUrl;
    try {
      const stored = cleanRef(localStorage.getItem(REF_STORAGE_KEY));
      if (stored) return stored;
    } catch (_) {}
    return DEFAULT_REF_CODE;
  }

  function targetFor(language) {
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length && SUPPORTED.includes(parts[0].toLowerCase())) parts[0] = language;
    else parts.unshift(language);
    const url = new URL("/" + parts.join("/") + (location.pathname.endsWith("/") ? "/" : ""), location.origin);
    const params = new URLSearchParams(location.search);
    params.delete("lang");
    params.delete("ref_code");
    const ref = activeRef();
    if (ref && ref !== DEFAULT_REF_CODE) params.set("ref", ref);
    else params.delete("ref");
    url.search = params.toString();
    url.hash = location.hash;
    return url.toString();
  }

  function addStyles() {
    if (document.getElementById("bi-subpage-language-style")) return;
    const style = document.createElement("style");
    style.id = "bi-subpage-language-style";
    style.textContent = `
      .bi-subpage-actions{display:flex;align-items:center;gap:10px;margin-left:auto}
      .bi-subpage-language{display:inline-flex;align-items:center;padding:3px;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:rgba(255,255,255,.035)}
      .bi-subpage-language select{min-height:38px;max-width:144px;padding:6px 28px 6px 10px;border:0;border-radius:999px;color:#fff;background:#0a69d8;font-size:12px;font-weight:900;outline:none;cursor:pointer}
      .bi-subpage-language select option{color:#071923;background:#fff}
      @media(max-width:620px){.topbar,.header-inner{flex-wrap:wrap}.bi-subpage-actions{width:100%;justify-content:flex-end;margin-left:0}.bi-subpage-language select{max-width:130px}}
    `;
    document.head.appendChild(style);
  }

  function init() {
    if (document.querySelector("[data-bi-subpage-language]")) return;
    const header = document.querySelector(".topbar, .header-inner");
    const back = header?.querySelector(".back");
    if (!header || !back) return;
    addStyles();
    const current = currentLanguage();
    const actions = document.createElement("div");
    actions.className = "bi-subpage-actions";
    const wrapper = document.createElement("div");
    wrapper.className = "bi-subpage-language";
    wrapper.dataset.biSubpageLanguage = "1";
    const select = document.createElement("select");
    select.setAttribute("aria-label", "Language / Sprache");
    SUPPORTED.forEach(language => {
      const option = document.createElement("option");
      option.value = language;
      option.textContent = language.toUpperCase() + " · " + NAMES[language];
      option.selected = language === current;
      select.appendChild(option);
    });
    select.addEventListener("change", () => {
      try { localStorage.setItem(LANGUAGE_KEY, select.value); } catch (_) {}
      location.href = targetFor(select.value);
    });
    wrapper.appendChild(select);
    header.insertBefore(actions, back);
    actions.append(wrapper, back);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
  else init();
})();
