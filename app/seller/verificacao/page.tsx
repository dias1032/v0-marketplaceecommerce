"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Clock, XCircle, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SellerVerificationPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    cpfCnpj: "",
    phone: "",
    email: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
  })
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadVerificationStatus()
  }, [])

  const loadVerificationStatus = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from("profiles")
      .select("verification_status, rejection_reason, email, full_name, phone, cpf_cnpj, address")
      .eq("id", user.id)
      .single()

    if (profile) {
      setVerificationStatus(profile.verification_status)
      setRejectionReason(profile.rejection_reason)

      // Pre-fill form with existing data
      if (profile.email) setFormData((prev) => ({ ...prev, email: profile.email }))
      if (profile.full_name) setFormData((prev) => ({ ...prev, fullName: profile.full_name }))
      if (profile.phone) setFormData((prev) => ({ ...prev, phone: profile.phone }))
      if (profile.cpf_cnpj) setFormData((prev) => ({ ...prev, cpfCnpj: profile.cpf_cnpj }))
      if (profile.address) {
        const addr = profile.address as any
        setFormData((prev) => ({
          ...prev,
          street: addr.street || "",
          number: addr.number || "",
          complement: addr.complement || "",
          neighborhood: addr.neighborhood || "",
          city: addr.city || "",
          state: addr.state || "",
          zipCode: addr.zipCode || "",
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuário não autenticado")

      const address = {
        street: formData.street,
        number: formData.number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
      }

      // Create verification request
      const { error: requestError } = await supabase.from("seller_verification_requests").insert({
        user_id: user.id,
        full_name: formData.fullName,
        cpf_cnpj: formData.cpfCnpj,
        phone: formData.phone,
        email: formData.email,
        address: address,
        status: "pending",
      })

      if (requestError) throw requestError

      // Update profile with verification data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
          cpf_cnpj: formData.cpfCnpj,
          address: address,
          verification_status: "pending",
          verification_submitted_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (profileError) throw profileError

      // Send verification email to admin
      await fetch("/api/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          fullName: formData.fullName,
          cpfCnpj: formData.cpfCnpj,
          phone: formData.phone,
          email: formData.email,
          address: address,
        }),
      })

      setVerificationStatus("pending")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar solicitação")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  if (verificationStatus === "approved") {
    return (
      <div className="container max-w-2xl py-16">
        <Card className="border-green-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <CardTitle>Verificação Aprovada!</CardTitle>
            </div>
            <CardDescription>Sua conta de vendedor foi verificada com sucesso.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Parabéns! Você agora tem acesso completo às funcionalidades de vendedor da Vestti.
            </p>
            <Button onClick={() => router.push("/seller/dashboard")}>Ir para Painel de Vendedor</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (verificationStatus === "pending") {
    return (
      <div className="container max-w-2xl py-16">
        <Card className="border-yellow-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-yellow-500" />
              <CardTitle>Verificação em Análise</CardTitle>
            </div>
            <CardDescription>Sua solicitação está sendo analisada pela nossa equipe.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Você receberá um e-mail assim que sua verificação for aprovada. Isso geralmente leva até 48 horas.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (verificationStatus === "rejected") {
    return (
      <div className="container max-w-2xl py-16">
        <Card className="border-red-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-red-500" />
              <CardTitle>Verificação Negada</CardTitle>
            </div>
            <CardDescription>Sua solicitação de verificação foi negada.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rejectionReason && (
              <Alert>
                <AlertDescription>
                  <strong>Motivo:</strong> {rejectionReason}
                </AlertDescription>
              </Alert>
            )}
            <p className="text-sm text-muted-foreground">
              Você pode enviar uma nova solicitação corrigindo as informações.
            </p>
            <Button onClick={() => setVerificationStatus(null)}>Enviar Nova Solicitação</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-16">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <CardTitle>Verificação de Vendedor</CardTitle>
          </div>
          <CardDescription>
            Para ativar as funções de vendedor, precisamos verificar suas informações. Todos os dados são mantidos em
            sigilo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Informações Pessoais</h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Nome Completo *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="João da Silva"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cpfCnpj">CPF ou CNPJ *</Label>
                  <Input
                    id="cpfCnpj"
                    name="cpfCnpj"
                    value={formData.cpfCnpj}
                    onChange={handleChange}
                    required
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="font-semibold">Endereço</h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="zipCode">CEP *</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                    placeholder="00000-000"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 grid gap-2">
                    <Label htmlFor="street">Rua *</Label>
                    <Input
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      required
                      placeholder="Rua das Flores"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="number">Número *</Label>
                    <Input
                      id="number"
                      name="number"
                      value={formData.number}
                      onChange={handleChange}
                      required
                      placeholder="123"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    name="complement"
                    value={formData.complement}
                    onChange={handleChange}
                    placeholder="Apto 45"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Input
                    id="neighborhood"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleChange}
                    required
                    placeholder="Centro"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="São Paulo"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="state">Estado *</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar Solicitação"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Ao enviar, você concorda que suas informações sejam verificadas pela equipe Vestti.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
