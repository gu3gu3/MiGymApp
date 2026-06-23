'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function approveSubscription(subscriptionId: string) {
  try {
    const session = await auth()
    const role = (session?.user as any)?.role
    const gymId = (session?.user as any)?.gymId

    if (!['GYM_ADMIN', 'RECEPTIONIST'].includes(role) || !gymId) {
      return { error: "No tienes permisos." }
    }

    const sub = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true }
    })

    if (!sub || sub.gymId !== gymId) {
      return { error: "Suscripción no encontrada." }
    }

    if (sub.status !== 'PENDING') {
      return { error: "La suscripción no está pendiente." }
    }

    const now = new Date()
    let endDate = null

    if (sub.plan.type === 'TIME_BASED' && sub.plan.durationDays) {
      endDate = new Date(now)
      endDate.setDate(endDate.getDate() + sub.plan.durationDays)
    }

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'ACTIVE',
        startDate: now,
        endDate: endDate
      }
    })

    revalidatePath('/admin/requests')
    return { success: true }
  } catch (error) {
    console.error("Approve sub error:", error)
    return { error: "Error al aprobar la suscripción." }
  }
}
