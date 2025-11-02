import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8">Termos de Uso</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>1. Aceitação dos Termos</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Ao acessar e usar a plataforma Vestti, você concorda em cumprir e estar vinculado aos seguintes termos e
              condições de uso. Se você não concordar com qualquer parte destes termos, não deverá usar nossos serviços.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>2. Uso da Plataforma</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              A Vestti é um marketplace que conecta compradores e vendedores. Você concorda em usar a plataforma apenas
              para fins legais e de acordo com estes Termos de Uso.
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Não usar a plataforma para atividades ilegais ou fraudulentas</li>
              <li>Não publicar conteúdo ofensivo, difamatório ou que viole direitos de terceiros</li>
              <li>Não tentar acessar áreas restritas do sistema sem autorização</li>
              <li>Manter a confidencialidade de suas credenciais de acesso</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>3. Cadastro e Conta</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Para usar determinados recursos da plataforma, você deve criar uma conta. Você é responsável por manter a
              confidencialidade de sua senha e por todas as atividades que ocorram em sua conta.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>4. Compras e Pagamentos</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Todas as transações são processadas de forma segura através de nossos parceiros de pagamento. Os preços
              estão sujeitos a alterações sem aviso prévio. Você concorda em fornecer informações de pagamento precisas
              e completas.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>5. Vendedores</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Vendedores devem fornecer descrições precisas de seus produtos, cumprir prazos de envio e manter padrões
              de qualidade. A Vestti se reserva o direito de remover produtos ou suspender contas que violem nossas
              políticas.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>6. Propriedade Intelectual</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Todo o conteúdo da plataforma, incluindo textos, gráficos, logos e software, é propriedade da Vestti ou de
              seus licenciadores e está protegido por leis de direitos autorais.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>7. Limitação de Responsabilidade</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              A Vestti não se responsabiliza por danos diretos, indiretos, incidentais ou consequenciais resultantes do
              uso ou incapacidade de usar a plataforma. Atuamos como intermediários entre compradores e vendedores.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Alterações nos Termos</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor
              imediatamente após a publicação na plataforma. O uso continuado da plataforma após as alterações constitui
              aceitação dos novos termos.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-sm text-muted-foreground">
          <p>Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
        </div>
      </div>
    </div>
  )
}
