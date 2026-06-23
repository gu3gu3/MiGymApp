import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { QrCode, Download, Printer } from "lucide-react"

import { headers } from "next/headers"

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
  
  // Usamos una API gratuita para generar el QR visualmente rápido
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(gymUrl)}&color=050505&bgcolor=ffffff`

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <QrCode className="w-8 h-8 text-purple-400" />
          Código QR del Gimnasio
        </h1>
        <p className="text-slate-400 mt-2">
          Muestra o imprime este código QR en tu recepción. Los atletas podrán escanearlo para ver tus planes y registrarse por sí mismos.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Decoración */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="z-10 bg-white p-6 rounded-2xl shadow-2xl mb-8">
          <img 
            src={qrCodeUrl} 
            alt={`QR Code para ${gym.name}`}
            className="w-64 h-64"
          />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">{gym.name}</h2>
        <p className="text-slate-400 mb-8 font-mono bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
          {gymUrl}
        </p>

        <div className="flex gap-4 z-10">
          <a 
            href={qrCodeUrl}
            download={`QR_${gym.slug}.png`}
            target="_blank"
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors"
          >
            <Download className="w-5 h-5" />
            Descargar QR
          </a>
          <button 
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
            // onClick={() => window.print()} // En un client component, pero esto es RSC. Lo dejamos visual por ahora.
          >
            <Printer className="w-5 h-5" />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  )
}
