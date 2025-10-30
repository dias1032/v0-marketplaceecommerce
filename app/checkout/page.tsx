"use client"
import { useState } from 'react'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { useCart } from '../../lib/useCart'

export default function CheckoutPage() {
  const { items, total_cents, clear } = useCart()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')

  function handlePay(e: React.FormEvent) {
    e.preventDefault()
    // In real app: call /api/checkout which creates order and charges via payment api
    alert('Pagamento demo realizado — pedido criado')
    clear()
  }

  return (
    <section className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Checkout</h1>
      <form onSubmit={handlePay} className="space-y-4">
        <Input label="Nome" value={name} onChange={e => setName(e.target.value)} />
        <Input label="Endereço" value={address} onChange={e => setAddress(e.target.value)} />
        <div>
          <h2 className="font-semibold">Resumo do Pedido</h2>
          <div className="text-sm text-gray-600">Itens: {items.length}</div>
          <div className="text-lg font-bold">Total: R$ {(total_cents/100).toFixed(2)}</div>
        </div>
        <div className="flex justify-end">
          <Button type="submit">Pagar (demo)</Button>
        </div>
      </form>
      <p className="text-sm text-gray-500 mt-4">Comentário: integrar /api/checkout e gateway de pagamentos na Fase 2.</p>
    </section>
  )
}
