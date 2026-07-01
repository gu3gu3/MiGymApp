'use server'

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function resetStaffPassword(targetUserId: string) {
  const session = await auth()
  const callerId = session?.user?.id
  const callerRole = (session?.user as any)?.role

  if (!callerId) {
    return { success: false, error: 'No autorizado' }
  }

  // 1. Verificar que el que llama es GYM_ADMIN
  if (callerRole !== 'GYM_ADMIN') {
    return { success: false, error: 'Solo administradores de gimnasio pueden resetear contraseñas del staff' }
  }

  // 2. Obtener el gimnasio del administrador
  const adminUser = await prisma.user.findUnique({
    where: { id: callerId },
    select: { gymId: true }
  })

  if (!adminUser?.gymId) {
    return { success: false, error: 'No tienes un gimnasio asignado' }
  }

  // 3. Verificar que el usuario objetivo existe, es parte del staff, y pertenece al mismo gimnasio
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { gymId: true, role: true }
  })

  if (!targetUser) {
    return { success: false, error: 'Usuario no encontrado' }
  }

  if (targetUser.role !== 'RECEPTIONIST' && targetUser.role !== 'COACH') {
    return { success: false, error: 'Solo puedes resetear la contraseña del staff operativo' }
  }

  if (targetUser.gymId !== adminUser.gymId) {
    return { success: false, error: 'Este usuario no pertenece a tu gimnasio' }
  }

  // 4. Generar contraseña temporal segura
  const tempPassword = Math.random().toString(36).slice(-8)
  const hashedPassword = await bcrypt.hash(tempPassword, 10)

  // 5. Actualizar la base de datos
  await prisma.user.update({
    where: { id: targetUserId },
    data: {
      password: hashedPassword
    }
  })

  revalidatePath('/admin/staff')

  return { success: true, newPassword: tempPassword }
}
