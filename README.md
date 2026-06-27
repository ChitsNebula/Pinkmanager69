# 🩷 PINK69 — ระบบจัดการสแตนเชียร์สีชมพู

ระบบจัดการสมาชิกและกิจกรรมสแตนเชียร์สีชมพู สำหรับงานกีฬาสี โรงเรียนนารีรัตน์จังหวัดแพร่

---

## ✨ ฟีเจอร์หลัก

| ฟีเจอร์ | รายละเอียด |
|--------|-----------|
| **ทะเบียนสี** | ดูรายชื่อสมาชิก กรองตามห้อง/หน้าที่ |
| **หน้าที่พิเศษ** | สมัครและจัดการหน้าที่แปรอักษร นักกีฬา ขบวนพาเหรด |
| **ระบบแปรอักษร** | วางแผนและซ้อมสัญลักษณ์แปรอักษร (Card Stunt) แบบ real-time |
| **ประกาศ** | แจ้งข่าวสารจากผู้ควบคุมถึงสมาชิกทั้งหมด |
| **รายงาน** | สรุปสถิติจำนวนสมาชิก หน้าที่ และกิจกรรมต่างๆ |
| **กีฬา** | จัดการรายการแข่งขันและผู้เข้าแข่งขัน |

---

## 👥 Role ในระบบ

| Role | สิทธิ์ |
|------|-------|
| **นักเรียน** | ดูข้อมูลตัวเอง สมัครหน้าที่ ซ้อมแปรอักษรส่วนตัว |
| **ผู้ดูแล (Moderator)** | ดูข้อมูลทั้งหมด ไม่สามารถแก้ไขได้ |
| **ผู้ควบคุม (Super Controller)** | จัดการข้อมูลทั้งหมด ตั้งค่าระบบ |

---

## 🚀 วิธีรันโปรเจคบน Local

### 1. Clone และติดตั้ง

```bash
git clone https://github.com/ChitsNebula/Pinkmanager69.git
cd Pinkmanager69
npm install
```

### 2. ตั้งค่า Environment Variables

```bash
# คัดลอก template
cp .env.example .env.local

# แก้ไขค่าในไฟล์ .env.local ตามที่ได้รับ
```

### 3. รัน Development Server

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์

---

## 🏗️ โครงสร้างโปรเจค

```
pink69/
  src/
    app/
      page.tsx        — UI component หลัก
      store.ts        — State management + localStorage
      mockData.ts     — ข้อมูลเริ่มต้น
      globals.css     — Global styles + CSS variables
  public/             — Static assets
  .env.example        — Template environment variables
```

---

## 🛠️ เทคโนโลยี

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom CSS Variables
- **Icons:** Lucide React
- **State:** Custom pub/sub store (localStorage)

---

## 📝 License

โปรเจคนี้พัฒนาเพื่อใช้งานภายในโรงเรียนนารีรัตน์จังหวัดแพร่เท่านั้น
