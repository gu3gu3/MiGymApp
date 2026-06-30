'use client'

import { useState, useEffect, useCallback } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { Wifi, WifiOff, CheckCircle2, XCircle, RefreshCw, User, Clock, QrCode, Zap } from 'lucide-react'
import localforage from 'localforage'
import toast from 'react-hot-toast'
import { createExpressGuestPass, getExpressPassProduct } from '@/app/actions/gatekeeper/guest-pass'

type ScanResult = {
  success: boolean
  message: string
  user?: {
    name: string
    photoUrl: string
    plan: string
  }
}

type CheckInLog = {
  id: string
  name: string
  photoUrl: string
  time: string
  status: 'allowed' | 'denied'
}

export default function GatekeeperPage() {
  const [isOnline, setIsOnline] = useState(true)
  const [offlineQueue, setOfflineQueue] = useState<string[]>([])
  const [lastScan, setLastScan] = useState<ScanResult | null>(null)
  const [recentLogs, setRecentLogs] = useState<CheckInLog[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [isExpressModalOpen, setIsExpressModalOpen] = useState(false)
  const [expressName, setExpressName] = useState('')
  const [isExpressProcessing, setIsExpressProcessing] = useState(false)
  const [expressPrice, setExpressPrice] = useState<number | null>(null)

  // Fetch Express Pass Price
  useEffect(() => {
    getExpressPassProduct().then(product => {
      if (product) {
        setExpressPrice(Number(product.price))
      }
    })
  }, [])

  // Hydrate offline status and queue
  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    localforage.getItem<string[]>('offlineCheckinQueue').then(queue => {
      if (queue) setOfflineQueue(queue)
    })

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Sync offline queue when coming back online
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      toast.success(`Sincronizando ${offlineQueue.length} check-ins...`)
      // Mock sync process
      setTimeout(() => {
        setOfflineQueue([])
        localforage.setItem('offlineCheckinQueue', [])
        toast.success('¡Sincronización completada!')
      }, 1500)
    }
  }, [isOnline, offlineQueue])

  const processScan = useCallback(async (qrData: string) => {
    if (isScanning) return
    setIsScanning(true)
    
    // Reproducir un pitido de escáner (mock)
    try {
      const audio = new Audio('/beep.mp3') // Placeholder
      audio.play().catch(() => {})
    } catch (e) {}

    // Llamar a Server Action
    const { processQRScan } = await import('@/app/actions/gatekeeper/process-scan')
    const result = await processQRScan(qrData)

    setLastScan(result)

    // Agregar al historial reciente
    const newLog: CheckInLog = {
      id: Math.random().toString(),
      name: result.user!.name,
      photoUrl: result.user!.photoUrl,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: result.success ? 'allowed' : 'denied'
    }
    setRecentLogs(prev => [newLog, ...prev].slice(0, 5))

    // Lógica Offline
    if (!isOnline && result.success) {
      const newQueue = [...offlineQueue, qrData]
      setOfflineQueue(newQueue)
      localforage.setItem('offlineCheckinQueue', newQueue)
    }

    // Reactivar escáner después de 2.5 segundos
    setTimeout(() => {
      setLastScan(null)
      setIsScanning(false)
    }, 2500)
  }, [isOnline, offlineQueue, isScanning])

  const handleExpressPass = async () => {
    setIsExpressProcessing(true)
    try {
      const res = await createExpressGuestPass({ name: expressName })
      if (res.success) {
        setLastScan({
          success: true,
          message: res.message,
          user: { name: res.user!.name, photoUrl: '', plan: res.user!.plan }
        })
        const newLog: CheckInLog = {
          id: Math.random().toString(),
          name: res.user!.name,
          photoUrl: '',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          status: 'allowed'
        }
        setRecentLogs(prev => [newLog, ...prev].slice(0, 5))
        setIsExpressModalOpen(false)
        setExpressName('')
        toast.success('Pase Express registrado exitosamente')
        
        setTimeout(() => {
          setLastScan(null)
        }, 3000)
      } else {
        toast.error(res.message)
      }
    } catch (e) {
      toast.error('Error al registrar pase express')
    } finally {
      setIsExpressProcessing(false)
    }
  }

  // Escucha Global para Pistola USB (Emula teclado, termina con Enter)
  useEffect(() => {
    let buffer = ''
    let timeout: NodeJS.Timeout

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && buffer.length > 5) {
        processScan(buffer)
        buffer = ''
        return
      }
      
      // Solo capturar caracteres legibles
      if (e.key.length === 1) {
        buffer += e.key
        clearTimeout(timeout)
        timeout = setTimeout(() => { buffer = '' }, 100) // Reset si teclea lento (no es escáner)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [processScan])

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 p-6">
      {/* Columna Izquierda: Escáner y Estado */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        
        {/* Widget Failover */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${isOnline ? 'bg-emerald-950/30 border-emerald-500/20' : 'bg-orange-950/30 border-orange-500/20'}`}>
          <div className="flex items-center gap-3">
            {isOnline ? <Wifi className="text-emerald-400" /> : <WifiOff className="text-orange-400" />}
            <div>
              <p className="font-bold text-white">{isOnline ? 'Conectado a la Nube' : 'Modo Offline Activo'}</p>
              {!isOnline && offlineQueue.length > 0 && (
                <p className="text-xs text-orange-400 font-medium">{offlineQueue.length} check-ins en cola local</p>
              )}
            </div>
          </div>
          {isOnline && offlineQueue.length > 0 && (
            <RefreshCw className="text-emerald-400 animate-spin w-5 h-5" />
          )}
        </div>

        {/* Botón Pase Express */}
        <button 
          onClick={() => setIsExpressModalOpen(true)}
          className="w-full bg-gradient-to-r from-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/60 p-4 rounded-xl flex items-center justify-between group transition-all shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/20 p-2 rounded-lg group-hover:bg-amber-500/30 transition-colors">
              <Zap className="text-amber-400 w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-amber-500 group-hover:text-amber-400">Pase Express (1 Día)</p>
              <p className="text-xs text-slate-400">Acceso rápido sin registrar</p>
            </div>
          </div>
          <div className="px-3 py-1 bg-slate-950 rounded-full text-xs font-bold text-slate-300 border border-slate-800">
            {expressPrice !== null ? `C$ ${expressPrice}` : 'C$ ...'}
          </div>
        </button>

        {/* Escáner Activo */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex-1 max-h-[400px] relative">
          <div className="absolute inset-x-0 top-0 bg-slate-900/80 backdrop-blur-sm z-10 p-3 text-center border-b border-slate-800">
            <p className="text-sm font-semibold text-slate-300">Escáner Activo (Cámara o Pistola USB)</p>
          </div>
          
          <div className="h-full w-full flex items-center justify-center bg-black pt-12">
            {!isScanning ? (
              <Scanner 
                onScan={(detectedCodes) => {
                  if (detectedCodes && detectedCodes.length > 0) {
                    processScan(detectedCodes[0].rawValue)
                  }
                }}
              />
            ) : (
              <div className="text-center text-slate-500 animate-pulse flex flex-col items-center">
                <RefreshCw className="w-10 h-10 animate-spin mb-2" />
                <p>Procesando...</p>
              </div>
            )}
          </div>
        </div>

        {/* Historial Reciente */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex-1 overflow-hidden flex flex-col">
          <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Últimos Accesos
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {recentLogs.length === 0 ? (
              <p className="text-slate-600 text-sm text-center mt-10">Esperando check-ins...</p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-slate-800 border border-slate-700">
                    {log.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={log.photoUrl} alt={log.name} className="w-full h-full object-cover" />
                    ) : <User className="w-6 h-6 m-2 text-slate-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-200 truncate">{log.name}</p>
                    <p className="text-xs text-slate-500">{log.time}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${log.status === 'allowed' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Columna Derecha: Pantalla de Feedback Gigante */}
      <div className="w-full lg:w-2/3 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-10 relative">
        {!lastScan ? (
          <div className="text-center opacity-30">
            <QrCode className="w-32 h-32 mx-auto mb-6 text-slate-500" />
            <h2 className="text-3xl font-black text-slate-400">Esperando Código</h2>
            <p className="text-slate-500 mt-2 text-lg">Muestra el código QR a la cámara o usa la pistola lectora</p>
          </div>
        ) : (
          <div className={`absolute inset-0 flex flex-col items-center justify-center p-10 transition-colors duration-300 ${lastScan.success ? 'bg-emerald-950/80' : 'bg-red-950/80'}`}>
            <div className={`w-40 h-40 rounded-full overflow-hidden border-8 mb-6 shadow-2xl ${lastScan.success ? 'border-emerald-500' : 'border-red-500'}`}>
               {lastScan.user?.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={lastScan.user.photoUrl} alt="User" className="w-full h-full object-cover" />
               ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <User className="w-20 h-20 text-slate-500" />
                </div>
               )}
            </div>
            
            <h1 className="text-5xl font-black text-white mb-2">{lastScan.user?.name}</h1>
            <p className="text-2xl font-medium text-slate-300 mb-8">{lastScan.user?.plan}</p>

            <div className={`flex items-center gap-4 px-8 py-4 rounded-full text-3xl font-black shadow-lg ${lastScan.success ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
              {lastScan.success ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
              {lastScan.message}
            </div>

            {!lastScan.success && (
              <button className="mt-8 px-8 py-4 bg-white text-red-600 font-black text-xl rounded-xl shadow-lg hover:bg-slate-200 transition-colors">
                Renovar Plan en Caja
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal Pase Express */}
      {isExpressModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Zap className="text-amber-400 w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Pase Express (1 Día)</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nombre del Invitado (Opcional)</label>
                <input 
                  type="text" 
                  value={expressName}
                  onChange={(e) => setExpressName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setIsExpressModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
                  disabled={isExpressProcessing}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleExpressPass}
                  disabled={isExpressProcessing}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isExpressProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Cobrar y Acceder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
