'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { WifiOff, Wifi, X } from 'lucide-react'
import { useNetworkState } from '@/hooks/useNetworkState'
import { MockSubscription } from '@/lib/walletStore'
import { cn } from '@/lib/utils'

interface AccessCodeModalProps {
  isOpen: boolean
  onClose: () => void
  subscription: MockSubscription | null
  user?: { id: string; name: string; photoUrl: string }
}

export function AccessCodeModal({ isOpen, onClose, subscription, user }: AccessCodeModalProps) {
  const { isOnline } = useNetworkState()
  const [progress, setProgress] = useState(100)
  const [dynamicHash, setDynamicHash] = useState('')

  // Efecto del temporizador para el QR online
  useEffect(() => {
    if (!isOpen || !subscription || !isOnline) return

    // Generar un hash inicial (simulado)
    setDynamicHash(`online_hash_${Date.now()}`)
    setProgress(100)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          // Refrescar el hash simulado cada 30 segundos
          setDynamicHash(`online_hash_${Date.now()}`)
          return 100
        }
        return prev - (100 / 300) // Disminuye un poco cada 100ms
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isOpen, subscription, isOnline])

  if (!isOpen || !subscription) return null

  // Si estamos online, idealmente usamos un TOTP.
  // Pero como el procesador del gatekeeper actualmente busca por user.id, enviaremos el ID
  // En producción real, esto debería ser un JWT firmado con expiración
  const qrData = user?.id || subscription.offlineToken

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl rounded-3xl"
        >
          {/* Header con indicador de red */}
          <div className={cn(
            "px-4 py-3 flex items-center justify-between text-sm font-medium",
            isOnline ? "bg-emerald-950/50 text-emerald-400" : "bg-orange-950/50 text-orange-400"
          )}>
            <div className="flex items-center gap-2">
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span>{isOnline ? 'Conexión Segura' : 'Modo Local Garantizado'}</span>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 flex flex-col items-center">
            {/* Foto del Atleta */}
            <div className="relative w-24 h-24 mb-4">
              {user?.photoUrl ? (
                <img 
                  src={user.photoUrl} 
                  alt={user.name}
                  className="w-full h-full object-cover rounded-full border-4 border-slate-800 shadow-lg bg-slate-800"
                />
              ) : (
                <div className="w-full h-full rounded-full border-4 border-slate-800 shadow-lg bg-slate-800 flex items-center justify-center text-3xl font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-slate-800 border-4 border-slate-900 flex items-center justify-center font-bold text-sm text-white shadow-md overflow-hidden">
                {subscription.gymLogo.length > 3 ? (
                  <img src={subscription.gymLogo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  subscription.gymLogo
                )}
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">{user?.name}</h3>
            <p className="text-sm font-medium text-slate-400 mb-8">{subscription.gymName}</p>

            {/* Código QR */}
            <div className="bg-white p-5 rounded-3xl shadow-inner mb-6 relative">
              <QRCodeSVG 
                value={qrData} 
                size={220}
                level="H"
                className={cn("transition-opacity duration-300", !isOnline && "opacity-90")}
              />
              {!isOnline && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[2px] rounded-3xl">
                  <div className="bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl flex items-center gap-2">
                    <WifiOff className="w-4 h-4" /> OFFLINE
                  </div>
                </div>
              )}
            </div>

            {/* Temporizador (Solo visible Online) */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              {isOnline ? (
                <motion.div 
                  className="h-full bg-emerald-500"
                  style={{ width: `${progress}%` }}
                />
              ) : (
                <div className="h-full w-full bg-orange-500/50" />
              )}
            </div>
            {isOnline && (
              <p className="text-xs font-medium text-slate-500 mt-3 text-center">
                El código se actualiza automáticamente en {(progress * 0.3).toFixed(0)}s
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
