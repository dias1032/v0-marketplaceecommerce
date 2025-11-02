import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Star,
  Plus,
  Settings,
  BarChart3,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"

export default async function SellerDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "seller") {
    redirect("/")
  }

  // Get seller's store
  const { data: store } = await supabase.from("stores").select("*").eq("seller_id", user.id).single()

  if (!store) {
    redirect("/seller/onboarding")
  }

  // Get statistics
  const { data: products } = await supabase.from("products").select("id, stock, is_active").eq("store_id", store.id)

  const { data: orders } = await supabase
    .from("order_items")
    .select(
      `
      *,
      orders (
        status,
        created_at
      )
    `,
    )
    .eq("store_id", store.id)

  // Calculate stats
  const totalProducts = products?.length || 0
  const activeProducts = products?.filter((p) => p.is_active).length || 0
  const lowStockProducts = products?.filter((p) => p.stock < 10).length || 0

  const totalOrders = orders?.length || 0
  const pendingOrders = orders?.filter((o) => o.orders?.status === "pending" || o.orders?.status === "paid").length || 0
  const totalRevenue = orders?.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0) || 0

  // Recent orders
  const recentOrders = orders
    ?.sort((a, b) => new Date(b.orders?.created_at).getTime() - new Date(a.orders?.created_at).getTime())
    .slice(0, 5)

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
              <Link href="/seller/dashboard" className="font-medium">
                Dashboard
              </Link>
              <Link href="/seller/products" className="text-muted-foreground hover:text-foreground">
                Produtos
              </Link>
              <Link href="/seller/orders" className="text-muted-foreground hover:text-foreground">
                Pedidos
              </Link>
              <Link href="/seller/analytics" className="text-muted-foreground hover:text-foreground">
                Análises
              </Link>
              <Link href="/seller/financials" className="text-muted-foreground hover:text-foreground">
                Financeiro
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/store/${store.slug}`}>Ver Loja</Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/seller/settings">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Store Info Banner */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                  <Package className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{store.name}</h2>
                    {store.is_verified && (
                      <Badge variant="secondary" className="bg-blue-500 text-white">
                        Verificado
                      </Badge>
                    )}
                    <Badge
                      variant="secondary"
                      className={
                        store.subscription_plan === "premium"
                          ? "bg-yellow-500 text-white"
                          : store.subscription_plan === "standard"
                            ? "bg-green-500 text-white"
                            : ""
                      }
                    >
                      {store.subscription_plan === "free"
                        ? "Grátis"
                        : store.subscription_plan === "standard"
                          ? "Standard"
                          : "Premium"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {store.rating.toFixed(1)}
                    </span>
                    <span>{store.total_sales} vendas</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {store.subscription_plan === "free" && (
                  <Button asChild>
                    <Link href="/seller/plans">Fazer Upgrade</Link>
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link href="/seller/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">+20.1% em relação ao mês passado</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">{pendingOrders} pendentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {activeProducts} ativos, {lowStockProducts} com estoque baixo
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.2%</div>
              <p className="text-xs text-muted-foreground">+0.5% em relação ao mês passado</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pedidos Recentes</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/seller/orders">Ver Todos</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders && recentOrders.length > 0 ? (
                  recentOrders.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Pedido #{item.order_id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.orders?.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">R$ {(Number(item.price) * item.quantity).toFixed(2)}</p>
                        <Badge variant="secondary" className="text-xs">
                          {item.orders?.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhum pedido ainda</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Button asChild className="w-full justify-start">
                  <Link href="/seller/products/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Produto
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start bg-transparent">
                  <Link href="/seller/orders">
                    <Package className="h-4 w-4 mr-2" />
                    Gerenciar Pedidos
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start bg-transparent">
                  <Link href="/seller/analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Ver Análises
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start bg-transparent">
                  <Link href="/seller/messages">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Mensagens
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start bg-transparent">
                  <Link href="/seller/promotions">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Criar Promoção
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start bg-transparent">
                  <Link href="/seller/reviews">
                    <Star className="h-4 w-4 mr-2" />
                    Ver Avaliações
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start bg-transparent">
                  <Link href="/seller/financials">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Financeiro
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
