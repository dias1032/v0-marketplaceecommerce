import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const cpfCnpj = formData.get("cpf_cnpj") as string
    const documentFile = formData.get("document") as File

    if (!cpfCnpj || !documentFile) {
      return NextResponse.json({ error: "Missing required fields: cpf_cnpj, document" }, { status: 400 })
    }

    // Validate CPF/CNPJ format
    const cleaned = cpfCnpj.replace(/\D/g, "")
    if (cleaned.length !== 11 && cleaned.length !== 14) {
      return NextResponse.json({ error: "Invalid CPF/CNPJ format" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (documentFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    // Upload document to Supabase Storage
    const fileExt = documentFile.name.split(".").pop()
    const fileName = `${user.id}/document-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage.from("seller-docs").upload(fileName, documentFile, {
      contentType: documentFile.type,
      upsert: false,
    })

    if (uploadError) {
      console.error("[v0] Error uploading document:", uploadError)
      return NextResponse.json({ error: "Failed to upload document" }, { status: 500 })
    }

    // Get public URL for the document
    const {
      data: { publicUrl },
    } = supabase.storage.from("seller-docs").getPublicUrl(fileName)

    // Update user profile with seller request
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        cpf_cnpj: cleaned,
        seller_status: "pending",
        document_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("[v0] Error updating profile:", updateError)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    // Send notification email to admin (via OneSignal)
    try {
      await fetch(`${request.nextUrl.origin}/api/send-onesignal-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to_email: "admin@vestti.com",
          subject: "Nova Solicitação de Vendedor",
          html: `
            <h2>Nova Solicitação de Vendedor</h2>
            <p><strong>Usuário:</strong> ${user.email}</p>
            <p><strong>CPF/CNPJ:</strong> ${cleaned}</p>
            <p><strong>Documento:</strong> <a href="${publicUrl}">Ver Documento</a></p>
            <p>Acesse o painel administrativo para aprovar ou rejeitar esta solicitação.</p>
          `,
        }),
      })
    } catch (emailError) {
      console.error("[v0] Failed to send admin notification:", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Seller request submitted successfully",
      status: "pending",
    })
  } catch (error: any) {
    console.error("[v0] Error in seller-request:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
