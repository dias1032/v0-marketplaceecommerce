"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle, ArrowLeft, HelpCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function CheckoutFailurePage() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get("payment_id")

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 p-3">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Pagamento Recusado</CardTitle>
          <CardDescription>Não foi possível processar seu pagamento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ID do Pagamento:</span>
              <span className="font-mono">{paymentId || "N/A"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <span className="text-red-600 font-semibold">Recusado</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-semibold">Possíveis Motivos</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Saldo insuficiente</li>
                  <li>Dados do cartão incorretos</li>
                  <li>Limite de crédito excedido</li>
                  <li>Cartão bloqueado ou vencido</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/checkout">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/cart">Voltar ao Carrinho</Link>
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Se o problema persistir, entre em contato com seu banco ou tente outro método de pagamento.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
