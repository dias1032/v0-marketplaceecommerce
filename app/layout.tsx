import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { createServerComponentClient } from "@/lib/supabase/server-component-client"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata = {
  title: "Vestti Marketplace",
  description: "A sua plataforma de moda e acessórios.",
  generator: "v0.app",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createServerComponentClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html lang="pt-BR" className="dark">
      <head>
        <script src="https://sdk.mercadopago.com/js/v2"></script>
      </head>
      <body className={`${inter.variable} font-sans flex flex-col min-h-screen`}>
        <Providers userId={user?.id}>
          <div className="flex flex-col min-h-screen">
            <Header user={user} />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  )
}
