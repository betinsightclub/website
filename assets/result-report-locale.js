(() => {
  "use strict";
  // The language selected on the homepage is stored as betinsight_language.
  // Respect it when navigating within BetInsight. Keep explicit externally
  // shared /es/, /pt/, etc. URLs unchanged for visitors and search crawlers.
  try {
    const supported = new Set(["de", "en", "es", "pt", "it", "fr"]);
    const preferred = localStorage.getItem("betinsight_language");
    if (!supported.has(preferred) || !document.referrer) return;
    const current = new URL(location.href);
    const previous = new URL(document.referrer);
    const match = current.pathname.match(/^\/(de|en|es|pt|it|fr)\/tipps\/ergebnis\/(BI-[a-zA-Z0-9_-]+)\/?$/);
    if (!match || preferred === match[1] || previous.origin !== current.origin) return;
    if (!previous.pathname.startsWith("/" + preferred + "/")) return;
    current.pathname = current.pathname.replace(/^\/(de|en|es|pt|it|fr)\//, "/" + preferred + "/");
    location.replace(current.href);
  } catch (_) {
    // Missing local storage or restricted browser settings should not
    // prevent readers or social crawlers from seeing the requested report.
  }
})();