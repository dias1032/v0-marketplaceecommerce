"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save } from "lucide-react"

interface SettingsEditorProps {
  initialSettings: Record<string, any>
}

export function SettingsEditor({ initialSettings }: SettingsEditorProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/admin/upload-media", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const { mediaId, url } = await response.json()
      handleChange("site_logo", mediaId)

      toast({
        title: "Logo atualizada",
        description: "A logo foi enviada com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar a logo",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/update-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      })

      if (!response.ok) throw new Error("Save failed")

      toast({
        title: "Configurações salvas",
        description: "As alterações foram aplicadas com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Identidade Visual</CardTitle>
          <CardDescription>Logo, favicon e cores do site</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logo">Logo do Site</Label>
            <div className="flex items-center gap-4">
              {settings.site_logo && <img src="/logo-vestti.png" alt="Logo" className="h-12 w-auto object-contain" />}
              <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
              {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Cor Primária</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={settings.primary_color || "#FF5D5D"}
                  onChange={(e) => handleChange("primary_color", e.target.value)}
                  className="w-20"
                />
                <Input
                  type="text"
                  value={settings.primary_color || "#FF5D5D"}
                  onChange={(e) => handleChange("primary_color", e.target.value)}
                  placeholder="#FF5D5D"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary_color">Cor Secundária</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary_color"
                  type="color"
                  value={settings.secondary_color || "#1a1a1a"}
                  onChange={(e) => handleChange("secondary_color", e.target.value)}
                  className="w-20"
                />
                <Input
                  type="text"
                  value={settings.secondary_color || "#1a1a1a"}
                  onChange={(e) => handleChange("secondary_color", e.target.value)}
                  placeholder="#1a1a1a"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Site</CardTitle>
          <CardDescription>Título, descrição e metadados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site_title">Título do Site</Label>
            <Input
              id="site_title"
              value={settings.site_title || ""}
              onChange={(e) => handleChange("site_title", e.target.value)}
              placeholder="Vestti"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site_description">Descrição</Label>
            <Textarea
              id="site_description"
              value={settings.site_description || ""}
              onChange={(e) => handleChange("site_description", e.target.value)}
              placeholder="Marketplace social para comprar e vender"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hero da Homepage</CardTitle>
          <CardDescription>Textos principais da página inicial</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hero_title">Título Principal</Label>
            <Input
              id="hero_title"
              value={settings.hero_title || ""}
              onChange={(e) => handleChange("hero_title", e.target.value)}
              placeholder="Descubra produtos incríveis"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero_subtitle">Subtítulo</Label>
            <Textarea
              id="hero_subtitle"
              value={settings.hero_subtitle || ""}
              onChange={(e) => handleChange("hero_subtitle", e.target.value)}
              placeholder="Conecte-se com vendedores e encontre o que você precisa"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Redes Sociais</CardTitle>
          <CardDescription>Links para perfis sociais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="social_instagram">Instagram</Label>
            <Input
              id="social_instagram"
              value={settings.social_instagram || ""}
              onChange={(e) => handleChange("social_instagram", e.target.value)}
              placeholder="https://instagram.com/vestti"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_facebook">Facebook</Label>
            <Input
              id="social_facebook"
              value={settings.social_facebook || ""}
              onChange={(e) => handleChange("social_facebook", e.target.value)}
              placeholder="https://facebook.com/vestti"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_twitter">Twitter/X</Label>
            <Input
              id="social_twitter"
              value={settings.social_twitter || ""}
              onChange={(e) => handleChange("social_twitter", e.target.value)}
              placeholder="https://twitter.com/vestti"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contato</CardTitle>
          <CardDescription>Informações de contato</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact_email">E-mail</Label>
            <Input
              id="contact_email"
              type="email"
              value={settings.contact_email || ""}
              onChange={(e) => handleChange("contact_email", e.target.value)}
              placeholder="contato@vestti.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_phone">Telefone</Label>
            <Input
              id="contact_phone"
              value={settings.contact_phone || ""}
              onChange={(e) => handleChange("contact_phone", e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rodapé</CardTitle>
          <CardDescription>Texto do rodapé</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="footer_text">Texto de Copyright</Label>
            <Input
              id="footer_text"
              value={settings.footer_text || ""}
              onChange={(e) => handleChange("footer_text", e.target.value)}
              placeholder="© 2025 Vestti. Todos os direitos reservados."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
