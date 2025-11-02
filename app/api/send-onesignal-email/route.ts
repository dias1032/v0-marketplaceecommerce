import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email/supabase-email"

export async function POST(request: NextRequest) {
  try {
    const { to_email, subject, html } = await request.json()

    if (!to_email || !subject || !html) {
      return NextResponse.json({ error: "Missing required fields: to_email, subject, html" }, { status: 400 })
    }

    await sendEmail({
      to: to_email,
      subject,
      html,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error sending email:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
