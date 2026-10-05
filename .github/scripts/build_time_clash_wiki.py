#!/usr/bin/env python3
import html, json, pathlib, urllib.request, xml.sax.saxutils as xu
from datetime import datetime, timezone

ROOT=pathlib.Path(__file__).resolve().parents[2]
API="https://lszlaglwlixejzytrurg.supabase.co/functions/v1/time-clash-wiki"
OUT=ROOT/"de"/"wiki"/"time-clash"
GA="G-044T64X2HD"

def fetch():
    req=urllib.request.Request(API,headers={"User-Agent":"BetInsight-Wiki-Builder/1.0"})
    with urllib.request.urlopen(req,timeout=30) as r:
        return json.load(r)

def e(v): return html.escape(str(v or ""),quote=True)
def d(v):
    try: return datetime.fromisoformat(str(v).replace("Z","+00:00")).strftime("%d.%m.%Y")
    except: return str(v)[:10]
def iso(v): return str(v or "")[:10]

STYLE="""<style>:root{--bg:#031720;--bg2:#020f16;--line:rgba(126,211,255,.18);--text:#f5fbff;--muted:#aac0cc;--blue:#1687ff;--green:#00d99b;--gold:#f7c950;--max:1120px}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 12% 0,rgba(22,135,255,.15),transparent 30rem),var(--bg);color:var(--text);font-family:Inter,system-ui,sans-serif;line-height:1.65}a{color:inherit}.wrap{width:min(calc(100% - 32px),var(--max));margin:auto}header{border-bottom:1px solid rgba(255,255,255,.08)}.top{min-height:76px;display:flex;align-items:center;justify-content:space-between;gap:15px}.logo{width:175px}.back,.btn{display:inline-flex;text-decoration:none;border:1px solid var(--line);border-radius:12px;padding:10px 14px;font-weight:850}.btn.primary{background:linear-gradient(135deg,#1687ff,#0a69d8);border-color:transparent}.hero{padding:70px 0 34px}.ey{color:var(--green);font-size:12px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.hero h1{font-size:clamp(38px,6vw,64px);line-height:1.04;margin:10px 0 14px}.lead{max-width:880px;color:#c9dce5;font-size:19px}.chips,.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:20px}.chip{padding:7px 10px;border:1px solid var(--line);border-radius:999px;color:#b8cdd7;font-size:12px;font-weight:800}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.stat,.card,.paircard{border:1px solid var(--line);border-radius:20px;background:linear-gradient(180deg,rgba(10,43,59,.96),rgba(6,31,43,.96));padding:22px}.stat b{display:block;font-size:30px}.stat span,.meta{color:var(--muted);font-size:13px}.section{padding:28px 0}.section h2{font-size:clamp(27px,4vw,40px);margin:0 0 18px}.variant{display:grid;grid-template-columns:110px 1fr;gap:18px;align-items:center;margin:12px 0}.variant strong{font-size:22px;color:var(--gold)}.pairgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.paircard h2{font-size:23px;margin:9px 0}.paircard p{color:var(--muted)}table{width:100%;border-collapse:collapse}.tablewrap{overflow:auto;border:1px solid var(--line);border-radius:18px}th,td{padding:12px 13px;border-bottom:1px solid rgba(255,255,255,.07);text-align:left;white-space:nowrap}th{color:#a8c3d0;font-size:11px;text-transform:uppercase;background:#061c28}.notice{padding:17px 19px;border-left:4px solid var(--gold);background:rgba(247,201,80,.065);border-radius:12px;color:#ddd5b9;font-size:13px}footer{margin-top:45px;padding:30px 0;border-top:1px solid rgba(255,255,255,.08);color:#829aa6;background:var(--bg2)}@media(max-width:800px){.grid{grid-template-columns:1fr 1fr}.pairgrid{grid-template-columns:1fr}.variant{grid-template-columns:1fr}}@media(max-width:540px){.grid{grid-template-columns:1fr}}</style>"""

def head(title,desc,url,kind="article",published=None,modified=None):
    schema={"@context":"https://schema.org","@type":"Article" if kind=="article" else "CollectionPage","name":title,"headline":title,"description":desc,"url":url,"inLanguage":"de"}
    if published: schema["datePublished"]=published
    if modified: schema["dateModified"]=modified
    return f"""<script async src="https://www.googletagmanager.com/gtag/js?id={GA}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments)}}gtag('js',new Date());gtag('config','{GA}');</script>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1"><link rel="icon" href="/favicon.ico"><title>{e(title)}</title><meta name="description" content="{e(desc)}"><link rel="canonical" href="{e(url)}"><link rel="alternate" hreflang="de" href="{e(url)}"><link rel="alternate" hreflang="x-default" href="{e(url)}"><meta property="og:type" content="{kind}"><meta property="og:site_name" content="BetInsight Club"><meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}"><meta property="og:url" content="{e(url)}"><meta property="og:image" content="https://betinsight.club/assets/hero-fussball-dunkel.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="https://betinsight.club/assets/hero-fussball-dunkel.png"><script type="application/ld+json">{json.dumps(schema,ensure_ascii=False)}</script>{STYLE}"""

