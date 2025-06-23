-- 1. `supabase_storage` kengaytmasini yoqish (agar hali yoqilmagan bo'lsa)
CREATE EXTENSION IF NOT EXISTS "supabase_storage" WITH SCHEMA "extensions";

-- 2. `storage` sxemasini yaratish (agar hali mavjud bo'lmasa)
CREATE SCHEMA IF NOT EXISTS storage;

-- 3. `storage.buckets` jadvalini yaratish (agar hali mavjud bo'lmasa)
CREATE TABLE IF NOT EXISTS storage.buckets (
    id text primary key,
    name text,
    owner uuid,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    public boolean default false,
    avif_autodetection boolean default false,
    file_size_limit bigint,
    allowed_mime_types text[]
);

-- 4. `storage.objects` jadvalini yaratish (agar hali mavjud bo'lmasa)
CREATE TABLE IF NOT EXISTS storage.objects (
    id uuid default extensions.uuid_generate_v4() not null primary key,
    bucket_id text references storage.buckets(id),
    name text,
    owner uuid,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    last_accessed_at timestamptz default now(),
    metadata jsonb,
    path_tokens text[] generated always as (regexp_split_to_array(name, '/')) stored,
    -- `path` ustuni endi `name` ustunidan hosil qilinadi
    -- Agar sizda eski versiya bo'lsa, bu qismni o'zgartirish kerak bo'lishi mumkin
    -- Lekin odatda `name` ustuni faylning to'liq yo'lini saqlaydi
    size bigint
);

-- 5. `storage.objects` jadvaliga indekslar qo'shish
CREATE INDEX IF NOT EXISTS ix_storage_objects_bucket_id ON storage.objects (bucket_id);
CREATE INDEX IF NOT EXISTS ix_storage_objects_owner ON storage.objects (owner);

-- 6. `storage.objects` jadvaliga RLSni yoqish
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 7. Avvalgi RLS siyosatlarini qayta qo'llash
-- Avvalgi INSERT siyosatini o'chirish, agar mavjud bo'lsa
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon uploads to avatars folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload files to files bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to files" ON storage.objects;


-- Yangi foydalanuvchilar (anon) uchun 'avatars' papkasiga fayl yuklashga ruxsat berish
CREATE POLICY "Allow anon uploads to avatars folder"
ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'files' AND path_tokens[1] = 'avatars');

-- Autentifikatsiya qilingan foydalanuvchilar (masalan, adminlar) uchun 'files' bucketiga fayl yuklashga ruxsat berish
CREATE POLICY "Allow authenticated users to upload files to files bucket"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'files');

-- Fayllarni ommaviy ko'rishga ruxsat berish
CREATE POLICY "Allow public access to files"
ON storage.objects FOR SELECT USING (bucket_id = 'files');

-- 8. `files` bucketini yaratish (agar hali mavjud bo'lmasa)
INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'files', true)
ON CONFLICT (id) DO NOTHING;
