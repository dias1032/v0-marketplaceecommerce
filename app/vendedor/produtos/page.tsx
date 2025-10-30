"use client"
import { useState } from 'react'
import ProductCard from '../../../components/ProductCard'
import Button from '../../../components/Button'
import { Product } from '../../../types/product'

const MOCK: Product[] = Array.from({ length: 4 }).map((_, i) => ({
  id: `vp-${i+1}`,
  title: `Produto Vendedor ${i+1}`,
  description: 'Descrição curta',
  price_cents: 1299 + i*300,
  images: ['/placeholder.png']
}))

export default function VendorProducts() {
  const [items, setItems] = useState(MOCK)

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Meus Produtos</h1>
        <Button>Adicionar (mock)</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {items.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
      <p className="text-sm text-gray-500 mt-4">Comentário: implementar CRUD real com serviços na Fase 2.</p>
    </section>
  )
}
