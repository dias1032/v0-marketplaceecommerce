import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { full_name, cpf_cnpj, address, phone, email, documents, store_id } = body

    // Validate required fields
    if (!full_name || !cpf_cnpj || !address || !phone || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create verification request
    const { data: verification, error: verificationError } = await supabase
      .from("seller_verifications")
      .insert({
        user_id: user.id,
        store_id,
        full_name,
        cpf_cnpj,
        address,
        phone,
        email,
        documents,
        status: "pending",
      })
      .select()
      .single()

    if (verificationError) {
      console.error("[v0] Verification creation error:", verificationError)
      return NextResponse.json({ error: "Failed to create verification" }, { status: 500 })
    }

    return NextResponse.json(
      {
        verification,
        message: "Solicitação enviada! Aguarde aprovação no painel administrativo.",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
