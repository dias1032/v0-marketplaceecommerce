import { createClient } from "@/lib/supabase/server"

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from = "contato@vestti.shop" }: EmailOptions) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(to, {
      data: {
        email_subject: subject,
        email_html: html,
      },
    })

    if (error) throw error

    await supabase.from("email_logs").insert({
      to_email: to,
      from_email: from,
      subject,
      status: "sent",
      sent_at: new Date().toISOString(),
    })

    return { success: true, data }
  } catch (error: any) {
    console.error("[v0] Email send error:", error)

    await supabase.from("email_logs").insert({
      to_email: to,
      from_email: from,
      subject,
      status: "failed",
      error_message: error.message,
      sent_at: new Date().toISOString(),
    })

    throw error
  }
}
