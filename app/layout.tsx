import './globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export const metadata = {
  title: 'Vestti Marketplace (Demo)'
}

// App layout: renders on every page. Navbar is a client component.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {/* Navbar handles links and will reflect auth state in Phase 2 */}
        <Navbar />
        <main className="container py-8">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
