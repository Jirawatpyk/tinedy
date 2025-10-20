# Deployment Guide - Tinedy CRM

คู่มือการ Deploy แอปพลิเคชัน Tinedy CRM ไปยัง Vercel

## ขั้นตอนการ Deploy

### 1. เตรียม Supabase Project

ถ้ายังไม่มี Supabase project ให้ทำตามนี้:

1. ไปที่ [https://database.new](https://database.new)
2. สร้าง Project ใหม่
3. รอจนกว่า Database จะพร้อม
4. ไปที่ SQL Editor
5. เปิดไฟล์ `schema.md` ในโปรเจกต์นี้
6. Copy SQL script จาก grey code block
7. Paste และ Run ใน SQL Editor

### 2. เก็บข้อมูล Supabase Credentials

จาก Supabase Dashboard:

1. ไปที่ **Project Settings** → **API**
2. คัดลอกค่าเหล่านี้:
   - **Project URL** (ตัวอย่าง: `https://abc123.supabase.co`)
   - **anon/public key** (อยู่ในส่วน Project API keys)

### 3. Config Supabase สำหรับ Production

#### 3.1 ตั้งค่า CORS

1. ไปที่ **Project Settings** → **API**
2. เลื่อนลงไปที่ **CORS Allowed Origins**
3. เพิ่ม URL ของ Vercel:
   ```
   https://your-app-name.vercel.app
   ```
   (เปลี่ยน `your-app-name` เป็นชื่อแอปของคุณ)

#### 3.2 ตั้งค่า Authentication Redirect URLs

1. ไปที่ **Authentication** → **URL Configuration**
2. ใน **Redirect URLs** เพิ่ม:
   ```
   https://your-app-name.vercel.app/**
   https://your-app-name.vercel.app/
   ```

### 4. Deploy ไป Vercel

#### ตัวเลือก A: Deploy ผ่าน Vercel Dashboard (แนะนำ)

1. **Push code ไป GitHub** (ถ้ายังไม่ได้ทำ):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Ready for deployment"
   git branch -M main
   git remote add origin https://github.com/your-username/your-repo.git
   git push -u origin main
   ```

2. **เชื่อมต่อกับ Vercel**:
   - ไปที่ [https://vercel.com](https://vercel.com)
   - คลิก **Add New...** → **Project**
   - Import repository จาก GitHub
   - เลือก repository ของโปรเจกต์นี้

3. **Configure Project**:
   - **Framework Preset**: Vite (Vercel ตรวจจับอัตโนมัติ)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)

4. **ตั้งค่า Environment Variables**:

   คลิกที่ **Environment Variables** แล้วเพิ่ม:

   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | `https://your-project-ref.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `your-anon-key-from-supabase` |

   ⚠️ **สำคัญ**: ใส่ค่าจริงจาก Supabase ของคุณ

5. **Deploy**:
   - คลิก **Deploy**
   - รอจนกว่าการ build จะเสร็จ (ประมาณ 1-2 นาที)

#### ตัวเลือก B: Deploy ผ่าน Vercel CLI

1. **ติดตั้ง Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **ตั้งค่า Environment Variables**:
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### 5. สร้าง User Accounts ใน Supabase

หลังจาก deploy แล้ว ต้องสร้าง user accounts:

1. ไปที่ **Supabase Dashboard** → **Authentication** → **Users**
2. คลิก **Add user** → **Create new user**
3. กรอกข้อมูล:
   - Email: `admin@tinedy.com` (หรืออีเมลที่ต้องการ)
   - Password: กำหนดรหัสผ่าน
   - Auto Confirm User: ✅ เปิด

4. **เชื่อมโยง User กับ Staff Profile**:
   - ไปที่ **Table Editor** → เลือกตาราง `staff`
   - คลิก **Insert** → **Insert row**
   - กรอกข้อมูล:
     - `name`: ชื่อพนักงาน
     - `email`: ใช้อีเมลเดียวกับที่สร้างใน Authentication
     - `role`: `admin` หรือ `manager`
     - `user_id`: คัดลอก ID จาก Authentication → Users (UUID ของ user ที่สร้าง)
   - Save

### 6. ทดสอบ

1. เปิด URL ของแอปบน Vercel (เช่น `https://your-app-name.vercel.app`)
2. Login ด้วย email และ password ที่สร้างไว้
3. ตรวจสอบว่า:
   - Login ได้สำเร็จ
   - Dashboard แสดงผลถูกต้อง
   - สามารถสร้าง/แก้ไข/ลบข้อมูลได้
   - Real-time updates ทำงาน

## การอัปเดตแอปพลิเคชัน

### Auto-deployment (แนะนำ)

ถ้าเชื่อมต่อกับ GitHub แล้ว:

1. แก้ไข code
2. Commit และ push ไป GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```
3. Vercel จะ auto-deploy ให้อัตโนมัติ

### Manual deployment

ใช้ Vercel CLI:
```bash
vercel --prod
```

## Troubleshooting

### ปัญหา: Login ไม่ได้ หรือ Error "No staff profile found"

**สาเหตุ**: User ยังไม่ได้เชื่อมกับ staff profile

**แก้ไข**:
1. ไปที่ Supabase → Table Editor → `staff`
2. หา row ที่มี email ตรงกับ user
3. Update column `user_id` ให้ตรงกับ UUID ของ user ใน Authentication

### ปัญหา: "Failed to fetch" หรือ CORS error

**สาเหตุ**: Vercel URL ยังไม่ได้เพิ่มใน Supabase CORS settings

**แก้ไข**:
1. Supabase Dashboard → Project Settings → API
2. เพิ่ม Vercel URL ใน CORS Allowed Origins

### ปัญหา: Environment variables ไม่ทำงาน

**สาเหตุ**: ตั้งค่าผิดใน Vercel

**แก้ไข**:
1. Vercel Dashboard → Project → Settings → Environment Variables
2. ตรวจสอบว่ามี `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY`
3. ค่าต้องมี prefix `VITE_` ด้วย
4. Redeploy: Settings → Deployments → (...) → Redeploy

### ปัญหา: Build failed

**สาเหตุ**: TypeScript errors หรือ missing dependencies

**แก้ไข**:
1. ทดสอบ build ใน local ก่อน:
   ```bash
   npm run build
   ```
2. แก้ไข errors ที่เจอ
3. Push code ใหม่

## Performance Optimization

### 1. ตั้งค่า Caching Headers

Vercel จัดการ caching ให้อัตโนมัติสำหรับ static assets

### 2. Enable Compression

Vercel เปิด Gzip/Brotli compression โดยอัตโนมัติ

### 3. Analytics

เปิดใช้ Vercel Analytics:
1. Vercel Dashboard → Project → Analytics
2. Enable Analytics

## Security Checklist

- ✅ Environment variables ตั้งใน Vercel (ไม่ hardcode ใน code)
- ✅ `.env` อยู่ใน `.gitignore`
- ✅ RLS policies เปิดใช้งานทุกตารางใน Supabase
- ✅ CORS ตั้งค่าเฉพาะ domain ที่ใช้งานจริง
- ✅ Supabase anon key เป็น public key (ไม่ใช่ service_role key)

## Production URLs

เมื่อ deploy เสร็จจะได้:

- **Production URL**: `https://your-app-name.vercel.app`
- **Preview URLs**: สำหรับแต่ละ branch/commit (auto-generated)

## Custom Domain (ถ้าต้องการ)

1. Vercel Dashboard → Project → Settings → Domains
2. คลิก **Add**
3. ใส่ domain ของคุณ (เช่น `crm.tinedy.com`)
4. ตั้งค่า DNS ตาม instruction ที่ Vercel แสดง
5. อย่าลืมเพิ่ม custom domain ใน Supabase CORS settings

## Support

หากมีปัญหา:
- ตรวจสอบ Vercel deployment logs
- ตรวจสอบ Browser console (F12)
- ดู Supabase logs ใน Dashboard → Logs
