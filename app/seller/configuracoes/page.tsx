import { ArrowLeft } from "lucide-react" // Import ArrowLeft component
import Link from "next/link" // Import Link component from Next.js

export default async function ConfiguracoesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Link
            href="/seller/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
