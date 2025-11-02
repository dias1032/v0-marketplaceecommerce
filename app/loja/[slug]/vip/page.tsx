import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Check } from "lucide-react"
import Link from "next/link"

export default async function StoreVIPPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get store
  const { data: store } = await supabase.from("stores").select("*").eq("slug", params.slug).single()

  if (!store || !store.vip_plan_enabled) {
    redirect(`/loja/${params.slug}`)
  }

  // Check if user is already subscribed
  let isSubscribed = false
  if (user) {
    const { data: subscription } = await supabase
      .from("store_vip_subscriptions")
      .select("*")
      .eq("store_id", store.id)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    isSubscribed = !!subscription
  }

  const benefits = store.vip_plan_benefits?.split("\n").filter((b: string) => b.trim()) || []

  return (
    <div className="container max-w-4xl py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-4">
          <Crown className="h-12 w-12 text-yellow-500" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Plano VIP - {store.name}</h1>
        <p className="text-xl text-muted-foreground">Torne-se um membro VIP e aproveite benefícios exclusivos</p>
      </div>

      <Card className="max-w-2xl mx-auto border-yellow-200 dark:border-yellow-900">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <CardTitle className="text-3xl">R$ {store.vip_plan_price?.toFixed(2)}</CardTitle>
            <span className="text-muted-foreground">/mês</span>
          </div>
          <CardDescription>Cancele quando quiser, sem compromisso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {benefits.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Benefícios Exclusivos:</h3>
              <ul className="space-y-2">
                {benefits.map((benefit: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isSubscribed ? (
            <div className="text-center space-y-4">
              <Badge variant="default" className="text-lg px-4 py-2">
                <Crown className="h-4 w-4 mr-2" />
                Você é VIP!
              </Badge>
              <p className="text-sm text-muted-foreground">Você já é um membro VIP desta loja</p>
              <Button variant="outline" asChild>
                <Link href={`/loja/${params.slug}`}>Voltar para a Loja</Link>
              </Button>
            </div>
          ) : user ? (
            <form
              action={async () => {
                "use server"
                const supabase = await createClient()
                const {
                  data: { user },
                } = await supabase.auth.getUser()
                if (!user?.email) return

                // Call VIP subscription API
                const response = await fetch(
                  `${process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/api/criar-vip-subscription`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      storeId: store.id,
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
              <Button type="submit" size="lg" className="w-full">
                <Crown className="h-5 w-5 mr-2" />
                Assinar Plano VIP
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">Faça login para assinar o plano VIP</p>
              <Button asChild size="lg" className="w-full">
                <Link href={`/auth/login?redirect=/loja/${params.slug}/vip`}>Fazer Login</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
