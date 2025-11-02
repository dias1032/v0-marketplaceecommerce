import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Eye } from "lucide-react"
import Link from "next/link"

export default async function SellerAnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (profile?.role !== "seller") redirect("/")

  const { data: store } = await supabase.from("stores").select("*").eq("seller_id", user.id).single()
  if (!store) redirect("/seller/onboarding")

  // Get products with sales data
  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, total_sales, rating, total_reviews, stock")
    .eq("store_id", store.id)
    .order("total_sales", { ascending: false })

  // Get order items for revenue calculation
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("*, orders(created_at, status)")
    .eq("store_id", store.id)

  // Calculate monthly revenue
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const currentMonthRevenue =
    orderItems
      ?.filter((item) => {
        const orderDate = new Date(item.orders?.created_at)
        return (
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear &&
          item.orders?.status !== "cancelled"
        )
      })
      .reduce((sum, item) => sum + Number(item.price) * item.quantity, 0) || 0

  const lastMonthRevenue =
    orderItems
      ?.filter((item) => {
        const orderDate = new Date(item.orders?.created_at)
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
        return (
          orderDate.getMonth() === lastMonth &&
          orderDate.getFullYear() === lastMonthYear &&
          item.orders?.status !== "cancelled"
        )
      })
      .reduce((sum, item) => sum + Number(item.price) * item.quantity, 0) || 0

  const revenueGrowth = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

  // Calculate total stats
  const totalRevenue = orderItems?.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0) || 0
  const totalOrders = new Set(orderItems?.map((item) => item.order_id)).size
  const totalProducts = products?.length || 0
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

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
              <Link href="/seller/analytics" className="font-medium">
                Análises
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Análises</h1>
          <p className="text-muted-foreground">Acompanhe o desempenho da sua loja</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {currentMonthRevenue.toFixed(2)}</div>
              <div className="flex items-center text-xs mt-1">
                {revenueGrowth >= 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-green-600">+{revenueGrowth.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                    <span className="text-red-600">{revenueGrowth.toFixed(1)}%</span>
                  </>
                )}
                <span className="text-muted-foreground ml-1">vs mês anterior</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">Ticket médio: R$ {avgOrderValue.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {products?.filter((p) => p.stock < 10).length || 0} com estoque baixo
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{store.rating.toFixed(1)} ⭐</div>
              <p className="text-xs text-muted-foreground mt-1">{store.total_sales} vendas totais</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products && products.length > 0 ? (
                products.slice(0, 10).map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="h-8 w-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>R$ {Number(product.price).toFixed(2)}</span>
                          <span>•</span>
                          <span>{product.total_sales} vendas</span>
                          <span>•</span>
                          <span>
                            {product.rating.toFixed(1)} ⭐ ({product.total_reviews})
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        R$ {(Number(product.price) * product.total_sales).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">Estoque: {product.stock}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum produto ainda</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
