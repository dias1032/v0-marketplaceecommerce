import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ChatInterface } from "@/components/chat-interface"

export default async function ChatConversationPage({ params }: { params: { userId: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Get partner profile
  const { data: partner } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role")
    .eq("id", params.userId)
    .single()

  if (!partner) redirect("/chat")

  // Get messages
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${params.userId}),and(sender_id.eq.${params.userId},receiver_id.eq.${user.id})`,
    )
    .order("created_at", { ascending: true })

  // Mark messages as read
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("receiver_id", user.id)
    .eq("sender_id", params.userId)
    .eq("is_read", false)

  return (
    <ChatInterface
      currentUserId={user.id}
      partnerId={partner.id}
      partnerName={partner.full_name || "Usuário"}
      partnerAvatar={partner.avatar_url}
      partnerRole={partner.role}
      initialMessages={messages || []}
    />
  )
}
