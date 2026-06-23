'use client'

import { useState, useEffect } from 'react'
import { createPlanAction, getGymPlans } from '@/app/actions/plans/create-plan'
import { Plus, Save, Clock, Ticket, Shield, Search, CheckCircle, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

type PlanType = 'TIME_BASED' | 'CREDIT_BASED'

type Plan = {
  id: string
  name: string
  price: number
  currency: string
  type: string
  durationDays: number | null
  totalCredits: number | null
  isActive: boolean
}

export default function PlanBuilderPage() {
  const [planType, setPlanType] = useState<PlanType>('TIME_BASED')
  const [isRestricted, setIsRestricted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [currency, setCurrency] = useState('NIO')
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false)

  const loadPlans = async () => {
    const data = await getGymPlans()
    setPlans(data)
  }

  useEffect(() => {
    loadPlans()
  }, [])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const formData = new FormData(e.currentTarget)
      formData.append('type', planType)
      formData.append('currency', currency)
      
      const res = await createPlanAction(formData)
      if (res.success) {
        toast.success('¡Plan creado exitosamente!')
        // Hacemos reload completo para asegurar estado limpio y evitar duplicados si hay retrasos de red
        window.location.reload()
      } else {
        toast.error(res.error || 'Error al guardar')
        setIsSaving(false)
      }
    } catch (err) {
      toast.error('Error de red, pero el plan pudo haberse guardado. Recargando...')
      setTimeout(() => window.location.reload(), 2000)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto w-full h-full overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Constructor de Planes</h1>
          <p className="text-slate-400 mt-1">Diseña tu oferta comercial de membresías y pases.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-8">
            {/* Bloque 1: Información General */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-4">Información General</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">Nombre del Plan</label>
                  <input 
                    type="text" 
                    name="name"
                    placeholder="Ej. Pase Mensual VIP, 10 Clases de Crossfit..." 
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-2">Precio</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-slate-500 font-bold">{currency === 'NIO' ? 'C$' : '$'}</span>
                      <input 
                        type="number" 
                        step="0.01"
                        name="price"
                        placeholder="0.00" 
                        className={`w-full bg-slate-950 border border-slate-700 rounded-lg pr-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors ${currency === 'NIO' ? 'pl-10' : 'pl-8'}`}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-2">Moneda</label>
                    <div className="relative">
                      <button 
                        type="button"
                        onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors flex justify-between items-center"
                      >
                        <span>{currency === 'NIO' ? 'NIO - Córdobas' : 'USD - Dólares'}</span>
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isCurrencyOpen && (
                        <div className="absolute z-10 w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                          <button
                            type="button"
                            onClick={() => { setCurrency('NIO'); setIsCurrencyOpen(false); }}
                            className="w-full text-left px-4 py-3 text-white hover:bg-slate-800 transition-colors"
                          >
                            NIO - Córdobas
                          </button>
                          <button
                            type="button"
                            onClick={() => { setCurrency('USD'); setIsCurrencyOpen(false); }}
                            className="w-full text-left px-4 py-3 text-white hover:bg-slate-800 transition-colors border-t border-slate-800"
                          >
                            USD - Dólares
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloque 2: Lógica de Expiración */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-4">Lógica de Expiración</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button 
                  type="button"
                  onClick={() => setPlanType('TIME_BASED')}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${planType === 'TIME_BASED' ? 'border-cyan-500 bg-cyan-950/30 text-white' : 'border-slate-800 text-slate-400 hover:border-slate-600'}`}
                >
                  <Clock className={`w-6 h-6 ${planType === 'TIME_BASED' ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <div className="text-left">
                    <p className="font-bold">Basado en Tiempo</p>
                    <p className="text-xs opacity-70">Expira en días calendario</p>
                  </div>
                </button>

                <button 
                  type="button"
                  onClick={() => setPlanType('CREDIT_BASED')}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${planType === 'CREDIT_BASED' ? 'border-emerald-500 bg-emerald-950/30 text-white' : 'border-slate-800 text-slate-400 hover:border-slate-600'}`}
                >
                  <Ticket className={`w-6 h-6 ${planType === 'CREDIT_BASED' ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <div className="text-left">
                    <p className="font-bold">Basado en Pases</p>
                    <p className="text-xs opacity-70">Descuenta 1 crédito por visita</p>
                  </div>
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                {planType === 'TIME_BASED' ? (
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-2">Duración en Días Continues</label>
                    <input 
                      type="number" 
                      name="durationDays"
                      placeholder="Ej. 30 para un mes" 
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      required
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-400 mb-2">Total de Créditos (Accesos)</label>
                      <input 
                        type="number" 
                        name="totalCredits"
                        placeholder="Ej. 10 pases" 
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-400 mb-2">Días de vigencia</label>
                      <input 
                        type="number" 
                        name="durationDays"
                        placeholder="Ej. 60 días" 
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-4 pt-4 pb-10">
              <button 
                type="submit" 
                disabled={isSaving}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-emerald-400 text-white font-black rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 w-full md:w-auto justify-center"
              >
                {isSaving ? 'Guardando...' : <><Save className="w-5 h-5" /> Guardar Plan</>}
              </button>
            </div>
          </form>
        </div>

        {/* Lista de Planes Creados */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
            Planes Existentes
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full">{plans.length}</span>
          </h2>
          
          <div className="space-y-3">
            {plans.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No hay planes creados aún.</p>
            ) : (
              plans.map(plan => (
                <div key={plan.id} className={`bg-slate-950 border ${plan.isActive ? 'border-slate-800' : 'border-red-900/50 opacity-50'} rounded-xl p-4 transition-colors`}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className={`font-bold text-sm ${plan.isActive ? 'text-white' : 'text-slate-400 line-through'}`}>{plan.name}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        {plan.type === 'TIME_BASED' ? (
                          <><Clock className="w-3 h-3" /> {plan.durationDays} Días</>
                        ) : (
                          <><Ticket className="w-3 h-3" /> {plan.totalCredits} Pases ({plan.durationDays} Días)</>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-black ${plan.isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                        {plan.currency === 'NIO' ? 'C$' : '$'}{plan.price.toFixed(2)}
                      </span>
                      {plan.isActive && (
                        <button
                          type="button"
                          onClick={async () => {
                            const { disablePlanAction } = await import('@/app/actions/plans/create-plan')
                            const toastId = toast.loading('Deshabilitando...')
                            const res = await disablePlanAction(plan.id)
                            if (res.success) {
                              toast.success('Plan deshabilitado', { id: toastId })
                              loadPlans()
                            } else {
                              toast.error(res.error || 'Error', { id: toastId, duration: 6000 })
                            }
                          }}
                          className="block mt-2 text-[10px] uppercase font-bold text-red-400 hover:text-red-300 transition-colors ml-auto"
                        >
                          Deshabilitar
                        </button>
                      )}
                      {!plan.isActive && (
                        <button
                          type="button"
                          onClick={async () => {
                            const { enablePlanAction } = await import('@/app/actions/plans/create-plan')
                            const toastId = toast.loading('Habilitando...')
                            const res = await enablePlanAction(plan.id)
                            if (res.success) {
                              toast.success('Plan habilitado', { id: toastId })
                              loadPlans()
                            } else {
                              toast.error(res.error || 'Error', { id: toastId, duration: 6000 })
                            }
                          }}
                          className="block mt-2 text-[10px] uppercase font-bold text-emerald-400 hover:text-emerald-300 transition-colors ml-auto"
                        >
                          Habilitar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
