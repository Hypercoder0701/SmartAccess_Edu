import { createClient } from "@supabase/supabase-js"

// Supabase mijozini yaratish
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseAvailable = supabaseUrl && supabaseAnonKey

export const supabase = isSupabaseAvailable ? createClient(supabaseUrl, supabaseAnonKey) : null

// Ma'lumotlar bazasi jadvallari uchun turlar
export type Profile = {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  avatar_url?: string | null
  role: "admin" | "student"
  created_at: string
  updated_at: string
}

export type Lecture = {
  id: string
  title: string
  description?: string | null
  content: string
  video_url?: string | null
  file_url?: string | null
  file_name?: string | null
  order_number: number
  status: "draft" | "published" | "archived"
  created_by: string
  created_at: string
  updated_at: string
}

export type Practical = {
  id: string
  title: string
  description?: string | null
  order_number: number
  file_url?: string | null // YANGI: Qo'shildi
  file_name?: string | null // YANGI: Qo'shildi
  status: "draft" | "published" | "archived"
  created_by: string
  created_at: string
  updated_at: string
}

export type TestQuestion = {
  id: string
  practical_id: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: "A" | "B" | "C" | "D"
  order_number: number
  created_at: string
}

export type IndependentWork = {
  id: string
  title: string
  description?: string | null
  content: string
  file_url?: string | null
  file_name?: string | null
  order_number: number
  status: "draft" | "published" | "archived"
  created_by: string
  created_at: string
  updated_at: string
}

export type StudentProgress = {
  id: string
  student_id: string
  lecture_id: string
  completed_at: string
}

export type TestResult = {
  id: string
  student_id: string
  practical_id: string
  score: number
  answers: Record<string, string>
  completed_at: string
}

export type IndependentSubmission = {
  id: string
  student_id: string
  independent_work_id: string
  submission_text: string
  score?: number | null
  submitted_at: string
}

// Server-side Supabase client yaratish (service_role bilan)
export const createSupabaseServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase server credentials not found. Admin actions will not work.")
    return null
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
