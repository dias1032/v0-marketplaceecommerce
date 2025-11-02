import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, Search, Download } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function SalesHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "seller") redirect("/")

  const { data: store } = await supabase.from("stores").select("*").eq("seller_id", user.id).single()

  if (!store) redirect("/seller/onboarding")

  // Build query for order items from this store
  let query = supabase
    .from("order_items")
    .select(
      `
      *,
      orders (
        id,
        order_code,
        order_number,
        status,
        created_at,
        shipping_address,
        profiles!orders_buyer_id_fkey (
          full_name,
          email
        )
      ),
      products (
        name,
        sku,
        images
      )
    `,
    )
    .eq("store_id", store.id)
    .order("created_at", { ascending: false })

  // Apply filters
  if (params.search) {
    // Search by order code or product SKU
    query = query.or(`orders.order_code.ilike.%${params.search}%,products.sku.ilike.%${params.search}%`)
  }

  const { data: salesItems } = await query.limit(100)

  // Calculate totals
  const totalSales = salesItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0
  const totalCommission = salesItems?.reduce((sum, item) => sum + item.commission_amount, 0) || 0
  const totalEarnings = totalSales - totalCommission

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/seller/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              V
            </div>
            <span className="text-xl font-bold">Vestti Seller</span>
          </Link>
        </div>
      </header>

      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Histórico de Vendas</h1>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total de Vendas</CardDescription>
              <CardTitle className="text-2xl">R$ {totalSales.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Comissão Vestti</CardDescription>
              <CardTitle className="text-2xl text-red-600">- R$ {totalCommission.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Seus Ganhos</CardDescription>
              <CardTitle className="text-2xl text-green-600">R$ {totalEarnings.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <form action="/seller/sales-history" method="get" className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Buscar por código do pedido ou SKU do produto..."
                  className="pl-10"
                  defaultValue={params.search}
                />
              </div>
              <Button type="submit">Buscar</Button>
            </form>
          </CardContent>
        </Card>

        {/* Sales List */}
        {salesItems && salesItems.length > 0 ? (
          <div className="space-y-4">
            {salesItems.map((item) => {
              const order = item.orders
              const product = item.products
              const mainImage = product.images?.[0] || "/diverse-products-still-life.png"
              const earnings = item.price * item.quantity - item.commission_amount

              return (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-muted shrink-0">
                        <Image src={mainImage || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                            <p className="text-sm text-muted-foreground">
                              Pedido: #{order.order_code} • Cliente: {order.profiles.full_name}
                            </p>
                          </div>
                          <Badge>{order.status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Quantidade</p>
                            <p className="font-medium">{item.quantity}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Preço Unit.</p>
                            <p className="font-medium">R$ {item.price.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total</p>
                            <p className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Comissão</p>
                            <p className="font-medium text-red-600">- R$ {item.commission_amount.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Seu Ganho</p>
                            <p className="font-medium text-green-600">R$ {earnings.toFixed(2)}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(order.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Nenhuma venda encontrada</h2>
              <p className="text-muted-foreground">
                {params.search ? "Tente buscar com outros termos" : "Suas vendas aparecerão aqui"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
