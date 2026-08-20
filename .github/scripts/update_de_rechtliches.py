from pathlib import Path
import sys

LANDING = Path("de/index.html")
PRIVACY = Path("de/datenschutz/index.html")
TERMS = Path("de/agb/index.html")
IMPRINT = Path("de/impressum/index.html")

for path in (LANDING, PRIVACY, TERMS, IMPRINT):
    if not path.exists():
        sys.exit(f"FEHLER: Pflichtdatei fehlt: {path}")

html = LANDING.read_text(encoding="utf-8")

old_legal = '''          <div class="footer-links">
            <a href="https://betinsight.systeme.io/agbs">AGB</a>
            <a href="https://betinsight.systeme.io/datenschutz">Datenschutz</a>
            <a href="#impressum">Impressum</a>
          </div>'''

new_legal = '''          <div class="footer-links">
            <a href="./agb/">AGB</a>
            <a href="./datenschutz/">Datenschutz</a>
            <a href="./impressum/">Impressum</a>
          </div>'''

old_imprint = '''      <div class="imprint" id="impressum">
        <strong>Impressum:</strong> LucMedia LTDA · Av 33 850 · CEP 14780-192 Barretos, SP · Brasilien · E-Mail:
        <a href="mailto:betinsight.club@gmail.com">betinsight.club@gmail.com</a>
      </div>'''

new_imprint = '''      <div class="imprint">
        <strong>Anbieter:</strong> LucMedia LTDA · Av. 33, 850 · CEP 14780-192 · Barretos – SP · Brasilien ·
        <a href="./impressum/">Impressum</a> ·
        <a href="mailto:betinsight.club@gmail.com">betinsight.club@gmail.com</a>
      </div>'''

if old_legal in html:
    html = html.replace(old_legal, new_legal, 1)
elif new_legal not in html:
    sys.exit("FEHLER: Erwarteter Rechtliches-Block wurde nicht gefunden.")

if old_imprint in html:
    html = html.replace(old_imprint, new_imprint, 1)
elif new_imprint not in html:
    sys.exit("FEHLER: Erwarteter Impressum-Kurzblock wurde nicht gefunden.")

for forbidden in (
    'https://betinsight.systeme.io/agbs',
    'https://betinsight.systeme.io/datenschutz',
    'href="#impressum"',
):
    if forbidden in html:
        sys.exit(f"FEHLER: Alter Rechtliches-Link noch vorhanden: {forbidden}")

for required in (
    'href="./agb/"',
    'href="./datenschutz/"',
    'href="./impressum/"',
    'LucMedia LTDA',
):
    if required not in html:
        sys.exit(f"FEHLER: Neuer Prüfpunkt fehlt: {required}")

LANDING.write_text(html, encoding="utf-8")
print("OK: Deutscher Footer verweist jetzt auf lokale Rechtstexte.")
