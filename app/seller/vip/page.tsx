"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Crown, Users, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function SellerVIPPage() {
  const [store, setStore] = useState<any>(null)
  const [vipEnabled, setVipEnabled] = useState(false)
  const [vipPrice, setVipPrice] = useState("5.00")
  const [vipBenefits, setVipBenefits] = useState("")
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadStore()
    loadSubscribers()
  }, [])

  const loadStore = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase.from("stores").select("*").eq("seller_id", user.id).single()

    if (data) {
      setStore(data)
      setVipEnabled(data.vip_plan_enabled || false)
      setVipPrice(data.vip_plan_price?.toString() || "5.00")
      setVipBenefits(data.vip_plan_benefits || "")
    }
  }

  const loadSubscribers = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: storeData } = await supabase.from("stores").select("id").eq("seller_id", user.id).single()

    if (!storeData) return

    const { data } = await supabase
      .from("store_vip_subscriptions")
      .select(
        `
        *,
        profiles (
          full_name,
          email,
          avatar_url
        )
      `,
      )
      .eq("store_id", storeData.id)
      .eq("status", "active")

    if (data) setSubscribers(data)
  }

  const handleSaveVIPPlan = async () => {
    if (!store) return

    const price = Number.parseFloat(vipPrice)
    if (price < 5) {
      setError("O valor mínimo do plano VIP é R$ 5,00")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error: updateError } = await supabase
        .from("stores")
        .update({
          vip_plan_enabled: vipEnabled,
          vip_plan_price: price,
          vip_plan_benefits: vipBenefits,
        })
        .eq("id", store.id)

      if (updateError) throw updateError

      setSuccess("Plano VIP atualizado com sucesso!")
      loadStore()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar plano VIP")
    } finally {
      setIsLoading(false)
    }
  }

  const monthlyRevenue = subscribers.length * Number.parseFloat(vipPrice)
  const platformFee = monthlyRevenue * 0.1
  const netRevenue = monthlyRevenue - platformFee

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex items-center gap-2 mb-8">
        <Crown className="h-8 w-8 text-yellow-500" />
        <h1 className="text-3xl font-bold">Plano VIP da Loja</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurar Plano VIP</CardTitle>
              <CardDescription>
                Crie um plano de assinatura exclusivo para seus clientes mais fiéis. A plataforma retém 10% do valor.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Ativar Plano VIP</Label>
                  <p className="text-sm text-muted-foreground">Permitir que clientes assinem seu plano VIP</p>
                </div>
                <Switch checked={vipEnabled} onCheckedChange={setVipEnabled} />
              </div>

              {vipEnabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="vipPrice">Valor Mensal (mínimo R$ 5,00)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                      <Input
                        id="vipPrice"
                        type="number"
                        min="5"
                        step="0.01"
                        value={vipPrice}
                        onChange={(e) => setVipPrice(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Você receberá R$ {(Number.parseFloat(vipPrice) * 0.9).toFixed(2)} por assinante (após taxa de 10%)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vipBenefits">Benefícios do Plano VIP</Label>
                    <Textarea
                      id="vipBenefits"
                      placeholder="Descreva os benefícios exclusivos para assinantes VIP..."
                      value={vipBenefits}
                      onChange={(e) => setVipBenefits(e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Exemplo: Descontos exclusivos, acesso antecipado a novos produtos, frete grátis, etc.
                    </p>
                  </div>
                </>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleSaveVIPPlan} disabled={isLoading} className="w-full">
                {isLoading ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </CardContent>
          </Card>

          {/* Subscribers List */}
          <Card>
            <CardHeader>
              <CardTitle>Assinantes VIP</CardTitle>
              <CardDescription>Clientes que assinaram seu plano VIP</CardDescription>
            </CardHeader>
            <CardContent>
              {subscribers.length > 0 ? (
                <div className="space-y-4">
                  {subscribers.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{sub.profiles?.full_name || "Cliente"}</p>
                        <p className="text-sm text-muted-foreground">{sub.profiles?.email}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="default">Ativo</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Desde {new Date(sub.started_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhum assinante VIP ainda</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas VIP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Assinantes</span>
                </div>
                <p className="text-3xl font-bold">{subscribers.length}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Receita Mensal</span>
                </div>
                <p className="text-3xl font-bold">R$ {monthlyRevenue.toFixed(2)}</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Taxa da plataforma (10%): R$ {platformFee.toFixed(2)}</p>
                  <p className="font-semibold text-foreground">Você recebe: R$ {netRevenue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
            <CardContent className="pt-6">
              <Crown className="h-8 w-8 text-yellow-500 mb-2" />
              <h3 className="font-semibold mb-2">Dica VIP</h3>
              <p className="text-sm text-muted-foreground">
                Ofereça benefícios realmente exclusivos para seus assinantes VIP, como descontos especiais, acesso
                antecipado a produtos e atendimento prioritário.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
