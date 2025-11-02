import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
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

    const { data: media, error } = await supabase.from("media").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Media fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 })
    }

    return NextResponse.json(media)
  } catch (error) {
    console.error("[v0] Media fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
