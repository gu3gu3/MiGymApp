'use client'

import { useState } from 'react'
import { AthleteRegistration } from './AthleteRegistration'
import { AthleteDirectory } from './AthleteDirectory'
import { Users, UserPlus } from 'lucide-react'

export default function AthletesPage() {
  const [activeTab, setActiveTab] = useState<'register' | 'directory'>('register')

  return (
    <div className="h-full flex flex-col w-full bg-[#050505]">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 bg-slate-950 px-8 pt-4">
        <button
          onClick={() => setActiveTab('register')}
          className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
            activeTab === 'register' 
              ? 'border-cyan-500 text-cyan-400' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <UserPlus className="w-5 h-5" /> Nuevo Registro
        </button>
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
            activeTab === 'directory' 
              ? 'border-cyan-500 text-cyan-400' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Users className="w-5 h-5" /> Directorio
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'register' ? <AthleteRegistration /> : <AthleteDirectory />}
      </div>
    </div>
  )
}
