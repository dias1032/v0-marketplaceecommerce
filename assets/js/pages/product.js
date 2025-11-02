class ProductPage {
  constructor() {
    this.product = null
    this.selectedVariant = null
    this.currentImageIndex = 0
    this.init()
  }

  async init() {
    console.log("[v0] Initializing product page")

    // Get product ID from URL
    const params = new URLSearchParams(window.location.search)
    const productId = params.get("id")

    if (!productId) {
      this.showError("Produto não encontrado")
      return
    }

    // Load product data
    await this.loadProduct(productId)

    // Setup event listeners
    this.setupTabs()
    this.setupGallery()

    console.log("[v0] Product page initialized")
  }

  async loadProduct(productId) {
    try {
      console.log("[v0] Loading product:", productId)

      // TODO_INTEGRATION: Replace with real API call
      // const product = await api.products.get(productId);

      // Using mock data for now
      this.product = this.getMockProduct(productId)

      this.renderProduct()
      this.loadRelatedProducts()
    } catch (error) {
      console.error("[v0] Error loading product:", error)
      this.showError("Erro ao carregar produto. Tente novamente.")
    }
  }

  renderProduct() {
    if (!this.product) return

    // Update breadcrumb
    document.getElementById("breadcrumb-category").textContent = this.product.category || "Categoria"
    document.getElementById("breadcrumb-product").textContent = this.product.title

    // Render gallery
    this.renderGallery()

    // Render product info
    this.renderProductInfo()

    // Render description
    document.getElementById("product-description").innerHTML = `
      <div style="line-height: 1.8">
        <p>${this.product.description}</p>
        <h4 style="margin-top: 1.5rem; margin-bottom: 0.5rem">Características:</h4>
        <ul style="padding-left: 1.5rem">
          <li>Material de alta qualidade</li>
          <li>Acabamento premium</li>
          <li>Durabilidade garantida</li>
          <li>Design moderno</li>
        </ul>
      </div>
    `

    // Render reviews
    this.renderReviews()
  }

  renderGallery() {
    const mainImage = document.getElementById("main-image")
    const thumbnails = document.getElementById("thumbnails")

    if (mainImage) {
      mainImage.innerHTML = `
        <img src="${this.product.images[this.currentImageIndex]}" alt="${this.product.title}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover" />
        <button class="product-wishlist" style="position: absolute; top: 1rem; right: 1rem">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      `
    }

    if (thumbnails) {
      thumbnails.innerHTML = this.product.images
        .map(
          (img, index) => `
        <div style="position: relative; padding-top: 100%; background: var(--color-surface); border-radius: var(--radius-md); overflow: hidden; cursor: pointer; border: 2px solid ${index === this.currentImageIndex ? "var(--color-primary)" : "transparent"}" data-image-index="${index}">
          <img src="${img}" alt="Thumbnail ${index + 1}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover" />
        </div>
      `,
        )
        .join("")
    }
  }

  renderProductInfo() {
    const infoContainer = document.getElementById("product-info")
    if (!infoContainer) return

    const discount = this.product.compare_at_price_cents
      ? Math.round(
          ((this.product.compare_at_price_cents - this.product.price_cents) / this.product.compare_at_price_cents) *
            100,
        )
      : 0

    infoContainer.innerHTML = `
      <div>
        <h1 style="font-size: 1.75rem; margin-bottom: 0.5rem">${this.product.title}</h1>
        
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem">
          <div class="product-rating">
            <span class="stars" style="font-size: 1rem">${"★".repeat(Math.floor(this.product.rating))}${"☆".repeat(5 - Math.floor(this.product.rating))}</span>
            <span style="color: var(--color-text-secondary)">(${this.product.review_count} avaliações)</span>
          </div>
          <span style="color: var(--color-success); font-size: 0.875rem">✓ Em estoque</span>
        </div>

        <div style="margin-bottom: 1.5rem">
          <div style="display: flex; align-items: baseline; gap: 1rem; margin-bottom: 0.5rem">
            <span style="font-size: 2rem; font-weight: 700; color: var(--color-primary)">R$ ${(this.product.price_cents / 100).toFixed(2)}</span>
            ${this.product.compare_at_price_cents ? `<span style="font-size: 1.125rem; color: var(--color-text-muted); text-decoration: line-through">R$ ${(this.product.compare_at_price_cents / 100).toFixed(2)}</span>` : ""}
            ${discount > 0 ? `<span style="background: var(--color-accent); color: white; padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.875rem; font-weight: 600">-${discount}%</span>` : ""}
          </div>
          <p style="font-size: 0.875rem; color: var(--color-text-secondary); margin: 0">ou 3x de R$ ${(this.product.price_cents / 100 / 3).toFixed(2)} sem juros</p>
        </div>

        ${this.renderVariantSelector()}

        <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem">
          <button 
            class="btn btn-primary" 
            style="flex: 1"
            data-action="add-to-cart" 
            data-product-id="${this.product.id}"
            data-variant-id="${this.selectedVariant?.id || ""}"
          >
            Adicionar ao Carrinho
          </button>
          <button 
            class="btn btn-accent" 
            style="flex: 1"
            data-action="buy-now" 
            data-product-id="${this.product.id}"
            data-variant-id="${this.selectedVariant?.id || ""}"
          >
            Comprar Agora
          </button>
        </div>

        <div style="border-top: 1px solid var(--color-border); padding-top: 1.5rem">
          <h3 style="font-size: 1rem; margin-bottom: 1rem">Sobre a Loja</h3>
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem">
            <div style="width: 48px; height: 48px; border-radius: var(--radius-full); background: var(--color-surface); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.25rem">
              ${this.product.shop_name.charAt(0)}
            </div>
            <div>
              <h4 style="margin: 0; margin-bottom: 0.25rem">${this.product.shop_name}</h4>
              <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--color-text-secondary)">
                <span class="stars" style="color: var(--color-warning)">★★★★★</span>
                <span>4.8 (1.2k vendas)</span>
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem">
            <a href="/shop.html?id=${this.product.shop_id}" class="btn btn-outline" style="flex: 1; justify-content: center">Ver Loja</a>
            <button class="btn btn-outline" style="flex: 1" onclick="alert('TODO_INTEGRATION: Implement chat with Supabase Realtime')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Conversar
            </button>
          </div>
        </div>
      </div>
    `
  }

  renderVariantSelector() {
    if (!this.product.variants || this.product.variants.length === 0) {
      return ""
    }

    // Group variants by type (size, color, etc.)
    const sizes = [...new Set(this.product.variants.map((v) => v.size).filter(Boolean))]
    const colors = [...new Set(this.product.variants.map((v) => v.color).filter(Boolean))]

    let html = ""

    if (sizes.length > 0) {
      html += `
        <div style="margin-bottom: 1.5rem">
          <label style="display: block; font-weight: 600; margin-bottom: 0.5rem">Tamanho:</label>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
            ${sizes
              .map(
                (size) => `
              <button class="variant-btn" data-variant-type="size" data-variant-value="${size}" style="padding: 0.5rem 1rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: white; cursor: pointer; font-weight: 500; transition: all 0.15s">
                ${size}
              </button>
            `,
              )
              .join("")}
          </div>
        </div>
      `
    }

    if (colors.length > 0) {
      html += `
        <div style="margin-bottom: 1.5rem">
          <label style="display: block; font-weight: 600; margin-bottom: 0.5rem">Cor:</label>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
            ${colors
              .map(
                (color) => `
              <button class="variant-btn" data-variant-type="color" data-variant-value="${color}" style="padding: 0.5rem 1rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: white; cursor: pointer; font-weight: 500; transition: all 0.15s">
                ${color}
              </button>
            `,
              )
              .join("")}
          </div>
        </div>
      `
    }

    // Add event listeners after render
    setTimeout(() => {
      document.querySelectorAll(".variant-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const type = e.target.dataset.variantType
          const value = e.target.dataset.variantValue

          // Update active state
          document.querySelectorAll(`[data-variant-type="${type}"]`).forEach((b) => {
            b.style.borderColor = "var(--color-border)"
            b.style.backgroundColor = "white"
          })
          e.target.style.borderColor = "var(--color-primary)"
          e.target.style.backgroundColor = "var(--color-surface)"

          // Find matching variant
          this.selectedVariant = this.product.variants.find((v) => v[type] === value)
          console.log("[v0] Selected variant:", this.selectedVariant)
        })
      })
    }, 0)

    return html
  }

  renderReviews() {
    const reviewsContainer = document.getElementById("product-reviews")
    if (!reviewsContainer) return

    const mockReviews = [
      { user: "Maria S.", rating: 5, comment: "Produto excelente! Superou minhas expectativas.", date: "2025-01-05" },
      { user: "João P.", rating: 4, comment: "Muito bom, recomendo. Entrega rápida.", date: "2025-01-03" },
      { user: "Ana L.", rating: 5, comment: "Adorei! Qualidade impecável.", date: "2024-12-28" },
    ]

    reviewsContainer.innerHTML = `
      <div style="margin-bottom: 2rem">
        <div style="display: flex; align-items: center; gap: 2rem; margin-bottom: 1.5rem">
          <div>
            <div style="font-size: 3rem; font-weight: 700; line-height: 1">${this.product.rating.toFixed(1)}</div>
            <div class="stars" style="color: var(--color-warning); font-size: 1.25rem">${"★".repeat(Math.floor(this.product.rating))}${"☆".repeat(5 - Math.floor(this.product.rating))}</div>
            <div style="font-size: 0.875rem; color: var(--color-text-secondary)">${this.product.review_count} avaliações</div>
          </div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1.5rem">
        ${mockReviews
          .map(
            (review) => `
          <div style="padding: 1.5rem; background: var(--color-surface); border-radius: var(--radius-lg)">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem">
              <div>
                <div style="font-weight: 600; margin-bottom: 0.25rem">${review.user}</div>
                <div class="stars" style="color: var(--color-warning)">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
              </div>
              <div style="font-size: 0.875rem; color: var(--color-text-secondary)">${new Date(review.date).toLocaleDateString("pt-BR")}</div>
            </div>
            <p style="margin: 0; line-height: 1.6">${review.comment}</p>
          </div>
        `,
          )
          .join("")}
      </div>
    `
  }

  setupTabs() {
    const tabBtns = document.querySelectorAll(".tab-btn")
    const tabPanels = document.querySelectorAll(".tab-panel")

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetTab = btn.dataset.tab

        // Update buttons
        tabBtns.forEach((b) => {
          b.classList.remove("active")
          b.style.borderBottomColor = "transparent"
          b.style.color = "var(--color-text-secondary)"
        })
        btn.classList.add("active")
        btn.style.borderBottomColor = "var(--color-primary)"
        btn.style.color = "var(--color-primary)"

        // Update panels
        tabPanels.forEach((panel) => {
          panel.style.display = panel.dataset.panel === targetTab ? "block" : "none"
        })
      })
    })
  }

  setupGallery() {
    // Thumbnail click handler
    document.addEventListener("click", (e) => {
      const thumbnail = e.target.closest("[data-image-index]")
      if (thumbnail) {
        this.currentImageIndex = Number.parseInt(thumbnail.dataset.imageIndex)
        this.renderGallery()
      }
    })
  }

  async loadRelatedProducts() {
    // TODO_INTEGRATION: Load related products from API
    const relatedContainer = document.getElementById("related-products")
    if (!relatedContainer) return

    const mockProducts = this.getMockRelatedProducts()

    relatedContainer.innerHTML = mockProducts
      .map(
        (product) => `
      <div class="product-card" onclick="window.location.href='/product.html?id=${product.id}'">
        <div class="product-image">
          <img src="${product.images[0]}" alt="${product.title}" loading="lazy" />
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.title}</h3>
          <div class="product-price">
            <span class="price-current">R$ ${(product.price_cents / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>
    `,
      )
      .join("")
  }

  getMockProduct(id) {
    return {
      id,
      title: "Camiseta Premium Estilo Moderno",
      description:
        "Camiseta de alta qualidade com design moderno e confortável. Perfeita para o dia a dia, feita com tecido respirável e durável. Disponível em várias cores e tamanhos.",
      price_cents: 8990,
      compare_at_price_cents: 12990,
      stock: 50,
      category: "Roupas",
      images: [
        "/modern-t-shirt.png",
        "/t-shirt-detail.png",
        "/t-shirt-back.png",
        "/t-shirt-side.png",
      ],
      variants: [
        { id: "v1", size: "P", color: "Preto", stock: 10, price_cents: 8990 },
        { id: "v2", size: "M", color: "Preto", stock: 15, price_cents: 8990 },
        { id: "v3", size: "G", color: "Preto", stock: 12, price_cents: 8990 },
        { id: "v4", size: "P", color: "Branco", stock: 8, price_cents: 8990 },
        { id: "v5", size: "M", color: "Branco", stock: 20, price_cents: 8990 },
        { id: "v6", size: "G", color: "Branco", stock: 15, price_cents: 8990 },
      ],
      rating: 4.7,
      review_count: 234,
      shop_id: "shop-1",
      shop_name: "Loja Fashion",
    }
  }

  getMockRelatedProducts() {
    return Array.from({ length: 4 }, (_, i) => ({
      id: `related-${i}`,
      title: `Produto Relacionado ${i + 1}`,
      price_cents: Math.floor(Math.random() * 20000) + 3000,
      images: [`/placeholder.svg?height=400&width=400&query=related product ${i + 1}`],
    }))
  }

  showError(message) {
    document.querySelector("main").innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem">
        <p style="color: var(--color-accent); font-size: 1.25rem; margin-bottom: 1rem">${message}</p>
        <a href="/" class="btn btn-primary">Voltar para Home</a>
      </div>
    `
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new ProductPage()
  })
} else {
  new ProductPage()
}
