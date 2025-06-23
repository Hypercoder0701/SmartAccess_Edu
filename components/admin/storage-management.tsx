"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Folder, Upload, AlertTriangle, CheckCircle, HardDrive } from "lucide-react"
import { supabase, isSupabaseAvailable } from "@/lib/supabase"

interface StorageBucket {
  id: string
  name: string
  public: boolean
  file_size_limit?: number
  allowed_mime_types?: string[]
}

export function StorageManagement() {
  const [buckets, setBuckets] = useState<StorageBucket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkStorageStatus()
  }, [])

  const checkStorageStatus = async () => {
    if (!isSupabaseAvailable) {
      setError("Supabase mavjud emas - Demo rejimda ishlaydi")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: bucketsError } = await supabase!.storage.listBuckets()

      if (bucketsError) {
        setError(bucketsError.message)
      } else {
        setBuckets(data || [])
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createFilesBucket = async () => {
    if (!isSupabaseAvailable) return

    try {
      setLoading(true)
      setError(null)

      const { error: createError } = await supabase!.storage.createBucket("files", {
        public: true,
        allowedMimeTypes: ["image/*", "application/pdf", "text/*", "video/*"],
        fileSizeLimit: 5242880, // 5MB
      })

      if (createError) {
        setError(createError.message)
      } else {
        await checkStorageStatus()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Cheklanmagan"
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const filesBucketExists = buckets.some((bucket) => bucket.id === "files")

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HardDrive className="h-5 w-5" />
            <span>Storage holati yuklanmoqda...</span>
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <HardDrive className="h-5 w-5" />
          <span>Storage boshqaruvi</span>
        </CardTitle>
        <CardDescription>Fayl saqlash bucketlari va sozlamalari</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isSupabaseAvailable && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Demo rejimda ishlaydi - Supabase Storage mavjud emas</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Folder className="h-4 w-4" />
              <span className="font-medium">"files" bucket</span>
            </div>
            <div className="flex items-center space-x-2">
              {filesBucketExists ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Mavjud
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Yo'q
                </Badge>
              )}
            </div>
          </div>

          {!filesBucketExists && isSupabaseAvailable && (
            <div className="p-4 border rounded-lg bg-yellow-50">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-800">Files bucket yaratilmagan</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Avatar va boshqa fayllarni yuklash uchun "files" bucket yaratish kerak.
                  </p>
                  <Button onClick={createFilesBucket} className="mt-2" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Files bucket yaratish
                  </Button>
                </div>
              </div>
            </div>
          )}

          {buckets.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Mavjud bucketlar:</h4>
              {buckets.map((bucket) => (
                <div key={bucket.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Folder className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium">{bucket.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {bucket.public ? "Public" : "Private"} • Max: {formatFileSize(bucket.file_size_limit)}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{bucket.id}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <Button onClick={checkStorageStatus} variant="outline" size="sm">
            Holatni yangilash
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
