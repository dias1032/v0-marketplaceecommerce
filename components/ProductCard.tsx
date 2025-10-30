import React from 'react'
import Link from 'next/link'
import { Product } from '../types/product'

interface ProductCardProps {
  product: Product
}

// A simple card used across Home, dashboards and lists
export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="bg-white rounded shadow p-4 flex flex-col">
      <img src={product.images?.[0] ?? '/placeholder.png'} alt={product.title} className="h-40 w-full object-cover rounded" />
      <h3 className="mt-3 font-semibold">{product.title}</h3>
      <p className="text-sm text-gray-500">{product.description}</p>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-lg font-bold">R$ {(product.price_cents/100).toFixed(2)}</div>
        <Link href={`/produtos/${product.id}`} className="text-sm px-3 py-1 bg-blue-600 text-white rounded">Ver Detalhes</Link>
      </div>
    </article>
  )
}
