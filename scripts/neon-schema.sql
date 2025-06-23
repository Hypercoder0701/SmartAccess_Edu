-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'student');
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar_url TEXT,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lectures table
CREATE TABLE IF NOT EXISTS lectures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    video_url TEXT,
    file_url TEXT,
    file_name TEXT,
    order_number INTEGER NOT NULL,
    status content_status DEFAULT 'draft',
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Practicals table
CREATE TABLE IF NOT EXISTS practicals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    order_number INTEGER NOT NULL,
    status content_status DEFAULT 'draft',
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test questions table
CREATE TABLE IF NOT EXISTS test_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    practical_id UUID REFERENCES practicals(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
    order_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Independent work table
CREATE TABLE IF NOT EXISTS independent_work (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    order_number INTEGER NOT NULL,
    status content_status DEFAULT 'draft',
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student progress table
CREATE TABLE IF NOT EXISTS student_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    lecture_id UUID REFERENCES lectures(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, lecture_id)
);

-- Test results table
CREATE TABLE IF NOT EXISTS test_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    practical_id UUID REFERENCES practicals(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    answers JSONB NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, practical_id)
);

-- Independent submissions table
CREATE TABLE IF NOT EXISTS independent_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    independent_work_id UUID REFERENCES independent_work(id) ON DELETE CASCADE,
    submission_text TEXT,
    file_url TEXT,
    file_name TEXT,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    graded_at TIMESTAMP WITH TIME ZONE,
    graded_by UUID REFERENCES profiles(id),
    UNIQUE(student_id, independent_work_id)
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    certificate_url TEXT,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lectures_order ON lectures(order_number);
CREATE INDEX IF NOT EXISTS idx_practicals_order ON practicals(order_number);
CREATE INDEX IF NOT EXISTS idx_independent_work_order ON independent_work(order_number);
CREATE INDEX IF NOT EXISTS idx_student_progress_student ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_test_results_student ON test_results(student_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_practical ON test_questions(practical_id, order_number);

-- Insert admin user (password: admin123)
INSERT INTO profiles (email, first_name, last_name, password_hash, role)
VALUES ('admin@platform.uz', 'Admin', 'User', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Get admin ID for sample data
DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM profiles WHERE email = 'admin@platform.uz';

    -- Insert sample lectures
    INSERT INTO lectures (title, description, content, order_number, status, created_by) VALUES
    ('Kirish va asosiy tushunchalar', 'Kursga kirish va asosiy tushunchalar bilan tanishish', 
     '<h2>Kursga xush kelibsiz!</h2><p>Bu kursda siz quyidagi mavzularni o''rganasiz...</p>', 
     1, 'published', admin_id),
    ('Nazariy asoslar', 'Nazariy bilimlarni chuqurlashtirish', 
     '<h2>Nazariy asoslar</h2><p>Bu bo''limda nazariy bilimlarni o''rganamiz...</p>', 
     2, 'published', admin_id),
    ('Amaliy mashg''ulotlar', 'Nazariy bilimlarni amaliyotda qo''llash', 
     '<h2>Amaliy mashg''ulotlar</h2><p>Nazariy bilimlarni amaliyotda qo''llaymiz...</p>', 
     3, 'published', admin_id)
    ON CONFLICT DO NOTHING;

    -- Insert sample practicals
    INSERT INTO practicals (title, description, order_number, status, created_by) VALUES
    ('Birinchi amaliyot', 'Asosiy tushunchalar bo''yicha test', 1, 'published', admin_id),
    ('Ikkinchi amaliyot', 'Nazariy bilimlar bo''yicha test', 2, 'published', admin_id)
    ON CONFLICT DO NOTHING;

    -- Insert sample independent work
    INSERT INTO independent_work (title, description, content, order_number, status, created_by) VALUES
    ('Birinchi mustaqil ish', 'Nazariy bilimlarni mustaqil o''rganish', 
     'Quyidagi mavzularni mustaqil o''rganing va hisobot tayyorlang...', 
     1, 'published', admin_id),
    ('Ikkinchi mustaqil ish', 'Loyiha ishini bajarish', 
     'Kichik loyiha ishini bajaring va natijalarni taqdim eting...', 
     2, 'published', admin_id)
    ON CONFLICT DO NOTHING;
END $$;
