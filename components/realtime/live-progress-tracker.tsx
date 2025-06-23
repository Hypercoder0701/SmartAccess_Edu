"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRealtimeProgress, useRealtimeTestResults, useRealtimeIndependentSubmissions } from "@/hooks/use-realtime"
import { getLectures, getPracticals, getIndependentWork } from "@/lib/database"
import { BookOpen, FlaskConical, Trophy, TrendingUp, FileText } from "lucide-react"

interface LiveProgressTrackerProps {
  studentId: string
  studentName: string
  studentAvatar?: string
}

export function LiveProgressTracker({ studentId, studentName, studentAvatar }: LiveProgressTrackerProps) {
  const { progress } = useRealtimeProgress(studentId)
  const { testResults } = useRealtimeTestResults(studentId)
  const { submissions: independentSubmissions } = useRealtimeIndependentSubmissions(studentId) // New hook
  const [totalLectures, setTotalLectures] = useState(0)
  const [totalPracticals, setTotalPracticals] = useState(0)
  const [totalIndependentWork, setTotalIndependentWork] = useState(0) // New state

  useEffect(() => {
    const loadTotals = async () => {
      const [lectures, practicals, independentWorks] = await Promise.all([
        getLectures(),
        getPracticals(),
        getIndependentWork(), // Fetch independent work totals
      ])
      setTotalLectures(lectures.length)
      setTotalPracticals(practicals.length)
      setTotalIndependentWork(independentWorks.length) // Set independent work total
    }
    loadTotals()
  }, [])

  const completedLectures = progress.length
  const completedTests = testResults.length
  const completedIndependentWorks = independentSubmissions.length // Count submitted independent works
  const averageScore =
    testResults.length > 0 ? testResults.reduce((sum, result) => sum + result.score, 0) / testResults.length : 0

  const overallProgress = Math.round(
    ((completedLectures + completedTests + completedIndependentWorks) /
      (totalLectures + totalPracticals + totalIndependentWork)) * // Include independent work in total
      100,
  )

  const getGradeColor = (score: number) => {
    if (score >= 90) return "bg-green-500"
    if (score >= 80) return "bg-blue-500"
    if (score >= 70) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={studentAvatar || "/placeholder.svg"} />
            <AvatarFallback>{studentName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{studentName}</CardTitle>
            <CardDescription>Real-time progress tracking</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Ma'ruzalar</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {completedLectures}/{totalLectures}
              </span>
            </div>
            <Progress value={(completedLectures / totalLectures) * 100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FlaskConical className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Testlar</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {completedTests}/{totalPracticals}
              </span>
            </div>
            <Progress value={(completedTests / totalPracticals) * 100} className="h-2" />
          </div>

          {/* New: Independent Work Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Mustaqil ishlar</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {completedIndependentWorks}/{totalIndependentWork}
              </span>
            </div>
            <Progress value={(completedIndependentWorks / totalIndependentWork) * 100} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">O'rtacha ball</span>
            </div>
            <div className="mt-1">
              <Badge className={`${getGradeColor(averageScore)} text-white`}>{averageScore.toFixed(1)}%</Badge>
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Umumiy progress</span>
            </div>
            <div className="mt-1">
              <Badge variant="outline">{overallProgress}%</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Umumiy progress</span>
            <span className="text-sm text-muted-foreground">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium">So'nggi test natijalari</span>
            <div className="space-y-1">
              {testResults.slice(-3).map((result, index) => (
                <div key={result.id} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Test #{testResults.length - index}</span>
                  <Badge variant="outline" className={`${getGradeColor(result.score)} text-white border-none`}>
                    {result.score}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
