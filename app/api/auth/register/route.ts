import { type NextRequest, NextResponse } from "next/server"
import { registerUser, generateToken, setAuthCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, role } = body

    // Validações
    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Email, senha e nome são obrigatórios" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    // Registrar usuário
    const result = await registerUser(email, password, fullName, role || "customer")

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Gerar token e definir cookie
    const token = generateToken({
      userId: result.user!.id,
      email: result.user!.email,
      role: result.user!.role,
    })

    await setAuthCookie(token)

    return NextResponse.json({
      success: true,
      user: result.user,
    })
  } catch (error: any) {
    console.error("Erro no registro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
