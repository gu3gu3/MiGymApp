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
    select: { posPlan: true }
  })
  
  const posPlan = gym?.posPlan || 'KIOSKO'
  const products = await getProducts(user.gymId)

  return (
    <PosManager 
      initialProducts={products} 
      posPlan={posPlan}
      role={user.role}
    />
  )
}
