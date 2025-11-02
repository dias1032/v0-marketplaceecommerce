import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Store, Palette, ImageIcon } from "lucide-react"
import Link from "next/link"

export default async function SellerSettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (profile?.role !== "seller") redirect("/")

  const { data: store } = await supabase.from("stores").select("*").eq("seller_id", user.id).single()
  if (!store) redirect("/seller/onboarding")

  const customColors = (store.custom_colors as { primary?: string; secondary?: string }) || {}

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                V
              </div>
              <span className="text-xl font-bold">Vestti</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/seller/dashboard" className="text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/seller/settings" className="font-medium">
                Configurações
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Configurações da Loja</h1>
          <p className="text-muted-foreground">Personalize a aparência e informações da sua loja</p>
        </div>

        <div className="space-y-6">
          {/* Store Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Informações da Loja
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action="/api/seller/update-store" method="POST" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Loja</Label>
                  <Input id="name" name="name" defaultValue={store.name} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL da Loja</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">vestti.com/store/</span>
                    <Input id="slug" name="slug" defaultValue={store.slug} required className="flex-1" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={store.description || ""}
                    rows={4}
                    placeholder="Conte aos clientes sobre sua loja..."
                  />
                </div>

                <Button type="submit">Salvar Informações</Button>
              </form>
            </CardContent>
          </Card>

          {/* Visual Customization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Imagens da Loja
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                action="/api/seller/update-images"
                method="POST"
                encType="multipart/form-data"
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo da Loja</Label>
                  {store.logo_url && (
                    <div className="mb-2">
                      <img
                        src={store.logo_url || "/placeholder.svg"}
                        alt="Logo atual"
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <Input id="logo" name="logo" type="file" accept="image/*" />
                  <p className="text-xs text-muted-foreground">Recomendado: 200x200px, PNG ou JPG</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banner">Banner da Loja</Label>
                  {store.banner_url && (
                    <div className="mb-2">
                      <img
                        src={store.banner_url || "/placeholder.svg"}
                        alt="Banner atual"
                        className="h-32 w-full object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <Input id="banner" name="banner" type="file" accept="image/*" />
                  <p className="text-xs text-muted-foreground">Recomendado: 1200x400px, PNG ou JPG</p>
                </div>

                <Button type="submit">Atualizar Imagens</Button>
              </form>
            </CardContent>
          </Card>

          {/* Color Customization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Cores da Loja
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action="/api/seller/update-colors" method="POST" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Cor Primária</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="primary_color"
                        name="primary_color"
                        type="color"
                        defaultValue={customColors.primary || "#000000"}
                        className="h-10 w-20"
                      />
                      <Input type="text" defaultValue={customColors.primary || "#000000"} className="flex-1" readOnly />
                    </div>
                    <p className="text-xs text-muted-foreground">Usada em botões e destaques</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Cor Secundária</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="secondary_color"
                        name="secondary_color"
                        type="color"
                        defaultValue={customColors.secondary || "#ffffff"}
                        className="h-10 w-20"
                      />
                      <Input
                        type="text"
                        defaultValue={customColors.secondary || "#ffffff"}
                        className="flex-1"
                        readOnly
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Usada em fundos e textos</p>
                  </div>
                </div>

                <Button type="submit">Salvar Cores</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
