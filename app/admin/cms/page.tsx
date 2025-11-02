import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, ImageIcon, FileText } from "lucide-react"
import { SettingsEditor } from "@/components/admin/settings-editor"
import { MediaManager } from "@/components/admin/media-manager"
import { PagesManager } from "@/components/admin/pages-manager"

export default async function AdminCMS() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/")
  }

  // Fetch current settings
  const { data: settings } = await supabase.from("settings").select("*")

  const settingsMap = (settings || []).reduce(
    (acc, s) => {
      acc[s.key] = s.value
      return acc
    },
    {} as Record<string, any>,
  )

  // Fetch media count
  const { count: mediaCount } = await supabase.from("media").select("*", { count: "exact", head: true })

  // Fetch pages count
  const { count: pagesCount } = await supabase.from("pages").select("*", { count: "exact", head: true })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gerenciamento de Conteúdo</h1>
        <p className="text-muted-foreground">Edite todo o conteúdo visível do site</p>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Configurações do Site
          </TabsTrigger>
          <TabsTrigger value="media">
            <ImageIcon className="mr-2 h-4 w-4" />
            Mídia ({mediaCount || 0})
          </TabsTrigger>
          <TabsTrigger value="pages">
            <FileText className="mr-2 h-4 w-4" />
            Páginas ({pagesCount || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <SettingsEditor initialSettings={settingsMap} />
        </TabsContent>

        <TabsContent value="media">
          <MediaManager />
        </TabsContent>

        <TabsContent value="pages">
          <PagesManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
