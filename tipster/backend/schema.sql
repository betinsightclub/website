create table public.betinsight_tipster_applications (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 locale text not null check(locale ~ '^[a-z]{2,3}(-[a-z0-9]{2,8}){0,3}$'),
 name text not null check(char_length(trim(name)) between 1 and 120),
 alias text not null check(char_length(trim(alias)) between 1 and 120),
 email text not null check(char_length(email) between 3 and 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'),
 country text not null check(char_length(trim(country)) between 1 and 100),
 languages text not null check(char_length(trim(languages)) between 1 and 180),
 sports text[] not null check(cardinality(sports) between 1 and 7 and sports <@ array['football','tennis','basketball','hockey','baseball','volleyball','other']::text[]),
 experience integer not null check(experience between 0 and 80),
 frequency integer not null check(frequency between 0 and 1000),
 history_url text check(history_url is null or (char_length(history_url)<=1000 and history_url ~ '^https?://')),
 profile_url text check(profile_url is null or (char_length(profile_url)<=1000 and profile_url ~ '^https?://')),
 no_history boolean not null default false,
 strategy text not null check(char_length(trim(strategy)) between 1 and 3000),
 confirmed_adult boolean not null check(confirmed_adult),
 privacy_notice_version text not null,
 status text not null default 'new' check(status in ('new','review','interview','paper_test','accepted','rejected')),
 internal_notes text not null default '' check(char_length(internal_notes)<=10000),
 strategy_de text,
 translation_status text not null default 'pending' check(translation_status in ('pending','translated','not_needed','failed')),
 check((no_history and history_url is null) or (not no_history and history_url is not null))
);
create table public.betinsight_tipster_application_outbox (
 id uuid primary key default gen_random_uuid(),
 application_id uuid not null references public.betinsight_tipster_applications(id) on delete cascade,
 kind text not null check(kind in ('admin_notification','applicant_confirmation')),
 status text not null default 'pending' check(status in ('pending','processing','sent','failed')),
 attempts integer not null default 0 check(attempts>=0),
 next_attempt_at timestamptz not null default now(),
 created_at timestamptz not null default now(),
 sent_at timestamptz,
 last_error text,
 unique(application_id,kind)
);
alter table public.betinsight_tipster_applications enable row level security;
alter table public.betinsight_tipster_application_outbox enable row level security;
revoke all on public.betinsight_tipster_applications, public.betinsight_tipster_application_outbox from public,anon,authenticated;
grant select,insert,update,delete on public.betinsight_tipster_applications,public.betinsight_tipster_application_outbox to service_role;
create index betinsight_tipster_applications_status_idx on public.betinsight_tipster_applications(status,created_at desc);
create index betinsight_tipster_outbox_pending_idx on public.betinsight_tipster_application_outbox(status,next_attempt_at);
create function public.betinsight_tipster_application_enqueue_v1() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 insert into public.betinsight_tipster_application_outbox(application_id,kind) values(new.id,'admin_notification'),(new.id,'applicant_confirmation');
 return new;
end;$$;
revoke all on function public.betinsight_tipster_application_enqueue_v1() from public,anon,authenticated;
grant execute on function public.betinsight_tipster_application_enqueue_v1() to service_role;
create trigger betinsight_tipster_application_enqueue after insert on public.betinsight_tipster_applications for each row execute function public.betinsight_tipster_application_enqueue_v1();