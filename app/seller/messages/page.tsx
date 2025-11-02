import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MessagesClient } from "@/components/messages-client"
import Link from "next/link"

export default async function SellerMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "seller") redirect("/")

  const { data: store } = await supabase.from("stores").select("*").eq("seller_id", user.id).single()

  if (!store) redirect("/seller/onboarding")

  // Get unique conversations
  const { data: allMessages } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url, username),
      receiver:profiles!messages_receiver_id_fkey(id, full_name, avatar_url, username),
      products(name, slug, images)
    `,
    )
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  // Group by conversation_id and get latest message for each
  const conversationsMap = new Map()
  allMessages?.forEach((msg) => {
    if (!conversationsMap.has(msg.conversation_id)) {
      conversationsMap.set(msg.conversation_id, {
        conversation_id: msg.conversation_id,
        latest_message: msg,
        other_user: msg.sender_id === user.id ? msg.receiver : msg.sender,
        unread_count: 0,
      })
    }
    // Count unread messages
    if (msg.receiver_id === user.id && !msg.is_read) {
      const conv = conversationsMap.get(msg.conversation_id)
      conv.unread_count++
    }
  })

  const conversations = Array.from(conversationsMap.values())

  // Get messages for selected conversation
  let selectedMessages = null
  if (params.conversation) {
    const { data } = await supabase
      .from("messages")
      .select(
        `
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url, username),
        receiver:profiles!messages_receiver_id_fkey(id, full_name, avatar_url, username),
        products(name, slug, images)
      `,
      )
      .eq("conversation_id", params.conversation)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: true })

    selectedMessages = data

    // Mark as read
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", params.conversation)
      .eq("receiver_id", user.id)
      .eq("is_read", false)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/seller/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              V
            </div>
            <span className="text-xl font-bold">Vestti Seller</span>
          </Link>
        </div>
      </header>

      <MessagesClient
        conversations={conversations}
        selectedMessages={selectedMessages}
        selectedConversation={params.conversation}
        currentUserId={user.id}
      />
    </div>
  )
}
