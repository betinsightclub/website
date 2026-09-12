from pathlib import Path
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
SEO_START = "<!-- BETINSIGHT SEO START -->"
SEO_END = "<!-- BETINSIGHT SEO END -->"
SITE = "https://betinsight.club"
OG_IMAGE = f"{SITE}/assets/hero-fussball-dunkel.png"
LOGO = f"{SITE}/assets/betinsight-logo.png"
YOUTUBE = "https://www.youtube.com/@betinsightclub"
TELEGRAM = "https://t.me/betinsightclub_official"


def clean_existing(text: str) -> str:
    pattern = re.compile(re.escape(SEO_START) + r".*?" + re.escape(SEO_END), re.S)
    return pattern.sub("", text)


def inject(path: str, block: str, remove_noindex: bool = False) -> None:
    file = ROOT / path
    text = file.read_text(encoding="utf-8")
    text = clean_existing(text)
    if remove_noindex:
        text = re.sub(r'\s*<meta\s+name=["\']robots["\']\s+content=["\']noindex(?:,[^"\']*)?["\']\s*/?>', "", text, flags=re.I)
    if "</title>" not in text:
        raise RuntimeError(f"Kein </title> in {path}")
    text = text.replace("</title>", "</title>\n\n" + block.strip() + "\n", 1)
    file.write_text(text, encoding="utf-8")


def schema_block(page_url: str, language: str, page_name: str, description: str, include_site_graph: bool = False) -> str:
    graph = []
    if include_site_graph:
        graph.extend([
            {
                "@type": "Organization",
                "@id": f"{SITE}/#organization",
                "name": "BetInsight Club",
                "alternateName": "BetInsight",
                "url": f"{SITE}/",
                "logo": {"@type": "ImageObject", "url": LOGO},
                "sameAs": [YOUTUBE, TELEGRAM],
            },
            {
                "@type": "WebSite",
                "@id": f"{SITE}/#website",
                "url": f"{SITE}/",
                "name": "BetInsight Club",
                "publisher": {"@id": f"{SITE}/#organization"},
                "inLanguage": ["de", "en"],
            },
        ])
    graph.append({
        "@type": "WebPage",
        "@id": page_url + "#webpage",
        "url": page_url,
        "name": page_name,
        "description": description,
        "inLanguage": language,
        "isPartOf": {"@id": f"{SITE}/#website"},
        "about": {"@id": f"{SITE}/#organization"},
    })
    data = {"@context": "https://schema.org", "@graph": graph}
    return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + '</script>'


def seo_block(*, canonical: str, title: str, description: str, language: str, alternates=None, x_default=None, schema=False, site_graph=False) -> str:
    locale = "de_DE" if language == "de" else "en_US"
    alt_locale = "en_US" if language == "de" else "de_DE"
    lines = [
        SEO_START,
        '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">',
        f'<link rel="canonical" href="{canonical}">',
    ]
    for hreflang, href in (alternates or []):
        lines.append(f'<link rel="alternate" hreflang="{hreflang}" href="{href}">')
    if x_default:
        lines.append(f'<link rel="alternate" hreflang="x-default" href="{x_default}">')
    lines.extend([
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="BetInsight Club">',
        f'<meta property="og:locale" content="{locale}">',
        f'<meta property="og:locale:alternate" content="{alt_locale}">',
        f'<meta property="og:title" content="{title}">',
        f'<meta property="og:description" content="{description}">',
        f'<meta property="og:url" content="{canonical}">',
        f'<meta property="og:image" content="{OG_IMAGE}">',
        '<meta property="og:image:alt" content="BetInsight Club – Sportanalysen mit System">',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{title}">',
        f'<meta name="twitter:description" content="{description}">',
        f'<meta name="twitter:image" content="{OG_IMAGE}">',
    ])
    if schema:
        lines.append(schema_block(canonical, language, title, description, include_site_graph=site_graph))
    lines.append(SEO_END)
    return "\n".join(lines)


# Root / x-default: indexierbar, aber bestehende Sprachweiterleitung bleibt funktional unverändert.
root_desc = "BetInsight Club bietet strukturierte Sportanalysen, klare Unit-Gewichtungen und Werkzeuge für kontrolliertes Bankroll-Management."
root_block = seo_block(
    canonical=f"{SITE}/",
    title="BetInsight Club – Sportanalysen mit System",
    description=root_desc,
    language="de",
    alternates=[("de", f"{SITE}/de/"), ("en", f"{SITE}/en/")],
    x_default=f"{SITE}/",
    schema=True,
    site_graph=True,
)
inject("index.html", root_block, remove_noindex=True)

