'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getPlatformPlans() {
  return await prisma.platformPlan.findMany({
    orderBy: { priceNio: 'asc' },
    include: {
      _count: { select: { gyms: true } }
    }
  })
}

export async function updatePlatformPlan(id: string, data: any) {
  try {
    await prisma.platformPlan.update({
      where: { id },
      data: {
        name: data.name,
        maxAthletes: data.maxAthletes ? parseInt(data.maxAthletes) : null,
        priceNio: parseFloat(data.priceNio),
        priceUsd: parseFloat(data.priceUsd)
      }
    })
    revalidatePath('/superadmin/plans')
    return { success: true }
  } catch (err: any) {
    console.error(err)
    return { success: false, error: 'Failed to update plan' }
  }
}

export async function createCustomPlan(data: any) {
  try {
    await prisma.platformPlan.create({
      data: {
        name: data.name,
        maxAthletes: data.maxAthletes ? parseInt(data.maxAthletes) : null,
        priceNio: parseFloat(data.priceNio || 0),
        priceUsd: parseFloat(data.priceUsd || 0),
        isCustom: true
      }
    })
    revalidatePath('/superadmin/plans')
    return { success: true }
  } catch (err: any) {
    console.error(err)
    return { success: false, error: 'Failed to create custom plan' }
  }
}
