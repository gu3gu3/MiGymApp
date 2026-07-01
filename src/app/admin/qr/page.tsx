import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { QrCode, Download, Printer } from "lucide-react"

import { headers } from "next/headers"
import GymQRClient from "./GymQRClient"

export default async function GymQRPage() {
  const session = await auth()
  const gymId = (session?.user as any)?.gymId

  if (!gymId) {
    return <div className="p-8 text-white">No tienes un gimnasio asignado.</div>
  }

  const gym = await prisma.gym.findUnique({
    where: { id: gymId }
  })

  if (!gym) {
    return <div className="p-8 text-white">Gimnasio no encontrado.</div>
  }

  // Obtenemos el host y el protocolo dinámicamente usando los headers para ser agnósticos a la IP/dominio
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = headersList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
  
  // Prioridad 1: Variable de Entorno. Prioridad 2: Host dinámico.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`
  const gymUrl = `${baseUrl}/gym/${gym.slug}`
  
  return <GymQRClient gymName={gym.name} gymUrl={gymUrl} gymLogoUrl={gym.logoUrl} />
}
