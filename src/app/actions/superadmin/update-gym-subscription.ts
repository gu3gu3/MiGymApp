'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

import { PosPlan } from '@prisma/client'

export async function updateGymSubscription(gymId: string, planId: string, isLocked: boolean, posPlan?: PosPlan) {
  const session = await auth()
  const role = (session?.user as any)?.role

  if (role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const dataToUpdate: any = {
      platformPlanId: planId,
      isLocked: isLocked
    }
    if (posPlan) {
      dataToUpdate.posPlan = posPlan
    }

    await prisma.gym.update({
      where: { id: gymId },
      data: dataToUpdate
    })
    
    revalidatePath('/superadmin/gyms')
    revalidatePath('/admin', 'layout')
    return { success: true }
  } catch (err: any) {
    console.error(err)
    return { success: false, error: 'Failed to update subscription' }
  }
}
