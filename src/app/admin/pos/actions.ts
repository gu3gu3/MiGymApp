'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export async function processSale(cart: { id: string, price: number, qty: number, itemType?: 'PRODUCT' | 'PLAN' }[], method: string, customerId?: string) {
  try {
    const session = await auth()
    const gymId = (session?.user as any)?.gymId
    if (!gymId) throw new Error('No estás asignado a un gimnasio')

    if (!cart || cart.length === 0) throw new Error('El carrito está vacío')

    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0)

    await prisma.$transaction(async (tx) => {
      // 1. Create Sale
      const sale = await tx.sale.create({
        data: {
          gymId,
          total,
          userId: customerId || null,
          type: 'POS_PHYSICAL',
        }
      })

      // 2. Create Sale Items and update Stock / Subscriptions
      for (const item of cart) {
        if (item.itemType === 'PLAN') {
          // This is a Plan Renewal/Sale
          const plan = await tx.plan.findUnique({ where: { id: item.id } })
          if (!plan) throw new Error(`El plan con ID ${item.id} no existe`)
          if (!customerId) throw new Error(`Debes asignar un cliente para renovar el plan ${plan.name}`)

          // Find existing subscription or create new
          const existingSub = await tx.subscription.findFirst({
            where: { userId: customerId, gymId, planId: item.id }
          })

          let newEndDate = existingSub?.endDate || new Date()
          // If the plan is time-based, add days
          if (plan.type === 'TIME_BASED' && plan.durationDays) {
            if (newEndDate < new Date()) newEndDate = new Date() // If expired, start from today
            newEndDate.setDate(newEndDate.getDate() + (plan.durationDays * item.qty))
          }

          let newCredits = existingSub?.remainingTotal || 0
          if (plan.type === 'CREDIT_BASED' && plan.totalCredits) {
            newCredits += (plan.totalCredits * item.qty)
          }

          if (existingSub) {
            await tx.subscription.update({
              where: { id: existingSub.id },
              data: {
                status: 'ACTIVE',
                endDate: plan.type === 'TIME_BASED' ? newEndDate : existingSub.endDate,
                remainingTotal: plan.type === 'CREDIT_BASED' ? newCredits : existingSub.remainingTotal
              }
            })
          } else {
            await tx.subscription.create({
              data: {
                userId: customerId,
                gymId,
                planId: item.id,
                status: 'ACTIVE',
                startDate: new Date(),
                endDate: plan.type === 'TIME_BASED' ? newEndDate : null,
                remainingTotal: plan.type === 'CREDIT_BASED' ? newCredits : null,
                offlineToken: crypto.randomBytes(32).toString('hex')
              }
            })
          }

          // Create SaleItem for the plan
          await tx.saleItem.create({
            data: {
              saleId: sale.id,
              planId: item.id,
              quantity: item.qty,
              price: item.price
            }
          })
        } else {
          // It's a Physical Product
          const product = await tx.product.update({
            where: { id: item.id },
            data: { stock: { decrement: item.qty } }
          })

          if (product.stock < 0) {
            throw new Error(`Stock insuficiente para ${product.name}`)
          }

          // Create SaleItem
          await tx.saleItem.create({
            data: {
              saleId: sale.id,
              productId: item.id,
              quantity: item.qty,
              price: item.price
            }
          })
        }
      }
    })

    revalidatePath('/admin/pos')
    revalidatePath('/admin/inventory')
    
    return { success: true }
  } catch (error: any) {
    console.error('Error procesando venta:', error)
    return { error: error.message || 'Error desconocido' }
  }
}

export async function getSalesHistory(year: number, month: number) {
  try {
    const session = await auth()
    const gymId = (session?.user as any)?.gymId
    if (!gymId) throw new Error('No estás asignado a un gimnasio')

    // Create start and end date for the selected month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    const sales = await prisma.sale.findMany({
      where: {
        gymId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: { 
            product: { select: { name: true } },
            plan: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Compute metrics
    const totalTransactions = sales.length
    const totalRevenue = sales.reduce((acc, sale) => acc + Number(sale.total), 0)
    const averageTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    // Compute top products
    // Compute top products / plans
    const productCounts: Record<string, number> = {}
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const itemName = item.product?.name || item.plan?.name
        if (itemName) {
          productCounts[itemName] = (productCounts[itemName] || 0) + item.quantity
        }
      })
    })

    const topProducts = Object.entries(productCounts)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    return { 
      success: true, 
      sales,
      metrics: {
        totalRevenue,
        totalTransactions,
        averageTicket,
        topProducts
      }
    }
  } catch (error: any) {
    console.error('Error fetching sales history:', error)
    return { error: error.message || 'Error desconocido' }
  }
}
