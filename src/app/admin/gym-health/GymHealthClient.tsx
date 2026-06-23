'use client'

import { motion } from 'framer-motion'
import { Users, Shield, CalendarDays } from 'lucide-react'

export default function GymHealthClient({ athletes }: { athletes: any[] }) {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full h-full overflow-hidden flex flex-col">
      {/* HEADER */}
      <div className="mb-6 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white">Atletas & Health</h1>
        <p className="text-sm text-slate-400 mt-1">Métricas y estado de los atletas de tu gimnasio</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative pb-10">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {/* HEALTH CONTENT */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mb-10">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><Users className="text-cyan-400"/> Lista de Atletas</h2>
              <span className="bg-cyan-950 text-cyan-400 px-3 py-1 rounded-full text-xs font-bold border border-cyan-900">{athletes.length} Total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-slate-800">
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Atleta</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Biometría</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Gamificación</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Suscripción</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Último Acceso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {athletes.map(athlete => {
                    const sub = athlete.subscriptions[0]
                    const lastCheckIn = athlete.checkIns[0]
                    const genderIcon = athlete.gender === 'MALE' ? '♂️' : athlete.gender === 'FEMALE' ? '♀️' : '👤'
                    return (
                      <tr key={athlete.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={athlete.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${athlete.name}`} alt={athlete.name} className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800" />
                            <div><p className="font-bold text-white text-sm">{athlete.name}</p><p className="text-xs text-slate-500">{athlete.email}</p></div>
                          </div>
                        </td>
                        <td className="p-4 text-sm">
                          <div className="flex items-center gap-2 mb-1"><span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">{genderIcon} {athlete.gender || 'N/D'}</span>{athlete.weight && <span className="text-slate-400 text-xs">{athlete.weight} kg</span>}</div>
                          {athlete.bmi ? <div className="flex items-center gap-2"><span className="text-xs text-slate-500">BMI:</span><span className={`font-black ${athlete.bmi > 25 ? 'text-orange-400' : 'text-emerald-400'}`}>{athlete.bmi.toFixed(1)}</span></div> : <span className="text-xs text-slate-600 italic">Sin datos</span>}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg"><span className="text-white font-black text-xs">{athlete.level}</span></div><div><p className="text-xs text-slate-500 font-bold">Nivel</p><p className="text-sm font-bold text-cyan-400 flex items-center gap-1">{athlete.xp} XP</p></div></div>
                        </td>
                        <td className="p-4">
                          {sub ? <div><p className="font-bold text-white text-sm flex items-center gap-2"><Shield className={`w-4 h-4 ${sub.status === 'ACTIVE' ? 'text-emerald-400' : 'text-slate-500'}`} />{sub.plan.name}</p><p className="text-xs text-slate-500 mt-1">{sub.status === 'ACTIVE' ? (sub.endDate ? `Expira: ${new Date(sub.endDate).toLocaleDateString()}` : 'Activo') : <span className="text-orange-400">{sub.status}</span>}</p></div> : <span className="text-xs text-slate-500 italic">Sin suscripción</span>}
                        </td>
                        <td className="p-4">
                          {lastCheckIn ? <div><p className="text-sm font-bold text-slate-300 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-cyan-500" />{new Date(lastCheckIn.createdAt).toLocaleDateString()}</p></div> : <span className="text-xs text-slate-600 italic">Nunca ingresó</span>}
                        </td>
                      </tr>
                    )
                  })}
                  {athletes.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">No hay atletas registrados en este gimnasio aún.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
