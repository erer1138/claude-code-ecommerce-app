# Tasks: Public Storefront

## 1. Task Execution Rules

1. ทำ task ตามลำดับ dependency
2. ปิด task ได้เมื่อ Acceptance Checks ผ่านและมี Evidence
3. ถ้าพบ requirement ไม่ชัด ให้หยุด implementation และแก้ Specification ก่อน
4. ห้ามเปลี่ยน schema หรือเพิ่ม mutation โดยไม่แก้ scope
5. US-06 เป็น optional และต้องไม่ขวาง Definition of Done ของ US-01 ถึง US-05

### Status Convention

- `[ ]` Not started
- `[-]` In progress
- `[x]` Done
- `[!]` Blocked

---

## Phase 0 — Review and Baseline

### T-00 — ตรวจสอบโครงสร้างโปรเจกต์ปัจจุบัน

**Goal:** ระบุตำแหน่ง route, data-access layer, UI components, test setup และ image resolver ที่มีอยู่

**Dependencies:** ไม่มี

**Mapped requirements:** ทั้งหมด

**Work:**

- [ ] ตรวจ framework และ App Router structure
- [ ] ระบุ ORM หรือ database client ที่ใช้งาน
- [ ] ระบุวิธีเชื่อมต่อ Postgres/Supabase
- [ ] ตรวจว่ามี helper format currency หรือไม่
- [ ] ตรวจว่ามี placeholder image หรือไม่
- [ ] ตรวจว่ามี image URL resolver หรือไม่
- [ ] ตรวจ test runner และคำสั่ง typecheck/lint/test
- [ ] บันทึกไฟล์ที่จะสร้างหรือแก้

**Acceptance Checks:**

- [ ] ไม่มีการแก้ implementation ใน task นี้
- [ ] ได้ implementation plan ที่อิงโครงสร้างจริงของ repo
- [ ] ระบุความเสี่ยงหรือ conflict กับ Specification

**Evidence:**

- รายชื่อไฟล์ที่เกี่ยวข้อง
- คำสั่งตรวจสอบที่รัน
- สรุป architecture ปัจจุบันแบบสั้น

---

## Phase 1 — Shared Contracts and Utilities

### T-01 — สร้าง types และ query parameter parser

**Goal:** สร้าง contract กลางสำหรับ listing, detail และ URL parameters

**Dependencies:** T-00

**Mapped requirements:** FR-03, FR-04, FR-05, FR-07

**Work:**

- [ ] สร้าง type `ProductListItem`
- [ ] สร้าง type `ProductListResult`
- [ ] สร้าง type `ProductDetail`
- [ ] สร้าง parser สำหรับ `q`, `category`, `page`, `sort`
- [ ] trim `q` และจำกัดความยาว 100 ตัวอักษร
- [ ] normalize page ที่ไม่ถูกต้องเป็น 1
- [ ] allowlist sort เฉพาะค่าที่ spec กำหนด
- [ ] เพิ่ม unit tests สำหรับ parser

**Acceptance Checks:**

- [ ] parser ไม่ throw เมื่อ query parameter ผิดรูปแบบ
- [ ] raw query string ไม่ไหลเข้า data-access layer โดยไม่ normalize
- [ ] default values ตรงตาม Specification

**Evidence:**

- unit test result
- ตัวอย่าง input/output ของ parser

---

### T-02 — สร้าง currency formatter และ image resolver

**Goal:** รวม logic ที่ใช้ซ้ำไว้จุดกลาง

**Dependencies:** T-00

**Mapped requirements:** FR-01, FR-02, FR-06, UI requirements

**Work:**

- [ ] สร้างหรือ reuse currency formatter สำหรับ `th-TH` และ `THB`
- [ ] บังคับทศนิยม 2 ตำแหน่ง
- [ ] สร้างหรือ reuse `resolveProductImageUrl(imageName)`
- [ ] กำหนด placeholder กลาง
- [ ] เพิ่ม unit tests สำหรับ formatter
- [ ] ตรวจว่า component ไม่ประกอบ image URL ซ้ำเอง

