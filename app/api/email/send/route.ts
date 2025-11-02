import { createClient } from "@/lib/supabase/server"
import { SupabaseEmailService } from "@/lib/email/supabase-email-service"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { to, subject, html, templateKey, variables, metadata } = body

    // Validate required fields
    if (!to || (!subject && !templateKey)) {
      return NextResponse.json({ error: "Missing required fields: to, subject or templateKey" }, { status: 400 })
    }

    let success: boolean

    if (templateKey && variables) {
      // Send using template
      success = await SupabaseEmailService.sendFromTemplate(templateKey, to, variables)
    } else {
      // Send direct email
      success = await SupabaseEmailService.send({
        to,
        subject,
        html,
        templateKey,
        metadata,
      })
    }

    if (success) {
      return NextResponse.json({ success: true, message: "Email sent successfully" })
    } else {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }
  } catch (error: any) {
    console.error("[v0] Email API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
