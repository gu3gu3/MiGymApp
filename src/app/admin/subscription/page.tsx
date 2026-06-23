import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import SubscriptionClient from "./SubscriptionClient"
import { getPlatformPlans } from "@/app/actions/superadmin/plans"

export const dynamic = 'force-dynamic'

export default async function SubscriptionPage() {
  const session = await auth()
  const gymId = (session?.user as any)?.gymId

  if (!gymId) {
    return <div className="p-8 text-white">No tienes un gimnasio asignado.</div>
  }

  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    select: { platformPlanId: true, isLocked: true, slug: true }
  })

  const allPlans = await prisma.platformPlan.findMany({
    orderBy: { priceNio: 'asc' }
  })

  return <SubscriptionClient currentPlanId={gym?.platformPlanId ?? null} allPlans={allPlans} gymId={gymId} gymSlug={gym?.slug || 'unknown'} isLocked={gym?.isLocked || false} />
}
