"use client"
import { useState } from 'react'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { useAuth } from '../../lib/useAuth'

export default function LoginPage() {
  const { loginDemo } = useAuth()
  const [email, setEmail] = useState('demo@user.com')
  const [password, setPassword] = useState('password')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // In real app: call Supabase signIn
    loginDemo(email)
    alert('Login demo efetuado — redirecionar para /')
  }

  return (
    <section className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <Input label="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <div className="flex justify-end">
          <Button type="submit">Entrar</Button>
        </div>
      </form>
      <p className="text-sm text-gray-500 mt-4">Comentário: aqui integrar Supabase Auth na Fase 2.</p>
    </section>
  )
}
