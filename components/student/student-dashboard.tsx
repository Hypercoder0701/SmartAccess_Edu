"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FlaskConical, FileText, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import {
  getLectures,
  getPracticals,
  getIndependentWork,
  getStudentProgress,
  getAllTestResults, // getTestResults o'rniga
  getStudentRankings,
  getIndependentSubmissions,
} from "@/lib/database"
import type { User, Profile } from "@/lib/supabase" // Import Profile type

interface StudentDashboardProps {
  user: User | null // User tipini aniqlash
  profile: Profile | null // Profile tipini aniqlash
}

export default function StudentDashboard({ user, profile }: StudentDashboardProps) {
  // Exportni default qilib o'zgartirish
  const [stats, setStats] = useState({
    totalLectures: 0,
    completedLectures: 0,
    totalPracticals: 0,
    completedPracticals: 0,
    totalIndependentWork: 0,
    completedIndependentWork: 0,
    averageScore: 0,
    studentRank: "Noma'lum",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStudentStats() {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        const [
          lecturesData,
          practicalsData,
          independentWorkData,
          progressData,
          allTestResultsData, // testResultsData o'rniga
          rankingsData,
          independentSubmissionsData,
        ] = await Promise.all([
          getLectures(),
          getPracticals(),
          getIndependentWork(),
          getStudentProgress(user.id),
          getAllTestResults(user.id), // getTestResults(user.id) o'rniga
          getStudentRankings(),
          getIndependentSubmissions(user.id),
        ])

        const totalLectures = lecturesData.length
        const completedLectures = progressData.length

        const totalPracticals = practicalsData.length
        const completedPracticals = allTestResultsData.length // allTestResultsData.length ga o'zgartirildi

        const totalIndependentWork = independentWorkData.length
        // For independent work, we need to fetch submissions to count completed ones
        const completedIndependentWork = independentSubmissionsData?.length || 0

        const scores = allTestResultsData.map((r) => r.score)
        const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

        const studentRanking = rankingsData.findIndex((s) => s.studentId === user.id) + 1
        const totalStudents = rankingsData.length
        let rankDisplay = "Noma'lum"
        if (studentRanking > 0 && totalStudents > 0) {
          const percentageRank = (studentRanking / totalStudents) * 100
          if (percentageRank <= 10) {
            rankDisplay = "Top 10%"
          } else if (percentageRank <= 25) {
            rankDisplay = "Top 25%"
          } else if (percentageRank <= 50) {
            rankDisplay = "Top 50%"
          } else {
            rankDisplay = `${studentRanking}/${totalStudents}`
          }
        }

        setStats({
          totalLectures,
          completedLectures,
          totalPracticals,
          completedPracticals,
          totalIndependentWork,
          completedIndependentWork,
          averageScore,
          studentRank: rankDisplay,
        })
      } catch (error) {
        console.error("Error loading student dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStudentStats()
  }, [user])

  const getUserGreetingName = () => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Foydalanuvchi"
    }
    return "Foydalanuvchi"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Xush kelibsiz, {getUserGreetingName()}!</h1>
      <p className="text-muted-foreground">Bu sizning shaxsiy o'quv dashboardingiz.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ma'ruzalar</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.completedLectures}/{stats.totalLectures}
            </div>
            <p className="text-xs text-muted-foreground">Tugatilgan ma'ruzalar soni</p>
            <Button
              variant="link"
              className="p-0 h-auto mt-2"
              onClick={() => {
                /* onNavigate("lectures") */
              }}
            >
              Ma'ruzalarga o'tish
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amaliyotlar</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.completedPracticals}/{stats.totalPracticals}
            </div>
            <p className="text-xs text-muted-foreground">Tugatilgan amaliyotlar soni</p>
            <Button
              variant="link"
              className="p-0 h-auto mt-2"
              onClick={() => {
                /* onNavigate("practicals") */
              }}
            >
              Amaliyotlarga o'tish
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mustaqil ishlar</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.completedIndependentWork}/{stats.totalIndependentWork}
            </div>
            <p className="text-xs text-muted-foreground">Tugatilgan mustaqil ishlar soni</p>
            <Button
              variant="link"
              className="p-0 h-auto mt-2"
              onClick={() => {
                /* onNavigate("independent") */
              }}
            >
              Mustaqil ishlarga o'tish
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">O'rtacha ball</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Sizning o'rtacha test natijangiz</p>
            <Button
              variant="link"
              className="p-0 h-auto mt-2"
              onClick={() => {
                /* onNavigate("ratings") */
              }}
            >
              Reytingni ko'rish
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reyting</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.studentRank}</div>
            <p className="text-xs text-muted-foreground">Sizning umumiy reytingingiz</p>
            <Button
              variant="link"
              className="p-0 h-auto mt-2"
              onClick={() => {
                /* onNavigate("ratings") */
              }}
            >
              Reytingni ko'rish
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
