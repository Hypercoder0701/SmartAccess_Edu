"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, FlaskConical, FileText, Plus, Edit, Trash2, Save, Upload, X, RotateCcw } from "lucide-react"
import {
  getLectures,
  getPracticals,
  getIndependentWork,
  createLecture,
  createPractical,
  createIndependentWork,
  updateLecture,
  deleteLecture,
  updatePractical,
  deletePractical,
  updateIndependentWork,
  deleteIndependentWork,
  getTestQuestions,
} from "@/lib/database"
import type { Lecture, Practical, IndependentWork, TestQuestion } from "@/lib/supabase" // Import TestQuestion
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ContentManagementProps {
  adminId: string
}

export default function ContentManagement({ adminId }: ContentManagementProps) {
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [practicals, setPracticals] = useState<Practical[]>([])
  const [independentWork, setIndependentWork] = useState<IndependentWork[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("lectures")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form states for new/edit
  const [currentLecture, setCurrentLecture] = useState<Partial<Lecture> & { lectureFile: File | null }>({
    title: "",
    description: "",
    content: "",
    video_url: "",
    lectureFile: null,
    file_name: "", // To display current file name
    order_number: 1,
    status: "draft",
  })

  const [currentPractical, setCurrentPractical] = useState<
    Partial<Practical> & { practicalFile: File | null; rawTestQuestionsInput: string }
  >({
    title: "",
    description: "",
    practicalFile: null,
    file_name: "", // To display current file name
    order_number: 1,
    status: "draft", // YANGI: Holatni qo'shdim
    rawTestQuestionsInput: "", // Initialize raw input
  })

  const [currentIndependent, setCurrentIndependent] = useState<
    Partial<IndependentWork> & { independentFile: File | null }
  >({
    title: "",
    description: "",
    content: "",
    independentFile: null,
    file_name: "", // To display current file name
    order_number: 1,
    status: "draft",
  })

  const [isEditing, setIsEditing] = useState(false)

  const resetForms = useCallback(() => {
    setCurrentLecture({
      title: "",
      description: "",
      content: "",
      video_url: "",
      lectureFile: null,
      file_name: "",
      order_number: 1,
      status: "draft",
    })
    setCurrentPractical({
      title: "",
      description: "",
      practicalFile: null,
      file_name: "",
      order_number: 1,
      status: "draft",
      rawTestQuestionsInput: "",
    })
    setCurrentIndependent({
      title: "",
      description: "",
      content: "",
      independentFile: null,
      file_name: "",
      order_number: 1,
      status: "draft",
    })
    setIsEditing(false)
    setError(null)
    setSuccess(null)
  }, [])

  const loadContent = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [lecturesData, practicalsData, independentData] = await Promise.all([
        getLectures(),
        getPracticals(),
        getIndependentWork(),
      ])

      setLectures(lecturesData)
      setPracticals(practicalsData)
      setIndependentWork(independentData)
    } catch (err) {
      console.error("Error loading content:", err)
      setError("Kontentni yuklashda xatolik yuz berdi.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadContent().then(() => {
      console.log("[ContentManagement] Initial content loaded. Loading state is now false.")
    })
    // Add a fallback to ensure loading state is eventually false
    const timeoutId = setTimeout(() => {
      setLoading(false)
      console.log("[ContentManagement] Fallback: Loading state set to false after 5 seconds.")
    }, 5000) // 5 seconds timeout

    return () => clearTimeout(timeoutId)
  }, [loadContent])

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<any>>,
    fileKey: string,
    fileNameKey: string,
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      setter((prev: any) => ({
        ...prev,
        [fileKey]: file,
        [fileNameKey]: file.name,
      }))
      setSuccess(null)
      setError(null)
    }
  }

  const handleRemoveFile = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    fileKey: string,
    fileNameKey: string,
  ) => {
    setter((prev: any) => ({
      ...prev,
      [fileKey]: null,
      [fileNameKey]: null, // Set to null to indicate removal
    }))
  }

  // --- Test Question Parsing Logic ---
  const parseTestQuestions = (rawInput: string): Omit<TestQuestion, "id" | "created_at" | "practical_id">[] => {
    const questions: Omit<TestQuestion, "id" | "created_at" | "practical_id">[] = []
    const blocks = rawInput.split("+++++").filter((block) => block.trim() !== "")

    blocks.forEach((block, index) => {
      const lines = block
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "")
      if (lines.length === 0) return

      const questionText = lines[0]
      const options: { [key: string]: string } = {}
      let correctAnswer: "A" | "B" | "C" | "D" | "" = ""
      const optionKeys = ["A", "B", "C", "D"]

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]
        if (line.startsWith("====")) {
          const isCorrect = line.startsWith("====#")
          const optionContent = line.replace("====#", "").replace("====", "").trim()
          const optionIndex = i - 1 // A=0, B=1, C=2, D=3
          if (optionIndex < 4) {
            const key = optionKeys[optionIndex]
            options[`option_${key.toLowerCase()}` as keyof typeof options] = optionContent
            if (isCorrect) {
              correctAnswer = key as "A" | "B" | "C" | "D"
            }
          }
        }
      }

      if (
        questionText &&
        options.option_a &&
        options.option_b &&
        options.option_c &&
        options.option_d &&
        correctAnswer
      ) {
        questions.push({
          question: questionText,
          option_a: options.option_a,
          option_b: options.option_b,
          option_c: options.option_c,
          option_d: options.option_d,
          correct_answer: correctAnswer,
          order_number: index + 1,
        })
      }
    })
    return questions
  }

  const formatTestQuestionsForEdit = (questions: TestQuestion[]): string => {
    if (!questions || questions.length === 0) return ""
    return questions
      .map((q) => {
        let qString = `+++++ ${q.question}\n`
        qString += `====${q.correct_answer === "A" ? "#" : ""} ${q.option_a}\n`
        qString += `====${q.correct_answer === "B" ? "#" : ""} ${q.option_b}\n`
        qString += `====${q.correct_answer === "C" ? "#" : ""} ${q.option_c}\n`
        qString += `====${q.correct_answer === "D" ? "#" : ""} ${q.option_d}`
        return qString
      })
      .join("\n\n") // Add double newline between questions for better readability
  }

  // --- Lecture Handlers ---
  const handleSaveLecture = async () => {
    setError(null)
    setSuccess(null)
    try {
      if (isEditing && currentLecture.id) {
        const updated = await updateLecture(
          currentLecture.id,
          {
            title: currentLecture.title,
            description: currentLecture.description,
            content: currentLecture.content,
            video_url: currentLecture.video_url,
            order_number: currentLecture.order_number,
            status: currentLecture.status,
            file_url: currentLecture.file_name === null ? null : currentLecture.file_url, // Pass null if file removed
            file_name: currentLecture.file_name,
          },
          currentLecture.lectureFile || undefined, // Pass the file for upload
        )
        setLectures(lectures.map((l) => (l.id === updated.id ? updated : l)))
        setSuccess("Ma'ruza muvaffaqiyatli yangilandi!")
      } else {
        const lecture = await createLecture(
          {
            title: currentLecture.title!,
            description: currentLecture.description,
            content: currentLecture.content!,
            video_url: currentLecture.video_url || undefined,
            order_number: currentLecture.order_number!,
            status: currentLecture.status!,
            created_by: adminId,
          },
          currentLecture.lectureFile || undefined,
        )
        setLectures([...lectures, lecture])
        setSuccess("Ma'ruza muvaffaqiyatli qo'shildi!")
      }
      resetForms()
    } catch (err: any) {
      console.error("Error saving lecture:", err)
      setError(`Ma'ruzani saqlashda xatolik: ${err.message || "Noma'lum xato"}`)
    }
  }

  const startEditLecture = (lecture: Lecture) => {
    console.log(
      "[ContentManagement] startEditLecture function called. Received lecture:",
      JSON.stringify(lecture, null, 2),
    )
    console.log("[ContentManagement] State before update: isEditing =", isEditing, ", activeTab =", activeTab)

    setIsEditing(true) // Set editing mode first
    setActiveTab("lectures")
    setCurrentLecture({
      ...lecture,
      lectureFile: null, // File input should be reset for re-upload
      file_name: lecture.file_name, // Keep existing file name for display
      file_url: lecture.file_url, // Keep existing file URL for display
    })
    setError(null)
    setSuccess(null)

    console.log("[ContentManagement] State after update in startEditLecture. isEditing should now be true.")
    // You can also log currentLecture after it's set, but due to async nature of setState,
    // it's better to check it in a useEffect or see the UI update.
  }

  const handleDeleteLecture = async (id: string) => {
    setError(null)
    setSuccess(null)
    if (window.confirm("Haqiqatan ham bu ma'ruzani o'chirmoqchimisiz?")) {
      try {
        await deleteLecture(id)
        setLectures(lectures.filter((l) => l.id !== id))
        setSuccess("Ma'ruza muvaffaqiyatli o'chirildi!")
      } catch (err: any) {
        console.error("Error deleting lecture:", err)
        setError(`Ma'ruzani o'chirishda xatolik: ${err.message || "Noma'lum xato"}`)
      }
    }
  }

  // --- Practical Handlers ---
  const handleSavePractical = async () => {
    setError(null)
    setSuccess(null)
    try {
      const parsedQuestions = parseTestQuestions(currentPractical.rawTestQuestionsInput)

      if (parsedQuestions.length !== 10) {
        setError("Iltimos, barcha 10 ta test savoli va javoblarini to'ldiring. Formatga rioya qiling.")
        return
      }

      if (isEditing && currentPractical.id) {
        const updated = await updatePractical(
          currentPractical.id,
          {
            title: currentPractical.title,
            description: currentPractical.description,
            order_number: currentPractical.order_number,
            status: currentPractical.status, // YANGI: Holatni uzatish
            file_url: currentPractical.file_name === null ? null : currentPractical.file_url,
            file_name: currentPractical.file_name,
          },
          parsedQuestions, // Pass parsed questions
          currentPractical.practicalFile || undefined,
        )
        setPracticals(practicals.map((p) => (p.id === updated.id ? updated : p)))
        setSuccess("Amaliyot muvaffaqiyatli yangilandi!")
      } else {
        const practical = await createPractical(
          {
            title: currentPractical.title!,
            description: currentPractical.description,
            order_number: currentPractical.order_number!,
            status: currentPractical.status!,
            created_by: adminId,
          },
          parsedQuestions, // Pass parsed questions
          currentPractical.practicalFile || undefined,
        )
        setPracticals([...practicals, practical])
        setSuccess("Amaliyot muvaffaqiyatli qo'shildi!")
      }
      resetForms()
    } catch (err: any) {
      console.error("Error saving practical:", err)
      setError(`Amaliyotni saqlashda xatolik: ${err.message || "Noma'lum xato"}`)
    }
  }

  const startEditPractical = async (practical: Practical) => {
    setIsEditing(true) // Set editing mode first
    setActiveTab("practicals")
    setLoading(true) // Keep loading true while fetching questions
    setError(null)
    setSuccess(null)
    try {
      const questions = await getTestQuestions(practical.id)
      const formattedQuestions = formatTestQuestionsForEdit(questions)

      setCurrentPractical({
        ...practical,
        practicalFile: null,
        file_name: practical.file_name,
        rawTestQuestionsInput: formattedQuestions, // Set raw input for editing
        status: practical.status, // YANGI: Holatni tahrirlash uchun yuklash
      })
    } catch (err) {
      console.error("Error loading practical for edit:", err)
      setError("Amaliyotni tahrirlash uchun yuklashda xatolik yuz berdi.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePractical = async (id: string) => {
    setError(null)
    setSuccess(null)
    if (window.confirm("Haqiqatan ham bu amaliyotni o'chirmoqchimisiz?")) {
      try {
        await deletePractical(id)
        setPracticals(practicals.filter((p) => p.id !== id))
        setSuccess("Amaliyot muvaffaqiyatli o'chirildi!")
      } catch (err: any) {
        console.error("Error deleting practical:", err)
        setError(`Amaliyotni o'chirishda xatolik: ${err.message || "Noma'lum xato"}`)
      }
    }
  }

  // --- Independent Work Handlers ---
  const handleSaveIndependent = async () => {
    setError(null)
    setSuccess(null)
    try {
      if (isEditing && currentIndependent.id) {
        const updated = await updateIndependentWork(
          currentIndependent.id,
          {
            title: currentIndependent.title,
            description: currentIndependent.description,
            content: currentIndependent.content,
            order_number: currentIndependent.order_number,
            status: currentIndependent.status,
            file_url: currentIndependent.file_name === null ? null : currentIndependent.file_url,
            file_name: currentIndependent.file_name,
          },
          currentIndependent.independentFile || undefined,
        )
        setIndependentWork(independentWork.map((w) => (w.id === updated.id ? updated : w)))
        setSuccess("Mustaqil ish muvaffaqiyatli yangilandi!")
      } else {
        const independent = await createIndependentWork(
          {
            title: currentIndependent.title!,
            description: currentIndependent.description,
            content: currentIndependent.content!,
            order_number: currentIndependent.order_number!,
            status: currentIndependent.status!,
            created_by: adminId,
          },
          currentIndependent.independentFile || undefined,
        )
        setIndependentWork([...independentWork, independent])
        setSuccess("Mustaqil ish muvaffaqiyatli qo'shildi!")
      }
      resetForms()
    } catch (err: any) {
      console.error("Error saving independent work:", err)
      setError(`Mustaqil ishnini saqlashda xatolik: ${err.message || "Noma'lum xato"}`)
    }
  }

  const startEditIndependent = (work: IndependentWork) => {
    setIsEditing(true) // Set editing mode first
    setActiveTab("independent")
    setCurrentIndependent({
      ...work,
      independentFile: null,
      file_name: work.file_name,
    })
    setError(null)
    setSuccess(null)
  }

  const handleDeleteIndependent = async (id: string) => {
    setError(null)
    setSuccess(null)
    if (window.confirm("Haqiqatan ham bu mustaqil ishnini o'chirmoqchimisiz?")) {
      try {
        await deleteIndependentWork(id)
        setIndependentWork(independentWork.filter((w) => w.id !== id))
        setSuccess("Mustaqil ish muvaffaqiyatli o'chirildi!")
      } catch (err: any) {
        console.error("Error deleting independent work:", err)
        setError(`Mustaqil ishnini o'chirishda xatolik: ${err.message || "Noma'lum xato"}`)
      }
    }
  }

  if (loading) {
    return <div>Yuklanmoqda...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Kontent boshqaruvi</h2>
        <p className="text-muted-foreground">Ma'ruzalar, amaliyotlar va mustaqil ishlarni boshqaring</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Xato!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertTitle>Muvaffaqiyatli!</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lectures" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Ma'ruzalar</span>
          </TabsTrigger>
          <TabsTrigger value="practicals" className="flex items-center space-x-2">
            <FlaskConical className="h-4 w-4" />
            <span>Amaliyotlar</span>
          </TabsTrigger>
          <TabsTrigger value="independent" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Mustaqil ishlar</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lectures" className="space-y-4">
          <Card key={isEditing && currentLecture.id ? `edit-lecture-${currentLecture.id}` : "new-lecture-card"}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {isEditing ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                <span>{isEditing ? "Ma'ruzani tahrirlash" : "Yangi ma'ruza qo'shish"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lecture-title">Sarlavha</Label>
                  <Input
                    id="lecture-title"
                    value={currentLecture.title || ""}
                    onChange={(e) => setCurrentLecture({ ...currentLecture, title: e.target.value })}
                    placeholder="Ma'ruza sarlavhasi"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lecture-order">Tartib raqami</Label>
                  <Input
                    id="lecture-order"
                    type="number"
                    value={currentLecture.order_number || 1}
                    onChange={(e) =>
                      setCurrentLecture({ ...currentLecture, order_number: Number.parseInt(e.target.value) })
                    }
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lecture-description">Tavsif</Label>
                <Textarea
                  id="lecture-description"
                  value={currentLecture.description || ""}
                  onChange={(e) => setCurrentLecture({ ...currentLecture, description: e.target.value })}
                  placeholder="Ma'ruza tavsifi"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lecture-content">Mavzu matni</Label>
                <Textarea
                  key={currentLecture.id || "new-lecture-content"} // Added key to force re-render
                  id="lecture-content"
                  value={currentLecture.content || ""}
                  onChange={(e) => setCurrentLecture({ ...currentLecture, content: e.target.value })}
                  placeholder="Bu yerda ma'ruza mazmuni..."
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lecture-video-url">Ma'ruza videosi (URL)</Label>
                <Input
                  id="lecture-video-url"
                  value={currentLecture.video_url || ""}
                  onChange={(e) => setCurrentLecture({ ...currentLecture, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lecture-file">Ma'ruza fayli (PDF)</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="lecture-file"
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-2 pb-3">
                      {currentLecture.file_name ? (
                        <>
                          <FileText className="w-6 h-6 mb-1 text-green-500" />
                          <p className="text-sm text-gray-700 font-medium">{currentLecture.file_name}</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 mb-1 text-gray-500" />
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold">Yuklash uchun bosing</span> yoki faylni bu yerga tashlang
                          </p>
                        </>
                      )}
                    </div>
                    <Input
                      id="lecture-file"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) =>
                        setCurrentLecture((prev) => ({
                          ...prev,
                          lectureFile: e.target.files?.[0],
                          file_name: e.target.files?.[0]?.name || null,
                        }))
                      }
                    />
                  </label>
                  {currentLecture.file_name && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFile(setCurrentLecture, "lectureFile", "file_name")}
                      className="ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lecture-status">Holat</Label>
                <Select
                  value={currentLecture.status || "draft"}
                  onValueChange={(value: any) => setCurrentLecture({ ...currentLecture, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Qoralama</SelectItem>
                    <SelectItem value="published">Nashr etilgan</SelectItem>
                    <SelectItem value="archived">Arxivlangan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveLecture} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? "Yangilash" : "Ma'ruzani saqlash"}
                </Button>
                {isEditing && (
                  <Button variant="outline" onClick={resetForms} className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Bekor qilish
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {lectures.map((lecture) => (
              <Card key={lecture.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{lecture.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant={lecture.status === "published" ? "default" : "secondary"}>{lecture.status}</Badge>
                      <Badge variant="outline">#{lecture.order_number}</Badge>
                    </div>
                  </div>
                  <CardDescription>{lecture.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap overflow-auto max-h-40">
                    {lecture.content}
                  </pre>
                  {lecture.video_url && (
                    <p className="text-sm text-blue-500 mt-2">
                      Video:{" "}
                      <a href={lecture.video_url} target="_blank" rel="noopener noreferrer" className="underline">
                        {lecture.video_url}
                      </a>
                    </p>
                  )}
                  {lecture.file_name && (
                    <p className="text-sm text-blue-500">
                      Fayl:{" "}
                      <a href={lecture.file_url} target="_blank" rel="noopener noreferrer" className="underline">
                        {lecture.file_name}
                      </a>
                    </p>
                  )}
                  <div className="flex space-x-2 mt-4">
                    <Button
                      key={`edit-btn-${lecture.id}`} // Tugmaga noyob kalit qo'shildi
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log(
                          "[ContentManagement] Edit button clicked for lecture. Lecture data:",
                          JSON.stringify(lecture, null, 2),
                        )
                        startEditLecture(lecture)
                      }}
                      disabled={loading} // Yuklanish holatida tugmani o'chirish
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Tahrirlash
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteLecture(lecture.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      O'chirish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="practicals" className="space-y-4">
          <Card key={isEditing && currentPractical.id ? `edit-practical-${currentPractical.id}` : "new-practical-card"}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {isEditing ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                <span>{isEditing ? "Amaliyotni tahrirlash" : "Yangi amaliyot qo'shish"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="practical-title">Sarlavha</Label>
                  <Input
                    id="practical-title"
                    value={currentPractical.title || ""}
                    onChange={(e) => setCurrentPractical({ ...currentPractical, title: e.target.value })}
                    placeholder="Amaliyot sarlavhasi"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="practical-order">Tartib raqami</Label>
                  <Input
                    id="practical-order"
                    type="number"
                    value={currentPractical.order_number || 1}
                    onChange={(e) =>
                      setCurrentPractical({ ...currentPractical, order_number: Number.parseInt(e.target.value) })
                    }
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="practical-description">Tavsif</Label>
                <Textarea
                  id="practical-description"
                  value={currentPractical.description || ""}
                  onChange={(e) => setCurrentPractical({ ...currentPractical, description: e.target.value })}
                  placeholder="Amaliyot tavsifi"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="practical-file">Amaliyot fayli (PDF)</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="practical-file"
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-2 pb-3">
                      {currentPractical.file_name ? (
                        <>
                          <FileText className="w-6 h-6 mb-1 text-green-500" />
                          <p className="text-sm text-gray-700 font-medium">{currentPractical.file_name}</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 mb-1 text-gray-500" />
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold">Yuklash uchun bosing</span> yoki faylni bu yerga tashlang
                          </p>
                        </>
                      )}
                    </div>
                    <Input
                      id="practical-file"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) =>
                        setCurrentPractical((prev) => ({
                          ...prev,
                          practicalFile: e.target.files?.[0],
                          file_name: e.target.files?.[0]?.name || null,
                        }))
                      }
                    />
                  </label>
                  {currentPractical.file_name && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFile(setCurrentPractical, "practicalFile", "file_name")}
                      className="ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="practical-status">Holat</Label>
                <Select
                  value={currentPractical.status || "draft"}
                  onValueChange={(value: any) => setCurrentPractical({ ...currentPractical, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Qoralama</SelectItem>
                    <SelectItem value="published">Nashr etilgan</SelectItem>
                    <SelectItem value="archived">Arxivlangan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold">Test savollari (10 ta)</h3>
                <p className="text-sm text-muted-foreground">
                  Har bir savolni "+++++" bilan boshlang, variantlarni "====" bilan, to'g'ri javobni "====#" bilan
                  belgilang.
                </p>
                <Textarea
                  id="practical-test-questions"
                  value={currentPractical.rawTestQuestionsInput}
                  onChange={(e) => setCurrentPractical({ ...currentPractical, rawTestQuestionsInput: e.target.value })}
                  placeholder={`Misol:\n+++++ Savol 1?\n==== Variant A\n====# Variant B\n==== Variant C\n==== Variant D\n\n+++++ Savol 2?\n...`}
                  rows={15}
                  required
                  className="font-mono"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSavePractical} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? "Yangilash" : "Amaliyotni saqlash"}
                </Button>
                {isEditing && (
                  <Button variant="outline" onClick={resetForms} className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Bekor qilish
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {practicals.map((practical) => (
              <Card key={practical.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{practical.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant={practical.status === "published" ? "default" : "secondary"}>
                        {practical.status}
                      </Badge>
                      <Badge variant="outline">#{practical.order_number}</Badge>
                    </div>
                  </div>
                  <CardDescription>{practical.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {practical.file_name && (
                    <p className="text-sm text-blue-500">
                      Fayl:{" "}
                      <a href={practical.file_url} target="_blank" rel="noopener noreferrer" className="underline">
                        {practical.file_name}
                      </a>
                    </p>
                  )}
                  <div className="flex space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditPractical(practical)}
                      disabled={loading} // Yuklanish holatida tugmani o'chirish
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Tahrirlash
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeletePractical(practical.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      O'chirish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="independent" className="space-y-4">
          <Card
            key={
              isEditing && currentIndependent.id ? `edit-independent-${currentIndependent.id}` : "new-independent-card"
            }
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {isEditing ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                <span>{isEditing ? "Mustaqil ishni tahrirlash" : "Yangi mustaqil ish qo'shish"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="independent-title">Sarlavha</Label>
                  <Input
                    id="independent-title"
                    value={currentIndependent.title || ""}
                    onChange={(e) => setCurrentIndependent({ ...currentIndependent, title: e.target.value })}
                    placeholder="Mustaqil ish sarlavhasi"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="independent-order">Tartib raqami</Label>
                  <Input
                    id="independent-order"
                    type="number"
                    value={currentIndependent.order_number || 1}
                    onChange={(e) =>
                      setCurrentIndependent({ ...currentIndependent, order_number: Number.parseInt(e.target.value) })
                    }
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="independent-description">Tavsif</Label>
                <Textarea
                  id="independent-description"
                  value={currentIndependent.description || ""}
                  onChange={(e) => setCurrentIndependent({ ...currentIndependent, description: e.target.value })}
                  placeholder="Mustaqil ish tavsifi"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="independent-content">Mavzu matni</Label>
                <Textarea
                  key={currentIndependent.id || "new-independent-content"} // Added key to force re-render
                  id="independent-content"
                  value={currentIndependent.content || ""}
                  onChange={(e) => setCurrentIndependent({ ...currentIndependent, content: e.target.value })}
                  placeholder="Bu yerda topshiriq mazmuni..."
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="independent-file">Mustaqil ish fayli (PDF)</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="independent-file"
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-2 pb-3">
                      {currentIndependent.file_name ? (
                        <>
                          <FileText className="w-6 h-6 mb-1 text-green-500" />
                          <p className="text-sm text-gray-700 font-medium">{currentIndependent.file_name}</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 mb-1 text-gray-500" />
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold">Yuklash uchun bosing</span> yoki faylni bu yerga tashlang
                          </p>
                        </>
                      )}
                    </div>
                    <Input
                      id="independent-file"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) =>
                        setCurrentIndependent((prev) => ({
                          ...prev,
                          independentFile: e.target.files?.[0],
                          file_name: e.target.files?.[0]?.name || null,
                        }))
                      }
                    />
                  </label>
                  {currentIndependent.file_name && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFile(setCurrentIndependent, "independentFile", "file_name")}
                      className="ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="independent-status">Holat</Label>
                <Select
                  value={currentIndependent.status || "draft"}
                  onValueChange={(value: any) => setCurrentIndependent({ ...currentIndependent, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Qoralama</SelectItem>
                    <SelectItem value="published">Nashr etilgan</SelectItem>
                    <SelectItem value="archived">Arxivlangan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveIndependent} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? "Yangilash" : "Mustaqil ishni saqlash"}
                </Button>
                {isEditing && (
                  <Button variant="outline" onClick={resetForms} className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Bekor qilish
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {independentWork.map((work) => (
              <Card key={work.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{work.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant={work.status === "published" ? "default" : "secondary"}>{work.status}</Badge>
                      <Badge variant="outline">#{work.order_number}</Badge>
                    </div>
                  </div>
                  <CardDescription>{work.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{work.content}</p>
                  {work.file_name && (
                    <p className="text-sm text-blue-500 mt-2">
                      Fayl:{" "}
                      <a href={work.file_url} target="_blank" rel="noopener noreferrer" className="underline">
                        {work.file_name}
                      </a>
                    </p>
                  )}
                  <div className="flex space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditIndependent(work)}
                      disabled={loading} // Yuklanish holatida tugmani o'chirish
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Tahrirlash
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteIndependent(work.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      O'chirish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