def detail(p):
    a,b=p["team_left"],p["team_right"]
    url=f'https://betinsight.club/de/wiki/time-clash/{p["pair_slug"]}/'
    title=f"{a} vs. {b} – Was wäre wenn? | BetInsight Football Wiki"
    desc=f"Was wäre, wenn {a} gegen {b} gespielt hätte? Aggregierte TIME-CLASH-Simulationen, Serienvarianten, Tore, Siege und Originalberichte."
    variants="".join(f'<div class="card variant"><strong>{v["series_length"]} Spiel{"e" if v["series_length"]!=1 else ""}</strong><div><b>{v["series_count"]} vollständige Serie{"n" if v["series_count"]!=1 else ""}</b><div class="meta">Seriensiege: {e(a)} {v["series_wins_left"]} · {e(b)} {v["series_wins_right"]} · Einzelspiele {v["game_wins_left"]}:{v["game_wins_right"]}, {v["game_draws"]} Remis · Tore {v["goals_left"]}:{v["goals_right"]}</div></div></div>' for v in p["variants"])
    runs="".join(f'<tr><td>{d(r["played_at"])}</td><td>{r["series_length"]}</td><td>{e(r.get("winner") or "–")}</td><td>{r["game_wins_left"]}:{r["game_wins_right"]} ({r["game_draws"]} Remis)</td><td>{r["goals_left"]}:{r["goals_right"]}</td><td><a href="{e(r["old_report_url"])}">Originalbericht ansehen</a></td></tr>' for r in reversed(p["runs"]))
    lengths=" / ".join(str(v["series_length"]) for v in p["variants"])
    return f'''<!doctype html><html lang="de"><head>{head(title,desc,url,"article",iso(p["first_played_at"]),iso(p["last_played_at"]))}</head><body><header><div class="wrap top"><a href="/de/"><img class="logo" src="/assets/betinsight-logo.png" alt="BetInsight.club"></a><a class="back" href="/de/wiki/time-clash/">← Konstellationsübersicht</a></div></header><main><section class="hero"><div class="wrap"><div class="ey">BetInsight Football Wiki · TIME CLASH</div><h1>{e(a)}<br>vs. {e(b)}</h1><p class="lead">Was wäre, wenn diese beiden Mannschaften aufeinandergetroffen wären? Diese Wiki-Seite bündelt alle vollständig gespeicherten TIME-CLASH-Serien dieser Konstellation. Neue Durchgänge derselben Paarung werden automatisch hinzugezählt.</p><div class="chips"><span class="chip">{p["total_series"]} Serien</span><span class="chip">{p["total_games"]} Einzelspiele</span><span class="chip">Erstmals {d(p["first_played_at"])}</span><span class="chip">Zuletzt {d(p["last_played_at"])}</span></div></div></section><section class="section"><div class="wrap"><div class="grid"><div class="stat"><b>{p["total_series"]}</b><span>vollständige Serien</span></div><div class="stat"><b>{p["total_games"]}</b><span>simulierte Einzelspiele</span></div><div class="stat"><b>{p["series_wins_left"]}:{p["series_wins_right"]}</b><span>Seriensiege</span></div><div class="stat"><b>{p["game_wins_left"]}:{p["game_wins_right"]}</b><span>Einzelspielsiege · {p["game_draws"]} Remis</span></div><div class="stat"><b>{p["goals_left"]}:{p["goals_right"]}</b><span>Gesamttore</span></div><div class="stat"><b>{e(lengths)}</b><span>bisher gespielte Serienlängen</span></div></div></div></section><section class="section"><div class="wrap"><h2>Varianten dieser Konstellation</h2><p class="lead">1-, 3-, 5- und 10-Spiele-Durchgänge werden getrennt ausgewertet und gleichzeitig in der Gesamtbilanz zusammengeführt.</p>{variants}</div></section><section class="section"><div class="wrap"><h2>Bisherige vollständige Durchgänge</h2><div class="tablewrap"><table><thead><tr><th>Datum</th><th>Spiele</th><th>Seriensieger</th><th>Einzelspielbilanz</th><th>Tore</th><th>Bestehender Bericht</th></tr></thead><tbody>{runs}</tbody></table></div><div class="actions"><a class="btn primary" href="/de/time-clash/">Dieses Duell in TIME CLASH spielen</a><a class="btn" href="/de/time-clash/community/">Bisherige Berichte</a></div></div></section><section class="section"><div class="wrap"><div class="notice"><strong>Erweiterung, kein Ersatz:</strong> Die detaillierten TIME-CLASH-Berichte bleiben unverändert erhalten. Diese Wiki-Seite ergänzt sie um die zusammengefasste Konstellationsstatistik. Trainerprofile und Community-Clubs werden nicht in die Football-Wiki aufgenommen. TIME CLASH ist eine fiktive Unterhaltungssimulation und keine Prognose eines realen Spiels.</div></div></section></main><footer><div class="wrap">© 2026 BetInsight.club / LucMedia LTDA. · Football Wiki</div></footer><script src="https://betinsight.club/assets/footer-social.js?v=20261003-2" defer></script></body></html>'''

