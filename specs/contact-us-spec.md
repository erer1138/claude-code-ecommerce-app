# ฟีเจอร์: หน้าติดต่อเรา (Contact Us)

หน้า `/contact` แบ่ง 2 คอลัมน์ — ซ้ายเป็นข้อมูลติดต่อ ขวาเป็นฟอร์มที่ส่งอีเมลแจ้งแอดมินด้วย Resend

สถานะ: implement แล้ว — ดูสรุปการตัดสินใจใน §15 และสถานะ acceptance ใน §14

---

## 1. เป้าหมาย

### User story

> **ในฐานะ** ผู้เยี่ยมชมเว็บไซต์
> **ฉันต้องการ** ส่งคำถามถึงร้านจากหน้าเว็บได้โดยตรง
> **เพื่อ** ได้คำตอบโดยไม่ต้องเปิดโปรแกรมอีเมลเอง

`src/components/footer.tsx` มีลิงก์ `Contact Us` ชี้ไป `/contact` อยู่แล้ว แต่ route ยังไม่มี → กดแล้ว 404

### สิ่งที่เป็นครั้งแรกของโปรเจกต์

1. **Mutation แรก** — repo นี้ยังไม่มี `"use server"` และไม่มี API route เลย
2. **ใช้ zod ครั้งแรก** — ติดตั้งไว้แล้วแต่ยังไม่มีไฟล์ไหน import
3. **Secret ฝั่ง server ตัวแรก** — ปัจจุบันมีแต่ `NEXT_PUBLIC_*`

---

## 2. ขอบเขต

**อยู่ในขอบเขต**

- หน้า `/contact` แบบ public เลย์เอาต์ 2 คอลัมน์
- ฟอร์ม 4 ช่อง + honeypot, validate ด้วย zod ฝั่ง server
- ส่งอีเมลแจ้งแอดมินด้วย Resend
- Pending / success / error state
- Accessibility และ responsive
- เพิ่มลิงก์ `/contact` ใน `NAV_LINKS` ของ header

**นอกขอบเขต**

| ไม่ทำ | เหตุผล |
|---|---|
| บันทึกลง database | ตาราง `public` ใหม่ต้องจัดการ RLS + explicit grants ให้ครบ (ดู `spec/db-supabase-spec.md`) ไม่คุ้มกับฟอร์มติดต่อ |
| Auto-reply กลับผู้ส่ง | เสี่ยงถูกใช้ยิง spam ใส่คนอื่นผ่านฟอร์มเรา |
| Rate limiting | ต้องใช้ shared store ถึงจะถูก — in-memory รีเซ็ตทุก deploy และพังเมื่อรันหลาย instance |
| CAPTCHA, แผนที่, ไฟล์แนบ, หน้า admin | ไม่จำเป็นต่อ scope นี้ |

---

## 3. ไฟล์ที่ต้องสร้าง

```text
src/app/contact/page.tsx                    Server Component — หน้า 2 คอลัมน์
src/app/contact/actions.ts                  "use server" — Server Action
src/components/contact/contact-form.tsx     "use client" — ฟอร์ม
src/components/contact/contact-info.tsx     Server Component — คอลัมน์ซ้าย
src/lib/contact/types.ts                    domain types
src/lib/contact/schema.ts                   zod schema
src/lib/contact/send-contact-email.ts       Resend
```

Logic อยู่ใน `src/lib/**` route แค่ orchestrate — แบบเดียวกับ `src/app/products/page.tsx`

เพิ่มด้วย:

- `export const metadata = { title: "ติดต่อเรา | ShopVibe" }` ใน `page.tsx`
- `{ href: "/contact", label: "ติดต่อเรา" }` ใน `NAV_LINKS` (`src/components/header.tsx`) — array เดียวขับทั้ง desktop และ mobile

หน้านี้เป็น static ล้วน ไม่ดึงข้อมูล → ไม่ต้องเป็น `async` และไม่ต้องมี `loading.tsx`

---

## 4. UI — เลย์เอาต์ 2 คอลัมน์

### 4.1 Layout

ใช้กติกาเดียวกับ `src/app/products/[id]/page.tsx` ซึ่งเป็นหน้า 2 คอลัมน์ที่มีอยู่แล้ว:

```tsx
<div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
  <h1 className="font-display text-3xl font-bold text-text-primary">ติดต่อเรา</h1>
  <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
    <ContactInfo />
    <ContactForm />
  </div>
</div>
```

