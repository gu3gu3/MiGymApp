'use client'

import { useState } from 'react'
import { Search, ShoppingCart as CartIcon, QrCode, CreditCard, Banknote, ScanLine, Wallet, PackageOpen } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

// Mock Data
const INVENTORY = [
  { id: 1, name: 'Agua Mineral', price: 1.5, stock: 45, minStock: 10, img: '💧' },
  { id: 2, name: 'Whey Protein (Scoop)', price: 2.5, stock: 4, minStock: 5, img: '💪' }, // Low stock!
  { id: 3, name: 'Barra Energética', price: 2.0, stock: 15, minStock: 5, img: '🍫' },
  { id: 4, name: 'Toalla Gym', price: 5.0, stock: 2, minStock: 10, img: '🥋' }, // Low stock!
  { id: 5, name: 'Pre-Workout', price: 3.0, stock: 20, minStock: 5, img: '⚡' },
  { id: 6, name: 'Candado Locker', price: 4.5, stock: 30, minStock: 10, img: '🔒' }
]

type CartItem = {
  id: number
  name: string
  price: number
  qty: number
}

export default function PosPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [customer, setCustomer] = useState('')

  const addToCart = (product: typeof INVENTORY[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }]
    })
  }

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0)

  const handleCheckout = (method: string) => {
    if (cart.length === 0) return toast.error('El carrito está vacío')
    toast.success(`Pago procesado con ${method}`)
    setCart([])
    setCustomer('')
  }

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 p-6">
      
      {/* Columna Izquierda: Grilla de Productos */}
      <div className="w-full lg:w-3/5 flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <h1 className="text-2xl font-black text-white">Inventario Rápido</h1>
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/inventory"
              className="hidden md:flex items-center gap-2 px-3 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors text-sm font-bold"
            >
              <PackageOpen className="w-4 h-4" /> Administrar Inventario
            </Link>
            <div className="relative w-48 lg:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-500 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Buscar producto..." 
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar pr-2 pb-10">
          {INVENTORY.map(item => {
            const isLowStock = item.stock <= item.minStock
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
                
                <span className="text-4xl mb-3">{item.img}</span>
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
              <button onClick={() => handleCheckout('Efectivo')} className="flex-1 bg-emerald-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors">
                <Banknote className="w-5 h-5" /> Efectivo
              </button>
              <button onClick={() => handleCheckout('Tarjeta')} className="flex-1 bg-blue-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors">
                <CreditCard className="w-5 h-5" /> Tarjeta
              </button>
            </div>
            
            <button onClick={() => handleCheckout('Voucher PWA')} className="w-full border-2 border-slate-800 text-slate-300 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 hover:border-slate-700 transition-colors">
              <ScanLine className="w-5 h-5" /> Canjear Voucher Pre-comprado (QR)
            </button>
            
            <button onClick={() => handleCheckout('Cuenta Corriente')} disabled={!customer} className="w-full bg-slate-800 text-slate-400 disabled:opacity-50 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors">
              <Wallet className="w-5 h-5" /> Cargar a la Cuenta del Atleta
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
