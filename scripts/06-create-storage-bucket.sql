-- Supabase Storage bucket yaratish
-- Bu skript Supabase SQL Editor da ishga tushiriladi

-- Storage bucket yaratish
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'files',
  'files',
  true,
  5242880, -- 5MB
  ARRAY['image/*', 'application/pdf', 'text/*', 'video/*']
)
ON CONFLICT (id) DO NOTHING;

-- Storage bucket uchun RLS policy yaratish
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'files');

CREATE POLICY "Authenticated users can upload files" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own files" ON storage.objects 
FOR UPDATE USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects 
FOR DELETE USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '📁 Storage bucket "files" muvaffaqiyatli yaratildi!';
    RAISE NOTICE '✅ Fayl yuklash funksiyasi tayyor';
    RAISE NOTICE '🔒 RLS policies o''rnatildi';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Qo''llab-quvvatlanadigan fayl turlari:';
    RAISE NOTICE '   - Rasmlar (image/*)';
    RAISE NOTICE '   - PDF fayllar (application/pdf)';
    RAISE NOTICE '   - Matn fayllar (text/*)';
    RAISE NOTICE '   - Video fayllar (video/*)';
    RAISE NOTICE '';
    RAISE NOTICE '📏 Maksimal fayl hajmi: 5MB';
END $$;
