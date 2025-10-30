"use client"
import { useState } from 'react'
import ProductCard from '../../../components/ProductCard'
import Modal from '../../../components/Modal'
import Input from '../../../components/Input'
import Button from '../../../components/Button'
import { Product } from '../../../types/product'

// Mock products for vendor
const VENDOR_PRODUCTS: Product[] = Array.from({ length: 6 }).map((_, i) => ({
  id: `v-p-${i+1}`,
  title: `Meus Produto ${i+1}`,
  description: 'Produto do vendedor (mock)',
  price_cents: 2599 + i*200,
  images: ['/placeholder.png']
}))

export default function VendorDashboard() {
  const [products, setProducts] = useState(VENDOR_PRODUCTS)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')

  function handleCreate() {
    const p: Product = { id: 'v-'+Math.random().toString(36).slice(2,9), title, description: '', price_cents: 1000, images: ['/placeholder.png'] }
    setProducts(prev => [p, ...prev])
    setOpen(false)
    setTitle('')
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Painel do Vendedor</h1>
        <Button onClick={() => setOpen(true)}>Adicionar Produto</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Novo Produto (mock)">
        <Input label="Título" value={title} onChange={e => setTitle(e.target.value)} />
        <div className="mt-4 flex justify-end">
          <Button onClick={handleCreate}>Criar (mock)</Button>
        </div>
        <p className="text-sm text-gray-500 mt-2">Comentário: aqui abriria formulário real com upload de imagens para Supabase Storage.</p>
      </Modal>

      <p className="text-sm text-gray-500 mt-4">Comentário: rota protegida — adicionar checagem de sessão/role em middleware na Fase 2.</p>
    </section>
  )
}
