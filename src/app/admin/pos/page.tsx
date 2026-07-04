import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getProducts } from '@/app/actions/admin/inventory'
import { PosManager } from '@/components/pos/PosManager'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function PosPage() {
  const session = await auth()
  const user = session?.user as any

  if (!user || !user.gymId) {
    redirect('/login')
  }

  const gym = await prisma.gym.findUnique({
    where: { id: user.gymId },
    select: { posPlan: true, currency: true }
  })
  
  const posPlan = gym?.posPlan || 'KIOSKO'
  const currency = gym?.currency || 'NIO'
  const products = await getProducts(user.gymId, true)
  const plans = await prisma.plan.findMany({
    where: { gymId: user.gymId, isActive: true },
    select: {
      id: true,
      name: true,
      price: true,
      type: true,
      durationDays: true,
      totalCredits: true
    }
  })

  // Convert Decimal to number for the client
  const formattedPlans = plans.map(p => ({
    ...p,
    price: Number(p.price)
  }))

  const athletes = await prisma.user.findMany({
    where: {
      subscriptions: { some: { gymId: user.gymId } }
    },
    select: { id: true, name: true, identityDocument: true }
  })

  return (
    <PosManager 
      initialProducts={products}
      initialPlans={formattedPlans}
      athletes={athletes}
      posPlan={posPlan}
      role={user.role}
      currency={currency}
    />
  )
}
