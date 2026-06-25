'use client'

import { useState, useTransition, useEffect, useMemo } from 'react'
import { Search, ShoppingCart as CartIcon, QrCode, CreditCard, Banknote, ScanLine, Wallet, PackageOpen, History, MonitorSmartphone, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { processSale, getSalesHistory } from '@/app/admin/pos/actions'

type ProductData = {
  id: string
  name: string
  price: number
  stock: number
  minStock: number
  photoUrl: string | null
}

type CartItem = {
  id: string
  name: string
  price: number
  qty: number
}

export function PosManager({ initialProducts, posPlan, role }: { initialProducts: ProductData[], posPlan: string, role?: string }) {
  const [activeTab, setActiveTab] = useState<'POS' | 'HISTORY'>('POS')
  const [cart, setCart] = useState<CartItem[]>([])
  const [customer, setCustomer] = useState('')
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()

  // History State
  const [sales, setSales] = useState<any[]>([])
  const [metrics, setMetrics] = useState<any>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  const monthOptions = useMemo(() => {
    const opts = []
    const d = new Date()
    for (let i = 0; i < 12; i++) {
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
      opts.push({ value: val, label: label.charAt(0).toUpperCase() + label.slice(1) })
      d.setMonth(d.getMonth() - 1)
    }
    return opts
  }, [])

  useEffect(() => {
    if (activeTab === 'HISTORY') {
      const [year, month] = selectedMonth.split('-').map(Number)
      setIsLoadingHistory(true)
      getSalesHistory(year, month).then(res => {
        if (res.success && res.sales) {
          setSales(res.sales)
          setMetrics(res.metrics)
        }
        else toast.error('Error cargando historial de ventas')
      }).finally(() => setIsLoadingHistory(false))
    }
  }, [activeTab, selectedMonth])

  const addToCart = (product: ProductData) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }]
    })
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0)

  const handleCheckout = async (method: string) => {
    if (cart.length === 0) return toast.error('El carrito está vacío')
    
    startTransition(async () => {
      const result = await processSale(cart, method, customer)
      if (result.success) {
        toast.success(`Pago procesado con ${method}`)
        setCart([])
        setCustomer('')
      } else {
        toast.error(result.error || 'No se pudo procesar la venta')
      }
    })
  }

  if (activeTab === 'HISTORY') {
    return (
      <div className="h-full flex flex-col p-6 max-w-6xl mx-auto w-full">
        {/* TABS */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-4 mb-6">
          <button onClick={() => setActiveTab('POS')} className="px-4 py-2 text-slate-400 hover:text-white font-bold flex items-center gap-2 transition-colors">
            <MonitorSmartphone className="w-5 h-5" /> Terminal POS
          </button>
          <button onClick={() => setActiveTab('HISTORY')} className="px-4 py-2 text-cyan-400 border-b-2 border-cyan-400 font-bold flex items-center gap-2">
            <History className="w-5 h-5" /> Historial de Ventas
          </button>
        </div>

        {/* HEADER HISTORY */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-white">Registro de Ventas</h1>
            <p className="text-sm text-slate-400 mt-1">Audita las ventas de tu gimnasio históricamente</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 p-2 rounded-xl shadow-lg">
            <CalendarDays className="w-5 h-5 text-cyan-400 ml-2" />
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white font-bold px-2 py-1 outline-none cursor-pointer text-sm"
            >
              {monthOptions.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* MINI DASHBOARD */}
        {metrics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-center">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ingreso del Mes</h3>
              <p className="text-3xl font-black text-emerald-400">${metrics.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-center">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Transacciones</h3>
              <p className="text-3xl font-black text-cyan-400">{metrics.totalTransactions}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-center">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ticket Promedio</h3>
              <p className="text-3xl font-black text-purple-400">${metrics.averageTicket.toFixed(2)}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-center">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Top 5 Estrellas</h3>
              <div className="text-sm font-medium text-slate-300 space-y-1">
                {metrics.topProducts.length > 0 ? metrics.topProducts.map((p: any, i: number) => (
                  <div key={i} className="flex justify-between items-center bg-slate-950 px-2 py-1 rounded border border-slate-800/50">
                    <span className="truncate max-w-[120px] text-xs" title={p.name}>{p.name}</span>
                    <span className="text-orange-400 font-bold text-xs">{p.quantity}u</span>
                  </div>
                )) : <span className="text-slate-600 italic text-xs">Sin ventas</span>}
              </div>
            </div>
          </div>
        )}

        {/* TABLE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Artículos</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {isLoadingHistory ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-500">Cargando ventas...</td></tr>
                ) : sales.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-500">No hay ventas registradas en este mes.</td></tr>
                ) : (
                  sales.map(sale => (
                    <tr key={sale.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 text-sm font-bold text-slate-300">
                        {new Date(sale.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 text-sm text-slate-400">
                        {sale.user ? sale.user.name : 'Venta General'}
                      </td>
                      <td className="p-4 text-sm text-slate-400">
                        {sale.items.map((i: any) => `${i.quantity}x ${i.product.name}`).join(', ')}
                      </td>
                      <td className="p-4 font-black text-emerald-400">
                        ${Number(sale.total).toFixed(2)}
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

  return (
    <div className="h-full flex flex-col p-6 max-w-7xl mx-auto w-full">
      {/* TABS */}
      <div className="flex items-center gap-4 border-b border-slate-800 pb-4 mb-6">
        <button onClick={() => setActiveTab('POS')} className="px-4 py-2 text-cyan-400 border-b-2 border-cyan-400 font-bold flex items-center gap-2">
          <MonitorSmartphone className="w-5 h-5" /> Terminal POS
        </button>
        <button onClick={() => setActiveTab('HISTORY')} className="px-4 py-2 text-slate-400 hover:text-white font-bold flex items-center gap-2 transition-colors">
          <History className="w-5 h-5" /> Historial de Ventas
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* Columna Izquierda: Grilla de Productos */}
        <div className="w-full lg:w-3/5 flex flex-col gap-4">
          <div className="flex justify-between items-end">
          <h1 className="text-2xl font-black text-white">Inventario Rápido</h1>
          <div className="flex items-center gap-4">
            {role !== 'RECEPTIONIST' && (
              <Link 
                href="/admin/inventory"
                className="hidden md:flex items-center gap-2 px-3 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors text-sm font-bold"
              >
                <PackageOpen className="w-4 h-4" /> Administrar Inventario
              </Link>
            )}
            {posPlan !== 'KIOSKO' && (
              <div className="relative w-48 lg:w-64">
                <Search className="absolute left-3 top-2.5 text-slate-500 w-5 h-5" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar producto..." 
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar pr-2 pb-10">
          {initialProducts
            .filter(item => posPlan === 'KIOSKO' || item.name.toLowerCase().includes(search.toLowerCase()))
            .map(item => {
            const isLowStock = posPlan !== 'KIOSKO' && item.stock <= item.minStock
            return (
              <button 
                key={item.id}
                onClick={() => addToCart(item)}
                className={`relative bg-slate-900 border-2 rounded-2xl p-6 text-center hover:bg-slate-800 transition-all active:scale-95 flex flex-col items-center justify-center min-h-[140px]
                  ${isLowStock ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-slate-800 hover:border-slate-700'}`}
              >
                {isLowStock && (
                  <span className="absolute top-2 right-2 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
                
                {item.photoUrl ? (
                  <img src={item.photoUrl} alt={item.name} className="w-12 h-12 object-cover rounded-full mb-3 border-2 border-slate-700" />
                ) : (
                  <span className="text-4xl mb-3">📦</span>
                )}
                <p className="font-bold text-white text-sm leading-tight">{item.name}</p>
                <div className="flex items-center justify-center gap-2 mt-2 w-full">
                  <p className="text-orange-400 font-black">${item.price.toFixed(2)}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isLowStock ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                    Stock: {item.stock}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Columna Derecha: Carrito y Checkout */}
      <div className="w-full lg:w-2/5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col h-full overflow-hidden">
        
        {/* Buscador de Cliente */}
        {posPlan !== 'KIOSKO' && (
          <div className="p-4 border-b border-slate-800 bg-slate-950/50">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Asociar Venta (Opcional)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                <input 
                  type="text" 
                  value={customer}
                  onChange={e => setCustomer(e.target.value)}
                  placeholder="Nombre o DNI del Atleta..." 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button className="bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 p-3 rounded-lg hover:bg-cyan-900/50 transition-colors">
                <QrCode className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Lista del Carrito */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
              <CartIcon className="w-16 h-16 mb-4" />
              <p className="text-lg font-bold">Carrito Vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex-1">
                  <p className="font-bold text-white">{item.name}</p>
                  <p className="text-sm text-slate-400">${item.price.toFixed(2)} x {item.qty}</p>
                </div>
                <div className="text-right flex items-center gap-4">
                  <p className="font-black text-orange-400">${(item.price * item.qty).toFixed(2)}</p>
                  <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-red-400 px-2 text-xl font-bold">&times;</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total y Botones de Pago */}
        <div className="p-6 border-t border-slate-800 bg-slate-950">
          <div className="flex justify-between items-end mb-6">
            <span className="text-slate-400 font-bold uppercase tracking-wider">Total a Cobrar</span>
            <span className="text-4xl font-black text-white">${total.toFixed(2)}</span>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3">
              <button disabled={isPending} onClick={() => handleCheckout('Efectivo')} className="flex-1 disabled:opacity-50 bg-emerald-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors">
                <Banknote className="w-5 h-5" /> Efectivo
              </button>
              <button disabled={isPending} onClick={() => handleCheckout('Tarjeta')} className="flex-1 disabled:opacity-50 bg-blue-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors">
                <CreditCard className="w-5 h-5" /> Tarjeta
              </button>
            </div>
            
            {posPlan === 'SMART_BAR' && (
              <button disabled={isPending} onClick={() => handleCheckout('Voucher PWA')} className="w-full disabled:opacity-50 border-2 border-slate-800 text-slate-300 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 hover:border-slate-700 transition-colors">
                <ScanLine className="w-5 h-5" /> Canjear Voucher Pre-comprado (QR)
              </button>
            )}
            
            {posPlan !== 'KIOSKO' && (
              <button disabled={!customer || isPending} onClick={() => handleCheckout('Cuenta Corriente')} className="w-full bg-slate-800 text-slate-400 disabled:opacity-50 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors">
                <Wallet className="w-5 h-5" /> Cargar a la Cuenta del Atleta
              </button>
            )}
          </div>
        </div>

      </div>
      </div>
    </div>
  )
}
