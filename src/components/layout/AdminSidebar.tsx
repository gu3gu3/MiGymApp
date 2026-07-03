'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  QrCode, ClipboardList, ShoppingCart, Activity, User, 
  UserCheck, Trophy, Users, Settings, Shield, Menu, X
} from 'lucide-react'
import { SignOutButton } from '@/components/auth/SignOutButton'
import Image from 'next/image'

type UserData = {
  name?: string | null
  email?: string | null
}

export function AdminSidebar({ 
  gymName, 
  user, 
  role 
}: { 
  gymName: string, 
  user: UserData | null, 
  role: string 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  
  const isGymAdmin = role === 'GYM_ADMIN'

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <Image src="/icon-192x192.png" alt="MiGymApp" width={32} height={32} className="object-contain" />
          <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 text-xl tracking-tight">
            MiGymApp
          </span>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar Aside */}
      <aside 
        className={`fixed inset-y-0 left-0 w-72 md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
      >
        <div className="p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 flex items-center gap-2 tracking-tight">
              <Image src="/icon-192x192.png" alt="MiGymApp" width={28} height={28} className="object-contain" />
              MiGymApp
            </h2>
            <p className="text-xs text-slate-500 mt-1 uppercase font-semibold tracking-wider">{gymName}</p>
          </div>
          <button 
            className="md:hidden p-2 bg-slate-800 text-slate-400 rounded-lg hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar pb-4">
          {/* Enlaces Compartidos */}
          <Link href="/admin/gatekeeper" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${pathname === '/admin/gatekeeper' ? 'bg-slate-800 text-white border border-slate-700' : 'hover:bg-slate-800/50 hover:text-white text-slate-300'}`}>
            <QrCode className={`w-5 h-5 transition-colors ${pathname === '/admin/gatekeeper' ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'}`} />
            <span className="font-bold text-sm">Gatekeeper</span>
          </Link>
          <Link href="/admin/requests" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group relative ${pathname === '/admin/requests' ? 'bg-slate-800 text-white border border-slate-700' : 'hover:bg-slate-800/50 hover:text-white text-slate-300'}`}>
            <UserCheck className={`w-5 h-5 transition-colors ${pathname === '/admin/requests' ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400'}`} />
            <span className="font-bold text-sm">Solicitudes Web</span>
            <div className="absolute right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </Link>
          <Link href="/admin/qr" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${pathname === '/admin/qr' ? 'bg-slate-800 text-white border border-slate-700' : 'hover:bg-slate-800/50 hover:text-white text-slate-300'}`}>
            <QrCode className={`w-5 h-5 transition-colors ${pathname === '/admin/qr' ? 'text-purple-400' : 'text-slate-400 group-hover:text-purple-400'}`} />
            <span className="font-bold text-sm">QR del Gimnasio</span>
          </Link>
          <Link href="/admin/athletes" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${pathname === '/admin/athletes' ? 'bg-slate-800 text-white border border-slate-700' : 'hover:bg-slate-800/50 hover:text-white text-slate-300'}`}>
            <User className={`w-5 h-5 transition-colors ${pathname === '/admin/athletes' ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400'}`} />
            <span className="font-bold text-sm">Atletas (Registro)</span>
          </Link>
          <Link href="/admin/pos" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${pathname === '/admin/pos' ? 'bg-slate-800 text-white border border-slate-700' : 'hover:bg-slate-800/50 hover:text-white text-slate-300'}`}>
            <ShoppingCart className={`w-5 h-5 transition-colors ${pathname === '/admin/pos' ? 'text-orange-400' : 'text-slate-400 group-hover:text-orange-400'}`} />
            <span className="font-bold text-sm">Punto de Venta</span>
          </Link>

          {/* Enlaces Exclusivos de GYM_ADMIN */}
          {isGymAdmin && (
            <>
              <div className="pt-6 pb-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Gestión Avanzada</p>
              </div>
              <Link href="/admin/attendance" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${pathname === '/admin/attendance' ? 'bg-slate-800 text-white border border-slate-700' : 'hover:bg-slate-800/50 hover:text-white text-slate-300'}`}>
                <UserCheck className={`w-5 h-5 transition-colors ${pathname === '/admin/attendance' ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                <span className="font-bold text-sm">Asistencia</span>
              </Link>
              <Link href="/admin/gamification" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${pathname === '/admin/gamification' ? 'bg-slate-800 text-white border border-slate-700' : 'hover:bg-slate-800/50 hover:text-white text-slate-300'}`}>
                <Trophy className={`w-5 h-5 transition-colors ${pathname === '/admin/gamification' ? 'text-yellow-400' : 'text-slate-400 group-hover:text-yellow-400'}`} />
                <span className="font-bold text-sm">Gamificación</span>
              </Link>
              <Link href="/admin/builder" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${pathname === '/admin/builder' ? 'bg-slate-800 text-white border border-slate-700' : 'hover:bg-slate-800/50 hover:text-white text-slate-300'}`}>
                <ClipboardList className={`w-5 h-5 transition-colors ${pathname === '/admin/builder' ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                <span className="font-bold text-sm">Planes y Membresías</span>
              </Link>
              <Link href="/admin/staff" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${pathname === '/admin/staff' ? 'bg-slate-800 text-white border border-slate-700' : 'hover:bg-slate-800/50 hover:text-white text-slate-300'}`}>
                <Users className={`w-5 h-5 transition-colors ${pathname === '/admin/staff' ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                <span className="font-bold text-sm">Personal (Staff)</span>
              </Link>
              <Link href="/admin/inventory" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${pathname === '/admin/inventory' ? 'bg-slate-800 text-white border border-slate-700' : 'hover:bg-slate-800/50 hover:text-white text-slate-300'}`}>
                <ShoppingCart className={`w-5 h-5 transition-colors ${pathname === '/admin/inventory' ? 'text-orange-400' : 'text-slate-400 group-hover:text-orange-400'}`} />
                <span className="font-bold text-sm">Productos</span>
              </Link>
              <Link href="/admin/gym-health" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${pathname === '/admin/gym-health' ? 'bg-slate-800 text-white border border-slate-700' : 'hover:bg-slate-800/50 hover:text-white text-slate-300'}`}>
                <Activity className={`w-5 h-5 transition-colors ${pathname === '/admin/gym-health' ? 'text-pink-400' : 'text-slate-400 group-hover:text-pink-400'}`} />
                <span className="font-bold text-sm">Gym Health</span>
              </Link>
              <Link href="/admin/profile" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${pathname === '/admin/profile' ? 'bg-slate-800 text-white border border-slate-700' : 'hover:bg-slate-800/50 hover:text-white text-slate-300'}`}>
                <Settings className={`w-5 h-5 transition-colors ${pathname === '/admin/profile' ? 'text-slate-300' : 'text-slate-400 group-hover:text-slate-300'}`} />
                <span className="font-bold text-sm">Perfil del Gym</span>
              </Link>
              <Link href="/admin/subscription" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group border-t border-slate-800/50 mt-4 ${pathname === '/admin/subscription' ? 'bg-slate-800 text-white border-slate-700' : 'hover:bg-slate-800/50 hover:text-white text-slate-300'}`}>
                <Shield className={`w-5 h-5 transition-colors ${pathname === '/admin/subscription' ? 'text-purple-300' : 'text-purple-400 group-hover:text-purple-300'}`} />
                <span className="font-bold text-sm">Suscripción SaaS</span>
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/30">
          <div className="flex items-center gap-3 px-2 flex-1 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 text-white font-black flex items-center justify-center shrink-0 shadow-lg border border-cyan-500/30">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="text-sm truncate">
              <p className="font-bold text-white truncate leading-tight">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-slate-400 truncate uppercase tracking-widest">{user?.email || 'Recepción'}</p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>
    </>
  )
}
