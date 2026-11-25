-- Boutique e-commerce : catalogue produits (gestion admin, lecture publique si publié)

create type public.product_universe as enum (
  'skincare',
  'art-de-vivre',
  'developpement',
  'editions'
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  tagline text,
  description text not null default '',
  universe public.product_universe not null,
  price_cents int check (price_cents is null or price_cents >= 0),
  image_url text,
  featured boolean not null default false,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_published_idx on public.products (published, featured, sort_order);
create index products_universe_idx on public.products (universe);

create or replace function public.products_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at
  before update on public.products
  for each row
  execute function public.products_set_updated_at();

alter table public.products enable row level security;

create policy products_select_public on public.products
  for select
  to anon, authenticated
  using (published = true);

create policy products_admin_all on public.products
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;