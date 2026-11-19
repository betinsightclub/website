/* Central language loader; existing pages remain unchanged until explicitly migrated. */
const base = new URL('./', import.meta.url);
async function json(path) { const r = await fetch(new URL(path,base)); if(!r.ok) throw new Error('i18n HTTP '+r.status); return r.json(); }
export async function initI18n(root=document) {
 const registry=await json('languages.json');
 const codes=registry.languages.map(x=>x.code);
 const normalize=v=>{const s=String(v||'').toLowerCase().replaceAll('_','-');return codes.includes(s)?s:s.startsWith('zh')&&codes.includes('zh-tw')?'zh-tw':codes.includes(s.split('-')[0])?s.split('-')[0]:null};
 let stored;try{stored=localStorage.getItem('betinsight_language')}catch{}
 const lang=normalize(new URL(location.href).searchParams.get('lang'))||normalize(stored)||normalize(document.documentElement.lang)||registry.default;
 const fallback=await json('locales/'+registry.default+'.json');
 const current=lang===registry.default?fallback:await json('locales/'+lang+'.json');
 const t=key=>current[key]??fallback[key]??key;
 root.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n)});
 document.documentElement.lang=lang;
 document.documentElement.dir=registry.languages.find(x=>x.code===lang)?.dir||'ltr';
 return {lang,t,languages:registry.languages};
}
