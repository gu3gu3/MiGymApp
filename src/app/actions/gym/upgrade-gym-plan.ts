'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function upgradeGymPlan(newPlanId: string) {
  const session = await auth()
  const gymId = (session?.user as any)?.gymId
  const role = (session?.user as any)?.role

  if (!gymId || role !== 'GYM_ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    await prisma.gym.update({
      where: { id: gymId },
      data: { platformPlanId: newPlanId }
    })
    
    revalidatePath('/admin/subscription')
    return { success: true }
  } catch (err: any) {
    console.error(err)
    return { success: false, error: 'Failed to upgrade plan' }
  }
}
