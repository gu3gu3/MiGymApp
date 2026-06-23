'use client'

import { useState } from 'react'
import { SubscriptionCard } from './SubscriptionCard'
import { AccessCodeModal } from './AccessCodeModal'
import { Dumbbell } from 'lucide-react'
import { MockSubscription } from '@/lib/walletStore'

interface WalletCarouselProps {
  user: { id: string; name: string; photoUrl: string }
  subscriptions: MockSubscription[]
}

export function WalletCarousel({ user, subscriptions }: WalletCarouselProps) {
  const [selectedSub, setSelectedSub] = useState<MockSubscription | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenQR = (sub: MockSubscription) => {
    setSelectedSub(sub)
    setIsModalOpen(true)
  }

  return (
    <div className="w-full max-w-md mx-auto py-8 overflow-hidden min-h-screen bg-slate-950">
      <div className="px-6 mb-8 mt-4">
        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 mb-6 shadow-inner">
          <Dumbbell className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Tu Billetera</h2>
        <p className="text-slate-400 text-sm font-medium">Desliza para ver tus pases de acceso</p>
      </div>

      {/* Contenedor del Carrusel (Scroll nativo con snap) */}
      <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-5 px-6 pb-12 pt-4">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="snap-center shrink-0">
            <SubscriptionCard 
              subscription={sub} 
              onGenerateQR={() => handleOpenQR(sub)} 
            />
          </div>
        ))}
      </div>

      <AccessCodeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subscription={selectedSub}
        user={user}
      />
    </div>
  )
}
