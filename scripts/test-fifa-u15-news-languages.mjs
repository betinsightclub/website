import fs from 'node:fs';import assert from 'node:assert/strict';
const langs=[['de','de-DE'],['en','en-GB'],['es','es-ES'],['pt','pt-BR'],['it','it-IT'],['fr','fr-FR'],['nl','nl-NL'],['zh-tw','zh-Hant'],['zh','zh-Hans']];
const slug='fifa-u15-wm-2026-ohne-deutschland-time-clash';
const url=c=>'https://betinsight.club/'+c+'/newsradar/'+slug+'/';
const sitemap=fs.readFileSync('sitemap.xml','utf8');
for(const [lang,loc] of langs){
  const path=lang+'/newsradar/'+slug+'/index.html';
  assert.ok(fs.existsSync(path),'Missing article: '+path);
  const html=fs.readFileSync(path,'utf8');
  assert.ok(html.includes('<html lang="'+loc+'"') || (lang==='de'&&html.includes('<html lang="de"')),lang+' HTML language');
  assert.ok(html.includes('<link rel="canonical" href="'+url(lang)+'">'),lang+' canonical');
  for(const [alt,altLocale] of langs){
    assert.ok(html.includes('hreflang="'+altLocale+'" href="'+url(alt)+'"'),lang+' missing alternate '+alt);
    assert.ok(html.includes('href="'+url(alt)+'"'),lang+' missing language navigation '+alt);
  }
  assert.ok(html.includes('name="description"'),lang+' description');
  assert.ok(html.includes('application/ld+json'),lang+' JSON-LD schema');
  assert.ok(html.includes('189')&&html.includes('190')&&html.includes('191'),lang+' nuanced sources');
  assert.ok(html.includes('23')&&html.includes('49'),lang+' TIME CLASH counts');
  assert.ok(html.includes('fifa.com')&&html.includes('www.mopo.de'),lang+' first party editorial sources');
  assert.ok(sitemap.includes('<loc>'+url(lang)+'</loc>'),lang+' sitemap');
  if(lang!=='de')assert.ok((html.match(/<section><h2>/g)||[]).length>=6,lang+' missing translated substantive sections');
}
const index=fs.readFileSync('de/newsradar/index.html','utf8');
assert.ok(index.includes('/de/newsradar/'+slug+'/'),'NewsRadar hub must link article');
console.log('PASS nine indexed and cross-linked FIFA U15 NewsRadar language versions: de,en,es,pt,it,fr,nl,zh-tw,zh.');
