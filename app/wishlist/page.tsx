import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Trash2, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function WishlistPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login?next=/wishlist")

  const { data: wishlistItems } = await supabase
    .from("wishlists")
    .select(
      `
      *,
      products (
        *,
        stores (
          name,
          is_verified
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

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

      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Lista de Desejos</h1>
          <Badge variant="secondary">{wishlistItems?.length || 0} itens</Badge>
        </div>

        {wishlistItems && wishlistItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlistItems.map((item) => {
              const product = item.products
              const images = Array.isArray(product.images) ? product.images : []
              const mainImage = images[0] || "/diverse-products-still-life.png"
              const discount = product.compare_at_price
                ? Math.round((1 - product.price / product.compare_at_price) * 100)
                : 0

              return (
                <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <Link href={`/product/${product.slug}`}>
                        <Image
                          src={mainImage || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </Link>
                      {discount > 0 && <Badge className="absolute top-2 left-2 bg-destructive">-{discount}%</Badge>}
                      <form action={`/api/wishlist/remove`} method="POST">
                        <input type="hidden" name="wishlistId" value={item.id} />
                        <Button type="submit" size="icon" variant="secondary" className="absolute top-2 right-2">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                    <div className="p-3 space-y-2">
                      <Link href={`/product/${product.slug}`}>
                        <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem] hover:text-primary">
                          {product.name}
                        </h3>
                      </Link>
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
                      <Button size="sm" className="w-full" asChild>
                        <Link href={`/product/${product.slug}`}>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Ver Produto
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Sua lista de desejos está vazia</h2>
              <p className="text-muted-foreground mb-6">Adicione produtos que você gosta para salvá-los aqui</p>
              <Button asChild>
                <Link href="/shop">Explorar Produtos</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
