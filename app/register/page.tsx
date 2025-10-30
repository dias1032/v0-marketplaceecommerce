"use client"
import { useState } from 'react'
import Input from '../../components/Input'
import Button from '../../components/Button'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // In Phase 2: use Supabase signUp
    alert('Cadastro demo — redirecionar para /login')
  }

  return (
    <section className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Criar Conta</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome" value={name} onChange={e => setName(e.target.value)} />
        <Input label="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <Input label="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <div className="flex justify-end">
          <Button type="submit">Registrar</Button>
        </div>
      </form>
      <p className="text-sm text-gray-500 mt-4">Comentário: validar campos e integrar Supabase Auth na Fase 2.</p>
    </section>
  )
}
