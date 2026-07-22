# Specification: Public Storefront

## 1. Document Control

| Field | Value |
|---|---|
| Feature ID | PF-STORE-001 |
| Feature | Public Storefront |
| Status | Approved for task breakdown |
| Source | `user-stories/public-storefront.user-stories.md` |
| Primary route | `/products` |
| Detail route | `/products/[id]` |
| Authentication | Public |
| Required stories | US-01 ถึง US-05 |
| Optional story | US-06 |

Specification นี้เป็น source of truth สำหรับการพัฒนาฟีเจอร์ Public Storefront หาก requirement เปลี่ยน ต้องแก้ไฟล์นี้และ review ก่อนแก้ implementation

---

## 2. Objective

พัฒนาหน้าร้านสาธารณะสำหรับให้ผู้เยี่ยมชมดูรายการสินค้า ค้นหา กรองตามหมวดหมู่ แบ่งหน้า และดูรายละเอียดสินค้าได้โดยไม่ต้องล็อกอิน

---

## 3. Scope

### 3.1 In Scope

- Product listing
- Category filter
- Search by product name
- Product detail
- Product image gallery
- Pagination
- Public access
- Empty states
- Responsive and accessible presentation
- Optional price sorting

### 3.2 Out of Scope

- Cart
- Checkout
- Orders และ order items
- Customer account
- Login และ authorization
- Stock management
- Product publication workflow
- Admin CRUD
- Sub-category
- Search by product description
- Product recommendation
- Mutation ทุกชนิด

---

## 4. Database Contract

```dbml
Table categories {
  id   int4 [pk]
  name varchar
}

Table products {
  id          int4 [pk]
  name        varchar
  description text
  price       numeric
  category_id int4 [ref: > categories.id]
}

Table product_images {
  id         int4 [pk]
  product_id int4 [ref: > products.id]
  image_name text
  created_at timestamptz
}
```

### 4.1 Data Rules

1. แสดงสินค้าทุก record ใน `products` เพราะ schema ไม่มี `active`, `published` หรือสถานะอื่น
2. ฟีเจอร์นี้ไม่แสดงข้อมูล stock เพราะ schema ไม่มี stock quantity
3. หมวดหมู่เป็นโครงสร้างแบบ flat ไม่มี parent/child
4. `product_images.image_name` ต้องถูกแปลงเป็น URL ด้วย image resolver ที่มีอยู่ในโปรเจกต์
5. ถ้าโปรเจกต์ยังไม่มี image resolver ให้สร้าง function กลางหนึ่งจุด ห้ามประกอบ URL ซ้ำใน component
6. ทุก query เป็น read-only
7. ห้าม query ตาราง `orders`, `order_items`, `customers` หรือ `auth.users`

### 4.2 Main Image Rule

รูปหลักของสินค้าใช้ record แรกตามลำดับต่อไปนี้:

```sql
ORDER BY created_at ASC NULLS LAST, id ASC
```

ถ้าไม่มีรูป ให้ใช้ placeholder กลางของระบบ

### 4.3 Gallery Ordering

หน้ารายละเอียดเรียงรูปทั้งหมดด้วยกติกาเดียวกับรูปหลัก:

```sql
ORDER BY created_at ASC NULLS LAST, id ASC
```

---

## 5. Resolved Clarifications

| ID | Topic | Decision |
|---|---|---|
| CL-01 | รูปหลัก | ใช้รูปที่ `created_at` เก่าสุด; ถ้าเท่ากันใช้ `id` น้อยสุด |
| CL-02 | สินค้าที่แสดง | แสดงทุก record ใน `products` |
| CL-03 | สต็อก | ไม่แสดงสถานะ stock |
| CL-04 | สกุลเงิน | ใช้สกุลเงินบาท `THB` |
| CL-05 | รูปแบบราคา | locale `th-TH`, ทศนิยม 2 ตำแหน่ง |
| CL-06 | หมวดหมู่ | เป็น flat category ไม่มี sub-category |
| CL-07 | ขอบเขตการค้นหา | ค้นเฉพาะ `products.name` |
| CL-08 | วิธีค้นหา | submit form หรือกด Enter; ไม่ต้อง real-time debounce |
| CL-09 | จำนวนต่อหน้า | 12 สินค้าต่อหน้า |
| CL-10 | URL state | search, category, page และ sort เก็บใน query string |
| CL-11 | Empty states | แยกข้อความตามกรณีที่ไม่พบ |
| CL-12 | การเปลี่ยน filter | เปลี่ยน search/category/sort แล้ว reset `page=1` |

