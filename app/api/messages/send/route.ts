import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { receiverId, message, productId, conversationId } = await request.json()

    if (!receiverId || !message) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Create message
    const { data: newMessage, error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId || crypto.randomUUID(),
        sender_id: user.id,
        receiver_id: receiverId,
        product_id: productId || null,
        message: message,
        is_read: false,
      })
      .select(
        `
        *,
        sender:profiles!messages_sender_id_fkey(full_name, avatar_url, username),
        receiver:profiles!messages_receiver_id_fkey(full_name, avatar_url, username),
        products(name, slug, images)
      `,
      )
      .single()

    if (messageError) {
      console.error("[v0] Error creating message:", messageError)
      return NextResponse.json({ error: "Erro ao enviar mensagem" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: newMessage })
  } catch (error) {
    console.error("[v0] Send message error:", error)
    return NextResponse.json({ error: "Erro ao enviar mensagem" }, { status: 500 })
  }
}
