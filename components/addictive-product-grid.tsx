"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Star } from "lucide-react"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compare_at_price?: number
  images: string[]
  rating: number
  total_reviews: number
  stores?: {
    name: string
    is_verified: boolean
  }
}

interface AddictiveProductGridProps {
  initialProducts: Product[]
  hasMore?: boolean
}

export function AddictiveProductGrid({ initialProducts, hasMore = false }: AddictiveProductGridProps) {
  const [products, setProducts] = useState(initialProducts)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const observerRef = useRef<HTMLDivElement>(null)

  // Infinite scroll
  useEffect(() => {
    if (!hasMore || loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 },
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loading, page])

  const loadMore = async () => {
    setLoading(true)
    // Simulate API call - replace with actual fetch
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setPage((p) => p + 1)
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="addictive-product-grid">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>

      {hasMore && (
        <div ref={observerRef} className="flex justify-center py-8">
          {loading && <div className="text-sm text-muted-foreground">Carregando mais produtos...</div>}
        </div>
      )}
    </div>
  )
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const images = Array.isArray(product.images) ? product.images : []
  const mainImage = images[0] || "/placeholder.svg"
  const discount = product.compare_at_price ? Math.round((1 - product.price / product.compare_at_price) * 100) : 0

  return (
    <Link href={`/product/${product.slug}`} className="product-card-link">
      <Card className="product-card group overflow-hidden hover:shadow-xl transition-all duration-300">
        <CardContent className="p-0">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={mainImage || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {discount > 0 && <Badge className="absolute top-2 left-2 bg-destructive">-{discount}%</Badge>}
            {product.stores?.is_verified && <Badge className="absolute top-2 right-2 bg-blue-500">✓ Verificado</Badge>}
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.preventDefault()
                // Add to wishlist logic
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-3 space-y-2">
            <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span>({product.total_reviews})</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold">R$ {product.price.toFixed(2)}</span>
              {product.compare_at_price && (
                <span className="text-xs text-muted-foreground line-through">
                  R$ {product.compare_at_price.toFixed(2)}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{product.stores?.name}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
