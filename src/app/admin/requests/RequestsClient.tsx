'use client'

import { useState } from 'react'
import { approveSubscription } from '@/app/actions/admin/approve-subscription'
import { CheckCircle, Clock, Search, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

type RequestItem = {
  id: string
  user: { name: string, email: string, image: string | null, phone: string | null }
  plan: { name: string, price: string, currency: string, type: string }
  startDate: string
}

export function RequestsClient({ requests }: { requests: RequestItem[] }) {
  const [items, setItems] = useState(requests)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = items.filter(r => 
    r.user.name.toLowerCase().includes(search.toLowerCase()) || 
    r.user.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleApprove = async (id: string) => {
    setLoadingId(id)
    try {
      const result = await approveSubscription(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Suscripción activada con éxito")
        setItems(prev => prev.filter(r => r.id !== id))
      }
    } catch (e) {
      toast.error("Error al aprobar")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div>
      <div className="mb-6 relative">
        <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input 
          type="text" 
          placeholder="Buscar atleta por nombre o correo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      {items.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Todo al día</h3>
          <p className="text-slate-400">No hay solicitudes pendientes en este momento.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(req => (
            <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-12 h-12 rounded-full bg-cyan-900/30 flex items-center justify-center text-cyan-400 font-bold shrink-0">
                  {req.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white font-bold">{req.user.name}</h3>
                  <p className="text-slate-400 text-sm">{req.user.email}</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                <div className="text-center md:text-right w-full md:w-auto bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                  <p className="text-white font-bold">{req.plan.name}</p>
                  <p className="text-cyan-400 font-black text-sm">{req.plan.currency} {req.plan.price}</p>
                </div>
                
                <button
                  onClick={() => handleApprove(req.id)}
                  disabled={loadingId === req.id}
                  className="w-full md:w-auto px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loadingId === req.id ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Validar Pago y Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
