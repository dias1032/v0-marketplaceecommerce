import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, CheckCircle2, MessageCircle, StoreIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: store } = await supabase
    .from("stores")
    .select(
      `
      *,
      profiles (
        full_name,
        avatar_url
      )
    `,
    )
    .eq("slug", slug)
    .single()

  if (!store) notFound()

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(12)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              V
            </div>
            <span className="text-xl font-bold">Vestti</span>
          </Link>
        </div>
      </header>

      {/* Store Banner */}
      <div className="relative h-48 bg-gradient-to-r from-primary/20 to-primary/10">
        {store.banner_url && (
          <Image src={store.banner_url || "/placeholder.svg"} alt={store.name} fill className="object-cover" />
        )}
      </div>

      <div className="container">
        {/* Store Info */}
        <div className="relative -mt-16 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24 border-4 border-background">
                  <AvatarImage src={store.logo_url || "/placeholder.svg"} />
                  <AvatarFallback>
                    <StoreIcon className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-2xl font-bold">{store.name}</h1>
                        {store.is_verified && (
                          <Badge className="bg-blue-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verificado
                          </Badge>
                        )}
                        {store.subscription_plan === "premium" && <Badge className="bg-yellow-500">Premium</Badge>}
                      </div>
                      <p className="text-muted-foreground mb-3">{store.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{store.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">({store.total_reviews} avaliações)</span>
                        </div>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{store.total_sales} vendas</span>
                        {store.location && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{store.location}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <Button>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Enviar Mensagem
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products */}
        <div className="pb-12">
          <h2 className="text-2xl font-bold mb-6">Produtos da Loja</h2>
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => {
                const images = Array.isArray(product.images) ? product.images : []
                const mainImage = images[0] || "/diverse-products-still-life.png"
                const discount = product.compare_at_price
                  ? Math.round((1 - product.price / product.compare_at_price) * 100)
                  : 0

                return (
                  <Link key={product.id} href={`/product/${product.slug}`}>
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
                        </div>
                        <div className="p-3 space-y-2">
                          <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{product.rating.toFixed(1)}</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold">R$ {product.price.toFixed(2)}</span>
                            {product.compare_at_price && (
                              <span className="text-xs text-muted-foreground line-through">
                                R$ {product.compare_at_price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Esta loja ainda não possui produtos</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
