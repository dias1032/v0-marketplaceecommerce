import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MessageSquare } from "lucide-react"

export default async function ChatPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Get all conversations (unique sender/receiver pairs)
  const { data: sentMessages } = await supabase
    .from("messages")
    .select("receiver_id, created_at")
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false })

  const { data: receivedMessages } = await supabase
    .from("messages")
    .select("sender_id, created_at")
    .eq("receiver_id", user.id)
    .order("created_at", { ascending: false })

  // Get unique conversation partners
  const conversationPartnerIds = new Set<string>()
  sentMessages?.forEach((m) => conversationPartnerIds.add(m.receiver_id))
  receivedMessages?.forEach((m) => conversationPartnerIds.add(m.sender_id))

  // Get partner profiles
  const { data: partners } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role")
    .in("id", Array.from(conversationPartnerIds))

  // Get unread counts
  const { data: unreadMessages } = await supabase
    .from("messages")
    .select("sender_id")
    .eq("receiver_id", user.id)
    .eq("is_read", false)

  const unreadCounts = new Map<string, number>()
  unreadMessages?.forEach((m) => {
    unreadCounts.set(m.sender_id, (unreadCounts.get(m.sender_id) || 0) + 1)
  })

  // Get last message for each conversation
  const conversationsWithLastMessage = await Promise.all(
    (partners || []).map(async (partner) => {
      const { data: lastMessage } = await supabase
        .from("messages")
        .select("message, created_at, sender_id")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${partner.id}),and(sender_id.eq.${partner.id},receiver_id.eq.${user.id})`,
        )
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      return {
        partner,
        lastMessage,
        unreadCount: unreadCounts.get(partner.id) || 0,
      }
    }),
  )

  // Sort by last message time
  conversationsWithLastMessage.sort((a, b) => {
    const timeA = a.lastMessage?.created_at ? new Date(a.lastMessage.created_at).getTime() : 0
    const timeB = b.lastMessage?.created_at ? new Date(b.lastMessage.created_at).getTime() : 0
    return timeB - timeA
  })

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center gap-2 mb-8">
        <MessageSquare className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Mensagens</h1>
      </div>

      {conversationsWithLastMessage.length > 0 ? (
        <div className="space-y-2">
          {conversationsWithLastMessage.map(({ partner, lastMessage, unreadCount }) => (
            <Link key={partner.id} href={`/chat/${partner.id}`}>
              <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={partner.avatar_url || ""} />
                    <AvatarFallback>{partner.full_name?.[0] || "U"}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{partner.full_name || "Usuário"}</p>
                      {partner.role === "seller" && (
                        <Badge variant="secondary" className="text-xs">
                          Vendedor
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {lastMessage?.sender_id === user.id && "Você: "}
                      {lastMessage?.message || "Sem mensagens"}
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <Badge variant="default" className="rounded-full h-6 w-6 flex items-center justify-center p-0">
                      {unreadCount}
                    </Badge>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-16 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma conversa ainda</h3>
          <p className="text-muted-foreground">
            Suas conversas com vendedores aparecerão aqui. Comece comprando um produto!
          </p>
        </Card>
      )}
    </div>
  )
}
