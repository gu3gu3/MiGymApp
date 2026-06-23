import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import StaffClient from './StaffClient'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function StaffPage() {
  const session = await auth()
  const user = session?.user as any

  if (user?.role !== 'GYM_ADMIN' || !user?.gymId) {
    redirect('/admin/gatekeeper')
  }

  const staff = await prisma.user.findMany({
    where: {
      gymId: user.gymId,
      role: 'RECEPTIONIST'
    },
    orderBy: { createdAt: 'desc' }
  })

  const staffCount = await prisma.user.count({
    where: {
      gymId: user.gymId,
      role: { not: 'GYM_ADMIN' }
    }
  })
  
  const isLimitReached = staffCount >= 1

  return <StaffClient staff={staff} isLimitReached={isLimitReached} />
}
