// Centralized API Layer
// All external API calls go through this module

const API_CONFIG = {
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
}

class API {
  constructor(config = API_CONFIG) {
    this.config = config
  }

  async request(endpoint, options = {}) {
    const url = `${this.config.baseURL}${endpoint}`
    const config = {
      ...options,
      headers: {
        ...this.config.headers,
        ...options.headers,
      },
    }

    // Add auth token if available
    const user = this.getUser()
    if (user && user.token) {
      config.headers["Authorization"] = `Bearer ${user.token}`
    }

    console.log("[v0] API Request:", { url, config })

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[v0] API Response:", data)
      return data
    } catch (error) {
      console.error("[v0] API Error:", error)
      throw error
    }
  }

  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    return this.request(url, { method: "GET" })
  }

  post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" })
  }

  getUser() {
    try {
      const user = localStorage.getItem("marketplace_user")
      return user ? JSON.parse(user) : null
    } catch {
      return null
    }
  }
}

// Export singleton instance
const api = new API()

// Export API methods organized by domain
export default {
  // Products
  products: {
    list: (filters = {}) => api.get("/products", filters),
    get: (id) => api.get(`/products/${id}`),
    create: (data) => api.post("/products", data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
  },

  // Cart
  cart: {
    get: () => api.get("/cart"),
    add: (item) => api.post("/cart", item),
    update: (itemId, data) => api.put(`/cart/${itemId}`, data),
    remove: (itemId) => api.delete(`/cart/${itemId}`),
    clear: () => api.delete("/cart"),
  },

  // Orders
  orders: {
    list: (filters = {}) => api.get("/orders", filters),
    get: (id) => api.get(`/orders/${id}`),
    create: (data) => api.post("/orders", data),
  },

  // Checkout
  checkout: {
    create: (data) => api.post("/checkout/create", data),
  },

  // Auth
  auth: {
    login: (credentials) => api.post("/auth/login", credentials),
    signup: (data) => api.post("/auth/signup", data),
    logout: () => api.post("/auth/logout"),
    forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
    resetPassword: (token, password) => api.post("/auth/reset-password", { token, password }),
  },

  // Uploads
  uploads: {
    upload: async (file) => {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${API_CONFIG.baseURL}/uploads`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${api.getUser()?.token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      return response.json()
    },
  },

  // Messages
  messages: {
    send: (data) => api.post("/messages/send", data),
    list: (conversationId) => api.get(`/messages/${conversationId}`),
  },

  // Webhooks (for testing)
  webhooks: {
    mercadoPago: (data) => api.post("/webhooks/mercadopago", data),
    melhorEnvio: (data) => api.post("/webhooks/melhorenvio", data),
  },
}
