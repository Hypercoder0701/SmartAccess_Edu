"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Database, Users, BookOpen, FlaskConical, FileText, RefreshCw } from "lucide-react"
import { supabase, isSupabaseAvailable } from "@/lib/supabase"

interface DatabaseStats {
  profiles: number
  lectures: number
  practicals: number
  testQuestions: number
  independentWork: number
  adminUsers: number
  studentUsers: number
}

export function DatabaseStatus() {
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    if (!isSupabaseAvailable) {
      setError("Supabase mavjud emas")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const [
        { count: profilesCount },
        { count: lecturesCount },
        { count: practicalsCount },
        { count: testQuestionsCount },
        { count: independentWorkCount },
        { count: adminCount },
        { count: studentCount },
      ] = await Promise.all([
        supabase!.from("profiles").select("*", { count: "exact", head: true }),
        supabase!.from("lectures").select("*", { count: "exact", head: true }),
        supabase!.from("practicals").select("*", { count: "exact", head: true }),
        supabase!.from("test_questions").select("*", { count: "exact", head: true }),
        supabase!.from("independent_work").select("*", { count: "exact", head: true }),
        supabase!.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
        supabase!.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
      ])

      setStats({
        profiles: profilesCount || 0,
        lectures: lecturesCount || 0,
        practicals: practicalsCount || 0,
        testQuestions: testQuestionsCount || 0,
        independentWork: independentWorkCount || 0,
        adminUsers: adminCount || 0,
        studentUsers: studentCount || 0,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Database holati yuklanmoqda...</span>
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <Database className="h-5 w-5" />
            <span>Database xatoligi</span>
          </CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loadStats} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Qayta urinish
          </Button>
        </CardContent>
      </Card>
    )
  }

  const isSetupComplete = stats && stats.profiles > 0 && stats.lectures > 0 && stats.adminUsers > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Database holati</span>
          {isSetupComplete && <CheckCircle className="h-5 w-5 text-green-600" />}
        </CardTitle>
        <CardDescription>
          {isSetupComplete ? "Database to'liq sozlangan va ishga tayyor!" : "Database sozlanmagan"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Jami foydalanuvchilar</span>
              </div>
              <Badge variant="outline">{stats?.profiles || 0}</Badge>
            </div>

            <div className="flex items-center justify-between pl-6">
              <span className="text-xs text-muted-foreground">Admin</span>
              <Badge variant={stats?.adminUsers ? "default" : "destructive"}>{stats?.adminUsers || 0}</Badge>
            </div>

            <div className="flex items-center justify-between pl-6">
              <span className="text-xs text-muted-foreground">Talabalar</span>
              <Badge variant="outline">{stats?.studentUsers || 0}</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-green-600" />
                <span className="text-sm">Ma'ruzalar</span>
              </div>
              <Badge variant="outline">{stats?.lectures || 0}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FlaskConical className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Amaliyotlar</span>
              </div>
              <Badge variant="outline">{stats?.practicals || 0}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-orange-600" />
                <span className="text-sm">Mustaqil ishlar</span>
              </div>
              <Badge variant="outline">{stats?.independentWork || 0}</Badge>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Test savollari</span>
            <Badge variant="outline">{stats?.testQuestions || 0}</Badge>
          </div>
        </div>

        <Button onClick={loadStats} variant="ghost" size="sm" className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Ma'lumotlarni yangilash
        </Button>
      </CardContent>
    </Card>
  )
}
