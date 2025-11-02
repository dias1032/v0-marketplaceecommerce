import { createClient } from "@/lib/supabase/server"

interface EmailOptions {
  to: string
  subject: string
  html: string
  templateKey?: string
  metadata?: Record<string, any>
}

interface EmailTemplate {
  key: string
  subject: string
  body: string
  variables: string[]
}

export class SupabaseEmailService {
  private static async getSettings() {
    const supabase = await createClient()
    const { data } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", [
        "email_sender_address",
        "email_sender_name",
        "email_admin_address",
        "email_retry_attempts",
        "email_retry_delay",
      ])

    const settings: Record<string, any> = {}
    data?.forEach((setting) => {
      try {
        settings[setting.key] = JSON.parse(setting.value)
      } catch {
        settings[setting.key] = setting.value
      }
    })

    return settings
  }

  private static async checkSubscription(email: string): Promise<boolean> {
    const supabase = await createClient()
    const { data } = await supabase
      .from("email_subscriptions")
      .select("subscribed, bounce_count")
      .eq("email", email)
      .single()

    // If no record, user is subscribed by default
    if (!data) return true

    // Block if unsubscribed or too many bounces
    if (!data.subscribed || data.bounce_count >= 3) {
      console.log(`[v0] Email blocked: ${email} (unsubscribed or bounced)`)
      return false
    }

    return true
  }

  private static async logEmail(options: EmailOptions, status: string, error?: string): Promise<string> {
    const supabase = await createClient()
    const settings = await this.getSettings()

    const { data, error: logError } = await supabase
      .from("email_logs")
      .insert({
        to_email: options.to,
        from_email: settings.email_sender_address || "contato@vestti.shop",
        subject: options.subject,
        template_key: options.templateKey,
        status,
        error_message: error,
        metadata: options.metadata || {},
        sent_at: status === "sent" ? new Date().toISOString() : null,
      })
      .select("id")
      .single()

    if (logError) {
      console.error("[v0] Failed to log email:", logError)
    }

    return data?.id || ""
  }

  private static async sendViaSupabase(options: EmailOptions): Promise<boolean> {
    const supabase = await createClient()
    const settings = await this.getSettings()

    try {
      // Use Supabase Auth email service
      // Note: This uses Supabase's built-in email functionality
      // For custom emails, you'll need to use Supabase Edge Functions
      // or integrate with a service like Resend

      // For now, we'll use a placeholder that logs the email
      // In production, replace with actual Supabase email sending
      console.log("[v0] Sending email via Supabase:", {
        from: `${settings.email_sender_name} <${settings.email_sender_address}>`,
        to: options.to,
        subject: options.subject,
      })

      // TODO: Implement actual Supabase email sending
      // This could be done via:
      // 1. Supabase Edge Function with Resend
      // 2. Direct Resend API call
      // 3. SMTP via Edge Function

      return true
    } catch (error) {
      console.error("[v0] Supabase email error:", error)
      return false
    }
  }

  private static async sendWithRetry(options: EmailOptions, attempt = 1): Promise<boolean> {
    const settings = await this.getSettings()
    const maxAttempts = settings.email_retry_attempts || 3

    try {
      const success = await this.sendViaSupabase(options)

      if (success) {
        await this.logEmail(options, "sent")
        return true
      }

      // Retry logic
      if (attempt < maxAttempts) {
        const delay = (settings.email_retry_delay || 300) * attempt
        console.log(`[v0] Retrying email in ${delay}s (attempt ${attempt + 1}/${maxAttempts})`)

        await new Promise((resolve) => setTimeout(resolve, delay * 1000))
        return await this.sendWithRetry(options, attempt + 1)
      }

      await this.logEmail(options, "failed", `Failed after ${maxAttempts} attempts`)
      return false
    } catch (error: any) {
      console.error(`[v0] Email attempt ${attempt} failed:`, error)

      if (attempt < maxAttempts) {
        const delay = (settings.email_retry_delay || 300) * attempt
        await new Promise((resolve) => setTimeout(resolve, delay * 1000))
        return await this.sendWithRetry(options, attempt + 1)
      }

      await this.logEmail(options, "failed", error.message)
      return false
    }
  }

  static async send(options: EmailOptions): Promise<boolean> {
    // Check if email is subscribed
    const canSend = await this.checkSubscription(options.to)
    if (!canSend) {
      await this.logEmail(options, "blocked", "Unsubscribed or bounced")
      return false
    }

    // Send with retry logic
    return await this.sendWithRetry(options)
  }

  static async sendFromTemplate(templateKey: string, to: string, variables: Record<string, any>): Promise<boolean> {
    const supabase = await createClient()

    // Get template
    const { data: template, error } = await supabase.from("email_templates").select("*").eq("key", templateKey).single()

    if (error || !template) {
      console.error("[v0] Template not found:", templateKey)
      return false
    }

    // Replace variables in subject and body
    let subject = template.subject
    let html = template.body

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      subject = subject.replace(new RegExp(placeholder, "g"), String(value))
      html = html.replace(new RegExp(placeholder, "g"), String(value))
    })

    return await this.send({
      to,
      subject,
      html,
      templateKey,
      metadata: { variables },
    })
  }

  static async sendTestEmail(to: string): Promise<boolean> {
    return await this.send({
      to,
      subject: "Email de Teste - Vestti",
      html: `
        <h1>Email de Teste</h1>
        <p>Este é um email de teste do sistema Vestti.</p>
        <p>Se você recebeu este email, o sistema de envio está funcionando corretamente.</p>
        <p>Data/Hora: ${new Date().toLocaleString("pt-BR")}</p>
      `,
      templateKey: "test_email",
      metadata: { test: true },
    })
  }
}
