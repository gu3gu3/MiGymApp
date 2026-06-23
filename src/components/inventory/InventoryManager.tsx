'use client'

import { useState, useRef } from 'react'
import { importProductsCSV, ProductImportDTO } from '@/app/actions/admin/inventory'
import { Download, Upload, AlertCircle, Package, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

type ProductData = {
  id: string
  name: string
  price: number
  stock: number
  minStock: number
  photoUrl: string | null
}

export function InventoryManager({ initialProducts }: { initialProducts: ProductData[] }) {
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Opcional: Toggle para ver en NIO si se asume USD
  const [showNio, setShowNio] = useState(false)
  const exchangeRate = 36.62 // Tasa de ejemplo

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
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" /> Gestión de Inventario
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Sube tu inventario masivamente usando nuestro template CSV.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors text-sm"
          >
            <Download className="w-4 h-4" /> Template CSV
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
              className={`inline-flex items-center gap-2 px-4 py-2 ${loading ? 'bg-emerald-600/50 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 cursor-pointer'} text-white rounded-lg font-medium transition-colors text-sm`}
            >
              <Upload className="w-4 h-4" /> {loading ? 'Importando...' : 'Importar CSV'}
            </label>
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
          <button 
            onClick={() => setShowNio(!showNio)}
            className="text-xs px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
          >
            {showNio ? 'Mostrando en NIO (Aprox)' : 'Mostrar conversión a NIO'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold">Producto</th>
                <th className="p-4 font-semibold">Precio</th>
                <th className="p-4 font-semibold">Stock Actual</th>
                <th className="p-4 font-semibold">Estado</th>
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
                    <td className="p-4 text-slate-300 font-mono text-sm">
                      {showNio ? (
                        <span>C$ {(p.price * exchangeRate).toFixed(2)}</span>
                      ) : (
                        <span>$ {p.price.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-300 font-mono text-sm">
                      {p.stock}
                    </td>
                    <td className="p-4">
                      {p.stock <= p.minStock ? (
                        <span className="px-2 py-1 text-[10px] uppercase font-bold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Stock Bajo</span>
                      ) : (
                        <span className="px-2 py-1 text-[10px] uppercase font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">En Stock</span>
                      )}
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
