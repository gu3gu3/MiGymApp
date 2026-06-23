import { validateActivationToken } from '@/app/actions/athletes/activate-wallet'
import { ActivationForm } from './ActivationForm'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

// Page props in Next.js 14+ may require handling searchParams as a Promise in Next.js 15,
// but in Next 14 they are direct objects. To be safe across versions, we can use an async function
// and handle it properly. Next.js 15 requires awaiting it.
type Props = {
  searchParams: Promise<{ token?: string }> | { token?: string }
}

export default async function WalletActivatePage({ searchParams }: Props) {
  // Await searchParams for Next 15 compatibility, works in 14 too if it's a promise,
  // but if it's just an object, Promise.resolve handles it safely.
  const resolvedParams = await Promise.resolve(searchParams)
  const token = resolvedParams.token

  if (!token) {
    return <ErrorState message="Enlace inválido. Por favor, asegúrate de haber escaneado el código QR correctamente o de haber hecho clic en el enlace completo enviado por tu gimnasio." />
  }

  const result = await validateActivationToken(token)

  if (!result.success || !result.user) {
    return <ErrorState message={result.error || "Este enlace no es válido o ha expirado."} />
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-cyan-900/20 to-transparent pointer-events-none" />
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="z-10 w-full">
        <ActivationForm token={token} userName={result.user.name} />
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 bg-red-500/10 rounded-full mx-auto flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Error de Activación</h2>
        <p className="text-slate-400 mb-8 leading-relaxed">
          {message}
        </p>
        <Link 
          href="/login"
          className="inline-flex items-center justify-center w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
        >
          Ir al Inicio de Sesión
        </Link>
      </div>
    </div>
  )
}
