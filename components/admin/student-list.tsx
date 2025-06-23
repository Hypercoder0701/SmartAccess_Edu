"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getAllStudents, isSupabaseAvailable } from "@/lib/database"
import { deleteStudentAction, updateStudentPasswordAction } from "@/lib/actions"
import type { Profile } from "@/lib/supabase"
import { UserPlus, Edit, Trash2, Search, Mail, AlertTriangle, Eye, EyeOff } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { uz } from "date-fns/locale"

export default function StudentList() {
  const [students, setStudents] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [studentToDelete, setStudentToDelete] = useState<Profile | null>(null)
  const [studentToEdit, setStudentToEdit] = useState<Profile | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [actionStatus, setActionStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllStudents()
      setStudents(data)
    } catch (err: any) {
      console.error("Error loading students:", err)
      setError("Talabalarni yuklashda xatolik yuz berdi.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return
    setIsActionLoading(true)
    setActionStatus(null)

    const result = await deleteStudentAction(studentToDelete.id)

    if (result.error) {
      setActionStatus({ type: "error", message: result.error })
    } else {
      setActionStatus({ type: "success", message: "Talaba muvaffaqiyatli o'chirildi." })
      setStudents(students.filter((s) => s.id !== studentToDelete.id))
    }

    setIsActionLoading(false)
    setStudentToDelete(null)
  }

  const handleUpdatePassword = async () => {
    if (!studentToEdit) return
    setIsActionLoading(true)
    setActionStatus(null)

    const result = await updateStudentPasswordAction(studentToEdit.id, newPassword)

    if (result.error) {
      setActionStatus({ type: "error", message: result.error })
    } else {
      setActionStatus({ type: "success", message: "Parol muvaffaqiyatli yangilandi." })
      setStudentToEdit(null)
      setNewPassword("")
    }
    setIsActionLoading(false)
  }

  const filteredStudents = students.filter(
    (student) =>
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Talabalar ro'yxati</CardTitle>
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
        <h1 className="text-3xl font-bold">Talabalar</h1>
        <p className="text-muted-foreground">Platformadagi barcha talabalar ro'yxati</p>
      </div>

      {actionStatus && (
        <Alert variant={actionStatus.type === "success" ? "default" : "destructive"}>
          <AlertDescription>{actionStatus.message}</AlertDescription>
        </Alert>
      )}

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
            <Button disabled>
              <UserPlus className="mr-2 h-4 w-4" /> Yangi talaba qo'shish
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-red-500 text-center py-8">{error}</p>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "Qidiruv natijasi bo'yicha talabalar topilmadi." : "Hali talabalar mavjud emas."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Avatar</TableHead>
                  <TableHead>To'liq ismi</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ro'yxatdan o'tgan sana</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={student.avatar_url || "/placeholder.svg?height=40&width=40&text=Avatar"}
                          alt={`${student.first_name} ${student.last_name}`}
                        />
                        <AvatarFallback>
                          {student.first_name.charAt(0)}
                          {student.last_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {student.first_name} {student.last_name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {student.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(student.created_at), { addSuffix: true, locale: uz })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="mr-2" onClick={() => setStudentToEdit(student)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Tahrirlash</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => setStudentToDelete(student)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">O'chirish</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!studentToDelete} onOpenChange={() => setStudentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rostdan ham o'chirmoqchimisiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu amalni qaytarib bo'lmaydi. Bu talaba{" "}
              <strong>
                {studentToDelete?.first_name} {studentToDelete?.last_name}
              </strong>{" "}
              va uning barcha ma'lumotlarini butunlay o'chirib yuboradi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionLoading}>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStudent} disabled={isActionLoading}>
              {isActionLoading ? "O'chirilmoqda..." : "O'chirish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Password Dialog */}
      <Dialog open={!!studentToEdit} onOpenChange={() => setStudentToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Parolni tahrirlash: {studentToEdit?.first_name} {studentToEdit?.last_name}
            </DialogTitle>
            <DialogDescription>
              Talabaning parolini yangilang. Yangi parol kamida 6 belgidan iborat bo'lishi kerak.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-password" className="text-right">
                Yangi parol
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setStudentToEdit(null)} disabled={isActionLoading}>
              Bekor qilish
            </Button>
            <Button type="submit" onClick={handleUpdatePassword} disabled={isActionLoading || newPassword.length < 6}>
              {isActionLoading ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!isSupabaseAvailable && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-sm">
          <AlertTriangle className="inline h-4 w-4 mr-2" />
          <strong>Demo rejim:</strong> Talabalar ro'yxati haqiqiy ma'lumotlar bazasidan olinmayapti. To'liq
          funksionallik uchun Supabase'ni sozlang.
        </div>
      )}
    </div>
  )
}
