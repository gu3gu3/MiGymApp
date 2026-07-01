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

  const handlePrint = () => {
    if (!qrRef.current) return
    const svg = qrRef.current.querySelector('svg')
    if (!svg) return
    
    // Convert current SVG to string. Note: it already has the base64 logo embedded!
    const svgData = new XMLSerializer().serializeToString(svg)
    
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = 'none'
    document.body.appendChild(iframe)

    const doc = iframe.contentWindow?.document
    if (!doc) return

    doc.open()
    doc.write(`
      <html>
        <head>
          <title>Imprimir QR - ${gymName}</title>
          <style>
            @page { margin: 0; size: letter portrait; }
            body { 
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              text-align: center;
              background: white;
            }
            h1 { font-size: 3.5rem; margin-bottom: 0.5rem; color: #0f172a; font-weight: 900; }
            p.subtitle { font-size: 1.5rem; color: #475569; margin-bottom: 3rem; font-weight: 600; }
            .qr-container { padding: 1.5rem; border: 2px solid #f1f5f9; border-radius: 1.5rem; background: white; }
            p.url { font-size: 1.25rem; font-family: monospace; color: #64748b; margin-top: 3rem; border-top: 2px solid #f1f5f9; padding-top: 2rem; width: 80%; max-width: 600px; }
          </style>
        </head>
        <body>
          <h1>${gymName}</h1>
          <p class="subtitle">Escanea para ver nuestros planes y registrarte</p>
          <div class="qr-container">
            ${svgData}
          </div>
          <p class="url">${gymUrl}</p>
        </body>
      </html>
    `)
    doc.close()

    // En navegadores modernos onload puede dispararse muy rápido o requerir un ligero retraso
    setTimeout(() => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
      setTimeout(() => {
        document.body.removeChild(iframe)
      }, 2000)
    }, 250)
  }

  return (
    <>
      <div className="p-8 max-w-4xl mx-auto">
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

          {/* QR Container Visual */}
          <div className="z-10 bg-white p-12 rounded-3xl shadow-2xl mb-8 flex flex-col items-center gap-6">
            <div ref={qrRef} className="bg-white p-4 rounded-xl border border-slate-100">
              <QRCodeSVG 
                value={gymUrl}
                size={300}
                level={"H"}
                includeMargin={true}
                imageSettings={(logoBase64 || gymLogoUrl) ? {
                  src: logoBase64 || gymLogoUrl!,
                  height: 70,
                  width: 70,
                  excavate: true,
                } : undefined}
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">{gymName}</h2>
          <p className="text-slate-400 mb-8 font-mono bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
            {gymUrl}
          </p>

          <div className="flex gap-4 z-10">
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors"
            >
              <Download className="w-5 h-5" />
              Descargar QR
            </button>
            <button 
              onClick={handlePrint}
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
