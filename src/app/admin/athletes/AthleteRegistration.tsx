'use client'

import { useState, useEffect, useRef } from 'react'
import { createAthleteAction, getAvailablePlans } from '@/app/actions/athletes/create-athlete'
import { UserPlus, Camera, CheckCircle, ArrowRight, ArrowLeft, HeartPulse, Shield, Scale, RefreshCw, Smartphone, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { QRCodeSVG } from 'qrcode.react'

type Plan = {
  id: string
  name: string
  price: number
  currency: string
}

export function AthleteRegistration() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [activationToken, setActivationToken] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    identityDocument: '',
    address: '',
    emergencyName: '',
    emergencyPhone: '',
    gender: '', // 'MALE', 'FEMALE', 'OTHER'
    weightUnit: 'kg', // 'kg' | 'lb'
    weightValue: '',
    heightValue: '', // in cm
    planId: ''
  })

  // Webcam Refs y State
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [photoData, setPhotoData] = useState<string | null>(null)

  // Cargar planes al montar
  useEffect(() => {
    getAvailablePlans().then(data => {
      // @ts-ignore
      setPlans(data.map(p => ({ id: p.id, name: p.name, price: Number(p.price), currency: p.currency })))
    })
  }, [])

  // Auto-calcular BMI
  const getBmi = () => {
    if (!formData.weightValue || !formData.heightValue) return null
    let w = parseFloat(formData.weightValue)
    if (formData.weightUnit === 'lb') {
      w = w * 0.453592 // lb to kg
    }
    const h = parseFloat(formData.heightValue) / 100 // cm to m
    if (h === 0) return null
    return w / (h * h)
  }

  const getBmiRecommendation = (bmi: number) => {
    // Ajuste ligero si conocemos el sexo para un enfoque más personalizado
    const isFemale = formData.gender === 'FEMALE'
    
    if (bmi < 18.5) return 'Sugerencia: Plan de Volumen Muscular / Hipertrofia (Aumento de Peso)'
    if (bmi < 25) return 'Sugerencia: Plan de Mantenimiento / Tonificación General'
    if (bmi < 30) return isFemale ? 'Sugerencia: Plan Híbrido (Cardio + Fuerza para Tonificación)' : 'Sugerencia: Plan Híbrido (Cardio Ligero + Fuerza para Quema de Grasa)'
    return 'Sugerencia: Enfoque Cardiovascular Inicial / Acondicionamiento (Pérdida de Peso)'
  }

  const handleNext = () => setStep(prev => prev + 1)
  const handlePrev = () => setStep(prev => prev - 1)

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

  const takePhoto = () => {
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
    }
  }

  const retakePhoto = () => {
    setPhotoData(null)
    startCamera()
  }

  // Asegurar que apagamos la cámara si salen del componente
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const data = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value)
      })

      // Adjuntar cálculos
      const bmi = getBmi()
      if (bmi) data.append('bmi', bmi.toFixed(2))
      
      let finalWeight = formData.weightValue
      if (formData.weightUnit === 'lb' && finalWeight) {
        finalWeight = (parseFloat(finalWeight) * 0.453592).toFixed(2)
      }
      if (finalWeight) data.append('weight', finalWeight)
      if (formData.heightValue) data.append('height', formData.heightValue)
      
      if (photoData) {
        data.append('image', photoData)
      }

      const result = await createAthleteAction(data)
      if (result.success) {
        toast.success('¡Atleta registrado con éxito!')
        setActivationToken(result.activationToken || null)
        setStep(4)
      } else {
        toast.error(result.error || 'Error desconocido')
      }
    } catch (e) {
      toast.error('Error al conectar con el servidor')
    } finally {
      setIsSubmitting(false)
    }
  }

  const bmi = getBmi()

  return (
    <div className="h-full overflow-y-auto p-8 max-w-5xl mx-auto w-full custom-scrollbar">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <UserPlus className="w-8 h-8 text-cyan-400" /> Registro Manual de Atleta
        </h1>
        <p className="text-slate-400 mt-2">Alta rápida para la Bóveda del Gimnasio y Generación de Pase.</p>
      </div>

      <div className="bg-cyan-900/20 border border-cyan-500/50 p-4 rounded-xl mb-8 flex items-start gap-4">
        <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center shrink-0">
          <Smartphone className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-white font-bold mb-1">¡Nuevo: Onboarding Automático!</h3>
          <p className="text-slate-400 text-sm mb-2">
            Ahora puedes pedirle al atleta que escanee el código QR del gimnasio para crear su propia cuenta desde su teléfono. Así evitas llenar estos datos a mano y ellos tienen acceso inmediato a su Wallet.
          </p>
          <a href="/admin/qr" className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors border border-slate-700">
            Ver QR del Gimnasio
          </a>
        </div>
      </div>

      {/* Stepper Visual */}
      <div className="flex items-center mb-8 gap-4">
        {[1, 2, 3].map(num => (
          <div key={num} className="flex items-center gap-4 flex-1">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-colors ${step >= num ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-slate-800 text-slate-500'}`}>
              {num}
            </div>
            {num < 3 && <div className={`flex-1 h-1 rounded-full ${step > num ? 'bg-cyan-500' : 'bg-slate-800'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        {/* PASO 1: Datos Personales */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
              <Shield className="text-cyan-400" /> 1. Identidad Global
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Nombre Completo *</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Correo Electrónico (Para Login PWA) *</label>
                <input 
                  type="email" required
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Documento de Identidad (DNI/Cédula)</label>
                <input 
                  type="text" 
                  value={formData.identityDocument} onChange={e => setFormData({...formData, identityDocument: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Teléfono / WhatsApp</label>
                <input 
                  type="tel" 
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-400 mb-2">Dirección Física</label>
                <input 
                  type="text" 
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-8 mb-4">Contacto de Emergencia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
               <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Nombre del Familiar / Amigo</label>
                <input 
                  type="text" 
                  value={formData.emergencyName} onChange={e => setFormData({...formData, emergencyName: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Teléfono de Emergencia</label>
                <input 
                  type="tel" 
                  value={formData.emergencyPhone} onChange={e => setFormData({...formData, emergencyPhone: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button onClick={handleNext} disabled={!formData.name || !formData.email} className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-2 transition-colors">
                Siguiente <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* PASO 2: Salud y BMI */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
              <HeartPulse className="text-orange-400" /> 2. Salud y Biometría
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">Sexo Biológico</label>
                  <select 
                    value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Selecciona (Opcional)</option>
                    <option value="MALE">Hombre</option>
                    <option value="FEMALE">Mujer</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-sm font-semibold text-slate-400">Peso Actual</label>
                    <div className="flex bg-slate-800 rounded-lg p-1">
                      <button onClick={() => setFormData({...formData, weightUnit: 'kg'})} className={`px-3 py-1 text-xs font-bold rounded-md ${formData.weightUnit === 'kg' ? 'bg-cyan-500 text-white' : 'text-slate-400'}`}>KG</button>
                      <button onClick={() => setFormData({...formData, weightUnit: 'lb'})} className={`px-3 py-1 text-xs font-bold rounded-md ${formData.weightUnit === 'lb' ? 'bg-cyan-500 text-white' : 'text-slate-400'}`}>LB</button>
                    </div>
                  </div>
                  <input 
                    type="number" step="0.1"
                    value={formData.weightValue} onChange={e => setFormData({...formData, weightValue: e.target.value})}
                    placeholder={`Ej. ${formData.weightUnit === 'kg' ? '75.5' : '165'}`}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 text-xl font-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">Altura (Centímetros)</label>
                  <input 
                    type="number" 
                    value={formData.heightValue} onChange={e => setFormData({...formData, heightValue: e.target.value})}
                    placeholder="Ej. 175"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 text-xl font-black"
                  />
                </div>
              </div>

              {/* BMI Widget */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
                <Scale className="absolute -right-4 -bottom-4 w-32 h-32 text-slate-800/50" />
                <h3 className="text-slate-400 font-bold mb-2">Cálculo BMI</h3>
                {bmi ? (
                  <>
                    <div className="text-5xl font-black text-cyan-400 mb-4">{bmi.toFixed(1)}</div>
                    <p className="text-sm text-slate-300 font-medium px-4 py-2 bg-slate-900 rounded-lg border border-slate-700 z-10">
                      {getBmiRecommendation(bmi)}
                    </p>
                  </>
                ) : (
                  <p className="text-slate-600 text-sm italic">Ingresa peso y altura para autocalcular el enfoque de la rutina.</p>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <button onClick={handlePrev} className="px-6 py-3 text-slate-400 hover:text-white font-bold rounded-xl flex items-center gap-2 transition-colors">
                <ArrowLeft className="w-5 h-5" /> Atrás
              </button>
              <button onClick={handleNext} className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl flex items-center gap-2 transition-colors">
                Siguiente <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: Foto y Plan Inicial */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
              <Camera className="text-emerald-400" /> 3. Activación de Acceso
            </h2>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Webcam / Photo Box */}
              <div className="w-full md:w-1/3 flex flex-col items-center">
                {!photoData ? (
                  <div 
                    onClick={!isCameraActive ? startCamera : takePhoto}
                    className="w-48 h-48 rounded-full border-4 border-dashed border-slate-700 bg-slate-950 flex flex-col items-center justify-center hover:border-cyan-500 hover:bg-cyan-950/20 transition-all cursor-pointer overflow-hidden relative group"
                  >
                    {!isCameraActive ? (
                      <>
                        <Camera className="w-10 h-10 text-slate-500 mb-2 group-hover:text-cyan-400 transition-colors" />
                        <span className="text-xs font-bold text-slate-400 group-hover:text-cyan-400">Activar Cámara</span>
                      </>
                    ) : (
                      <>
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-full" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-full border-4 border-cyan-500 bg-slate-950 overflow-hidden relative group">
                    <img src={photoData} alt="Atleta" className="w-full h-full object-cover" />
                    <div 
                      onClick={retakePhoto}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <RefreshCw className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}
                
                <canvas ref={canvasRef} className="hidden" />
                <p className="text-center text-xs text-slate-500 mt-4">La foto será visible al hacer check-in en el Gatekeeper.</p>
              </div>

              {/* Planes Disponibles */}
              <div className="w-full md:w-2/3 space-y-4">
                <label className="block text-sm font-semibold text-slate-400">Asignar Plan Inicial (Opcional)</label>
                
                <div className="grid gap-3">
                  {plans.map(plan => (
                    <label key={plan.id} className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.planId === plan.id ? 'border-cyan-500 bg-cyan-950/30' : 'border-slate-800 hover:border-slate-700 bg-slate-950'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="plan" checked={formData.planId === plan.id} onChange={() => setFormData({...formData, planId: plan.id})} className="hidden" />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.planId === plan.id ? 'border-cyan-500' : 'border-slate-600'}`}>
                          {formData.planId === plan.id && <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />}
                        </div>
                        <p className="font-bold text-white">{plan.name}</p>
                      </div>
                      <span className="font-black text-cyan-400">
                        {plan.currency === 'NIO' ? 'C$' : '$'}{plan.price.toFixed(2)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-8 border-t border-slate-800 mt-8">
              <button onClick={handlePrev} className="px-6 py-3 text-slate-400 hover:text-white font-bold rounded-xl flex items-center gap-2 transition-colors">
                <ArrowLeft className="w-5 h-5" /> Atrás
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:opacity-90 disabled:opacity-50 text-white font-black rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                {isSubmitting ? 'Registrando...' : 'Finalizar Registro'} <CheckCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* PASO 4: Éxito y Activación Wallet */}
        {step === 4 && (
          <div className="space-y-6 animate-in zoom-in-95 fade-in duration-500 flex flex-col items-center py-8">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            
            <h2 className="text-3xl font-black text-white text-center">¡Atleta Registrado!</h2>
            <p className="text-slate-400 text-center max-w-md">
              La cuenta de <strong>{formData.name}</strong> ha sido creada. Pídele que escanee este código para activar su Wallet de acceso.
            </p>

            <div className="bg-white p-6 rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.2)] mt-6">
              {activationToken && (
                <QRCodeSVG 
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/wallet/activate?token=${activationToken}`}
                  size={240}
                  level="H"
                  includeMargin={true}
                />
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <Smartphone className="w-4 h-4" /> Escanear con cámara iOS o Android
            </p>

            <div className="w-full max-w-sm mt-8 space-y-4">
              <button 
                onClick={() => {
                  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/wallet/activate?token=${activationToken}`
                  const text = encodeURIComponent(`¡Hola ${formData.name}! Bienvenido a MiGym. Ya tienes tu cuenta activa. Haz clic en este enlace seguro para crear tu contraseña y descargar tu Wallet de acceso: ${url}`)
                  window.open(`https://wa.me/?text=${text}`, '_blank')
                }}
                className="w-full py-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <MessageCircle className="w-5 h-5" /> Enviar link por WhatsApp
              </button>

              <button 
                onClick={() => {
                  setStep(1)
                  setPhotoData(null)
                  setFormData({
                    name: '', email: '', phone: '', identityDocument: '', address: '',
                    emergencyName: '', emergencyPhone: '', gender: '', weightUnit: 'kg', weightValue: '', heightValue: '', planId: ''
                  })
                }}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                Registrar otro atleta
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
