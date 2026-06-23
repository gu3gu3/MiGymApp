'use client'

import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'

export function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e)
      // Update UI to notify the user they can add to home screen
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null)
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="mt-8 bg-cyan-900/30 border border-cyan-500/50 p-4 rounded-2xl w-full max-w-sm flex items-center justify-between shadow-lg animate-in slide-in-from-bottom-4">
      <div>
        <h4 className="text-white font-bold text-sm mb-1">Descargar MiGym</h4>
        <p className="text-xs text-slate-400">Instala la app para acceso rápido a tu Wallet.</p>
      </div>
      <button 
        onClick={handleInstallClick}
        className="bg-cyan-500 hover:bg-cyan-400 text-white p-2 rounded-xl transition-colors shrink-0 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]"
      >
        <Download className="w-5 h-5" />
      </button>
    </div>
  )
}
