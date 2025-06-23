-- Remove all auth.users insertions as they are managed by Supabase Auth

-- Insert admin profile
INSERT INTO public.profiles (id, email, first_name, last_name, role)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@platform.uz', 'Admin', 'User', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Create a function to create admin profile when needed
CREATE OR REPLACE FUNCTION create_admin_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function will be called after an admin user signs up
  -- The actual user creation should be done through Supabase Auth signup
  
  -- Insert sample lectures (only if admin exists)
  INSERT INTO public.lectures (title, description, content, order_number, status, created_by) 
  SELECT 
    'Kirish va asosiy tushunchalar',
    'Kursga kirish va asosiy tushunchalar bilan tanishish', 
    '<h2>Kursga xush kelibsiz!</h2><p>Bu kursda siz quyidagi mavzularni o''rganasiz...</p>', 
    1, 
    'published', 
    id
  FROM public.profiles 
  WHERE role = 'admin' 
  LIMIT 1
  ON CONFLICT DO NOTHING;

  INSERT INTO public.lectures (title, description, content, order_number, status, created_by) 
  SELECT 
    'Nazariy asoslar',
    'Nazariy bilimlarni chuqurlashtirish', 
    '<h2>Nazariy asoslar</h2><p>Bu bo''limda nazariy bilimlarni o''rganamiz...</p>', 
    2, 
    'published', 
    id
  FROM public.profiles 
  WHERE role = 'admin' 
  LIMIT 1
  ON CONFLICT DO NOTHING;

  INSERT INTO public.lectures (title, description, content, order_number, status, created_by) 
  SELECT 
    'Amaliy mashg''ulotlar',
    'Nazariy bilimlarni amaliyotda qo''llash', 
    '<h2>Amaliy mashg''ulotlar</h2><p>Nazariy bilimlarni amaliyotda qo''llaymiz...</p>', 
    3, 
    'published', 
    id
  FROM public.profiles 
  WHERE role = 'admin' 
  LIMIT 1
  ON CONFLICT DO NOTHING;

  -- Insert sample practicals
  INSERT INTO public.practicals (title, description, order_number, status, created_by) 
  SELECT 
    'Birinchi amaliyot',
    'Asosiy tushunchalar bo''yicha test', 
    1, 
    'published', 
    id
  FROM public.profiles 
  WHERE role = 'admin' 
  LIMIT 1
  ON CONFLICT DO NOTHING;

  INSERT INTO public.practicals (title, description, order_number, status, created_by) 
  SELECT 
    'Ikkinchi amaliyot',
    'Nazariy bilimlar bo''yicha test', 
    2, 
    'published', 
    id
  FROM public.profiles 
  WHERE role = 'admin' 
  LIMIT 1
  ON CONFLICT DO NOTHING;

  -- Insert sample independent work
  INSERT INTO public.independent_work (title, description, content, order_number, status, created_by) 
  SELECT 
    'Birinchi mustaqil ish',
    'Nazariy bilimlarni mustaqil o''rganish', 
    'Quyidagi mavzularni mustaqil o''rganing va hisobot tayyorlang...', 
    1, 
    'published', 
    id
  FROM public.profiles 
  WHERE role = 'admin' 
  LIMIT 1
  ON CONFLICT DO NOTHING;

  INSERT INTO public.independent_work (title, description, content, order_number, status, created_by) 
  SELECT 
    'Ikkinchi mustaqil ish',
    'Loyiha ishini bajarish', 
    'Kichik loyiha ishini bajaring va natijalarni taqdim eting...', 
    2, 
    'published', 
    id
  FROM public.profiles 
  WHERE role = 'admin' 
  LIMIT 1
  ON CONFLICT DO NOTHING;

END;
$$;

-- Create trigger to automatically create sample data when first admin is created
CREATE OR REPLACE FUNCTION trigger_create_sample_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If this is the first admin user, create sample data
  IF NEW.role = 'admin' AND (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin') = 1 THEN
    PERFORM create_admin_profile();
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sample_data_creation ON public.profiles;
CREATE TRIGGER trigger_sample_data_creation
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_sample_data();

-- Get practical IDs
DO $$
DECLARE
    practical1_id UUID;
    practical2_id UUID;
BEGIN
    SELECT id INTO practical1_id FROM public.practicals WHERE title = 'Birinchi amaliyot';
    SELECT id INTO practical2_id FROM public.practicals WHERE title = 'Ikkinchi amaliyot';

    -- Insert sample test questions for first practical
    INSERT INTO public.test_questions (practical_id, question, option_a, option_b, option_c, option_d, correct_answer, order_number) VALUES
    (practical1_id, 'Qaysi javob to''g''ri?', 'Birinchi variant', 'Ikkinchi variant', 'Uchinchi variant', 'To''rtinchi variant', 'A', 1),
    (practical1_id, 'Eng muhim tamoyil qaysi?', 'Samaradorlik', 'Xavfsizlik', 'Tezlik', 'Arzonlik', 'B', 2),
    (practical1_id, 'Qaysi usul eng yaxshi?', 'Birinchi usul', 'Ikkinchi usul', 'Uchinchi usul', 'To''rtinchi usul', 'C', 3),
    (practical1_id, 'Asosiy maqsad nima?', 'Tezlik', 'Sifat', 'Miqdor', 'Barchasi', 'D', 4),
    (practical1_id, 'Eng muhim ko''nikma?', 'Tahlil qilish', 'Yozish', 'O''qish', 'Hisoblash', 'A', 5),
    (practical1_id, 'Qaysi printsip asosiy?', 'Soddalik', 'Murakkablik', 'O''rtacha', 'Qiyinlik', 'A', 6),
    (practical1_id, 'Eng yaxshi yondashuv?', 'Individual', 'Jamoaviy', 'Aralash', 'Mustaqil', 'C', 7),
    (practical1_id, 'Muvaffaqiyat kaliti?', 'Bilim', 'Tajriba', 'Motivatsiya', 'Barchasi', 'D', 8),
    (practical1_id, 'Eng muhim xususiyat?', 'Tezlik', 'Aniqlik', 'Chiroyli', 'Arzon', 'B', 9),
    (practical1_id, 'Yakuniy natija?', 'Bilim olish', 'Diplom olish', 'Ish topish', 'Rivojlanish', 'A', 10);

    -- Insert sample test questions for second practical
    INSERT INTO public.test_questions (practical_id, question, option_a, option_b, option_c, option_d, correct_answer, order_number) VALUES
    (practical2_id, 'Nazariy bilimning ahamiyati?', 'Juda muhim', 'Muhim emas', 'O''rtacha', 'Noma''lum', 'A', 1),
    (practical2_id, 'Qaysi yondashuv samarali?', 'Nazariy', 'Amaliy', 'Aralash', 'Hech qaysi', 'C', 2),
    (practical2_id, 'Bilimni qo''llash usuli?', 'Yodlash', 'Tushunish', 'Tahlil qilish', 'Barchasi', 'D', 3),
    (practical2_id, 'Eng yaxshi o''rganish usuli?', 'Kitob o''qish', 'Video ko''rish', 'Amaliyot', 'Muhokama', 'C', 4),
    (practical2_id, 'Bilimni baholash mezoni?', 'Test', 'Loyiha', 'Taqdimot', 'Barchasi', 'D', 5);
END $$;
