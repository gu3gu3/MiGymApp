'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function updateGymSubscription(gymId: string, planId: string, isLocked: boolean) {
  const session = await auth()
  const role = (session?.user as any)?.role

  if (role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    await prisma.gym.update({
      where: { id: gymId },
      data: { 
        platformPlanId: planId,
        isLocked: isLocked
      }
    })
    
    revalidatePath('/superadmin/gyms')
    revalidatePath('/admin', 'layout')
    return { success: true }
  } catch (err: any) {
    console.error(err)
    return { success: false, error: 'Failed to update subscription' }
  }
}
