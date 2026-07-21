-- E-commerce schema — generated from specs/DB-Spec-ecommerce.md
-- Order: enum -> tables -> constraints -> indexes -> functions -> triggers -> RLS/policies -> grants -> storage

-- ============================================================
-- 1. Enum types
-- ============================================================

create type public.order_status as enum ('pending','paid','shipped','delivered','cancelled');

-- ============================================================
-- 2. Tables
-- ============================================================

create table public.categories (
  id   int4 generated always as identity primary key,
  name varchar not null
);

create table public.products (
  id          int4 generated always as identity primary key,
  name        varchar not null,
  description text,
  price       numeric not null,
  category_id int4 references public.categories(id) on delete set null
);

create table public.product_images (
  id         int4 generated always as identity primary key,
  product_id int4 not null references public.products(id) on delete cascade,
  image_name text not null,
  created_at timestamptz not null default now()
);

create table public.customers (
  id      int4 generated always as identity primary key,
  user_id uuid not null unique references auth.users(id) on delete restrict,
  name    varchar,
  address varchar,
  phone   varchar
);

create table public.orders (
  id           int4 generated always as identity primary key,
  ordered_at   timestamptz not null default now(),
  customer_id  int4 not null references public.customers(id) on delete restrict,
  status       public.order_status not null default 'pending',
  total_amount numeric
);

create table public.order_items (
  id         int4 generated always as identity primary key,
  order_id   int4 not null references public.orders(id) on delete cascade,
  product_id int4 not null references public.products(id) on delete restrict,
  quantity   int4 not null,
  price      numeric not null
);

-- ============================================================
-- 3. Constraints (CHECK / UNIQUE)
-- ============================================================

alter table public.products    add constraint products_price_nonneg      check (price >= 0);
alter table public.order_items add constraint order_items_price_nonneg   check (price >= 0);
alter table public.order_items add constraint order_items_quantity_pos   check (quantity > 0);
alter table public.orders      add constraint orders_total_nonneg        check (total_amount >= 0);

alter table public.categories     add constraint categories_name_not_blank     check (length(btrim(name)) > 0);
alter table public.products       add constraint products_name_not_blank       check (length(btrim(name)) > 0);
alter table public.product_images add constraint product_images_name_not_blank check (length(btrim(image_name)) > 0);

alter table public.order_items add constraint order_items_order_product_uq unique (order_id, product_id);

-- ============================================================
-- 4. Indexes
-- ============================================================

create index product_images_product_id_idx on public.product_images (product_id);
create index products_category_id_idx      on public.products (category_id);
create index order_items_product_id_idx    on public.order_items (product_id);
create index orders_customer_ordered_idx   on public.orders (customer_id, ordered_at desc);
create index orders_status_ordered_idx     on public.orders (status, ordered_at desc);
create index orders_pending_ordered_idx    on public.orders (ordered_at) where status = 'pending';

-- ============================================================
-- 5. Functions
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql stable
security invoker
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

create or replace function public.pin_order_item_price()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  select p.price into new.price from public.products p where p.id = new.product_id;
  if new.price is null then
    raise exception 'ไม่พบสินค้า หรือสินค้าไม่มีราคา: product_id=%', new.product_id;
  end if;
  return new;
end $$;

create or replace function public.recompute_order_total()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_order_id int4 := coalesce(new.order_id, old.order_id);
begin
  update public.orders o
     set total_amount = (
       select coalesce(sum(oi.price * oi.quantity), 0)
       from public.order_items oi where oi.order_id = v_order_id)
   where o.id = v_order_id;
  return null;
end $$;

create or replace function public.force_order_defaults()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.status := 'pending';
  new.total_amount := null;
  return new;
