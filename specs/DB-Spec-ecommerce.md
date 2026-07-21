# DB Spec — ระบบ E-commerce (Supabase / PostgreSQL)

เอกสารนี้เป็นพิมพ์เขียวฐานข้อมูลของระบบ e-commerce บน Supabase อ้างอิงจาก `specs/ER-Diagram-ecommerce.png` ครอบคลุมโครงสร้างตาราง, ความสัมพันธ์, ข้อจำกัด (constraints), index, Row Level Security (RLS), trigger, การเชื่อมกับ Supabase Auth, และ Storage — พร้อมสคริปต์ SQL ที่นำไปทำ migration ได้จริง

> **สถานะ:** เอกสารออกแบบ (design spec) — ยังไม่ได้สร้างวัตถุใด ๆ ในฐานข้อมูลจริง โปรเจกต์ปัจจุบันเป็น Next.js scaffold เปล่า ยังไม่มี Supabase CLI / migration
> **Supabase project (ผูกผ่าน MCP):** `hepanaalgzlhujesqwgo`

---

## สารบัญ

1. [ภาพรวมและขอบเขต](#1-ภาพรวมและขอบเขต)
2. [Conventions และหลักการออกแบบ](#2-conventions-และหลักการออกแบบ)
3. [Enum types](#3-enum-types)
4. [นิยามตาราง](#4-นิยามตาราง)
5. [ความสัมพันธ์และ Referential Integrity](#5-ความสัมพันธ์และ-referential-integrity)
6. [Constraints (CHECK / UNIQUE)](#6-constraints-check--unique)
7. [Indexes](#7-indexes)
8. [RLS และ Policies](#8-rls-และ-policies)
9. [Triggers และ Supporting Objects](#9-triggers-และ-supporting-objects)
10. [Auth Integration](#10-auth-integration)
11. [Storage](#11-storage)
12. [กฎธุรกิจและ Invariants](#12-กฎธุรกิจและ-invariants)
13. [Security Checklist](#13-security-checklist)
14. [Config ที่ต้องตั้งค่า](#14-config-ที่ต้องตั้งค่า)
15. [สมมติฐานและ Open Questions](#15-สมมติฐานและ-open-questions)
16. [ภาคผนวก: สคริปต์ SQL ครบชุด](#16-ภาคผนวก-สคริปต์-sql-ครบชุด)

---

## 1. ภาพรวมและขอบเขต

ระบบประกอบด้วย **6 ตาราง** ใน schema `public` และ **1 enum type** แบ่งเป็น 2 กลุ่ม:

- **Catalog (สินค้า):** `categories` → `products` → `product_images`
- **Sales (การขาย):** `customers` → `orders` → `order_items` โดย `order_items` อ้างถึง `products`

```
categories ──1:N──> products ──1:N──> product_images
                       ▲
                       │ N:1 (product_id)
auth.users ──1:1──> customers ──1:N──> orders ──1:N──> order_items
```

**ขอบเขตของเอกสารนี้ (ตามที่ตกลง):**

- ยึดโครงสร้างตาม ER diagram **เป๊ะ** — ไม่เพิ่มคอลัมน์ใหม่ (เช่น ไม่มี `stock`, `sku`, `slug`, `is_active`, `updated_at`, soft-delete) สิ่งที่เพิ่มได้คือ PK/FK, NOT NULL, enum, default, และวัตถุเสริมที่จำเป็นต่อความถูกต้อง/ความปลอดภัย (index, CHECK, UNIQUE, RLS policy, trigger, storage bucket)
- ระบบสกุลเงินเดียว
- เป้าหมาย: ให้ทีมเห็นโครงสร้าง สิทธิ์ และกฎธุรกิจตรงกันก่อนลงมือสร้างจริง

---

## 2. Conventions และหลักการออกแบบ

| หัวข้อ | แนวทาง |
| --- | --- |
| Schema | ทุกตารางอยู่ใน `public` |
| การตั้งชื่อ | `snake_case`, ตารางเป็นพหูพจน์ (`products`, `orders`) |
| Primary Key | `int4 GENERATED ALWAYS AS IDENTITY` (client ส่ง `id` เองไม่ได้) — คงชนิด `int4` ตาม diagram |
| เวลา | `timestamptz` + `default now()` |
| เงิน | `numeric` (ตาม diagram) — ดู [§15](#15-สมมติฐานและ-open-questions) สำหรับคำแนะนำ `numeric(12,2)` |
| ข้อความ | `varchar` (ไม่กำหนดความยาว = เทียบเท่า `text` ใน Postgres) / `text` |
| Enum | ใช้ enum type สำหรับสถานะที่มีชุดค่าตายตัว (`order_status`) |

**หลักการด้านความปลอดภัย (สำคัญ):** RLS ควบคุมได้เพียง "แถวไหนที่เห็น/แก้ได้" แต่**ไม่สามารถควบคุมค่าที่ client ใส่ในคอลัมน์**ได้ ดังนั้นค่าที่เกี่ยวกับเงินและสถานะ (`order_items.price`, `orders.total_amount`, `orders.status`) จึงถูกบังคับให้เป็น **server-authoritative** ผ่าน trigger + constraint (ดู [§9](#9-triggers-และ-supporting-objects) และ [§12](#12-กฎธุรกิจและ-invariants))

**ชนิด `int4` และความเสี่ยง overflow:** `int4` รองรับได้ ~2.147 พันล้านแถว ตารางที่โตเร็วที่สุดคือ `order_items` หากคาดว่าจะมีปริมาณสูงมากในระยะยาว ควรพิจารณา `int8/bigint` (ดู [§15](#15-สมมติฐานและ-open-questions)) เอกสารนี้คง `int4` ตาม diagram

---

## 3. Enum types

```sql
create type public.order_status as enum ('pending','paid','shipped','delivered','cancelled');
```

| ค่า | ความหมาย |
| --- | --- |
| `pending` | สร้างออเดอร์แล้ว รอชำระเงิน (สถานะเริ่มต้น) |
| `paid` | ชำระเงินแล้ว |
| `shipped` | จัดส่งแล้ว |
| `delivered` | ลูกค้าได้รับแล้ว (สิ้นสุด) |
| `cancelled` | ยกเลิก |

การเปลี่ยนสถานะทำได้โดย **admin เท่านั้น** (ผ่าน UPDATE — ดู [§8](#8-rls-และ-policies))

---

## 4. นิยามตาราง

> สัญลักษณ์ nullability ยึดตาม ER diagram (◆ = NOT NULL, ◇ = nullable)

### 4.1 `categories`

| คอลัมน์ | ชนิด | Null | Default | หมายเหตุ |
| --- | --- | --- | --- | --- |
| `id` | int4 | NO | identity | PK |
| `name` | varchar | NO | — | ชื่อหมวดหมู่ |

```sql
create table public.categories (
  id   int4 generated always as identity primary key,
  name varchar not null
);
```

### 4.2 `products`

| คอลัมน์ | ชนิด | Null | Default | หมายเหตุ |
| --- | --- | --- | --- | --- |
| `id` | int4 | NO | identity | PK |
| `name` | varchar | NO | — | ชื่อสินค้า |
| `description` | text | YES | — | รายละเอียด |
| `price` | numeric | NO | — | ราคาปัจจุบัน (ใช้เป็นราคาอ้างอิงตอนสั่งซื้อ) |
| `category_id` | int4 | YES | — | FK → `categories.id` |

```sql
create table public.products (
  id          int4 generated always as identity primary key,
  name        varchar not null,
  description text,
  price       numeric not null,
  category_id int4 references public.categories(id) on delete set null
);
```

### 4.3 `product_images`

| คอลัมน์ | ชนิด | Null | Default | หมายเหตุ |
| --- | --- | --- | --- | --- |
| `id` | int4 | NO | identity | PK |
| `product_id` | int4 | NO | — | FK → `products.id` |
| `image_name` | text | NO | — | **object path** ภายใน Storage bucket (ไม่ใช่ชื่อไฟล์ล้วน) |
| `created_at` | timestamptz | NO | `now()` | เวลาอัปโหลด |

```sql
create table public.product_images (
  id         int4 generated always as identity primary key,
  product_id int4 not null references public.products(id) on delete cascade,
  image_name text not null,
  created_at timestamptz not null default now()
);
```

### 4.4 `customers`

| คอลัมน์ | ชนิด | Null | Default | หมายเหตุ |
| --- | --- | --- | --- | --- |
| `id` | int4 | NO | identity | PK |
| `user_id` | uuid | NO | — | FK → `auth.users.id`, **UNIQUE** (1:1 กับบัญชีผู้ใช้) |
| `name` | varchar | YES | — | ชื่อผู้รับ |
| `address` | varchar | YES | — | ที่อยู่จัดส่ง |
| `phone` | varchar | YES | — | เบอร์ติดต่อ |

```sql
create table public.customers (
  id      int4 generated always as identity primary key,
  user_id uuid not null unique references auth.users(id) on delete restrict,
  name    varchar,
  address varchar,
  phone   varchar
);
```

### 4.5 `orders`

| คอลัมน์ | ชนิด | Null | Default | หมายเหตุ |
| --- | --- | --- | --- | --- |
| `id` | int4 | NO | identity | PK |
| `ordered_at` | timestamptz | NO | `now()` | เวลาสั่งซื้อ |
| `customer_id` | int4 | NO | — | FK → `customers.id` |
| `status` | order_status | NO | `'pending'` | สถานะ (เปลี่ยนโดย admin) |
| `total_amount` | numeric | YES | — | ยอดรวม — **ดูแลโดย trigger**; NULL = ยังไม่มีรายการ |

```sql
create table public.orders (
  id           int4 generated always as identity primary key,
  ordered_at   timestamptz not null default now(),
  customer_id  int4 not null references public.customers(id) on delete restrict,
  status       public.order_status not null default 'pending',
  total_amount numeric
);
```

### 4.6 `order_items`

| คอลัมน์ | ชนิด | Null | Default | หมายเหตุ |
| --- | --- | --- | --- | --- |
| `id` | int4 | NO | identity | PK |
| `order_id` | int4 | NO | — | FK → `orders.id` |
| `product_id` | int4 | NO | — | FK → `products.id` |
| `quantity` | int4 | NO | — | จำนวน (> 0) |
| `price` | numeric | NO | — | **ราคาต่อหน่วย ณ เวลาสั่งซื้อ** (snapshot ตรึงโดย trigger) |

```sql
create table public.order_items (
  id         int4 generated always as identity primary key,
  order_id   int4 not null references public.orders(id) on delete cascade,
  product_id int4 not null references public.products(id) on delete restrict,
  quantity   int4 not null,
  price      numeric not null
);
```

---

## 5. ความสัมพันธ์และ Referential Integrity

| FK | อ้างถึง | ON DELETE | เหตุผล |
| --- | --- | --- | --- |
| `product_images.product_id` | `products.id` | **CASCADE** | รูปเป็นของสินค้า ลบสินค้า → ลบรูป |
| `products.category_id` | `categories.id` | **SET NULL** | `category_id` nullable; ลบหมวดไม่ควรลบสินค้า |
| `customers.user_id` | `auth.users.id` | **RESTRICT** | ป้องกันการลบบัญชีที่ทำให้ประวัติเสียหาย (ดูหมายเหตุ) |
| `orders.customer_id` | `customers.id` | **RESTRICT** | เก็บประวัติการสั่งซื้อ |
| `order_items.order_id` | `orders.id` | **CASCADE** | line item เป็นของ order |
| `order_items.product_id` | `products.id` | **RESTRICT** | กันลบสินค้าที่ยังอยู่ในประวัติออเดอร์ |

**หมายเหตุ 1 — การลบผู้ใช้ (สำคัญ):** ในไดอะแกรมความสัมพันธ์ `auth.users` → `customers` → `orders` การตั้ง `orders.customer_id = RESTRICT` เพื่อเก็บประวัติ ทำให้ **ไม่สามารถ hard-delete บัญชีผู้ใช้ที่มีออเดอร์แล้วได้** (การลบจะล้มทั้ง transaction) จึงตั้ง `customers.user_id = RESTRICT` ให้สอดคล้อง และใช้แนวทาง **anonymize** แทน: ล้างค่า PII (`name`, `address`, `phone` ซึ่งเป็น nullable ทั้งหมด) ผ่าน Edge Function/ขั้นตอน admin แล้วคงแถว `customers`/`orders` ไว้ → รองรับ "สิทธิ์การลืม (right-to-erasure)" โดยไม่ทำลายประวัติการขาย

**หมายเหตุ 2 — สินค้าถูกอ้างถาวร:** เนื่องจาก `order_items.product_id = RESTRICT` และไม่มีคอลัมน์ soft-delete/`is_active` (ตามข้อจำกัด "ยึด diagram") สินค้าที่เคยถูกสั่งจะ**ลบทิ้งไม่ได้** ธุรกิจต้องยอมรับว่า "สินค้าที่เคยขายจะคงอยู่ถาวร" (การเลิกขายทำได้เมื่อเพิ่มคอลัมน์สถานะในอนาคต)

**หมายเหตุ 3 — Storage orphan:** `product_images` CASCADE ลบเฉพาะ**แถวใน DB** ไม่ได้ลบไฟล์จริงใน Storage → ต้องมีกลไก cleanup (Edge Function/scheduled job) ดู [§11](#11-storage)

---

## 6. Constraints (CHECK / UNIQUE)

ทั้งหมดเป็นส่วนเสริมเพื่อความถูกต้อง ไม่ได้เพิ่มคอลัมน์

```sql
-- ความถูกต้องด้านตัวเลข/เงิน
alter table public.products    add constraint products_price_nonneg      check (price >= 0);
alter table public.order_items add constraint order_items_price_nonneg   check (price >= 0);
alter table public.order_items add constraint order_items_quantity_pos   check (quantity > 0);
alter table public.orders      add constraint orders_total_nonneg        check (total_amount >= 0); -- NULL ผ่านอัตโนมัติ

-- กันข้อความว่าง (ค่าที่ NOT NULL)
alter table public.categories     add constraint categories_name_not_blank     check (length(btrim(name)) > 0);
alter table public.products       add constraint products_name_not_blank       check (length(btrim(name)) > 0);
alter table public.product_images add constraint product_images_name_not_blank check (length(btrim(image_name)) > 0);

-- กันบรรทัดสินค้าซ้ำในออเดอร์เดียว + เปิดทาง upsert (ON CONFLICT)
alter table public.order_items add constraint order_items_order_product_uq unique (order_id, product_id);
```

> `price >= 0` อนุญาตสินค้าราคา 0 (ของแถม/โปรโมชัน) หากไม่ต้องการให้เปลี่ยนเป็น `> 0`

---

## 7. Indexes

Postgres สร้าง index อัตโนมัติให้ PK และ UNIQUE เท่านั้น **ไม่สร้างให้คอลัมน์ FK** จึงต้องเพิ่มเอง:

```sql
create index product_images_product_id_idx on public.product_images (product_id);
create index products_category_id_idx      on public.products (category_id);
create index order_items_product_id_idx    on public.order_items (product_id);

-- composite: รองรับทั้ง FK check, RLS (ออเดอร์ของลูกค้า) และคิวรี "ล่าสุดก่อน"
create index orders_customer_ordered_idx   on public.orders (customer_id, ordered_at desc);

-- composite: หน้า admin กรองตามสถานะแล้วเรียงตามวันที่
create index orders_status_ordered_idx     on public.orders (status, ordered_at desc);
```

**ไม่ต้องสร้าง index เพิ่ม** สำหรับ:

- `order_items(order_id)` — UNIQUE `(order_id, product_id)` มี leftmost prefix ครอบให้แล้ว
- `customers(user_id)` — UNIQUE constraint สร้าง index ที่ RLS ใช้ให้แล้ว

**Optional:** partial index สำหรับคิว "ออเดอร์ที่รอดำเนินการ"

```sql
create index orders_pending_ordered_idx on public.orders (ordered_at) where status = 'pending';
```

---

## 8. RLS และ Policies

**โมเดลสิทธิ์:** Public catalog (ใครก็อ่านสินค้าได้) + owner-scoped (ลูกค้าเห็น/แก้เฉพาะข้อมูลตัวเอง) + admin จัดการได้ทั้งหมด

**การระบุ admin:** ผ่าน claim `role = 'admin'` ใน `app_metadata` ของ JWT (`app_metadata` ผู้ใช้แก้เองไม่ได้ — ปลอดภัยสำหรับ authorization ต่างจาก `user_metadata` ที่ห้ามใช้) ตั้งค่าได้ผ่าน Admin API เช่น `supabase.auth.admin.updateUserById(id, { app_metadata: { role: 'admin' } })`

> ทางเลือกที่ scale กว่า: ใช้ตาราง `user_roles` + Custom Access Token Hook ตาม RBAC guide ของ Supabase — แต่เพิ่มตารางใหม่ จึงไม่เป็น default ในสเปคนี้ (ยึด diagram)

### 8.1 Helper `is_admin()`

```sql
create or replace function public.is_admin()
returns boolean
language sql stable
security invoker            -- อ่านเฉพาะ JWT ของผู้เรียก ไม่แตะตาราง → callable โดย anon ก็ปลอดภัย (คืน false)
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;
```

> ในทุก policy เรียกแบบ `(select public.is_admin())` เพื่อให้ Postgres cache ผลแบบ initPlan (เช่นเดียวกับ `(select auth.uid())`)

### 8.2 สรุป Policy Matrix

| ตาราง | SELECT | INSERT | UPDATE | DELETE |
| --- | --- | --- | --- | --- |
| `categories`, `products`, `product_images` | public (`anon` + `authenticated`) | admin | admin | admin |
| `customers` | เจ้าของ หรือ admin | self (`user_id = auth.uid()`) | เจ้าของ/admin | admin |
| `orders` | เจ้าของ (ผ่าน `customers`) หรือ admin | เจ้าของ + บังคับ `status='pending'`, `total_amount IS NULL` | admin | admin |
| `order_items` | เจ้าของ (ผ่าน `orders`→`customers`) หรือ admin | เจ้าของ ต่อ order ตัวเองที่ยัง `pending` | เจ้าของขณะ `pending` หรือ admin | เจ้าของขณะ `pending` หรือ admin |

### 8.3 Catalog (ตัวอย่าง `products` — `categories`/`product_images` เหมือนกัน)

```sql
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
```

### 8.4 `customers`

```sql
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
  with check (user_id = (select auth.uid()) or (select public.is_admin())); -- WITH CHECK กันแก้ user_id ไปเป็นของคนอื่น

create policy "customers_delete_admin" on public.customers
  for delete to authenticated using ((select public.is_admin()));
```

### 8.5 `orders`

```sql
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

create policy "orders_update_admin" on public.orders   -- เปลี่ยนสถานะเป็น admin เท่านั้น
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "orders_delete_admin" on public.orders
  for delete to authenticated using ((select public.is_admin()));
```

### 8.6 `order_items`

```sql
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
```

### 8.7 GRANTs (Data API exposure)

ตั้งแต่ **2026-04-28** ตารางใหม่ใน `public` **ไม่ถูก expose สู่ Data API อัตโนมัติ** ต้อง grant เอง และเนื่องจาก admin เป็นเพียง JWT claim (ใช้ Postgres role `authenticated`) role `authenticated` จึงต้องมีสิทธิ์ระดับตารางบน catalog ด้วย (RLS จะคุมให้เหลือเฉพาะ admin อีกชั้น) — GRANT ไม่ลดทอน RLS

```sql
grant select on public.categories, public.products, public.product_images to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.product_images to authenticated;
grant select, insert, update, delete on public.customers, public.orders, public.order_items to authenticated; -- ไม่ให้ anon
grant select, insert, update, delete on all tables in schema public to service_role;
```

> `GENERATED ALWAYS AS IDENTITY` ทำให้ client ส่ง `id` เองไม่ได้ และไม่ต้อง grant สิทธิ์ sequence

---

## 9. Triggers และ Supporting Objects

เพื่ออุด "ช่องโหว่ความถูกต้องของค่าในคอลัมน์" (RLS อุดไม่ได้) — ค่าเงิน/สถานะจึงถูกกำหนดฝั่ง server

### 9.1 ตรึงราคา `order_items.price` จาก `products.price`

```sql
create or replace function public.pin_order_item_price()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  select p.price into new.price from public.products p where p.id = new.product_id;
  if new.price is null then
    raise exception 'ไม่พบสินค้า หรือสินค้าไม่มีราคา: product_id=%', new.product_id;
  end if;
  return new;
end $$;

create trigger trg_pin_order_item_price
  before insert or update of product_id on public.order_items
  for each row execute function public.pin_order_item_price();
```

> ป้องกัน client ส่ง `price` ที่ต่ำเกินจริง — DB จะเขียนทับด้วยราคาจริงจาก `products` เสมอ; ราคาที่ตรึงไว้จะไม่เปลี่ยนตามราคาสินค้าในอนาคต (เป็น snapshot)

### 9.2 คำนวณ `orders.total_amount` อัตโนมัติ

```sql
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

create trigger trg_recompute_order_total
  after insert or update or delete on public.order_items
  for each row execute function public.recompute_order_total();
```

### 9.3 บังคับ `status='pending'`, `total_amount=NULL` ตอนสร้าง order

```sql
create or replace function public.force_order_defaults()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.status := 'pending';
  new.total_amount := null;   -- ให้ trigger §9.2 เป็นผู้กำหนดยอดจริง
  return new;
end $$;

create trigger trg_force_order_defaults
  before insert on public.orders
  for each row execute function public.force_order_defaults();
```

> เป็น defense-in-depth ครอบคลุมแม้แต่การ INSERT ผ่าน `service_role` (ที่ bypass RLS); การเปลี่ยนสถานะทำได้เฉพาะผ่าน UPDATE โดย admin

### 9.4 สร้างโปรไฟล์ลูกค้าอัตโนมัติหลังสมัคร

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.customers (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

> ต้องเป็น `security definer` เพื่อ insert เข้า `public.customers` ระหว่างสมัคร; `on conflict do nothing` ทำให้ idempotent (customers INSERT policy ใน §8.4 เป็น fallback)

### 9.5 การสร้างออเดอร์แบบ atomic (แนะนำ)

แม้ trigger + constraint ข้างต้นจะทำให้การ INSERT ตรงจาก client ปลอดภัยแล้ว แต่การ checkout ที่มีหลายรายการควรทำแบบ atomic ผ่าน **RPC (SECURITY DEFINER) หรือ Edge Function (service_role)** ที่: สร้าง order (`pending`) → ใส่ order_items (ราคาถูกตรึงโดย trigger) → ยืนยัน → เปลี่ยนสถานะ ในทรานแซกชันเดียว (รายละเอียด API อยู่นอกขอบเขตเอกสาร DB นี้)

---

## 10. Auth Integration

- `customers.user_id` → `auth.users.id` แบบ **UNIQUE** = โปรไฟล์ 1:1 ต่อบัญชี
- สร้างโปรไฟล์ผ่าน trigger `handle_new_user()` ([§9.4](#94-สร้างโปรไฟล์ลูกค้าอัตโนมัติหลังสมัคร)) — รับประกันว่าทุกบัญชีมีแถว `customers` เสมอ; ผู้ใช้เติม `name`/`address`/`phone` ภายหลังผ่าน UPDATE (customers policy)
- การลบบัญชี: ใช้ flow **anonymize** ไม่ใช่ hard-delete (ดู [§5 หมายเหตุ 1](#5-ความสัมพันธ์และ-referential-integrity))
- **ห้าม**ใช้ `user_metadata` ในการตัดสินสิทธิ์ (ผู้ใช้แก้เองได้) — ใช้ `app_metadata` เท่านั้น
- **Client keys:** ฝั่ง browser ใช้ publishable key เท่านั้น ห้าม `service_role`/secret key หลุดเข้า client (ใน Next.js env `NEXT_PUBLIC_*` ถูกส่งไป browser)

---

## 11. Storage

- **Bucket:** `product-images` แบบ **public** (อ่านผ่าน CDN/public URL — เหมาะกับรูป catalog)
- `product_images.image_name` เก็บ **object path** ภายใน bucket เช่น `products/{product_id}/{uuid}.jpg` (ใช้กับ `getPublicUrl(path)`) — ไม่เก็บชื่อไฟล์ล้วนเพื่อกันชนกัน
- **สิทธิ์:** อ่าน public; เพิ่ม/แก้/ลบเฉพาะ admin

```sql
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
```

> การ **upsert** (แทนที่ไฟล์เดิม) ต้องมี policy ครบทั้ง INSERT + SELECT + UPDATE (มีครบตามด้านบน)
> **Orphan cleanup:** ลบ `product_images` (CASCADE) ไม่ลบไฟล์ใน bucket → ต้องมี Edge Function/scheduled job ลบ object ตาม path

---

## 12. กฎธุรกิจและ Invariants

- **Price snapshot:** `order_items.price` = ราคาต่อหน่วย ณ เวลาสั่งซื้อ ถูกตรึงจาก `products.price` โดย trigger ([§9.1](#91-ตรึงราคา-order_itemsprice-จาก-productsprice)) และ**ไม่เปลี่ยน**ตามราคาสินค้าในอนาคต — นี่คือเหตุผลที่ต้อง denormalize ราคาไว้ที่ line item
- **`total_amount = SUM(quantity × price)`** ของ order นั้น ๆ ดูแลโดย trigger ([§9.2](#92-คำนวณ-orderstotal_amount-อัตโนมัติ)) — เป็น single source of truth ไม่ต้องพึ่ง client
  - **ความหมายของ NULL:** `NULL` = ยังไม่มีรายการ (ระยะ cart/เพิ่งสร้าง); `0` = คำนวณแล้วแต่ยอดเป็นศูนย์
- **สถานะ:** สร้างเป็น `pending` เสมอ; เปลี่ยนสถานะได้เฉพาะ admin ผ่าน UPDATE
- **บรรทัดสินค้าไม่ซ้ำ:** `UNIQUE(order_id, product_id)` — สินค้าเดียวกันในออเดอร์รวมเป็นแถวเดียว (ปรับ `quantity`); ใช้ `insert ... on conflict (order_id, product_id) do update set quantity = ...` ได้

---

## 13. Security Checklist

แมปกับข้อควรระวังของ Supabase — ทั้งหมดถูกจัดการในสเปคนี้:

- [x] เปิด `enable row level security` ทุกตารางใน `public`
- [x] UPDATE policy มีทั้ง `USING` และ `WITH CHECK` (กันการย้าย/แก้ค่าข้ามเจ้าของ)
- [x] ทุกตารางที่ UPDATE ได้มี SELECT policy รองรับ (ไม่งั้น UPDATE กระทบ 0 แถวเงียบ ๆ)
- [x] ใช้ `TO authenticated` / `TO anon` แทน `auth.role()` ที่ deprecated
- [x] `authorization` ใช้ `app_metadata` เท่านั้น (ไม่ใช้ `user_metadata`)
- [x] owner-scoped tables ไม่เปิดให้ `anon` (มีเฉพาะ catalog SELECT ที่ `TO anon`)
- [x] ค่าเงิน/สถานะเป็น server-authoritative (trigger + constraint) — RLS อุดค่าในคอลัมน์ไม่ได้
- [x] GRANTs ครบ (ตารางใหม่ไม่ auto-expose ตั้งแต่ 2026-04-28)
- [x] `SECURITY DEFINER` เท่าที่จำเป็น + `set search_path = ''` ทุกตัว; `is_admin()` เป็น `SECURITY INVOKER`
- [x] Storage: write เฉพาะ admin, public read ผ่าน bucket public
- [ ] **ปิด anonymous sign-ins** (ดู [§14](#14-config-ที่ต้องตั้งค่า)) — ต้องตั้งค่าตอน deploy
- [ ] Pin เวอร์ชัน `@supabase/supabase-js`, `@supabase/ssr` + commit lockfile ตอนติดตั้ง

---

## 14. Config ที่ต้องตั้งค่า

- **ปิด anonymous sign-ins:** เพราะ `TO authenticated` ไม่กันผู้ใช้ anonymous (ผู้ใช้ anonymous มี `auth.uid()` จริงและใช้ role `authenticated`) หากเปิดไว้ ผู้ใช้ anonymous จะสร้าง `customers`/`orders` ได้ ตั้งใน `supabase/config.toml`:

  ```toml
  [auth]
  enable_anonymous_sign_ins = false
  ```

  หากต้องการ **guest checkout** ในอนาคต ให้เปิด anonymous แล้วเพิ่มเงื่อนไขใน WITH CHECK ของ owner-scoped INSERT:

  ```sql
  and (select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)) is false
  ```

- **ตั้ง admin:** `supabase.auth.admin.updateUserById(userId, { app_metadata: { role: 'admin' } })` — มีผลหลังผู้ใช้ refresh token

---

## 15. สมมติฐานและ Open Questions

| หัวข้อ | ค่า default ในสเปค | ทางเลือก/ข้อควรพิจารณา |
| --- | --- | --- |
| สกุลเงิน | สกุลเดียว | หากหลายสกุล ต้องออกแบบเพิ่ม (นอก diagram) |
| Money precision | `numeric` (ตาม diagram) | **แนะนำ** `numeric(12,2)` บน `price`/`total_amount` กันเศษสตางค์เกินจริง |
| ชนิด PK/FK | `int4` (ตาม diagram) | **แนะนำ** `int8/bigint` โดยเฉพาะ `order_items` กัน overflow ~2.1B (ต้องเปลี่ยน FK ให้ตรงชนิด) |
| ราคาขั้นต่ำ | `price >= 0` (อนุญาตของแถม) | เปลี่ยนเป็น `> 0` ถ้าไม่อนุญาตราคา 0 |
| การสร้างโปรไฟล์ | trigger `handle_new_user` | self-insert policy เป็น fallback |
| การสร้างออเดอร์ | INSERT ตรง (ปลอดภัยด้วย trigger) | **แนะนำ** RPC/Edge Function สำหรับ checkout แบบ atomic |
| Guest checkout | ปิด (ต้องล็อกอิน) | เปิดได้ด้วย is_anonymous guard |
| length ของ varchar | ไม่จำกัด (= diagram) | เพิ่ม length CHECK ถ้าต้องการเพดานฝั่ง DB |

---

## 16. ภาคผนวก: สคริปต์ SQL ครบชุด

**ลำดับ migration ที่ถูกต้อง:** enum → tables → constraints → indexes → functions → triggers → RLS/policies → grants → storage

> โค้ดในเอกสารนี้เขียนแบบตรงไปตรงมาเพื่ออ่านง่าย; เมื่อทำเป็น migration จริงควรห่อ `add constraint` / `create policy` ด้วย `DO $$ ... $$` แบบ idempotent (Postgres ไม่มี `ADD CONSTRAINT IF NOT EXISTS`)

รวมสคริปต์ทั้งหมดจาก [§3](#3-enum-types) (enum), [§4](#4-นิยามตาราง) (tables), [§6](#6-constraints-check--unique) (constraints/unique), [§7](#7-indexes) (indexes), [§8.1](#81-helper-is_admin) + [§8.3–8.7](#83-catalog-ตัวอย่าง-products--categoriesproduct_images-เหมือนกัน) (is_admin, policies, grants), [§9](#9-triggers-และ-supporting-objects) (functions/triggers), [§11](#11-storage) (storage) ตามลำดับด้านบน

### Verification queries

```sql
-- 1) ตรวจว่าทุกตารางใน public เปิด RLS
select relname, relrowsecurity
from pg_class
where relnamespace = 'public'::regnamespace and relkind = 'r'
order by relname;

-- 2) ตรวจ total_amount ตรงกับผลรวมจริง (ควรได้ 0 แถว)
select o.id, o.total_amount,
       coalesce(sum(oi.price * oi.quantity), 0) as computed
from public.orders o
left join public.order_items oi on oi.order_id = o.id
group by o.id, o.total_amount
having o.total_amount is not null
   and o.total_amount is distinct from coalesce(sum(oi.price * oi.quantity), 0);

-- 3) ตรวจ index บน FK ครบ
select indexname, indexdef from pg_indexes
where schemaname = 'public' order by tablename, indexname;
```

### ตรวจก่อน deploy จริง (นอกขอบเขตงานเอกสาร)

นำสคริปต์ไปทดสอบบน local (`supabase start`) หรือ apply ผ่าน MCP แล้วรัน advisors:

- `get_advisors` (type: `security`) — ต้องไม่มี warning เรื่อง RLS/policy
- `get_advisors` (type: `performance`) — ตรวจ index ที่ขาด
