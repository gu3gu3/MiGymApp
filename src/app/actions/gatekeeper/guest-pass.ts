'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function getExpressPassProduct() {
  try {
    const session = await auth()
    const gymId = (session?.user as any)?.gymId
    if (!gymId) return null

    // Look for a Plan that represents a Day Pass instead of a Physical Product
    let plan = await prisma.plan.findFirst({
      where: { 
        gymId, 
        OR: [
          { name: { contains: 'Pase del Dia', mode: 'insensitive' } },
          { name: { contains: 'Express', mode: 'insensitive' } }
        ]
      }
    })

    // Fallback if they haven't created the plan yet
    if (!plan) {
      plan = await prisma.plan.create({
        data: {
          gymId,
          name: 'Pase del Día',
          price: 50,
          type: 'CREDIT_BASED',
          totalCredits: 1
        }
      })
    }

    return {
      id: plan.id,
      gymId: plan.gymId,
      name: plan.name,
      price: Number(plan.price),
      isActive: plan.isActive
    }
  } catch (error) {
    return null
  }
}

export async function createExpressGuestPass(data: { name?: string }) {
  try {
    const session = await auth()
    const gymId = (session?.user as any)?.gymId

    if (!session?.user?.id || !gymId) {
      return { success: false, message: 'No autorizado' }
    }

    const { name } = data

    // Asegurar que existe un plan de Pase Express
    let passPlan = await prisma.plan.findFirst({
      where: { 
        gymId, 
        OR: [
          { name: { contains: 'Pase del Dia', mode: 'insensitive' } },
          { name: { contains: 'Express', mode: 'insensitive' } }
        ]
      }
    })

    if (!passPlan) {
      passPlan = await prisma.plan.create({
        data: {
          gymId,
          name: 'Pase del Día',
          price: 50,
          type: 'CREDIT_BASED',
          totalCredits: 1
        }
      })
    }
    
    const actualPrice = Number(passPlan.price)

    // Ejecutar transacción: Venta + CheckIn
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear la Venta
      const sale = await tx.sale.create({
        data: {
          gymId,
          total: actualPrice,
          type: 'POS_PHYSICAL',
          items: {
            create: {
              planId: passPlan!.id,
              quantity: 1,
              price: actualPrice,
            }
          }
        }
      })

      // 2. Crear el CheckIn vinculado a la venta
      const checkIn = await tx.checkIn.create({
        data: {
          gymId,
          saleId: sale.id,
          guestName: name || 'Invitado',
        }
      })

      return { sale, checkIn }
    })

    return { 
      success: true, 
      message: 'Pase registrado', 
      user: { 
        name: result.checkIn.guestName || 'Invitado', 
        plan: 'Pase de 1 Día' 
      } 
    }

  } catch (error) {
    console.error('Error creating guest pass:', error)
    return { success: false, message: 'Error interno' }
  }
}
