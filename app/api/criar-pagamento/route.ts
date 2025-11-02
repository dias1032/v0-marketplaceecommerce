import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * API Route: Create Payment Preference
 *
 * This endpoint creates a MercadoPago payment preference with marketplace fee calculation.
 *
 * Flow:
 * 1. Receives cart items, seller info, and plan from frontend
 * 2. Calculates marketplace fee based on seller plan (Free: 15%, Standard: 10%, Premium: 5%)
 * 3. Creates MercadoPago preference with split payment configuration
 * 4. Returns preference ID for frontend to open checkout
 *
 * @param items - Array of products with title, quantity, price
 * @param sellerId - ID of the seller receiving payment
 * @param sellerPlan - Seller's subscription plan (free/standard/premium)
 * @returns preferenceId - MercadoPago preference ID for checkout
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, sellerId, sellerPlan, buyerEmail } = body

    // Validate required fields
    if (!items || !sellerId || !sellerPlan) {
      return NextResponse.json({ error: "Missing required fields: items, sellerId, sellerPlan" }, { status: 400 })
    }

    // Calculate marketplace fee based on seller plan
    const feePercentages: Record<string, number> = {
      free: 15,
      standard: 10,
      premium: 5,
    }
    const feePercentage = feePercentages[sellerPlan.toLowerCase()] || 15

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    const marketplaceFee = (totalAmount * feePercentage) / 100

    // Get seller's MercadoPago collector ID from database
    const supabase = await createClient()
    const { data: store } = await supabase
      .from("stores")
      .select("mercadopago_collector_id")
      .eq("seller_id", sellerId)
      .single()

    if (!store?.mercadopago_collector_id) {
      return NextResponse.json({ error: "Seller has not configured MercadoPago account" }, { status: 400 })
    }

    // Create MercadoPago preference
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    const frontendUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"

    const preferenceData = {
      items: items.map((item: any) => ({
        title: item.title || item.name,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: "BRL",
      })),
      marketplace_fee: marketplaceFee,
      marketplace: "VESTTI",
      collector_id: store.mercadopago_collector_id,
      payer: {
        email: buyerEmail,
      },
      back_urls: {
        success: `${frontendUrl}/checkout/success`,
        failure: `${frontendUrl}/checkout/failure`,
        pending: `${frontendUrl}/checkout/pending`,
      },
      auto_return: "approved",
      notification_url: `${frontendUrl}/api/webhook`,
      metadata: {
        seller_id: sellerId,
        seller_plan: sellerPlan,
        fee_percentage: feePercentage,
      },
    }

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preferenceData),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("[v0] MercadoPago API Error:", error)
      return NextResponse.json(
        { error: "Failed to create payment preference", details: error },
        { status: response.status },
      )
    }

    const preference = await response.json()

    // Store order in database
    const { data: user } = await supabase.auth.getUser()
    if (user.user) {
      await supabase.from("orders").insert({
        buyer_id: user.user.id,
        seller_id: sellerId,
        total_amount: totalAmount,
        marketplace_fee: marketplaceFee,
        status: "pending",
        payment_preference_id: preference.id,
        items: items,
      })
    }

    return NextResponse.json({
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    })
  } catch (error) {
    console.error("[v0] Error creating payment:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
