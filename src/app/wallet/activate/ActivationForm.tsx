'use client'

import { useState } from 'react'
import { activateWalletAction } from '@/app/actions/athletes/activate-wallet'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { signIn } from 'next-auth/react'

export function ActivationForm({ token, userName }: { token: string, userName: string }) {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsLoading(true)
    const formData = new FormData()
    formData.append('token', token)
    formData.append('password', password)

    const result = await activateWalletAction(formData)

    if (result.success && result.email) {
      toast.success('¡Wallet activado con éxito!')
      
      // Auto-login
      const signInResult = await signIn('credentials', {
        email: result.email,
        password: password,
        redirect: false
      })

      if (signInResult?.error) {
        toast.error('Error al iniciar sesión automáticamente. Por favor ingresa manualmente.')
        router.push('/login')
      } else {
        router.push('/wallet')
      }
    } else {
      toast.error(result.error || 'Error al activar el Wallet')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-tr from-cyan-500 to-blue-500 rounded-full mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] mb-6">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">¡Hola, {userName}!</h1>
        <p className="text-slate-400">Crea tu contraseña segura para activar tu Wallet de MiGym.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-slate-500" />
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nueva contraseña (min. 6 caracteres)"
            className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-lg"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || password.length < 6}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 disabled:opacity-50 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] text-lg"
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>Activar Wallet <ArrowRight className="w-6 h-6" /></>
          )}
        </button>
      </form>
    </div>
  )
}
