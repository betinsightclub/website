# TIME CLASH: Gästeinstieg, Zwischenstände und spätere Kontoübernahme (Konzept v1)

Stand: 31.10.2026. Dieses Dokument ist ein **Umsetzungsplan**, keine Freigabe für produktive Datenbankänderungen.

## Festgestellter produktiver Zustand (GitHub / Supabase read-only)

- `/de/time-clash/`: `GUEST_FREE_TOTAL=3`, Browser-Zähler in Local Storage + Cookie (`bi_time_clash_guest_games_used`).
- `guestRef()` erzeugt `bi_time_clash_guest` als zufällige Kennung im Local Storage von `betinsight.club`. Sie wird bei Abschluss an `time-clash-report` gesendet.
- `finishSeries()` sendet **erst nach Ende der gesamten Serie** `action:archive`. Kein Zwischenspeichern nach Spiel 1/2 einer längeren Serie.
- Produktive Tabelle `time_clashes`: `user_ref` (für registrierte Spieler), `guest_ref` (für Gäste), `public_slug`, `games`, `status`.
- 31.10.2026: 52 abgeschlossene Serien, 18 Gastserien zu 8 Browser-Gastkennungen. Das sind **keine** 8 verifizierten Personen.
- Öffentliche Berichte sind per `/de/time-clash/bericht/?clash=<slug>` abrufbar. Keine öffentliche Aktion zum Abrufen einer persönlichen Gast-Historie.
- In der bestehenden `time-clash-report`-Edge-Function ist keine `claim_guest`-/`transfer`-/`merge`-Aktion vorhanden. Registrierung verknüpft historische Gastserien nicht automatisch.

## Gewünschtes Besuchererlebnis

1. Neue Besucher öffnen `/time-clash/start/`; die existierenden `/{lang}/time-clash/`- und Werbelinks bleiben unangetastet.
2. Sofort spielbar ohne Registrierung. Klare Erklärung: **3 kostenlose Einzelspiele für Gäste insgesamt**; eine 3er-Serie verbraucht drei dieser Spiele.
3. Nach **einem vollständig beendeten Einzelspiel** bzw. nach **Spiel 1 oder 2 einer laufenden Mehrfachserie** soll die Option **„Spielstand speichern“** sichtbar sein. 
4. Beim Gast bedeutet „Spielstand speichern“: Zwischenstand in demselben Browser sichern; zusätzlich **optional** „Dauerhaft in meinem Profil speichern“ als nachvollziehbare Einladung zur kostenlosen Registrierung. Nicht behaupten, dass die Kontoübernahme bereits funktioniert.
5. Nach Rückkehr am selben Gerät/Browser ein „Weiterspielen“-Angebot zeigen, sofern ein valider Gast-Zwischenstand vorliegt und die Speicherung nicht vom Browser gelöscht wurde.
6. Bei erfolgreicher späterer Registrierung **explizite Opt-in-Aktion** „Meine Gastspiele übernehmen“. Erst nach erfolgreicher Serververknüpfung darf die App „Gespeichert in deinem Profil“ melden.
7. Kein Kopieren von Punkten/Units und keine doppelte Gutshrift; Gastspiele waren bis zur Registrierung ohne verifizierten Account.

## Umsetzungsvorschlag – schrittweise, kein ungeprüfter Live-Eingriff

**A. Einstieg (nur Frontend, bereits als Entwicklungsentwurf angelegt)**

- Neue Datei `time-clash/start/index.html` im separaten Branch.
- Sechs Sprachen DE/EN/ES/FR/IT/PT, einfacher CTA und drei Schritte.
- Alte Pfade, alte beworbene Links sowie die bestehende Engine nicht verändern.
- Referral-Code und vorhandene UTM-Parameter beim Klick weitergeben; keine geheimen Session-/Dashboard-Tokens in öffentlichen Links.
- Vor Veröffentlichung reale Browser-Tests, Linktest und Consent-/GA4-Prüfung.

**B. Pausierbarer Gast-Zwischenstand**

