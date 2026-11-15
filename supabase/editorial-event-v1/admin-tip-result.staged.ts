import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const SUPABASE_URL=Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
if(!SUPABASE_URL||!SERVICE_KEY) throw new Error("Supabase service credentials unavailable");

const db=createClient(SUPABASE_URL,SERVICE_KEY,{
  auth:{persistSession:false,autoRefreshToken:false}
});

const ALLOWED=new Set([
  "https://app.betinsight.club",
  "https://betinsightclub.github.io"
]);

function clean(v:unknown){return String(v??"").trim()}
function cors(origin:string|null){
  const allowed=origin&&ALLOWED.has(origin)?origin:"";
  return {
    "Access-Control-Allow-Origin":allowed,
    "Vary":"Origin",
    "Access-Control-Allow-Headers":"content-type",
    "Access-Control-Allow-Methods":"POST,OPTIONS",
    "Cache-Control":"no-store"
  };
}
function json(data:unknown,status=200,origin:string|null=null){
  return new Response(JSON.stringify(data),{
    status,
    headers:{...cors(origin),"Content-Type":"application/json; charset=utf-8"}
  });
}
function ip(req:Request){
  const f=req.headers.get("x-forwarded-for");
  return (f?f.split(",")[0].trim():req.headers.get("cf-connecting-ip")||req.headers.get("x-real-ip")||"unknown").slice(0,80);
}
async function rateAllowed(key:string,limit:number){
  const {data,error}=await db.rpc("betinsight_gateway_rate_check",{
    p_key:key,p_limit:limit,p_window_seconds:300
  });
  if(error){console.error("rate limit",error.message);return false}
  return data===true;
}

