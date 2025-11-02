import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    const { id } = params

    const { error } = await supabase.from("pages").delete().eq("id", id)

    if (error) {
      console.error("[v0] Page delete error:", error)
      return NextResponse.json({ error: "Failed to delete page" }, { status: 500 })
    }

    // Log the change
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "delete",
      table_name: "pages",
      record_id: id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Page delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
