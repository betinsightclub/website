from pathlib import Path
import sys

DE_CALCULATOR = Path("de/rechner/index.html")
EN_CALCULATOR = Path("en/rechner/index.html")
EN_LANDING = Path("en/index.html")

for path in (DE_CALCULATOR, EN_LANDING):
    if not path.exists():
        sys.exit(
            f"FEHLER: Pflichtdatei fehlt: {path}"
        )

source = DE_CALCULATOR.read_text(
    encoding="utf-8"
)

landing = EN_LANDING.read_text(
    encoding="utf-8"
)

required_source_markers = [
    'Version: 2026.08.19-02',
    '<html lang="de">',
    'BetInsight Kundenrechner',
    'id="startCapital"',
    'id="betTableBody"',
    'id="costTableBody"',
    'id="calculatorBackButton"',
    'id="calculatorRegisterButton"',
    'const REF_STORAGE_KEY = "betinsight_ref_code";',
]

for marker in required_source_markers:
    if marker not in source:
        sys.exit(
            "FEHLER: Deutscher Rechner "
            f"entspricht nicht dem erwarteten Stand: {marker}"
        )

english = source

replacements = [
    (
        "Version: 2026.08.19-02",
        "Version: 2026.08.20-EN-01",
    ),
    (
        "Beschreibung: Kundenrechner für Wettentwicklung und Paketverbrauch",
        "Description: Betting calculator for bankroll development and unit usage",
    ),
    (
        '<html lang="de">',
        '<html lang="en">',
    ),
    (
        'content="BetInsight Rechner zur unverbindlichen Simulation von Wettkapital und Unit-Verbrauch."',
        'content="BetInsight calculator for a non-binding simulation of betting bankroll development and unit usage."',
    ),
    (
        "<title>BetInsight Kundenrechner</title>",
        "<title>BetInsight Betting Calculator</title>",
    ),
    (
        "<h1>BetInsight Kundenrechner</h1>",
        "<h1>BetInsight Betting Calculator</h1>",
    ),
    (
        "Simuliere deine Wettentwicklung und sieh getrennt, wie viele Pakete und Units benötigt werden.",
        "Simulate your betting bankroll development and see separately how many packages and units are required.",
    ),
    (
        "Deine Einstellungen",
        "Your settings",
    ),
    (
        "Nur diese Felder können verändert werden. Alle Ergebnisse darunter sind schreibgeschützt.",
        "Only these fields can be changed. All results below are calculated automatically.",
    ),
    (
        "Stammkapital (mindestens 100 €)",
        "Starting bankroll (minimum €100)",
    ),
    (
        "Tippkosten / Einsatz",
        "Tip cost / stake",
    ),
    (
        "Durchschnittliche Quote",
        "Average odds",
    ),
    (
        "Trefferquote",
        "Hit rate",
    ),
    (
        "7 von 10",
        "7 of 10",
    ),
    (
        "8 von 10",
        "8 of 10",
    ),
    (
        "Unit-Paket",
        "Unit package",
    ),
    (
        "Anzahl der Wetten",
        "Number of bets",
    ),
    (
        "Gewinnverwendung",
        "Profit handling",
    ),
    (
        "Im Stammkapital lassen",
        "Keep profits in bankroll",
    ),
    (
        "Gewinne auszahlen",
        "Withdraw profits",
    ),
    (
        'aria-label="Gesamtergebnis"',
        'aria-label="Overall result"',
    ),
    (
        "Gesamtvermögen",
        "Total wealth",
    ),
    (
        "Wettkapital plus Sammel-Gewinnkonto",
        "Betting bankroll plus profit account",
    ),
    (
        "Aktuelles Wettkapital",
        "Current betting bankroll",
    ),
    (
        "Kapital nach allen gewählten Wetten",
        "Bankroll after all selected bets",
    ),
    (
        "Sammel-Gewinnkonto",
        "Profit account",
    ),
    (
        "Im aktuellen Modus nicht aktiv",
        "Inactive in current mode",
    ),
    (
        "Gesamte Paketausgaben",
        "Total package spending",
    ),
    (
        "Wettentwicklung",
        "Betting bankroll development",
    ),
    (
        "Ein Einsatz gilt für jede einzelne Wette des jeweiligen 10er-Blocks.",
        "One stake applies to each individual bet within each block of 10.",
    ),
    (
        "<th>Wetten</th>",
        "<th>Bets</th>",
    ),
    (
        "<th>Kapital vorher</th>",
        "<th>Bankroll before</th>",
    ),
    (
        "<th>Einsatz je Wette</th>",
        "<th>Stake per bet</th>",
    ),
    (
        "<th>Blockgewinn</th>",
        "<th>Block profit</th>",
    ),
    (
        "<th>Kapital danach</th>",
        "<th>Bankroll after</th>",
    ),
    (
        "<th>Sammel-Gewinn</th>",
        "<th>Profit account</th>",
    ),
    (
        "Gesamte Kapitaleinzahlungen",
        "Total bankroll deposits",
    ),
    (
        "Gewinne insgesamt",
        "Total betting profit",
    ),
    (
        "Wettkapital + Gewinne",
        "Bankroll + profits",
    ),
    (
        "Gewinn gegenüber Einzahlungen",
        "Profit versus deposits",
    ),
    (
        "Unit- und Ausgabenkonto",
        "Unit and package costs",
    ),
    (
        "Ein neues vollständiges Paket wird automatisch berücksichtigt, sobald die vorhandenen Units nicht reichen.",
        "A new full package is automatically included as soon as the available units are insufficient.",
    ),
    (
        "<th>Units verbraucht</th>",
        "<th>Units used</th>",
    ),
    (
        "<th>Pakete gekauft</th>",
        "<th>Packages purchased</th>",
    ),
    (
        "<th>Rest-Units</th>",
        "<th>Units remaining</th>",
    ),
    (
        "<th>Ausgaben gesamt</th>",
        "<th>Total spending</th>",
    ),
    (
        "Preis je Paket",
        "Price per package",
    ),
    (
        "Preis je Unit",
        "Price per unit",
    ),
    (
        "Pakete insgesamt",
        "Total packages",
    ),
    (
        "Ausgaben insgesamt",
        "Total spending",
    ),
    (
        "Units insgesamt gekauft",
        "Total units purchased",
    ),
    (
        "Units nach Simulation übrig",
        "Units remaining after simulation",
    ),
    (
        "Berechnung zurücksetzen",
        "Reset calculation",
    ),
    (
        "Möchtest du BetInsight selbst ausprobieren?",
        "Would you like to try BetInsight yourself?",
    ),
    (
        "Erstelle deinen kostenlosen BetInsight-Zugang und starte mit 5 kostenlosen Start-Units.",
        "Create your free BetInsight account and start with 5 free starter units.",
    ),
    (
        "← Zurück zu BetInsight",
        "← Back to BetInsight",
    ),
    (
        "Jetzt kostenlos mit 5 Start-Units testen",
        "Start free with 5 starter units",
    ),
    (
        "Hinweis: Dies ist eine mathematische Simulation und keine Gewinnzusage oder Wettberatung.",
        "Note: This is a mathematical simulation and not a guarantee of profit or betting advice.",
    ),
    (
        "Die Berechnung unterstellt in jedem 10er-Block genau die gewählte Trefferzahl und eine gleichbleibende Quote.",
        "The calculation assumes exactly the selected number of winning bets and constant odds in every block of 10.",
    ),
    (
        "Reale Ergebnisse, Quoten, Einsatzgrenzen und Risiken können deutlich abweichen. Glücksspiel kann süchtig machen.",
        "Actual results, odds, betting limits and risks can differ significantly. Gambling can be addictive.",
    ),
    (
        'new Intl.NumberFormat("de-DE"',
        'new Intl.NumberFormat("en-GB"',
    ),
    (
        'option.textContent = count + " Wetten";',
        'option.textContent = count + " bets";',
    ),
    (
        '"Bitte mindestens 100 € eintragen."',
        '"Please enter at least €100."',
    ),
    (
        'setText("payoutStatus", mode === "payout" ? "Angesammelter Betrag zur möglichen Auszahlung" : "Inactive in current mode");',
        'setText("payoutStatus", mode === "payout" ? "Accumulated amount available for possible withdrawal" : "Inactive in current mode");',
    ),
    (
        'setText("packageSummary", totalPackageCount + " × " + selectedPackage.name + "-Paket");',
        'setText("packageSummary", totalPackageCount + " × " + selectedPackage.name + " package");',
    ),
    (
        ">1,70<",
        ">1.70<",
    ),
    (
        ">1,80<",
        ">1.80<",
    ),
    (
        ">1,90<",
        ">1.90<",
    ),
    (
        ">2,00<",
        ">2.00<",
    ),
]

