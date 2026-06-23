'use client'

import { useState } from 'react'
import { registerAthlete } from '@/app/actions/wallet/auth'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ArrowRight, ArrowLeft, HeartPulse, Scale, Activity } from 'lucide-react'
import Link from 'next/link'

export function WalletRegisterForm() {
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    gender: '',
    weightUnit: 'kg',
    weightValue: '',
    heightValue: ''
  })

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
    const isFemale = formData.gender === 'FEMALE'
    if (bmi < 18.5) return 'Sugerencia: Plan de Volumen / Hipertrofia'
    if (bmi < 25) return 'Sugerencia: Plan de Tonificación General'
    if (bmi < 30) return isFemale ? 'Sugerencia: Cardio + Fuerza para Tonificación' : 'Sugerencia: Cardio + Fuerza para Quema de Grasa'
    return 'Sugerencia: Acondicionamiento (Pérdida de Peso)'
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (step === 1) {
      setStep(2)
      return
    }

    setLoading(true)
    setError(null)
    
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

      const result = await registerAthlete(data)
      if (result?.error) {
        setError(result.error)
      } else if (result?.url) {
        router.push(result.url)
        router.refresh()
      }
    } catch (err) {
      setError('Error inesperado. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const bmi = getBmi()

  return (
    <div className="w-full max-w-md">
      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit} 
        className="space-y-6 w-full p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative"
      >
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-white">Crea tu Cuenta</h2>
          <p className="text-slate-400 mt-2">Paso {step} de 2</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nombre Completo</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Correo Electrónico</label>
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="tu@correo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
                <input 
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-4 mt-6 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Siguiente <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Sexo Biológico</label>
                  <select 
                    required
                    value={formData.gender} 
                    onChange={e => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                  >
                    <option value="">Selecciona...</option>
                    <option value="MALE">Hombre</option>
                    <option value="FEMALE">Mujer</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-sm font-medium text-slate-300">Peso</label>
                    <div className="flex bg-slate-800 rounded-md p-1">
                      <button type="button" onClick={() => setFormData({...formData, weightUnit: 'kg'})} className={`px-2 py-0.5 text-[10px] font-bold rounded ${formData.weightUnit === 'kg' ? 'bg-cyan-500 text-white' : 'text-slate-400'}`}>KG</button>
                      <button type="button" onClick={() => setFormData({...formData, weightUnit: 'lb'})} className={`px-2 py-0.5 text-[10px] font-bold rounded ${formData.weightUnit === 'lb' ? 'bg-cyan-500 text-white' : 'text-slate-400'}`}>LB</button>
                    </div>
                  </div>
                  <input 
                    type="number" step="0.1" required
                    value={formData.weightValue} onChange={e => setFormData({...formData, weightValue: e.target.value})}
                    placeholder={formData.weightUnit === 'kg' ? '75' : '165'}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Altura (cm)</label>
                  <input 
                    type="number" required
                    value={formData.heightValue} onChange={e => setFormData({...formData, heightValue: e.target.value})}
                    placeholder="175"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              {/* BMI Widget */}
              <div className="mt-6 bg-slate-950/80 rounded-2xl border border-slate-800 p-4 flex flex-col justify-center items-center text-center relative overflow-hidden">
                <Activity className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-800/30" />
                <h3 className="text-slate-400 font-bold text-sm mb-1">Tu BMI</h3>
                {bmi ? (
                  <>
                    <div className="text-3xl font-black text-cyan-400 mb-2">{bmi.toFixed(1)}</div>
                    <p className="text-xs text-slate-300 font-medium px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-700 z-10 w-full">
                      {getBmiRecommendation(bmi)}
                    </p>
                  </>
                ) : (
                  <p className="text-slate-600 text-xs italic py-4">Ingresa peso y altura para obtener un consejo.</p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finalizar Registro'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>

      <p className="text-center text-sm text-slate-400 mt-6">
        ¿Ya tienes cuenta? <Link href="/wallet/login" className="text-cyan-400 hover:underline font-medium">Inicia sesión</Link>
      </p>
    </div>
  )
}
