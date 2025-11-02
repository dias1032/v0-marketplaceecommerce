/**
 * Melhor Envio Integration Adapter
 * Handles shipping calculation, label generation, and tracking
 * TODO_INTEGRATION: Replace mock implementation with actual Melhor Envio API
 */

const USE_MOCK = true

class MelhorEnvioAdapter {
  constructor() {
    if (USE_MOCK) {
      console.log("[MelhorEnvio] Using mock mode")
    }
  }

  /**
   * Calculate shipping options
   */
  async calculateShipping(shippingData) {
    if (USE_MOCK) {
      console.log("[MelhorEnvio] Mock calculateShipping:", shippingData)
      return [
        {
          id: 1,
          name: "PAC",
          company: { name: "Correios", picture: "/public/correios-logo.png" },
          price: "15.50",
          delivery_time: 7,
          currency: "R$",
        },
        {
          id: 2,
          name: "SEDEX",
          company: { name: "Correios", picture: "/public/correios-logo.png" },
          price: "25.90",
          delivery_time: 3,
          currency: "R$",
        },
        {
          id: 3,
          name: "Expresso",
          company: { name: "Jadlog", picture: "/public/jadlog-logo.png" },
          price: "22.00",
          delivery_time: 4,
          currency: "R$",
        },
      ]
    }

    // TODO_INTEGRATION: Calculate real shipping
    // const payload = {
    //   from: {
    //     postal_code: shippingData.fromPostalCode
    //   },
    //   to: {
    //     postal_code: shippingData.toPostalCode
    //   },
    //   package: {
    //     height: shippingData.height,
    //     width: shippingData.width,
    //     length: shippingData.length,
    //     weight: shippingData.weight
    //   }
    // };

    // const response = await fetch('/api/shipping/calculate', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload)
    // });

    // return await response.json();
  }

  /**
   * Generate shipping label
   */
  async generateLabel(orderId, shippingOption) {
    if (USE_MOCK) {
      console.log("[MelhorEnvio] Mock generateLabel:", orderId, shippingOption)
      return {
        id: "mock-label-" + Date.now(),
        protocol: "ME" + Date.now(),
        tracking: "BR123456789BR",
        label_url: "#mock-label-pdf",
      }
    }

    // TODO_INTEGRATION: Generate real shipping label
    // const response = await fetch('/api/shipping/generate-label', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ orderId, shippingOption })
    // });

    // return await response.json();
  }

  /**
   * Track shipment
   */
  async trackShipment(trackingCode) {
    if (USE_MOCK) {
      console.log("[MelhorEnvio] Mock trackShipment:", trackingCode)
      return {
        tracking: trackingCode,
        status: "in_transit",
        events: [
          {
            date: new Date().toISOString(),
            description: "Objeto postado",
            location: "São Paulo - SP",
          },
          {
            date: new Date(Date.now() - 86400000).toISOString(),
            description: "Objeto em trânsito",
            location: "Rio de Janeiro - RJ",
          },
        ],
      }
    }

    // TODO_INTEGRATION: Track real shipment
    // const response = await fetch(`/api/shipping/track/${trackingCode}`);
    // return await response.json();
  }

  /**
   * Get CEP information (address autocomplete)
   */
  async getCepInfo(cep) {
    if (USE_MOCK) {
      console.log("[MelhorEnvio] Mock getCepInfo:", cep)
      // Use ViaCEP as fallback for mock
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        const data = await response.json()
        return {
          postal_code: data.cep,
          address: data.logradouro,
          district: data.bairro,
          city: data.localidade,
          state: data.uf,
        }
      } catch (error) {
        return null
      }
    }

    // TODO_INTEGRATION: Use Melhor Envio CEP lookup
    // const response = await fetch(`/api/shipping/cep/${cep}`);
    // return await response.json();
  }
}

export const melhorEnvio = new MelhorEnvioAdapter()