---

## 6. URL Contract

### 6.1 Product Listing

```text
/products
/products?q=coffee
/products?category=3
/products?page=2
/products?q=coffee&category=3&page=2
/products?sort=price_asc
```

### 6.2 Query Parameters

| Parameter | Type | Default | Rules |
|---|---|---:|---|
| `q` | string | empty | trim ช่องว่าง, ความยาวสูงสุด 100 ตัวอักษร |
| `category` | positive integer | empty | filter ด้วย `products.category_id` |
| `page` | positive integer | `1` | ค่าที่ไม่ถูกต้อง normalize เป็น `1` |
| `sort` | enum | default data order | `price_asc` หรือ `price_desc`; optional scope |

### 6.3 State Preservation

- Pagination ต้องรักษา `q`, `category` และ `sort`
- เปลี่ยน `q`, `category` หรือ `sort` ต้อง reset page เป็น 1
- เลือก “ทั้งหมด” ต้องลบ `category` ออกจาก URL
- ล้างคำค้นหาต้องลบ `q` ออกจาก URL
- ไม่ใส่ query parameter ที่เป็นค่า default โดยไม่จำเป็น

---

## 7. Functional Requirements

### FR-01 — Public Product Listing

ระบบต้องแสดงหน้า `/products` ได้โดยไม่ต้องล็อกอิน

แต่ละ product card ต้องมี:

- รูปหลักหรือ placeholder
- ชื่อสินค้า
- ราคาที่ format แล้ว
- ลิงก์ไป `/products/[id]`

### FR-02 — Currency Formatting

ใช้ JavaScript `Intl.NumberFormat` หรือ equivalent:

```ts
new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
```

ห้าม format ด้วย string concatenation เช่น `"฿" + price`

### FR-03 — Category Filter

- อ่านหมวดหมู่จาก `categories`
- แสดงตัวเลือก “ทั้งหมด”
- filter ด้วย category ID
- selected state ต้องตรงกับ URL
- search เดิมต้องยังอยู่เมื่อเปลี่ยน category

### FR-04 — Search

- ค้นเฉพาะ `products.name`
- case-insensitive
- partial match
- PostgreSQL semantics เทียบเท่า `ILIKE '%query%'`
- trim whitespace ก่อนค้น
- search ต้องทำงานร่วมกับ category filter

### FR-05 — Pagination

- 12 รายการต่อหน้า
- pagination ต้องเกิดที่ database query
- ต้องมี total item count เพื่อคำนวณ total pages
- มี Previous และ Next
- Previous disabled ที่หน้าแรก
- Next disabled เมื่ออยู่หน้าสุดท้าย
- ถ้า `page` มากกว่า total pages ให้แสดง empty state พร้อมลิงก์กลับหน้า 1
- ห้ามโหลดสินค้าทั้งหมดแล้วใช้ `slice()` ใน application

### FR-06 — Product Detail

หน้า `/products/[id]` ต้องแสดง:

- ชื่อสินค้า
- คำอธิบาย
- ราคา
- ชื่อหมวดหมู่
- รูปทั้งหมดแบบ gallery
- placeholder เมื่อไม่มีรูป

ถ้า `id` ไม่ใช่ positive integer หรือไม่พบ record ให้แสดง 404

### FR-07 — Optional Price Sort

เมื่อ implement US-06:

- `price_asc` เรียง `price ASC`
- `price_desc` เรียง `price DESC`
- ใช้ deterministic secondary order ด้วย `products.id ASC`
- sort ต้องทำงานร่วมกับ filter, search และ pagination

### FR-08 — Empty States

| Case | Message |
|---|---|
| ไม่มีสินค้าในระบบ | `ยังไม่มีสินค้าในระบบ` |
| ค้นหาแล้วไม่พบ | `ไม่พบสินค้าที่ตรงกับคำค้นหา` |
| category ไม่มีสินค้า | `ไม่พบสินค้าในหมวดหมู่นี้` |
| search + category ไม่พบ | `ไม่พบสินค้าตามเงื่อนไขที่เลือก` |
| page เกินช่วง | `ไม่พบสินค้าในหน้านี้` |

แต่ละ empty state ต้องมี action ที่เหมาะสม เช่น ล้างตัวกรองหรือกลับหน้าแรก

---

## 8. Data Access Requirements

### 8.1 Listing Result Shape

Data-access layer ต้องคืนข้อมูลอย่างน้อย:

```ts
type ProductListItem = {
  id: number
  name: string
  price: string | number
  mainImageName: string | null
}

type ProductListResult = {
  items: ProductListItem[]
  totalItems: number
  page: number
  pageSize: 12
  totalPages: number
}
```

### 8.2 Detail Result Shape

```ts
type ProductDetail = {
  id: number
  name: string
  description: string | null
  price: string | number
  category: {
    id: number
    name: string
  } | null
  images: Array<{
    id: number
    imageName: string
    createdAt: string | Date | null
  }>
}
```

### 8.3 Query Constraints

- เลือกเฉพาะ column ที่ใช้งาน
- หลีกเลี่ยง N+1 query
- รายการสินค้าต้องดึง main image แบบ deterministic
- detail page อนุญาตให้ดึงรูปทั้งหมดของสินค้าหนึ่งชิ้น
- count query ต้องใช้ filter เดียวกับ item query
- parameter ทุกค่าต้องผ่าน ORM parameterization หรือ prepared statement
- ห้ามต่อ SQL จาก raw user input

---

## 9. UI and Accessibility Requirements

- ใช้ semantic elements ที่เหมาะสม
- product image ทุกภาพต้องมี `alt`
- placeholder ต้องมี `alt` ที่สื่อความหมาย
- filter control ต้องมี label
- search input ต้องมี label หรือ accessible name
- disabled pagination control ต้องสื่อสถานะให้ assistive technology
- keyboard ต้องเข้าถึง search, filter, product link และ pagination ได้
- layout ต้องใช้งานได้บน mobile และ desktop
- ห้ามใช้สีเพียงอย่างเดียวเพื่อแสดง selected state

---

## 10. Error Handling

- Database error แสดง generic error state ต่อผู้ใช้
- ห้ามแสดง stack trace, SQL หรือ credential
- Logging ฝั่ง server ต้องมี context ที่ช่วย debug แต่ไม่มี secret
- invalid product ID และ product not found ใช้ 404
- invalid query parameters ใช้ normalized default ไม่ทำให้หน้า crash

---

## 11. Performance Requirements

- Pagination ต้องทำที่ database
- หน้า listing ห้ามเกิด query รูปภาพหนึ่งครั้งต่อสินค้าหนึ่งชิ้น
- เลือกเฉพาะ fields ที่จำเป็น
- รูปควรใช้ image component หรือ optimization mechanism ของ framework
- URL ของรูปต้องถูก resolve ที่จุดกลาง
- ทุก list query ต้องมี `LIMIT` และ `OFFSET` หรือ cursor equivalent
- Target: listing ใช้จำนวน query คงที่ ไม่เพิ่มตามจำนวน product cards

---

## 12. Security and Access Requirements

- `/products` และ `/products/[id]` ต้องเป็น public routes
- ห้ามเพิ่ม auth guard
- ไม่มี mutation endpoint ใน scope
- validate และ normalize URL inputs
- ห้ามใช้ raw user input ใน SQL string
- ห้าม expose internal storage credential

