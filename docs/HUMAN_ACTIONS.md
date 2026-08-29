# คู่มือและขั้นตอนการตั้งค่าสำหรับผู้ดูแลระบบ (Human Actions Guide)
## MUMT Blood Donation 2026 — “เติมรักให้เต็ม Unit ครั้งที่ 9”

ตารางสรุปงานที่ต้องดำเนินการโดยมนุษย์ (เนื่องจากเกี่ยวข้องกับการเข้าถึงระบบ Cloud, บัญชีผู้ดูแล, หรือการอนุญาตทางกฎหมาย)

| รหัส (ID) | งานที่ต้องทำ | เหตุผลที่ต้องทำโดยมนุษย์ | สถานะ | สิ่งที่ถูกปลดล็อค | วิธีตรวจสอบ |
|---|---|---|---|---|---|
| **H-001** | เชื่อมต่อ Live Database (`DATABASE_URL`) | ต้องสร้างฐานข้อมูล PostgreSQL (เช่น Neon.tech หรือ Supabase หรือ Local DB) | `WAITING_FOR_HUMAN` | ข้อมูลผู้ลงทะเบียนและการทำงานของระบบจริง | `npm run db:push` สำเร็จ |
| **H-002** | ตั้งค่า Auth Secrets (`BETTER_AUTH_SECRET`) | รหัสความปลอดภัยสำหรับสร้าง Token ใน `.env.local` | `WAITING_FOR_HUMAN` | ระบบล็อกอินเจ้าหน้าที่และแอดมิน | ทดสอบ Sign-in |
| **H-003** | สร้างบัญชี Super Admin / Staff เริ่มต้น | ต้องมีบัญชีแรกเพื่อใช้เข้าจัดการระบบ | `WAITING_FOR_HUMAN` | หน้า `/admin` และ `/staff/checkin` | ล็อกอินผ่านหน้าเว็บ |
| **H-004** | ตั้งค่า SMTP Email (ทางเลือก) | อีเมลสำหรับส่ง QR Pass ยืนยันการลงทะเบียน | `OPTIONAL` | การส่งอีเมลอัตโนมัติถึงผู้บริจาค | ได้รับอีเมลยืนยัน |
| **H-005** | ตรวจสอบข้อความ PDPA และโปสเตอร์ | ตรวจสอบความถูกต้องร่วมกับภาคบริการโลหิตและมหิดล | `OPEN` | ความพร้อมทางกฎหมายและ PR | ตรวจสอบหน้า `/register` |

---

## 🛠️ รายละเอียดและวิธีทำทีละขั้นตอน (Step-by-Step Instructions)

### 1. การตั้งค่า Database (`DATABASE_URL`)
1. เข้าไปที่ [Neon.tech](https://neon.tech) (หรือ Cloud Postgres ที่ต้องการ) แล้วสร้าง Project ใหม่
2. คัดลอก Connection String ตัวอย่าง:
   ```env
   DATABASE_URL="postgresql://user:password@ep-xyz.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
   ```
3. วางค่านี้ลงในไฟล์ `.env.local` ของโปรเจกต์
4. รันคำสั่งส่ง Schema ขึ้นฐานข้อมูล:
   ```bash
   npm run db:push
   ```
5. รันคำสั่งใส่ข้อมูลพื้นฐานงาน (รอบเวลา 08:30-14:00 น. วันที่ 16 ก.ย. 2569):
   ```bash
   npx tsx db/seed.ts
   ```

---

### 2. การสร้าง Better Auth Secret (`BETTER_AUTH_SECRET`)
1. สร้างคีย์สุ่มความยาว 32 ตัวอักษรขึ้นไป (สามารถรันคำสั่ง `openssl rand -hex 32` บน Terminal)
2. เพิ่มลงใน `.env.local`:
   ```env
   BETTER_AUTH_SECRET="<รหัส_32_ตัวอักษรที่สุ่มได้>"
   BETTER_AUTH_URL="http://localhost:3000" # หรือโดเมนจริงเมื่อ deploy
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

---

### 3. การสร้างบัญชีผู้ดูแลระบบ (Admin / Staff)
คุณสามารถสร้างบัญชีได้ 2 วิธี:

#### วิธีที่ 1: ใช้สคริปต์ CLI สะดวกและกำหนดรหัสผ่านได้เอง (แนะนำ)
```bash
# รูปแบบ: npx tsx scripts/create-admin.ts <อีเมล> <รหัสผ่าน> <ชื่อ-นามสกุล> [ระดับสิทธิ์: STAFF|TEAM_LEAD|ADMIN|SUPER_ADMIN] [ทีม]
npx tsx scripts/create-admin.ts monai.yut@student.mahidol.edu "<ตั้งรหัสผ่านของ Super Admin>" "Super Admin" SUPER_ADMIN Management
```

#### วิธีที่ 2: ใช้สคริปต์ Seed เริ่มต้น
```bash
npx tsx scripts/seed-staff.ts
```
*(บัญชีหลักเพียงบัญชีเดียวคือ `monai.yut@student.mahidol.edu` ส่วน Staff ให้เชิญจากหน้า Staff Management หลังเข้าสู่ระบบ)*

---

### 4. การตั้งค่าส่งอีเมลยืนยัน (SMTP Email Service)
หากต้องการให้ระบบส่งอีเมลยืนยันพร้อม QR Pass อัตโนมัติ สามารถเพิ่มข้อมูลใน `.env.local`:
```env
SMTP_HOST="smtp.resend.com" # หรือ smtp.gmail.com
SMTP_PORT=587
SMTP_USER="resend" # หรืออีเมล Gmail
SMTP_PASS="re_xxxxxxxxxxxx" # หรือ Google App Password
SMTP_FROM="MUMT Blood Donation <noreply@yourdomain.com>"
```
*(หมายเหตุ: หากไม่ตั้งค่า SMTP ระบบจะทำงานแบบ Silent no-op โดยไม่ทำให้ขั้นตอนลงทะเบียนติดขัด)*

---

### 5. การตรวจสอบความเรียบร้อยก่อนเปิดใช้งาน
รันชุดคำสั่งทดสอบระบบทั้งหมด:
```bash
# ตรวจสอบ Lint (ต้องได้ 0 problems)
npm run lint

# ตรวจสอบ Unit & Integration Test suites
npm test

# ตรวจสอบ Build สำหรับ Production
npm run build
```
