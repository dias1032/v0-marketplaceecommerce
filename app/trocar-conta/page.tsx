"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Store, Upload, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function TrocarContaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [cpfCnpj, setCpfCnpj] = useState("")
  const [document, setDocument] = useState<File | null>(null)

  const validateCpfCnpj = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    return cleaned.length === 11 || cleaned.length === 14
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!validateCpfCnpj(cpfCnpj)) {
      setError("CPF/CNPJ inválido. Digite 11 dígitos (CPF) ou 14 dígitos (CNPJ)")
      setLoading(false)
      return
    }

    if (!document) {
      setError("Por favor, envie um documento de identificação")
      setLoading(false)
      return
    }

    if (document.size > 5 * 1024 * 1024) {
      setError("O arquivo deve ter no máximo 5MB")
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("cpf_cnpj", cpfCnpj.replace(/\D/g, ""))
      formData.append("document", document)

      const response = await fetch("/api/seller-request", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar solicitação")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/perfil")
      }, 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Solicitação Enviada!</CardTitle>
            <CardDescription>
              Sua solicitação para se tornar vendedor foi enviada com sucesso. Nossa equipe irá analisar seus documentos
              e você receberá um e-mail em até 48 horas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/perfil">Voltar ao Perfil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Store className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-center">Tornar-se Vendedor</CardTitle>
          <CardDescription className="text-center">
            Preencha os dados abaixo para solicitar sua conta de vendedor. Analisaremos sua solicitação em até 48 horas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cpf_cnpj">CPF ou CNPJ *</Label>
              <Input
                id="cpf_cnpj"
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Digite apenas números</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">Documento de Identificação *</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  id="document"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setDocument(e.target.files?.[0] || null)}
                  className="hidden"
                  required
                />
                <label htmlFor="document" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">{document ? document.name : "Clique para enviar seu documento"}</p>
                  <p className="text-xs text-muted-foreground mt-1">RG, CNH ou documento com foto (máx. 5MB)</p>
                </label>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar Solicitação"}
              </Button>
              <Button type="button" variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/perfil">Cancelar</Link>
              </Button>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Ao enviar esta solicitação, você concorda com nossos Termos de Uso para Vendedores e confirma que as
                informações fornecidas são verdadeiras.
              </AlertDescription>
            </Alert>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
