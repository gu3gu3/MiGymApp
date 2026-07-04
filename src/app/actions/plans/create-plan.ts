'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function createPlanAction(formData: FormData) {
  try {
    const session = await auth()
    const gymId = (session?.user as any)?.gymId
    
    if (!gymId) {
      return { success: false, error: 'No tienes un gimnasio asignado.' }
    }

    const name = formData.get('name') as string
    const price = parseFloat(formData.get('price') as string)
    const type = formData.get('type') as 'TIME_BASED' | 'CREDIT_BASED'
    const currency = (formData.get('currency') as string) || 'NIO'

    let durationDays = null
    let totalCredits = null

    if (type === 'TIME_BASED') {
      const days = formData.get('durationDays')
      if (days) durationDays = parseInt(days as string)
    } else {
      const credits = formData.get('totalCredits')
      if (credits) totalCredits = parseInt(credits as string)
      const days = formData.get('durationDays') // vigencia de créditos
      if (days) durationDays = parseInt(days as string)
    }

    const plan = await prisma.plan.create({
      data: {
        gymId,
        name,
        price,
        currency,
        type,
        durationDays,
        totalCredits
      }
    })

    revalidatePath('/admin/builder')
    revalidatePath('/admin/athletes')

    return { success: true, planId: plan.id }
  } catch (error) {
    console.error("Error creating plan:", error)
    return { success: false, error: 'Hubo un error al guardar el plan.' }
  }
}

export async function disablePlanAction(planId: string) {
  try {
    // Verificar si hay suscripciones activas
    const activeCount = await prisma.subscription.count({
      where: {
        planId,
        status: 'ACTIVE'
      }
    })

    if (activeCount > 0) {
      return { 
        success: false, 
        error: `Hay ${activeCount} suscripción(es) activa(s) dependiendo de este plan. Espera a que expiren para deshabilitarlo.` 
      }
    }

    await prisma.plan.update({
      where: { id: planId },
      data: { isActive: false }
    })

    revalidatePath('/admin/builder')
    revalidatePath('/admin/athletes')
    return { success: true }
  } catch (error) {
    console.error("Error disabling plan:", error)
    return { success: false, error: 'Error al deshabilitar el plan.' }
  }
}

export async function updatePlanAction(planId: string, formData: FormData) {
  try {
    const name = formData.get('name') as string
    const price = parseFloat(formData.get('price') as string)
    const type = formData.get('type') as 'TIME_BASED' | 'CREDIT_BASED'
    const currency = (formData.get('currency') as string) || 'NIO'

    let durationDays = null
    let totalCredits = null

    if (type === 'TIME_BASED') {
      const days = formData.get('durationDays')
      if (days) durationDays = parseInt(days as string)
    } else {
      const credits = formData.get('totalCredits')
      if (credits) totalCredits = parseInt(credits as string)
      const days = formData.get('durationDays')
      if (days) durationDays = parseInt(days as string)
    }

    await prisma.plan.update({
      where: { id: planId },
      data: {
        name,
        price,
        currency,
        type,
        durationDays,
        totalCredits
      }
    })

    revalidatePath('/admin/builder')
    revalidatePath('/admin/athletes')
    return { success: true }
  } catch (error) {
    console.error("Error updating plan:", error)
    return { success: false, error: 'Error al actualizar el plan.' }
  }
}

export async function deletePlanAction(planId: string) {
  try {
    // Check if it's used in subscriptions or sales
    const activeSubCount = await prisma.subscription.count({
      where: { planId }
    })
    
    const saleItemCount = await prisma.saleItem.count({
      where: { planId }
    })

    if (activeSubCount > 0 || saleItemCount > 0) {
      return { 
        success: false, 
        error: `No se puede eliminar porque hay ${activeSubCount} suscripción(es) o ${saleItemCount} venta(s) asociadas. Por favor, deshabilita el plan en su lugar para mantener el historial.` 
      }
    }

    await prisma.plan.delete({
      where: { id: planId }
    })

    revalidatePath('/admin/builder')
    revalidatePath('/admin/athletes')
    return { success: true }
  } catch (error) {
    console.error("Error deleting plan:", error)
    return { success: false, error: 'Error al eliminar el plan.' }
  }
}

export async function enablePlanAction(planId: string) {
  try {
    await prisma.plan.update({
      where: { id: planId },
      data: { isActive: true }
    })

    revalidatePath('/admin/builder')
    revalidatePath('/admin/athletes')
    return { success: true }
  } catch (error) {
    console.error("Error enabling plan:", error)
    return { success: false, error: 'Error al habilitar el plan.' }
  }
}

export async function getGymPlans() {
  const session = await auth()
  const gymId = (session?.user as any)?.gymId
  
  if (!gymId) return []
  
  const plans = await prisma.plan.findMany({
    where: { gymId },
    orderBy: { createdAt: 'desc' }
  })
  
  return plans.map(p => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    currency: p.currency,
    type: p.type,
    durationDays: p.durationDays,
    totalCredits: p.totalCredits,
    isActive: p.isActive
  }))
}
