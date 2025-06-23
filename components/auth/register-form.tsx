"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Upload, User } from "lucide-react"
import { signUp, uploadFile, isSupabaseAvailable } from "@/lib/database"

interface RegisterFormProps {
  onRegisterSuccess: (userData: any) => void // Renamed from onRegister
  onLoginClick: () => void // Renamed from onSwitchToLogin
}

export default function RegisterForm({ onRegisterSuccess, onLoginClick }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "Ism kiritilishi shart"
    if (!formData.lastName.trim()) newErrors.lastName = "Familiya kiritilishi shart"
    if (!formData.email.trim()) newErrors.email = "Gmail kiritilishi shart"
    if (!formData.email.includes("@")) newErrors.email = "Email manzili noto'g'ri"
    if (formData.password.length < 6) newErrors.password = "Parol kamida 6 ta belgidan iborat bo'lishi kerak"
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Parollar mos kelmaydi"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    console.log("Submitting registration with avatar:", formData.avatar)
    try {
      const result = await signUp(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.avatar,
      )

      if ("status" in result && result.status === "already_registered") {
        setErrors({ general: "Bu email allaqachon ro'yxatdan o'tgan. Iltimos, tizimga kiring." })
        onLoginClick()
      } else {
        onRegisterSuccess(result.profile)
      }
    } catch (error: any) {
      console.error("Registration error:", error.message)
      setErrors({ general: error.message || "Ro'yxatdan o'tishda xatolik yuz berdi" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ avatar: "Fayl hajmi 5MB dan oshmasligi kerak" })
      return
    }

    setErrors((prev) => ({ ...prev, avatar: "" }))

    try {
      if (isSupabaseAvailable) {
        const avatarUrl = await uploadFile(file, `avatars/${Date.now()}_${file.name}`)
        setFormData((prev) => ({ ...prev, avatar: avatarUrl }))
        console.log("Avatar URL set in form data:", avatarUrl)
      } else {
        const reader = new FileReader()
        reader.onload = (e) => {
          setFormData((prev) => ({ ...prev, avatar: e.target?.result as string }))
        }
        reader.readAsDataURL(file)
      }
    } catch (error) {
      console.warn("Avatar upload error:", error)
      setFormData((prev) => ({ ...prev, avatar: `/placeholder.svg?height=200&width=200&text=Avatar` }))
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Ro'yxatdan o'tish</CardTitle>
        <CardDescription>Talaba sifatida ro'yxatdan o'ting</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={formData.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar"
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Upload className="w-3 h-3" />
              </label>
              <input id="avatar" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </div>
          </div>
          {errors.avatar && <p className="text-xs text-red-500 text-center">{errors.avatar}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Ism</Label>
              <Input
                id="firstName"
                placeholder="Ismingiz"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Familiya</Label>
              <Input
                id="lastName"
                placeholder="Familiyangiz"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Parol</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Parolingizni kiriting"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
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
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Parolni takrorlang</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Parolni qayta kiriting"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className={`pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
          </div>

          {errors.general && (
            <Alert variant="destructive">
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Ro'yxatdan o'tilyapti..." : "Ro'yxatdan o'tish"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <div className="text-sm text-muted-foreground">
            Hisobingiz bormi?{" "}
            <Button variant="link" onClick={onLoginClick} className="p-0">
              Kirish
            </Button>
          </div>
        </div>

        <Alert className="mt-4">
          <AlertDescription className="text-xs">
            {!isSupabaseAvailable ? (
              <>
                <strong>Demo rejim:</strong> Istalgan email va parol bilan ro'yxatdan o'ting
              </>
            ) : (
              <>
                <strong>Supabase rejim:</strong> Haqiqiy email va kuchli parol kiriting
              </>
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
