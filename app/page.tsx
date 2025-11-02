import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Zap, Clock, Package, Database } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { MobileNav } from "@/components/mobile-nav"
import { BannerCarousel } from "@/components/banner-carousel"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data
  }

  // Fetch featured products with error handling
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(`
      *,
      stores (
        name,
        is_verified,
        subscription_plan
      )
    `)
    .eq("is_active", true)
    .eq("is_featured", true)
    .limit(12)

  const { data: banners, error: bannersError } = await supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .lte("start_date", new Date().toISOString())
    .gte("end_date", new Date().toISOString())
    .order("position", { ascending: true })

  // Fetch categories with error handling
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("*")
    .is("parent_id", null)
    .limit(7)

  // Check if database tables exist
  const databaseNotSetup = productsError?.code === "PGRST204" || productsError?.code === "PGRST205"

  if (databaseNotSetup) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          user={
            user && profile
              ? {
                  id: user.id,
                  name: profile.full_name,
                  email: profile.email,
                  avatar: profile.avatar_url,
                  username: profile.username,
                  role: profile.role,
                }
              : null
          }
        />
        <div className="container py-16">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-blue-100 p-4 rounded-full">
                  <Database className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">Database Setup Required</h2>
              <p className="text-muted-foreground">
                The database tables haven't been created yet. Please run the SQL scripts to set up your database.
              </p>
              <div className="bg-muted p-4 rounded-lg text-left space-y-2">
                <p className="font-medium text-sm">Required steps:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>
                    Run script: <code className="bg-background px-2 py-0.5 rounded">001_create_tables.sql</code>
                  </li>
                  <li>
                    Run script: <code className="bg-background px-2 py-0.5 rounded">002_enable_rls.sql</code>
                  </li>
                  <li>
                    Run script: <code className="bg-background px-2 py-0.5 rounded">003_create_triggers.sql</code>
                  </li>
                  <li>
                    Run script: <code className="bg-background px-2 py-0.5 rounded">004_seed_data.sql</code>
                  </li>
                  <li>Run remaining migration scripts in order</li>
                </ol>
              </div>
              <p className="text-sm text-muted-foreground">
                You can run these scripts from the setup steps in the chat interface.
              </p>
            </CardContent>
          </Card>
        </div>
        <MobileNav user={user ? { id: user.id } : null} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header
        user={
          user && profile
            ? {
                id: user.id,
                name: profile.full_name,
                email: profile.email,
                avatar: profile.avatar_url,
                username: profile.username,
                role: profile.role,
              }
            : null
        }
      />

      <main className="flex-1">
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white py-2">
          <div className="container flex items-center justify-center gap-3 text-sm font-medium">
            <Zap className="h-4 w-4 fill-white" />
            <span>FLASH SALE: Até 70% OFF</span>
            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded">
              <Clock className="h-3 w-3" />
              <span className="font-mono">02:34:15</span>
            </div>
          </div>
        </div>

        {banners && banners.length > 0 && (
          <section className="container py-4">
            <BannerCarousel banners={banners} />
          </section>
        )}

        <section className="container py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 p-2 rounded-lg">
                <Zap className="h-5 w-5 text-white fill-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Ofertas Relâmpago</h2>
                <p className="text-xs text-gray-500">Termina em 2h 34min</p>
              </div>
            </div>
            <Link href="/shop?sale=true" className="text-sm text-primary font-medium hover:underline">
              Ver Tudo →
            </Link>
          </div>

          <div className="product-grid-dense">
            {products?.slice(0, 12).map((product) => (
              <ProductCardDense key={product.id} product={product} urgent />
            ))}
          </div>
        </section>

        <section className="container py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recomendados Para Você</h2>
            <Link href="/shop" className="text-sm text-primary font-medium hover:underline">
              Ver Tudo →
            </Link>
          </div>
          <div className="product-grid-dense">
            {products?.map((product) => (
              <ProductCardDense key={product.id} product={product} />
            ))}
          </div>
        </section>

        {categories && categories.length > 0 && (
          <section className="container py-8">
            <h2 className="text-2xl font-bold mb-6">Categorias</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {categories.map((category) => (
                <Link key={category.id} href={`/shop?category=${category.slug}`} className="group">
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative aspect-square">
                        <Image
                          src={category.image_url || "/placeholder.svg?height=200&width=200&query=category"}
                          alt={category.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-3 text-center">
                        <p className="font-medium text-sm">{category.name}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <MobileNav user={user ? { id: user.id } : null} />
    </div>
  )
}

function ProductCardDense({ product, urgent = false }: { product: any; urgent?: boolean }) {
  const images = Array.isArray(product.images) ? product.images : []
  const mainImage = images[0] || "/diverse-products-still-life.png"
  const discount = product.compare_at_price ? Math.round((1 - product.price / product.compare_at_price) * 100) : 0
  const stockLow = product.stock < 10

  return (
    <Link href={`/product/${product.slug}`} className="group">
      <Card className="overflow-hidden hover:shadow-lg transition-all border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="relative aspect-square overflow-hidden bg-gray-50">
            <Image
              src={mainImage || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
            {discount > 0 && (
              <Badge className="absolute top-1 left-1 bg-red-500 text-white font-bold text-xs px-1.5 py-0.5">
                -{discount}%
              </Badge>
            )}
            {urgent && (
              <Badge className="absolute top-1 right-1 bg-yellow-400 text-black font-bold text-xs px-1.5 py-0.5 urgent-badge">
                🔥 HOT
              </Badge>
            )}
            {stockLow && (
              <Badge className="absolute bottom-1 left-1 bg-orange-500 text-white text-xs px-1.5 py-0.5">
                Últimas {product.stock} unidades
              </Badge>
            )}
          </div>
          <div className="p-2 space-y-1">
            <h3 className="font-medium text-xs line-clamp-2 leading-tight">{product.name}</h3>
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-2.5 w-2.5 ${
                      star <= Math.floor(product.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-gray-500">({product.total_reviews})</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-red-600">R$ {product.price.toFixed(2)}</span>
              {product.compare_at_price && (
                <span className="text-[10px] text-gray-400 line-through">R$ {product.compare_at_price.toFixed(2)}</span>
              )}
            </div>
            {product.stores?.is_verified && (
              <div className="flex items-center gap-1 text-[10px] text-blue-600">
                <Package className="h-2.5 w-2.5" />
                <span>Vendedor Verificado</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
