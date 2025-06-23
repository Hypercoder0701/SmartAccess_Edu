"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getLecture } from "@/lib/database"
import type { Lecture } from "@/lib/supabase"
import { Download } from "lucide-react"

interface LectureDetailPageProps {
  lectureId: string
}

export default function LectureDetailPage({ lectureId }: LectureDetailPageProps) {
  const [lecture, setLecture] = useState<Lecture | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLecture = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getLecture(lectureId)
        if (!data) {
          setError("Ma'ruza topilmadi.")
        } else {
          setLecture(data)
        }
      } catch (err) {
        console.error(err)
        setError("Ma'ruzani yuklashda xatolik yuz berdi.")
      } finally {
        setLoading(false)
      }
    }

    fetchLecture()
  }, [lectureId])

  /* ------- loading ------- */
  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    )
  }

  /* ------- error / not found ------- */
  if (error || !lecture) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Xatolik</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error ?? "Ma'ruza topilmadi."}</p>
        </CardContent>
      </Card>
    )
  }

  /* ------- success ------- */
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{lecture.title}</CardTitle>
        {lecture.description && <CardDescription className="text-gray-600 text-justify text-justify text-justify text-base text-base">{lecture.description}</CardDescription>}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* video */}
        {lecture.video_url && (
          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${lecture.video_url.split("v=")[1]}`}
              title="YouTube video player"
              frameBorder={0}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* mavzu matni – keep all whitespace */}
        <div className="prose max-w-none">
          <pre 
            className="whitespace-pre-wrap bg-white bg-white bg-white bg-transparent text-slate-600 text-slate-500 bg-black bg-white bg-white bg-slate-200 bg-slate-50 bg-white bg-black bg-slate-100 bg-slate-400 font-sans font-sans font-serif font-sans font-serif font-sans text-xl"
            // keep all spaces & line-breaks exactly as entered in “Kontent boshqaruvi”
            dangerouslySetInnerHTML={{ __html: lecture.content }}
          />
        </div>

        {/* file download */}
        {lecture.file_url && lecture.file_name && (
          <Button asChild>
            <a href={lecture.file_url} target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" />
              {lecture.file_name} yuklab olish
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
