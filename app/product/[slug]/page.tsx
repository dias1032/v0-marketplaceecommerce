import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  ShoppingCart,
  User,
  Heart,
  Star,
  Truck,
  Shield,
  MessageCircle,
  Store,
  CheckCircle2,
  Plus,
  Minus,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch product
  const { data: product } = await supabase
    .from("products")
    .select(
      `
      *,
      stores (
        id,
        name,
        slug,
        is_verified,
        subscription_plan,
        rating,
        total_sales
      ),
      categories (
        name,
        slug
      )
    `,
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (!product) {
    notFound()
  }

  // Fetch reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
      *,
      profiles (
        full_name,
        avatar_url
      )
    `,
    )
    .eq("product_id", product.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Fetch related products
  const { data: relatedProducts } = await supabase
    .from("products")
    .select(
      `
      *,
      stores (
        name,
        is_verified
      )
    `,
    )
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .eq("is_active", true)
    .limit(6)

  const images = Array.isArray(product.images) ? product.images : []
  const mainImage = images[0] || "/diverse-products-still-life.png"
  const discount = product.compare_at_price ? Math.round((1 - product.price / product.compare_at_price) * 100) : 0

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews?.filter((r) => r.rating === rating).length || 0,
    percentage: reviews?.length
      ? ((reviews.filter((r) => r.rating === rating).length / reviews.length) * 100).toFixed(0)
      : 0,
  }))

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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Buscar produtos, lojas..."
                className="w-full rounded-lg border bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
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
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">
            Início
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-foreground">
            Loja
          </Link>
          {product.categories && (
            <>
              <span>/</span>
              <Link href={`/shop?category=${product.categories.slug}`} className="hover:text-foreground">
                {product.categories.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image src={mainImage || "/placeholder.svg"} alt={product.name} fill className="object-cover" priority />
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-destructive text-lg px-3 py-1">-{discount}%</Badge>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {images.slice(0, 4).map((image: string, index: number) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer border-2 hover:border-primary"
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({product.total_reviews} avaliações)</span>
                </div>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground">{product.total_sales} vendidos</span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">R$ {product.price.toFixed(2)}</span>
                {product.compare_at_price && (
                  <span className="text-xl text-muted-foreground line-through">
                    R$ {product.compare_at_price.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Em até 12x de R$ {(product.price / 12).toFixed(2)} sem juros
              </p>
            </div>

            {/* Store Info */}
            <Card>
              <CardContent className="p-4">
                <Link href={`/store/${product.stores.slug}`} className="flex items-center gap-3 group">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Store className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium group-hover:text-primary">{product.stores.name}</span>
                      {product.stores.is_verified && (
                        <Badge variant="secondary" className="bg-blue-500 text-white">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                      )}
                      {product.stores.subscription_plan === "premium" && (
                        <Badge variant="secondary" className="bg-yellow-500 text-white">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {product.stores.rating.toFixed(1)}
                      </span>
                      <span>{product.stores.total_sales} vendas</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Variants */}
            {product.variants && Array.isArray(product.variants) && product.variants.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium">Variações</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant: any, index: number) => (
                    <Button key={index} variant="outline" className="min-w-[80px] bg-transparent">
                      {variant.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <h3 className="font-medium">Quantidade</h3>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon">
                  <Minus className="h-4 w-4" />
                </Button>
                <input
                  type="number"
                  defaultValue={1}
                  min={1}
                  max={product.stock}
                  className="w-20 text-center border rounded-md py-2"
                />
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">{product.stock} disponíveis</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button size="lg" className="flex-1">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Adicionar ao Carrinho
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Guarantees */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <span>Frete grátis para compras acima de R$ 150</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span>Garantia de 30 dias para devolução</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details & Reviews */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="description">Descrição</TabsTrigger>
            <TabsTrigger value="reviews">Avaliações ({product.total_reviews})</TabsTrigger>
            <TabsTrigger value="shipping">Envio</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {product.description || "Sem descrição disponível."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6 space-y-6">
            {/* Rating Summary */}
            <Card>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2">{product.rating.toFixed(1)}</div>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{product.total_reviews} avaliações</p>
                  </div>
                  <div className="space-y-2">
                    {ratingDistribution.map((item) => (
                      <div key={item.rating} className="flex items-center gap-3">
                        <span className="text-sm w-8">{item.rating} ★</span>
                        <Progress value={Number(item.percentage)} className="flex-1" />
                        <span className="text-sm text-muted-foreground w-12 text-right">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews?.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={review.profiles?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>{review.profiles?.full_name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{review.profiles?.full_name || "Usuário"}</p>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                        {review.images && Array.isArray(review.images) && review.images.length > 0 && (
                          <div className="flex gap-2">
                            {review.images.map((image: string, index: number) => (
                              <div key={index} className="relative h-20 w-20 overflow-hidden rounded-lg">
                                <Image
                                  src={image || "/placeholder.svg"}
                                  alt={`Review ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="shipping" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Informações de envio serão calculadas no checkout.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Produtos Relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
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
            {product.stores?.is_verified && <Badge className="absolute top-2 right-2 bg-blue-500">✓</Badge>}
          </div>
          <div className="p-3 space-y-2">
            <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold">R$ {product.price.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
