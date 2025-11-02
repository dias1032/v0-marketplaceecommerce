"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Upload, Trash2, Search, Loader2 } from "lucide-react"
import Image from "next/image"

interface Media {
  id: string
  url: string
  filename: string
  mime_type: string
  size_bytes: number
  width?: number
  height?: number
  alt_text?: string
  created_at: string
}

export function MediaManager() {
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    try {
      const response = await fetch("/api/admin/media")
      if (!response.ok) throw new Error("Failed to fetch media")
      const data = await response.json()
      setMedia(data)
    } catch (error) {
      toast({
        title: "Erro ao carregar mídia",
        description: "Não foi possível carregar os arquivos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/admin/upload-media", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) throw new Error("Upload failed")
      }

      toast({
        title: "Upload concluído",
        description: `${files.length} arquivo(s) enviado(s) com sucesso`,
      })

      fetchMedia()
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar os arquivos",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este arquivo?")) return

    try {
      const response = await fetch(`/api/admin/media/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Delete failed")

      toast({
        title: "Arquivo excluído",
        description: "O arquivo foi removido com sucesso",
      })

      setMedia((prev) => prev.filter((m) => m.id !== id))
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o arquivo",
        variant: "destructive",
      })
    }
  }

  const filteredMedia = media.filter((m) => m.filename.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Biblioteca de Mídia</CardTitle>
          <CardDescription>Gerencie imagens e arquivos do site</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar arquivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => document.getElementById("media-upload")?.click()} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
            <input id="media-upload" type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {searchTerm ? "Nenhum arquivo encontrado" : "Nenhum arquivo enviado ainda"}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredMedia.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="relative aspect-square bg-muted">
                    {item.mime_type.startsWith("image/") ? (
                      <Image
                        src={item.url || "/placeholder.svg"}
                        alt={item.alt_text || item.filename}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        {item.mime_type}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="truncate text-sm font-medium">{item.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {(item.size_bytes / 1024).toFixed(1)} KB
                      {item.width && item.height && ` • ${item.width}x${item.height}`}
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="mr-2 h-3 w-3" />
                      Excluir
                    </Button>
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
