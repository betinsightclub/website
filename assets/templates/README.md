# BetInsight – freigegebene Ergebnis-Master-Schablone

## Aktive Nutzer-Schablone

`betinsight-result-master-blanko.png` ist vom Nutzer hochgeladen und als **Basis für neue Ergebnisbilder** vorgesehen. Das BetInsight-Original-Logo ist laut Freigabe **bereits im Master-Bild enthalten**: niemals ein zweites Logo darüberlegen oder das vorhandene Logo KI-generieren. Masterdatei unverändert behalten.

**Beim Rendern pro Tipp:** Nur die von Supabase bestätigten Daten (Mannschaften, Datum, Ergebnis, Gewinn-/Verlust-Status, Markt, Quote, Units, Einzelspiele von Kombiwetten) eintragen. Jede Ergebnisgrafik bekommt eine individuelle öffentliche Datei und eine neue Versionsnummer bei Änderungen. Hierbei keinen generischen Sponsor oder Vereinslogo erzeugen.

## SEO und Social Preview – Pflicht

Die SEO-Daten werden **unsichtbar** gespeichert. Die Bilddatei soll Titel/Beschreibung und tatsächlich zutreffende Herausgeber-/Lizenzangaben in EXIF (JPG) bzw. Text-Chunks (PNG) erhalten. Der Master selbst bleibt unberührt.

Für jede freigegebene Ergebnis-Seite muss **vor externer Weitergabe** zusätzlich eine von Crawlern ohne JavaScript lesbare, **individuelle HTML-Seite** existieren:
- eindeutiger `<title>`, `meta name="description"`, kanonische URL;
- `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card`, `twitter:image`;
- echtes individuelles `<img src=... alt=...>`, strukturierte `Article`-/`ImageObject`-Daten;
- geeignetes Bildformat 1200×630 und eindeutige Bild-URL; keine Indexierung von internen Tests.

**Wichtig:** Die derzeitige dynamische `/de/tipps/bericht/?id=...`-Seite liefert die tippspezifischen Meta-Tags noch nicht serverseitig aus. Ein JavaScript-Update reicht für sichere Flipboard-/Google-Vorschauen nicht aus. Vollautomatik daher erst nach Aufbau und Prüfung individueller, serverseitig lesbarer Berichtsseiten freigeben.

## Verifizierter Spielbericht

API-Football: echte Spielereignisse, Minuten, Tore und besondere Wendepunkte, falls verfügbar. Bei Kombi-Resultaten jede Auswahl einzeln prüfen, danach kurz erklären, warum der Gesamt-Tipp gewonnen oder verloren wurde. Fehlende Daten niemals erfinden.

Verbindlicher Standard: [docs/social-preview-standard-v1.json](../../docs/social-preview-standard-v1.json).

**Status:** Masterdatei gespeichert, Anforderungen dokumentiert. Vollständiger automatischer Generierungs-/Publikationspfad bleibt gesondert zu implementieren und Ende-zu-Ende zu testen.
