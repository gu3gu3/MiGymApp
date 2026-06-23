'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from 'ai/react'
import { MessageCircle, X, Send, Sparkles, User, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false)
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-400 hover:via-indigo-400 hover:to-purple-400 text-white rounded-full shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-transform hover:scale-110 z-40 ${isOpen ? 'hidden' : 'block'}`}
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 h-[550px] bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-[#0A0A0A] flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Gemini Asistente</h3>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">MiGym B2B</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-center text-slate-500 mt-14">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-tr from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-sm text-slate-300 font-medium">¡Hola! Soy Gemini.</p>
                  <p className="text-xs mt-2 max-w-[200px] mx-auto">Tu asistente avanzado para la red B2B de MiGym.</p>
                </div>
              )}
              
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center mt-0.5 ${m.role === 'user' ? 'bg-[#1E1E1E] text-slate-300' : 'bg-gradient-to-tr from-blue-500 to-purple-500 text-white shadow-lg'}`}>
                      {m.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    </div>
                    <div className={`p-4 text-sm leading-relaxed ${m.role === 'user' ? 'bg-[#1E1E1E] text-slate-200 rounded-3xl rounded-tr-sm' : 'text-slate-200'}`}>
                      {m.role === 'user' ? (
                        m.content
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            strong: ({node, ...props}) => <span className="font-bold text-white" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-4 my-2 space-y-1" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-4 my-2 space-y-1" {...props} />,
                            li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                            a: ({node, ...props}) => <a className="text-blue-400 hover:underline" {...props} />
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full flex shrink-0 items-center justify-center mt-0.5 bg-gradient-to-tr from-blue-500 to-purple-500 text-white shadow-lg">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="p-4 text-sm text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse font-medium">
                      Generando respuesta...
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 bg-[#0A0A0A] border-t border-white/5 relative">
              <div className="relative group">
                <input
                  value={input || ''}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder="Pregunta a Gemini..."
                  className="w-full bg-[#1E1E1E] text-slate-200 text-sm rounded-full pl-5 pr-12 py-3.5 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all disabled:opacity-50"
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !input?.trim()}
                  className="absolute right-2 top-2 p-2 bg-slate-100 hover:bg-white text-black rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
