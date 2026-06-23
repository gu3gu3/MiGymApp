'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Camera, RefreshCw, CreditCard, MapPin, LocateFixed } from 'lucide-react'
import toast from 'react-hot-toast'
import { updateGymAction } from '@/app/actions/gym/update-gym'
import { Country, State } from 'country-state-city'
import { ChangeOwnPasswordForm } from '@/components/shared/ChangeOwnPasswordForm'

export default function GymProfileClient({ initialGym, ownerName }: { initialGym: any, ownerName?: string }) {
  const [formData, setFormData] = useState({
    name: initialGym?.name || '',
    logoUrl: initialGym?.logoUrl || '',
    bannerUrl: initialGym?.bannerUrl || '',
    teamColor: initialGym?.teamColor || '#06b6d4',
    currency: initialGym?.currency || 'NIO',
    exchangeRate: initialGym?.exchangeRate || 1.0,
    address: initialGym?.address || '',
    country: initialGym?.country || 'NI', // ISO2 code
    department: initialGym?.department || '',
    latitude: initialGym?.latitude || '',
    longitude: initialGym?.longitude || ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  // Derived arrays
  const allCountries = Country.getAllCountries()
  const availableStates = State.getStatesOfCountry(formData.country)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'bannerUrl' | 'logoUrl') => {
    const file = e.target.files?.[0]
    if (!file) return

    const setUploading = field === 'bannerUrl' ? setIsUploadingBanner : setIsUploadingLogo
    setUploading(true)

    const uploadData = new FormData()
    uploadData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData
      })
      
      const data = await res.json()
      if (res.ok && data.url) {
        setFormData(prev => ({ ...prev, [field]: data.url }))
        toast.success('Imagen cargada')
      } else {
        toast.error(data.error || 'Error al subir la imagen')
      }
    } catch (err) {
      toast.error('Error de conexión al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización')
      return
    }
    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }))
        setIsGettingLocation(false)
        toast.success('Ubicación capturada')
      },
      (error) => {
        setIsGettingLocation(false)
        toast.error('No se pudo obtener la ubicación. Revisa los permisos.')
      }
    )
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const fd = new FormData()
    fd.append('name', formData.name)
    fd.append('logoUrl', formData.logoUrl)
    fd.append('bannerUrl', formData.bannerUrl)
    fd.append('teamColor', formData.teamColor)
    fd.append('currency', formData.currency)
    fd.append('exchangeRate', formData.exchangeRate.toString())
    fd.append('address', formData.address)
    fd.append('country', formData.country)
    fd.append('department', formData.department)
    if (formData.latitude) fd.append('latitude', formData.latitude.toString())
    if (formData.longitude) fd.append('longitude', formData.longitude.toString())
    
    const res = await updateGymAction(fd)
    if (res.success) {
      toast.success('Perfil actualizado correctamente')
    } else {
      toast.error(res.error || 'Error al guardar')
    }
    setIsSubmitting(false)
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full h-full overflow-y-auto custom-scrollbar">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="pb-10"
      >
        {/* SETTINGS CONTENT */}
        <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl w-full">
          <div className="p-6 border-b border-slate-800 bg-slate-950">
            <h2 className="text-xl font-black text-white flex items-center gap-2"><Settings className="text-cyan-400"/> Identidad de la Marca</h2>
            <p className="text-slate-400 text-sm mt-1">Configura el logo, banner y color corporativo que tus atletas verán en su Wallet.</p>
          </div>
          
          <div className="p-6 space-y-8 border-b border-slate-800">
            {/* Banner Upload */}
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Banner (Competencias y Wallet Top)</label>
              <div className="relative w-full h-40 rounded-xl bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden group hover:border-cyan-500 transition-colors">
                {isUploadingBanner && (
                  <div className="absolute inset-0 bg-slate-900/80 z-10 flex flex-col items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mb-2" />
                    <span className="text-sm font-bold text-cyan-400">Subiendo...</span>
                  </div>
                )}
                {formData.bannerUrl ? (
                  <img src={formData.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-500 flex flex-col items-center"><Camera className="mb-2 w-8 h-8"/> Clic para seleccionar imagen</div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileUpload(e, 'bannerUrl')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">Recomendado: 1200x400px o 1920x640px (Formato horizontal JPG/PNG, máx 2MB)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Logo Escudo</label>
                <div className="relative w-32 h-32 rounded-3xl bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden shadow-lg group hover:border-cyan-500 transition-colors">
                  {isUploadingLogo && (
                    <div className="absolute inset-0 bg-slate-900/80 z-10 flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                    </div>
                  )}
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-500 font-bold text-3xl">{formData.name ? formData.name.substring(0,2).toUpperCase() : 'GM'}</div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload(e, 'logoUrl')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">Recomendado: 512x512px (PNG transparente)</p>
              </div>

              {/* Name and Color */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Nombre del Gimnasio</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Color Corporativo (Hex)</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={formData.teamColor} onChange={e => setFormData({...formData, teamColor: e.target.value})} className="w-12 h-12 rounded border-0 bg-transparent cursor-pointer" />
                    <input type="text" value={formData.teamColor} onChange={e => setFormData({...formData, teamColor: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none font-mono uppercase" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* UBICACION Y GEOGRAFIA */}
          <div className="p-6 bg-slate-900 border-t border-slate-800">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><MapPin className="text-rose-400 w-5 h-5"/> Ubicación y Geografía</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">País</label>
                <select 
                  value={formData.country} 
                  onChange={e => setFormData({...formData, country: e.target.value, department: ''})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none"
                >
                  <option value="">Selecciona País...</option>
                  {allCountries.map(c => (
                    <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Estado / Departamento</label>
                <select 
                  value={formData.department} 
                  onChange={e => setFormData({...formData, department: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none disabled:opacity-50"
                  disabled={!formData.country}
                >
                  <option value="">Selecciona Departamento...</option>
                  {availableStates.map(s => (
                    <option key={s.isoCode} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-400 mb-2">Dirección Física</label>
              <textarea 
                rows={2}
                value={formData.address} 
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none resize-none"
                placeholder="Dirección exacta de la sucursal..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 flex items-center justify-between">
                <span>Coordenadas GPS (Para Matchmaking)</span>
                <button 
                  type="button" 
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  className="text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
                >
                  {isGettingLocation ? <RefreshCw className="w-3 h-3 animate-spin"/> : <LocateFixed className="w-3 h-3"/>}
                  Obtener mi ubicación actual
                </button>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" 
                  readOnly 
                  placeholder="Latitud"
                  value={formData.latitude} 
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-slate-400 outline-none" 
                />
                <input 
                  type="text" 
                  readOnly 
                  placeholder="Longitud"
                  value={formData.longitude} 
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-slate-400 outline-none" 
                />
              </div>
            </div>
          </div>

          {/* INFO ADMINISTRATIVA */}
          <div className="p-6 bg-slate-900/50">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><CreditCard className="text-indigo-400 w-5 h-5"/> Información Administrativa y Financiera</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Propietario</label>
                <input type="text" readOnly value={ownerName || ''} className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-slate-500 outline-none font-bold cursor-not-allowed" />
                <p className="text-xs text-slate-500 mt-1">Usuario GYM_ADMIN</p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Moneda Principal</label>
                <select 
                  value={formData.currency} 
                  onChange={e => setFormData({...formData, currency: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none"
                >
                  <option value="NIO">NIO (Córdobas)</option>
                  <option value="USD">USD (Dólares)</option>
                  <option value="EUR">EUR (Euros)</option>
                  <option value="MXN">MXN (Pesos Mexicanos)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Tasa de Cambio a USD</label>
                <input 
                  type="number" 
                  step="0.01" 
                  required 
                  value={formData.exchangeRate} 
                  onChange={e => setFormData({...formData, exchangeRate: parseFloat(e.target.value) || 1})} 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none font-bold" 
                />
                <p className="text-xs text-slate-500 mt-1">Ej. 36.60 (NIO) / 1 (USD)</p>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-800 bg-slate-950 flex justify-end sticky bottom-0 z-30">
            <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2">
              {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Guardar Cambios del Gimnasio'}
            </button>
          </div>
        </form>

        {/* CONTRASEÑA PERSONAL */}
        <div className="mt-8">
          <ChangeOwnPasswordForm />
        </div>
      </motion.div>
    </div>
  )
}

