"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, AlertTriangle, Database, ExternalLink } from "lucide-react"
import { supabase, isSupabaseAvailable } from "@/lib/supabase"

interface DatabaseStatus {
  connected: boolean
  tablesExist: boolean
  adminExists: boolean
  sampleDataExists: boolean
  error?: string
}

export function DatabaseSetupChecker() {
  const [status, setStatus] = useState<DatabaseStatus>({
    connected: false,
    tablesExist: false,
    adminExists: false,
    sampleDataExists: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const checkDatabaseStatus = async () => {
    setLoading(true)

    if (!isSupabaseAvailable) {
      setStatus({
        connected: false,
        tablesExist: false,
        adminExists: false,
        sampleDataExists: false,
        error: "Supabase sozlanmagan - Demo rejimda ishlaydi",
      })
      setLoading(false)
      return
    }

    try {
      // Check connection
      const { data: connectionTest, error: connectionError } = await supabase!.from("profiles").select("id").limit(1)

      const connected = !connectionError
      const tablesExist = !connectionError || !connectionError.message.includes("does not exist")

      let adminExists = false
      let sampleDataExists = false

      if (tablesExist) {
        // Check for admin user
        const { data: adminData } = await supabase!.from("profiles").select("id").eq("role", "admin").limit(1)

        adminExists = !!adminData && adminData.length > 0

        // Check for sample data
        const { data: lectureData } = await supabase!.from("lectures").select("id").limit(1)

        sampleDataExists = !!lectureData && lectureData.length > 0
      }

      setStatus({
        connected,
        tablesExist,
        adminExists,
        sampleDataExists,
        error: connectionError?.message,
      })
    } catch (error: any) {
      setStatus({
        connected: false,
        tablesExist: false,
        adminExists: false,
        sampleDataExists: false,
        error: error.message,
      })
    }

    setLoading(false)
  }

  const getStatusIcon = (condition: boolean) => {
    return condition ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Database holatini tekshirish...</span>
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  const allGood = status.connected && status.tablesExist && status.adminExists && status.sampleDataExists

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Database holati</span>
        </CardTitle>
        <CardDescription>{allGood ? "Barcha sozlamalar tayyor!" : "Ba'zi sozlamalar to'liq emas"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Supabase ulanishi</span>
            {getStatusIcon(status.connected)}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Database jadvallar</span>
            {getStatusIcon(status.tablesExist)}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Admin foydalanuvchi</span>
            {getStatusIcon(status.adminExists)}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Sample ma'lumotlar</span>
            {getStatusIcon(status.sampleDataExists)}
          </div>
        </div>

        {status.error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">{status.error}</AlertDescription>
          </Alert>
        )}

        {!allGood && (
          <div className="space-y-2">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Database to'liq sozlanmagan. SQL skriptlarni ishga tushiring.
              </AlertDescription>
            </Alert>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Supabase Dashboard
            </Button>
          </div>
        )}

        <Button variant="ghost" size="sm" className="w-full" onClick={checkDatabaseStatus}>
          Qayta tekshirish
        </Button>
      </CardContent>
    </Card>
  )
}
