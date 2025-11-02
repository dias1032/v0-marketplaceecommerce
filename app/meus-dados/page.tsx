import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { MobileNav } from "@/components/mobile-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Package, MessageSquare, Heart } from "lucide-react"

export default async function MeusDadosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: orders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("buyer_id", user.id)

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("buyer_id", user.id)

  const { data: messages } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("*", { count: "exact", head: true })
    .eq("buyer_id", user.id)

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
            <h1 className="text-3xl font-bold">Meus Dados</h1>
            <p className="text-muted-foreground">Visualize e exporte suas informações pessoais</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Dados básicos da sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Nome Completo</p>
                  <p className="font-medium">{profile?.full_name || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">E-mail</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Nome de Usuário</p>
                  <p className="font-medium">{profile?.username || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tipo de Conta</p>
                  <p className="font-medium capitalize">{profile?.role || "buyer"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Membro desde</p>
                  <p className="font-medium">{new Date(profile?.created_at || "").toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atividades</CardTitle>
              <CardDescription>Resumo das suas atividades na plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Package className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{orders?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Pedidos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{reviews?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Avaliações</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <MessageSquare className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{messages?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Mensagens</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Heart className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{wishlist?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Favoritos</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exportar Dados</CardTitle>
              <CardDescription>Baixe uma cópia dos seus dados em formato JSON</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                De acordo com a LGPD, você tem o direito de solicitar uma cópia de todos os seus dados pessoais
                armazenados em nossa plataforma.
              </p>
              <Button className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Exportar Todos os Meus Dados
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
