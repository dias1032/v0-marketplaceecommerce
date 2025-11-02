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

    const { settings } = await request.json()

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      await supabase
        .from("settings")
        .upsert({
          key,
          value: JSON.stringify(value),
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("key", key)

      // Log the change
      await supabase.from("audit_logs").insert({
        user_id: user.id,
        action: "update",
        table_name: "settings",
        record_id: key,
        new_values: { [key]: value },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Settings update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
