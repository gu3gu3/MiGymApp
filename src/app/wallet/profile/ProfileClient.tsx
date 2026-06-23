'use client'

import { useState, useRef } from 'react'
import { updateWalletPassword, updateWalletPhoto } from '@/app/actions/wallet/profile'
import { Camera, Lock, User, RefreshCw, AlertCircle, Save, ArrowLeft, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { updatePersonalProfile } from '@/app/actions/wallet/profile'

type UserData = {
  name: string
  email: string
  photoUrl: string
  identityDocument: string | null
  phone: string | null
  address: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  gender: string | null
  weight: number | null
  height: number | null
  bmi: number | null
}

export function ProfileClient({ user }: { user: UserData }) {
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user.name,
    identityDocument: user.identityDocument || '',
    phone: user.phone || '',
    address: user.address || '',
    emergencyContactName: user.emergencyContactName || '',
    emergencyContactPhone: user.emergencyContactPhone || ''
  })
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [photoData, setPhotoData] = useState<string | null>(user.photoUrl)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    
    setIsUpdatingPassword(true)
    const res = await updateWalletPassword(oldPassword, newPassword)
    setIsUpdatingPassword(false)
    
    if (res.success) {
      toast.success(res.message || 'Contraseña actualizada')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      toast.error(res.error || 'Error al actualizar contraseña')
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingProfile(true)
    const res = await updatePersonalProfile(profileData)
    setIsUpdatingProfile(false)

    if (res.success) {
      toast.success('Perfil actualizado correctamente')
    } else {
      toast.error(res.error || 'Error al actualizar perfil')
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsCameraActive(true)
    } catch (err) {
      toast.error('No se pudo acceder a la cámara. Revisa los permisos.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      setIsCameraActive(false)
    }
  }

  const takePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      setPhotoData(dataUrl)
      stopCamera()
      
      // Auto save photo
      setIsUploadingPhoto(true)
      const res = await updateWalletPhoto(dataUrl)
      setIsUploadingPhoto(false)
      
      if (res.success) {
        toast.success('Foto de perfil actualizada')
      } else {
        toast.error('Error al guardar foto')
      }
    }
  }

  const retakePhoto = () => {
    setPhotoData(null)
    startCamera()
  }

  return (
    <div className="min-h-screen bg-[#050505] p-6 pb-24 text-white">
      <Link href="/wallet" className="inline-flex items-center gap-2 text-cyan-500 hover:text-cyan-400 font-bold mb-8 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Volver a mi Billetera
      </Link>
      
      <div className="max-w-xl mx-auto space-y-10">
        
        {/* Sección de Foto */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          
          <h2 className="text-xl font-bold text-white mb-6">Fotografía de Perfil</h2>
          
          <div className="relative mb-4">
            {!photoData ? (
              <div 
                onClick={!isCameraActive ? startCamera : takePhoto}
                className="w-40 h-40 rounded-full border-4 border-dashed border-slate-700 bg-slate-950 flex flex-col items-center justify-center hover:border-cyan-500 hover:bg-cyan-950/20 transition-all cursor-pointer overflow-hidden relative group shadow-xl"
              >
                {!isCameraActive ? (
                  <>
                    <Camera className="w-10 h-10 text-slate-500 mb-2 group-hover:text-cyan-400 transition-colors" />
                    <span className="text-xs font-bold text-slate-400 group-hover:text-cyan-400">Activar Cámara</span>
                  </>
                ) : (
                  <>
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-40 h-40 rounded-full border-4 border-cyan-500 bg-slate-950 overflow-hidden relative group shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoData} alt="Perfil" className="w-full h-full object-cover" />
                <div 
                  onClick={retakePhoto}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                >
                  <RefreshCw className="w-8 h-8 text-white" />
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          <p className="text-slate-400 text-sm text-center">
            {isUploadingPhoto ? 'Guardando foto...' : 'Toca para cambiar tu foto de acceso'}
          </p>
        </section>

        {/* Sección de Datos Personales (Editable) */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <ShieldCheck className="w-48 h-48 text-cyan-500" />
          </div>

          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <User className="text-emerald-400 w-5 h-5" /> Información Personal
          </h2>
          
          <div className="bg-cyan-950/30 border border-cyan-500/20 p-4 rounded-xl mb-6 flex items-start gap-3 relative z-10">
            <ShieldCheck className="text-cyan-400 w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs text-cyan-200/80 leading-relaxed">
              Tú eres el dueño de esta información. Al guardar cambios aquí, tu cuenta queda protegida y los administradores de gimnasios ya no podrán sobre-escribir estos datos sin tu permiso.
            </p>
          </div>

          <form onSubmit={handleProfileSubmit} className="relative z-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre Completo *</label>
                <input 
                  type="text" required
                  value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-950 rounded-xl text-white font-medium border border-slate-700 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Documento de Identidad</label>
                <input 
                  type="text" 
                  value={profileData.identityDocument} onChange={e => setProfileData({...profileData, identityDocument: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-950 rounded-xl text-white font-medium border border-slate-700 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Correo Electrónico (No editable)</label>
                <div className="px-4 py-3 bg-slate-950/50 rounded-xl text-slate-500 font-medium border border-white/5 cursor-not-allowed">
                  {user.email}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Teléfono / WhatsApp</label>
                <input 
                  type="text" 
                  value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-950 rounded-xl text-white font-medium border border-slate-700 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dirección Física</label>
                <input 
                  type="text" 
                  value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-950 rounded-xl text-white font-medium border border-slate-700 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contacto de Emergencia (Nombre)</label>
                <input 
                  type="text" 
                  value={profileData.emergencyContactName} onChange={e => setProfileData({...profileData, emergencyContactName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-950 rounded-xl text-white font-medium border border-slate-700 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contacto de Emergencia (Tel)</label>
                <input 
                  type="text" 
                  value={profileData.emergencyContactPhone} onChange={e => setProfileData({...profileData, emergencyContactPhone: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-950 rounded-xl text-white font-medium border border-slate-700 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={isUpdatingProfile}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 w-full sm:w-auto"
              >
                {isUpdatingProfile ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Guardar Datos Personales
              </button>
            </div>
          </form>

          {/* Biometrics (Still Read Only for now as they are metrics) */}
          <div className="mt-8 pt-8 border-t border-slate-800">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Métricas Base (IMC)</label>
              <div className="px-4 py-3 bg-slate-950/50 rounded-xl text-slate-300 font-medium border border-white/5 inline-flex items-center gap-4">
                <span>{user.weight ? `${user.weight}kg` : '? kg'} / {user.height ? `${user.height}cm` : '? cm'}</span>
                {user.bmi && <span className="px-2 py-0.5 bg-cyan-900/50 text-cyan-400 rounded-md text-xs font-bold">IMC: {user.bmi.toFixed(1)}</span>}
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Seguridad */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Lock className="text-blue-400 w-5 h-5" /> Seguridad
          </h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">Contraseña Actual</label>
              <input 
                type="password" required
                value={oldPassword} onChange={e => setOldPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Si te asignaron una cuenta, puede ser 123456"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">Nueva Contraseña</label>
              <input 
                type="password" required minLength={6}
                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">Confirmar Nueva Contraseña</label>
              <input 
                type="password" required minLength={6}
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isUpdatingPassword}
                className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isUpdatingPassword ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Guardar Nueva Contraseña
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