- แตกเป็น 2 คอลัมน์ที่ `lg` ขึ้นไป ต่ำกว่านั้น stack เป็นคอลัมน์เดียว
- บนมือถือ **ข้อมูลติดต่อขึ้นก่อนฟอร์ม** — ห้ามใช้ `order-*` สลับ เพราะลำดับ DOM จะไม่ตรงกับที่ตาเห็น

### 4.2 คอลัมน์ซ้าย — ข้อมูลติดต่อ (Server Component)

1. **ข้อมูลติดต่อ** — ที่อยู่, เบอร์โทร (ลิงก์ `tel:`), อีเมล (ลิงก์ `mailto:`), เวลาทำการ
2. **ลิงก์โซเชียล** — reuse `SOCIAL_LINKS` + `SocialIcon` จาก `src/components/footer.tsx` ถ้าใช้สองที่ให้ย้ายขึ้นมาเป็น component กลาง ห้าม copy โค้ด icon ซ้ำ
3. **FAQ 3–4 ข้อ** — ใช้ `<details>` / `<summary>` ของ HTML (accessible ในตัว ไม่ต้องเป็น client component)

### 4.3 คอลัมน์ขวา — ฟอร์ม (Client Component)

เรียงจากบนลงล่าง: หัวข้อ → status banner → ช่องกรอก 4 ช่อง → honeypot → ปุ่ม submit

### 4.4 Design tokens

ใช้ ShopVibe token ตาม `CLAUDE.md`:

| ส่วน | Class |
|---|---|
| การ์ด | `bg-surface rounded-large border border-border shadow-subtle` |
| หัวข้อ / เนื้อความ | `font-display text-text-primary` / `font-body text-text-secondary` |
| Input | `h-11 rounded-medium border border-border bg-surface px-4 font-body text-sm text-text-primary placeholder:text-text-placeholder focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/15` |
| ปุ่ม | `h-11 rounded-full bg-primary px-6 font-body text-sm font-bold text-white hover:bg-primary-hover active:bg-primary-active` |
| Banner | success `bg-success-bg text-success-text` / error `bg-error-bg text-error-text` |

- `src/components/ui/{input,textarea,button}.tsx` ใช้ shadcn token และสูง `h-8` ซึ่งไม่เข้ากับ control ของ storefront ที่สูง `h-11` → ใช้ `<input>` / `<textarea>` ธรรมดาแบบ `src/components/products/search-form.tsx` แทน
- class ของปุ่ม CTA ถูก copy ไว้แล้วหลายจุด ให้ import `PRIMARY_CTA_CLASSNAME` มาใช้ หรือประกาศใน `src/components/contact/styles.ts` จุดเดียว **ห้าม inline ซ้ำ**

### 4.5 States

| State | พฤติกรรม |
|---|---|
| `idle` | ฟอร์มว่าง ไม่มี banner |
| `pending` | ปุ่ม `disabled` ข้อความเป็น `กำลังส่ง...` |
| `success` | ล้างฟอร์ม + banner เขียว `ส่งข้อความเรียบร้อยแล้ว เราจะติดต่อกลับภายใน 1-2 วันทำการ` |
| `error` — validation | แสดง error ใต้ช่องที่ผิด |
| `error` — ส่งไม่สำเร็จ | banner แดงข้อความ generic + เสนอลิงก์ `mailto:` สำรอง |

**ทุกกรณีที่ error ต้องคงค่าที่ผู้ใช้กรอกไว้** — คนที่พิมพ์ข้อความยาวแล้วโดนล้างเพราะอีเมลผิด จะไม่กลับมากรอกใหม่

---

## 5. ฟอร์มและ Validation

| `name` | ชนิด | กติกา | ข้อความเมื่อผิด |
|---|---|---|---|
| `name` | text | trim แล้วยาว 2–100 | `กรุณากรอกชื่อ 2-100 ตัวอักษร` |
| `email` | email | `z.email()` | `รูปแบบอีเมลไม่ถูกต้อง` |
| `subject` | text | trim แล้วยาว 3–150 | `กรุณากรอกหัวข้อ 3-150 ตัวอักษร` |
| `message` | textarea | trim แล้วยาว 10–2000 | `กรุณากรอกข้อความ 10-2000 ตัวอักษร` |
| `company` | honeypot | ต้องว่าง | ไม่มี — ดู FR-08 |

```ts
const contactFormSchema = z.object({
  name: z.string().trim().min(2, "...").max(100, "..."),
  email: z.email("รูปแบบอีเมลไม่ถูกต้อง"),
  subject: z.string().trim().min(3, "...").max(150, "..."),
  message: z.string().trim().min(10, "...").max(2000, "..."),
});
```

