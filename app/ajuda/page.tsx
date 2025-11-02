import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, HelpCircle, MessageCircle, Mail, Phone } from "lucide-react"

export default function AjudaPage() {
  const faqs = [
    {
      question: "Como faço para rastrear meu pedido?",
      answer:
        "Você pode rastrear seu pedido acessando 'Meus Pedidos' no seu perfil. Clique no pedido desejado e você verá o código de rastreamento e o status atualizado da entrega.",
    },
    {
      question: "Qual é o prazo de entrega?",
      answer:
        "O prazo de entrega varia de acordo com sua localização e o método de envio escolhido. Geralmente, entregas são realizadas entre 5 a 15 dias úteis após a confirmação do pagamento.",
    },
    {
      question: "Como posso trocar ou devolver um produto?",
      answer:
        "Você tem até 7 dias após o recebimento para solicitar troca ou devolução. Acesse 'Meus Pedidos', selecione o item e clique em 'Solicitar Troca/Devolução'. O produto deve estar em perfeito estado.",
    },
    {
      question: "Quais formas de pagamento são aceitas?",
      answer:
        "Aceitamos cartões de crédito (Visa, Mastercard, Elo, American Express), PIX, e boleto bancário. Todas as transações são processadas de forma segura através do MercadoPago.",
    },
    {
      question: "Como me tornar um vendedor?",
      answer:
        "Para se tornar um vendedor, acesse seu perfil e clique em 'Vender na Vestti'. Preencha o formulário com seus dados e documentos. Nossa equipe analisará sua solicitação em até 48 horas.",
    },
    {
      question: "Como funciona o frete?",
      answer:
        "O valor do frete é calculado automaticamente no checkout com base no seu CEP e no peso dos produtos. Oferecemos diferentes opções de envio com prazos e valores variados.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>

        <div className="text-center mb-12">
          <HelpCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Central de Ajuda</h1>
          <p className="text-lg text-muted-foreground">Encontre respostas para as perguntas mais frequentes</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Perguntas Frequentes</CardTitle>
            <CardDescription>Respostas rápidas para as dúvidas mais comuns</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <MessageCircle className="h-8 w-8 mb-2 text-primary" />
              <CardTitle className="text-lg">Chat ao Vivo</CardTitle>
              <CardDescription>Fale com nosso suporte em tempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Iniciar Chat</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Mail className="h-8 w-8 mb-2 text-primary" />
              <CardTitle className="text-lg">E-mail</CardTitle>
              <CardDescription>Envie sua dúvida por e-mail</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-transparent" variant="outline" asChild>
                <a href="mailto:suporte@vestti.com.br">Enviar E-mail</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Phone className="h-8 w-8 mb-2 text-primary" />
              <CardTitle className="text-lg">Telefone</CardTitle>
              <CardDescription>Ligue para nosso suporte</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-transparent" variant="outline" asChild>
                <a href="tel:08007771234">0800 777 1234</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
