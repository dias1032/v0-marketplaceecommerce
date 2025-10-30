"use client"
import Link from 'next/link'
import React from 'react'

interface NavbarProps {
  // In a real app you would pass user and logout handler
  user?: { id: string; email?: string; role?: string } | null
}

// Client component: interactive navigation, reflects auth state
export default function Navbar({ user }: NavbarProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="text-xl font-semibold">Vestti Marketplace</Link>
        <nav className="flex gap-4 items-center">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/produtos/1" className="hover:underline">Produtos</Link>
          <Link href="/carrinho" className="hover:underline">Carrinho</Link>
          {user ? (
            <>
              <Link href="/conta" className="hover:underline">Minha Conta</Link>
              {user.role === 'vendor' && <Link href="/vendedor/dashboard" className="hover:underline">Vendedor</Link>}
              {user.role === 'admin' && <Link href="/admin/dashboard" className="hover:underline">Admin</Link>}
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm px-3 py-1 border rounded">Login</Link>
              <Link href="/register" className="text-sm px-3 py-1 bg-blue-600 text-white rounded">Cadastre-se</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
