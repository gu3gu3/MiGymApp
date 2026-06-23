'use client'

import { useState } from 'react'
import { deleteGymCascade } from '@/app/actions/superadmin/gyms'
import { updateGymSubscription } from '@/app/actions/superadmin/update-gym-subscription'
import { Trash2, Loader2, Lock, Unlock, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

type GymData = {
  id: string
  name: string
  slug: string
  isLocked: boolean
  platformPlanId: string | null
  createdAt: Date
  platformPlan: { id: string, name: string } | null
  _count: {
    subscriptions: number
    sales: number
    plans: number
    products: number
  }
}

export function GymTableRow({ gym, allPlans }: { gym: GymData, allPlans: any[] }) {
  const [loading, setLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Local state for optimism
  const [locked, setLocked] = useState(gym.isLocked)
  const [planId, setPlanId] = useState(gym.platformPlanId || allPlans[0]?.id)

  const handleDelete = async () => {
    const confirmName = prompt(
      `Estás a punto de borrar el gimnasio "${gym.name}" y todos sus datos relacionados.\n\nEsta acción es irreversible.\n\nEscribe el nombre del gimnasio para confirmar:`
    )
    
    if (confirmName !== gym.name) {
      if (confirmName !== null) toast.error('El nombre no coincide. Operación cancelada.')
      return
    }
    
    setLoading(true)
    try {
      const res = await deleteGymCascade(gym.id)
      if (res.success) {
        toast.success(`Gimnasio ${gym.name} eliminado correctamente`)
      } else {
        toast.error(res.error || 'Error al eliminar gimnasio')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (newPlanId: string, newLocked: boolean) => {
    setIsUpdating(true)
    setPlanId(newPlanId)
    setLocked(newLocked)
    try {
      const res = await updateGymSubscription(gym.id, newPlanId, newLocked)
      if (res.success) {
        toast.success('Estado actualizado')
      } else {
        toast.error(res.error || 'Error al actualizar')
        // Revert on fail
        setPlanId(gym.platformPlanId || allPlans[0]?.id)
        setLocked(gym.isLocked)
      }
    } catch (error) {
      toast.error('Error de red')
      setPlanId(gym.platformPlanId || allPlans[0]?.id)
      setLocked(gym.isLocked)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <tr className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors">
      <td className="p-4">
        <p className="text-sm font-bold text-white flex items-center gap-2">
          {locked && <Lock className="w-3 h-3 text-red-500" />}
          {gym.name}
        </p>
        <p className="text-xs text-slate-500 font-mono mt-1">{gym.slug}</p>
        <p className="text-xs text-slate-600 mt-1">Suscrito: {gym.createdAt.toLocaleDateString()}</p>
      </td>
      <td className="p-4">
        <div className="flex flex-col gap-2">
          <select 
            value={planId}
            onChange={(e) => handleUpdate(e.target.value, locked)}
            disabled={isUpdating}
            className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-md px-2 py-1.5 focus:outline-none focus:border-cyan-500 w-full max-w-[150px]"
          >
            {allPlans.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.name}</option>
            ))}
          </select>
          
          <button
            onClick={() => handleUpdate(planId, !locked)}
            disabled={isUpdating}
            className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase font-bold rounded w-fit transition-colors ${
              locked 
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
            }`}
          >
            {locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            {locked ? 'BLOQUEADO' : 'ACTIVO'}
          </button>
        </div>
      </td>
      <td className="p-4">
        <div className="flex gap-4 text-xs text-slate-400">
          <div><span className="font-bold text-white">{gym._count.subscriptions}</span> Subs</div>
          <div><span className="font-bold text-white">{gym._count.sales}</span> Ventas</div>
          <div><span className="font-bold text-white">{gym._count.plans}</span> Planes</div>
        </div>
      </td>
      <td className="p-4 text-sm text-right">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 border border-transparent hover:border-red-500/20 rounded font-bold transition-colors disabled:opacity-50"
          title="Borrar Gimnasio"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Borrar
        </button>
      </td>
    </tr>
  )
}
