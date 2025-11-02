import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email/supabase-email"

/**
 * API Route: Send Verification Email
 *
 * Sends seller verification request to admin email (jdias2221@gmail.com)
 * with approve/deny buttons.
 *
 * NOTE: This uses a simple email service. In production, use:
 * - Resend (resend.com)
 * - SendGrid
 * - AWS SES
 * - Nodemailer with SMTP
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, fullName, cpfCnpj, phone, email, address } = body

    const formattedAddress = `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ""}, ${address.neighborhood}, ${address.city}/${address.state}, CEP: ${address.zipCode}`

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: #fff; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; }
            .buttons { text-align: center; margin: 30px 0; }
            .button { display: inline-block; padding: 12px 30px; margin: 0 10px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .approve { background: #22c55e; color: white; }
            .deny { background: #ef4444; color: white; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Nova Solicitação de Verificação</h1>
            </div>
            <div class="content">
              <h2>Informações do Vendedor</h2>
              <div class="info-row">
                <span class="label">Nome Completo:</span> ${fullName}
              </div>
              <div class="info-row">
                <span class="label">CPF/CNPJ:</span> ${cpfCnpj}
              </div>
              <div class="info-row">
                <span class="label">Telefone:</span> ${phone}
              </div>
              <div class="info-row">
                <span class="label">E-mail:</span> ${email}
              </div>
              <div class="info-row">
                <span class="label">Endereço:</span> ${formattedAddress}
              </div>
            </div>
            <div class="buttons">
              <a href="${process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_VERCEL_URL}/api/verify-seller?userId=${userId}&action=approve" class="button approve">
                Aprovar Loja
              </a>
              <a href="${process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_VERCEL_URL}/api/verify-seller?userId=${userId}&action=deny" class="button deny">
                Negar Loja
              </a>
            </div>
          </div>
        </body>
      </html>
    `

    await sendEmail({
      to: "jdias2221@gmail.com",
      subject: `Nova Solicitação de Verificação - ${fullName}`,
      html: emailHtml,
    })

    return NextResponse.json({
      success: true,
      message: "Verification email sent",
    })
  } catch (error) {
    console.error("[v0] Error sending verification email:", error)
    return NextResponse.json(
      { error: "Failed to send verification email", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
