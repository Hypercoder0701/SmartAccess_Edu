"use client"

import { FileUploadForm } from "./file-upload-form"
import { VideoUploadForm } from "./video-upload-form"
import { UploadedFilesList } from "./uploaded-files-list"

export function FileUploadPage() {
  const handleFileUploadComplete = (fileUrl: string, fileData: any) => {
    console.log("File uploaded:", fileUrl, fileData)
    // In a real app, you would update your UI or database
  }

  const handleVideoUploadComplete = (videoUrl: string, videoData: any) => {
    console.log("Video uploaded:", videoUrl, videoData)
    // In a real app, you would update your UI or database
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fayllarni yuklash</h1>
        <p className="text-muted-foreground">Ma'ruza materiallari, video va boshqa fayllarni yuklash</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FileUploadForm onUploadComplete={handleFileUploadComplete} />
        <VideoUploadForm onUploadComplete={handleVideoUploadComplete} />
      </div>

      <UploadedFilesList />
    </div>
  )
}
