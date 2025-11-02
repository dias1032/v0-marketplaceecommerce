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

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `media/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage.from("public").upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    })

    if (uploadError) {
      console.error("[v0] Upload error:", uploadError)
      return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("public").getPublicUrl(filePath)

    // Get image dimensions if it's an image
    let width: number | undefined
    let height: number | undefined

    if (file.type.startsWith("image/")) {
      // In a real implementation, you'd use a library like sharp to get dimensions
      // For now, we'll leave them undefined
    }

    // Save media record
    const { data: mediaData, error: mediaError } = await supabase
      .from("media")
      .insert({
        url: publicUrl,
        filename: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        width,
        height,
        uploaded_by: user.id,
      })
      .select()
      .single()

    if (mediaError) {
      console.error("[v0] Media record error:", mediaError)
      return NextResponse.json({ error: "Failed to save media record" }, { status: 500 })
    }

    return NextResponse.json({
      mediaId: mediaData.id,
      url: publicUrl,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