**Acceptance Checks:**

- [ ] ราคา format ด้วย `Intl.NumberFormat` หรือ equivalent
- [ ] image resolver รับ `null` ได้
- [ ] ไม่มี secret หรือ storage credential ฝังใน client code

**Evidence:**

- unit test result
- ตัวอย่างราคาที่ format แล้ว
- ตัวอย่าง URL/placeholder ที่ resolver คืนค่า

---

## Phase 2 — Data Access

### T-03 — Implement product listing query

**Goal:** ดึง product listing แบบ paginate พร้อม main image โดยไม่มี N+1

**Dependencies:** T-01, T-02

**Mapped requirements:** FR-01, FR-03, FR-04, FR-05, Data Access, Performance

**Work:**

- [ ] สร้าง function สำหรับดึง listing
- [ ] select เฉพาะ `id`, `name`, `price` และ main image
- [ ] ใช้ main image ordering ตาม Specification
- [ ] รองรับ `q` แบบ case-insensitive partial match
- [ ] รองรับ category filter
- [ ] ใช้ page size 12
- [ ] ทำ pagination ที่ database
- [ ] สร้าง count query ด้วย filter เดียวกัน
- [ ] คืน `totalItems` และ `totalPages`
- [ ] หลีกเลี่ยง query ต่อรูปต่อสินค้า
- [ ] เพิ่ม integration tests หรือ repository tests

**Acceptance Checks:**

- [ ] มี `LIMIT/OFFSET` หรือ equivalent
- [ ] ไม่มี `SELECT *`
- [ ] ไม่มี N+1
- [ ] search และ category ใช้ร่วมกันได้
- [ ] count ตรงกับ filter ของ item query

**Evidence:**

- test result
- generated SQL/query log หรือคำอธิบาย query plan
- ตัวอย่างผลลัพธ์ page 1 และ page 2

---

### T-04 — Implement category query

**Goal:** ดึงรายการ category สำหรับ filter

**Dependencies:** T-00

**Mapped requirements:** FR-03

**Work:**

- [ ] สร้าง function ดึง `id` และ `name`
- [ ] กำหนด deterministic ordering
- [ ] ไม่ดึง column ที่ไม่จำเป็น
- [ ] เพิ่ม test กรณีไม่มี category

**Acceptance Checks:**

- [ ] คืน flat list
- [ ] ไม่มี dependency กับ auth
- [ ] ไม่มี mutation

**Evidence:**

- test result
- ตัวอย่าง result shape

---

### T-05 — Implement product detail query

**Goal:** ดึงรายละเอียดสินค้า หมวดหมู่ และรูปทั้งหมดตาม ID

**Dependencies:** T-02

**Mapped requirements:** FR-06, Data Access

**Work:**

- [ ] validate product ID เป็น positive integer
- [ ] ดึง product fields ที่ต้องใช้
- [ ] join หรือ include category
- [ ] ดึงรูปทั้งหมดตาม gallery ordering
- [ ] คืน `null` เมื่อไม่พบสินค้า
- [ ] เพิ่ม tests สำหรับ found, no image, multiple images และ not found

**Acceptance Checks:**

- [ ] รูปเรียงตาม `created_at ASC NULLS LAST, id ASC`
- [ ] ไม่ query ตารางนอก scope
- [ ] ไม่ throw เมื่อสินค้าไม่มี category หรือรูป
- [ ] invalid ID และ not found แยกจัดการได้

**Evidence:**

- test result
- ตัวอย่าง result ของสินค้าที่มีหลายรูป
- ตัวอย่าง result เมื่อไม่พบสินค้า

---

## Phase 3 — Product Listing UI

### T-06 — สร้างหน้า `/products`

**Goal:** แสดง product listing จาก URL state

**Dependencies:** T-01, T-03, T-04