- ใช้ `z.email()` แบบ top-level ของ zod v4 — `z.string().email()` deprecated แล้ว
- ใช้ `safeParse()` + `z.flattenError()` เพื่อได้ `fieldErrors` แบบ flat
- **trim ก่อน validate เสมอ** ข้อความที่มีแต่ช่องว่างต้องไม่ผ่าน
- ฟังก์ชัน parse **ห้าม throw** ให้คืน error เป็นค่า — หลักการเดียวกับ `parseProductListParams` ใน `src/lib/products/query-params.ts`
- ใส่ `maxLength` ที่ input เพื่อช่วยผู้ใช้ แต่**ไม่ใช่การ validate** (ดู FR-04)

---

## 6. Functional Requirements

### FR-01 — Public Page

`/contact` เข้าถึงได้โดยไม่ต้องล็อกอิน ห้ามเพิ่ม auth guard ทั้งใน route และ Server Action

### FR-02 — Two-Column Responsive Layout

2 คอลัมน์กว้างเท่ากันที่ `lg` ขึ้นไป ต่ำกว่านั้นคอลัมน์เดียวโดยข้อมูลติดต่ออยู่เหนือฟอร์ม

### FR-03 — Contact Form

มี field ครบตาม §5 ทุกช่องมี `<label>` ที่มองเห็นได้ ผูกกับ input ด้วย `htmlFor` / `id`

### FR-04 — Server-Side Validation

- Validation ที่มีผลจริงเกิดใน Server Action ด้วย zod
- HTML attribute (`required`, `type="email"`, `maxLength`) เป็นแค่ UX **ไม่ใช่ security boundary** เพราะ Server Action ถูกยิง POST ตรงได้โดยไม่ผ่าน UI

### FR-05 — Send Email via Resend

ส่งอีเมลฉบับเดียวจาก `CONTACT_FROM_EMAIL` ไป `CONTACT_TO_EMAIL` ตั้ง `replyTo` เป็นอีเมลผู้กรอก

**ห้ามตั้ง `from` เป็นอีเมลผู้ใช้** — โดเมนผู้ใช้ไม่ได้ verify กับ Resend อีเมลจะถูกปฏิเสธหรือเข้า spam

### FR-06 — Pending State

```tsx
const [state, formAction, pending] = useActionState(submitContactForm, INITIAL_STATE);
```

ระหว่างส่ง ปุ่ม `disabled` และเปลี่ยนข้อความ ไม่ใช่แค่จางลง

### FR-07 — Success และ Error State

- Success: banner + ล้างฟอร์ม ไม่ redirect และไม่ต้อง `revalidatePath` เพราะไม่มี cache ที่เปลี่ยน
- Field error: ใต้ช่องที่ผิด ผูกด้วย `aria-describedby` + `role="alert"`
- Form error: banner บนฟอร์ม ใช้กับความล้มเหลวที่ไม่ผูกกับช่องใดช่องหนึ่ง

### FR-08 — Honeypot

- ถ้า `company` มีค่า → **คืน success ตามปกติ แต่ไม่ส่งอีเมลจริง** และ log ไว้ฝั่ง server
- เหตุผลที่ไม่คืน error: ถ้าคืน error บอตจะรู้ว่าติดกับดักแล้วปรับตัว

---

## 7. Server Action

### 7.1 Types

```ts
export type ContactFormField = "name" | "email" | "subject" | "message";

export type ContactInput = Record<ContactFormField, string>;

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<ContactFormField, string[]>>;
  values?: Partial<ContactInput>;
};
```

ใช้ `type` ไม่ใช่ `interface` ตามแบบ `src/lib/products/types.ts` — `values` ใช้เติมค่ากลับเข้าฟอร์มตาม §4.5 และต้องไม่มี `company`

### 7.2 Signature

```ts
"use server";

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState>;
```

`prevState` ต้องเป็น argument แรกเมื่อใช้กับ `useActionState`

### 7.3 ลำดับการทำงาน

1. `company` ไม่ว่าง → log แล้ว return success ปลอม (FR-08)
2. `parseContactForm()` ไม่ผ่าน → คืน `fieldErrors` + `values`
3. `sendContactEmail()` ล้มเหลว → log แล้วคืนข้อความ generic + `values`
4. สำเร็จ → คืน `status: "success"`

