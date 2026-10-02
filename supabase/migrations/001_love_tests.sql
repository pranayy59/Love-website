-- Run once in the Supabase SQL editor. All access is through server routes.
create table if not exists public.love_tests (
  id uuid primary key default gen_random_uuid(),
  owner_hash text not null,
  config jsonb not null,
  secret_hash text,
  deleting boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists love_tests_owner on public.love_tests(owner_hash);
create table if not exists public.love_uploads (
  id uuid primary key, owner_hash text not null, path text unique not null,
  kind text not null, mime text not null, size bigint not null,
  verified boolean not null default false,
  test_id uuid references public.love_tests(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.love_rate_limits (
  key text primary key, hits integer not null default 1, expires_at timestamptz not null
);
alter table public.love_tests enable row level security;
alter table public.love_uploads enable row level security;
alter table public.love_rate_limits enable row level security;
revoke all on public.love_tests, public.love_uploads, public.love_rate_limits from anon, authenticated;
grant all on public.love_tests, public.love_uploads, public.love_rate_limits to service_role;

create or replace function public.love_rate_limit(p_key text, p_limit integer, p_seconds integer)
returns boolean language plpgsql security definer set search_path=public as $$
declare attempts integer;
begin
  insert into love_rate_limits(key,hits,expires_at) values(p_key,1,now()+make_interval(secs=>p_seconds))
  on conflict(key) do update set
    hits=case when love_rate_limits.expires_at<now() then 1 else love_rate_limits.hits+1 end,
    expires_at=case when love_rate_limits.expires_at<now() then now()+make_interval(secs=>p_seconds) else love_rate_limits.expires_at end
  returning hits into attempts;
  return attempts<=p_limit;
end; $$;
revoke all on function public.love_rate_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.love_rate_limit(text,integer,integer) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('love-media','love-media',false,26214400,array['image/jpeg','image/png','image/webp','video/mp4','video/webm','audio/mpeg','audio/wav','audio/x-wav','audio/mp4','audio/x-m4a'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
-- No anonymous/authenticated Storage policies: signed uploads/downloads only.
