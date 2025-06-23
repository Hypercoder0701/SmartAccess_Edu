"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Video, Download, Trash, Eye, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface UploadedFile {
  id: string
  name: string
  url: string
  type: string
  size: string
  uploadedAt: string
  isVideo?: boolean
}

export function UploadedFilesList() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  useEffect(() => {
    // In a real app, you would fetch files from your database
    // For demo purposes, we'll use mock data
    const mockFiles: UploadedFile[] = [
      {
        id: "1",
        name: "Ma'ruza-1.pdf",
        url: "#",
        type: "PDF",
        size: "2.5 MB",
        uploadedAt: "2 soat oldin",
      },
      {
        id: "2",
        name: "Video-ma'ruza.mp4",
        url: "https://www.w3schools.com/html/mov_bbb.mp4", // Sample video URL
        type: "MP4",
        size: "45.2 MB",
        uploadedAt: "1 kun oldin",
        isVideo: true,
      },
      {
        id: "3",
        name: "Amaliy-mashg'ulot.docx",
        url: "#",
        type: "DOCX",
        size: "1.8 MB",
        uploadedAt: "3 kun oldin",
      },
    ]

    // Simulate API call
    setTimeout(() => {
      setFiles(mockFiles)
      setLoading(false)
    }, 500)

    // In a real app with Supabase, you would do something like:
    /*
    async function fetchFiles() {
      if (!isSupabaseAvailable) {
        setFiles(mockFiles);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('files')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setFiles(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFiles();
    */
  }, [])

  const handleDelete = (id: string) => {
    // In a real app, you would delete the file from your storage and database
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const handleDownload = (file: UploadedFile) => {
    // In a real app, you would generate a download URL or use the existing one
    alert(`Downloading ${file.name}...`)
  }

  const handlePreview = (videoUrl: string) => {
    setSelectedVideo(videoUrl)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Yuklangan fayllar</CardTitle>
          <CardDescription>Fayllar yuklanmoqda...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Yuklangan fayllar</CardTitle>
          <CardDescription>Barcha yuklangan fayllar va videolar</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {files.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Hali fayllar yuklanmagan</div>
          ) : (
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {file.isVideo ? (
                      <Video className="h-5 w-5 text-purple-600" />
                    ) : (
                      <FileText className="h-5 w-5 text-blue-600" />
                    )}
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {file.size} • {file.type} • {file.uploadedAt}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {file.isVideo && (
                      <Button variant="outline" size="sm" onClick={() => handlePreview(file.url)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleDownload(file)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDelete(file.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Video ko'rish</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="aspect-video">
              <video src={selectedVideo} controls className="w-full h-full rounded-md" autoPlay />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
