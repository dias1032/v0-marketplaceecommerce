import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MessageCircle } from "lucide-react"
import Link from "next/link"

export default async function SellerReviewsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (profile?.role !== "seller") redirect("/")

  const { data: store } = await supabase.from("stores").select("*").eq("seller_id", user.id).single()
  if (!store) redirect("/seller/onboarding")

  // Get reviews for store products
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
      *,
      products!inner(id, name, store_id),
      profiles!reviews_buyer_id_fkey(full_name, avatar_url)
    `,
    )
    .eq("products.store_id", store.id)
    .order("created_at", { ascending: false })

  // Calculate rating distribution
  const ratingCounts = [0, 0, 0, 0, 0]
  reviews?.forEach((review) => {
    ratingCounts[review.rating - 1]++
  })

  const totalReviews = reviews?.length || 0
  const avgRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                V
              </div>
              <span className="text-xl font-bold">Vestti</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/seller/dashboard" className="text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/seller/reviews" className="font-medium">
                Avaliações
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Avaliações</h1>
          <p className="text-muted-foreground">Veja o que seus clientes estão dizendo</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Rating Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo de Avaliações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold mb-2">{avgRating.toFixed(1)}</div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${star <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{totalReviews} avaliações</p>
              </div>

              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = ratingCounts[rating - 1]
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0

                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-8">{rating} ⭐</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 transition-all" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Todas as Avaliações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {reviews && reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            {review.profiles?.avatar_url ? (
                              <img
                                src={review.profiles.avatar_url || "/placeholder.svg"}
                                alt={review.profiles.full_name || "User"}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium">
                                {review.profiles?.full_name?.charAt(0) || "U"}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{review.profiles?.full_name || "Cliente"}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3 w-3 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {review.products?.name}
                        </Badge>
                      </div>

                      {review.comment && <p className="text-sm mb-3">{review.comment}</p>}

                      {review.images && Array.isArray(review.images) && review.images.length > 0 && (
                        <div className="flex gap-2 mb-3">
                          {review.images.slice(0, 4).map((image: string, index: number) => (
                            <img
                              key={index}
                              src={image || "/placeholder.svg"}
                              alt={`Review image ${index + 1}`}
                              className="h-20 w-20 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}

                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Responder
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma avaliação ainda. Suas primeiras avaliações aparecerão aqui!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
