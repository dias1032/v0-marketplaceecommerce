import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * API Route: Create VIP Store Subscription
 *
 * Creates a VIP subscription for a customer to a specific store.
 * The platform retains 10% of the subscription value.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storeId, payerEmail } = body

    if (!storeId || !payerEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get store VIP plan details
    const { data: store } = await supabase.from("stores").select("*").eq("id", storeId).single()

    if (!store || !store.vip_plan_enabled) {
      return NextResponse.json({ error: "VIP plan not available" }, { status: 400 })
    }

    // Create MercadoPago subscription
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    const frontendUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"

    const planData = {
      reason: `Plano VIP - ${store.name}`,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: store.vip_plan_price,
        currency_id: "BRL",
      },
      back_url: `${frontendUrl}/loja/${store.slug}`,
      payer_email: payerEmail,
    }

    const response = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(planData),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("[v0] MercadoPago VIP Subscription Error:", error)
      return NextResponse.json({ error: "Failed to create subscription" }, { status: response.status })
    }

    const subscription = await response.json()

    // Create VIP subscription record
    await supabase.from("store_vip_subscriptions").insert({
      store_id: storeId,
      user_id: user.id,
      payment_id: subscription.id,
      status: "active",
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })

    return NextResponse.json({
      subscriptionId: subscription.id,
      initPoint: subscription.init_point,
      status: subscription.status,
    })
  } catch (error) {
    console.error("[v0] Error creating VIP subscription:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