ค่าที่ action คืนจะถูก serialize ส่งไปฝั่ง client ทั้งหมด — คืนเฉพาะที่ UI ใช้

---

## 8. ส่งอีเมลด้วย Resend

```bash
npm install resend
```

### 8.1 Environment variables

| ตัวแปร | ตัวอย่าง |
|---|---|
| `RESEND_API_KEY` | `re_xxxxxxxx` |
| `CONTACT_FROM_EMAIL` | `ShopVibe <noreply@yourdomain.com>` (ระหว่างพัฒนาใช้ `onboarding@resend.dev` ได้) |
| `CONTACT_TO_EMAIL` | `support@yourdomain.com` |

- **ห้ามมี prefix `NEXT_PUBLIC_`** เด็ดขาด จะหลุดเข้า client bundle
- อ่าน `process.env` **แบบ lazy ในฟังก์ชัน ไม่ใช่ระดับ module** และตรวจครบทั้งสามตัวก่อนใช้ — แบบเดียวกับ `createSupabaseServerClient()` ใน `src/lib/supabase/server-client.ts`

```ts
if (!apiKey || !from || !to) {
  throw new Error("Missing Resend environment variables");
}
```

ข้อความ error ต้องไม่บอกว่าตัวไหนหาย และไม่มีค่าจริงอยู่ในข้อความ

เอกสาร env ใส่ไว้ใน `CLAUDE.md` ไม่สร้าง `.env.example` เพราะ `.gitignore` ignore `.env*` ทั้งหมด

### 8.2 Payload

```ts
const { data, error } = await resend.emails.send({
  from,
  to: [to],
  replyTo: input.email,
  subject: `[ShopVibe Contact] ${input.subject}`,
  text: buildPlainTextBody(input),
});
```

กติกาของ Resend Node SDK:

1. **ทุก parameter เป็น camelCase** — `replyTo` ไม่ใช่ `reply_to`
2. **`html` / `text` / `react` ใช้ร่วมกันไม่ได้** — spec นี้ใช้ `text` อย่างเดียว ตัดปัญหา HTML injection ทิ้ง
3. **SDK คืน `{ data, error }` ไม่ throw** เมื่อ API ปฏิเสธ → ต้องเช็ค `error` เอง `try/catch` อย่างเดียวไม่พอ (แต่ยังจำเป็นสำหรับ network error)

เนื้ออีเมล:

```text
ข้อความใหม่จากหน้า Contact Us

ชื่อ:     <name>
อีเมล:    <email>
หัวข้อ:   <subject>

ข้อความ:
<message>
```

### 8.3 Return contract

```ts
export async function sendContactEmail(input: ContactInput): Promise<void>;
```

ไม่คืน email id ออกไปข้างนอก เมื่อล้มเหลวให้ `throw new Error("Failed to send contact email", { cause: error })` แล้วให้ action แปลงเป็นข้อความ generic — รูปแบบ `{ cause }` เดียวกับ `assertNoQueryError()`

---

## 9. Error Handling และ Security

### 9.1 Error handling

- ผู้ใช้เห็นเฉพาะข้อความ generic: `ส่งข้อความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หรือติดต่อเราทางอีเมลโดยตรง`
- **ห้ามหลุดถึง client**: Resend error object, API key, stack trace, ข้อความ error ดิบจาก SDK
- Log ฝั่ง server ต้องพอ debug (`error.cause`) แต่ห้าม log API key และไม่ควร log ข้อความเต็มของผู้ใช้
- Validation error ไม่ใช่ error ของระบบ — ไม่ต้อง log และไม่ขึ้น banner
- ไม่ต้องมี `error.tsx` เพราะทุกความล้มเหลวถูกจัดการเป็นค่าใน `ContactFormState` ไม่ throw ทะลุออกไป

### 9.2 Server Action คือ public endpoint

Server Action ถูก compile เป็น POST endpoint — ใครส่ง POST เดียวกันได้ก็เรียกได้โดยไม่ผ่าน UI ของเรา

- ถือว่า `FormData` ทุกค่าไม่น่าเชื่อถือ validate ใน action เสมอ
- **ห้ามรับที่อยู่ปลายทางจาก client** — `CONTACT_TO_EMAIL` มาจาก env เท่านั้น ไม่งั้นฟอร์มกลายเป็น open relay ให้คนอื่นใช้ส่งอีเมลผ่านโดเมนเรา
- ค่าที่ผู้ใช้กรอกห้ามถูกใช้เป็น header ของอีเมล นอกจาก `replyTo`

