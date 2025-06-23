"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  BookOpen,
  FlaskConical,
  FileText,
  Users,
  Trophy,
  LogOut,
  Settings,
  ChevronUp,
  User,
  ChevronDown,
} from "lucide-react"
import { NotificationCenter } from "@/components/realtime/notification-center"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { getLectures, getPracticals, getStudentProgress, getAllTestResults } from "@/lib/database"
import type { Lecture, Practical, StudentProgress, TestResult, Profile } from "@/lib/types" // Profile turini import qildik

interface AppSidebarProps {
  user: any // Supabase User obyekti
  profile: Profile | null // YANGI: Profile obyekti
  userRole: "admin" | "student"
  currentPage: string
  currentId?: string // Tanlangan element ID si
  onNavigate: (page: string, id?: string) => void // ID ni qabul qilish
  onLogout: () => void
}

export function AppSidebar({ user, profile, userRole, currentPage, currentId, onNavigate, onLogout }: AppSidebarProps) {
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [practicals, setPracticals] = useState<Practical[]>([])
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]) // Talaba progressi
  const [studentTestResults, setStudentTestResults] = useState<TestResult[]>([]) // Talaba test natijalari
  const [loadingLectures, setLoadingLectures] = useState(true)
  const [loadingPracticals, setLoadingPracticals] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoadingLectures(true)
      setLoadingPracticals(true)
      try {
        console.log("AppSidebar received user prop:", user)
        console.log("AppSidebar received profile prop:", profile) // YANGI LOG
        console.log("Fetching lectures...")
        const fetchedLectures = await getLectures()
        const publishedLectures = fetchedLectures.filter((l) => l.status === "published")
        setLectures(publishedLectures)
        console.log("Fetched published lectures:", publishedLectures.length)

        console.log("Fetching practicals...")
        const fetchedPracticals = await getPracticals()
        console.log("Raw fetched practicals (before filtering):", fetchedPracticals)
        const publishedPracticals = fetchedPracticals.filter((p) => p.status === "published")
        setPracticals(publishedPracticals)
        console.log("Fetched published practicals:", publishedPracticals.length)

        if (userRole === "student" && user?.id) {
          console.log("Fetching student progress for user:", user.id)
          const progress = await getStudentProgress(user.id)
          setStudentProgress(progress)
          console.log("Student progress fetched:", progress.length)

          console.log("Fetching all test results for user:", user.id)
          const testResults = await getAllTestResults(user.id)
          setStudentTestResults(testResults)
          console.log("Student test results fetched:", testResults.length)
        }
      } catch (error) {
        console.error("Failed to fetch sidebar data:", error)
      } finally {
        setLoadingLectures(false)
        setLoadingPracticals(false)
        console.log("Loading finished. Lectures count:", lectures.length, "Practicals count:", practicals.length)
      }
    }
    fetchData()
  }, [user, profile, userRole]) // user, profile va userRole o'zgarganda qayta yuklash

  // Ma'ruza kirish nazorati
  const isLectureAccessible = (lecture: Lecture) => {
    return true // Barcha ma'ruzalar har doim ochiq
  }

  // Amaliyot kirish nazorati
  const isPracticalAccessible = (practical: Practical) => {
    return true // Barcha amaliyotlar har doim ochiq
  }

  // Admin menu items ga "content" qo'shish
  const adminMenuItems = [
    { id: "independent", label: "Mustaqil ishlar", icon: FileText },
    { id: "content", label: "Kontent boshqaruvi", icon: Settings },
    { id: "students", label: "Talabalar", icon: Users },
    { id: "ratings", label: "Talabalar reytingi", icon: Trophy },
  ]

  const studentMenuItems = [
    { id: "independent", label: "Mustaqil ishlar", icon: FileText },
    { id: "ratings", label: "Talabalar reytingi", icon: Trophy },
  ]

  const staticMenuItems = userRole === "admin" ? adminMenuItems : studentMenuItems

  // Foydalanuvchi ismini olish uchun yordamchi funksiya
  const getUserDisplayName = () => {
    if (userRole === "admin") {
      return "Administrator"
    }
    // Agar ism yoki familiya mavjud bo'lmasa, "Foydalanuvchi" deb ko'rsatish
    if (profile?.first_name || profile?.last_name) {
      // YANGI: profile dan o'qish
      return `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Foydalanuvchi"
    }
    return "Foydalanuvchi"
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} /> {/* YANGI: profile dan o'qish */}
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{getUserDisplayName()}</span>
          </div>
          <div className="ml-auto">
            <NotificationCenter userId={user?.id} />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Ma'ruzalar bo'limi dinamik ro'yxat bilan */}
              <Collapsible defaultOpen={currentPage === "lectures"} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={currentPage === "lectures"}>
                      <BookOpen className="h-4 w-4" />
                      <span>Ma'ruzalar</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {loadingLectures ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <SidebarMenuSkeleton key={i} showIcon={false} className="h-7" />
                        ))
                      ) : lectures.length > 0 ? (
                        lectures.map((lecture) => {
                          const accessible = isLectureAccessible(lecture)
                          return (
                            <SidebarMenuSubItem key={lecture.id}>
                              <SidebarMenuSubButton
                                isActive={currentPage === "lectures" && currentId === lecture.id}
                                onClick={() => onNavigate("lectures", lecture.id)}
                              >
                                <span>{lecture.title}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })
                      ) : (
                        <SidebarMenuSubItem>
                          <span className="px-2 py-1 text-xs text-gray-500">Ma'ruzalar topilmadi.</span>
                        </SidebarMenuSubItem>
                      )}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* YANGI: Amaliyotlar bo'limi dinamik ro'yxat bilan */}
              <Collapsible defaultOpen={currentPage === "practicals"} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={currentPage === "practicals"}>
                      <FlaskConical className="h-4 w-4" />
                      <span>Amaliyotlar</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {loadingPracticals ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <SidebarMenuSkeleton key={i} showIcon={false} className="h-7" />
                        ))
                      ) : practicals.length > 0 ? (
                        practicals.map((practical) => {
                          const accessible = isPracticalAccessible(practical)
                          return (
                            <SidebarMenuSubItem key={practical.id}>
                              <SidebarMenuSubButton
                                isActive={currentPage === "practicals" && currentId === practical.id}
                                onClick={() => onNavigate("practicals", practical.id)}
                              >
                                <span>{practical.title}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })
                      ) : (
                        <SidebarMenuSubItem>
                          <span className="px-2 py-1 text-xs text-gray-500">Amaliyotlar topilmadi.</span>
                        </SidebarMenuSubItem>
                      )}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Qolgan statik menyu elementlari */}
              {staticMenuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton isActive={currentPage === item.id} onClick={() => onNavigate(item.id)}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} /> {/* YANGI: profile dan o'qish */}
                    <AvatarFallback>
                      <User className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">
                    {profile?.first_name} {profile?.last_name} {/* YANGI: profile dan o'qish */}
                  </span>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem onClick={() => onNavigate("profile")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Profilni tahrirlash
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Chiqish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
