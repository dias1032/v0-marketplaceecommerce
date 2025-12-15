"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  storeId: string
  storeName: string
  stock: number
  slug: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "id">) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children, userId }: { children: ReactNode; userId?: string }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = () => {
    try {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error("Error loading cart:", error)
    }
  }

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems)
    localStorage.setItem("cart", JSON.stringify(newItems))
  }

  const addItem = (item: Omit<CartItem, "id">) => {
    const existingItem = items.find((i) => i.productId === item.productId)

    if (existingItem) {
      const newQuantity = Math.min(existingItem.quantity + item.quantity, item.stock)
      updateQuantity(item.productId, newQuantity)
    } else {
      const newItem: CartItem = {
        ...item,
        id: crypto.randomUUID(),
      }
      saveCart([...items, newItem])
    }
  }

  const removeItem = (productId: string) => {
    saveCart(items.filter((item) => item.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return

    const item = items.find((i) => i.productId === productId)
    if (!item) return

    if (quantity > item.stock) return

    saveCart(items.map((item) => (item.productId === productId ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    saveCart([])
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
