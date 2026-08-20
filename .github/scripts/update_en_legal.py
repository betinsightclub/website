from pathlib import Path
import sys

LANDING = Path("en/index.html")
PRIVACY = Path("en/privacy/index.html")
TERMS = Path("en/terms/index.html")
NOTICE = Path("en/legal-notice/index.html")

for path in (LANDING, PRIVACY, TERMS, NOTICE):
    if not path.exists():
        sys.exit(f"ERROR: required file missing: {path}")

html = LANDING.read_text(encoding="utf-8")

old_legal = '''          <div class="footer-links">
            <a href="https://betinsight.systeme.io/agbs">Terms & Conditions</a>
            <a href="https://betinsight.systeme.io/datenschutz">Privacy Policy</a>
            <a href="#impressum">Legal Notice</a>
          </div>'''

new_legal = '''          <div class="footer-links">
            <a href="./terms/">Terms & Conditions</a>
            <a href="./privacy/">Privacy Policy</a>
            <a href="./legal-notice/">Legal Notice</a>
          </div>'''

old_notice = '''      <div class="imprint" id="impressum">
        <strong>Legal Notice:</strong> LucMedia LTDA · Av 33 850 · CEP 14780-192 Barretos, SP · Brazil · Email:
        <a href="mailto:betinsight.club@gmail.com">betinsight.club@gmail.com</a>
      </div>'''

new_notice = '''      <div class="imprint">
        <strong>Provider:</strong> LucMedia LTDA · Av. 33, 850 · CEP 14780-192 · Barretos – SP · Brazil ·
        <a href="./legal-notice/">Legal Notice</a> ·
        <a href="mailto:betinsight.club@gmail.com">betinsight.club@gmail.com</a>
      </div>'''

if old_legal in html:
    html = html.replace(old_legal, new_legal, 1)
elif new_legal not in html:
    sys.exit("ERROR: expected Legal footer block not found.")

if old_notice in html:
    html = html.replace(old_notice, new_notice, 1)
elif new_notice not in html:
    sys.exit("ERROR: expected Legal Notice summary block not found.")

for forbidden in (
    'https://betinsight.systeme.io/agbs',
    'https://betinsight.systeme.io/datenschutz',
    'href="#impressum"',
):
    if forbidden in html:
        sys.exit(f"ERROR: old legal link remains: {forbidden}")

for required in (
    'href="./terms/"',
    'href="./privacy/"',
    'href="./legal-notice/"',
    'LucMedia LTDA',
):
    if required not in html:
        sys.exit(f"ERROR: required marker missing: {required}")

LANDING.write_text(html, encoding="utf-8")
print("OK: English footer now points to local legal pages.")
