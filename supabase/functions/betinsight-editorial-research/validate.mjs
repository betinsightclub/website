// Source and result consistency validation; no network access.
export function validateStory(raw, annotations, expected) {
 const reject=(v)=>{throw Error(v)};
 const str=(v,min,max)=>{if(typeof v!=="string"||v.trim().length<min||v.length>max)reject("INVALID_TEXT");return v.trim()};
 const norm=v=>String(v).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
 const host=v=>String(v).match(/^https:\/\/([a-z0-9.-]+)\/[^/\s]+/i)?.[1]?.toLowerCase().replace(/^www\./,"")||"";
 const cited=new Map(annotations.filter(c=>host(c.url)).map(c=>[c.url,String(c.title||"Spielquelle").slice(0,180)]));
 if(raw?.verified!==true||raw.match_date!==expected.date||!Array.isArray(raw.legs)||raw.legs.length!==expected.legs.length)reject("MATCH_NOT_VERIFIED");
 const legs=raw.legs.map((l,i)=>{
  const e=expected.legs[i];
  if(norm(l.home)!==norm(e.home)||norm(l.away)!==norm(e.away)||!/^\d{1,2}:\d{1,2}$/.test(l.score||""))reject("FIXTURE_MISMATCH");
  const sources=[...new Set(Array.isArray(l.sources)?l.sources:[])].filter(u=>cited.has(u));
  if(new Set(sources.map(host)).size<2)reject("INSUFFICIENT_CITED_SOURCES");
  if(!["WON","LOST","PUSH"].includes(l.selection_outcome))reject("MARKET_UNVERIFIED");
  const [h,a]=l.score.split(":").map(Number),tip=e.selection,home=norm(tip).includes(norm(e.home)),away=norm(tip).includes(norm(e.away));
  let checked=null;
  if(!/tennis/i.test(expected.sport)){
   if(/\bx2\b/i.test(tip))checked=a>=h?"WON":"LOST";
   else if(/\b1x\b/i.test(tip))checked=h>=a?"WON":"LOST";
   else if(/draw no bet|\bdnb\b/i.test(tip)&&home!==away)checked=h===a?"PUSH":(home?h>a:a>h)?"WON":"LOST";
   else if(/sieg|gewinnt|to win|1x2/i.test(tip)&&home!==away)checked=(home?h>a:a>h)?"WON":"LOST";
   if(checked&&checked!==l.selection_outcome)reject("SCORE_MARKET_CONFLICT");
  }
  if(!Array.isArray(l.events)||l.events.length<2||l.events.length>14)reject("TIMELINE_INCOMPLETE");
  return {home:e.home,away:e.away,score:l.score,status:"FT",verified:true,market_label:tip,selection_outcome:l.selection_outcome,key_events:l.events.map(v=>({minute:str(v.minute,1,25),text:str(v.de,8,350),text_en:str(v.en,8,350)})),narrative_de:str(l.narrative_de,600,4200),narrative_en:str(l.narrative_en,500,4200),wager_logic_de:str(l.logic_de,40,1000),wager_logic_en:str(l.logic_en,35,1000),source_url:sources[0],source_label:cited.get(sources[0]),sources:sources.map(url=>({url,title:cited.get(url)}))};
 });
 const outcome=legs.some(l=>l.selection_outcome==="LOST")?"LOST":legs.every(l=>l.selection_outcome==="PUSH")?"PUSH":"WON";
 if(outcome!==expected.outcome)reject("MASTER_PROVIDER_RESULT_CONFLICT");
 const translations={};for(const lang of ["de","en","es","pt","it","fr","nl","zh"]){
 const tr=raw.translations?.[lang];if(!tr||!Array.isArray(tr.legs)||tr.legs.length!==legs.length)reject("TRANSLATION_INCOMPLETE");
 translations[lang]={heading:str(tr.heading,4,120),conclusion_heading:str(tr.conclusion_heading,4,100),summary:str(tr.summary,100,1800),note:str(tr.note,20,500),legs:tr.legs.map((l,i)=>{if(!Array.isArray(l.events)||l.events.length!==legs[i].key_events.length)reject("TRANSLATED_EVENTS_INCOMPLETE");return {market:str(l.market,3,250),narrative:str(l.narrative,lang==="zh"?160:400,5000),wager_logic:str(l.wager_logic,20,1000),events:l.events.map(t=>str(t,4,350))}})};
 }
 return {schema:"betinsight_verified_match_story_v1",editorial_version:1,tipp_id:expected.id,match_date:expected.date,kind:/tennis/i.test(expected.sport)?"tennis":legs.length>1?"combination":"single",sport:expected.sport,outcome,legs,provider:"BetInsight Redaktion – Webrecherche",summary_de:translations.de.summary,summary_en:translations.en.summary,note_de:translations.de.note,note_en:translations.en.note,translations};
}
