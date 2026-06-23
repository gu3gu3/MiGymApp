import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { MapPin, Dumbbell } from "lucide-react"

export default async function GymPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  const gym = await prisma.gym.findUnique({
    where: { slug },
    include: {
      plans: {
        where: { isActive: true },
        orderBy: { price: 'asc' }
      }
    }
  })

  if (!gym) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-20">
      {/* Gym Header / Banner */}
      <div className="h-64 w-full relative bg-slate-900 overflow-hidden">
        {gym.bannerUrl ? (
          <img src={gym.bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-cyan-900 to-blue-900 opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
        
        <div className="absolute bottom-6 left-6 right-6 flex items-end gap-4">
          <div className="w-20 h-20 bg-slate-800 rounded-2xl border-2 border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
            {gym.logoUrl ? (
              <img src={gym.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Dumbbell className="w-10 h-10 text-slate-400" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">{gym.name}</h1>
            <p className="text-slate-400 flex items-center gap-1 text-sm mt-1">
              <MapPin className="w-4 h-4" /> {gym.address}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-6">Planes Disponibles</h2>
        
        {gym.plans.length === 0 ? (
          <p className="text-slate-400">Este gimnasio no tiene planes activos en este momento.</p>
        ) : (
          <div className="grid gap-4">
            {gym.plans.map((plan) => (
              <div key={plan.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-slate-400 text-sm">
                      {plan.type === 'TIME_BASED' ? `${plan.durationDays} Días` : `${plan.totalCredits} Pases`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-cyan-400">
                      {plan.currency} {plan.price.toString()}
                    </span>
                  </div>
                </div>
                
                <Link 
                  href={`/gym/${gym.slug}/checkout/${plan.id}`}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl transition-colors text-center"
                >
                  Seleccionar Plan
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