# Haupt-Landingpages
pages = [
    (
        "de/index.html", "de", f"{SITE}/de/", "BetInsight.club – Sportanalysen mit System",
        "BetInsight ist eine Mitgliederplattform für strukturierte Sportanalysen, klare Unit-Gewichtungen und kontrolliertes Bankroll-Management.",
        [("de", f"{SITE}/de/"), ("en", f"{SITE}/en/")], f"{SITE}/", True,
    ),
    (
        "en/index.html", "en", f"{SITE}/en/", "BetInsight.club – Structured Sports Analysis",
        "BetInsight is a membership platform for structured sports analysis, clear unit weighting and controlled bankroll management.",
        [("de", f"{SITE}/de/"), ("en", f"{SITE}/en/")], f"{SITE}/", True,
    ),
    (
        "de/rechner/index.html", "de", f"{SITE}/de/rechner/", "BetInsight Kundenrechner",
        "BetInsight Rechner zur unverbindlichen Simulation von Wettkapital und Unit-Verbrauch.",
        [("de", f"{SITE}/de/rechner/"), ("en", f"{SITE}/en/rechner/")], None, False,
    ),
    (
        "en/rechner/index.html", "en", f"{SITE}/en/rechner/", "BetInsight Betting Calculator",
        "BetInsight calculator for a non-binding simulation of betting bankroll development and unit usage.",
        [("de", f"{SITE}/de/rechner/"), ("en", f"{SITE}/en/rechner/")], None, False,
    ),
    (
        "de/academy/index.html", "de", f"{SITE}/de/academy/", "BetInsight Academy – Erste Schritte",
        "BetInsight Academy – kurze Video- und PDF-Anleitungen für Registrierung und erste Schritte.",
        [("de", f"{SITE}/de/academy/")], None, False,
    ),
]

for path, language, canonical, title, description, alternates, x_default, site_graph in pages:
    inject(path, seo_block(
        canonical=canonical,
        title=title,
        description=description,
        language=language,
        alternates=alternates,
        x_default=x_default,
        schema=True,
        site_graph=site_graph,
    ))

# Rechtliche Sprachpaare: Canonical + hreflang, aber bewusst nicht in die SEO-Kern-Sitemap priorisiert.
legal_pairs = [
    ("de/agb/index.html", "de", f"{SITE}/de/agb/", "BetInsight AGB", f"{SITE}/en/terms/"),
    ("en/terms/index.html", "en", f"{SITE}/en/terms/", "BetInsight Terms", f"{SITE}/de/agb/"),
    ("de/datenschutz/index.html", "de", f"{SITE}/de/datenschutz/", "BetInsight Datenschutz", f"{SITE}/en/privacy/"),
    ("en/privacy/index.html", "en", f"{SITE}/en/privacy/", "BetInsight Privacy", f"{SITE}/de/datenschutz/"),
    ("de/impressum/index.html", "de", f"{SITE}/de/impressum/", "BetInsight Impressum", f"{SITE}/en/legal-notice/"),
    ("en/legal-notice/index.html", "en", f"{SITE}/en/legal-notice/", "BetInsight Legal Notice", f"{SITE}/de/impressum/"),
]
for path, language, canonical, title, other in legal_pairs:
    other_lang = "en" if language == "de" else "de"
    description = "Rechtliche Informationen zu BetInsight Club." if language == "de" else "Legal information for BetInsight Club."
    inject(path, seo_block(
        canonical=canonical,
        title=title,
        description=description,
        language=language,
        alternates=[(language, canonical), (other_lang, other)],
        schema=False,
    ))

robots = """User-agent: *
Allow: /

Sitemap: https://betinsight.club/sitemap.xml
"""
(ROOT / "robots.txt").write_text(robots, encoding="utf-8")

# XML Sitemap mit Sprachalternativen für die aktuell tatsächlich veröffentlichten Kernseiten.
urls = [
    (f"{SITE}/", [("de", f"{SITE}/de/"), ("en", f"{SITE}/en/"), ("x-default", f"{SITE}/")]),
    (f"{SITE}/de/", [("de", f"{SITE}/de/"), ("en", f"{SITE}/en/"), ("x-default", f"{SITE}/")]),
    (f"{SITE}/en/", [("de", f"{SITE}/de/"), ("en", f"{SITE}/en/"), ("x-default", f"{SITE}/")]),
    (f"{SITE}/de/rechner/", [("de", f"{SITE}/de/rechner/"), ("en", f"{SITE}/en/rechner/")]),
    (f"{SITE}/en/rechner/", [("de", f"{SITE}/de/rechner/"), ("en", f"{SITE}/en/rechner/")]),
    (f"{SITE}/de/academy/", [("de", f"{SITE}/de/academy/")]),
]
xml_lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
]
for loc, alternates in urls:
    xml_lines.append("  <url>")
    xml_lines.append(f"    <loc>{loc}</loc>")
    xml_lines.append("    <lastmod>2026-09-12</lastmod>")
    for hreflang, href in alternates:
        xml_lines.append(f'    <xhtml:link rel="alternate" hreflang="{hreflang}" href="{href}" />')
    xml_lines.append("  </url>")
xml_lines.append("</urlset>")
(ROOT / "sitemap.xml").write_text("\n".join(xml_lines) + "\n", encoding="utf-8")
ET.parse(ROOT / "sitemap.xml")

# Search Console: kein erfundener Verifizierungscode. Datei dokumentiert nur den vorbereiteten Zustand.
(ROOT / "SEARCH-CONSOLE-READY.md").write_text(
    "# Google Search Console – BetInsight\n\n"
    "Die technische Website-Basis ist vorbereitet. Für die Verifizierung wird noch der echte Google-Verifizierungscode benötigt.\n\n"
    "Nach Verifizierung einreichen: `https://betinsight.club/sitemap.xml`.\n"
    "Primäre URLs für die URL-Prüfung: `https://betinsight.club/de/` und `https://betinsight.club/en/`.\n",
    encoding="utf-8",
)

print("SEO-Basis für betinsight.club vorbereitet.")
