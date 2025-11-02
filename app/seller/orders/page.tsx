import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Truck } from "lucide-react"
import Link from "next/link"

export default async function SellerOrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: store } = await supabase.from("stores").select("*").eq("seller_id", user.id).single()
  if (!store) redirect("/seller/onboarding")

  const { data: orderItems } = await supabase
    .from("order_items")
    .select(
      `
      *,
      orders (
        id,
        order_number,
        status,
        total,
        created_at,
        shipping_address
      ),
      products (
        name,
        images
      )
    `,
    )
    .eq("store_id", store.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
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
              <Link href="/seller/products" className="text-muted-foreground hover:text-foreground">
                Produtos
              </Link>
              <Link href="/seller/orders" className="font-medium">
                Pedidos
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground">{orderItems?.length || 0} itens vendidos</p>
        </div>

        {orderItems && orderItems.length > 0 ? (
          <div className="grid gap-4">
            {orderItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">Pedido #{item.orders?.order_number}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.orders?.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Badge
                      variant={
                        item.orders?.status === "delivered"
                          ? "default"
                          : item.orders?.status === "cancelled"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {item.orders?.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.products?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantidade: {item.quantity} × R$ {item.price.toFixed(2)}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        Total: R$ {(item.quantity * Number(item.price)).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Package className="h-4 w-4 mr-2" />
                        Detalhes
                      </Button>
                      {item.orders?.status === "paid" && (
                        <Button size="sm">
                          <Truck className="h-4 w-4 mr-2" />
                          Enviar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Nenhum pedido ainda</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
