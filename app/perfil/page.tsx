import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Store, Package, Heart, Settings } from "lucide-react"
import Link from "next/link"
import { FollowButton } from "@/components/follow-button"

export default async function PerfilPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get followed stores
  const { data: followedStores } = await supabase
    .from("store_followers")
    .select(
      `
      *,
      stores (
        id,
        name,
        slug,
        logo_url,
        is_verified,
        follower_count
      )
    `,
    )
    .eq("buyer_id", user.id)

  // Get wishlist
  const { data: wishlist } = await supabase
    .from("wishlists")
    .select(
      `
      *,
      products (
        id,
        name,
        slug,
        price,
        images,
        stores (
          name,
          slug
        )
      )
    `,
    )
    .eq("buyer_id", user.id)

  // Get recent orders
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Get seller store if exists
  const { data: store } = await supabase.from("stores").select("*").eq("seller_id", user.id).single()

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback>
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-2xl font-bold">{profile?.full_name || "Usuário"}</h1>
                  {profile?.username && <p className="text-muted-foreground">@{profile.username}</p>}
                </div>
                {profile?.bio && <p className="text-sm">{profile.bio}</p>}
                <div className="flex flex-wrap gap-2">
                  <Badge variant={profile?.role === "seller" ? "default" : "secondary"}>
                    {profile?.role === "seller" ? "Vendedor" : "Comprador"}
                  </Badge>
                  {profile?.verification_status === "approved" && (
                    <Badge variant="default" className="bg-green-500">
                      Verificado
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/perfil/configuracoes">
                      <Settings className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </Link>
                  </Button>
                  {profile?.role === "seller" && store && (
                    <Button size="sm" asChild>
                      <Link href="/seller/dashboard">
                        <Store className="h-4 w-4 mr-2" />
                        Painel de Vendedor
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">
              <Package className="h-4 w-4 mr-2" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="wishlist">
              <Heart className="h-4 w-4 mr-2" />
              Lista de Desejos
            </TabsTrigger>
            <TabsTrigger value="following">
              <Store className="h-4 w-4 mr-2" />
              Seguindo
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Meus Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                {orders && orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <Link
                        key={order.id}
                        href={`/perfil/pedido/${order.id}`}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium">Pedido #{order.order_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">R$ {order.total.toFixed(2)}</p>
                          <Badge variant="outline" className="capitalize">
                            {order.status}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <Link href="/perfil/pedidos">Ver Todos os Pedidos</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="mb-4">Você ainda não fez nenhum pedido</p>
                    <Button asChild>
                      <Link href="/shop">Começar a Comprar</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Desejos</CardTitle>
              </CardHeader>
              <CardContent>
                {wishlist && wishlist.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlist.map((item) => (
                      <Link
                        key={item.id}
                        href={`/product/${item.products?.slug}`}
                        className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="aspect-square relative overflow-hidden bg-muted">
                          <img
                            src={
                              item.products?.images?.[0] ||
                              "/placeholder.svg?height=300&width=300&query=product" ||
                              "/placeholder.svg"
                            }
                            alt={item.products?.name || ""}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="p-3">
                          <p className="font-medium text-sm line-clamp-2">{item.products?.name}</p>
                          <p className="text-xs text-muted-foreground">{item.products?.stores?.name}</p>
                          <p className="font-bold mt-1">R$ {item.products?.price.toFixed(2)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="mb-4">Sua lista de desejos está vazia</p>
                    <Button asChild>
                      <Link href="/shop">Explorar Produtos</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Following Tab */}
          <TabsContent value="following">
            <Card>
              <CardHeader>
                <CardTitle>Lojas que Sigo</CardTitle>
              </CardHeader>
              <CardContent>
                {followedStores && followedStores.length > 0 ? (
                  <div className="space-y-4">
                    {followedStores.map((follow) => (
                      <div key={follow.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={follow.stores?.logo_url || ""} />
                          <AvatarFallback>{follow.stores?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Link
                            href={`/loja/${follow.stores?.slug}`}
                            className="font-semibold hover:underline flex items-center gap-1"
                          >
                            {follow.stores?.name}
                            {follow.stores?.is_verified && (
                              <Badge variant="secondary" className="text-xs">
                                Verificada
                              </Badge>
                            )}
                          </Link>
                          <p className="text-sm text-muted-foreground">{follow.stores?.follower_count} seguidores</p>
                        </div>
                        <FollowButton storeId={follow.stores?.id || ""} initialFollowing={true} variant="outline" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Store className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="mb-4">Você ainda não segue nenhuma loja</p>
                    <Button asChild>
                      <Link href="/shop">Explorar Lojas</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
