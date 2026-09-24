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