**Mapped requirements:** FR-01, FR-02, FR-08, AT-01, AT-02, AT-09

**Work:**

- [ ] สร้างหรือแก้ route `/products`
- [ ] อ่าน query parameters ผ่าน parser
- [ ] ดึง categories และ listing
- [ ] แสดง product grid
- [ ] แสดง image, name และ formatted price
- [ ] card เชื่อมไป `/products/[id]`
- [ ] แสดง placeholder เมื่อไม่มีรูป
- [ ] route ต้อง public
- [ ] เพิ่ม loading/error boundary ตามรูปแบบของโปรเจกต์

**Acceptance Checks:**

- [ ] ไม่เกิน 12 cards ต่อหน้า
- [ ] ไม่ต้องล็อกอิน
- [ ] รูปทุกภาพมี alt
- [ ] product card ใช้งานด้วย keyboard ได้
- [ ] ไม่ expose database error

**Evidence:**

- screenshot desktop และ mobile
- URL ที่ทดสอบ
- test/typecheck result

---

### T-07 — สร้าง search และ category filter controls

**Goal:** ให้ผู้ใช้เปลี่ยน filter โดย state สะท้อนใน URL

**Dependencies:** T-06

**Mapped requirements:** FR-03, FR-04, AT-03, AT-04, AT-05

**Work:**

- [ ] สร้าง search form
- [ ] submit ด้วยปุ่มหรือ Enter
- [ ] สร้าง category filter พร้อม “ทั้งหมด”
- [ ] selected category ตรงกับ URL
- [ ] เปลี่ยน search/category แล้ว reset page
- [ ] รักษา filter อีกตัวเมื่อเปลี่ยนค่า
- [ ] ล้าง filter โดยลบ parameter จาก URL
- [ ] เพิ่ม accessible labels

**Acceptance Checks:**

- [ ] `/products?q=brew` ค้นหาแบบ partial match
- [ ] `/products?category=3` filter ได้
- [ ] `q` และ `category` ทำงานพร้อมกัน
- [ ] refresh หน้าแล้ว state ไม่หาย
- [ ] link ที่ copy ไปเปิดใหม่ให้ผลลัพธ์เดิม

**Evidence:**

- URLs ของแต่ละ scenario
- screenshot selected state
- test result

---

### T-08 — สร้าง pagination controls

**Goal:** เปลี่ยนหน้าโดยรักษา filter state

**Dependencies:** T-06, T-07

**Mapped requirements:** FR-05, AT-06

**Work:**

- [ ] แสดง Previous และ Next
- [ ] disable Previous ที่ page 1
- [ ] disable Next ที่ last page
- [ ] รักษา `q`, `category`, `sort`
- [ ] ใช้ page จาก URL
- [ ] รองรับ page เกิน total pages
- [ ] เพิ่ม accessible state ให้ disabled controls

**Acceptance Checks:**

- [ ] page 2 แสดง offset ถูกต้อง
- [ ] pagination ไม่ใช้ client-side slicing
- [ ] filter state ไม่หายเมื่อเปลี่ยนหน้า
- [ ] page invalid normalize เป็น 1
- [ ] page เกินช่วงแสดง empty state ตาม spec

**Evidence:**

- URLs page 1/page 2
- query log ที่เห็น limit/offset
- screenshot pagination states

---

### T-09 — Implement listing empty states

**Goal:** แสดงข้อความและ action ที่ตรงกับสาเหตุ

**Dependencies:** T-07, T-08

**Mapped requirements:** FR-08

**Work:**

- [ ] empty state เมื่อไม่มีสินค้าในระบบ
- [ ] empty state เมื่อ search ไม่พบ
- [ ] empty state เมื่อ category ไม่มีสินค้า
- [ ] empty state เมื่อ combined filters ไม่พบ
- [ ] empty state เมื่อ page เกินช่วง
- [ ] เพิ่ม action ล้าง filter หรือกลับหน้าแรก

