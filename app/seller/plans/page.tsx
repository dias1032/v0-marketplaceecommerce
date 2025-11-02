import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Zap, Star } from "lucide-react"
import Link from "next/link"

export default async function SellerPlansPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: store } = await supabase.from("stores").select("*").eq("seller_id", user.id).single()

  const plans = [
    {
      id: "free",
      name: "Free",
      icon: Star,
      price: "R$ 0",
      period: "/mês",
      fee: "15%",
      description: "Perfeito para começar",
      features: [
        "Produtos ilimitados",
        "Painel básico de vendas",
        "Suporte por email",
        "Taxa de 15% por venda",
        "Listagem padrão nos resultados",
      ],
      current: store?.subscription_plan === "free",
      cta: "Plano Atual",
      disabled: true,
    },
    {
      id: "mid",
      name: "Mid",
      icon: Zap,
      price: "R$ 89,90",
      period: "/mês",
      fee: "10%",
      description: "Para lojas em crescimento",
      features: [
        "Tudo do plano Free",
        "Taxa reduzida de 10% por venda",
        "Análises e relatórios completos",
        "Cupons de desconto personalizados",
        "Chat direto com clientes",
        "Personalização da loja (cores, banner)",
        "Criar plano VIP para clientes",
      ],
      current: store?.subscription_plan === "mid",
      cta: store?.subscription_plan === "mid" ? "Plano Atual" : "Fazer Upgrade",
      disabled: store?.subscription_plan === "mid" || store?.subscription_plan === "master",
      popular: true,
    },
    {
      id: "master",
      name: "Master",
      icon: Crown,
      price: "R$ 179,90",
      period: "/mês",
      fee: "5%",
      description: "Máximo desempenho",
      features: [
        "Tudo do plano Mid",
        "Taxa mínima de apenas 5% por venda",
        "Selo de loja verificada",
        "Prioridade máxima na busca",
        "Destaque em campanhas oficiais",
        "Suporte prioritário 24/7",
        "Gerente de conta dedicado",
        "Espaço para anúncios patrocinados",
      ],
      current: store?.subscription_plan === "master",
      cta: store?.subscription_plan === "master" ? "Plano Atual" : "Fazer Upgrade",
      disabled: store?.subscription_plan === "master",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/seller/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              V
            </div>
            <span className="text-xl font-bold">Vestti</span>
          </Link>
        </div>
      </header>

      <div className="container py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Planos e Assinaturas</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para sua loja e pague menos comissão por venda. Cancele quando quiser.
          </p>
          {store && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Plano atual:</span>
              <Badge variant="default" className="capitalize">
                {store.subscription_plan}
              </Badge>
              <span className="text-sm text-muted-foreground">• Taxa: {store.commission_rate}%</span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <Card
                key={plan.id}
                className={`relative ${plan.popular ? "border-primary shadow-lg scale-105" : ""} ${plan.current ? "border-green-500" : ""}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">Mais Popular</Badge>
                )}
                {plan.current && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500">Plano Atual</Badge>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  </div>
                  <CardDescription className="text-sm mb-4">{plan.description}</CardDescription>
                  <div>
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm font-semibold text-primary mt-2">Taxa por venda: {plan.fee}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <form
                    action={async () => {
                      "use server"
                      if (plan.id === "free") return

                      const supabase = await createClient()
                      const {
                        data: { user },
                      } = await supabase.auth.getUser()

                      if (!user?.email) return

                      // Call subscription API
                      const response = await fetch(
                        `${process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/api/criar-assinatura`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            planId: plan.id,
                            payerEmail: user.email,
                          }),
                        },
                      )

                      if (response.ok) {
                        const { initPoint } = await response.json()
                        redirect(initPoint)
                      }
                    }}
                  >
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={plan.disabled}
                      variant={plan.current ? "outline" : "default"}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Benefits Comparison */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Compare os Benefícios</h2>
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-4 gap-4 font-semibold border-b pb-4">
              <div>Recurso</div>
              <div className="text-center">Free</div>
              <div className="text-center">Mid</div>
              <div className="text-center">Master</div>
            </div>
            {[
              { feature: "Taxa por venda", free: "15%", mid: "10%", master: "5%" },
              { feature: "Produtos ilimitados", free: "✓", mid: "✓", master: "✓" },
              { feature: "Análises completas", free: "—", mid: "✓", master: "✓" },
              { feature: "Plano VIP para clientes", free: "—", mid: "✓", master: "✓" },
              { feature: "Selo verificado", free: "—", mid: "—", master: "✓" },
              { feature: "Prioridade na busca", free: "—", mid: "—", master: "✓" },
              { feature: "Suporte prioritário", free: "—", mid: "—", master: "✓" },
            ].map((row) => (
              <div key={row.feature} className="grid grid-cols-4 gap-4 py-2 border-b last:border-0">
                <div className="text-sm">{row.feature}</div>
                <div className="text-center text-sm">{row.free}</div>
                <div className="text-center text-sm">{row.mid}</div>
                <div className="text-center text-sm">{row.master}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center space-y-4">
          <p className="text-muted-foreground">Precisa de ajuda para escolher o plano ideal?</p>
          <Button variant="outline" asChild>
            <Link href="/ajuda">Falar com Suporte</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
