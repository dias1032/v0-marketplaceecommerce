import { createClient } from "@/lib/supabase/server"
import { SupabaseEmailService } from "@/lib/email/supabase-email-service"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verify admin role
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { to } = await request.json()

    // Default to admin email if not provided
    const { data: settings } = await supabase.from("settings").select("value").eq("key", "email_admin_address").single()

    const adminEmail = to || (settings ? JSON.parse(settings.value) : "jdias2221@gmail.com")

    const success = await SupabaseEmailService.sendTestEmail(adminEmail)

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent to ${adminEmail}`,
      })
    } else {
      return NextResponse.json({ error: "Failed to send test email" }, { status: 500 })
    }
  } catch (error: any) {
    console.error("[v0] Test email error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
