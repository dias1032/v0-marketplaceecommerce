import ProductCard from '../components/ProductCard'
import { Product } from '../types/product'

// Mock dataset — in Phase 2 load from Supabase via services
const MOCK_PRODUCTS: Product[] = Array.from({ length: 9 }).map((_, i) => ({
  id: `p-${i+1}`,
  title: `Produto Demo ${i+1}`,
  description: 'Descrição curta do produto demo para visualização. Substituir por dados reais da API.',
  price_cents: 1999 + i*500,
  images: ['/placeholder.png']
}))

export default function HomePage() {
  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">Produtos em Destaque</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_PRODUCTS.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
