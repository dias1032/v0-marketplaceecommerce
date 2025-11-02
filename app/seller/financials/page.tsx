import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, TrendingUp, ArrowDownToLine, Clock, CheckCircle, XCircle, CreditCard } from "lucide-react"
import Link from "next/link"

export default async function SellerFinancialsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (profile?.role !== "seller") redirect("/")

  const { data: store } = await supabase.from("stores").select("*").eq("seller_id", user.id).single()
  if (!store) redirect("/seller/onboarding")

  // Get transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false })
    .limit(50)

  // Calculate stats
  const totalEarnings =
    transactions
      ?.filter((t) => t.type === "sale" && t.status === "completed")
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0
  const totalCommissions =
    transactions
      ?.filter((t) => t.type === "commission" && t.status === "completed")
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0
  const totalCashouts =
    transactions
      ?.filter((t) => t.type === "cashout" && t.status === "completed")
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0
  const pendingCashouts =
    transactions
      ?.filter((t) => t.type === "cashout" && t.status === "pending")
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0

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
              <Link href="/seller/financials" className="font-medium">
                Financeiro
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Financeiro</h1>
          <p className="text-muted-foreground">Gerencie seus ganhos e solicite saques</p>
        </div>

        {/* Balance Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ {Number(store.balance || 0).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Disponível para saque</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Pendente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                R$ {Number(store.pending_balance || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Aguardando compensação</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ganho</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Comissões: R$ {totalCommissions.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Cashout Form */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Solicitar Saque</CardTitle>
            </CardHeader>
            <CardContent>
              <form action="/api/cashout" method="POST" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="10"
                    max={Number(store.balance || 0)}
                    placeholder="R$ 0,00"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Valor mínimo: R$ 10,00</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_method">Método de Pagamento</Label>
                  <select
                    id="payment_method"
                    name="payment_method"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="pix">PIX</option>
                    <option value="bank_transfer">Transferência Bancária</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pix_key">Chave PIX / Dados Bancários</Label>
                  <Input
                    id="pix_key"
                    name="pix_key"
                    type="text"
                    placeholder="Digite sua chave PIX ou dados bancários"
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <ArrowDownToLine className="h-4 w-4 mr-2" />
                  Solicitar Saque
                </Button>

                <p className="text-xs text-muted-foreground text-center">Saques são processados em até 3 dias úteis</p>
              </form>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions && transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            transaction.type === "sale"
                              ? "bg-green-100 text-green-600"
                              : transaction.type === "cashout"
                                ? "bg-blue-100 text-blue-600"
                                : transaction.type === "commission"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {transaction.type === "sale" ? (
                            <TrendingUp className="h-5 w-5" />
                          ) : transaction.type === "cashout" ? (
                            <ArrowDownToLine className="h-5 w-5" />
                          ) : (
                            <CreditCard className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {transaction.type === "sale"
                              ? "Venda"
                              : transaction.type === "cashout"
                                ? "Saque"
                                : transaction.type === "commission"
                                  ? "Comissão"
                                  : transaction.type === "subscription"
                                    ? "Assinatura"
                                    : transaction.type === "ad_spend"
                                      ? "Anúncio"
                                      : "Reembolso"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                          {transaction.description && (
                            <p className="text-xs text-muted-foreground">{transaction.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-medium ${
                            transaction.type === "sale"
                              ? "text-green-600"
                              : transaction.type === "cashout" ||
                                  transaction.type === "commission" ||
                                  transaction.type === "subscription" ||
                                  transaction.type === "ad_spend"
                                ? "text-red-600"
                                : ""
                          }`}
                        >
                          {transaction.type === "sale" ? "+" : "-"}R$ {Number(transaction.amount).toFixed(2)}
                        </p>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            transaction.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : transaction.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : transaction.status === "failed"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {transaction.status === "completed" ? (
                            <CheckCircle className="h-3 w-3 mr-1 inline" />
                          ) : transaction.status === "pending" ? (
                            <Clock className="h-3 w-3 mr-1 inline" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1 inline" />
                          )}
                          {transaction.status === "completed"
                            ? "Concluído"
                            : transaction.status === "pending"
                              ? "Pendente"
                              : transaction.status === "failed"
                                ? "Falhou"
                                : "Cancelado"}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhuma transação ainda</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
