'use client'

import { useState } from 'react'
import { requestSubscription } from '@/app/actions/athlete/subscribe'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function CheckoutForm({ gymId, planId }: { gymId: string, planId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubscribe = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await requestSubscription(gymId, planId)
      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess(true)
      }
    } catch (err) {
      setError("Error inesperado al conectar con el servidor.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">¡Solicitud Enviada!</h3>
        <p className="text-slate-400 mb-6 text-sm">
          Acércate a la recepción de tu gimnasio para realizar el pago y activar tu plan.
        </p>
        <button 
          onClick={() => router.replace('/wallet/profile')}
          className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
        >
          Ir a Mi Wallet
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg text-red-400 text-sm text-center">
          {error}
        </div>
      )}
      <button 
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Solicitar Suscripción'}
      </button>
      <p className="text-xs text-center text-slate-500">
        Al solicitar, el gimnasio recibirá tu información de perfil para procesar tu inscripción.
      </p>
    </div>
  )
}
