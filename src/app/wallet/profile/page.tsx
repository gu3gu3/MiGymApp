import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ProfileClient } from "./ProfileClient"

export default async function WalletProfilePage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect('/wallet/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      image: true,
      identityDocument: true,
      phone: true,
      address: true,
      emergencyContactName: true,
      emergencyContactPhone: true,
      gender: true,
      weight: true,
      height: true,
      bmi: true
    }
  })

  if (!user) {
    redirect('/wallet/login')
  }

  return (
    <ProfileClient user={{
      name: user.name,
      email: user.email,
      photoUrl: user.image || '',
      identityDocument: user.identityDocument,
      phone: user.phone,
      address: user.address,
      emergencyContactName: user.emergencyContactName,
      emergencyContactPhone: user.emergencyContactPhone,
      gender: user.gender,
      weight: user.weight,
      height: user.height,
      bmi: user.bmi
    }} />
  )
}
