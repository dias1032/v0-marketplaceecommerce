"use client"
import { useState } from 'react'
import Button from '../../../components/Button'

export default function AdminUsers() {
  const [users, setUsers] = useState(Array.from({ length: 10 }).map((_, i) => ({ id: `u-${i+1}`, email: `user${i+1}@demo.com`, role: 'client' })))

  function handleToggleRole(id: string) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: u.role === 'client' ? 'vendor' : 'client' } : u))
  }

  return (
    <section>
      <h1 className="text-2xl font-bold">Usuários (Admin Demo)</h1>
      <div className="mt-4 space-y-2">
        {users.map(u => (
          <div key={u.id} className="flex justify-between items-center bg-white p-3 rounded shadow">
            <div>
              <div className="font-semibold">{u.email}</div>
              <div className="text-sm text-gray-600">Role: {u.role}</div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleToggleRole(u.id)}>Toggle Role</Button>
              <Button className="bg-red-600" onClick={() => setUsers(prev => prev.filter(p => p.id !== u.id))}>Remover</Button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-4">Comentário: integrar com endpoints admin e registrar auditoria (admin_audit) na Fase 2.</p>
    </section>
  )
}
