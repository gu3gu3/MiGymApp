import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import GymProfileClient from "./GymProfileClient"

export default async function GymProfilePage() {
  const session = await auth()
  const gymId = (session?.user as any)?.gymId

  if (!gymId) {
    return <div className="p-8 text-white">No tienes un gimnasio asignado.</div>
  }

  const gym = await prisma.gym.findUnique({
    where: { id: gymId }
  })

  const owner = await prisma.user.findFirst({
    where: { gymId: gymId, role: 'GYM_ADMIN' }
  })

  return <GymProfileClient initialGym={gym} ownerName={owner?.name || 'Desconocido'} ownerPhone={owner?.phone || ''} />
}
