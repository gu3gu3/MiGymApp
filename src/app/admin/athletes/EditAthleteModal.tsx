'use client'

import { useState } from 'react'
import { updateAthleteAdminInfo } from '@/app/actions/admin/athletes-directory'
import { X, Save, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

interface AthleteData {
  id: string
  name: string
  email: string
  phone: string | null
  identityDocument: string | null
  address: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  isClaimed: boolean
  subscriptions: { internalNotes: string | null }[]
}

interface Props {
  athlete: AthleteData
  onClose: () => void
  onSuccess: () => void
}

export function EditAthleteModal({ athlete, onClose, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: athlete.name,
    email: athlete.email,
    phone: athlete.phone || '',
    identityDocument: athlete.identityDocument || '',
    address: athlete.address || '',
    emergencyContactName: athlete.emergencyContactName || '',
    emergencyContactPhone: athlete.emergencyContactPhone || '',
    internalNotes: athlete.subscriptions[0]?.internalNotes || '',
  })

  const isClaimed = athlete.isClaimed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const result = await updateAthleteAdminInfo(athlete.id, formData)
    setIsSubmitting(false)

    if (result.success) {
      toast.success('Atleta actualizado con éxito')
      onSuccess()
    } else {
      toast.error(result.error || 'Error al actualizar')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Editar Información</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {isClaimed && (
            <div className="mb-6 p-4 bg-cyan-950/50 border border-cyan-800 rounded-xl">
              <p className="text-cyan-400 text-sm font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                El atleta ha reclamado esta cuenta. Sus datos personales están protegidos y solo él puede editarlos.
              </p>
            </div>
          )}
          <form id="edit-athlete-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Nombre Completo *</label>
                <input 
                  type="text" required
                  disabled={isClaimed}
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Correo Electrónico *</label>
                <input 
                  type="email" required
                  disabled={isClaimed}
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Documento de Identidad</label>
                <input 
                  type="text"
                  disabled={isClaimed}
                  value={formData.identityDocument} onChange={e => setFormData({...formData, identityDocument: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Teléfono</label>
                <input 
                  type="text"
                  disabled={isClaimed}
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-400 mb-2">Dirección Física</label>
                <input 
                  type="text"
                  disabled={isClaimed}
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Contacto Emergencia (Nombre)</label>
                <input 
                  type="text"
                  disabled={isClaimed}
                  value={formData.emergencyContactName} onChange={e => setFormData({...formData, emergencyContactName: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Contacto Emergencia (Teléfono)</label>
                <input 
                  type="text"
                  disabled={isClaimed}
                  value={formData.emergencyContactPhone} onChange={e => setFormData({...formData, emergencyContactPhone: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-400 mb-2">Notas Internas (Privado)</label>
                <p className="text-xs text-slate-500 mb-2">Estas notas solo son visibles para ti y tu staff. El atleta no las verá.</p>
                <textarea 
                  rows={3}
                  value={formData.internalNotes} onChange={e => setFormData({...formData, internalNotes: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 resize-none"
                  placeholder="Ej. Deuda pendiente de $10, usar rodillera azul..."
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex justify-end gap-4 bg-slate-900/50 rounded-b-3xl">
          <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-slate-400 hover:text-white transition-colors">
            Cancelar
          </button>
          <button 
            type="submit" 
            form="edit-athlete-form"
            disabled={isSubmitting}
            className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  )
}