def overview(pairs,total):
    cards="".join(f'<article class="paircard"><div class="ey">Was wäre wenn?</div><h2><a href="{e(p["pair_slug"])}/">{e(p["team_left"])} vs. {e(p["team_right"])}</a></h2><p>{p["total_series"]} Serien · {p["total_games"]} Einzelspiele · Tore {p["goals_left"]}:{p["goals_right"]}</p><div class="meta">Seriensiege {p["series_wins_left"]}:{p["series_wins_right"]} · zuletzt {d(p["last_played_at"])}</div><div class="actions"><a class="btn primary" href="{e(p["pair_slug"])}/">Wiki-Bericht öffnen</a></div></article>' for p in pairs)
    url="https://betinsight.club/de/wiki/time-clash/"
    title="TIME CLASH Wiki – Historische Fußball-Duelle & Simulationen | BetInsight"
    desc="Was-wäre-wenn-Duelle historischer und realer Fußballmannschaften, aggregierte TIME-CLASH-Simulationen und bestehende Einzelberichte."
    return f'''<!doctype html><html lang="de"><head>{head(title,desc,url,"website")}</head><body><header><div class="wrap top"><a href="/de/"><img class="logo" src="/assets/betinsight-logo.png" alt="BetInsight.club"></a><a class="back" href="/de/wiki/">← Football Wiki</a></div></header><main><section class="hero"><div class="wrap"><div class="ey">BetInsight Football Wiki</div><h1>Was wäre, wenn Fußballgeschichte anders gelaufen wäre?</h1><p class="lead">Vollständig gespielte TIME-CLASH-Duelle realer oder historischer Mannschaften werden hier automatisch zusammengeführt. Trainerprofile und Community-Clubs erscheinen nicht in dieser Wiki.</p><div class="chips"><span class="chip">{len(pairs)} Konstellationen</span><span class="chip">{total} vollständige Serien</span><span class="chip">Varianten 1 · 3 · 5 · 10 Spiele</span></div></div></section><section class="section"><div class="wrap"><div class="pairgrid">{cards}</div></div></section><section class="section"><div class="wrap"><div class="notice">Die Wiki ergänzt die bereits vorhandenen Begegnungsberichte. Jeder bisherige Detailbericht bleibt über seine Konstellationsseite erreichbar.</div></div></section></main><footer><div class="wrap">© 2026 BetInsight.club / LucMedia LTDA. · Football Wiki</div></footer><script src="https://betinsight.club/assets/footer-social.js?v=20261003-2" defer></script></body></html>'''

def wiki_home(pair_count,total):
    p=ROOT/"de"/"wiki"/"index.html"
    if not p.exists(): return
    txt=p.read_text(encoding="utf-8")
    import re
    txt=re.sub(r'<h2>\d+</h2><p>Bereits vorhandene reale/historische Paarungen',f'<h2>{pair_count}</h2><p>Bereits vorhandene reale/historische Paarungen',txt,1)
    txt=re.sub(r'<h2>\d+</h2><p>Vollständig gespeicherte Serien',f'<h2>{total}</h2><p>Vollständig gespeicherte Serien',txt,1)
    p.write_text(txt,encoding="utf-8")

def sitemap(pairs):
    p=ROOT/"sitemap.xml";txt=p.read_text(encoding="utf-8")
    a="<!-- TIME CLASH WIKI AUTO START -->";b="<!-- TIME CLASH WIKI AUTO END -->"
    if a in txt and b in txt: txt=txt[:txt.index(a)]+txt[txt.index(b)+len(b):]
    urls=[("https://betinsight.club/de/wiki/",datetime.now(timezone.utc).date().isoformat()),("https://betinsight.club/de/wiki/time-clash/",datetime.now(timezone.utc).date().isoformat())]
    urls += [(f'https://betinsight.club/de/wiki/time-clash/{x["pair_slug"]}/',iso(x["last_played_at"])) for x in pairs]
    block=a+"\n"+"\n".join(f'  <url><loc>{xu.escape(u)}</loc><lastmod>{lm}</lastmod><xhtml:link rel="alternate" hreflang="de" href="{xu.escape(u)}" /><xhtml:link rel="alternate" hreflang="x-default" href="{xu.escape(u)}" /></url>' for u,lm in urls)+"\n"+b
    txt=txt.replace("</urlset>",block+"\n</urlset>")
    p.write_text(txt,encoding="utf-8")

def main():
    data=fetch(); pairs=data.get("pairs",[])
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"index.html").write_text(overview(pairs,data.get("total_real_series",0)),encoding="utf-8")
    for p in pairs:
        dest=OUT/p["pair_slug"];dest.mkdir(parents=True,exist_ok=True)
        (dest/"index.html").write_text(detail(p),encoding="utf-8")
    wiki_home(len(pairs),data.get("total_real_series",0))
    sitemap(pairs)
    print(f'Built {len(pairs)} TIME CLASH wiki pairings from {data.get("total_real_series",0)} completed real-team series.')

if __name__=="__main__": main()
