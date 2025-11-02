// Main Application Entry Point
// TODO_INTEGRATION: Connect to real backend APIs

class App {
  constructor() {
    this.currentPage = null
    this.cart = this.loadCart()
    this.user = this.loadUser()
    this.init()
  }

  init() {
    // Initialize router
    this.handleRouting()
    window.addEventListener("popstate", () => this.handleRouting())

    // Initialize global event listeners
    this.initGlobalListeners()

    // Update cart badge
    this.updateCartBadge()

    console.log("[v0] App initialized")
  }

  handleRouting() {
    const path = window.location.pathname
    const params = new URLSearchParams(window.location.search)

    console.log("[v0] Routing to:", path)

    // Simple client-side routing
    if (path === "/" || path === "/index.html") {
      this.loadPage("home")
    } else if (path.includes("product.html")) {
      this.loadPage("product", { id: params.get("id") })
    } else if (path.includes("shop.html")) {
      this.loadPage("shop", { id: params.get("id") })
    } else if (path.includes("cart.html")) {
      this.loadPage("cart")
    } else if (path.includes("checkout.html")) {
      this.loadPage("checkout")
    } else if (path.includes("login.html")) {
      this.loadPage("login")
    } else if (path.includes("signup.html")) {
      this.loadPage("signup")
    } else if (path.includes("seller/dashboard.html")) {
      this.loadPage("seller-dashboard")
    }
  }

  loadPage(pageName, params = {}) {
    this.currentPage = pageName
    console.log("[v0] Loading page:", pageName, params)

    // Dispatch custom event for page load
    window.dispatchEvent(
      new CustomEvent("pageload", {
        detail: { page: pageName, params },
      }),
    )
  }

  initGlobalListeners() {
    // Add to cart buttons
    document.addEventListener("click", (e) => {
      if (e.target.closest('[data-action="add-to-cart"]')) {
        e.preventDefault()
        const btn = e.target.closest('[data-action="add-to-cart"]')
        const productId = btn.dataset.productId
        const variantId = btn.dataset.variantId
        this.addToCart(productId, variantId)
      }

      // Buy now buttons
      if (e.target.closest('[data-action="buy-now"]')) {
        e.preventDefault()
        const btn = e.target.closest('[data-action="buy-now"]')
        const productId = btn.dataset.productId
        const variantId = btn.dataset.variantId
        this.buyNow(productId, variantId)
      }

      // Remove from cart
      if (e.target.closest('[data-action="remove-from-cart"]')) {
        e.preventDefault()
        const btn = e.target.closest('[data-action="remove-from-cart"]')
        const itemId = btn.dataset.itemId
        this.removeFromCart(itemId)
      }

      // Toggle mobile menu
      if (e.target.closest('[data-action="toggle-menu"]')) {
        e.preventDefault()
        this.toggleMobileMenu()
      }

      // Toggle cart sidebar
      if (e.target.closest('[data-action="toggle-cart"]')) {
        e.preventDefault()
        this.toggleCartSidebar()
      }
    })

    // Quantity changes
    document.addEventListener("change", (e) => {
      if (e.target.matches('[data-action="update-quantity"]')) {
        const input = e.target
        const itemId = input.dataset.itemId
        const quantity = Number.parseInt(input.value)
        this.updateCartQuantity(itemId, quantity)
      }
    })
  }

  // Cart Management
  addToCart(productId, variantId = null, quantity = 1) {
    console.log("[v0] Adding to cart:", { productId, variantId, quantity })

    // TODO_INTEGRATION: Call API to sync cart with server
    // await api.cart.add({ productId, variantId, quantity });

    const item = {
      id: `${productId}-${variantId || "default"}-${Date.now()}`,
      productId,
      variantId,
      quantity,
      addedAt: new Date().toISOString(),
    }

    this.cart.push(item)
    this.saveCart()
    this.updateCartBadge()

    // Show success animation
    this.showCartAnimation()

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent("cart-updated", {
        detail: { cart: this.cart },
      }),
    )
  }

  removeFromCart(itemId) {
    console.log("[v0] Removing from cart:", itemId)

    this.cart = this.cart.filter((item) => item.id !== itemId)
    this.saveCart()
    this.updateCartBadge()

    window.dispatchEvent(
      new CustomEvent("cart-updated", {
        detail: { cart: this.cart },
      }),
    )
  }

  updateCartQuantity(itemId, quantity) {
    console.log("[v0] Updating quantity:", { itemId, quantity })

    const item = this.cart.find((i) => i.id === itemId)
    if (item) {
      item.quantity = Math.max(1, quantity)
      this.saveCart()
      this.updateCartBadge()

      window.dispatchEvent(
        new CustomEvent("cart-updated", {
          detail: { cart: this.cart },
        }),
      )
    }
  }

  buyNow(productId, variantId = null) {
    console.log("[v0] Buy now:", { productId, variantId })

    // Add to cart and redirect to checkout
    this.addToCart(productId, variantId)
    window.location.href = "/checkout.html"
  }

  loadCart() {
    try {
      const cart = localStorage.getItem("marketplace_cart")
      return cart ? JSON.parse(cart) : []
    } catch (error) {
      console.error("[v0] Error loading cart:", error)
      return []
    }
  }

  saveCart() {
    try {
      localStorage.setItem("marketplace_cart", JSON.stringify(this.cart))
    } catch (error) {
      console.error("[v0] Error saving cart:", error)
    }
  }

  updateCartBadge() {
    const badge = document.querySelector(".cart-badge")
    if (badge) {
      const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0)
      badge.textContent = totalItems
      badge.style.display = totalItems > 0 ? "block" : "none"
    }
  }

  showCartAnimation() {
    // Simple success feedback
    const btn = event.target.closest("button")
    if (btn) {
      const originalText = btn.textContent
      btn.textContent = "✓ Adicionado!"
      btn.style.backgroundColor = "var(--color-success)"

      setTimeout(() => {
        btn.textContent = originalText
        btn.style.backgroundColor = ""
      }, 1500)
    }
  }

  toggleMobileMenu() {
    const menu = document.querySelector(".mobile-menu")
    if (menu) {
      menu.classList.toggle("active")
    }
  }

  toggleCartSidebar() {
    const sidebar = document.querySelector(".cart-sidebar")
    if (sidebar) {
      sidebar.classList.toggle("active")
    }
  }

  loadUser() {
    try {
      const user = localStorage.getItem("marketplace_user")
      return user ? JSON.parse(user) : null
    } catch (error) {
      console.error("[v0] Error loading user:", error)
      return null
    }
  }

  saveUser(user) {
    try {
      localStorage.setItem("marketplace_user", JSON.stringify(user))
      this.user = user
    } catch (error) {
      console.error("[v0] Error saving user:", error)
    }
  }

  logout() {
    localStorage.removeItem("marketplace_user")
    this.user = null
    window.location.href = "/"
  }
}

// Initialize app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.app = new App()
  })
} else {
  window.app = new App()
}
