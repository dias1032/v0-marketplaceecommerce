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

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { verification_id, action } = body

    if (!verification_id || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
    }

    // Get verification
    const { data: verification, error: fetchError } = await supabase
      .from("seller_verifications")
      .select("*, stores(*)")
      .eq("id", verification_id)
      .single()

    if (fetchError || !verification) {
      return NextResponse.json({ error: "Verification not found" }, { status: 404 })
    }

    if (verification.status !== "pending") {
      return NextResponse.json({ error: "Verification already processed" }, { status: 400 })
    }

    const newStatus = action === "approve" ? "approved" : "rejected"

    // Update verification status
    const { error: updateError } = await supabase
      .from("seller_verifications")
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq("id", verification_id)

    if (updateError) {
      console.error("[v0] Update error:", updateError)
      return NextResponse.json({ error: "Failed to update verification" }, { status: 500 })
    }

    // If approved, update store verification status
    if (action === "approve" && verification.store_id) {
      await supabase.from("stores").update({ is_verified: true }).eq("id", verification.store_id)
    }

    return NextResponse.json({
      success: true,
      message: action === "approve" ? "Vendedor aprovado com sucesso!" : "Vendedor rejeitado.",
    })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
