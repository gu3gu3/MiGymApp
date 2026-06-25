import Link from 'next/link'
import { QrCode, ClipboardList, ShoppingCart, Activity, User, UserCheck, Trophy, Users, Settings, Shield } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import { auth } from '@/auth'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { SupportChat } from '@/components/chat/SupportChat'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
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
      <AdminSidebar gymName={gymName} user={user} role={role} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-950 custom-scrollbar relative z-10 pt-16 md:pt-0">
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
