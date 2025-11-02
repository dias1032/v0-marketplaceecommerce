import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * API Route: Create Seller Subscription
 *
 * This endpoint creates recurring subscriptions for sellers (Standard or Premium plans).
 *
 * Flow:
 * 1. Receives plan type (standard/premium) and seller email
 * 2. Creates MercadoPago subscription with recurring billing
 * 3. Updates seller's plan in database
 * 4. Returns subscription details
 *
 * Plans:
 * - Standard: R$ 59,90/month (10% commission)
 * - Premium: R$ 199,90/month (5% commission)
 *
 * @param planId - Plan type (standard/premium)
 * @param payerEmail - Seller's email for billing
 * @returns subscriptionId - MercadoPago subscription ID
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, payerEmail } = body

    // Validate required fields
    if (!planId || !payerEmail) {
      return NextResponse.json({ error: "Missing required fields: planId, payerEmail" }, { status: 400 })
    }

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Define plan details
    const plans: Record<string, { price: number; name: string; description: string; commission: number }> = {
      mid: {
        price: 89.9,
        name: "Plano Mid",
        description: "Taxa de 10% por venda + recursos avançados",
        commission: 10.0,
      },
      master: {
        price: 179.9,
        name: "Plano Master",
        description: "Taxa de 5% por venda + máxima prioridade",
        commission: 5.0,
      },
    }

    const selectedPlan = plans[planId.toLowerCase()]
    if (!selectedPlan) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 })
    }

    // Create MercadoPago subscription
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    const frontendUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"

    // First, create a preapproval plan
    const planData = {
      reason: selectedPlan.name,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: selectedPlan.price,
        currency_id: "BRL",
      },
      back_url: `${frontendUrl}/seller/dashboard`,
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
      console.error("[v0] MercadoPago Subscription Error:", error)
      return NextResponse.json({ error: "Failed to create subscription", details: error }, { status: response.status })
    }

    const subscription = await response.json()

    // Update seller's plan in database
    await supabase
      .from("stores")
      .update({
        subscription_plan: planId.toLowerCase(),
        subscription_payment_id: subscription.id,
        subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        commission_rate: selectedPlan.commission,
        updated_at: new Date().toISOString(),
      })
      .eq("seller_id", user.id)

    return NextResponse.json({
      subscriptionId: subscription.id,
      initPoint: subscription.init_point,
      status: subscription.status,
    })
  } catch (error) {
    console.error("[v0] Error creating subscription:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
