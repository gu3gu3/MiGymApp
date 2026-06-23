'use client'

import { useState } from 'react'
import { KeyRound, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { changeOwnPassword } from '@/app/actions/user/change-password'

export function ChangeOwnPasswordForm() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
       toast.error('La contraseña debe tener al menos 6 caracteres')
       return
    }

    setLoading(true)
    const res = await changeOwnPassword(password)
    setLoading(false)

    if (res.success) {
      toast.success('Contraseña actualizada con éxito')
      setPassword('')
    } else {
      toast.error(res.error || 'Error al cambiar contraseña')
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
        <KeyRound className="text-rose-400 w-5 h-5" /> Seguridad de Mi Cuenta
      </h3>
      <p className="text-sm text-slate-400 mb-6">
        Cambia tu contraseña personal de acceso a la plataforma.
      </p>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <input 
          type="password" 
          placeholder="Nueva Contraseña (min. 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-rose-500 outline-none transition-colors"
        />
        <button 
          type="submit"
          disabled={loading || password.length < 6}
          className="px-6 py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 whitespace-nowrap"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Actualizar Contraseña'}
        </button>
      </form>
    </div>
  )
}
