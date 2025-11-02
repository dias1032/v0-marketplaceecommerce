"use client"

import type React from "react"

import { CartProvider } from "@/components/cart-provider"
import { ThemeProvider } from "@/components/theme-provider"

interface ProvidersProps {
  children: React.ReactNode
  userId?: string
}

export function Providers({ children, userId }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <CartProvider userId={userId}>{children}</CartProvider>
    </ThemeProvider>
  )
}