for old, new in replacements:
    if old not in english:
        sys.exit(
            "FEHLER: Übersetzungspunkt "
            f"nicht gefunden: {old}"
        )

    english = english.replace(
        old,
        new
    )

EN_CALCULATOR.parent.mkdir(
    parents=True,
    exist_ok=True
)

EN_CALCULATOR.write_text(
    english,
    encoding="utf-8"
)

# -------------------------------------------------
# Englische Landingpage auf englischen Rechner
# umstellen.
# -------------------------------------------------

old_calculator_link = 'href="../de/rechner/"'
new_calculator_link = 'href="../en/rechner/"'

link_count = landing.count(
    old_calculator_link
)

if link_count != 3:
    sys.exit(
        "FEHLER: Erwartet wurden genau "
        "3 englische Landingpage-Links "
        f"zum deutschen Rechner, gefunden: {link_count}"
    )

landing = landing.replace(
    old_calculator_link,
    new_calculator_link
)

landing = landing.replace(
    'aria-label="BetInsight Calculator öffnen"',
    'aria-label="Open BetInsight Calculator"'
)

landing = landing.replace(
    'alt="Vorschau des BetInsight Calculators mit mathematischer Beispielrechnung"',
    'alt="Preview of the BetInsight calculator with a mathematical example calculation"'
)

