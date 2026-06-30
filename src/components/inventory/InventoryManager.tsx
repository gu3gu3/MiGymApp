'use client'

import { useState, useRef } from 'react'
import { importProductsCSV, ProductImportDTO, updateProduct } from '@/app/actions/admin/inventory'
import { Download, Upload, AlertCircle, Package, Image as ImageIcon, Plus, DollarSign, Trophy, TrendingUp, Edit2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { CreateProductModal, ProductData } from './CreateProductModal'

export function InventoryManager({ initialProducts, posPlan, maxLimit, gymSlug = 'general', currency = 'NIO', exchangeRate = 1, salesMetrics = { today: 0, week: 0, month: 0 } }: { initialProducts: ProductData[], posPlan: string, maxLimit: number, gymSlug?: string, currency?: string, exchangeRate?: number, salesMetrics?: { today: number, week: number, month: number } }) {
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [productToEdit, setProductToEdit] = useState<ProductData | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Toggle para ver en USD si la moneda local es diferente
  const [showUsd, setShowUsd] = useState(false)
  const isLocalCurrency = currency !== 'USD'
  const symbol = isLocalCurrency ? (currency === 'NIO' ? 'C$' : currency) : '$'
  
  const getDisplayPrice = (val: number) => {
    if (!isLocalCurrency) return `$${val.toFixed(2)}`
    if (showUsd && exchangeRate > 0) return `$${(val / exchangeRate).toFixed(2)}`
    return `${symbol} ${val.toFixed(2)}`
  }

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Nombre,Precio,Stock,StockMinimo\nEjemplo Producto,19.99,10,2"
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "template_inventario.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const text = await file.text()
      const lines = text.split('\n').map(l => l.trim()).filter(l => l)
      
      // Validar cabeceras
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      if (!headers.includes('nombre') || !headers.includes('precio') || !headers.includes('stock')) {
        throw new Error('El archivo CSV no tiene el formato estricto del template (Nombre, Precio, Stock, StockMinimo).')
      }

      const products: ProductImportDTO[] = []
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(c => c.trim())
        if (row.length < 3) continue // Ignorar filas vacías o mal formadas
        
        products.push({
          name: row[0],
          price: parseFloat(row[1]) || 0,
          stock: parseInt(row[2]) || 0,
          minStock: parseInt(row[3] || '0') || 0
        })
      }

      if (products.length === 0) throw new Error('No se encontraron datos para importar.')

      const result = await importProductsCSV(products)
      if (result.success) {
        toast.success(`Se importaron ${result.count} productos exitosamente.`)
      } else {
        toast.error(result.error || 'Error al importar')
      }
    } catch (error: any) {
      toast.error(error.message || 'Error procesando el archivo CSV.')
    } finally {
      setLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <CreateProductModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setProductToEdit(null)
        }}
        gymSlug={gymSlug}
        productToEdit={productToEdit}
      />

      {/* Sales Performance Cards */}
      <h2 className="text-lg font-bold text-slate-300 px-1 mt-8">Rendimiento Real de Ventas</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-cyan-950 to-slate-900 border border-cyan-900/50 rounded-2xl p-6 shadow-[0_0_20px_rgba(6,182,212,0.1)] flex flex-col justify-center">
          <div className="flex items-center gap-3 text-cyan-400 mb-2">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Ventas de Hoy</h3>
          </div>
          <p className="text-4xl font-black text-white">
            {getDisplayPrice(salesMetrics.today)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-950 to-slate-900 border border-emerald-900/50 rounded-2xl p-6 shadow-[0_0_20px_rgba(16,185,129,0.1)] flex flex-col justify-center">
          <div className="flex items-center gap-3 text-emerald-400 mb-2">
            <DollarSign className="w-5 h-5" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Ventas de la Semana</h3>
          </div>
          <p className="text-4xl font-black text-white">
            {getDisplayPrice(salesMetrics.week)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-950 to-slate-900 border border-purple-900/50 rounded-2xl p-6 shadow-[0_0_20px_rgba(168,85,247,0.1)] flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5">
            <Trophy className="w-32 h-32" />
          </div>
          <div className="flex items-center gap-3 text-purple-400 mb-2 relative z-10">
            <Trophy className="w-5 h-5" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Ventas del Mes</h3>
          </div>
          <p className="text-4xl font-black text-white relative z-10">
            {getDisplayPrice(salesMetrics.month)}
          </p>
        </div>
      </div>

      {/* Stats Cards (Inventario) */}
      <h2 className="text-lg font-bold text-slate-300 px-1 mt-8">Proyección de Inventario</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Valor en Inventario</h3>
          </div>
          <p className="text-3xl font-black text-white">
            {getDisplayPrice(initialProducts.filter(p => p.isActive).reduce((acc, p) => acc + (p.price * p.stock), 0))}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <DollarSign className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Costo Estimado</h3>
          </div>
          <p className="text-3xl font-black text-white">
            {getDisplayPrice(initialProducts.filter(p => p.isActive).reduce((acc, p) => acc + ((p.costPrice || 0) * p.stock), 0))}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5">
            <Trophy className="w-32 h-32" />
          </div>
          <div className="flex items-center gap-3 text-slate-400 mb-2 relative z-10">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Ganancia Bruta (Proyectada)</h3>
          </div>
          <p className="text-3xl font-black text-purple-400 relative z-10">
            {getDisplayPrice(initialProducts.filter(p => p.isActive).reduce((acc, p) => acc + ((p.price - (p.costPrice || p.price)) * p.stock), 0))}
          </p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" /> Gestión de Inventario
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Sube tu inventario masivamente usando nuestro template CSV.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-slate-950 border border-slate-800 rounded text-xs font-semibold text-slate-300">
            <span>Productos en catálogo: <span className={initialProducts.length >= maxLimit ? 'text-red-400' : 'text-emerald-400'}>{initialProducts.length} / {maxLimit}</span></span>
            <span className="text-slate-600">|</span>
            <span className="text-purple-400 uppercase tracking-wider">{posPlan} PLAN</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setProductToEdit(null)
              setIsModalOpen(true)
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 text-sm"
          >
            <Plus className="w-5 h-5" /> Crear Producto
          </button>
          
          <div className="h-8 w-px bg-slate-700 hidden sm:block mx-1"></div>

          <div className="flex gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center justify-center w-10 h-10 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
              title="Descargar Template CSV"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
                id="csv-upload"
                disabled={loading}
              />
                <label
                htmlFor="csv-upload"
                title="Importar CSV"
                className={`inline-flex items-center justify-center w-10 h-10 ${loading ? 'bg-emerald-600/50 cursor-not-allowed' : 'bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 cursor-pointer'} rounded-xl transition-colors`}
              >
                <Upload className="w-4 h-4" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Contextual Help */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-amber-200/90 text-sm">
        <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
        <div>
          <strong className="text-amber-400 block mb-1">Importante sobre el CSV:</strong>
          Para los campos de <b>Precio</b> y <b>Stock</b>, usa únicamente números sin símbolos de moneda ni comas para miles (ejemplo: <code className="bg-amber-950/50 px-1 rounded">19.99</code> o <code className="bg-amber-950/50 px-1 rounded">1500</code>). Evita poner <code>$19.99</code> o <code>1,500</code> para prevenir errores de cálculo.
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <h3 className="font-bold text-white">Catálogo de Productos</h3>
          {isLocalCurrency && (
            <button 
              onClick={() => setShowUsd(!showUsd)}
              className="text-xs px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors border border-slate-700"
            >
              {showUsd ? `Mostrando en USD (Tasa: ${exchangeRate})` : 'Convertir a USD'}
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold">Producto</th>
                <th className="p-4 font-semibold">Costo / Venta</th>
                <th className="p-4 font-semibold">Ganancia</th>
                <th className="p-4 font-semibold">Stock Actual</th>
                <th className="p-4 font-semibold">Estado</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {initialProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>El inventario está vacío.</p>
                    <p className="text-xs mt-1">Descarga el template e importa tus productos.</p>
                  </td>
                </tr>
              ) : (
                initialProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {p.photoUrl ? (
                          <img src={p.photoUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-slate-700" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                            <ImageIcon className="w-4 h-4 text-slate-500" />
                          </div>
                        )}
                        <span className="font-medium text-white">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 text-sm">
                      <div className="flex flex-col">
                        <span className="text-slate-500 text-xs line-through">{p.costPrice ? getDisplayPrice(p.costPrice) : '0.00'}</span>
                        <span className="font-bold text-emerald-400 text-base">{getDisplayPrice(p.price)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {p.costPrice ? (
                        <span className="text-purple-400 font-bold bg-purple-500/10 px-2 py-1 rounded-md text-xs border border-purple-500/20">
                          +{getDisplayPrice(p.price - p.costPrice)}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-300 font-mono text-sm">
                      {p.stock}
                    </td>
                    <td className="p-4">
                      {!p.isActive ? (
                        <span className="px-2 py-1 text-[10px] uppercase font-bold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">Deshabilitado</span>
                      ) : p.stock <= p.minStock ? (
                        <span className="px-2 py-1 text-[10px] uppercase font-bold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Stock Bajo</span>
                      ) : (
                        <span className="px-2 py-1 text-[10px] uppercase font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">En Stock</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={async () => {
                            const loadingToast = toast.loading('Actualizando...')
                            const res = await updateProduct({ ...p, isActive: !p.isActive })
                            if (res.success) toast.success(p.isActive ? 'Producto deshabilitado' : 'Producto activado', { id: loadingToast })
                            else toast.error('Error', { id: loadingToast })
                          }}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
                          title={p.isActive ? "Deshabilitar" : "Activar"}
                        >
                          {p.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setProductToEdit(p)
                            setIsModalOpen(true)
                          }}
                          className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-colors border border-cyan-500/20"
                          title="Editar Producto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
