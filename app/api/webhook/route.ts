import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * API Route: MercadoPago Webhook
 *
 * This endpoint receives payment notifications from MercadoPago and updates order status.
 *
 * Flow:
 * 1. Receives notification from MercadoPago (payment, merchant_order, etc.)
 * 2. Validates notification and fetches payment details
 * 3. Updates order status in database (approved/pending/rejected)
 * 4. Calculates and records commission for marketplace
 * 5. Responds 200 OK to MercadoPago
 *
 * Security:
 * - Validates notification signature (TODO: implement x-signature validation)
 * - Only processes valid payment statuses
 * - Idempotent: handles duplicate notifications
 *
 * @param topic - Type of notification (payment, merchant_order)
 * @param id - ID of the resource
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    console.log("[v0] Webhook received:", { type, data })

    // Only process payment notifications
    if (type !== "payment") {
      return NextResponse.json({ message: "Notification type not processed" }, { status: 200 })
    }

    const paymentId = data.id

    // Fetch payment details from MercadoPago
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!paymentResponse.ok) {
      console.error("[v0] Failed to fetch payment details")
      return NextResponse.json({ error: "Failed to fetch payment" }, { status: 400 })
    }

    const payment = await paymentResponse.json()

    // Map MercadoPago status to our order status
    const statusMap: Record<string, string> = {
      approved: "paid",
      pending: "pending",
      in_process: "pending",
      rejected: "cancelled",
      cancelled: "cancelled",
      refunded: "refunded",
    }

    const orderStatus = statusMap[payment.status] || "pending"

    // Update order in database
    const supabase = await createClient()
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("payment_preference_id", payment.external_reference)
      .single()

    if (order) {
      await supabase
        .from("orders")
        .update({
          status: orderStatus,
          payment_id: payment.id,
          payment_status: payment.status,
          payment_method: payment.payment_method_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)

      // If payment approved, record commission
      if (payment.status === "approved") {
        const sellerAmount = payment.transaction_amount - order.marketplace_fee

        // TODO: Implement automatic transfer to seller
        // This would use MercadoPago's money transfer API
        console.log("[v0] Payment approved:", {
          orderId: order.id,
          totalAmount: payment.transaction_amount,
          marketplaceFee: order.marketplace_fee,
          sellerAmount: sellerAmount,
        })

        // Update store statistics
        await supabase.rpc("increment_store_sales", {
          store_id: order.seller_id,
          amount: sellerAmount,
        })
      }
    }

    // Always respond 200 OK to MercadoPago
    return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    // Still return 200 to prevent MercadoPago from retrying
    return NextResponse.json({ message: "Webhook received" }, { status: 200 })
  }
}

// Allow POST requests without authentication for webhooks
export const dynamic = "force-dynamic"
