import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, TrendingUp, Wallet, Users, Store, AlertCircle, MessageSquare, Tag } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Settings, FileText, BarChart3, Shield } from "lucide-react"
import { PendingVerifications } from "@/components/admin/pending-verifications"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/")
  }

  // Fetch financial data
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  // Last 24h revenue
  const { data: last24hTransactions } = await supabase
    .from("financial_transactions")
    .select("amount_cents, type")
    .gte("created_at", yesterday.toISOString())
    .in("type", ["order_commission", "subscription_fee", "vip_subscription", "ad_revenue"])

  const last24hRevenue = (last24hTransactions || []).reduce((sum, t) => sum + t.amount_cents, 0) / 100

  // Total revenue
  const { data: allTransactions } = await supabase
    .from("financial_transactions")
    .select("amount_cents, type")
    .in("type", ["order_commission", "subscription_fee", "vip_subscription", "ad_revenue"])

  const totalRevenue = (allTransactions || []).reduce((sum, t) => sum + t.amount_cents, 0) / 100

  // Revenue breakdown
  const revenueByType = (allTransactions || []).reduce(
    (acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + t.amount_cents / 100
      return acc
    },
    {} as Record<string, number>,
  )

  // Current balance (revenue - withdrawals)
  const { data: withdrawals } = await supabase
    .from("financial_transactions")
    .select("amount_cents")
    .eq("type", "withdrawal")

  const totalWithdrawals = (withdrawals || []).reduce((sum, t) => sum + Math.abs(t.amount_cents), 0) / 100
  const currentBalance = totalRevenue - totalWithdrawals

  // User stats
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { count: totalStores } = await supabase.from("stores").select("*", { count: "exact", head: true })

  const { count: verifiedStores } = await supabase
    .from("stores")
    .select("*", { count: "exact", head: true })
    .eq("is_verified", true)

  // Pending verifications
  const { count: pendingVerifications } = await supabase
    .from("seller_verifications")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  // Pending reports
  const { count: pendingReports } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  // Open support tickets
  const { count: openTickets } = await supabase
    .from("support_tickets")
    .select("*", { count: "exact", head: true })
    .in("status", ["open", "in_progress"])

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground">Visão geral e gerenciamento do Vestti</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/cms">
              <Settings className="h-4 w-4 mr-2" />
              CMS
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/transactions">
              <BarChart3 className="h-4 w-4 mr-2" />
              Transações
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/audit-logs">
              <Shield className="h-4 w-4 mr-2" />
              Auditoria
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/banners">
              <FileText className="h-4 w-4 mr-2" />
              Banners
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="sellers">Lojistas</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="verifications">
            Verificações {pendingVerifications ? `(${pendingVerifications})` : ""}
          </TabsTrigger>
          <TabsTrigger value="reports">Denúncias {pendingReports ? `(${pendingReports})` : ""}</TabsTrigger>
          <TabsTrigger value="support">Suporte {openTickets ? `(${openTickets})` : ""}</TabsTrigger>
          <TabsTrigger value="ads">Anúncios</TabsTrigger>
          <TabsTrigger value="coupons">Cupons</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Financial Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Últimas 24h</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {last24hRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Movimentação do dia</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Desde o início</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {currentBalance.toFixed(2)}</div>
                <Link href="/admin/cashout" className="text-xs text-primary hover:underline">
                  Solicitar saque →
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">{totalStores || 0} lojas ativas</p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Origem da Receita</CardTitle>
              <CardDescription>Divisão por tipo de monetização</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Comissões de Vendas</span>
                  <span className="text-sm font-bold">R$ {(revenueByType.order_commission || 0).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Planos de Lojista</span>
                  <span className="text-sm font-bold">R$ {(revenueByType.subscription_fee || 0).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Assinaturas VIP</span>
                  <span className="text-sm font-bold">R$ {(revenueByType.vip_subscription || 0).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Anúncios</span>
                  <span className="text-sm font-bold">R$ {(revenueByType.ad_revenue || 0).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin?tab=verifications">
              <Card className="hover:bg-accent cursor-pointer transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verificações Pendentes</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingVerifications || 0}</div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin?tab=reports">
              <Card className="hover:bg-accent cursor-pointer transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Denúncias Pendentes</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingReports || 0}</div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin?tab=support">
              <Card className="hover:bg-accent cursor-pointer transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tickets Abertos</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{openTickets || 0}</div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin?tab=coupons">
              <Card className="hover:bg-accent cursor-pointer transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cupons Ativos</CardTitle>
                  <Tag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="sellers">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Lojistas</CardTitle>
              <CardDescription>Buscar e gerenciar lojas por @username</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Funcionalidade em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Clientes</CardTitle>
              <CardDescription>Buscar e gerenciar clientes por @username</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Funcionalidade em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verifications">
          <PendingVerifications />
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Denúncias</CardTitle>
              <CardDescription>Analisar e resolver denúncias de usuários</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Funcionalidade em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>Suporte ao Cliente</CardTitle>
              <CardDescription>Chat de suporte com clientes e lojistas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Funcionalidade em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Anúncios</CardTitle>
              <CardDescription>Anúncios internos e externos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Funcionalidade em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coupons">
          <Card>
            <CardHeader>
              <CardTitle>Cupons Gerais</CardTitle>
              <CardDescription>Criar cupons válidos em todo o site</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Funcionalidade em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
