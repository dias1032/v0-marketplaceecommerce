import { type NextRequest, NextResponse } from "next/server"

// Mock orders storage (in-memory for demo)
const mockOrders: any[] = []

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get("id")
  const userId = searchParams.get("user_id")

  // Return single order if ID provided
  if (id) {
    const order = mockOrders.find((o) => o.order_id === id)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    return NextResponse.json(order)
  }

  // Filter by user_id if provided
  if (userId) {
    const userOrders = mockOrders.filter((o) => o.user_id === userId)
    return NextResponse.json(userOrders)
  }

  // Return all orders
  return NextResponse.json(mockOrders)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, items, address, payment_method } = body

    if (!user_id || !items || !address) {
      return NextResponse.json({ error: "Missing required fields: user_id, items, address" }, { status: 400 })
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.qty, 0)
    const shipping = 15.0 // Mock shipping cost
    const total = subtotal + shipping

    const newOrder = {
      order_id: `order_${Date.now()}`,
      user_id,
      items,
      address,
      payment_method: payment_method || "credit_card",
      subtotal,
      shipping_cost: shipping,
      total,
      status: "created",
      payment_url: `https://mercadopago.com/checkout/${Date.now()}`, // Mock payment URL
      created_at: new Date().toISOString(),
      tracking_code: null,
    }

    mockOrders.push(newOrder)

    console.log("[v0] Mock order created:", newOrder)

    return NextResponse.json(newOrder, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Update order status (for webhooks/admin)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { order_id, status, tracking_code } = body

    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 })
    }

    const orderIndex = mockOrders.findIndex((o) => o.order_id === order_id)
    if (orderIndex === -1) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (status) mockOrders[orderIndex].status = status
    if (tracking_code) mockOrders[orderIndex].tracking_code = tracking_code
    mockOrders[orderIndex].updated_at = new Date().toISOString()

    console.log("[v0] Mock order updated:", mockOrders[orderIndex])

    return NextResponse.json({ success: true, order: mockOrders[orderIndex] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