Deno.serve(async(req:Request)=>{
  const origin=req.headers.get("origin");

  if(req.method==="OPTIONS"){
    if(!origin||!ALLOWED.has(origin)) return json({ok:false,error:"ORIGIN_NOT_ALLOWED"},403,origin);
    return new Response("ok",{status:200,headers:cors(origin)});
  }

  if(req.method!=="POST") return json({ok:false,error:"METHOD_NOT_ALLOWED"},405,origin);
  if(!origin||!ALLOWED.has(origin)) return json({ok:false,error:"ORIGIN_NOT_ALLOWED"},403,origin);

  if(!(await rateAllowed("admin-tip-result:"+ip(req),120)))
    return json({ok:false,error:"RATE_LIMITED"},429,origin);

  const len=Number(req.headers.get("content-length")||"0");
  if(len>16384) return json({ok:false,error:"PAYLOAD_TOO_LARGE"},413,origin);

  let payload:Record<string,unknown>;
  try{
    const raw=await req.text();
    if(raw.length>16384) return json({ok:false,error:"PAYLOAD_TOO_LARGE"},413,origin);
    payload=raw?JSON.parse(raw):{};
    if(!payload||Array.isArray(payload)||typeof payload!=="object") throw new Error("invalid");
  }catch{
    return json({ok:false,error:"INVALID_JSON"},400,origin);
  }

  if(clean(payload.action).toLowerCase()==="reserve_details"){
    const {data:authorized,error:authError}=await db.rpc("betinsight_admin_session_check_v1",{
      p_session_hash:clean(payload.session_hash).toLowerCase(),p_require_master:true
    });
    if(authError||authorized?.ok!==true)return json({ok:false,error:"MASTER_REQUIRED"},403,origin);
    if(!(await rateAllowed("admin-reserve-details:"+ip(req),12)))
      return json({ok:false,error:"RATE_LIMITED"},429,origin);

    const [tips,legacy,affiliate,purchases,pool]=await Promise.all([
      db.from("betinsight_admin_unit_usage_history")
        .select("nutzungs_id,freigeschaltet_am,tipp_id,spiel,user_id,sondertopf_eur,source,created_at")
        .gt("sondertopf_eur",0)
        .order("audit_seq",{ascending:false})
        .limit(500),
      db.from("betinsight_reserve_legacy_events")
        .select("event_key,category,occurred_at,reference,amount_eur,status,source,metadata")
        .gt("amount_eur",0)
        .order("occurred_at",{ascending:false})
        .limit(500),
      db.from("betinsight_affiliate_allocations")
        .select("provider_txn_id,user_id,total_company_pool_eur,status,created_at")
        .gt("total_company_pool_eur",0)
        .order("created_at",{ascending:false})
        .limit(500),
      db.from("betinsight_admin_settlement_purchases")
        .select("settlement_id,source_key,provider_txn_id,paid_at_text,user_id,status,special_reserve_eur,special_reserve_crypto,operating_cost_crypto,payment_currency,payment_network")
        .order("settlement_id",{ascending:false})
        .limit(500),
      db.from("betinsight_referral_company_pool_events_v2")
        .select("pool_key,buyer_user_id,company_pool_units,created_at,source")
        .order("created_at",{ascending:false})
        .limit(500)
    ]);

    const errors:Record<string,string>={};
    if(tips.error)errors.tips="SUPABASE_READ_FAILED";
    if(legacy.error)errors.legacy="SUPABASE_READ_FAILED";
    if(affiliate.error)errors.affiliate="SUPABASE_READ_FAILED";
    if(purchases.error)errors.v5="SUPABASE_READ_FAILED";
    if(pool.error)errors.pool_units="SUPABASE_READ_FAILED";

    const list:any[]=[];
    const totals:Record<string,{amount:number,count:number,currency:string}>={};
    function add(category:string,date:unknown,reference:unknown,amount:number,unit:string,status:unknown,source:string){
      if(!Number.isFinite(amount)||amount<=0)return;
      if(!totals[category])totals[category]={amount:0,count:0,currency:unit};
      totals[category].amount+=amount;
      totals[category].count+=1;
      list.push({
        category,
        date:clean(date),
        reference:clean(reference).slice(0,120),
        amount:Number(amount.toFixed(unit==="EUR"?6:8)),
        unit,
        status:clean(status).slice(0,90),
        source
      });
    }

    if(!tips.error){
      for(const row of tips.data||[]){
        add(
          "tips",
          row.freigeschaltet_am||row.created_at,
          clean(row.tipp_id)+" / "+clean(row.spiel),
          Number(row.sondertopf_eur||0),
          "EUR",
          "Nachweis aus Tippverbrauch",
          "betinsight_admin_unit_usage_history"
        );
      }
    }

    const legacyProviderTxn=new Set<string>();
    if(!legacy.error){
      for(const row of legacy.data||[]){
        const txn=clean((row.metadata as any)?.provider_txn_id);
        if(txn)legacyProviderTxn.add(txn);
        add(
          clean(row.category),
          row.occurred_at,
          row.reference,
          Number(row.amount_eur||0),
          "EUR",
          row.status||"Legacy-Bestand",
          row.source||"betinsight_reserve_legacy_events"
        );
      }
    }

    if(!affiliate.error){
      for(const row of affiliate.data||[]){
        const txn=clean(row.provider_txn_id);
        if(txn&&legacyProviderTxn.has(txn))continue;
        add(
          "affiliate",
          row.created_at,
          "AFF-"+txn,
          Number(row.total_company_pool_eur||0),
          "EUR",
          row.status||"Gebucht",
          "betinsight_affiliate_allocations"
        );
      }
    }

    if(!purchases.error){
      for(const row of purchases.data||[]){
        add(
          "v5",
          row.paid_at_text,
          row.source_key||String(row.settlement_id),
          Number(row.special_reserve_eur||0),
          "EUR",
          row.status||"Gebucht",
          "betinsight_admin_settlement_purchases"
        );
      }
    }

    if(!pool.error){
      for(const row of pool.data||[]){
        add(
          "pool_units",
          row.created_at,
          row.pool_key,
          Number(row.company_pool_units||0),
          "Units",
          "Gebucht",
          "betinsight_referral_company_pool_events_v2"
        );
      }
    }

    const routeDefs=[
      {route:"BNB / BNB Chain",currency:"BNB",network:"BNB Chain"},
      {route:"BTC / Bitcoin",currency:"BTC",network:"Bitcoin"},
      {route:"ETH / Ethereum",currency:"ETH",network:"Ethereum"},
      {route:"SOL / Solana",currency:"SOL",network:"Solana"},
      {route:"TON / TON",currency:"TON",network:"TON"},
      {route:"TRX / TRON",currency:"TRX",network:"TRON"},
      {route:"USDC / BEP-20",currency:"USDC",network:"BEP-20"},
      {route:"USDT / ERC-20",currency:"USDT",network:"ERC-20"},
      {route:"USDT / TON",currency:"USDT",network:"TON"},
      {route:"USDT / TRC-20",currency:"USDT",network:"TRC-20"}
    ];
    function normNetwork(v:unknown){
      const x=clean(v).toUpperCase().replace(/[_ ]/g,"-");
      if(x==="BITCOIN")return "BITCOIN";
      if(x==="BNB-CHAIN"||x==="BSC"||x==="BEP20")return "BNB-CHAIN";
      if(x==="ETHEREUM"||x==="ERC20")return "ETHEREUM";
      if(x==="SOLANA")return "SOLANA";
      if(x==="TRC20")return "TRC-20";
      if(x==="BEP-20")return "BEP-20";
      if(x==="ERC-20")return "ERC-20";
      return x;
    }
    const cryptoMap=new Map<string,{special:number,cost:number}>();
    if(!purchases.error){
      for(const row of purchases.data||[]){
        const key=clean(row.payment_currency).toUpperCase()+"|"+normNetwork(row.payment_network);
        const cur=cryptoMap.get(key)||{special:0,cost:0};
        cur.special+=Number(row.special_reserve_crypto||0)||0;
        cur.cost+=Number(row.operating_cost_crypto||0)||0;
        cryptoMap.set(key,cur);
      }
    }
    const crypto=routeDefs.map(r=>{
      const key=r.currency.toUpperCase()+"|"+normNetwork(r.network);
      const v=cryptoMap.get(key)||{special:0,cost:0};
      const special=Number(v.special.toFixed(8));
      const cost=Number(v.cost.toFixed(8));
      const total=Number((v.special+v.cost).toFixed(8));
      return {
        route:r.route,
        currency:r.currency,
        network:r.network,
        components:[special.toFixed(8),cost.toFixed(8),total.toFixed(8)],
        error:false,
        source:"betinsight_admin_settlement_purchases"
      };
    });

    for(const k of Object.keys(totals)){
      totals[k].amount=Number(totals[k].amount.toFixed(totals[k].currency==="EUR"?6:8));
    }
    list.sort((a,b)=>(Date.parse(b.date)||0)-(Date.parse(a.date)||0));

    return json({
      ok:true,
      totals,
      rows:list,
      crypto,
      errors,
      reconciled:false,
      source_mode:"SUPABASE_ONLY",
      note:"Getrennte Buchungsnachweise aus Supabase. Historische Affiliate-/Premium-Restposten wurden einmalig übernommen; neue Buchungen kommen direkt aus den kanonischen Supabase-Ledgern."
    },200,origin);
  }

  if(clean(payload.action).toLowerCase()==="health"||clean(payload.action).toLowerCase()==="health_run"){
    const {data:auth,error:authError}=await db.rpc("betinsight_admin_session_check_v1",{
      p_session_hash:clean(payload.session_hash).toLowerCase(),p_require_master:true
    });
    if(authError||auth?.ok!==true)return json({ok:false,error:"MASTER_REQUIRED"},403,origin);
    let manualRun=null;
    if(clean(payload.action).toLowerCase()==="health_run"){
      if(!(await rateAllowed("admin-tip-health-manual:"+ip(req),5)))
        return json({ok:false,error:"MANUAL_RATE_LIMITED"},429,origin);
      // The old recurring cron tasks are disabled. One explicit Master click is the only way
      // to run this maintenance bundle. Each step is independent and its result is reported.
      const tasks=await Promise.allSettled([
        db.rpc("betinsight_tip_result_sheet_sync_run_v1",{p_limit:10}),
        db.rpc("betinsight_result_story_retry_run_v1"),
        db.rpc("betinsight_tennis_match_collect_v1")
      ]);
      const labels=["sheets","stories","tennis"];
      manualRun={};
      tasks.forEach((task,i)=>{
        const name=labels[i];
        if(task.status==="rejected"){
          (manualRun as any)[name]={ok:false,error:"MANUAL_TASK_REJECTED"};
        }else if(task.value.error){
          (manualRun as any)[name]={ok:false,error:"MANUAL_TASK_ERROR"};
        }else{
          (manualRun as any)[name]=task.value.data??{ok:false,error:"NO_TASK_RESULT"};
        }
      });
      const {data:snapshot,error:snapshotError}=await db.rpc("betinsight_result_story_monitor_snapshot_v1");
      (manualRun as any).snapshot=snapshotError?{ok:false,error:"SNAPSHOT_FAILED"}:(snapshot??null);
    }
    const [sheets,history]=await Promise.all([
      db.from("betinsight_tip_result_sheet_sync_v1").select("status,last_error"),
      db.from("betinsight_result_story_monitor_v1")
        .select("checked_at,confirmed_eligible,ready,missing,pending,tennis_missing,tennis_ready")
        .order("checked_at",{ascending:false}).limit(1)
    ]);
    if(sheets.error||history.error)return json({ok:false,error:"HEALTH_READ_FAILED"},503,origin);
    const totals={SYNCED:0,PENDING:0,FAILED:0,SKIPPED:0};
    const errors=[];
    for(const entry of sheets.data||[]){
      const state=String(entry.status||"");
      if(state in totals)totals[state]++;
      if(state==="FAILED"&&errors.length<3)errors.push(String(entry.last_error||"UNKNOWN").slice(0,90));
    }
    return json({ok:true,sheet:totals,sheet_errors:errors,
      stories:(history.data||[])[0]||null,manual_run:manualRun},200,origin);
  }

  if(clean(payload.action).toLowerCase()!=="confirm_tip_result")
    return json({ok:false,error:"INVALID_ACTION"},400,origin);

  const {data,error}=await db.rpc("betinsight_admin_tip_result_confirm_v1",{
    p_session_hash:clean(payload.session_hash).toLowerCase(),
    p_tipp_id:clean(payload.tipp_id),
    p_ergebnis_status:clean(payload.ergebnis_status),
    p_request_id:clean(payload.request_id)
  });

  if(error){
    console.error("tip result write",error.message);
    return json({ok:false,error:"TIP_RESULT_WRITE_FAILED"},500,origin);
  }

  const out=data||{ok:false,error:"TIP_RESULT_EMPTY"};
  const err=String(out.error||"");
  const status=out.ok===false
    ? (err.includes("SESSION")?401:err==="MASTER_REQUIRED"?403:err.endsWith("_NOT_FOUND")?404:400)
    : 200;


  // Non-critical, read-only football research pipeline.
  // Master result, user units, statistics and history remain authoritative.
  // A failing sports provider cannot roll back or modify a confirmed result.
  const resultState=clean(payload.ergebnis_status).toUpperCase();
  if(out.ok===true&&status===200&&["GEWONNEN","VERLOREN"].includes(resultState)){
    const research=(async()=>{
      try{
        // Event-driven long-form web research. It never rolls back grading.
        if(Deno.env.get("BETINSIGHT_REPORT_WEB_ENABLED")==="true"){
          try{
            const editorial=await fetch(SUPABASE_URL+"/functions/v1/betinsight-editorial-research?id="+encodeURIComponent(clean(payload.tipp_id)),{method:"POST",headers:{"Authorization":"Bearer "+SERVICE_KEY,"Content-Type":"application/json"},body:"{}",signal:AbortSignal.timeout(110000)});
            if(editorial.ok||editorial.status===409)return;
            console.warn("EDITORIAL_RESEARCH_PENDING",editorial.status);
          }catch(e){console.warn("EDITORIAL_RESEARCH_FAILED",String(e).slice(0,100))}
        }
        const url=SUPABASE_URL+"/functions/v1/betinsight-public-result-story?id="+encodeURIComponent(clean(payload.tipp_id));
        const v=await fetch(url,{method:"POST",
          headers:{"Authorization":"Bearer "+SERVICE_KEY,"Content-Type":"application/json"},
          body:"{}",signal:AbortSignal.timeout(30000)});
        if(!v.ok) console.warn("RESULT_STORY_PENDING",v.status);
        else console.log("RESULT_STORY_RESEARCH_TRIGGERED",clean(payload.tipp_id).slice(0,70));
      }catch(e){console.warn("RESULT_STORY_RESEARCH_FAILED",String(e).slice(0,150))}
    })();
    const runtime=(globalThis as any).EdgeRuntime;
    if(runtime&&typeof runtime.waitUntil==="function")runtime.waitUntil(research);
    else await research;
  }
  return json(out,status,origin);
});