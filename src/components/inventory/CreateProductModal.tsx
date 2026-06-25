'use client'

import { useState, useRef } from 'react'
import { X, Upload, Check, ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { createProduct } from '@/app/actions/admin/inventory'

type CreateProductModalProps = {
  isOpen: boolean
  onClose: () => void
  gymSlug: string
}

const PRESET_GRAPHICS = [
  { id: 'water', emoji: '💧', label: 'Agua' },
  { id: 'towel', emoji: '🧴', label: 'Toalla' },
  { id: 'bar', emoji: '🍫', label: 'Barra Energética' },
  { id: 'shake', emoji: '🥤', label: 'Batido' },
  { id: 'energy', emoji: '⚡', label: 'Pre-entreno' },
]

export function CreateProductModal({ isOpen, onClose, gymSlug }: CreateProductModalProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [stock, setStock] = useState('')
  const [minStock, setMinStock] = useState('')
  
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 400
          const MAX_HEIGHT = 400
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          canvas.toBlob((blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Canvas to Blob failed'))
          }, 'image/jpeg', 0.8)
        }
      }
      reader.onerror = error => reject(error)
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setSelectedEmoji(null) // Clear emoji if file is selected
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji)
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price || !stock) return toast.error('Llenar campos requeridos (Nombre, Precio, Stock)')

    setLoading(true)
    try {
      let finalPhotoUrl = null

      // Create an emoji-based SVG data URL if emoji is selected
      if (selectedEmoji) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${selectedEmoji}</text></svg>`
        finalPhotoUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
      } 
      // Upload file if selected
      else if (selectedFile) {
        const compressedBlob = await compressImage(selectedFile)
        const formData = new FormData()
        formData.append('file', compressedBlob, selectedFile.name)
        formData.append('gymSlug', gymSlug)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        finalPhotoUrl = data.url
      }

      const result = await createProduct({
        name,
        price: parseFloat(price),
        costPrice: costPrice ? parseFloat(costPrice) : null,
        stock: parseInt(stock),
        minStock: parseInt(minStock) || 0,
        photoUrl: finalPhotoUrl
      })

      if (result.success) {
        toast.success('Producto creado')
        onClose()
      } else {
        toast.error(result.error || 'Error al crear producto')
      }
    } catch (error: any) {
      toast.error(error.message || 'Error en el proceso')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <h2 className="text-xl font-bold text-white">Nuevo Producto</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="create-product-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-300">Imagen del Producto (Opcional)</label>
              
              <div className="flex gap-4 items-start">
                {/* Image Upload Area */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-32 h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${previewUrl ? 'border-cyan-500 bg-slate-800' : 'border-slate-700 bg-slate-950 hover:border-slate-500 hover:bg-slate-800'}`}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                  ) : selectedEmoji ? (
                    <span className="text-6xl">{selectedEmoji}</span>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-500 mb-2" />
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center px-2">Subir Foto</span>
                    </>
                  )}
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                </div>

                {/* Preset Graphics */}
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-2 font-medium">O elige un gráfico rápido:</p>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_GRAPHICS.map(g => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleEmojiSelect(g.emoji)}
                        className={`w-12 h-12 flex items-center justify-center text-2xl rounded-xl border transition-all ${selectedEmoji === g.emoji ? 'bg-slate-800 border-cyan-500 scale-110' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}
                        title={g.label}
                      >
                        {g.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre del Producto *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors" placeholder="Ej. Agua Mineral 500ml" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Precio de Venta ($) *</label>
                  <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500 transition-colors" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Precio Compra ($) (Opcional)</label>
                  <input type="number" step="0.01" value={costPrice} onChange={e => setCostPrice(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 font-mono focus:outline-none focus:border-cyan-500 transition-colors" placeholder="0.00" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Stock Inicial *</label>
                  <input type="number" value={stock} onChange={e => setStock(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Stock Mínimo (Alerta)</label>
                  <input type="number" value={minStock} onChange={e => setMinStock(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors" placeholder="5" />
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white transition-colors">Cancelar</button>
          <button type="submit" form="create-product-form" disabled={loading} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-50">
            {loading ? 'Creando...' : <><Check className="w-5 h-5" /> Guardar Producto</>}
          </button>
        </div>
      </div>
    </div>
  )
}
