"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  receiver_id: string
  message: string
  is_read: boolean
  created_at: string
  sender: {
    id: string
    full_name: string
    avatar_url: string
    username: string
  }
  receiver: {
    id: string
    full_name: string
    avatar_url: string
    username: string
  }
  products?: {
    name: string
    slug: string
    images: string[]
  }
}

interface Conversation {
  conversation_id: string
  latest_message: Message
  other_user: {
    id: string
    full_name: string
    avatar_url: string
    username: string
  }
  unread_count: number
}

interface MessagesClientProps {
  conversations: Conversation[]
  selectedMessages: Message[] | null
  selectedConversation?: string
  currentUserId: string
}

export function MessagesClient({
  conversations,
  selectedMessages: initialMessages,
  selectedConversation,
  currentUserId,
}: MessagesClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [messageText, setMessageText] = useState("")
  const [messages, setMessages] = useState<Message[]>(initialMessages || [])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const filteredConversations = conversations.filter((conv) =>
    conv.other_user.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const selectedConv = conversations.find((c) => c.conversation_id === selectedConversation)

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages)
    }
  }, [initialMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedConv) return

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedConv.other_user.id,
          message: messageText,
          conversationId: selectedConversation,
        }),
      })

      if (response.ok) {
        const { message: newMessage } = await response.json()
        setMessages([...messages, newMessage])
        setMessageText("")
        router.refresh()
      }
    } catch (error) {
      console.error("[v0] Error sending message:", error)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Mensagens</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar conversas..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.conversation_id}
                    onClick={() => router.push(`/seller/messages?conversation=${conv.conversation_id}`)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left ${
                      selectedConversation === conv.conversation_id ? "bg-muted" : ""
                    }`}
                  >
                    <Avatar>
                      <AvatarImage src={conv.other_user.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{conv.other_user.full_name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium truncate">{conv.other_user.full_name}</p>
                        {conv.unread_count > 0 && (
                          <Badge className="h-5 w-5 p-0 rounded-full flex items-center justify-center text-xs">
                            {conv.unread_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.latest_message.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(conv.latest_message.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Nenhuma conversa encontrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0 flex flex-col h-[600px]">
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="border-b p-4 flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedConv.other_user.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{selectedConv.other_user.full_name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedConv.other_user.full_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedConv.other_user.username}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isOwn = msg.sender_id === currentUserId
                      return (
                        <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] ${isOwn ? "order-2" : "order-1"}`}>
                            {msg.products && (
                              <div className="mb-2 p-2 border rounded-lg bg-muted/50 flex items-center gap-2">
                                <div className="relative h-12 w-12 rounded overflow-hidden bg-background">
                                  <Image
                                    src={msg.products.images?.[0] || "/placeholder.svg"}
                                    alt={msg.products.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{msg.products.name}</p>
                                  <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                                    <a href={`/product/${msg.products.slug}`}>Ver produto</a>
                                  </Button>
                                </div>
                              </div>
                            )}
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{msg.message}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 px-2">
                              {new Date(msg.created_at).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input */}
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      className="flex-1"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                    />
                    <Button type="submit" disabled={!messageText.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Selecione uma conversa para começar</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
