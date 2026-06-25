'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function updateGymAction(formData: FormData) {
  try {
    const session = await auth()
    const gymId = (session?.user as any)?.gymId

    if (!gymId) {
      return { success: false, error: 'No tienes un gimnasio asignado.' }
    }

    const name = formData.get('name') as string
    const logoUrl = formData.get('logoUrl') as string
    const bannerUrl = formData.get('bannerUrl') as string
    const teamColor = formData.get('teamColor') as string
    const currency = formData.get('currency') as string
    const exchangeRate = formData.get('exchangeRate')
    
    // New Geolocation Fields
    const address = formData.get('address') as string
    const country = formData.get('country') as string
    const department = formData.get('department') as string
    const latitude = formData.get('latitude')
    const longitude = formData.get('longitude')
    
    // Owner Fields
    const ownerName = formData.get('ownerName') as string
    const ownerPhone = formData.get('ownerPhone') as string

    await prisma.gym.update({
      where: { id: gymId },
      data: {
        ...(name && { name }),
        ...(logoUrl && { logoUrl }),
        ...(bannerUrl && { bannerUrl }),
        ...(teamColor && { teamColor }),
        ...(currency && { currency }),
        ...(exchangeRate && { exchangeRate: parseFloat(exchangeRate as string) }),
        ...(address !== null && { address }),
        ...(country && { country }),
        ...(department && { department }),
        ...(latitude && { latitude: parseFloat(latitude as string) }),
        ...(longitude && { longitude: parseFloat(longitude as string) })
      }
    })

    // Update Owner Info
    const owner = await prisma.user.findFirst({
      where: { gymId: gymId, role: 'GYM_ADMIN' }
    })

    if (owner && (ownerName || ownerPhone !== undefined)) {
      await prisma.user.update({
        where: { id: owner.id },
        data: {
          ...(ownerName && { name: ownerName }),
          ...(ownerPhone !== undefined && { phone: ownerPhone })
        }
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to update gym:', error)
    return { success: false, error: 'Ocurrió un error al actualizar el perfil.' }
  }
}

export async function getGymProfile() {
  const session = await auth()
  const gymId = (session?.user as any)?.gymId

  if (!gymId) {
    return null
  }

  return await prisma.gym.findUnique({
    where: { id: gymId },
    select: {
      name: true,
      logoUrl: true,
      bannerUrl: true,
      teamColor: true,
      currency: true,
      exchangeRate: true,
      address: true,
      country: true,
      department: true,
      latitude: true,
      longitude: true
    }
  })
}
