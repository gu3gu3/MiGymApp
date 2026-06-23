'use server'

import { prisma } from "@/lib/prisma"

export async function getRecentCheckIns() {
  try {
    const checkIns = await prisma.checkIn.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            identityDocument: true,
            phone: true
          }
        },
        subscription: {
          include: {
            plan: true
          }
        }
      }
    })
    
    // Convert Decimal to string/number for Next.js Client Boundary
    return checkIns.map(c => ({
      id: c.id,
      createdAt: c.createdAt,
      isOfflineSync: c.isOfflineSync,
      user: c.user,
      planName: c.subscription.plan.name
    }))
  } catch (error) {
    console.error("Error fetching checkins:", error)
    return []
  }
}
