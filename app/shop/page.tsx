import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Search, ShoppingCart, User, Heart, Star, Filter, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { AddictiveProductGrid } from "@/components/addictive-product-grid"

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; sort?: string; min?: string; max?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query
  let query = supabase
    .from("products")
    .select(
      `
      *,
      stores (
        name,
        is_verified,
        subscription_plan
      )
    `,
    )
    .eq("is_active", true)

  // Apply filters
  if (params.search) {
    query = query.ilike("name", `%${params.search}%`)
  }

  if (params.category) {
    const { data: category } = await supabase.from("categories").select("id").eq("slug", params.category).single()
    if (category) {
      query = query.eq("category_id", category.id)
    }
  }

  if (params.min) {
    query = query.gte("price", Number.parseFloat(params.min))
  }

  if (params.max) {
    query = query.lte("price", Number.parseFloat(params.max))
  }

  // Apply sorting
  switch (params.sort) {
    case "price-asc":
      query = query.order("price", { ascending: true })
      break
    case "price-desc":
      query = query.order("price", { ascending: false })
      break
    case "rating":
      query = query.order("rating", { ascending: false })
      break
    case "sales":
      query = query.order("total_sales", { ascending: false })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  const { data: products } = await query.limit(48)

  // Fetch categories for filter
  const { data: categories } = await supabase.from("categories").select("*").is("parent_id", null)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              V
            </div>
            <span className="text-xl font-bold">Vestti</span>
          </Link>

          <div className="flex-1 max-w-2xl mx-8">
            <form action="/shop" method="get">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  name="search"
                  defaultValue={params.search}
                  placeholder="Buscar produtos, lojas..."
                  className="w-full rounded-lg border bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </form>
          </div>

          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/auth/login">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <div className="container py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="w-64 shrink-0 space-y-6">
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </h3>

              {/* Categories */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Categorias</h4>
                {categories?.map((category) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <Checkbox id={category.slug} />
                    <Label htmlFor={category.slug} className="text-sm cursor-pointer">
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>

              {/* Price Range */}
              <div className="space-y-3 pt-6">
                <h4 className="text-sm font-medium">Faixa de Preço</h4>
                <div className="space-y-4">
                  <Slider defaultValue={[0, 1000]} max={1000} step={10} />
                  <div className="flex items-center gap-2 text-sm">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full rounded border px-2 py-1 text-sm"
                      defaultValue={params.min}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full rounded border px-2 py-1 text-sm"
                      defaultValue={params.max}
                    />
                  </div>
                </div>
              </div>

              {/* Store Type */}
              <div className="space-y-3 pt-6">
                <h4 className="text-sm font-medium">Tipo de Loja</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="verified" />
                    <Label htmlFor="verified" className="text-sm cursor-pointer">
                      Lojas Verificadas
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="premium" />
                    <Label htmlFor="premium" className="text-sm cursor-pointer">
                      Lojas Premium
                    </Label>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-3 pt-6">
                <h4 className="text-sm font-medium">Avaliação</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <Checkbox id={`rating-${rating}`} />
                      <Label htmlFor={`rating-${rating}`} className="text-sm cursor-pointer flex items-center gap-1">
                        {Array.from({ length: rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-muted-foreground">& acima</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {products?.length || 0} produtos encontrados
                {params.search && ` para "${params.search}"`}
              </p>
              <div className="flex items-center gap-4">
                <Select defaultValue={params.sort || "newest"}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mais Recentes</SelectItem>
                    <SelectItem value="price-asc">Menor Preço</SelectItem>
                    <SelectItem value="price-desc">Maior Preço</SelectItem>
                    <SelectItem value="rating">Melhor Avaliação</SelectItem>
                    <SelectItem value="sales">Mais Vendidos</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Products */}
            {products && products.length > 0 ? (
              <AddictiveProductGrid initialProducts={products} hasMore={products.length >= 48} />
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">Nenhum produto encontrado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: any }) {
  const images = Array.isArray(product.images) ? product.images : []
  const mainImage = images[0] || "/diverse-products-still-life.png"
  const discount = product.compare_at_price ? Math.round((1 - product.price / product.compare_at_price) * 100) : 0

  return (
    <Link href={`/product/${product.slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={mainImage || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
            {discount > 0 && <Badge className="absolute top-2 left-2 bg-destructive">-{discount}%</Badge>}
            {product.stores?.is_verified && <Badge className="absolute top-2 right-2 bg-blue-500">✓ Verificado</Badge>}
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
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
