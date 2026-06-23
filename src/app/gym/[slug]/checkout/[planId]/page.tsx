import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { CheckoutForm } from "@/components/gym/CheckoutForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function PlanCheckoutPage({
  params,
}: {
  params: Promise<{ slug: string, planId: string }>
}) {
  const { slug, planId } = await params
  
  const session = await auth()
  const userId = session?.user?.id

  // Require athlete to be logged in
  if (!userId) {
    // Redirigir al login del wallet con una URL de retorno
    redirect(`/wallet/login?callbackUrl=/gym/${slug}/checkout/${planId}`)
  }

  const gym = await prisma.gym.findUnique({
    where: { slug },
  })

  if (!gym) notFound()

  const plan = await prisma.plan.findUnique({
    where: { id: planId, gymId: gym.id }
  })

  if (!plan) notFound()

  // Verify if there's already a pending or active subscription for this plan
  const existingSub = await prisma.subscription.findFirst({
    where: {
      userId,
      gymId: gym.id,
      planId: plan.id,
      status: { in: ['ACTIVE', 'PENDING'] }
    }
  })

  return (
    <div className="min-h-screen bg-[#050505] p-6 flex flex-col">
      <Link href={`/gym/${slug}`} className="text-slate-400 flex items-center gap-2 mb-8 hover:text-white transition-colors w-fit">
        <ArrowLeft className="w-5 h-5" />
        Volver a {gym.name}
      </Link>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Aesthetic flares */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />
          
          <h2 className="text-2xl font-black text-white mb-2">Checkout de Plan</h2>
          <p className="text-slate-400 mb-8 text-sm">Estás solicitando acceso a {gym.name}</p>

          <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 mb-8">
            <h3 className="text-lg font-bold text-white">{plan.name}</h3>
            <p className="text-slate-400 text-sm mb-4">
              {plan.type === 'TIME_BASED' ? `${plan.durationDays} Días de Acceso` : `${plan.totalCredits} Pases de Acceso`}
            </p>
            <div className="flex justify-between items-center border-t border-slate-800 pt-4 mt-2">
              <span className="text-slate-300">Total a pagar:</span>
              <span className="text-2xl font-black text-cyan-400">{plan.currency} {plan.price.toString()}</span>
            </div>
          </div>

          {existingSub ? (
            <div className="bg-amber-500/10 border border-amber-500/50 p-6 rounded-xl text-center">
              <p className="text-amber-400 text-sm mb-4">
                Ya tienes una suscripción {existingSub.status === 'PENDING' ? 'pendiente' : 'activa'} para este plan. 
                {existingSub.status === 'PENDING' && " Por favor paga en recepción para que sea aprobada."}
              </p>
              <Link href="/wallet/profile" replace className="inline-block w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-colors">
                Ir a Mi Wallet
              </Link>
            </div>
          ) : (
            <CheckoutForm gymId={gym.id} planId={plan.id} />
          )}
        </div>
      </div>
    </div>
  )
}
