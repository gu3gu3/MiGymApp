'use server'

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export async function createAthleteAction(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const identityDocument = formData.get('identityDocument') as string
    const address = formData.get('address') as string
    const emergencyName = formData.get('emergencyName') as string
    const emergencyPhone = formData.get('emergencyPhone') as string
    const weight = formData.get('weight')
    const height = formData.get('height')
    const bmi = formData.get('bmi')
    const gender = formData.get('gender') as string | null
    const image = formData.get('image') as string | null
    
    // Check if email exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return { success: false, error: 'El email ya está registrado.' }
    }

    // Default password for new athletes: "123456"
    const hashedPassword = await bcrypt.hash("123456", 10)

    let finalWeight = weight ? parseFloat(weight as string) : null
    let finalHeight = height ? parseFloat(height as string) : null
    let finalBmi = bmi ? parseFloat(bmi as string) : null

    const activationToken = crypto.randomBytes(32).toString('hex')
    const activationExpires = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        identityDocument,
        address,
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyPhone,
        gender,
        weight: isNaN(finalWeight!) ? null : finalWeight,
        height: isNaN(finalHeight!) ? null : finalHeight,
        bmi: isNaN(finalBmi!) ? null : finalBmi,
        role: 'ATHLETE',
        image: image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        activationToken,
        activationExpires,
      }
    })

    const { auth } = await import("@/auth")
    const session = await auth()
    const gymId = (session?.user as any)?.gymId

    if (!gymId) {
      return { success: false, error: 'No tienes un gimnasio asignado.' }
    }

    const planId = formData.get('planId') as string
    if (planId && planId !== 'TRIAL') {
      const selectedPlan = await prisma.plan.findUnique({ where: { id: planId } })
      
      if (selectedPlan) {
        const offlineToken = crypto.randomBytes(32).toString('hex')
        const endDate = selectedPlan.type === 'TIME_BASED' && selectedPlan.durationDays 
          ? new Date(Date.now() + selectedPlan.durationDays * 24 * 60 * 60 * 1000) 
          : null

        await prisma.subscription.create({
          data: {
            userId: user.id,
            gymId: gymId,
            planId: selectedPlan.id,
            status: 'ACTIVE',
            offlineToken: offlineToken,
            startDate: new Date(),
            endDate: endDate,
            remainingTotal: selectedPlan.type === 'CREDIT_BASED' ? selectedPlan.totalCredits : null
          }
        })
      }
    }

    return { success: true, userId: user.id, activationToken }

  } catch (error: any) {
    console.error("Error creating athlete:", error)
    return { success: false, error: 'Error del servidor al registrar al atleta.' }
  }
}

export async function getAvailablePlans() {
  const { auth } = await import("@/auth")
  const session = await auth()
  const gymId = (session?.user as any)?.gymId

  if (!gymId) return []

  const plans = await prisma.plan.findMany({
    where: { isActive: true, gymId: gymId }
  })
  return plans.map(plan => ({
    id: plan.id,
    name: plan.name,
    price: Number(plan.price),
    currency: plan.currency
  }))
}
