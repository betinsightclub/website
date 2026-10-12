import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pageLanguages = ["de", "en", "es", "pt", "it", "fr"];
const displayLanguages = [...pageLanguages, "nl", "zh-tw"];
const root = readFileSync("index.html", "utf8");

assert(root.includes("const fallbackLanguage="), "The root must preserve Dutch/Chinese fallback routes");
assert(root.includes("betinsight_language"), "Missing shared language preference");
for (const lang of displayLanguages) {
  assert(root.includes('"' + lang + '"'), "Root is missing language " + lang);
}

const markers = displayLanguages.map((lang) => ({
  lang,
  marker: "\n" + (lang === "zh-tw" ? '"zh-tw"' : lang) + ":{",
}));

function translations(source, lang) {
  const startAt = source.indexOf("const T={");
  assert(startAt >= 0, "Translation dictionary not found");
  const positions = markers.map(({lang: name, marker}) => ({
    lang: name,
    position: source.indexOf(marker, startAt)
  })).sort((a, b) => a.position - b.position);
  for (const p of positions) assert(p.position >= 0, "Missing locale " + p.lang);
  const current = positions.find((p) => p.lang === lang);
  const next = positions.find((p) => p.position > current.position);
  const end = next ? next.position : source.indexOf("\n};", current.position);
  assert(end > current.position, "Invalid dictionary boundary for " + lang);
  const values = {};

  function consume(text) {
    const pattern = /(?:^|[,\s])([a-zA-Z][\w]*)\s*:\s*"((?:\\.|[^"\\])*)"/g;
    for (const match of text.matchAll(pattern)) {
      values[match[1]] = JSON.parse('"' + match[2] + '"');
    }
  }

  consume(source.slice(current.position, end));
  const pattern = lang === "zh-tw"
    ? /Object\.assign\(T\["zh-tw"\],\{([\s\S]*?)\}\);/g
    : new RegExp("Object\\.assign\\(T\\." + lang + ",\\{([\\s\\S]*?)\\}\\);", "g");
  for (const match of source.matchAll(pattern)) consume(match[1]);
  return values;
}

let checkedVisible = 0;
for (const lang of pageLanguages) {
  const source = readFileSync(lang + "/index.html", "utf8");
  const split = source.indexOf("<script>\nconst T={");
  assert(split >= 0, "Cannot find start of translation script for " + lang);
  const documentMarkup = source.slice(0, split);
  const expectedCanonical = "https://betinsight.club/" + lang + "/";
  assert(source.includes('<link rel="canonical" href="' + expectedCanonical + '">'), "Incorrect canonical for " + lang);
  assert(source.includes('localStorage.setItem("betinsight_language",lang)'), "Shared language preference missing on " + lang);
  assert(source.includes('localStorage.setItem("betinsight-lang",lang)'), "Legacy language preference missing on " + lang);
  assert(source.includes('location.assign(url.href)'), "Language selection URL navigation missing on " + lang);
  const title = source.match(/<title>([^<]+)<\/title>/)?.[1];
  assert(title && (lang === "de" || !title.includes("Sport verstehen")), "Unlocalized SEO title: " + lang);

  const visible = /<([A-Za-z][\w:-]*)\b([^<>]*?\bdata-i18n="([^"]+)"[^<>]*)>([\s\S]*?)<\/\1\s*>/g;
  const placeholders = [...documentMarkup.matchAll(visible)];
  assert(placeholders.length === 165, "Unexpected number of translated UI nodes for " + lang);
  const uiKeys = new Set(placeholders.map((m) => m[3]));

  for (const available of displayLanguages) {
    const dictionary = translations(source, available);
    for (const key of uiKeys) assert(Object.hasOwn(dictionary, key), "Missing " + available + ":" + key + " on " + lang);
    if (available === lang) {
      for (const [, , , key, content] of placeholders) {
        const desired = dictionary[key].replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        assert.equal(content, desired, "Initial HTML/translation mismatch: " + lang + ":" + key);
        checkedVisible++;
      }
    }
  }
}
console.log("BetInsight i18n QA passed: 8 translation dictionaries complete; " + checkedVisible + " translated HTML nodes checked across 6 language pages.");