---

## 13. Acceptance Test Scenarios

### AT-01 — Default Listing

**Given** ระบบมีสินค้ามากกว่า 12 รายการ  
**When** เปิด `/products`  
**Then** แสดงไม่เกิน 12 รายการ พร้อมรูปหรือ placeholder ชื่อ และราคา

### AT-02 — Product Without Image

**Given** สินค้าไม่มี record ใน `product_images`  
**When** สินค้านั้นปรากฏบน listing  
**Then** แสดง placeholder โดยหน้าไม่ crash

### AT-03 — Category Filter

**Given** มีสินค้าหลายหมวดหมู่  
**When** เปิด `/products?category=3`  
**Then** แสดงเฉพาะสินค้าที่ `category_id = 3`

### AT-04 — Search

**Given** มีสินค้า `Cold Brew Coffee`  
**When** เปิด `/products?q=brew`  
**Then** พบสินค้านั้นแม้คำค้นหาเป็นเพียงบางส่วน

### AT-05 — Combined Search and Category

**When** เปิด `/products?q=coffee&category=3`  
**Then** ใช้ทั้งสองเงื่อนไขใน database query เดียวกัน

### AT-06 — Pagination State

**When** เปิด `/products?q=coffee&category=3&page=2`  
**Then** ปุ่มเปลี่ยนหน้ารักษา `q=coffee` และ `category=3`

### AT-07 — Detail Page

**Given** product ID 10 มี 3 รูป  
**When** เปิด `/products/10`  
**Then** แสดงข้อมูลสินค้า หมวดหมู่ และรูปทั้ง 3 รูปตามลำดับที่กำหนด

### AT-08 — Product Not Found

**When** เปิด product ID ที่ไม่มีอยู่  
**Then** แสดง 404

### AT-09 — Public Access

**Given** ผู้ใช้ไม่มี session  
**When** เปิด listing และ detail  
**Then** เข้าดูได้โดยไม่ redirect ไป login

### AT-10 — No N+1

**Given** listing มี 12 สินค้า  
**When** render หน้า  
**Then** จำนวน database queries ต้องไม่เพิ่มเป็นหนึ่ง query ต่อ product image

### AT-11 — Optional Sort

**When** เปิด `/products?sort=price_desc`  
**Then** สินค้าเรียงราคาจากมากไปน้อย และ pagination รักษา sort

---

## 14. Traceability Matrix

| User Story | Requirements | Acceptance Tests |
|---|---|---|
| US-01 | FR-01, FR-02, FR-08 | AT-01, AT-02, AT-09 |
| US-02 | FR-03, FR-08 | AT-03, AT-05 |
| US-03 | FR-04, FR-08 | AT-04, AT-05 |
| US-04 | FR-06 | AT-07, AT-08, AT-09 |
| US-05 | FR-05 | AT-01, AT-06, AT-10 |
| US-06 | FR-07 | AT-11 |

---

## 15. Definition of Done

- [ ] US-01 ถึง US-05 ผ่าน Acceptance Criteria ครบ
- [ ] US-06 ถูกระบุชัดว่า implemented หรือ deferred
- [ ] ไม่มี `TBD` ใน Specification
- [ ] `/products` และ `/products/[id]` เข้าได้โดยไม่ล็อกอิน
- [ ] listing query paginate ที่ database
- [ ] ไม่มี N+1 query สำหรับรูปสินค้า
- [ ] search + category + pagination ทำงานร่วมกัน
- [ ] URL สะท้อน state ที่แชร์ได้
- [ ] product not found แสดง 404
- [ ] empty states ครบทุกกรณี
- [ ] accessibility checks ผ่าน
- [ ] automated tests ที่เกี่ยวข้องผ่าน
- [ ] มี evidence ของ Acceptance Test Scenarios
- [ ] ไม่มี code แตะตารางที่อยู่นอก scope
- [ ] Specification, Tasks และ implementation ถูก commit และ review แล้ว
