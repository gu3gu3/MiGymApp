'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function updateWalletPassword(oldPassword: string, newPassword: string) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return { success: false, error: 'No autorizado' }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return { success: false, error: 'Usuario no encontrado' }

    // Validate old password if the user has a password set
    // If the user was created manually, they have a default password
    if (user.password) {
      const isValid = await bcrypt.compare(oldPassword, user.password)
      if (!isValid) return { success: false, error: 'La contraseña actual es incorrecta' }
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword, isClaimed: true }
    })

    return { success: true, message: 'Contraseña actualizada con éxito' }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Error interno del servidor' }
  }
}

export async function updateWalletPhoto(photoUrl: string) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return { success: false, error: 'No autorizado' }

    await prisma.user.update({
      where: { id: userId },
      data: { image: photoUrl }
    })

    revalidatePath('/wallet')
    revalidatePath('/wallet/profile')
    
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Error interno del servidor' }
  }
}

export async function updatePersonalProfile(data: {
  name: string
  phone: string
  identityDocument: string
  address: string
  emergencyContactName: string
  emergencyContactPhone: string
}) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return { success: false, error: 'No autorizado' }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone || null,
        identityDocument: data.identityDocument || null,
        address: data.address || null,
        emergencyContactName: data.emergencyContactName || null,
        emergencyContactPhone: data.emergencyContactPhone || null,
        // Since they are updating their own profile, we can confidently mark it as claimed
        isClaimed: true
      }
    })

    revalidatePath('/wallet/profile')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Error al actualizar perfil personal' }
  }
}
