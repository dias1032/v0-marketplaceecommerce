import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export default async function NewBannerPage() {
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
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Novo Banner</h1>
            <p className="text-muted-foreground">Crie um novo banner para o carrossel da página inicial</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Banner</CardTitle>
              <CardDescription>Preencha os detalhes do banner</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input id="title" placeholder="Ex: Coleção Verão 2025" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtítulo</Label>
                <Input id="subtitle" placeholder="Ex: Até 60% OFF + Frete Grátis" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">URL da Imagem *</Label>
                <Input id="image_url" type="url" placeholder="https://..." required />
                <p className="text-xs text-muted-foreground">Recomendado: 1200x400px (proporção 21:7)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_url">Link de Destino</Label>
                <Input id="link_url" type="url" placeholder="/shop?category=novidades" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="button_text">Texto do Botão</Label>
                <Input id="button_text" placeholder="Ex: Comprar Agora" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Posição no Carrossel *</Label>
                <Input id="position" type="number" min="1" defaultValue="1" required />
                <p className="text-xs text-muted-foreground">Ordem de exibição (1 = primeiro)</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Data de Início *</Label>
                  <Input id="start_date" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Data de Término *</Label>
                  <Input id="end_date" type="date" required />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Banner Ativo</Label>
                  <p className="text-sm text-muted-foreground">Exibir este banner no carrossel</p>
                </div>
                <Switch id="is_active" defaultChecked />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Criar Banner
                </Button>
                <Button type="button" variant="outline" asChild>
                  <a href="/admin/banners">Cancelar</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
