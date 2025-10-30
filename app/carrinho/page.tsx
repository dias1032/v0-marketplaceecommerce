"use client"
import { useCart } from '../../lib/useCart'
import Button from '../../components/Button'
import Link from 'next/link'

export default function CartPage() {
  const { items, remove, total_cents } = useCart()

  return (
    <section className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Carrinho</h1>
      {items.length === 0 ? (
        <p>Seu carrinho está vazio. <Link href="/">Voltar à loja</Link></p>
      ) : (
        <div className="space-y-4">
          {items.map(it => (
            <div key={it.product.id} className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{it.product.title}</div>
                <div className="text-sm text-gray-600">Qtd: {it.qty}</div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="font-semibold">R$ {((it.product.price_cents*it.qty)/100).toFixed(2)}</div>
                <button className="text-sm text-red-600" onClick={() => remove(it.product.id)}>Remover</button>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center border-t pt-4">
            <div className="font-bold">Total: R$ {(total_cents/100).toFixed(2)}</div>
            <Link href="/checkout"><Button>Finalizar Compra</Button></Link>
          </div>
        </div>
      )}
    </section>
  )
}
