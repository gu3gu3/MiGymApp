'use client'

import { useState } from 'react'
import { ShieldCheck, Activity, BarChart3, Edit2, Check, X, Loader2 } from "lucide-react"
import { updatePlatformPlan } from "@/app/actions/superadmin/plans"
import toast from 'react-hot-toast'

export default function SuperAdminPlansClient({ initialPlans }: { initialPlans: any[] }) {
  const [plans, setPlans] = useState(initialPlans)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Custom Plan Modal State
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [customForm, setCustomForm] = useState({ name: '', maxAthletes: '', priceNio: '', priceUsd: '' })

  const handleEditClick = (plan: any) => {
    setEditingId(plan.id)
    setEditForm({
      name: plan.name,
      maxAthletes: plan.maxAthletes ? plan.maxAthletes.toString() : '',
      priceNio: plan.priceNio.toString(),
      priceUsd: plan.priceUsd.toString()
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleSave = async (id: string) => {
    setIsSubmitting(true)
    const res = await updatePlatformPlan(id, editForm)
    if (res.success) {
      toast.success('Plan actualizado')
      // Update local state to reflect changes instantly without hard refresh
      setPlans(plans.map(p => p.id === id ? { 
        ...p, 
        name: editForm.name, 
        maxAthletes: editForm.maxAthletes ? parseInt(editForm.maxAthletes) : null,
        priceNio: parseFloat(editForm.priceNio),
        priceUsd: parseFloat(editForm.priceUsd)
      } : p))
      setEditingId(null)
    } else {
      toast.error('Error al actualizar el plan')
    }
    setIsSubmitting(false)
  }

  const handleCreateCustom = async () => {
    if (!customForm.name) {
      toast.error('El nombre es requerido')
      return
    }
    setIsSubmitting(true)
    // Dynamic import to avoid breaking if the function is missing, though we know it's there
    const { createCustomPlan } = await import('@/app/actions/superadmin/plans')
    const res = await createCustomPlan(customForm)
    if (res.success) {
      toast.success('Plan creado')
      setShowCustomModal(false)
      setCustomForm({ name: '', maxAthletes: '', priceNio: '', priceUsd: '' })
      // For immediate feedback, force reload (or we could optimistically update if we had the new ID)
      window.location.reload()
    } else {
      toast.error('Error al crear plan')
    }
    setIsSubmitting(false)
  }

  return (
    <div className="p-8">
      {/* CUSTOM PLAN MODAL */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Crear Plan Custom</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-slate-500 font-bold uppercase">Nombre del Plan</label>
                <input 
                  type="text" 
                  value={customForm.name} 
                  onChange={e => setCustomForm({...customForm, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-bold mt-1 focus:border-purple-500 focus:outline-none"
                  placeholder="Ej. Enterprise Especial"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-bold uppercase">Max Atletas (Vacio=Ilimitado)</label>
                <input 
                  type="number" 
                  value={customForm.maxAthletes} 
                  onChange={e => setCustomForm({...customForm, maxAthletes: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white mt-1 focus:border-purple-500 focus:outline-none"
                  placeholder="1000"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500 font-bold uppercase">Precio NIO</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={customForm.priceNio} 
                    onChange={e => setCustomForm({...customForm, priceNio: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white mt-1 focus:border-purple-500 focus:outline-none"
                    placeholder="250"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-bold uppercase">Precio USD</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={customForm.priceUsd} 
                    onChange={e => setCustomForm({...customForm, priceUsd: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white mt-1 focus:border-purple-500 focus:outline-none"
                    placeholder="7"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button 
                  onClick={() => setShowCustomModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleCreateCustom}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex justify-between items-end border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase mb-4">
              <ShieldCheck className="w-4 h-4" /> Panel de Originador
            </div>
            <h1 className="text-4xl font-black text-white">SaaS B2B Pricing</h1>
            <p className="text-slate-400 mt-2">Gestiona las bandas de precios y los límites de la plataforma.</p>
          </div>
          <button 
            onClick={() => setShowCustomModal(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 font-bold rounded-xl text-white transition-colors"
          >
            + Crear Plan Custom
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className={`bg-slate-900 border ${editingId === plan.id ? 'border-purple-500' : 'border-slate-800'} rounded-2xl p-6 flex flex-col transition-colors relative group`}>
              
              {editingId !== plan.id && (
                <button 
                  onClick={() => handleEditClick(plan)}
                  className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-purple-500/20 text-slate-400 hover:text-purple-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}

              {editingId === plan.id ? (
                // EDIT MODE
                <div className="flex flex-col h-full gap-4">
                  <div>
                    <label className="text-xs text-slate-500 font-bold uppercase">Nombre</label>
                    <input 
                      type="text" 
                      value={editForm.name} 
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-bold mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-bold uppercase">Max Atletas (Vacio=Ilimitado)</label>
                    <input 
                      type="number" 
                      value={editForm.maxAthletes} 
                      onChange={e => setEditForm({...editForm, maxAthletes: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-slate-500 font-bold uppercase">Precio NIO</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={editForm.priceNio} 
                        onChange={e => setEditForm({...editForm, priceNio: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 font-bold uppercase">Precio USD</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={editForm.priceUsd} 
                        onChange={e => setEditForm({...editForm, priceUsd: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white mt-1"
                      />
                    </div>
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-end gap-2">
                    <button onClick={handleCancel} disabled={isSubmitting} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg">
                      <X className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleSave(plan.id)} disabled={isSubmitting} className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center">
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              ) : (
                // VIEW MODE
                <>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-slate-400 text-sm">
                      {plan.maxAthletes ? `Hasta ${plan.maxAthletes} Atletas` : 'Ilimitado'}
                    </p>
                  </div>

                  <div className="my-6 flex-grow">
                    {plan.isCustom ? (
                      <span className="text-3xl font-black text-white">Custom</span>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">${Number(plan.priceNio)}</span>
                        <span className="text-slate-500 text-sm">/ Mes</span>
                      </div>
                    )}
                    {!plan.isCustom && (
                      <p className="text-xs text-slate-500 mt-1">Nicaragua (CA: ${Number(plan.priceUsd)})</p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-800 mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span>{plan._count?.gyms || 0} Gyms activos</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-4">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Proyección de Ingresos SaaS</h2>
          </div>
          <p className="text-slate-400 mb-6">
            Todos los gimnasios nuevos entran por defecto al plan <strong>Gratuito / Pilot</strong>. Una vez que superan la barrera de usuarios, el sistema les restringirá la adición de nuevos atletas hasta que realicen un upgrade de plan.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
               <span className="text-slate-500 text-sm block mb-1">Total Gyms en Red</span>
               <span className="text-2xl font-black text-white">{plans.reduce((acc, p) => acc + (p._count?.gyms || 0), 0)}</span>
             </div>
             <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
               <span className="text-slate-500 text-sm block mb-1">Gyms Monetizados</span>
               <span className="text-2xl font-black text-emerald-400">{plans.filter(p => !p.name.includes('Pilot') && !p.name.includes('Gratuito')).reduce((acc, p) => acc + (p._count?.gyms || 0), 0)}</span>
             </div>
             <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
               <span className="text-slate-500 text-sm block mb-1">MRR Estimado (NIO)</span>
               <span className="text-2xl font-black text-purple-400">
                 ${plans.reduce((acc, p) => acc + ((p._count?.gyms || 0) * Number(p.priceNio)), 0)}
               </span>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}
