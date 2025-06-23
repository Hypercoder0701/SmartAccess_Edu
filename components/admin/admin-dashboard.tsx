"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, FlaskConical, FileText, Trophy, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import { getAdminStats } from "@/lib/database"
import { LiveActivityFeed } from "@/components/realtime/live-activity-feed"
import { useRealtimeAdminStats } from "@/hooks/use-realtime"
import { StorageManagement } from "@/components/admin/storage-management"

type AdminDashboardProps = {}

export default function AdminDashboard({}: AdminDashboardProps) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalLectures: 0,
    totalPracticals: 0,
    totalIndependentWork: 0,
    averageScore: 0,
    completionRate: 0,
  })
  const [loading, setLoading] = useState(true)

  const { refreshTrigger } = useRealtimeAdminStats()

  useEffect(() => {
    async function loadStats() {
      try {
        const adminStats = await getAdminStats()
        setStats(adminStats)
      } catch (error) {
        console.error("Error loading stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [refreshTrigger])

  if (loading) {
    return <div>Yuklanmoqda...</div>
  }

  const statCards = [
    {
      title: "Jami talabalar",
      value: stats.totalStudents,
      description: "Ro'yxatdan o'tgan talabalar soni",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Ma'ruzalar",
      value: stats.totalLectures,
      description: "Yuklangan ma'ruzalar soni",
      icon: BookOpen,
      color: "text-green-600",
    },
    {
      title: "Amaliyotlar",
      value: stats.totalPracticals,
      description: "Yaratilgan amaliyot ishlari",
      icon: FlaskConical,
      color: "text-purple-600",
    },
    {
      title: "Mustaqil ishlar",
      value: stats.totalIndependentWork,
      description: "Mustaqil ish topshiriqlari",
      icon: FileText,
      color: "text-orange-600",
    },
    {
      title: "O'rtacha ball",
      value: `${stats.averageScore.toFixed(1)}%`,
      description: "Talabalarning o'rtacha natijasi",
      icon: Trophy,
      color: "text-yellow-600",
    },
    {
      title: "Tugatish foizi",
      value: `${stats.completionRate.toFixed(1)}%`,
      description: "Kursni tugatgan talabalar",
      icon: TrendingUp,
      color: "text-red-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Tizim statistikasi va umumiy ko'rsatkichlar</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>So'nggi faoliyat</CardTitle>
            <CardDescription>Tizimda so'nggi amalga oshirilgan harakatlar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="text-sm">
                  <span className="font-medium">Yangi talaba ro'yxatdan o'tdi</span>
                  <p className="text-muted-foreground">2 soat oldin</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="text-sm">
                  <span className="font-medium">Ma'ruza yangilandi</span>
                  <p className="text-muted-foreground">5 soat oldin</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="text-sm">
                  <span className="font-medium">Amaliyot test yaratildi</span>
                  <p className="text-muted-foreground">1 kun oldin</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <LiveActivityFeed />

        <StorageManagement />
      </div>
    </div>
  )
}
