'use client'

import { motion } from 'framer-motion'
import { MockSubscription } from '@/lib/walletStore'
import { cn } from '@/lib/utils'
import { QrCode, AlertCircle } from 'lucide-react'

interface SubscriptionCardProps {
  subscription: MockSubscription
  onGenerateQR: () => void
}

export function SubscriptionCard({ subscription, onGenerateQR }: SubscriptionCardProps) {
  const isActive = subscription.status === 'ACTIVE'

  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      className={cn(
        "w-[85vw] max-w-sm flex-shrink-0 rounded-[2rem] p-7 flex flex-col justify-between overflow-hidden relative shadow-2xl border border-white/10 min-h-[220px]",
        "bg-gradient-to-br",
        subscription.themeColor
      )}
    >
      {/* Banner Background */}
      {subscription.gymBanner && (
        <div className="absolute inset-0 z-0">
          <img src={subscription.gymBanner} alt="" className="w-full h-full object-cover opacity-30 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
      )}

      {/* Elementos Decorativos de Glassmorphism */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-white/5 blur-3xl z-0" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-black/20 blur-3xl z-0" />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-2xl text-white border border-white/20 shadow-inner overflow-hidden">
            {subscription.gymLogo.length > 3 ? (
              <img src={subscription.gymLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              subscription.gymLogo
            )}
          </div>
          <div>
            <h3 className="font-bold text-white text-xl leading-tight tracking-tight">{subscription.gymName}</h3>
            <p className="text-white/70 text-sm font-medium mt-0.5">{subscription.planName}</p>
          </div>
        </div>
      </div>

      {/* Body / Estado */}
      <div className="relative z-10 mt-8 mb-6">
        <div className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide backdrop-blur-md border shadow-sm",
          isActive 
            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
            : "bg-red-500/20 text-red-300 border-red-500/30"
        )}>
          {isActive ? <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {isActive ? 'SUSCRIPCIÓN ACTIVA' : 'SUSCRIPCIÓN EXPIRADA'}
        </div>
      </div>

      {/* Acción Principal */}
      <div className="relative z-10 mt-auto">
        <button
          onClick={onGenerateQR}
          disabled={!isActive}
          className={cn(
            "w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold tracking-wide transition-all duration-300",
            isActive 
              ? "bg-white text-slate-900 hover:bg-slate-100 hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.15)]" 
              : "bg-white/10 text-white/50 cursor-not-allowed border border-white/5"
          )}
        >
          <QrCode className="w-5 h-5" />
          {isActive ? 'Generar Código de Acceso' : 'Renovar Plan'}
        </button>
      </div>
    </motion.div>
  )
}
