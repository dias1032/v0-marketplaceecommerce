import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Store, TrendingUp } from "lucide-react"
import Link from "next/link"
import { FeedPostActions } from "@/components/feed-post-actions"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export default async function FeedPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Get followed stores
  const { data: followedStores } = await supabase.from("store_followers").select("store_id").eq("buyer_id", user.id)

  const followedStoreIds = followedStores?.map((f) => f.store_id) || []

  // Get posts from followed stores
  const { data: posts } = await supabase
    .from("store_posts")
    .select(
      `
      *,
      stores (
        id,
        name,
        slug,
        logo_url,
        is_verified
      )
    `,
    )
    .in("store_id", followedStoreIds.length > 0 ? followedStoreIds : ["00000000-0000-0000-0000-000000000000"])
    .order("created_at", { ascending: false })
    .limit(50)

  // Get user's likes
  const { data: userLikes } = await supabase.from("post_likes").select("post_id").eq("user_id", user.id)

  const likedPostIds = new Set(userLikes?.map((l) => l.post_id) || [])

  // Get suggested stores to follow
  const { data: suggestedStores } = await supabase
    .from("stores")
    .select("id, name, slug, logo_url, is_verified, follower_count")
    .not(
      "id",
      "in",
      `(${followedStoreIds.length > 0 ? followedStoreIds.join(",") : "00000000-0000-0000-0000-000000000000"})`,
    )
    .eq("is_verified", true)
    .order("follower_count", { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Feed</h1>
              <Button variant="outline" asChild>
                <Link href="/shop">
                  <Store className="h-4 w-4 mr-2" />
                  Explorar Lojas
                </Link>
              </Button>
            </div>

            {posts && posts.length > 0 ? (
              posts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={post.stores?.logo_url || ""} />
                        <AvatarFallback>{post.stores?.name?.[0] || "L"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Link
                          href={`/loja/${post.stores?.slug}`}
                          className="font-semibold hover:underline flex items-center gap-1"
                        >
                          {post.stores?.name}
                          {post.stores?.is_verified && (
                            <Badge variant="secondary" className="ml-1 text-xs">
                              Verificada
                            </Badge>
                          )}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm whitespace-pre-wrap">{post.content}</p>

                    {post.images && Array.isArray(post.images) && post.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {post.images.slice(0, 4).map((img: string, idx: number) => (
                          <img
                            key={idx}
                            src={img || "/placeholder.svg"}
                            alt=""
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}

                    <FeedPostActions
                      postId={post.id}
                      initialLikes={post.likes_count}
                      initialComments={post.comments_count}
                      isLiked={likedPostIds.has(post.id)}
                    />
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Seu feed está vazio</h3>
                  <p className="text-muted-foreground mb-4">Siga lojas para ver suas novidades e promoções aqui!</p>
                  <Button asChild>
                    <Link href="/shop">Explorar Lojas</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Lojas Sugeridas</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestedStores && suggestedStores.length > 0 ? (
                  suggestedStores.map((store) => (
                    <div key={store.id} className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={store.logo_url || ""} />
                        <AvatarFallback>{store.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/loja/${store.slug}`}
                          className="font-medium text-sm hover:underline block truncate"
                        >
                          {store.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{store.follower_count} seguidores</p>
                      </div>
                      <form
                        action={async () => {
                          "use server"
                          const supabase = await createClient()
                          const {
                            data: { user },
                          } = await supabase.auth.getUser()
                          if (!user) return

                          await supabase.from("store_followers").insert({
                            store_id: store.id,
                            buyer_id: user.id,
                          })
                        }}
                      >
                        <Button type="submit" size="sm" variant="outline">
                          Seguir
                        </Button>
                      </form>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma sugestão no momento</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
