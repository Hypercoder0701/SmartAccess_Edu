-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lectures;
ALTER PUBLICATION supabase_realtime ADD TABLE public.practicals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.test_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.independent_work;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.test_results;
ALTER PUBLICATION supabase_realtime ADD TABLE public.independent_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.certificates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to send notification
CREATE OR REPLACE FUNCTION public.send_notification(
    target_user_id UUID,
    notification_title TEXT,
    notification_message TEXT,
    notification_type TEXT DEFAULT 'info'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (target_user_id, notification_title, notification_message, notification_type)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

-- Create function to notify on test completion
CREATE OR REPLACE FUNCTION public.notify_test_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    student_name TEXT;
    practical_title TEXT;
    admin_ids UUID[];
BEGIN
    -- Get student name
    SELECT first_name || ' ' || last_name INTO student_name
    FROM public.profiles
    WHERE id = NEW.student_id;
    
    -- Get practical title
    SELECT title INTO practical_title
    FROM public.practicals
    WHERE id = NEW.practical_id;
    
    -- Get all admin IDs
    SELECT ARRAY_AGG(id) INTO admin_ids
    FROM public.profiles
    WHERE role = 'admin';
    
    -- Send notification to all admins
    IF admin_ids IS NOT NULL THEN
        FOR i IN 1..array_length(admin_ids, 1) LOOP
            PERFORM public.send_notification(
                admin_ids[i],
                'Yangi test natijasi',
                student_name || ' "' || practical_title || '" testini ' || NEW.score || '% bilan yakunladi',
                CASE 
                    WHEN NEW.score >= 80 THEN 'success'
                    WHEN NEW.score >= 60 THEN 'info'
                    ELSE 'warning'
                END
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for test completion notifications
DROP TRIGGER IF EXISTS trigger_test_completion_notification ON public.test_results;
CREATE TRIGGER trigger_test_completion_notification
    AFTER INSERT ON public.test_results
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_test_completion();

-- Create function to notify on lecture completion
CREATE OR REPLACE FUNCTION public.notify_lecture_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    student_name TEXT;
    lecture_title TEXT;
    admin_ids UUID[];
BEGIN
    -- Get student name
    SELECT first_name || ' ' || last_name INTO student_name
    FROM public.profiles
    WHERE id = NEW.student_id;
    
    -- Get lecture title
    SELECT title INTO lecture_title
    FROM public.lectures
    WHERE id = NEW.lecture_id;
    
    -- Get all admin IDs
    SELECT ARRAY_AGG(id) INTO admin_ids
    FROM public.profiles
    WHERE role = 'admin';
    
    -- Send notification to all admins
    IF admin_ids IS NOT NULL THEN
        FOR i IN 1..array_length(admin_ids, 1) LOOP
            PERFORM public.send_notification(
                admin_ids[i],
                'Ma''ruza tugallandi',
                student_name || ' "' || lecture_title || '" ma''ruzasini tugalladi',
                'info'
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for lecture completion notifications
DROP TRIGGER IF EXISTS trigger_lecture_completion_notification ON public.student_progress;
CREATE TRIGGER trigger_lecture_completion_notification
    AFTER INSERT ON public.student_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_lecture_completion();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '📡 Real-time funksiyalar muvaffaqiyatli yoqildi!';
    RAISE NOTICE '✅ Barcha jadvallar real-time rejimda ishlaydi';
    RAISE NOTICE '🔔 Bildirishnoma tizimi sozlandi';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Keyingi qadam: Admin foydalanuvchi va sample ma''lumotlar yaratish';
END $$;
