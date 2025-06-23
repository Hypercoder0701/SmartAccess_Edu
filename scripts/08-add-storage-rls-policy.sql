-- "files" bucketiga fayl yuklash uchun RLS siyosatini yaratish
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'files' AND auth.role() = 'authenticated');

-- "files" bucketidan fayllarni o'qish uchun RLS siyosatini yaratish
CREATE POLICY "Allow public access to files" ON storage.objects
FOR SELECT USING (bucket_id = 'files');
