'use server'

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function getPublicCompetitions() {
  return await prisma.competition.findMany({
    where: {
      status: { in: ['ACTIVE', 'BROADCASTING'] }
    },
    include: {
      sponsor: true,
      gymsParticipating: {
        include: { gym: true },
        orderBy: { score: 'desc' },
        take: 3 // Only show top 3 on landing page for hype
      }
    },
    orderBy: { startDate: 'desc' },
    take: 4 // Max 4 competitions on the landing page
  })
}

export async function registerGymNode(data: FormData) {
  try {
    const gymName = data.get('gymName') as string
    const email = data.get('email') as string
    const password = data.get('password') as string 
    const address = data.get('address') as string
    const ownerName = data.get('ownerName') as string
    const phone = data.get('phone') as string

    // 2. Assign default Platform Plan (Freemium)
    const freePlan = await prisma.platformPlan.findFirst({
      where: { name: 'Gratuito / Pilot' }
    })

    const gym = await prisma.gym.create({
      data: {
        name: gymName,
        slug: gymName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        address,
        platformPlanId: freePlan?.id,
        isLocked: true // Nuevos gimnasios nacen bloqueados, pendientes de aprobación
      }
    })

    // 2.5. Create Default Express Pass Product
    await prisma.product.create({
      data: {
        gymId: gym.id,
        name: 'Pase Express (1 Día)',
        price: 150, // Default price
        stock: 99999, // Infinite stock
      }
    })

    // 3. Create User (Gym Admin) linked to the gym
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: ownerName || (gymName + ' Admin'),
        phone: phone || null,
        role: 'GYM_ADMIN',
        gymId: gym.id
      }
    })

    return { success: true, gymId: gym.id }
  } catch (err: any) {
    console.error(err)
    if (err.code === 'P2002') {
      return { success: false, error: 'El correo electrónico ya está registrado.' }
    }
    return { success: false, error: 'Hubo un error al registrar el gimnasio.' }
  }
}
