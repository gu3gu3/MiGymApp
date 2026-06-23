import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export const maxDuration = 30

const SYSTEM_PROMPT = `
Eres el Asistente de Soporte de "MiGym", una plataforma B2B (SaaS) revolucionaria para gimnasios.
Tu objetivo es ayudar a los dueños y administradores de gimnasios a utilizar la plataforma respondiendo sus preguntas de manera rápida, clara y amistosa.

### Contexto de la Plataforma:
- **Gamificación**: La plataforma permite convertir el entrenamiento en un juego. Los atletas ganan XP y suben de nivel entrenando.
- **Competencias (Broadcasting)**: El Super Admin (Originador) crea torneos y copas patrocinadas. Los gimnasios pueden inscribirse y competir entre sí basados en los puntos que generen sus atletas.
- **Asistencia (Gatekeeper)**: Tenemos un sistema de Gatekeeper con escaneo QR para controlar accesos y Check-Ins. Si el sistema está offline, utiliza "Failover Mode" para guardar el check-in localmente y sincronizarlo después.
- **Planes Freemium**: Los gimnasios pueden tener el plan "Gratuito / Pilot" que cubre hasta 25 atletas. Luego existen Starter (hasta 150), Growth (hasta 500) y Pro (hasta 1000).
- **Atletas**: En la sección de atletas pueden registrar a sus usuarios.
- **Planes y Membresías**: Se pueden configurar planes basados en tiempo (ej. mensualidad) o basados en créditos (pases).
- **POS**: Punto de venta integrado para vender suplementos y bebidas.

### Reglas para ti:
1. Responde de forma concisa (no más de 2-3 párrafos cortos).
2. Usa viñetas para enumerar pasos.
3. Si el usuario hace más de 3 preguntas en una sesión, invítalo amablemente a explorar la plataforma, ya que ha sido diseñada para ser altamente intuitiva, y coméntale que como asistente estás para consultas precisas.

Ten en cuenta: Si la cantidad de mensajes del usuario en esta conversación es igual o mayor a 3, da una respuesta de cierre invitando a curiosear la plataforma.
`

export async function POST(req: Request) {
  const session = await auth()
  
  // Opcional: Asegurarnos que solo usuarios logueados (como GYM_ADMIN) puedan usar el chat.
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { messages } = await req.json()

  // Calculate how many messages are from the user
  const userMessages = messages.filter((m: any) => m.role === 'user').length

  // Si el usuario ha enviado 3 o más preguntas y la actual es la 3ra o más
  // Vamos a inyectar un mensaje de sistema dinámico para forzar el throttle
  let currentSystemPrompt = SYSTEM_PROMPT
  if (userMessages >= 3) {
    currentSystemPrompt += "\n\nIMPORTANTE PARA ESTA RESPUESTA: El usuario ha alcanzado el límite de preguntas. Debes responder a su última pregunta muy brevemente y concluir diciendo que te alegra haberle ayudado, pero que la plataforma es altamente intuitiva y lo invitas a seguir explorando y curioseando por su cuenta, cerrando así la sesión de asistencia."
  }

  const result = await streamText({
    model: google('gemini-2.5-flash'),
    system: currentSystemPrompt,
    messages,
  })

  return result.toDataStreamResponse()
}
