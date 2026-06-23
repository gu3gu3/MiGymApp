import { getGymAdmins } from "@/app/actions/superadmin/security"
import { ShieldCheck, LockKeyhole } from "lucide-react"
import { SecurityTableRow } from "@/components/superadmin/SecurityTableRow"
import { ChangeOwnPasswordForm } from "@/components/shared/ChangeOwnPasswordForm"

export const dynamic = 'force-dynamic'

export default async function SecurityPage() {
  const users = await getGymAdmins()

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase mb-4">
            <LockKeyhole className="w-4 h-4" /> Centro de Seguridad
          </div>
          <h1 className="text-4xl font-black text-white">Administración de Accesos</h1>
          <p className="text-slate-400 mt-2">Fuerza el reseteo de contraseñas para los administradores y entrenadores de la red.</p>
        </header>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950 border-b border-slate-800">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Correo</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rol</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Creado</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No hay usuarios registrados en la red.
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <SecurityTableRow key={user.id} user={user} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8">
          <ChangeOwnPasswordForm />
        </div>
      </div>
    </div>
  )
}
