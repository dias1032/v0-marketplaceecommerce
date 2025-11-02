"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

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
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Load cart on mount
  useEffect(() => {
    loadCart()
  }, [userId])

  const loadCart = async () => {
    try {
      if (userId) {
        // Load from database for logged-in users
        const { data } = await supabase
          .from("cart_items")
          .select(
            `
            *,
            products (
              name,
              price,
              images,
              stock,
              slug,
              stores (
                id,
                name
              )
            )
          `,
          )
          .eq("user_id", userId)

        if (data) {
          const cartItems: CartItem[] = data.map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            name: item.products.name,
            price: item.products.price,
            quantity: item.quantity,
            image: Array.isArray(item.products.images) ? item.products.images[0] : "/placeholder.svg",
            storeId: item.products.stores.id,
            storeName: item.products.stores.name,
            stock: item.products.stock,
            slug: item.products.slug,
          }))
          setItems(cartItems)
        }
      } else {
        // Load from localStorage for guests
        const savedCart = localStorage.getItem("cart")
        if (savedCart) {
          setItems(JSON.parse(savedCart))
        }
      }
    } catch (error) {
      console.error("Error loading cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveCart = async (newItems: CartItem[]) => {
    setItems(newItems)

    if (userId) {
      // Save to database for logged-in users
      try {
        // Remove all existing items
        await supabase.from("cart_items").delete().eq("user_id", userId)

        // Insert new items
        if (newItems.length > 0) {
          await supabase.from("cart_items").insert(
            newItems.map((item) => ({
              user_id: userId,
              product_id: item.productId,
              quantity: item.quantity,
            })),
          )
        }
      } catch (error) {
        console.error("Error saving cart to database:", error)
      }
    } else {
      // Save to localStorage for guests
      localStorage.setItem("cart", JSON.stringify(newItems))
    }
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
