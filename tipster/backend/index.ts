import {createClient} from "npm:@supabase/supabase-js@2.95.0";
const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false,autoRefreshToken:false}});
const publicOrigins=new Set(["https://betinsight.club","https://www.betinsight.club"]);
const adminOrigins=new Set(["https://app.betinsight.club","https://betinsightclub.github.io"]);
const statuses=["new","review","interview","paper_test","accepted","rejected"];
const table="betinsight_tipster_applications";
const clean=(v:unknown)=>typeof v==="string"?v.trim():"";
Deno.serve(async req=>{
 const origin=req.headers.get("origin")||"";
 const headers={"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"content-type","Cache-Control":"no-store","Content-Type":"application/json","Vary":"Origin"};
 const reply=(status:number,value:unknown)=>new Response(JSON.stringify(value),{status,headers});
 if(!publicOrigins.has(origin)&&!adminOrigins.has(origin))return new Response(null,{status:403});
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="POST")return reply(405,{ok:false});
 try {
 const reader=req.body?.getReader();if(!reader)return reply(400,{ok:false});let size=0;const chunks=[];while(true){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>24000){await reader.cancel();return reply(413,{ok:false})}chunks.push(part.value)}const bytes=new Uint8Array(size);let off=0;for(const c of chunks){bytes.set(c,off);off+=c.length}const p=JSON.parse(new TextDecoder().decode(bytes));if(!p||typeof p!=="object"||Array.isArray(p))return reply(400,{ok:false});
 if(p.action==="submit"){
 if(!publicOrigins.has(origin)||Deno.env.get("BETINSIGHT_TIPSTER_SUBMISSIONS_ENABLED")!=="true")return reply(503,{ok:false,error:"SUBMISSIONS_DISABLED"});
 const secret=Deno.env.get("BETINSIGHT_TIPSTER_TURNSTILE_SECRET");if(!secret)return reply(503,{ok:false});
 const ip=(req.headers.get("cf-connecting-ip")||req.headers.get("x-forwarded-for")||"unknown").split(",")[0].trim().slice(0,80);
 const limiter=await db.rpc("betinsight_gateway_rate_check",{p_key:"tipster-apply:"+ip,p_limit:5,p_window_seconds:300});if(limiter.error||limiter.data!==true)return reply(429,{ok:false});
 if(clean(p.honeypot)||!clean(p.captcha))return reply(400,{ok:false});
 const cap=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body:new URLSearchParams({secret,response:clean(p.captcha)}),signal:AbortSignal.timeout(8000)}).then(r=>r.json());
 if(!cap.success||!["betinsight.club","www.betinsight.club"].includes(cap.hostname)||cap.action!=="tipster_apply")return reply(400,{ok:false,error:"CAPTCHA"});
 if(p.confirmed_adult!==true||p.privacy_ack!==true||!Number.isInteger(p.experience)||!Number.isInteger(p.frequency)||!Array.isArray(p.sports))return reply(400,{ok:false,error:"INVALID_FIELDS"});
 const locale=clean(p.locale).toLowerCase();const row={locale,name:clean(p.name),alias:clean(p.alias),email:clean(p.email),country:clean(p.country),languages:clean(p.languages),sports:p.sports,experience:p.experience,frequency:p.frequency,history_url:clean(p.history_url)||null,profile_url:clean(p.profile_url)||null,no_history:p.no_history===true,strategy:clean(p.strategy),confirmed_adult:true,privacy_notice_version:"tipster-v1",translation_status:locale==="de"?"not_needed":"pending"};
 const {data,error}=await db.from(table).insert(row).select("id").single();if(error)return reply(400,{ok:false,error:"APPLICATION_NOT_SAVED"});return reply(201,{ok:true,id:data.id});
 }
 if(!adminOrigins.has(origin))return reply(403,{ok:false});
 const hash=clean(p.session_hash).toLowerCase();if(!/^[a-f0-9]{64}$/.test(hash))return reply(401,{ok:false});
 const sess=await db.rpc("betinsight_admin_verify_v1",{p_session_hash:hash});if(sess.error||sess.data?.ok!==true)return reply(401,{ok:false});
 const acct=await db.from("betinsight_admin_accounts").select("active,role").eq("admin_id",sess.data.admin_id).maybeSingle();if(acct.error||!acct.data?.active||acct.data.role!=="MASTER")return reply(403,{ok:false});
 if(p.action==="list"){
 const {data,error}=await db.from(table).select("*").order("created_at",{ascending:false}).range(0,99);if(error)return reply(500,{ok:false});return reply(200,{ok:true,applications:data});
 }
 if(p.action==="update"){
 if(!statuses.includes(p.status)||!clean(p.id)||typeof p.internal_notes!=="string"||p.internal_notes.length>10000)return reply(400,{ok:false});
 const {data,error}=await db.from(table).update({status:p.status,internal_notes:p.internal_notes,updated_at:new Date().toISOString()}).eq("id",p.id).select("id").maybeSingle();if(error||!data)return reply(400,{ok:false});return reply(200,{ok:true,id:data.id});
 }
 return reply(400,{ok:false});
 } catch {return reply(500,{ok:false,error:"REQUEST_FAILED"})}
});