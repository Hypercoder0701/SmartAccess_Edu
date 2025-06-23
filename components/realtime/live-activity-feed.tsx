"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { supabase, isSupabaseAvailable } from "@/lib/supabase"
import { BookOpen, FlaskConical, Trophy, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { uz } from "date-fns/locale"

interface ActivityItem {
  id: string
  type: "lecture_completed" | "test_completed" | "student_registered"
  student_name: string
  student_avatar?: string
  content_title?: string
  score?: number
  created_at: string
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([])

  useEffect(() => {
    if (!isSupabaseAvailable) return

    // Load recent activities
    const loadActivities = async () => {
      // Get recent progress
      const { data: progressData } = await supabase!
        .from("student_progress")
        .select(`
          id,
          created_at,
          profiles:student_id (first_name, last_name, avatar_url),
          lectures:lecture_id (title)
        `)
        .order("created_at", { ascending: false })
        .limit(10)

      // Get recent test results
      const { data: testData } = await supabase!
        .from("test_results")
        .select(`
          id,
          score,
          completed_at,
          profiles:student_id (first_name, last_name, avatar_url),
          practicals:practical_id (title)
        `)
        .order("completed_at", { ascending: false })
        .limit(10)

      // Get recent registrations
      const { data: profileData } = await supabase!
        .from("profiles")
        .select("id, first_name, last_name, avatar_url, created_at")
        .eq("role", "student")
        .order("created_at", { ascending: false })
        .limit(5)

      const allActivities: ActivityItem[] = []

      // Add progress activities
      if (progressData) {
        progressData.forEach((item) => {
          allActivities.push({
            id: `progress_${item.id}`,
            type: "lecture_completed",
            student_name: `${item.profiles.first_name} ${item.profiles.last_name}`,
            student_avatar: item.profiles.avatar_url,
            content_title: item.lectures.title,
            created_at: item.created_at,
          })
        })
      }

      // Add test activities
      if (testData) {
        testData.forEach((item) => {
          allActivities.push({
            id: `test_${item.id}`,
            type: "test_completed",
            student_name: `${item.profiles.first_name} ${item.profiles.last_name}`,
            student_avatar: item.profiles.avatar_url,
            content_title: item.practicals.title,
            score: item.score,
            created_at: item.completed_at,
          })
        })
      }

      // Add registration activities
      if (profileData) {
        profileData.forEach((item) => {
          allActivities.push({
            id: `profile_${item.id}`,
            type: "student_registered",
            student_name: `${item.first_name} ${item.last_name}`,
            student_avatar: item.avatar_url,
            created_at: item.created_at,
          })
        })
      }

      // Sort by date and take latest 15
      allActivities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setActivities(allActivities.slice(0, 15))
    }

    loadActivities()

    // Set up real-time subscriptions
    const progressChannel = supabase!
      .channel("live_progress")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "student_progress",
        },
        async (payload) => {
          // Fetch additional data for the new progress
          const { data } = await supabase!
            .from("student_progress")
            .select(`
              id,
              created_at,
              profiles:student_id (first_name, last_name, avatar_url),
              lectures:lecture_id (title)
            `)
            .eq("id", payload.new.id)
            .single()

          if (data) {
            const newActivity: ActivityItem = {
              id: `progress_${data.id}`,
              type: "lecture_completed",
              student_name: `${data.profiles.first_name} ${data.profiles.last_name}`,
              student_avatar: data.profiles.avatar_url,
              content_title: data.lectures.title,
              created_at: data.created_at,
            }

            setActivities((prev) => [newActivity, ...prev.slice(0, 14)])
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "test_results",
        },
        async (payload) => {
          // Fetch additional data for the new test result
          const { data } = await supabase!
            .from("test_results")
            .select(`
              id,
              score,
              completed_at,
              profiles:student_id (first_name, last_name, avatar_url),
              practicals:practical_id (title)
            `)
            .eq("id", payload.new.id)
            .single()

          if (data) {
            const newActivity: ActivityItem = {
              id: `test_${data.id}`,
              type: "test_completed",
              student_name: `${data.profiles.first_name} ${data.profiles.last_name}`,
              student_avatar: data.profiles.avatar_url,
              content_title: data.practicals.title,
              score: data.score,
              created_at: data.completed_at,
            }

            setActivities((prev) => [newActivity, ...prev.slice(0, 14)])
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "profiles",
        },
        (payload) => {
          if (payload.new.role === "student") {
            const newActivity: ActivityItem = {
              id: `profile_${payload.new.id}`,
              type: "student_registered",
              student_name: `${payload.new.first_name} ${payload.new.last_name}`,
              student_avatar: payload.new.avatar_url,
              created_at: payload.new.created_at,
            }

            setActivities((prev) => [newActivity, ...prev.slice(0, 14)])
          }
        },
      )
      .subscribe()

    return () => {
      supabase!.removeChannel(progressChannel)
    }
  }, [])

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "lecture_completed":
        return <BookOpen className="h-4 w-4 text-blue-600" />
      case "test_completed":
        return <FlaskConical className="h-4 w-4 text-green-600" />
      case "student_registered":
        return <Trophy className="h-4 w-4 text-purple-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityMessage = (activity: ActivityItem) => {
    switch (activity.type) {
      case "lecture_completed":
        return `"${activity.content_title}" ma'ruzasini tugalladi`
      case "test_completed":
        return `"${activity.content_title}" testini ${activity.score}% bilan yakunladi`
      case "student_registered":
        return "platformaga ro'yxatdan o'tdi"
      default:
        return "faoliyat"
    }
  }

  const getScoreBadge = (score?: number) => {
    if (!score) return null

    const variant = "outline"
    let className = ""

    if (score >= 90) {
      className = "bg-green-500 text-white border-green-500"
    } else if (score >= 80) {
      className = "bg-blue-500 text-white border-blue-500"
    } else if (score >= 70) {
      className = "bg-yellow-500 text-white border-yellow-500"
    } else {
      className = "bg-red-500 text-white border-red-500"
    }

    return (
      <Badge variant={variant} className={className}>
        {score}%
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Jonli faoliyat</span>
        </CardTitle>
        <CardDescription>Real-time da talabalar faoliyati</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Clock className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Hozircha faoliyat yo'q</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.student_avatar || "/placeholder.svg"} />
                    <AvatarFallback>{activity.student_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      {getActivityIcon(activity.type)}
                      <span className="text-sm font-medium">{activity.student_name}</span>
                      {activity.score && getScoreBadge(activity.score)}
                    </div>
                    <p className="text-xs text-muted-foreground">{getActivityMessage(activity)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                        locale: uz,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
