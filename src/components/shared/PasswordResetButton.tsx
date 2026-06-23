'use client'

import { useState } from 'react'
import { KeyRound, Loader2, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

export function PasswordResetButton({ 
  onReset, 
  userEmail 
}: { 
  onReset: () => Promise<{ success: boolean, newPassword?: string, error?: string }>,
  userEmail: string
}) {
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState<string | null>(null)

  const handleReset = async () => {
    if (!confirm(`¿Forzar reseteo de contraseña para ${userEmail}?`)) return
    
    setLoading(true)
    try {
      const res = await onReset()
      if (res.success && res.newPassword) {
        setNewPassword(res.newPassword)
        toast.success('Contraseña reseteada')
      } else {
        toast.error(res.error || 'Error al resetear la contraseña')
      }
    } catch (error) {
      toast.error('Error reseteando contraseña')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (newPassword) {
      navigator.clipboard.writeText(newPassword)
      toast.success('Contraseña copiada')
    }
  }

  return (
    <>
      {newPassword ? (
        <div className="flex items-center justify-end gap-2">
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded font-mono select-all text-sm">
            {newPassword}
          </span>
          <button 
            onClick={copyToClipboard}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Copiar contraseña"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={handleReset}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded font-bold transition-colors disabled:opacity-50 text-xs sm:text-sm whitespace-nowrap"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
          Reset Password
        </button>
      )}
    </>
  )
}
