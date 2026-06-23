import Link from 'next/link'
import { Activity, ShieldCheck, Settings, Radio, LockKeyhole, Building2 } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import { auth } from '@/auth'
import { SignOutButton } from '@/components/auth/SignOutButton'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const user = session?.user

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            SUPER
          </h2>
          <p className="text-xs text-slate-500 mt-1 uppercase font-semibold tracking-wider">Originador B2B</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/superadmin/plans" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors group">
            <Settings className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
            <span className="font-medium">SaaS Pricing</span>
          </Link>
          <Link href="/superadmin/gyms" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors group">
            <Building2 className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
            <span className="font-medium">Gimnasios</span>
          </Link>
          <Link href="/superadmin/broadcasting" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors group">
            <Radio className="w-5 h-5 text-slate-400 group-hover:text-pink-400 transition-colors" />
            <span className="font-medium">Broadcasting Hub</span>
          </Link>
          <Link href="/superadmin/security" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors group">
            <LockKeyhole className="w-5 h-5 text-slate-400 group-hover:text-rose-400 transition-colors" />
            <span className="font-medium">Seguridad</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 px-2 flex-1 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 font-bold flex items-center justify-center shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'S'}
            </div>
            <div className="text-sm truncate">
              <p className="font-bold text-white truncate">{user?.name || 'Super Admin'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || 'Originador'}</p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-950 custom-scrollbar">
        <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />
        {children}
      </main>
    </div>
  )
}
