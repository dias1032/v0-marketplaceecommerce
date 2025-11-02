import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Store, Package, Star, Crown, ExternalLink, MessageCircle } from "lucide-react"
import Link from "next/link"
import { FollowButton } from "@/components/follow-button"

export default async function StoreProfilePage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()

  // Get store
  const { data: store } = await supabase.from("stores").select("*").eq("slug", params.slug).single()

  if (!store) notFound()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if user follows this store
  let isFollowing = false
  if (user) {
    const { data: follow } = await supabase
      .from("store_followers")
      .select("id")
      .eq("store_id", store.id)
      .eq("buyer_id", user.id)
      .single()
    isFollowing = !!follow
  }

  // Get store products
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(12)

  // Get store posts
  const { data: posts } = await supabase
    .from("store_posts")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get store reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
      *,
      profiles (
        full_name,
        avatar_url
      ),
      products (
        name
      )
    `,
    )
    .eq("products.store_id", store.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Check VIP status
  let isVIP = false
  if (user) {
    const { data: vipSub } = await supabase
      .from("store_vip_subscriptions")
      .select("id")
      .eq("store_id", store.id)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()
    isVIP = !!vipSub
  }

  const externalLinks = (store.external_links as any[]) || []

  return (
    <div className="min-h-screen bg-background">
      {/* Store Banner */}
      <div className="relative h-48 bg-gradient-to-r from-primary/20 to-primary/10">
        {store.banner_url && (
          <img src={store.banner_url || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="container max-w-6xl">
        {/* Store Header */}
        <div className="relative -mt-16 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <Avatar className="h-32 w-32 border-4 border-background">
                  <AvatarImage src={store.logo_url || ""} />
                  <AvatarFallback>
                    <Store className="h-16 w-16" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-3xl font-bold">{store.name}</h1>
                      {store.is_verified && (
                        <Badge variant="default" className="bg-blue-500">
                          Verificada
                        </Badge>
                      )}
                      {isVIP && (
                        <Badge variant="default" className="bg-yellow-500">
                          <Crown className="h-3 w-3 mr-1" />
                          VIP
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{store.follower_count} seguidores</p>
                  </div>

                  {store.description && <p className="text-sm">{store.description}</p>}

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{store.rating?.toFixed(1) || "0.0"}</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{store.total_sales} vendas</span>
                  </div>

                  {externalLinks.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {externalLinks.map((link: any, idx: number) => (
                        <Button key={idx} variant="outline" size="sm" asChild>
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {link.label}
                          </a>
                        </Button>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {user && <FollowButton storeId={store.id} initialFollowing={isFollowing} />}
                    {user && (
                      <Button variant="outline" asChild>
                        <Link href={`/chat/${store.seller_id}`}>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Mensagem
                        </Link>
                      </Button>
                    )}
                    {store.vip_plan_enabled && !isVIP && (
                      <Button variant="outline" className="border-yellow-500 text-yellow-600 bg-transparent" asChild>
                        <Link href={`/loja/${store.slug}/vip`}>
                          <Crown className="h-4 w-4 mr-2" />
                          Tornar-se VIP
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Store Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">
              <Package className="h-4 w-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="reviews">Avaliações</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            {products && products.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square relative overflow-hidden bg-muted">
                      <img
                        src={product.images?.[0] || "/placeholder.svg?height=300&width=300&query=product"}
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-2 mb-2">{product.name}</h3>
                      <p className="text-lg font-bold">R$ {product.price.toFixed(2)}</p>
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <p className="text-sm text-muted-foreground line-through">
                          R$ {product.compare_at_price.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Esta loja ainda não tem produtos</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Feed Tab */}
          <TabsContent value="feed">
            {posts && posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="pt-6 space-y-4">
                      <p className="whitespace-pre-wrap">{post.content}</p>
                      {post.images && Array.isArray(post.images) && post.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {post.images.map((img: string, idx: number) => (
                            <img
                              key={idx}
                              src={img || "/placeholder.svg"}
                              alt=""
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex gap-4 text-sm text-muted-foreground pt-2 border-t">
                        <span>{post.likes_count} curtidas</span>
                        <span>{post.comments_count} comentários</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p>Esta loja ainda não fez publicações</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={review.profiles?.avatar_url || ""} />
                          <AvatarFallback>{review.profiles?.full_name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{review.profiles?.full_name || "Usuário"}</p>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">Produto: {review.products?.name}</p>
                          {review.comment && <p className="text-sm">{review.comment}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Esta loja ainda não tem avaliações</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
