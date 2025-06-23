-- Admin foydalanuvchini yaratish
-- Bu skript Supabase SQL Editor da ishga tushiriladi

-- 1. Auth foydalanuvchisini yaratish (manual)
-- Bu qismni Supabase Dashboard > Authentication > Users da qiling

-- 2. Admin profilini yaratish
-- Avval auth.users jadvalidan admin foydalanuvchi ID sini oling
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Admin foydalanuvchi ID sini olish (email bo'yicha)
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@platform.uz' 
    LIMIT 1;
    
    -- Agar admin foydalanuvchi topilsa, profil yaratish
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, first_name, last_name, role)
        VALUES (
            admin_user_id,
            'admin@platform.uz',
            'Admin',
            'User',
            'admin'
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'admin',
            first_name = 'Admin',
            last_name = 'User';
            
        RAISE NOTICE 'Admin profil yaratildi yoki yangilandi: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Admin foydalanuvchi topilmadi. Avval Authentication > Users da yarating.';
    END IF;
END $$;

-- 3. Sample ma'lumotlarni yaratish (agar mavjud bo'lmasa)
DO $$
DECLARE
    admin_id UUID;
    lecture1_id UUID;
    lecture2_id UUID;
    practical1_id UUID;
    practical2_id UUID;
BEGIN
    -- Admin ID ni olish
    SELECT id INTO admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
    
    IF admin_id IS NOT NULL THEN
        -- Sample lectures yaratish
        INSERT INTO public.lectures (title, description, content, order_number, status, created_by)
        VALUES 
            ('Kirish va asosiy tushunchalar', 
             'Kursga kirish va asosiy tushunchalar bilan tanishish',
             '<h2>Kursga xush kelibsiz!</h2><p>Bu kursda siz quyidagi mavzularni o''rganasiz...</p>',
             1, 'published', admin_id),
            ('Nazariy asoslar',
             'Nazariy bilimlarni chuqurlashtirish',
             '<h2>Nazariy asoslar</h2><p>Bu bo''limda nazariy bilimlarni o''rganamiz...</p>',
             2, 'published', admin_id),
            ('Amaliy mashg''ulotlar',
             'Nazariy bilimlarni amaliyotda qo''llash',
             '<h2>Amaliy mashg''ulotlar</h2><p>Nazariy bilimlarni amaliyotda qo''llaymiz...</p>',
             3, 'published', admin_id)
        ON CONFLICT DO NOTHING
        RETURNING id INTO lecture1_id;
        
        -- Sample practicals yaratish
        INSERT INTO public.practicals (title, description, order_number, status, created_by)
        VALUES 
            ('Birinchi amaliyot', 'Asosiy tushunchalar bo''yicha test', 1, 'published', admin_id),
            ('Ikkinchi amaliyot', 'Nazariy bilimlar bo''yicha test', 2, 'published', admin_id)
        ON CONFLICT DO NOTHING;
        
        -- Practical ID larini olish
        SELECT id INTO practical1_id FROM public.practicals WHERE title = 'Birinchi amaliyot' LIMIT 1;
        SELECT id INTO practical2_id FROM public.practicals WHERE title = 'Ikkinchi amaliyot' LIMIT 1;
        
        -- Sample test questions yaratish
        IF practical1_id IS NOT NULL THEN
            INSERT INTO public.test_questions (practical_id, question, option_a, option_b, option_c, option_d, correct_answer, order_number)
            VALUES 
                (practical1_id, 'Qaysi javob to''g''ri?', 'Birinchi variant', 'Ikkinchi variant', 'Uchinchi variant', 'To''rtinchi variant', 'A', 1),
                (practical1_id, 'Eng muhim tamoyil qaysi?', 'Samaradorlik', 'Xavfsizlik', 'Tezlik', 'Arzonlik', 'B', 2),
                (practical1_id, 'Qaysi usul eng yaxshi?', 'Birinchi usul', 'Ikkinchi usul', 'Uchinchi usul', 'To''rtinchi usul', 'C', 3),
                (practical1_id, 'Asosiy maqsad nima?', 'Tezlik', 'Sifat', 'Miqdor', 'Barchasi', 'D', 4),
                (practical1_id, 'Eng muhim ko''nikma?', 'Tahlil qilish', 'Yozish', 'O''qish', 'Hisoblash', 'A', 5)
            ON CONFLICT DO NOTHING;
        END IF;
        
        -- Sample independent work yaratish
        INSERT INTO public.independent_work (title, description, content, order_number, status, created_by)
        VALUES 
            ('Birinchi mustaqil ish',
             'Nazariy bilimlarni mustaqil o''rganish',
             'Quyidagi mavzularni mustaqil o''rganing va hisobot tayyorlang...',
             1, 'published', admin_id),
            ('Ikkinchi mustaqil ish',
             'Loyiha ishini bajarish',
             'Kichik loyiha ishini bajaring va natijalarni taqdim eting...',
             2, 'published', admin_id)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Sample ma''lumotlar yaratildi admin uchun: %', admin_id;
    END IF;
END $$;
