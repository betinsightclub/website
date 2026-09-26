# BetInsight TIME CLASH – verbindliche Regeln v1

Stand: 24.09.2026

## 1. Öffentlicher Modus / nicht registriert
- Gäste dürfen ausschließlich reale bzw. historische Nationalmannschaften und bekannte Clubs gegeneinander simulieren.
- Interne BetInsight-, Community- und User-Clubs sind für Gäste nicht auswählbar.
- Der öffentliche Modus verändert keine Club-Level oder Club-Siege.

## 2. User-Club und Level
Ein neu erstellter Club beginnt mit einem Team-Budget von 100 Stärkepunkten für die Startelf.

Die vom Projekt festgelegten Sieg-Anforderungen werden als **zusätzliche Siege je Aufstieg** geführt. Daraus ergeben sich folgende Gesamtstände:

| Level | zusätzliche Siege ab Vorstufe | Siege gesamt | Team-Budget |
|---|---:|---:|---:|
| Start | 0 | 0 | 100 |
| Bronze | 5 | 5 | 120 |
| Silber | 25 | 30 | 150 |
| Gold | 20 | 50 | 185 |
| Platin | 50 | 100 | 225 |
| Elite | 100 | 200 | 225 bis eine eigene Elite-Budget-Erhöhung beschlossen wird |

Elite ist aktuell vor allem die Freischaltung der vollständigen Gegnerwelt. Ein zusätzliches Elite-Stärkebudget wurde noch nicht festgelegt.

## 3. Matchmaking interner Clubs
- Vor Elite sind nur Gegner des gleichen Levels sowie maximal eine Stufe höher oder tiefer zulässig.
- Beispiel: Start darf gegen Start/Bronze spielen; Bronze gegen Start/Bronze/Silber; Silber gegen Bronze/Silber/Gold.
- Start gegen Silber ist gesperrt.
- Elite darf gegen alle internen Clubs sowie freigegebene reale/historische National- und Clubmannschaften antreten.
- Die Berechtigung wird nicht nur im Frontend, sondern auch serverseitig geprüft.

## 4. Sichtbarer Fortschritt
- Alle Level bleiben für den Nutzer jederzeit sichtbar.
- Das aktuelle Level, die Siege, das Team-Budget und der Fortschritt zum nächsten Level werden angezeigt.
- Dynamischer Hinweis: „Dir fehlen noch X Siege bis [nächstes Level].“
- Nach einem Aufstieg werden die zusätzlichen Entwicklungspunkte freigeschaltet und vom Nutzer auf die Startelf verteilt.

## 5. Spielguthaben
- Registrierte User erhalten pro Kalenderwoche 5 kostenlose Spiele.
- Nicht genutzte kostenlose Wochenspiele verfallen beim Wochenwechsel.
- Für jede tatsächlich verbrauchte **gekaufte** Unit entsteht 1 zusätzliches, dauerhaftes Spiel.
- Dauerhafte Spiele verfallen nicht.
- Geschenk- und Referral-Units erzeugen kein dauerhaftes TIME-CLASH-Spielguthaben.
- Das Spielguthaben wird für Begegnungen mit dem eigenen bzw. internen BetInsight-Club verwendet.
- Der öffentliche Modus „reale/historische Mannschaft gegen reale/historische Mannschaft“ bleibt kostenlos – auch wenn ein registrierter Nutzer ihn verwendet. So entsteht kein Anreiz, sich für den öffentlichen Modus auszuloggen.
- Eine interne Club-Serie verbraucht so viele Spiele wie sie Einzelspiele enthält: 3er-Serie = 3 Spiele, 5er-Serie = 5 Spiele, 10er-Serie = 10 Spiele.
- Kostenlose Wochenspiele werden zuerst verbraucht, danach dauerhaftes Spielguthaben.
- Der Gesamtverbrauch gekaufter Units wird aus dem bestehenden BetInsight-Profil/FIFO-System synchronisiert; bereits synchronisierte Kauf-Units werden nicht doppelt gutgeschrieben.

## 6. Zeitung / Bild
- Nach Abschluss einer Serie wird kein Bild automatisch erzeugt.
- Der User kann optional auf „Zeitungsbild erstellen“ klicken.
- Pro erzeugtem Bild werden die gespeicherten Matchdaten (Teams, Ergebnis, Torschützen, Highlights) verwendet.
- Der Inhalt soll in der Sprache der jeweiligen TIME-CLASH-Seite erzeugt werden.
- Die aktuelle erste Web-Version erzeugt ein lokales BetInsight-Zeitungsbild im Browser. Eine fotorealistische KI-Spielszene benötigt später einen angebundenen Bildgenerierungsdienst.

