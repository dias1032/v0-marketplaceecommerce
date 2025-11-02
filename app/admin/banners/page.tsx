import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function AdminBannersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/")
  }

  const { data: banners } = await supabase.from("banners").select("*").order("position", { ascending: true })

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={
          profile
            ? {
                id: user.id,
                name: profile.full_name,
                email: profile.email,
                avatar: profile.avatar_url,
                username: profile.username,
                role: profile.role,
              }
            : null
        }
      />

      <div className="container py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Gerenciar Banners</h1>
              <p className="text-muted-foreground">Configure os banners do carrossel da página inicial</p>
            </div>
            <Button asChild>
              <Link href="/admin/banners/new">
                <Plus className="mr-2 h-4 w-4" />
                Novo Banner
              </Link>
            </Button>
          </div>

          <div className="grid gap-4">
            {banners?.map((banner) => (
              <Card key={banner.id}>
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <div className="relative w-48 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={banner.image_url || "/placeholder.svg"}
                        alt={banner.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold">{banner.title}</h3>
                            <Badge variant={banner.is_active ? "default" : "secondary"}>
                              {banner.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                            <Badge variant="outline">Posição {banner.position}</Badge>
                          </div>
                          {banner.subtitle && <p className="text-sm text-muted-foreground">{banner.subtitle}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon">
                            {banner.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {banner.link_url && (
                          <div>
                            <span className="font-medium">Link:</span> {banner.link_url}
                          </div>
                        )}
                        {banner.button_text && (
                          <div>
                            <span className="font-medium">Botão:</span> {banner.button_text}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <div>Início: {new Date(banner.start_date).toLocaleDateString("pt-BR")}</div>
                        <div>Fim: {new Date(banner.end_date).toLocaleDateString("pt-BR")}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {(!banners || banners.length === 0) && (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">Nenhum banner cadastrado</p>
                  <Button asChild>
                    <Link href="/admin/banners/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Primeiro Banner
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