end $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.customers (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end $$;

-- ============================================================
-- 6. Triggers
-- ============================================================

create trigger trg_pin_order_item_price
  before insert or update of product_id on public.order_items
  for each row execute function public.pin_order_item_price();

create trigger trg_recompute_order_total
  after insert or update or delete on public.order_items
  for each row execute function public.recompute_order_total();

create trigger trg_force_order_defaults
  before insert on public.orders
  for each row execute function public.force_order_defaults();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 7. RLS & Policies
-- ============================================================

-- 7.1 categories
alter table public.categories enable row level security;

create policy "categories_select_public" on public.categories
  for select to anon, authenticated using (true);
create policy "categories_insert_admin" on public.categories
  for insert to authenticated with check ((select public.is_admin()));
create policy "categories_update_admin" on public.categories
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "categories_delete_admin" on public.categories
  for delete to authenticated using ((select public.is_admin()));

-- 7.2 products
alter table public.products enable row level security;

create policy "products_select_public" on public.products
  for select to anon, authenticated using (true);
create policy "products_insert_admin" on public.products
  for insert to authenticated with check ((select public.is_admin()));
create policy "products_update_admin" on public.products
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "products_delete_admin" on public.products
  for delete to authenticated using ((select public.is_admin()));

-- 7.3 product_images
alter table public.product_images enable row level security;

create policy "product_images_select_public" on public.product_images
  for select to anon, authenticated using (true);
create policy "product_images_insert_admin" on public.product_images
  for insert to authenticated with check ((select public.is_admin()));
create policy "product_images_update_admin" on public.product_images
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "product_images_delete_admin" on public.product_images
  for delete to authenticated using ((select public.is_admin()));

-- 7.4 customers
alter table public.customers enable row level security;

create policy "customers_select_own_or_admin" on public.customers
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "customers_insert_self" on public.customers
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "customers_update_own_or_admin" on public.customers
  for update to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()))
  with check (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "customers_delete_admin" on public.customers
  for delete to authenticated using ((select public.is_admin()));

-- 7.5 orders
alter table public.orders enable row level security;

create policy "orders_select_own_or_admin" on public.orders
  for select to authenticated
  using ((select public.is_admin()) or exists (
    select 1 from public.customers c
    where c.id = orders.customer_id and c.user_id = (select auth.uid())));

create policy "orders_insert_own_pending" on public.orders
  for insert to authenticated
  with check (
    status = 'pending' and total_amount is null and exists (
      select 1 from public.customers c
      where c.id = customer_id and c.user_id = (select auth.uid())));

create policy "orders_update_admin" on public.orders
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "orders_delete_admin" on public.orders
  for delete to authenticated using ((select public.is_admin()));

-- 7.6 order_items
alter table public.order_items enable row level security;

create policy "order_items_select_own_or_admin" on public.order_items
  for select to authenticated
  using ((select public.is_admin()) or exists (
    select 1 from public.orders o join public.customers c on c.id = o.customer_id
    where o.id = order_items.order_id and c.user_id = (select auth.uid())));

create policy "order_items_insert_own_pending" on public.order_items
  for insert to authenticated
  with check (exists (
    select 1 from public.orders o join public.customers c on c.id = o.customer_id
    where o.id = order_id and c.user_id = (select auth.uid()) and o.status = 'pending'));

create policy "order_items_update_own_pending_or_admin" on public.order_items
  for update to authenticated
  using ((select public.is_admin()) or exists (
    select 1 from public.orders o join public.customers c on c.id = o.customer_id
    where o.id = order_items.order_id and c.user_id = (select auth.uid()) and o.status = 'pending'))
  with check ((select public.is_admin()) or exists (
    select 1 from public.orders o join public.customers c on c.id = o.customer_id
    where o.id = order_items.order_id and c.user_id = (select auth.uid()) and o.status = 'pending'));

create policy "order_items_delete_own_pending_or_admin" on public.order_items
  for delete to authenticated
  using ((select public.is_admin()) or exists (
    select 1 from public.orders o join public.customers c on c.id = o.customer_id
    where o.id = order_items.order_id and c.user_id = (select auth.uid()) and o.status = 'pending'));

-- ============================================================
-- 8. Grants (Data API exposure)
-- ============================================================

grant usage on schema public to anon, authenticated, service_role;

grant select on public.categories, public.products, public.product_images to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.product_images to authenticated;
grant select, insert, update, delete on public.customers, public.orders, public.order_items to authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;

-- ============================================================
-- 9. Storage
-- ============================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_read_public" on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-images');
create policy "product_images_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));
create policy "product_images_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()))
  with check (bucket_id = 'product-images' and (select public.is_admin()));
create policy "product_images_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));
