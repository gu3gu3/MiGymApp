import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import GymHealthClient from "./GymHealthClient"

export default async function GymHealthPage() {
  const session = await auth()
  const gymId = (session?.user as any)?.gymId

  if (!gymId) {
    return <div className="p-8 text-white">No tienes un gimnasio asignado.</div>
  }

  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    select: { currency: true }
  })
  const currency = gym?.currency || 'USD'

  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const athletes = await prisma.user.findMany({
    where: { role: 'ATHLETE', subscriptions: { some: { gymId: gymId } } },
    include: {
      subscriptions: {
        where: { 
          gymId: gymId,
          startDate: { gte: oneYearAgo }
        },
        include: { plan: true },
        orderBy: { startDate: 'desc' }
      },
      checkIns: {
        where: { gymId: gymId },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const expressSales = await prisma.sale.findMany({
    where: {
      gymId,
      createdAt: { gte: oneYearAgo },
      items: {
        some: { product: { name: 'Pase Express (1 Día)' } }
      }
    }
  })

  // Convert Decimals to string/number for Client Component
  const serializedSales = expressSales.map(s => ({
    id: s.id,
    createdAt: s.createdAt,
    total: Number(s.total)
  }))

  return <GymHealthClient athletes={athletes} currency={currency} expressSales={serializedSales} />
}
