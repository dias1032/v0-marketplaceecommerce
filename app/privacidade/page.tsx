import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>1. Informações que Coletamos</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>Coletamos diferentes tipos de informações para fornecer e melhorar nossos serviços:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>
                <strong>Informações de Cadastro:</strong> nome, e-mail, CPF/CNPJ, telefone, endereço
              </li>
              <li>
                <strong>Informações de Pagamento:</strong> dados de cartão de crédito (processados por parceiros
                seguros)
              </li>
              <li>
                <strong>Informações de Navegação:</strong> endereço IP, tipo de navegador, páginas visitadas
              </li>
              <li>
                <strong>Informações de Transação:</strong> histórico de compras, produtos visualizados, carrinho
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>2. Como Usamos suas Informações</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>Utilizamos as informações coletadas para:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Processar e gerenciar suas compras e vendas</li>
              <li>Enviar confirmações de pedidos e atualizações de entrega</li>
              <li>Melhorar a experiência do usuário e personalizar conteúdo</li>
              <li>Prevenir fraudes e garantir a segurança da plataforma</li>
              <li>Enviar comunicações de marketing (com seu consentimento)</li>
              <li>Cumprir obrigações legais e regulatórias</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>3. Compartilhamento de Informações</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>Podemos compartilhar suas informações com:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>
                <strong>Vendedores:</strong> informações necessárias para processar e entregar seus pedidos
              </li>
              <li>
                <strong>Processadores de Pagamento:</strong> MercadoPago e outros parceiros de pagamento
              </li>
              <li>
                <strong>Transportadoras:</strong> informações de entrega para envio de produtos
              </li>
              <li>
                <strong>Autoridades:</strong> quando exigido por lei ou para proteger nossos direitos
              </li>
            </ul>
            <p className="mt-2">Nunca vendemos suas informações pessoais para terceiros.</p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>4. Segurança dos Dados</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso
              não autorizado, alteração, divulgação ou destruição. Isso inclui:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Criptografia SSL/TLS para transmissão de dados</li>
              <li>Armazenamento seguro em servidores protegidos</li>
              <li>Controles de acesso rigorosos</li>
              <li>Monitoramento contínuo de segurança</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>5. Seus Direitos (LGPD)</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Confirmar a existência de tratamento de seus dados</li>
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados</li>
              <li>Revogar o consentimento para tratamento de dados</li>
              <li>Solicitar a portabilidade de seus dados</li>
            </ul>
            <p className="mt-2">
              Para exercer seus direitos, entre em contato através do e-mail: privacidade@vestti.com.br
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>6. Cookies e Tecnologias Similares</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso da plataforma e
              personalizar conteúdo. Você pode gerenciar suas preferências de cookies nas configurações do navegador.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>7. Retenção de Dados</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Mantemos suas informações pessoais pelo tempo necessário para cumprir as finalidades descritas nesta
              política, a menos que um período de retenção mais longo seja exigido ou permitido por lei.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Alterações nesta Política</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre alterações
              significativas por e-mail ou através de um aviso em nossa plataforma.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-sm text-muted-foreground">
          <p>Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
          <p className="mt-2">
            Para dúvidas sobre esta política, entre em contato:{" "}
            <a href="mailto:privacidade@vestti.com.br" className="text-primary hover:underline">
              privacidade@vestti.com.br
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
