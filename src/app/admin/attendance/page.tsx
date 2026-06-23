'use client'

import { useEffect, useState } from 'react'
import { getRecentCheckIns } from '@/app/actions/attendance/get-attendance'
import { Activity, Clock, Users, Search, RefreshCw, UserCheck } from 'lucide-react'

type CheckIn = {
  id: string
  createdAt: Date
  isOfflineSync: boolean
  user: {
    id: string
    name: string
    email: string
    image: string | null
    identityDocument: string | null
    phone: string | null
  }
  planName: string
}

export default function AttendancePage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const loadAttendance = async () => {
    setIsLoading(true)
    const data = await getRecentCheckIns()
    setCheckIns(data as any)
    setIsLoading(false)
  }

  useEffect(() => {
    loadAttendance()
    // Poll every 30 seconds for live updates
    const interval = setInterval(loadAttendance, 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredCheckIns = checkIns.filter(c => 
    c.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.user.identityDocument?.includes(searchTerm)
  )

  return (
    <div className="h-full overflow-y-auto p-8 max-w-7xl mx-auto w-full custom-scrollbar">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-cyan-400" /> Registro de Asistencia
          </h1>
          <p className="text-slate-400 mt-2">Visibilidad en tiempo real de los atletas en el recinto.</p>
        </div>
        <button 
          onClick={loadAttendance}
          className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors text-slate-400 hover:text-cyan-400"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-950 flex items-center justify-center text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400">Accesos Hoy</p>
            <p className="text-2xl font-black text-white">{checkIns.length}</p>
          </div>
        </div>
        
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center">
          <div className="w-full relative">
            <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o DNI..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-800 bg-slate-950/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-1 text-center">Foto</div>
          <div className="col-span-4">Atleta</div>
          <div className="col-span-3">Plan Activo</div>
          <div className="col-span-2 text-center">Hora Acceso</div>
          <div className="col-span-2 text-right">Detalles</div>
        </div>

        <div className="divide-y divide-slate-800/50">
          {isLoading && checkIns.length === 0 ? (
             <div className="p-8 text-center text-slate-500 flex flex-col items-center">
               <RefreshCw className="w-8 h-8 animate-spin mb-2 opacity-50" />
               Cargando asistencias...
             </div>
          ) : filteredCheckIns.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No hay asistencias registradas o no hay coincidencias de búsqueda.
            </div>
          ) : (
            filteredCheckIns.map(check => (
              <div key={check.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-800/20 transition-colors">
                <div className="col-span-1 flex justify-center">
                  <div className="w-10 h-10 rounded-full border-2 border-slate-700 overflow-hidden bg-slate-800">
                    {check.user.image ? (
                      <img src={check.user.image} alt={check.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <Users className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="col-span-4">
                  <p className="font-bold text-white text-sm">{check.user.name}</p>
                  <p className="text-xs text-slate-500">{check.user.identityDocument || check.user.email}</p>
                </div>
                
                <div className="col-span-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-900/30 text-cyan-400 border border-cyan-800">
                    {check.planName}
                  </span>
                </div>
                
                <div className="col-span-2 flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-bold text-slate-300">
                    {new Date(check.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="col-span-2 text-right">
                   {check.isOfflineSync && (
                     <span className="text-[10px] uppercase font-bold text-orange-400 bg-orange-950/30 px-2 py-1 rounded-md border border-orange-900">
                       Sync Offline
                     </span>
                   )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
