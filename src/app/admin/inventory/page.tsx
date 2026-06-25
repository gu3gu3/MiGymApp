import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getProducts, getSalesMetrics } from '@/app/actions/admin/inventory'
import { InventoryManager } from '@/components/inventory/InventoryManager'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  const session = await auth()
  const user = session?.user as any

  if (!user || user.role !== 'GYM_ADMIN' || !user.gymId) {
    redirect('/login')
  }

  const gym = await prisma.gym.findUnique({
    where: { id: user.gymId },
    select: { posPlan: true, currency: true, exchangeRate: true }
  })
  
  const posPlan = gym?.posPlan || 'KIOSKO'
  const currency = gym?.currency || 'USD'
  const exchangeRate = gym?.exchangeRate || 1.0

  let maxLimit = 10
  if (posPlan === 'TIENDITA') maxLimit = 30
  if (posPlan === 'SMART_BAR') maxLimit = 100

  const products = await getProducts(user.gymId)
  const salesMetrics = await getSalesMetrics(user.gymId)

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      <InventoryManager 
        initialProducts={products} 
        posPlan={posPlan}
        maxLimit={maxLimit}
        currency={currency}
        exchangeRate={exchangeRate}
        salesMetrics={salesMetrics}
      />
    </div>
  )
}
