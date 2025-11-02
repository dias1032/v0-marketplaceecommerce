import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { HelpCircle, Package, CreditCard, Truck, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function HelpPage() {
  const faqs = [
    {
      question: "Como faço um pedido?",
      answer:
        "Para fazer um pedido, navegue pelos produtos, adicione os itens desejados ao carrinho e clique em 'Finalizar Compra'. Você será direcionado para preencher seus dados de entrega e pagamento.",
    },
    {
      question: "Quais formas de pagamento são aceitas?",
      answer:
        "Aceitamos cartão de crédito (até 12x sem juros), PIX e boleto bancário. O pagamento é processado de forma segura através do Mercado Pago.",
    },
    {
      question: "Quanto tempo demora a entrega?",
      answer:
        "O prazo de entrega varia de acordo com sua localização e o vendedor. Geralmente, os pedidos são entregues entre 5 a 15 dias úteis. Você pode acompanhar seu pedido em tempo real.",
    },
    {
      question: "Como faço para trocar ou devolver um produto?",
      answer:
        "Você tem até 30 dias após o recebimento para solicitar troca ou devolução. Entre em contato com o vendedor através do chat ou acesse 'Meus Pedidos' e clique em 'Solicitar Devolução'.",
    },
    {
      question: "O que é o programa de vendedores verificados?",
      answer:
        "Vendedores verificados passaram por um processo de validação de documentos e têm histórico comprovado de boas práticas. Eles recebem um selo azul de verificação.",
    },
    {
      question: "Como me tornar um vendedor?",
      answer:
        "Acesse seu perfil e clique em 'Tornar-me Vendedor'. Você precisará fornecer seus dados pessoais, CPF/CNPJ e documentos para verificação. Após aprovação, poderá criar sua loja.",
    },
  ]

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
          <HelpCircle className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Central de Ajuda</h1>
          <p className="text-lg text-muted-foreground">Encontre respostas para as perguntas mais frequentes</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold text-sm">Pedidos</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <CreditCard className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold text-sm">Pagamento</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Truck className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold text-sm">Entrega</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <RefreshCw className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold text-sm">Trocas</h3>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Perguntas Frequentes</CardTitle>
            <CardDescription>Respostas para as dúvidas mais comuns</CardDescription>
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

        <Card className="mt-6">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Não encontrou o que procurava?</h3>
            <p className="text-sm text-muted-foreground mb-4">Entre em contato com nossa equipe de suporte</p>
            <Button asChild>
              <Link href="/contact">Falar com Suporte</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