**Acceptance Checks:**

- [ ] ข้อความตรงตาม Specification
- [ ] ผู้ใช้กลับสู่ state ที่มีผลลัพธ์ได้
- [ ] empty state ไม่แสดงพร้อม product grid

**Evidence:**

- screenshot ทุกกรณี
- URLs ที่ใช้สร้างแต่ละกรณี

---

## Phase 4 — Product Detail UI

### T-10 — สร้างหน้า `/products/[id]`

**Goal:** แสดงรายละเอียดสินค้าและ gallery

**Dependencies:** T-02, T-05

**Mapped requirements:** FR-06, AT-07, AT-08, AT-09

**Work:**

- [ ] สร้าง dynamic route
- [ ] parse และ validate `id`
- [ ] เรียก product detail query
- [ ] แสดง name, description, price และ category
- [ ] แสดงรูปทั้งหมดตามลำดับ
- [ ] แสดง placeholder เมื่อไม่มีรูป
- [ ] เรียก 404 mechanism ของ framework เมื่อ invalid/not found
- [ ] route ต้อง public
- [ ] รองรับ mobile และ desktop

**Acceptance Checks:**

- [ ] สินค้ามีหลายรูปแสดงครบ
- [ ] รูปทุกภาพมี alt
- [ ] product not found แสดง 404
- [ ] ไม่มี redirect ไป login
- [ ] ไม่แสดง raw image_name เมื่อ URL resolve ไม่สำเร็จ

**Evidence:**

- screenshot found/no-image/not-found
- URLs ที่ทดสอบ
- test/typecheck result

---

## Phase 5 — Optional Scope

### T-11 — เพิ่ม sort ตามราคา

**Goal:** Implement US-06 โดยไม่ทำให้ filter/pagination เดิมเสีย

**Dependencies:** T-03, T-07, T-08

**Mapped requirements:** FR-07, AT-11

**Work:**

- [ ] เพิ่ม allowlist `price_asc`, `price_desc`
- [ ] เพิ่ม sort ใน database query
- [ ] ใช้ secondary order `products.id ASC`
- [ ] เพิ่ม sort control
- [ ] รักษา q/category ขณะเปลี่ยน sort
- [ ] reset page เมื่อเปลี่ยน sort
- [ ] รักษา sort ขณะเปลี่ยน page
- [ ] เพิ่ม tests

**Acceptance Checks:**

- [ ] ascending และ descending ถูกต้อง
- [ ] URL สะท้อน sort
- [ ] combined state ทำงานครบ
- [ ] invalid sort ใช้ default โดยไม่ crash

**Evidence:**

- URLs asc/desc
- test result
- screenshot sort control

---

## Phase 6 — Quality and Validation

### T-12 — Automated tests

**Goal:** ครอบคลุม business behavior และ edge cases หลัก

**Dependencies:** T-06 ถึง T-10; T-11 ถ้า implement

**Mapped requirements:** Acceptance Test Scenarios ทั้งหมด

**Work:**

- [ ] unit tests query parser
- [ ] unit tests currency formatter
- [ ] data-access tests listing
- [ ] data-access tests detail
- [ ] page/component tests ตาม test stack ของโปรเจกต์
- [ ] test combined filters
- [ ] test pagination state preservation
- [ ] test 404
- [ ] test placeholder
- [ ] test optional sort หาก implement

**Acceptance Checks:**

- [ ] tests ผ่านทั้งหมด
- [ ] tests ตรวจ behavior ไม่ผูกกับ implementation detail เกินจำเป็น
- [ ] ไม่มี flaky test ที่ทราบอยู่

**Evidence:**

- command ที่ใช้รัน
- full test summary

---

### T-13 — Accessibility and responsive validation

**Goal:** ตรวจ UI ตาม accessibility requirements

**Dependencies:** T-09, T-10

**Mapped requirements:** UI and Accessibility Requirements

**Work:**

