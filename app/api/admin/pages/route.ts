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

    const { data: pages, error } = await supabase.from("pages").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Pages fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 })
    }

    return NextResponse.json(pages)
  } catch (error) {
    console.error("[v0] Pages fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    const page = await request.json()

    const { data, error } = await supabase
      .from("pages")
      .insert({
        ...page,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Page create error:", error)
      return NextResponse.json({ error: "Failed to create page" }, { status: 500 })
    }

    // Log the change
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "create",
      table_name: "pages",
      record_id: data.id,
      new_values: page,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Page create error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
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

    const page = await request.json()
    const { id, ...updates } = page

    const { data, error } = await supabase
      .from("pages")
      .update({
        ...updates,
        updated_by: user.id,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Page update error:", error)
      return NextResponse.json({ error: "Failed to update page" }, { status: 500 })
    }

    // Log the change
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "update",
      table_name: "pages",
      record_id: id,
      new_values: updates,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Page update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
