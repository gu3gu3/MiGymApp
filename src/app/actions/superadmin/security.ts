'use server'

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function getGymAdmins() {
  const session = await auth()
  const role = (session?.user as any)?.role
  
  if (role !== 'SUPER_ADMIN') {
    throw new Error('No autorizado')
  }

  const users = await prisma.user.findMany({
    where: {
      role: {
        in: ['GYM_ADMIN', 'COACH']
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return users
}

export async function resetUserPassword(userId: string) {
  const session = await auth()
  const role = (session?.user as any)?.role
  
  if (role !== 'SUPER_ADMIN') {
    throw new Error('No autorizado')
  }

  // Generate a random secure 8-character temporary password
  const tempPassword = Math.random().toString(36).slice(-8)
  const hashedPassword = await bcrypt.hash(tempPassword, 10)

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword
    }
  })

  revalidatePath('/superadmin/security')

  return { success: true, newPassword: tempPassword }
}
