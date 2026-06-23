'use client'

import { useState } from 'react'
import { authenticate } from '@/app/actions/auth/login'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await authenticate(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.url) {
        router.push(result.url)
        router.refresh()
      }
    } catch (err) {
      setError('Error inesperado. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit} 
      className="space-y-6 w-full max-w-sm p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-white">Bienvenido</h2>
        <p className="text-slate-400 mt-2">Inicia sesión en el Ecosistema</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Correo Electrónico</label>
        <input 
          type="email" 
          name="email" 
          required 
          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
          placeholder="tu@correo.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
        <input 
          type="password" 
          name="password" 
          required 
          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ingresar'}
      </button>
    </motion.form>
  )
}
