'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function toggleGymLock(gymId: string, lockedStatus: boolean) {
  const session = await auth()
  const role = (session?.user as any)?.role

  // Can be triggered by SUPER_ADMIN or GYM_ADMIN
  if (role !== 'SUPER_ADMIN' && role !== 'GYM_ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    await prisma.gym.update({
      where: { id: gymId },
      data: { isLocked: lockedStatus }
    })
    
    // Revalidate paths that depend on the lock
    revalidatePath('/admin', 'layout')
    return { success: true }
  } catch (err: any) {
    console.error(err)
    return { success: false, error: 'Failed to toggle lock' }
  }
}
