'use client'

import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { SignOutButton } from '@/components/auth/SignOutButton'
import Link from 'next/link'
import Image from 'next/image'

interface ProfileHeaderProps {
  user: {
    name: string
    photoUrl: string
    xp: number
    level: number
  }
  gym?: {
    name?: string
    color?: string
  }
}

export function ProfileHeader({ user, gym }: ProfileHeaderProps) {
  // Lógica simple de progresión (ej. cada nivel requiere su nivel * 1000 de XP)
  const xpForNextLevel = user.level * 1000
  const progressPercent = Math.min(100, Math.max(0, (user.xp / xpForNextLevel) * 100))

  return (
    <div className="sticky top-0 z-40 w-full px-6 py-4 bg-slate-950/80 backdrop-blur-md border-b border-white/5 relative overflow-hidden">
      {/* Subtle Logo Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 opacity-[0.03] pointer-events-none">
        <Image src="/icon-192x192.png" alt="" fill className="object-contain" />
      </div>

      <div className="flex items-center gap-4 max-w-lg mx-auto relative z-10">
        <Link href="/wallet/profile" className="shrink-0">
          {/* Avatar */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-105 transition-transform"
          >
            {user.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-300">
                {user.name.charAt(0)}
              </div>
            )}
          </motion.div>
        </Link>

        {/* Info & Progress */}
        <div className="flex-1 min-w-0">
          <motion.div 
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col mb-1"
          >
            <div className="flex justify-between items-end">
              <Link href="/wallet/profile" className="hover:text-cyan-400 transition-colors truncate max-w-[65%]">
                <h1 className="text-lg font-bold text-white hover:text-cyan-400 transition-colors truncate">{user.name}</h1>
              </Link>
              <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded-full border border-cyan-500/20 shrink-0">
                <Trophy className="w-3 h-3" />
                <span>Nvl. {user.level}</span>
              </div>
            </div>
            {gym?.name && (
              <span className="text-[10px] uppercase font-bold tracking-wider mt-1" style={{ color: gym.color || '#94a3b8' }}>
                🛡️ Escudería: {gym.name}
              </span>
            )}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full"
          >
            <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-medium">
              <span>{user.xp} XP</span>
              <span>{xpForNextLevel} XP</span>
            </div>
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
              />
            </div>
          </motion.div>
        </div>

        {/* SignOut */}
        <div className="shrink-0">
          <SignOutButton />
        </div>
      </div>
    </div>
  )
}
