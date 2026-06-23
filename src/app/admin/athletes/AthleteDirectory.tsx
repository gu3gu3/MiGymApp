'use client'

import { useState, useEffect } from 'react'
import { getGymAthletes } from '@/app/actions/admin/athletes-directory'
import { EditAthleteModal } from './EditAthleteModal'
import { Search, Edit2, User, Phone, Mail, Activity } from 'lucide-react'
import { format } from 'date-fns'

type AthleteInfo = {
  id: string
  name: string
  email: string
  phone: string | null
  identityDocument: string | null
  address: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  gender: string | null
  weight: number | null
  height: number | null
  bmi: number | null
  image: string | null
  createdAt: Date
  isClaimed: boolean
  subscriptions: { status: string, internalNotes: string | null, plan: { name: string } }[]
}

export function AthleteDirectory() {
  const [athletes, setAthletes] = useState<AthleteInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingAthlete, setEditingAthlete] = useState<AthleteInfo | null>(null)

  const fetchAthletes = async () => {
    setIsLoading(true)
    const res = await getGymAthletes()
    if (res.success && res.data) {
      setAthletes(res.data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchAthletes()
  }, [])

  const filteredAthletes = athletes.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    (a.identityDocument && a.identityDocument.includes(search)) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="h-full overflow-y-auto p-8 max-w-7xl mx-auto w-full custom-scrollbar">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <User className="w-8 h-8 text-cyan-400" /> Directorio de Atletas
          </h1>
          <p className="text-slate-400 mt-2">Gestiona y corrige la información personal de tus atletas.</p>
        </div>
        
        <div className="relative w-full md:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-slate-500">Cargando directorio...</div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Atleta</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contacto</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Documento</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Plan / Estado</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredAthletes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No se encontraron atletas.
                    </td>
                  </tr>
                ) : (
                  filteredAthletes.map(athlete => {
                    const sub = athlete.subscriptions[0]
                    return (
                      <tr key={athlete.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                              {athlete.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={athlete.image} alt={athlete.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
                                  {athlete.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-white">{athlete.name}</div>
                              <div className="text-xs text-slate-500">Miembro desde {format(new Date(athlete.createdAt), 'MMM yyyy')}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1 text-sm text-slate-300">
                            <div className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-500" /> {athlete.email}</div>
                            {athlete.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-500" /> {athlete.phone}</div>}
                          </div>
                        </td>
                        <td className="p-4 text-slate-300 text-sm">
                          {athlete.identityDocument || <span className="text-slate-600 italic">No registrado</span>}
                        </td>
                        <td className="p-4">
                          {sub ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-semibold text-white">{sub.plan?.name || 'Suscripción'}</span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-max ${
                                sub.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                                sub.status === 'PENDING' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {sub.status}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-xs italic">Sin plan activo</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => setEditingAthlete(athlete)}
                            className="p-2 bg-slate-800 hover:bg-cyan-900 text-cyan-400 rounded-lg transition-colors inline-flex items-center gap-2"
                            title="Editar Datos"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingAthlete && (
        <EditAthleteModal 
          athlete={editingAthlete} 
          onClose={() => setEditingAthlete(null)} 
          onSuccess={() => {
            setEditingAthlete(null)
            fetchAthletes()
          }}
        />
      )}
    </div>
  )
}
