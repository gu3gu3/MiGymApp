'use client'

import { useState } from 'react'
import { createCompetition } from '@/app/actions/gamification/leaderboard'
import { Radio, Image as ImageIcon, Link as LinkIcon, DollarSign, Users, Award, Ticket } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SuperAdminBroadcasting() {
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsBroadcasting(true)
    const formData = new FormData(e.currentTarget)
    if (logoPreview) formData.set('sponsorLogo', logoPreview)
    
    // Simular el radar
    setTimeout(async () => {
      const res = await createCompetition(formData)
      setIsBroadcasting(false)
      if (res.success) {
        toast.success('¡Broadcasting Global Lanzado!', { icon: '📡' })
        ;(e.target as HTMLFormElement).reset()
        setLogoPreview(null)
      } else {
        toast.error(res.error || 'Error')
      }
    }, 2000)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    // En produccion se subiría a S3 y se pondría la URL real. Por ahora usamos base64.
    const file = e.dataTransfer?.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => setLogoPreview(event.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="bg-slate-950 p-8 custom-scrollbar relative">
      {/* Radar Overlay (Broadcasting Animation) */}
      {isBroadcasting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="relative flex items-center justify-center w-64 h-64">
            <div className="absolute w-full h-full border-4 border-emerald-500 rounded-full animate-ping opacity-20"></div>
            <div className="absolute w-3/4 h-3/4 border-4 border-emerald-500 rounded-full animate-ping opacity-40 delay-75"></div>
            <div className="absolute w-1/2 h-1/2 border-4 border-emerald-500 rounded-full animate-ping opacity-60 delay-150"></div>
            <Radio className="w-16 h-16 text-emerald-400 animate-pulse" />
            <p className="absolute -bottom-10 font-black text-emerald-400 text-xl tracking-widest uppercase">Transmitiendo a la Red...</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center gap-3">
            <Radio className="w-10 h-10 text-emerald-400" /> Originador de Eventos
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Crea torneos patrocinados y envíalos a todos los gimnasios de la franquicia.</p>
        </div>

        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Lado Izquierdo: Configuración del Torneo */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">Configuración de la Copa</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-1">Título del Evento</label>
                  <input name="title" required className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="Copa Whey Protein 2026" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-1">Descripción General</label>
                  <textarea name="description" required rows={3} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none" placeholder="El gimnasio que acumule más XP ganará el premio mayor..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1">Inicia</label>
                    <input type="datetime-local" name="startDate" required className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1">Finaliza</label>
                    <input type="datetime-local" name="endDate" required className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">Requisitos y Premio</h2>
              <div className="space-y-4">
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input name="minActiveUsers" type="number" required className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500" placeholder="Min. Usuarios Activos (Ej. 50)" />
                </div>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-500" />
                  <input name="prize" required className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500" placeholder="Premio para el Gym Ganador" />
                </div>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Sponsorship Spot */}
          <div className="space-y-6 flex flex-col">
            <div className="bg-slate-900 border border-emerald-900/50 rounded-2xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.05)] flex-1 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>
              
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">Sponsorship Spot</h2>
              <p className="text-sm text-slate-400 mb-6">Arrastra el logo y define el presupuesto de pauta de la marca.</p>

              <div 
                onDragOver={(e) => e.preventDefault()} 
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-700 rounded-xl flex-1 flex flex-col items-center justify-center p-6 text-center hover:border-emerald-500 transition-colors cursor-pointer bg-slate-950/50 group relative overflow-hidden"
              >
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="Sponsor Logo" className="absolute inset-0 w-full h-full object-contain p-4 bg-white" />
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-8 h-8 text-slate-400 group-hover:text-emerald-400" />
                    </div>
                    <p className="font-bold text-slate-300">Arrastra el Logo Aquí</p>
                    <p className="text-xs text-slate-500 mt-2">PNG, JPG transparente recomendado</p>
                  </>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <input name="sponsorName" required className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500" placeholder="Nombre de la Marca (Ej. Gatorade)" />
                
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input name="sponsorWebsite" className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500" placeholder="Sitio Web de la Tienda" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    <input name="adBudget" type="number" required className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500" placeholder="Pauta ($)" />
                  </div>
                  <div className="relative">
                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
                    <input name="promoOffer" className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500" placeholder="Promo (Ej. WHEY20)" />
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white font-black text-lg rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
            >
              <Radio className="w-6 h-6" /> Lanzar Broadcasting
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
