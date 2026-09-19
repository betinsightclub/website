(() => {
  "use strict";

  const SUPPORTED = ["de","en","es","pt","it","fr"];
  const NAMES = {de:"Deutsch",en:"English",es:"Español",pt:"Português",it:"Italiano",fr:"Français"};
  const LANGUAGE_KEY = "betinsight_language";
  const REF_STORAGE_KEY = "betinsight_ref_code";
  const DEFAULT_REF_CODE = "POOL";

  const TIP_TAG_COPY = {
    de:{label:"Themen",season:"Saison 2026/27",football:"Fußballtipps",over:"Über 2,5 Tore",winner:"Sieger",acca:"Kombi"},
    en:{label:"Topics",season:"2026/27 season",football:"Football tips",over:"Over 2.5 goals",winner:"Match winner",acca:"Accumulator"},
    es:{label:"Temas",season:"Temporada 2026/27",football:"Pronósticos de fútbol",over:"Más de 2,5 goles",winner:"Ganador del partido",acca:"Combinada"},
    pt:{label:"Temas",season:"Temporada 2026/27",football:"Palpites de futebol",over:"Mais de 2,5 gols",winner:"Vencedor da partida",acca:"Combinada"},
    it:{label:"Temi",season:"Stagione 2026/27",football:"Pronostici calcio",over:"Over 2,5 gol",winner:"Vincente partita",acca:"Multipla"},
    fr:{label:"Thèmes",season:"Saison 2026/27",football:"Pronostics football",over:"Plus de 2,5 buts",winner:"Vainqueur du match",acca:"Combiné"}
  };

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

      .bi-tip-tags{margin-top:22px}
      .bi-tip-tags-label{display:block;margin-bottom:9px;color:#7f98a4;font-size:10px;font-weight:900;letter-spacing:.09em;text-transform:uppercase}
      .bi-tip-tags-list{display:flex;flex-wrap:wrap;gap:8px}
      .bi-tip-tag{display:inline-flex;align-items:center;min-height:30px;padding:6px 10px;border:1px solid rgba(126,211,255,.17);border-radius:999px;background:rgba(255,255,255,.035);color:#bcd2dc;font-size:11px;font-weight:800;line-height:1}
      .bi-tip-tag[data-kind="result-win"]{border-color:rgba(0,217,155,.28);background:rgba(0,217,155,.065);color:#9ff0ca}
      .bi-tip-tag[data-kind="result-loss"]{border-color:rgba(255,110,120,.25);background:rgba(255,110,120,.055);color:#ffb0b6}
      .bi-tip-tag[data-kind="season"]{border-color:rgba(247,201,80,.25);background:rgba(247,201,80,.05);color:#e7d494}

      @media(max-width:620px){
        .topbar,.header-inner{flex-wrap:wrap}
        .bi-subpage-actions{width:100%;justify-content:flex-end;margin-left:0}
        .bi-subpage-language select{max-width:130px}
        .bi-tip-tags{margin-top:18px}
      }
    `;
    document.head.appendChild(style);
  }

  function buildSwitch() {
    if (document.querySelector("[data-bi-subpage-language]")) return;
    const header = document.querySelector(".topbar, .header-inner");
    const back = header?.querySelector(".back");
    if (!header || !back) return;

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

  function unique(items) {
    const seen = new Set();
    return items.filter(item => {
      const value = String(item || "").trim();
      if (!value || seen.has(value.toLowerCase())) return false;
      seen.add(value.toLowerCase());
      return true;
    });
  }

  function matchTeams(title) {
    const raw = String(title || "").trim();
    if (!raw) return [];

    if (raw.includes("+")) {
      return raw
        .split("+")
        .flatMap(part => part.split(/[\/–-]/))
        .map(x => x.trim())
        .filter(Boolean)
        .slice(0,4);
    }

    return raw
      .split(/[–]/)
      .map(x => x.trim())
      .filter(Boolean)
      .slice(0,2);
  }

  function localizedMarket(raw, copy) {
    const value = String(raw || "").trim();
    const lower = value.toLowerCase();
    if (lower === "1x2") return "1X2";
    if (lower.includes("over 2.5")) return copy.over;
    if (lower.includes("match winner") || lower.includes("sieger")) return copy.winner;
    if (lower.includes("accumulator") || lower.includes("kombi")) return copy.acca;
    return value;
  }

  function buildTipTags() {
    if (document.querySelector("[data-bi-tip-tags]")) return;

    const parts = location.pathname.split("/").filter(Boolean);
    const isReport = parts.length >= 3 && parts[1] === "tipps" && parts[2] && parts[2] !== "index.html";
    if (!isReport) return;

    const heroWrap = document.querySelector(".hero .wrap");
    const meta = heroWrap?.querySelector(".meta");
    const title = heroWrap?.querySelector("h1")?.textContent?.trim();
    const tipMeta = document.querySelectorAll(".tipmeta > div");
    if (!heroWrap || !meta || !title || tipMeta.length < 3) return;

    const lang = currentLanguage();
    const copy = TIP_TAG_COPY[lang] || TIP_TAG_COPY.de;

    const metaSpans = Array.from(meta.querySelectorAll("span"));
    const competition = metaSpans[0]?.textContent?.trim() || "";
    const status = metaSpans.at(-1)?.textContent?.trim() || "";

    const units = tipMeta[1]?.querySelector("b")?.textContent?.trim() || "";
    const marketRaw = tipMeta[2]?.querySelector("b")?.textContent?.trim() || "";
    const market = localizedMarket(marketRaw, copy);

    const teams = matchTeams(title);
    const isCombo = teams.length > 2 || /accumulator|kombi/i.test(marketRaw);

    const tags = isCombo
      ? [...teams, market, status, copy.season, copy.football]
      : [competition, ...teams, market, units ? units + " Units" : "", status, copy.season, copy.football];

    const clean = unique(tags).slice(0,8);

    const section = document.createElement("div");
    section.className = "bi-tip-tags";
    section.dataset.biTipTags = "1";
    section.setAttribute("aria-label", copy.label);

    const label = document.createElement("span");
    label.className = "bi-tip-tags-label";
    label.textContent = copy.label;

    const list = document.createElement("div");
    list.className = "bi-tip-tags-list";

    clean.forEach(tag => {
      const chip = document.createElement("span");
      chip.className = "bi-tip-tag";
      chip.textContent = tag;

      if (tag === status) {
        chip.dataset.kind = /gewonnen|won|ganado|ganho|vinto|gagné/i.test(status)
          ? "result-win"
          : "result-loss";
      } else if (tag === copy.season) {
        chip.dataset.kind = "season";
      }

      list.appendChild(chip);
    });

    section.append(label, list);
    meta.insertAdjacentElement("afterend", section);
  }

  function init() {
    addStyles();
    buildSwitch();
    buildTipTags();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
  else init();
})();
