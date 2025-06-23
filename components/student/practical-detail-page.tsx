"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Download, Trophy } from "lucide-react"
import {
  getPractical,
  getTestQuestions,
  submitTestResult,
  getTestResults,
  markLectureComplete,
  getLectureByOrder,
  getPracticalByOrder,
} from "@/lib/database"
import type { Practical, TestQuestion, TestResult } from "@/lib/supabase"
import { useRouter } from "next/navigation" // useRouter import qilingan

interface PracticalDetailPageProps {
  practicalId: string
  studentId: string
  onNavigate: (page: string, id?: string) => void // onNavigate prop qo'shildi
}

export default function PracticalDetailPage({ practicalId, studentId, onNavigate }: PracticalDetailPageProps) {
  const router = useRouter()
  const [practical, setPractical] = useState<Practical | null>(null)
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [submittedResult, setSubmittedResult] = useState<TestResult | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null) // Declare success variable

  const fetchPracticalData = async () => {
    setLoading(true)
    setError(null)
    try {
      const fetchedPractical = await getPractical(practicalId)
      if (fetchedPractical) {
        setPractical(fetchedPractical)
        const fetchedQuestions = await getTestQuestions(practicalId)
        setTestQuestions(fetchedQuestions)

        // Agar talaba bu testni avval topshirgan bo'lsa, natijalarni yuklash
        const existingResults = await getTestResults(studentId, practicalId)
        if (existingResults) {
          setSubmittedResult(existingResults)
          setSelectedAnswers(existingResults.answers || {})
          setShowResults(true)
        }
      } else {
        setError("Amaliyot topilmadi.")
      }
    } catch (err) {
      console.error("Failed to fetch practical:", err)
      setError("Amaliyotni yuklashda xatolik yuz berdi.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (practicalId && studentId) {
      fetchPracticalData()
    }
  }, [practicalId, studentId])

  const handleAnswerChange = (questionId: string, value: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleSubmitTest = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      let score = 0
      const answers: Record<string, string> = {}

      testQuestions.forEach((q) => {
        const selected = selectedAnswers[q.id]
        answers[q.id] = selected || "" // Saqlash uchun tanlangan javobni qo'shish
        if (selected === q.correct_answer) {
          score += 1
        }
      })

      const result = await submitTestResult({
        student_id: studentId,
        practical_id: practicalId,
        score: score,
        answers: answers,
      })

      setSubmittedResult(result)
      setShowResults(true)
      setSuccess(null) // Oldingi success xabarini tozalash

      if (score >= 6) {
        // Agar talaba testdan o'tsa
        setSuccess("Tabriklaymiz! Siz testdan muvaffaqiyatli o'tdingiz!")

        // Keyingi ma'ruzaga kirishni ochish
        if (practical?.order_number) {
          const nextLecture = await getLectureByOrder(practical.order_number + 1)
          if (nextLecture) {
            await markLectureComplete(studentId, nextLecture.id)
            console.log(`Access granted to next lecture: ${nextLecture.title}`)
          }
        }
      } else {
        setSuccess("Afsuski, siz testdan o'ta olmadingiz. Qayta urinib ko'ring!")
      }
    } catch (err: any) {
      console.error("Test submission error:", err)
      setError(`Testni topshirishda xatolik: ${err.message || "Noma'lum xato"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetakeTest = () => {
    setSelectedAnswers({})
    setSubmittedResult(null)
    setShowResults(false)
    setError(null)
    setSuccess(null)
  }

  const handleGoToNextPractical = async () => {
    if (practical?.order_number) {
      const nextPractical = await getPracticalByOrder(practical.order_number + 1)
      if (nextPractical) {
        onNavigate("practicals", nextPractical.id)
      } else {
        setError("Keyingi amaliyot topilmadi.")
      }
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-10 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Xatolik</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!practical) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Amaliyot topilmadi</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Tanlangan amaliyot mavjud emas yoki o'chirilgan.</p>
        </CardContent>
      </Card>
    )
  }

  const isPassed = submittedResult && submittedResult.score >= 6

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{practical.title}</CardTitle>
        {practical.description && <CardDescription>{practical.description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-6">
        {practical.file_url && practical.file_name && (
          <Button asChild>
            <a href={practical.file_url} target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" />
              {practical.file_name} yuklab olish
            </a>
          </Button>
        )}

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Test savollari</h3>
          {testQuestions.length > 0 ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmitTest()
              }}
            >
              {testQuestions.map((q, index) => (
                <Card key={q.id} className="p-4 mb-4">
                  <CardTitle className="text-lg mb-2">
                    {index + 1}. {q.question}
                  </CardTitle>
                  <RadioGroup
                    onValueChange={(value) => handleAnswerChange(q.id, value)}
                    value={selectedAnswers[q.id] || ""}
                    className="space-y-2"
                    disabled={showResults} // Natijalar ko'rsatilganda o'chirish
                  >
                    {[
                      { value: "A", label: q.option_a },
                      { value: "B", label: q.option_b },
                      { value: "C", label: q.option_c },
                      { value: "D", label: q.option_d },
                    ].map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`${q.id}-${option.value}`} />
                        <Label
                          htmlFor={`${q.id}-${option.value}`}
                          className={`flex-1 ${
                            showResults
                              ? option.value === q.correct_answer
                                ? "text-green-600 font-medium"
                                : selectedAnswers[q.id] === option.value
                                  ? "text-red-600 line-through"
                                  : ""
                              : ""
                          }`}
                        >
                          {option.value}) {option.label}
                          {showResults && option.value === q.correct_answer && (
                            <CheckCircle className="ml-2 h-4 w-4 inline-block" />
                          )}
                          {showResults &&
                            selectedAnswers[q.id] === option.value &&
                            option.value !== q.correct_answer && <XCircle className="ml-2 h-4 w-4 inline-block" />}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </Card>
              ))}
              {!showResults && (
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Topshirilmoqda..." : "Testni topshirish"}
                </Button>
              )}
            </form>
          ) : (
            <p className="text-muted-foreground">Bu amaliyot uchun test savollari topilmadi.</p>
          )}
        </div>
      </CardContent>
      {showResults && submittedResult && (
        <CardFooter className="flex flex-col gap-4 pt-4 border-t">
          {success && (
            <Alert variant={isPassed ? "default" : "destructive"}>
              <AlertTitle className="flex items-center gap-2">
                {isPassed ? <Trophy className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                {isPassed ? "Muvaffaqiyatli!" : "Xato!"}
              </AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <div className="text-lg font-semibold">
            Sizning balingiz: {submittedResult.score} / {testQuestions.length}
          </div>
          <div className="flex gap-2 w-full">
            <Button onClick={handleRetakeTest} variant="outline" className="flex-1">
              Qayta urinish
            </Button>
            {isPassed && (
              <Button onClick={handleGoToNextPractical} className="flex-1">
                Keyingi amaliyotga o'tish
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
