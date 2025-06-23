"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Upload, AlertTriangle, CheckCircle } from "lucide-react"
import { uploadFile, isSupabaseAvailable } from "@/lib/database"

interface FileUploadFormProps {
  onUploadComplete?: (fileUrl: string, fileData: any) => void
  allowedTypes?: string
  maxSizeMB?: number
}

export function FileUploadForm({
  onUploadComplete,
  allowedTypes = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt",
  maxSizeMB = 10,
}: FileUploadFormProps) {
  const [fileData, setFileData] = useState({
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setUploadStatus({
        success: false,
        message: `Fayl hajmi ${maxSizeMB}MB dan oshmasligi kerak`,
      })
      return
    }

    setFileData((prev) => ({
      ...prev,
      file,
      fileName: file.name,
    }))

    // Clear previous status
    setUploadStatus(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fileData.file || !fileData.title.trim()) {
      setUploadStatus({
        success: false,
        message: "Fayl va sarlavha kiritilishi shart",
      })
      return
    }

    setIsUploading(true)
    setUploadStatus(null)

    try {
      // Upload file to storage
      const path = `uploads/${Date.now()}_${fileData.fileName}`
      const fileUrl = await uploadFile(fileData.file, path)

      // Here you would typically save the file metadata to your database
      // For now, we'll just simulate success
      setUploadStatus({
        success: true,
        message: "Fayl muvaffaqiyatli yuklandi!",
      })

      // Call the callback if provided
      if (onUploadComplete) {
        onUploadComplete(fileUrl, {
          title: fileData.title,
          description: fileData.description,
          fileName: fileData.fileName,
          fileUrl,
          uploadedAt: new Date().toISOString(),
        })
      }

      // Reset form
      setFileData({
        title: "",
        description: "",
        file: null,
        fileName: "",
      })
    } catch (error) {
      console.error("File upload error:", error)
      setUploadStatus({
        success: false,
        message: "Fayl yuklashda xatolik yuz berdi",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Fayl yuklash</span>
        </CardTitle>
        <CardDescription>Ma'ruza materiallari, PDF va boshqa fayllarni yuklash</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="file-title">Fayl nomi</Label>
            <Input
              id="file-title"
              placeholder="Fayl nomini kiriting"
              value={fileData.title}
              onChange={(e) => setFileData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="file-description">Tavsif</Label>
            <Textarea
              id="file-description"
              placeholder="Fayl haqida qisqacha ma'lumot"
              value={fileData.description}
              onChange={(e) => setFileData((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="file-upload">Fayl tanlash</Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {fileData.fileName ? (
                    <>
                      <CheckCircle className="w-8 h-8 mb-3 text-green-500" />
                      <p className="mb-2 text-sm text-gray-700 font-medium">{fileData.fileName}</p>
                      <p className="text-xs text-gray-500">Boshqa fayl tanlash uchun bosing</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-3 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Yuklash uchun bosing</span> yoki faylni bu yerga tashlang
                      </p>
                      <p className="text-xs text-gray-500">PDF, DOCX, XLSX (MAX. {maxSizeMB}MB)</p>
                    </>
                  )}
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept={allowedTypes}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {uploadStatus && (
            <Alert variant={uploadStatus.success ? "default" : "destructive"}>
              {uploadStatus.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              <AlertDescription>{uploadStatus.message}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isUploading || !fileData.file}>
            {isUploading ? (
              <>
                <span className="animate-spin mr-2">⏳</span> Yuklanmoqda...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Faylni yuklash
              </>
            )}
          </Button>

          {!isSupabaseAvailable && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Demo rejimda ishlaydi - Fayllar vaqtinchalik saqlanadi
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
