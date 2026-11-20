import { initI18n } from '../i18n/runtime.js';
const form=document.querySelector('#application'), fields=document.querySelector('#fields'), language=document.querySelector('#language'), result=document.querySelector('#result'), historyField=document.querySelector('#history'), noHistory=document.querySelector('#noHistory'), sports=[...form.querySelectorAll('[name=sports]')];
let i18n, validated=false;
function syncSports(){sports[0].required=!sports.some(x=>x.checked)}
function syncHistory(){historyField.disabled=noHistory.checked;historyField.required=!noHistory.checked}
function syncLinks(){const url=new URL('/',location.href);url.searchParams.set('lang',i18n.lang);for(const id of ['home','back'])document.getElementById(id).href=url.href;}
function apply(){document.title='BetInsight – '+i18n.t('tipster.title');language.setAttribute('aria-label',i18n.t('tipster.languageLabel'));syncLinks();if(validated)result.textContent=i18n.t('tipster.done')}
sports.forEach(x=>x.addEventListener('change',syncSports));noHistory.addEventListener('change',syncHistory);
form.addEventListener('input',()=>{validated=false;result.textContent='';document.querySelector('#draftBox').hidden=true;document.querySelector('#draft').value=''});
form.addEventListener('submit',e=>{
 e.preventDefault();syncSports();if(!form.reportValidity())return;
 const d=new FormData(form), t=k=>i18n.t('tipster.'+k);
 const value=k=>String(d.get(k)||'').trim();
 const lines=['BetInsight – Tipster application', 'Form locale: '+i18n.lang, ...['name','alias','email','country','contactLanguage','languages','experience','frequency'].map(k=>t(k)+': '+value(k)),t('sports')+': '+d.getAll('sports').map(k=>t(k)).join(', '),t('history')+': '+(noHistory.checked?t('noHistory'):value('history')),t('profile')+': '+value('profile'),t('message')+': '+value('message'),t('confirm'),t('privacyAck')];
 const body=lines.join('\r\n');validated=true;result.textContent=t('done');document.querySelector('#draft').value=body;document.querySelector('#draftBox').hidden=false;
 const url='mailto:betinsight.club@gmail.com?subject='+encodeURIComponent('BetInsight – Tipster application')+'&body='+encodeURIComponent(body);
 if(url.length<=1800)location.href=url;
});
try{
 i18n=await initI18n();language.replaceChildren(...i18n.languages.map(x=>new Option(x.label,x.code)));language.value=i18n.lang;apply();syncSports();syncHistory();fields.disabled=false;language.disabled=false;
 language.addEventListener('change',async()=>{language.disabled=true;fields.disabled=true;try{const url=new URL(location.href);url.searchParams.set('lang',language.value);window.history.replaceState(null,'',url);try{localStorage.setItem('betinsight_language',language.value)}catch{}i18n=await initI18n();apply()}catch(err){console.error(err);location.reload();return}fields.disabled=false;language.disabled=false});
}catch(err){console.error(err);result.textContent='Language loading failed. No data sent.'}

const art=document.querySelector('.hero-art');if(art&&matchMedia('(hover:hover) and (prefers-reduced-motion:no-preference)').matches){art.addEventListener('pointermove',e=>{const r=art.getBoundingClientRect();art.style.setProperty('--mx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');art.style.setProperty('--my',((e.clientY-r.top)/r.height*100).toFixed(1)+'%')});art.addEventListener('pointerleave',()=>{art.style.setProperty('--mx','50%');art.style.setProperty('--my','50%')})}
