-- Bu skriptni ishga tushirishdan OLDIN:
-- 1. Supabase Dashboard > Authentication > Users ga o'ting
-- 2. "Add user" tugmasini bosing
-- 3. Email: admin@platform.uz, Password: admin123 kiriting
-- 4. "Email Confirm" ni belgilang
-- 5. "Create user" tugmasini bosing
-- 6. Keyin bu skriptni ishga tushiring

DO $$
DECLARE
    admin_user_id UUID;
    admin_profile_exists BOOLEAN := FALSE;
    lecture1_id UUID;
    lecture2_id UUID;
    lecture3_id UUID;
    practical1_id UUID;
    practical2_id UUID;
BEGIN
    -- Admin foydalanuvchi ID sini olish
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@platform.uz' 
    LIMIT 1;
    
    IF admin_user_id IS NULL THEN
        RAISE NOTICE '❌ Admin foydalanuvchi topilmadi!';
        RAISE NOTICE '📋 Quyidagi qadamlarni bajaring:';
        RAISE NOTICE '   1. Supabase Dashboard > Authentication > Users';
        RAISE NOTICE '   2. Add user tugmasini bosing';
        RAISE NOTICE '   3. Email: admin@platform.uz';
        RAISE NOTICE '   4. Password: admin123';
        RAISE NOTICE '   5. Email Confirm ni belgilang';
        RAISE NOTICE '   6. Create user tugmasini bosing';
        RAISE NOTICE '   7. Bu skriptni qayta ishga tushiring';
        RETURN;
    END IF;
    
    -- Admin profil mavjudligini tekshirish
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = admin_user_id) INTO admin_profile_exists;
    
    -- Admin profilini yaratish yoki yangilash
    IF admin_profile_exists THEN
        UPDATE public.profiles 
        SET role = 'admin', first_name = 'Admin', last_name = 'User'
        WHERE id = admin_user_id;
        RAISE NOTICE '✅ Admin profil yangilandi: %', admin_user_id;
    ELSE
        INSERT INTO public.profiles (id, email, first_name, last_name, role)
        VALUES (admin_user_id, 'admin@platform.uz', 'Admin', 'User', 'admin');
        RAISE NOTICE '✅ Admin profil yaratildi: %', admin_user_id;
    END IF;
    
    -- Sample lectures yaratish
    INSERT INTO public.lectures (title, description, content, order_number, status, created_by)
    VALUES 
        ('Kirish va asosiy tushunchalar', 
         'Kursga kirish va asosiy tushunchalar bilan tanishish',
         '<h2>Kursga xush kelibsiz!</h2><p>Bu kursda siz quyidagi mavzularni o''rganasiz:</p><ul><li>Asosiy tushunchalar</li><li>Nazariy asoslar</li><li>Amaliy mashg''ulotlar</li></ul>',
         1, 'published', admin_user_id),
        ('Nazariy asoslar',
         'Nazariy bilimlarni chuqurlashtirish',
         '<h2>Nazariy asoslar</h2><p>Bu bo''limda nazariy bilimlarni o''rganamiz:</p><ul><li>Fundamental tushunchalar</li><li>Asosiy qonuniyatlar</li><li>Nazariy modellar</li></ul>',
         2, 'published', admin_user_id),
        ('Amaliy mashg''ulotlar',
         'Nazariy bilimlarni amaliyotda qo''llash',
         '<h2>Amaliy mashg''ulotlar</h2><p>Nazariy bilimlarni amaliyotda qo''llaymiz:</p><ul><li>Laboratoriya ishlari</li><li>Praktik topshiriqlar</li><li>Loyiha ishlari</li></ul>',
         3, 'published', admin_user_id)
    ON CONFLICT DO NOTHING
    RETURNING id INTO lecture1_id;
    
    -- Lecture ID larini olish
    SELECT id INTO lecture1_id FROM public.lectures WHERE title = 'Kirish va asosiy tushunchalar' LIMIT 1;
    SELECT id INTO lecture2_id FROM public.lectures WHERE title = 'Nazariy asoslar' LIMIT 1;
    SELECT id INTO lecture3_id FROM public.lectures WHERE title = 'Amaliy mashg''ulotlar' LIMIT 1;
    
    -- Sample practicals yaratish
    INSERT INTO public.practicals (title, description, order_number, status, created_by)
    VALUES 
        ('Birinchi amaliyot', 'Asosiy tushunchalar bo''yicha test', 1, 'published', admin_user_id),
        ('Ikkinchi amaliyot', 'Nazariy bilimlar bo''yicha test', 2, 'published', admin_user_id)
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
            (practical1_id, 'Eng muhim ko''nikma?', 'Tahlil qilish', 'Yozish', 'O''qish', 'Hisoblash', 'A', 5),
            (practical1_id, 'Qaysi printsip asosiy?', 'Soddalik', 'Murakkablik', 'O''rtacha', 'Qiyinlik', 'A', 6),
            (practical1_id, 'Eng yaxshi yondashuv?', 'Individual', 'Jamoaviy', 'Aralash', 'Mustaqil', 'C', 7),
            (practical1_id, 'Muvaffaqiyat kaliti?', 'Bilim', 'Tajriba', 'Motivatsiya', 'Barchasi', 'D', 8),
            (practical1_id, 'Eng muhim xususiyat?', 'Tezlik', 'Aniqlik', 'Chiroyli', 'Arzon', 'B', 9),
            (practical1_id, 'Yakuniy natija?', 'Bilim olish', 'Diplom olish', 'Ish topish', 'Rivojlanish', 'A', 10)
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF practical2_id IS NOT NULL THEN
        INSERT INTO public.test_questions (practical_id, question, option_a, option_b, option_c, option_d, correct_answer, order_number)
        VALUES 
            (practical2_id, 'Nazariy bilimning ahamiyati?', 'Juda muhim', 'Muhim emas', 'O''rtacha', 'Noma''lum', 'A', 1),
            (practical2_id, 'Qaysi yondashuv samarali?', 'Nazariy', 'Amaliy', 'Aralash', 'Hech qaysi', 'C', 2),
            (practical2_id, 'Bilimni qo''llash usuli?', 'Yodlash', 'Tushunish', 'Tahlil qilish', 'Barchasi', 'D', 3),
            (practical2_id, 'Eng yaxshi o''rganish usuli?', 'Kitob o''qish', 'Video ko''rish', 'Amaliyot', 'Muhokama', 'C', 4),
            (practical2_id, 'Bilimni baholash mezoni?', 'Test', 'Loyiha', 'Taqdimot', 'Barchasi', 'D', 5)
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Sample independent work yaratish
    INSERT INTO public.independent_work (title, description, content, order_number, status, created_by)
    VALUES 
        ('Birinchi mustaqil ish',
         'Nazariy bilimlarni mustaqil o''rganish',
         '<h3>Topshiriq:</h3><p>Quyidagi mavzularni mustaqil o''rganing va hisobot tayyorlang:</p><ol><li>Asosiy tushunchalar tahlili</li><li>Nazariy asoslarni o''rganish</li><li>Amaliy misollar topish</li></ol><h3>Talab:</h3><ul><li>Hisobot hajmi: 5-10 bet</li><li>Manbalar: kamida 3 ta</li><li>Muddat: 1 hafta</li></ul>',
         1, 'published', admin_user_id),
        ('Ikkinchi mustaqil ish',
         'Loyiha ishini bajarish',
         '<h3>Loyiha topshirig''i:</h3><p>Kichik loyiha ishini bajaring va natijalarni taqdim eting:</p><ol><li>Muammo tahlili</li><li>Yechim ishlab chiqish</li><li>Natijalarni baholash</li></ol><h3>Topshirish formati:</h3><ul><li>Taqdimot (10-15 slayd)</li><li>Demo versiya</li><li>Hisobot (3-5 bet)</li></ul>',
         2, 'published', admin_user_id)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '🎉 Barcha ma''lumotlar muvaffaqiyatli yaratildi!';
    RAISE NOTICE '📚 Yaratilgan ma''lumotlar:';
    RAISE NOTICE '   ✅ Admin profil: admin@platform.uz';
    RAISE NOTICE '   ✅ 3 ta ma''ruza';
    RAISE NOTICE '   ✅ 2 ta amaliyot';
    RAISE NOTICE '   ✅ 15 ta test savoli';
    RAISE NOTICE '   ✅ 2 ta mustaqil ish';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 Admin ma''lumotlari:';
    RAISE NOTICE '   📧 Email: admin@platform.uz';
    RAISE NOTICE '   🔒 Parol: admin123';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Endi loyihangizni ishga tushiring va admin bilan kiring!';
    
END $$;
