import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Zap, Clock, Package } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const mockProducts = [
  {
    id: "1",
    name: "Camiseta Básica Premium",
    slug: "camiseta-basica-premium",
    price: 49.9,
    compare_at_price: 99.9,
    images: ["/plain-white-tshirt.png"],
    rating: 4.5,
    total_reviews: 123,
    stock: 5,
    store: { name: "Loja Premium", is_verified: true },
  },
  {
    id: "2",
    name: "Calça Jeans Slim",
    slug: "calca-jeans-slim",
    price: 129.9,
    compare_at_price: 199.9,
    images: ["/folded-denim-stack.png"],
    rating: 4.8,
    total_reviews: 89,
    stock: 15,
    store: { name: "Vestti Store", is_verified: true },
  },
  {
    id: "3",
    name: "Tênis Esportivo",
    slug: "tenis-esportivo",
    price: 199.9,
    compare_at_price: 299.9,
    images: ["/diverse-sneaker-collection.png"],
    rating: 5.0,
    total_reviews: 234,
    stock: 8,
    store: { name: "Sport Shop", is_verified: false },
  },
  {
    id: "4",
    name: "Jaqueta de Couro",
    slug: "jaqueta-couro",
    price: 349.9,
    compare_at_price: 599.9,
    images: ["/classic-leather-jacket.png"],
    rating: 4.7,
    total_reviews: 67,
    stock: 3,
    store: { name: "Fashion Elite", is_verified: true },
  },
  {
    id: "5",
    name: "Vestido Floral",
    slug: "vestido-floral",
    price: 89.9,
    compare_at_price: 159.9,
    images: ["/diverse-products-still-life.png"],
    rating: 4.6,
    total_reviews: 156,
    stock: 12,
    store: { name: "Moda Feminina", is_verified: true },
  },
  {
    id: "6",
    name: "Relógio Masculino",
    slug: "relogio-masculino",
    price: 249.9,
    compare_at_price: 449.9,
    images: ["/diverse-products-still-life.png"],
    rating: 4.9,
    total_reviews: 78,
    stock: 6,
    store: { name: "Acessórios Top", is_verified: true },
  },
]

const mockCategories = [
  { id: "1", name: "Camisetas", slug: "camisetas", image_url: "/diverse-t-shirt-collection.png" },
  { id: "2", name: "Calças", slug: "calcas", image_url: "/various-styles-of-pants.png" },
  { id: "3", name: "Tênis", slug: "tenis", image_url: "/assorted-shoes.png" },
  { id: "4", name: "Jaquetas", slug: "jaquetas", image_url: "/assorted-jackets.png" },
  { id: "5", name: "Acessórios", slug: "acessorios", image_url: "/fashion-accessories-flatlay.png" },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1">
        {/* Flash Sale Banner */}
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

        {/* Flash Sale Products */}
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
            <Link href="/shop" className="text-sm text-primary font-medium hover:underline">
              Ver Tudo →
            </Link>
          </div>

          <div className="product-grid-dense">
            {mockProducts.map((product) => (
              <ProductCardDense key={product.id} product={product} urgent />
            ))}
          </div>
        </section>

        {/* Recommended Products */}
        <section className="container py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recomendados Para Você</h2>
            <Link href="/shop" className="text-sm text-primary font-medium hover:underline">
              Ver Tudo →
            </Link>
          </div>
          <div className="product-grid-dense">
            {mockProducts.map((product) => (
              <ProductCardDense key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="container py-8 pb-24 md:pb-8">
          <h2 className="text-2xl font-bold mb-6">Categorias</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {mockCategories.map((category) => (
              <Link key={category.id} href={`/shop?category=${category.slug}`} className="group">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative aspect-square">
                      <Image
                        src={category.image_url || "/placeholder.svg"}
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
      </main>
    </div>
  )
}

function ProductCardDense({ product, urgent = false }: { product: any; urgent?: boolean }) {
  const mainImage = product.images[0] || "/placeholder.svg"
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
              <Badge className="absolute top-1 right-1 bg-yellow-400 text-black font-bold text-xs px-1.5 py-0.5">
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
            {product.store?.is_verified && (
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
