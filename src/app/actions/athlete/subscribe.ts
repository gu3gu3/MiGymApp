'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { v4 as uuidv4 } from "uuid"

export async function requestSubscription(gymId: string, planId: string) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { error: "Debes iniciar sesión para solicitar una suscripción." }
    }

    // Double check if already exists
    const existing = await prisma.subscription.findFirst({
      where: {
        userId,
        gymId,
        planId,
        status: { in: ['ACTIVE', 'PENDING'] }
      }
    })

    if (existing) {
      return { error: "Ya tienes una solicitud o suscripción para este plan." }
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    })

    if (!plan) {
      return { error: "Plan no encontrado." }
    }

    // Create the PENDING subscription
    await prisma.subscription.create({
      data: {
        userId,
        gymId,
        planId,
        status: 'PENDING',
        offlineToken: uuidv4(), // Token that will be valid once active
        remainingTotal: plan.type === 'CREDIT_BASED' ? plan.totalCredits : null,
        // startDate is not really meaningful until ACTIVE, but schema has default(now())
      }
    })

    return { success: true }

  } catch (error) {
    console.error("Subscription request error:", error)
    return { error: "Ocurrió un error al procesar tu solicitud." }
  }
}
