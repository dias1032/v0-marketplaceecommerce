/**
 * Mercado Pago Integration Adapter
 * Handles payment processing with marketplace split
 * TODO_INTEGRATION: Replace mock implementation with actual Mercado Pago SDK
 */

const USE_MOCK = true

class MercadoPagoAdapter {
  constructor() {
    if (USE_MOCK) {
      console.log("[MercadoPago] Using mock mode")
    } else {
      // TODO_INTEGRATION: Initialize Mercado Pago SDK
      // const mp = new MercadoPago('PUBLIC_KEY');
      // this.mp = mp;
    }
  }

  /**
   * Create payment preference with marketplace split
   * @param {Object} orderData - Order details
   * @param {number} platformFee - Platform commission percentage (e.g., 10 for 10%)
   */
  async createPreference(orderData, platformFee = 10) {
    if (USE_MOCK) {
      console.log("[MercadoPago] Mock createPreference:", orderData)
      return {
        id: "mock-preference-" + Date.now(),
        init_point: "#mock-payment-url",
        sandbox_init_point: "#mock-payment-url",
      }
    }

    // TODO_INTEGRATION: Create real payment preference
    // Calculate split amounts
    const totalAmount = orderData.total
    const feeAmount = (totalAmount * platformFee) / 100
    const sellerAmount = totalAmount - feeAmount

    // const preference = {
    //   items: orderData.items.map(item => ({
    //     title: item.name,
    //     quantity: item.quantity,
    //     unit_price: item.price,
    //     currency_id: 'BRL'
    //   })),
    //   payer: {
    //     email: orderData.buyerEmail
    //   },
    //   back_urls: {
    //     success: `${window.location.origin}/order-success`,
    //     failure: `${window.location.origin}/checkout`,
    //     pending: `${window.location.origin}/order-pending`
    //   },
    //   auto_return: 'approved',
    //   marketplace_fee: feeAmount,
    //   marketplace: 'MARKETPLACE_ID',
    //   notification_url: `${API_BASE_URL}/webhooks/mercadopago`,
    //   external_reference: orderData.orderId,
    //   statement_descriptor: 'MARKETPLACE_NAME'
    // };

    // const response = await fetch('/api/payments/create-preference', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(preference)
    // });

    // return await response.json();
  }

  /**
   * Process card payment with split
   */
  async processCardPayment(paymentData, platformFee = 10) {
    if (USE_MOCK) {
      console.log("[MercadoPago] Mock processCardPayment:", paymentData)
      return {
        id: "mock-payment-" + Date.now(),
        status: "approved",
        status_detail: "accredited",
      }
    }

    // TODO_INTEGRATION: Process real card payment
    // const payment = {
    //   transaction_amount: paymentData.amount,
    //   token: paymentData.cardToken,
    //   description: paymentData.description,
    //   installments: paymentData.installments,
    //   payment_method_id: paymentData.paymentMethodId,
    //   payer: {
    //     email: paymentData.email
    //   },
    //   marketplace_fee: (paymentData.amount * platformFee) / 100,
    //   external_reference: paymentData.orderId
    // };

    // const response = await fetch('/api/payments/process', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payment)
    // });

    // return await response.json();
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId) {
    if (USE_MOCK) {
      console.log("[MercadoPago] Mock getPaymentStatus:", paymentId)
      return {
        id: paymentId,
        status: "approved",
        status_detail: "accredited",
      }
    }

    // TODO_INTEGRATION: Get real payment status
    // const response = await fetch(`/api/payments/${paymentId}`);
    // return await response.json();
  }

  /**
   * Create card token (client-side)
   */
  async createCardToken(cardData) {
    if (USE_MOCK) {
      console.log("[MercadoPago] Mock createCardToken")
      return {
        id: "mock-token-" + Date.now(),
      }
    }

    // TODO_INTEGRATION: Create real card token
    // const token = await this.mp.createCardToken({
    //   cardNumber: cardData.number,
    //   cardholderName: cardData.name,
    //   cardExpirationMonth: cardData.expMonth,
    //   cardExpirationYear: cardData.expYear,
    //   securityCode: cardData.cvv,
    //   identificationType: cardData.docType,
    //   identificationNumber: cardData.docNumber
    // });
    // return token;
  }

  /**
   * Get installment options
   */
  async getInstallments(amount, paymentMethodId) {
    if (USE_MOCK) {
      console.log("[MercadoPago] Mock getInstallments")
      return [
        { installments: 1, installment_amount: amount, total_amount: amount },
        { installments: 2, installment_amount: amount / 2, total_amount: amount },
        { installments: 3, installment_amount: amount / 3, total_amount: amount },
      ]
    }

    // TODO_INTEGRATION: Get real installment options
    // const response = await fetch(
    //   `/api/payments/installments?amount=${amount}&payment_method_id=${paymentMethodId}`
    // );
    // return await response.json();
  }
}

export const mercadoPago = new MercadoPagoAdapter()
