"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Verification {
  id: string
  full_name: string
  cpf_cnpj: string
  email: string
  phone: string
  address: any
  documents: any
  status: string
  created_at: string
  stores?: {
    name: string
    username: string
  }
}

export function PendingVerifications() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchVerifications()
  }, [])

  async function fetchVerifications() {
    try {
      const response = await fetch("/api/admin/verifications")
      if (response.ok) {
        const data = await response.json()
        setVerifications(data.verifications || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching verifications:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(verificationId: string, action: "approve" | "reject") {
    setProcessing(verificationId)
    try {
      const response = await fetch("/api/admin/approve-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verification_id: verificationId, action }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: data.message,
        })
        fetchVerifications()
        setSelectedVerification(null)
      } else {
        toast({
          title: "Erro",
          description: data.error || "Falha ao processar verificação",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar verificação",
        variant: "destructive",
      })
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Verificações Pendentes</CardTitle>
          <CardDescription>Aprovar ou rejeitar novos vendedores</CardDescription>
        </CardHeader>
        <CardContent>
          {verifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma verificação pendente</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Loja</TableHead>
                  <TableHead>CPF/CNPJ</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verifications.map((verification) => (
                  <TableRow key={verification.id}>
                    <TableCell className="font-medium">{verification.full_name}</TableCell>
                    <TableCell>
                      {verification.stores ? (
                        <div>
                          <div className="font-medium">{verification.stores.name}</div>
                          <div className="text-xs text-muted-foreground">@{verification.stores.username}</div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{verification.cpf_cnpj}</TableCell>
                    <TableCell>{verification.email}</TableCell>
                    <TableCell>{new Date(verification.created_at).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedVerification(verification)}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleAction(verification.id, "approve")}
                          disabled={processing === verification.id}
                        >
                          {processing === verification.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleAction(verification.id, "reject")}
                          disabled={processing === verification.id}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedVerification} onOpenChange={() => setSelectedVerification(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Verificação</DialogTitle>
            <DialogDescription>Informações completas do vendedor</DialogDescription>
          </DialogHeader>
          {selectedVerification && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Informações Pessoais</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nome:</span>
                    <p className="font-medium">{selectedVerification.full_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CPF/CNPJ:</span>
                    <p className="font-medium">{selectedVerification.cpf_cnpj}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{selectedVerification.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Telefone:</span>
                    <p className="font-medium">{selectedVerification.phone}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Endereço</h4>
                <pre className="text-sm bg-muted p-3 rounded">
                  {JSON.stringify(selectedVerification.address, null, 2)}
                </pre>
              </div>

              {selectedVerification.documents && (
                <div>
                  <h4 className="font-semibold mb-2">Documentos</h4>
                  <pre className="text-sm bg-muted p-3 rounded">
                    {JSON.stringify(selectedVerification.documents, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  variant="default"
                  onClick={() => handleAction(selectedVerification.id, "approve")}
                  disabled={processing === selectedVerification.id}
                >
                  {processing === selectedVerification.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Aprovar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleAction(selectedVerification.id, "reject")}
                  disabled={processing === selectedVerification.id}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeitar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
