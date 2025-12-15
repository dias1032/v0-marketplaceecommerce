import mysql from "mysql2/promise"

// Pool de conexões MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
})

// Função helper para executar queries
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const [results] = await pool.execute(sql, params)
  return results as T
}

// Função para obter uma conexão do pool
export async function getConnection() {
  return pool.getConnection()
}

// Exportar o pool para uso direto se necessário
export { pool }

// Tipos para as tabelas
export interface User {
  id: number
  email: string
  password_hash: string
  full_name: string
  username?: string
  avatar_url?: string
  phone?: string
  role: "customer" | "seller" | "admin"
  email_verified: boolean
  created_at: Date
  updated_at: Date
}

export interface Store {
  id: number
  user_id: number
  store_name: string
  slug: string
  description?: string
  logo_url?: string
  banner_url?: string
  is_verified: boolean
  verification_status: "pending" | "approved" | "rejected"
  cpf_cnpj?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  rating: number
  total_sales: number
  created_at: Date
  updated_at: Date
}

export interface Product {
  id: number
  store_id: number
  category_id?: number
  title: string
  slug: string
  description?: string
  price: number
  original_price?: number
  stock: number
  sku?: string
  brand?: string
  size?: string
  color?: string
  condition: "new" | "like_new" | "good" | "fair"
  images: string[]
  is_active: boolean
  is_featured: boolean
  views: number
  created_at: Date
  updated_at: Date
}

export interface Order {
  id: number
  order_number: string
  user_id: number
  store_id: number
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
  subtotal: number
  shipping_cost: number
  discount: number
  total_amount: number
  payment_method?: string
  payment_id?: string
  payment_status: "pending" | "approved" | "rejected" | "refunded"
  shipping_address: any
  tracking_code?: string
  notes?: string
  created_at: Date
  updated_at: Date
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: number
  display_order: number
  is_active: boolean
  created_at: Date
}
