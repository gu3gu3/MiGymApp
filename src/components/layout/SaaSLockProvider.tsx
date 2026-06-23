'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Lock, ShieldAlert, ArrowRight } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

interface SaaSLockProviderProps {
  children: React.ReactNode
  athleteCount: number
  maxAthletes: number | null
  isLocked: boolean
  planName: string
  role: string
}

export function SaaSLockProvider({ 
  children, 
  athleteCount, 
  maxAthletes, 
  isLocked, 
  planName,
  role
}: SaaSLockProviderProps) {
  const pathname = usePathname()
  const [showWarning, setShowWarning] = useState(false)

  // Determine if it's the subscription page
  const isSubscriptionPage = pathname === '/admin/subscription'

  // Calculations
  const isFreemium = planName.toLowerCase().includes('freemium') || planName.toLowerCase().includes('gratis') || planName.toLowerCase().includes('pilot')
  const hasHardLimit = maxAthletes !== null
  const usagePercentage = hasHardLimit ? (athleteCount / maxAthletes!) * 100 : 0
  const isAtCapacity = hasHardLimit && athleteCount >= maxAthletes!
  
  // A gym is locked if manually locked, or if capacity is reached
  const isGymLocked = isLocked || isAtCapacity

  // 90% warning logic
  useEffect(() => {
    // Only show warning if:
    // 1. Not already locked
    // 2. Has a hard limit
    // 3. Usage is >= 90%
    // 4. Not a Freemium/Pilot plan (as requested)
    // 5. User is GYM_ADMIN (receptionists can't upgrade)
    if (!isGymLocked && hasHardLimit && usagePercentage >= 90 && !isFreemium && role === 'GYM_ADMIN') {
      setShowWarning(true)
      
      // Auto-hide after 30 seconds
      const timer = setTimeout(() => {
        setShowWarning(false)
      }, 30000)
      
      return () => clearTimeout(timer)
    }
  }, [usagePercentage, isGymLocked, hasHardLimit, isFreemium, role])

  const remaining = hasHardLimit ? maxAthletes! - athleteCount : 0

  return (
    <>
      {/* 90% WARNING BANNER */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0, transition: { duration: 0.5 } }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 border-2 border-orange-500/50 rounded-2xl shadow-2xl shadow-orange-900/20 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
              <motion.div 
                className="h-full bg-orange-500"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 30, ease: "linear" }}
              />
            </div>
            <div className="p-4 flex gap-4">
              <div className="bg-orange-500/20 p-3 rounded-xl h-fit">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Capacidad al {Math.floor(usagePercentage)}%</h4>
                <p className="text-sm text-slate-400 mb-3">
                  Te restan <strong className="text-white">{remaining} suscripciones</strong> en tu plan {planName}. Actualiza ahora para evitar interrupciones.
                </p>
                <Link 
                  href="/admin/subscription"
                  onClick={() => setShowWarning(false)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Hacer Upgrade <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GLASSMORPHISM LOCK OVERLAY */}
      {isGymLocked && !isSubscriptionPage ? (
        <div className="relative w-full h-full overflow-hidden">
          {/* Contenido Desenfoquedado */}
          <div className="pointer-events-none select-none blur-md brightness-50 w-full h-full">
            {children}
          </div>
          
          {/* Modal de Bloqueo Inamovible */}
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                {isLocked ? (
                  <Lock className="w-10 h-10 text-red-500" />
                ) : (
                  <ShieldAlert className="w-10 h-10 text-red-500" />
                )}
              </div>
              
              <h2 className="text-2xl font-black text-white mb-3">
                {isLocked ? 'Servicio Suspendido' : 'Capacidad Máxima Alcanzada'}
              </h2>
              
              <p className="text-slate-400 mb-8">
                {isLocked 
                  ? 'El acceso a la plataforma ha sido restringido temporalmente. Por favor, realiza la actualización de tu servicio/pago para restaurar el acceso completo.'
                  : `Has alcanzado el límite de ${maxAthletes} atletas de tu plan ${planName}. Para seguir operando y registrando atletas, debes hacer un upgrade.`
                }
              </p>
              
              {role === 'GYM_ADMIN' ? (
                <Link 
                  href="/admin/subscription"
                  className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
                >
                  Actualizar Servicio / Pago <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-500 text-sm">
                  Contacta al administrador del gimnasio para resolver este problema.
                </div>
              )}
            </motion.div>
          </div>
        </div>
      ) : (
        /* NORMAL RENDER */
        children
      )}
    </>
  )
}
