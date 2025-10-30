"use client"
import { useState, useEffect } from 'react'
import { Product } from '../types/product'

// Simple client-only cart hook with localStorage persistence
export function useCart() {
  const [items, setItems] = useState<Array<{ product: Product; qty: number }>>([])

  useEffect(() => {
    const raw = localStorage.getItem('vestti_cart')
    if (raw) setItems(JSON.parse(raw))
  }, [])

  useEffect(() => {
    localStorage.setItem('vestti_cart', JSON.stringify(items))
  }, [items])

  function add(product: Product, qty = 1) {
    setItems(prev => {
      const found = prev.find(p => p.product.id === product.id)
      if (found) return prev.map(p => p.product.id === product.id ? { ...p, qty: p.qty + qty } : p)
      return [...prev, { product, qty }]
    })
  }

  function remove(productId: string) {
    setItems(prev => prev.filter(p => p.product.id !== productId))
  }

  function clear() {
    setItems([])
  }

  const total_cents = items.reduce((s, it) => s + it.product.price_cents * it.qty, 0)

  return { items, add, remove, clear, total_cents }
}
