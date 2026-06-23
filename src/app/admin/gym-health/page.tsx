import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import GymHealthClient from "./GymHealthClient"

export default async function GymHealthPage() {
  const session = await auth()
  const gymId = (session?.user as any)?.gymId

  if (!gymId) {
    return <div className="p-8 text-white">No tienes un gimnasio asignado.</div>
  }

  const athletes = await prisma.user.findMany({
    where: { role: 'ATHLETE', subscriptions: { some: { gymId: gymId } } },
    include: {
      subscriptions: {
        where: { gymId: gymId },
        include: { plan: true },
        orderBy: { startDate: 'desc' },
        take: 1
      },
      checkIns: {
        where: { gymId: gymId },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return <GymHealthClient athletes={athletes} />
}
