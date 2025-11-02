"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Page {
  id: string
  slug: string
  title: string
  content: string
  meta_title?: string
  meta_description?: string
  is_published: boolean
  created_at: string
}

export function PagesManager() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const response = await fetch("/api/admin/pages")
      if (!response.ok) throw new Error("Failed to fetch pages")
      const data = await response.json()
      setPages(data)
    } catch (error) {
      toast({
        title: "Erro ao carregar páginas",
        description: "Não foi possível carregar as páginas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (page: Partial<Page>) => {
    try {
      const response = await fetch("/api/admin/pages", {
        method: page.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page),
      })

      if (!response.ok) throw new Error("Save failed")

      toast({
        title: page.id ? "Página atualizada" : "Página criada",
        description: "As alterações foram salvas com sucesso",
      })

      setDialogOpen(false)
      setEditingPage(null)
      fetchPages()
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a página",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta página?")) return

    try {
      const response = await fetch(`/api/admin/pages/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Delete failed")

      toast({
        title: "Página excluída",
        description: "A página foi removida com sucesso",
      })

      setPages((prev) => prev.filter((p) => p.id !== id))
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a página",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Páginas Estáticas</CardTitle>
              <CardDescription>Crie e gerencie páginas personalizadas</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingPage(null)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Página
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingPage ? "Editar Página" : "Nova Página"}</DialogTitle>
                  <DialogDescription>Preencha os campos abaixo para criar ou editar uma página</DialogDescription>
                </DialogHeader>
                <PageEditor page={editingPage} onSave={handleSave} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : pages.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">Nenhuma página criada ainda</div>
          ) : (
            <div className="space-y-4">
              {pages.map((page) => (
                <Card key={page.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{page.title}</h3>
                        {page.is_published ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                            Publicada
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">Rascunho</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">/{page.slug}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingPage(page)
                          setDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(page.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function PageEditor({ page, onSave }: { page: Page | null; onSave: (page: Partial<Page>) => void }) {
  const [formData, setFormData] = useState<Partial<Page>>(
    page || {
      slug: "",
      title: "",
      content: "",
      meta_title: "",
      meta_description: "",
      is_published: false,
    },
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
          placeholder="minha-pagina"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Conteúdo</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={10}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="meta_title">Meta Título (SEO)</Label>
        <Input
          id="meta_title"
          value={formData.meta_title}
          onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="meta_description">Meta Descrição (SEO)</Label>
        <Textarea
          id="meta_description"
          value={formData.meta_description}
          onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_published"
          checked={formData.is_published}
          onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
        />
        <Label htmlFor="is_published">Publicar página</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  )
}
