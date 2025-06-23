import { supabase, isSupabaseAvailable } from "./supabase"
import type {
  Profile,
  Lecture,
  Practical,
  TestQuestion,
  IndependentWork,
  StudentProgress,
  TestResult,
  IndependentSubmission,
} from "./supabase"
import type { User } from "@supabase/supabase-js"

// Export Supabase mavjudligi
export { isSupabaseAvailable }

// Mock ma'lumotlar (Supabase mavjud bo'lmagan holat uchun)
const mockUsers: Profile[] = [
  {
    id: "admin-1",
    email: "admin@platform.uz",
    first_name: "Admin",
    last_name: "User",
    avatar_url: "/placeholder.svg?height=40&width=40",
    role: "admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "student-1",
    email: "student@gmail.com",
    first_name: "Aziz",
    last_name: "Karimov",
    avatar_url: "/placeholder.svg?height=40&width=40",
    role: "student",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockLectures: Lecture[] = [
  {
    id: "lecture-1",
    title: "Kirish va asosiy tushunchalar",
    description: "Kursga kirish va asosiy tushunchalar bilan tanishish",
    content: "Bu kursda siz quyidagi mavzularni o'rganasiz...",
    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    file_url: "/placeholder.svg?height=200&width=200&query=",
    file_name: "lecture-1.pdf",
    order_number: 1,
    status: "published",
    created_by: "admin-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "lecture-2",
    title: "Nazariy asoslar",
    description: "Nazariy bilimlarni chuqurlashtirish",
    content: "Bu bo'limda nazariy bilimlarni o'rganamiz...",
    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    file_url: "/placeholder.svg?height=200&width=200&query=",
    file_name: "lecture-2.pdf",
    order_number: 2,
    status: "published",
    created_by: "admin-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "lecture-3",
    title: "Amaliy mashg'ulotlar",
    description: "Nazariy bilimlarni amaliyotda qo'llash",
    content: "Nazariy bilimlarni amaliyotda qo'llaymiz...",
    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    file_url: "/placeholder.svg?height=200&width=200&query=",
    file_name: "lecture-3.pdf",
    order_number: 3,
    status: "published",
    created_by: "admin-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockPracticals: Practical[] = [
  {
    id: "practical-1",
    title: "Birinchi amaliyot",
    description: "Asosiy tushunchalar bo'yicha test",
    order_number: 1,
    file_url: "/placeholder.svg?height=200&width=200&query=",
    file_name: "practical-1.pdf",
    status: "published",
    created_by: "admin-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "practical-2",
    title: "Ikkinchi amaliyot",
    description: "Nazariy bilimlar bo'yicha test",
    order_number: 2,
    file_url: "/placeholder.svg?height=200&width=200&query=",
    file_name: "practical-2.pdf",
    status: "published",
    created_by: "admin-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockIndependentWork: IndependentWork[] = [
  {
    id: "independent-1",
    title: "Birinchi mustaqil ish",
    description: "Nazariy bilimlarni mustaqil o'rganish",
    content: "Quyidagi mavzularni mustaqil o'rganing va hisobot tayyorlang...",
    file_url: "/placeholder.svg?height=200&width=200&query=",
    file_name: "independent-1.pdf",
    order_number: 1,
    status: "published",
    created_by: "admin-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "independent-2",
    title: "Ikkinchi mustaqil ish",
    description: "Loyiha ishini bajarish",
    content: "Kichik loyiha ishini bajaring va natijalarni taqdim eting...",
    file_url: "/placeholder.svg?height=200&width=200&query=",
    file_name: "independent-2.pdf",
    order_number: 2,
    status: "published",
    created_by: "admin-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Autentifikatsiya funksiyalari
export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  avatarUrl?: string,
): Promise<{ user: User; profile: Profile } | { status: "already_registered" }> {
  // YANGI: Qaytish turini o'zgartirish
  if (!isSupabaseAvailable) {
    // Mock implementation
    const newUser: Profile = {
      id: `user-${Date.now()}`,
      email,
      first_name: firstName,
      last_name: lastName,
      avatar_url: avatarUrl,
      role: "student",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockUsers.push(newUser)
    return { user: { uid: newUser.id, email }, profile: newUser }
  }

  try {
    // Check if profiles table exists
    const { data: tableCheck, error: tableError } = await supabase!.from("profiles").select("id").limit(1)

    if (tableError && tableError.message.includes("does not exist")) {
      throw new Error("Database jadvallar yaratilmagan. Iltimos, avval SQL skriptlarni ishga tushiring.")
    }

    // Supabase auth bilan foydalanuvchi yaratish
    const { data: authData, error: authError } = await supabase!.auth.signUp({
      email,
      password,
    })

    if (authError) {
      // YANGI: "User already registered" xatosini maxsus status bilan qaytarish
      if (authError.message.includes("already registered")) {
        return { status: "already_registered" }
      }
      throw authError // Boshqa xatolarni qayta tashlash
    }

    if (!authData.user) {
      throw new Error("Foydalanuvchi yaratilmadi")
    }

    // Foydalanuvchi profilini yaratish
    const { data: profileData, error: profileError } = await supabase!
      .from("profiles")
      .insert([
        {
          id: authData.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatarUrl,
          role: "student", // Yangi foydalanuvchilar sukut bo'yicha talaba
        },
      ])
      .select()
      .single()

    if (profileError) {
      console.error("Profile creation error:", profileError)
      const fallbackProfile: Profile = {
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
        role: "student",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      return { user: authData.user, profile: fallbackProfile }
    }

    return { user: authData.user, profile: profileData }
  } catch (error) {
    console.error("Sign up error:", error)
    throw error
  }
}

export async function signIn(email: string, password: string) {
  if (!isSupabaseAvailable) {
    // Mock implementation - allow any email/password combination
    let user = mockUsers.find((u) => u.email === email)

    // If user not found, create a mock user for demo
    if (!user) {
      user = {
        id: `user-${Date.now()}`,
        email,
        first_name: email.split("@")[0],
        last_name: "Demo",
        avatar_url: "/placeholder.svg?height=40&width=40",
        role: email.includes("admin") ? "admin" : "student",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      mockUsers.push(user)
    }

    return {
      user: { uid: user.id, email: user.email },
      profile: user,
    }
  }

  try {
    // First check if profiles table exists
    const { data: tableCheck, error: tableError } = await supabase!.from("profiles").select("id").limit(1)

    if (tableError && tableError.message.includes("does not exist")) {
      throw new Error("Database jadvallar yaratilmagan. Iltimos, avval SQL skriptlarni ishga tushiring.")
    }

    // Supabase auth bilan kirish
    const { data: authData, error: authError } = await supabase!.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      if (authError.message.includes("Invalid login credentials")) {
        throw new Error("Email yoki parol noto'g'ri.")
      }
      // Email tasdiqlanmagan xatosini ushlash
      if (authError.message.includes("Email not confirmed")) {
        throw new Error(
          "Email manzilingiz tasdiqlanmagan. Iltimos, pochtangizni tekshiring va tasdiqlash havolasiga o'ting.",
        )
      }
      throw authError
    }

    if (!authData.user) {
      throw new Error("Kirish jarayonida xatolik yuz berdi")
    }

    // Foydalanuvchi profilini olish
    const { data: profileData, error: profileError } = await supabase!
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (profileError) {
      // If profile doesn't exist, create one
      if (profileError.code === "PGRST116") {
        const { data: newProfile, error: createError } = await supabase!
          .from("profiles")
          .insert([
            {
              id: authData.user.id,
              email: authData.user.email || email,
              first_name: authData.user.email?.split("@")[0],
              last_name: "User",
              role: authData.user.email?.includes("admin") ? "admin" : "student",
            },
          ])
          .select()
          .single()

        if (createError) throw createError
        return { user: authData.user, profile: newProfile }
      }
      throw profileError
    }

    return { user: authData.user, profile: profileData }
  } catch (error) {
    console.error("Sign in error:", error)
    throw error
  }
}

export async function signOut() {
  if (!isSupabaseAvailable) {
    return
  }

  try {
    const { error } = await supabase!.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error("Sign out error:", error)
    throw error
  }
}

export async function getCurrentUser() {
  if (!isSupabaseAvailable) {
    return null
  }

  try {
    const { data: sessionData, error: sessionError } = await supabase!.auth.getSession()
    if (sessionError) throw sessionError

    if (!sessionData.session) {
      return null
    }

    const { data: userData, error: userError } = await supabase!.auth.getUser()
    if (userError) throw userError

    // Check if profiles table exists
    const { data: tableCheck, error: tableError } = await supabase!.from("profiles").select("id").limit(1)

    if (tableError && tableError.message.includes("does not exist")) {
      console.warn("Profiles table does not exist, using fallback profile")
      return {
        user: userData.user,
        profile: {
          id: userData.user.id,
          email: userData.user.email || "",
          first_name: userData.user.email?.split("@")[0] || "User",
          last_name: "Demo",
          role: userData.user.email?.includes("admin") ? "admin" : "student",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Profile,
      }
    }

    const { data: profileData, error: profileError } = await supabase!
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .single()

    if (profileError) {
      if (profileError.code === "PGRST116") {
        // Profile doesn't exist, create fallback
        return {
          user: userData.user,
          profile: {
            id: userData.user.id,
            email: userData.user.email || "",
            first_name: userData.user.email?.split("@")[0] || "User",
            last_name: "Demo",
            role: userData.user.email?.includes("admin") ? "admin" : "student",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Profile,
        }
      }
      throw profileError
    }

    return { user: userData.user, profile: profileData }
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

// Profil funksiyalari
export async function getProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseAvailable) {
    return mockUsers.find((u) => u.id === userId) || null
  }

  try {
    const { data, error } = await supabase!.from("profiles").select("*").eq("id", userId).single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Get profile error:", error)
    return null
  }
}

export async function updateProfileData(userId: string, updates: Partial<Profile>): Promise<Profile> {
  if (!isSupabaseAvailable) {
    const userIndex = mockUsers.findIndex((u) => u.id === userId)
    if (userIndex >= 0) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates, updated_at: new Date().toISOString() }
      return mockUsers[userIndex]
    }
    throw new Error("Foydalanuvchi topilmadi")
  }

  try {
    const { data, error } = await supabase!
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Update profile error:", error)
    throw error
  }
}

export async function getAllStudents(): Promise<Profile[]> {
  if (!isSupabaseAvailable) {
    return mockUsers.filter((u) => u.role === "student")
  }

  try {
    const { data, error } = await supabase!
      .from("profiles")
      .select("*")
      .eq("role", "student")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Get all students error:", error)
    return []
  }
}

// Ma'ruza funksiyalari
export async function getLectures(): Promise<Lecture[]> {
  if (!isSupabaseAvailable) {
    return mockLectures
  }

  try {
    const { data, error } = await supabase!.from("lectures").select("*").order("order_number", { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Get lectures error:", error)
    return []
  }
}

export async function getLecture(id: string): Promise<Lecture | null> {
  if (!isSupabaseAvailable) {
    return mockLectures.find((l) => l.id === id) || null
  }

  try {
    const { data, error } = await supabase!.from("lectures").select("*").eq("id", id).single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Get lecture error:", error)
    return null
  }
}

// YANGI: Tartib raqami bo'yicha ma'ruzani olish
export async function getLectureByOrder(orderNumber: number): Promise<Lecture | null> {
  if (!isSupabaseAvailable) {
    return mockLectures.find((l) => l.order_number === orderNumber && l.status === "published") || null
  }
  try {
    const { data, error } = await supabase!
      .from("lectures")
      .select("*")
      .eq("order_number", orderNumber)
      .eq("status", "published")
      .single()
    if (error && error.code !== "PGRST116") throw error // PGRST116 - no rows found
    return data
  } catch (error) {
    console.error("Get lecture by order error:", error)
    return null
  }
}

export async function createLecture(
  lecture: Omit<Lecture, "id" | "created_at" | "updated_at">,
  lectureFile?: File,
): Promise<Lecture> {
  if (!isSupabaseAvailable) {
    const newLecture: Lecture = {
      ...lecture,
      id: `lecture-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      file_url: lectureFile
        ? `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(lectureFile.name)}`
        : undefined,
      file_name: lectureFile ? lectureFile.name : undefined,
    }
    mockLectures.push(newLecture)
    return newLecture
  }

  try {
    let file_url: string | undefined
    let file_name: string | undefined

    if (lectureFile) {
      const path = `lectures/${Date.now()}_${lectureFile.name}`
      file_url = await uploadFile(lectureFile, path)
      file_name = lectureFile.name
    }

    const { data, error } = await supabase!
      .from("lectures")
      .insert([{ ...lecture, file_url, file_name }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Create lecture error:", error)
    throw error
  }
}

export async function updateLecture(id: string, updates: Partial<Lecture>, lectureFile?: File): Promise<Lecture> {
  if (!isSupabaseAvailable) {
    const lectureIndex = mockLectures.findIndex((l) => l.id === id)
    if (lectureIndex >= 0) {
      mockLectures[lectureIndex] = {
        ...mockLectures[lectureIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      }
      return mockLectures[lectureIndex]
    }
    throw new Error("Ma'ruza topilmadi")
  }

  try {
    let file_url: string | undefined = updates.file_url // Keep existing if not updated
    let file_name: string | undefined = updates.file_name // Keep existing if not updated

    if (lectureFile) {
      const path = `lectures/${Date.now()}_${lectureFile.name}`
      file_url = await uploadFile(lectureFile, path)
      file_name = lectureFile.name
    } else if (updates.file_url === null) {
      // If user explicitly removed the file
      file_url = null
      file_name = null
    }

    const { data, error } = await supabase!
      .from("lectures")
      .update({ ...updates, file_url, file_name, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Update lecture error:", error)
    throw error
  }
}

export async function deleteLecture(id: string): Promise<void> {
  if (!isSupabaseAvailable) {
    const lectureIndex = mockLectures.findIndex((l) => l.id === id)
    if (lectureIndex >= 0) {
      mockLectures.splice(lectureIndex, 1)
    }
    return
  }

  try {
    const { error } = await supabase!.from("lectures").delete().eq("id", id)

    if (error) throw error
  } catch (error) {
    console.error("Delete lecture error:", error)
    throw error
  }
}

// Amaliyot funksiyalari
export async function getPracticals(): Promise<Practical[]> {
  if (!isSupabaseAvailable) {
    return mockPracticals
  }

  try {
    const { data, error } = await supabase!.from("practicals").select("*").order("order_number", { ascending: true }) // Admin panelida barcha holatdagi amaliyotlar ko'rinishi kerak

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Get practicals error:", error)
    return []
  }
}

export async function getPractical(id: string): Promise<Practical | null> {
  if (!isSupabaseAvailable) {
    return mockPracticals.find((p) => p.id === id) || null
  }

  try {
    const { data, error } = await supabase!.from("practicals").select("*").eq("id", id).single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Get practical error:", error)
    return null
  }
}

// YANGI: Tartib raqami bo'yicha amaliyotni olish
export async function getPracticalByOrder(orderNumber: number): Promise<Practical | null> {
  if (!isSupabaseAvailable) {
    return mockPracticals.find((p) => p.order_number === orderNumber && p.status === "published") || null
  }
  try {
    const { data, error } = await supabase!
      .from("practicals")
      .select("*")
      .eq("order_number", orderNumber)
      .eq("status", "published")
      .single()
    if (error && error.code !== "PGRST116") throw error // PGRST116 - no rows found
    return data
  } catch (error) {
    console.error("Get practical by order error:", error)
    return null
  }
}

export async function getTestQuestions(practicalId: string): Promise<TestQuestion[]> {
  if (!isSupabaseAvailable) {
    // Mock test questions
    return Array.from({ length: 10 }, (_, i) => ({
      id: `q${i + 1}`,
      practical_id: practicalId,
      question: `Test savoli ${i + 1}: Qaysi javob to'g'ri?`,
      option_a: "Birinchi variant",
      option_b: "Ikkinchi variant",
      option_c: "Uchinchi variant",
      option_d: "To'rtinchi variant",
      correct_answer: ["A", "B", "C", "D"][i % 4] as "A" | "B" | "C" | "D",
      order_number: i + 1,
      created_at: new Date().toISOString(),
    }))
  }

  try {
    const { data, error } = await supabase!
      .from("test_questions")
      .select("*")
      .eq("practical_id", practicalId)
      .order("order_number", { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Get test questions error:", error)
    return []
  }
}

export async function createPractical(
  practical: Omit<Practical, "id" | "created_at" | "updated_at">,
  testQuestions: Omit<TestQuestion, "id" | "created_at" | "practical_id">[],
  practicalFile?: File,
): Promise<Practical> {
  if (!isSupabaseAvailable) {
    const newPractical: Practical = {
      ...practical,
      id: `practical-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      file_url: practicalFile
        ? `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(practicalFile.name)}`
        : undefined,
      file_name: practicalFile ? practicalFile.name : undefined,
    }
    mockPracticals.push(newPractical)
    // Mock test questions creation
    testQuestions.forEach((q, i) => {
      console.log(`Mock creating question ${i + 1} for practical ${newPractical.id}: ${q.question}`)
    })
    return newPractical
  }

  try {
    let file_url: string | undefined
    let file_name: string | undefined

    if (practicalFile) {
      const path = `practicals/${Date.now()}_${practicalFile.name}`
      file_url = await uploadFile(practicalFile, path)
      file_name = practicalFile.name
    }

    const { data: newPractical, error: practicalError } = await supabase!
      .from("practicals")
      .insert([{ ...practical, file_url, file_name }])
      .select()
      .single()

    if (practicalError) throw practicalError

    // Test savollarini yaratish
    const questionsToInsert = testQuestions.map((q) => ({
      ...q,
      practical_id: newPractical.id,
    }))

    const { error: questionsError } = await supabase!.from("test_questions").insert(questionsToInsert)

    if (questionsError) {
      console.error("Error creating test questions:", questionsError)
      // Agar savollarni yaratishda xato bo'lsa, amaliyotni o'chirishimiz mumkin
      await supabase!.from("practicals").delete().eq("id", newPractical.id)
      throw questionsError
    }

    return newPractical
  } catch (error) {
    console.error("Create practical error:", error)
    throw error
  }
}

export async function updatePractical(
  id: string,
  updates: Partial<Practical>,
  testQuestions?: Omit<TestQuestion, "id" | "created_at" | "practical_id">[],
  practicalFile?: File,
): Promise<Practical> {
  if (!isSupabaseAvailable) {
    const practicalIndex = mockPracticals.findIndex((p) => p.id === id)
    if (practicalIndex >= 0) {
      mockPracticals[practicalIndex] = {
        ...mockPracticals[practicalIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      }
      return mockPracticals[practicalIndex]
    }
    throw new Error("Amaliyot topilmadi")
  }

  try {
    let file_url: string | undefined = updates.file_url // Keep existing if not updated
    let file_name: string | undefined = updates.file_name // Keep existing if not updated

    if (practicalFile) {
      const path = `practicals/${Date.now()}_${practicalFile.name}`
      file_url = await uploadFile(practicalFile, path)
      file_name = practicalFile.name
    } else if (updates.file_url === null) {
      // If user explicitly removed the file
      file_url = null
      file_name = null
    }

    const { data, error } = await supabase!
      .from("practicals")
      .update({ ...updates, file_url, file_name, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    // Test savollarini yangilash (agar berilgan bo'lsa)
    if (testQuestions) {
      // Avval mavjud savollarni o'chirish
      await supabase!.from("test_questions").delete().eq("practical_id", id)
      // Keyin yangi savollarni qo'shish
      const questionsToInsert = testQuestions.map((q, index) => ({
        ...q,
        practical_id: id,
        order_number: index + 1,
      }))
      const { error: questionsError } = await supabase!.from("test_questions").insert(questionsToInsert)
      if (questionsError) {
        console.error("Error updating test questions:", questionsError)
        throw questionsError
      }
    }

    return data
  } catch (error) {
    console.error("Update practical error:", error)
    throw error
  }
}

export async function deletePractical(id: string): Promise<void> {
  if (!isSupabaseAvailable) {
    const practicalIndex = mockPracticals.findIndex((p) => p.id === id)
    if (practicalIndex >= 0) {
      mockPracticals.splice(practicalIndex, 1)
    }
    return
  }

  try {
    // Test savollarini o'chirish
    await supabase!.from("test_questions").delete().eq("practical_id", id)
    // Amaliyotni o'chirish
    const { error } = await supabase!.from("practicals").delete().eq("id", id)

    if (error) throw error
  } catch (error) {
    console.error("Delete practical error:", error)
    throw error
  }
}

export async function createTestQuestion(question: Omit<TestQuestion, "id" | "created_at">): Promise<TestQuestion> {
  if (!isSupabaseAvailable) {
    return {
      ...question,
      id: `question-${Date.now()}`,
      created_at: new Date().toISOString(),
    }
  }

  try {
    const { data, error } = await supabase!.from("test_questions").insert([question]).select().single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Create test question error:", error)
    throw error
  }
}

// Mustaqil ish funksiyalari
export async function getIndependentWork(): Promise<IndependentWork[]> {
  if (!isSupabaseAvailable) {
    return mockIndependentWork
  }

  try {
    const { data, error } = await supabase!
      .from("independent_work")
      .select("*")
      .order("order_number", { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Get independent work error:", error)
    return []
  }
}

export async function getIndependentSubmission(submissionId: string): Promise<IndependentSubmission | null> {
  if (!isSupabaseAvailable) {
    return (mockIndependentWork.find((work) => work.id === submissionId) as unknown as IndependentSubmission) || null
  }

  try {
    const { data, error } = await supabase!.from("independent_submissions").select("*").eq("id", submissionId).single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Get independent submission error:", error)
    return null
  }
}

export async function getIndependentSubmissions(studentId: string): Promise<IndependentSubmission[]> {
  if (!isSupabaseAvailable) {
    // Mock data for demo mode
    return [
      {
        id: "submission-1",
        student_id: studentId,
        independent_work_id: "independent-1",
        submission_text: "Birinchi mustaqil ish bo'yicha hisobot.",
        score: 90,
        submitted_at: new Date().toISOString(),
      },
    ]
  }

  try {
    const { data, error } = await supabase!.from("independent_submissions").select("*").eq("student_id", studentId)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Get independent submissions error:", error)
    return []
  }
}

export async function createIndependentWork(
  work: Omit<IndependentWork, "id" | "created_at" | "updated_at">,
  independentFile?: File,
): Promise<IndependentWork> {
  if (!isSupabaseAvailable) {
    const newIndependent: IndependentWork = {
      ...work,
      id: `independent-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      file_url: independentFile
        ? `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(independentFile.name)}`
        : undefined,
      file_name: independentFile ? independentFile.name : undefined,
    }
    mockIndependentWork.push(newIndependent)
    return newIndependent
  }

  try {
    let file_url: string | undefined
    let file_name: string | undefined

    if (independentFile) {
      const path = `independent_work/${Date.now()}_${independentFile.name}`
      file_url = await uploadFile(independentFile, path)
      file_name = independentFile.name
    }

    const { data, error } = await supabase!
      .from("independent_work")
      .insert([{ ...work, file_url, file_name }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Create independent work error:", error)
    throw error
  }
}

export async function updateIndependentWork(
  id: string,
  updates: Partial<IndependentWork>,
  independentFile?: File,
): Promise<IndependentWork> {
  if (!isSupabaseAvailable) {
    const workIndex = mockIndependentWork.findIndex((w) => w.id === id)
    if (workIndex >= 0) {
      mockIndependentWork[workIndex] = {
        ...mockIndependentWork[workIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      }
      return mockIndependentWork[workIndex]
    }
    throw new Error("Mustaqil ish topilmadi")
  }

  try {
    let file_url: string | undefined = updates.file_url // Keep existing if not updated
    let file_name: string | undefined = updates.file_name // Keep existing if not updated

    if (independentFile) {
      const path = `independent_work/${Date.now()}_${independentFile.name}`
      file_url = await uploadFile(independentFile, path)
      file_name = independentFile.name
    } else if (updates.file_url === null) {
      // If user explicitly removed the file
      file_url = null
      file_name = null
    }

    const { data, error } = await supabase!
      .from("independent_work")
      .update({ ...updates, file_url, file_name, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Update independent work error:", error)
    throw error
  }
}

export async function deleteIndependentWork(id: string): Promise<void> {
  if (!isSupabaseAvailable) {
    const workIndex = mockIndependentWork.findIndex((w) => w.id === id)
    if (workIndex >= 0) {
      mockIndependentWork.splice(workIndex, 1)
    }
    return
  }

  try {
    const { error } = await supabase!.from("independent_work").delete().eq("id", id)

    if (error) throw error
  } catch (error) {
    console.error("Delete independent work error:", error)
    throw error
  }
}

// Progress tracking funksiyalari
export async function getStudentProgress(studentId: string): Promise<StudentProgress[]> {
  if (!isSupabaseAvailable) {
    console.log("Mock: getStudentProgress for studentId:", studentId) // YANGI LOG
    return [
      {
        id: "progress-1",
        student_id: studentId,
        lecture_id: "lecture-1",
        completed_at: new Date().toISOString(),
      },
      {
        id: "progress-2",
        student_id: studentId,
        lecture_id: "lecture-2",
        completed_at: new Date().toISOString(),
      },
    ]
  }

  try {
    const { data, error } = await supabase!.from("student_progress").select("*").eq("student_id", studentId)

    if (error) {
      console.error("Supabase: Get student progress error:", error) // YANGI LOG
      throw error
    }
    console.log("Supabase: Fetched student progress:", data?.length) // YANGI LOG
    return data || []
  } catch (error) {
    console.error("Get student progress error (caught):", error) // YANGI LOG
    return []
  }
}

export async function markLectureComplete(studentId: string, lectureId: string): Promise<StudentProgress> {
  if (!isSupabaseAvailable) {
    return {
      id: `progress-${Date.now()}`,
      student_id: studentId,
      lecture_id: lectureId,
      completed_at: new Date().toISOString(),
    }
  }

  try {
    // Avval tekshiramiz, agar mavjud bo'lsa yangilamaymiz
    const { data: existingProgress } = await supabase!
      .from("student_progress")
      .select("*")
      .eq("student_id", studentId)
      .eq("lecture_id", lectureId)
      .maybeSingle()

    if (existingProgress) {
      return existingProgress
    }

    // Yangi yozuv qo'shamiz
    const { data, error } = await supabase!
      .from("student_progress")
      .insert([
        {
          student_id: studentId,
          lecture_id: lectureId,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Mark lecture complete error:", error)
    throw error
  }
}

// YANGI: Ma'lum bir amaliyot bo'yicha talabaning test natijasini olish
export async function getTestResults(studentId: string, practicalId?: string): Promise<TestResult | null> {
  if (!isSupabaseAvailable) {
    // Mock data for demo mode
    if (practicalId === "practical-1") {
      return {
        id: "result-1",
        student_id: studentId,
        practical_id: "practical-1",
        score: 8, // Example score
        answers: { q1: "A", q2: "B", q3: "C", q4: "D", q5: "A" },
        completed_at: new Date().toISOString(),
      }
    }
    return null
  }

  try {
    let query = supabase!.from("test_results").select("*").eq("student_id", studentId)
    if (practicalId) {
      query = query.eq("practical_id", practicalId).single()
    } else {
      // Agar practicalId berilmasa, barcha natijalarni qaytarish
      // Bu holatda getAllTestResults ishlatilishi kerak
      console.warn("getTestResults called without practicalId. Use getAllTestResults instead.")
      return null // Yoki xato tashlash
    }

    const { data, error } = await query

    if (error && error.code !== "PGRST116") {
      console.error("Supabase: Get single test result error:", error) // YANGI LOG
      throw error // PGRST116 - no rows found
    }
    console.log("Supabase: Fetched single test result:", data ? "found" : "not found") // YANGI LOG
    return data
  } catch (error) {
    console.error("Get test results error (caught):", error) // YANGI LOG
    return null
  }
}

// YANGI: Barcha test natijalarini olish (avvalgi getTestResults funksiyasining vazifasi)
export async function getAllTestResults(studentId: string): Promise<TestResult[]> {
  if (!isSupabaseAvailable) {
    console.log("Mock: getAllTestResults for studentId:", studentId) // YANGI LOG
    return [
      {
        id: "result-1",
        student_id: studentId,
        practical_id: "practical-1",
        score: 85,
        answers: { q1: "A", q2: "B", q3: "C", q4: "D", q5: "A" },
        completed_at: new Date().toISOString(),
      },
      {
        id: "result-2",
        student_id: studentId,
        practical_id: "practical-2",
        score: 92,
        answers: { q1: "B", q2: "A", q3: "D", q4: "C", q5: "B" },
        completed_at: new Date().toISOString(),
      },
    ]
  }

  try {
    const { data, error } = await supabase!.from("test_results").select("*").eq("student_id", studentId)

    if (error) {
      console.error("Supabase: Get all test results error:", error) // YANGI LOG
      throw error
    }
    console.log("Supabase: Fetched all test results:", data?.length) // YANGI LOG
    return data || []
  } catch (error) {
    console.error("Get all test results error (caught):", error) // YANGI LOG
    return []
  }
}

export async function submitTestResult(result: Omit<TestResult, "id" | "completed_at">): Promise<TestResult> {
  if (!isSupabaseAvailable) {
    return {
      ...result,
      id: `result-${Date.now()}`,
      completed_at: new Date().toISOString(),
    }
  }

  try {
    // Avval tekshiramiz, agar mavjud bo'lsa yangilaymiz
    const { data: existingResult } = await supabase!
      .from("test_results")
      .select("*")
      .eq("student_id", result.student_id)
      .eq("practical_id", result.practical_id)
      .maybeSingle()

    if (existingResult) {
      // Mavjud natijani yangilash
      const { data, error } = await supabase!
        .from("test_results")
        .update({
          score: result.score,
          answers: result.answers,
          completed_at: new Date().toISOString(),
        })
        .eq("id", existingResult.id)
        .select()
        .single()

      if (error) throw error
      return data
    }

    // Yangi natija qo'shish
    const { data, error } = await supabase!
      .from("test_results")
      .insert([
        {
          student_id: result.student_id,
          practical_id: result.practical_id,
          score: result.score,
          answers: result.answers,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Submit test result error:", error)
    throw error
  }
}

// Statistika funksiyalari
export async function getAdminStats() {
  if (!isSupabaseAvailable) {
    return {
      totalStudents: 156,
      totalLectures: 24,
      totalPracticals: 18,
      totalIndependentWork: 12,
      averageScore: 78.5,
      completionRate: 65.2,
    }
  }

  try {
    // Talabalar soni
    const { count: totalStudents, error: studentsError } = await supabase!
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "student")

    if (studentsError) throw studentsError

    // Ma'ruzalar soni
    const { count: totalLectures, error: lecturesError } = await supabase!
      .from("lectures")
      .select("*", { count: "exact", head: true })
      .eq("status", "published")

    if (lecturesError) throw lecturesError

    // Amaliyotlar soni
    const { count: totalPracticals, error: practicalsError } = await supabase!
      .from("practicals")
      .select("*", { count: "exact", head: true })
      .eq("status", "published")

    if (practicalsError) throw practicalsError

    // Mustaqil ishlar soni
    const { count: totalIndependentWork, error: independentError } = await supabase!
      .from("independent_work")
      .select("*", { count: "exact", head: true })
      .eq("status", "published")

    if (independentError) throw independentError

    // Test natijalari
    const { data: testResults, error: testResultsError } = await supabase!
      .from("test_results")
      .select("score, student_id")

    if (testResultsError) throw testResultsError

    // O'rtacha ball
    const scores = testResults.map((r) => r.score)
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

    // Tugatish foizi
    const uniqueStudents = new Set(testResults.map((r) => r.student_id))
    const completionRate = totalStudents > 0 ? (uniqueStudents.size / totalStudents) * 100 : 0

    return {
      totalStudents: totalStudents || 0,
      totalLectures: totalLectures || 0,
      totalPracticals: totalPracticals || 0,
      totalIndependentWork: totalIndependentWork || 0,
      averageScore,
      completionRate,
    }
  } catch (error) {
    console.error("Get admin stats error:", error)
    return {
      totalStudents: 0,
      totalLectures: 0,
      totalPracticals: 0,
      totalIndependentWork: 0,
      averageScore: 0,
      completionRate: 0,
    }
  }
}

export async function getStudentRankings() {
  if (!isSupabaseAvailable) {
    return [
      {
        studentId: "student-1",
        profile: { firstName: "Aziz", lastName: "Karimov", avatarUrl: "/placeholder.svg" },
        totalScore: 177,
        testCount: 2,
        averageScore: 88.5,
      },
    ]
  }

  try {
    // Test natijalari va profil ma'lumotlarini olish
    const { data: testResults, error: testResultsError } = await supabase!.from("test_results").select(`
      student_id,
      score,
      profiles:student_id (
        first_name,
        last_name,
        avatar_url
      )
    `)

    if (testResultsError) throw testResultsError

    // Talaba bo'yicha guruhlash
    const studentScores = new Map()

    testResults.forEach((result) => {
      const studentId = result.student_id
      if (!studentScores.has(studentId)) {
        studentScores.set(studentId, {
          studentId,
          profile: {
            firstName: result.profiles.first_name,
            lastName: result.profiles.last_name,
            avatarUrl: result.profiles.avatar_url,
          },
          totalScore: 0, // Umumiy ball
          testCount: 0,
        })
      }

      const student = studentScores.get(studentId)
      student.totalScore += result.score
      student.testCount += 1
    })

    // Massivga o'tkazish va o'rtacha ballni hisoblash
    const rankings = Array.from(studentScores.values())
      .map((student) => ({
        ...student,
        averageScore: student.testCount > 0 ? student.totalScore / student.testCount : 0, // O'rtacha ball (ochko)
      }))
      .sort((a, b) => b.totalScore - a.totalScore) // YANGI: Umumiy ball bo'yicha saralash

    return rankings
  } catch (error) {
    console.error("Get student rankings error:", error)
    return []
  }
}

// Fayl yuklash funksiyasi
export async function uploadFile(file: File, path: string): Promise<string> {
  if (!isSupabaseAvailable) {
    // Mock implementation - return a placeholder URL
    return `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(file.name)}`
  }

  try {
    // FAYL YUKLASHDA BUCKETNI YARATISH LOGIKASI OLIB TASHLANDI.
    // "files" nomli bucket allaqachon Supabase SQL Editor orqali yaratilgan bo'lishi kerak.

    const { data, error } = await supabase!.storage.from("files").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("Upload error:", error.message)
      throw new Error(`Faylni yuklashda xatolik: ${error.message}`)
    }

    // Fayl URL ni olish
    const { data: urlData } = supabase!.storage.from("files").getPublicUrl(data.path)

    console.log("File uploaded successfully, public URL:", urlData.publicUrl)
    return urlData.publicUrl
  } catch (error) {
    console.error("Upload file error (caught):", error)
    throw error // Xatolikni qayta tashlash
  }
}

export async function deleteFile(path: string): Promise<void> {
  if (!isSupabaseAvailable) {
    return
  }

  try {
    const { error } = await supabase!.storage.from("files").remove([path])
    if (error) throw error
  } catch (error) {
    console.error("Delete file error:", error)
    throw error
  }
}
