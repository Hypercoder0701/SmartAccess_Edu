-- storage.objects jadvalidagi barcha mavjud siyosatlarni bekor qilish
REVOKE ALL ON storage.objects FROM PUBLIC;
DROP POLICY IF EXISTS "Allow anon uploads to avatars folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload files to files bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects; -- Oldingi siyosatlarni ham o'chirish

-- Yangi siyosatlarni yaratish:

-- 1. Fayllarni ommaviy ko'rishga ruxsat berish (SELECT)
CREATE POLICY "Allow public access to files"
ON storage.objects FOR SELECT USING (bucket_id = 'files');

-- 2. Ro'yxatdan o'tish paytida (anon foydalanuvchilar) 'avatars/' papkasiga fayl yuklashga ruxsat berish (INSERT)
CREATE POLICY "Allow anon uploads to avatars folder"
ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'files' AND path LIKE 'avatars/%');

-- 3. Autentifikatsiya qilingan foydalanuvchilarga 'files' bucketiga fayl yuklashga ruxsat berish (INSERT)
CREATE POLICY "Allow authenticated users to upload files to files bucket"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'files');

-- 4. Autentifikatsiya qilingan foydalanuvchilarga o'z fayllarini yangilashga ruxsat berish (UPDATE)
CREATE POLICY "Allow authenticated users to update their own files"
ON storage.objects FOR UPDATE TO authenticated USING (auth.uid() = owner) WITH CHECK (bucket_id = 'files');

-- 5. Autentifikatsiya qilingan foydalanuvchilarga o'z fayllarini o'chirishga ruxsat berish (DELETE)
CREATE POLICY "Allow authenticated users to delete their own files"
ON storage.objects FOR DELETE TO authenticated USING (auth.uid() = owner) WITH CHECK (bucket_id = 'files');
