import Link from 'next/link'
import { QrCode, ClipboardList, ShoppingCart, Activity, User, UserCheck, Trophy, Users, Settings, Shield } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import { auth } from '@/auth'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { SupportChat } from '@/components/chat/SupportChat'
import { prisma } from '@/lib/prisma'
import { SaaSLockProvider } from '@/components/layout/SaaSLockProvider'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const user = session?.user as any
  const role = user?.role

  let gymName = 'MiGym App'
  let athleteCount = 0
  let maxAthletes: number | null = null
  let isLocked = false
  let planName = ''

  if (user?.gymId) {
    const gym = await prisma.gym.findUnique({
      where: { id: user.gymId },
      include: { platformPlan: true }
    })
    if (gym) {
      gymName = gym.name
      isLocked = gym.isLocked
      maxAthletes = gym.platformPlan?.maxAthletes || null
      planName = gym.platformPlan?.name || 'Gratuito'
      
      athleteCount = await prisma.user.count({
        where: { gymId: user.gymId, role: 'ATHLETE' }
      })
    }
  }

  const isGymAdmin = role === 'GYM_ADMIN'
  const isReceptionist = role === 'RECEPTIONIST'

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-20">
        <div className="p-6">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            ADMIN
          </h2>
          <p className="text-xs text-slate-500 mt-1 uppercase font-semibold tracking-wider">{gymName}</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          {/* Enlaces Compartidos (Recepcionista y Admin) */}
          <Link href="/admin/gatekeeper" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors group">
            <QrCode className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            <span className="font-medium">Gatekeeper</span>
          </Link>
          <Link href="/admin/requests" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors group relative">
            <UserCheck className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            <span className="font-medium">Solicitudes Web</span>
            <div className="absolute right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </Link>
          <Link href="/admin/qr" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors group">
            <QrCode className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
            <span className="font-medium">QR del Gimnasio</span>
          </Link>
          <Link href="/admin/athletes" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors group">
            <User className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
            <span className="font-medium">Atletas (Registro)</span>
          </Link>
          <Link href="/admin/pos" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors group">
            <ShoppingCart className="w-5 h-5 text-slate-400 group-hover:text-orange-400 transition-colors" />
            <span className="font-medium">Punto de Venta</span>
          </Link>

          {/* Enlaces Exclusivos de GYM_ADMIN */}
          {isGymAdmin && (
            <>
              <div className="pt-4 pb-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Gestión Avanzada</p>
              </div>
              <Link href="/admin/attendance" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors group">
                <UserCheck className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                <span className="font-medium">Asistencia</span>
              </Link>
              <Link href="/admin/gamification" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors group">
                <Trophy className="w-5 h-5 text-slate-400 group-hover:text-yellow-400 transition-colors" />
                <span className="font-medium">Gamificación</span>
              </Link>
              <Link href="/admin/builder" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors group">
                <ClipboardList className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                <span className="font-medium">Planes y Membresías</span>
              </Link>
              <Link href="/admin/staff" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors group">
                <Users className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                <span className="font-medium">Personal (Staff)</span>
              </Link>
              <Link href="/admin/gym-health" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors group">
                <Activity className="w-5 h-5 text-slate-400 group-hover:text-pink-400 transition-colors" />
                <span className="font-medium">Gym Health</span>
              </Link>
              <Link href="/admin/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors group">
                <Settings className="w-5 h-5 text-slate-400 group-hover:text-slate-300 transition-colors" />
                <span className="font-medium">Perfil del Gym</span>
              </Link>
              <Link href="/admin/subscription" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors group border-t border-slate-800 mt-2">
                <Shield className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                <span className="font-medium">Suscripción SaaS</span>
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 px-2 flex-1 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-cyan-600/20 text-cyan-400 font-bold flex items-center justify-center shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="text-sm truncate">
              <p className="font-bold text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || 'Recepción'}</p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-950 custom-scrollbar relative z-10">
        <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />
        <SaaSLockProvider 
          athleteCount={athleteCount} 
          maxAthletes={maxAthletes} 
          isLocked={isLocked} 
          planName={planName}
          role={role || 'RECEPTIONIST'}
        >
          {children}
        </SaaSLockProvider>
        <SupportChat />
      </main>
    </div>
  )
}
