-- Avvalgi INSERT siyosatini o'chirish, agar mavjud bo'lsa
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon uploads to avatars folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload files to files bucket" ON storage.objects;

-- Yangi foydalanuvchilar (anon) uchun 'avatars' papkasiga fayl yuklashga ruxsat berish
CREATE POLICY "Allow anon uploads to avatars folder"
ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'files' AND path LIKE 'avatars/%');

-- Autentifikatsiya qilingan foydalanuvchilar (masalan, adminlar) uchun 'files' bucketiga fayl yuklashga ruxsat berish
CREATE POLICY "Allow authenticated users to upload files to files bucket"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'files');

-- Fayllarni ommaviy ko'rishga ruxsat berish (agar hali mavjud bo'lmasa yoki o'chirilgan bo'lsa)
CREATE POLICY "Allow public access to files"
ON storage.objects FOR SELECT USING (bucket_id = 'files');