## 7. Teilen
- Teilbare TIME-CLASH-Inhalte erhalten eine Teilen-Funktion.
- Match-Ergebnis und öffentlicher Bericht können per nativer Teilen-Funktion bzw. Link geteilt werden.
- Ein erzeugtes Zeitungsbild kann auf unterstützten Geräten als Bild geteilt werden.
- Private Profil-, Wallet-, Netzwerk- und Zahlungsdaten gehören nicht in öffentliche Share-Inhalte.

## 8. Datenprinzip
- Siege/Level und Spielguthaben werden serverseitig geführt.
- Das Frontend zeigt Berechtigungen an, ist aber nicht die alleinige Sicherheitsprüfung.
- Level-/Gegnerregeln werden beim Speichern eines Club-Ergebnisses nochmals serverseitig validiert.


## 9. Monatsranking & Belohnungen
- Erstes offizielles Ranking: Oktober 2026.
- Zeitraum: jeweils vollständiger Kalendermonat nach Europe/Berlin.
- Ab Oktober 2026 gilt dauerhaft: Platz 1 = 15 Geschenk-Units, Platz 2 = 8 Geschenk-Units, Platz 3 = 5 Geschenk-Units.
- Es gibt keine reduzierte Folgeregel ab November; derselbe Monatspool 15 / 8 / 5 gilt automatisch in jedem folgenden Kalendermonat.
- Die App berechnet Monatsname und Monatsgrenzen automatisch; dafür ist keine monatliche Seitenänderung nötig.
- Teilnahme nur für verifizierte BetInsight-User.
- Geschenk-Units aus dem Ranking erzeugen kein zusätzliches TIME-CLASH-Spielguthaben.
- Die konkrete Ranking-Formel und die automatische Verbuchung der Gewinner-Units werden separat serverseitig festgelegt, bevor die erste Oktoberwertung abgeschlossen wird.


## 10. Aufstiegsbonus in Clash Token
- Start: kein Aufstiegsbonus.
- Bronze: beim erstmaligen Erreichen automatisch +5 dauerhafte Clash Token.
- Silber: beim erstmaligen Erreichen automatisch +5 dauerhafte Clash Token.
- Gold: beim erstmaligen Erreichen automatisch +5 dauerhafte Clash Token.
- Platin: beim erstmaligen Erreichen automatisch +5 dauerhafte Clash Token.
- Elite: beim erstmaligen Erreichen automatisch +20 dauerhafte Clash Token und Freischaltung aller Gegner.
- Jeder Levelbonus kann pro Club/BetInsight-Konto nur einmal vergeben werden.
- Die Token werden serverseitig als dauerhaftes TIME-CLASH-Spielguthaben verbucht und verfallen nicht beim Wochenwechsel.


## 11. Fußball- und Simulationslogik
- Einzelspiele dürfen regulär unentschieden enden. Es wird kein künstliches Siegtor mehr erzeugt.
- Serienwertung pro Einzelspiel: Sieg = 3 Punkte, Unentschieden = 1 Punkt, Niederlage = 0 Punkte.
- Nach 3, 5 oder 10 Einzelspielen muss die TIME-CLASH-Serie einen Sieger haben. Bei gleicher Serienpunktzahl folgt eine zusätzliche Serien-Verlängerung; bleibt diese unentschieden, folgt Elfmeterschießen mit fünf Schützen und bei Bedarf Sudden Death.
- Gelbe Karten werden je Spieler und Einzelspiel gezählt. Die zweite Gelbe im selben Spiel führt zu Gelb-Rot/Platzverweis.
- Ein Platzverweis reduziert die Mannschaft für den Rest des Einzelspiels; der ausgeschlossene Spieler darf nicht ersetzt werden.
- Trainer können einen bereits verwarnten Spieler aus taktischen Gründen auswechseln. Regulär sind maximal fünf Wechsel pro Mannschaft und Einzelspiel vorgesehen.
- Direkte rote Karten, Abseits, Eigentore, Fouls, Ecken, Paraden und taktische Wechsel bleiben mögliche Ereignisse.
- Stadien werden für jede neue Serie neu gemischt. Es gibt keine feste Reihenfolge und keinen festen Start in Rom.
- Individuelle Spielerstärke ist auf 25 Punkte begrenzt.
- Die Punkteverteilung innerhalb des Teams ist für die Simulation positionsbezogen: Angriff wird gegen gegnerische Abwehr, Mittelfeld gegen Mittelfeld und Abschlusswahrscheinlichkeit gegen die gegnerische Torwartstärke bewertet.
- Ein sehr starker Torwart reduziert die gegnerische Torwahrscheinlichkeit deutlich; ein schwacher Torwart erhöht sie deutlich.
- Die genaue interne Punkteverteilung eines gegnerischen User-Clubs wird dem Gegner nicht offengelegt.
- Die 3/1/0-Serienpunkte und eine eventuell notwendige Serienentscheidung werden zusätzlich serverseitig validiert, bevor ein Bericht gespeichert oder ein Clubergebnis gewertet wird.
