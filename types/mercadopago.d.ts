/**
 * MercadoPago SDK Type Definitions
 *
 * This file provides TypeScript definitions for the MercadoPago JavaScript SDK.
 * The SDK is loaded via CDN in the layout.tsx file.
 */

interface Window {
  MercadoPago: new (publicKey: string, options?: MercadoPagoOptions) => MercadoPagoInstance
}

interface MercadoPagoOptions {
  locale?: "pt-BR" | "es-AR" | "es-MX" | "en-US"
  advancedFraudPrevention?: boolean
}

interface MercadoPagoInstance {
  checkout: (options: CheckoutOptions) => void
  getIdentificationTypes: () => Promise<IdentificationType[]>
  getPaymentMethods: (options: PaymentMethodOptions) => Promise<PaymentMethod[]>
  getIssuers: (options: IssuerOptions) => Promise<Issuer[]>
  getInstallments: (options: InstallmentOptions) => Promise<Installment[]>
  createCardToken: (cardData: CardData) => Promise<CardToken>
}

interface CheckoutOptions {
  preference: {
    id: string
  }
  render?: {
    container?: string
    label?: string
  }
  autoOpen?: boolean
}

interface IdentificationType {
  id: string
  name: string
  type: string
  min_length: number
  max_length: number
}

interface PaymentMethodOptions {
  bin: string
}

interface PaymentMethod {
  id: string
  name: string
  payment_type_id: string
  thumbnail: string
  secure_thumbnail: string
}

interface IssuerOptions {
  paymentMethodId: string
  bin: string
}

interface Issuer {
  id: string
  name: string
  thumbnail: string
  processing_mode: string
}

interface InstallmentOptions {
  amount: string
  bin: string
  paymentMethodId: string
}

interface Installment {
  payment_method_id: string
  payment_type_id: string
  issuer: {
    id: string
    name: string
  }
  payer_costs: PayerCost[]
}

interface PayerCost {
  installments: number
  installment_rate: number
  discount_rate: number
  labels: string[]
  installment_amount: number
  total_amount: number
  payment_method_option_id: string
}

interface CardData {
  cardNumber: string
  cardholderName: string
  cardExpirationMonth: string
  cardExpirationYear: string
  securityCode: string
  identificationType: string
  identificationNumber: string
}

interface CardToken {
  id: string
  public_key: string
  card_id: string
  status: string
  date_created: string
  date_last_updated: string
  date_due: string
  luhn_validation: boolean
  live_mode: boolean
  require_esc: boolean
  card_number_length: number
  security_code_length: number
}
