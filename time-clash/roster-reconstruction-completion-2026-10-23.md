# TIME CLASH – Simulationsfreigabe durch transparente Kaderrekonstruktion

**Stand:** 23. Oktober 2026 · Basis: `betinsightclub/website`, Branch `main`.

## Beschlossene Funktion

Ein realer Kader besitzt normalerweise elf Spieler einschließlich Torwart. Für historische
BetInsight-TIME-CLASH-Duelle reicht das öffentliche Archiv teilweise nicht aus.
Anstatt erfundene Spieler als historisch belegt auszugeben, generiert das Spiel **nur
zur Laufzeit** anonyme, nummerierte Positions-Slots.

- 11 dokumentierte Spieler mit Torwart: unverändert.
- Weniger als 11 dokumentierte Spieler: so viele anonyme Positionen wie nötig ergänzen.
- Fehlender Torwart: einen anonymen Torwart ergänzen, bis der Spielstart möglich ist.
- Null historische Spieler: elf anonyme Rollen, deutlich gekennzeichnet als rein
  hypothetisches Spiel. Keine historischen Namens- oder Rollenbehauptungen.
- Simulation und Ticker kennzeichnen diese Plätze mit „Simulation · …“ oder
  entsprechender Übersetzung. Im Auswahlmenü ist ein unvollständiger Kader mit 🧩 markiert.
- Über der Arena erscheint ein lokalisierter Hinweis, wie viele der elf Startspieler
  in der Simulation anonym ergänzt wurden.
- Gemeinsame echte Spieler werden weiterhin **vor** der Kaderprüfung aufgelöst.
- **Mitglieder- und Communityclubs sind ausgeschlossen** – dort gelten die echten Kaderregeln.
- `window.TC_ROSTER_DB` und das Meisterkader-Google-Sheet bleiben unverändert.

**Keine automatische Korrektur des historischen Archivs!** Bei neu gefundenen echten Namen
werden die vorläufigen Simulationsplätze von selbst weniger.

## Nachgeprüfter Kaderstatus

| Kategorie | Auswählbare Mannschaften | Kader mit <11 real erfassten Spielern | Simulierbar mit optionaler Rekonstruktion |
|---|---:|---:|---:|
| 15 vollständig ergänzte Meister-Ländergruppen | 860 | 0 | 860 |
| Ägypten | 50 | 0 | 50 |
| Südafrika | 56 | 17 | 56 |
| Marokko | 56 | 25 | 56 |
| **Vereinsmeister gesamt** | **1.022** | **42** | **1.022** |
| Nationalmannschaftsversionen | 49 | 0 | 49 |

**Hinweis zur Zählung:** Der ältere Stand von 995 Vereinsmannschaften stammt aus dem
früheren Katalog. Die nachträglich durch `*-complete.js` ergänzten Meisterjahre
erweitern den aktuellen Selektor. Die obigen Gruppenwerte summieren sich auf **1.022**,
weil die aktuellen Länderskripte bereits zusätzliche historische Meister enthalten.
Ein vollständiger Browser- und CI-Gesamtdurchlauf ist noch zu bestätigen.

**Weitere Qualitätsarbeit:** Torwart-Positionen sind in einigen älteren Mannschaftsdaten
nicht explizit dokumentiert; auch diese sollten weiter historisch belegt nachgepflegt
werden. Eine über die Zeit zusammengesetzte Simulationself ist nicht identisch mit einer
authentischen Startformation.

## Implementiert

- `time-clash/roster-reconstruction-v1.js`: isolierter Ersatzpositions-Generator.
- `de|en|es|fr|it|pt/time-clash/index.html`: Einbindung, Teamwahl-Hinweis, 
  Rekonstruktionsinfo, Konfliktentscheidung, Startprüfung.
- `scripts/validate-time-clash-roster-reconstruction.mjs`: Prüft alle sechs
  Seiten, Quellen-Skripte und alle angebotenen Mannschaften.
- `.github/workflows/time-clash-roster-guard.yml`: Automatische Checks bei Änderungen.

**Teststand:** Einheitentests mit 0, 1, 9, 10, 11 und fehlendem Torwart,
Bewahrung der Community-Kader und syntaktischer Prüfung der sechs Hauptsprachen
waren erfolgreich. Gesamtdurchlauf im Browser und GitHub-Actions-Ergebnis sind
zum Zeitpunkt dieser Dokumentation nicht abschließend bestätigt.

## Weiterführende Aufgabe

Alle 42 unvollständigen historischen Kader vor allem aus Marokko und Südafrika
weiter mit echten, referenzierten Spielern ergänzen; wenn eine Quelle keine
Spielerliste enthält, bleibt das Archiv unvollständig und die sichtbare 
Rekonstruktion sorgt nur für die Spielbarkeit, nicht für eine falsche Historie.
