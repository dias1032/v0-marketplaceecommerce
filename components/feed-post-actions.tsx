"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface FeedPostActionsProps {
  postId: string
  initialLikes: number
  initialComments: number
  isLiked: boolean
}

export function FeedPostActions({ postId, initialLikes, initialComments, isLiked }: FeedPostActionsProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(isLiked)
  const [commentsCount, setCommentsCount] = useState(initialComments)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLike = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (liked) {
      // Unlike
      await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id)
      setLikes((prev) => prev - 1)
      setLiked(false)
    } else {
      // Like
      await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id })
      setLikes((prev) => prev + 1)
      setLiked(true)
    }
  }

  const loadComments = async () => {
    setIsLoadingComments(true)
    const { data } = await supabase
      .from("post_comments")
      .select(
        `
        *,
        profiles (
          full_name,
          avatar_url
        )
      `,
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: false })

    if (data) setComments(data)
    setIsLoadingComments(false)
  }

  const handleComment = async () => {
    if (!newComment.trim()) return

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
      return
    }

    const { error } = await supabase.from("post_comments").insert({
      post_id: postId,
      user_id: user.id,
      comment: newComment,
    })

    if (!error) {
      setNewComment("")
      setCommentsCount((prev) => prev + 1)
      loadComments()
    }
  }

  return (
    <div className="flex items-center gap-4 pt-2 border-t">
      <Button variant="ghost" size="sm" onClick={handleLike} className={liked ? "text-red-500" : ""}>
        <Heart className={`h-4 w-4 mr-1 ${liked ? "fill-current" : ""}`} />
        {likes}
      </Button>

      <Dialog
        open={showComments}
        onOpenChange={(open) => {
          setShowComments(open)
          if (open) loadComments()
        }}
      >
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <MessageCircle className="h-4 w-4 mr-1" />
            {commentsCount}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comentários</DialogTitle>
            <DialogDescription>Veja o que as pessoas estão dizendo</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Add comment */}
            <div className="flex gap-2">
              <Textarea
                placeholder="Escreva um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
              />
              <Button onClick={handleComment} disabled={!newComment.trim()}>
                Enviar
              </Button>
            </div>

            {/* Comments list */}
            <div className="space-y-4">
              {isLoadingComments ? (
                <p className="text-sm text-muted-foreground text-center py-4">Carregando...</p>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{comment.profiles?.full_name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-3">
                        <p className="font-semibold text-sm">{comment.profiles?.full_name || "Usuário"}</p>
                        <p className="text-sm">{comment.comment}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum comentário ainda. Seja o primeiro!
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
