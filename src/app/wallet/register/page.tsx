import { WalletRegisterForm } from "@/components/wallet/auth/WalletRegisterForm"
import { Wallet } from "lucide-react"

export default function WalletRegisterPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="mb-8 z-10 flex flex-col items-center">
        <div className="w-16 h-16 bg-cyan-600/20 text-cyan-400 rounded-2xl flex items-center justify-center mb-4">
          <Wallet className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tighter">MiGym Wallet</h1>
      </div>

      <div className="z-10 w-full flex justify-center">
        <WalletRegisterForm />
      </div>
    </div>
  )
}
