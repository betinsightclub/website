> **HISTORISCHER ZWISCHENSTAND (vor der Rekonstruktionsfreigabe):** Die untenstehenden Zählungen sind durch später am 23.10.2026 eingecheckte Ergänzungen überholt. Aktueller technischer Stand und abweichende Kataloggröße: [Rekonstruktion und Simulationstest](roster-reconstruction-completion-2026-10-23.md). Die Quelle selbst bleibt zur Chronologie erhalten.

# TIME CLASH – Kader- und Simulationsstatus · 23.10.2026

## Verifizierte Architektur
- Quelle: BetInsight – TIME CLASH Meisterkader ab 1970, Tab **Meisterkader**.
- Runtime: `time-clash/rosters-all.js` plus Länderergänzungen, geladen auf `/de|en|es|fr|it|pt/time-clash/`.
- Mindestbedingung: **11 echte, dokumentierte Spieler je Team** vor Start. Ziel: **15 oder mehr** plus historisch belegter Trainer. Keine künstlichen Namen und keine erfundenen historischen Startaufstellungen.
- Der Start-Button prüft beide Kader bei **allen** Duellarten. Der Spieler-Konflikt ist vorher zu entscheiden; der Kadercheck danach. Noch nicht freigeschaltete Mannschaften sind in den Auswahllisten mit `⏳ n/11` markiert.

## Stichtag (vorbehaltlich Live-Browsertest)
| Kategorie | Wählbare Versionen | ≥11 Spieler | <11 Spieler |
|---|---:|---:|---:|
| Historische Vereinsmeister (18 Ländergruppen) | 995 | 939 | 56 |
| Nationalmannschaften | 49 | 7 | 42 |

Bei den Vereinen erfüllen aktuell 914 der 995 Kader das Abschlussziel von mindestens 15 Spielern (81 darunter). Die Zahlen berücksichtigen die neuen Ägypten-Ergänzungen.

### Vereins-Kader unter 11
- **Ägypten**: 1 (Ghazl El Mahalla 1972/73: 10 Spieler, Torhüter nicht belegt).
- **Südafrika**: 18.
- **Marokko**: 37.
- In den anderen 15 Ländergruppen erfüllt jeder erfasste Meister die Mindestschwelle von 15.

### Heute umgesetzt
1. Al Mokawloon 1982/83: 9 → 24 Spieler aus historischer Saisonquelle, inklusive Trainer; `time-clash/egypt-verified-20261023.js`.
2. Ghazl El Mahalla 1972/73: 8 → 10 belegte Spieler; Simulation bewusst weiter gesperrt.
3. USA 2026: 26 offizielle WM-Spieler, Mauricio Pochettino; `time-clash/usa2026-world-cup-roster.js`.
4. Mexiko 2026: 26 Spieler und Javier Aguirre; Kanada 2026: 26 Spieler und Jesse Marsch, darunter Jayden Nelson als aktualisierter WM-Kaderspieler; `time-clash/north-america-2026-world-cup-rosters.js`.
5. Änderungen in den sechs Sprachversionen und im Meisterkader-Sheet (zusätzliche 95 Spielerzeilen in A24427:L24521).
6. JS-Syntaxprüfung aller drei neuen Module und der eingebetteten Skripte der sechs Sprachversionen erfolgreich. **Ein echter Nutzer-/Browser-Serientest ist dadurch noch nicht belegt.**

## Nächste Arbeitsblöcke
1. **Weitere Nationalteams mit belastbaren offiziellen Weltmeisterschafts-/EM-Kaderlisten** ergänzen – beide Mannschaften einer möglichen Begegnung brauchen ≥11.
2. **Marokko**: 37 blockierte historische Meister, zuerst jüngere Saisons mit vollständigen Vereinsarchiven bearbeiten.
3. **Südafrika**: 18 blockierte historische Meister, ebenfalls echte Namen + Herkunft pro Saison nachtragen.
4. **Ägypten**: für Ghazl 1972/73 mindestens eine zusätzliche belegte Person und einen Torhüter recherchieren; bis dahin nicht simulieren.
5. Automatische Qualitätsprüfung und reale Browsersimulation pro Spielart (Gast, Mitglied, Konflikt-Auflösung, 1/3/5/10 Partien).

## Belege
- USA: https://www.ussoccer.com/stories/2026/05/usmnt/meet-the-team-world-cup-roster
- Mexiko: https://datencenter.dfb.de/teams/mexiko
- Kanada: https://datencenter.dfb.de/en/competitions/fifa-world-cup/seasons/2026-in-usa%2Fmexico%2Fcanada/teams/canada?datacenter_name=data-center
- Kanada Kaderänderung: https://olympic.ca/2026/05/29/team-canada-unveils-26-man-roster-for-fifa-world-cup-2026/
- Ägypten/Al Mokawloon: https://3rabica.org/نادي_المقاولون_العرب_موسم_1982–83
- Ägypten/Ghazl: https://koraapedia.com/نتائج-الدوري-المصري-موسم-1972-1973/
