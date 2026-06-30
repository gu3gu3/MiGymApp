'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, Shield, CalendarDays, TrendingUp, Calendar, DollarSign, Activity, BarChart2 } from 'lucide-react'

export default function GymHealthClient({ athletes, currency = 'USD', expressSales = [] }: { athletes: any[], currency?: string, expressSales?: any[] }) {
  const [limit, setLimit] = useState<number>(25)
  const symbol = currency === 'NIO' ? 'C$' : currency === 'USD' ? '$' : currency

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  // Generate last 12 months
  const monthOptions = useMemo(() => {
    const opts = []
    const d = new Date()
    for (let i = 0; i < 12; i++) {
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
      opts.push({ value: val, label: label.charAt(0).toUpperCase() + label.slice(1) })
      d.setMonth(d.getMonth() - 1)
    }
    return opts
  }, [])

  const metrics = useMemo(() => {
    let daily = 0
    let weekly = 0
    let monthly = 0
    const planPopularity: Record<string, number> = {}

    const [year, month] = selectedMonth.split('-').map(Number)

    athletes.forEach(athlete => {
      // Buscar suscripciones que iniciaron en el mes y año seleccionado
      const subInMonth = athlete.subscriptions.find((s: any) => {
        const d = new Date(s.startDate)
        return d.getFullYear() === year && (d.getMonth() + 1) === month
      })

      if (subInMonth && subInMonth.plan) {
        const price = Number(subInMonth.plan.price) || 0
        const duration = subInMonth.plan.durationDays || 30 // Asumir 30 días si no tiene duración

        daily += price / duration
        weekly += (price / duration) * 7
        monthly += price // Para historial, el ingreso del mes es simplemente el valor del plan vendido
        
        const planName = subInMonth.plan.name
        planPopularity[planName] = (planPopularity[planName] || 0) + 1
      }
    })

    // Sumar ventas de Pase Express del mes
    expressSales.forEach(sale => {
      const d = new Date(sale.createdAt)
      if (d.getFullYear() === year && (d.getMonth() + 1) === month) {
        const price = sale.total
        daily += price // Un pase de 1 día rinde su ingreso en 1 día
        weekly += price 
        monthly += price
        
        planPopularity['Pase Express (1 Día)'] = (planPopularity['Pase Express (1 Día)'] || 0) + 1
      }
    })

    const totalUsersInMonth = Object.values(planPopularity).reduce((a, b) => a + b, 0)
    const sortedPlans = Object.entries(planPopularity)
      .map(([name, count]) => ({ name, count, percentage: totalUsersInMonth ? (count / totalUsersInMonth) * 100 : 0 }))
      .sort((a, b) => b.count - a.count)

    return { daily, weekly, monthly, sortedPlans, totalUsersInMonth }
  }, [athletes, selectedMonth, expressSales])

  const visibleAthletes = limit === -1 ? athletes : athletes.slice(0, limit)
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full h-full overflow-hidden flex flex-col">
      {/* HEADER */}
      <div className="mb-6 border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Atletas & Health</h1>
          <p className="text-sm text-slate-400 mt-1">Métricas históricas y estado de los atletas</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 p-2 rounded-xl shadow-lg">
          <CalendarDays className="w-5 h-5 text-cyan-400 ml-2" />
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-white font-bold px-2 py-1 outline-none cursor-pointer text-sm"
          >
            {monthOptions.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative pb-10">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {/* FINANCIAL STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center">
              <div className="flex items-center gap-3 text-slate-400 mb-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Ingreso Diario</h3>
              </div>
              <p className="text-3xl font-black text-white">
                {symbol} {metrics.daily.toFixed(2)}
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center">
              <div className="flex items-center gap-3 text-slate-400 mb-2">
                <CalendarDays className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Ingreso Semanal</h3>
              </div>
              <p className="text-3xl font-black text-white">
                {symbol} {metrics.weekly.toFixed(2)}
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-5">
                <TrendingUp className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-3 text-slate-400 mb-2 relative z-10">
                <Calendar className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Ingreso en el Mes</h3>
              </div>
              <p className="text-3xl font-black text-purple-400 relative z-10">
                {symbol} {metrics.monthly.toFixed(2)}
              </p>
            </div>
          </div>

          {/* PLAN DISTRIBUTION */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mb-10 p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart2 className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Popularidad de Planes ({monthOptions.find(o => o.value === selectedMonth)?.label})</h2>
            </div>
            
            {metrics.sortedPlans.length > 0 ? (
              <div className="space-y-4">
                {metrics.sortedPlans.map((plan, index) => (
                  <div key={plan.name} className="relative">
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <span className="font-bold text-slate-200">{plan.name}</span>
                      <span className="text-slate-400 font-mono">
                        {plan.count} usuarios <span className="text-cyan-400 font-bold ml-1">({plan.percentage.toFixed(1)}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${plan.percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-3 rounded-full ${index === 0 ? 'bg-gradient-to-r from-emerald-400 to-cyan-500' : index === 1 ? 'bg-gradient-to-r from-cyan-400 to-blue-500' : 'bg-gradient-to-r from-purple-400 to-pink-500'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 border border-dashed border-slate-700 rounded-xl">
                No se registraron ventas de planes en este mes.
              </div>
            )}
          </div>

          {/* HEALTH CONTENT */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mb-10">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="text-cyan-400"/> Lista de Atletas
                <span className="bg-cyan-950 text-cyan-400 px-3 py-1 rounded-full text-xs font-bold border border-cyan-900 ml-2">{athletes.length} Total</span>
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Mostrar:</span>
                <select 
                  value={limit} 
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-sm outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value={25}>25 atletas</option>
                  <option value={100}>100 atletas</option>
                  <option value={-1}>Todos ({athletes.length})</option>
                </select>
              </div>
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
                  {visibleAthletes.map(athlete => {
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
                  {visibleAthletes.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">No hay atletas registrados en este gimnasio aún.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
