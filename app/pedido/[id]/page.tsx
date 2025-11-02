import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Truck, CheckCircle, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function PedidoPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/auth/login?next=/pedido/${params.id}`)

  const { data: order } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        *,
        products (
          name,
          images
        )
      )
    `,
    )
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Pedido não encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              O pedido solicitado não existe ou você não tem permissão para visualizá-lo.
            </p>
            <Button asChild>
              <Link href="/perfil">Voltar ao Perfil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusSteps = [
    { key: "pending", label: "Pedido Recebido", icon: Clock },
    { key: "processing", label: "Em Preparação", icon: Package },
    { key: "shipped", label: "Enviado", icon: Truck },
    { key: "delivered", label: "Entregue", icon: CheckCircle },
  ]

  const currentStepIndex = statusSteps.findIndex((step) => step.key === order.status)

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/perfil" className="text-sm text-muted-foreground hover:text-foreground">
            ← Voltar ao Perfil
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pedido #{order.id.slice(0, 8)}</h1>
          <p className="text-muted-foreground">
            Realizado em {new Date(order.created_at).toLocaleDateString("pt-BR")} às{" "}
            {new Date(order.created_at).toLocaleTimeString("pt-BR")}
          </p>
        </div>

        {/* Order Status Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Status do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
              <div
                className="absolute top-5 left-0 h-0.5 bg-primary transition-all"
                style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
              />
              <div className="relative flex justify-between">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon
                  const isCompleted = index <= currentStepIndex
                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                          isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className={`text-xs text-center ${isCompleted ? "font-medium" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {order.tracking_code && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium mb-1">Código de Rastreamento</p>
                    <p className="text-sm text-muted-foreground mb-2">{order.tracking_code}</p>
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={`https://rastreamento.correios.com.br/app/index.php?codigo=${order.tracking_code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Rastrear Entrega
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Itens do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={item.products?.images?.[0] || "/placeholder.svg"}
                      alt={item.products?.name || "Produto"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.products?.name}</h3>
                    <p className="text-sm text-muted-foreground">Quantidade: {item.quantity}</p>
                    {item.variant && <p className="text-sm text-muted-foreground">Variação: {item.variant}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R$ {item.price.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">un.</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="font-medium">{order.shipping_address?.name}</p>
              <p className="text-sm text-muted-foreground">{order.shipping_address?.street}</p>
              <p className="text-sm text-muted-foreground">
                {order.shipping_address?.city} - {order.shipping_address?.state}
              </p>
              <p className="text-sm text-muted-foreground">CEP: {order.shipping_address?.zip_code}</p>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>R$ {order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Frete</span>
                <span>R$ {order.shipping_cost.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Desconto</span>
                  <span>- R$ {order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>R$ {order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2">
                <span className="text-muted-foreground">Método de Pagamento</span>
                <Badge variant="outline">{order.payment_method}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Precisa de ajuda com este pedido?</p>
          <Button variant="outline" asChild>
            <Link href="/suporte">Entrar em Contato</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
