import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { RequestsClient } from "./RequestsClient"

export const dynamic = 'force-dynamic'

export default async function RequestsPage() {
  const session = await auth()
  const gymId = (session?.user as any)?.gymId

  if (!gymId) {
    return <div className="p-8 text-white">No tienes un gimnasio asignado.</div>
  }

  const pendingRequests = await prisma.subscription.findMany({
    where: {
      gymId,
      status: 'PENDING'
    },
    include: {
      user: {
        select: { name: true, email: true, image: true, phone: true }
      },
      plan: {
        select: { name: true, price: true, currency: true, type: true }
      }
    },
    orderBy: {
      startDate: 'asc'
    }
  })

  // We need to map dates to strings for Client Component
  const formattedRequests = pendingRequests.map(r => ({
    ...r,
    startDate: r.startDate.toISOString(),
    endDate: r.endDate?.toISOString() || null,
    plan: {
      ...r.plan,
      price: r.plan.price.toString()
    }
  }))

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          Solicitudes de Acceso
        </h1>
        <p className="text-slate-400 mt-2">
          Atletas que han escaneado el código QR y están esperando pagar/activar su plan.
        </p>
      </div>

      <RequestsClient requests={formattedRequests} />
    </div>
  )
}
