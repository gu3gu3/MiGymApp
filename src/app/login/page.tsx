import { LoginForm } from "@/components/auth/LoginForm"
import Image from "next/image"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="mb-8 z-10 flex flex-col items-center">
        <div className="w-24 h-24 mb-4 relative">
          <Image 
            src="/icon-192x192.png" 
            alt="MiGym Logo" 
            fill 
            className="object-contain drop-shadow-[0_0_15px_rgba(147,51,234,0.3)]"
          />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tighter">MiGym Staff</h1>
        <p className="text-slate-400 mt-2 text-sm text-center">Portal exclusivo para Administradores y Staff</p>
      </div>

      <div className="z-10 w-full flex justify-center">
        <LoginForm />
      </div>

      <div className="z-10 mt-8 text-center">
        <p className="text-slate-500 text-sm">
          ¿Eres un atleta buscando tu Wallet? <br/>
          <Link href="/wallet" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Ir al Portal de Atletas
          </Link>
        </p>
      </div>
    </div>
  )
}
