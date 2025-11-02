import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Percent, Tag, Plus, Calendar } from "lucide-react"
import Link from "next/link"

export default async function SellerPromotionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (profile?.role !== "seller") redirect("/")

  const { data: store } = await supabase.from("stores").select("*").eq("seller_id", user.id).single()
  if (!store) redirect("/seller/onboarding")

  // Get coupons
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false })

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
              <Link href="/seller/promotions" className="font-medium">
                Promoções
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Promoções e Cupons</h1>
            <p className="text-muted-foreground">Crie cupons de desconto para atrair mais clientes</p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Create Coupon Form */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Criar Cupom
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action="/api/seller/create-coupon" method="POST" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código do Cupom</Label>
                  <Input id="code" name="code" type="text" placeholder="DESCONTO10" required className="uppercase" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Desconto</Label>
                  <select
                    id="type"
                    name="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">Valor do Desconto</Label>
                  <Input id="value" name="value" type="number" step="0.01" min="0" placeholder="10" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_purchase">Compra Mínima (R$)</Label>
                  <Input id="min_purchase" name="min_purchase" type="number" step="0.01" min="0" placeholder="50.00" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_uses">Usos Máximos</Label>
                  <Input id="max_uses" name="max_uses" type="number" min="1" placeholder="100" />
                </div>

                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Data Início</Label>
                    <Input id="start_date" name="start_date" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">Data Fim</Label>
                    <Input id="end_date" name="end_date" type="date" required />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Cupom
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Coupons List */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Cupons Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coupons && coupons.length > 0 ? (
                  coupons.map((coupon) => {
                    const isActive =
                      coupon.is_active &&
                      new Date(coupon.start_date) <= new Date() &&
                      new Date(coupon.end_date) >= new Date()
                    const usagePercent = coupon.max_uses ? (coupon.used_count / coupon.max_uses) * 100 : 0

                    return (
                      <div key={coupon.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              {coupon.type === "percentage" ? (
                                <Percent className="h-6 w-6" />
                              ) : (
                                <Tag className="h-6 w-6" />
                              )}
                            </div>
                            <div>
                              <p className="text-lg font-bold">{coupon.code}</p>
                              <p className="text-sm text-muted-foreground">
                                {coupon.type === "percentage"
                                  ? `${coupon.value}% de desconto`
                                  : `R$ ${Number(coupon.value).toFixed(2)} de desconto`}
                              </p>
                            </div>
                          </div>
                          <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Ativo" : "Inativo"}</Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          {coupon.min_purchase && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Tag className="h-4 w-4" />
                              <span>Compra mínima: R$ {Number(coupon.min_purchase).toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(coupon.start_date).toLocaleDateString("pt-BR")} -{" "}
                              {new Date(coupon.end_date).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          {coupon.max_uses && (
                            <div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>
                                  Usos: {coupon.used_count} / {coupon.max_uses}
                                </span>
                                <span>{usagePercent.toFixed(0)}%</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary transition-all"
                                  style={{ width: `${usagePercent}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            Editar
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            {coupon.is_active ? "Desativar" : "Ativar"}
                          </Button>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum cupom criado ainda. Crie seu primeiro cupom para começar!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
