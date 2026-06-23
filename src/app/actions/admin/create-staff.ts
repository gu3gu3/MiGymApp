'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

export async function createStaff(formData: FormData) {
  try {
    const session = await auth()
    const user = session?.user as any

    if (user?.role !== 'GYM_ADMIN' || !user?.gymId) {
      return { success: false, error: 'No autorizado' }
    }

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!name || !email || !password) {
      return { success: false, error: 'Todos los campos son requeridos' }
    }

    // Limit check: 1 staff per gym
    const staffCount = await prisma.user.count({
      where: {
        gymId: user.gymId,
        role: {
          not: 'GYM_ADMIN'
        }
      }
    })

    if (staffCount >= 1) {
      return { 
        success: false, 
        error: 'Has alcanzado el límite de personal para tu plan actual. Adquiere un Addon para agregar más.' 
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create RECEPTIONIST
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'RECEPTIONIST',
        gymId: user.gymId,
      }
    })

    revalidatePath('/admin/staff')
    return { success: true }
  } catch (err: any) {
    if (err.code === 'P2002') {
      return { success: false, error: 'El correo ya está registrado.' }
    }
    console.error('Error creating staff:', err)
    return { success: false, error: 'Error al registrar al operario.' }
  }
}
