from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[2]
SITE = "https://betinsight.club"
OG_IMAGE = f"{SITE}/assets/hero-fussball-dunkel.png"
SEO_START = "<!-- BETINSIGHT PUBLIC SEO START -->"
SEO_END = "<!-- BETINSIGHT PUBLIC SEO END -->"
NOINDEX_START = "<!-- BETINSIGHT UTILITY NOINDEX START -->"
NOINDEX_END = "<!-- BETINSIGHT UTILITY NOINDEX END -->"


def remove_block(text: str, start: str, end: str) -> str:
    return re.sub(re.escape(start) + r".*?" + re.escape(end), "", text, flags=re.S)


def remove_robots(text: str) -> str:
    return re.sub(r'\s*<meta\s+name=["\']robots["\']\s+content=["\'][^"\']*["\']\s*/?>', "", text, flags=re.I)


def public_seo(path: str, canonical: str, title: str, description: str) -> None:
    file = ROOT / path
    text = file.read_text(encoding="utf-8")
    text = remove_block(text, SEO_START, SEO_END)
    text = remove_robots(text)

    schema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": canonical + "#webpage",
        "url": canonical,
        "name": title,
        "description": description,
        "inLanguage": "de",
        "isPartOf": {"@id": f"{SITE}/#website"},
        "about": {"@id": f"{SITE}/#organization"},
    }

    block = "\n".join([
        SEO_START,
        '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">',
        f'<link rel="canonical" href="{canonical}">',
        f'<link rel="alternate" hreflang="de" href="{canonical}">',
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="BetInsight Club">',
        '<meta property="og:locale" content="de_DE">',
        f'<meta property="og:title" content="{title}">',
        f'<meta property="og:description" content="{description}">',
        f'<meta property="og:url" content="{canonical}">',
        f'<meta property="og:image" content="{OG_IMAGE}">',
        '<meta property="og:image:alt" content="BetInsight Club">',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{title}">',
        f'<meta name="twitter:description" content="{description}">',
        f'<meta name="twitter:image" content="{OG_IMAGE}">',
        '<script type="application/ld+json">' + json.dumps(schema, ensure_ascii=False, separators=(",", ":")) + '</script>',
        SEO_END,
    ])

    if "</title>" not in text:
        raise RuntimeError(f"Kein </title> in {path}")
    text = text.replace("</title>", "</title>\n\n" + block + "\n", 1)
    file.write_text(text, encoding="utf-8")


def utility_noindex(path: str, follow: bool = False) -> None:
    file = ROOT / path
    text = file.read_text(encoding="utf-8")
    text = remove_block(text, NOINDEX_START, NOINDEX_END)
    text = remove_robots(text)
    directive = "noindex,follow,noarchive" if follow else "noindex,nofollow,noarchive,nosnippet"
    block = f'{NOINDEX_START}\n<meta name="robots" content="{directive}">\n{NOINDEX_END}'
    if "</title>" in text:
        text = text.replace("</title>", "</title>\n" + block, 1)
    elif "<head>" in text:
        text = text.replace("<head>", "<head>\n" + block, 1)
    else:
        raise RuntimeError(f"Kein Head/Title in {path}")
    file.write_text(text, encoding="utf-8")


public_seo(
    "de/webinar/index.html",
    f"{SITE}/de/webinar/",
    "BetInsight Webinar – Live teilnehmen oder Aufzeichnung ansehen",
    "Lerne BetInsight im Webinar kennen: live teilnehmen oder die Aufzeichnung ansehen und das Konzept, die Plattform und das Unit-System Schritt für Schritt verstehen.",
)

public_seo(
    "de/termin/index.html",
    f"{SITE}/de/termin/",
    "Persönlicher BetInsight Termin – Gespräch mit dem Founder",
    "Buche einen freigegebenen 50-minütigen Video-Termin für ein persönliches Gespräch mit dem Founder von BetInsight.",
)

# Funnel-, Bestätigungs- und technische Seiten sollen keine eigenständigen Google-Treffer werden.
utility_noindex("de/webinar/live/index.html", follow=True)
utility_noindex("de/webinar/aufzeichnung/index.html", follow=True)
utility_noindex("de/webinar/ansehen/index.html")
utility_noindex("de/termin/bestaetigt/index.html")
utility_noindex("webinar/index.html")
utility_noindex("ref/index.html")
utility_noindex("tombula/index.html")
utility_noindex("tombula/teilnehmen/index.html")

# Die zwei starken öffentlichen Seiten in die bestehende Sitemap aufnehmen.
sitemap = ROOT / "sitemap.xml"
xml = sitemap.read_text(encoding="utf-8")
entries = [
    (f"{SITE}/de/webinar/", "de"),
    (f"{SITE}/de/termin/", "de"),
]
for url, lang in entries:
    if f"<loc>{url}</loc>" in xml:
        continue
    item = (
        "  <url>\n"
        f"    <loc>{url}</loc>\n"
        "    <lastmod>2026-09-12</lastmod>\n"
        f"    <xhtml:link rel=\"alternate\" hreflang=\"{lang}\" href=\"{url}\" />\n"
        "  </url>\n"
    )
    xml = xml.replace("</urlset>", item + "</urlset>")
sitemap.write_text(xml, encoding="utf-8")

print("Öffentliche Marketing-SEO-Seiten aktualisiert.")
