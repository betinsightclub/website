-- Separate editorial job ledger. No changes to tip grading, units or financial data.
begin;
create table if not exists public.betinsight_editorial_jobs_v1(
 tipp_id text not null, revision text not null, status text not null check(status in ('RUNNING','READY','FAILED')), last_error text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), primary key(tipp_id,revision)
);
alter table public.betinsight_editorial_jobs_v1 enable row level security;
revoke all on public.betinsight_editorial_jobs_v1 from public,anon,authenticated;
grant select,insert,update on public.betinsight_editorial_jobs_v1 to service_role;
create or replace function public.betinsight_editorial_claim_v1(p_tipp_id text) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare r public.betinsight_tip_results%rowtype;t public.betinsight_tips%rowtype; rev text; affected integer;
begin
 select * into r from public.betinsight_tip_results where tipp_id=p_tipp_id for update;
 if not found or r.bestaetigungsstatus is distinct from 'BESTAETIGT' or r.sichtbar_fuer_teilnehmer is distinct from 'JA' or r.qualitaetsrelevant is distinct from 'JA' or coalesce(r.ergebnis_status,'') not in ('GEWONNEN','VERLOREN') then return jsonb_build_object('ok',false,'error','NOT_ELIGIBLE');end if;
 select * into t from public.betinsight_tips where tipp_id=p_tipp_id for share;
 if not found or coalesce(t.tipp_quelle,'') in ('SYSTEMTEST','TIPPGEBER_TEST') then return jsonb_build_object('ok',false,'error','NOT_ELIGIBLE');end if;
 rev:=md5(jsonb_build_array(r.ergebnis_status,r.bestaetigt_am,t.spiel,t.spiel_datum,t.tipp,t.markt,t.liga,t.sportart,t.analyse_text)::text);
 if exists(select 1 from public.betinsight_public_match_stories where tipp_id=p_tipp_id and status='READY' and provider='editorial-web-verified' and payload->>'outcome'=case when r.ergebnis_status='GEWONNEN' then 'WON' else 'LOST' end) then return jsonb_build_object('ok',false,'error','EDITORIAL_ALREADY_READY');end if;
 insert into public.betinsight_editorial_jobs_v1(tipp_id,revision,status) values(p_tipp_id,rev,'RUNNING') on conflict do nothing;
 get diagnostics affected=row_count;
 if affected<>1 then return jsonb_build_object('ok',false,'error','ALREADY_PROCESSED');end if;
 return jsonb_build_object('ok',true,'revision',rev,'tip',jsonb_build_object('spiel',t.spiel,'spiel_datum',t.spiel_datum,'tipp',t.tipp,'markt',t.markt,'liga',t.liga,'sportart',t.sportart,'analyse_text',t.analyse_text),'result',jsonb_build_object('ergebnis_status',r.ergebnis_status));
end $$;
create or replace function public.betinsight_editorial_finish_v1(p_tipp_id text,p_revision text,p_story jsonb,p_error text) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare r public.betinsight_tip_results%rowtype;t public.betinsight_tips%rowtype; rev text; affected integer;
begin
 select * into r from public.betinsight_tip_results where tipp_id=p_tipp_id for update;
 if not found then return jsonb_build_object('ok',false,'error','NOT_ELIGIBLE');end if;
 select * into t from public.betinsight_tips where tipp_id=p_tipp_id for share;
 if not found then return jsonb_build_object('ok',false,'error','NOT_ELIGIBLE');end if;
 rev:=md5(jsonb_build_array(r.ergebnis_status,r.bestaetigt_am,t.spiel,t.spiel_datum,t.tipp,t.markt,t.liga,t.sportart,t.analyse_text)::text);
 if rev is distinct from p_revision or r.bestaetigungsstatus is distinct from 'BESTAETIGT' or r.sichtbar_fuer_teilnehmer is distinct from 'JA' or r.qualitaetsrelevant is distinct from 'JA' or coalesce(r.ergebnis_status,'') not in ('GEWONNEN','VERLOREN') or coalesce(t.tipp_quelle,'') in ('SYSTEMTEST','TIPPGEBER_TEST') then
  update public.betinsight_editorial_jobs_v1 set status='FAILED',last_error='STALE_RESULT',updated_at=now() where tipp_id=p_tipp_id and revision=p_revision and status='RUNNING';
  return jsonb_build_object('ok',false,'error','STALE_RESULT');end if;
 if not exists(select 1 from public.betinsight_editorial_jobs_v1 where tipp_id=p_tipp_id and revision=p_revision and status='RUNNING') then return jsonb_build_object('ok',false,'error','NO_ACTIVE_JOB');end if;
 if p_story is null then
  update public.betinsight_editorial_jobs_v1 set status='FAILED',last_error=left(p_error,100),updated_at=now() where tipp_id=p_tipp_id and revision=p_revision;
  return jsonb_build_object('ok',true,'status','FAILED');
 end if;
 if p_story->>'tipp_id' is distinct from p_tipp_id or p_story->>'outcome' is distinct from (case when r.ergebnis_status='GEWONNEN' then 'WON' else 'LOST' end) or p_story->>'editorial_version' is distinct from '1' then return jsonb_build_object('ok',false,'error','STORY_MISMATCH');end if;
 insert into public.betinsight_public_match_stories(tipp_id,status,provider,payload,fetched_at,updated_at,last_error) values(p_tipp_id,'READY','editorial-web-verified',p_story||jsonb_build_object('fetched_at',now()),now(),now(),null)
 on conflict(tipp_id) do update set status=excluded.status,provider=excluded.provider,payload=excluded.payload,fetched_at=excluded.fetched_at,updated_at=excluded.updated_at,last_error=null;
 update public.betinsight_editorial_jobs_v1 set status='READY',updated_at=now() where tipp_id=p_tipp_id and revision=p_revision;
 return jsonb_build_object('ok',true,'status','READY');
end $$;
revoke all on function public.betinsight_editorial_claim_v1(text),public.betinsight_editorial_finish_v1(text,text,jsonb,text) from public,anon,authenticated;
grant execute on function public.betinsight_editorial_claim_v1(text),public.betinsight_editorial_finish_v1(text,text,jsonb,text) to service_role;
commit;
