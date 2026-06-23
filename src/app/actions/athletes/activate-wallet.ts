'use server'

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function validateActivationToken(token: string) {
  if (!token) return { success: false, error: 'Token inválido' }

  const user = await prisma.user.findUnique({
    where: { activationToken: token }
  })

  if (!user) {
    return { success: false, error: 'Este link de activación no existe o ya fue utilizado.' }
  }

  if (user.activationExpires && user.activationExpires < new Date()) {
    return { success: false, error: 'Este link de activación ha expirado. Por favor contacta a tu gimnasio.' }
  }

  return { success: true, user: { name: user.name, email: user.email } }
}

export async function activateWalletAction(formData: FormData) {
  try {
    const token = formData.get('token') as string
    const password = formData.get('password') as string

    if (!token || !password || password.length < 6) {
      return { success: false, error: 'Datos inválidos. La contraseña debe tener al menos 6 caracteres.' }
    }

    const user = await prisma.user.findUnique({
      where: { activationToken: token }
    })

    if (!user || (user.activationExpires && user.activationExpires < new Date())) {
      return { success: false, error: 'Link de activación inválido o expirado.' }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Update the user: set new password and clear the activation token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        activationToken: null,
        activationExpires: null,
        isClaimed: true
      }
    })

    // Return the email so we can perform a client-side sign-in
    return { success: true, email: user.email }

  } catch (error: any) {
    console.error("Error activating wallet:", error)
    return { success: false, error: 'Error del servidor al activar el Wallet.' }
  }
}
