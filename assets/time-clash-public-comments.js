(()=>{"use strict";
const COMMENTS_API="https://lszlaglwlixejzytrurg.supabase.co/functions/v1/time-clash-comments";
const params=new URLSearchParams(location.search);
const slug=params.get("clash")||"";
if(!slug)return;
const SUPPORTED=["de","en","es","pt","it","fr"];
const raw=(document.documentElement.lang||location.pathname.split("/").filter(Boolean)[0]||"de").toLowerCase();
const lang=SUPPORTED.includes(raw.slice(0,2))?raw.slice(0,2):"de";
const locale={de:"de-DE",en:"en-GB",es:"es-ES",pt:"pt-PT",it:"it-IT",fr:"fr-FR"}[lang];
const T={
de:{language:"Sprache",title:"Kommentare zu Spiel",loading:"Kommentare werden geladen …",empty:"Noch kein Kommentar. Du kannst der Erste sein.",placeholder:"Dein Kommentar zu diesem Spiel …",send:"Senden",registered:"Du bist angemeldet und kannst kommentieren.",guestTitle:"Du möchtest auch kommentieren?",guestText:"Registriere dich kostenlos bei BetInsight oder melde dich an. Danach kannst du zu jedem Einzelspiel kommentieren.",reg:"KOSTENLOS REGISTRIEREN & KOMMENTIEREN",login:"BEREITS MITGLIED? ANMELDEN",loadError:"Kommentare konnten gerade nicht geladen werden.",sendError:"Kommentar konnte nicht gespeichert werden.",expired:"Dein Kommentar-Zugang ist abgelaufen. Öffne den Bericht erneut aus TIME CLASH.",rate:"Bitte warte ein paar Sekunden bis zum nächsten Kommentar.",blocked:"Dieser Kommentar ist so nicht zulässig."},
en:{language:"Language",title:"Comments on game",loading:"Loading comments …",empty:"No comments yet. You can be the first.",placeholder:"Your comment on this game …",send:"Send",registered:"You are signed in and can comment.",guestTitle:"Want to comment too?",guestText:"Register with BetInsight for free or sign in. Then you can comment on every individual game.",reg:"REGISTER FREE & COMMENT",login:"ALREADY A MEMBER? SIGN IN",loadError:"Comments could not be loaded right now.",sendError:"Comment could not be saved.",expired:"Your comment access has expired. Reopen the report from TIME CLASH.",rate:"Please wait a few seconds before posting another comment.",blocked:"This comment is not allowed."},
es:{language:"Idioma",title:"Comentarios del partido",loading:"Cargando comentarios …",empty:"Aún no hay comentarios. Puedes ser el primero.",placeholder:"Tu comentario sobre este partido …",send:"Enviar",registered:"Has iniciado sesión y puedes comentar.",guestTitle:"¿También quieres comentar?",guestText:"Regístrate gratis en BetInsight o inicia sesión. Después podrás comentar cada partido.",reg:"REGÍSTRATE GRATIS Y COMENTA",login:"¿YA ERES MIEMBRO? INICIAR SESIÓN",loadError:"No se pudieron cargar los comentarios.",sendError:"No se pudo guardar el comentario.",expired:"Tu acceso para comentar ha caducado. Abre de nuevo el informe desde TIME CLASH.",rate:"Espera unos segundos antes del siguiente comentario.",blocked:"Este comentario no está permitido."},
pt:{language:"Idioma",title:"Comentários do jogo",loading:"A carregar comentários …",empty:"Ainda não há comentários. Podes ser o primeiro.",placeholder:"O teu comentário sobre este jogo …",send:"Enviar",registered:"Estás autenticado e podes comentar.",guestTitle:"Também queres comentar?",guestText:"Regista-te gratuitamente no BetInsight ou inicia sessão. Depois podes comentar cada jogo.",reg:"REGISTAR GRÁTIS E COMENTAR",login:"JÁ ÉS MEMBRO? INICIAR SESSÃO",loadError:"Não foi possível carregar os comentários.",sendError:"Não foi possível guardar o comentário.",expired:"O teu acesso para comentar expirou. Abre novamente o relatório a partir do TIME CLASH.",rate:"Espera alguns segundos antes do próximo comentário.",blocked:"Este comentário não é permitido."},
it:{language:"Lingua",title:"Commenti sulla partita",loading:"Caricamento commenti …",empty:"Nessun commento ancora. Puoi essere il primo.",placeholder:"Il tuo commento su questa partita …",send:"Invia",registered:"Hai effettuato l'accesso e puoi commentare.",guestTitle:"Vuoi commentare anche tu?",guestText:"Registrati gratuitamente su BetInsight oppure accedi. Poi potrai commentare ogni singola partita.",reg:"REGISTRATI GRATIS E COMMENTA",login:"GIÀ MEMBRO? ACCEDI",loadError:"Impossibile caricare i commenti.",sendError:"Impossibile salvare il commento.",expired:"Il tuo accesso ai commenti è scaduto. Riapri il report da TIME CLASH.",rate:"Attendi qualche secondo prima del prossimo commento.",blocked:"Questo commento non è consentito."},
fr:{language:"Langue",title:"Commentaires du match",loading:"Chargement des commentaires …",empty:"Aucun commentaire pour le moment. Vous pouvez être le premier.",placeholder:"Votre commentaire sur ce match …",send:"Envoyer",registered:"Vous êtes connecté et pouvez commenter.",guestTitle:"Vous voulez aussi commenter ?",guestText:"Inscrivez-vous gratuitement sur BetInsight ou connectez-vous. Vous pourrez ensuite commenter chaque match.",reg:"S’INSCRIRE GRATUITEMENT ET COMMENTER",login:"DÉJÀ MEMBRE ? SE CONNECTER",loadError:"Impossible de charger les commentaires.",sendError:"Impossible d'enregistrer le commentaire.",expired:"Votre accès aux commentaires a expiré. Rouvrez le rapport depuis TIME CLASH.",rate:"Veuillez attendre quelques secondes avant le prochain commentaire.",blocked:"Ce commentaire n'est pas autorisé."}
}[lang];

let commentKey="";
try{
  const fromUrl=params.get("ck")||"";
  commentKey=fromUrl||sessionStorage.getItem("bi_tc_comment_key")||"";
  if(fromUrl){
    sessionStorage.setItem("bi_tc_comment_key",fromUrl);
    const u=new URL(location.href);
    u.searchParams.delete("ck");
    history.replaceState(null,"",u.pathname+u.search+u.hash);
  }
}catch(e){commentKey=params.get("ck")||""}

const style=document.createElement("style");
style.textContent=".tcTools{display:flex;justify-content:flex-end;align-items:center;gap:8px;margin:0 0 12px}.tcTools label{color:#9eb5c3;font-size:12px;font-weight:800}.tcTools select{border:1px solid #2d7194;background:#0a5278;color:#fff;border-radius:9px;padding:8px 28px 8px 10px;font-weight:900}.pubComments{margin-top:18px;border-top:1px solid #1a455c;padding-top:15px}.pubCommentsHead{display:flex;justify-content:space-between;align-items:center;gap:10px}.pubCommentsHead h3{margin:0;color:#dff5ff;font-size:16px}.pubCount{border:1px solid #23536d;border-radius:999px;padding:4px 9px;color:#9fdfff;font-size:12px}.pubList{display:grid;gap:9px;margin-top:11px}.pubItem{background:#082131;border:1px solid #173f55;border-radius:11px;padding:10px 12px}.pubMeta{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}.pubAuthor{color:#74d9ff;font-size:12px;font-weight:900}.pubDate{color:#6f93a6;font-size:11px}.pubBody{margin:5px 0 0!important;line-height:1.45!important;color:#d8e8f0!important;white-space:pre-wrap;overflow-wrap:anywhere}.pubHint{margin-top:8px;color:#7899aa;font-size:12px}.pubJoin{margin-top:13px;border:1px solid #23536d;border-radius:13px;padding:13px;background:#041923}.pubJoin strong{display:block;color:#f7c64e;margin-bottom:5px}.pubJoin p{margin:0 0 10px!important;font-size:13px;line-height:1.45!important}.pubActions{display:flex;gap:8px;flex-wrap:wrap}.pubBtn{display:inline-block;padding:9px 12px;border-radius:9px;text-decoration:none!important;font-size:12px;font-weight:900}.pubBtn.primary{background:linear-gradient(135deg,#19d6a3,#54c8ff);color:#021219!important}.pubBtn.secondary{border:1px solid #2d7194;background:#0a5278;color:#fff!important}.pubForm{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;margin-top:11px}.pubForm textarea{resize:vertical;min-height:46px;max-height:140px;border:1px solid #2a607c;border-radius:10px;background:#03131e;color:#fff;padding:10px;font:inherit}.pubForm button{border:0;border-radius:10px;background:#0b79ad;color:#fff;font-weight:900;padding:0 16px;cursor:pointer}.pubForm button:disabled{opacity:.55;cursor:wait}.pubError{color:#ff8490;font-size:11px;margin-top:6px}@media(max-width:640px){.tcTools{justify-content:flex-start}.pubForm{grid-template-columns:1fr}.pubForm button{min-height:42px}}";
document.head.appendChild(style);
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n};
const date=v=>{try{return new Date(v).toLocaleString(locale,{dateStyle:"short",timeStyle:"short"})}catch(e){return""}};

function installLanguage(){
  if(document.querySelector(".tcTools"))return;
  const back=document.getElementById("backToClash");
  if(!back||!back.parentNode)return;
  const box=el("div","tcTools"),label=el("label","",T.language+":");
  const sel=document.createElement("select");sel.setAttribute("aria-label",T.language);
  const flags={de:"🇩🇪 DE",en:"🇬🇧 EN",es:"🇪🇸 ES",pt:"🇧🇷 PT",it:"🇮🇹 IT",fr:"🇫🇷 FR"};
  for(const x of SUPPORTED){const o=document.createElement("option");o.value=x;o.textContent=flags[x];o.selected=x===lang;sel.appendChild(o)}
  sel.addEventListener("change",()=>{
    const u=new URL(location.href);
    const parts=u.pathname.split("/");
    if(parts.length>1&&SUPPORTED.includes(parts[1]))parts[1]=sel.value;else parts.splice(1,0,sel.value);
    u.pathname=parts.join("/");
    if(commentKey)u.searchParams.set("ck",commentKey);else u.searchParams.delete("ck");
    location.href=u.toString();
  });
  box.append(label,sel);
  back.parentNode.insertBefore(box,back);
}

async function load(box,game){
  const list=box.querySelector(".pubList"),count=box.querySelector(".pubCount");
  try{
    const r=await fetch(COMMENTS_API+"?slug="+encodeURIComponent(slug)+"&game="+game,{cache:"no-store"}),d=await r.json();
    if(!r.ok)throw new Error(d.error||"comments");
    const arr=Array.isArray(d.comments)?d.comments:[];
    count.textContent=String(arr.length);list.replaceChildren();
    if(!arr.length){list.appendChild(el("div","pubHint",T.empty));return}
    for(const x of arr){
      const item=el("div","pubItem"),meta=el("div","pubMeta");
      meta.append(el("span","pubAuthor",x.author||"BetInsight User"),el("span","pubDate",date(x.created_at)));
      item.append(meta,el("p","pubBody",x.body||""));list.appendChild(item);
    }
  }catch(e){list.replaceChildren(el("div","pubHint",T.loadError))}
}

function mount(article,game){
  if(article.dataset.publicComments==="1")return;
  article.dataset.publicComments="1";
  const box=el("div","pubComments"),head=el("div","pubCommentsHead");
  head.append(el("h3","", "💬 "+T.title+" "+game),el("span","pubCount","0"));box.appendChild(head);
  const list=el("div","pubList");list.appendChild(el("div","pubHint",T.loading));box.appendChild(list);
  if(commentKey){
    const form=el("form","pubForm"),ta=document.createElement("textarea"),btn=el("button","",T.send),err=el("div","pubError");
    ta.maxLength=500;ta.required=true;ta.placeholder=T.placeholder;btn.type="submit";
    form.append(ta,btn);box.append(form,el("div","pubHint",T.registered),err);
    form.addEventListener("submit",async ev=>{
      ev.preventDefault();const body=ta.value.trim();if(!body)return;
      btn.disabled=true;err.textContent="";
      try{
        const r=await fetch(COMMENTS_API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"comment",slug,game,access_key:commentKey,body})});
        const d=await r.json();if(!r.ok)throw new Error(d.error||"comment_failed");
        ta.value="";await load(box,game);
      }catch(e){
        const m=String(e.message||"");
        err.textContent=m==="rate_limited"?T.rate:m==="registered_only"?T.expired:m==="comment_not_allowed"?T.blocked:T.sendError;
      }finally{btn.disabled=false}
    });
  }else{
    const join=el("div","pubJoin");
    join.append(el("strong","",T.guestTitle),el("p","",T.guestText));
    const actions=el("div","pubActions"),reg=el("a","pubBtn primary",T.reg),login=el("a","pubBtn secondary",T.login);
    reg.href="https://betinsight.systeme.io/registrierung?ref=POOL";
    login.href="https://betinsight.systeme.io/school/course/mitglieder/lecture/9870726";
    actions.append(reg,login);join.appendChild(actions);box.appendChild(join);
  }
  article.appendChild(box);load(box,game);
}

function scan(){document.querySelectorAll("#app .matchArticle").forEach((a,i)=>mount(a,i+1))}
installLanguage();scan();
const app=document.getElementById("app");if(app)new MutationObserver(scan).observe(app,{childList:true,subtree:true});
})();