import { NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { MercadoPagoConfig, Payment } from "mercadopago"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Check notification type
    if (body.type !== "payment") {
      return NextResponse.json({ received: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID not found" }, { status: 400 })
    }

    // Fetch payment details from MercadoPago
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    })

    const payment = new Payment(client)
    const paymentData = await payment.get({ id: paymentId })

    const orderNumber = paymentData.external_reference

    if (!orderNumber) {
      return NextResponse.json({ error: "Order number not found" }, { status: 400 })
    }

    // Map payment status
    let paymentStatus = "pending"
    let orderStatus = "pending"

    switch (paymentData.status) {
      case "approved":
        paymentStatus = "approved"
        orderStatus = "paid"
        break
      case "rejected":
      case "cancelled":
        paymentStatus = "rejected"
        orderStatus = "cancelled"
        break
      case "refunded":
        paymentStatus = "refunded"
        orderStatus = "refunded"
        break
    }

    // Update order
    await query(
      `UPDATE orders SET 
        payment_id = ?,
        payment_status = ?,
        status = ?,
        payment_method = ?
       WHERE order_number = ?`,
      [paymentId.toString(), paymentStatus, orderStatus, paymentData.payment_method_id || "mercadopago", orderNumber],
    )

    // If approved, create financial transaction
    if (paymentStatus === "approved") {
      const orders = (await query("SELECT id, store_id, total_amount FROM orders WHERE order_number = ?", [
        orderNumber,
      ])) as any[]

      if (orders.length > 0) {
        const order = orders[0]
        const commission = order.total_amount * 0.1 // 10% commission
        const netAmount = order.total_amount - commission

        await query(
          `INSERT INTO transactions (order_id, store_id, type, amount, fee, net_amount, status, payment_id, description)
           VALUES (?, ?, 'sale', ?, ?, ?, 'completed', ?, ?)`,
          [
            order.id,
            order.store_id,
            order.total_amount,
            commission,
            netAmount,
            paymentId.toString(),
            `Venda ${orderNumber}`,
          ],
        )

        // Update store balance
        await query("UPDATE stores SET balance = balance + ? WHERE id = ?", [netAmount, order.store_id])
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