Next.js ให้มาแล้วไม่ต้องเขียนเอง: **CSRF origin check**, **body limit 1MB**, **encrypted action ID** — แต่ไม่ใช่ของแทน validation

---

## 10. Accessibility

- ทุก input มี `<label>` ที่มองเห็นได้ (ไม่ใช่ `sr-only`) ผูกด้วย `htmlFor` / `id`
- ช่องที่ผิด: `aria-invalid="true"` + `aria-describedby` ชี้ไป `id` ของข้อความ error
- ข้อความ error รายช่องอยู่ในองค์ประกอบที่มี `role="alert"`
- Banner สรุปผลอยู่ใน region ที่มี `aria-live="polite"` และ `role="status"`
- Honeypot ต้อง `aria-hidden="true"`, `tabIndex={-1}`, `autoComplete="off"` และซ่อนด้วย CSS ที่**ไม่ใช่** `sr-only` (เพราะ `sr-only` ตั้งใจให้ screen reader อ่าน)
- ห้ามใช้สีเพียงอย่างเดียวสื่อว่าช่องไหนผิด ต้องมีข้อความกำกับ
- ใช้งานได้ด้วยคีย์บอร์ดล้วนตั้งแต่กรอกจนส่ง

---

## 11. Edge Cases

| กรณี | พฤติกรรมที่ต้องการ |
|---|---|
| กรอกเฉพาะช่องว่างทุกช่อง | trim แล้วไม่ผ่าน → field error ทุกช่อง ไม่ส่งอีเมล |
| อีเมลผิดรูปแบบ | error เฉพาะช่อง `email` ค่าช่องอื่นยังอยู่ครบ |
| ข้อความเกิน 2000 ตัวอักษร | `maxLength` กันตั้งแต่พิมพ์ ถ้า POST ตรงเข้ามา → field error |
| `company` มีค่า | success ปลอม ไม่ส่งอีเมล log ไว้ |
| `RESEND_API_KEY` ไม่ได้ตั้ง | banner generic — **ห้าม**บอกผู้ใช้ว่าเป็นปัญหา config |
| Resend คืน `error` หรือ network timeout | banner generic + log `error.cause` ฟอร์มคงค่าไว้ |
| กด submit ซ้ำรัว ๆ | ปุ่ม `disabled` กันได้ในทางปฏิบัติ POST ตรงยังซ้ำได้ — ยอมรับตาม §2 |
| JavaScript ยังไม่ hydrate | ฟอร์ม submit ได้ (ดู §12) แต่ไม่เห็น pending state |

---

## 12. Non-functional

- **Progressive enhancement** — ใช้ `<form action={formAction}>` ไม่ใช่ `onSubmit` + `fetch` ฟอร์มจึง submit ได้แม้ JavaScript ยังโหลดไม่เสร็จ ข้อได้เปรียบนี้หายทันทีถ้าเปลี่ยนไปเรียก action ผ่าน event handler
- `"use client"` อยู่ที่ `contact-form.tsx` เท่านั้น **ห้ามใส่ที่ `page.tsx`**
- `zod` และ `resend` ต้องไม่ถูก import จาก client component
- ไม่มี database query ในหน้านี้ ทั้งตอน render และตอน submit

---

## 13. Acceptance Test Scenarios

### AT-01 — Public Access

**When** เปิด `/contact` โดยไม่มี session
**Then** เห็นหน้าเต็มโดยไม่ถูก redirect

### AT-02 — Two-Column Layout

**When** เปิดบน desktop
**Then** ข้อมูลติดต่ออยู่ซ้าย ฟอร์มอยู่ขวา กว้างเท่ากัน

### AT-03 — Mobile Stacking

**When** เปิดบน viewport ต่ำกว่า `lg`
**Then** เรียงคอลัมน์เดียว ข้อมูลติดต่ออยู่เหนือฟอร์ม

### AT-04 — Footer Link

**When** กด `Contact Us` ใน footer
**Then** ไปถึง `/contact` ไม่ใช่ 404

### AT-05 — Successful Submission

**Given** กรอกครบถูกต้อง
**When** กด submit
**Then** เห็น banner ยืนยัน ฟอร์มถูกล้าง และมีอีเมลเข้าที่ `CONTACT_TO_EMAIL`

### AT-06 — Reply-To

**When** แอดมินกด Reply ในอีเมลที่ได้รับ
**Then** ปลายทางเป็นอีเมลผู้กรอก ไม่ใช่ `CONTACT_FROM_EMAIL`

