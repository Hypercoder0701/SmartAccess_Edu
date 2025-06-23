"use server"

import { createSupabaseServerClient } from "./supabase"
import { revalidatePath } from "next/cache"

export async function deleteStudentAction(userId: string) {
  const supabase = createSupabaseServerClient()
  if (!supabase) {
    return { error: "Database server-side ulanishi sozlanmagan." }
  }

  try {
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
      // Agar foydalanuvchi auth da topilmasa, baribir profildan o'chirishga harakat qilish
      if (error.message.includes("User not found")) {
        const { error: profileError } = await supabase.from("profiles").delete().eq("id", userId)
        if (profileError) throw profileError
      } else {
        throw error
      }
    }

    revalidatePath("/") // Revalidate the main page to refresh the list
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function updateStudentPasswordAction(userId: string, newPassword: string) {
  const supabase = createSupabaseServerClient()
  if (!supabase) {
    return { error: "Database server-side ulanishi sozlanmagan." }
  }

  if (!newPassword || newPassword.length < 6) {
    return { error: "Parol kamida 6 ta belgidan iborat bo'lishi kerak." }
  }

  try {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}
