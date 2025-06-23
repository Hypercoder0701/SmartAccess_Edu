"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { getStudentRankings, isSupabaseAvailable } from "@/lib/database"
import { Trophy, Search, AlertTriangle, Medal } from "lucide-react"

interface StudentRanking {
  studentId: string
  profile: {
    firstName: string
    lastName: string
    avatarUrl?: string
  }
  totalScore: number
  testCount: number
  averageScore: number
}

export default function StudentRatingsPage() {
  // <-- O'zgarish shu yerda: export default
  const [rankings, setRankings] = useState<StudentRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadRankings() {
      setLoading(true)
      setError(null)
      try {
        const data = await getStudentRankings()
        setRankings(data)
      } catch (err: any) {
        console.error("Error loading student rankings:", err)
        setError("Talabalar reytingini yuklashda xatolik yuz berdi.")
      } finally {
        setLoading(false)
      }
    }
    loadRankings()
  }, [])

  const filteredRankings = rankings.filter(
    (student) =>
      student.profile.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.profile.lastName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Medal className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-400" />
    return <span className="text-sm font-medium">{rank}</span>
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Talabalar Reytingi</CardTitle>
          <CardDescription>Yuklanmoqda...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Talabalar Reytingi</h1>
        <p className="text-muted-foreground">Talabalarning o'rtacha ballari bo'yicha reytingi</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Talabalarni qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Jami {rankings.length} talaba</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-red-500 text-center py-8">{error}</p>
          ) : filteredRankings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "Qidiruv natijasi bo'yicha talabalar topilmadi." : "Hali reytinglar mavjud emas."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">O'rin</TableHead>
                  <TableHead className="w-[80px]">Avatar</TableHead>
                  <TableHead>To'liq ismi</TableHead>
                  <TableHead className="text-center">Testlar soni</TableHead>
                  <TableHead className="text-right">O'rtacha ball (ochko)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRankings.map((student, index) => (
                  <TableRow key={student.studentId}>
                    <TableCell className="text-center">{getRankBadge(index + 1)}</TableCell>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={student.profile.avatarUrl || "/placeholder.svg?height=40&width=40&text=Avatar"}
                          alt={`${student.profile.firstName} ${student.profile.lastName}`}
                        />
                        <AvatarFallback>
                          {student.profile.firstName.charAt(0)}
                          {student.profile.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {student.profile.firstName} {student.profile.lastName}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{student.testCount}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        className={
                          student.averageScore >= 85
                            ? "bg-green-500 hover:bg-green-600"
                            : student.averageScore >= 70
                              ? "bg-blue-500 hover:bg-blue-600"
                              : student.averageScore >= 55
                                ? "bg-yellow-500 hover:bg-yellow-600"
                                : "bg-red-500 hover:bg-red-600"
                        }
                      >
                        {student.averageScore.toFixed(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {!isSupabaseAvailable && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-sm">
          <AlertTriangle className="inline h-4 w-4 mr-2" />
          <strong>Demo rejim:</strong> Talabalar reytingi haqiqiy ma'lumotlar bazasidan olinmayapti. To'liq
          funksionallik uchun Supabase'ni sozlang.
        </div>
      )}
    </div>
  )
}
