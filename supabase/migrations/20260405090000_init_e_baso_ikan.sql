create extension if not exists pgcrypto;

create type public.app_role as enum ('customer', 'admin');
create type public.order_status as enum ('Menunggu', 'Diproses', 'Siap Diambil', 'Selesai', 'Dibatalkan');
create type public.payment_method as enum ('saldo', 'tunai', 'qris');
create type public.fulfillment_method as enum ('pickup', 'delivery');
create type public.report_status as enum ('Baru', 'Ditinjau', 'Selesai');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.generate_order_code()
returns text
language sql
as $$
  select 'EBI-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 8));
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'customer',
  full_name text,
  avatar_url text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.products (
  id bigint primary key,
  slug text not null unique,
  name text not null,
  short_name text,
  category text not null,
  description text not null,
  long_description text,
  serving_note text,
  image_url text not null,
  price integer not null check (price >= 0),
  accent_gradient text,
  calories_label text,
  prep_time_label text,
  freshness_label text,
  is_featured boolean not null default false,
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.product_addons (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products (id) on delete cascade,
  code text not null,
  label text not null,
  price integer not null default 0 check (price >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (product_id, code)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique default public.generate_order_code(),
  profile_id uuid references public.profiles (id) on delete set null,
  customer_name text not null,
  customer_note text,
  payment_method public.payment_method not null default 'saldo',
  fulfillment_method public.fulfillment_method not null default 'pickup',
  fulfillment_location text,
  status public.order_status not null default 'Menunggu',
  item_count integer not null default 0 check (item_count >= 0),
  subtotal_amount integer not null default 0 check (subtotal_amount >= 0),
  service_fee integer not null default 0 check (service_fee >= 0),
  total_amount integer not null default 0 check (total_amount >= 0),
  source_channel text not null default 'web',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id bigint references public.products (id) on delete set null,
  product_name text not null,
  product_slug text,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  addons jsonb not null default '[]'::jsonb,
  note text,
  line_total integer not null check (line_total >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.feedback_reports (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  report_type text not null default 'Saran',
  message text not null,
  status public.report_status not null default 'Baru',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_products_sort_order on public.products (sort_order);
create index if not exists idx_product_addons_product_id on public.product_addons (product_id, sort_order);
create index if not exists idx_orders_profile_id on public.orders (profile_id);
create index if not exists idx_orders_status on public.orders (status, created_at desc);
create index if not exists idx_order_items_order_id on public.order_items (order_id);
create index if not exists idx_feedback_reports_created_at on public.feedback_reports (created_at desc);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger set_product_addons_updated_at
before update on public.product_addons
for each row execute function public.set_updated_at();

create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create trigger set_feedback_reports_updated_at
before update on public.feedback_reports
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and is_active = true
  );
$$;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_addons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.feedback_reports enable row level security;

create policy "products_public_read"
on public.products
for select
to anon, authenticated
using (is_available = true or public.is_admin());

create policy "products_admin_manage"
on public.products
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "product_addons_public_read"
on public.product_addons
for select
to anon, authenticated
using (is_active = true or public.is_admin());

create policy "product_addons_admin_manage"
on public.product_addons
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "profiles_self_read"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

create policy "profiles_self_insert"
on public.profiles
for insert
to authenticated
with check (id = auth.uid() or public.is_admin());

create policy "profiles_self_update"
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "orders_public_insert"
on public.orders
for insert
to anon, authenticated
with check (
  profile_id is null
  or profile_id = auth.uid()
  or public.is_admin()
);

create policy "orders_self_read"
on public.orders
for select
to authenticated
using (profile_id = auth.uid() or public.is_admin());

create policy "orders_admin_update"
on public.orders
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "orders_admin_delete"
on public.orders
for delete
to authenticated
using (public.is_admin());

create policy "order_items_public_insert"
on public.order_items
for insert
to anon, authenticated
with check (true);

create policy "order_items_self_read"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and (orders.profile_id = auth.uid() or public.is_admin())
  )
);

create policy "feedback_public_insert"
on public.feedback_reports
for insert
to anon, authenticated
with check (
  profile_id is null
  or profile_id = auth.uid()
  or public.is_admin()
);

create policy "feedback_self_or_admin_read"
on public.feedback_reports
for select
to authenticated
using (profile_id = auth.uid() or public.is_admin());

create policy "feedback_admin_update"
on public.feedback_reports
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
