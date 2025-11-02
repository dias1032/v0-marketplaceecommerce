// TODO_INTEGRATION: Import adapters when ready
// import melhorEnvioAdapter from '../integrations/melhorEnvioAdapter.js';
// import mercadoPagoAdapter from '../integrations/mercadoPagoAdapter.js';

class CheckoutPage {
  constructor() {
    this.currentStep = 1
    this.cart = []
    this.address = {}
    this.selectedShipping = null
    this.selectedPayment = "credit-card"
    this.init()
  }

  async init() {
    console.log("[v0] Initializing checkout page")

    // Load cart
    this.loadCart()

    // Render cart summary
    this.renderCartSummary()

    // Setup form handlers
    this.setupFormHandlers()

    // Setup CEP autocomplete
    this.setupCEPAutocomplete()

    console.log("[v0] Checkout page initialized")
  }

  loadCart() {
    try {
      const cart = localStorage.getItem("marketplace_cart")
      this.cart = cart ? JSON.parse(cart) : []

      if (this.cart.length === 0) {
        window.location.href = "/cart.html"
      }
    } catch (error) {
      console.error("[v0] Error loading cart:", error)
      window.location.href = "/cart.html"
    }
  }

  renderCartSummary() {
    const container = document.getElementById("checkout-items")
    if (!container) return

    // TODO_INTEGRATION: Fetch real product data
    const subtotal = this.cart.reduce((sum, item) => {
      return sum + 8990 * item.quantity // Mock price
    }, 0)

    container.innerHTML = this.cart
      .map(
        (item) => `
      <div style="display: flex; gap: 0.75rem">
        <div style="width: 60px; height: 60px; background: var(--color-surface); border-radius: var(--radius-md); overflow: hidden; flex-shrink: 0">
          <img src="/placeholder.svg?height=60&width=60" alt="Produto" style="width: 100%; height: 100%; object-fit: cover" />
        </div>
        <div style="flex: 1; min-width: 0">
          <div style="font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem">Produto Exemplo</div>
          <div style="font-size: 0.75rem; color: var(--color-text-secondary)">Qtd: ${item.quantity}</div>
        </div>
        <div style="font-weight: 600; font-size: 0.875rem">R$ ${((8990 * item.quantity) / 100).toFixed(2)}</div>
      </div>
    `,
      )
      .join("")

    document.getElementById("checkout-subtotal").textContent = `R$ ${(subtotal / 100).toFixed(2)}`
    document.getElementById("checkout-total").textContent = `R$ ${(subtotal / 100).toFixed(2)}`
  }

