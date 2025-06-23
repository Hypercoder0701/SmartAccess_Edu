-- practicals jadvaliga file_url va file_name ustunlarini qo'shish
ALTER TABLE public.practicals
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ "practicals" jadvaliga "file_url" va "file_name" ustunlari muvaffaqiyatli qo''shildi!';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Endi ilovani qayta ishga tushirishingiz mumkin.';
END $$;
