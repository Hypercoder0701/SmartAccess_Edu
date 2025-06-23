-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practicals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.independent_work ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.independent_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Lectures policies
CREATE POLICY "Everyone can view published lectures" ON public.lectures
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all lectures" ON public.lectures
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Practicals policies
CREATE POLICY "Everyone can view published practicals" ON public.practicals
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all practicals" ON public.practicals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Test questions policies
CREATE POLICY "Students can view questions for published practicals" ON public.test_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.practicals 
            WHERE id = practical_id AND status = 'published'
        )
    );

CREATE POLICY "Admins can manage all test questions" ON public.test_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Independent work policies
CREATE POLICY "Everyone can view published independent work" ON public.independent_work
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all independent work" ON public.independent_work
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Student progress policies
CREATE POLICY "Students can view their own progress" ON public.student_progress
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own progress" ON public.student_progress
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins can view all progress" ON public.student_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Test results policies
CREATE POLICY "Students can view their own test results" ON public.test_results
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own test results" ON public.test_results
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins can view all test results" ON public.test_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Independent submissions policies
CREATE POLICY "Students can manage their own submissions" ON public.independent_submissions
    FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Admins can view and grade all submissions" ON public.independent_submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Certificates policies
CREATE POLICY "Students can view their own certificates" ON public.certificates
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Admins can manage all certificates" ON public.certificates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
