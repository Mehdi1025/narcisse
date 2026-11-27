-- 027 — limitation de débit (checkout, inscriptions ateliers) par clé (ex. IP)

create table if not exists public.api_rate_limits (
  bucket text not null,
  window_start timestamptz not null,
  hit_count int not null default 1,
  primary key (bucket, window_start)
);

create index if not exists api_rate_limits_window_idx on public.api_rate_limits (window_start);

alter table public.api_rate_limits enable row level security;

create or replace function public.check_rate_limit(
  p_bucket text,
  p_max_hits int,
  p_window_seconds int default 60
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  win timestamptz := date_trunc('minute', now());
  cnt int;
begin
  delete from public.api_rate_limits where window_start < now() - interval '2 hours';

  insert into public.api_rate_limits (bucket, window_start, hit_count)
  values (p_bucket, win, 1)
  on conflict (bucket, window_start) do update
    set hit_count = public.api_rate_limits.hit_count + 1
  returning hit_count into cnt;

  return cnt <= p_max_hits;
end;
$$;

revoke all on table public.api_rate_limits from public, anon, authenticated;
revoke execute on function public.check_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, int, int) to service_role;