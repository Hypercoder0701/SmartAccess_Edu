"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Video, Upload, AlertTriangle, CheckCircle } from "lucide-react"
import { uploadFile, isSupabaseAvailable } from "@/lib/database"

interface VideoUploadFormProps {
  onUploadComplete?: (videoUrl: string, videoData: any) => void
  maxSizeMB?: number
}

export function VideoUploadForm({ onUploadComplete, maxSizeMB = 100 }: VideoUploadFormProps) {
  const [videoData, setVideoData] = useState({
    title: "",
    description: "",
    file: null as File | null,
    fileName: "",
  })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setUploadStatus({
        success: false,
        message: `Video hajmi ${maxSizeMB}MB dan oshmasligi kerak`,
      })
      return
    }

    // Check if it's a video file
    if (!file.type.startsWith("video/")) {
      setUploadStatus({
        success: false,
        message: "Faqat video fayllar qabul qilinadi",
      })
      return
    }

    setVideoData((prev) => ({
      ...prev,
      file,
      fileName: file.name,
    }))

    // Clear previous status
    setUploadStatus(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!videoData.file || !videoData.title.trim()) {
      setUploadStatus({
        success: false,
        message: "Video va sarlavha kiritilishi shart",
      })
      return
    }

    setIsUploading(true)
    setUploadStatus(null)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 5
        })
      }, 500)

      // Upload video to storage
      const path = `videos/${Date.now()}_${videoData.fileName}`
      const videoUrl = await uploadFile(videoData.file, path)

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Here you would typically save the video metadata to your database
      // For now, we'll just simulate success
      setUploadStatus({
        success: true,
        message: "Video muvaffaqiyatli yuklandi!",
      })

      // Call the callback if provided
      if (onUploadComplete) {
        onUploadComplete(videoUrl, {
          title: videoData.title,
          description: videoData.description,
          fileName: videoData.fileName,
          videoUrl,
          uploadedAt: new Date().toISOString(),
        })
      }

      // Reset form after a delay to show 100% progress
      setTimeout(() => {
        setVideoData({
          title: "",
          description: "",
          file: null,
          fileName: "",
        })
        setUploadProgress(0)
      }, 1000)
    } catch (error) {
      console.error("Video upload error:", error)
      setUploadStatus({
        success: false,
        message: "Video yuklashda xatolik yuz berdi",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Video className="h-5 w-5" />
          <span>Video yuklash</span>
        </CardTitle>
        <CardDescription>Ma'ruza videolari va boshqa video materiallarni yuklash</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="video-title">Video nomi</Label>
            <Input
              id="video-title"
              placeholder="Video nomini kiriting"
              value={videoData.title}
              onChange={(e) => setVideoData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="video-description">Tavsif</Label>
            <Textarea
              id="video-description"
              placeholder="Video haqida qisqacha ma'lumot"
              value={videoData.description}
              onChange={(e) => setVideoData((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="video-upload">Video tanlash</Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="video-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {videoData.fileName ? (
                    <>
                      <CheckCircle className="w-8 h-8 mb-3 text-green-500" />
                      <p className="mb-2 text-sm text-gray-700 font-medium">{videoData.fileName}</p>
                      <p className="text-xs text-gray-500">Boshqa video tanlash uchun bosing</p>
                    </>
                  ) : (
                    <>
                      <Video className="w-8 h-8 mb-3 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Yuklash uchun bosing</span> yoki videoni bu yerga tashlang
                      </p>
                      <p className="text-xs text-gray-500">MP4, MOV, AVI (MAX. {maxSizeMB}MB)</p>
                    </>
                  )}
                </div>
                <input id="video-upload" type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="text-sm text-center">{uploadProgress}% yuklandi</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {uploadStatus && (
            <Alert variant={uploadStatus.success ? "default" : "destructive"}>
              {uploadStatus.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              <AlertDescription>{uploadStatus.message}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isUploading || !videoData.file}>
            {isUploading ? (
              <>
                <span className="animate-spin mr-2">⏳</span> Yuklanmoqda...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Videoni yuklash
              </>
            )}
          </Button>

          {!isSupabaseAvailable && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Demo rejimda ishlaydi - Videolar vaqtinchalik saqlanadi
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
