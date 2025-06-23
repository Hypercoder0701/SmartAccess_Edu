# Maxsus O'quv Platforma - Sozlash Ko'rsatmasi

## 1. Supabase Loyihasini Sozlash

### A. Supabase Dashboard da:
1. [supabase.com](https://supabase.com) ga kiring
2. Yangi loyiha yarating
3. Database parolini o'rnating

### B. SQL Skriptlarni Ishga Tushiring:
Supabase Dashboard > SQL Editor da quyidagi skriptlarni ketma-ket ishga tushiring:

1. `scripts/01-create-tables-fixed.sql`
2. `scripts/02-setup-rls-fixed.sql` 
3. `scripts/03-enable-realtime-fixed.sql`
4. `scripts/04-create-admin-and-sample-data.sql`
5. `scripts/06-create-storage-bucket.sql`
6. `scripts/07-add-file-columns-to-practicals.sql` **(YANGI)**

## 2. Environment Variables

`.env.local` faylini yarating va quyidagi ma'lumotlarni kiriting:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

## 3. Birinchi Admin Foydalanuvchini Yaratish

### Variant 1: Supabase Dashboard orqali
1. Authentication > Users > Invite User
2. Email: admin@platform.uz
3. Parol: admin123
4. Confirm user manually

### Variant 2: Kod orqali
1. Loyihani ishga tushiring: `npm run dev`
2. Register sahifasiga o'ting
3. Admin email bilan ro'yxatdan o'ting: admin@platform.uz
4. Supabase Dashboard > Database > profiles jadvalida role ni 'admin' ga o'zgartiring

## 4. Demo Rejimi

Agar Supabase sozlanmagan bo'lsa, loyiha avtomatik demo rejimida ishlaydi:
- Istalgan email va parol bilan kirish mumkin
- Admin uchun: admin@platform.uz
- Talaba uchun: student@gmail.com

## 5. Xatoliklarni Hal Qilish

### "Invalid login credentials" xatosi:
1. Avval ro'yxatdan o'ting (Register)
2. Yoki demo rejimida istalgan ma'lumot kiriting

### RLS (Row Level Security) xatolari:
1. SQL skriptlar to'g'ri ketma-ketlikda ishga tushirilganini tekshiring
2. Policies to'g'ri o'rnatilganini tekshiring

### Real-time ishlamayotgan bo'lsa:
1. `scripts/04-enable-realtime.sql` ishga tushirilganini tekshiring
2. Supabase Dashboard > Settings > API > Realtime yoqilganini tekshiring

## 6. Loyihani Ishga Tushirish

\`\`\`bash
npm install
npm run dev
\`\`\`

Loyiha http://localhost:3000 da ochiladi.
