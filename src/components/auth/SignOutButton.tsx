'use client'

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"
import { usePathname } from "next/navigation"

export function SignOutButton() {
  const pathname = usePathname()

  return (
    <button 
      onClick={async () => {
        await signOut({ redirect: false })
        const redirectUrl = pathname.startsWith('/wallet') ? '/wallet/login' : '/login'
        window.location.href = redirectUrl
      }}
      className="flex items-center justify-center p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
      title="Cerrar Sesión"
    >
      <LogOut className="w-5 h-5" />
    </button>
  )
}