### AT-07 — Validation Error Preserves Input

**Given** กรอกข้อความยาว ๆ แต่อีเมลผิด
**When** กด submit
**Then** เห็น error เฉพาะช่องอีเมล และข้อความที่พิมพ์ยังอยู่ครบ

### AT-08 — Honeypot

**Given** POST ที่มี `company` ไม่ว่าง
**Then** คืน success แต่ `sendContactEmail` ไม่ถูกเรียก

### AT-09 — Failure Is Generic

**Given** Resend คืน `error` หรือ env ไม่ครบ
**When** กด submit
**Then** เห็นข้อความ generic ไม่มีรายละเอียดระบบหลุดออกมา และค่าที่กรอกยังอยู่

### AT-10 — No Secret in Client Bundle

**When** ค้น `RESEND_API_KEY` ใน client bundle หลัง `npm run build`
**Then** ไม่พบทั้งชื่อและค่า

---

## 14. Acceptance Criteria

Implement แล้ว — ข้อที่ต้องมี Resend API key จริงถึงจะยืนยันได้ ระบุไว้ท้ายรายการ

- [x] `/contact` เปิดได้โดยไม่ต้องล็อกอิน
- [x] 2 คอลัมน์บน desktop, stack บนมือถือโดยข้อมูลติดต่ออยู่ก่อนฟอร์ม
- [x] คอลัมน์ซ้ายมีครบ: ข้อมูลติดต่อ, โซเชียล, FAQ
- [x] ลิงก์ footer ไม่ 404 และเพิ่ม `/contact` ใน `NAV_LINKS` แล้ว
- [x] Validation ทำที่ Server Action ด้วย zod และไม่ throw เมื่อ input ผิด
- [x] Error แสดงรายช่อง และค่าที่กรอกไม่หาย
- [ ] ส่งอีเมลถึง `CONTACT_TO_EMAIL` สำเร็จ พร้อม `replyTo` ถูกต้อง — โค้ดพร้อมและมี unit test คุม payload แล้ว รอตั้ง env จริงเพื่อยืนยัน end-to-end
- [x] Pending / success / error state ครบและแยกจากกันชัดเจน
- [x] Honeypot ทำงาน: มีค่า → success ปลอม ไม่ส่งอีเมล
- [x] ไม่มี error object, API key หรือ stack trace หลุดถึง client
- [x] `RESEND_API_KEY` ไม่อยู่ใน client bundle
- [x] Accessibility ตาม §10 ครบ
- [x] `npx vitest run`, `npm run lint`, `npx tsc --noEmit`, `npm run build` ผ่าน
- [x] เอกสาร env var เพิ่มใน `CLAUDE.md` แล้ว

---

## 15. สรุปการตัดสินใจ

| ID | คำถาม | คำตอบ |
|---|---|---|
| CL-01 | Route | `/contact` — footer ลิงก์ไปที่นี่อยู่แล้ว |
| CL-02 | เก็บลง database ไหม | **ไม่** ตารางใหม่ต้องจัดการ RLS + grants ให้ครบ ไม่คุ้ม |
| CL-03 | ส่งกี่ฉบับ | ฉบับเดียวถึงแอดมิน ไม่มี auto-reply |
| CL-04 | `from` เป็นอีเมลผู้ใช้ได้ไหม | **ไม่ได้** ต้องเป็นโดเมนที่ verify แล้ว ใช้ `replyTo` แทน |
| CL-05 | `html` หรือ `text` | `text` อย่างเดียว ตัด HTML injection ทิ้ง |
| CL-06 | Validate ฝั่งไหน | server เป็นด่านจริง client เป็นแค่ UX |
| CL-07 | Library validation | `zod` v4 ใช้ `z.email()` top-level |
| CL-08 | จัดการ state ยังไง | `useActionState` + Server Action ได้ progressive enhancement มาฟรี |
| CL-09 | Anti-spam | honeypot + จำกัดความยาว ไม่มี CAPTCHA |
| CL-10 | Rate limiting | นอกขอบเขต — in-memory คือความปลอดภัยปลอม เป็น follow-up |
| CL-11 | UI primitive | `<input>` ธรรมดา + ShopVibe token ไม่ใช่ `src/components/ui/*` ที่สูง `h-8` |
| CL-12 | คอลัมน์ซ้าย | ข้อมูลติดต่อ + โซเชียล + FAQ ไม่มี Google Maps |
| CL-13 | เอกสาร env | ใส่ใน `CLAUDE.md` ไม่สร้าง `.env.example` |
