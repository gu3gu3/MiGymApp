import { getGyms } from "@/app/actions/superadmin/gyms"
import { Building2 } from "lucide-react"
import { GymTableRow } from "@/components/superadmin/GymTableRow"

import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export default async function GymsPage() {
  const gyms = await getGyms()
  const allPlans = await prisma.platformPlan.findMany({
    orderBy: { priceNio: 'asc' }
  })

  // Calcular métricas
  let totalMRR = 0
  let paidGyms = 0

  gyms.forEach(gym => {
    let gymTotal = 0
    if (gym.platformPlan && gym.platformPlan.priceUsd > 0) {
      gymTotal += gym.platformPlan.priceUsd
      paidGyms++
    }
    
    if (gym.posPlan === 'TIENDITA') gymTotal += 15
    if (gym.posPlan === 'SMART_BAR') gymTotal += 30

    totalMRR += gymTotal
  })

  const totalAthletes = await prisma.user.count({
    where: { role: 'ATHLETE' }
  })

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase mb-4">
            <Building2 className="w-4 h-4" /> Gestión de Red
          </div>
          <h1 className="text-4xl font-black text-white">Gimnasios Registrados</h1>
          <p className="text-slate-400 mt-2">Monitorea y administra todos los gimnasios del ecosistema MiGym.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
            <p className="text-slate-400 text-sm font-semibold mb-1 uppercase tracking-wider">Ingresos SaaS (MRR)</p>
            <h2 className="text-4xl font-black text-emerald-400">${totalMRR.toFixed(2)}</h2>
            <p className="text-xs text-slate-500 mt-2">Ingreso Mensual Recurrente Estimado</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
            <p className="text-slate-400 text-sm font-semibold mb-1 uppercase tracking-wider">Gimnasios de Pago</p>
            <h2 className="text-4xl font-black text-blue-400">{paidGyms} <span className="text-lg text-slate-500 font-medium">/ {gyms.length}</span></h2>
            <p className="text-xs text-slate-500 mt-2">Gimnasios que superaron Freemium</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
            <p className="text-slate-400 text-sm font-semibold mb-1 uppercase tracking-wider">Atletas en Red</p>
            <h2 className="text-4xl font-black text-purple-400">{totalAthletes}</h2>
            <p className="text-xs text-slate-500 mt-2">Total de atletas registrados (Global)</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950 border-b border-slate-800">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Gimnasio</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan / Estado</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estadísticas</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {gyms.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      No hay gimnasios registrados en la plataforma.
                    </td>
                  </tr>
                ) : (
                  gyms.map(gym => (
                    <GymTableRow key={gym.id} gym={gym as any} allPlans={allPlans} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
