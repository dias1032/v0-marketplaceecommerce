"use client"
import { useState } from 'react'
import Button from '../../../components/Button'

// Mock admin overview
export default function AdminDashboard() {
  const [users] = useState(Array.from({ length: 6 }).map((_, i) => ({ id: `u-${i+1}`, email: `user${i+1}@demo.com` })))

  return (
    <section>
      <h1 className="text-2xl font-bold">Admin Dashboard (Demo)</h1>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center bg-white p-4 rounded shadow">
          <div>
            <div className="font-semibold">Usuários</div>
            <div className="text-sm text-gray-600">{users.length} registrados (mock)</div>
          </div>
          <Button>Gerenciar Usuários</Button>
        </div>

        <div className="flex justify-between items-center bg-white p-4 rounded shadow">
          <div>
            <div className="font-semibold">Produtos</div>
            <div className="text-sm text-gray-600">Visualizar & gerenciar (mock)</div>
          </div>
          <Button>Gerenciar Produtos</Button>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-4">Comentário: apenas demo — implementar RBAC e auditoria no servidor na Fase 2.</p>
    </section>
  )
}
