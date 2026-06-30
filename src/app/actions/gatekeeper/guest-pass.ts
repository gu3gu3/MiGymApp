'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function getExpressPassProduct() {
  try {
    const session = await auth()
    const gymId = (session?.user as any)?.gymId
    if (!gymId) return null

    let product = await prisma.product.findFirst({
      where: { gymId, name: 'Pase Express (1 Día)' }
    })

    if (!product) {
      product = await prisma.product.create({
        data: {
          gymId,
          name: 'Pase Express (1 Día)',
          price: 150,
          stock: 99999, // Stock infinito
        }
      })
    }

    return {
      id: product.id,
      gymId: product.gymId,
      name: product.name,
      price: Number(product.price),
      costPrice: product.costPrice ? Number(product.costPrice) : null,
      stock: product.stock,
      minStock: product.minStock,
      photoUrl: product.photoUrl,
      isActive: product.isActive
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

    // Asegurar que existe un producto genérico de Pase Express para este gimnasio
    let passProduct = await prisma.product.findFirst({
      where: { gymId, name: 'Pase Express (1 Día)' }
    })

    if (!passProduct) {
      passProduct = await prisma.product.create({
        data: {
          gymId,
          name: 'Pase Express (1 Día)',
          price: 150,
          stock: 99999, // Stock infinito
        }
      })
    }
    
    const actualPrice = Number(passProduct.price)

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
              productId: passProduct.id,
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
