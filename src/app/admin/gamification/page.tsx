'use client'

import { useEffect, useState } from 'react'
import { Trophy, Medal, Star, Zap, Swords, Play, Calendar, Search, ArrowRight, Gift, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCompetitions, joinCompetition, getTopAthletes, findLocalGyms, challengeGym } from '@/app/actions/gamification/leaderboard'

export default function GymAdminInbox() {
  const [competitions, setCompetitions] = useState<any[]>([])
  const [athletes, setAthletes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Networking
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])

  const loadData = async () => {
    setIsLoading(true)
    const comps = await getCompetitions()
    setCompetitions(comps)
    const aths = await getTopAthletes()
    setAthletes(aths)
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm) {
        const res = await findLocalGyms(searchTerm)
        setSearchResults(res)
      } else {
        setSearchResults([])
      }
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  const handleJoin = async (id: string) => {
    const res = await joinCompetition(id)
    if (res.success) {
      toast.success('¡Tu gimnasio se ha unido a la competencia!')
      loadData()
    } else {
      toast.error(res.error || 'Error')
    }
  }

  const handleChallenge = async (gymId: string) => {
    const res = await challengeGym(gymId)
    if (res.success) {
      toast.success('Invitación enviada')
      setSearchTerm('')
      loadData()
    } else {
      toast.error(res.error || 'Error al invitar')
    }
  }

  // Find the first broadcasting competition that has a sponsor to show in the banner
  const sponsorComp = competitions.find(c => c.sponsor && c.sponsor.promoOffer)

  return (
    <div className="h-full overflow-y-auto p-8 max-w-7xl mx-auto w-full custom-scrollbar">
      
      {/* Sponsor Banner Rotativo */}
      {sponsorComp && sponsorComp.sponsor && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-emerald-900/50 rounded-2xl p-4 mb-8 flex items-center justify-between shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center overflow-hidden border border-slate-700 p-2">
              <img src={sponsorComp.sponsor.logoUrl} alt={sponsorComp.sponsor.name} className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                Sponsor Destacado: {sponsorComp.sponsor.name} <Star className="w-4 h-4 text-yellow-400" />
              </h3>
              <p className="text-emerald-400 text-sm font-semibold mt-1 flex items-center gap-1">
                <Tag className="w-4 h-4" /> Beneficio Exclusivo: {sponsorComp.sponsor.promoOffer}
              </p>
            </div>
          </div>
          <a href={sponsorComp.sponsor.websiteUrl || '#'} target="_blank" rel="noreferrer" className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors">
            Reclamar Código
          </a>
        </div>
      )}

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" /> Inbox de Retos y Copas
          </h1>
          <p className="text-slate-400 mt-2">Descubre oportunidades, inscribe a tus atletas y reta a tus vecinos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Broadcasting Hub (Concursos Disponibles) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Play className="text-purple-400" /> Broadcasting Hub</h2>
          
          {competitions.map((comp) => (
            <div key={comp.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-all hover:border-purple-500/30">
              <div className="bg-slate-950/50 p-4 border-b border-slate-800 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  {comp.sponsor && (
                    <div className="w-12 h-12 bg-white rounded-lg p-1 hidden sm:block">
                      <img src={comp.sponsor.logoUrl} className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 leading-tight">{comp.title}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(comp.startDate).toLocaleDateString()}</span>
                      {comp.sponsor && <span className="text-purple-400 font-semibold">• Sponsor: {comp.sponsor.name}</span>}
                    </p>
                  </div>
                </div>
                {comp.status === 'BROADCASTING' && (
                  <span className="px-3 py-1 bg-purple-900/30 text-purple-400 border border-purple-800 rounded-full text-xs font-bold uppercase animate-pulse shrink-0">Nueva Copa</span>
                )}
                {comp.status === 'ACTIVE' && (
                  <span className="px-3 py-1 bg-emerald-900/30 text-emerald-400 border border-emerald-800 rounded-full text-xs font-bold uppercase shrink-0">Activo</span>
                )}
              </div>
              
              <div className="p-6">
                <p className="text-sm text-slate-300 mb-4">{comp.description}</p>
                
                <div className="bg-slate-950 rounded-xl p-4 mb-6 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Premio Principal</p>
                    <p className="text-emerald-400 font-black text-lg flex items-center gap-2">
                      <Gift className="w-5 h-5" /> {comp.prize || 'Exposición Global'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-bold uppercase">Requisito</p>
                    <p className="text-white font-bold">{comp.minActiveUsers > 0 ? `+${comp.minActiveUsers} Atletas` : 'Libre'}</p>
                  </div>
                </div>
                
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Ranking en Vivo</h4>
                <div className="space-y-2">
                  {comp.gymsParticipating.length === 0 ? (
                     <p className="text-sm text-slate-600 italic">Sé el primero en aceptar el reto.</p>
                  ) : (
                    comp.gymsParticipating.map((g: any, i: number) => (
                      <div key={g.id} className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800/50">
                        <div className="flex items-center gap-3">
                          <span className={`font-black ${i === 0 ? 'text-yellow-400' : 'text-slate-500'}`}>#{i+1}</span>
                          <span className="font-bold text-slate-300 text-sm">{g.gym.name} {g.isConfirmed ? '' : '(Pendiente)'}</span>
                        </div>
                        <span className="font-black text-cyan-400 text-sm">{g.score} PTS</span>
                      </div>
                    ))
                  )}
                </div>
                
                {comp.status === 'BROADCASTING' && (
                   <button onClick={() => handleJoin(comp.id)} className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-black rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                     Aplicar a la Copa
                   </button>
                )}
                {comp.status === 'ACTIVE' && comp.gymsParticipating.some((g: any) => !g.isConfirmed) && (
                   <button onClick={() => handleJoin(comp.id)} className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-black rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                     Aceptar Reto Local
                   </button>
                )}
              </div>
            </div>
          ))}
          {competitions.length === 0 && !isLoading && (
            <div className="text-center p-12 bg-slate-900 border border-slate-800 rounded-2xl">
              <p className="text-slate-500">No hay competiciones disponibles en el radar.</p>
            </div>
          )}
        </div>

        {/* Columna Derecha: Networking & Local Rank */}
        <div className="space-y-8">
          
          {/* Networking Tab */}
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4"><Swords className="text-orange-400" /> Networking: Retar Local</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <p className="text-sm text-slate-400 mb-4">Encuentra gimnasios vecinos y mándales una solicitud de duelo 1v1.</p>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar Gimnasio..." 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500" 
                />
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map(gym => (
                    <div key={gym.id} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div>
                        <p className="text-sm font-bold text-white">{gym.name}</p>
                        <p className="text-[10px] text-slate-500">Local</p>
                      </div>
                      <button onClick={() => handleChallenge(gym.id)} className="p-2 bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white rounded-lg transition-colors">
                        <Swords className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ranking Local */}
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4"><Medal className="text-cyan-400" /> Tus Mejores Atletas</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
               <div className="space-y-4">
                 {athletes.length === 0 && !isLoading ? (
                   <p className="text-slate-500 text-center text-sm py-4">Tus atletas aún no tienen XP.</p>
                 ) : (
                   athletes.map((ath, i) => (
                     <div key={ath.id} className="flex items-center gap-3">
                       <div className="w-5 text-center font-bold text-slate-500 text-xs">#{i+1}</div>
                       <img src={ath.image || ''} className="w-8 h-8 rounded-full border border-slate-700 object-cover" />
                       <div className="flex-1 min-w-0">
                         <p className="font-bold text-sm text-white truncate">{ath.name}</p>
                         <p className="text-[10px] text-slate-400 flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-400" /> Nvl {ath.level}</p>
                       </div>
                       <div className="text-right shrink-0">
                         <span className="font-black text-cyan-400 text-xs">{ath.xp} XP</span>
                       </div>
                     </div>
                   ))
                 )}
               </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
