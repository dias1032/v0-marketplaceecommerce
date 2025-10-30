"use client"
import { useState } from 'react'
import Button from '../../../components/Button'
import { Product } from '../../../types/product'
import { useCart } from '../../../lib/useCart'

// Demo fetch: in Phase 2 fetch product by id from Supabase
export default function ProductDetailPage({ params }: { params: { id: string } }) {
  // Mock product using params.id
  const product: Product = {
    id: params.id,
    title: `Produto ${params.id}`,
    description: 'Descrição detalhada do produto demo. Substituir por dados reais via service.',
    price_cents: 3499,
    images: ['/placeholder.png']
  }

  const { add } = useCart()
  const [qty, setQty] = useState(1)

  function handleAdd() {
    add(product, qty)
    alert('Adicionado ao carrinho (demo)')
  }

  return (
    <section className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <div className="md:flex gap-6">
        <img src={product.images?.[0]} alt={product.title} className="w-full md:w-1/2 h-64 object-cover rounded" />
        <div>
          <h1 className="text-2xl font-bold">{product.title}</h1>
          <p className="mt-2 text-gray-700">{product.description}</p>
          <div className="mt-4 text-2xl font-semibold">R$ {(product.price_cents/100).toFixed(2)}</div>
          <div className="mt-4 flex items-center gap-2">
            <label>Qtd:</label>
            <input type="number" min={1} value={qty} onChange={e => setQty(Number(e.target.value))} className="w-20 border rounded px-2 py-1" />
            <Button onClick={handleAdd}>Adicionar ao Carrinho</Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">Comentário: substituir por chamada ao serviço de produtos (lib/services) na Fase 2.</p>
        </div>
      </div>
    </section>
  )
}
