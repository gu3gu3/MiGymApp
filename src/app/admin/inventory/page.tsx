import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getProducts } from '@/app/actions/admin/inventory'
import { InventoryManager } from '@/components/inventory/InventoryManager'

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  const session = await auth()
  const user = session?.user as any

  if (!user || user.role !== 'GYM_ADMIN' || !user.gymId) {
    redirect('/login')
  }

  const products = await getProducts(user.gymId)

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      <InventoryManager initialProducts={products} />
    </div>
  )
}
