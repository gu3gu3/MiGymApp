'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, CheckCircle2, ArrowRight, Zap, Loader2 } from 'lucide-react'
import { upgradeGymPlan } from '@/app/actions/gym/upgrade-gym-plan'
import toast from 'react-hot-toast'
import { toggleGymLock } from '@/app/actions/superadmin/toggle-gym-lock'
import { useRouter } from 'next/navigation'

export default function SubscriptionClient({ currentPlanId, allPlans, gymId, gymSlug, isLocked }: { currentPlanId: string | null, allPlans: any[], gymId: string, gymSlug: string, isLocked: boolean }) {
  const router = useRouter()
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [isTogglingLock, setIsTogglingLock] = useState(false)

  // Find index of current plan, or default to 0 if not found
  const currentIndex = allPlans.findIndex(p => p.id === currentPlanId)
  const actualIndex = currentIndex >= 0 ? currentIndex : 0
  
  const currentPlan = allPlans[actualIndex]
  // La lógica de Upsell se basa estrictamente en incremento de precio
  // para evitar saltos raros a planes Custom de $0.
  const nextPlan = allPlans.find(p => p.priceNio > (currentPlan?.priceNio ?? -1))

  const handleUpgrade = async (planId: string) => {
    setIsUpgrading(true)
    const res = await upgradeGymPlan(planId)
    if (res.success) {
      toast.success('¡Plan actualizado exitosamente!')
      router.refresh()
    } else {
      toast.error(res.error || 'Error al actualizar el plan')
    }
    setIsUpgrading(false)
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full h-full overflow-y-auto custom-scrollbar">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="pb-10"
      >
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Shield className="text-purple-500 w-8 h-8" />
              Suscripción de Plataforma
            </h1>
            <p className="text-slate-400 mt-2">
              Gestiona la suscripción de tu gimnasio con WebSavvy. Mejora tu plan para habilitar más atletas y características.
            </p>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Gym ID: {gymId} | Slug: {gymSlug}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          
          {/* CURRENT PLAN CARD */}
          {currentPlan && (
            <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-8 relative flex flex-col shadow-2xl shadow-purple-900/20">
              <div className="absolute -top-4 left-8 bg-slate-800 border border-slate-700 px-4 py-1 rounded-full text-xs font-bold text-slate-300 flex items-center gap-2">
                Tu Plan Actual
              </div>
              <h2 className="text-2xl font-black text-white mt-4">{currentPlan.name}</h2>
              <div className="my-6">
                <span className="text-4xl font-black text-white">${Number(currentPlan.priceNio)}</span>
                <span className="text-slate-500 ml-2">NIO / mes</span>
              </div>
              
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span>{currentPlan.maxAthletes ? `Hasta ${currentPlan.maxAthletes} Atletas registrados` : 'Atletas Ilimitados'}</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span>Panel de Administración Gym</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span>Control de Gatekeeper y POS</span>
                </li>
              </ul>
              
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center text-sm font-bold text-slate-400">
                Suscripción Activa
              </div>
            </div>
          )}

          {/* NEXT PLAN CARD (UPSELL) */}
          {nextPlan ? (
            <div className="bg-gradient-to-b from-purple-900/40 to-slate-900 border-2 border-purple-500 rounded-3xl p-8 relative flex flex-col shadow-2xl shadow-purple-600/30 overflow-hidden group">
              <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors pointer-events-none" />
              
              <div className="absolute -top-4 right-8 bg-purple-600 px-4 py-1 rounded-full text-xs font-bold text-white shadow-lg flex items-center gap-2">
                <Zap className="w-3 h-3 fill-white" /> Recomendado
              </div>
              
              <h2 className="text-2xl font-black text-white mt-4">{nextPlan.name}</h2>
              <div className="my-6">
                <span className="text-4xl font-black text-white">${Number(nextPlan.priceNio)}</span>
                <span className="text-purple-300 ml-2">NIO / mes</span>
              </div>
              
              <ul className="space-y-4 mb-8 flex-grow relative z-10">
                <li className="flex items-center gap-3 text-white font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>{nextPlan.maxAthletes ? `Expande hasta ${nextPlan.maxAthletes} Atletas` : 'Crecimiento Ilimitado de Atletas'}</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span>Soporte Prioritario</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span>Todas las funciones del plan anterior</span>
                </li>
              </ul>
              
              <button 
                onClick={() => handleUpgrade(nextPlan.id)}
                disabled={isUpgrading}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 relative z-10"
              >
                {isUpgrading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Hacer Upgrade Ahora <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate-500 mt-4 relative z-10">El cargo será ajustado en tu próxima factura mensual.</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">¡Tienes el Plan Máximo!</h3>
              <p className="text-slate-400">
                Tu gimnasio cuenta con todas las capacidades y recursos ilimitados de la plataforma WebSavvy. No hay más niveles por encima de este.
              </p>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  )
}
