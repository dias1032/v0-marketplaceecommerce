import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo-vestti.png" alt="Vestti" width={32} height={32} className="h-8 w-8" />
              <span className="text-xl font-bold">Vestti</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Marketplace social para comprar e vender produtos com segurança e praticidade.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com/vestti"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/vestti"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/vestti"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com/@vestti"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Comprar</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="text-gray-600 hover:text-primary">
                  Todos os Produtos
                </Link>
              </li>
              <li>
                <Link href="/shop?category=novidades" className="text-gray-600 hover:text-primary">
                  Novidades
                </Link>
              </li>
              <li>
                <Link href="/shop?category=sale=true" className="text-gray-600 hover:text-primary">
                  Ofertas
                </Link>
              </li>
              <li>
                <Link href="/feed" className="text-gray-600 hover:text-primary">
                  Feed Social
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Vender</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/seller/onboarding" className="text-gray-600 hover:text-primary">
                  Começar a Vender
                </Link>
              </li>
              <li>
                <Link href="/seller/plans" className="text-gray-600 hover:text-primary">
                  Planos de Vendedor
                </Link>
              </li>
              <li>
                <Link href="/seller/verificacao" className="text-gray-600 hover:text-primary">
                  Verificação de Loja
                </Link>
              </li>
              <li>
                <Link href="/seller/dashboard" className="text-gray-600 hover:text-primary">
                  Painel do Vendedor
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/ajuda" className="text-gray-600 hover:text-primary">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-gray-600 hover:text-primary">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/termos" className="text-gray-600 hover:text-primary">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="text-gray-600 hover:text-primary">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Vestti. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
