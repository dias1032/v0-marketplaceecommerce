class HomePage {
  constructor() {
    this.products = []
    this.currentPage = 1
    this.currentFilter = "all"
    this.init()
  }

  async init() {
    console.log("[v0] Initializing home page")

    // Load initial products
    await this.loadProducts()

    // Setup event listeners
    this.setupFilters()
    this.setupLoadMore()
    this.setupSearch()

    console.log("[v0] Home page initialized")
  }

  async loadProducts(append = false) {
    try {
      console.log("[v0] Loading products:", { page: this.currentPage, filter: this.currentFilter })

      // TODO_INTEGRATION: Replace with real API call
      // const data = await api.products.list({ page: this.currentPage, category: this.currentFilter });

      // Using mock data for now
      const mockProducts = this.getMockProducts()

      if (!append) {
        this.products = mockProducts
      } else {
        this.products = [...this.products, ...mockProducts]
      }

      this.renderProducts(append)
    } catch (error) {
      console.error("[v0] Error loading products:", error)
      this.showError("Erro ao carregar produtos. Tente novamente.")
    }
  }

  renderProducts(append = false) {
    const grid = document.getElementById("product-grid")
    if (!grid) return

    if (!append) {
      grid.innerHTML = ""
    }

    this.products.forEach((product) => {
      const card = this.createProductCard(product)
      grid.appendChild(card)
    })
  }

  createProductCard(product) {
    const card = document.createElement("div")
    card.className = "product-card"
    card.onclick = () => {
      window.location.href = `/product.html?id=${product.id}`
    }

    const discount = product.compare_at_price_cents
      ? Math.round(((product.compare_at_price_cents - product.price_cents) / product.compare_at_price_cents) * 100)
      : 0

    card.innerHTML = `
      <div class="product-image">
        <img src="${product.images[0]}" alt="${product.title}" loading="lazy" />
        ${discount > 0 ? `<span class="product-badge">-${discount}%</span>` : ""}
        <button class="product-wishlist" onclick="event.stopPropagation()" aria-label="Adicionar aos favoritos">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>
      <div class="product-info">
        <h3 class="product-title">${product.title}</h3>
        <div class="product-price">
          <span class="price-current">R$ ${(product.price_cents / 100).toFixed(2)}</span>
          ${product.compare_at_price_cents ? `<span class="price-original">R$ ${(product.compare_at_price_cents / 100).toFixed(2)}</span>` : ""}
        </div>
        <div class="product-rating">
          <span class="stars">${"★".repeat(Math.floor(product.rating))}${"☆".repeat(5 - Math.floor(product.rating))}</span>
          <span>(${product.review_count})</span>
        </div>
      </div>
    `

    return card
  }

  setupFilters() {
    const filterChips = document.querySelectorAll(".filter-chip")

    filterChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        // Update active state
        filterChips.forEach((c) => c.classList.remove("active"))
        chip.classList.add("active")

        // Update filter and reload
        this.currentFilter = chip.dataset.filter
        this.currentPage = 1
        this.loadProducts()
      })
    })
  }

  setupLoadMore() {
    const loadMoreBtn = document.getElementById("load-more")
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", () => {
        this.currentPage++
        this.loadProducts(true)
      })
    }
  }

  setupSearch() {
    const searchInput = document.querySelector(".search-input")
    if (searchInput) {
      let timeout
      searchInput.addEventListener("input", (e) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          console.log("[v0] Search query:", e.target.value)
          // TODO_INTEGRATION: Implement search
        }, 500)
      })
    }
  }

  getMockProducts() {
    // Mock product data
    const categories = ["roupas", "calcados", "acessorios", "beleza", "casa", "eletronicos"]
    const products = []

    for (let i = 0; i < 20; i++) {
      const price = Math.floor(Math.random() * 30000) + 2000 // 20-300 reais
      const comparePrice = Math.random() > 0.5 ? Math.floor(price * 1.3) : null

      products.push({
        id: `product-${Date.now()}-${i}`,
        title: `Produto Incrível ${i + 1} - ${categories[Math.floor(Math.random() * categories.length)]}`,
        price_cents: price,
        compare_at_price_cents: comparePrice,
        images: [`/placeholder.svg?height=400&width=400&query=product ${i + 1}`],
        rating: 3 + Math.random() * 2,
        review_count: Math.floor(Math.random() * 500),
        category: categories[Math.floor(Math.random() * categories.length)],
      })
    }

    return products
  }

  showError(message) {
    const grid = document.getElementById("product-grid")
    if (grid) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem">
          <p style="color: var(--color-accent); margin-bottom: 1rem">${message}</p>
          <button class="btn btn-primary" onclick="location.reload()">Tentar Novamente</button>
        </div>
      `
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new HomePage()
  })
} else {
  new HomePage()
}
