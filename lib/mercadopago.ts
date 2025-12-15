import { MercadoPagoConfig, Preference, Payment } from "mercadopago"

// Configurar cliente do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

const preference = new Preference(client)
const payment = new Payment(client)

export interface CreatePreferenceParams {
  orderId: number
  orderNumber: string
  items: {
    title: string
    quantity: number
    unit_price: number
    picture_url?: string
  }[]
  payer: {
    email: string
    name: string
  }
  shipping_cost?: number
}

// Criar preferência de pagamento
export async function createPaymentPreference(params: CreatePreferenceParams) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  try {
    const response = await preference.create({
      body: {
        items: params.items.map((item) => ({
          id: `item-${params.orderId}`,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: "BRL",
          picture_url: item.picture_url,
        })),
        payer: {
          email: params.payer.email,
          name: params.payer.name,
        },
        back_urls: {
          success: `${siteUrl}/pedido/sucesso?order=${params.orderNumber}`,
          failure: `${siteUrl}/pedido/erro?order=${params.orderNumber}`,
          pending: `${siteUrl}/pedido/pendente?order=${params.orderNumber}`,
        },
        auto_return: "approved",
        external_reference: params.orderNumber,
        notification_url: `${siteUrl}/api/webhooks/mercadopago`,
        shipments: params.shipping_cost
          ? {
              cost: params.shipping_cost,
              mode: "not_specified",
            }
          : undefined,
      },
    })

    return {
      success: true,
      preferenceId: response.id,
      initPoint: response.init_point,
      sandboxInitPoint: response.sandbox_init_point,
    }
  } catch (error: any) {
    console.error("Erro ao criar preferência:", error)
    return {
      success: false,
      error: error.message || "Erro ao criar pagamento",
    }
  }
}

// Buscar pagamento pelo ID
export async function getPayment(paymentId: string) {
  try {
    const response = await payment.get({ id: paymentId })
    return { success: true, payment: response }
  } catch (error: any) {
    console.error("Erro ao buscar pagamento:", error)
    return { success: false, error: error.message }
  }
}

// Mapear status do Mercado Pago para status do pedido
export function mapPaymentStatus(status: string): "pending" | "approved" | "rejected" | "refunded" {
  switch (status) {
    case "approved":
      return "approved"
    case "rejected":
    case "cancelled":
      return "rejected"
    case "refunded":
      return "refunded"
    default:
      return "pending"
  }
}

export function mapOrderStatus(paymentStatus: string): "pending" | "paid" | "cancelled" {
  switch (paymentStatus) {
    case "approved":
      return "paid"
    case "rejected":
    case "cancelled":
      return "cancelled"
    default:
      return "pending"
  }
}

export { client }
