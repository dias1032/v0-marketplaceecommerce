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

    // Get media record to find file path
    const { data: media } = await supabase.from("media").select("url").eq("id", id).single()

    if (media?.url) {
      // Extract file path from URL
      const urlParts = media.url.split("/")
      const filePath = `media/${urlParts[urlParts.length - 1]}`

      // Delete from storage
      await supabase.storage.from("public").remove([filePath])
    }

    // Delete media record
    const { error } = await supabase.from("media").delete().eq("id", id)

    if (error) {
      console.error("[v0] Media delete error:", error)
      return NextResponse.json({ error: "Failed to delete media" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Media delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
