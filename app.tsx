"use client"

import { useRouter } from "next/navigation"

import { useState, useEffect, useCallback } from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { getCurrentUser, signOut, isSupabaseAvailable } from "@/lib/database"
import type { User, Profile } from "@/lib/supabase" // User va Profile turlari
import LoginForm from "@/components/auth/login-form"
import RegisterForm from "@/components/auth/register-form"
import AdminDashboard from "@/components/admin/admin-dashboard"
import StudentDashboard from "@/components/student/student-dashboard"
import ContentManagement from "@/components/admin/content-management"
import StudentList from "@/components/admin/student-list"
import StudentRatingsPage from "@/components/admin/student-ratings-page"
import LectureDetailPage from "@/components/student/lecture-detail-page"
import PracticalDetailPage from "@/components/student/practical-detail-page" // YANGI: Import PracticalDetailPage
import ProfileEditPage from "@/components/profile/profile-edit-page" // YANGI: Import ProfileEditPage

// Sidebar komponentlarining importlari
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// DatabaseSetupChecker va DatabaseStatus komponentlari nomlangan eksportlar sifatida import qilindi
import { DatabaseSetupChecker } from "@/components/database-setup-checker"
import { DatabaseStatus } from "@/components/database-status"

export default function App() {
  const [user, setUser] = useState<User | null>(null) // Supabase User obyekti
  const [profile, setProfile] = useState<Profile | null>(null) // Custom Profile obyekti
  const [loading, setLoading] = useState(true)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [currentPage, setCurrentPage] = useState<string>("dashboard")
  const [currentId, setCurrentId] = useState<string | undefined>(undefined)

  const router = useRouter()

  const fetchUser = useCallback(async () => {
    setLoading(true)
    const userData = await getCurrentUser()
    // userData va userData.profile mavjudligini tekshirish
    if (userData && userData.profile) {
      setUser(userData.user)
      setProfile(userData.profile)
      if (userData.profile.role === "admin") {
        setCurrentPage("dashboard")
      } else {
        setCurrentPage("dashboard")
      }
    } else {
      setUser(null)
      setProfile(null)
      setCurrentPage("auth")
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const handleLogin = async () => {
    setLoading(true)
    const userData = await getCurrentUser()
    // userData va userData.profile mavjudligini tekshirish
    if (userData && userData.profile) {
      setUser(userData.user)
      setProfile(userData.profile)
      if (userData.profile.role === "admin") {
        setCurrentPage("dashboard")
      } else {
        setCurrentPage("dashboard")
      }
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await signOut()
    setUser(null)
    setProfile(null)
    setCurrentPage("auth")
    router.push("/")
  }

  const handleNavigate = (page: string, id?: string) => {
    setCurrentPage(page)
    setCurrentId(id)
  }

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      dashboard: "Dashboard",
      lectures: "Ma'ruzalar",
      practicals: "Amaliyotlar",
      independent: "Mustaqil ishlar",
      students: "Talabalar",
      ratings: "Talabalar reytingi",
      profile: "Profil",
      content: "Kontent boshqaruvi",
      uploads: "Fayllar", // Agar bu sahifa mavjud bo'lsa
    }
    return titles[currentPage] || "Dashboard"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>Yuklanmoqda...</p>
      </div>
    )
  }

  // Supabase mavjudligini tekshirish va xabar berish
  if (!isSupabaseAvailable) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Supabase sozlanmagan</h1>
        <p className="text-lg mb-6">
          Iltimos, `.env.local` faylingizda `NEXT_PUBLIC_SUPABASE_URL` va `NEXT_PUBLIC_SUPABASE_ANON_KEY`
          o'zgaruvchilari to'g'ri o'rnatilganligiga ishonch hosil qiling.
        </p>
        <p className="text-sm text-muted-foreground">
          Mock ma'lumotlar bilan ishlash uchun ushbu xabarni e'tiborsiz qoldirishingiz mumkin.
        </p>
        <div className="mt-8">
          <DatabaseSetupChecker />
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-3 space-y-6">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-2">SmartAccess Edu</h1>
            </div>

            {authMode === "register" ? (
              <RegisterForm onRegisterSuccess={handleLogin} onLoginClick={() => setAuthMode("login")} />
            ) : (
              <LoginForm onLoginSuccess={handleLogin} onRegisterClick={() => setAuthMode("register")} />
            )}
          </div>
          {/* DatabaseSetupChecker va DatabaseStatus komponentlari bu yerda bo'lishi mumkin */}
          {/* <div className="lg:col-span-1 space-y-6">
            <DatabaseSetupChecker />
            <DatabaseStatus />
          </div> */}
        </div>
      </div>
    )
  }

  const renderContent = () => {
    if (profile.role === "admin") {
      switch (currentPage) {
        case "dashboard":
          return <AdminDashboard user={user} profile={profile} />
        case "content":
          return <ContentManagement adminId={profile.id} />
        case "students":
          return <StudentList />
        case "ratings":
          return <StudentRatingsPage />
        case "lectures":
          return currentId ? <LectureDetailPage lectureId={currentId} /> : <p>Ma'ruzalar ro'yxati (Admin)</p>
        case "practicals": // Amaliyotlar sahifasi
          return currentId ? (
            <PracticalDetailPage practicalId={currentId} studentId={user.id} onNavigate={handleNavigate} />
          ) : (
            <p>Amaliyotlar ro'yxati (Admin)</p>
          )
        case "independent":
          return <p>Mustaqil ishlar boshqaruvi (Admin)</p>
        case "profile":
        default:
          return <AdminDashboard user={user} profile={profile} />
      }
    } else {
      // Student
      switch (currentPage) {
        case "dashboard":
          return <StudentDashboard user={user} profile={profile} />
        case "lectures":
          return currentId ? <LectureDetailPage lectureId={currentId} /> : <p>Ma'ruzalar ro'yxati (Talaba)</p>
        case "practicals": // Amaliyotlar sahifasi
          return currentId ? (
            <PracticalDetailPage practicalId={currentId} studentId={user.id} onNavigate={handleNavigate} />
          ) : (
            <p>Amaliyotlar sahifasi (Talaba)</p>
          )
        case "independent":
          return <p>Mustaqil ishlar sahifasi (Talaba)</p>
        case "ratings":
          return <StudentRatingsPage />
        case "profile":
          return <ProfileEditPage profile={profile} onProfileUpdate={fetchUser} /> // YANGI: ProfileEditPage
        default:
          return <StudentDashboard user={user} profile={profile} />
      }
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar
        user={user}
        profile={profile}
        userRole={profile.role}
        currentPage={currentPage}
        currentId={currentId}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#" onClick={() => handleNavigate("dashboard")}>
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              {currentPage !== "dashboard" && (
                <>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{getPageTitle()}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-2">
            {/* Bu yerda boshqa header elementlari bo'lishi mumkin */}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4">{renderContent()}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
