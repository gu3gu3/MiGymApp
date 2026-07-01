'use client'

import { QRCodeSVG } from 'qrcode.react'
import { QrCode, Download, Printer } from "lucide-react"
import { useRef, useState, useEffect } from 'react'

interface GymQRClientProps {
  gymName: string
  gymUrl: string
  gymLogoUrl: string | null
}

export default function GymQRClient({ gymName, gymUrl, gymLogoUrl }: GymQRClientProps) {
  const qrRef = useRef<HTMLDivElement>(null)
  const [logoBase64, setLogoBase64] = useState<string | null>(null)

  // Fetch the logo and convert it to Base64 so that the canvas can export it without cross-origin errors
  useEffect(() => {
    if (!gymLogoUrl) return
    fetch(gymLogoUrl)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setLogoBase64(reader.result as string)
        }
        reader.readAsDataURL(blob)
      })
      .catch(err => console.error('Error loading logo for QR:', err))
  }, [gymLogoUrl])

  const handleDownload = () => {
    if (!qrRef.current) return
    const svg = qrRef.current.querySelector('svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      // Create high-res canvas
      canvas.width = img.width * 2
      canvas.height = img.height * 2
      if (ctx) {
        ctx.scale(2, 2)
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        const pngFile = canvas.toDataURL('image/png')
        const downloadLink = document.createElement('a')
        downloadLink.download = `QR_${gymName.replace(/\s+/g, '_')}.png`
        downloadLink.href = pngFile
        downloadLink.click()
      }
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; }
          body { 
            background: white !important; 
          }
          .no-print {
            display: none !important;
          }
          /* Hide the Next.js sidebar/navigation if they don't have .no-print */
          nav, aside, header {
            display: none !important;
          }
          #print-section {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            margin: 0 !important;
            padding: 2cm !important;
            box-sizing: border-box !important;
            background: white !important;
            z-index: 999999 !important;
          }
        }
      `}} />
      <div className="p-8 max-w-4xl mx-auto no-print">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <QrCode className="w-8 h-8 text-purple-400" />
            Código QR del Gimnasio
          </h1>
          <p className="text-slate-400 mt-2">
            Imprime este código QR en tamaño carta y colócalo en tu recepción.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Decoración */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* QR Container */}
          <div 
            id="print-section"
            className="z-10 bg-white p-12 rounded-3xl shadow-2xl mb-8 flex flex-col items-center gap-6 print:w-full print:max-w-[18cm] print:shadow-none"
          >
            <h2 className="text-4xl font-black text-slate-900 hidden print:block mb-4 text-center">
              {gymName}
            </h2>
            <p className="text-2xl font-semibold text-slate-600 hidden print:block mb-8 text-center">
              Escanea para ver nuestros planes y registrarte
            </p>
            
            <div ref={qrRef} className="bg-white p-4 rounded-xl border border-slate-100">
              <QRCodeSVG 
                value={gymUrl}
                size={350}
                level={"H"}
                includeMargin={true}
                imageSettings={(logoBase64 || gymLogoUrl) ? {
                  src: logoBase64 || gymLogoUrl!,
                  height: 80,
                  width: 80,
                  excavate: true,
                } : undefined}
              />
            </div>
            
            <p className="text-xl font-mono text-slate-500 mt-4 hidden print:block text-center border-t border-slate-200 pt-8 w-full">
              {gymUrl}
            </p>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2 no-print">{gymName}</h2>
          <p className="text-slate-400 mb-8 font-mono bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 no-print">
            {gymUrl}
          </p>

          <div className="flex gap-4 z-10 no-print">
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors"
            >
              <Download className="w-5 h-5" />
              Descargar QR
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
            >
              <Printer className="w-5 h-5" />
              Imprimir
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
