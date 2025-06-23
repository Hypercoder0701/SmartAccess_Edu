"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserIcon, Loader2 } from "lucide-react"
import { updateProfileData, uploadFile } from "@/lib/database"
import type { Profile } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface ProfileEditPageProps {
  profile: Profile
  onProfileUpdate: () => void // Profil yangilangandan so'ng ma'lumotlarni qayta yuklash uchun
}

export default function ProfileEditPage({ profile, onProfileUpdate }: ProfileEditPageProps) {
  const [firstName, setFirstName] = useState(profile.first_name || "")
  const [lastName, setLastName] = useState(profile.last_name || "")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(profile.avatar_url || null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setFirstName(profile.first_name || "")
    setLastName(profile.last_name || "")
    setAvatarPreviewUrl(profile.avatar_url || null)
    setAvatarFile(null) // Yangi profil yuklanganda faylni tozalash
  }, [profile])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreviewUrl(URL.createObjectURL(file)) // Fayl oldindan ko'rish
    } else {
      setAvatarFile(null)
      setAvatarPreviewUrl(profile.avatar_url || null) // Agar fayl tanlanmasa, asl avatarga qaytish
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    try {
      let newAvatarUrl = profile.avatar_url

      if (avatarFile) {
        const filePath = `avatars/${profile.id}/${Date.now()}_${avatarFile.name}`
        newAvatarUrl = await uploadFile(avatarFile, filePath)
      } else if (avatarPreviewUrl === null && profile.avatar_url !== null) {
        // Agar foydalanuvchi avatarni o'chirgan bo'lsa
        // Bu yerda Supabase Storage'dan faylni o'chirish logikasi bo'lishi mumkin
        // Hozircha faqat URL ni null qilamiz
        newAvatarUrl = null
      }

      const updatedProfile = await updateProfileData(profile.id, {
        first_name: firstName,
        last_name: lastName,
        avatar_url: newAvatarUrl,
      })

      onProfileUpdate() // App.tsx dagi ma'lumotlarni yangilash uchun callback
      toast({
        title: "Muvaffaqiyatli!",
        description: "Profil ma'lumotlari yangilandi.",
      })
    } catch (error) {
      console.error("Profilni yangilashda xatolik:", error)
      toast({
        title: "Xatolik!",
        description: "Profilni yangilashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Profilni tahrirlash</CardTitle>
        <CardDescription>Shaxsiy ma'lumotlaringizni va avataringizni yangilang.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarPreviewUrl || undefined} alt={`${firstName} ${lastName} avatari`} />
              <AvatarFallback>
                <UserIcon className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="avatar">Avatar yuklash</Label>
              <Input id="avatar" type="file" accept="image/*" onChange={handleFileChange} />
              {avatarPreviewUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAvatarFile(null)
                    setAvatarPreviewUrl(null)
                  }}
                  className="mt-2"
                >
                  Avatarni o'chirish
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Ism</Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Familiya</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Yangilanmoqda...
              </>
            ) : (
              "Saqlash"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