- [ ] ตรวจ keyboard navigation
- [ ] ตรวจ labels และ accessible names
- [ ] ตรวจ alt text
- [ ] ตรวจ disabled pagination semantics
- [ ] ตรวจ mobile viewport
- [ ] ตรวจ desktop viewport
- [ ] รัน accessibility checker ที่โปรเจกต์รองรับ

**Acceptance Checks:**

- [ ] ไม่มี critical accessibility issue
- [ ] workflow หลักทำได้ด้วย keyboard
- [ ] selected filter ไม่สื่อด้วยสีอย่างเดียว

**Evidence:**

- accessibility report
- screenshots mobile/desktop
- manual keyboard checklist

---

### T-14 — Performance and security review

**Goal:** ยืนยันว่า implementation ตรง constraints

**Dependencies:** T-12

**Mapped requirements:** Performance, Security, Data Access

**Work:**

- [ ] ตรวจ query count ของ listing
- [ ] ยืนยันไม่มี N+1
- [ ] ยืนยัน list query paginate ที่ database
- [ ] ตรวจ parameterization
- [ ] ตรวจ public route behavior
- [ ] ตรวจว่าไม่มี mutation
- [ ] ตรวจว่าไม่แตะตารางนอก scope
- [ ] ตรวจว่า error response ไม่ expose internals

**Acceptance Checks:**

- [ ] query count ไม่โตตามจำนวนสินค้า
- [ ] ไม่มี raw SQL interpolation จาก user input
- [ ] unauthenticated visitor เข้าได้
- [ ] ไม่มี secret ใน client bundle

**Evidence:**

- query log หรือ profiler output
- security review notes
- route access result

---

### T-15 — Final acceptance validation

**Goal:** ตรวจครบทุก Acceptance Criteria และ Definition of Done

**Dependencies:** T-12, T-13, T-14

**Mapped requirements:** US-01 ถึง US-05; US-06 ถ้า implement

**Work:**

- [ ] รัน AT-01 ถึง AT-10
- [ ] รัน AT-11 ถ้า implement optional sort
- [ ] ทำ traceability review ระหว่าง US → FR → AT → Tasks
- [ ] ตรวจว่า Specification ไม่มี `TBD`
- [ ] ตรวจ diff ว่าไม่มีงานนอก scope
- [ ] บันทึก known limitations
- [ ] สรุป evidence สำหรับ review

**Acceptance Checks:**

- [ ] Definition of Done ผ่านครบ
- [ ] ทุก required story มี evidence
- [ ] optional story ระบุ `implemented` หรือ `deferred`
- [ ] reviewer สามารถ reproduce ผลลัพธ์ได้

**Evidence:**

- Acceptance checklist ที่กรอกแล้ว
- test summary
- URLs/screenshots
- final review note

---

## Task Dependency Summary

```text
T-00
├── T-01 ──┬── T-03 ──┬── T-06 ── T-07 ── T-08 ── T-09
│          │           │                    └── T-11 (optional)
│          │           └── T-11 (optional)
│          └── T-05 ─────────────── T-10
├── T-02 ──┬── T-03
│          ├── T-05
│          ├── T-06
│          └── T-10
└── T-04 ───────────────── T-06

T-09 + T-10 (+ T-11 optional)
          ↓
        T-12
          ↓
        T-13
          ↓
        T-14
          ↓
        T-15
```

## Recommended Classroom Checkpoints

| Checkpoint | After Task | Human Review Focus |
|---|---|---|
| CP-01 | T-00 | AI เข้าใจ repo จริงหรือเดา |
| CP-02 | T-02 | contracts และ shared rules ตรง spec |
| CP-03 | T-05 | query correctness, N+1, scope |
| CP-04 | T-09 | listing behavior และ URL state |
| CP-05 | T-10 | detail, gallery และ 404 |
| CP-06 | T-12 | test coverage และ evidence |
| CP-07 | T-15 | Acceptance Criteria และ DoD |
