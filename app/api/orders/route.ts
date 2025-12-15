import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { createPaymentPreference } from "@/lib/mercadopago"

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `VST-${timestamp}-${random}`
}

// GET - Listar pedidos do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const asSeller = searchParams.get("as_seller") === "true"

    let orders: any[]

    if (asSeller && (session.user.role === "seller" || session.user.role === "admin")) {
      // Buscar pedidos da loja do vendedor
      orders = await query<any[]>(
        `SELECT o.*, u.full_name as customer_name, u.email as customer_email
         FROM orders o
         JOIN users u ON o.user_id = u.id
         JOIN stores s ON o.store_id = s.id
         WHERE s.user_id = ?
         ORDER BY o.created_at DESC`,
        [session.user.id],
      )
    } else {
      // Buscar pedidos do cliente
      orders = await query<any[]>(
        `SELECT o.*, s.store_name
         FROM orders o
         JOIN stores s ON o.store_id = s.id
         WHERE o.user_id = ?
         ORDER BY o.created_at DESC`,
        [session.user.id],
      )
    }

    // Buscar itens de cada pedido
    for (const order of orders) {
      const items = await query<any[]>(
        `SELECT oi.*, p.title, p.images
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id],
      )
      order.items = items.map((item) => ({
        ...item,
        images: typeof item.images === "string" ? JSON.parse(item.images) : item.images || [],
      }))
      order.shipping_address =
        typeof order.shipping_address === "string" ? JSON.parse(order.shipping_address) : order.shipping_address
    }

    return NextResponse.json({ orders })
  } catch (error: any) {
    console.error("Erro ao listar pedidos:", error)
    return NextResponse.json({ error: "Erro ao listar pedidos" }, { status: 500 })
  }
}

// POST - Criar pedido
export async function POST(request: NextRequest) {
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

    // Agrupar itens por loja
    const productIds = items.map((i: any) => i.product_id)
    const placeholders = productIds.map(() => "?").join(",")

    const products = await query<any[]>(
      `SELECT p.*, s.store_name FROM products p
       JOIN stores s ON p.store_id = s.id
       WHERE p.id IN (${placeholders})`,
      productIds,
    )

    // Verificar estoque e calcular totais
    const itemsByStore: Record<number, any[]> = {}
    let totalAmount = 0

    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id)
      if (!product) {
        return NextResponse.json({ error: `Produto ${item.product_id} não encontrado` }, { status: 400 })
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Estoque insuficiente para ${product.title}` }, { status: 400 })
      }

      if (!itemsByStore[product.store_id]) {
        itemsByStore[product.store_id] = []
      }

      const itemTotal = product.price * item.quantity
      totalAmount += itemTotal

      itemsByStore[product.store_id].push({
        product,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: itemTotal,
      })
    }

    // Criar pedidos por loja
    const createdOrders: any[] = []

    for (const [storeId, storeItems] of Object.entries(itemsByStore)) {
      const orderNumber = generateOrderNumber()
      const subtotal = storeItems.reduce((sum, item) => sum + item.total_price, 0)
      const orderTotal = subtotal + shipping_cost

      // Criar pedido
      const orderResult = await query<any>(
        `INSERT INTO orders (order_number, user_id, store_id, subtotal, shipping_cost, total_amount, shipping_address)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderNumber, session.user.id, storeId, subtotal, shipping_cost, orderTotal, JSON.stringify(shipping_address)],
      )

      const orderId = orderResult.insertId

      // Criar itens do pedido e atualizar estoque
      for (const item of storeItems) {
        await query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, product_snapshot)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.product.id,
            item.quantity,
            item.unit_price,
            item.total_price,
            JSON.stringify({
              title: item.product.title,
              images: item.product.images,
            }),
          ],
        )

        // Atualizar estoque
        await query("UPDATE products SET stock = stock - ? WHERE id = ?", [item.quantity, item.product.id])
      }

      // Criar preferência de pagamento no Mercado Pago
      const paymentResult = await createPaymentPreference({
        orderId,
        orderNumber,
        items: storeItems.map((item) => ({
          title: item.product.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          picture_url: item.product.images?.[0],
        })),
        payer: {
          email: session.user.email,
          name: session.user.full_name,
        },
        shipping_cost,
      })

      createdOrders.push({
        orderId,
        orderNumber,
        total: orderTotal,
        paymentUrl: paymentResult.initPoint,
        sandboxUrl: paymentResult.sandboxInitPoint,
      })
    }

    // Limpar carrinho
    await query("DELETE FROM cart_items WHERE user_id = ?", [session.user.id])

    return NextResponse.json({
      success: true,
      orders: createdOrders,
    })
  } catch (error: any) {
    console.error("Erro ao criar pedido:", error)
    return NextResponse.json({ error: "Erro ao criar pedido" }, { status: 500 })
  }
}
