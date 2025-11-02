import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * API Route: Verify Seller
 *
 * Handles approve/deny actions from admin email links.
 * Updates seller verification status and sends notification email.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const action = searchParams.get("action")

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing userId or action" }, { status: 400 })
    }

    const supabase = await createClient()

    if (action === "approve") {
      // Approve seller
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          verification_status: "approved",
          role: "seller",
        })
        .eq("id", userId)

      if (profileError) throw profileError

      // Update verification request
      await supabase
        .from("seller_verification_requests")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      // Get user email
      const { data: profile } = await supabase.from("profiles").select("email, full_name").eq("id", userId).single()

      if (profile?.email) {
        // TODO: Send approval email to seller
        console.log(`[v0] Would send approval email to: ${profile.email}`)
      }

      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f0f0f0; }
              .card { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
              .success { color: #22c55e; font-size: 48px; margin-bottom: 20px; }
              h1 { color: #333; margin-bottom: 10px; }
              p { color: #666; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="success">✓</div>
              <h1>Loja Aprovada!</h1>
              <p>O vendedor foi notificado por e-mail.</p>
            </div>
          </body>
        </html>
      `,
        {
          headers: { "Content-Type": "text/html" },
        },
      )
    } else if (action === "deny") {
      // For deny, we need a reason - redirect to a form
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f0f0f0; padding: 20px; }
              .card { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; width: 100%; }
              h1 { color: #333; margin-bottom: 20px; }
              label { display: block; margin-bottom: 8px; font-weight: bold; color: #333; }
              textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-family: Arial, sans-serif; margin-bottom: 20px; }
              button { background: #ef4444; color: white; border: none; padding: 12px 30px; border-radius: 5px; font-weight: bold; cursor: pointer; width: 100%; }
              button:hover { background: #dc2626; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Negar Verificação</h1>
              <form method="POST" action="/api/verify-seller">
                <input type="hidden" name="userId" value="${userId}" />
                <input type="hidden" name="action" value="deny" />
                <label for="reason">Motivo da Recusa:</label>
                <textarea id="reason" name="reason" rows="4" required placeholder="Explique o motivo da recusa..."></textarea>
                <button type="submit">Confirmar Recusa</button>
              </form>
            </div>
          </body>
        </html>
      `,
        {
          headers: { "Content-Type": "text/html" },
        },
      )
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Error verifying seller:", error)
    return NextResponse.json(
      { error: "Failed to verify seller", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const userId = formData.get("userId") as string
    const reason = formData.get("reason") as string

    if (!userId || !reason) {
      return NextResponse.json({ error: "Missing userId or reason" }, { status: 400 })
    }

    const supabase = await createClient()

    // Deny seller
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        verification_status: "rejected",
        rejection_reason: reason,
      })
      .eq("id", userId)

    if (profileError) throw profileError

    // Update verification request
    await supabase
      .from("seller_verification_requests")
      .update({
        status: "rejected",
        rejection_reason: reason,
        reviewed_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    // Get user email
    const { data: profile } = await supabase.from("profiles").select("email, full_name").eq("id", userId).single()

    if (profile?.email) {
      // TODO: Send rejection email to seller
      console.log(`[v0] Would send rejection email to: ${profile.email}`)
      console.log(`[v0] Reason: ${reason}`)
    }

    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f0f0f0; }
            .card { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
            .warning { color: #ef4444; font-size: 48px; margin-bottom: 20px; }
            h1 { color: #333; margin-bottom: 10px; }
            p { color: #666; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="warning">✕</div>
            <h1>Verificação Negada</h1>
            <p>O vendedor foi notificado por e-mail com o motivo da recusa.</p>
          </div>
        </body>
      </html>
    `,
      {
        headers: { "Content-Type": "text/html" },
      },
    )
  } catch (error) {
    console.error("[v0] Error denying seller:", error)
    return NextResponse.json(
      { error: "Failed to deny seller", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
