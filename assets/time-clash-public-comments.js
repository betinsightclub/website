(()=>{"use strict";
const API="https://lszlaglwlixejzytrurg.supabase.co/functions/v1/time-clash-comments";
const slug=new URLSearchParams(location.search).get("clash")||"";
if(!slug)return;
const l=(document.documentElement.lang||"de").toLowerCase().slice(0,2);
const tr={
de:{title:"Kommentare zu Spiel",loading:"Kommentare werden geladen …",empty:"Noch kein Kommentar. Du kannst der Erste sein.",err:"Kommentare konnten gerade nicht geladen werden.",join:"Du möchtest auch kommentieren?",sub:"Registriere dich kostenlos bei BetInsight oder melde dich an. Danach kannst du Kommentare zu jedem Einzelspiel abgeben.",reg:"KOSTENLOS REGISTRIEREN & KOMMENTIEREN",login:"BEREITS MITGLIED? ANMELDEN"},
en:{title:"Comments on game",loading:"Loading comments …",empty:"No comments yet. You can be the first.",err:"Comments could not be loaded right now.",join:"Want to comment too?",sub:"Register with BetInsight for free or sign in. Then you can comment on every individual game.",reg:"REGISTER FREE & COMMENT",login:"ALREADY A MEMBER? SIGN IN"},
es:{title:"Comentarios del partido",loading:"Cargando comentarios …",empty:"Aún no hay comentarios. Puedes ser el primero.",err:"No se pudieron cargar los comentarios.",join:"¿También quieres comentar?",sub:"Regístrate gratis en BetInsight o inicia sesión. Después podrás comentar cada partido.",reg:"REGÍSTRATE GRATIS Y COMENTA",login:"¿YA ERES MIEMBRO? INICIAR SESIÓN"},
pt:{title:"Comentários do jogo",loading:"A carregar comentários …",empty:"Ainda não há comentários. Podes ser o primeiro.",err:"Não foi possível carregar os comentários.",join:"Também queres comentar?",sub:"Regista-te gratuitamente no BetInsight ou inicia sessão. Depois podes comentar cada jogo.",reg:"REGISTAR GRÁTIS E COMENTAR",login:"JÁ ÉS MEMBRO? INICIAR SESSÃO"},
it:{title:"Commenti sulla partita",loading:"Caricamento commenti …",empty:"Nessun commento ancora. Puoi essere il primo.",err:"Impossibile caricare i commenti.",join:"Vuoi commentare anche tu?",sub:"Registrati gratuitamente su BetInsight oppure accedi. Poi potrai commentare ogni singola partita.",reg:"REGISTRATI GRATIS E COMMENTA",login:"GIÀ MEMBRO? ACCEDI"},
fr:{title:"Commentaires du match",loading:"Chargement des commentaires …",empty:"Aucun commentaire pour le moment. Vous pouvez être le premier.",err:"Impossible de charger les commentaires.",join:"Vous voulez aussi commenter ?",sub:"Inscrivez-vous gratuitement sur BetInsight ou connectez-vous. Vous pourrez ensuite commenter chaque match.",reg:"S’INSCRIRE GRATUITEMENT ET COMMENTER",login:"DÉJÀ MEMBRE ? SE CONNECTER"}
}[l]||null;
if(!tr)return;
const locale={de:"de-DE",en:"en-GB",es:"es-ES",pt:"pt-PT",it:"it-IT",fr:"fr-FR"}[l]||"de-DE";
const style=document.createElement("style");
style.textContent=".pubComments{margin-top:18px;border-top:1px solid #1a455c;padding-top:15px}.pubCommentsHead{display:flex;justify-content:space-between;align-items:center;gap:10px}.pubCommentsHead h3{margin:0;color:#dff5ff;font-size:16px}.pubCount{border:1px solid #23536d;border-radius:999px;padding:4px 9px;color:#9fdfff;font-size:12px}.pubList{display:grid;gap:9px;margin-top:11px}.pubItem{background:#082131;border:1px solid #173f55;border-radius:11px;padding:10px 12px}.pubMeta{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}.pubAuthor{color:#74d9ff;font-size:12px;font-weight:900}.pubDate{color:#6f93a6;font-size:11px}.pubBody{margin:5px 0 0!important;line-height:1.45!important;color:#d8e8f0!important;white-space:pre-wrap;overflow-wrap:anywhere}.pubHint{margin-top:8px;color:#7899aa;font-size:12px}.pubJoin{margin-top:13px;border:1px solid #23536d;border-radius:13px;padding:13px;background:#041923}.pubJoin strong{display:block;color:#f7c64e;margin-bottom:5px}.pubJoin p{margin:0 0 10px!important;font-size:13px;line-height:1.45!important}.pubActions{display:flex;gap:8px;flex-wrap:wrap}.pubBtn{display:inline-block;padding:9px 12px;border-radius:9px;text-decoration:none!important;font-size:12px;font-weight:900}.pubBtn.primary{background:linear-gradient(135deg,#19d6a3,#54c8ff);color:#021219!important}.pubBtn.secondary{border:1px solid #2d7194;background:#0a5278;color:#fff!important}";
document.head.appendChild(style);
const date=v=>{try{return new Date(v).toLocaleString(locale,{dateStyle:"short",timeStyle:"short"})}catch(e){return""}};
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n};
async function load(box,game){
 const list=box.querySelector(".pubList"),count=box.querySelector(".pubCount");
 try{
  const r=await fetch(API+"?slug="+encodeURIComponent(slug)+"&game="+game,{cache:"no-store"}),d=await r.json();
  if(!r.ok)throw new Error(d.error||"comments");
  const arr=Array.isArray(d.comments)?d.comments:[];
  count.textContent=String(arr.length);list.replaceChildren();
  if(!arr.length){list.appendChild(el("div","pubHint",tr.empty));return;}
  for(const x of arr){
   const item=el("div","pubItem"),meta=el("div","pubMeta");
   meta.append(el("span","pubAuthor",x.author||"BetInsight User"),el("span","pubDate",date(x.created_at)));
   item.append(meta,el("p","pubBody",x.body||""));list.appendChild(item);
  }
 }catch(e){list.replaceChildren(el("div","pubHint",tr.err))}
}
function mount(article,game){
 if(article.dataset.publicComments==="1")return;article.dataset.publicComments="1";
 const box=el("div","pubComments"),head=el("div","pubCommentsHead");
 head.append(el("h3","", "💬 "+tr.title+" "+game),el("span","pubCount","0"));box.appendChild(head);
 const list=el("div","pubList");list.appendChild(el("div","pubHint",tr.loading));box.appendChild(list);
 const join=el("div","pubJoin");join.append(el("strong","",tr.join),el("p","",tr.sub));
 const actions=el("div","pubActions");
 const reg=el("a","pubBtn primary",tr.reg);reg.href="https://betinsight.systeme.io/registrierung?ref=POOL";
 const login=el("a","pubBtn secondary",tr.login);login.href="https://betinsight.systeme.io/school/course/mitglieder/lecture/9870726";
 actions.append(reg,login);join.appendChild(actions);box.appendChild(join);article.appendChild(box);load(box,game);
}
function scan(){document.querySelectorAll("#app .matchArticle").forEach((a,i)=>mount(a,i+1))}
scan();const app=document.getElementById("app");if(app)new MutationObserver(scan).observe(app,{childList:true,subtree:true});
})();