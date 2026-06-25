'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function getGyms() {
  const session = await auth()
  const role = (session?.user as any)?.role
  
  if (role !== 'SUPER_ADMIN') {
    throw new Error('No autorizado')
  }

  const gyms = await prisma.gym.findMany({
    include: {
      platformPlan: true,
      staff: {
        where: { role: 'GYM_ADMIN' }
      },
      _count: {
        select: {
          subscriptions: true,
          sales: true,
          plans: true,
          products: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return gyms.map(gym => ({
    ...gym,
    platformPlan: gym.platformPlan ? {
      ...gym.platformPlan,
      priceUsd: Number(gym.platformPlan.priceUsd)
    } : null
  }))
}

export async function deleteGymCascade(gymId: string) {
  const session = await auth()
  const role = (session?.user as any)?.role
  
  if (role !== 'SUPER_ADMIN') {
    throw new Error('No autorizado')
  }

  try {
    const gym = await prisma.gym.findUnique({
      where: { id: gymId }
    })

    if (!gym) throw new Error('Gimnasio no encontrado')

    // 1. Encontrar a los atletas que *solo* pertenecen a este gimnasio
    // Un atleta se define porque tiene una suscripción a este gimnasio.
    // Si la cantidad total de sus suscripciones es 1, entonces solo pertenecen a este.
    const athletesOfThisGym = await prisma.user.findMany({
      where: {
        role: 'ATHLETE',
        subscriptions: {
          some: { gymId }
        }
      },
      include: {
        _count: {
          select: { subscriptions: true }
        }
      }
    })

    const athletesToDelete = athletesOfThisGym
      .filter(user => user._count.subscriptions === 1)
      .map(user => user.id)

    // 2. Transacción de Prisma para borrar en cascada
    await prisma.$transaction(async (tx) => {
      // a. Borrar CheckIns vinculados al gimnasio o a los atletas que vamos a borrar
      await tx.checkIn.deleteMany({
        where: {
          OR: [
            { gymId },
            { userId: { in: athletesToDelete } }
          ]
        }
      })

      // b. Borrar SaleItems de las ventas de este gimnasio
      await tx.saleItem.deleteMany({
        where: {
          sale: { gymId }
        }
      })

      // c. Borrar Ventas de este gimnasio
      await tx.sale.deleteMany({
        where: { gymId }
      })

      // d. Borrar Suscripciones
      await tx.subscription.deleteMany({
        where: { gymId }
      })

      // e. Borrar Planes y Productos
      await tx.plan.deleteMany({
        where: { gymId }
      })
      await tx.product.deleteMany({
        where: { gymId }
      })

      // f. Borrar Atletas (que ya no tienen dependencias problemáticas)
      if (athletesToDelete.length > 0) {
        // También borrar cuentas OAuth por si acaso
        await tx.account.deleteMany({
          where: { userId: { in: athletesToDelete } }
        })

        await tx.user.deleteMany({
          where: { id: { in: athletesToDelete } }
        })
      }

      // g. Borrar el Gimnasio
      await tx.gym.delete({
        where: { id: gymId }
      })

      // h. Borrar el GYM_ADMIN (Buscamos por el nombre por defecto 'Name Admin')
      const possibleAdminName = `${gym.name} Admin`
      const gymAdmin = await tx.user.findFirst({
        where: {
          role: 'GYM_ADMIN',
          name: possibleAdminName
        }
      })

      if (gymAdmin) {
        await tx.user.delete({
          where: { id: gymAdmin.id }
        })
      }
    })

    revalidatePath('/superadmin/gyms')
    revalidatePath('/superadmin/security')
    revalidatePath('/admin/gym-health')

    return { success: true }
  } catch (error: any) {
    console.error('Error al borrar gimnasio:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}
