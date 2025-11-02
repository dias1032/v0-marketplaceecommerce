"use client"

import { useState, useEffect } from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Conversation {
  conversation_id: string
  other_user: {
    id: string
    full_name: string
    avatar_url: string | null
  }
  last_message: string
  last_message_time: string
  unread_count: number
}

export function ChatPopover({ userId }: { userId: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadConversations()

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          loadConversations()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const loadConversations = async () => {
    const { data: messages } = await supabase
      .from("messages")
      .select(`
        *,
        sender:sender_id(id, full_name, avatar_url),
        receiver:receiver_id(id, full_name, avatar_url)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false })

    if (messages) {
      const conversationMap = new Map<string, Conversation>()

      messages.forEach((msg: any) => {
        const otherUser = msg.sender_id === userId ? msg.receiver : msg.sender
        const conversationId = msg.conversation_id

        if (!conversationMap.has(conversationId)) {
          conversationMap.set(conversationId, {
            conversation_id: conversationId,
            other_user: otherUser,
            last_message: msg.message,
            last_message_time: msg.created_at,
            unread_count: msg.receiver_id === userId && !msg.is_read ? 1 : 0,
          })
        } else {
          const conv = conversationMap.get(conversationId)!
          if (msg.receiver_id === userId && !msg.is_read) {
            conv.unread_count++
          }
        }
      })

      const convArray = Array.from(conversationMap.values())
      setConversations(convArray)
      setUnreadCount(convArray.reduce((sum, conv) => sum + conv.unread_count, 0))
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <MessageCircle className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Mensagens</h3>
          <Link href="/seller/messages" onClick={() => setIsOpen(false)}>
            <Button variant="ghost" size="sm" className="text-xs">
              Ver todas
            </Button>
          </Link>
        </div>
        <ScrollArea className="h-[400px]">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Nenhuma conversa</div>
          ) : (
            <div className="divide-y">
              {conversations.map((conversation) => (
                <Link
                  key={conversation.conversation_id}
                  href={`/seller/messages?conversation=${conversation.conversation_id}`}
                  onClick={() => setIsOpen(false)}
                  className="block p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.other_user.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{conversation.other_user.full_name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm truncate">{conversation.other_user.full_name}</p>
                        {conversation.unread_count > 0 && (
                          <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mb-1">{conversation.last_message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conversation.last_message_time), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
