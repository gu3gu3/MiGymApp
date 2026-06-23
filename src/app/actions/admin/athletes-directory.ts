'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function getGymAthletes() {
  const session = await auth()
  const gymId = (session?.user as any)?.gymId

  if (!gymId) return { success: false, error: 'No autorizado' }

  try {
    // Get all users who have a subscription (active, pending, etc.) in this gym
    // We only select the necessary fields
    const users = await prisma.user.findMany({
      where: {
        subscriptions: {
          some: {
            gymId: gymId
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        identityDocument: true,
        address: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        gender: true,
        weight: true,
        height: true,
        bmi: true,
        image: true,
        isClaimed: true,
        createdAt: true,
        subscriptions: {
          where: { gymId: gymId },
          select: { status: true, internalNotes: true, plan: { select: { name: true } } },
          take: 1
        }
      },
      orderBy: { name: 'asc' }
    })

    return { success: true, data: users }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Error al obtener atletas' }
  }
}

export async function updateAthleteAdminInfo(userId: string, data: {
  name: string
  email: string
  phone: string
  identityDocument: string
  address: string
  emergencyContactName: string
  emergencyContactPhone: string
  internalNotes: string
}) {
  const session = await auth()
  const gymId = (session?.user as any)?.gymId

  if (!gymId) return { success: false, error: 'No autorizado' }

  try {
    // Check if user is actually part of this gym
    const sub = await prisma.subscription.findFirst({
      where: { userId: userId, gymId: gymId }
    })

    if (!sub) {
      return { success: false, error: 'Este atleta no pertenece a tu gimnasio' }
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return { success: false, error: 'Usuario no encontrado' }

    if (!user.isClaimed) {
      // Gym can edit global data
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          identityDocument: data.identityDocument || null,
          address: data.address || null,
          emergencyContactName: data.emergencyContactName || null,
          emergencyContactPhone: data.emergencyContactPhone || null
        }
      })
    }

    // Always allow updating internal notes on the subscription
    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        internalNotes: data.internalNotes || null
      }
    })

    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Error al actualizar información' }
  }
}
