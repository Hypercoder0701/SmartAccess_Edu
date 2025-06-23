# Storage Bucket Sozlash Ko'rsatmasi

## Muammo
Avatar yuklashda "Bucket not found" xatosi yuz bermoqda.

## Yechim

### 1. SQL orqali bucket yaratish
Supabase Dashboard > SQL Editor da quyidagi skriptni ishga tushiring:

\`\`\`sql
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
\`\`\`

### 2. Dashboard orqali bucket yaratish
1. Supabase Dashboard > Storage ga o'ting
2. "New bucket" tugmasini bosing
3. Bucket nomi: `files`
4. Public bucket: ✅ (belgilang)
5. File size limit: 5MB
6. Allowed MIME types: `image/*,application/pdf,text/*,video/*`
7. "Save" tugmasini bosing

### 3. RLS Policies o'rnatish
\`\`\`sql
-- Storage policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'files');

CREATE POLICY "Authenticated users can upload files" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'files' AND auth.role() = 'authenticated');
\`\`\`

## Tekshirish
1. Loyihani qayta ishga tushiring
2. Register sahifasida avatar yuklashni sinab ko'ring
3. Xato yo'qolishi kerak

## Fallback
Agar bucket yaratilmasa ham, kod avtomatik placeholder rasm ishlatadi va xato bermaydi.
