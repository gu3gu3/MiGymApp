'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, ArrowRight, Activity, Users, ShieldCheck, Zap, ChevronDown, CheckCircle2 } from 'lucide-react'
import { registerGymNode } from '@/app/actions/public/landing'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export function LandingClient({ competitions }: { competitions: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    const res = await registerGymNode(formData)
    setIsSubmitting(false)
    
    if (res.success) {
      toast.success('¡Gimnasio Registrado con Éxito!')
      // Redirigir a gamification admin
      router.push('/admin/gamification')
    } else {
      toast.error(res.error || 'Error al registrar')
    }
  }

  const scrollToForm = () => {
    document.getElementById('register-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30 overflow-x-hidden custom-scrollbar">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[150px]"></div>
      </div>

      {/* Header Navigation */}
      <header className="absolute top-0 w-full z-50 px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3 text-white">
          <Image src="/icon-192x192.png" alt="MiGymApp Logo" width={44} height={44} className="object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
          <div className="flex flex-col justify-center translate-y-[2px]">
            <span className="font-black text-2xl tracking-tighter leading-none text-white">MiGymApp</span>
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1 opacity-90">Compite. Progresa. Gana.</span>
          </div>
        </div>
        <Link 
          href="/login" 
          className="px-6 py-2.5 bg-slate-900/50 hover:bg-slate-800 backdrop-blur-md border border-slate-700/50 rounded-full text-sm font-bold text-white transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        >
          Iniciar Sesión
        </Link>
      </header>

      {/* Hero Section */}
      <section 
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 text-center bg-cover bg-center"
        style={{ backgroundImage: "url('/images/heroBanner.png')" }}
      >
        <div className="absolute inset-0 bg-slate-950/80"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 mb-8 backdrop-blur-md">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-slate-300 tracking-wide uppercase">La Evolución del Fitness</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Únete a la Red de Gimnasios <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-yellow-400">
              Más Competitiva
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Convierte el entrenamiento de tus clientes en un juego adictivo. Compite contra otros gimnasios, consigue patrocinadores reales y retén a tus atletas con nuestro sistema de Gamificación y Puntos de Venta Integrado.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button 
              onClick={scrollToForm}
              className="px-8 py-4 w-full sm:w-auto bg-white text-slate-950 font-black rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105"
            >
              Registrar mi Gimnasio <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => document.getElementById('wall')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 w-full sm:w-auto bg-slate-900 border border-slate-800 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <Trophy className="w-5 h-5 text-yellow-400" /> Ver Competencias
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 animate-bounce cursor-pointer text-slate-500 hover:text-white transition-colors"
          onClick={() => document.getElementById('wall')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </section>

      {/* Muro de Competencias (Social Proof) */}
      <section 
        id="wall" 
        className="relative z-10 py-24 px-4 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/images/muroCompetencias.png')" }}
      >
        <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16 flex flex-col items-center">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Muro de Competencias</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Estas son las copas activas en la red. Gimnasios de todo el país están compitiendo por prestigio y premios de marcas top.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.length === 0 ? (
               <div className="col-span-full text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800">
                 <p className="text-slate-500">Aún no hay copas activas. ¡Sé el primer gimnasio en iniciar la liga!</p>
               </div>
            ) : (
              competitions.map((comp) => (
                <motion.div 
                  key={comp.id}
                  whileHover={{ y: -5 }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      {comp.status === 'BROADCASTING' && <span className="inline-block px-2 py-1 bg-purple-500/20 text-purple-400 text-[10px] font-bold uppercase rounded border border-purple-500/30 mb-2">Abierto a Retos</span>}
                      {comp.status === 'ACTIVE' && <span className="inline-block px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase rounded border border-emerald-500/30 mb-2">En Curso</span>}
                      <h3 className="text-xl font-bold text-white">{comp.title}</h3>
                    </div>
                    {comp.sponsor && (
                      <img src={comp.sponsor.logoUrl} className="w-10 h-10 object-contain bg-white rounded p-1" alt="Sponsor" />
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-xs text-slate-500 font-bold uppercase">Premio</p>
                    <p className="text-emerald-400 font-bold text-sm">{comp.prize || 'Prestigio'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase mb-2">Top Gimnasios ({comp.gymsParticipating.length})</p>
                    <div className="space-y-2">
                      {comp.gymsParticipating.slice(0, 3).map((g: any, i: number) => (
                        <div key={g.id} className="flex justify-between items-center bg-slate-950/50 p-2 rounded border border-slate-800">
                          <span className="text-sm font-semibold text-slate-300 truncate"><span className="text-slate-500 mr-2">#{i+1}</span> {g.gym.name}</span>
                          <span className="text-xs font-black text-cyan-400">{g.score}</span>
                        </div>
                      ))}
                      {comp.gymsParticipating.length === 0 && <p className="text-xs text-slate-600 italic">Esperando retadores...</p>}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Formulario de Registro (Onboarding) */}
      <section id="register-form" className="relative z-10 py-24 px-4">
        <div className="max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
          
          <div className="md:w-5/12 bg-gradient-to-br from-emerald-900 to-slate-900 p-10 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full"></div>
            <h2 className="text-3xl font-black text-white mb-6 relative z-10">Conecta tu Gym a la Red.</h2>
            <ul className="space-y-4 relative z-10">
              <li className="flex items-center gap-3 text-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Vende Suscripciones Digitales
              </li>
              <li className="flex items-center gap-3 text-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Gamifica los entrenamientos
              </li>
              <li className="flex items-center gap-3 text-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Compite por Sponsors
              </li>
              <li className="flex items-center gap-3 text-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> POS Integrado sin hardware extra
              </li>
            </ul>
          </div>

          <div className="md:w-7/12 p-10 bg-slate-900">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl font-bold text-white">Registro de Administrador</h3>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-3 py-1 rounded-full text-xs font-black uppercase shadow-[0_0_15px_rgba(16,185,129,0.2)]">100% Gratis</span>
            </div>
            <p className="text-slate-400 mb-8">Comienza Gratis (Hasta 25 Atletas). Escala cuando crezcas.</p>
            
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1">Nombre Comercial del Gimnasio</label>
                <input name="gymName" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="Ej. Iron Forge Fitness" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-1">Nombre Completo del Propietario</label>
                  <input name="ownerName" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="Ej. Juan Pérez" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-1">Teléfono (Propietario/Gym)</label>
                  <input name="phone" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="+505 8888 8888" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-1">Correo (Admin)</label>
                  <input name="email" type="email" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="admin@gym.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-1">Contraseña</label>
                  <input name="password" type="password" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="••••••••" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1">Dirección / Sede principal</label>
                <input name="address" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="Managua, Nicaragua" />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 mt-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-lg rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Registrando...' : 'Comenzar Ahora Mismo'} <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>

        </div>
      </section>

    </div>
  )
}
