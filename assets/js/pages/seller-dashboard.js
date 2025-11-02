class SellerDashboard {
  constructor() {
    this.currentSection = "overview"
    this.products = []
    this.orders = []
    this.init()
  }

  async init() {
    console.log("[v0] Initializing seller dashboard")

    // Check if user is logged in and is a seller
    const user = this.getUser()
    if (!user) {
      window.location.href = "/login.html?return=/seller/dashboard.html"
      return
    }

    // Setup navigation
    this.setupNavigation()

    // Load initial data
    await this.loadDashboardData()

    // Setup form handlers
    this.setupFormHandlers()

    console.log("[v0] Seller dashboard initialized")
  }

  getUser() {
    try {
      const user = localStorage.getItem("marketplace_user")
      return user ? JSON.parse(user) : null
    } catch {
      return null
    }
  }

  setupNavigation() {
    const links = document.querySelectorAll(".sidebar-link")

    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        const section = link.dataset.section
        this.showSection(section)
      })
    })
  }

  showSection(section) {
    console.log("[v0] Showing section:", section)

    // Update active link
    document.querySelectorAll(".sidebar-link").forEach((link) => {
      if (link.dataset.section === section) {
        link.classList.add("active")
        link.style.color = "white"
      } else {
        link.classList.remove("active")
        link.style.color = "var(--color-text-secondary)"
      }
    })

    // Hide all sections
    document.querySelectorAll(".dashboard-section").forEach((sec) => {
      sec.style.display = "none"
    })

    // Show selected section
    const sectionElement = document.getElementById(`section-${section}`)
    if (sectionElement) {
      sectionElement.style.display = "block"
    }

    this.currentSection = section

    // Load section-specific data
    if (section === "products") {
      this.loadProducts()
    } else if (section === "orders") {
      this.loadOrders()
    }
  }

  async loadDashboardData() {
    // TODO_INTEGRATION: Load real data from API
    await this.loadRecentOrders()
  }

  async loadRecentOrders() {
    const container = document.getElementById("recent-orders")
    if (!container) return

    // TODO_INTEGRATION: Fetch from API
    // const orders = await api.orders.list({ limit: 5 });

    // Mock data
    const mockOrders = [
      {
        id: "ORD-001",
        customer: "Maria Silva",
        total: 15990,
        status: "paid",
        date: "2025-01-08",
      },
      {
        id: "ORD-002",
        customer: "João Santos",
        total: 8990,
        status: "processing",
        date: "2025-01-08",
      },
      {
        id: "ORD-003",
        customer: "Ana Costa",
        total: 12450,
        status: "shipped",
        date: "2025-01-07",
      },
    ]

    container.innerHTML = `
      <div style="overflow-x: auto">
        <table style="width: 100%; border-collapse: collapse">
          <thead>
            <tr style="border-bottom: 1px solid var(--color-border)">
              <th style="text-align: left; padding: 0.75rem; font-size: 0.875rem; font-weight: 600; color: var(--color-text-secondary)">Pedido</th>
              <th style="text-align: left; padding: 0.75rem; font-size: 0.875rem; font-weight: 600; color: var(--color-text-secondary)">Cliente</th>
              <th style="text-align: left; padding: 0.75rem; font-size: 0.875rem; font-weight: 600; color: var(--color-text-secondary)">Total</th>
              <th style="text-align: left; padding: 0.75rem; font-size: 0.875rem; font-weight: 600; color: var(--color-text-secondary)">Status</th>
              <th style="text-align: left; padding: 0.75rem; font-size: 0.875rem; font-weight: 600; color: var(--color-text-secondary)">Data</th>
            </tr>
          </thead>
          <tbody>
            ${mockOrders
              .map(
                (order) => `
              <tr style="border-bottom: 1px solid var(--color-border)">
                <td style="padding: 0.75rem; font-weight: 600">${order.id}</td>
                <td style="padding: 0.75rem">${order.customer}</td>
                <td style="padding: 0.75rem">R$ ${(order.total / 100).toFixed(2)}</td>
                <td style="padding: 0.75rem">
                  <span style="padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 600; background: ${this.getStatusColor(order.status)}">
                    ${this.getStatusLabel(order.status)}
                  </span>
                </td>
                <td style="padding: 0.75rem; color: var(--color-text-secondary)">${new Date(order.date).toLocaleDateString("pt-BR")}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `
  }

  async loadProducts() {
    const container = document.getElementById("products-list")
    if (!container) return

    // TODO_INTEGRATION: Fetch from API
    // const products = await api.products.list({ shop_id: user.shop_id });

    // Mock data
    const mockProducts = Array.from({ length: 8 }, (_, i) => ({
      id: `prod-${i}`,
      title: `Produto ${i + 1}`,
      price: Math.floor(Math.random() * 20000) + 3000,
      stock: Math.floor(Math.random() * 50),
      status: Math.random() > 0.3 ? "active" : "inactive",
      image: `/placeholder.svg?height=100&width=100&query=product ${i + 1}`,
    }))

    container.innerHTML = `
      <div style="background: white; border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden">
        <div style="overflow-x: auto">
          <table style="width: 100%; border-collapse: collapse">
            <thead>
              <tr style="background: var(--color-surface); border-bottom: 1px solid var(--color-border)">
                <th style="text-align: left; padding: 1rem; font-size: 0.875rem; font-weight: 600">Produto</th>
                <th style="text-align: left; padding: 1rem; font-size: 0.875rem; font-weight: 600">Preço</th>
                <th style="text-align: left; padding: 1rem; font-size: 0.875rem; font-weight: 600">Estoque</th>
                <th style="text-align: left; padding: 1rem; font-size: 0.875rem; font-weight: 600">Status</th>
                <th style="text-align: right; padding: 1rem; font-size: 0.875rem; font-weight: 600">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${mockProducts
                .map(
                  (product) => `
                <tr style="border-bottom: 1px solid var(--color-border)">
                  <td style="padding: 1rem">
                    <div style="display: flex; align-items: center; gap: 1rem">
                      <img src="${product.image}" alt="${product.title}" style="width: 48px; height: 48px; border-radius: var(--radius-md); object-fit: cover" />
                      <span style="font-weight: 500">${product.title}</span>
                    </div>
                  </td>
                  <td style="padding: 1rem">R$ ${(product.price / 100).toFixed(2)}</td>
                  <td style="padding: 1rem">${product.stock} un.</td>
                  <td style="padding: 1rem">
                    <span style="padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 600; background: ${product.status === "active" ? "rgba(46, 213, 115, 0.1); color: var(--color-success)" : "rgba(0, 0, 0, 0.05); color: var(--color-text-muted)"}">
                      ${product.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td style="padding: 1rem; text-align: right">
                    <button class="btn-icon" onclick="alert('TODO: Edit product ${product.id}')" aria-label="Editar">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button class="btn-icon" onclick="alert('TODO: Delete product ${product.id}')" aria-label="Excluir">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `
  }

  async loadOrders() {
    const container = document.getElementById("orders-list")
    if (!container) return

    // TODO_INTEGRATION: Fetch from API
    // const orders = await api.orders.list({ shop_id: user.shop_id });

    // Mock data
    const mockOrders = Array.from({ length: 12 }, (_, i) => ({
      id: `ORD-${String(i + 1).padStart(3, "0")}`,
      customer: `Cliente ${i + 1}`,
      total: Math.floor(Math.random() * 30000) + 5000,
      status: ["paid", "processing", "shipped", "delivered"][Math.floor(Math.random() * 4)],
      date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    }))

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1rem">
        ${mockOrders
          .map(
            (order) => `
          <div style="background: white; border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 1.5rem">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem">
              <div>
                <div style="font-weight: 700; font-size: 1.125rem; margin-bottom: 0.25rem">${order.id}</div>
                <div style="font-size: 0.875rem; color: var(--color-text-secondary)">${order.customer}</div>
              </div>
              <span style="padding: 0.5rem 1rem; border-radius: var(--radius-md); font-size: 0.875rem; font-weight: 600; background: ${this.getStatusColor(order.status)}">
                ${this.getStatusLabel(order.status)}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <div>
                <div style="font-size: 1.25rem; font-weight: 700; color: var(--color-primary)">R$ ${(order.total / 100).toFixed(2)}</div>
                <div style="font-size: 0.75rem; color: var(--color-text-muted)">${new Date(order.date).toLocaleDateString("pt-BR")}</div>
              </div>
              <div style="display: flex; gap: 0.5rem">
                ${order.status === "paid" ? `<button class="btn btn-primary btn-sm" onclick="alert('TODO_INTEGRATION: Generate shipping label with Melhor Envio')">Gerar Etiqueta</button>` : ""}
                <button class="btn btn-outline btn-sm" onclick="alert('TODO: View order details')">Ver Detalhes</button>
              </div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    `
  }

  setupFormHandlers() {
    // Product form
    const productForm = document.getElementById("create-product-form")
    if (productForm) {
      productForm.addEventListener("submit", (e) => this.handleCreateProduct(e))
    }

    // Shop settings form
    const shopForm = document.getElementById("shop-settings-form")
    if (shopForm) {
      shopForm.addEventListener("submit", (e) => this.handleUpdateShop(e))
    }
  }

  showProductForm() {
    document.getElementById("product-form").style.display = "block"
    document.getElementById("product-title").focus()
  }

  hideProductForm() {
    document.getElementById("product-form").style.display = "none"
    document.getElementById("create-product-form").reset()
  }

  async handleCreateProduct(e) {
    e.preventDefault()

    const productData = {
      title: document.getElementById("product-title").value,
      description: document.getElementById("product-description").value,
      price_cents: Math.round(Number.parseFloat(document.getElementById("product-price").value) * 100),
      stock: Number.parseInt(document.getElementById("product-stock").value),
      category: document.getElementById("product-category").value,
      // TODO_INTEGRATION: Handle image uploads to Supabase Storage
      images: ["/placeholder.svg?height=400&width=400"],
    }

    console.log("[v0] Creating product:", productData)

    try {
      // TODO_INTEGRATION: Call API
      // const result = await api.products.create(productData);

      alert("Produto criado com sucesso!")
      this.hideProductForm()
      this.loadProducts()
    } catch (error) {
      console.error("[v0] Error creating product:", error)
      alert("Erro ao criar produto. Tente novamente.")
    }
  }

  async handleUpdateShop(e) {
    e.preventDefault()

    const shopData = {
      name: document.getElementById("shop-name").value,
      description: document.getElementById("shop-description").value,
      cnpj: document.getElementById("shop-cnpj").value,
    }

    console.log("[v0] Updating shop:", shopData)

    try {
      // TODO_INTEGRATION: Call API
      // await api.shops.update(user.shop_id, shopData);

      alert("Configurações salvas com sucesso!")
    } catch (error) {
      console.error("[v0] Error updating shop:", error)
      alert("Erro ao salvar configurações. Tente novamente.")
    }
  }

  getStatusColor(status) {
    const colors = {
      paid: "rgba(46, 213, 115, 0.1); color: var(--color-success)",
      processing: "rgba(255, 165, 2, 0.1); color: var(--color-warning)",
      shipped: "rgba(102, 126, 234, 0.1); color: #667eea",
      delivered: "rgba(46, 213, 115, 0.1); color: var(--color-success)",
      cancelled: "rgba(255, 71, 87, 0.1); color: var(--color-accent)",
    }
    return colors[status] || "rgba(0, 0, 0, 0.05); color: var(--color-text-muted)"
  }

  getStatusLabel(status) {
    const labels = {
      paid: "Pago",
      processing: "Processando",
      shipped: "Enviado",
      delivered: "Entregue",
      cancelled: "Cancelado",
    }
    return labels[status] || status
  }
}

// Initialize and expose globally
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.sellerDashboard = new SellerDashboard()
  })
} else {
  window.sellerDashboard = new SellerDashboard()
}
