class CartPage {
  constructor() {
    this.cart = []
    this.init()
  }

  async init() {
    console.log("[v0] Initializing cart page")

    // Load cart from localStorage
    this.loadCart()

    // Render cart
    this.renderCart()

    // Listen for cart updates
    window.addEventListener("cart-updated", () => {
      this.loadCart()
      this.renderCart()
    })

    console.log("[v0] Cart page initialized")
  }

  loadCart() {
    try {
      const cart = localStorage.getItem("marketplace_cart")
      this.cart = cart ? JSON.parse(cart) : []
    } catch (error) {
      console.error("[v0] Error loading cart:", error)
      this.cart = []
    }
  }

  renderCart() {
    const container = document.getElementById("cart-items-list")
    if (!container) return

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem; background: var(--color-surface); border-radius: var(--radius-lg)">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 1rem; color: var(--color-text-muted)">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <h2 style="margin-bottom: 0.5rem">Seu carrinho está vazio</h2>
          <p style="color: var(--color-text-secondary); margin-bottom: 1.5rem">Adicione produtos para começar suas compras</p>
          <a href="/" class="btn btn-primary">Explorar Produtos</a>
        </div>
      `
      this.updateSummary()
      return
    }

    // TODO_INTEGRATION: Fetch full product details from API
    // For now, using mock data
    container.innerHTML = this.cart
      .map((item) => {
        const product = this.getMockProduct(item.productId)
        return `
        <div style="display: flex; gap: 1rem; padding: 1.5rem; background: white; border: 1px solid var(--color-border); border-radius: var(--radius-lg); margin-bottom: 1rem">
          <div style="width: 100px; height: 100px; flex-shrink: 0; background: var(--color-surface); border-radius: var(--radius-md); overflow: hidden">
            <img src="${product.image}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover" />
          </div>
          
          <div style="flex: 1; min-width: 0">
            <h3 style="font-size: 1rem; margin-bottom: 0.5rem">${product.title}</h3>
            <p style="font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 0.5rem">${product.variant || ""}</p>
            <div style="font-size: 1.125rem; font-weight: 700; color: var(--color-primary)">R$ ${(product.price / 100).toFixed(2)}</div>
          </div>

          <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between">
            <button 
              class="btn-icon" 
              data-action="remove-from-cart" 
              data-item-id="${item.id}"
              aria-label="Remover item"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>

            <div style="display: flex; align-items: center; gap: 0.5rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 0.25rem">
              <button 
                class="btn-icon" 
                style="padding: 0.25rem"
                onclick="window.cartPage.updateQuantity('${item.id}', ${item.quantity - 1})"
                aria-label="Diminuir quantidade"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <span style="min-width: 2rem; text-align: center; font-weight: 600">${item.quantity}</span>
              <button 
                class="btn-icon" 
                style="padding: 0.25rem"
                onclick="window.cartPage.updateQuantity('${item.id}', ${item.quantity + 1})"
                aria-label="Aumentar quantidade"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `
      })
      .join("")

    this.updateSummary()
  }

  updateQuantity(itemId, newQuantity) {
    if (newQuantity < 1) return

    const item = this.cart.find((i) => i.id === itemId)
    if (item) {
      item.quantity = newQuantity
      localStorage.setItem("marketplace_cart", JSON.stringify(this.cart))
      this.renderCart()

      // Update global cart badge
      if (window.app) {
        window.app.cart = this.cart
        window.app.updateCartBadge()
      }
    }
  }

  updateSummary() {
    // TODO_INTEGRATION: Calculate real prices from product data
    const subtotal = this.cart.reduce((sum, item) => {
      const product = this.getMockProduct(item.productId)
      return sum + product.price * item.quantity
    }, 0)

    document.getElementById("subtotal").textContent = `R$ ${(subtotal / 100).toFixed(2)}`
    document.getElementById("total").textContent = `R$ ${(subtotal / 100).toFixed(2)}`
  }

  getMockProduct(productId) {
    // Mock product data - in real app, fetch from API
    return {
      id: productId,
      title: "Produto Exemplo",
      image: "/placeholder.svg?height=100&width=100",
      price: 8990,
      variant: "Tamanho: M, Cor: Preto",
    }
  }
}

// Initialize and expose globally
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.cartPage = new CartPage()
  })
} else {
  window.cartPage = new CartPage()
}
