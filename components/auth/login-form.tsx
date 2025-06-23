"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail } from "lucide-react"
import { signIn, isSupabaseAvailable } from "@/lib/database"

interface LoginFormProps {
  onLoginSuccess: () => void // onLogin o'rniga onLoginSuccess ishlatiladi
  onRegisterClick: () => void // onSwitchToRegister o'rniga onRegisterClick ishlatiladi
}

export default function LoginForm({ onLoginSuccess, onRegisterClick }: LoginFormProps) {
  // Export default qilib o'zgartirildi
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await signIn(email, password) // signIn funksiyasi endi user va profile qaytarmaydi, shuning uchun to'g'ridan-to'g'ri chaqiramiz
      onLoginSuccess() // Muvaffaqiyatli kirishdan so'ng callbackni chaqiramiz
    } catch (error: any) {
      console.error("Login error:", error.message)

      if (error.message.includes("Database jadvallar yaratilmagan")) {
        setError("Database sozlanmagan. Iltimos, admin bilan bog'laning yoki SQL skriptlarni ishga tushiring.")
      } else if (error.message.includes("Email yoki parol noto'g'ri")) {
        setError("Email yoki parol noto'g'ri")
      } else if (error.message.includes("Email manzilingiz tasdiqlanmagan")) {
        setError(
          "Email manzilingiz tasdiqlanmagan. Iltimos, pochtangizni tekshiring va tasdiqlash havolasiga o'ting. Agar xat kelmagan bo'lsa, spam papkasini tekshiring yoki qayta ro'yxatdan o'tishga harakat qiling.",
        )
      } else if (!isSupabaseAvailable) {
        setError("Demo rejimida istalgan email va parol bilan kirishingiz mumkin")
      } else {
        setError(error.message || "Kirish jarayonida xatolik yuz berdi")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    window.location.href =
      "mailto:hyperuzprojectssupport@gmail.com?subject=Parolni tiklash&body=Assalomu alaykum, parolimni unutib qoldim. Iltimos yordam bering."
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Tizimga kirish</CardTitle>
        <CardDescription>Email va parolingizni kiriting</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Parol</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Parolingizni kiriting"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                required
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

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Kirilyapti..." : "Kirish"}
          </Button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <Button variant="link" onClick={handleForgotPassword} className="text-sm text-muted-foreground">
            Parolni unutdingizmi?
          </Button>

          <div className="text-sm text-muted-foreground">
            Hisobingiz yo'qmi?{" "}
            <Button variant="link" onClick={onRegisterClick} className="p-0">
              {" "}
              {/* onSwitchToRegister o'rniga onRegisterClick */}
              Ro'yxatdan o'tish
            </Button>
          </div>
        </div>

        <Alert className="mt-4">
          <AlertDescription className="text-xs">
            {!isSupabaseAvailable ? (
              <>
                <strong>Demo rejim:</strong> Istalgan email va parol bilan kirishingiz mumkin. Admin uchun:
                admin@platform.uz | Talaba uchun: student@gmail.com
              </>
            ) : (
              <>
                <strong>Supabase rejim:</strong> Avval ro'yxatdan o'ting yoki mavjud hisobingiz bilan kiring
              </>
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
