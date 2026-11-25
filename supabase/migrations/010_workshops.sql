-- Ateliers & événements (santé sociale) — proposition équipe, validation admin, inscriptions publiques

create type public.workshop_status as enum ('draft', 'pending', 'published', 'rejected', 'cancelled');
create type public.workshop_registration_status as enum ('registered', 'waitlist', 'cancelled', 'attended');

create table public.workshops (
  id uuid primary key default gen_random_uuid(),
  proposed_by text not null references public.workers (id) on delete restrict,
  title text not null,
  description text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity int not null check (capacity > 0 and capacity <= 200),
  location text not null default 'Narcisse',
  status public.workshop_status not null default 'draft',
  admin_note text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workshops_time_check check (ends_at > starts_at)
);

create index workshops_status_starts_idx on public.workshops (status, starts_at);
create index workshops_proposed_by_idx on public.workshops (proposed_by);

create table public.workshop_registrations (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references public.workshops (id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  status public.workshop_registration_status not null default 'registered',
  waitlist_position int,
  created_at timestamptz not null default now(),
  constraint workshop_registrations_email_unique unique (workshop_id, email)
);

create index workshop_registrations_workshop_idx on public.workshop_registrations (workshop_id, status);

create trigger workshops_updated_at
  before update on public.workshops
  for each row
  execute function public.products_set_updated_at();

alter table public.workshops enable row level security;
alter table public.workshop_registrations enable row level security;

-- Admin : tout
create policy admin_all_workshops on public.workshops for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy admin_all_workshop_regs on public.workshop_registrations for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Employées : leurs ateliers (brouillon / en attente modifiables)
create policy worker_workshops_select on public.workshops for select to authenticated
  using (public.is_employee() and proposed_by = public.current_worker_id());

create policy worker_workshops_insert on public.workshops for insert to authenticated
  with check (public.is_employee() and proposed_by = public.current_worker_id());

create policy worker_workshops_update on public.workshops for update to authenticated
  using (public.is_employee() and proposed_by = public.current_worker_id() and status in ('draft', 'pending', 'rejected'))
  with check (public.is_employee() and proposed_by = public.current_worker_id() and status in ('draft', 'pending', 'rejected'));

-- Public : ateliers publiés
create policy workshops_public_select on public.workshops for select to anon, authenticated
  using (status = 'published' and ends_at > now());

-- Inscriptions : lecture admin/worker via jointure — employée voit les siens publiés
create policy worker_regs_select on public.workshop_registrations for select to authenticated
  using (
    public.is_employee()
    and exists (
      select 1 from public.workshops w
      where w.id = workshop_id and w.proposed_by = public.current_worker_id()
    )
  );

-- Inscription publique via fonction (évite RLS insert anon direct)
create or replace function public.register_for_workshop(
  p_workshop_id uuid,
  p_full_name text,
  p_email text,
  p_phone text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  w public.workshops%rowtype;
  taken int;
  wl int;
  st public.workshop_registration_status;
  pos int;
  rid uuid;
begin
  if p_full_name is null or trim(p_full_name) = '' or p_email is null or trim(p_email) = '' then
    raise exception 'Nom et e-mail requis';
  end if;

  select * into w from workshops where id = p_workshop_id and status = 'published' and ends_at > now();
  if not found then
    raise exception 'Atelier indisponible';
  end if;

  if exists (select 1 from workshop_registrations where workshop_id = p_workshop_id and lower(email) = lower(trim(p_email)) and status <> 'cancelled') then
    raise exception 'Cette adresse est déjà inscrite';
  end if;

  select count(*)::int into taken from workshop_registrations
    where workshop_id = p_workshop_id and status in ('registered', 'attended');

  if taken < w.capacity then
    st := 'registered';
    pos := null;
  else
    st := 'waitlist';
    select coalesce(max(waitlist_position), 0) + 1 into pos from workshop_registrations
      where workshop_id = p_workshop_id and status = 'waitlist';
  end if;

  insert into workshop_registrations (workshop_id, full_name, email, phone, status, waitlist_position)
  values (p_workshop_id, trim(p_full_name), lower(trim(p_email)), nullif(trim(p_phone), ''), st, pos)
  returning id into rid;

  return jsonb_build_object('id', rid, 'status', st, 'waitlist_position', pos);
end;
$$;

grant execute on function public.register_for_workshop(uuid, text, text, text) to anon, authenticated;
grant select on public.workshops to anon;
grant select, insert, update, delete on public.workshops to authenticated;
grant select, insert, update, delete on public.workshop_registrations to authenticated;