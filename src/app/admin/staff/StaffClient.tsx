'use client'

import { useState } from 'react'
import { Users, UserPlus, Shield, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { createStaff } from '@/app/actions/admin/create-staff'
import { resetStaffPassword } from '@/app/actions/admin/security'
import { PasswordResetButton } from '@/components/shared/PasswordResetButton'

export default function StaffClient({ staff, isLimitReached }: { staff: any[], isLimitReached?: boolean }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const result = await createStaff(formData)

    if (result.success) {
      toast.success('Operario registrado con éxito.')
      ;(e.target as HTMLFormElement).reset()
    } else {
      toast.error(result.error || 'Ocurrió un error al registrar al operario.')
    }
    
    setIsSubmitting(false)
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <header className="mb-10 border-b border-slate-800 pb-6 flex justify-between items-end">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase mb-4">
            <Shield className="w-4 h-4" /> Personal Operativo
          </div>
          <h1 className="text-4xl font-black text-white">Gestión de Staff</h1>
          <p className="text-slate-400 mt-2">Administra los accesos de los operarios y recepcionistas de tu gimnasio.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de Creación */}
        <div className="lg:col-span-1">
          {isLimitReached ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 shadow-xl sticky top-8">
              <div className="flex items-center gap-3 mb-4 text-amber-500">
                <Shield className="w-6 h-6" />
                <h2 className="text-lg font-bold">Límite Alcanzado</h2>
              </div>
              <p className="text-amber-200/80 text-sm mb-6 leading-relaxed">
                Has alcanzado el límite de 1 miembro de staff (Gatekeeper) para tu plan actual.
              </p>
              <button className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
                Mejorar Plan / Addons
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateStaff} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-8">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <UserPlus className="text-indigo-400" />
                Nuevo Operario
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Nombre Completo</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Correo Electrónico</label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="juan@gimnasio.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Contraseña de Acceso</label>
                  <input 
                    type="password" 
                    name="password" 
                    required 
                    minLength={6}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Registrar Cuenta'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Lista de Personal */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="text-indigo-400" /> 
                Personal Registrado
              </h2>
              <span className="bg-indigo-950 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold border border-indigo-900">
                {staff.length} Operarios
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950 border-b border-slate-800">
                  <tr>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rol</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha de Creación</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {staff.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">
                        No has registrado personal operativo aún.
                      </td>
                    </tr>
                  ) : (
                    staff.map(user => (
                      <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{user.name}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Recepción / Operario
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-slate-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="p-4 text-right">
                          <PasswordResetButton 
                            userEmail={user.email} 
                            onReset={async () => await resetStaffPassword(user.id)} 
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
