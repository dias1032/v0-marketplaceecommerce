"use client"

import { Home, Grid3x3, ShoppingCart, User, Rss } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCart } from "@/components/cart-provider"

interface MobileNavProps {
  user?: {
    id: string
  } | null
}

export function MobileNav({ user }: MobileNavProps) {
  const pathname = usePathname()
  const { itemCount } = useCart()

  const isActive = (path: string) => pathname === path

  return (
    <div className="md:hidden mobile-nav-sticky">
      <Link href="/" className={`flex flex-col items-center gap-1 ${isActive("/") ? "text-primary" : "text-gray-600"}`}>
        <Home className="h-5 w-5" />
        <span className="text-xs font-medium">Início</span>
      </Link>
      {user && (
        <Link
          href="/feed"
          className={`flex flex-col items-center gap-1 ${isActive("/feed") ? "text-primary" : "text-gray-600"}`}
        >
          <Rss className="h-5 w-5" />
          <span className="text-xs">Feed</span>
        </Link>
      )}
      <Link
        href="/shop"
        className={`flex flex-col items-center gap-1 ${isActive("/shop") ? "text-primary" : "text-gray-600"}`}
      >
        <Grid3x3 className="h-5 w-5" />
        <span className="text-xs">Categorias</span>
      </Link>
      <Link
        href="/cart"
        className={`flex flex-col items-center gap-1 relative ${isActive("/cart") ? "text-primary" : "text-gray-600"}`}
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="text-xs">Carrinho</span>
        {itemCount > 0 && (
          <Badge className="absolute -top-1 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px]">
            {itemCount}
          </Badge>
        )}
      </Link>
      <Link
        href="/perfil"
        className={`flex flex-col items-center gap-1 ${isActive("/perfil") ? "text-primary" : "text-gray-600"}`}
      >
        <User className="h-5 w-5" />
        <span className="text-xs">Perfil</span>
      </Link>
    </div>
  )
}
