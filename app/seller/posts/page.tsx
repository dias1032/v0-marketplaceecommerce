"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PlusCircle, ImageIcon, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function SellerPostsPage() {
  const [content, setContent] = useState("")
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState("")
  const [posts, setPosts] = useState<any[]>([])
  const [storeId, setStoreId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadStore()
    loadPosts()
  }, [])

  const loadStore = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: store } = await supabase.from("stores").select("id").eq("seller_id", user.id).single()

    if (store) setStoreId(store.id)
  }

  const loadPosts = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("store_posts")
      .select(
        `
        *,
        stores (name)
      `,
      )
      .eq("stores.seller_id", user.id)
      .order("created_at", { ascending: false })

    if (data) setPosts(data)
  }

  const handleAddImage = () => {
    if (newImageUrl.trim() && imageUrls.length < 4) {
      setImageUrls([...imageUrls, newImageUrl.trim()])
      setNewImageUrl("")
    }
  }

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  const handleCreatePost = async () => {
    if (!content.trim() || !storeId) return

    setIsLoading(true)
    setError(null)

    try {
      const { error: postError } = await supabase.from("store_posts").insert({
        store_id: storeId,
        content: content.trim(),
        images: imageUrls,
      })

      if (postError) throw postError

      setContent("")
      setImageUrls([])
      loadPosts()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar post")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Tem certeza que deseja excluir este post?")) return

    await supabase.from("store_posts").delete().eq("id", postId)
    loadPosts()
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">Publicações da Loja</h1>

      {/* Create Post */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Criar Nova Publicação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              placeholder="Compartilhe novidades, promoções ou produtos com seus seguidores..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Imagens (até 4)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="URL da imagem"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddImage()}
              />
              <Button type="button" onClick={handleAddImage} disabled={imageUrls.length >= 4}>
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img src={url || "/placeholder.svg"} alt="" className="w-full h-32 object-cover rounded-lg" />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleCreatePost} disabled={!content.trim() || isLoading} className="w-full">
            <PlusCircle className="h-4 w-4 mr-2" />
            {isLoading ? "Publicando..." : "Publicar"}
          </Button>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Suas Publicações</h2>
        {posts.length > 0 ? (
          posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <p className="whitespace-pre-wrap">{post.content}</p>

                {post.images && Array.isArray(post.images) && post.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {post.images.map((img: string, idx: number) => (
                      <img
                        key={idx}
                        src={img || "/placeholder.svg"}
                        alt=""
                        className="w-full h-32 object-cover rounded-lg"
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
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Você ainda não fez nenhuma publicação. Crie sua primeira para engajar seus seguidores!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
