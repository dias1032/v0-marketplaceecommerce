import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              V
            </div>
            <span className="text-xl font-bold">Vestti</span>
          </Link>
        </div>
      </header>

      <div className="container py-12 max-w-4xl">
        <div className="text-center mb-12">
          <FileText className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Termos de Uso</h1>
          <p className="text-muted-foreground">Última atualização: Janeiro de 2025</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Aceitação dos Termos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Ao acessar e usar a plataforma Vestti, você concorda em cumprir e estar vinculado aos seguintes termos e
                condições de uso. Se você não concordar com qualquer parte destes termos, não deverá usar nossos
                serviços.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Uso da Plataforma</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>A Vestti é um marketplace que conecta compradores e vendedores. Você concorda em:</p>
              <ul>
                <li>Fornecer informações precisas e atualizadas</li>
                <li>Manter a segurança de sua conta e senha</li>
                <li>Não usar a plataforma para atividades ilegais ou não autorizadas</li>
                <li>Respeitar os direitos de propriedade intelectual</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Compras e Pagamentos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Todas as transações são processadas de forma segura através do Mercado Pago. Os preços estão sujeitos a
                alterações sem aviso prévio. A Vestti cobra uma comissão sobre cada venda realizada na plataforma.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Vendedores</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>Os vendedores são responsáveis por:</p>
              <ul>
                <li>Fornecer descrições precisas dos produtos</li>
                <li>Cumprir os prazos de envio</li>
                <li>Responder às dúvidas dos compradores</li>
                <li>Processar devoluções conforme a política</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Política de Devolução</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Os compradores têm até 30 dias após o recebimento para solicitar devolução ou troca. O produto deve
                estar em perfeitas condições, sem uso e com embalagem original.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Limitação de Responsabilidade</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                A Vestti atua como intermediária entre compradores e vendedores. Não nos responsabilizamos por produtos
                defeituosos, atrasos na entrega ou disputas entre as partes, mas oferecemos suporte para resolução de
                conflitos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Alterações nos Termos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor
                imediatamente após a publicação na plataforma.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Contato</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>Para dúvidas sobre estes termos, entre em contato através do email: juridico@vestti.com.br</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
