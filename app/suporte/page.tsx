"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function SuportePage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "",
    subject: "",
    message: "",
    orderId: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/send-onesignal-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to_email: "suporte@vestti.com",
          subject: `[${formData.type}] ${formData.subject}`,
          html: `
            <h2>Nova Solicitação de Suporte</h2>
            <p><strong>Nome:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Tipo:</strong> ${formData.type}</p>
            <p><strong>Assunto:</strong> ${formData.subject}</p>
            ${formData.orderId ? `<p><strong>ID do Pedido:</strong> ${formData.orderId}</p>` : ""}
            <p><strong>Mensagem:</strong></p>
            <p>${formData.message.replace(/\n/g, "<br>")}</p>
          `,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao enviar mensagem")
      }

      setSuccess(true)
      setFormData({ name: "", email: "", type: "", subject: "", message: "", orderId: "" })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Central de Suporte</h1>
          <p className="text-muted-foreground">Precisa de ajuda? Entre em contato conosco ou reporte um problema.</p>
        </div>

        {success && (
          <Alert className="mb-6 border-green-500">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              Mensagem enviada com sucesso! Nossa equipe responderá em até 24 horas no email fornecido.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Enviar Mensagem
            </CardTitle>
            <CardDescription>Preencha o formulário abaixo e entraremos em contato em breve.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Solicitação *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="duvida">Dúvida</SelectItem>
                    <SelectItem value="problema_pedido">Problema com Pedido</SelectItem>
                    <SelectItem value="denuncia_vendedor">Denunciar Vendedor</SelectItem>
                    <SelectItem value="denuncia_produto">Denunciar Produto</SelectItem>
                    <SelectItem value="reembolso">Solicitar Reembolso</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.type === "problema_pedido" || formData.type === "reembolso") && (
                <div className="space-y-2">
                  <Label htmlFor="orderId">ID do Pedido</Label>
                  <Input
                    id="orderId"
                    placeholder="Ex: 12345678"
                    value={formData.orderId}
                    onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="subject">Assunto *</Label>
                <Input
                  id="subject"
                  placeholder="Descreva brevemente o assunto"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensagem *</Label>
                <Textarea
                  id="message"
                  placeholder="Descreva detalhadamente sua solicitação..."
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar Mensagem"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/">Voltar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Outras Formas de Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground">suporte@vestti.com</p>
            </div>
            <div>
              <p className="font-medium">WhatsApp</p>
              <p className="text-sm text-muted-foreground">(11) 99999-9999</p>
            </div>
            <div>
              <p className="font-medium">Horário de Atendimento</p>
              <p className="text-sm text-muted-foreground">Segunda a Sexta, 9h às 18h</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
