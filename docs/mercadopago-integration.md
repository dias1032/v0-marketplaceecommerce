# MercadoPago Integration Guide

## Overview

The Vestti marketplace uses MercadoPago for payment processing, including:
- Product checkout with marketplace fee split
- Seller subscription plans (Standard and Premium)
- Webhook notifications for payment status updates

## Architecture

### Frontend Integration

The MercadoPago SDK is loaded in `app/layout.tsx`:
\`\`\`html
<script src="https://sdk.mercadopago.com/js/v2"></script>
\`\`\`

The public key is fetched securely via server action to avoid exposing environment variables in client code.

### API Endpoints

#### 1. `/api/criar-pagamento` - Create Payment Preference

**Purpose:** Creates a MercadoPago checkout preference with marketplace fee calculation.

**Request:**
\`\`\`json
{
  "items": [
    {
      "title": "Product Name",
      "quantity": 1,
      "price": 99.90
    }
  ],
  "sellerId": "seller-uuid",
  "sellerPlan": "free",
  "buyerEmail": "buyer@example.com"
}
\`\`\`

**Response:**
\`\`\`json
{
  "preferenceId": "123456789-abcd-1234-5678-123456789abc",
  "initPoint": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=...",
  "sandboxInitPoint": "https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=..."
}
\`\`\`

**Marketplace Fee Calculation:**
- Free Plan: 15% commission
- Standard Plan: 10% commission
- Premium Plan: 5% commission

#### 2. `/api/webhook` - Payment Notifications

**Purpose:** Receives payment status updates from MercadoPago.

**Flow:**
1. MercadoPago sends POST request with payment notification
2. Endpoint fetches full payment details from MercadoPago API
3. Updates order status in database
4. Records commission for marketplace
5. Responds 200 OK to acknowledge receipt

**Status Mapping:**
- `approved` → `paid`
- `pending` → `pending`
- `in_process` → `pending`
- `rejected` → `cancelled`
- `cancelled` → `cancelled`
- `refunded` → `refunded`

#### 3. `/api/criar-assinatura` - Create Subscription

**Purpose:** Creates recurring subscriptions for seller plans.

**Request:**
\`\`\`json
{
  "planId": "standard",
  "payerEmail": "seller@example.com"
}
\`\`\`

**Response:**
\`\`\`json
{
  "subscriptionId": "abc123",
  "initPoint": "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_id=...",
  "status": "pending"
}
\`\`\`

**Plans:**
- Standard: R$ 59,90/month
- Premium: R$ 199,90/month

## Environment Variables

\`\`\`bash
# MercadoPago Credentials (Server-side only)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx-xxxxxx-xxxxx

MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxx

# Webhook Configuration
MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret

# Frontend URL for redirects
FRONTEND_URL=https://your-domain.com
NEXT_PUBLIC_VERCEL_URL=your-vercel-url.vercel.app
\`\`\`

**Security Note:** The public key is accessed through a server action (`getMercadoPagoPublicKey`) to prevent direct exposure in client-side code. The environment variable does NOT use the NEXT_PUBLIC prefix, ensuring it remains server-side only.

## Database Schema

### Stores Table
- `mercadopago_collector_id` - Seller's MercadoPago account ID for split payments
- `subscription_id` - MercadoPago subscription ID
- `subscription_status` - active, pending, cancelled, inactive

### Orders Table
- `payment_preference_id` - MercadoPago preference ID
- `payment_id` - MercadoPago payment ID
- `payment_status` - approved, pending, rejected, etc.
- `payment_method` - credit_card, pix, boleto, etc.

## Checkout Flow

1. **User adds items to cart** → Stored in localStorage
2. **User goes to checkout** → Fills shipping address
3. **User clicks "Finalizar Pedido"** → Frontend calls `/api/criar-pagamento`
4. **API creates preference** → Calculates marketplace fee based on seller plan
5. **User redirected to MercadoPago** → Completes payment on MercadoPago checkout
6. **MercadoPago processes payment** → Sends webhook notification
7. **Webhook updates order** → Order status updated in database
8. **User redirected back** → Success/failure/pending page

## Subscription Flow

1. **Seller views plans page** → `/seller/plans`
2. **Seller clicks "Fazer Upgrade"** → Form submits to server action
3. **Server action calls API** → `/api/criar-assinatura`
4. **API creates subscription** → MercadoPago preapproval
5. **Seller redirected to MercadoPago** → Authorizes recurring payment
6. **MercadoPago processes** → Sends webhook notification
7. **Subscription activated** → Store plan updated in database

## Testing

### Test Cards (Sandbox)
- **Approved:** 5031 7557 3453 0604
- **Rejected:** 5031 4332 1540 6351
- **Pending:** 5031 4332 1540 6351

### Webhook Testing
Use ngrok or similar tool to expose local webhook endpoint:
\`\`\`bash
ngrok http 3000
\`\`\`

Configure webhook URL in MercadoPago dashboard:
\`\`\`
https://your-ngrok-url.ngrok.io/api/webhook
\`\`\`

## Security Considerations

1. **Never expose access token** - Only use in server-side code
2. **Use server actions for public keys** - Fetch via `getMercadoPagoPublicKey()` instead of direct env access
3. **Validate webhook signatures** - Implement x-signature validation
4. **Use HTTPS in production** - Required for PCI compliance
5. **Sanitize user inputs** - Prevent injection attacks
6. **Rate limit API endpoints** - Prevent abuse

## Troubleshooting

### Payment not updating
- Check webhook URL is accessible
- Verify webhook is responding 200 OK
- Check MercadoPago dashboard for failed notifications

### Subscription not activating
- Verify seller email is correct
- Check subscription status in MercadoPago dashboard
- Ensure preapproval was authorized by seller

### Split payment not working
- Verify seller has `mercadopago_collector_id` configured
- Check marketplace fee calculation
- Ensure collector_id is valid MercadoPago account
