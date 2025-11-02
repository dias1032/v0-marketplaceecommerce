import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const amount = Number.parseFloat(formData.get("amount") as string)
    const paymentMethod = formData.get("payment_method") as string
    const pixKey = formData.get("pix_key") as string

    if (!amount || amount < 10) {
      return NextResponse.json({ error: "Valor mínimo de R$ 10,00" }, { status: 400 })
    }

    if (!paymentMethod || !pixKey) {
      return NextResponse.json({ error: "Preencha todos os campos" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Get seller's store
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("*")
      .eq("seller_id", user.id)
      .single()

    if (storeError || !store) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Check if seller has enough balance
    if (store.balance < amount) {
      return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 })
    }

    // Create cashout transaction
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        store_id: store.id,
        type: "cashout",
        amount: amount,
        status: "pending",
        description: `Saque via ${paymentMethod === "pix" ? "PIX" : "Transferência Bancária"}`,
        metadata: {
          payment_method: paymentMethod,
          pix_key: pixKey,
        },
      })
      .select()
      .single()

    if (transactionError) {
      console.error("[v0] Error creating transaction:", transactionError)
      return NextResponse.json({ error: "Erro ao criar transação" }, { status: 500 })
    }

    // Update store balance
    const { error: updateError } = await supabase
      .from("stores")
      .update({
        balance: store.balance - amount,
      })
      .eq("id", store.id)

    if (updateError) {
      console.error("[v0] Error updating store balance:", updateError)
      return NextResponse.json({ error: "Erro ao atualizar saldo" }, { status: 500 })
    }

    // Redirect back to financials page
    return NextResponse.redirect(new URL("/seller/financials?success=true", request.url))
  } catch (error) {
    console.error("[v0] Cashout error:", error)
    return NextResponse.json({ error: "Erro ao processar saque" }, { status: 500 })
  }
}
