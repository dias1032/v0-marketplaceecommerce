import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Store, Users, Shield, Zap } from "lucide-react"

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Sobre a Vestti</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Conectando compradores e vendedores em um marketplace moderno, seguro e eficiente
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardContent className="pt-6">
              <Store className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">Nossa Missão</h3>
              <p className="text-muted-foreground">
                Democratizar o comércio eletrônico, oferecendo uma plataforma acessível para empreendedores de todos os
                tamanhos venderem seus produtos e alcançarem clientes em todo o Brasil.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">Nossa Visão</h3>
              <p className="text-muted-foreground">
                Ser o marketplace preferido dos brasileiros, reconhecido pela qualidade dos produtos, excelência no
                atendimento e pela confiança que inspiramos em nossa comunidade.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Por que escolher a Vestti?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Segurança</h3>
                <p className="text-muted-foreground">
                  Transações protegidas com criptografia de ponta e parceiros de pagamento confiáveis
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Zap className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Rapidez</h3>
                <p className="text-muted-foreground">
                  Processamento ágil de pedidos e múltiplas opções de envio para entrega rápida
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Suporte</h3>
                <p className="text-muted-foreground">
                  Equipe dedicada pronta para ajudar compradores e vendedores a qualquer momento
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Quer vender na Vestti?</h2>
            <p className="text-lg mb-6 opacity-90">
              Junte-se a milhares de vendedores que já confiam na nossa plataforma
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/trocar-conta">Começar a Vender</Link>
            </Button>
          </CardContent>
        </Card>

        <div className="mt-16 text-center text-muted-foreground">
          <p>Tem dúvidas? Entre em contato conosco</p>
          <div className="flex justify-center gap-4 mt-4">
            <Button variant="outline" asChild>
              <Link href="/ajuda">Central de Ajuda</Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="mailto:contato@vestti.com.br">Enviar E-mail</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
