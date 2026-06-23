import { WalletLoginForm } from "@/components/wallet/auth/WalletLoginForm"
import { InstallPwaPrompt } from "@/components/wallet/InstallPwaPrompt"
import { Wallet } from "lucide-react"

import Image from "next/image"

export default function WalletLoginPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="mb-8 z-10 flex flex-col items-center animate-in slide-in-from-bottom-4 duration-700 fade-in">
        <div className="w-32 h-32 mb-6 relative">
          <Image 
            src="/icon-512x512.png" 
            alt="MiGym Wallet" 
            fill 
            className="object-contain drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]"
          />
        </div>
      </div>

      <div className="z-10 w-full flex flex-col items-center justify-center">
        <WalletLoginForm />
        <InstallPwaPrompt />
      </div>
    </div>
  )
}
