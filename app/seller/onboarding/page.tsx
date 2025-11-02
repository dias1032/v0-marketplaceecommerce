import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { createServerComponentClient } from "@/lib/supabase/server-component-client"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Vestti - Marketplace",
  description: "Marketplace de moda focado em sustentabilidade e pequenas marcas.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // 1. Uso do helper para obter a sessão no Server Component
  const supabase = createServerComponentClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // O session object pode ser passado via context se necessário,
  // mas aqui estamos apenas garantindo que o cliente Supabase seja inicializado
  // e o cookie de sessão seja lido/renovado no servidor.
  
  return (
    <html lang="pt-BR" className="dark">
      <head>
        {/* Inclui o script do Mercado Pago SDK */}
        <script src="https://sdk.mercadopago.com/js/v2"></script>
      </head>
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
