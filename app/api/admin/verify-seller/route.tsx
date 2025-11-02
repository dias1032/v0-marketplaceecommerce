import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const action = searchParams.get("action")
    const token = searchParams.get("token")

    if (!id || !action || !token) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    // Verify token
    const expectedToken = Buffer.from(`${id}:${process.env.SUPABASE_SERVICE_ROLE_KEY}`).toString("base64")

    if (token !== expectedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 })
    }

    // Use service role client for admin operations
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Get verification
    const { data: verification, error: fetchError } = await supabase
      .from("seller_verifications")
      .select("*, stores(*)")
      .eq("id", id)
      .single()

    if (fetchError || !verification) {
      return NextResponse.json({ error: "Verification not found" }, { status: 404 })
    }

    if (verification.status !== "pending") {
      return NextResponse.json({ error: "Verification already processed" }, { status: 400 })
    }

    const newStatus = action === "approve" ? "approved" : "rejected"

    // Update verification status
    const { error: updateError } = await supabase
      .from("seller_verifications")
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (updateError) {
      console.error("[v0] Update error:", updateError)
      return NextResponse.json({ error: "Failed to update verification" }, { status: 500 })
    }

    // If approved, update store verification status
    if (action === "approve" && verification.store_id) {
      await supabase.from("stores").update({ is_verified: true }).eq("id", verification.store_id)
    }

    // Send notification email to seller
    try {
      await resend.emails.send({
        from: "Vestti <noreply@vestti.com>",
        to: verification.email,
        subject: action === "approve" ? "Sua loja foi aprovada!" : "Atualização sobre sua solicitação",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: ${action === "approve" ? "#27AE60" : "#E74C3C"}; color: white; padding: 20px; text-align: center; }
                .content { background: #f9f9f9; padding: 20px; }
                .button { display: inline-block; padding: 12px 30px; margin-top: 20px; background: #FF5D5D; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>${action === "approve" ? "Parabéns!" : "Atualização"}</h1>
                </div>
                <div class="content">
                  ${
                    action === "approve"
                      ? `
                    <p>Sua loja foi aprovada e agora está ativa na plataforma Vestti!</p>
                    <p>Você já pode começar a adicionar produtos e fazer vendas.</p>
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/seller/dashboard" class="button">Acessar Painel</a>
                  `
                      : `
                    <p>Infelizmente, sua solicitação de verificação não foi aprovada neste momento.</p>
                    <p>Por favor, revise suas informações e tente novamente.</p>
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/seller/verificacao" class="button">Tentar Novamente</a>
                  `
                  }
                </div>
              </div>
            </body>
          </html>
        `,
      })
    } catch (emailError) {
      console.error("[v0] Email error:", emailError)
    }

    // Return HTML response
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verificação Processada</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
            .card { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
            .success { color: #27AE60; }
            .error { color: #E74C3C; }
            h1 { margin-top: 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1 class="${action === "approve" ? "success" : "error"}">
              ${action === "approve" ? "✓ Vendedor Aprovado" : "✗ Vendedor Rejeitado"}
            </h1>
            <p>A verificação foi processada com sucesso.</p>
            <p>O vendedor foi notificado por email.</p>
          </div>
        </body>
      </html>
    `,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      },
    )
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