EN_LANDING.write_text(
    landing,
    encoding="utf-8"
)

# -------------------------------------------------
# Sicherheitsprüfung
# -------------------------------------------------

result = EN_CALCULATOR.read_text(
    encoding="utf-8"
)

landing_result = EN_LANDING.read_text(
    encoding="utf-8"
)

required_english_markers = [
    '<html lang="en">',
    "<title>BetInsight Betting Calculator</title>",
    "Your settings",
    "Starting bankroll",
    "Average odds",
    "Hit rate",
    "Betting bankroll development",
    "Unit and package costs",
    "Reset calculation",
    "Back to BetInsight",
    "Start free with 5 starter units",
    'new Intl.NumberFormat("en-GB"',
    'const REF_STORAGE_KEY = "betinsight_ref_code";',
]

for marker in required_english_markers:
    if marker not in result:
        sys.exit(
            "FEHLER: Englischer Prüfpunkt fehlt: "
            f"{marker}"
        )

for german_marker in [
    "BetInsight Kundenrechner",
    "Deine Einstellungen",
    "Stammkapital",
    "Gewinnverwendung",
    "Berechnung zurücksetzen",
    "Hinweis: Dies ist",
]:
    if german_marker in result:
        sys.exit(
            "FEHLER: Deutscher Resttext "
            f"im englischen Rechner gefunden: {german_marker}"
        )

if '../de/rechner/' in landing_result:
    sys.exit(
        "FEHLER: Englische Landingpage "
        "enthält noch einen deutschen Rechnerlink."
    )

if landing_result.count(
    'href="../en/rechner/"'
) != 3:
    sys.exit(
        "FEHLER: Englische Landingpage "
        "enthält nicht genau 3 Links "
        "zum englischen Rechner."
    )

print(
    "OK: Englischer Rechner wurde erstellt "
    "und die englische Landingpage angepasst."
)