- Im bestehenden TIME-CLASH-Frontend erst einen getesteten Resume-Mechanismus ergänzen.
- Nach jedem beendeten **Einzelspiel** den minimal notwendigen Serienzustand lokal speichern: Match-Konfiguration, Serie, Spielindex, erzeugte Ereignisse / Spielpläne, Teamwahl, Siegerwahl, bereits beglichene Gastspiele, Version, Zeitstempel.
- Mehrfachserie erst fortsetzen, wenn Zustand/Serienlänge/Integrität validiert wurden; nicht erneut Gastguthaben beim Resume abziehen.
- Keine Spielstände/Punkte serverseitig aus ungeprüften Local-Storage-Werten autorisieren.
- Auf unterstützten Browsern 7 Tage Wiederaufnahme anbieten, ohne Garantie bei Speicherlöschung. Kein automatisches „Anmeldezwang“-Overlay nach dem Spiel.

**C. Kontoübernahme aus `time_clashes`**

- Authentifizierte Backend-Aktion via bestehender serverseitiger Identitätsprüfung (`credential`); nicht nur `guest_ref` als öffentliches Beweismittel akzeptieren.
- Servergenerierter, kurzlebiger und einmal verwendbarer Übernahmebeleg (proof); unter Webkonto/Browser nur nach Nutzerinteraktion, mindestens nach Registrierung/Anmeldung.
- Privaten Nachweis nie in öffentlichen URLs, OG-Daten oder geteilten Bericht-Links exponieren. Ein Bericht-Link allein ist keine ausreichende Besitzberechtigung.
- Datenbanktransaktion: Nur `status=completed`, `user_ref IS NULL`, passender Gast-Nachweis. `user_ref` atomar setzen; `claimed_at`/Audit protokollieren; idempotent gegen Doppelklick/Parallelzugriff.
- **Keine nachträgliche Clash-Point-, Unit- oder Referral-Gutschrift**, bis Regeln gesondert festgelegt und gegen Manipulation abgesichert sind.
- Datenschutz / gemeinsame Endgeräte: ausdrückliches Opt-in und transparente Anzeige der zu übernehmenden Berichte.
- Für bereits vorhandene Gastberichte nur übernehmen, wenn der legitime Gast seine lokale Kennung noch besitzt und die Besitzprüfung gelingt; keine unbelegte Zuordnung per E-Mail, IP oder Fingerprinting.

**D. Gast-Historie / Rückkehr**

- Eine lokal gespeicherte Liste öffentlicher Berichts-URLs kann für schnelle Anzeige genügen; die serverseitige Gast-Abfrage muss beweisgesichert sein, sonst könnte ein fremder Gast anhand eines Tokens fremde Datensätze beanspruchen.
- Nach Registrierung bestätigte eigene Berichte im Profil über `user_ref` laden.
- Berichts- und Profil-URL getrennt behandeln: Öffentlicher Bericht bleibt teilbar, Profilbesitz ist geschützt.

## Tests vor einer Freigabe

- Erstes abgeschlossenes Gastspiel: 2/3 verbleibend, Bericht abrufbar, Speicher-Hinweis sichtbar.
- Spiel 1 und Spiel 2 einer 3er-Serie: Pause, Reload, Rückkehr nächster Tag; Simulation bleibt reproduzierbar; kein nochmaliger Abzug.
- Gast mit 3/3 verbrauchten Spielen darf nicht kostenlos weitere Serien beginnen; keine Manipulation durch URL-Parameter.
- Anmeldung direkt und 24 h später im selben Browser: Opt-in, eindeutige Zuordnung, keine Punkte-Doppelerzeugung.
- Fremder Browser, verlorener Speicher, Privatsurfmodus: klare Information, **keine** automatische Zuordnung.
- Geteilter öffentlicher Berichtslink verleiht **kein** Übernahmerecht.
- Mehrfachklick, Netzwerkfehler, Race Conditions, bereits beanspruchte Serie.
- Alle sechs Sprachen, Responsive-Ansicht, UTM/Referral, alte Anzeigenlinks.
- Tests in Entwicklungsbranch; keine kostenpflichtigen APIs und kein Merge/Go-live ohne Freigabe.

## Entscheidungspunkt

Ein browser-lokales Pausieren ist relativ schlank. Eine **verifizierte serverseitige Übernahme nach Registrierung** ist dagegen eine echte neue Backend-Funktion und darf nicht nur durch UI-Text simuliert werden. Erst nach Umsetzung und erfolgreichen Tests „Spielstand dauerhaft im Profil gespeichert“ versprechen.
