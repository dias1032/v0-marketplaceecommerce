"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart, User, Heart, Menu } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/components/cart-provider"
import { UserNav } from "@/components/user-nav"
import { NotificationsPopover } from "@/components/notifications-popover"
import { ChatPopover } from "@/components/chat-popover"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface HeaderProps {
  user?: {
    id: string
    name: string
    email: string
    avatar: string | null
    username: string | null
    role: string
  } | null
}

export function Header({ user }: HeaderProps) {
  const { itemCount } = useCart()
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="container">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-vestti.png" alt="Vestti" width={32} height={32} className="h-8 w-8" />
            <span className="text-xl font-bold hidden sm:inline">Vestti</span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
              />
            </div>
          </form>

          <nav className="hidden md:flex items-center gap-2">
            {user && (
              <>
                <NotificationsPopover userId={user.id} />
                <ChatPopover userId={user.id} />
              </>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="relative">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {itemCount}
                  </Badge>
                )}
              </Link>
            </Button>
            {user ? (
              <UserNav user={user} />
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}
          </nav>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="hidden md:flex items-center gap-6 py-2 text-sm border-t overflow-x-auto">
          {user && (
            <Link href="/feed" className="whitespace-nowrap hover:text-primary font-medium">
              Feed
            </Link>
          )}
          <Link href="/shop?category=novidades" className="whitespace-nowrap hover:text-primary font-medium">
            Novidades
          </Link>
          <Link href="/shop?category=feminino" className="whitespace-nowrap hover:text-primary">
            Feminino
          </Link>
          <Link href="/shop?category=masculino" className="whitespace-nowrap hover:text-primary">
            Masculino
          </Link>
          <Link href="/shop?category=acessorios" className="whitespace-nowrap hover:text-primary">
            Acessórios
          </Link>
          <Link href="/shop?category=calcados" className="whitespace-nowrap hover:text-primary">
            Calçados
          </Link>
          <Link href="/shop?sale=true" className="whitespace-nowrap hover:text-primary text-primary font-medium">
            🔥 Ofertas
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
