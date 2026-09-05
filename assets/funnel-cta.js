/* BetInsight public funnel CTA · 2026-09-05
   German landing page only.
   Adds visible Webinar / Founder-Call options before the final registration CTA
   and repeats both links in the footer. Public referral codes are preserved.
*/
(() => {
  "use strict";

  const REF_STORAGE_KEY = "betinsight_ref_code";
  const DEFAULT_REF_CODE = "POOL";
  const WEBINAR_URL = "https://betinsight.club/de/webinar/";
  const FOUNDER_CALL_URL = "https://betinsight.club/de/termin/";

  function isGermanLanding() {
    const path = location.pathname.replace(/\/+$/, "/");
    return path === "/de/" || path === "/de/index.html/" || path === "/de/index.html";
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
    const url = new URL(base);
    if (refCode && refCode !== DEFAULT_REF_CODE) url.searchParams.set("ref", refCode);
    else {
      url.searchParams.delete("ref");
      url.searchParams.delete("ref_code");
    }
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
      .bi-funnel-points li{position:relative;padding-left:22px}
      .bi-funnel-points li:before{content:"✓";position:absolute;left:0;color:var(--green);font-weight:900}
      .bi-funnel-card .btn{margin-top:auto;width:100%}
      .bi-funnel-card.webinar .btn{background:linear-gradient(135deg,#ff6b70,#dc3f4d);box-shadow:0 12px 28px rgba(255,95,101,.18)}
      .bi-funnel-card.founder .btn{background:linear-gradient(135deg,#00b986,#008e69);box-shadow:0 12px 28px rgba(0,217,155,.15)}
      @media(max-width:780px){.bi-funnel-grid{grid-template-columns:1fr}.bi-funnel-card{min-height:0;padding:23px}}
    `;
    document.head.appendChild(style);
  }

  function buildSection(refCode) {
    if (document.querySelector("[data-bi-funnel-choice]")) return;
    const finalCta = document.querySelector(".final-cta");
    if (!finalCta) return;

    const section = document.createElement("section");
    section.className = "bi-funnel-choice";
    section.dataset.biFunnelChoice = "1";
    section.setAttribute("aria-labelledby", "bi-funnel-choice-title");
    section.innerHTML = `
      <div class="container">
        <div class="section-head">
          <div class="section-label">BetInsight persönlich kennenlernen</div>
          <h2 id="bi-funnel-choice-title">Du möchtest BetInsight erst sehen oder deine Fragen persönlich klären?</h2>
          <p>Wähle den Weg, der zu dir passt. Danach kannst du dich jederzeit kostenlos registrieren.</p>
        </div>
        <div class="bi-funnel-grid">
          <article class="bi-funnel-card webinar">
            <span class="bi-funnel-kicker">🔴 Live oder flexibel ansehen</span>
            <h3>Live-Webinar & Aufzeichnung</h3>
            <p>Lerne BetInsight im Live-Webinar kennen oder sieh dir die Aufzeichnung an, sobald sie verfügbar ist.</p>
            <ul class="bi-funnel-points">
              <li>Live jeden Donnerstag um 20:00 Uhr (Europe/Berlin)</li>
              <li>Fragen nach dem Live-Webinar direkt an den Founder</li>
              <li>Aufzeichnung nach kurzer kostenloser Anmeldung</li>
            </ul>
            <a class="btn" href="${withRef(WEBINAR_URL, refCode)}">Zum Webinar & zur Aufzeichnung</a>
          </article>
          <article class="bi-funnel-card founder">
            <span class="bi-funnel-kicker">👤 Persönlicher Austausch</span>
            <h3>Persönliches Gespräch mit dem Founder</h3>
            <p>Wenn du offene Fragen direkt klären möchtest, kannst du einen der begrenzten persönlichen Gesprächstermine buchen.</p>
            <ul class="bi-funnel-points">
              <li>50 Minuten persönlicher Video-Call</li>
              <li>Fragen zu BetInsight und deinen nächsten Schritten</li>
              <li>Nur ausgewählte freie Termine</li>
            </ul>
            <a class="btn" href="${withRef(FOUNDER_CALL_URL, refCode)}">Persönlichen Termin ansehen</a>
          </article>
        </div>
      </div>`;

    finalCta.insertAdjacentElement("beforebegin", section);
  }

  function buildFooterLinks(refCode) {
    const footerLinks = document.querySelector(".site-footer .footer-grid > div:nth-child(2) .footer-links");
    if (!footerLinks || footerLinks.querySelector("[data-bi-funnel-footer-link]")) return;

    const webinar = document.createElement("a");
    webinar.href = withRef(WEBINAR_URL, refCode);
    webinar.textContent = "Live-Webinar & Aufzeichnung";
    webinar.dataset.biFunnelFooterLink = "webinar";

    const founder = document.createElement("a");
    founder.href = withRef(FOUNDER_CALL_URL, refCode);
    founder.textContent = "Founder-Call";
    founder.dataset.biFunnelFooterLink = "founder";

    const registration = footerLinks.querySelector("[data-registration-link]");
    if (registration) {
      footerLinks.insertBefore(webinar, registration);
      footerLinks.insertBefore(founder, registration);
    } else {
      footerLinks.append(webinar, founder);
    }
  }

  function init() {
    if (!isGermanLanding()) return;
    const refCode = activeRef();
    addStyles();
    buildSection(refCode);
    buildFooterLinks(refCode);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
