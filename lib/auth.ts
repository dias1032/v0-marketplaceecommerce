import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { query, type User } from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me"
const JWT_EXPIRES_IN = "7d"

export interface JWTPayload {
  userId: number
  email: string
  role: string
  iat?: number
  exp?: number
}

// Gerar hash da senha
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verificar senha
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Gerar JWT
export function generateToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Verificar JWT
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

// Obter sessão atual do usuário
export async function getSession(): Promise<{ user: Omit<User, "password_hash"> } | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) return null

    const payload = verifyToken(token)
    if (!payload) return null

    const users = await query<User[]>(
      "SELECT id, email, full_name, username, avatar_url, phone, role, email_verified, created_at, updated_at FROM users WHERE id = ?",
      [payload.userId],
    )

    if (users.length === 0) return null

    return { user: users[0] }
  } catch {
    return null
  }
}

// Definir cookie de autenticação
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: "/",
  })
}

// Remover cookie de autenticação
export async function removeAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete("auth_token")
}

// Registrar novo usuário
export async function registerUser(
  email: string,
  password: string,
  fullName: string,
  role: "customer" | "seller" = "customer",
): Promise<{ success: boolean; user?: Omit<User, "password_hash">; error?: string }> {
  try {
    // Verificar se email já existe
    const existing = await query<User[]>("SELECT id FROM users WHERE email = ?", [email])
    if (existing.length > 0) {
      return { success: false, error: "Este email já está cadastrado" }
    }

    // Hash da senha
    const passwordHash = await hashPassword(password)

    // Inserir usuário
    const result = await query<any>("INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)", [
      email,
      passwordHash,
      fullName,
      role,
    ])

    const userId = result.insertId

    // Buscar usuário criado
    const users = await query<User[]>(
      "SELECT id, email, full_name, username, avatar_url, phone, role, email_verified, created_at, updated_at FROM users WHERE id = ?",
      [userId],
    )

    return { success: true, user: users[0] }
  } catch (error: any) {
    console.error("Erro ao registrar usuário:", error)
    return { success: false, error: "Erro ao criar conta" }
  }
}

// Login do usuário
export async function loginUser(
  email: string,
  password: string,
): Promise<{ success: boolean; user?: Omit<User, "password_hash">; token?: string; error?: string }> {
  try {
    const users = await query<User[]>("SELECT * FROM users WHERE email = ?", [email])

    if (users.length === 0) {
      return { success: false, error: "Email ou senha incorretos" }
    }

    const user = users[0]
    const isValid = await verifyPassword(password, user.password_hash)

    if (!isValid) {
      return { success: false, error: "Email ou senha incorretos" }
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const { password_hash, ...userWithoutPassword } = user

    return { success: true, user: userWithoutPassword, token }
  } catch (error: any) {
    console.error("Erro ao fazer login:", error)
    return { success: false, error: "Erro ao fazer login" }
  }
}
