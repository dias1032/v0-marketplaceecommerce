import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch order details with all related data
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        *,
        profiles!orders_buyer_id_fkey (
          full_name,
          email
        ),
        order_items (
          *,
          products (
            name,
            sku,
            images
          ),
          stores (
            name,
            seller_id,
            profiles!stores_seller_id_fkey (
              full_name,
              email
            )
          )
        )
      `,
      )
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Group items by store for seller emails
    const itemsByStore = order.order_items.reduce(
      (acc: any, item: any) => {
        const storeId = item.store_id
        if (!acc[storeId]) {
          acc[storeId] = {
            store: item.stores,
            items: [],
            total: 0,
          }
        }
        acc[storeId].items.push(item)
        acc[storeId].total += item.price * item.quantity
        return acc
      },
      {} as Record<string, any>,
    )

    // Send email to buyer
    const buyerEmailResponse = await fetch(
      `${process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/api/send-onesignal-email`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: order.profiles.email,
          subject: `Pedido Confirmado #${order.order_code}`,
          html: generateBuyerEmailHTML(order),
        }),
      },
    )

    // Send email to each seller
    for (const storeId in itemsByStore) {
      const storeData = itemsByStore[storeId]
      const sellerEmail = storeData.store.profiles.email

      await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/api/send-onesignal-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: sellerEmail,
          subject: `Nova Venda! Pedido #${order.order_code}`,
          html: generateSellerEmailHTML(order, storeData),
        }),
      })
    }

    return NextResponse.json({ success: true, message: "Emails sent successfully" })
  } catch (error) {
    console.error("[v0] Error sending order emails:", error)
    return NextResponse.json({ error: "Failed to send emails" }, { status: 500 })
  }
}

function generateBuyerEmailHTML(order: any): string {
  const itemsHTML = order.order_items
    .map(
      (item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <strong>${item.products.name}</strong><br>
        <small style="color: #666;">SKU: ${item.products.sku}</small><br>
        <small style="color: #666;">Loja: ${item.stores.name}</small>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">R$ ${item.price.toFixed(2)}</td>
    </tr>
  `,
    )
    .join("")

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Pedido Confirmado</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Pedido Confirmado!</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p>Olá <strong>${order.profiles.full_name}</strong>,</p>
        
        <p>Seu pedido foi confirmado com sucesso! Aqui estão os detalhes:</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #667eea;">Pedido #${order.order_code}</h2>
          <p><strong>Data:</strong> ${new Date(order.created_at).toLocaleDateString("pt-BR")}</p>
          <p><strong>Status:</strong> ${order.status === "paid" ? "Pago" : "Pendente"}</p>
          
          <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 12px; text-align: left;">Produto</th>
                <th style="padding: 12px; text-align: center;">Qtd</th>
                <th style="padding: 12px; text-align: right;">Preço</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px; text-align: right;"><strong>Subtotal:</strong></td>
                <td style="padding: 12px; text-align: right;"><strong>R$ ${order.subtotal.toFixed(2)}</strong></td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 12px; text-align: right;"><strong>Frete:</strong></td>
                <td style="padding: 12px; text-align: right;"><strong>R$ ${order.shipping_cost.toFixed(2)}</strong></td>
              </tr>
              <tr style="background: #f5f5f5;">
                <td colspan="2" style="padding: 12px; text-align: right;"><strong>Total:</strong></td>
                <td style="padding: 12px; text-align: right;"><strong style="color: #667eea; font-size: 1.2em;">R$ ${order.total.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Endereço de Entrega</h3>
          <p style="margin: 5px 0;">${order.shipping_address.street}, ${order.shipping_address.number}</p>
          ${order.shipping_address.complement ? `<p style="margin: 5px 0;">${order.shipping_address.complement}</p>` : ""}
          <p style="margin: 5px 0;">${order.shipping_address.neighborhood}</p>
          <p style="margin: 5px 0;">${order.shipping_address.city} - ${order.shipping_address.state}</p>
          <p style="margin: 5px 0;">CEP: ${order.shipping_address.zipcode}</p>
        </div>
        
        <p style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/pedido/${order.id}" 
             style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Acompanhar Pedido
          </a>
        </p>
        
        <p style="color: #666; font-size: 0.9em; text-align: center; margin-top: 30px;">
          Obrigado por comprar na Vestti!<br>
          Em caso de dúvidas, entre em contato conosco.
        </p>
      </div>
    </body>
    </html>
  `
}

function generateSellerEmailHTML(order: any, storeData: any): string {
  const itemsHTML = storeData.items
    .map(
      (item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <strong>${item.products.name}</strong><br>
        <small style="color: #666;">SKU: ${item.products.sku}</small>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">R$ ${item.price.toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">R$ ${item.commission_amount.toFixed(2)}</td>
    </tr>
  `,
    )
    .join("")

  const totalCommission = storeData.items.reduce((sum: number, item: any) => sum + item.commission_amount, 0)
  const sellerEarnings = storeData.total - totalCommission

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nova Venda</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🎉 Nova Venda!</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p>Olá <strong>${storeData.store.profiles.full_name}</strong>,</p>
        
        <p>Você recebeu um novo pedido na sua loja <strong>${storeData.store.name}</strong>!</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #11998e;">Pedido #${order.order_code}</h2>
          <p><strong>Data:</strong> ${new Date(order.created_at).toLocaleDateString("pt-BR")}</p>
          <p><strong>Cliente:</strong> ${order.profiles.full_name}</p>
          
          <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 12px; text-align: left;">Produto</th>
                <th style="padding: 12px; text-align: center;">Qtd</th>
                <th style="padding: 12px; text-align: right;">Preço</th>
                <th style="padding: 12px; text-align: right;">Comissão</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 12px; text-align: right;"><strong>Total da Venda:</strong></td>
                <td style="padding: 12px; text-align: right;"><strong>R$ ${storeData.total.toFixed(2)}</strong></td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 12px; text-align: right;"><strong>Comissão Vestti:</strong></td>
                <td style="padding: 12px; text-align: right;"><strong style="color: #e74c3c;">- R$ ${totalCommission.toFixed(2)}</strong></td>
              </tr>
              <tr style="background: #f5f5f5;">
                <td colspan="3" style="padding: 12px; text-align: right;"><strong>Seu Ganho:</strong></td>
                <td style="padding: 12px; text-align: right;"><strong style="color: #11998e; font-size: 1.2em;">R$ ${sellerEarnings.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Endereço de Entrega</h3>
          <p style="margin: 5px 0;">${order.shipping_address.street}, ${order.shipping_address.number}</p>
          ${order.shipping_address.complement ? `<p style="margin: 5px 0;">${order.shipping_address.complement}</p>` : ""}
          <p style="margin: 5px 0;">${order.shipping_address.neighborhood}</p>
          <p style="margin: 5px 0;">${order.shipping_address.city} - ${order.shipping_address.state}</p>
          <p style="margin: 5px 0;">CEP: ${order.shipping_address.zipcode}</p>
        </div>
        
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0;"><strong>⚠️ Ação Necessária:</strong></p>
          <p style="margin: 5px 0 0 0;">Prepare os produtos para envio e atualize o status do pedido no painel do vendedor.</p>
        </div>
        
        <p style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/seller/orders" 
             style="background: #11998e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Ver Pedido no Painel
          </a>
        </p>
        
        <p style="color: #666; font-size: 0.9em; text-align: center; margin-top: 30px;">
          Continue vendendo na Vestti!<br>
          Em caso de dúvidas, acesse a Central de Ajuda.
        </p>
      </div>
    </body>
    </html>
  `
}
