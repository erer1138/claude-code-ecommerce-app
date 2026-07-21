-- =============================================
-- Sample data for E-Commerce (Supabase)
-- Adapted from specs/seed_data_ecommerce_example.sql to match specs/DB-Spec-ecommerce.md
--
-- Differences from the original example file:
-- 1) customers: the example used a fabricated user_id not present in auth.users, which
--    violates the customers.user_id FK. handle_new_user() already auto-creates a
--    customers row for every auth.users signup, so we UPDATE that existing row
--    instead of INSERT (user_id is UNIQUE). Uses the "user@ecom-app.dev" test account.
-- 2) orders.status / orders.total_amount: force_order_defaults() forces every INSERT to
--    status='pending', total_amount=NULL (even for admin/service_role — see spec §9.3).
--    So orders are inserted with defaults, then status is UPDATEd afterward.
--    total_amount is left to recompute_order_total() (§9.2) once order_items exist —
--    the example's totals already equal sum(price*qty) so the trigger reproduces them.
-- 3) order_items.price: pin_order_item_price() overwrites price from products.price on
--    insert regardless of the supplied value (§9.1) — harmless here since the example's
--    prices already match current product prices, but the column value in the INSERT is
--    not actually what ends up stored.
-- 4) product_images.image_name: stored as a Storage object path per §4.3/§11
--    (products/{product_id}/{file}), not a bare filename.
--
-- All references use natural keys (names / email / timestamps) instead of hardcoded
-- ids, since ids are identity-generated and this script may run against a fresh table.
-- =============================================

-- 1-3. categories -> products -> product_images
with cat as (
  insert into public.categories (name) values
    ('สมาร์ทโฟน'),
    ('แล็ปท็อป'),
    ('หูฟัง'),
    ('แท็บเล็ต'),
    ('อุปกรณ์เสริม')
  returning id, name
),
prod as (
  insert into public.products (name, description, price, category_id)
  select v.name, v.description, v.price, cat.id
  from (values
    ('iPhone 16 Pro',        'สมาร์ทโฟน Apple จอ 6.3 นิ้ว ชิป A18 Pro',                    45900.00, 'สมาร์ทโฟน'),
    ('Samsung Galaxy S25',   'สมาร์ทโฟน Samsung จอ 6.2 นิ้ว ชิป Snapdragon 8 Elite',       32900.00, 'สมาร์ทโฟน'),
    ('MacBook Air M3',       'แล็ปท็อป Apple จอ 15 นิ้ว RAM 16GB SSD 512GB',               44900.00, 'แล็ปท็อป'),
    ('AirPods Pro 2',        'หูฟังไร้สาย Apple ตัดเสียงรบกวน USB-C',                       8990.00, 'หูฟัง'),
    ('iPad Air M2',          'แท็บเล็ต Apple จอ 13 นิ้ว ชิป M2',                            33900.00, 'แท็บเล็ต')
  ) as v(name, description, price, category_name)
  join cat on cat.name = v.category_name
  returning id, name
)
insert into public.product_images (product_id, image_name)
select prod.id, 'products/' || prod.id || '/' || v.image_name
from (values
  ('iPhone 16 Pro',      'iphone16pro-front.jpg'),
  ('iPhone 16 Pro',      'iphone16pro-back.jpg'),
  ('Samsung Galaxy S25', 'galaxy-s25-front.jpg'),
  ('MacBook Air M3',     'macbook-air-m3-silver.jpg'),
  ('AirPods Pro 2',      'airpods-pro2-case.jpg')
) as v(product_name, image_name)
join prod on prod.name = v.product_name;

-- 4. customers — fill in the profile for the existing test account instead of
--    inserting a row against a non-existent auth.users id
update public.customers c
set name = 'สมชาย ใจดี',
    address = '123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
    phone = '081-234-5678'
from auth.users u
where u.id = c.user_id
  and u.email = 'user@ecom-app.dev';

-- 5-6. orders -> order_items (status left as default 'pending'; fixed up below)
with cust as (
  select c.id
  from public.customers c
  join auth.users u on u.id = c.user_id
  where u.email = 'user@ecom-app.dev'
),
ord as (
  insert into public.orders (ordered_at, customer_id)
  select v.ordered_at, cust.id
  from (values
    ('2026-06-01 09:30:00'::timestamptz),
    ('2026-06-01 14:15:00'::timestamptz),
    ('2026-06-02 10:00:00'::timestamptz),
    ('2026-06-02 16:45:00'::timestamptz),
    ('2026-06-03 08:20:00'::timestamptz)
  ) as v(ordered_at)
  cross join cust
  returning id, ordered_at
)
insert into public.order_items (order_id, product_id, quantity, price)
select o.id, p.id, v.qty, p.price
from (values
  -- Order @ 2026-06-01 09:30: iPhone 16 Pro x2 + AirPods Pro 2 x1 = 100,790
  ('2026-06-01 09:30:00'::timestamptz, 'iPhone 16 Pro',      2),
  ('2026-06-01 09:30:00'::timestamptz, 'AirPods Pro 2',      1),
  -- Order @ 2026-06-01 14:15: MacBook Air M3 x1 + AirPods Pro 2 x1 = 53,890
  ('2026-06-01 14:15:00'::timestamptz, 'MacBook Air M3',     1),
  ('2026-06-01 14:15:00'::timestamptz, 'AirPods Pro 2',      1),
  -- Order @ 2026-06-02 10:00: Galaxy S25 x1 + AirPods Pro 2 x1 = 41,890
  ('2026-06-02 10:00:00'::timestamptz, 'Samsung Galaxy S25', 1),
  ('2026-06-02 10:00:00'::timestamptz, 'AirPods Pro 2',      1),
  -- Order @ 2026-06-02 16:45: MacBook Air M3 x1 + iPad Air M2 x1 = 78,800
  ('2026-06-02 16:45:00'::timestamptz, 'MacBook Air M3',     1),
  ('2026-06-02 16:45:00'::timestamptz, 'iPad Air M2',        1),
  -- Order @ 2026-06-03 08:20: iPhone 16 Pro x1 + iPad Air M2 x1 = 79,800
  ('2026-06-03 08:20:00'::timestamptz, 'iPhone 16 Pro',      1),
  ('2026-06-03 08:20:00'::timestamptz, 'iPad Air M2',        1)
) as v(ordered_at, product_name, qty)
join ord o on o.ordered_at = v.ordered_at
join public.products p on p.name = v.product_name;

-- 7. fix up order status now that order_items exist and total_amount has been
--    recomputed by recompute_order_total() — this UPDATE only touches status
update public.orders o
set status = v.status
from (values
  ('2026-06-01 09:30:00'::timestamptz, 'delivered'::public.order_status),
  ('2026-06-01 14:15:00'::timestamptz, 'delivered'::public.order_status),
  ('2026-06-02 10:00:00'::timestamptz, 'paid'::public.order_status),
  ('2026-06-02 16:45:00'::timestamptz, 'shipped'::public.order_status),
  ('2026-06-03 08:20:00'::timestamptz, 'paid'::public.order_status)
) as v(ordered_at, status)
where o.ordered_at = v.ordered_at;
