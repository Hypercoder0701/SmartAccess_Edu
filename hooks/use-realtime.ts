"use client"

import { useEffect, useState } from "react"
import { supabase, isSupabaseAvailable } from "@/lib/supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  created_at: string
}

export function useRealtimeNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!isSupabaseAvailable || !userId) return

    // Load existing notifications
    const loadNotifications = async () => {
      const { data, error } = await supabase!
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50)

      if (!error && data) {
        setNotifications(data)
        setUnreadCount(data.filter((n) => !n.read).length)
      }
    }

    loadNotifications()

    // Set up real-time subscription
    const notificationChannel = supabase!
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications((prev) => [newNotification, ...prev.slice(0, 49)])
          setUnreadCount((prev) => prev + 1)
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updatedNotification = payload.new as Notification
          setNotifications((prev) => prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n)))
          if (updatedNotification.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1))
          }
        },
      )
      .subscribe()

    setChannel(notificationChannel)

    return () => {
      if (notificationChannel) {
        supabase!.removeChannel(notificationChannel)
      }
    }
  }, [userId])

  const markAsRead = async (notificationId: string) => {
    if (!isSupabaseAvailable) return

    const { error } = await supabase!.from("notifications").update({ read: true }).eq("id", notificationId)

    if (!error) {
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  }

  const markAllAsRead = async () => {
    if (!isSupabaseAvailable || !userId) return

    const { error } = await supabase!
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false)

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    }
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  }
}

export function useRealtimeProgress(studentId: string | null) {
  const [progress, setProgress] = useState<any[]>([])
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!isSupabaseAvailable || !studentId) return

    // Load existing progress
    const loadProgress = async () => {
      const { data, error } = await supabase!.from("student_progress").select("*").eq("student_id", studentId)

      if (!error && data) {
        setProgress(data)
      }
    }

    loadProgress()

    // Set up real-time subscription
    const progressChannel = supabase!
      .channel(`progress:${studentId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "student_progress",
          filter: `student_id=eq.${studentId}`,
        },
        (payload) => {
          setProgress((prev) => [...prev, payload.new])
        },
      )
      .subscribe()

    setChannel(progressChannel)

    return () => {
      if (progressChannel) {
        supabase!.removeChannel(progressChannel)
      }
    }
  }, [studentId])

  return { progress }
}

export function useRealtimeTestResults(studentId: string | null) {
  const [testResults, setTestResults] = useState<any[]>([])
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!isSupabaseAvailable || !studentId) return

    // Load existing test results
    const loadTestResults = async () => {
      const { data, error } = await supabase!.from("test_results").select("*").eq("student_id", studentId)

      if (!error && data) {
        setTestResults(data)
      }
    }

    loadTestResults()

    // Set up real-time subscription
    const resultsChannel = supabase!
      .channel(`test_results:${studentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "test_results",
          filter: `student_id=eq.${studentId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTestResults((prev) => [...prev, payload.new])
          } else if (payload.eventType === "UPDATE") {
            setTestResults((prev) => prev.map((result) => (result.id === payload.new.id ? payload.new : result)))
          }
        },
      )
      .subscribe()

    setChannel(resultsChannel)

    return () => {
      if (resultsChannel) {
        supabase!.removeChannel(resultsChannel)
      }
    }
  }, [studentId])

  return { testResults }
}

export function useRealtimeIndependentSubmissions(studentId: string | null) {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!isSupabaseAvailable || !studentId) return

    // Load existing submissions
    const loadSubmissions = async () => {
      const { data, error } = await supabase!.from("independent_submissions").select("*").eq("student_id", studentId)

      if (!error && data) {
        setSubmissions(data)
      }
    }

    loadSubmissions()

    // Set up real-time subscription
    const submissionsChannel = supabase!
      .channel(`independent_submissions:${studentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "independent_submissions",
          filter: `student_id=eq.${studentId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setSubmissions((prev) => [...prev, payload.new])
          } else if (payload.eventType === "UPDATE") {
            setSubmissions((prev) => prev.map((sub) => (sub.id === payload.new.id ? payload.new : sub)))
          }
        },
      )
      .subscribe()

    setChannel(submissionsChannel)

    return () => {
      if (submissionsChannel) {
        supabase!.removeChannel(submissionsChannel)
      }
    }
  }, [studentId])

  return { submissions }
}

export function useRealtimeAdminStats() {
  const [stats, setStats] = useState<any>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!isSupabaseAvailable) return

    // Set up real-time subscription for admin stats
    const statsChannel = supabase!
      .channel("admin_stats")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => {
          // Trigger stats refresh when profiles change
          setStats((prev: any) => ({ ...prev, _refresh: Date.now() }))
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "test_results",
        },
        () => {
          // Trigger stats refresh when test results change
          setStats((prev: any) => ({ ...prev, _refresh: Date.now() }))
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "student_progress",
        },
        () => {
          // Trigger stats refresh when progress changes
          setStats((prev: any) => ({ ...prev, _refresh: Date.now() }))
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lectures",
        },
        () => {
          setStats((prev: any) => ({ ...prev, _refresh: Date.now() }))
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "practicals",
        },
        () => {
          setStats((prev: any) => ({ ...prev, _refresh: Date.now() }))
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "independent_work",
        },
        () => {
          setStats((prev: any) => ({ ...prev, _refresh: Date.now() }))
        },
      )
      .subscribe()

    setChannel(statsChannel)

    return () => {
      if (statsChannel) {
        supabase!.removeChannel(statsChannel)
      }
    }
  }, [])

  return { stats, refreshTrigger: stats?._refresh }
}
