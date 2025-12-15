import { NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { getSession } from "@/lib/auth/session"
import { MercadoPagoConfig, Preference } from "mercadopago"

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `VST-${timestamp}-${random}`
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { items, shipping_address, shipping_cost = 0 } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 })
    }

    // Fetch product details
    const productIds = items.map((i: any) => i.product_id)
    const placeholders = productIds.map(() => "?").join(",")

    const products = (await query(
      `SELECT p.*, s.store_name FROM products p
       JOIN stores s ON p.store_id = s.id
       WHERE p.id IN (${placeholders})`,
      productIds,
    )) as any[]

    // Validate stock and calculate totals
    let totalAmount = 0
    const orderItems: any[] = []

    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id)
      if (!product) {
        return NextResponse.json({ error: `Produto ${item.product_id} não encontrado` }, { status: 400 })
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Estoque insuficiente para ${product.title}` }, { status: 400 })
      }

      const itemTotal = product.price * item.quantity
      totalAmount += itemTotal

      orderItems.push({
        product,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: itemTotal,
      })
    }

    // Create order
    const orderNumber = generateOrderNumber()
    const orderTotal = totalAmount + shipping_cost

    // Get store_id from first product
    const storeId = products[0].store_id

    const orderResult = (await query(
      `INSERT INTO orders (order_number, user_id, store_id, subtotal, shipping_cost, total_amount, shipping_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [orderNumber, session.id, storeId, totalAmount, shipping_cost, orderTotal, JSON.stringify(shipping_address)],
    )) as any

    const orderId = orderResult.insertId

    // Create order items
    for (const item of orderItems) {
      await query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, product_snapshot)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product.id,
          item.quantity,
          item.unit_price,
          item.total_price,
          JSON.stringify({ title: item.product.title, images: item.product.images }),
        ],
      )

      // Update stock
      await query("UPDATE products SET stock = stock - ? WHERE id = ?", [item.quantity, item.product.id])
    }

    // Create MercadoPago preference
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    })

    const preference = new Preference(client)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    const mpResponse = await preference.create({
      body: {
        items: orderItems.map((item) => ({
          id: item.product.id.toString(),
          title: item.product.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: "BRL",
        })),
        back_urls: {
          success: `${siteUrl}/pedido/sucesso?order=${orderNumber}`,
          failure: `${siteUrl}/pedido/erro?order=${orderNumber}`,
          pending: `${siteUrl}/pedido/pendente?order=${orderNumber}`,
        },
        auto_return: "approved",
        external_reference: orderNumber,
        notification_url: `${siteUrl}/api/webhooks/mercadopago`,
      },
    })

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        orderNumber,
        total: orderTotal,
      },
      payment: {
        preferenceId: mpResponse.id,
        initPoint: mpResponse.init_point,
        sandboxInitPoint: mpResponse.sandbox_init_point,
      },
    })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Erro ao criar pedido" }, { status: 500 })
  }
}