  setupFormHandlers() {
    const form = document.getElementById("checkout-form")
    if (!form) return

    form.addEventListener("submit", async (e) => {
      e.preventDefault()
      await this.handleSubmit()
    })

    // Payment method selection
    document.querySelectorAll('input[name="payment-method"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.selectedPayment = e.target.value
        console.log("[v0] Payment method selected:", this.selectedPayment)
      })
    })
  }

  setupCEPAutocomplete() {
    const cepInput = document.getElementById("cep")
    if (!cepInput) return

    cepInput.addEventListener("blur", async (e) => {
      const cep = e.target.value.replace(/\D/g, "")

      if (cep.length === 8) {
        console.log("[v0] Fetching address for CEP:", cep)

        try {
          // Using ViaCEP API for address autocomplete
          const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
          const data = await response.json()

          if (!data.erro) {
            document.getElementById("street").value = data.logradouro || ""
            document.getElementById("neighborhood").value = data.bairro || ""
            document.getElementById("city").value = data.localidade || ""
            document.getElementById("state").value = data.uf || ""
            document.getElementById("number").focus()
          }
        } catch (error) {
          console.error("[v0] Error fetching CEP:", error)
        }
      }
    })
  }

  async nextStep() {
    console.log("[v0] Moving to next step from:", this.currentStep)

    // Validate current step
    if (this.currentStep === 1) {
      if (!this.validateAddress()) {
        alert("Por favor, preencha todos os campos obrigatórios do endereço.")
        return
      }
      await this.loadShippingOptions()
    } else if (this.currentStep === 2) {
      if (!this.selectedShipping) {
        alert("Por favor, selecione uma opção de frete.")
        return
      }
    }

    // Hide current step
    document.querySelector(`[data-step="${this.currentStep}"]`).style.display = "none"

    // Show next step
    this.currentStep++
    document.querySelector(`[data-step="${this.currentStep}"]`).style.display = "block"

    // Update progress
    this.updateProgress()
  }

  prevStep() {
    console.log("[v0] Moving to previous step from:", this.currentStep)

    // Hide current step
    document.querySelector(`[data-step="${this.currentStep}"]`).style.display = "none"

    // Show previous step
    this.currentStep--
    document.querySelector(`[data-step="${this.currentStep}"]`).style.display = "block"

    // Update progress
    this.updateProgress()
  }

  updateProgress() {
    // Update progress indicators (simplified)
    console.log("[v0] Current step:", this.currentStep)
  }

  validateAddress() {
    this.address = {
      cep: document.getElementById("cep").value,
      street: document.getElementById("street").value,
      number: document.getElementById("number").value,
      complement: document.getElementById("complement").value,
      neighborhood: document.getElementById("neighborhood").value,
      city: document.getElementById("city").value,
      state: document.getElementById("state").value,
    }

    return this.address.cep && this.address.street && this.address.number && this.address.city && this.address.state
  }

  async loadShippingOptions() {
    console.log("[v0] Loading shipping options for address:", this.address)

    // TODO_INTEGRATION: Call Melhor Envio adapter
    // const options = await melhorEnvioAdapter.getRates(this.cart, this.address);

    // Using mock data for now
    const mockOptions = [
      {
        id: "pac",
        carrier: "Correios",
        service: "PAC",
        price_cents: 1500,
        estimated_days: 7,
      },
      {
        id: "sedex",
        carrier: "Correios",
        service: "SEDEX",
        price_cents: 2500,
        estimated_days: 3,
      },
      {
        id: "express",
        carrier: "Transportadora",
        service: "Expresso",
        price_cents: 3500,
        estimated_days: 1,
      },
    ]

    this.renderShippingOptions(mockOptions)
  }

  renderShippingOptions(options) {
    const container = document.getElementById("shipping-options")
    if (!container) return

    container.innerHTML = options
      .map(
        (option) => `
      <label style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 2px solid var(--color-border); border-radius: var(--radius-lg); cursor: pointer; transition: all 0.15s">
        <input type="radio" name="shipping-option" value="${option.id}" onchange="window.checkoutPage.selectShipping('${option.id}', ${option.price_cents})" />
        <div style="flex: 1">
          <div style="font-weight: 600; margin-bottom: 0.25rem">${option.carrier} - ${option.service}</div>
          <div style="font-size: 0.875rem; color: var(--color-text-secondary)">Entrega em até ${option.estimated_days} dias úteis</div>
        </div>
        <div style="font-weight: 700; font-size: 1.125rem">R$ ${(option.price_cents / 100).toFixed(2)}</div>
      </label>
    `,
      )
      .join("")
  }

  selectShipping(optionId, priceCents) {
    this.selectedShipping = { id: optionId, price_cents: priceCents }
    console.log("[v0] Shipping selected:", this.selectedShipping)

    // Update summary
    document.getElementById("checkout-shipping").textContent = `R$ ${(priceCents / 100).toFixed(2)}`

    const subtotal = this.cart.reduce((sum, item) => sum + 8990 * item.quantity, 0)
    const total = subtotal + priceCents
    document.getElementById("checkout-total").textContent = `R$ ${(total / 100).toFixed(2)}`
  }

  async handleSubmit() {
    console.log("[v0] Submitting checkout")

    // Prepare order data
    const orderData = {
      cart: this.cart,
      address: this.address,
      shipping: this.selectedShipping,
      payment_method: this.selectedPayment,
      user_id: null, // TODO: Get from auth
    }

    console.log("[v0] Order data:", orderData)

    try {
      // TODO_INTEGRATION: Call checkout API
      // const result = await api.checkout.create(orderData);

      // Mock: Simulate Mercado Pago redirect
      alert(
        "TODO_INTEGRATION: Redirecionar para Mercado Pago\n\nEm produção, o backend criará uma preferência de pagamento e retornará o init_point para redirecionar o usuário.",
      )

      // TODO_INTEGRATION: Redirect to payment
      // window.location.href = result.payment_url;

      // For now, simulate success
      setTimeout(() => {
        localStorage.removeItem("marketplace_cart")
        window.location.href = "/?order=success"
      }, 2000)
    } catch (error) {
      console.error("[v0] Checkout error:", error)
      alert("Erro ao processar pedido. Tente novamente.")
    }
  }
}

// Initialize and expose globally
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.checkoutPage = new CheckoutPage()
  })
} else {
  window.checkoutPage = new CheckoutPage()
}
