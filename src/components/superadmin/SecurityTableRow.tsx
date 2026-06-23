'use client'

import { resetUserPassword } from '@/app/actions/superadmin/security'
import { PasswordResetButton } from '@/components/shared/PasswordResetButton'

type Props = {
  user: {
    id: string
    name: string
    email: string
    role: string
    createdAt: Date
  }
}

export function SecurityTableRow({ user }: Props) {
  const handleReset = async () => {
    return await resetUserPassword(user.id)
  }

  return (
    <tr className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors">
      <td className="p-4 text-sm text-slate-300">{user.name}</td>
      <td className="p-4 text-sm text-slate-300 font-mono">{user.email}</td>
      <td className="p-4 text-sm">
        <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold">
          {user.role}
        </span>
      </td>
      <td className="p-4 text-sm text-slate-400">
        {user.createdAt.toLocaleDateString()}
      </td>
      <td className="p-4 text-sm text-right">
        <PasswordResetButton userEmail={user.email} onReset={handleReset} />
      </td>
    </tr>
  )
}
