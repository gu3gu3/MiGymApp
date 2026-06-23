'use server'

import { prisma } from "@/lib/prisma"

const XP_PER_CHECKIN = 50
const XP_FOR_NEXT_LEVEL = 1000

export async function processQRScan(qrData: string, gymId?: string) {
  try {
    // Para simplificar el prototipo, asumimos que qrData es el userId o email
    // En produccion seria un JWT validado
    
    const user = await prisma.user.findFirst({
      where: { OR: [{ id: qrData }, { email: qrData }] },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: true, gym: true }
        }
      }
    })

    if (!user) {
      return { success: false, message: 'Usuario no encontrado', user: { name: 'Desconocido', photoUrl: '', plan: 'N/A' } }
    }

    if (user.subscriptions.length === 0) {
      return { success: false, message: 'Sin suscripción activa', user: { name: user.name, photoUrl: user.image || '', plan: 'Plan Expirado' } }
    }

    const activeSub = user.subscriptions[0] // Tomamos la primera activa

    // 1. Validar Cooldown (1 dia)
    const lastCheckin = await prisma.checkIn.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    const now = new Date()
    let giveXP = true
    if (lastCheckin) {
      const diffHours = (now.getTime() - lastCheckin.createdAt.getTime()) / (1000 * 60 * 60)
      if (diffHours < 12) {
        giveXP = false // Ya ganó XP hoy
      }
    }

    // 2. Registrar CheckIn
    await prisma.checkIn.create({
      data: {
        gymId: activeSub.gymId,
        userId: user.id,
        subscriptionId: activeSub.id
      }
    })

    // 3. Otorgar XP y Nivel
    let newXp = user.xp
    let newLevel = user.level
    let leveledUp = false

    if (giveXP) {
      newXp += XP_PER_CHECKIN
      if (newXp >= newLevel * XP_FOR_NEXT_LEVEL) {
        newLevel += 1
        leveledUp = true
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { xp: newXp, level: newLevel }
      })

      // Sumar al Gym si está en torneo
      const activeCompetitions = await prisma.gymInCompetition.findMany({
        where: {
          gymId: activeSub.gymId,
          competition: { status: 'ACTIVE' }
        }
      })

      for (const comp of activeCompetitions) {
        await prisma.gymInCompetition.update({
          where: { id: comp.id },
          data: { score: comp.score + XP_PER_CHECKIN }
        })
      }
    }

    let msg = '¡Acceso Permitido!'
    if (leveledUp) msg = `¡Nivel ${newLevel} Alcanzado!`
    else if (giveXP) msg = `¡Acceso Permitido! +${XP_PER_CHECKIN} XP`

    return {
      success: true,
      message: msg,
      user: {
        name: user.name,
        photoUrl: user.image || '',
        plan: activeSub.plan.name
      }
    }

  } catch (error) {
    console.error(error)
    return { success: false, message: 'Error de Servidor', user: { name: 'Error', photoUrl: '', plan: '' } }
  }
}
