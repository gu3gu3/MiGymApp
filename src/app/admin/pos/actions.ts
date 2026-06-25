'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function processSale(cart: { id: string, price: number, qty: number }[], method: string, customerId?: string) {
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

      // 2. Create Sale Items and update Stock
      for (const item of cart) {
        // Decrease stock
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
          include: { product: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Compute metrics
    const totalTransactions = sales.length
    const totalRevenue = sales.reduce((acc, sale) => acc + Number(sale.total), 0)
    const averageTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    // Compute top products
    const productCounts: Record<string, number> = {}
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (item.product?.name) {
          productCounts[item.product.name] = (productCounts[item.product.name] || 0) + item.quantity
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
