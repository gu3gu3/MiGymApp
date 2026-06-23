'use server'
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getCompetitions() {
  const comps = await prisma.competition.findMany({
    include: {
      sponsor: true,
      gymsParticipating: {
        include: { gym: true },
        orderBy: { score: 'desc' }
      }
    },
    orderBy: { startDate: 'desc' }
  })
  return comps
}

export async function createCompetition(data: FormData) {
  try {
    const title = data.get('title') as string
    const description = data.get('description') as string
    const prize = data.get('prize') as string
    const minActiveUsers = parseInt(data.get('minActiveUsers') as string) || 0
    const startDate = new Date(data.get('startDate') as string)
    const endDate = new Date(data.get('endDate') as string)

    // Sponsor data
    const sponsorName = data.get('sponsorName') as string
    const sponsorLogo = data.get('sponsorLogo') as string
    const sponsorWebsite = data.get('sponsorWebsite') as string
    const promoOffer = data.get('promoOffer') as string
    const adBudget = parseFloat(data.get('adBudget') as string) || 0

    let sponsorId = null
    if (sponsorName) {
      const sponsor = await prisma.sponsor.create({
        data: {
          name: sponsorName,
          logoUrl: sponsorLogo || 'https://via.placeholder.com/150',
          websiteUrl: sponsorWebsite,
          promoOffer,
          adBudget
        }
      })
      sponsorId = sponsor.id
    }

    await prisma.competition.create({
      data: {
        title,
        description,
        prize,
        minActiveUsers,
        startDate,
        endDate,
        sponsorId,
        status: 'BROADCASTING'
      }
    })

    revalidatePath('/superadmin/broadcasting')
    revalidatePath('/admin/gamification')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Error al crear torneo' }
  }
}

export async function joinCompetition(competitionId: string) {
  try {
    const gym = await prisma.gym.findFirst()
    if (!gym) throw new Error("Gym not found")
    
    await prisma.gymInCompetition.create({
      data: {
        gymId: gym.id,
        competitionId,
        isConfirmed: true
      }
    })
    revalidatePath('/admin/gamification')
    return { success: true }
  } catch(err) {
    console.error(err)
    return { success: false, error: 'Error al unirse al torneo' }
  }
}

export async function getTopAthletes(gymId?: string) {
  const targetGym = gymId || (await prisma.gym.findFirst())?.id
  if (!targetGym) return []

  const users = await prisma.user.findMany({
    where: {
      subscriptions: { some: { gymId: targetGym, status: 'ACTIVE' } }
    },
    orderBy: { xp: 'desc' },
    take: 10,
    select: {
      id: true,
      name: true,
      xp: true,
      level: true,
      image: true
    }
  })
  return users
}

export async function findLocalGyms(searchTerm: string) {
  if (!searchTerm) return []
  const currentGym = await prisma.gym.findFirst()
  if (!currentGym) return []
  
  return await prisma.gym.findMany({
    where: {
      id: { not: currentGym.id },
      name: { contains: searchTerm, mode: 'insensitive' }
    },
    take: 5
  })
}

export async function challengeGym(targetGymId: string) {
  try {
    const currentGym = await prisma.gym.findFirst()
    if (!currentGym) throw new Error("Gym not found")
    
    // Create a 1v1 competition
    const targetGymObj = await prisma.gym.findUnique({ where: { id: targetGymId } })
    
    const comp = await prisma.competition.create({
      data: {
        title: `Reto Amistoso: ${currentGym.name} vs ${targetGymObj?.name}`,
        description: 'Match privado 1v1 entre gimnasios locales.',
        prize: 'Orgullo Local',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        status: 'ACTIVE'
      }
    })

    // Both join
    await prisma.gymInCompetition.createMany({
      data: [
        { gymId: currentGym.id, competitionId: comp.id, isConfirmed: true },
        { gymId: targetGymId, competitionId: comp.id, isConfirmed: false } // PENDING for the target
      ]
    })
    
    revalidatePath('/admin/gamification')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Error al enviar reto' }
  }
}
