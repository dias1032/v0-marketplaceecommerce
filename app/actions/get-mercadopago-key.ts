"use server"

/**
 * Server Action: Get MercadoPago Public Key
 *
 * Returns the MercadoPago public key for client-side SDK initialization.
 * This keeps the environment variable on the server side only.
 */
export async function getMercadoPagoPublicKey() {
  const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY

  if (!publicKey) {
    throw new Error("MercadoPago public key not configured")
  }

  return publicKey
}
