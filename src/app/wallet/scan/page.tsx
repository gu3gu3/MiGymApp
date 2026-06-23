'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QrCode, ArrowLeft, Camera } from 'lucide-react'
import Link from 'next/link'
import { Scanner } from '@yudiel/react-qr-scanner'

export default function ScanQRPage() {
  const [slug, setSlug] = useState('')
  const router = useRouter()

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (slug.trim()) {
      router.push(`/gym/${slug.trim()}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] p-6 flex flex-col">
      <Link href="/wallet" className="text-slate-400 flex items-center gap-2 mb-8 hover:text-white transition-colors w-fit">
        <ArrowLeft className="w-5 h-5" />
        Volver a Wallet
      </Link>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Escanear Gimnasio</h1>
          <p className="text-slate-400">Escanea el código QR en la recepción para ver los planes disponibles.</p>
        </div>

        {/* Cámara / Escáner */}
        <div className="w-full aspect-square bg-slate-900 border-2 border-dashed border-cyan-500/50 rounded-3xl relative flex items-center justify-center mb-8 overflow-hidden group">
          <Scanner 
            onScan={(result) => {
              if (result && result.length > 0) {
                const text = result[0].rawValue;
                // Intentamos extraer el slug si escanean un enlace completo
                try {
                  const url = new URL(text)
                  const pathParts = url.pathname.split('/')
                  const gymIndex = pathParts.indexOf('gym')
                  if (gymIndex !== -1 && pathParts[gymIndex + 1]) {
                    setSlug(pathParts[gymIndex + 1])
                    router.push(`/gym/${pathParts[gymIndex + 1]}`)
                  } else {
                    setSlug(text)
                    router.push(`/gym/${text}`)
                  }
                } catch (e) {
                  // Si no es URL válida, asumimos que es directamente el slug
                  setSlug(text)
                  router.push(`/gym/${text}`)
                }
              }
            }}
            styles={{ container: { width: '100%', height: '100%' }, video: { objectFit: 'cover' } }}
          />
          
          {/* Esquinas de escáner superpuestas */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-cyan-400 z-10 pointer-events-none" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-cyan-400 z-10 pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-cyan-400 z-10 pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-cyan-400 z-10 pointer-events-none" />
        </div>

        <div className="w-full">
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-sm">o ingresa el código manual</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input 
              type="text" 
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Ej: iron-gym"
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
            <button 
              type="submit"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
